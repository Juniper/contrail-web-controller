/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Details tab
 */
monitorInfraComputeDetailsClass = (function() {
    this.populateDetailsTab = function (obj) {
        var nodeIp; 
        layoutHandler.setURLHashParams({tab:'',node: obj['name']},{triggerHashChange:false});
        //showProgressMask('#computenode-dashboard', true);
        startWidgetLoading('vrouter-sparklines');
        toggleWidgetsVisibility(['vrouter-chart-box'], ['system-chart-box']);

        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#computenode-dashboard').html(dashboardTemplate({title:'vRouter',colCount:2,showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   

        $.ajax({
            url: contrail.format(monitorInfraUrls['VROUTER_DETAILS'], obj['name'])
        }).done(function (result) {
                    computeNodeData = result;
                    var parsedData = infraMonitorUtils.parsevRoutersDashboardData([{name:obj['name'],value:result}])[0];
                    var noDataStr = '--',
                    cpu = "N/A",
                    memory = "N/A",
                    computeNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                // var chartWidths3 = $('#vrouter-detail-charts').width();
                //var cwd1 = (parseInt(chartWidths3));
                //var cwd = cwd1/3;
                var parentWidth = parseInt($('#computenode-dashboard').width());
                var chartWdth = parentWidth/2;
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
                    $('#vrouter-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'cpu_share', color: 'blue-sparkline'}, {name: 'virt_mem', color: 'green-sparkline'}]}, slConfig);
                    $('#system-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'one_min_avg_cpuload', color: 'blue-sparkline'}, {name: 'used_sys_mem', color: 'green-sparkline'}]}, slConfig);
                    endWidgetLoading('vrouter-sparklines');
                    $('#vrouter-chart').initMemCPULineChart($.extend({url:function() {
                        return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', obj['name'], endTime);
                    }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['vrouter-chart-box'], hideWidgetIds: ['system-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}), 110);
                    $('#system-chart').initMemCPULineChart($.extend({url:function() {
                        return  contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', obj['name'], endTime);
                    }, parser: "parseSystemMemCPUData", plotOnLoad: false, showWidgetIds: ['system-chart-box'], hideWidgetIds: ['vrouter-chart-box'], titles: {memTitle:'Memory',cpuTitle:'Avg CPU Load'}}),110);
                });
                var procStateList, overallStatus = noDataStr;
                var vRouterProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                overallStatus = getOverallNodeStatusForDetails(parsedData);
                procStateList = getValueByJsonPath(computeNodeData,"NodeStatus;process_info");
                vRouterProcessStatusList = getStatusesForAllvRouterProcesses(procStateList);
                computeNodeDashboardInfo = [
                    {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function(){
                        return ifNullOrEmpty(getVrouterIpAddresses(computeNodeData,"details"),noDataStr);
                    })()},
                    {lbl:'Overall Node Status', value:overallStatus},
                    {lbl:'Processes', value:" "},
                    {lbl:INDENT_RIGHT+'vRouter Agent', value:(function(){
                        return ifNull(vRouterProcessStatusList['contrail-vrouter-agent'],noDataStr);
                    })()},
                    /*{lbl:INDENT_RIGHT+'vRouter Node Manager', value:(function(){
                        try{
                            return ifNull(vRouterProcessStatusList['contrail-vrouter-nodemgr'],noDataStr);
                        }catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Openstack Nova Compute', value:(function(){
                        try{
                            return ifNull(vRouterProcessStatusList['openstack-nova-compute'],noDataStr);
                        }catch(e){return noDataStr;}
                    })()},*/
                    {lbl:'Analytics Node', value:(function(){
                        var anlNode = noDataStr; 
                        var secondaryAnlNode, status;
                        try{
                            //anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                            anlNode = jsonPath(computeNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                            status = jsonPath(computeNodeData,"$..ModuleClientState..status")[0];
                            secondaryAnlNode = jsonPath(computeNodeData,"$..ModuleClientState..secondary")[0].split(':')[0];
                        }catch(e){
                            anlNode = noDataStr;
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
                    {lbl:'Control Nodes', value:(function(){
                        var peerList ;
                        try{
                            peerList = computeNodeData.VrouterAgent.xmpp_peer_list;
                        }catch(e){}
                        var nodeArr=noDataStr ;
                        if(peerList != null && peerList.length>0){
                            nodeArr = '<div class="table-cell dashboard-item-value">';
                            var nodes = '';

                            for (var i=0; i< peerList.length;i++){
                                var node = '';
                                node = '<span onclick="showObjLog(\'default-domain%3Adefault-project%3Aip-fabric%3A__default__%3A'+peerList[i].ip+'\',\'vRouter\');" onmouseover="" style="cursor: pointer;">'+ peerList[i].ip +'</span>' ;

                                if(peerList[i].primary != null && peerList[i].primary == true){
                                    if(peerList[i].status == true){
                                        if((i+1) == peerList.length){//only primary present
                                            node =  node + "* (Up) " ;
                                        } else {
                                            node = node + "* (Up), " ;
                                        }
                                    } else {
                                        node = "<span class='text-error'>" + node + "* (Down)</span>, " ;
                                    }
                                    if(nodes == ''){
                                        nodes = node;
                                    } else {
                                        nodes = node + nodes
                                    }
                                } else {
                                    if(peerList[i].status == true)
                                        node = node + " (Up)" ;
                                    else
                                        node = "<span class='text-error'>" + node + " (Down)</span>" ;
                                    if(node != ''){
                                        nodes = nodes + node
                                    } else {
                                        nodes = node;
                                    }
                                }
                            }
                            nodeArr = nodeArr + nodes + '</div>'
                        }
                        return nodeArr;
                    })(),clk:'url'},

                    //Best way to get the primary node - jsonPath(computeNodeData,'$.VrouterAgent.xmpp_peer_list[?(@.primary==true)].ip')},
                    {lbl:'Analytics Messages', value:(function(){
                        var msgs = getAnalyticsMessagesCountAndSize(computeNodeData,['VRouterAgent']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
                    {lbl:'XMPP Messages', value:(function(){
                        var xmppStatsList = getValueByJsonPath(computeNodeData,'VrouterStatsAgent;xmpp_stats_list',[]);
                        var inMsgs = outMsgs = 0; 
                        for(var i = 0; i < xmppStatsList.length ; i++) {
                            inMsgs += getValueByJsonPath(xmppStatsList[i],'in_msgs',0);
                            outMsgs += getValueByJsonPath(xmppStatsList[i],'out_msgs',0);
                        }
                        return (inMsgs + ' In, ' + outMsgs + ' Out');
                    })()},
                    {lbl:'Flow Count', value:(function(){
                        return (getValueByJsonPath(computeNodeData,"VrouterStatsAgent;active_flows", noDataStr) + ' Active, ' + 
                                getValueByJsonPath(computeNodeData,"VrouterStatsAgent;total_flows", noDataStr) + ' Total');
                    })()},  
                    {lbl:'Networks', value:parsedData['vnCnt']},
                    {lbl:'Interfaces', value:(function(){
                        var downInts = parsedData['errorIntfCnt'];
                        var totInts = parsedData['intfCnt'];
                        var ret;
                        if(downInts > 0){
                            downInts = ", <span class='text-error'>" + downInts + " Down</span>";
                        } else {
                            downInts = "";
                        } 
                        return totInts + " Total" + downInts;
                    })()},
                    {lbl:'Instances', value:parsedData['instCnt']},
                    {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Last Log', value: (function(){
                        var lmsg;
                        lmsg = getLastLogTimestamp(computeNodeData,"compute");
                        if(lmsg != null){
                            try{
                                return new Date(parseInt(lmsg)/1000).toLocaleString();  
                            }catch(e){return noDataStr;}
                        } else return noDataStr;
                    })()}
                ]
                var cores=getCores(computeNodeData);
                for(var i=0;i<cores.length;i++)
                    computeNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#computenode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#computenode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:computeNodeDashboardInfo, nodeData:computeNodeData, showSettings:true, ip:nodeIp}));
                /*Selenium Testing*/
                cmptNodeDetailsData = computeNodeDashboardInfo;
                /*End of Selenium Testing*/
                var ipList = getVrouterIpAddressList(computeNodeData);
                var ipDeferredObj = $.Deferred();
                getReachableIp(ipList,"8085",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                    if(nodeIp != null && nodeIp != noDataStr) {  
                        $('#linkIntrospect').unbind('click');
                        $('#linkIntrospect').click(function(){
                            window.open('/proxy?proxyURL=http://'+nodeIp+':8085&indexPage', '_blank');
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
                initWidget4Id('#dashboard-box');
                initWidget4Id('#vrouter-chart-box');
                initWidget4Id('#system-chart-box');

                endWidgetLoading('dashboard');
            }).fail(displayAjaxError.bind(null, $('#computenode-dashboard')));
    };
    return {populateDetailsTab:populateDetailsTab};
})();

function getVrouterIpAddressList(data){
    var controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
    var ips = getValueByJsonPath(data,'VrouterAgent;self_ip_list',[]);
    var configip = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address');
    var ipList = [];
    if(controlIp != noDataStr){
        ipList.push(controlIp);
    }
    if(ips.length > 0){
        $.each(ips,function(idx,obj){
            if(obj != null && ipList.indexOf(obj) == -1){
                ipList.push(obj);
            }
        });
    }
    if(configip != null && ipList.indexOf(configip) == -1){
        ipList.push(configip);
    }
    return ipList;
}

function getStatusesForAllvRouterProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
        for(var i=0; i < processStateList.length; i++){
            var currProc = processStateList[i];
            if(currProc.process_name == "contrail-vrouter-nodemgr"){
                ret['contrail-vrouter-nodemgr'] = getProcessUpTime(currProc);
            } else if (currProc.process_name == "openstack-nova-compute"){
                ret['openstack-nova-compute'] = getProcessUpTime(currProc);
            } else if (currProc.process_name == "contrail-vrouter-agent"){
                ret['contrail-vrouter-agent'] = getProcessUpTime(currProc);
            }
        }
    }
    return ret;
}
