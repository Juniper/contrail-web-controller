/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    "protocol",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, protocolUtils, qeUtils) {
    var NMGridConfig = function () {
        var self = this;
        this.projectNetworksColumns = [
            {
                field: 'name',
                name: 'Network',
                formatter: function (r, c, v, cd, dc) {
                    return cowf.formatElementName({name: 'network', value: dc['name'], cssClass: 'cell-hyperlink-blue'});
                },
                events: {
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
                minWidth: 300,
                searchFn: function (d) {
                    return d['name'];
                },
                searchable: true,
                exportConfig: {
                    allow: true,
                    stdFormatter: false
                }
            },
            {
                field: 'instCnt',
                name: 'Instances',
                minWidth: 80
            },
            {
                field: 'intfCnt',
                name: 'Interfaces',
                minWidth: 80
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 Hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", cowu.addUnits2Bytes(dc['inBytes60'], true), cowu.addUnits2Bytes(dc['outBytes60'], true));
                }
            },
            {
                field: '',
                name: 'Throughput In/Out',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatThroughput(dc['inThroughput'], true), formatThroughput(dc['outThroughput'], true));
                }
            }
        ];

      this.projectNetworksColumnsAllregions = [
                                       {
               field: 'name',
               name: 'Network',
               formatter: function (r, c, v, cd, dc) {
                   return cowf.formatElementName({name: 'network', value: dc['name'], cssClass: 'cell-hyperlink-blue'});
               },
               events: {
                   onClick: ctwu.onClickNetworkMonitorGrid
               },
               minWidth: 300,
               searchFn: function (d) {
                   return d['name'];
               },
               searchable: true,
               exportConfig: {
                   allow: true,
                   stdFormatter: false
               }
           },
           {
               field: 'instCnt',
               name: 'Instances',
               minWidth: 80
           },
           {
               field: 'intfCnt',
               name: 'Interfaces',
               minWidth: 80
           },
           {
               field: '',
               name: 'Throughput In/Out',
               minWidth: 200,
               formatter: function (r, c, v, cd, dc) {
                   return contrail.format("{0} / {1}", formatThroughput(dc['inThroughput'], true), formatThroughput(dc['outThroughput'], true));
               }
           }
       ];
        this.projectsColumns = [
            {
                field: 'name',
                name: 'Project',
                formatter: function (r, c, v, cd, dc) {
                    return cowf.formatElementName({name: 'project', value: dc['name'], cssClass: 'cell-hyperlink-blue'});
                },
                minWidth: 300,
                searchable: true,
                events: {
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
                exportConfig: {
                    allow: true,
                    stdFormatter: false
                }
            },
            {
                field: 'vnCnt',
                name: 'Networks',
                minWidth: 80
            },
            {
                field: 'instCnt',
                name: 'Instances',
                minWidth: 80
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 hr)',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", cowu.addUnits2Bytes(dc['inBytes60'], true), cowu.addUnits2Bytes(dc['outBytes60'], true));
                }
            },
            {
                field: '',
                name: 'Throughput In/Out',
                minWidth: 200,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatThroughput(dc['inThroughput'], true), formatThroughput(dc['outThroughput'], true));
                }
            }
        ];

        this.getNetworkVMDetailsLazyRemoteConfig = function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var nodes = responseJSON['nodes'],
                            nodeType, uuids, lazyAjaxConfig;

                        uuids = $.map(nodes, function (node) {
                            nodeType = node['node_type'];
                            if(nodeType == 'virtual-network') {
                                return node['more_attributes']['virtualmachine_list'];
                            }
                        });

                        lazyAjaxConfig = {
                            url: ctwc.URL_INSTANCES_SUMMARY,
                            type: 'POST',
                            data: JSON.stringify({
                                kfilt: uuids.join(','),
                                cfilt: ctwc.FILTERS_COLUMN_VM.join(",")
                            })
                        };

                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailGraphModel) {
                        var rawData = contrailGraphModel.rawData,
                            rankDir = contrailGraphModel.rankDir,
                            nodes = rawData['nodes'], vmList = response['value'],
                            elementMap = contrailGraphModel.elementMap,
                            vmMap = {}, node, vm, vnMoreAttrs, vnInstanceList, nodeType,
                            vmUUID, vmValue, nodeName, nodeElementId, nodeElement,
                            vmElementId, vmElement;

                        for(var j = 0; j < vmList.length; j++) {
                            vm = vmList[j];
                            vmMap[vm['name']] = vm['value'];
                        }

                        for(var i = 0; i < nodes.length; i++) {
                            node = nodes[i];
                            nodeName = node['name'];
                            nodeType = node['node_type'];
                            nodeElementId = elementMap['node'][nodeName];
                            nodeElement = contrailGraphModel.getCell(nodeElementId);

                            if(nodeType != 'virtual-network') {
                                continue;
                            } else {
                                vnMoreAttrs = node['more_attributes'];
                                vnMoreAttrs['virtualmachine_details'] = {};
                                vnInstanceList =  vnMoreAttrs['virtualmachine_list'];
                                for(var k = 0; k < vnInstanceList.length; k++) {
                                    vmUUID = vnInstanceList[k];
                                    vmValue = vmMap[vmUUID];
                                    vmElementId = elementMap['node'][vmUUID];
                                    vmElement = contrailGraphModel.getCell(vmElementId);
                                    if(contrail.checkIfExist(vmValue)) {
                                        vnMoreAttrs['virtualmachine_details'][vmUUID] = vmValue;
                                    }
                                    if(contrail.checkIfExist(vmElement)) {
                                        vmElement["attributes"]['nodeDetails']['uve'] = vmValue;
                                    }
                                }
                                if(contrail.checkIfExist(nodeElement)) {
                                    nodeElement["attributes"]['nodeDetails']['more_attributes']['virtualmachine_details'] = vnMoreAttrs['virtualmachine_details'];
                                }
                            }
                        }

                        contrailGraphModel.reLayoutGraph(rankDir);
                    }
                }
            ];
        };

        this.getVNStatsLazyRemoteAjaxConfig = function(responseJSON) {
            var fqns, lazyAjaxConfig;

            fqns = $.map(responseJSON, function (item) {
                return item['name'];
            });
            var whereClause = qeUtils.formatUIWhereClauseConfigByUserRole(null, "name", fqns);
            var qObj = {table: "StatTable.UveVirtualNetworkAgent.vn_stats",
                where: whereClause};
            var postData = qeUtils.formatQEUIQuery(qObj);
            lazyAjaxConfig = {
                url: cowc.URL_QE_QUERY,
                type: "POST",
                data: JSON.stringify(postData)
            };
            return lazyAjaxConfig;
        };
        this.getVNStatsLazyRemoteSuccessHandler = function(type, response, contrailListModel, parentModelList) {
            if (null == response) {
                return;
            }
            var statDataList = nmwp.statsOracleParseFn(response.data, type),
                dataItems = contrailListModel.getItems(), statData;

            for (var j = 0; j < statDataList.length; j++) {
                statData = statDataList[j];
                for (var i = 0; i < dataItems.length; i++) {
                    var dataItem = dataItems[i];
                    if (statData['name'] == dataItem['name']) {
                        dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                        dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                        break;
                    }
                }
            }
            contrailListModel.updateData(dataItems);
            if (contrail.checkIfExist(parentModelList)) {
                nmwp.projectNetworksDataParser(parentModelList, contrailListModel);
            }
        };

        this.getVNStatsVLOfPrimaryRemoteConfig = function (type) {
            return [{
                getAjaxConfig: function (responseJSON) {
                    return self.getVNStatsLazyRemoteAjaxConfig(responseJSON);
                },
                successCallback: function (response, contrailListModel, parentModelList) {
                    self.getVNStatsLazyRemoteSuccessHandler(type, response, contrailListModel, parentModelList);
                }
            }];
        };

        this.getVNStatsVLOfHLRemoteConfig = function (type) {
            return [{
                getAjaxConfig: function (responseJSON) {
                    return self.getVNStatsLazyRemoteAjaxConfig(responseJSON);
                },
                successCallback: function (response, contrailListModel, parentModelList) {
                    self.getVNStatsLazyRemoteSuccessHandler(type, response, parentModelList[0],
                                                            null);
                }
            }];
        };

        this.getInterfaceStatsLazyRemoteAjaxConfig = function(responseJSON) {
            var fqns, lazyAjaxConfig;

            fqns = $.map(responseJSON, function (item) {
                return item['name'];
            });

            var domCookie = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var projCookie = contrail.getCookie(cowc.COOKIE_PROJECT);
            var vnCookie = contrail.getCookie(ctwc.TYPE_VIRTUAL_NETWORK);
            var whereClause = "(name Starts with " + domCookie + ":" + projCookie + ":)";
            if (ctwc.ALL_PROJECTS === projCookie) {
                whereClause = "(name Starts with " + domCookie + ":)";
            } else if (ctwc.ALL_NETWORKS == vnCookie) {
                whereClause = "(name Starts with " + domCookie + ":" +
                    projCookie + ":)";
            }

            var whereClause = qeUtils.formatUIWhereClauseConfigByUserRole(whereClause, "name", fqns);
            var qObj = {table: "StatTable.UveVMInterfaceAgent.if_stats",
                where: whereClause};
            var postData = qeUtils.formatQEUIQuery(qObj);
            lazyAjaxConfig = {
                url: cowc.URL_QE_QUERY,
                type: "POST",
                data: JSON.stringify(postData)
            };
            return lazyAjaxConfig;
        };

        this.getInterfaceStatsLazyRemoteSuccessHandler = function(response, contrailListModel,
                                                                  parentModelList) {
            if (null == response) {
                return;
            }
            var statDataList = ctwp.parseInstanceInterfaceStats(response.data),
                dataItems = contrailListModel.getItems(),
                statData;
            var statDataListLen = statDataList.length;
            var dataItemsLen = dataItems.length;
            var tmpStatDataObjs = {};
            var tmpDataItems = {};

            for (var j = 0; j < statDataList.length; j++) {
                statData = statDataList[j];
                for (var i = 0; i < dataItems.length; i++) {
                    var dataItem = dataItems[i];
                    if (statData['name'] == dataItem['vm_uuid']) {
                        dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                        dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                        break;
                    }
                }
            }
            contrailListModel.updateData(dataItems);
        };

        this.getInterfaceStatsVLOfHLRemoteConfig = function () {
            return [{
                getAjaxConfig: function (responseJSON) {
                    return self.getInterfaceStatsLazyRemoteAjaxConfig(responseJSON);
                },
                successCallback: function (response, contrailListModel, parentModelList) {
                    self.getInterfaceStatsLazyRemoteSuccessHandler(response, parentModelList[0],
                                                                   null);
                }
            }];
        };

        this.getInterfaceStatsVLOfPrimaryRemoteConfig = function () {
            return [{
                getAjaxConfig: function (responseJSON) {
                    return self.getInterfaceStatsLazyRemoteAjaxConfig(responseJSON);
                },
                successCallback: function (response, contrailListModel, parentModelList) {
                    self.getInterfaceStatsLazyRemoteSuccessHandler(response, contrailListModel,
                                                                   parentModelList);
                }
            }];
        };

        this.getProjectDetailsHLazyRemoteConfig = function () {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_VIRTUAL_NETWORKS, 100, 1000, $.now()),
                        type: 'POST',
                        data: JSON.stringify({
                            id: qeUtils.generateQueryUUID(),
                            cfilt: ctwc.FILTERS_COLUMN_VN.join(',')
                        })
                    },
                    dataParser: nmwp.networkDataParser
                },
                vlRemoteConfig: {
                    completeCallback: function (contrailListModel, parentModelList) {
                        //ctwp.projectNetworksDataParser(parentModelList, contrailListModel);
                    },
                    vlRemoteList: nmwgc.getVNStatsVLOfPrimaryRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
                },
                cacheConfig: {
                    ucid: ctwc.UCID_ALL_VN_LIST
                }
            };
        };

        this.projectFlowsColumns = [
            {
                field: 'destvn',
                name: 'Destination VN',
                minWidth: 215,
                searchFn: function (d) {
                    return d['destvn'];
                },
                searchable: true
            },
            {
                field: 'sourceip',
                name: 'Source IP',
                minWidth: 100,
                searchFn: function (d) {
                    return d['sourceip'];
                },
                searchable: true
            },
            {
                field: 'destip',
                name: 'Destination IP',
                minWidth: 100,
                searchFn: function (d) {
                    return d['destip'];
                },
                searchable: true
            },
            {
                field: 'protocol',
                name: 'Protocol',
                formatter: function (r, c, v, cd, dc) {
                    return protocolUtils.getProtocolName(dc.protocol);
                },
                minWidth: 60,
                searchFn: function (d) {
                    return d['protocol'];
                },
                searchable: true
            },
            {
                field: 'sport',
                name: 'Source Port',
                minWidth: 80,
                searchFn: function (d) {
                    return d['sport'];
                },
                searchable: true
            },
            {
                field: 'dport',
                name: 'Destination Port',
                minWidth: 110,
                searchFn: function (d) {
                    return d['dport'];
                },
                searchable: true
            },
            {
                field: "SUM(bytes)",
                name: "Sum (Bytes)",
                minWidth: 80,
                searchFn: function (d) {
                    return d["SUM(bytes)"];
                },
                formatter: function (r, c, v, cd, dc) {
                    return cowu.addUnits2Bytes(dc["SUM(bytes)"]);
                },
                searchable: true
            },
            {
                field: "SUM(packets)",
                name: "Sum (Packets)",
                minWidth: 90,
                searchFn: function (d) {
                    return d["SUM(packets)"];
                },
                formatter: function (r, c, v, cd, dc) {
                    return cowu.addUnits2Packets(dc['SUM(packets)']);
                },
                searchable: true
            }
        ];

        this.getURLConfigForFlowGrid = function(hashParams) {
            var urlConfigObj = {
                'container': "#content-container",
                'context'  : "network",
                'type'     : "portRangeDetail",
                'startTime': hashParams['startTime'],
                'endTime'  : hashParams['endTime'],
                'fqName'   : hashParams['fqName'],
                'port'     : hashParams['port'],
                'portType' : hashParams['portType'],
                'ip'       : hashParams['ip']
            };
            return urlConfigObj;
        };
    };

    return NMGridConfig;
});
