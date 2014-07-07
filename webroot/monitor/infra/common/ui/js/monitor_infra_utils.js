/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var consoleTimer = [];
var chartsLegend = { 
        Working: d3Colors['green'],
        Idle: d3Colors['blue'],
        Warning: d3Colors['orange'],
        Error: d3Colors['red']
   };
var infraMonitorAlertUtils = {
    /**
    * Process-specific alerts
    */
    getProcessAlerts : function(data,obj,processPath) {
        var res,filteredResponse = [],downProcess = 0; 
        if(processPath != null)
            res = getValueByJsonPath(data['value'],processPath,[]);
        else
            res = ifNull(jsonPath(data,'$..NodeStatus.process_info')[0],[]);
        var alerts=[];
        var infoObj = {type:obj['display_type'],link:obj['link']};
        if(obj['isUveMissing'] == true)
            return alerts;
        filteredResponse = $.grep(res,function(obj,idx){
            return !isProcessExcluded(obj['process_name']);
        })
        if(filteredResponse.length == 0){
            alerts.push($.extend({
                sevLevel: sevLevels['ERROR'],
                name: data['name'],
                pName: obj['display_type'],
                msg: infraAlertMsgs['PROCESS_STATES_MISSING']
            }, infoObj));
        } else {
            for(var i=0;i<filteredResponse.length;i++) {
            if(filteredResponse[i]['core_file_list']!=undefined && filteredResponse[i]['core_file_list'].length>0) {
                var msg = infraAlertMsgs['PROCESS_COREDUMP'].format(filteredResponse[i]['core_file_list'].length);
                var restartCount = ifNull(filteredResponse[i]['exit_count'],0);
                if(restartCount > 0)
                    msg +=", "+ infraAlertMsgs['PROCESS_RESTART'].format(restartCount);
                alerts.push($.extend({
                    tooltipAlert: false,
                    sevLevel: sevLevels['INFO'],
                    name: data['name'],
                    pName: filteredResponse[i]['process_name'],
                    msg: msg
                }, infoObj));
            }  
            var procName = filteredResponse[i]['process_name'];
            if (filteredResponse[i]['process_state']!='PROCESS_STATE_STOPPED' && filteredResponse[i]['process_state']!='PROCESS_STATE_RUNNING' 
                    && filteredResponse[i]['last_exit_time'] != null){
                downProcess++;
                alerts.push($.extend({
                    tooltipAlert: false,
                    name: data['name'],
                    pName: procName,
                    msg: infraAlertMsgs['PROCESS_DOWN_MSG'].format(procName),
                    timeStamp: filteredResponse[i]['last_exit_time'],
                    sevLevel: sevLevels['ERROR']
                }, infoObj));
            } else if (filteredResponse[i]['process_state'] == 'PROCESS_STATE_STOPPED' && filteredResponse[i]['last_stop_time'] != null) {
                downProcess++;
                alerts.push($.extend({
                    tooltipAlert: false,
                    name: data['name'],
                    pName: procName,
                    msg: infraAlertMsgs['PROCESS_STOPPED'].format(procName),
                    timeStamp: filteredResponse[i]['last_stop_time'],
                    sevLevel: sevLevels['ERROR']
                }, infoObj));
                //Raise only info alert if process_state is missing for a process??
            } else if  (filteredResponse[i]['process_state'] == null) {
                downProcess++;
                alerts.push($.extend({
                    tooltipAlert: false,
                    name: data['name'],
                    pName: filteredResponse[i]['process_name'],
                    msg: infraAlertMsgs['PROCESS_DOWN_MSG'].format(filteredResponse[i]['process_name']),
                    timeStamp: filteredResponse[i]['last_exit_time'],
                    sevLevel: sevLevels['INFO']
                }, infoObj));
                    msg +=", "+infraAlertMsgs['RESTARTS'].format(restartCount);
                alerts.push($.extend({name:data['name'],pName:filteredResponse[i]['process_name'],type:'core',msg:msg},infoObj));
            } 
            }
            if(downProcess > 0)
                alerts.push($.extend({detailAlert:false,sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['PROCESS_DOWN'].format(downProcess)},infoObj));
        }
        return alerts.sort(dashboardUtils.sortInfraAlerts);
    },
    processvRouterAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'vRouter',ip:obj['ip'],link:obj['link']};
        if(obj['isUveMissing'] == true)
            alertsList.push($.extend({},{msg:infraAlertMsgs['UVE_MISSING'],sevLevel:sevLevels['ERROR'],tooltipLbl:'Events'},infoObj));
        if(obj['isConfigMissing'] == true)
            alertsList.push($.extend({},{msg:infraAlertMsgs['CONFIG_MISSING'],sevLevel:sevLevels['WARNING']},infoObj));
        //Alerts that are applicable only when both UVE & config data present
        if(obj['isConfigMissing'] == false && obj['isUveMissing'] == false) {
            if(obj['uveCfgIPMisMatch'] == true)
                alertsList.push($.extend({},{msg:infraAlertMsgs['CONFIG_IP_MISMATCH'],sevLevel:sevLevels['ERROR'],tooltipLbl:'Events'},infoObj));
        }
        //Alerts that are applicable only when UVE data is present
        if(obj['isUveMissing'] == false) {
            if(obj['isPartialUveMissing'] == true)
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING'],tooltipLbl:'Events'},infoObj));
            if(obj['errorIntfCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['INTERFACE_DOWN'].format(obj['errorIntfCnt']),tooltipLbl:'Events'},infoObj));
            if(obj['xmppPeerDownCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['XMPP_PEER_DOWN'].format(obj['xmppPeerDownCnt']),tooltipLbl:'Events'},infoObj));
        }
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    },
    processControlNodeAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Control Node',ip:obj['ip'],link:obj['link']};
        if(obj['isUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['UVE_MISSING']},infoObj));
        if(obj['isConfigMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_MISSING']},infoObj));
        if(obj['isUveMissing'] == false) {
            //ifmap down alerts for control node
            if(obj['isIfmapDown']) {
                alertsList.push($.extend({sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['IFMAP_DOWN'],timeStamp:obj['ifmapDownAt']},infoObj));
            }
            if(obj['isPartialUveMissing'] == true)
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
            if(obj['downXMPPPeerCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['XMPP_PEER_DOWN'].format(obj['downXMPPPeerCnt'])},infoObj));
            if(obj['downBgpPeerCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['BGP_PEER_DOWN'].format(obj['downBgpPeerCnt'])},infoObj));
        }
        //Alerts that are applicable only when both UVE and config data are present
        if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false) {
            if(typeof(obj['totalBgpPeerCnt']) == "number" &&  obj['configuredBgpPeerCnt'] != obj['totalBgpPeerCnt'])
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['BGP_CONFIG_MISMATCH']},infoObj));
            if(obj['uveCfgIPMisMatch'])
                alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_IP_MISMATCH']},infoObj));
        }
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    },
    processConfigNodeAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Config Node',ip:obj['ip'],link:obj['link']};
        if(obj['isPartialUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    },
    processAnalyticsNodeAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Analytics Node',ip:obj['ip'],link:obj['link']};
        if(obj['isPartialUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        if(obj['errorStrings'] != null && obj['errorStrings'].length > 0){
            $.each(obj['errorStrings'],function(idx,errorString){
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:errorString},infoObj));
            });
        }
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    }
}

/**
* Return false if is there is no severity alert that decides color
*/
function getNodeColor(obj) {
    obj = ifNull(obj,{});
    //Check if there is any nodeAlert and if yes,get the highest severity alert
    var nodeAlertSeverity = -1,processLevelSeverity = -1;
    if(obj['nodeAlerts'].length > 0) {
        nodeAlertSeverity = obj['nodeAlerts'][0]['sevLevel'];
    }
    //Check if any process Alerts
    if(obj['processAlerts'].length > 0) {
        processLevelSeverity = obj['processAlerts'][0]['sevLevel'];
    }
    if(nodeAlertSeverity == sevLevels['ERROR'] || processLevelSeverity == sevLevels['ERROR'])
        return d3Colors['red'];
    if(nodeAlertSeverity == sevLevels['WARNING'] || processLevelSeverity == sevLevels['WARNING']) 
        return d3Colors['orange'];
    return false;
}

function getvRouterColor(d,obj) {
    var nodeColor = getNodeColor(obj);
    if(nodeColor != false)
        return nodeColor;
    obj = ifNull(obj,{});
    var instCnt = obj['instCnt'];
    if(instCnt == 0)
        return d3Colors['blue'];
    else if(instCnt > 0)
        return d3Colors['green'];
}

function getControlNodeColor(d,obj) {
    obj= ifNull(obj,{});
    var nodeColor = getNodeColor(obj);
    if(nodeColor != false)
        return nodeColor;
    //If connected to atleast one XMPP Peer
    if(obj['totalXMPPPeerCnt'] - obj['downXMPPPeerCnt'] > 0)
        return d3Colors['green'];
    else if(obj['downBgpPeerCnt'] == 0 && obj['downXMPPPeerCnt'] == 0)
        return d3Colors['blue'];    //Default color
}

function getAanalyticNodeColor(d,obj) {
    obj= ifNull(obj,{});
    var nodeColor = getNodeColor(obj);
    if(nodeColor != false)
        return nodeColor;
    return d3Colors['blue'];
}
    
function getConfigNodeColor(d,obj) {
    obj= ifNull(obj,{});
    var nodeColor = getNodeColor(obj);
    if(nodeColor != false)
        return nodeColor;
    return d3Colors['blue'];
}

var infraMonitorUtils = {
    /**
     * Parses vRouter UVE data
     */
    parsevRoutersDashboardData : function(result,isSummaryPage) {
        var retArr = [];
        var vRouterCnt = result.length;
        
        for(var i=0;i<vRouterCnt;i++) {
            var obj = {};
            var d = result[i];
            obj['raw_json'] = result[i];
            var dValue = result[i]['value'];
            obj['x'] = parseFloat(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;cpu_share','--'));
            obj['y'] = parseInt(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo;virt','--'))/1024; //Convert to MB
            obj['cpu'] = parseFloat(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;cpu_share','--'));
            obj['ip'] = getValueByJsonPath(dValue,'VrouterAgent;control_ip','-');
            obj['uveIP'] = obj['ip'];
            obj['summaryIps'] = getVrouterIpAddresses(dValue,"summary");
            var iplist = getValueByJsonPath(dValue,'VrouterAgent;self_ip_list',[]);
            if(obj['ip'] != '-')
                iplist.push(obj['ip']);
            obj['uveIP'] = iplist;
            obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(dValue,'ConfigData')) ? true : false;
            obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(dValue,'VrouterAgent')) && $.isEmptyObject(getValueByJsonPath(dValue,'VrouterStatsAgent'))) ? true : false;
            obj['configIP'] = getValueByJsonPath(dValue,'ConfigData;virtual-router;virtual_router_ip_address','-');
            if(obj['ip'] == '-') {
                obj['ip'] = obj['configIP'];
            }
            obj['histCpuArr'] = parseUveHistoricalValues(dValue,'','VrouterStatsAgent;cpu_share;0;history-10');
            
            obj['status'] = getOverallNodeStatus(d,'compute');
            var processes = ['contrail-vrouter-agent','contrail-vrouter-nodemgr','supervisor-vrouter'];
            obj['memory'] = formatMemory(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo','--'));
            obj['virtMemory'] = getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo;virt','--');
            obj['size'] = getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;out_bandwidth_usage',0) + 
                getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;in_bandwidth_usage',0) + 1;
            obj['shape'] = 'circle';
            var xmppPeers = getValueByJsonPath(dValue,'VrouterAgent;xmpp_peer_list',[]);
            obj['xmppPeerDownCnt'] = 0;
            $.each(xmppPeers,function(idx,currPeer) {
                if(currPeer['status'] != true) {
                    obj['xmppPeerDownCnt']++;
                }
            });
            obj['name'] = d['name'];
            obj['link'] = {p:'mon_infra_vrouter',q:{node:obj['name'],tab:''}};
            obj['instCnt'] = getValueByJsonPath(dValue,'VrouterAgent;virtual_machine_list',[]).length;
            obj['intfCnt'] = getValueByJsonPath(dValue,'VrouterAgent;total_interface_count',0);
            
            obj['vns'] = getValueByJsonPath(dValue,'VrouterAgent;connected_networks',[]);
            obj['vnCnt'] = obj['vns'].length;
            obj['version'] = ifNullOrEmpty(getNodeVersion(getValueByJsonPath(dValue,'VrouterAgent;build_info')),noDataStr);
            //System CPU
            //obj['cpu'] = parseFloat(jsonPath(dValue,'$..CpuLoadInfo.CpuLoadAvg.one_min_avg')[0]);
            obj['type'] = 'vRouter';
            obj['display_type'] = 'vRouter';
            obj['isPartialUveMissing'] = false;
            obj['errorIntfCnt'] = 0;
            if(obj['isUveMissing'] == false) {
                var xmppPeers = getValueByJsonPath(dValue,'VrouterAgent;xmpp_peer_list',[]);
                obj['xmppPeerDownCnt'] = 0;
                $.each(xmppPeers,function(idx,currPeer) {
                    if(currPeer['status'] != true) {
                        obj['xmppPeerDownCnt']++;
                    }
                });
                obj['isPartialUveMissing'] = $.isEmptyObject(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info')) || 
                    $.isEmptyObject(getValueByJsonPath(dValue,'VrouterAgent;build_info')) ||
                    obj['uveIP'].length == 0 ? true : false;
                obj['errorIntfCnt'] = getValueByJsonPath(dValue,'VrouterAgent;down_interface_count',0);
            }
            if(obj['errorIntfCnt'] > 0){
                obj['errorIntfCntText'] = "</br> <span class='text-error'>" + obj['errorIntfCnt'] + " Down</span>";
            } else {
                obj['errorIntfCntText'] = "";
            } 
            obj['uveCfgIPMisMatch'] = false;
            if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false && obj['isPartialUveMissing'] == false) {
                obj['uveCfgIPMisMatch'] = (obj['uveIP'].indexOf(obj['configIP']) == -1 && obj['configIP'] != '-') ? true : false;
            }
            obj['processAlerts']= infraMonitorAlertUtils.getProcessAlerts(d,obj,'NodeStatus;process_info');
            obj['isGeneratorRetrieved'] = false;
            obj['nodeAlerts'] = infraMonitorAlertUtils.processvRouterAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(dashboardUtils.sortInfraAlerts);
            //Decide color based on parameters
            obj['color'] = getvRouterColor(d,obj);
            retArr.push(obj);
        }
        retArr.sort(dashboardUtils.sortNodesByColor);
        return retArr;
    },
    /**
     * Parses bgp-router UVE data
     */
    parseControlNodesDashboardData : function(result) {
        var retArr = [];
        $.each(result,function(idx,d) {
            var obj = {};
            obj['raw_json'] = d;
            obj['x'] = parseFloat(jsonPath(d,'$..cpu_info.cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..meminfo.virt')[0])/1024; //Convert to MB
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..cpu_share[*].history-10');
            obj['uveIP'] = ifNull(jsonPath(d,'$..bgp_router_ip_list')[0],[]);
            obj['configIP'] = ifNull(jsonPath(d,'$..ConfigData..bgp_router_parameters.address')[0],'-');
            obj['isConfigMissing'] = $.isEmptyObject(jsonPath(d,'$..ConfigData')[0]) ? true : false;
            obj['configuredBgpPeerCnt'] = ifNull(jsonPath(d,'$.value.ConfigData.bgp-router.bgp_router_refs')[0],[]).length;
            obj['isUveMissing'] = $.isEmptyObject(jsonPath(d,'$..BgpRouterState')[0]) ? true : false;
            obj['ip'] = ifNull(jsonPath(d,'$..bgp_router_ip_list[0]')[0],'-');
            //If iplist is empty will display the config ip 
            if(obj['ip'] == '-') {
                obj['ip'] = obj['configIP'];
            }
            obj['summaryIps'] = getControlIpAddresses(d,"summary");
            obj['memory'] = formatMemory(ifNull(jsonPath(d,'$..meminfo')[0]),'-');
            obj['size'] = ifNull(jsonPath(d,'$..output_queue_depth')[0],0)+1; 
            obj['shape'] = 'circle';
            obj['name'] = d['name'];
            obj['link'] = {p:'mon_infra_control',q:{node:obj['name'],tab:''}};
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.BgpRouterState.build_info')[0]),'-');
            obj['totalPeerCount'] = ifNull(jsonPath(d,'$..num_bgp_peer')[0],0) + ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
            //Assign totalBgpPeerCnt as false if it doesn't exist in UVE
            obj['totalBgpPeerCnt'] = ifNull(jsonPath(d,'$..num_bgp_peer')[0],null);
            obj['upBgpPeerCnt'] = ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],null);
            obj['establishedPeerCount'] = ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],0);
            obj['activevRouterCount'] = ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
            obj['upXMPPPeerCnt'] = ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
            obj['totalXMPPPeerCnt'] = ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
            if(obj['totalXMPPPeerCnt'] > 0){
                obj['downXMPPPeerCnt'] = obj['totalXMPPPeerCnt'] - obj['upXMPPPeerCnt'];
            } else {
                obj['downXMPPPeerCnt'] = 0;
            }
            obj['downBgpPeerCnt'] = 0;
            if(typeof(obj['totalBgpPeerCnt']) == "number" && typeof(obj['upBgpPeerCnt']) == "number"  && obj['totalBgpPeerCnt'] > 0) {
            	obj['downBgpPeerCnt'] = obj['totalBgpPeerCnt'] - obj['upBgpPeerCnt'];
            } 
            if(obj['downXMPPPeerCnt'] > 0){
                obj['downXMPPPeerCntText'] = "</br> <span class='text-error'>" + obj['downXMPPPeerCnt'] + " Down</span>";
            } else {
                obj['downXMPPPeerCntText'] = "";
            }
            obj['isPartialUveMissing'] = false;
            obj['isIfmapDown'] = false;
            if(obj['isUveMissing'] == false) {
                obj['isPartialUveMissing'] = (isEmptyObject(jsonPath(d,'$.value.BgpRouterState.cpu_info')[0]) || 
                        isEmptyObject(jsonPath(d,'$.value.BgpRouterState.build_info')[0]) || 
                        (obj['configIP'] == '-') || obj['uveIP'].length == 0) ? true : false;
                var ifmapObj = jsonPath(d,'$.value.BgpRouterState.ifmap_info')[0];
                if(ifmapObj != undefined && ifmapObj['connection_status'] != 'Up'){
                    obj['isIfmapDown'] = true;
                    obj['ifmapDownAt'] = ifNull(ifmapObj['connection_status_change_at'],'-');
                }
            }
            if(obj['downBgpPeerCnt'] > 0){
                obj['downBgpPeerCntText'] = "</br> <span class='text-error'>" + obj['downBgpPeerCnt'] + " Down</span>";
            } else {
                obj['downBgpPeerCntText'] = "";
            }
            obj['uveCfgIPMisMatch'] = false;
            if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false && obj['isPartialUveMissing'] == false) {
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
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isGeneratorRetrieved'] = false;
            obj['nodeAlerts'] = infraMonitorAlertUtils.processControlNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(dashboardUtils.sortInfraAlerts);
            obj['color'] = getControlNodeColor(d,obj);
            retArr.push(obj);
        });
        retArr.sort(dashboardUtils.sortNodesByColor);
        return retArr;
    },
    /**
     * Parses collector UVE data
     */
    parseAnalyticNodesDashboardData : function(result) {
        var retArr = [];
        $.each(result,function(idx,d) {
            var obj = {};
            obj['raw_json'] = d;
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")]..meminfo.virt')[0])/1024;
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['memory'] = formatBytes(obj['y']*1024*1024);
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..collector_cpu_share[*].history-10');
            obj['pendingQueryCnt'] = ifNull(jsonPath(d,'$..QueryStats.queries_being_processed')[0],[]).length; 
            obj['pendingQueryCnt'] = ifNull(jsonPath(d,'$..QueryStats.pending_queries')[0],[]).length; 
            obj['size'] = obj['pendingQueryCnt'] + 1;
            obj['shape'] = 'circle';
            obj['type'] = 'analyticsNode';
            obj['display_type'] = 'Analytics Node';
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.CollectorState.build_info')[0]),'-');
            try{
                obj['status'] = getOverallNodeStatus(d,"analytics");
            }catch(e){
                obj['status'] = 'Down';
            }
          //get the ips
          var iplist = ifNull(jsonPath(d,'$..self_ip_list')[0],noDataStr); 
          obj['ip'] = obj['summaryIps'] = noDataStr;
          if(iplist != null && iplist != noDataStr && iplist.length > 0){
                obj['ip'] = iplist[0];
                var ipString = "";
                $.each(iplist, function (idx, ip){
                    if(idx+1 == iplist.length) {
                        ipString = ipString + ip;
                      } else {
                        ipString = ipString + ip + ', ';
                      }
                });
                obj['summaryIps'] = ipString;
          }
            obj['name'] = d['name'];
            obj['link'] = {p:'mon_infra_analytics',q:{node:obj['name'],tab:''}};
            obj['errorStrings'] = ifNull(jsonPath(d,"$.value.ModuleCpuState.error_strings")[0],[]);
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            if(isEmptyObject(jsonPath(d,'$.value.ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")].cpu_info')[0]) || isEmptyObject(jsonPath(d,'$.value.CollectorState.build_info')[0])) {
                obj['isPartialUveMissing'] = true;
            }
          //get the cpu for analytics node
            var cpuInfo = jsonPath(d,'$..ModuleCpuState.module_cpu_info')[0];
            obj['isGeneratorRetrieved'] = false;
            var genInfos = ifNull(jsonPath(d,'$.value.CollectorState.generator_infos')[0],[])
            obj['genCount'] = genInfos.length;
            obj['nodeAlerts'] = infraMonitorAlertUtils.processAnalyticsNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(dashboardUtils.sortInfraAlerts);
            obj['color'] = getAanalyticNodeColor(d,obj);
          retArr.push(obj);
        });
        retArr.sort(dashboardUtils.sortNodesByColor);
        return retArr;
    },
    /**
     * Parses config-node UVE data
     */
    parseConfigNodesDashboardData : function(result) {
        var retArr = [];
        $.each(result,function(idx,d) {
            var obj = {};
            obj['raw_json'] = d;
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")]..meminfo.virt')[0])/1024;
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['memory'] = formatBytes(obj['y']*1024*1024);
            //Re-visit once average response time added for config nodes
            obj['size'] = 1;
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.configNode.ModuleCpuState.build_info')[0]),'-');
            obj['shape'] = 'circle';
            obj['type'] = 'configNode';
            obj['display_type'] = 'Config Node';
            obj['name'] = d['name'];
            obj['link'] = {p:'mon_infra_config',q:{node:obj['name'],tab:''}};
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            try{
                obj['status'] = getOverallNodeStatus(d,"config");
            }catch(e){
                obj['status'] = 'Down';
            }
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..api_server_cpu_share[*].history-10');
            var iplist = jsonPath(d,'$..config_node_ip')[0];
             obj['ip'] = obj['summaryIps'] = noDataStr;
                if(iplist != null && iplist != noDataStr && iplist.length > 0){
                obj['ip'] = iplist[0];
                var ipString = "";
                $.each(iplist, function (idx, ip){
                    if(idx+1 == iplist.length) {
                        ipString = ipString + ip;
                       } else {
                        ipString = ipString + ip + ', ';
                       }
                });
                obj['summaryIps'] = ipString;
            }
            if(isEmptyObject(jsonPath(d,'$.value.configNode.ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")].cpu_info')[0]) || 
                    isEmptyObject(jsonPath(d,'$.value.configNode.ModuleCpuState.build_info')[0])) {
                obj['isPartialUveMissing'] = true;
            }
            obj['isGeneratorRetrieved'] = false;
            obj['nodeAlerts'] = infraMonitorAlertUtils.processConfigNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(dashboardUtils.sortInfraAlerts);
            obj['color'] = getConfigNodeColor(d,obj);
            retArr.push(obj);
        });
        retArr.sort(dashboardUtils.sortNodesByColor);
        return retArr;
    },
    parseGeneratorsData : function(result){
        var retArr = [];
        if(result != null && result[0] != null){
            result = result[0].value;
        } else {
            result = [];
        }
        $.each(result,function(idx,d){
            var obj = {};
            obj['status'] = getOverallNodeStatusFromGenerators(d);
            obj['name'] = d['name'];
            retArr.push(obj);
        });
        return retArr;
    },
    isProcessStateMissing: function(dataItem) {
        var noProcessStateAlert = $.grep(dataItem['processAlerts'],function(obj,idx) {
            return obj['msg'] == infraAlertMsgs['PROCESS_STATES_MISSING'];
        });
        if(noProcessStateAlert.length > 0)
            return true;
        return false;
    },
    clearTimers : function () {
        $.each(consoleTimer, function (idx, value) {
            logMessage("clearing timer:", value);
            clearTimeout(value)
        });
        consoleTimer = [];
    },
    populateMessagesTab : function (nodeType, options, obj) {
        var consoleTabTemplate = Handlebars.compile($('#console-tab-template').html());
        var cboMsgType, cboMsgCategory, cboMsgLevel, cboTimeRange;
        var lastMsgLogTime, lastLogLevel, userChangedQuery = false, defaultTimeRange = 5 * 60;//5 mins by default
        layoutHandler.setURLHashParams({tab:'console', node: obj['name']},{triggerHashChange:false});
        if (nodeType == 'control') {
            $('#ctrlNodeMessagesTab').html(consoleTabTemplate({}));
        } else if (nodeType == "analytics"){
            $('#analyticsNodeMessagesTab').html(consoleTabTemplate({}));
        } else if (nodeType == "config"){
            $('#configNodeMessagesTab').html(consoleTabTemplate({}));
        } else {
            $('#computeNodeMessagesTab').html(consoleTabTemplate({}));
        }
        initWidget4Id('#console-msgs-box');
        //Disable Auto-refresh for time-being
        //$('#msgAutoRefresh').attr('disabled','disabled');

        var MIN = 60, HOUR = MIN * 60;
        if ($('#msgTimeRange').data('contrailDropdown') == null) {
            $('#msgAutoRefresh').attr('checked', 'checked');
            $('#msgAutoRefresh').on('click', function () {
                if ($(this).is(':checked')) {
                    if (userChangedQuery)
                        loadLogs();
                    else 
                        fetchLastLogtimeAndCallLoadLogs('',nodeType);
                } else {
                    infraMonitorUtils.clearTimers();
                }
            });
            $('#msgTimeRange').contrailDropdown({
                data:[
                    {lbl:'Last 5 mins', value:'5m'},
                    {lbl:'Last 10 mins', value:'10m'},
                    {lbl:'Last 30 mins', value:'30m'},
                    {lbl:'Last 1 hr', value:'1h'},
                    {lbl:'Last 2 hrs', value:'2h'},
                    {lbl:'Last 4 hrs', value:'4h'},
                    {lbl:'Last 6 hrs', value:'6h'},
                    {lbl:'Last 10 hrs', value:'10h'},
                    {lbl:'Last 12 hrs', value:'12h'},
                    {lbl:'Last 18 hrs', value:'18h'},
                    {lbl:'Last 24 hrs', value:'24h'},
                    {lbl:'Custom', value:'custom'}
                ],
                dataTextField:'lbl',
                dataValueField:'value',
                change:selectTimeRange
            });
            $("#console-from-time").contrailDateTimePicker({
               // format:"MMM dd, yyyy hh:mm:ss tt",
                format: 'M d, Y h:i:s A',
//                min:new Date(2013, 2, 1),
//                value:new Date(),
//                timeFormat:"hh:mm:ss tt",
//                interval:10
            });
            $("#console-to-time").contrailDateTimePicker({
               // format:"MMM dd, yyyy hh:mm:ss tt",
                format:"MMM dd, yyyy hh:mm:ss tt",
//                min:new Date(2013, 2, 1),
//                value: new Date(),
//                timeFormat:"hh:mm:ss tt",
//                interval:10
            });
            $('#msgType').contrailCombobox({
                dataSource:[],
                placeholder:'Any'
            });
            $('#msgCategory').contrailDropdown({
                dataSource:{
                    type:'remote',
                    url: '/api/admin/table/values/MessageTable/Category',
                    parse:function (response) {
                        if (nodeType == 'control')
                            return ifNull(response['ControlNode'], []);
                        else if (nodeType == 'compute')
                            return ifNull(response['VRouterAgent'], []);
                        else if (nodeType == 'analytics')
                            return ifNull(response['Collector'], []);
                        else if (nodeType == 'config')
                            return ifNull(response['ApiServer'], []);
                    }
                },
                placeholder:'All'
            });
            $('#msgLevel').contrailDropdown({
                dataSource:{
                    type:'remote',
                    url: '/api/admin/table/values/MessageTable/Level',
                    parse:function (response) {
                        var retArr = [];
                        $.map(response, function (value) {
                            $.each(value, function (key, value) {
                                retArr.push({text:value, value:key});
                            });
                        });
                        return retArr;
                    }
                },
                dataTextField:'text',
                dataValueField:'value'
            });
            $('#msgLimit').contrailDropdown({
                data:$.map(['All',10, 50, 100, 200, 500], function (value) {
                    return {value:value, text:(value == 'All')? 'All':contrail.format('{0} messages', value)};
                }),
                dataTextField:'text',
                dataValueField:'value'                    
            });
        }
        cboTimeRange = $('#msgTimeRange').data('contrailDropdown');
        cboMsgCategory = $('#msgCategory').data('contrailDropdown');
        cboMsgType = $('#msgType').data('contrailCombobox');
        cboMsgLevel = $('#msgLevel').data('contrailDropdown');
        cboMsgLimit = $('#msgLimit').data('contrailDropdown');
        cboMsgFromTime = $('#console-from-time').data('contrailDateTimePicker');
        cboMsgToTime = $('#console-to-time').data('contrailDateTimePicker');
        toTimeEle = $('#console-to-time');
        fromTimeEle = $('#console-from-time');

        cboTimeRange.value('custom');
        cboMsgLevel.value('5');
        cboMsgLimit.value('50')
        
        $('#btnDisplayLogs').on('click', function () {
            userChangedQuery = true;
            loadLogs();
        });

        //var gridConsole;
        //To show the latest records
        function moveToLastPage(e) {
            //Process only if grid is visible
            //console.info('console grid dataBound',gridConsole.dataSource._total,gridConsole.dataSource._page);
            //console.info('console grid dataBound',e.response.length,gridConsole.dataSource._page);
            //if($(gridConsole.element).is(':visible')) {
            //console.info('console grid visible',$(gridConsole.element).is(':visible'));
//            if (e.response == null)
//                return;
            var hashParams = layoutHandler.getURLHashParams();
            if (hashParams['tab'] != null && hashParams['tab'] == 'console') {
               /* var totalCnt = e.response.length, pageSize = gridConsole.dataSource._pageSize;
                if (totalCnt > 0) {
                    var lastPageNo = Math.ceil(totalCnt / pageSize);
                    setTimeout(function () {
                        selectGridPage(lastPageNo);
                    }, 100);
                }*/
                if ($('#msgAutoRefresh').is(':checked')) {
                    //Don't start the timer,if one is already pending
                    if (consoleTimer.length == 0) {
                        var timerId = setTimeout(function () {
                            if(userChangedQuery)
                                loadLogs(timerId);
                            else 
                                fetchLastLogtimeAndCallLoadLogs(timerId,nodeType);
                        }, CONSOLE_LOGS_REFRESH_INTERVAL);
                        logMessage("Setting timer:", timerId);
                        consoleTimer.push(timerId);
                    }
                }
            }
        }
        function selectGridPage(lastPageNo) {
            gridConsole.dataSource.page(lastPageNo);
            gridConsole.content.scrollTop(gridConsole.tbody.height());
        }
        function fetchLastLogtimeAndCallLoadLogs(timerId,nodeType){
        	var type,moduleType="",kfilt="";
        	var hostName = obj['name'];
        	if(nodeType == 'compute'){
        		type = 'vrouter';
        		kfilt = hostName+":*:VRouterAgent:*";
        	} else if (nodeType == 'control'){
        		type = 'controlnode';
        		kfilt = hostName+":*:ControlNode:*";
        	} else if (nodeType == 'analytics'){
        		type = 'Collector';
        		kfilt = hostName+":*:Collector:*,"+
        		        hostName+":*:OpServer:*";
        	} else if (nodeType == 'config'){
        		type = 'confignode';
        		kfilt = hostName+":*:ApiServer*,"+
	                    hostName+":*:DiscoveryService:*,"+
    	                hostName+":*:ServiceMonitor:*,"+
    	                hostName+":*:Schema:*";
        	}
        	var postData = getPostData("generator","","","ModuleServerState:msg_stats",kfilt);
        	$.ajax({
                url:TENANT_API_URL,
                type:'post',
                data:postData,
                dataType:'json'
            }).done(function (result) {
                var logLevelStats = [], lastLog, lastTimeStamp,allStats = [];
                try{
                    allStats =  ifNullOrEmptyObject(jsonPath(result,"$..log_level_stats"),[]);
                }catch(e){}
                if(allStats instanceof Array){
                    for(var i = 0; i < allStats.length;i++){
                        if(!($.isEmptyObject(allStats[i]))){
                            if( allStats[i] instanceof Array){
                                logLevelStats = logLevelStats.concat(allStats[i]);
                            } else {
                                logLevelStats.push(allStats[i]);
                            }
                        }
                    }
                }
                if(logLevelStats != null){
                    lastLog = getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
                    if(lastLog != null){
                        lastTimeStamp = parseInt(lastLog.last_msg_timestamp)/1000 + 1000;
                        lastLogLevel = lastLog.level;
                    }
                }
                if(lastTimeStamp == null || lastMsgLogTime != lastTimeStamp){
                    lastMsgLogTime = lastTimeStamp;
                    if(lastMsgLogTime != null && lastLogLevel != null){
                        var dateTimePicker = $("#console-to-time").data("contrailDateTimePicker");
                        dateTimePicker.val(new Date(lastMsgLogTime));
                        dateTimePicker = $("#console-from-time").data("contrailDateTimePicker");
                        //dateTimePicker.val(adjustDate(new Date(lastMsgLogTime), {sec:-1 * defaultTimeRange}));
                        dateTimePicker.val(moment(new Date(lastMsgLogTime)).subtract('s', defaultTimeRange));
                        //select the level option which has the last log
                        //$("#msgLevel option:contains(" + lastLogLevel + ")").attr('selected', 'selected');
                        var dropdownlist = $("#msgLevel").data("contrailDropdown");
                        dropdownlist.text(lastLogLevel);
                        cboTimeRange.value('custom');
                        selectTimeRange({val:"custom"}) ;
                    } else {
                        var timerangedropdownlistvalue = $("#msgTimeRange").data("contrailDropdown");
                        timerangedropdownlistvalue.value('5m');

                        $('#consoleFromTimeDiv').hide();
                        $('#consoleToTimeDiv').hide();
                        $('#msgFromTime').hide();
                        $('#msgToTime').hide();
                        selectTimeRange({val:"5m"}) ;
                    }
                    loadLogs(timerId,true);
//TODO : see if this is required                    gridConsole.dataSource.unbind('requestEnd');
//                    gridConsole.dataSource.bind('requestEnd', moveToLastPage);
                   moveToLastPage();
                }
            }).fail(displayAjaxError.bind(null, $('#computenode-dashboard')));
        }
        function selectTimeRange(obj) {
            if (obj.val == 'custom') {
                $('#consoleFromTimeDiv').show();
                $('#consoleToTimeDiv').show();
                $('#msgFromTime').show();
                $('#msgToTime').show();
            } else {
                $('#consoleFromTimeDiv').hide();
                $('#consoleToTimeDiv').hide();
                $('#msgFromTime').hide();
                $('#msgToTime').hide();
            }
        }
        function loadLogs(timerId) {
            logMessage("Timer triggered:", timerId);
            if ((timerId != null) && (timerId != '') && $.inArray(timerId, consoleTimer) == -1) {
                logMessage("Timer cancelled:", timerId);
                return;
            } else if (timerId != null && ($.inArray(timerId, consoleTimer) != -1)) {
                //Remove timerId from self.consoleTimer (pending timers)
                consoleTimer.splice($.inArray(timerId, consoleTimer), 1);
            }
            var timerangedropdownlistvalue = $("#msgTimeRange").data("contrailDropdown").value();
             
            var filterObj = {
                table:'MessageTable',
                source:options['source']
                //messageType:'any'
            };
            if (nodeType == 'control') {
                filterObj['moduleId'] = 'ControlNode';
            } else if (nodeType == 'compute') {
                filterObj['moduleId'] = 'VRouterAgent';
            } else if (nodeType == 'config') {
                filterObj['where'] = '(ModuleId=Schema AND Source='+obj['name']+') OR (ModuleId=ApiServer AND Source='+obj['name']+') OR (ModuleId=ServiceMonitor AND Source='+obj['name']+') OR (ModuleId=DiscoveryService AND Source='+obj['name']+')';
            } else if (nodeType == 'analytics') {
                filterObj['where'] = '(ModuleId=OpServer AND Source='+obj['name']+') OR (ModuleId=Collector AND Source='+obj['name']+')';
            }

            if (cboMsgCategory.value() != '') {
                filterObj['category'] = cboMsgCategory.value();
            }
            if ((cboMsgLevel.value() != null) && (cboMsgLevel.value() != '')) {
                filterObj['level'] = cboMsgLevel.value();
            } else
                filterObj['level'] = 5;
            if (cboMsgType.value() != '')
                filterObj['messageType'] = cboMsgType.value();
            if (cboMsgLimit.value() != '' && cboMsgLimit != 'All')
                filterObj['limit'] = cboMsgLimit.value();
         /*   if(!userChangedQuery){
                filterObj['toTimeUTC'] = lastMsgLogTime;
                filterObj['fromTimeUTC'] = adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * defaultTimeRange}).getTime();
            }
            else {
                filterObj['toTimeUTC'] = (new Date()).getTime();
                filterObj['fromTimeUTC'] = adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * cboTimeRange.value()}).getTime();
            }
          */
            if(timerangedropdownlistvalue === 'custom'){
                filterObj['toTimeUTC'] = new Date(toTimeEle.val()).getTime();
                filterObj['fromTimeUTC'] = new Date(fromTimeEle.val()).getTime();
            } else {
            	filterObj['toTimeUTC'] = "now";
            	filterObj['fromTimeUTC'] = "now-"+ cboTimeRange.value();//adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * cboTimeRange.value()}).getTime();
            }
            loadSLResults({elementId:'gridConsole', btnId:'btnDisplayLogs', timeOut:60000,
                pageSize:20, //gridHeight:500,
                reqFields:['MessageTS', 'Category','Messagetype', 'Xmlmessage']}, filterObj);
            gridConsole = $('#gridConsole').data('contrailGrid');
            //Take to the last page and scroll to bottom
            //gridConsole.bind('dataBound',function() {
            //gridConsole.bind('dataBinding',function() {
            //gridConsole.bind('dataBound',moveToLastPage);
        };
        //$('#btnDisplayLogs').trigger('click');
        if(userChangedQuery){
            loadLogs();
//            TODO : see if this is required. 
//            gridConsole.dataSource.unbind('requestEnd');
//            gridConsole.dataSource.bind('requestEnd', moveToLastPage);
            
            moveToLastPage();
        }
        else {
            fetchLastLogtimeAndCallLoadLogs('',nodeType);
        }
        
        $('#btnResetLogs').on('click', function () {
            cboTimeRange.value('5m');
            selectTimeRange({val:"5m"});
            cboMsgType.value('');
            cboMsgLimit.value('10');
            cboMsgCategory.value('');
            cboMsgLevel.value('5');
            loadLogs();
        });
    }
}

function getCores(data) {
    var fileList=[],result=[];
    var fileArrList=ifNull(jsonPath(data,'$..NodeStatus.process_info[*].core_file_list'),[]);
    for(var i=0;i<fileArrList.length;i++){
        var files=fileArrList[i];
       for(var j=0;j<files.length;j++)
            fileList.push(files[j])}
    if(fileList.length==1){
        result.push({lbl:'Core File',value:fileList[0]});
    }else if(fileList.length>1){
        result.push({lbl:'Cores Files',value:fileList[0]});
        for(var i=1;i<fileList.length;i++)
            result.push({lbl:'',value:fileList[i]});}
    return result;
}

function getIPOrHostName(obj) {
    return (obj['ip'] == noDataStr) ? obj['name'] : obj['ip'];
}

function formatProtcolRange(rangeStr) {
    if (rangeStr == "0 - 255")
        return "any";
    else
        return rangeStr;
}

function formatPortRange(rangeStr) {
    if (rangeStr == null || rangeStr == "undefined - undefined" || rangeStr == "0 - 65535")
        return "any";
    else
        return rangeStr;
}

function formatPeerType(encoding, peer_type) {
    if (encoding == "XMPP") {
        return "vRouter";
    } else if ((peer_type == "internal") && (encoding == "BGP")) {
        return 'Control Node'
    } else if ((peer_type == "external") && (encoding == "BGP")) {
        return 'BGP Peer'
    }
}

function floatingIPCellTemplate(fip) {
    var fipArray = [];
    if(!(fip instanceof Array)){
        if($.isEmptyObject(fip))
            fip = [];
        else 
            fip = [fip];
    }
    $.each(fip, function (idx, obj) {
        fipArray.push(obj['ip_addr']);
    });
    if (fipArray.length == 0)
        return 'None';
    else
        return fipArray.join(', ');
}

function showObjLog(objId, type){
    var defaultTimeRange = 1800;//30mins
    if(type == 'vRouter' || type =='XMPP_peer' || type == 'BGP_peer' || type == 'vn'){
        var objWindowTemplate = contrail.getTemplate4Id('objectLog-window-template');
        if ($('body').find('#objLogWindow').length > 0){
            //already initialized do nothing
        } else {
            $('body').append("<div id='objLogWindow' class='modal modal-980 hide' tabindex='-1'></div>");
            $('#objLogWindow').append(objWindowTemplate);
        }
        bgpwindow = $("#objLogWindow");
        bgpwindow.on("hide", closeObjectLogWindow);
        bgpwindow.modal({backdrop:'static', keyboard: false, show:false});
        $("btnObjLogWindowCancel").click(function (a) {
            bgpwindow.hide();
        });
        runOTQueryForObjLogs(objId, defaultTimeRange, type);
        bgpwindow.modal('show');
    }
};

function closeObjectLogWindow() {
    //clearValuesFromDomElements();
}

function showStatus(ip, action){
    if(CONTRAIL_STATUS_USER["ip_"+ip] == null || CONTRAIL_STATUS_PWD["ip_"+ip] == null){
        showLoginWindow(ip, action);
    }else {
        if(action === 'log') {
            showLogDirWindow(CONTRAIL_STATUS_USER["ip_"+ip], CONTRAIL_STATUS_PWD["ip_"+ip], ip);
        } else {
            populateStatus(CONTRAIL_STATUS_USER["ip_"+ip], CONTRAIL_STATUS_PWD["ip_"+ip], ip);
        }
    }
}

function showLogs(ip) {
    showStatus(ip, 'log');
}

function showLoginWindow(ip, action){
    var username;
    var password;
    /*if ($('body').find('loginWindow')){
        //already initialized do nothing
    } else {
        $('body').append($("#loginWindow"));
    }*/
    var loginWindowTemplate = contrail.getTemplate4Id('login-window-template');
    if ($('body').find('#loginWindow').length > 0){
        //already initialized do nothing
    } else {
        $('body').append("<div id='loginWindow' class='modal modal-520 hide' tabindex='-1'></div>");
        $('#loginWindow').append(loginWindowTemplate);
    }
    
    loginWindow = $("#loginWindow");
    loginWindow.on("hide", closeObjectLogWindow);
    loginWindow.modal({backdrop:'static', keyboard: false, show:false});
    $("#btnLoginWindowCancel").unbind('click');
    $("#btnLoginWindowCancel").click(function (a) {
        $('#divLoginError').html("");
        loginWindow.hide();
    });
    $("#btnLoginWindowLogin").unbind('click');
    $("#btnLoginWindowLogin").click(function (a) {
        username = $('#txtLoginUserName').val();
        password = $('#txtLoginPassword').val();
        $('#divLoginError').html("");
        if(username == "" || password == ""){
            $('#divLoginError').html("Username and password cannot be empty");
            showLoginWindow(ip);
        } else {
            if(action === 'log') {
                showLogDirWindow(username, password, ip, loginWindow);
            }else { 
                populateStatus(username, password, ip, loginWindow);
            }
        }
        //loginWindow.hide();
    });
    loginWindow.modal('show');
};

function populateStatus(usrName,pwd,ip,loginWindow) {
    startWidgetLoading('dashboard');
    $('#divBasic').hide();
    $('#divAdvanced').hide();
    $('#divStatus').show();
    var postData = {"username":usrName,"password":pwd};
    $.ajax({
        url:'/api/service/networking/device-status/' + ip,
        type:'post',
        data:postData
    }).done(function(response) {
        endWidgetLoading('dashboard');
        CONTRAIL_STATUS_USER["ip_"+ip] = usrName;
        CONTRAIL_STATUS_PWD["ip_"+ip] = pwd;
        if(loginWindow != null){
            loginWindow.hide();
        }
        var htmlString = '<pre>' + response + '</pre>';
        $('#divContrailStatus').html(htmlString);
        $('#divBasic').hide();
        $('#divAdvanced').hide();
        $('#divStatus').show();
        $('#divAdvanced').parents('.widget-box').find('.widget-header h4 .subtitle').remove();
        $('#divAdvanced').parents('.widget-box').find('.widget-header h4').append('<span class="subtitle">(Status)</span>')
    }).fail(function(response) {
        endWidgetLoading('dashboard');
        if(response != null && response.responseText != null && response.responseText.search("Error: Authentication failure") != -1){
            $('#divLoginError').html("Invalid username or password");
            showLoginWindow(ip);
        } else {
            $('#divLoginError').html("Error fetching status");
            showLoginWindow(ip);
        }
    });
}

function showLogDirWindow(usrName, pwd, ip, loginWindow) {
    var postData = {"userName":usrName,"passWord":pwd,"hostIPAddress":ip};
    var fileNameArry = [];
    $.ajax({
        url:'/log-directory',
        type:'post',
        data:JSON.stringify(postData),
        contentType: "application/json"
    }).done(function(response) {
        CONTRAIL_STATUS_USER["ip_"+ip] = usrName;
        CONTRAIL_STATUS_PWD["ip_"+ip] = pwd;
        if(loginWindow != null) {
            loginWindow.hide();
        }
        if ($('body').find('#logDirWindow').length > 0) {
            //already initialized do nothing
        }else {
            var logDirTemplate = contrail.getTemplate4Id("logDirTemplate");
            var htmlString = '<ul style="list-style:none;padding:0;margin:0;"> <li><span class="pull-left" style="font-weight:bold">Directory Listing</span><span class="pull-right" style="font-weight:bold">Size</span></li><br><br>';
            var len = response.length;
            for(var i = 0; i < len; i++) {
                var res = response[i];
                var fileName = res.name;
                var fileSize = res.size;
                htmlString = htmlString + '<li > <a class="pull-left" href ="/download?userName='+ usrName +'&passWord='+pwd+'&hostIPAddress='+ip+'&file=' + fileName +'&size='+ fileSize +'" title="Click to download the file.">'+ fileName +' </a> <span class="pull-right">'+ fileSize +'</span></li><br>';
            }
            htmlString = htmlString + '</ul>';
            $('body').append(logDirTemplate);
            $('#logDirContext').append(htmlString);
        }   
        var logDirWindow = $("#logDirWindow");
        logDirWindow.modal('show');
    }).fail(function(response) {
        if(response != null && response.responseText != null && response.responseText.search("Authentication failure") != -1) {
            $('#divLoginError').html("Invalid username or password");
            showLoginWindow(ip, 'log');
        } else {
            $('#divLoginError').html("Error fetching logs");
            showLoginWindow(ip, 'log');
        }       
    });
}
/**
 * This function takes parsed nodeData from the infra parse functions and returns the status column text/html for the summary page grid
 */
function getNodeStatusContentForSummayPages(data,type){
    var obj = getNodeStatusForSummaryPages(data);
    if(obj['alerts'].length > 0) {
        if(type == 'html')
            return '<span title="'+obj['messages'].join(',&#10 ')+'" class=\"infra-nodesatus-text-ellipsis\">'+obj['messages'].join(',')+'</span>';
        else if(type == 'text')
            return obj['messages'].join(',');
    } else {
        if(type == 'html')
            return "<span> "+data['status']+"</span>";
        else if(type == 'text')
            return data['status'];
    }
}

function runOTQueryForObjLogs(objId, timeRange, type) {
    var currTime = new Date();
    var currTimeInSecs = currTime.getTime();
    var fromTimeInSecs = currTimeInSecs - timeRange*1000;

    var objectType;
    var objectId;
    //build the query string
    if(type == "vRouter") {
        objectType = "ObjectBgpRouter";
    } else if (type == "XMPP_peer") {
        objectType = "ObjectXmppPeerInfo";
    } else if (type == "BGP_peer") {
        objectType = "ObjectBgpPeer";
    } else if(type == "vn") {
        objectType = "ObjectVNTable";
    }
    var reqQueryString ="timeRange="+timeRange+
        "&objectType="+objectType+
        //"&objectId_input="+objId+
        "&objectId="+objId+
        "&select=ObjectLog" +
        "&where=" +
        "&fromTimeUTC=now-30"+
        "&toTimeUTC=now"+
        "&table=" +objectType+
        "&async=false";
    var    options = {
        elementId:'ot-results',gridWidth:600,gridHeight:340,
        timeOut:90000, pageSize:50,
        export:true, btnId:'ot-query-submit'
    };
    select = 'ObjectLog,SystemLog';
    loadOTResults(options, reqQueryString, parseStringToArray(select, ','));
};


function bucketizeData(data,fieldName) {
    var retObj = {},retArr=[];keys=[];
    $.each(data,function(idx,obj) {
        //Add key if it doesn't exist
        if($.inArray(obj[fieldName],keys) == -1)
            keys.push(obj[fieldName]);
        if(obj[fieldName] in retObj) {
            retObj[obj[fieldName]]++;
        } else {
            retObj[obj[fieldName]] = 1;
        }
    });
    var maxKey = d3.extent(keys);
    for(var i=maxKey[0];i<=maxKey[1];i++) {
        var value = 0;
        if(retObj[i] != null) {
            value = retObj[i];
            retArr.push({name:i,value:value});
        }
    }
    return retArr;
}

function getNodeVersion(buildStr) {
    var verStr = '';
    if(buildStr != null) {
        var buildInfo;
        try {
             buildInfo = JSON.parse(buildStr);
        } catch(e) {
        }
        if((buildInfo != null) && (buildInfo['build-info'] instanceof Array)) {
            var buildObj = buildInfo['build-info'][0];
            verStr = buildObj['build-version'] + ' (Build ' + buildObj['build-number'] + ')'
        }
    }
    return verStr;
}

function getNodeUpTime(d) {
    var upTimeStr = noDataStr;
    if(jsonPath(d,'$..start_time').length > 0) {
        var upTime = new XDate(jsonPath(d,'$..start_time')[0]/1000);
        var currTime = new XDate();
        upTimeStr = 'Up since ' + diffDates(upTime,currTime);
    } else if(jsonPath(d,'$..ModuleServerState..reset_time').length > 0){
        var resetTime = new XDate(jsonPath(d,'$..reset_time')[0]/1000);
        var currTime = new XDate();
        upTimeStr = 'Down since ' + diffDates(resetTime,currTime);
    } else {
        upTimeStr = "Down";
    }
    return upTimeStr;
}

function getProcessUpTime(d) {
    var upTimeStr = noDataStr;
    if(d != null && d.process_state != null && d.process_state.toUpperCase() == "PROCESS_STATE_RUNNING") {
        if(d.last_start_time != null){
            var upTime = new XDate(d.last_start_time/1000);
            var currTime = new XDate();
            upTimeStr = 'Up since ' + diffDates(upTime,currTime);
        }
    } else {
        var exitTime=0,stopTime=0;
        var currTime = new XDate();
        if(d.last_exit_time != null){
            exitTime = d.last_exit_time;
        }
        if(d.last_stop_time != null){
            stopTime = d.last_stop_time;
        }
        if(exitTime != 0 || stopTime != 0){
            if(exitTime > stopTime){
                exitTime = new XDate(exitTime/1000);
                upTimeStr = 'Down since ' + diffDates(exitTime,currTime);
            } else {
                stopTime = new XDate(stopTime/1000);
                upTimeStr = 'Down since ' + diffDates(stopTime,currTime);
            }
        } else {
            upTimeStr = "Down";
        }
    } 
    return upTimeStr;
}

/**
 * Claculates node status based on process_info & generators
 * ToDo: use getOverallNodeStatusFromGenerators 
 */
function getOverallNodeStatus(d,nodeType,processPath){
    var status = "--";
    var generatorDownTime;
    //For Analytics node if there are error strings in the UVE display it as Down
    if(nodeType != null && nodeType == 'analytics'){
        try{
            var errorStrings = jsonPath(d,"$..ModuleCpuState.error_strings")[0];
        }catch(e){}
        if(errorStrings && errorStrings.length > 0){
            return 'Down';
        }
    }
    var procStateList;
    if(processPath != null)
        procStateList = getValueByJsonPath(d,processPath);
    else
        procStateList = jsonPath(d,"$..NodeStatus.process_info")[0];
    if(procStateList != null && procStateList != undefined && procStateList != "") {
        status = getOverallNodeStatusFromProcessStateList(procStateList);
        //Check if any generator is down. This may happen if the process_info is not updated due to some reason
        if(status.search("Up") != -1){
            generatorDownTime = getMaxGeneratorDownTime(d);
            if(generatorDownTime != -1){
                try{
                    var resetTime = new XDate(generatorDownTime/1000);
                    var currTime = new XDate();
                    status = 'Down since ' + diffDates(resetTime,currTime);
                }catch(e){
                    status = 'Down';
                }
            }
        }
    } else {
        //For each process get the generator_info and fetch the gen_attr which is having the highest connect_time. This is because
        //we are interseted only in the collector this is connected to the latest. 
        //From this gen_attr see if the reset_time > connect_time. If yes then the process is down track it in down list. 
        //Else it is up and track in uplist.
        //If any of the process is down get the least reset_time from the down list and display the node as down. 
        //Else get the generator with max connect_time and show the status as Up.
        try{
            var genInfos = ifNull(jsonPath(d,"$..ModuleServerState..generator_info"),[]);
            if(!genInfos){
                return 'Down';
            }
            var upGenAttrs = [];
            var downGenAttrs = [];
            var isDown = false;
            $.each(genInfos,function(idx,genInfo){
                var genAttr = getMaxGeneratorValueInArray(genInfo,"connect_time");
                var connTime = jsonPath(genAttr,"$..connect_time")[0];
                var resetTime = jsonPath(genAttr,"$..reset_time")[0];
                if(resetTime > connTime){
                    isDown = true;
                    downGenAttrs.push(genAttr);
                } else {
                    upGenAttrs.push(genAttr);
                }
            });
            if(!isDown){
                var maxConnTimeGen = getMaxGeneratorValueInArray(upGenAttrs,"connect_time");
                var maxConnTime = jsonPath(maxConnTimeGen,"$..connect_time")[0];
                var connectTime = new XDate(maxConnTime/1000);
                var currTime = new XDate();
                status = 'Up since ' + diffDates(connectTime,currTime);
            } else {
                var minResetTimeGen = getMinGeneratorValueInArray(downGenAttrs,"reset_time");
                var minResetTime = jsonPath(minResetTimeGen,"$..reset_time")[0];
                var resetTime = new XDate(minResetTime/1000);
                var currTime = new XDate();
                status = 'Down since ' + diffDates(resetTime,currTime);
            }
        }catch(e){}
    }
    return status;
}

/**
 * Calculates node status only based on generators
 */
function getOverallNodeStatusFromGenerators(d){
    var status = "--";
    var generatorDownTime;
    
    
    //For each process get the generator_info and fetch the gen_attr which is having the highest connect_time. This is because
    //we are interseted only in the collector this is connected to the latest. 
    //From this gen_attr see if the reset_time > connect_time. If yes then the process is down track it in down list. 
    //Else it is up and track in uplist.
    //If any of the process is down get the least reset_time from the down list and display the node as down. 
    //Else get the generator with max connect_time and show the status as Up.
    try{
        var genInfos = ifNull(jsonPath(d,"$..ModuleServerState..generator_info"),[]);
        if(!genInfos){
            return 'Down';
        }
        var upGenAttrs = [];
        var downGenAttrs = [];
        var isDown = false;
        $.each(genInfos,function(idx,genInfo){
            var genAttr = getMaxGeneratorValueInArray(genInfo,"connect_time");
            var connTime = jsonPath(genAttr,"$..connect_time")[0];
            var resetTime = jsonPath(genAttr,"$..reset_time")[0];
            if(resetTime > connTime){
                isDown = true;
                downGenAttrs.push(genAttr);
            } else {
                upGenAttrs.push(genAttr);
            }
        });
        if(!isDown){
            var maxConnTimeGen = getMaxGeneratorValueInArray(upGenAttrs,"connect_time");
            var maxConnTime = jsonPath(maxConnTimeGen,"$..connect_time")[0];
            var connectTime = new XDate(maxConnTime/1000);
            var currTime = new XDate();
            status = 'Up since ' + diffDates(connectTime,currTime);
        } else {
            var minResetTimeGen = getMinGeneratorValueInArray(downGenAttrs,"reset_time");
            var minResetTime = jsonPath(minResetTimeGen,"$..reset_time")[0];
            var resetTime = new XDate(minResetTime/1000);
            var currTime = new XDate();
            status = 'Down since ' + diffDates(resetTime,currTime);
        }
    }catch(e){}
    
    return status;
}

/**
 * ToDo: can be merged with getOverallNodeStatus
 */
function getFinalNodeStatusFromGenerators(statusFromGen,dataItem){
    if(infraMonitorUtils.isProcessStateMissing(dataItem)) {
        return statusFromGen;
    }
    var statusFromProcessStateList = dataItem['status'];
    if(statusFromProcessStateList.search("Up") != -1){
        if(statusFromGen.search("Down") != -1){
            return statusFromGen;
        } else {
            return statusFromProcessStateList;
        }
    } else {
        return statusFromProcessStateList;
    }
}

function getOverallNodeStatusFromProcessStateList(d){
    var maxUpTime=0, maxDownTime=0, isAnyNodeDown=false, status = "";
    for(var i=0; i < d.length; i++){
        var currProc = d[i];
        //Exclude specific (node mgr,nova-compute for compute node) process alerts
        if(isProcessExcluded(currProc['process_name']))
            continue;
        if(currProc != null && currProc.process_state != null && currProc.process_state.toUpperCase() == "PROCESS_STATE_RUNNING"){
            if(currProc.last_start_time != null && currProc.last_start_time > maxUpTime){
                maxUpTime = currProc.last_start_time;
            }
        } else {
            if(currProc.last_exit_time != null || currProc.last_stop_time != null){
                isAnyNodeDown = true;
                var maxProcDownTime=0,exitTime=0,stopTime=0;
                if(currProc.last_exit_time != null){
                    exitTime = currProc.last_exit_time;
                }
                if(currProc.last_stop_time != null){
                    stopTime = currProc.last_stop_time;
                }
                maxProcDownTime = (exitTime > stopTime)?exitTime:stopTime;
                if(maxProcDownTime > maxDownTime){
                    maxDownTime = maxProcDownTime;
                }
            }
        }
    }
    if(!isAnyNodeDown && maxUpTime != 0){
        var upTime = new XDate(maxUpTime/1000);
        var currTime = new XDate();
        status = 'Up since ' + diffDates(upTime,currTime);
    } else if(maxDownTime != 0){
        var resetTime = new XDate(maxDownTime/1000);
        var currTime = new XDate();
        status = 'Down since ' + diffDates(resetTime,currTime);
    } else {
        status = 'Down';
    }
    return status;
}

//returns max reset time or -1 if none are down
function getMaxGeneratorDownTime(d){
    var genInfos = [];
    var genInfoList = [];
    var maxResetTime = -1;
    try{
        genInfoList = jsonPath(d,"$..ModuleServerState..generator_info");
        for(var i=0; i < genInfoList.length; i++){
            var currGenInfo = genInfoList[i];
            var maxConnectTimeGenerator = getMaxGeneratorValueInArray(currGenInfo,"connect_time");
            var maxConnectTimeOfProcess = jsonPath(maxConnectTimeGenerator,"$..connect_time")[0];
            var resetTimeOfMaxConnectTimeGenerator = jsonPath(maxConnectTimeGenerator,"$..reset_time")[0];
            if(resetTimeOfMaxConnectTimeGenerator > maxConnectTimeOfProcess){
                if(maxResetTime < resetTimeOfMaxConnectTimeGenerator){
                    maxResetTime = resetTimeOfMaxConnectTimeGenerator
                }
            }
        }
    }catch(e){}
    return maxResetTime;
}

function getVrouterIpAddresses(data,pageType) {
    var ips,controlIp;
    var configip = noDataStr;
    var ipString = "";
    var isConfigMismatch = true;
    try{
        controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
        ips = getValueByJsonPath(data,'VRouterAgent;self_ip_list',[]);
        configip = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address');
        if(controlIp != null && controlIp != noDataStr){
            ipString = controlIp;
        }
        if(configip == controlIp) {
            isConfigMismatch = false;
        }
        $.each(ips, function (idx, ip){
            if(ip == configip){
                isConfigMismatch = false;
            }
            if(ip != controlIp){
                ipString += ", " + ip;
                if(idx == 0){
                    ipString += "*";
                }
            } else {
                ipString += "*"
            }
        });
        if(configip != null && isConfigMismatch){
            if(ipString != ""){
                ipString += ","
            }
            if(pageType == "summary"){
                ipString = ipString +  configip ;
            } else if (pageType == "details"){
                ipString = ipString + "<span class='text-error' title='Config IP mismatch'> "+ configip +"</span>";
            }
        }
    } catch(e){}
    return ipString;
}

function getControlIpAddresses(data,pageType) {
    var ips;
    var configip = noDataStr;
    var ipString = "";
    var isConfigMismatch = true;
    try{
        ips = ifNull(jsonPath(data,'$..bgp_router_ip_list')[0],[]);
        configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
        $.each(ips, function (idx, ip){
            if(ip == configip){
                isConfigMismatch = false;
            }
            if(idx+1 == ips.length) {
                ipString = ipString + ip;
            } else {
                ipString = ipString + ip + ', ';
            }
        });
        if(configip != null && isConfigMismatch){
            if(ipString != ""){
                ipString += ","
            }
            if(pageType == "summary"){
                ipString = ipString +  configip ;
            } else if (pageType == "details"){
                ipString = ipString + "<span class='text-error' title='Config IP mismatch'> "+ configip +"</span>";
            }
        }
    } catch(e){}
    return ipString;
}

function summaryIpDisplay (ip,tooltip){
    return '<span title="'+ tooltip +'">' + ip + '</span>';
}


function parseUveHistoricalValues(d,path,histPath) {
    var histData; 
    if(histPath != null)
        histData = getValueByJsonPath(d,histPath,[]);
    else
        histData = ifNull(jsonPath(d,path)[0],[]);
    var histDataArr = [];
    $.each(histData,function(key,value) {
        histDataArr.push([JSON.parse(key)['ts'],value]);
    });
    histDataArr.sort(function(a,b) { return a[0] - b[0];});
    histDataArr = $.map(histDataArr,function(value,idx) {
        return value[1];
    });
    return histDataArr;
}

function getMaxGeneratorValueInArray(inputArray,selector) {
    var maxVal;
    if(inputArray != null && inputArray['length'] != null && inputArray['length'] > 0) {
        maxVal = inputArray[0];
        for(var i = 1; i < inputArray.length; i++){
            var curSelectorVal = jsonPath(inputArray[i],"$.."+selector)[0];
            var maxSelectorVal = jsonPath(maxVal,"$.."+selector)[0];
            if(curSelectorVal > maxSelectorVal){
                maxVal = inputArray[i];
            }
        }
        return maxVal;
    } else {
        return inputArray;
    }
}

function getMinGeneratorValueInArray(inputArray,selector) {
    var minVal;
    if(inputArray != null && inputArray['length'] != null && inputArray['length'] > 0) {
        minVal = inputArray[0];
        for(var i = 1; i < inputArray.length; i++){
            var curSelectorVal = jsonPath(inputArray[i],"$.."+selector)[0];
            var maxSelectorVal = jsonPath(minVal,"$.."+selector)[0];
            if(curSelectorVal < maxSelectorVal){
                minVal = inputArray[i];
            }
        }
        return minVal;
    } else {
        return inputArray;
    }
}

function getSecurityGroup(sg){
    var ret = "";
    sg = ifNullOrEmptyObject(sg,[]);
    for(var i=0; i < sg.length; i++){
        if(sg[i].search("security group") != -1) {
            if(ret == ""){
                ret = sg[i].split(":")[1];
            } else {
                ret = ret + ", " + sg[i].split(":")[1];
            }
        }
    }
    return ret;
}

function toggleDetails(divId){
    var div = $('#'+divId);
    var iconId = '#icon_' + divId;
    var iconClass = $(iconId).attr("class");
    if(iconClass == 'icon-expand-alt') {
        $(iconId).removeClass(iconClass).addClass('icon-collapse-alt');
    } else {
        $(iconId).removeClass(iconClass).addClass('icon-expand-alt');
    }
    $('#'+divId).toggle();
}

function getPostData(type,module,hostname,cfilt,kfilt){
    var cfiltObj = {};
    var postData;
    if(type != null && type != ""){
        cfiltObj["type"] = type;
    } else {
        return null;
    }
    if(module != null && module != ""){
        cfiltObj["module"] = module;
    }
    if(hostname != null && hostname != ""){
        cfiltObj["hostname"] = hostname;
    }
    if(cfilt != null && cfilt != ""){
        cfiltObj["cfilt"] = cfilt;
    }
    if(kfilt != null && kfilt != ""){
        cfiltObj["kfilt"] = kfilt;
    }
    postData = {data:[cfiltObj]};
    return postData;
}

function getSandeshPostData(ip,port,url){
    var postData;
    var obj = {};
    if(ip != null && ip != ""){
        obj["ip"] = ip;
    } else {
        return null;
    }
    if(port != null && port != ""){
        obj["port"] = port;
    }
    if(url != null && url != ""){
        obj["url"] = url;
    }
    postData = {data:obj};
    return postData;
}

function getLastLogTimestamp(d, nodeType){
    var logLevelStats = [], lastLog, lastTimeStamp;
    var procsList = [];
    if(nodeType != null){
        if(nodeType == "control"){
            procsList = controlProcsForLastTimeStamp;
        } else if (nodeType == "compute"){
            procsList = computeProcsForLastTimeStamp;
        } else if (nodeType =="analytics") {
            procsList = analyticsProcsForLastTimeStamp;
        } else if (nodeType =="config"){
            procsList = configProcsForLastTimeStamp;
        }
        $.each(procsList,function(idx,proc){
            logLevelStats = getAllLogLevelStats(d,proc,logLevelStats);
        });
    } else {
        logLevelStats = getAllLogLevelStats(d,"",logLevelStats);
    }
    
    if(logLevelStats != null){
        lastLog = getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
        if(lastLog != null){
            lastTimeStamp = lastLog.last_msg_timestamp;
        }
    }
    return lastTimeStamp;
}

function getAllLogLevelStats(d,proc,logLevelStats){
    var allStats = [],obj = {};
    for(var key in d){
        var label = key.toUpperCase();
        if(label.indexOf(proc.toUpperCase()) != -1){
            obj[key] = d[key];
        }
    }
    allStats =  ifNullOrEmptyObject(jsonPath(obj,"$..log_level_stats"),[]);
    if(allStats instanceof Array){
        for(var i = 0; i < allStats.length;i++){
            if(!($.isEmptyObject(allStats[i]))){
                if( allStats[i] instanceof Array){
                    logLevelStats = logLevelStats.concat(allStats[i]);
                } else {
                    logLevelStats.push(allStats[i]);
                }
            }
        }
    }
    return logLevelStats;
}

function getFormattedDate(timeStamp){
    if(!$.isNumeric(timeStamp))
        return '';
    else{
    var date=new Date(timeStamp),fmtDate="",mnth,hrs,mns,secs,dte;
    dte=date.getDate()+"";
    if(dte.length==1)
        dte="0"+dte;
    mnth=parseInt(date.getMonth()+1)+"";
    if(mnth.length==1)
        mnth="0"+mnth;
    hrs=parseInt(date.getHours())+"";
    if(hrs.length==1)
        hrs="0"+hrs;
    mns=date.getMinutes()+"";
    if(mns.length==1)
        mns="0"+mns;
    secs=date.getSeconds()+"";
    if(secs.length==1)
        secs="0"+secs;
    fmtDate=date.getFullYear()+"-"+mnth+"-"+dte+"  "+hrs+":"+mns+":"+secs;
    return fmtDate;}
}

//If current process is part of exclude process list,then return true; else return false
function isProcessExcluded(procName) {
    //Exclude specific (node mgr,nova-compute for compute node) process alerts
    var excludeProcessLen = excludeProcessList.length;
    for(var i=0;i<excludeProcessLen;i++) {
        if(procName.indexOf(excludeProcessList[i]) > -1)
            return true;
    }
    return false;
}
/**
 * Function returns the overall node status html of monitor infra node details page
 */
function getOverallNodeStatusForDetails(data){
    var statusObj = getNodeStatusForSummaryPages(data);
    var templateData = {result:statusObj['alerts'],showMore:true,defaultItems:1};
    return contrail.getTemplate4Id('overallNodeStatusTemplate')(templateData);
}

function getPostDataForReachableIpsCall(ips,port){
	var postData;
	var ipPortList = [];
	$.each(ips,function(idx,obj){
		ipPortList.push({ip:obj,port:port});
	});
	postData = {data:ipPortList};
	return postData;
}

function getReachableIp(ips,port,deferredObj){
	var res;
	if(ips != null && ips.length > 0){
		var postData = getPostDataForReachableIpsCall(ips,port);
		$.ajax({
	    	url:'/api/service/networking/get-network-reachable-ip',
	        type:'POST',
	        data:postData
	    }).done(function(result) {
	    	if(result != null && result['ip'] != null){
	    		res = result['ip'];
	    	} 
	    	deferredObj.resolve(res);
	    }).fail(function(result) {
	    	deferredObj.resolve(res);
	    });
	}
}

function convertMicroTSToDate(microTS) {
    return new Date(microTS/1000);
}

/* 
 * Common function to retrieve the analytics messages count and size
 */
function getAnalyticsMessagesCountAndSize(d,procList){
    var count = 0,size = 0, obj = {};
    for(var key in d){
        var label = key.toUpperCase();
        $.each(procList,function(idx,proc){
            if(label.indexOf(":"+proc.toUpperCase()+":") != -1){
                obj[key] = d[key];
            }
        });
    }
    var sizes =  ifNull(jsonPath(obj,"$..ModuleClientState.client_info.tx_socket_stats.bytes"),0);
    var counts = ifNull(jsonPath(obj,"$..ModuleClientState.session_stats.num_send_msg"),0);
    $.each(counts,function(i,cnt){
        count += cnt;
    });
    $.each(sizes,function(i,sze){
        size += sze;
    });
    return {count:count,size:size};
}

function formatMemory(memory) {
    if(memory == null || memory['virt'] == null)
        return noDataStr;
    var usedMemory = 0;
    if($.isNumeric(memory))
        usedMemory = parseInt(memory) * 1024;
    else
        usedMemory = parseInt(memory['virt']) * 1024;
    //var totalMemory = parseInt(memory['total']) * 1024;
    return contrail.format('{0}', formatBytes(usedMemory));
}

function updateChartsForSummary(dsData, nodeType) {
    var title,key,chartId,isChartInitialized = false,tooltipFn;
    var nodeData = dsData;
    var data = [];
    if(nodeData != null){
        data = updateCharts.setUpdateParams($.extend(true,[],nodeData));
    }
    if(nodeType == 'compute'){
		title = 'vRouters';
		key = 'vRouters';
		chartId = 'vrouters-bubble';
        tooltipFn = bgpMonitor.vRouterTooltipFn;
        clickFn = bgpMonitor.onvRouterDrillDown;
	} else if(nodeType =="control"){
		title = 'Control Nodes';
		key = 'controlNode';
		chartId = 'controlNodes-bubble';
        tooltipFn = bgpMonitor.controlNodetooltipFn;
        clickFn = bgpMonitor.onControlNodeDrillDown;
	} else if(nodeType == "analytics"){
		title = 'Analytic Nodes';
		key = 'analyticsNode';
		chartId = 'analyticNodes-bubble';
        tooltipFn = bgpMonitor.analyticNodeTooltipFn;
        clickFn = bgpMonitor.onAnalyticNodeDrillDown;
	} else if(nodeType == "config"){
		title = 'Config Nodes';
		key = 'configNode';
		chartId = 'configNodes-bubble';
        tooltipFn = bgpMonitor.configNodeTooltipFn;
        clickFn = bgpMonitor.onConfigNodeDrillDown;
	}
    var chartsData = [{
        title: title,
        d: splitNodesToSeriesByColor(data, {
            Red: d3Colors['red'],
            Orange: d3Colors['orange'],
            Blue: d3Colors['blue'],
            Green: d3Colors['green']
        }),
        chartOptions: {
            tooltipFn: tooltipFn,
            clickFn: clickFn,
            xPositive: true,
            addDomainBuffer: true
        },
        link: {
            hashParams: {
                p: 'mon_bgp',
                q: {
                    node: 'vRouters'
                }
            }
        },
        widgetBoxId: 'recent'
    }];
    var chartObj = {},nwObj = {};
    if(!isScatterChartInitialized('#' + chartId)) {
        $('#' + chartId).initScatterChart(chartsData[0]);
    }  else {
        chartObj['selector'] = $('#content-container').find('#' + chartId + ' > svg').first()[0];
        chartObj['data'] = chartsData[0]['d'];
        chartObj['type'] = 'infrabubblechart';
        updateCharts.updateView(chartObj);
    }
}

function splitNodesToSeriesByColor(data,colors) {
    var splitSeriesData = [];
    var nodeCrossFilter = crossfilter(data);
    var colorDimension = nodeCrossFilter.dimension(function(d) {return d.color});
    var colorGroup = colorDimension.group();
    $.each(colors,function(key,value) {
        colorDimension.filterAll();
        colorDimension.filter(value);
        splitSeriesData.push({
            key: key,
            color: value,
            values: colorDimension.top(Infinity)
        });
    });
    return splitSeriesData;
}

//Handlebar functions for monitor infra 
Handlebars.registerPartial('statusTemplate',$('#statusTemplate').html());

Handlebars.registerHelper('renderStatusTemplate', function(sevLevel, options) {
    var selector = '#statusTemplate',
        source = $(selector).html(),
        html = Handlebars.compile(source)({sevLevel:sevLevel,sevLevels:sevLevels});
    return new Handlebars.SafeString(html);
});

function getAllvRouters(defferedObj,dataSource,dsObj){
    var obj = {};
    if(dsObj['lastUpdated'] == null){
        obj['transportCfg'] = { 
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'],
                type:'GET'
            }
        defferedObj.done(function(){
            manageDataSource.refreshDataSource('computeNodeDS');
        });
    } else {
        obj['transportCfg'] = {
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'] + '?forceRefresh',
                type:'GET',
                //set the default timeout as 5 mins
                timeout:300000
        }
    }
    
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parsevRoutersDashboardData,
                        loadedDeferredObj:defferedObj});
}

function getAllControlNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['CONTROLNODE_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parseControlNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

/**
 * populateFn for analyticsDS
 */
function getAllAnalyticsNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['ANALYTICS_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parseAnalyticNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

/**
 * populateFn for configDS
 */
function getAllConfigNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['CONFIG_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parseConfigNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

function mergeGeneratorAndPrimaryData(genDS,primaryDS,options){
    var genDSData = genDS.getItems();
    var primaryData = primaryDS.getItems();
    var updatedData = [];
    //to avoid the change event getting triggered copy the data into another array and use it.
    var genData = [];
    $.each(genDSData,function (idx,obj){
        genData.push(obj);
    });
    $.each(primaryData,function(i,d){
        var idx=0;
        while(genData.length > 0 && idx < genData.length){
            if(genData[idx]['name'].split(':')[0] == d['name']){
                d['status'] = getFinalNodeStatusFromGenerators(genData[idx]['status'],primaryData[i]);
                d['isGeneratorRetrieved'] = true;
                genData.splice(idx,1);
                break;
            }
            idx++;
        };
        updatedData.push(d);
    });
    genDS.setItems(updatedData);
    return {dataSource:genDS};
}

function getGeneratorsForInfraNodes(deferredObj,dataSource,dsName) {
    var obj = {};
    var kfilts;
    var cfilts;
    if(dsName == 'controlNodeDS') {
        kfilts =  '*:' + UVEModuleIds['CONTROLNODE'] + '*';
        cfilts =  'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'computeNodeDS') {
        kfilts = '*:' + UVEModuleIds['VROUTER_AGENT'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'configNodeDS') {
        kfilts = '*:' + UVEModuleIds['COLLECTOR'] + '*,*:' + UVEModuleIds['OPSERVER'] + '*,*:' + UVEModuleIds['QUERYENGINE'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'analyticsNodeDS') {
        kfilts = '*:' + UVEModuleIds['APISERVER'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    }

    var postData = getPostData("generator",'','',cfilts,kfilts);
    
    obj['transportCfg'] = { 
            url:TENANT_API_URL,
            type:'POST',
            data:postData
        }
    var genDeferredObj = $.Deferred();
    var genDataView = new ContrailDataView();
    getOutputByPagination(genDataView,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parseGeneratorsData,
                        loadedDeferredObj:genDeferredObj});
    genDeferredObj.done(function(genData) {
        deferredObj.resolve(mergeGeneratorAndPrimaryData(genData['dataSource'],dataSource));
    });
}

//Default tooltip contents to show for infra nodes
function getNodeTooltipContents(currObj) {
    var tooltipContents = [
        {lbl:'Host Name', value: currObj['name']},
        {lbl:'Version', value:currObj['version']},
        {lbl:'CPU', value:$.isNumeric(currObj['cpu']) ? currObj['cpu'].toFixed(2)  + '%' : currObj['cpu']},
        {lbl:'Memory', value:formatMemory(currObj['memory'])}
    ];
    return tooltipContents;
}

var bgpMonitor = {
    onvRouterDrillDown:function(currObj) {
         layoutHandler.setURLHashParams({node:currObj['name'], tab:''}, {p:'mon_infra_vrouter'});
    },
    onControlNodeDrillDown:function(currObj) {
         layoutHandler.setURLHashParams({node:currObj['name'], tab:''}, {p:'mon_infra_control'});
    },
    onAnalyticNodeDrillDown:function(currObj) {
         layoutHandler.setURLHashParams({node:currObj['name'], tab:''}, {p:'mon_infra_analytics'});
    },
    onConfigNodeDrillDown:function(currObj) {
         layoutHandler.setURLHashParams({node:currObj['name'], tab:''}, {p:'mon_infra_config'});
    },
    vRouterTooltipFn: function(currObj) {
        return getNodeTooltipContents(currObj);
    },
    controlNodetooltipFn: function(currObj) {
        return getNodeTooltipContents(currObj);
    },
    analyticNodeTooltipFn: function(currObj) {
        var tooltipContents = [];
        if(currObj['pendingQueryCnt'] != null && currObj['pendingQueryCnt'] > 0)
            tooltipContents.push({lbl:'Pending Queries', value:currObj['pendingQueryCnt']});
        return getNodeTooltipContents(currObj).concat(tooltipContents);;
    },
    configNodeTooltipFn: function(currObj) {
        return getNodeTooltipContents(currObj);
    },
    nodeTooltipFn:function (e,x,y,chart,tooltipFn) {
        var result = {};
        //markOverlappedBubblesOnHover reuturns Overlapped nodes in ascending order of severity
        //Reverse the nodes such that high severity nodes are displayed first in the tooltip 
        e['point']['overlappedNodes'] = markOverlappedBubblesOnHover(e,chart).reverse();
        if(e['point']['overlappedNodes'] == undefined || e['point']['overlappedNodes'].length <= 1) {
            return formatLblValueTooltip(bgpMonitor.getTooltipContents(e));
        } else if(e['point']['multiTooltip'] == true) {
            result = getMultiTooltipContent(e,bgpMonitor.getTooltipContents,chart);
            result['content'] = result['content'].slice(0,result['perPage']);
            return formatLblValueMultiTooltip(result);
        }
    },
    getNextHopType:function (data) {
    	var type = data['path']['nh']['NhSandeshData']['type'];
    	if($.type(type) != "string"){
    		return '-';
    	} else {
    		return type;
    	}
    },
    getTooltipContents:function(e) {
        //Get the count of overlapping bubbles
        var series = e['series'];
        var processDetails = e['point']['processDetails'];
        var tooltipContents = [
            {lbl:'Host Name', value: e['point']['name']},
            {lbl:'Version', value:e['point']['version']},
            {lbl:'CPU', value:$.isNumeric(e['point']['cpu']) ? e['point']['cpu'].toFixed(2) + '%' : e['point']['cpu']},
            {lbl:'Memory', value:formatMemory(e['point']['memory'])}
        ];
        if (e['point']['type'] == 'vRouter') {
        } else if (e['point']['type'] == 'controlNode') {
        } else if (e['point']['type'] == 'analyticsNode') {
            if(e['point']['pendingQueryCnt'] != null && e['point']['pendingQueryCnt'] > 0)
              tooltipContents.push({lbl:'Pending Queries', value:e['point']['pendingQueryCnt']});
        } else if (e['point']['type'] == 'configNode') {
        }
        $.each(e['point']['alerts'],function(idx,obj) {
            if(obj['tooltipAlert'] != false)
                tooltipContents.push({lbl:ifNull(obj['tooltipLbl'],'Events'),value:obj['msg']});
        });
        return tooltipContents;
    },
    getNextHopDetails:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], tunnelType = nextHopData['tunnel_type'], valid = nextHopData['valid'], vrf = nextHopData['vrf'];
        if (nhType == 'arp') {
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn'])  + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +  wrapLabelValue('Destination IP', dip) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) +
            		 wrapLabelValue('Tunnel type', tunnelType) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'discard') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType.toLowerCase() == 'composite' || nhType.toLowerCase().search('l3 composite') != -1) {
            var vrf = nextHopData['vrf'];
            var refCount = nextHopData['ref_count'];
            var policy = nextHopData['policy'];
            var valid = nextHopData['valid'];
            var label = nhData['label'];
            var mcDataString = '';
            var mcData;
            if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
                mcData = nextHopData['mc_list']['list']['McastData'];
                if (mcData.length > 1) {
                    for (var a = 0; a < mcData.length; a++) {
                        mcDataString = mcDataString.concat("{");
                        var dataObj = mcData[a]
                        for (x in dataObj) {
                            if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                                mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                        }
                        mcDataString = mcDataString.concat("}");
                    }
                } else {
                    mcDataString = mcDataString.concat("{");
                    for (x in mcData) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            }
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', lbl));
                return x;
        }
    },
    getNextHopDetailsForMulticast:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        var nhData = data['path'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var refCount = nextHopData['ref_count'];
        var valid = nextHopData['valid'];
        var policy = nextHopData['policy'];
        var sip = nextHopData['sip'];
        var dip = nextHopData['dip'];
        var vrf = nextHopData['vrf'];
        var label = nextHopData['label'];
        var mcDataString = '';
        var mcData;
        if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
            mcData = nextHopData['mc_list']['list']['McastData'];
            if (mcData.length > 1) {
                for (var a = 0; a < mcData.length; a++) {
                    mcDataString = mcDataString.concat("{");
                    var dataObj = mcData[a]
                    for (x in dataObj) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            } else {
                mcDataString = mcDataString.concat("{");
                for (x in mcData) {
                    if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                        mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                }
                mcDataString = mcDataString.concat("}");
            }
        }
        if (nhType == 'arp') {
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('Source IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'receive') {
            return contrail.format(wrapLabelValue('Reference Count', refCount) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Destination IP', dip) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else {
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } 
    },
    getNextHopDetailsForL2:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], valid = nextHopData['valid'], vrf = nextHopData['vrf'], tunnelType = nextHopData['tunnel_type'];
        if (nhType == 'arp') {
            //return contrail.format('Intf: {0} VRF: {1} Mac: {2} Source IP: {3}',nextHopData['itf'],nextHopData['vrf'],nextHopData['mac'],nextHopData['sip']);
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) + wrapLabelValue('Mac', nextHopData['mac']) + wrapLabelValue('IP', nextHopData['sip']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', nhData['dest_vn']) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +  wrapLabelValue('Destination IP', dip) + wrapLabelValue('Valid', valid) + wrapLabelValue('Policy', policy) + wrapLabelValue('Vrf', vrf) 
            		+ wrapLabelValue('Label', lbl) + wrapLabelValue('Tunnel type', tunnelType));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) + wrapLabelValue('Destination VN', destVN) + wrapLabelValue('Label', lbl) + wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid));
        } else if (nhType == 'discard') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']));
        } else if (nhType.toLowerCase() == 'composite'  || nhType.toLowerCase().search('l2 composite') != -1) {
            var vrf = nextHopData['vrf'];
            var refCount = nextHopData['ref_count'];
            var policy = nextHopData['policy'];
            var valid = nextHopData['valid'];
            var label = nhData['label'];
            var mcDataString = '';
            var mcData;
            if (nextHopData['mc_list'] != null && nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
                mcData = nextHopData['mc_list']['list']['McastData'];
                if (mcData.length > 1) {
                    for (var a = 0; a < mcData.length; a++) {
                        mcDataString = mcDataString.concat("{");
                        var dataObj = mcData[a]
                        for (x in dataObj) {
                            if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                                mcDataString = mcDataString.concat(' ' + x + ': ' + dataObj[x]);
                        }
                        mcDataString = mcDataString.concat("}");
                    }
                } else {
                    mcDataString = mcDataString.concat("{");
                    for (x in mcData) {
                        if (x == "type" || x == "sip" || x == "dip" || x == "label" || x == "itf")
                            mcDataString = mcDataString.concat(' ' + x + ': ' + mcData[x]);
                    }
                    mcDataString = mcDataString.concat("}");
                }
            }
            var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) + wrapLabelValue('Ref count', refCount) +
                wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', label) + wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) + wrapLabelValue('Destination IP', dip) + wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Policy', policy) + wrapLabelValue('Valid', valid) + wrapLabelValue('Label', lbl));
                return x;
        }
    },
}

/*****Get label value pairs for Control Node details and detail template in summary *****/
function getControlNodeDetailsLblValuePairs(parsedData){
    var ctrlNodeDashboardInfo =[];
    var ctrlNodeData ;
    if(parsedData.raw_json != null && parsedData.raw_json.value){
        ctrlNodeData = parsedData.raw_json.value;
    }
    if(ctrlNodeData != null){
        var procStateList, overallStatus = noDataStr;
        var controlProcessStatusList = [];
        try{
            overallStatus = getOverallNodeStatusForDetails(parsedData);
        }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
        try{
          procStateList = jsonPath(ctrlNodeData,"$..NodeStatus.process_info")[0];
          controlProcessStatusList = getStatusesForAllControlProcesses(procStateList);
        }catch(e){}
        var ctrlNodeDashboardInfo = [
                                     {lbl:'Hostname', value:parsedData.name},
                                     {lbl:'IP Address',value:(function(){
                                         var ip = ifNullOrEmpty(getControlIpAddresses(ctrlNodeData,"details"),noDataStr);
                                         return ip;
                                     })()},
                                     {lbl:'Overall Node Status', value:overallStatus},
                                     {lbl:'Processes', value:" "},
                                     {lbl:INDENT_RIGHT+'Control Node', value:(function(){
                                         return ifNull(controlProcessStatusList['contrail-control'],noDataStr);
                                     })()},
                                     /*{lbl:INDENT_RIGHT+'Control Node Manager', value:(function(){
                                      try{
                                         return ifNull(controlProcessStatusList['contrail-control-nodemgr'],noDataStr);
                                      }catch(e){return noDataStr;}
                                     })()},*/
                                     {lbl:'Ifmap Connection', value:(function(){
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
                                         //anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                                         anlNode = jsonPath(ctrlNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                                         status = jsonPath(ctrlNodeData,"$..ModuleClientState..status")[0];
                                         secondaryAnlNode = jsonPath(ctrlNodeData,"$..ModuleClientState..secondary")[0].split(':')[0];
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
                                     //TODO{lbl:'Config Messages', value:ctrlNodeData['configMessagesIn'] + ' In, ' + ctrlNodeData['configMessagesOut'] + ' Out'},
                                     {lbl:'Analytics Messages', value:(function(){
                                         var msgs = getAnalyticsMessagesCountAndSize(ctrlNodeData,['ControlNode']);
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
                                     {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                                     {lbl:'Last Log', value: (function(){
                                      var lmsg;
                                      lmsg = getLastLogTimestamp(ctrlNodeData,"control");
                                      if(lmsg != null){
                                         try{
                                            return new Date(parseInt(lmsg)/1000).toLocaleString();   
                                         }catch(e){return noDataStr;}
                                      } else return noDataStr;
                                     })()}
                                 ];
    }
    return ctrlNodeDashboardInfo;
}

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

/*****\END Get label value pairs for Control Node details and detail template in summary *****/


/**** Get label value pairs for vRouter Node details and detail template in summaryv****/
function getvRouterDetailsLblValuePairs(parsedData) {
    var computeNodeDashboardInfo = [];
    var computeNodeData;
    if(parsedData.raw_json != null && parsedData.raw_json.value){
        computeNodeData = parsedData.raw_json.value;
    }
    if(computeNodeData != null){
        var overallStatus = getOverallNodeStatusForDetails(parsedData);
        var procStateList = getValueByJsonPath(computeNodeData,"NodeStatus;process_info");
        var vRouterProcessStatusList = getStatusesForAllvRouterProcesses(procStateList);
        
        computeNodeDashboardInfo = [
                                    {lbl:'Hostname', value:parsedData.name},
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
                                ];
    }//if
    return computeNodeDashboardInfo;
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


/****\END Get label value pairs for vRouter Node details and detail template in summary****/

/**** Get label value pairs for Analytics Node details and detail template in summary****/
function getAnalyticsNodeLblValuePairs(parsedData){
    var aNodeDashboardInfo = [];
    var aNodeData = parsedData.raw_json;
    var analyticsProcessStatusList = [];
    var procStateList, overallStatus = noDataStr;
    
    if(parsedData.raw_json != null && parsedData.raw_json.value){
        aNodeData = parsedData.raw_json.value;
    }
    if(aNodeData != null){
        overallStatus = getOverallNodeStatusForDetails(parsedData);
        procStateList = getValueByJsonPath(aNodeData,"NodeStatus;process_info",[]);
        analyticsProcessStatusList = getStatusesForAllAnalyticsProcesses(procStateList);
        aNodeDashboardInfo = [
            {lbl:'Hostname', value:parsedData.name},
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
            {lbl:'Overall Node Status', value:overallStatus},
            {lbl:'Processes', value:" "},
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
            })()},
           /* {lbl:INDENT_RIGHT+'Redis Sentinel', value:(function(){
                return ifNull(analyticsProcessStatusList['redis-sentinel'],noDataStr);
            })()},*/
            {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
            {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
            {lbl:'Messages', value:(function(){
                var msgs = getAnalyticsMessagesCountAndSize(aNodeData,['Collector']);
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
            {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
            {lbl:'Last Log', value: (function(){
                var lmsg;
                lmsg = getLastLogTimestamp(aNodeData,"analytics");
                if(lmsg != null){
                    try{
                        return new Date(parseInt(lmsg)/1000).toLocaleString();  
                    }catch(e){return noDataStr;}
                } else return noDataStr;
                })()}
        ];
    }
    return aNodeDashboardInfo;
}

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
/****\END Get label value pairs for Analytics Node details and detail template in summaryv****/

/**** Get label value pairs for Config Node details and detail template in summary****/
function getConfigNodeLblValuePairs(parsedData){
    var confNodeDashboardInfo = [];
    var confNodeData = parsedData.raw_json;
    var analyticsProcessStatusList = [];
    
    if(parsedData.raw_json != null && parsedData.raw_json.value){
        confNodeData = parsedData.raw_json.value;
    }
    if(confNodeData != null){
        var procStateList, overallStatus = noDataStr;
        var configProcessStatusList = [];
        overallStatus = getOverallNodeStatusForDetails(parsedData);
        procStateList = getValueByJsonPath(confNodeData,"configNode;NodeStatus;process_info",[]);
        if(!(procStateList instanceof Array)){
            procStateList = [procStateList];
        }
        configProcessStatusList = getStatusesForAllConfigProcesses(procStateList);
        confNodeDashboardInfo = [
          {lbl:'Hostname', value:parsedData.name},
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
            {lbl:'Overall Node Status', value:overallStatus},
            {lbl:'Processes', value:" "},
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
            })()},
            {lbl:'Analytics Node', value:(function(){
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
          {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
          {lbl:'Last Log', value: (function(){
             var lmsg;
             lmsg = getLastLogTimestamp(confNodeData,"config");
             if(lmsg != null){
                try{
                   return new Date(parseInt(lmsg)/1000).toLocaleString();   
                }catch(e){return noDataStr;}
             } else return noDataStr;
             })()}
        ];
    }
    return confNodeDashboardInfo;
}

/****\END Get label value pairs for Config Node details and detail template in summary****/
