/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Db Node Details Page
 */
monitorInfraDbDetailsClass = (function() {
    this.populateDetailsTab = function (obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slDb = {startTime: startTime, endTime: endTime};
        var nodeIp,iplist;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'', node:obj['name']},{triggerHashChange:false});
        }    
        startWidgetLoading('db-sparklines' + '_' + obj.name);
        toggleWidgetsVisibility(['apiServer-chart' + '_' + obj.name + '-box'], ['serviceMonitor-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#dbnode-dashboard' + '_' + obj.name).html(dashboardTemplate({title:'Database Node',colCount:2, showSettings:true, widgetBoxId:'dashboard' + '_' + obj.name, name:obj.name}));
        startWidgetLoading('dashboard' + '_' + obj.name);
        $.ajax({
            url: contrail.format(monitorInfraUrls['DATABASE_DETAILS'] , obj['name'])
        }).done(function (result) {
                var noDataStr = "--";
                $.ajax({
                    url: '/api/admin/monitor/infrastructure/dbnode/flow-series/stats?&minsSince=30&source='+ obj['name']
                }).done(function (resultJSON) {
                    var slDb;
                    startTime = endTime - 600000;
                    slDb = {startTime: startTime, endTime: endTime};
                    var flowSeriesData = resultJSON['flow-series'];
                    var slineDataDiskUsage = parseDataForSparkline(flowSeriesData,'database_usage.disk_space_used_1k');
                    var slineDataAnalDbSize = parseDataForSparkline(flowSeriesData,'database_usage.analytics_db_size_1k');
                    try {
                        drawSparkLine('dbnode-sparklines' + '_' + obj.name, 'db_usage_sparkline', 'blue-sparkline', slineDataDiskUsage);
                    } catch (error) {
                        console.log(error.stack);
                    }
                    try {
                        drawSparkLine('dbnode-sparklines' + '_' + obj.name, 'analytics_db_size_sparkline', 'blue-sparkline', slineDataAnalDbSize);
                    } catch (error) {
                        console.log(error.stack);
                    }
                    endWidgetLoading('dbnode-sparklines' + '_' + obj.name);
                    $('#dbnode-chart' + '_' + obj.name).initDbUsageLineChart({data:resultJSON, 
                                                                                parser: "parseUsageData", 
                                                                                plotOnLoad: true, 
                                                                                lineChartId: 'dbnode-sparklines' + '_' + obj.name, 
                                                                                showWidgetIds: [], 
                                                                                hideWidgetIds: [], 
                                                                                titles: {diskUsageTitle:'Database Disk Usage',analyticsDbSizeTitle:'Analytics DB Size'}},110);
                                                                                                                               
                }).fail(function() {
                    //Fail condition
                });
                databaseNodeData = result;
                var parsedData = infraMonitorUtils.parseDbNodesDashboardData([{name:obj['name'],value:databaseNodeData}])[0];
                var cpu = "N/A",
                    memory = "N/A",
                    databaseNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                var procStateList, overallStatus = noDataStr;
                var dbProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                overallStatus = getOverallNodeStatusForDetails(parsedData);
                procStateList = getValueByJsonPath(databaseNodeData,"databaseNode;NodeStatus;process_info",[]);
                if(!(procStateList instanceof Array)){
                    procStateList = [procStateList];
                }
                dbProcessStatusList = getStatusesForAllDbProcesses(procStateList);
                databaseNodeDashboardInfo = [
                  {lbl:'Hostname', value:obj['name']},
                    {lbl:'Overall Node Status', value:overallStatus}
                    ];
                    //If node manager is not installed dont show the processes
                databaseNodeDashboardInfo = databaseNodeDashboardInfo.concat(
                        [{lbl:'Processes', value:" "},
                          {lbl:INDENT_RIGHT+'Kafka', value:(function(){
                              return dbProcessStatusList['kafka'];
                          })()},
                          {lbl:INDENT_RIGHT+'Database', value:(function(){
                              return dbProcessStatusList['contrail-database'];
                          })()}
                ]);
                databaseNodeDashboardInfo = databaseNodeDashboardInfo.concat(
                        [{lbl:'Database Usage', value:" "},
                          {lbl:INDENT_RIGHT+'Available Space', value:parsedData['availableSpace']},
                          {lbl:INDENT_RIGHT+'Used Space', value:parsedData['usedSpace'] + ' (' + parsedData['usedPercentage'].toFixed(2) + ' %)' },
                          {lbl:INDENT_RIGHT+'Analytics DB Size', value:parsedData['analyticsDbSize']}
//                          {lbl:INDENT_RIGHT+'Usage', value:parsedData['usedPercentage'].toFixed(2) + ' %'}
                ]);
                /*Selenium Testing*/
                databaseNodeDetailsData = databaseNodeDashboardInfo;
                /*End of Selenium Testing*/                          
                var cores=getCores(databaseNodeData);
                for(var i=0;i<cores.length;i++)
                  databaseNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#dbnode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#dbnode-dashboard' + '_' + obj.name + ' .widget-body').html(dashboardBodyTemplate({colCount:2, d:databaseNodeDashboardInfo, nodeData:databaseNodeData, showSettings:true, ip:nodeIp, name:obj.name}));
                var ipDeferredObj = $.Deferred();
                getReachableIp(iplist,"8084",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                   if(nodeIp != null && nodeIp != noDataStr) {
                     $('#linkIntrospect' + '_' + obj.name).unbind('click');
                       $('#linkIntrospect' + '_' + obj.name).click(function(){
                           window.open('/proxy?proxyURL=http://'+nodeIp+':8084&indexPage', '_blank');
                       });
                       $('#linkStatus' + '_' + obj.name).unbind('click');
                       $('#linkStatus' + '_' + obj.name).on('click', function(){
                           showStatus({ip : nodeIp, name : obj.name});
                       });
                       $('#linkLogs' + '_' + obj.name).unbind('click');
                       $('#linkLogs' + '_' + obj.name).on('click', function(){
                           showLogs(nodeIp);
                       });
                   }
                });
            
                endWidgetLoading('dashboard' + '_' + obj.name);
                initWidget4Id('#apiServer-chart' + '_' + obj.name + '-box');
                initWidget4Id('#serviceMonitor-chart' + '_' + obj.name + '-box');
                initWidget4Id('#schema-chart' + '_' + obj.name + '-box');
            }).fail(displayAjaxError.bind(null, $('#dbnode-dashboard' + '_' + obj.name)));
    }
    return {populateDetailsTab:populateDetailsTab};
})();

function getStatusesForAllDbProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
       for(var i=0; i < processStateList.length; i++){
          var currProc = processStateList[i];
          if(currProc.process_name == "kafka"){
             ret['kafka'] = getProcessUpTime(currProc);
          } else if(currProc.process_name == "contrail-database"){
             ret['contrail-database'] = getProcessUpTime(currProc);
          } 
       }
    }
    return ret;
 }

function parseDataForSparkline(flowSeriesData,field){
    var slData = [];
    $.each(flowSeriesData,function(i,d){
        slData.push(d[field]);
    });
    return slData;
}