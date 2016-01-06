/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTGridConfig = function () {
        this.alarmsColumns = [
            {
                field: 'severity',
                name: '',
                minWidth: 30,
                searchFn: function (d) {
                    return d['severity'];
                },
                searchable: true,
                formatter : function (r, c, v, cd, dc) {
                    var formattedDiv;
                    if(dc['ack']) {
                        if(dc['severity'] === 4) {
                            formattedDiv = '<div data-color="orange" class="circle orange" style="opacity:1"></div>';
                        } else if (dc['severity'] === 3) {
                            formattedDiv = '<div data-color="red" class="circle red" style="opacity:1"></div>';
                        }
                    } else {
                        if(dc['severity'] === 3) {
                            formattedDiv = '<div data-color="red" class="circle red filled" style="opacity:1"></div>';
                        } else if (dc['severity'] === 4) {
                            formattedDiv = '<div data-color="orange" class="circle orange filled" style="opacity:1"></div>';
                        }
                    }
                    return formattedDiv;
                }
            },
            {
                field: 'timestamp',
                name: 'Time',
                minWidth: 50
            },
            {
                field: 'alarm_msg',
                name: 'Alarm',
                minWidth: 250,
//                formatter : function (r, c, v, cd, dc) {
//                    return dc.description[0].rule;
//                }
            },
            {
                field: 'display_name',
                name: 'Source',
                minWidth: 100
            }
        ];

        this.bgpRouterColumns = [
                {
                    field:"ip",
                    id:"ip",
                    name:"IP Address",
                    sortable: true,
                    sorter : comparatorIP
                },
                {
                    field:"role",
                    id:"role",
                    name:"Type",
                    sortable: true
                },
                {
                    field:"vendor",
                    id:"vendor",
                    name:"Vendor",
                    sortable: true
                },
                {
                    field:"name",
                    id:"name",
                    name:"HostName",
                    sortable: true
                }
        ];

        this.projectInstancesColumns = [
            {
                field: 'vmName',
                name: 'Instance',
                formatter: function (r, c, v, cd, dc) {
                    if(!contrail.checkIfExist(dc['vmName'])) {
                        return '-';
                    } else if(!contrail.checkIfExist(dc['vnFQN']) || ctwu.isServiceVN(dc['vnFQN'])){
                        return '<div class="cell-no-link">' + cellTemplateLinks({cellText: 'vmName', tooltip: true, name: 'instance', rowData: dc}) + '</div>';
                    } else {
                        return cellTemplateLinks({cellText: 'vmName', tooltip: true, name: 'instance', rowData: dc});
                    }
                },
                minWidth: 230,
                searchable: true,
                events: {
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
                cssClass: 'cell-hyperlink-blue',
                exportConfig: {
                    allow: true,
                    stdFormatter: false
                }
            },
            {
                field: 'vn',
                name: 'Networks',
                formatter: function (r, c, v, cd, dc) {
                    return ctwu.formatValues4TableColumn(dc['vn']);
                },
                minWidth: 230,
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
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
                cssClass: 'cell-hyperlink-blue',
                exportConfig: {
                    allow: true,
                    stdFormatter: false
                }
            },
            {
                field: 'ip',
                name: 'IP Address',
                formatter: function (r, c, v, cd, dc) {
                    return ctwu.formatIPArray(dc['ip']);
                },
                minWidth: 150,
                exportConfig: {
                    allow: true,
                    stdFormatter: false
                }
            },
            {
                field: '',
                name: 'Aggr. Traffic In/Out (Last 1 Hr)',
                formatter: function (r, c, v, cd, dc) {
                    return cowu.addUnits2Bytes(dc['inBytes60'], true) + ' / ' + cowu.addUnits2Bytes(dc['outBytes60'], true);
                },
                minWidth: 200
            }
        ];
        this.getVMInterfacesLazyRemoteConfig = function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig,
                            interfaceList = getValueByJsonPath(responseJSON, 
                                'value;UveVirtualMachineAgent;interface_list', []);

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
                 minWidth: 200,
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
                     return contrail.format("{0} / {1}", cowu.addUnits2Bytes(dc['inBytes60'], true), cowu.addUnits2Bytes(dc['outBytes60'], true));
                 }
             },
             {
                 field: '',
                 name: 'Throughput In/Out',
                 minWidth: 150,
                 formatter: function (r, c, v, cd, dc) {
                     return contrail.format("{0} / {1}", formatThroughput(dc['in_bw_usage'], true), formatThroughput(dc['out_bw_usage'], true));
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

        this.getAcknowledgeAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_ACKNOWLEDGE,
                iconClass: 'icon-check-sign',
                width: 80,
                disabled:true,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            };
        };
        this.getAlertHistoryAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_ALARM_HISTORY,
                iconClass: 'icon-th',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            };
        };
        this.getEditConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
                iconClass: 'icon-edit',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getDeleteConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
                iconClass: 'icon-trash',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getEditAction = function (onClickFunction, title, divider) {
            return {
                title: title,
                iconClass: 'icon-edit',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getDeleteAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_DELETE_CONFIG,
                iconClass: 'icon-trash',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            };
        };
        this.getActiveDnsConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
               // iconClass: 'icon-trash',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
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
                            updatedDataItems = [],
                            statData;

                        for (var j = 0; j < statDataList.length; j++) {
                            statData = statDataList[j];
                            for (var i = 0; i < dataItems.length; i++) {
                                var dataItem = dataItems[i];
                                if (statData['name'] == dataItem['name']) {
                                    dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                                    dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                                    updatedDataItems.push(dataItem);
                                    break;
                                }
                            }
                        }
                        contrailListModel.updateData(updatedDataItems);
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
                            dataItems = contrailListModel.getItems(),
                            updatedDataItems = [];

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
                                    inThroughput += ifNull(interfaceDetail['in_bw_usage'], 0);
                                    outThroughput += ifNull(interfaceDetail['out_bw_usage'], 0);
                                    interfaceDetailsList.push(interfaceDetail);
                                }
                            }

                            if(interfaceDetailsList.length > 0) {
                                throughput = inThroughput + outThroughput;
                                dataItem['throughput'] = throughput;
                                dataItem['size'] = throughput;
                                uveVirtualMachineAgent['interface_details'] = interfaceDetailsList;
                                dataItem['vn'] = ifNull(jsonPath(interfaceDetailsList, '$...virtual_network'), []);

                                if (dataItem['vn'] != false) {
                                    if (dataItem['vn'].length != 0) {
                                        dataItem['vnFQN'] = dataItem['vn'][0];
                                    }
                                    dataItem['vn'] = ctwu.formatVNName(dataItem['vn']);
                                } else {
                                    dataItem['vn'] = '-';
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
                                updatedDataItems.push(dataItem);
                            }
                        }
                        contrailListModel.updateData(updatedDataItems);
                    }
                }
            ];
        };
    };

    return CTGridConfig;
});
