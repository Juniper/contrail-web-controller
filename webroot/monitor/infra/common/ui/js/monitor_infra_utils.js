/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 */
var consoleTimer = [];
//For Axis params if the data type is not provided default one is Integer and currently
//only two data types integer and float are supported
var axisParams = {
                    'vRouter':{
                        yAxisParams:[{
                                        lbl:'Memory (MB)',
                                        key:'virtMemory',
                                        isBucketSizeParam:false,
                                        defaultParam:true,
                                        aggregratorFn:function(){},
                                        formatFn:function(data){
                                            return prettifyBytes({bytes:ifNull(data,0)*(1024 * 1024),stripUnit:true,prefix:'MB'})
                                        }
                                      },
                                      {
                                          lbl:'Virtual Networks',
                                          key:'vnCnt',
                                          isBucketSizeParam:false,
                                          aggregratorFn:function(){}
                                      }],
                       xAxisParams:[{
                                       lbl:'CPU (%)',
                                       key:'cpu',
                                       type:'float',
                                       defaultParam:true,
                                       isBucketSizeParam:false,
                                       aggregratorFn:function(){}
                                    },
                                    {
                                        lbl:'Instances',
                                        key:'instCnt',
                                        isBucketSizeParam:false,
                                        aggregratorFn:function(){}
                                    }
                                    ]
                    },
                    'analyticsNode':{
                        yAxisParams:[{

                                    }],
                        xAxisParams:[{

                                    }]
                    },
                    'controlNode':{
                        yAxisParams:[{

                        }],
                        xAxisParams:[{

                        }]
                    },
                    'configNode':{
                        yAxisParams:[{

                        }],
                        xAxisParams:[{

                        }]
                    }
                 }
var chartsLegend = {
        Green: d3Colors['green'],
        Blue: d3Colors['blue'],
        Orange: d3Colors['orange'],
        Red: d3Colors['red']
   };
var infraMonitorAlertUtils = {
    /**
    * Process-specific alerts
    */
    getProcessAlerts : function(data,obj,processPath) {
        var res,filteredResponse = [],downProcess = 0,backOffProcess = 0,
            lastExitTime,lastStopTime,strtngProcess = 0;
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
            if(IS_NODE_MANAGER_INSTALLED){
                alerts.push($.extend({
                    sevLevel: sevLevels['ERROR'],
                    name: data['name'],
                    pName: obj['display_type'],
                    msg: infraAlertMsgs['PROCESS_STATES_MISSING']
                }, infoObj));
            }
        } else {
            for(var i=0;i<filteredResponse.length;i++) {
                lastExitTime =  undefined;
                lastStopTime =  undefined;
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
                var procState = filteredResponse[i]['process_state'];
                /*
                 * Different process states and corresponding node color and message
                 * PROCESS_STATE_STOPPPED: red, process stopped message
                 * PROCESS_STATE_STARTING: blue, process starting message
                 * PROCESS_STATE_BACKOFF: orange, process down message
                 * rest all states are with red color and process down message
                 */
                if (procState != null && procState != 'PROCESS_STATE_STOPPED' && procState != 'PROCESS_STATE_RUNNING'
                    && procState != 'PROCESS_STATE_BACKOFF' && procState != 'PROCESS_STATE_STARTING') {
                    downProcess++;
                    if(filteredResponse[i]['last_exit_time'] != null)
                        lastExitTime = filteredResponse[i]['last_exit_time'];
                    alerts.push($.extend({
                        tooltipAlert: false,
                        name: data['name'],
                        pName: procName,
                        msg: infraAlertMsgs['PROCESS_DOWN_MSG'].format(procName),
                        timeStamp: lastExitTime,
                        sevLevel: sevLevels['ERROR']
                    }, infoObj));
                } else if (procState == 'PROCESS_STATE_STOPPED') {
                    downProcess++;
                    if(filteredResponse[i]['last_stop_time'] != null)
                        lastStopTime = filteredResponse[i]['last_stop_time'];
                    alerts.push($.extend({
                        tooltipAlert: false,
                        name: data['name'],
                        pName: procName,
                        msg: infraAlertMsgs['PROCESS_STOPPED'].format(procName),
                        timeStamp: lastStopTime,
                        sevLevel: sevLevels['ERROR']
                    }, infoObj));
                } else if (procState == 'PROCESS_STATE_BACKOFF') {
                    backOffProcess++;
                    if(filteredResponse[i]['last_exit_time'] != null)
                        lastExitTime = filteredResponse[i]['last_exit_time'];
                    alerts.push($.extend({
                        tooltipAlert: false,
                        name: data['name'],
                        pName: procName,
                        msg: infraAlertMsgs['PROCESS_DOWN_MSG'].format(procName),
                        timeStamp: lastExitTime,
                        sevLevel: sevLevels['WARNING']
                    }, infoObj));
                } else if (procState == 'PROCESS_STATE_STARTING') {
                    strtngProcess++;
                    alerts.push($.extend({
                        tooltipAlert: false,
                        name: data['name'],
                        pName: procName,
                        msg: infraAlertMsgs['PROCESS_STARTING_MSG'].format(procName),
                        timeStamp: undefined, //we are not showing the time stamp for the process in
                        sevLevel: sevLevels['INFO'] // starting state
                    }, infoObj));
                    //Raise only info alert if process_state is missing for a process??
                } else if  (procState == null) {
                    downProcess++;
                    alerts.push($.extend({
                        tooltipAlert: false,
                        name: data['name'],
                        pName: filteredResponse[i]['process_name'],
                        msg: infraAlertMsgs['PROCESS_DOWN_MSG'].format(filteredResponse[i]['process_name']),
                        timeStamp: filteredResponse[i]['last_exit_time'],
                        sevLevel: sevLevels['INFO']
                    }, infoObj));
                        /*msg +=", "+infraAlertMsgs['RESTARTS'].format(restartCount);
                    alerts.push($.extend({name:data['name'],pName:filteredResponse[i]['process_name'],type:'core',msg:msg},infoObj));*/
                }
            }
            if(downProcess > 0)
                alerts.push($.extend({detailAlert:false,sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['PROCESS_DOWN'].format(downProcess + backOffProcess)},infoObj));
            else if(backOffProcess > 0)
                alerts.push($.extend({detailAlert:false,sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['PROCESS_DOWN'].format(backOffProcess)},infoObj));
            if(strtngProcess > 0)
                alerts.push($.extend({detailAlert:false,sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PROCESS_STARTING'].format(strtngProcess)},infoObj));
        }
        return alerts.sort(dashboardUtils.sortInfraAlerts);
    },
    processvRouterAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'vRouter',ip:obj['ip'],link:obj['link']};
        if(obj['isNTPUnsynced']){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['NTP_UNSYNCED_ERROR']},infoObj));
        }
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
        if(obj['isNTPUnsynced']){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['NTP_UNSYNCED_ERROR']},infoObj));
        }
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
        if(obj['isNTPUnsynced'])
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['NTP_UNSYNCED_ERROR']},infoObj));
        if(obj['isUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['UVE_MISSING']},infoObj));
//        if(obj['isConfigMissing'] == true)
//            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_MISSING']},infoObj));
        if(obj['isUveMissing'] == false){
            if(obj['isPartialUveMissing'] == true)
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        }
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    },
    processAnalyticsNodeAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Analytics Node',ip:obj['ip'],link:obj['link']};
        if(obj['isNTPUnsynced']){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['NTP_UNSYNCED_ERROR']},infoObj));
        }
        if(obj['isUveMissing'] == true){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['UVE_MISSING']},infoObj));
        }
        if(obj['isUveMissing'] == false) {
            if(obj['isPartialUveMissing'] == true){
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
            }
        }
        if(obj['errorStrings'] != null && obj['errorStrings'].length > 0){
            $.each(obj['errorStrings'],function(idx,errorString){
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:errorString},infoObj));
            });
        }
        return alertsList.sort(dashboardUtils.sortInfraAlerts);
    },
    processDbNodeAlerts : function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Database Node',ip:obj['ip'],link:obj['link']};

        if(obj['isNTPUnsynced']){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['NTP_UNSYNCED_ERROR']},infoObj));
        }
        if(obj['isUveMissing'] == true){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['UVE_MISSING']},infoObj));
        }
//        if(obj['isConfigMissing'] == true){
//            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_MISSING']},infoObj));
//        }
        if(obj['isUveMissing'] == false && obj['isPartialUveMissing'] == true){
            alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        }
        if(obj['usedPercentage'] >= 70 && obj['usedPercentage'] < 90){
            alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['SPACE_USAGE_WARNING'].format('Database')},infoObj));
        } else if(obj['usedPercentage'] >= 90){
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['SPACE_THRESHOLD_EXCEEDED'].format('Database')},infoObj));
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

function getDbNodeColor(d,obj) {
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
            var dValue = result[i]['value'];
            obj['cpu'] = parseFloat(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;cpu_share','--'));
            obj['cpu'] = $.isNumeric(obj['cpu']) ? parseFloat(obj['cpu'].toFixed(2)) : NaN;
            obj['ip'] = getValueByJsonPath(dValue,'VrouterAgent;control_ip','-');
            obj['xField'] = 'cpu';
            obj['yField'] = 'resMemory';
            obj['uveIP'] = obj['ip'];
            obj['summaryIps'] = getVrouterIpAddresses(dValue,"summary");
            var iplist = getValueByJsonPath(dValue,'VrouterAgent;self_ip_list',[]);
            if(obj['ip'] != '-')
                iplist.push(obj['ip']);
            obj['uveIP'] = iplist;
            obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(dValue,'ConfigData')) ? true : false;
            obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(dValue,'VrouterAgent')) && $.isEmptyObject(getValueByJsonPath(dValue,'VrouterStatsAgent'))) ? true : false;
            obj['isNTPUnsynced'] = isNTPUnsynced(jsonPath(dValue,'$..NodeStatus')[0]);
            obj['configIP'] = getValueByJsonPath(dValue,'ConfigData;virtual-router;virtual_router_ip_address','-');
            obj['vRouterType'] = getValueByJsonPath(dValue,'ConfigData;virtual-router;virtual_router_type;0','hypervisor');
            if(obj['vRouterType'] == ''){
                obj['vRouterType'] = 'hypervisor';//set default to hypervisor
            }
            obj['moduleId'] = getValueByJsonPath(dValue,'NodeStatus;process_status;0;module_id', UVEModuleIds['VROUTER_AGENT']);
            if(obj['ip'] == '-') {
                obj['ip'] = obj['configIP'];
            }
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$.cpuStats.history-10');

            obj['status'] = getOverallNodeStatus(d,'compute');
            var processes = ['contrail-vrouter-agent','contrail-vrouter-nodemgr','supervisor-vrouter'];
            obj['memory'] = formatMemory(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo','--'));
            //Used for plotting in scatterChart
            obj['resMemory'] = getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo;res','-');
            obj['resMemory'] = $.isNumeric(obj['resMemory']) ? parseFloat(parseFloat(obj['resMemory']/1024).toFixed(2)) : NaN;
            obj['virtMemory'] = parseInt(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo;virt','--'))/1024;
            obj['size'] = getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;out_bandwidth_usage',0) +
                getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;in_bandwidth_usage',0) + 1;
            obj['size'] = getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_5min_usage;0;out_bandwidth_usage',0) +
                getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_5min_usage;0;in_bandwidth_usage',0);
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

            obj['vnCnt'] = getValueByJsonPath(dValue,'VrouterAgent;vn_count',0);
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
                obj['errorIntfCntText'] = ", <span class='text-error'>" + obj['errorIntfCnt'] + " Down</span>";
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
            obj['x'] = parseFloat(jsonPath(d,'$..cpu_info.cpu_share')[0]);
            //Info:Need to specify the processname explictly for which we need res memory
            obj['y'] = parseInt(jsonPath(d,'$..meminfo.res')[0])/1024; //Convert to MB
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$.cpuStats.history-10');
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
                obj['downXMPPPeerCntText'] = ", <span class='text-error'>" + obj['downXMPPPeerCnt'] + " Down</span>";
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
            obj['isNTPUnsynced'] = isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
            if(obj['downBgpPeerCnt'] > 0){
                obj['downBgpPeerCntText'] = ", <span class='text-error'>" + obj['downBgpPeerCnt'] + " Down</span>";
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
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-collector")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-collector")]..meminfo.res')[0])/1024;
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['memory'] = formatBytes(obj['y']*1024*1024);
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$.cpuStats.history-10');
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
            obj['isNTPUnsynced'] = isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
            var isConfigDataAvailable = $.isEmptyObject(jsonPath(d,'$..ConfigData')[0]) ? false : true;
            obj['isUveMissing'] = ($.isEmptyObject(jsonPath(d,'$..CollectorState')[0]) && isConfigDataAvailable)? true : false;
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            if(obj['isUveMissing'] == false) {
                if(isEmptyObject(jsonPath(d,'$.value.ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-collector")].cpu_info')[0]) || isEmptyObject(jsonPath(d,'$.value.CollectorState.build_info')[0])) {
                    obj['isPartialUveMissing'] = true;
                }
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
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-api")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-api")]..meminfo.res')[0])/1024;
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
            obj['isNTPUnsynced'] = isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
            obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(d,'value;ConfigData')) ? true : false;
            obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(d,'value;configNode'))) ? true : false;
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            try{
                obj['status'] = getOverallNodeStatus(d,"config");
            }catch(e){
                obj['status'] = 'Down';
            }
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$.cpuStats.history-10');
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
            if(isEmptyObject(jsonPath(d,'$.value.configNode.ModuleCpuState.module_cpu_info[?(@.module_id=="contrail-api")].cpu_info')[0]) ||
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

    /**
     * Parses database-node UVE data
     */
    parseDbNodesDashboardData : function(result) {
        var retArr = [];
        $.each(result,function(idx,d) {
            var obj = {};
            var dbSpaceAvailable = parseFloat(jsonPath(d,'$.value.databaseNode.DatabaseUsageInfo.database_usage[0].disk_space_available_1k')[0]);
            var dbSpaceUsed = parseFloat(jsonPath(d,'$.value.databaseNode.DatabaseUsageInfo.database_usage[0].disk_space_used_1k')[0]);
            var analyticsDbSize = parseFloat(jsonPath(d,'$.value.databaseNode.DatabaseUsageInfo.database_usage[0].analytics_db_size_1k')[0]);

            obj['x'] = $.isNumeric(dbSpaceAvailable)? dbSpaceAvailable / 1024 / 1024 : 0;
            obj['y'] = $.isNumeric(dbSpaceUsed)? dbSpaceUsed / 1024 / 1024 : 0;

            obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(d,'value;ConfigData')) ? true : false;
            obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(d,'value;databaseNode'))) ? true : false;
            var configData;
            if(!obj['isConfigMissing']){
                configData = getValueByJsonPath(d,'value;ConfigData');
                obj['ip'] = configData.database_node_ip_address;
            } else {
                obj['ip'] = noDataStr;
            }
            obj['dbSpaceAvailable'] = dbSpaceAvailable;
            obj['dbSpaceUsed'] = dbSpaceUsed;
            obj['analyticsDbSize'] = analyticsDbSize;
            obj['formattedAvailableSpace'] = $.isNumeric(dbSpaceAvailable)? formatBytes(dbSpaceAvailable * 1024) : '-';
            obj['formattedUsedSpace'] = $.isNumeric(dbSpaceUsed)? formatBytes(dbSpaceUsed * 1024) : '-';
            obj['formattedAnalyticsDbSize'] = $.isNumeric(analyticsDbSize)? formatBytes(analyticsDbSize * 1024) : '-';
            //Use the db usage percentage for bubble size
            var usedPercentage = (obj['y'] * 100) / (obj['y']+obj['x']);
            obj['usedPercentage'] = usedPercentage;
            obj['formattedUsedPercentage'] = $.isNumeric(usedPercentage)? usedPercentage.toFixed(2) + ' %': '-' ;
            obj['size'] = obj['usedPercentage']  ;
            obj['shape'] = 'circle';
            obj['type'] = 'dbNode';
            obj['display_type'] = 'Database Node';
            obj['name'] = d['name'];
            obj['link'] = {p:'mon_infra_database',q:{node:obj['name'],tab:''}};
            obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            try{
                obj['status'] = getOverallNodeStatus(d,"db");
            }catch(e){
                obj['status'] = 'Down';
            }
            obj['isNTPUnsynced'] = isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
            obj['nodeAlerts'] = infraMonitorAlertUtils.processDbNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(dashboardUtils.sortInfraAlerts);
            obj['color'] = getDbNodeColor(d,obj);
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
    parseCpuStatsData : function(statsData){
        var ret = {};
        var retArr = [];
        if(statsData == null){
            return [];
        }
        $.each(statsData,function(idx,d){
            var source = d['Source'];
            var t = JSON.stringify({"ts":d['T']});

            if(ret[source] != null && ret[source]['history-10'] != null){
                var hist10 = ret[source]['history-10'];
                hist10[t] = d['cpu_info.cpu_share'];
            } else {
                ret[source] = {};
                ret[source]['history-10'] = {};
                ret[source]['history-10'][t] = d['cpu_info.cpu_share'];
            }
        });
        $.each(ret,function(key,val){
           var t = {};
           t["name"] = key;
           t["value"] = val;
           retArr.push(t);
        });
        return retArr;
    },
    parseCpuMemStats : function(statsData,nodeType){
        var ret = {};
        var retArr = {};
        if(statsData == null || statsData['data'] == null){
            return [];
        }
        statsData = statsData['data'];
        $.each(statsData,function(idx,d){
            var module = d['cpu_info.module_id'];
            var t = JSON.stringify({"ts":d['T']});
            var cpuForModule = module + '-cpu-share';
            var memForModule = module + '-mem-res';


            if(nodeType == "computeNodeDS"){
                cpuForModule = "contrail-vrouter-agent-cpu-share";
                memForModule = "contrail-vrouter-agent-mem-res";
                var oneMinCpuLoadModule = "contrail-vrouter-agent-one-min-cpuload";
                var useSysMemModule = "contrail-vrouter-agent-used-sys-mem";
                if(ret[oneMinCpuLoadModule] != null && ret[oneMinCpuLoadModule][0]['history-10'] != null){
                    var memhist10 = ret[oneMinCpuLoadModule][0]['history-10'];
                    memhist10[t] = d['cpu_info.mem_res'];
                } else {
                    ret[oneMinCpuLoadModule] = [];
                    ret[oneMinCpuLoadModule][0]={'history-10':{}};
                    ret[oneMinCpuLoadModule][0]['history-10'][t] = d['cpu_info.one_min_cpuload'];
                }
                if(ret[useSysMemModule] != null && ret[useSysMemModule][0]['history-10'] != null){
                    var memhist10 = ret[useSysMemModule][0]['history-10'];
                    memhist10[t] = d['cpu_info.mem_res'];
                } else {
                    ret[useSysMemModule] = [];
                    ret[useSysMemModule][0]={'history-10':{}};
                    ret[useSysMemModule][0]['history-10'][t] = d['cpu_info.used_sys_mem'];
                }
            }
            if(ret[cpuForModule] != null && ret[cpuForModule][0]['history-10'] != null){
                var cpuhist10 = ret[cpuForModule][0]['history-10'];
                cpuhist10[t] = d['cpu_info.cpu_share'];
            } else {
                ret[cpuForModule] = [];
                ret[cpuForModule][0]={'history-10':{}};
                ret[cpuForModule][0]['history-10'][t] = d['cpu_info.cpu_share'];
            }
            if(ret[memForModule] != null && ret[memForModule][0]['history-10'] != null){
                var memhist10 = ret[memForModule][0]['history-10'];
                memhist10[t] = d['cpu_info.mem_res'];
            } else {
                ret[memForModule] = [];
                ret[memForModule][0]={'history-10':{}};
                ret[memForModule][0]['history-10'][t] = d['cpu_info.mem_res'];
            }

        });
        retArr['value'] = ret;
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
            var defaultToTime = new Date();
            var defaultFromTime = new Date(defaultToTime.getTime() - 300000);
            createNewDTPicker('console', 'console-from-time', showFromTime, onSelectFromDate, defaultFromTime);
            createNewDTPicker('console', 'console-to-time', showToTime, onSelectToDate, defaultToTime);
            $('#msgType').contrailCombobox({
                dataSource:[],
                dataTextField:'text',
                dataValueField:'value'
            });
            $('#msgCategory').contrailDropdown({
                dataSource:{
                    type:'remote',
                    url: '/api/admin/table/values/MessageTable/Category',
                    parse:function (response) {
                        var ret = [{text:'All',value:''}];
                        var catList = [];
                        if (nodeType == 'control'){
                            catList = ifNull(response[UVEModuleIds['CONTROLNODE']], []);
                        } else if (nodeType == 'compute') {
                            catList = ifNull(response[UVEModuleIds['VROUTER_AGENT']], []);
                        } else if (nodeType == 'analytics') {
                            catList = ifNull(response[UVEModuleIds['COLLECTOR']], []);
                        } else if (nodeType == 'config') {
                            catList = ifNull(response[UVEModuleIds['APISERVER']], []);
                        }
                        $.each(catList, function (key, value) {
                            if(key != '')
                                ret.push({text:value, value:value});
                        });
                        return ret;
                    }
                },
                dataTextField:'text',
                dataValueField:'value',
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
        keywords = $('#console-keywords');

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

        function getPostDataForGeneratorType(cfilt){
            var type,moduleType="",kfilt="";
            var hostName = obj['name'];
            if(nodeType == 'compute'){
                type = 'vrouter';
                var moduleId = UVEModuleIds['VROUTER_AGENT'];
                if(obj['vrouterModuleId'] != null && obj['vrouterModuleId'] != ''){
                    moduleId = obj['vrouterModuleId'];
                }
                kfilt = hostName+":*:" + moduleId + ":*";
            } else if (nodeType == 'control'){
                type = 'controlnode';
                kfilt = hostName+":*:" + UVEModuleIds['CONTROLNODE'] + ":*";
            } else if (nodeType == 'analytics'){
                type = 'contrail-collector';
                kfilt = hostName+":*:" + UVEModuleIds['COLLECTOR'] + ":*,"+
                        hostName+":*:" + UVEModuleIds['OPSERVER'] + ":*";
            } else if (nodeType == 'config'){
                type = 'confignode';
                kfilt = hostName+":*:" + UVEModuleIds['APISERVER'] + "*,"+
                        hostName+":*:" + UVEModuleIds['DISCOVERY_SERVICE'] + ":*,"+
                        hostName+":*:" + UVEModuleIds['SERVICE_MONITOR'] + ":*,"+
                        hostName+":*:" + UVEModuleIds['SCHEMA'] + ":*";
            }
            return getPostData("generator","","",cfilt,kfilt);
        }

        function updateLogTypeCombobox (result){
            var msgTypeStatsList = [{text:'Any',value:''}];
            var msgStats = [];
            try{
                msgStats =  ifNullOrEmptyObject(jsonPath(result,"$..msgtype_stats"),[]);
            }catch(e){}
            if(msgStats instanceof Array){
                for(var i = 0; i < msgStats.length;i++){
                    if(!($.isEmptyObject(msgStats[i]))){
                        if( msgStats[i] instanceof Array){
                            $.each(msgStats[i],function(i,msgStat){
                                var msgType = msgStat['message_type'];
                                msgTypeStatsList.push({text:msgType,value:msgType});
                            });
                        } else {
                            msgTypeStatsList.push({text:msgStats[i]['message_type'],value:msgStats[i]['message_type']});
                        }
                    }
                }
            }
            var cbMsgType = $('#msgType').data('contrailCombobox');
            if(cbMsgType != null) {
                cbMsgType.setData(msgTypeStatsList);
                cbMsgType.value('');
            }
        }

        function fetchLastLogtimeAndCallLoadLogs(timerId,nodeType){
        	var postData = getPostDataForGeneratorType("ModuleServerState:msg_stats");
        	$.ajax({
                url:TENANT_API_URL,
                type:'post',
                data:postData,
                dataType:'json'
            }).done(function (result) {
                //Update the logtype combobox which is dependent on the same results.
                updateLogTypeCombobox(result);
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
            };
            var msgType = cboMsgType.value();
            if (nodeType == 'control') {
                if(msgType != ''){
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['CONTROLNODE'] + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +')';
                } else {
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['CONTROLNODE'] + ' AND Source='+ obj['name'] +')';
                }
            } else if (nodeType == 'compute') {
                var moduleId = UVEModuleIds['VROUTER_AGENT'];
                if(obj['vrouterModuleId'] != null && obj['vrouterModuleId'] != ''){
                    moduleId = obj['vrouterModuleId'];
                }
                if(msgType != ''){
                    filterObj['where'] = '(ModuleId=' + moduleId + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +')';
                } else {
                    filterObj['where'] = '(ModuleId=' + moduleId + ' AND Source='+ obj['name'] +')';
                }
            } else if (nodeType == 'config') {
                if(msgType != ''){
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['SCHEMA']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +') OR (ModuleId=' + UVEModuleIds['APISERVER']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +') OR (ModuleId=' + UVEModuleIds['SERVICE_MONITOR']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +') OR (ModuleId=' + UVEModuleIds['DISCOVERY_SERVICE']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +')';
                } else {
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['SCHEMA']
                                    + ' AND Source='+obj['name']+') OR (ModuleId=' + UVEModuleIds['APISERVER']
                                    + ' AND Source='+obj['name']+') OR (ModuleId=' + UVEModuleIds['SERVICE_MONITOR']
                                    + ' AND Source='+obj['name']+') OR (ModuleId=' + UVEModuleIds['DISCOVERY_SERVICE']
                                    + ' AND Source='+obj['name']+')';
                }
            } else if (nodeType == 'analytics') {
                if(msgType != ''){
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['OPSERVER']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +') OR (ModuleId=' + UVEModuleIds['COLLECTOR']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +')';
                } else {
                    filterObj['where'] = '(ModuleId=' + UVEModuleIds['OPSERVER']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +') OR (ModuleId=' + UVEModuleIds['COLLECTOR']
                                    + ' AND Source='+obj['name']+' AND Messagetype='+ msgType +')';
                }
            }

            if (cboMsgCategory.value() != '') {
                filterObj['category'] = cboMsgCategory.value();
            }
            if ((cboMsgLevel.value() != null) && (cboMsgLevel.value() != '')) {
                filterObj['level'] = cboMsgLevel.value();
            } else
                filterObj['level'] = 5;
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
            if(keywords.val() != null && keywords.val() != ''){
                filterObj['keywords'] = keywords.val();
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
    var fileArrList=[];
    var procCoreList = jsonPath(data,'$..NodeStatus.process_info[*].core_file_list');
    if(procCoreList){
        fileArrList = ifNull(procCoreList,[]);
    }
    // var allCoresList = ifNull(jsonPath(data,'$..NodeStatus.all_core_file_list')[0],[]);
    // fileArrList = fileArrList.concat([allCoresList]);
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
            var proces = getValueByJsonPath(d,'NodeStatus;process_status;0;module_id');
            if(proces != null){
                procsList = [proces];
            } else {
                procsList = computeProcsForLastTimeStamp;
            }
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
    if(memory == null || memory['res'] == null)
        return noDataStr;
    var usedMemory = parseInt(memory['res']) * 1024;
    //var totalMemory = parseInt(memory['total']) * 1024;
    return contrail.format('{0}', formatBytes(usedMemory));
}

function updateChartsForSummary(dsData, nodeType) {
    var title,key,chartId,isChartInitialized = false,tooltipFn,bucketTooltipFn,isBucketize,crossFilter,bubbleSizeFn;
    var nodeData = dsData;
    var showLegend,xLbl,yLbl,useSizeAsRadius = false;
    var data = []
    data = dsData;
    if(nodeType == 'compute'){
		title = 'vRouters';
		key = 'vRouters';
		chartId = 'vrouters-bubble';
        tooltipFn = bgpMonitor.vRouterTooltipFn;
        bubbleSizeFn = bgpMonitor.vRouterBubbleSizeFn;
        bucketTooltipFn = bgpMonitor.vRouterBucketTooltipFn;
        isBucketize = false;
        clickFn = bgpMonitor.onvRouterDrillDown;
        crossFilter = 'vRoutersCF';
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
	} else if(nodeType == "db"){
        title = 'Database Nodes';
        key = 'dbNode';
        chartId = 'dbNodes-bubble';
        xLbl = 'Available Space (GB)';
        yLbl = 'Used Space (GB)';
        tooltipFn = bgpMonitor.dbNodeTooltipFn;
        clickFn = bgpMonitor.onDbNodeDrillDown;
    }
    if(isBucketize == true) {
        useSizeAsRadius = true;
    }

    //Check if chart is already initialized and has chartOptions like currLevel
    var currChartOptions = {};
    if($('#' + chartId) != null) {
        var origData = $('#' + chartId).data('origData');
        if(origData != null) {
            currChartOptions = origData['chartOptions'];
        }
    }

    var chartsData = {
        title: title,
        // d: splitNodesToSeriesByColor(data, chartsLegend),
        d: [{
            key:key,
            values:data
        }],
        chartOptions: $.extend(true,{
            xLbl:xLbl,
            yLbl:yLbl,
            tooltipFn: tooltipFn,
            bucketTooltipFn: bucketTooltipFn,
            bubbleSizeFn: bubbleSizeFn,
            clickFn: clickFn,
            xPositive: true,
            addDomainBuffer: true,
            isBucketize: isBucketize,
            useSizeAsRadius : useSizeAsRadius,
            bucketOptions:{
                maxBucketizeLevel: defaultMaxBucketizeLevel,
                bucketSizeParam: defaultBucketSizeParam,
                bucketsPerAxis: defaultBucketsPerAxis,
                currLevel : 1
            },
            crossFilter:crossFilter,
            showSettings: false,
            // showLegend:false,
        },currChartOptions),
        link: {
            hashParams: {
                p: 'mon_bgp',
                q: {
                    node: 'vRouters'
                }
            }
        },
        widgetBoxId: 'recent'
    };
    var chartObj = {},nwObj = {};
    if(isBucketize) {
            //Move to MVC
            cowu.renderView4Config($('#' + chartId),null,{
                "elementId":chartId,
                "title": "Port Distribution",
                "view": "ScatterChartView",
                "viewConfig": {
                    // reInitialize : false,
                    modelConfig : {
                        remote: {},
                        data:data
                    },
                    parseFn: function(response) {
                        return {
                            d: chartsData['d'],
                            chartOptions: chartsData['chartOptions']
                        }
                    },
                    "class": "port-distribution-chart",
                }
            });
    } else {
        $('#' + chartId).initScatterChart(chartsData);
    }
}

function splitNodesToSeriesByColor(data,colors) {
    //No need to split based on color as we don't want to maintain separate buckets for each color
    return data;
    var splitSeriesData = [];
    var nodeCrossFilter = crossfilter(data);
    var colorDimension = nodeCrossFilter.dimension(function(d) {return d.color});
    var colorGroup = colorDimension.group();
    $.each(colors,function(key,value) {
        colorDimension.filterAll();
        colorDimension.filter(value);
        splitSeriesData.push({
            // key: '',        //Don't show labels for color legend
            key: key,        //Don't show labels for color legend
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

Handlebars.registerHelper('getInfraDetailsPageCPUChartTitle',function() {
    return infraDetailsPageCPUChartTitle;
})

function getAllvRouters(defferedObj,dataSource,dsObj){
    var obj = {};
    if(dsObj['getFromCache'] == null || dsObj['getFromCache'] == true){
        obj['transportCfg'] = {
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'],
                type:'GET',
                //set the default timeout as 5 mins
                timeout:300000
            }
        defferedObj.done(function(){
            dsObj['getFromCache'] = false;
            manageDataSource.refreshDataSource('computeNodeDS');
        });
    } else {
        obj['transportCfg'] = {
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'] + '?forceRefresh',
                type:'GET',
                //set the default timeout as 5 mins
                timeout:300000
        }
        dsObj['getFromCache'] = true;
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

/**
 * populateFn for databaseDS
 */
function getAllDbNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = {
            url: monitorInfraUrls['DATABASE_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorUtils.parseDbNodesDashboardData,
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
    primaryDS.updateData(updatedData);
    return {dataSource:primaryDS};
}

function getGeneratorsForInfraNodes(deferredObj,dataSource,dsName) {
    var obj = {};
    var kfilts;
    var cfilts;
    if(dsName == 'controlNodeDS') {
        kfilts =  '*:' + UVEModuleIds['CONTROLNODE'] + '*';
        cfilts =  'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'computeNodeDS') {
        //Handling the case module id will change for the TOR agent/ TSN
        //We need to send all the module ids if different
        var items = dataSource.getItems();
        var kfiltString = ""
        var moduleIds = [];
        $.each(items,function(i,d){
            if(moduleIds.indexOf(d['moduleId']) == -1){
                moduleIds.push(d['moduleId']);
                //Exclude getting contrail-tor-agent generators
                if(d['moduleId'] == 'contrail-tor-agent') {
                    return;
                }
                if(kfiltString != '')
                    kfiltString += ',';
                kfiltString += '*:' + d['moduleId'] + '*';
            }
        });
        kfilts =  kfiltString;
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'analyticsNodeDS') {
        kfilts = '*:' + UVEModuleIds['COLLECTOR'] + '*,*:' + UVEModuleIds['OPSERVER'] + '*,*:' + UVEModuleIds['QUERYENGINE'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'configNodeDS') {
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

function mergeCpuStatsDataAndPrimaryData(statsDataDS,primaryDS){
    var statsDSData = statsDataDS.getItems();
    var primaryData = primaryDS.getItems();
    var updatedData = [];
  //to avoid the change event getting triggered copy the data into another array and use it.
    var statsData = [];
    $.each(statsDSData,function (idx,obj){
        statsData.push(obj);
    });
    $.each(primaryData,function(i,d){
        var idx=0;
        while(statsData.length > 0 && idx < statsData.length){
            if(statsData[idx]['name'] == d['name']){
                d['histCpuArr'] = parseUveHistoricalValues(statsData[idx],'$.value.history-10');
                statsData.splice(idx,1);
                break;
            }
            idx++;
        };
        updatedData.push(d);
    });
    primaryDS.updateData(updatedData);
    return {dataSource:primaryDS};
}

function getPostDataForCpuMemStatsQuery(dsName,source) {
    var postData = {
            pageSize:50,
            page:1,
            timeRange:600,
            tgUnits:'secs',
            fromTimeUTC:'now-10m',
            toTimeUTC:'now',
            async:true,
            queryId:randomUUID(),
            reRunTimeRange:600,
            select:'Source, T, cpu_info.cpu_share, cpu_info.mem_res, cpu_info.module_id',
            groupFields:['Source'],
            plotFields:['cpu_info.cpu_share']
    }

    if (dsName == 'controlNodeDS'){
        postData['table'] = 'StatTable.ControlCpuState.cpu_info';
        postData['where'] = '(cpu_info.module_id = contrail-control)';
    } else if (dsName == "computeNodeDS") {
        postData['select'] = 'Source, T, cpu_info.cpu_share, cpu_info.mem_res, cpu_info.one_min_cpuload, cpu_info.used_sys_mem';
        postData['table'] = 'StatTable.ComputeCpuState.cpu_info';
        postData['where'] = '';
    } else if (dsName == "analyticsNodeDS") {
        postData['table'] = 'StatTable.AnalyticsCpuState.cpu_info';
        if(source == "details"){
            postData['where'] = '(cpu_info.module_id = contrail-collector) OR (cpu_info.module_id = contrail-query-engine) OR (cpu_info.module_id = contrail-analytics-api)';
        } else {
            postData['where'] = '(cpu_info.module_id = contrail-collector)';
        }
    } else if (dsName == "configNodeDS") {
        postData['table'] = 'StatTable.ConfigCpuState.cpu_info';
        if(source == "details"){
            postData['where'] = '(cpu_info.module_id = contrail-api) OR (cpu_info.module_id = contrail-svc-monitor) OR (cpu_info.module_id = contrail-schema)';
        } else {
            postData['where'] = '(cpu_info.module_id = contrail-api)';
        }
    }

    return postData;

}

function fetchCPUStats(deferredObj,primaryDS,dsName){
    //build the query
    var postData = getPostDataForCpuMemStatsQuery(dsName,"summary");

    var transportCfg = {
            url:monitorInfraUrls['QUERY'],
            type:'POST',
            data:postData
        }
    var genDeferredObj = $.Deferred();
    var dataView = new ContrailDataView();
//    if(source != null && source == 'details'){
//        $.ajax({
//            url:monitorInfraUrls['QUERY'],
//            type:'POST',
//            data:postData
//        }).done(function(result) {
//            if(result != null && result [0] != null){
//                infraMonitorUtils.parseCpuStatsData
//                primaryDS =  mergeCollectorDataAndPrimaryData(result[0],primaryDS);
//                deferredObj.resolve({dataSource:primaryDS});
//            }
//        }).fail(function(result) {
//            //nothing to do..the generators numbers will not be updated
//        });
//    } else {
        getOutputByPagination(dataView,
                            {transportCfg:transportCfg,
                            parseFn:infraMonitorUtils.parseCpuStatsData,
                            loadedDeferredObj:genDeferredObj});
        genDeferredObj.done(function(cpuStatsData) {
            deferredObj.resolve(mergeCpuStatsDataAndPrimaryData(cpuStatsData['dataSource'],primaryDS));
        });
//    }
}

//Default tooltip contents to show for infra nodes
function getNodeTooltipContents(currObj,formatType) {
    var tooltipContents = [
        {label:'Host Name', value: currObj['name']},
        {label:'Version', value:currObj['version']},
        {label:'CPU', value:$.isNumeric(currObj['cpu']) ? currObj['cpu']  + '%' : '-'},
        {label:'Memory', value:$.isNumeric(currObj['memory']) ? formatMemory(currObj['memory']) : currObj['memory']}
    ];
    if(formatType == 'simple') {
        return tooltipContents;
    } else {
        return {
            content: {
                info: tooltipContents.slice(1),
                actions: [
                    {
                        type: 'link',
                        text: 'View',
                        iconClass: 'icon-external-link',
                        // callback: onScatterChartClick
                    }
                ]
            },title : {
                name: tooltipContents[0]['value'],
                type: currObj['display_type']
            }
        }
    }
}

//Tooltip contents to show for database nodes
function getDbNodeTooltipContents(currObj) {
    var tooltipContents = [
        {label:'Host Name', value: currObj['name']},
//        {label:'Version', value:currObj['version']},
        {label:'Disk Space', value: '',options:{noLabelColon:true}},
        {label:'Available', value:currObj['formattedAvailableSpace']},
        {label:'Used', value:currObj['formattedUsedSpace']},
        {label:'Usage', value:currObj['formattedUsedPercentage']},
        {label:'Analytics DB', value:'',options:{noLabelColon:true}},
        {label:'Used', value:currObj['formattedAnalyticsDbSize']},

    ];
    return tooltipContents;
}

//Default tooltip render function for buckets
function getNodeTooltipContentsForBucket(currObj,formatType) {
    var nodes = currObj['children'];
    //var avgCpu = d3.mean(nodes,function(d){return d.x});
    //var avgMem = d3.mean(nodes,function(d){return d.y});
    var tooltipContents = [
        {label:'', value: 'No. of Nodes: ' + nodes.length},
        {label:'Avg. CPU', value:$.isNumeric(currObj['x']) ? currObj['x'].toFixed(2)  + '%' : currObj['x']},
        {label:'Avg. Memory', value:$.isNumeric(currObj['y']) ? formatBytes(currObj['y'] * 1024* 1024) : currObj['y']}
    ];
    if(formatType == 'simple') {
        return tooltipContents;
    } else {
        return {
            content: {
                info: tooltipContents.slice(1),
                actions: [
                    {
                        type: 'link',
                        text: 'View',
                        iconClass: 'icon-external-link',
                        // callback: onScatterChartClick
                    }
                ]
            },
            title: {
                name: tooltipContents[0]['value'],
                type: 'virtual router'
            }
        }
    }
}

var bgpMonitor = {
    vRouterBubbleSizeFn: function(mergedNodes) {
        return d3.max(mergedNodes,function(d) {
            return d.size;
        });
    },
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
    onDbNodeDrillDown:function(currObj) {
        layoutHandler.setURLHashParams({node:currObj['name'], tab:''}, {p:'mon_infra_database'});
    },
    vRouterTooltipFn: function(currObj,formatType) {
        if(currObj['children'] != null && currObj['children'].length == 1)
            return getNodeTooltipContents(currObj['children'][0],formatType);
        else
            return getNodeTooltipContents(currObj,formatType);
    },
    vRouterBucketTooltipFn: function(currObj,formatType) {
        return getNodeTooltipContentsForBucket(currObj,formatType);
    },
    controlNodetooltipFn: function(currObj,formatType) {
        return getNodeTooltipContents(currObj,formatType);
    },
    analyticNodeTooltipFn: function(currObj,formatType) {
        var tooltipContents = [];
        if(currObj['pendingQueryCnt'] != null && currObj['pendingQueryCnt'] > 0)
            tooltipContents.push({label:'Pending Queries', value:currObj['pendingQueryCnt']});
        return getNodeTooltipContents(currObj,formatType).concat(tooltipContents);
    },
    configNodeTooltipFn: function(currObj,formatType) {
        return getNodeTooltipContents(currObj,formatType);
    },
    dbNodeTooltipFn: function(currObj,formatType) {
        return getDbNodeTooltipContents(currObj,formatType);
    },
    getNextHopType:function (data) {
    	var type = data['path']['nh']['NhSandeshData']['type'];
    	if($.type(type) != "string"){
    		return '-';
    	} else {
    		return type;
    	}
    },
    getNextHopDetails:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        var peer = nhData['peer'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], tunnelType = nextHopData['tunnel_type'], valid = nextHopData['valid'], vrf = nextHopData['vrf'];
        if (nhType == 'arp') {
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) +
                    wrapLabelValue('Mac', nextHopData['mac']) +
                    wrapLabelValue('IP', nextHopData['sip']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Destination VN', nhData['dest_vn'])  +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +
                    wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Label', lbl) +
            		wrapLabelValue('Tunnel type', tunnelType) +
            		wrapLabelValue('Policy', policy) +
            		wrapLabelValue('Peer', peer) +
            		wrapLabelValue('Valid', valid));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Label', lbl) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'discard') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
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
            var x = contrail.format(wrapLabelValue('Source IP', sip) +
                    wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Label', label) +
                    wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) +
        	        wrapLabelValue('Destination IP', dip) +
        	        wrapLabelValue('vrf', vrf) +
        	        wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Label', lbl));
                return x;
        }
    },
    getNextHopDetailsForMulticast:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        var nhData = data['path'];
        var peer = nhData['peer'];
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
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) +
                    wrapLabelValue('Mac', nextHopData['mac']) +
                    wrapLabelValue('Source IP', nextHopData['sip']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Destination VN', nhData['dest_vn']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'receive') {
            return contrail.format(wrapLabelValue('Reference Count', refCount) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Policy', policy));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Label', lbl) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else {
            var x = contrail.format(wrapLabelValue('Source IP', sip) +
                    wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Label', label) +
                    wrapLabelValue('Multicast Data', mcDataString));
            return x;
        }
    },
    getNextHopDetailsForL2:function (data) {
        var nhType = bgpMonitor.getNextHopType(data);
        //var nhData = jsonPath(data,'$..PathSandeshData').pop();
        var nhData = data['path'];
        var peer = nhData['peer'];
        //nhData['nh'] = nhData['nh']['NhSandeshData'];
        var nextHopData = nhData['nh']['NhSandeshData'];
        var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
        var sip = nextHopData['sip'], dip = nextHopData['dip'], valid = nextHopData['valid'], vrf = nextHopData['vrf'], tunnelType = nextHopData['tunnel_type'];
        if (nhType == 'arp') {
            //return contrail.format('Intf: {0} VRF: {1} Mac: {2} Source IP: {3}',nextHopData['itf'],nextHopData['vrf'],nextHopData['mac'],nextHopData['sip']);
            return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) +
                    wrapLabelValue('Mac', nextHopData['mac']) +
                    wrapLabelValue('IP', nextHopData['sip']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'resolve' || nhType == 'receive') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Destination VN', nhData['dest_vn']) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
        } else if (nhType == 'interface') {
            return contrail.format(wrapLabelValue('Interface', intf) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Policy', policy));
        } else if (nhType == 'tunnel') {
            return contrail.format(wrapLabelValue('Source IP', sip) +
                    wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Vrf', vrf) +
            		wrapLabelValue('Label', lbl) +
            		wrapLabelValue('Tunnel type', tunnelType));
        } else if (nhType == 'vlan') {
            return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                    wrapLabelValue('Destination VN', destVN) +
                    wrapLabelValue('Label', lbl) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid));
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
            var x = contrail.format(wrapLabelValue('Source IP', sip) +
                    wrapLabelValue('Destination IP', dip) +
                    wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Ref count', refCount) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Label', label) +
                    wrapLabelValue('Multicast Data', mcDataString));
            return x;
        } else {
        	var x = contrail.format(wrapLabelValue('Source IP', sip) +
        	        wrapLabelValue('Destination IP', dip) +
        	        wrapLabelValue('vrf', vrf) +
                    wrapLabelValue('Policy', policy) +
                    wrapLabelValue('Peer', peer) +
                    wrapLabelValue('Valid', valid) +
                    wrapLabelValue('Label', lbl));
                return x;
        }
    },
}

/** Function to update the header with the current shown number of nodes and the total number of nodes. Used in vRouter summary chart*/
function updatevRouterLabel(selector,filteredCnt,totalCnt){
    var infoElem = $(selector).find('h4');
//    var infoElem = $('#'+ headerid);
    var innerText = infoElem.text().split('(')[0].trim();
    if (totalCnt == filteredCnt)
        innerText += ' (' + totalCnt + ')';
    else
        innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
    infoElem.text(innerText);
}

function isNTPUnsynced (nodeStatus){
    if(nodeStatus == null || !nodeStatus || nodeStatus.process_status == null){
        return false;
    }
    var processStatus = nodeStatus.process_status;
    for(var i = 0; i < processStatus.length; i++){
        var procstat = processStatus[i];
        if(procstat.description != null && procstat.description.toLowerCase().indexOf("ntp state unsynchronized") != -1){
            return true;
        }
    }
}

function updateGridTitleWithPagingInfo(gridSel,pagingInfo) {
    var gridHeaderTextElem = $(gridSel).find('.grid-header-text');
    var pageInfoTitle = '';
    var entriesText = pagingInfo['entries'];
    var extractedData;
    if(typeof(entriesText) == 'string' ) {
        extractedData = entriesText.match(/(\d+)-(\d+)\/(\d+)/);
    }

    if(extractedData instanceof Array) {
        var startCnt = parseInt(extractedData[1]);
        var endCnt = parseInt(extractedData[2]);
        var totalCnt = parseInt(extractedData[3]);
        pageInfoTitle = contrail.format(' ({0} - {1} of {2})',startCnt+1,endCnt+1,totalCnt);
    } else {
        if(pagingInfo['entries'] != null) {
            pageInfoTitle = ' (' + pagingInfo['entries'] + ')';
        }
    }
    if(gridHeaderTextElem.find('span').length == 0) {
        gridHeaderTextElem.append($('<span>',{}));
    } else {
        gridHeaderTextElem.find('span').text('');
    }
    gridHeaderTextElem.find('span').text(pageInfoTitle);
}

function onPrevNextClick(obj,cfg) {
    var gridSel = $(cfg['gridSel']);
    if(gridSel.length == 0) {
        return;
    }
    var newAjaxConfig = "";
    var cfg = ifNull(cfg,{});
    var paginationInfo = ifNull(cfg['paginationInfo'],{});
    //Populate last_page based on entries and first_page
    paginationInfo['last_page'] = paginationInfo['first_page'];
    var xStrFormat = /(begin:)\d+(,end:)\d+(,table:.*)/;
    var entriesFormat = /.*\/(\d+)/;
    var totalCnt;
    if(paginationInfo['entries'] != null && paginationInfo['entries'].match(entriesFormat) instanceof Array) {
        var patternResults = paginationInfo['entries'].match(entriesFormat);
        //Get the total count from entries as with some filter applied,total count will not be same as table size
        totalCnt = parseInt(patternResults[1]);
    }
    if(paginationInfo['last_page'] != null && paginationInfo['last_page'].match(xStrFormat) instanceof Array) {
        if(totalCnt == null) {
            totalCnt = parseInt(paginationInfo['table_size']);
        }
        paginationInfo['last_page'] = paginationInfo['last_page'].replace(xStrFormat,'$1' + (totalCnt - (totalCnt%100)) + '$2' + ((totalCnt - (totalCnt%100)) + 99)+ '$3');
    }
    var getUrlFn = ifNull(cfg['getUrlFn'],$.noop);
    var dirType = ifNull(cfg['dirType'],'');
    var gridInst = gridSel.data('contrailGrid');
    var urlObj = getUrlFn();
    var urlStr = null,xKey = null;
    if(dirType == 'next') {
        xKey = 'next_page';
    } else if(dirType == 'prev') {
        xKey = 'prev_page';
    } else if(dirType == 'first') {
        xKey = 'first_page';
    } else if(dirType == 'last') {
        xKey = 'last_page';
    }
    if(paginationInfo[xKey] != null) {
        urlObj['params']['x'] = paginationInfo[xKey];
    }
    if(typeof(urlObj) == 'object') {
        urlStr = urlObj['url'] + '?' + $.param(urlObj['params']);
    }
    newAjaxConfig = {
            url: urlStr,
            type:'Get'
        };
    if(gridInst != null) {
        gridInst.showGridMessage('loading');
        gridInst.setRemoteAjaxConfig(newAjaxConfig);
        reloadGrid(gridInst);
    }
}

function bindGridPrevNextListeners(cfg) {
    var cfg = ifNull(cfg,{});
    var gridSel = cfg['gridSel'];
    var paginationInfo;
    gridSel.find('i.icon-step-forward').parent().click(function() {
        paginationInfo = cfg['paginationInfoFn']();
        //Ignore if already on first page
        if(paginationInfo['last_page'] == '') {
            return;
        }
        onPrevNextClick(cfg['obj'], {
            dirType: 'last',
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
    gridSel.find('i.icon-forward').parent().click(function() {
        paginationInfo = cfg['paginationInfoFn']();
        //Ignore if already on first page
        if(paginationInfo['next_page'] == '') {
            return;
        }
        onPrevNextClick(cfg['obj'], {
            dirType: 'next',
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
    gridSel.find('i.icon-step-backward').parent().click(function() {
        paginationInfo = cfg['paginationInfoFn']();
        //Ignore if already on last page
        if(paginationInfo['first_page'] == '') {
            return;
        }
        onPrevNextClick(cfg['obj'], {
            dirType: 'first',
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
    gridSel.find('i.icon-backward').parent().click(function() {
        paginationInfo = cfg['paginationInfoFn']();
        //Ignore if already on last page
        if(paginationInfo['prev_page'] == '') {
            return;
        }
        onPrevNextClick(cfg['obj'], {
            dirType: 'prev',
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
    gridSel.parent().find('.btn-display').click(function() {
        paginationInfo = cfg['paginationInfoFn']();
        onPrevNextClick(cfg['obj'], {
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
    gridSel.parent().find('.btn-reset').click(function() {
        cfg['resetFn']();
        onPrevNextClick(cfg['obj'],{
            gridSel: gridSel,
            paginationInfo: paginationInfo,
            getUrlFn: cfg['getUrlFn']
        });
    });
}
