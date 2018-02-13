/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTParsers = function() {
        var self = this;

        this.instanceDataParser = function(response) {
            var interfaceMap = self.instanceInterfaceDataParser(getValueByJsonPath(response,
                                                                                   "vmiData", []));
            var vmData = getValueByJsonPath(response, "data;value", []);
            var vmCnt = vmData.length;
            var vmDetailsArr = [];
            for (i = 0; i < vmCnt; i++) {
                var currObject = vmData[i];
                var currObj = currObject['value'];
                currObject['raw_json'] = $.extend(true,{},currObject);
                currObject['inBytes60'] = '-';
                currObject['outBytes60'] = '-';
                // If we append * wildcard stats info are not there in response,so we changed it to flat
                currObject['url'] = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + currObject['name'] + '?flat';
                currObject['vmName'] = getValueByJsonPath(currObj,'UveVirtualMachineAgent;vm_name');
                currObject['uuid'] = getValueByJsonPath(currObj, "UveVirtualMachineAgent;uuid",
                                                        null);

                var vRouter = getValueByJsonPath(currObj,'UveVirtualMachineAgent;vrouter');
                currObject['vRouter'] = ifNull(ctwu.getDataBasedOnSource(vRouter), '-');
                currObject['intfCnt'] = ifNull(jsonPath(currObj, '$..interface_list')[0], []).length;
                currObject['vn'] = false;
                currObject['ip'] = [];

                var cpuInfo = getValueByJsonPath(currObj,'UveVirtualMachineAgent;cpu_info');
                if(contrail.checkIfExist(cpuInfo)) {
                    currObject['x'] = cpuInfo['cpu_one_min_avg'];
                    currObject['y'] = cpuInfo['rss'];
                } else {
                    currObject['x'] = 0;
                    currObject['y'] = 0;
                }

                currObject['size'] = 0;

                currObject['ui_added_parameters'] = {
                    'instance_health_check_status': null
                };

                /* Add details from VMIs in this VM */
                var intfList = getValueByJsonPath(currObj, "UveVirtualMachineAgent;interface_list",
                                                  []);
                var intfCnt = intfList.length;
                var inThroughput = 0, outThroughput = 0;
                var interfaceDetailsList = [];
                for (var j = 0; j < intfCnt; j++) {
                    var vmi = intfList[j];
                    var interfaceDetail = interfaceMap[vmi];
                    if (null == interfaceDetail) {
                        console.log("We got the VMI in VM UVE, but did not get details in VMI uve:",
                                    vmi);
                        continue;
                    }
                    inThroughput += ifNull(interfaceDetail['in_bw_usage'], 0);
                    outThroughput += ifNull(interfaceDetail['out_bw_usage'], 0);
                    interfaceDetailsList.push(interfaceDetail);
                }
                if (cowu.isNil(currObj.UveVirtualMachineAgent)) {
                    currObj.UveVirtualMachineAgent = {};
                }
                currObj.UveVirtualMachineAgent.interface_details = interfaceDetailsList;
                currObject.throughput = inThroughput + outThroughput;
                currObject.fipCnt = 0;
                currObject.ip = [];
                currObject.size = currObject.throughput;
                currObject.vn = getValueByJsonPath(interfaceDetail, "virtual_network", null);
                if ((null != currObject.vn) && (currObject.vn.length > 0)) {
                    currObject.vnFQN = currObject.vn;
                    currObject.vn = ctwu.formatVNName(currObject.vn);
                }
                var intfCnt = interfaceDetailsList.length;
                for (j = 0; j < intfCnt; j++) {
                    if (false === interfaceDetailsList[j].is_health_check_active) {
                        currObject.ui_added_parameters.instance_health_check_status = false;
                    }
                    if (true === interfaceDetailsList[j].ip6_active) {
                        if ("0.0.0.0" !== interfaceDetailsList[j].ip_address) {
                            currObject.ip.push(interfaceDetailsList[j].ip_address);
                        }
                        if (null !== interfaceDetailsList[j].ip6_address) {
                            currObject.ip.push(interfaceDetailsList[j].ip6_address);
                        }
                    } else {
                        if ("0.0.0.0" !== interfaceDetailsList[j].ip_address) {
                            currObject.ip.push(interfaceDetailsList[j]['ip_address']);
                        }
                    }
                    currObject.fipCnt += interfaceDetailsList[j]['count_floating_ips'];
                }
                vmDetailsArr.push(currObject);
            }
            return vmDetailsArr;
        };

        this.instanceInterfaceDataParser = function(response) {
            var rawInterfaces, interface, interfaceMap = {}, uveVMInterfaceAgent;
            if(response != null && response.value != null) {
                rawInterfaces = response.value;
                for(var i = 0; i < rawInterfaces.length; i++) {
                    interface = {};
                    uveVMInterfaceAgent = rawInterfaces[i]['value']['UveVMInterfaceAgent'];
                    interface['floating_ips'] = [];
                    interface = $.extend(true, interface, uveVMInterfaceAgent);
                    interface['name'] = rawInterfaces[i]['name'];

                    var ip6Active = interface['ip6_active'];
                    if(ip6Active) {
                        interface['ip'] = interface['ip6_address'];
                    } else {
                        interface['ip'] = interface['ip_address'];
                    }

                    var fipStatsList = getValueByJsonPath(uveVMInterfaceAgent, 'fip_agg_stats'),
                        floatingIPs = (fipStatsList == null) ? [] : fipStatsList;

                    interface['count_floating_ips'] = interface['floating_ips'].length;
                    interface['floatingIP'] = [];
                    $.each(floatingIPs, function (idx, fipObj) {
                        interface['floatingIP'].push(contrail.format('{0} ({1} / {2})', fipObj['ip_address'], cowu.addUnits2Bytes(ifNull(fipObj['in_bytes'], '-')), cowu.addUnits2Bytes(ifNull(fipObj['out_bytes'], '-'))));
                    });

                    interface.x = interface['out_bw_usage'];
                    interface.y = interface['in_bw_usage'];
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
                inBytes = {key: "In Traffic", values: [], color: cowc.D3_COLOR_CATEGORY5[0]},
                outBytes = {key: "Out Traffic", values: [], color: cowc.D3_COLOR_CATEGORY5[1]},
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
            var cpuUtilization = {key: "CPU Utilization (%)", values: [], bar: true, color: cowc.D3_COLOR_CATEGORY5[1]},
                memoryUsage = {key: "Memory Usage", values: [], color: cowc.D3_COLOR_CATEGORY5[3]},
                chartData = [cpuUtilization, memoryUsage];

            for (var i = 0; i < responseArray.length; i++) {
                var ts = Math.floor(cowu.getValueByJsonPath(responseArray, i+';T', cowu.getValueByJsonPath(responseArray, i+';T=', 0)))/1000;
                cpuUtilization.values.push({x: ts, y: responseArray[i]['cpu_stats.cpu_one_min_avg']});
                memoryUsage.values.push({x: ts, y: responseArray[i]['cpu_stats.rss']});
            }
            return chartData;
        };

        this.parseLineChartDataForNodeDetails = function(responseArray,options) {
            var axis1 = {key: (options.axisLabels != null)? options.axisLabels[0]: "CPU Utilization (%)",
                                    values: [],
                                    bar: true,
                                    color: cowc.D3_COLOR_CATEGORY5[1]
                                };
            var axis2 = {key: (options.axisLabels != null)? options.axisLabels[1]: "Memory Usage",
                                    values: [],
                                    color: cowc.D3_COLOR_CATEGORY5[3]
                                };
            var chartData = [axis1, axis2];

            for (var i = 0; i < responseArray.length; i++) {
                var ts = Math.floor(cowu.getValueByJsonPath(responseArray, i+';T', cowu.getValueByJsonPath(responseArray, i+';T=', 0)))/1000;
                axis1.values.push({x: ts, y: responseArray[i][options.dimensions[0]]});
                axis2.values.push({x: ts, y: responseArray[i][options.dimensions[1]]});
            }
            return chartData;
        };

        this.parseLineChartDataForVRouterBandwidth = function(responseArray,options) {
            var axis1 = {key: (options.axisLabels != null)? options.axisLabels[0]: "CPU Utilization (%)",
                                    values: [],
                                    bar: true,
                                    color: cowc.D3_COLOR_CATEGORY5[1]
                                };
            var axis2 = {key: (options.axisLabels != null)? options.axisLabels[1]: "Memory Usage",
                                    values: [],
                                    color: cowc.D3_COLOR_CATEGORY5[3]
                                };
            var axis3 = {key: (options.axisLabels != null)? options.axisLabels[2]: "Memory Usage",
                                    values: [],
                                    color: cowc.D3_COLOR_CATEGORY5[4]
                                };
            var chartData = [axis1, axis2, axis3];

            for (var i = 0; i < responseArray.length; i++) {
                var ts = Math.floor(cowu.getValueByJsonPath(responseArray, i+';T', cowu.getValueByJsonPath(responseArray, i+';T=', 0)))/1000;
                axis1.values.push({x: ts, y: responseArray[i][options.dimensions[0]]});
                axis2.values.push({x: ts, y: responseArray[i][options.dimensions[1]]});
                axis3.values.push({x: ts, y: responseArray[i][options.dimensions[2]]});
            }
            return chartData;
        };

        this.parseDataForNodeDetailsSparkline = function (responseArray,options) {
            var retData = [];
            for (var i = 0; i < responseArray.length; i++) {
//                var ts = Math.floor(responseArray[i]['T'] / 1000);
                retData.push(responseArray[i][options.dimensions[0]]);
            }
            return retData;
        }

        this.parseNetwork4Breadcrumb = function(response) {
            return  $.map(response['virtual-networks'], function (n, i) {
                if (!ctwu.isServiceVN(n.fq_name.join(':'))) {
                    return {
                        fq_name: n.fq_name.join(':'),
                        name: n.fq_name[2],
                        display_name: n.fq_name[2],
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
        this.fipCfgPoolDataParser = function(response) {
            var retArr = [];
            if(response[0] != null &&
               'floating-ip-pools' in response[0] &&
                response[0]['floating-ip-pools'] != null &&
                response[0]['floating-ip-pools'].length > 0) {
                var length = response[0]['floating-ip-pools'].length
                for (var i = 0; i < length; i++) {
                    retArr.push(response[0]['floating-ip-pools'][i]['floating-ip-pool']);
                }
            }
            console.log(retArr);
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
                   var svcApplSetRefs =
                       getValueByJsonPath(response['service_templates'][i],
                                          'service-template;service_appliance_set_refs',
                                          []);
                   if (svcApplSetRefs.length > 0) {
                       response['service_templates'][i]['service-template']
                           ['service_appliance_set'] =
                           svcApplSetRefs[0]['to'].join(':');
                   }
                   retArr.push(response['service_templates'][i]['service-template']);
               }
           }
           return retArr;
        };
        this.gohanServiceTempDataParser = function(response) {
            var retArr = [];
            var svcTempList = getValueByJsonPath(response,'service_templates',[]);
                for (var i = 0; i < svcTempList.length; i++) {
                   retArr.push(svcTempList[i]);
                }
            return retArr;
         };
         this.gohanServiceInstanceDataParser = function(response){
             var retArr = [];
             var svcInstList = getValueByJsonPath(response,'service_instances',[]);
                 for (var i = 0; i < svcInstList.length; i++) {
                    retArr.push(svcInstList[i]);
                 }
             return retArr;
         };
         this.gohanSecurityGroupDataParser = function(response){
             var retArr = [];
             var secGrpList = getValueByJsonPath(response,'security_groups',[]);
                 for (var i = 0; i < secGrpList.length; i++) {
                    retArr.push(secGrpList[i]);
                 }
             return retArr;
         };
         this.gohanNetworkPolicyDataParser = function(response){
             var retArr = [];
             var netPolicyList = getValueByJsonPath(response,'network_policies',[]);
                 for (var i = 0; i < netPolicyList.length; i++) {
                    retArr.push(netPolicyList[i]);
                 }
             return retArr;
         };
         this.gohanNetworksParser = function(response){
             var retArr = [];
             var networkList = getValueByJsonPath(response,'networks',[]);
                 for (var i = 0; i < networkList.length; i++) {
                    retArr.push(networkList[i]);
                 }
             return retArr;
         };
         this.gohanServerParser = function(response){
             var retArr = [];
             var serverList = getValueByJsonPath(response,'servers',[]);
                 for (var i = 0; i < serverList.length; i++) {
                    retArr.push(serverList[i]);
                 }
            return retArr;
         };
         this.gohanIdPoolParser = function(response){
             var retArr = [];
             var idPoolList = getValueByJsonPath(response,'id_pools',[]);
                 for (var i = 0; i < idPoolList.length; i++) {
                    retArr.push(idPoolList[i]);
                 }
            return retArr;
         };
         this.gohanRouteTargetParser = function(response){
             var retArr = [];
             var routeTargetList = getValueByJsonPath(response,'route_target_associations',[]);
                 for (var i = 0; i < routeTargetList.length; i++) {
                    retArr.push(routeTargetList[i]);
                 }
            return retArr;
         };
         this.gohanFlavorParser = function(response){
             var retArr = [];
             var flavorList = getValueByJsonPath(response,'flavors',[]);
                 for (var i = 0; i < flavorList.length; i++) {
                    retArr.push(flavorList[i]);
                 }
            return retArr;
         };
         this.gohanImageParser = function(response){
             var retArr = [];
             var imageList = getValueByJsonPath(response,'images',[]);
                 for (var i = 0; i < imageList.length; i++) {
                    retArr.push(imageList[i]);
                 }
            return retArr;
         };
         this.gohanLocationParser = function(response){
             var retArr = [];
             var locationList = getValueByJsonPath(response,'locations',[]);
                 for (var i = 0; i < locationList.length; i++) {
                    retArr.push(locationList[i]);
                 }
            return retArr;
         };
        this.vmTrafficStatsParser = function (response) {
            return [response];
        };

        this.interfaceDataParser = function(response) {
            var intfData = getValueByJsonPath(response, "value", []);
            if (intfData.length > 0) {
                intfData = {value: intfData};
            }

            var interfaceMap = self.instanceInterfaceDataParser(getValueByJsonPath(response,
                                                                                   "data", intfData));
            return _.values(interfaceMap);
        };

        this.parseInstanceInterfaceStats = function (response) {
            var retArr = $.map(ifNull(response, []), function (obj, idx) {
                var item = {};
                var props = ctwc.STATS_SELECT_FIELDS['virtual-machine'];
                item['name'] = obj['vm_uuid'];
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

        this.parseInstanceStats = function (response, type) {
            response = contrail.handleIfNull(response, {});
            var retArr = $.map(ifNull(response, []), function (obj, idx) {
                var item = {};
                var props = ctwc.STATS_SELECT_FIELDS[type];
                item['name'] = obj['vm_uuid'];
                item['inBytes'] = ifNull(obj[props['inBytes']], '-');
                item['outBytes'] = ifNull(obj[props['outBytes']], '-');
                return item;
            });
            return retArr;
        };

        this.vnCfgDataParser = function(response, isShared) {
            var retArr = [];
            var domain  = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var project = contrail.getCookie(cowc.COOKIE_PROJECT);

            if(response != null &&
                'virtual-networks' in response &&
                response['virtual-networks'].length > 0) {
                var len = response['virtual-networks'].length
                for (var i = 0; i < len; i++) {
                    var vnName = getValueByJsonPath(response,
                            'virtual-networks;' + i + ';virtual-network;name', null, false);
                    if(_.indexOf(ctwc.NOT_ALLOWED_VN_LIST, vnName) !== -1) {
                        continue;
                    }
                    if (isShared && isShared == true) {
                        var vn = response['virtual-networks'][i]['virtual-network']
                        if (!(domain == vn['fq_name'][0] && project == vn['fq_name'][1])) {
                            retArr.push(response['virtual-networks'][i]['virtual-network']);
                        }
                    } else {
                        retArr.push(response['virtual-networks'][i]['virtual-network']);
                    }
                }
            }
            return retArr;
        };

        this.parseActiveDNSRecordsData = function(result) {
            var activeDNSRecData = [];
            prevNextCache = prevNextCache || {};
            if(result instanceof Array && result.length === 1){
                var virtualDNSResponse = getValueByJsonPath(result,
                    "0;__VirtualDnsRecordsResponse_list;" +
                    "VirtualDnsRecordsResponse", {}),
                    recData = getValueByJsonPath(virtualDNSResponse,
                    "records;list;VirtualDnsRecordTraceData", [], false),
                    paginationObj = getValueByJsonPath(result,
                            "0;__VirtualDnsRecordsResponse_list;" +
                            "Pagination;req;PageReqData", null, false);
                if(recData instanceof Array) {
                    activeDNSRecData = recData;
                } else {
                    activeDNSRecData.push(recData);
                }
                prevNextCache.prevPageKey = getValueByJsonPath(
                        paginationObj, "prev_page", "", false);
                prevNextCache.nextPageKey = getValueByJsonPath(
                        paginationObj, "next_page", "", false);
                prevNextCache.firstPageKey = getValueByJsonPath(
                        paginationObj, "first_page", "", false);
            }
            return activeDNSRecData;
        };

        this.svcHealthChkCfgDataParser = function(response) {
           var retArr = [];
           var svcHealthChk = getValueByJsonPath(response,
                            '0;service-health-checks', []);

           var length = svcHealthChk.length
           for (var i = 0; i < length; i++) {
               retArr.push(svcHealthChk[i]['service-health-check']);
           }
           return retArr;
        };

        this.isValidEsi = function(esi){
            var esiRegularExp = /^([0-9a-fA-F][0-9a-fA-F]:){9,9}([0-9a-fA-F][0-9a-fA-F])$/;
            var isValidEsi = false;
                if(esiRegularExp.test(esi)){
                    //check for continuous 0 or F
                    if((esi.match(/0/g)||[]).length === 20 || (esi.toLowerCase().match(/f/g)||[]).length === 20){
                        isValidEsi = false;
                    }else{
                        isValidEsi = true;
                    }
                }
            return isValidEsi;
        };

        this.isValidQfx5k = function(value){
            var isValidQfx5k = false;
            if(value.toLowerCase().indexOf('qfx') !== -1){
                var qfxVal = value.substr(3);
                var val = parseInt(qfxVal);
                if(parseInt(val) >= 5000 && parseInt(val) < 6000){
                    isValidQfx5k = true;
                }
            }
            return isValidQfx5k;
        };

    };

    return CTParsers;
});
