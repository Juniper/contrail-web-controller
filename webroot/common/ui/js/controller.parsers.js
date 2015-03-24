/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTParsers = function() {
        this.networkDataParser = function(response) {
            var retArr = $.map(ifNull(response['data']['value'], response), function (currObject) {
                if(!isServiceVN(currObject['name'])) {
                    currObject['rawData'] = $.extend(true, {}, currObject);
                    currObject['url'] = '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + currObject['name'];
                    currObject['outBytes'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;out_bytes', 0);
                    currObject['inBytes'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;in_bytes', 0);
                    currObject['out_tpkts'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;out_tpkts', 0);
                    currObject['in_tpkts'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;in_tpkts', 0);
                    currObject['egress_flow_count'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;egress_flow_count', 0);
                    currObject['ingress_flow_count'] = getValueByJsonPath(currObject, 'value;UveVirtualNetworkAgent;ingress_flow_count', 0);
                    currObject['outBytes60'] = '-';
                    currObject['inBytes60'] = '-';
                    currObject['instCnt'] = ifNull(jsonPath(currObject, '$..virtualmachine_list')[0], []).length;
                    currObject['inThroughput'] = ifNull(jsonPath(currObject, '$..in_bandwidth_usage')[0], 0);
                    currObject['outThroughput'] = ifNull(jsonPath(currObject, '$..out_bandwidth_usage')[0], 0);

                    currObject['intfCnt'] = ifNull(jsonPath(currObject, '$..interface_list')[0], []).length;
                    currObject['vnCnt'] = ifNull(jsonPath(currObject, '$..connected_networks')[0], []).length;
                    currObject['throughput'] = currObject['inThroughput'] + currObject['outThroughput'];
                    currObject['x'] = currObject['intfCnt'];
                    currObject['y'] = currObject['vnCnt'];
                    currObject['size'] = currObject['throughput'] + 1;
                    currObject['type'] = 'network';
                    currObject['name'] = currObject['name'];
                    currObject['uuid'] = currObject['uuid'];
                    currObject['project'] = currObject['name'].split(':').slice(0, 2).join(':');

                    return currObject;
                }
            });
            return retArr;
        };

        this.statsOracleParseFn = function(response,type) {
            var retArr = $.map(ifNull(response['value'],response), function (obj, idx) {
                var item = {};
                var props = STATS_PROP[type];
                item['name'] = obj['name'];
                item['inBytes'] = ifNull(obj[props['inBytes']],'-');
                item['outBytes'] = ifNull(obj[props['outBytes']],'-');
                return item;
            });
            return retArr;
        };

        this.projectNetworksDataParser = function (projectModelList, networkModel) {
            var projectItems = projectModelList[0].getItems(), vnList = networkModel.getItems(),
                projectMap = {}, inBytes = 0, outBytes = 0, projNameList = [];

            var defProjObj = {
                intfCnt: 0,
                vnCnt: 0,
                throughput: 0,
                inThroughput: 0,
                outThroughput: 0,
                inBytes: 0,
                outBytes: 0,
                inBytes60: 0,
                outBytes60: 0,
                ingressFlowCount: 0,
                egressFlowCount: 0,
                inTpkts: 0,
                outTpkts: 0
            };

            $.each(projectItems, function (idx, projObj) {
                projNameList.push(projObj['name']);
            });

            $.each(vnList, function (idx, vn) {
                var project;
                inBytes += vn['inBytes'];
                outBytes += vn['outBytes'];
                if (!(vn['project'] in projectMap)) {
                    projectMap[vn['project']] = $.extend({}, defProjObj);
                }
                project = projectMap[vn['project']];

                project['outBytes'] += vn['outBytes'];
                project['inBytes'] += vn['inBytes'];
                project['inTpkts'] += vn['in_tpkts'];
                project['outTpkts'] += vn['out_tpkts'];
                project['ingressFlowCount'] += vn['ingress_flow_count'];
                project['egressFlowCount'] += vn['egress_flow_count'];
                project['outBytes60'] += contrail.checkAndReplace(vn['outBytes60'], '-', 0);
                project['inBytes60']  += contrail.checkAndReplace(vn['inBytes60'], '-', 0);

                project['inThroughput'] += vn['inThroughput'];
                project['outThroughput'] += vn['outThroughput'];
                project['intfCnt'] += vn['intfCnt'];
                project['throughput'] += vn['throughput'];
                project['vnCnt']++;
            });

            $.each(projNameList, function (idx, currProjName) {
                if (projectMap[currProjName] == null) {
                    projectMap[currProjName] = $.extend({}, defProjObj);
                }
            });

            projectItems = projectModelList[0].getItems();

            $.each(projectItems, function(key, project) {
                var projectName = project['name'],
                    projectWithVNData = projectMap[projectName];
                if(projectWithVNData != null) {
                    $.extend(true, project, projectWithVNData, {
                        type: 'project',
                        size: projectWithVNData['throughput'] + 1,
                        x: projectWithVNData['intfCnt'],
                        y: projectWithVNData['vnCnt']
                    });
                }
            });

            for(var i = 0; i < projectModelList.length; i++) {
                projectModelList[i].updateData(projectItems);
            }
        };

        this.instanceDataParser = function(response) {
            var retArr = $.map(ifNull(response['data']['value'],response), function (currObject, idx) {
                var currObj = currObject['value'];
                currObject['rawData'] = $.extend(true,{},currObj);
                currObject['inBytes60'] = '-';
                currObject['outBytes60'] = '-';
                // If we append * wildcard stats info are not there in response,so we changed it to flat
                currObject['url'] = '/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + currObject['name'] + '?flat';
                currObject['vmName'] = ifNull(jsonPath(currObj, '$..vm_name')[0], '-');
                var vRouter = getValueByJsonPath(currObj,'UveVirtualMachineAgent;vrouter');
                currObject['vRouter'] = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(vRouter), '-');
                currObject['intfCnt'] = ifNull(jsonPath(currObj, '$..interface_list')[0], []).length;
                currObject['vn'] = ifNull(jsonPath(currObj, '$..interface_list[*].virtual_network'),[]);
                //Parse the VN only if it exists
                if(currObject['vn'] != false) {
                    if(currObject['vn'].length != 0) {
                        currObject['vnFQN'] = currObject['vn'][0];
                    }
                    currObject['vn'] = tenantNetworkMonitorUtils.formatVN(currObject['vn']);
                }
                currObject['ip'] = [];
                var intfList = tenantNetworkMonitorUtils.getDataBasedOnSource(getValueByJsonPath(currObj,'UveVirtualMachineAgent;interface_list',[]));
                for(var i = 0; i < intfList.length; i++ ) {
                    if(intfList[i]['ip6_active'] == true) {
                        if(intfList[i]['ip_address'] != '0.0.0.0')
                            currObject['ip'].push(intfList[i]['ip_address']);
                        if(intfList[i]['ip6_address'] != null)
                            currObject['ip'].push(intfList[i]['ip6_address']);
                    } else {
                        if(intfList[i]['ip_address'] != '0.0.0.0')
                            currObject['ip'].push(intfList[i]['ip_address']);
                    }
                }
                var fipStatsList = getValueByJsonPath(currObj,'UveVirtualMachineAgent:fip_stats_list');
                var floatingIPs = ifNull(tenantNetworkMonitorUtils.getDataBasedOnSource(fipStatsList), []);
                currObject['floatingIP'] = [];
                $.each(floatingIPs, function(idx, fipObj){
                    currObject['floatingIP'].push(contrail.format('{0}<br/> ({1}/{2})', fipObj['ip_address'],formatBytes(ifNull(fipObj['in_bytes'],'-')),
                        formatBytes(ifNull(fipObj['out_bytes'],'-'))));
                });
                return currObject;
            });
            return retArr;
        }

        this.projectDataParser = function (response) {
            var projects = contrail.handleIfNull(response['projects'], []),
                project, projectList = [];

            for(var i = 0; i < projects.length; i++) {
                project = {};
                project['name'] = projects[i]['fq_name'].join(":");
                project['uuid'] = projects[i]['uuid'];
                projectList.push(project);
            }

            return projectList;
        };

        this.projectVNPortStatsParser = function (response) {
            return [response];
        };

        this.vnTrafficStatsParser = function (response) {
            return [response];
        };

        this.vmTrafficStatsParser = function (response) {
            return [response];
        };

        this.flowsDataParser = function (response) {
            return response['data'];
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

        this.parseLineChartData = function(responseArray) {
            var response = responseArray[0],
                rawdata = response['flow-series'],
                inBytes = {key: "In Bytes", values: [], color: d3_category5[0]}, outBytes = {
                    key: "Out Bytes",
                    values: [],
                    color: d3_category5[1]
                },
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

        this.parseNetwork4Breadcrumb = function(response) {
            return  $.map(response['virtual-networks'], function (n, i) {
                if (!isServiceVN(n.fq_name.join(':'))) {
                    return {
                        fq_name: n.fq_name.join(':'),
                        name: n.fq_name[2],
                        value: n.uuid
                    };
                }
            });
        };
    };

    function isServiceVN(vnFQN) {
        var fqnArray = vnFQN.split(":");

        if(ctwc.SERVICE_VN_EXCLUDE_LIST.indexOf(fqnArray[2]) != -1) {
            return true;
        }

        return false;
    };

    return CTParsers;
});