/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore' ],
       function(_) {
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
                        obj['x'] = parseFloat(jsonPath(d,'$..cpu_info.cpu_share')[0]);
                        //Info:Need to specify the processname explictly
                        //for which we need res memory && Convert to MB
                        obj['y'] = parseInt(jsonPath(d,'$..meminfo.res')[0])/1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
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
                        obj['memory'] =
                            formatMemory(ifNull(jsonPath(d,'$..meminfo')[0]),'-');
                        obj['size'] =
                            ifNull(jsonPath(d,'$..output_queue_depth')[0],0)+1;
                        obj['shape'] = 'circle';
                        obj['name'] = d['name'];
                        obj['link'] =
                            {p:'mon_infra_control',q:{node:obj['name'],tab:''}};
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
                        obj['isGeneratorRetrieved'] = false;
                        obj['nodeAlerts'] =
                            infraMonitorAlertUtils.processControlNodeAlerts(obj);
                        obj['alerts'] =
                            obj['nodeAlerts'].concat(obj['processAlerts'])
                                                .sort(dashboardUtils.sortInfraAlerts);
                        obj['color'] = monitorInfraUtils.getControlNodeColor(d,obj);
                        obj['rawData'] = d;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                //Parser for vRouters data
                this.parsevRoutersDashboardData = function (result) {
                    var retArr = [];
                    var vRouterCnt = result.length;
                    for (var i = 0; i < vRouterCnt; i++) {
                        var obj = {};
                        var d = result[i];
                        var dValue = result[i]['value'];
                        obj['cpu'] = parseFloat(getValueByJsonPath(dValue,
                            'VrouterStatsAgent;cpu_info;cpu_share', '--'));
                        obj['cpu'] = $.isNumeric(obj['cpu']) ? parseFloat(obj['cpu'].toFixed(
                            2)) : NaN;
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
                            'ConfigData;virtual-router;virtual_router_type;0',
                            'hypervisor');
                        if (obj['vRouterType'] == '') {
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
                        var processes = ['contrail-vrouter-agent',
                            'contrail-vrouter-nodemgr', 'supervisor-vrouter'
                        ];
                        obj['memory'] = formatMemory(getValueByJsonPath(dValue,
                            'VrouterStatsAgent;cpu_info;meminfo', '--'));
                        //Used for plotting in scatterChart
                        obj['resMemory'] = getValueByJsonPath(dValue,
                            'VrouterStatsAgent;cpu_info;meminfo;res', '-');
                        obj['resMemory'] = $.isNumeric(obj['resMemory']) ? parseFloat(
                            parseFloat(obj['resMemory'] / 1024).toFixed(2)) : NaN;
                        obj['x'] = obj['cpu'];
                        obj['y'] = obj['resMemory'];
                        obj['virtMemory'] = parseInt(getValueByJsonPath(dValue,
                                'VrouterStatsAgent;cpu_info;meminfo;virt', '--')) /
                            1024;
                        obj['size'] = getValueByJsonPath(dValue,
                                'VrouterStatsAgent;phy_if_1min_usage;0;out_bandwidth_usage',
                                0) +
                            getValueByJsonPath(dValue,
                                'VrouterStatsAgent;phy_if_1min_usage;0;in_bandwidth_usage',
                                0) + 1;
                        obj['size'] = getValueByJsonPath(dValue,
                                'VrouterStatsAgent;phy_if_5min_usage;0;out_bandwidth_usage',
                                0) +
                            getValueByJsonPath(dValue,
                                'VrouterStatsAgent;phy_if_5min_usage;0;in_bandwidth_usage',
                                0);
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
                                node: obj['name'],
                                tab: ''
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
                        obj['display_type'] = 'vRouter';
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
                                        'VrouterStatsAgent;cpu_info')) ||
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
                        obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(
                            dashboardUtils.sortInfraAlerts);
                        //Decide color based on parameters
                        obj['color'] = monitorInfraUtils.getvRouterColor(d, obj);
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
                        obj['x'] =
                            parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info' +
                            '[?(@.module_id=="contrail-collector")]..cpu_share')[0]);
                        obj['y'] =
                            parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info' +
                            '[?(@.module_id=="contrail-collector")]..meminfo.res')[0])
                            / 1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
                        obj['memory'] = formatBytes(obj['y'] * 1024 * 1024);
                        obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                        obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                        obj['histCpuArr'] =
                            monitorInfraUtils.parseUveHistoricalValues(d,'$.cpuStats.history-10');
                        obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                            '$..QueryStats.queries_being_processed')[0], []).length;
                        obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                            '$..QueryStats.pending_queries')[0], []).length;
                        obj['size'] = obj['pendingQueryCnt'] + 1;
                        obj['shape'] = 'circle';
                        obj['type'] = 'analyticsNode';
                        obj['display_type'] = 'Analytics Node';
                        obj['version'] = ifEmpty(self.getNodeVersion(jsonPath(d,
                            '$.CollectorState.build_info')[0]), '-');
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
                                node : obj['name'],
                                tab : ''
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
                            if (isEmptyObject(jsonPath(d,
                                '$.value.ModuleCpuState.module_cpu_info'+
                                '[?(@.module_id=="contrail-collector")].cpu_info')[0])
                                || isEmptyObject(jsonPath(d,
                                        '$.value.CollectorState.build_info')[0])) {
                                        obj['isPartialUveMissing'] = true;
                            }
                        }
                        //get the cpu for analytics node
                        var cpuInfo =
                            jsonPath(d,'$..ModuleCpuState.module_cpu_info')[0];
                        obj['isGeneratorRetrieved'] = false;
                        var genInfos = ifNull(jsonPath(d,
                            '$.value.CollectorState.generator_infos')[0], []);
                        obj['genCount'] = genInfos.length;
                        obj['nodeAlerts'] = infraMonitorAlertUtils
                                                .processAnalyticsNodeAlerts(obj);
                        obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                                            .sort(dashboardUtils.sortInfraAlerts);
                        obj['color'] = monitorInfraUtils.getAnalyticsNodeColor(d, obj);
                        obj['rawData'] = d;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                };

                this.parseConfigNodesDashboardData = function (result) {

                    var retArr = [];
                    $.each(result,function(idx,d) {
                        var obj = {};
                        obj['x'] = parseFloat(jsonPath(d,
                            '$..ModuleCpuState.module_cpu_info'+
                            '[?(@.module_id=="contrail-api")]..cpu_share')[0]);
                        obj['y'] = parseInt(jsonPath(d,
                            '$..ModuleCpuState.module_cpu_info'+
                            '[?(@.module_id=="contrail-api")]..meminfo.res')[0])/1024;
                        obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
                        obj['memory'] = formatBytes(obj['y']*1024*1024);
                        obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                        obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                        //Re-visit once average response time added for config nodes
                        obj['size'] = 1;
                        obj['version'] = ifEmpty(self.getNodeVersion(jsonPath(d,
                            '$.value.configNode.ModuleCpuState.build_info')[0]),'-');
                        obj['shape'] = 'circle';
                        obj['type'] = 'configNode';
                        obj['display_type'] = 'Config Node';
                        obj['name'] = d['name'];
                        obj['link'] =
                            {p:'mon_infra_config',q:{node:obj['name'],tab:''}};
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
                        if(isEmptyObject(jsonPath(d,
                           '$.value.configNode.ModuleCpuState.module_cpu_info'+
                           '[?(@.module_id=="contrail-api")].cpu_info')[0]) ||
                           isEmptyObject(jsonPath(d,
                                '$.value.configNode.ModuleCpuState.build_info')[0])) {
                           obj['isPartialUveMissing'] = true;
                        }
                        obj['isGeneratorRetrieved'] = false;
                        obj['nodeAlerts'] =
                            infraMonitorAlertUtils.processConfigNodeAlerts(obj);
                        obj['alerts'] =
                            obj['nodeAlerts'].concat(obj['processAlerts'])
                                .sort(dashboardUtils.sortInfraAlerts);
                        obj['color'] = monitorInfraUtils.getConfigNodeColor(d,obj);
                        obj['rawData'] = d;
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
                            '$.value.databaseNode.DatabaseUsageInfo.'+
                            'database_usage[0].disk_space_available_1k')[0]);
                        var dbSpaceUsed = parseFloat(jsonPath(d,
                            '$.value.databaseNode.DatabaseUsageInfo.'+
                            'database_usage[0].disk_space_used_1k')[0]);
                        var analyticsDbSize = parseFloat(jsonPath(d,
                            '$.value.databaseNode.DatabaseUsageInfo.'+
                            'database_usage[0].analytics_db_size_1k')[0]);

                        obj['x'] = $.isNumeric(dbSpaceAvailable)?
                            dbSpaceAvailable / 1024 / 1024 : 0;
                        obj['y'] = $.isNumeric(dbSpaceUsed)?
                            dbSpaceUsed / 1024 / 1024 : 0;

                        obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(d,
                            'value;ConfigData')) ? true : false;
                        obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(d,
                            'value;databaseNode'))) ? true : false;
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
                        obj['size'] = obj['usedPercentage']  ;
                        obj['shape'] = 'circle';
                        obj['type'] = 'dbNode';
                        obj['display_type'] = 'Database Node';
                        obj['name'] = d['name'];
                        obj['link'] = {p:'mon_infra_database',
                            q:{node:obj['name'],tab:''}};
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
                        obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                            .sort(dashboardUtils.sortInfraAlerts);
                        obj['color'] = monitorInfraUtils.getDatabaseNodeColor(d,obj);
                        obj['rawData'] = d;
                        retArr.push(obj);
                    });
                    retArr.sort(dashboardUtils.sortNodesByColor);
                    return retArr;

                }

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
                              if(isRtTableDisplayed){
                                 rtTable = '';
                                }
                              var rtable= routeTables[i];
                              var origVn = obj['origin_vn'];
                              var addfamily = '-';
                              if(rtable != null){
                                 addfamily = (rtable.split('.').length == 3) ?
                                         rtable.split('.')[1] : rtable;
                              }
                              var rawJson = obj;
                              var sg = getSecurityGroup(jsonPath(obj,
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
                                          dispPrefix:'',
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
            };

            return MonInfraParsers;
       }
);
