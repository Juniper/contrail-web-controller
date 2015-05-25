/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Analytics Nodes Details Page
 */
monitorInfraAnalyticsDetailsClass = (function() {
    this.populateDetailsTab = function (obj) {
        var nodeIp,iplist;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'',ip:obj['ip'], node: obj['name']},{triggerHashChange:false});
        //showProgressMask('#analyticsnode-dashboard', true);
        //Destroy chart if it exists
        startWidgetLoading('analytics-sparklines');
        toggleWidgetsVisibility(['collector-chart-box'], ['queryengine-chart-box', 'opServer-chart-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#analyticsnode-dashboard').html(dashboardTemplate({title:'Analytics Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');

        $.ajax({
            url: contrail.format(monitorInfraUrls['ANALYTICS_DETAILS'], obj['name'])
        }).done(function (result) {
                aNodeData = result;
                var parsedData = infraMonitorUtils.parseAnalyticNodesDashboardData([{name:obj['name'],value:result}])[0];
                var noDataStr = "--";
                var cpu = "N/A", memory = "N/A", aNodeDashboardInfo;
                var endTime, startTime;
                $.ajax({
                    url: '/api/service/networking/web-server-info'
                }).done(function (resultJSON) {
                    endTime = resultJSON['serverUTCTime'];
                }).fail(function() {
                    endTime = getCurrentTime4MemCPUCharts();
                }).always(function() {
                    var cpuMemStats = [], nodetype = "analyticsNodeDS";
                    //Build a query to fetch the cpu mem stats
                    var postData = getPostDataForCpuMemStatsQuery(nodetype,"details");
                    $.ajax({
                        url: monitorInfraUrls['QUERY'],
                        type:"POST",
                        data:postData
                    }).done(function (resultJSON) {
                        var cpuMemStats = infraMonitorUtils.parseCpuMemStats(resultJSON,nodetype);
                        var slConfig;
                        startTime = endTime - 600000;
                        slConfig = {startTime: startTime, endTime: endTime};
                        $('#collector-sparklines').initMemCPUSparkLines(cpuMemStats, 'parseMemCPUData4SparkLines', {'value': [
                            {name: 'contrail-collector-cpu-share', color: 'blue-sparkline'},
                            {name: 'contrail-collector-mem-res', color: 'green-sparkline'}
                        ]}, slConfig);
                        $('#queryengine-sparklines').initMemCPUSparkLines(cpuMemStats, 'parseMemCPUData4SparkLines', {'value': [
                            {name: 'contrail-query-engine-cpu-share', color: 'blue-sparkline'},
                            {name: 'contrail-query-engine-mem-res', color: 'green-sparkline'}
                        ]}, slConfig);
                        $('#opServer-sparklines').initMemCPUSparkLines(cpuMemStats, 'parseMemCPUData4SparkLines', {'value': [
                            {name: 'contrail-analytics-api-cpu-share', color: 'blue-sparkline'},
                            {name: 'contrail-analytics-api-mem-res', color: 'green-sparkline'}
                        ]}, slConfig);
                        endWidgetLoading('analytics-sparklines');
                        $('#collector-chart').initMemCPULineChart($.extend({url:function() {
                            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-collector', '30', '10', obj['name'], endTime);
                        }, parser: "parseProcessMemCPUData", plotOnLoad: true, lineChartId: 'collector-sparklines', showWidgetIds: ['collector-chart-box'], hideWidgetIds: ['queryengine-chart-box', 'opServer-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                        $('#queryengine-chart').initMemCPULineChart($.extend({url:function() {
                            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-query-engine', '30', '10', obj['name'], endTime);
                        }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'queryengine-sparklines', showWidgetIds: ['queryengine-chart-box'], hideWidgetIds: ['collector-chart-box', 'opServer-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                        $('#opServer-chart').initMemCPULineChart($.extend({url:function() {
                            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-analytics-api', '30', '10', obj['name'], endTime);
                        }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'opServer-sparklines', showWidgetIds: ['opServer-chart-box'], hideWidgetIds: ['collector-chart-box', 'queryengine-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    });
                });
                var procStateList, overallStatus = noDataStr;
                var analyticsProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                
                overallStatus = getOverallNodeStatusForDetails(parsedData);
                procStateList = getValueByJsonPath(aNodeData,"NodeStatus;process_info",[]);
                analyticsProcessStatusList = getStatusesForAllAnalyticsProcesses(procStateList);
                aNodeDashboardInfo = [
                    {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function(){
                        var ips = '';
                        iplist = getValueByJsonPath(aNodeData,"CollectorState;self_ip_list",[]);
                        if(iplist != null && iplist.length>0){
                            for (var i=0; i< iplist.length;i++){
                                if(i+1 == iplist.length) {
                                    ips = ips + iplist[i];
                                } else {
                                    ips = ips + iplist[i] + ', ';
                                }
                            }
                        } else {
                            ips = noDataStr;
                        }
                        return ips;
                    })()},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Overall Node Status', value:overallStatus}
                    ];
                
                    //If node manager is not installed dont show the processes
                aNodeDashboardInfo = aNodeDashboardInfo.concat( 
                    (IS_NODE_MANAGER_INSTALLED)? 
                        ([{lbl:'Processes', value:" "},
                        /*{lbl:INDENT_RIGHT+'Analytics Node Manager', value:(function(){
                            try{
                                return ifNull(analyticsProcessStatusList['contrail-analytics-nodemgr'],noDataStr);
                            }catch(e){return noDataStr;}
                        })()},*/
                        {lbl:INDENT_RIGHT+'Collector', value:(function(){
                            return ifNull(analyticsProcessStatusList['contrail-collector'],noDataStr);
                        })()},
                        {lbl:INDENT_RIGHT+'Query Engine', value:(function(){
                            return ifNull(analyticsProcessStatusList['contrail-query-engine'],noDataStr);
                        })()},
                        {lbl:INDENT_RIGHT+'OpServer', value:(function(){
                            return ifNull(analyticsProcessStatusList['contrail-analytics-api'],noDataStr);
                        })()}
                       /* {lbl:INDENT_RIGHT+'Redis Sentinel', value:(function(){
                            return ifNull(analyticsProcessStatusList['redis-sentinel'],noDataStr);
                        })()},*/
                    ]):[]);
                aNodeDashboardInfo = aNodeDashboardInfo.concat([{lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Messages', value:(function(){
                        var msgs = getAnalyticsMessagesCountAndSize(aNodeData,['contrail-collector']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
                    {lbl:'Generators', value:(function(){
                        var ret='';
                        var genno;
                        try{
                            if(aNodeData.CollectorState["generator_infos"]!=null){
                                genno = aNodeData.CollectorState["generator_infos"].length;
                            };
                            ret = ret + ifNull(genno,noDataStr);
                        }catch(e){ return noDataStr;}
                        return ret;
                    })()},
                    {lbl:'Last Log', value: (function(){
                        var lmsg;
                        lmsg = getLastLogTimestamp(aNodeData,"analytics");
                        if(lmsg != null){
                            try{
                                return new Date(parseInt(lmsg)/1000).toLocaleString();  
                            }catch(e){return noDataStr;}
                        } else return noDataStr;
                        })()}
                    //'vRouters ' + aNodeData['establishedPeerCount'] + ', ' +
                    //'Collectors ' + aNodeData['activevRouterCount'] + ', ' +
                    //'Analytics Nodes ' + aNodeData['activevRouterCount'] + ', ' +
                    //'Config Nodes ' + aNodeData['activevRouterCount']},
                ]);
                /*Selenium Testing*/
                aNodeDetailsData = aNodeDashboardInfo;
                /*End of Selenium Testing*/             
                var cores=getCores(aNodeData);
                for(var i=0;i<cores.length;i++)
                    aNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#analyticsnode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#analyticsnode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:aNodeDashboardInfo, nodeData:aNodeData, showSettings:true, ip:nodeIp}));
                var ipDeferredObj = $.Deferred();
                getReachableIp(iplist,"8089",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                    if(nodeIp != null && nodeIp != noDataStr) {
                        $('#linkIntrospect').unbind('click');
                        $('#linkIntrospect').click(function(){
                            window.open('/proxy?proxyURL=http://'+nodeIp+':8089&indexPage', '_blank');
                        });
                        $('#linkStatus').unbind('click');
                        $('#linkStatus').on('click', function(){
                            showStatus(nodeIp);
                        });
                        $('#linkLogs').unbind('click');
                        $('#linkLogs').on('click', function(){
                            showLogs(nodeIp);
                        }); 
                    }
                });
                endWidgetLoading('dashboard');
                initWidget4Id('#collector-chart-box');
                initWidget4Id('#queryengine-chart-box');
                initWidget4Id('#opServer-chart-box');
            }).fail(displayAjaxError.bind(null, $('#analyticsnode-dashboard')));
    }
    return {populateDetailsTab:populateDetailsTab};
})();

function getStatusesForAllAnalyticsProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
        for(var i=0; i < processStateList.length; i++){
            var currProc = processStateList[i];
            if (currProc.process_name == "contrail-query-engine"){
                ret['contrail-query-engine'] = getProcessUpTime(currProc);
            }  else if (currProc.process_name == "contrail-analytics-nodemgr"){
                ret['contrail-analytics-nodemgr'] = getProcessUpTime(currProc);
            }  else if (currProc.process_name == "contrail-analytics-api"){
                ret['contrail-analytics-api'] = getProcessUpTime(currProc);
            } else if (currProc.process_name == "contrail-collector"){
                ret['contrail-collector'] = getProcessUpTime(currProc);
            } 
        }
    }
    return ret;
}
