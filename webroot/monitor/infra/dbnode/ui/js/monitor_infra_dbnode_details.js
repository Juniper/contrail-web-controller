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
                /*$.ajax({
                    url: '/api/service/networking/web-server-info'
                }).done(function (resultJSON) {
                    endTime = resultJSON['serverUTCTime'];
                }).fail(function() {
                    endTime = getCurrentTime4MemCPUCharts();
                }).always(function() {
                    var slDb;
                    startTime = endTime - 600000;
                    slDb = {startTime: startTime, endTime: endTime};
                    $('#apiServer-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.dbNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'api_server_cpu_share', color: 'blue-sparkline'},
                        {name: 'api_server_mem_virt', color: 'green-sparkline'}
                    ]}, slDb);
                    $('#serviceMonitor-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.dbNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'service_monitor_cpu_share', color: 'blue-sparkline'},
                        {name: 'service_monitor_mem_virt', color: 'green-sparkline'}
                    ]}, slDb);
                    $('#schema-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.dbNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'schema_xmer_cpu_share', color: 'blue-sparkline'},
                        {name: 'schema_xmer_mem_virt', color: 'green-sparkline'}
                    ]}, slDb);
                    endWidgetLoading('db-sparklines' + '_' + obj.name);
                    $('#apiServer-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-api', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", parser: "parseProcessMemCPUData", plotOnLoad: true, lineChartId: 'apiServer-sparklines' + '_' + obj.name, showWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['serviceMonitor-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#serviceMonitor-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-svc-monitor', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'serviceMonitor-sparklines' + '_' + obj.name, showWidgetIds: ['serviceMonitor-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#schema-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-schema', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'schema-sparklines' + '_' + obj.name, showWidgetIds: ['schema-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box', 'serviceMonitor-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                });*/
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
                          /*{lbl:INDENT_RIGHT+'Kafka', value:(function(){
                              return dbProcessStatusList['kafka'];
                          })()},*/
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