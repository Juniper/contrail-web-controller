define([
    'contrail-list-model'
], function (ContrailListModel) {
    var ControlNodeListModel = function () { 
        if(ControlNodeListModel.prototype.singletonInstance) {
            return ControlNodeListModel.prototype.singletonInstance;
        }
        var vlRemoteConfig = [
          {
              getAjaxConfig: function() {
                  return monitorInfraUtils
                      .getGeneratorsAjaxConfigForInfraNodes('controlNodeDS');
              },
              successCallback: function(response,contrailListModel) {
                  monitorInfraUtils
                      .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                              response,contrailListModel);
              }
          }
                              //Need to add cpu stats
        ];
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.CONTROLNODE_SUMMARY_URL
                    },
                    dataParser : parseControlNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteConfig
                },
                cacheConfig : {
                    ucid: ctwc.CACHE_CONTROLNODE
                }
            };
        function parseControlNodesDashboardData (result) {
            var retArr = [];
            $.each(result,function(idx,d) {
                var obj = {};
                obj['x'] = parseFloat(jsonPath(d,'$..cpu_info.cpu_share')[0]);
                //Info:Need to specify the processname explictly 
                //for which we need res memory && Convert to MB
                obj['y'] = parseInt(jsonPath(d,'$..meminfo.res')[0])/1024; 
                obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
                obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                obj['histCpuArr'] = 
                    parseUveHistoricalValues(d,'$.cpuStats.history-10');
                obj['uveIP'] = 
                    ifNull(jsonPath(d,'$..bgp_router_ip_list')[0],[]);
                obj['configIP'] = ifNull(jsonPath(d,
                    '$..ConfigData..bgp_router_parameters.address')[0],'-');
                obj['isConfigMissing'] = $.isEmptyObject(jsonPath(d,
                    '$..ConfigData')[0]) ? true : false;
                obj['configuredBgpPeerCnt'] = 
                    ifNull(jsonPath(d,'$.value.ConfigData.bgp-router.'+
                    'bgp_router_refs')[0],[]).length;
                obj['isUveMissing'] = 
                    $.isEmptyObject(jsonPath(d,'$..BgpRouterState')[0]) ? 
                            true : false;
                obj['ip'] = 
                    ifNull(jsonPath(d,'$..bgp_router_ip_list[0]')[0],'-');
                //If iplist is empty will display the config ip 
                if(obj['ip'] == '-') {
                    obj['ip'] = obj['configIP'];
                }
                obj['summaryIps'] = getControlIpAddresses(d,"summary");
                obj['memory'] = 
                    formatMemory(ifNull(jsonPath(d,'$..meminfo')[0]),'-');
                obj['size'] = 
                    ifNull(jsonPath(d,'$..output_queue_depth')[0],0)+1; 
                obj['shape'] = 'circle';
                obj['name'] = d['name'];
                obj['link'] = 
                    {p:'mon_infra_control',q:{node:obj['name'],tab:''}};
                obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,
                    '$.value.BgpRouterState.build_info')[0]),'-');
                obj['totalPeerCount'] = 
                    ifNull(jsonPath(d,'$..num_bgp_peer')[0],0) + 
                    ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
                //Assign totalBgpPeerCnt as false if it doesn't exist in UVE
                obj['totalBgpPeerCnt'] = 
                    ifNull(jsonPath(d,'$..num_bgp_peer')[0],null);
                obj['upBgpPeerCnt'] = 
                    ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],null);
                obj['establishedPeerCount'] = 
                    ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],0);
                obj['activevRouterCount'] = 
                    ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
                obj['upXMPPPeerCnt'] = 
                    ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
                obj['totalXMPPPeerCnt'] = 
                    ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
                if(obj['totalXMPPPeerCnt'] > 0){
                    obj['downXMPPPeerCnt'] = 
                        obj['totalXMPPPeerCnt'] - obj['upXMPPPeerCnt'];
                } else {
                    obj['downXMPPPeerCnt'] = 0;
                }
                obj['downBgpPeerCnt'] = 0;
                if(typeof(obj['totalBgpPeerCnt']) == "number" && 
                        typeof(obj['upBgpPeerCnt']) == "number"  && 
                        obj['totalBgpPeerCnt'] > 0) {
                    obj['downBgpPeerCnt'] = 
                        obj['totalBgpPeerCnt'] - obj['upBgpPeerCnt'];
                } 
                if(obj['downXMPPPeerCnt'] > 0){
                    obj['downXMPPPeerCntText'] = ", <span class='text-error'>" +
                        obj['downXMPPPeerCnt'] + " Down</span>";
                } else {
                    obj['downXMPPPeerCntText'] = "";
                }
                obj['isPartialUveMissing'] = false;
                obj['isIfmapDown'] = false;
                if(obj['isUveMissing'] == false) {
                    obj['isPartialUveMissing'] = (isEmptyObject(jsonPath(d,
                        '$.value.BgpRouterState.cpu_info')[0]) || isEmptyObject(
                        jsonPath(d,'$.value.BgpRouterState.build_info')[0]) || 
                        (obj['configIP'] == '-') || obj['uveIP'].length == 0) 
                        ? true : false;
                    var ifmapObj = 
                        jsonPath(d,'$.value.BgpRouterState.ifmap_info')[0];
                    if(ifmapObj != undefined && 
                            ifmapObj['connection_status'] != 'Up'){
                        obj['isIfmapDown'] = true;
                        obj['ifmapDownAt'] = 
                            ifNull(ifmapObj['connection_status_change_at'],'-');
                    }
                }
                obj['isNTPUnsynced'] = 
                    isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                if(obj['downBgpPeerCnt'] > 0){
                    obj['downBgpPeerCntText'] = ", <span class='text-error'>" + 
                        obj['downBgpPeerCnt'] + " Down</span>";
                } else {
                    obj['downBgpPeerCntText'] = "";
                }
                obj['uveCfgIPMisMatch'] = false;
                if(obj['isUveMissing'] == false && 
                        obj['isConfigMissing'] == false && 
                        obj['isPartialUveMissing'] == false) {
                    if(obj['uveIP'].indexOf(obj['configIP']) <= -1){
                        obj['uveCfgIPMisMatch'] = true;
                    } 
                }
                obj['type'] = 'controlNode';
                obj['display_type'] = 'Control Node';
                var upTime = new XDate(jsonPath(d,'$..uptime')[0]/1000);
                var currTime = new XDate();
                var procStateList;
                try{
                    obj['status'] = getOverallNodeStatus(d,"control");
                }catch(e){
                    obj['status'] = 'Down';
                }
                obj['processAlerts'] = 
                    infraMonitorAlertUtils.getProcessAlerts(d,obj);
                obj['isGeneratorRetrieved'] = false;
                obj['nodeAlerts'] = 
                    infraMonitorAlertUtils.processControlNodeAlerts(obj);
                obj['alerts'] = 
                    obj['nodeAlerts'].concat(obj['processAlerts'])
                                        .sort(dashboardUtils.sortInfraAlerts);
                obj['color'] = monitorInfraUtils.getControlNodeColor(d,obj);
                retArr.push(obj);
            });
            retArr.sort(dashboardUtils.sortNodesByColor);
            return retArr;
        }
        ControlNodeListModel.prototype.singletonInstance = 
            new ContrailListModel(listModelConfig);
        return ControlNodeListModel.prototype.singletonInstance;
    };
    return ControlNodeListModel;    
    }
);