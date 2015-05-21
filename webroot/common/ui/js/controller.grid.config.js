/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGridConfig = function () {
        this.projectNetworksColumns = [
            {
                field: 'name',
                name: 'Network',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'name', name: 'network', rowData: dc});
                },
                events: {
                    onClick: onClickGrid
                },
                minWidth: 300,
                searchFn: function (d) {
                    return d['name'];
                },
                searchable: true,
                cssClass: 'cell-hyperlink-blue'
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
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes60'], true), formatBytes(dc['outBytes60'], true));
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

        this.instanceInterfaceColumns = [
            {
                field: 'ip',
                name: 'IP Address',
                minWidth: 150,
                searchable: true
            },
            {
                field: 'vm_name',
                name: 'Instance Name',
                minWidth: 150,
                searchable: true
            },
            {
                field: 'floatingIP',
                name: 'Floating IPs In/Out',
                formatter: function (r, c, v, cd, dc) {
                    return cowf.formatValueArray4Grid(dc['floatingIP']);
                },
                minWidth: 200
            },
            {
                field: '',
                name: 'Traffic In/Out (Last 1 Hr)',
                minWidth: 150,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes60'], true), formatBytes(dc['outBytes60'], true));
                }
            },
            {
                field: '',
                name: 'Throughput In/Out',
                minWidth: 150,
                formatter: function (r, c, v, cd, dc) {
                    return contrail.format("{0} / {1}", formatThroughput(dc['if_stats']['in_bw_usage'], true), formatThroughput(dc['if_stats']['out_bw_usage'], true));
                }
            },
            {
                name: 'Status',
                minWidth: 100,
                searchable: true,
                formatter: function (r, c, v, cd, dc) {
                    if (dc.active) {
                        return ('<div class="status-badge-rounded status-active"></div>&nbsp;Active');
                    } else {
                        return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;Inactive');
                    }
                }
            }
        ];

        this.projectInstancesColumns = [
            {
                field: 'vmName',
                name: 'Instance',
                formatter: function (r, c, v, cd, dc) {
                    if(contrail.checkIfExist(dc['vmName'])) {
                        return cellTemplateLinks({cellText: 'vmName', tooltip: true, name: 'instance', rowData: dc});
                    } else {
                        return '-';
                    }
                },
                minWidth: 150,
                searchable: true,
                events: {
                    onClick: onClickGrid
                },
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'vn',
                name: 'Networks',
                formatter: function (r, c, v, cd, dc) {
                    return getMultiValueStr(dc['vn']);
                },
                minWidth: 150,
                searchable: true
            },
            {
                field: 'intfCnt',
                name: 'Interfaces',
                minWidth: 80
            },
            {
                field: 'vRouter',
                name: 'Virtual Router',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'vRouter', tooltip: true, name: 'vRouter', rowData: dc});
                },
                minWidth: 100,
                events: {
                    onClick: onClickGridLink
                },
                cssClass: 'cell-hyperlink-blue'
            },
            {
                field: 'ip',
                name: 'IP Address',
                formatter: function (r, c, v, cd, dc) {
                    return formatIPArr(dc['ip']);
                },
                minWidth: 150
            },
            {
                field: '',
                name: 'Aggr. Traffic In/Out (Last 1 Hr)',
                formatter: function (r, c, v, cd, dc) {
                    return formatBytes(dc['inBytes60'], true) + ' / ' + formatBytes(dc['outBytes60'], true);
                },
                minWidth: 200
            }
        ];

        this.projectsColumns = [
            {
                field: 'name',
                name: 'Project',
                formatter: function (r, c, v, cd, dc) {
                    return cellTemplateLinks({cellText: 'name', tooltip: true, name: 'project', rowData: dc});
                },
                minWidth: 300,
                searchable: true,
                events: {
                    onClick: onClickGrid
                },
                cssClass: 'cell-hyperlink-blue'
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
                    return contrail.format("{0} / {1}", formatBytes(dc['inBytes60'], true), formatBytes(dc['outBytes60'], true));
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

        this.getVNDetailsLazyRemoteConfig = function (type) {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var uuids, lazyAjaxConfig;

                        uuids = $.map(responseJSON, function (item) {
                            return item['name'];
                        });

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_VN_STATS,
                            type: 'POST',
                            data: JSON.stringify({
                                data: {
                                    type: type,
                                    uuids: uuids.join(','),
                                    minSince: 60,
                                    useServerTime: true
                                }
                            })
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel, parentModelList) {
                        var statDataList = ctwp.statsOracleParseFn(response[0], type),
                            dataItems = contrailListModel.getItems(),
                            statData;

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
                            ctwp.projectNetworksDataParser(parentModelList, contrailListModel);
                        }
                    }
                }
            ];
        };

        this.getVMInterfacesLazyRemoteConfig = function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig,
                            interfaceList = responseJSON['value']['UveVirtualMachineAgent']['interface_list'];

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_INTERFACES,
                            type: 'POST',
                            data: JSON.stringify({kfilt: interfaceList.join(',')})
                        };

                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailViewModel) {
                        var interfaceMap = ctwp.instanceInterfaceDataParser(response),
                            interfaceDetailsList = _.values(interfaceMap);

                        contrailViewModel.attributes['value']['UveVirtualMachineAgent']['interface_details'] = interfaceDetailsList;
                        if (interfaceDetailsList.length > 0) {
                            contrailViewModel.attributes.vm_name = interfaceDetailsList[0]['vm_name'];
                        }
                    }
                }
            ]
        };

        this.getVMDetailsLazyRemoteConfig = function (type) {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var uuids, lazyAjaxConfig;

                        uuids = $.map(responseJSON, function (item) {
                            return item['name'];
                        });

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_VN_STATS,
                            type: 'POST',
                            data: JSON.stringify({
                                data: {
                                    type: type,
                                    uuids: uuids.join(','),
                                    minSince: 60,
                                    useServerTime: true
                                }
                            })
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel) {
                        var statDataList = ctwp.parseInstanceStats(response[0], type),
                            dataItems = contrailListModel.getItems(),
                            statData;
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
                    }
                },
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig,
                            interfaceList = [];

                        for (var i = 0; i < responseJSON.length; i++) {
                            var instance = responseJSON[i],
                                uveVirtualMachineAgent = contrail.handleIfNull(instance['value']['UveVirtualMachineAgent'], {}),
                                instanceInterfaces = contrail.handleIfNull(uveVirtualMachineAgent['interface_list'], []);
                            if(instanceInterfaces.length > 0) {
                                interfaceList.push(instanceInterfaces);
                            }
                        }

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_INTERFACES,
                            type: 'POST',
                            data: JSON.stringify({
                                kfilt: interfaceList.join(','),
                                cfilt: ctwc.FILTERS_INSTANCE_LIST_INTERFACES.join(',')
                            })
                        };
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel) {
                        var interfaceMap = ctwp.instanceInterfaceDataParser(response),
                            dataItems = contrailListModel.getItems();

                        for (var i = 0; i < dataItems.length; i++) {
                            var dataItem = dataItems[i],
                                uveVirtualMachineAgent = contrail.handleIfNull(dataItem['value']['UveVirtualMachineAgent'], {}),
                                interfaceList = contrail.handleIfNull(uveVirtualMachineAgent['interface_list'], []),
                                interfaceDetailsList = [],
                                inThroughput = 0, outThroughput = 0, throughput = 0;

                            for (var j = 0; j < interfaceList.length; j++) {
                                var interfaceDetail = interfaceMap[interfaceList[j]],
                                    ifStats;

                                if (contrail.checkIfExist(interfaceDetail)) {
                                    ifStats = ifNull(interfaceDetail['if_stats'], {});
                                    inThroughput += ifNull(ifStats['in_bw_usage'], 0);
                                    outThroughput += ifNull(ifStats['out_bw_usage'], 0);
                                    interfaceDetailsList.push(interfaceDetail);
                                }
                            }

                            throughput = inThroughput + outThroughput;
                            dataItem['throughput'] = throughput;
                            dataItem['size'] = throughput;
                            uveVirtualMachineAgent['interface_details'] = interfaceDetailsList;
                            dataItem['vn'] = ifNull(jsonPath(interfaceDetailsList, '$...virtual_network'), []);

                            if (dataItem['vn'] != false) {
                                if (dataItem['vn'].length != 0) {
                                    dataItem['vnFQN'] = dataItem['vn'][0];
                                }
                                dataItem['vn'] = tenantNetworkMonitorUtils.formatVN(dataItem['vn']);
                            }

                            for (var k = 0; k < interfaceDetailsList.length; k++) {
                                if (interfaceDetailsList[k]['ip6_active'] == true) {
                                    if (interfaceDetailsList[k]['ip_address'] != '0.0.0.0')
                                        dataItem['ip'].push(interfaceDetailsList[k]['ip_address']);
                                    if (interfaceDetailsList[k]['ip6_address'] != null)
                                        dataItem['ip'].push(interfaceDetailsList[k]['ip6_address']);
                                } else {
                                    if (interfaceDetailsList[k]['ip_address'] != '0.0.0.0')
                                        dataItem['ip'].push(interfaceDetailsList[k]['ip_address']);
                                }
                            }

                            /*
                            if (interfaceDetailsList.length > 0) {
                                dataItem['vmName'] = interfaceDetailsList[0]['vm_name'];
                            }
                            */
                        }

                        contrailListModel.updateData(dataItems);
                    }
                }
            ];
        };

        this.getInterfaceStatsLazyRemoteConfig = function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var names, lazyAjaxConfig;

                        names = $.map(responseJSON, function (item) {
                            return item['name'];
                        });

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_VN_STATS,
                            type: 'POST',
                            data: JSON.stringify({
                                data: {
                                    type: 'virtual-machine-interface',
                                    uuids: names.join(','),
                                    minSince: 60,
                                    useServerTime: true
                                }
                            })
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel) {
                        var statDataList = ctwp.parseInstanceInterfaceStats(response[0]),
                            dataItems = contrailListModel.getItems(),
                            statData;

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
                    }
                }
            ];
        };

        this.getProjectDetailsHLazyRemoteConfig = function () {
            return {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_NETWORKS_DETAILS_IN_CHUNKS, 25, $.now()),
                        type: 'POST',
                        data: JSON.stringify({
                            data: [{
                                "type": ctwc.TYPE_VIRTUAL_NETWORK,
                                "cfilt": ctwc.FILTERS_COLUMN_VN.join(',')
                            }]
                        })
                    },
                    dataParser: ctwp.networkDataParser
                },
                vlRemoteConfig: {
                    completeCallback: function (contrailListModel, parentModelList) {
                        //ctwp.projectNetworksDataParser(parentModelList, contrailListModel);
                    },
                    vlRemoteList: ctwgc.getVNDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_NETWORK)
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
                    return getProtocolName(dc['protocol']);
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
                field: 'sum_bytes',
                name: 'Sum(Bytes)',
                minWidth: 80,
                searchFn: function (d) {
                    return d['sum_bytes'];
                },
                searchable: true
            },
            {
                field: 'sum_packets',
                name: 'Sum(Packets)',
                minWidth: 90,
                searchFn: function (d) {
                    return d['sum_packets'];
                },
                searchable: true
            },
            {
                field: 'flow_count',
                name: 'Flow Count',
                minWidth: 90,
                searchFn: function (d) {
                    return d['flowcnt'];
                },
                searchable: true
            }
        ];
    };

    function onClickGrid(e, selRowDataItem) {
        var name = $(e.target).attr('name'),
            fqName, uuid;
        if ($.inArray(name, ['project']) > -1) {
            fqName = selRowDataItem['name'];
            ctwgrc.setProjectURLHashParams(null, fqName, true)

        } else if ($.inArray(name, ['network']) > -1) {
            fqName = selRowDataItem['name'];
            ctwgrc.setNetworkURLHashParams(null, fqName, true)

        } else if ($.inArray(name, ['instance']) > -1) {
            fqName = selRowDataItem['vnFQN'];
            uuid = selRowDataItem['name'];
            if(contrail.checkIfExist(fqName)) {
                ctwgrc.setInstanceURLHashParams(null, fqName, uuid, true);
            }
        }
    };

    return CTGridConfig;
});