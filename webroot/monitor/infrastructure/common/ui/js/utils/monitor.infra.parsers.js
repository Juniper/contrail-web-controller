/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
       [ 'underscore' ,
        'core-alarm-utils'],
       function(_,coreAlarmUtils) {
            var MonInfraParsers = function() {
                var self = this;
                var noDataStr = monitorInfraConstants.noDataStr;
                var formatMemory = monitorInfraUtils.formatMemory;
                var UVEModuleIds = monitorInfraConstants.UVEModuleIds;
                var getOverallNodeStatus = monitorInfraUtils.getOverallNodeStatus;

                //Parser for controlnode Dashboard data
                this.parseControlNodesDashboardData = function (result) {

                    var retArr = [];
                    $.each(result,function(idx,d) {
                        var obj = {};
                        var routerType = getValueByJsonPath(d,
                            "value;ConfigData;bgp-router;bgp_router_parameters;router_type",
                            null);
                        if($.inArray(routerType, ctwc.BGP_AAS_ROUTERS) !== -1) {
                            return true;
                        }
                        var memCpuUsage = jsonPath(d,'$.value.NodeStatus.process_mem_cpu_usage' +
                                            '[?(@.module_id=="contrail-control")]')[0];
                        obj['x'] = parseInt(getValueByJsonPath(memCpuUsage,'cpu_share'));
                        obj['y'] = parseInt(getValueByJsonPath(memCpuUsage,'mem_res'))/1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : NaN;
                        obj['memory'] = formatBytes(obj['y'] * 1024 * 1024);
                        obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                        obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                        obj['histCpuArr'] =
                            monitorInfraUtils.parseUveHistoricalValues(d,'$.cpuStats.history-10');
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
                        obj['summaryIps'] = monitorInfraUtils.
                                            getControlIpAddresses(d,"summary");
                        obj['size'] = ifNull(jsonPath(d,'$..output_queue_depth')[0],0);
                        obj['shape'] = 'circle';
                        obj['name'] = d['name'];
                        obj['link'] =
                            {
                                p: 'mon_infra_control',
                                q: {
                                    type: 'controlNode',
                                    view: 'details',
                                    focusedElement: {
                                        node: obj['name'],
                                        tab:'details'
                                    }
                                }
                            };
                        obj['version'] = ifEmpty(self.getNodeVersion(jsonPath(d,
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
                            obj['isPartialUveMissing'] = 
                                (memCpuUsage == null || cowu.isEmptyObject(memCpuUsage) || cowu.isEmptyObject(
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
                            monitorInfraUtils.isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
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
                        obj['nodeAlerts'] =
                            infraMonitorAlertUtils.processControlNodeAlerts(obj);
                        var alarms = getValueByJsonPath(d,'value;UVEAlarms;alarms',[]);
                        if(cowu.getAlarmsFromAnalytics) {
                            obj['alerts'] = coreAlarmUtils.getAlertsFromAnalytics(
                                                            {
                                                                data:obj,
                                                                alarms:alarms,
                                                                nodeType:'control-node'
//                                                                processPath:processPath
                                                            });
                        } else {
                            obj['alerts'] =
                                obj['nodeAlerts'].concat(obj['processAlerts'])
                                                    .sort(dashboardUtils.sortInfraAlerts);
                        }
                        obj['color'] = monitorInfraUtils.getControlNodeColor(d,obj);
                        obj['isGeneratorRetrieved'] = false;

                        var rawData = $.extend({},d.value,true);
                        delete rawData['derived-uve'];
                        obj['rawData'] = rawData;
                        obj['cores'] = self.getCores(d);
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                //Parser for vRouters data
                this.parsevRoutersDashboardData = function (result) {
                    var retArr = [];
                    if(result.data != null) {
                        result = result.data;
                    }
                    var vRouterCnt = result.length;
                    for (var i = 0; i < vRouterCnt; i++) {
                        var obj = {};
                        var d = result[i];
                        var dValue = result[i]['value'];
                        var memCpuUsage = jsonPath(d,'$.value.NodeStatus.process_mem_cpu_usage' +
                            '[?(@.module_id=="contrail-vrouter-agent")]')[0];
                        var cpu = getValueByJsonPath(memCpuUsage,'cpu_share','--');
                        var mem = getValueByJsonPath(memCpuUsage,'mem_res','--');
                        obj['cpu'] = $.isNumeric(cpu) ? parseFloat(cpu.
                                            toFixed(2)) : NaN;
                        obj['x'] = $.isNumeric(obj['cpu']) ? obj['cpu'] : NaN;
                        obj['resMemory'] = $.isNumeric(mem) ? parseFloat(
                                parseFloat(mem / 1024).toFixed(2)) : NaN;
                        obj['y'] = obj['resMemory'];
                        obj['memory'] = formatBytes(obj['y'] * 1024 * 1024);
                        obj['ip'] = getValueByJsonPath(dValue,
                            'VrouterAgent;control_ip', '-');
                        obj['xField'] = 'cpu';
                        obj['yField'] = 'resMemory';
                        obj['uveIP'] = obj['ip'];
                        obj['summaryIps'] = monitorInfraUtils.getVrouterIpAddresses(dValue, "summary");
                        var iplist = getValueByJsonPath(dValue,
                            'VrouterAgent;self_ip_list', []);
                        if (obj['ip'] != '-')
                            iplist.push(obj['ip']);
                        obj['uveIP'] = iplist;
                        obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(
                            dValue, 'ConfigData')) ? true : false;
                        obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(
                                dValue, 'VrouterAgent')) && $.isEmptyObject(
                                getValueByJsonPath(dValue, 'VrouterStatsAgent'))) ?
                            true : false;
                        obj['isNTPUnsynced'] =
                            monitorInfraUtils.isNTPUnsynced(jsonPath(dValue,
                            '$..NodeStatus')[0]);
                        obj['configIP'] = getValueByJsonPath(dValue,
                            'ConfigData;virtual-router;virtual_router_ip_address',
                            '-');
                        obj['vRouterType'] = getValueByJsonPath(dValue,
                            'ConfigData;virtual-router;virtual_router_type',
                            'hypervisor');
                        obj['vRouterPlatform'] = getValueByJsonPath(dValue,
                                'VrouterAgent;platform',
                                 '');
                        if(obj['vRouterType'] instanceof Array) {
                            obj['vRouterType'] = obj['vRouterType'][0];
                        }
                        if (obj['vRouterType'] == '' ||
                            obj['vRouterType'] == null) {
                            obj['vRouterType'] = 'hypervisor'; //set default to hypervisor
                        }
                        obj['moduleId'] = getValueByJsonPath(dValue,
                            'NodeStatus;process_status;0;module_id', UVEModuleIds[
                                'VROUTER_AGENT']);
                        if (obj['ip'] == '-') {
                            obj['ip'] = obj['configIP'];
                        }
                        obj['histCpuArr'] = monitorInfraUtils.parseUveHistoricalValues(d,
                            '$.cpuStats.history-10');
                        obj['status'] = getOverallNodeStatus(d, 'compute');
                        var dnsServerIP = [];
                        var processStatus = getValueByJsonPath(dValue,
                                'NodeStatus;process_status', []);
                        $.each(processStatus, function(idx, proStatusChild) {
                            if(proStatusChild['module_id'] === monitorInfraConstants.UVEModuleIds.VROUTER_AGENT){
                                $.each(proStatusChild['connection_infos'],function(idx, connInfoChild){
                                    if(connInfoChild['name'] !== null && connInfoChild['type'] === 'XMPP'){
                                        if(connInfoChild['name'].indexOf(monitorInfraConstants.DNS_SERVER) === 0){
                                            var dnsIP = connInfoChild['name'].substring(monitorInfraConstants.DNS_SERVER.length) +
                                            ' (' + connInfoChild['status'] + ') ';
                                            dnsServerIP.push(dnsIP);
                                        }
                                    }
                                });
                            }
                        });
                        obj['dnsServerIP'] = dnsServerIP.join(',');
                        var processes = ['contrail-vrouter-agent',
                            'contrail-vrouter-nodemgr', 'supervisor-vrouter'
                        ];
                        obj['outThroughput'] = getValueByJsonPath(dValue,
                            'VrouterStatsAgent;phy_if_5min_usage;0;out_bandwidth_usage', 0);
                        obj['inThroughput'] = getValueByJsonPath(dValue,
                                'VrouterStatsAgent;phy_if_5min_usage;0;in_bandwidth_usage', 0);
                        obj['size'] = obj['outThroughput'] + obj['inThroughput'];
                        obj['shape'] = 'circle';
                        var xmppPeers = getValueByJsonPath(dValue,
                            'VrouterAgent;xmpp_peer_list', []);
                        obj['xmppPeerDownCnt'] = 0;
                        $.each(xmppPeers, function(idx, currPeer) {
                            if (currPeer['status'] != true) {
                                obj['xmppPeerDownCnt']++;
                            }
                        });
                        obj['name'] = d['name'];
                        obj['link'] = {
                            p: 'mon_infra_vrouter',
                            q: {
                                type: "vRouter",
                                view: "details",
                                focusedElement: {
                                    node: obj['name'],
                                    tab: 'details'
                                }
                            }
                        };
                        obj['instCnt'] = getValueByJsonPath(dValue,
                            'VrouterAgent;virtual_machine_list', []).length;
                        obj['intfCnt'] = getValueByJsonPath(dValue,
                            'VrouterAgent;total_interface_count', 0);

                        obj['vnCnt'] = getValueByJsonPath(dValue,
                            'VrouterAgent;vn_count', 0);
                        obj['version'] = ifNullOrEmpty(self.getNodeVersion(
                            getValueByJsonPath(dValue,
                                'VrouterAgent;build_info')), noDataStr);
                        obj['type'] = 'vRouter';
                        obj['display_type'] = 'Virtual Router';
                        obj['isPartialUveMissing'] = false;
                        obj['errorIntfCnt'] = 0;
                        if (obj['isUveMissing'] == false) {
                            var xmppPeers = getValueByJsonPath(dValue,
                                'VrouterAgent;xmpp_peer_list', []);
                            obj['xmppPeerDownCnt'] = 0;
                            $.each(xmppPeers, function(idx, currPeer) {
                                if (currPeer['status'] != true) {
                                    obj['xmppPeerDownCnt']++;
                                }
                            });
                            obj['isPartialUveMissing'] = $.isEmptyObject(
                                    getValueByJsonPath(dValue,
                                        'NodeStatus;process_mem_cpu_usage;cpu_share')) ||
                                $.isEmptyObject(getValueByJsonPath(dValue,
                                    'VrouterAgent;build_info')) ||
                                obj['uveIP'].length == 0 ? true : false;
                            obj['errorIntfCnt'] = getValueByJsonPath(dValue,
                                'VrouterAgent;down_interface_count', 0);
                        }
                        if (obj['errorIntfCnt'] > 0) {
                            obj['errorIntfCntText'] = ", <span class='text-error'>" +
                                obj['errorIntfCnt'] + " Down</span>";
                        } else {
                            obj['errorIntfCntText'] = "";
                        }
                        obj['uveCfgIPMisMatch'] = false;
                        if (obj['isUveMissing'] == false && obj['isConfigMissing'] ==
                            false && obj['isPartialUveMissing'] == false) {
                            obj['uveCfgIPMisMatch'] = (obj['uveIP'].indexOf(obj[
                                    'configIP']) == -1 && obj['configIP'] != '-') ?
                                true : false;
                        }
                        obj['processAlerts'] = infraMonitorAlertUtils.getProcessAlerts(
                            d, obj, 'NodeStatus;process_info');
                        obj['isGeneratorRetrieved'] = false;
                        obj['nodeAlerts'] = infraMonitorAlertUtils.processvRouterAlerts(
                            obj);
                        var alarms = getValueByJsonPath(d,'value;UVEAlarms;alarms',[]);
                        if(cowu.getAlarmsFromAnalytics) {
                            obj['alerts'] = coreAlarmUtils.getAlertsFromAnalytics(
                                                            {
                                                                data:obj,
                                                                alarms:alarms,
                                                                nodeType:'vrouter',
                                                            });
                        } else {
                            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(
                                    dashboardUtils.sortInfraAlerts);
                        }
                        //Decide color based on parameters
                        obj['color'] = monitorInfraUtils.getvRouterColor(d, obj);
                        obj['cores'] = self.getCores(d);
                        var rawData = $.extend({},d.value,true);
                        delete rawData['derived-uve'];
                        obj['rawData'] = rawData;
                        retArr.push(obj);
                    }
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;
                };

              //Parser for analytics node dashboard data
                this.parseAnalyticsNodesDashboardData = function (result) {

                    var retArr = [];
                    $.each(result, function(idx, d) {
                        var obj = {};
                        var memCpuUsage = jsonPath(d,'$.value.NodeStatus.process_mem_cpu_usage' +
                                            '[?(@.module_id=="contrail-collector")]')[0];
                        obj['x'] = parseInt(getValueByJsonPath(memCpuUsage,'cpu_share'));
                        obj['y'] = parseInt(getValueByJsonPath(memCpuUsage,'mem_res'))/1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : NaN;
                        obj['memory'] = formatBytes(obj['y'] * 1024 * 1024);
                        obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                        obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                        obj['histCpuArr'] =
                            monitorInfraUtils.parseUveHistoricalValues(d,'$.cpuStats.history-10');
                        obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                            '$..QueryStats.queries_being_processed')[0], []).length;
                        obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                            '$..QueryStats.pending_queries')[0], []).length;
                        obj['size'] = obj['pendingQueryCnt'];
                        obj['shape'] = 'circle';
                        obj['type'] = 'analyticsNode';
                        obj['display_type'] = 'Analytics Node';
                        obj['version'] = ifEmpty(self.getNodeVersion(jsonPath(d,
                            '$.value.CollectorState.build_info')[0]), '-');
                        try {
                            obj['status'] = getOverallNodeStatus(d, "analytics");
                        } catch(e) {
                            obj['status'] = 'Down';
                        }
                        //get the ips
                        var iplist = ifNull(jsonPath(d,'$..self_ip_list')[0],
                           noDataStr);
                        obj['ip'] = obj['summaryIps'] = noDataStr;
                        if (iplist != null && iplist != noDataStr
                           && iplist.length > 0) {
                            obj['ip'] = iplist[0];
                            var ipString = "";
                            $.each(iplist, function(idx, ip) {
                                if (idx + 1 == iplist.length) {
                                    ipString = ipString + ip;
                                } else {
                                    ipString = ipString + ip + ', ';
                                }
                            });
                            obj['summaryIps'] = ipString;
                        }
                        obj['name'] = d['name'];
                        obj['link'] = {
                            p : 'mon_infra_analytics',
                            q : {
                                type: "analyticsNode",
                                view: "details",
                                focusedElement: {
                                    node: obj['name'],
                                    tab: 'details'
                                }
                            }
                        };
                        obj['errorStrings'] = ifNull(jsonPath(d,
                            "$.value.ModuleCpuState.error_strings")[0], []);
                        obj['isNTPUnsynced'] =
                            monitorInfraUtils.isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                        var isConfigDataAvailable = $.isEmptyObject(jsonPath(d,
                            '$..ConfigData')[0]) ? false : true;
                        obj['isUveMissing'] =
                            ($.isEmptyObject(jsonPath(d,'$..CollectorState')[0])
                            && isConfigDataAvailable) ? true : false;
                        obj['processAlerts'] =
                            infraMonitorAlertUtils.getProcessAlerts(d, obj);
                        obj['isPartialUveMissing'] = false;
                        if (obj['isUveMissing'] == false) {
                            if (cowu.isEmptyObject(jsonPath(d,
                                '$.value.NodeStatus.process_mem_cpu_usage'+
                                '[?(@.module_id=="contrail-collector")].cpu_share')[0])
                                || cowu.isEmptyObject(jsonPath(d,
                                        '$.value.CollectorState.build_info')[0])) {
                                        obj['isPartialUveMissing'] = true;
                            }
                        }
                        obj['isGeneratorRetrieved'] = false;
                        var genInfos = ifNull(jsonPath(d,
                            '$.value.CollectorState.generator_infos')[0], []);
                        obj['genCount'] = genInfos.length;
                        obj['nodeAlerts'] = infraMonitorAlertUtils
                                                .processAnalyticsNodeAlerts(obj);
                        var alarms = getValueByJsonPath(d,'value;UVEAlarms;alarms',[]);
                        alarms = coreAlarmUtils.
                            checkAndAddAnalyticsDownOrAlarmProcessDownAlarms(d,alarms);
                        if(cowu.getAlarmsFromAnalytics) {
                            obj['alerts'] = coreAlarmUtils.getAlertsFromAnalytics(
                                                            {
                                                                data:obj,
                                                                alarms:alarms,
                                                                nodeType:'analytics-node'
                                                            });
                        } else {
                            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                                            .sort(dashboardUtils.sortInfraAlerts);
                        }
                        obj['color'] = monitorInfraUtils.getAnalyticsNodeColor(d, obj);
                        obj['cores'] = self.getCores(d);
                        var rawData = $.extend({},d.value,true);
                        delete rawData['derived-uve'];
                        obj['rawData'] = rawData;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                this.parseConfigNodesDashboardData = function (result) {
                    var retArr = [];
                    $.each(result,function(idx,d) {
                        var obj = {};
                        var memCpuUsage = jsonPath(d,'$.value.NodeStatus.process_mem_cpu_usage' +
                                            '[?(@.module_id="^contrail-api")]')[0];
                        obj['x'] = parseInt(getValueByJsonPath(memCpuUsage,'cpu_share'));
                        obj['y'] = parseInt(getValueByJsonPath(memCpuUsage,'mem_res'))/1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : NaN;
                        obj['memory'] = formatBytes(obj['y']*1024*1024);
                        obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                        obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                        //Re-visit once average response time added for config nodes
                        obj['size'] = 0;
                        obj['version'] = ifEmpty(self.getNodeVersion(jsonPath(d,
                            '$.value.ModuleCpuState.build_info')[0]),'-');
                        obj['shape'] = 'circle';
                        obj['type'] = 'configNode';
                        obj['display_type'] = 'Config Node';
                        obj['name'] = d['name'];
                        obj['link'] =
                            {
                                p: 'mon_infra_config',
                                q: {
                                    type: "configNode",
                                    view: "details",
                                    focusedElement: {
                                        node: obj['name'],
                                        tab: 'details'
                                    }
                                }
                            };
                        obj['isNTPUnsynced'] =
                            monitorInfraUtils.isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                        obj['isConfigMissing'] =
                            $.isEmptyObject(getValueByJsonPath(d,
                                                    'value;ConfigData')) ? true : false;
                        obj['isUveMissing'] =
                            ($.isEmptyObject(getValueByJsonPath(d,'value;configNode')))
                                ? true : false;
                        obj['processAlerts'] =
                            infraMonitorAlertUtils.getProcessAlerts(d,obj);
                        obj['isPartialUveMissing'] = false;
                        try{
                            obj['status'] = getOverallNodeStatus(d,"config");
                        }catch(e){
                            obj['status'] = 'Down';
                        }
                        obj['histCpuArr'] =
                            monitorInfraUtils.parseUveHistoricalValues(d,'$.cpuStats.history-10');
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
                        if(cowu.isEmptyObject(jsonPath(d,
                           '$.value.NodeStatus.process_mem_cpu_usage'+
                           '[?(@.module_id="^contrail-api")]')[0]) ||
                           cowu.isEmptyObject(jsonPath(d,
                                '$.value.ModuleCpuState.build_info')[0])) {
                           obj['isPartialUveMissing'] = true;
                        }
                        obj['isGeneratorRetrieved'] = false;
                        obj['nodeAlerts'] =
                            infraMonitorAlertUtils.processConfigNodeAlerts(obj);
                        var alarms = getValueByJsonPath(d,'value;configNode;UVEAlarms;alarms',[]);
                        if(cowu.getAlarmsFromAnalytics) {
                            obj['alerts'] = coreAlarmUtils.getAlertsFromAnalytics(
                                                            {
                                                                data:obj,
                                                                alarms:alarms,
                                                                nodeType:'config-node'
                                                            });
                        } else {
                            obj['alerts'] =
                                obj['nodeAlerts'].concat(obj['processAlerts'])
                                    .sort(dashboardUtils.sortInfraAlerts);
                        }
                        obj['color'] = monitorInfraUtils.getConfigNodeColor(d,obj);
                        obj['cores'] = self.getCores(d);
                        var rawData = $.extend({},d.value,true);
                        delete rawData['derived-uve'];
                        obj['rawData'] = rawData;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                //Parser for DBNode
                this.parseDatabaseNodesDashboardData = function (result) {

                    var retArr = [];
                    $.each(result,function(idx,d) {
                        var obj = {};
                        var dbSpaceAvailable =
                            parseFloat(jsonPath(d,
                            '$.value.DatabaseUsageInfo.'+
                            'database_usage[0].disk_space_available_1k')[0]);
                        var dbSpaceUsed = parseFloat(jsonPath(d,
                            '$.value.DatabaseUsageInfo.'+
                            'database_usage[0].disk_space_used_1k')[0]);
                        var analyticsDbSize = parseFloat(jsonPath(d,
                            '$.value.DatabaseUsageInfo.'+
                            'database_usage[0].analytics_db_size_1k')[0]);

                        obj['x'] = $.isNumeric(dbSpaceAvailable)?
                            dbSpaceAvailable / 1024 / 1024 : 0;
                        obj['y'] = $.isNumeric(dbSpaceUsed)?
                            dbSpaceUsed / 1024 / 1024 : 0;

                        obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(d,
                            'value;derived-uve;ConfigData')) ? true : false;
                        obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(d,
                            'value;databaseNode'))) ? true : false;
                        obj['version'] = ifEmpty(self.getNodeVersion(getValueByJsonPath(d,
                                            'value;NodeStatus;build_info')),'-');
                        var configData;
                        if(!obj['isConfigMissing']){
                            configData = getValueByJsonPath(d,'value;derived-uve;ConfigData');
                            obj['ip'] = configData.database_node_ip_address;
                        } else {
                            obj['ip'] = noDataStr;
                        }
                        obj['dbSpaceAvailable'] = dbSpaceAvailable;
                        obj['dbSpaceUsed'] = dbSpaceUsed;
                        obj['analyticsDbSize'] = analyticsDbSize;
                        obj['formattedAvailableSpace'] = $.isNumeric(dbSpaceAvailable)?
                            formatBytes(dbSpaceAvailable * 1024) : '-';
                        obj['formattedUsedSpace'] = $.isNumeric(dbSpaceUsed)?
                            formatBytes(dbSpaceUsed * 1024) : '-';
                        //Use the db usage percentage for bubble size
                        var usedPercentage = (obj['y'] * 100) / (obj['y']+obj['x']);
                        obj['usedPercentage'] = usedPercentage;
                        obj['formattedUsedPercentage'] = $.isNumeric(usedPercentage)?
                                usedPercentage.toFixed(2) + ' %': '-' ;
                        obj['formattedAnalyticsDbSize'] = $.isNumeric(analyticsDbSize)?
                            formatBytes(analyticsDbSize * 1024) : '-';
                        obj['formattedUsedSpaceWithPercentage'] =
                            (obj['formattedUsedSpace'] != '-')?
                            obj['formattedUsedSpace']  + ' (' +
                            obj['formattedUsedPercentage'] + ')' :
                                '-';
                        obj['size'] = obj['usedPercentage'];
                        obj['shape'] = 'circle';
                        obj['type'] = 'dbNode';
                        obj['display_type'] = 'Database Node';
                        obj['name'] = d['name'];
                        obj['link'] = {
                            p: 'mon_infra_database',
                            q: {
                                type: "databaseNode",
                                view: "details",
                                focusedElement: {
                                    node: obj['name'],
                                    tab: 'details'
                                }
                            }
                        };
                        obj['processAlerts'] =
                            infraMonitorAlertUtils.getProcessAlerts(d,obj);
                        obj['isPartialUveMissing'] = false;
                        try{
                            obj['status'] = getOverallNodeStatus(d,"db");
                        }catch(e){
                            obj['status'] = 'Down';
                        }
                        obj['isNTPUnsynced'] =
                            monitorInfraUtils.isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                        obj['nodeAlerts'] =
                            infraMonitorAlertUtils.processDbNodeAlerts(obj);
                        var alarms = getValueByJsonPath(d,'value;databaseNode;UVEAlarms;alarms',[]);
                        if(cowu.getAlarmsFromAnalytics) {
                            obj['alerts'] = coreAlarmUtils.getAlertsFromAnalytics(
                                                            {
                                                                data:obj,
                                                                alarms:alarms,
                                                                nodeType:'database-node',
                                                            });
                        } else {
                            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                                        .sort(dashboardUtils.sortInfraAlerts);
                        }
                        obj['color'] = monitorInfraUtils.getDatabaseNodeColor(d,obj);
                        obj['cores'] = self.getCores(d);
                        var rawData = $.extend({},d.value,true);
                        delete rawData['derived-uve'];
                        obj['rawData'] = rawData;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                this.bucketizeConfigNodeStats = function (apiStats, bucketDuration) {
                    bucketDuration  = ifNull(bucketDuration, monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION);
                    var minMaxTS = d3.extent(apiStats,function(obj){
                        return obj['T'];
                    });
                    //If only 1 value extend the range by 10 mins on both sides
                    if(minMaxTS[0] == minMaxTS[1]) {
                        minMaxTS[0] -= monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION;
                        minMaxTS[1] += monitorInfraConstants.CONFIGNODESTATS_BUCKET_DURATION;
                    }
                    /* Bucketizes timestamp every 10 minutes */
                    var xBucketScale = d3.scale.quantize().domain(minMaxTS).range(d3.range(minMaxTS[0],minMaxTS[1], bucketDuration));
                    var buckets = {};
                    //Group nodes into buckets
                    $.each(apiStats,function(idx,obj) {
                        var xBucket = xBucketScale(obj['T']);
                        if(buckets[xBucket] == null) {
                            var timestampExtent = xBucketScale.invertExtent(xBucket);
                            buckets[xBucket] = {timestampExtent:timestampExtent,
                                                data:[]};
                        }

                        buckets[xBucket]['data'].push(obj);
                    });
                    return buckets;
                };

                this.parseConfigNodeRequestsStackChartData = function (apiStats) {
                    var cf =crossfilter(apiStats);
                    var parsedData = [];
                    var timeStampField = 'T';
                    var groupDim = cf.dimension(function(d) { return d["Source"];});
                    var tsDim = cf.dimension(function(d) { return d[timeStampField];});
                    var buckets = this.bucketizeConfigNodeStats(apiStats);
                    var colorCodes = monitorInfraConstants.CONFIGNODE_COLORS;
                    colorCodes = colorCodes.slice(0, groupDim.group().all().length);
                    //Now parse this data to be usable in the chart
                    var parsedData = [];
                    for(var i  in buckets) {
                        var y0 = 0, counts = [], totalFailedReqs = 0;
                        var timestampExtent = buckets[i]['timestampExtent'];
                        tsDim.filter(timestampExtent);
                        var reqCntData = groupDim.group().all();
                        //Getting nodes group with failed requests as value
                        var reqFailedData = groupDim.group().reduceSum(
                            function (d) {
                                if (parseInt(d['api_stats.resp_code']) != 200) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            });
                        //Getting nodes group with response time as value
                        var totalResTimeData = groupDim.group().reduceSum(
                            function (d) {
                                return d['api_stats.response_time_in_usec'];
                            });
                        var reqFailedArr = reqFailedData.top(Infinity);
                        var resTimeArr = totalResTimeData.top(Infinity);
                        var reqFailedArrLen = reqFailedArr.length;
                        var resTimeArrLen = resTimeArr.length;
                        var reqFailedNodeMap = {}, resTimeNodeMap = {};
                        //Constructing the node - responsetime map
                        for (var j = 0; j < resTimeArrLen; j++) {
                            resTimeNodeMap[resTimeArr[j]['key']] =
                                resTimeArr[j]['value'];
                        }
                        //Constructing the node - failedRequestCnt map
                        for (var j = 0; j < reqFailedArrLen; j++) {
                            totalFailedReqs += reqFailedArr[j]['value']
                            reqFailedNodeMap[reqFailedArr[j]['key']] =
                                reqFailedArr[j]['value'];
                        }
                        var totalReqs = 0;
                        for (var j = 0, len = reqCntData.length; j < len; j++) {
                            totalReqs += reqCntData[j]['value']
                        }
                        counts.push({
                            name: monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_TITLE,
                            totalReqs: totalReqs,
                            totalFailedReq: totalFailedReqs,
                            color: monitorInfraConstants.CONFIGNODE_FAILEDREQUESTS_COLOR,
                            y0: y0,
                            y1: y0 += totalFailedReqs
                        });
                        for(var j=0,len=reqCntData.length;j<len;j++) {
                            var nodeName = reqCntData[j]['key'];
                            var nodeReqCnt = reqCntData[j]['value'];
                            var failedReqPerNode = ifNull(reqFailedNodeMap[nodeName], 0);
                            var failedReqPerNodePercent = 0;
                            if (failedReqPerNode != 0 && nodeReqCnt != 0) {
                                failedReqPerNodePercent = Math.round((failedReqPerNode/nodeReqCnt) * 100);
                            }
                            var avgResTime = Math.round((ifNull(resTimeNodeMap[nodeName], 0)/nodeReqCnt)) / 1000; //Converting to millisecs
                            var fromTime = new XDate((timestampExtent[0]/1000)).toString('HH:mm');
                            var toTime = new XDate((timestampExtent[1]/1000)).toString('HH:mm');
                            counts.push({
                                name: nodeName,
                                color: colorCodes[j],
                                avgResTime: contrail.format('{0} {1}', avgResTime, 'ms'),
                                nodeReqCnt: nodeReqCnt,
                                reqFailPercent: failedReqPerNodePercent,
                                time: contrail.format('{0}', fromTime),
                                y0:y0,
                                y1:y0 += nodeReqCnt
                            });
                        }
                        parsedData.push({
                            colorCodes: colorCodes,
                            counts: counts,
                            total: totalReqs,
                            timestampExtent: timestampExtent,
                            date: new Date(i / 1000)
                        });
                    }
                    return parsedData;
                };
                this.parseConfigNodeResponseStackedChartData = function (apiStats) {
                    var cf = crossfilter(apiStats);
                    var buckets = this.bucketizeConfigNodeStats(apiStats, 240000000);
                    var colors = monitorInfraConstants.CONFIGNODE_COLORS;
                    var tsDim = cf.dimension(function (d) {return d.T});
                    var sourceDim = cf.dimension(function (d) {return d.Source});
                    var sourceGroupedData = sourceDim.group().all();
                    var nodeMap = {}, chartData = [];
                    $.each(sourceGroupedData, function (idx, obj) {
                        nodeMap[obj['key']] = {
                            key: obj['key'],
                            values: [],
                            bar: true,
                            color: colors[idx] != null ? colors[idx] : cowc.D3_COLOR_CATEGORY5[1]
                        };
                        chartData.push(nodeMap[obj['key']]);
                    });
                    var lineChartData = {
                        key: ctwl.RESPONSE_SIZE,
                        values: [],
                        color: '#7f9d92'
                    }
                    for (var i in buckets) {
                        var timestampExtent = buckets[i]['timestampExtent'],
                            aggResSize = 0,
                            avgResSize = 0,
                            nodeReqMap = {};
                        tsDim.filter(timestampExtent);
                        var bucketRequestsCnt = tsDim.top(Infinity).length;
                        sourceGroupedData = sourceDim.group().all();
                        $.each(sourceGroupedData, function(idx, obj) {
                            nodeReqMap[obj['key']] = obj['value'];
                        });
                        var resTimeData = sourceDim.group().reduceSum(function (d) {
                            return d['api_stats.response_time_in_usec'];
                        });
                        var resSizeData = sourceDim.group().reduceSum(function (d) {
                            return d['api_stats.response_size'];
                        });
                        var resTimeArr = resTimeData.top(Infinity);
                        var resSizeArr = resSizeData.top(Infinity);
                        var resTimeArrLen = resTimeArr.length;
                        var resSizeArrLen = resSizeArr.length;
                        var resTimeNodeMap = {}, resSizeNodeMap = {};
                        //Averaging the response time on node basis
                        for (var j = 0; j < resTimeArrLen; j++) {
                            if (nodeMap[resTimeArr[j]['key']] != null ) {
                                var avgResTime = 0;
                                avgResTime = resTimeArr[j]['value']/nodeReqMap[resTimeArr[j]['key']];
                                avgResTime = avgResTime/1000; // converting to milli secs
                                nodeMap[resTimeArr[j]['key']]['values'].push({
                                    x: Math.round(i/1000),
                                    y: avgResTime
                                });
                            }
                        }
                        //Calculating the aggregrate response size of all the nodes
                        //in particular interval and averaging with overall requests
                        //in the particular time interval.
                        for (var j = 0; j < resSizeArrLen; j++) {
                            aggResSize += resSizeArr[j]['value'];
                        }
                        avgResSize = aggResSize/bucketRequestsCnt;
                        lineChartData['values'].push({
                            x: Math.round(i/1000),
                            y: avgResSize
                        });
                    }
                    chartData.push(lineChartData);
                    return chartData;

                };
                this.parseConfigNodeRequestForDonutChart = function (apiStats, reqType) {
                    var cf = crossfilter(apiStats),
                        parsedData = [],
                        colors = monitorInfraConstants.CONFIGNODE_COLORS;
                    if (!$.isArray(reqType)) {
                        reqType = [reqType];
                    }
                    var reqTypeDim = cf.dimension(function (d) {return d['api_stats.operation_type']});
                    var sourceDim = cf.dimension(function (d) {return d['Source']});
                    var sourceGrpDim = sourceDim.group().reduceSum(function(d) {
                        if (reqType.indexOf(d['api_stats.operation_type']) > -1) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    var sourceGrpData = sourceGrpDim.all();
                    $.each(sourceGrpData, function (key, value){
                        parsedData.push({
                            label: value['key'],
                            value: value['value'],
                            color: colors[key]
                        });
                    });
                    return parsedData;
                };
                this.getNodeVersion = function (buildStr) {
                    var verStr = '';
                    if(buildStr != null) {
                        var buildInfo;
                        try {
                             buildInfo = JSON.parse(buildStr);
                        } catch(e) {
                        }
                        if((buildInfo != null) && (buildInfo['build-info']
                            instanceof Array)) {
                            var buildObj = buildInfo['build-info'][0];
                            verStr = buildObj['build-version'] + ' (Build ' +
                            buildObj['build-number'] + ')'
                        }
                    }
                    return verStr;
                };
                //Parser function for Control Node Routes

                this.getSecurityGroup = function (sg){
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

                this.parseRoutes = function (response,routesQueryString) {
                    var routesArr = [], routeTables = [], routeInstances = [];
                    var routes = response;
                    var selAddFamily = (routesQueryString['addrFamily'] == null ||
                            routesQueryString['addrFamily'] == '')? 'All' :
                                routesQueryString['addrFamily'];
                    var selPeerSrc = (routesQueryString['peerSource'] == null ||
                            routesQueryString['peerSource'] == '')? 'All' :
                                routesQueryString['peerSource'];
                    var selProtocol = (routesQueryString['protocol'] == null ||
                            routesQueryString['protocol'] == '')? 'All' :
                                routesQueryString['protocol'];
                    routes = jsonPath(response, '$..ShowRoute');
                    routeTables = jsonPath(response, '$..routing_table_name');
                    routeInstances = jsonPath(response, '$..routing_instance');
                    //routes = flattenList(routes);
                    var routesLen = routes.length;
                    for (var i = 0; i < routesLen; i++) {
                     var isRtTableDisplayed = false;
                     if(!(routes[i] instanceof Array)) {
                        routes[i] = [routes[i]];
                        }
                        $.each(routes[i], function (idx, value) {
                            var currRoute = value;
                            var paths = jsonPath(currRoute,"$..ShowRoutePath")[0];
                            if(!(paths instanceof Array)) {
                              paths = [paths];
                            }
                            var pathsLen = paths.length;
                            var alternatePaths = [],bestPath = {};
                            var rtTable = routeTables[i];
                            var securityGroup = "--";
                            //Multiple paths can be there for a given prefix
                            $.each(paths, function (idx,obj) {
                              var rtable= routeTables[i];
                              var origVn = obj['origin_vn'];
                              var addfamily = '-';
                              if(rtable != null){
                                 addfamily = (rtable.split('.').length == 3) ?
                                         rtable.split('.')[1] : rtable;
                              }
                              var rawJson = obj;
                              var sg = self.getSecurityGroup(jsonPath(obj,
                                      "$..communities..element")[0]);
                              //Fitering based on Address Family, Peer Source and Protocol selection
                              if((selAddFamily == "All" || selAddFamily == addfamily) &&
                                    (selPeerSrc == "All" || selPeerSrc == obj['source']) &&
                                    (selProtocol == "All" || selProtocol == obj['protocol'])){
                                 var src = obj['source'];
                                 var protocol = ifNullOrEmptyObject(
                                         obj['protocol'],noDataStr);
                                 var nextHop = ifNullOrEmptyObject(
                                         obj['next_hop'],noDataStr);
                                 var label = ifNullOrEmptyObject(
                                         obj['label'],noDataStr);
                                 var prefix = ifNullOrEmptyObject(
                                         currRoute['prefix'],noDataStr);
                                 src = ifNullOrEmptyObject(src, noDataStr).
                                         split(":").pop();
                                 origVn = ifNullOrEmptyObject(origVn, noDataStr) ;

                                    if(idx == 0) {
                                       routesArr.push({
                                          prefix:prefix,
                                          dispPrefix:prefix,
                                          table:rtTable,
                                          instance:routeInstances[i],
                                          addrFamily:addfamily,
                                          sg:ifEmpty(sg,'-'),
                                          raw_json:rawJson,
                                          originVn:origVn,
                                          protocol:protocol,
                                          source:src,
                                          next_hop:nextHop,
                                          label:label
                                       });
                                    } else {
                                       routesArr.push({
                                          prefix:prefix,
                                          dispPrefix:prefix,
                                          table:rtTable,
                                          instance:routeInstances[i],
                                          addrFamily:addfamily,
                                          sg:ifEmpty(sg,'-'),
                                          raw_json:rawJson,
                                          originVn:origVn,
                                          protocol:protocol,
                                          source:src,
                                          next_hop:nextHop,
                                          label:label
                                       });
                                    }
                                    isRtTableDisplayed = true;
                              }
                            });
                        });
                    }
                    routesArr = cowu.flattenList(routesArr);
                    return routesArr;

                }
                this.parseGeneratorsData = function(result){
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
                };
                this.parseCpuStatsData = function(statsData){
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
                };
                this.parseCpuMemStats = function(statsData,nodeType){
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
                };

                this.parseVRouterDetails = function (data) {
                    var vRouterDetails = {};
                    //If IP address is not available in UVE,pick it from ConfigData
                    vRouterDetails['ip'] = getValueByJsonPath(data,'VrouterAgent;self_ip_list;0',
                            getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address'));
                    vRouterDetails['introspectPort'] = getValueByJsonPath(data,'VrouterAgent;sandesh_http_port',
                            monitorInfraConstants.defaultIntrospectPort);
                    vRouterDetails['vrouterModuleId'] = getValueByJsonPath(data,'NodeStatus;process_status;0;module_id',
                            monitorInfraConstants.UVEModuleIds['VROUTER_AGENT']);
                    vRouterDetails['vRouterType'] = getValueByJsonPath(data,
                            'ConfigData;virtual-router;virtual_router_type','hypervisor');
                        if(vRouterDetails['vRouterType'] instanceof Array) {
                            vRouterDetails['vRouterType'] =
                                vRouterDetails['vRouterType'][0];
                        }
                        if(vRouterDetails['vRouterType'] == '' ||
                                vRouterDetails['vRouterType'] == null) {
                            vRouterDetails['vRouterType'] = 'hypervisor';
                        }
                   return vRouterDetails;
                };

                this.parseVRouterInterfaceData = function(response) {
                    var retArray = [];
                    var sandeshData = jsonPath(response,'$..ItfSandeshData');
                    paginationInfo = getIntrospectPaginationInfo(response);
                    var sdata = [];
                    if(sandeshData != null){
                        $.each(sandeshData,function(idx,obj){
                            if(!(obj instanceof Array)){
                                sdata = sdata.concat([obj]);
                            } else {
                                sdata = sdata.concat(obj)
                            }
                        });

                        $.each(sdata, function (idx, obj) {
                            var rawJson = $.extend({},obj,true);
                            obj['vn_name'] = ifNullOrEmptyObject(obj['vn_name'],noDataStr);
                            obj['vm_uuid'] = ifNullOrEmptyObject(obj['vm_uuid'],noDataStr);
                            obj['vm_name'] = ifNullOrEmptyObject(obj['vm_name'],noDataStr);

                            var parts = obj['vn_name'].split(":"), dispVNName=obj['vn_name'];
                            if(parts.length == 3){
                                if(parts[2] != null) {dispVNName = parts[2];}
                                if(parts[1] != null) {dispVNName += " ("+parts[1]+")";}
                            }
                            var dispVMName = obj['vm_uuid'] + ' / ' + obj['vm_name'];
                            if(obj['vm_uuid'] == "" && obj['vm_name'] == "") {
                                dispVMName = '';
                            }
                            obj['dispName'] = obj['name'];
                            if(new RegExp(/remote-physical-port/).test(obj['type'])) {
                                var parts = obj['name'].split(":");
                                if(parts.length == 3) {
                                    if(parts[0] == 'default-global-system-config') {
                                        obj['dispName'] = contrail.format('{0}<br/> ({1})',parts[2],parts[1]);
                                    } else {
                                    obj['dispName'] = contrail.format('{0}<br/> ({1}:{2})',parts[2],parts[0],parts[1]);
                                    }
                                }
                            }
                            if(new RegExp(/logical-port/).test(obj['type'])) {
                                var parts = obj['name'].split(":");
                                if(parts.length == 4) {
                                    if(parts[0] == 'default-global-system-config') {
                                        obj['dispName'] = contrail.format('{0}<br/> ({1}:{2})',parts[3],parts[1],parts[2]);
                                    } else {
                                    obj['dispName'] = contrail.format('{0}<br/> ({1}:{2}:{3})',parts[3],parts[0],parts[1],parts[2]);
                                    }
                                }
                            }
                            // if(new RegExp(/vport|logical-port|remote-physical-port/).test(obj['type'])) {
                                if(obj.fip_list != null) {
                                    var fipList = [];
                                    fipList = ifNull(jsonPath(obj,"$..FloatingIpSandeshList")[0],[]);
                                    obj['disp_fip_list'] = self.floatingIPCellTemplate(fipList);
                                }
                                retArray.push({
                                    uuid: obj['uuid'],
                                    name: obj['name'],
                                    label: obj['label'],
                                    active: obj['active'],
                                    dispName: obj['dispName'],
                                    type: obj['type'],
                                    vn_name: obj['vn_name'],
                                    disp_vn_name: dispVNName,
                                    vm_uuid: obj['vm_uuid'],
                                    vm_name: obj['vm_name'],
                                    disp_vm_name: dispVMName,
                                    ip_addr: obj['ip_addr'],
                                    disp_fip_list: obj['disp_fip_list'],
                                    raw_json: rawJson
                                });
                            // }
                        });
                    }
                    return {
                        paginationInfo: paginationInfo,
                        data: retArray
                    };
                }

                this.parseVRouterVNData = function(response) {
                    var data = jsonPath(response,'$..VnSandeshData')[0];
                    var paginationInfo = monitorInfraUtils.getIntrospectPaginationInfo(response);
                    var ret = [];
                    if(data != null){
                        if(!(data instanceof Array)){
                            data = [data];
                        }
                        $.each(data, function (idx, obj) {
                            //Create clone of obj for rawJson if you are adding/modifying any keys in obj
                            var rawJson = obj, acl = noDataStr, vrf = noDataStr;
                            if(!$.isEmptyObject(obj['acl_uuid'])){
                                acl = obj['acl_uuid'];
                            }
                            if(!$.isEmptyObject(obj['vrf_name'])){
                                vrf = obj['vrf_name'];
                            }
                            ret.push({
                                acl_uuid:acl,
                                vrf_name:vrf,
                                name:obj['name'],
                                raw_json:rawJson
                            });
                        });
                        return  {
                            paginationInfo: paginationInfo,
                            data : ret
                        }
                    }
                    else {
                        return {
                            data: []
                        }
                    }
                }

                this.parseVRouterUnicastRoutesData = function(response){

                    var ucastPaths = jsonPath(response,'$..PathSandeshData');
                    paginationInfo = getIntrospectPaginationInfo(response);
                    var paths = [];
                    var uPaths = [];
                    ucastPaths = $.each(ucastPaths,function(idx,obj) {
                        if(obj instanceof Array) {
                            uPaths.push(obj);
                        } else {
                            uPaths.push([obj]);
                        }
                    });
                    var srcIPs = jsonPath(response,'$..src_ip');
                    var srcPrefixLens = jsonPath(response,'$..src_plen');
                    var srcVRFs = jsonPath(response,'$..src_vrf');

                    $.each(uPaths,function(idx,obj) {
                        $.each(obj,function(i,currPath) {
                            var rawJson = currPath;
                            if(i == 0)
                                paths.push({
                                    dispPrefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    prefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    src_vrf: srcVRFs[idx],
                                    raw_json: rawJson
                                });
                            else
                                paths.push({
                                    dispPrefix: '',
                                    prefix: srcIPs[idx] +
                                        ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    src_vrf: srcVRFs[idx],
                                    raw_json: rawJson
                                });

                        });
                    });
                /* paths = $.map(paths,function(obj,idx) {
                        if(obj['path']['nh']['NhSandeshData']['type'] == 'Composite')
                            return null;
                        else
                            return obj;
                    });*/
                    //console.info(paths);
                    return {
                        paginationInfo: paginationInfo,
                        data: paths
                    };
                }

                this.parseVRouterMulticastRoutesData = function(response){

                    var ucastPaths = jsonPath(response,'$..RouteMcSandeshData');
                    paginationInfo = getIntrospectPaginationInfo(response);
                    var paths = [];
                    var uPaths = [];
                    ucastPaths = $.each(ucastPaths,function(idx,obj) {
                        if(obj instanceof Array) {
                            uPaths.push(obj);
                        } else {
                            uPaths.push([obj]);
                        }
                    });
                    var srcIPs = jsonPath(response,'$..src');
                    var srcPrefixLens = jsonPath(response,'$..grp');

                    $.each(uPaths,function(idx,obj) {
                        $.each(obj,function(i,currPath) {
                            var rawJson = currPath;
                            if(i == 0)
                                paths.push({
                                    dispPrefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    prefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    raw_json: rawJson
                                });
                            else
                                paths.push({
                                    dispPrefix: '',
                                    prefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    raw_json: rawJson
                                });

                        });
                    });
                /* TODO i am not ignoring the composite paths for the multicast
                    * paths = $.map(paths,function(obj,idx) {
                        if(obj['path']['nh']['NhSandeshData']['type'] == 'Composite')
                            return null;
                        else
                            return obj;
                    }); */
                    //console.info(paths);
                    return {
                        paginationInfo: paginationInfo,
                        data: paths
                    };
                }

                this.parseVRouterL2RoutesData = function(response){
                    var paths = [];
                    var l2Data = jsonPath(response,'$..RouteL2SandeshData')[0];
                    paginationInfo = getIntrospectPaginationInfo(response);
                    if(l2Data != null){
                        if(!(l2Data instanceof Array)){
                            l2Data = [l2Data];
                        }
                        $.each(l2Data, function(i,obj){
                            var mac = getValueByJsonPath(obj,'mac',noDataStr);
                            var srcVRF = getValueByJsonPath(obj,'src_vrf',noDataStr);
                            var pathSandeshData = getValueByJsonPath(obj,'path_list;list;PathSandeshData',[]);
                            if(!(pathSandeshData instanceof Array)){
                                pathSandeshData = [pathSandeshData];
                            }
                            $.each(pathSandeshData,function(j,currPath){
                                var rawJson = currPath;
                                if(j == 0)
                                    paths.push({
                                        mac: mac,
                                        searchMac: mac,
                                        path: currPath,
                                        src_vrf: srcVRF,
                                        raw_json: rawJson
                                    });
                                else
                                    paths.push({
                                        mac: '',
                                        searchMac: mac,
                                        path: currPath,
                                        src_vrf: srcVRF,
                                        raw_json: rawJson
                                    });
                            });
                        });
                    }
                    return {
                        paginationInfo: paginationInfo,
                        data: paths
                    };
                }

                this.parseVRouterIPv6RoutesData = function(response){

                    var ucastPaths = jsonPath(response,'$..PathSandeshData');
                    paginationInfo = getIntrospectPaginationInfo(response);
                    var paths = [];
                    var uPaths = [];
                    ucastPaths = $.each(ucastPaths,function(idx,obj) {
                        if(obj instanceof Array) {
                            uPaths.push(obj);
                        } else {
                            uPaths.push([obj]);
                        }
                    });
                    var srcIPs = jsonPath(response,'$..src_ip');
                    var srcPrefixLens = jsonPath(response,'$..src_plen');
                    var srcVRFs = jsonPath(response,'$..src_vrf');

                    $.each(uPaths,function(idx,obj) {
                        $.each(obj,function(i,currPath) {
                            var rawJson = currPath;
                            if(i == 0)
                                paths.push({
                                    dispPrefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    prefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    src_vrf: srcVRFs[idx],
                                    raw_json: rawJson
                                });
                            else
                                paths.push({
                                    dispPrefix: '',
                                    prefix: srcIPs[idx] + ' / ' + srcPrefixLens[idx],
                                    path: currPath,
                                    src_ip: srcIPs[idx],
                                    src_plen: srcPrefixLens[idx],
                                    src_vrf: srcVRFs[idx],
                                    raw_json: rawJson
                                });

                        });
                    });
                    return {
                        paginationInfo: paginationInfo,
                        data: paths
                    };
                }

                this.parseVRouterFlowsData = function(response,aclUUID) {
                    var origResponse = response;
                    var isFromACLFlows = false;
                    var ret = [];
                    var lastFlowReq = false;
                    response = jsonPath(origResponse,"$..SandeshFlowData")[0];
                    if (response == null){
                        isFromACLFlows = true;
                        response = jsonPath(origResponse,"$..FlowSandeshData")[0];
                    }
                    var flowKey = jsonPath(origResponse,"$..flow_key")[0];
                    var iterationKey = jsonPath(origResponse,"$..iteration_key")[0];
                    if( response != null ){
                        if(!(response instanceof Array)){
                            response = [response];
                        }
                        if(isFromACLFlows) {
                            $.each(response,function(idx,obj) {
                                var rawJson = obj;

                                ret.push({
                                    acl_uuid: (idx != 0) ? '' : aclUUID,
                                    searchUUID: aclUUID,
                                    src_vn: ifNullOrEmptyObject(obj['source_vn'], noDataStr),
                                    dst_vn: ifNullOrEmptyObject(obj['dest_vn'], noDataStr),
                                    sip: ifNullOrEmptyObject(obj['src'], noDataStr),
                                    src_port: ifNullOrEmptyObject(obj['src_port'], noDataStr),
                                    dst_port: ifNullOrEmptyObject(obj['dst_port'], noDataStr),
                                    setup_time_utc: ifNullOrEmptyObject(obj['setup_time_utc'], noDataStr),
                                    protocol: ifNullOrEmptyObject(obj['protocol'], noDataStr),
                                    dip: ifNullOrEmptyObject(obj['dst'], noDataStr),
                                    stats_bytes: ifNullOrEmptyObject(obj['bytes'], noDataStr),
                                    stats_packets: ifNullOrEmptyObject(obj['packets'], noDataStr),
                                    direction: ifNullOrEmptyObject(obj['direction'], noDataStr),
                                    peer_vrouter: ifNullOrEmptyObject(obj['peer_vrouter'], noDataStr),
                                    deny: ifNullOrEmptyObject(obj['implicit_deny'], noDataStr),
                                    raw_json: rawJson
                                });
                            });
                        } else {
                            $.each(response,function(idx,obj) {
                                var rawJson = obj;
                                ret.push({src_vn:ifNullOrEmptyObject(obj['src_vn_match'],noDataStr),
                                    dst_vn:ifNullOrEmptyObject(obj['dst_vn_match'],noDataStr),
                                    protocol:ifNullOrEmptyObject(obj['protocol'],noDataStr),
                                    sip:ifNullOrEmptyObject(obj['sip'],noDataStr),
                                    src_port:ifNullOrEmptyObject(obj['src_port'],noDataStr),
                                    dip:ifNullOrEmptyObject(obj['dip'],noDataStr),
                                    dst_port:ifNullOrEmptyObject(obj['dst_port'],noDataStr),
                                    setup_time_utc:ifNullOrEmptyObject(obj['setup_time_utc'],noDataStr),
                                    stats_bytes:ifNullOrEmptyObject(obj['stats_bytes'],noDataStr),
                                    stats_packets:ifNullOrEmptyObject(obj['stats_packets'],noDataStr),
                                    direction: ifNullOrEmptyObject(obj['direction'],noDataStr),
                                    peer_vrouter:ifNullOrEmptyObject(obj['peer_vrouter'],noDataStr),
                                    deny:ifNullOrEmptyObject(obj['implicit_deny'],noDataStr),
                                    raw_json:rawJson});
                            });
                        }
                    }
                    //Push the flowKey to the stack for Next use
                    if(flowKey != null && !$.isEmptyObject(flowKey)){
                        //Had to add this hack because sometimes we get into to
                        //this parse function twice leading this to be added twice to the stack
                        if(flowKey != "0-0-0-0-0-0.0.0.0-0.0.0.0" &&
                            flowKeyStack[flowKeyStack.length - 1] != flowKey)
                            flowKeyStack.push(flowKey);
                    }
                    if((flowKey == null) || (flowKey == "0-0-0-0-0-0.0.0.0-0.0.0.0")) {
                        lastFlowReq = true;
                    }
                    //Push the aclIterKey to the stack for Next use
                    if(iterationKey != null && !$.isEmptyObject(iterationKey)){
                        //Had to add this hack because sometimes we get into to
                        //this parse function twice leading this to be added twice to the stack
                        if(iterationKey.indexOf('0-0-0-0-0-0.0.0.0-0.0.0.0') == -1 &&
                            aclIterKeyStack[aclIterKeyStack.length - 1] != iterationKey)
                            aclIterKeyStack.push(iterationKey);
                    }
                    //$('#flowCnt').text(response.flowData.length);
                    return  {data:ret,lastFlowReq:lastFlowReq};
                }

                self.mergeACLAndSGData = function(sgData,aclListModel) {
                    var primaryData = aclListModel.getItems();
                    //map all the sg ids with uuids
                    var sgMap = {};
                    var sgList = ifNull(jsonPath(sgData,"$.SgListResp.sg_list.list.SgSandeshData")[0],[]);
                    if(!(sgList instanceof Array)){
                        sgList = [sgList];
                    }
                    $.each(sgList,function(idx,obj){
                        sgMap[sgList[idx]['sg_id']] =  sgList[idx]['sg_uuid'];
                    });
                    $.each(primaryData,function(idx,obj){
                        if(obj['srcType'] == 'sg'){
                            if(sgMap[obj['srcSgId']] != null){
                                obj['src_vn'] = 'SG : ' + sgMap[obj['srcSgId']];
                            } else {
                                obj['src_vn'] = obj['srcSgId'];
                            }
                        }
                        if(obj['dstType'] == 'sg'){
                            if(sgMap[obj['dstSgId']] != null){
                                obj['dst_vn'] = 'SG : ' + sgMap[obj['dstSgId']];
                            } else {
                                obj['dst_vn'] = obj['dstSgId'];
                            }
                        }
                    });
                    aclListModel.setItems(primaryData);
                    // aclGrid._grid.invalidate();
                    // aclGrid.refreshView();
                }

                this.formatMinMax = function (min, max) {
                    if (min == max) {
                        return min;
                    } else {
                        return min + ' - ' + max;
                    }
                }

                this.parseVRouterACLData = function(response) {

                    var retArr = [];
                    paginationInfo = getIntrospectPaginationInfo(response);
                    response = getValueByJsonPath(response,"__AclResp_list;AclResp;acl_list;list;AclSandeshData");
                    //Loop through ACLs
                    if(response != null){
                        if(!(response instanceof Array)) {
                            response = [response];
                        }
                        for (var i = 0; i < response.length; i++) {
                            var currACL = [];
                            currACL = getValueByJsonPath(response[i],"entries;list;AclEntrySandeshData",[]);
                            //Loop through ACEs
                            if(!(currACL instanceof Array)) {
                                currACL = [currACL];
                            }
                            for (var j = 0; j < currACL.length; j++) {
                                var currACE = currACL[j];
                                    var dispuuid = uuid = response[i]['uuid'];
                                    var flowCnt = response[i]['flow_count'];
                                    if(flowCnt == null){
                                        flowCnt = 0;
                                    }
                                    if(j > 0) {
                                        dispuuid = '';
                                        flowCnt = '';
                                    }
                                    var protoRange = srcPortRange = dstPortRange =
                                        actionVal = srcVn = destVn = aceid =
                                        srcType = dstType = srcSgId = dstSgId =
                                        noDataStr;
                                    protoRange = this.formatMinMax (getValueByJsonPath(currACE,
                                        "proto_l;list;SandeshRange;min"),
                                            getValueByJsonPath(currACE,
                                        "proto_l;list;SandeshRange;max"));
                                    srcPortRange = this.formatMinMax(getValueByJsonPath(currACE,
                                        "src_port_l;list;SandeshRange;min"),
                                        getValueByJsonPath(currACE,"src_port_l;list;SandeshRange;max"));
                                    dstPortRange = this.formatMinMax(getValueByJsonPath(currACE,
                                        "dst_port_l;list;SandeshRange;min"),
                                        getValueByJsonPath(currACE,"dst_port_l;list;SandeshRange;max"));
                                    var actionList = jsonPath(currACE,'$.action_l.list.ActionStr..action');
                                    if(!(actionList instanceof Array)){
                                        actionList = [actionList];
                                    }
                                    srcType = getValueByJsonPath(currACE,"src_type");
                                    dstType = getValueByJsonPath(currACE,"dst_type");
                                    try{
                                        srcVn = ifNullOrEmptyObject(getValueByJsonPath(currACE,"src"),noDataStr);
                                        if(srcType == 'sg'){
                                            srcSgId = srcVn;
                                            srcVn = noDataStr;
                                        } else {
                                            var srcVnParts = srcVn.split(' ');
                                            if(srcVnParts.length > 1){
                                                srcVn = '';
                                                $.each(srcVnParts,function(i,part){
                                                    if(i != 0){
                                                        srcVn = srcVn + ' / ' + part;
                                                    } else {
                                                        srcVn = part;
                                                    }
                                                });
                                            }
                                        }
                                    }catch(e){}
                                    try{
                                        destVn = ifNullOrEmptyObject(getValueByJsonPath(currACE,"dst"),noDataStr);
                                        if(dstType == 'sg'){
                                            dstSgId = destVn;
                                            destVn = noDataStr;
                                        } else {
                                            var dstVnParts = destVn.split(' ');
                                            if(dstVnParts.length > 1){
                                                destVn = '';
                                                $.each(dstVnParts,function(i,part){
                                                    if(i != 0){
                                                        destVn = destVn + ' / ' + part;
                                                    } else {
                                                        destVn = part;
                                                    }
                                                });
                                            }
                                        }
                                    }catch(e){}
                                    try{
                                        aceid = ifNull(currACE['ace_id'],noDataStr);
                                    }catch(e){}
                                    retArr.push({uuid:uuid,
                                        dispuuid:dispuuid,
                                        dst_vn:destVn,
                                        src_vn:srcVn,
                                        srcSgId:srcSgId,
                                        dstSgId:dstSgId,
                                        srcType:srcType,
                                        dstType:dstType,
                                        flow_count:flowCnt,
                                        aceId:aceid,
                                        proto:protoRange,
                                        src_port:srcPortRange,
                                        dst_port:dstPortRange,
                                        actionList:actionList,
                                        raw_json:response[i]});
                            }
                        }
                    /* TODO for context switching if(selectedAcl != null){
                            comboAcl.select(function(dataItem) {
                                return dataItem.text === selectedAcl;
                            });
                        } else {
                            onAclSelect();
                        } */
                    }
                    return {
                        data: retArr,
                        paginationInfo: paginationInfo
                    }
                }

                this.summaryIpDisplay = function (ip,tooltip){
                    return '<span title="'+ tooltip +'">' + ip + '</span>';
                }

                self.floatingIPCellTemplate = function(fip) {
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
                self.formatProtcolRange = function(rangeStr) {
                    if (rangeStr == "0 - 255")
                        return "any";
                    else
                        return rangeStr;
                }
                self.formatPortRange = function(rangeStr) {
                    if (rangeStr == null || rangeStr == "undefined - undefined" || rangeStr == "0 - 65535")
                        return "any";
                    else
                        return rangeStr;
                }
                self.getNextHopType = function (data) {
                    var type = data['path']['nh']['NhSandeshData']['type'];
                    if($.type(type) != "string"){
                        return '-';
                    } else {
                        return type;
                    }
                }
                self.getNextHopDetails = function (data) {
                    var nhType = self.getNextHopType(data);
                    //var nhData = jsonPath(data,'$..PathSandeshData').pop();
                    var nhData = data['path'];
                    var peer = nhData['peer'];
                    //nhData['nh'] = nhData['nh']['NhSandeshData'];
                    var nextHopData = nhData['nh']['NhSandeshData'];
                    var intf = nextHopData['itf'], mac = nextHopData['mac'], destVN = nhData['dest_vn'], source = nhData['peer'], policy = nextHopData['policy'], lbl = nhData['label'];
                    var sip = nextHopData['sip'], dip = nextHopData['dip'], tunnelType = nextHopData['tunnel_type'], valid = nextHopData['valid'], vrf = nextHopData['vrf'];
                    var destVNList = getValueByJsonPath(nhData,'dest_vn_list;list;element','');
                    if(destVNList instanceof Array)
                        destVNList = destVNList.join(',');
                    if (nhType == 'arp') {
                        return contrail.format(wrapLabelValue('Interface', nextHopData['itf']) +
                                wrapLabelValue('Mac', nextHopData['mac']) +
                                wrapLabelValue('IP', nextHopData['sip']) +
                                wrapLabelValue('Policy', policy) +
                                wrapLabelValue('Peer', peer) +
                                wrapLabelValue('Valid', valid));
                    } else if (nhType == 'resolve' || nhType == 'receive') {
                        return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                                wrapLabelValue('Destination VN', destVNList)  +
                                wrapLabelValue('Policy', policy) +
                                wrapLabelValue('Peer', peer) +
                                wrapLabelValue('Valid', valid));
                    } else if (nhType == 'interface') {
                        return contrail.format(wrapLabelValue('Interface', intf) +
                                wrapLabelValue('Destination VN', destVNList) +
                                wrapLabelValue('Policy', policy) +
                                wrapLabelValue('Peer', peer) +
                                wrapLabelValue('Valid', valid));
                    } else if (nhType == 'tunnel') {
                        return contrail.format(wrapLabelValue('Source IP', sip) +
                                wrapLabelValue('Destination IP', dip) +
                                wrapLabelValue('Destination VN', destVNList) +
                                wrapLabelValue('Label', lbl) +
                                wrapLabelValue('Tunnel type', tunnelType) +
                                wrapLabelValue('Policy', policy) +
                                wrapLabelValue('Peer', peer) +
                                wrapLabelValue('Valid', valid));
                    } else if (nhType == 'vlan') {
                        return contrail.format(wrapLabelValue('Source', nhData['peer']) +
                                wrapLabelValue('Destination VN', destVNList) +
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
                        if (nextHopData['mc_list'] != null &&
                                nextHopData['mc_list']['list'] != null && nextHopData['mc_list']['list']['McastData'] != null) {
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
                }
                self.getNextHopDetailsForMulticast = function (data) {
                    var nhType = self.getNextHopType(data);
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
                }
                self.getNextHopDetailsForL2 = function (data) {
                    var nhType = self.getNextHopType(data);
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
                };

                self.getCores = function (data) {
                    var fileList=[];
                    var fileArrList=[];
                    var procCoreList = jsonPath(data,'$..NodeStatus.process_info[*].core_file_list');
                    if (procCoreList){
                        fileArrList = ifNull(procCoreList,[]);
                    }
                    // var allCoresList = ifNull(jsonPath(data,'$..NodeStatus.all_core_file_list')[0],[]);
                    // fileArrList = fileArrList.concat([allCoresList]);
                    for (var i=0;i<fileArrList.length;i++){
                        var files=fileArrList[i];
                       for (var j=0;j<files.length;j++)
                           fileList.push(files[j])
                    }
                    return (fileList.length == 0)? '-' : fileList;
                }

                self.getCpuText = function (cpu, noCpuText) {
                    var ret = ifNotNumeric(cpu,noCpuText)
                    return ret;
                }
            };

            return MonInfraParsers;
       }
);
