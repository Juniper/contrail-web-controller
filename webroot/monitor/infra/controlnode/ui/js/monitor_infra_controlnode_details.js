/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Node Details tab
 */
monitorInfraControlDetailsClass = (function() {
    this.populateDetailsTab = function(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'', node: obj['name']},{triggerHashChange:false});
        //showProgressMask('#controlnode-dashboard', true);
        startWidgetLoading('control-sparklines');
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#controlnode-dashboard').html(dashboardTemplate({title:'Control Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONTROLNODE_DETAILS'], obj['name'])
        }).done(function (result) {
                ctrlNodeData = result;
                var parsedData = infraMonitorUtils.parseControlNodesDashboardData([{name:obj['name'],value:result}])[0];
                var noDataStr = "--";
                var cpu = "N/A", memory = "N/A", ctrlNodeDashboardInfo;
                $.ajax({
                    url: '/api/service/networking/web-server-info'
                }).done(function (resultJSON) {
                    endTime = resultJSON['serverUTCTime'];
                }).fail(function() {
                    endTime = getCurrentTime4MemCPUCharts();
                }).always(function() {
                    var cpuMemStats = [], nodetype = "controlNodeDS";
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
                        $('#control-sparklines').initMemCPUSparkLines(cpuMemStats, 'parseMemCPUData4SparkLines', {'value': [
                             {name: 'contrail-control-cpu-share', color: 'blue-sparkline'},
                             {name: 'contrail-control-mem-res', color: 'green-sparkline'}
                         ]}, slConfig);
                        endWidgetLoading('control-sparklines');
                        $('#control-chart').initMemCPULineChart($.extend({url:function() {
                            return  contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'contrail-control', '30', '10', obj['name'], endTime);
                        }, parser: "parseProcessMemCPUData", plotOnLoad: true, lineChartId: 'control-sparklines', showWidgetIds: [], hideWidgetIds: [], titles: {memTitle:'Memory',cpuTitle:infraDetailsPageCPUChartTitle}}),110);
                    });
                });
                var procStateList, overallStatus = noDataStr;
                var controlProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                
                try{
                    overallStatus = getOverallNodeStatusForDetails(parsedData);
                }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
                
                try{
                  procStateList = jsonPath(ctrlNodeData,"$..NodeStatus.process_info")[0];
                  controlProcessStatusList = getStatusesForAllControlProcesses(procStateList);
                }catch(e){}
                
                
                ctrlNodeDashboardInfo = [
                  {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address',value:(function(){
                        var ip = ifNullOrEmpty(getControlIpAddresses(ctrlNodeData,"details"),noDataStr);
                        return ip;
                    })()},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Overall Node Status', value:overallStatus}];
              //If node manager is not installed dont show the processes
                ctrlNodeDashboardInfo = ctrlNodeDashboardInfo.concat((IS_NODE_MANAGER_INSTALLED)?
                        ([{lbl:'Processes', value:" "},
                        {lbl:INDENT_RIGHT+'Control Node', value:(function(){
                            return ifNull(controlProcessStatusList['contrail-control'],noDataStr);
                        })()}
                    ]): []);
                    /*{lbl:INDENT_RIGHT+'Control Node Manager', value:(function(){
                     try{
                        return ifNull(controlProcessStatusList['contrail-control-nodemgr'],noDataStr);
                     }catch(e){return noDataStr;}
                    })()},*/
                ctrlNodeDashboardInfo =ctrlNodeDashboardInfo.concat(
                   [{lbl:'Ifmap Connection', value:(function(){
                     var cnfNode = '';
                     try{
                        var url = ctrlNodeData.BgpRouterState.ifmap_info.url;
                        if(url != null && url != undefined && url != ""){
                           var pos = url.indexOf(':8443');
                           if(pos != -1)
                              cnfNode = url.substr(0, pos);
                              pos = cnfNode.indexOf('https://');
                              if(pos != -1)
                                 cnfNode = cnfNode.slice(pos + 8) ;
                        }
                           var status = ctrlNodeData.BgpRouterState.ifmap_info.connection_status;
                           var stateChangeAtTime = ctrlNodeData.BgpRouterState.ifmap_info.connection_status_change_at;
                           var stateChangeSince = "";
                           var statusString = "";
                           if(stateChangeAtTime != null){
                              var stateChangeAtTime = new XDate(stateChangeAtTime/1000);
                               var currTime = new XDate();
                               stateChangeSince = diffDates(stateChangeAtTime,currTime);
                           }
                           if(status != null && status != undefined && status != ""){
                              if(stateChangeSince != ""){
                                 if(status.toLowerCase() == "up" || status.toLowerCase() == "down"){
                                    status = status + " since";
                                 }
                                 statusString = status + " " + stateChangeSince;
                              } else {
                                 statusString = status;
                              }
                           }
                           if(statusString != ""){
                              cnfNode = cnfNode.concat( ' (' + statusString + ')');
                           }
                     }catch (e){}
                        return ifNull(cnfNode,noDataStr);
                    })()},
                    {lbl:'Analytics Node', value:(function(){
                     var anlNode = noDataStr; 
                     var secondaryAnlNode, status;
                     try{
                        anlNode = jsonPath(ctrlNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                        status = jsonPath(ctrlNodeData,"$..ModuleClientState..status")[0];
                        secondaryAnlNode = ifNull(jsonPath(ctrlNodeData,"$..ModuleClientState..secondary")[0],"").split(':')[0];
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
                        anlNode = anlNode.concat(', ' + secondaryAnlNode);
                     }
                     return ifNull(anlNode,noDataStr);
                    })()},
                    //TODO{lbl:'Config Messages', value:ctrlNodeData['configMessagesIn'] + ' In, ' + ctrlNodeData['configMessagesOut'] + ' Out'},
                    {lbl:'Analytics Messages', value:(function(){
                        var msgs = getAnalyticsMessagesCountAndSize(ctrlNodeData,['contrail-control']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
                    {lbl:'Peers', value:(function(){
                        var totpeers= 0,uppeers=0;
                        totpeers= ifNull(parsedData['totalBgpPeerCnt'],0);
                        uppeers = ifNull(parsedData['upBgpPeerCnt'],0);
                        var downpeers = 0;
                        if(totpeers > 0){
                            downpeers = totpeers - uppeers;
                        }
                        if (downpeers > 0){
                            downpeers = ", <span class='text-error'>"+ downpeers +" Down</span>";
                        } else {
                            downpeers = "";
                        }
                        return contrail.format('BGP Peers: {0} Total {1}',totpeers,downpeers);
                    })()},
                    {lbl:'',value:(function(){
                        var totXmppPeers = 0,upXmppPeers = 0,downXmppPeers = 0,subsCnt = 0;
                        totXmppPeers = parsedData['totalXMPPPeerCnt'];
                        upXmppPeers = parsedData['upXMPPPeerCnt'];
                        subsCnt = ifNull(jsonPath(ctrlNodeData,'$..BgpRouterState.ifmap_server_info.num_peer_clients')[0],0)
                        if(totXmppPeers > 0){
                            downXmppPeers = totXmppPeers - upXmppPeers;
                        }
                        if (downXmppPeers > 0){
                            downXmppPeers = ", <span class='text-error'>"+ downXmppPeers +" Down</span>";
                        } else {
                            downXmppPeers = "";
                        }
                        if (subsCnt > 0){
                            subsCnt = ", "+ subsCnt +" subscribed for configuration";
                        } else {
                            subsCnt = ""
                        }
                        return contrail.format('vRouters: {0} Established in Sync{1}{2} ',
                                upXmppPeers,downXmppPeers,subsCnt);
                    })()},
                    {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Last Log', value: (function(){
                     var lmsg;
                     lmsg = getLastLogTimestamp(ctrlNodeData,"control");
                     if(lmsg != null){
                        try{
                           return new Date(parseInt(lmsg)/1000).toLocaleString();   
                        }catch(e){return noDataStr;}
                     } else return noDataStr;
                    })()}
                ]);
                /*Selenium Testing*/
                ctrlNodeDetailsData = ctrlNodeDashboardInfo;
                /*End of Selenium Testing*/
                var cores=getCores(ctrlNodeData);
                for(var i=0;i<cores.length;i++)
                  ctrlNodeDashboardInfo.push(cores[i]);
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#dashboard-box .widget-body').html(dashboardBodyTemplate({colCount:2, d:ctrlNodeDashboardInfo, nodeData:ctrlNodeData, showSettings:true, ip:nodeIp}));
                var ipList = getControlNodeIpAddressList(ctrlNodeData);
                var ipDeferredObj = $.Deferred();
               getReachableIp(ipList,"8083",ipDeferredObj);
               ipDeferredObj.done(function(nodeIp){
                   if(nodeIp != null && nodeIp != noDataStr) {
                     $('#linkIntrospect').unbind('click');
                       $('#linkIntrospect').click(function(){
                           window.open('/proxy?proxyURL=http://'+nodeIp+':8083&indexPage', '_blank');
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
                initWidget4Id('#control-chart-box');
            }).fail(displayAjaxError.bind(null, $('#controlnode-dashboard')));
    }
    return {populateDetailsTab:populateDetailsTab}
})();

function getStatusesForAllControlProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
       for(var i=0; i < processStateList.length; i++){
          var currProc = processStateList[i];
          if(currProc.process_name == "contrail-control-nodemgr"){
             ret['contrail-control-nodemgr'] = getProcessUpTime(currProc);
          } else if(currProc.process_name == "contrail-control"){
             ret['contrail-control'] = getProcessUpTime(currProc);
          }
       }
    }
    return ret;
 }

function getControlNodeIpAddressList(data){
   var ips = getValueByJsonPath(data,'$..bgp_router_ip_list',[]);
   var configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
   var ipList = [];
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