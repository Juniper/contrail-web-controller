/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTParsers = function() {
        var self = this;

        this.alarmDataParser = function(response) {
           var retArr = [];
           if(response != null && response.length > 0) {
               for(var i = 0; i < response.length; i++) {
                   var item = response[i];
                   if(item.value != null && item.value.length > 0) {
                       var currItem = item.value[0];
                       var currObject = {};
                       currObject.name = currItem.name;
                       if(currItem.value != null && currItem.value.UVEAlarms != null && currItem.value.UVEAlarms.alarms != null
                           && currItem.value.UVEAlarms.alarms.length > 0) {
                           var alertInfo = currItem.value.UVEAlarms.alarms[0];
                           currObject.type = alertInfo.type;
                           currObject.ack = alertInfo.ack;
                           currObject.timestamp = getFormattedDate(alertInfo.timestamp/1000);
                           currObject.severity = alertInfo.severity;
                           currObject.description = alertInfo.description;
                           retArr.push(currObject);
                       }
                   }
               }
           }
           return retArr;
        };

        this.pRoutersDataParser = function(result) {
            var gridDS = [];
            var OVSDB_SUFFIX = '_OVSDB';
            var NETCONF_SUFFIX = '_Netconf';
            var VCPE_SUFFIX = '_VCPE';
            var PROUTER_SUFFIX = '_PRouter';
            var OVSDB_TYPE = 'OVSDB Managed ToR';
            var NETCONF_TYPE = 'Netconf Managed Physical Router';
            var VCPE_TYPE = 'CPE Router';
            var PROUTER_TYPE = 'Physical Router';
            var SNMP_TYPE = 'SNMP Managed';
            if(result.length > 0) {
                for(var i = 0; i < result.length;i++) {
                    var rowData = result[i]['physical-router'];
                    var virtualRouterRefs =
                        ifNull(rowData['virtual_router_refs'],[]);
                    var virtualRouterString = '';
                    var editVNData = [];
                    var virtualRouters = ifNull(rowData['virtual-routers'],[]);
                    var pRouterEditType = PROUTER_SUFFIX;
                    var pRouterType = [PROUTER_TYPE];
                    var totalInterfacesCount =
                        ifNull(rowData['totalIntfCount'],0);
                    if(virtualRouterRefs.length > 0){
                        $.each(virtualRouterRefs, function(i,vrouter){
                            var vrString = vrouter['to'][1];
                            virtualRouters.push(vrString);
                            if(i != 0) {
                                virtualRouterString =
                                    virtualRouterString + ', ' + vrString;
                            }
                            else {
                                virtualRouterString = vrString;
                            }
                        });
                    }
                    var netConfManaged = false;
                    var autoConfig =
                        rowData['physical_router_vnc_managed'] != null ?
                        (rowData['physical_router_vnc_managed'] ?
                        'Enabled' : 'Disabled') : '-';
                    if(autoConfig == 'Enabled') {
                        netConfManaged = true;
                        pRouterEditType = NETCONF_SUFFIX;
                        pRouterType = [NETCONF_TYPE];
                    }
                    //If SNMP enabled add SNMP enabled string to the type
                    var snmpSettings =
                        rowData['physical_router_snmp_credentials'];
                    if(snmpSettings != null) {
                         pRouterType.push(SNMP_TYPE);
                    }
                    var bgpRouters = ifNull(rowData['bgp_router_refs'],[]);
                    var bgpRoutersString = '';
                    $.each(bgpRouters, function(i,d){
                        if(i != 0) {
                            bgpRoutersString =
                                bgpRoutersString + ', ' + d.to[4];
                        }
                        else {
                            bgpRoutersString = d.to[4];
                        }
                    });
                    var vnRefs = ifNull(rowData['virtual_network_refs'],[]);
                    var vnsString = [];
                    $.each(vnRefs, function(i,d){
                        vnsString.push(
                            d.to[2] + ' (' + d.to[0] + ':' + d.to[1] + ')');
                        editVNData.push(
                            d.to[0] + ' ' + d.to[1] + ' ' + d.to[2]);
                    });
                    var credentials =
                        rowData['physical_router_user_credentials'];
                    var username = '',password = '';
                    if(credentials != null){
                        username = credentials['username'];
                        password = credentials['password'];
                    }
                    var junosServicePorts =
                        rowData["physical_router_junos_service_ports"]?
                        ifNull(rowData["physical_router_junos_service_ports"]
                        ["service_port"],'-') : '-' ;
                    var snmpCredentials =
                        ifNullOrEmptyObject(
                        rowData['physical_router_snmp_credentials'],null);
                    var isSNMPManaged = false;
                    var snmpVersion = '';
                    var snmpLocalPort = '';
                    var snmpRetries = '';
                    var snmpTimeout = '';
                    var snmpV2Community = '';
                    var snmpV3SecurityEngineId = '';
                    var snmpV3SecurityName = '';
                    var snmpV3SecurityLevel = '';
                    var snmpV3SecurityEngineId = '';
                    var snmpv3AuthProtocol = '';
                    var snmpv3AuthPasswd = '';
                    var snmpv3PrivProtocol = '';
                    var snmpv3PrivPasswd = '';
                    var snmpv3Context = '';
                    var snmpv3ContextEngineId = '';
                    var snmpv3EngineId = '';
                    var snmpv3EngineBoots = '';
                    var snmpv3EngineTime = '';
                    var showV2 = false;
                    var showV3 = false;
                    var showAuth = false;
                    var showPrivacy = false;
                    var snmpVersion = 'v2';
                    var expDetSnmpVersion = '';
                    if(snmpCredentials != null) {
                        isSNMPManaged = true;
                        snmpVersion = snmpCredentials['version'];
                        expDetSnmpVersion = snmpCredentials['version'];
                        snmpLocalPort = snmpCredentials['local_port'] ?
                            snmpCredentials['local_port'] : '';
                        snmpRetries = snmpCredentials['retries'] ?
                             snmpCredentials['retries'] : '';
                        snmpTimeout = snmpCredentials['timeout'] ?
                             snmpCredentials['timeout'] : '';
                        if(snmpVersion == 2){
                            showV2 = true;
                            snmpVersion = 'v2';
                            snmpV2Community = snmpCredentials['v2_community'] ?
                            snmpCredentials['v2_community'] : '';
                        } else if (snmpVersion == 3) {
                            showV3 = true;
                            snmpVersion = 'v3';
                            snmpV3SecurityEngineId =
                                snmpCredentials['v3_security_engine_id'] ?
                                snmpCredentials['v3_security_engine_id'] : '';
                            snmpV3SecurityName =
                                snmpCredentials['v3_security_name'] ?
                                snmpCredentials['v3_security_name'] : '';
                            snmpV3SecurityLevel =
                                snmpCredentials['v3_security_level']  ?
                                snmpCredentials['v3_security_level'] : '';
                            snmpV3SecurityEngineId =
                                snmpCredentials['v3_security_engine_id'] ?
                                snmpCredentials['v3_security_engine_id'] : '';
                            if (snmpV3SecurityLevel == ctwl.SNMP_AUTH ||
                                snmpV3SecurityLevel == ctwl.SNMP_AUTHPRIV) {
                                showAuth = true;
                                snmpv3AuthProtocol =
                                snmpCredentials['v3_authentication_protocol'] ?
                                snmpCredentials['v3_authentication_protocol'] :
                                '';
                                snmpv3AuthPasswd =
                                snmpCredentials['v3_authentication_password'] ?
                                snmpCredentials['v3_authentication_password'] :
                                ''
                            }
                            if (snmpV3SecurityLevel == ctwl.SNMP_AUTHPRIV) {
                                showPrivacy = true;
                                snmpv3PrivProtocol =
                                snmpCredentials['v3_privacy_protocol'] ?
                                snmpCredentials['v3_privacy_protocol'] : '';
                                snmpv3PrivPasswd =
                                snmpCredentials['v3_privacy_password'] ?
                                snmpCredentials['v3_privacy_password'] :'';
                            }
                            snmpv3Context =
                                snmpCredentials['v3_context'] ?
                                snmpCredentials['v3_context'] :'';
                            snmpv3ContextEngineId =
                                snmpCredentials['v3_context_engine_id'] ?
                                snmpCredentials['v3_context_engine_id'] : '';
                            snmpv3EngineId =
                                snmpCredentials['v3_engine_id'] ?
                                snmpCredentials['v3_engine_id'] : '';
                            snmpv3EngineBoots =
                                snmpCredentials['v3_engine_boots'] ?
                                snmpCredentials['v3_engine_boots'] : '';
                            snmpv3EngineTime =
                                snmpCredentials['v3_engine_time'] ?
                                snmpCredentials['v3_engine_time'] : '';
                        }
                    }
                    gridDS.push({
                        uuid : rowData.uuid,
                        pRouterName : rowData.name,
                        vendor : rowData['physical_router_vendor_name'] ?
                            rowData['physical_router_vendor_name'] : '',
                        mgmtIP : rowData['physical_router_management_ip'] ?
                            rowData['physical_router_management_ip'] : '',
                        dataIP : rowData['physical_router_dataplane_ip'] ?
                            rowData['physical_router_dataplane_ip'] : '',
                        netConfUserName : username,
                        netConfPasswd : password,
                        junosServicePorts : junosServicePorts,
                        totalInterfacesCount : (totalInterfacesCount == 0)?
                            'None' : totalInterfacesCount,
                        bgpGateWay : (bgpRoutersString == '')?
                            'None' : bgpRoutersString,
                        virtualNetworks : vnsString.length > 0 ? vnsString : '',
                        vns : editVNData,
                        vnRefs : vnRefs,
                        displayVirtualRouters : (virtualRouterString == '')?
                            '' : virtualRouterString,
                        virtualRouters : virtualRouters,
                        virtualRouterRefs : virtualRouterRefs,
                        pRouterEditType : pRouterEditType,
                        pRouterType : pRouterType,
                        pmodel : (rowData['physical_router_product_name']
                            != null && rowData['physical_router_product_name']
                            != '')? rowData['physical_router_product_name'] :
                            '',
                        autoConfig : autoConfig,
                        netConfManaged : netConfManaged,
                        snmpMntd:isSNMPManaged,
                        snmpCredentials:snmpCredentials,
                        snmpVersion : snmpVersion,
                        expDetSnmpVersion : expDetSnmpVersion,
                        snmpLocalPort : snmpLocalPort,
                        snmpRetries : snmpRetries,
                        snmpTimeout : snmpTimeout,
                        showV2 : showV2,
                        showV3 : showV3,
                        showAuth : showAuth,
                        showPrivacy : showPrivacy,
                        snmpV2Community : snmpV2Community,
                        snmpV3SecurityEngineId : snmpV3SecurityEngineId,
                        snmpV3SecurityName : snmpV3SecurityName,
                        snmpV3SecurityLevel : snmpV3SecurityLevel,
                        snmpv3AuthProtocol : snmpv3AuthProtocol,
                        snmpv3AuthPasswd : snmpv3AuthPasswd,
                        snmpv3PrivProtocol : snmpv3PrivProtocol,
                        snmpv3PrivPasswd : snmpv3PrivPasswd,
                        snmpv3Context : snmpv3Context,
                        snmpv3ContextEngineId : snmpv3ContextEngineId,
                        snmpv3EngineId : snmpv3EngineId,
                        snmpv3EngineBoots : snmpv3EngineBoots,
                        snmpv3EngineTime : snmpv3EngineTime
                    });
                }
            }
            return gridDS;
        }

        this.instanceInterfaceDataParser = function(response) {
            var rawInterfaces, interface, interfaceMap = {}, uveVMInterfaceAgent;
            if(response != null && response.value != null) {
                rawInterfaces = response.value;
                for(var i = 0; i < rawInterfaces.length; i++) {
                    interface = {};
                    uveVMInterfaceAgent = rawInterfaces[i]['value']['UveVMInterfaceAgent'];
                    interface = $.extend(true, interface, uveVMInterfaceAgent);
                    interface['name'] = rawInterfaces[i]['name'];

                    var ip6Active = interface['ip6_active'];
                    if(ip6Active) {
                        interface['ip'] = interface['ip6_address'];
                    } else {
                        interface['ip'] = interface['ip_address'];
                    }

                    var fipStatsList = getValueByJsonPath(uveVMInterfaceAgent, 'fip_diff_stats'),
                        floatingIPs = (fipStatsList == null) ? [] : fipStatsList;

                    interface['floatingIP'] = [];
                    $.each(floatingIPs, function (idx, fipObj) {
                        interface['floatingIP'].push(contrail.format('{0} ({1} / {2})', fipObj['ip_address'], cowu.addUnits2Bytes(ifNull(fipObj['in_bytes'], '-')), cowu.addUnits2Bytes(ifNull(fipObj['out_bytes'], '-'))));
                    });

                    if(contrail.checkIfExist(interface['if_stats'])) {
                        interface['throughput'] = interface['in_bw_usage'] + interface['out_bw_usage'];
                    }

                    interfaceMap[interface['name']] = interface;
                }
            }
            return interfaceMap;
        };

        this.parseNetworks4PortMap = function (data) {
            var response = data['res'];
            var result = {};
            var value = 0;
            var portMap = [0, 0, 0, 0, 0, 0, 0, 0];

            //If portmap received from multiple vRouters
            if ((response instanceof Array) && (response[0] instanceof Array)) {
                $.each(response, function (idx, obj) {
                    for (var i = 0; i < 8; i++) {
                        portMap[i] |= parseInt(obj[0][i]);
                    }
                });
            } else if (response instanceof Array)
                portMap = response;
            if (portMap != null) {
                var strPortMap = [];
                $.each(portMap, function (idx, value) {
                    var str = get32binary(parseInt(value)),
                        reverseString = str.split("").reverse().join("");

                    strPortMap.push(reverseString);
                });
                //console.info(strPortMap);
            }
            //To plot in 4 rows
            var stringPortMap = [];
            for (var i = 0, j = 0; j < 4; i += 2, j++)
                stringPortMap[j] = strPortMap[i] + strPortMap[i + 1]
            var chartData = [];
            for (var i = 0; i < 64; i++) {
                for (var j = 0; j < 4; j++) {
                    chartData.push({
                        x: i,
                        y: j,
                        value: (response == null) ? 0 : parseInt(stringPortMap[j][i])
                    });
                }
            }
            result['res'] = chartData;
            result['type'] = data['type'];
            result['pType'] = data['pType'];
            return result;
        };

        this.parseTrafficLineChartData = function (responseArray) {
            if (responseArray.length == 0) {
                return [];
            }
            var response = responseArray[0],
                rawdata = response['flow-series'],
                inBytes = {key: "In Traffic", values: [], color: d3_category5[0]},
                outBytes = {key: "Out Traffic", values: [], color: d3_category5[1]},
                inPackets = {key: "In Packets", values: []}, outPackets = {key: "Out Packets", values: []},
                chartData = [inBytes, outBytes];

            for (var i = 0; i < rawdata.length; i++) {
                var ts = Math.floor(rawdata[i].time / 1000);
                inBytes.values.push({x: ts, y: rawdata[i].inBytes});
                outBytes.values.push({x: ts, y: rawdata[i].outBytes});
                inPackets.values.push({x: ts, y: rawdata[i].inPkts});
                outPackets.values.push({x: ts, y: rawdata[i].outPkts});
            }
            return chartData;
        };

        this.parseCPUMemLineChartData = function(responseArray) {
            var cpuUtilization = {key: "CPU Utilization (%)", values: [], bar: true, color: d3_category5[1]},
                memoryUsage = {key: "Memory Usage", values: [], color: d3_category5[3]},
                chartData = [memoryUsage, cpuUtilization];

            for (var i = 0; i < responseArray.length; i++) {
                var ts = Math.floor(responseArray[i]['T'] / 1000);
                cpuUtilization.values.push({x: ts, y: responseArray[i]['cpu_stats.cpu_one_min_avg']});
                memoryUsage.values.push({x: ts, y: responseArray[i]['cpu_stats.rss']});
            }
            return chartData;
        };

        this.parseNetwork4Breadcrumb = function(response) {
            return  $.map(response['virtual-networks'], function (n, i) {
                if (!ctwu.isServiceVN(n.fq_name.join(':'))) {
                    return {
                        fq_name: n.fq_name.join(':'),
                        name: n.fq_name[2],
                        value: n.uuid
                    };
                }
            });
        };

        this.vRouterCfgDataParser = function(response) {
           var retArr = [];
           if(response != null &&
              'virtual-routers' in response &&
               response['virtual-routers'] != null &&
               response['virtual-routers'].length > 0) {
               var length = response['virtual-routers'].length
               for (var i = 0; i < length; i++) {
                   retArr.push(response['virtual-routers'][i]['virtual-router']);
               }
           }
           return retArr;
        };

        this.ipamCfgDataParser = function(response) {
           var retArr = [];
           if(response != null &&
              'network-ipams' in response &&
               response['network-ipams'] != null &&
               response['network-ipams'].length > 0) {
               var length = response['network-ipams'].length
               for (var i = 0; i < length; i++) {
                   retArr.push(response['network-ipams'][i]['network-ipam']);
               }
           }
           return retArr;
        };

        this.fipCfgDataParser = function(response) {
           var retArr = [];
           if(response != null &&
              'floating_ip_back_refs' in response &&
               response['floating_ip_back_refs'] != null &&
               response['floating_ip_back_refs'].length > 0) {
               var length = response['floating_ip_back_refs'].length
               for (var i = 0; i < length; i++) {
                   retArr.push(response['floating_ip_back_refs'][i]['floating-ip']);
               }
           }
           return retArr;
        };

        this.svcTemplateCfgDataParser = function(response) {
           var retArr = [];
           if(response != null &&
              'service_templates' in response &&
               response['service_templates'] != null &&
               response['service_templates'].length > 0) {
               var length = response['service_templates'].length
               for (var i = 0; i < length; i++) {
                   retArr.push(response['service_templates'][i]['service-template']);
               }
           }
           return retArr;
        };
        
        this.vmTrafficStatsParser = function (response) {
            return [response];
        };

        this.interfaceDataParser = function(response) {
            var interfaceMap = self.instanceInterfaceDataParser(response)
            return _.values(interfaceMap);
        };
        
        this.parseInstanceInterfaceStats = function (response) {
            var retArr = $.map(ifNull(response['value'], response), function (obj, idx) {
                var item = {};
                var props = ctwc.STATS_SELECT_FIELDS['virtual-machine'];
                item['name'] = obj['name'];
                item['inBytes'] = ifNull(obj[props['inBytes']], '-');
                item['outBytes'] = ifNull(obj[props['outBytes']], '-');
                return item;
            });
            return retArr;
        };
        
        this.parseNetwork4PortDistribution = function(response, networkFQN, interfaceIP) {
            var srcPortdata  = response ? ctwp.parsePortDistribution(ifNull(response['sport'], []), {
                    startTime: response['startTime'],
                    endTime: response['endTime'],
                    bandwidthField: 'outBytes',
                    flowCntField: 'outFlowCount',
                    portField: 'sport',
                    portYype: "src",
                    fqName: networkFQN,
                    ipAddress: interfaceIP
                }) : [],
                dstPortData = response ? ctwp.parsePortDistribution(ifNull(response['dport'], []), {
                    startTime: response['startTime'],
                    endTime: response['endTime'],
                    bandwidthField: 'inBytes',
                    flowCntField: 'inFlowCount',
                    portField: 'dport',
                    portYype: "src",
                    fqName: networkFQN,
                    ipAddress: interfaceIP
                }) : [],
                chartData = [];

            chartData = chartData.concat(srcPortdata);
            chartData = chartData.concat(dstPortData);

            return chartData;
        };
        

        this.parsePortDistribution = function (responseData, parserConfig) {
            var portCF = crossfilter(responseData),
                portField = ifNull(parserConfig['portField'], 'sport'),
                portType = parserConfig['portType'],
                color, parsedData = [],
                fqName = parserConfig['fqName'];

            if (portType == null) {
                portType = (portField == 'sport') ? 'src' : 'dst';
            }

            var flowCntField = ifNull(parserConfig['flowCntField'], 'outFlowCnt'),
                bandwidthField = ifNull(parserConfig['bandwidthField'], 'outBytes');

            var portDim = portCF.dimension(function (d) {
                    return d[parserConfig['portField']];
                }),
                PORT_LIMIT = 65536, PORT_STEP = 256,
                startPort = ifNull(parserConfig['startPort'], 0),
                endPort = ifNull(parserConfig['endPort'], PORT_LIMIT);

            if (endPort - startPort == 255)
                PORT_STEP = 1;

            if (portType == 'src') {
                color = 'default';
            } else {
                color = 'medium';
            }

            //Have a fixed port bucket range of 256
            for (var i = startPort; i <= endPort; i = i + PORT_STEP) {
                var name, range,
                    totalBytes = 0, flowCnt = 0, x;

                if (PORT_STEP == 1) {
                    portDim.filter(i);
                    name = i;
                    range = i;
                } else {
                    portDim.filter([i, Math.min(i + PORT_STEP - 1, 65536)]);
                    name = i + ' - ' + Math.min(i + PORT_STEP - 1, 65536);
                    range = i + '-' + Math.min(i + PORT_STEP - 1, 65536);
                }

                $.each(portDim.top(Infinity), function (idx, obj) {
                    totalBytes += obj[bandwidthField];
                    flowCnt += obj[flowCntField];
                });

                x = Math.floor(i + Math.min(i + PORT_STEP - 1, 65536)) / 2

                if (portDim.top(Infinity).length > 0)
                    parsedData.push({
                        startTime: parserConfig['startTime'],
                        endTime: parserConfig['endTime'],
                        x: x,
                        y: totalBytes,
                        name: name,
                        type: portType == 'src' ? 'sport' : 'dport',
                        range: range,
                        flowCnt: flowCnt,
                        size: flowCnt,
                        color: color,
                        fqName: fqName,
                        ipAddress: parserConfig['ipAddress']
                        //type:portField
                    });
            }
            return parsedData;
        };
    };

    return CTParsers;
});
