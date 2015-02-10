/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Config Node Details Page
 */
monitorInfraConfigDetailsClass = (function() {
    this.populateDetailsTab = function (obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp,iplist;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'', node:obj['name']},{triggerHashChange:false});
        }    
        startWidgetLoading('config-sparklines' + '_' + obj.name);
        toggleWidgetsVisibility(['apiServer-chart' + '_' + obj.name + '-box'], ['serviceMonitor-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box']);
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#confignode-dashboard' + '_' + obj.name).html(dashboardTemplate({title:'Configuration Node',colCount:2, showSettings:true, widgetBoxId:'dashboard' + '_' + obj.name, name:obj.name}));
        startWidgetLoading('dashboard' + '_' + obj.name);
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONFIG_DETAILS'] , obj['name'])
        }).done(function (result) {
                var noDataStr = "--";
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
                    $('#apiServer-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'api_server_cpu_share', color: 'blue-sparkline'},
                        {name: 'api_server_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    $('#serviceMonitor-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'service_monitor_cpu_share', color: 'blue-sparkline'},
                        {name: 'service_monitor_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    $('#schema-sparklines' + '_' + obj.name).initMemCPUSparkLines(result.configNode, 'parseMemCPUData4SparkLines', {'ModuleCpuState': [
                        {name: 'schema_xmer_cpu_share', color: 'blue-sparkline'},
                        {name: 'schema_xmer_mem_virt', color: 'green-sparkline'}
                    ]}, slConfig);
                    endWidgetLoading('config-sparklines' + '_' + obj.name);
                    $('#apiServer-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-api', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", parser: "parseProcessMemCPUData", plotOnLoad: true, lineChartId: 'apiServer-sparklines' + '_' + obj.name, showWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['serviceMonitor-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#serviceMonitor-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-svc-monitor', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'serviceMonitor-sparklines' + '_' + obj.name, showWidgetIds: ['serviceMonitor-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box', 'schema-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                    $('#schema-chart' + '_' + obj.name).initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-schema', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: false, lineChartId: 'schema-sparklines' + '_' + obj.name, showWidgetIds: ['schema-chart' + '_' + obj.name + '-box'], hideWidgetIds: ['apiServer-chart' + '_' + obj.name + '-box', 'serviceMonitor-chart' + '_' + obj.name + '-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
                });
                confNodeData = result;
                var parsedData = infraMonitorUtils.parseConfigNodesDashboardData([{name:obj['name'],value:confNodeData}])[0];
                var cpu = "N/A",
                    memory = "N/A",
                    confNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                var procStateList, overallStatus = noDataStr;
                var configProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                overallStatus = getOverallNodeStatusForDetails(parsedData);
                procStateList = getValueByJsonPath(confNodeData,"configNode;NodeStatus;process_info",[]);
                if(!(procStateList instanceof Array)){
                    procStateList = [procStateList];
                }
                configProcessStatusList = getStatusesForAllConfigProcesses(procStateList);
                confNodeDashboardInfo = [
                  {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function (){
                     var ips = '';
                        try{
                            iplist = getValueByJsonPath(confNodeData,"configNode;ModuleCpuState;config_node_ip",[]);
                            if(iplist instanceof Array){
                                nodeIp = iplist[0];//using the first ip in the list for status
                            } else {
                                nodeIp = iplist;
                            }
                        } catch(e){return noDataStr;}
                        if(iplist != null && iplist != noDataStr && iplist.length>0){
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
                confNodeDashboardInfo = confNodeDashboardInfo.concat(
                    (IS_NODE_MANAGER_INSTALLED)? 
                        ([{lbl:'Processes', value:" "},
                        {lbl:INDENT_RIGHT+'API Server', value:(function(){
                            return configProcessStatusList['contrail-api'];
                        })()},
                        {lbl:INDENT_RIGHT+'Schema Transformer', value:(function(){
                            return configProcessStatusList['contrail-schema'];
                        })()},
                        {lbl:INDENT_RIGHT+'Service Monitor', value:(function(){
                            return configProcessStatusList['contrail-svc-monitor'];
                        })()},
                        /*{lbl:INDENT_RIGHT+'Config Node Manager', value:(function(){
                            return ifNull(configProcessStatusList['contrail-config-nodemgr'],noDataStr);
                        })()},*/
                        {lbl:INDENT_RIGHT+'Discovery', value:(function(){
                            return ifNull(configProcessStatusList['contrail-discovery'],noDataStr);
                        })()},
                       /* {lbl:INDENT_RIGHT+'Zookeeper', value:(function(){
                            return ifNull(configProcessStatusList['contrail-zookeeper'],noDataStr);
                        })()},*/
                        {lbl:INDENT_RIGHT+'Ifmap', value:(function(){
                            return ifNull(configProcessStatusList['ifmap'],noDataStr);
                        })()}
                    ]):[]);
                confNodeDashboardInfo = confNodeDashboardInfo.concat(
                   [{lbl:'Analytics Node', value:(function(){
                     var anlNode = noDataStr; 
                     var secondaryAnlNode, status;
                     try{
                        //anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                        anlNode = jsonPath(confNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                        status = jsonPath(confNodeData,"$..ModuleClientState..status")[0];
                        secondaryAnlNode = ifNull(jsonPath(confNodeData,"$..ModuleClientState..secondary")[0],"").split(':')[0];
                     }catch(e){
                        anlNode = "--";
                     }
                     try{
                        if(anlNode != null && anlNode != noDataStr && status.toLowerCase() == "established")
                           anlNode = anlNode.concat(' (Up)');
                     }catch(e){
                        if(anlNode != null && anlNode != noDataStr) {
                           anlNode = anlNode.concat(' (Down)');
                        }
                     }
                     if(secondaryAnlNode != null && secondaryAnlNode != "" && secondaryAnlNode != "0.0.0.0"){
                        anlNode.concat(', ' + secondaryAnlNode);
                     }
                     return ifNull(anlNode,noDataStr);
                  })()},
                  //  {lbl:'Analytics Messages', value:(function(){return (parseInt(confNodeData.ApiServer.ModuleServerState["generator_info"]["connect_time"]) 
                  //    > parseInt(confNodeData.ModuleServerState["generator_info"]["reset_time"]))?"Up":"Down"})()},
                  {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                  {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                  {lbl:'Last Log', value: (function(){
                     var lmsg;
                     lmsg = getLastLogTimestamp(confNodeData,"config");
                     if(lmsg != null){
                        try{
                           return new Date(parseInt(lmsg)/1000).toLocaleString();   
                        }catch(e){return noDataStr;}
                     } else return noDataStr;
                     })()}
                ]);
                /*Selenium Testing*/
                confNodeDetailsData = confNodeDashboardInfo;
                /*End of Selenium Testing*/                          
                var cores=getCores(confNodeData);
                for(var i=0;i<cores.length;i++)
                  confNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#confignode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#confignode-dashboard' + '_' + obj.name + ' .widget-body').html(dashboardBodyTemplate({colCount:2, d:confNodeDashboardInfo, nodeData:confNodeData, showSettings:true, ip:nodeIp, name:obj.name}));
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
            }).fail(displayAjaxError.bind(null, $('#confignode-dashboard' + '_' + obj.name)));
    }
    return {populateDetailsTab:populateDetailsTab};
})();

function getStatusesForAllConfigProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
       for(var i=0; i < processStateList.length; i++){
          var currProc = processStateList[i];
          if(currProc.process_name == "contrail-discovery:0"){
             ret['contrail-discovery'] = getProcessUpTime(currProc);
          } else if(currProc.process_name == "contrail-discovery"){
             ret['contrail-discovery'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "contrail-api:0"){
             ret['contrail-api'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "contrail-api"){
             ret['contrail-api'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "contrail-config-nodemgr"){
             ret['contrail-config-nodemgr'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "contrail-svc-monitor"){
             ret['contrail-svc-monitor'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "ifmap"){
             ret['ifmap'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == "contrail-schema"){
             ret['contrail-schema'] = getProcessUpTime(currProc);
          } else if (currProc.process_name == 'contrail-zookeeper') {
                 ret['contrail-zookeeper'] = getProcessUpTime(currProc);
             }
       }
    }
    return ret;
 }