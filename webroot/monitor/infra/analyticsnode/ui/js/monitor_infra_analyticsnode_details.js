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
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'',ip:obj['ip'], node: obj['name']},{triggerHashChange:false});
        }    
        //showProgressMask('#analyticsnode-dashboard', true);
        //Destroy chart if it exists
        startWidgetLoading('analytics-sparklines' + '_' + obj.name);
        toggleWidgetsVisibility(['collector-chart' + '_' + obj.name + '-box'], ['queryengine-chart' + '_' + obj.name + '-box', 'opServer-chart' + '_' + obj.name + '-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#analyticsnode-dashboard' + '_' + obj.name ).html(dashboardTemplate({title:'Analytics Node',colCount:2, showSettings:true, widgetBoxId:'dashboard' + '_' + obj.name, name:obj.name}));
        startWidgetLoading('dashboard' + '_' + obj.name);

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
                    var slConfig;
                    startTime = endTime - 600000;
                    slConfig = {startTime: startTime, endTime: endTime};
                    $('#collector-sparklines' + '_' + obj.name).initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'collector_cpu_share', color: 'blue-sparkline'},
                        {name: 'collector_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    $('#queryengine-sparklines' + '_' + obj.name).initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'queryengine_cpu_share', color: 'blue-sparkline'},
                        {name: 'queryengine_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    $('#opServer-sparklines' + '_' + obj.name).initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'opserver_cpu_share', color: 'blue-sparkline'},
                        {name: 'opserver_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    endWidgetLoading('analytics-sparklines' + '_' + obj.name);
                    $('#collector-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-collector', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['collector-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['queryengine-chart' + '_' + obj.name + '-box', 'opServer-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#queryengine-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-query-engine', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['queryengine-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['collector-chart' + '_' + obj.name + '-box', 'opServer-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#opServer-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-analytics-api', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, showWidgetIds: ['opServer-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['collector-chart' + '_' + obj.name + '-box', 'queryengine-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
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
                $('#analyticsnode-dashboard' + '_' + obj.name +' .widget-body').html(dashboardBodyTemplate({colCount:2, d:aNodeDashboardInfo, nodeData:aNodeData, showSettings:true, ip:nodeIp, name:obj.name}));
                var ipDeferredObj = $.Deferred();
                getReachableIp(iplist,"8089",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                    if(nodeIp != null && nodeIp != noDataStr) {
                        $('#linkIntrospect' + '_' + obj.name).unbind('click');
                        $('#linkIntrospect' + '_' + obj.name).click(function(){
                            window.open('/proxy?proxyURL=http://'+nodeIp+':8089&indexPage', '_blank');
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
                initWidget4Id('#collector-chart' + '_' + obj.name + '-box');
                initWidget4Id('#queryengine-chart' + '_' + obj.name + '-box');
                initWidget4Id('#opServer-chart' + '_' + obj.name + '-box');
            }).fail(displayAjaxError.bind(null, $('#analyticsnode-dashboard' + '_' + obj.name)));
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
