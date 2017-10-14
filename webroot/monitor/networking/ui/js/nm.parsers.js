/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var NMParsers = function() {
        var self = this;
        this.networkDataParser = function(response) {
            var currentCookie =  contrail.getCookie('region');
            var responseData;
            if(currentCookie === cowc.GLOBAL_CONTROLLER_ALL_REGIONS){
                responseData = response['data']['data']['value'];
            }
            else{
                responseData = response['data']['value'];
            }
          //  var regionList = ctwu.getRegionList();
            if(typeof(responseData) != 'undefined'){
                var retArr = $.map(ifNull(responseData, response), function (currObject) {
                    var regionList = ctwu.getRegionList();
                    if(!ctwu.isServiceVN(currObject['name'])) {
                        currObject['rawData'] = $.extend(true, {}, currObject);
                        currObject['url'] = '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + currObject['name'];
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
                        currObject['size'] = currObject['throughput'];
                        currObject['type'] = 'network';
                        currObject['name'] = currObject['name'];
                        currObject['uuid'] = currObject['uuid'];
                        if (currObject['name'] && typeof currObject['name'] === 'string')
                            currObject['project'] = currObject['name'].split(':').slice(0, 2).join(':');

                        return currObject;
                    }
                });
            return retArr;
          }
       };

        this.statsOracleParseFn = function(response,type) {
            response = contrail.handleIfNull(response, {});
            var retArr = $.map(ifNull(response['value'],response), function (obj, idx) {
                var item = {};
                var props = ctwc.STATS_SELECT_FIELDS[type];
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
                instCnt: 0,
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
                project['instCnt'] += vn['instCnt'];
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
                        size: projectWithVNData['throughput'],
                        x: projectWithVNData['intfCnt'],
                        y: projectWithVNData['vnCnt']
                    });
                }
            });

            for(var i = 0; i < projectModelList.length; i++) {
                if(i == 0) {
                    projectModelList[i].updateData(projectItems);
                } else {
                    projectModelList[i].setItems(projectItems);
                }
            }
        };

        this.interfaceDataParser = function(response) {
            var interfaceMap = ctwp.instanceInterfaceDataParser(response)
            return _.values(interfaceMap);
        };

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

        this.projectDataParser = function (response) {
            var projects = contrail.handleIfNull(response['projects'], []),
                project, projectList = [];

            for(var i = 0; i < projects.length; i++) {
                project = {};
                project['name'] = projects[i]['fq_name'].join(":");
                project['uuid'] = projects[i]['uuid'];
                project['vnCnt'] = '-';
                project['instCnt'] = '-';
                project['size'] = 0;
                project['x'] = 0;
                project['y'] = 0;
                projectList.push(project);
            }

            return projectList;
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

        this.parseProject4PortDistribution = function(response, projectFQN) {
            var srcPortdata  = response ? ctwp.parsePortDistribution(ifNull(response['sport'], []), {
                    startTime: response['startTime'],
                    endTime: response['endTime'],
                    bandwidthField: 'outBytes',
                    flowCntField: 'outFlowCount',
                    portField: 'sport',
                    portYype: "src",
                    fqName: projectFQN
                }) : [],
                dstPortData = response ? ctwp.parsePortDistribution(ifNull(response['dport'], []), {
                    startTime: response['startTime'],
                    endTime: response['endTime'],
                    bandwidthField: 'inBytes',
                    flowCntField: 'inFlowCount',
                    portField: 'dport',
                    portYype: "src",
                    fqName: projectFQN
                }) : [],
                chartData = [];

            chartData = chartData.concat(srcPortdata);
            chartData = chartData.concat(dstPortData);

            return chartData;
        };
    };

    return NMParsers;
});