/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'web-utils',
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, webUtils, qeUtils) {
    var CTGridConfig = function () {

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
                field: 'uuid',
                name: 'UUID',
                width: 100
            },
            {
                field: 'vmName',
                name: 'Instance Name',
                formatter: function (r, c, v, cd, dc) {
                    if(!contrail.checkIfExist(dc['vmName'])) {
                        return '-';
                    } else if(!contrail.checkIfExist(dc['vnFQN']) || ctwu.isServiceVN(dc['vnFQN'])){
                        return cowf.formatElementName({name: 'instance', value: dc['vmName'], cssClass: 'cell-no-link'});
                    } else {
                        return cowf.formatElementName({name: 'instance', value: dc['vmName'], cssClass: 'cell-hyperlink-blue'});
                    }
                },
                width: 150,
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
                field: 'vn',
                name: 'Networks',
                formatter: function (r, c, v, cd, dc) {
                    return cowf.formatElementName({name: 'vn', value: dc['vn'], cssClass: 'cell-hyperlink-blue'});
                },
                width: 150,
                searchable: true,
                events: {
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
            },
            {
                field: 'intfCnt',
                name: 'Interfaces',
                width: 80
            },
            {
                field: 'fipCnt',
                name: 'Floating IPs',
                width: 80
            },
            {
                field: 'vRouter',
                name: 'Virtual Router',
                formatter: function (r, c, v, cd, dc) {
                    return cowf.formatElementName({name: 'vRouter', value: dc['vRouter'], cssClass: 'cell-hyperlink-blue'});
                },
                width: 100,
                events: {
                    onClick: ctwu.onClickNetworkMonitorGrid
                },
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
                width: 110,
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
                width: 200
            },
            {
                field: '',
                name: '',
                width: 30,
                maxWidth: 30,
                formatter: function (r, c, v, cd, dc) {
                    var errorMessage = '', instanceHealthCheckStatus = null;

                    if (contrail.checkIfExist(dc.raw_json) && !contrail.checkIfKeyExistInObject(false, dc.raw_json.value, 'UveVirtualMachineAgent')) {
                        errorMessage = ctwm.INSTANCE_DATA_NOT_AVAILABLE;
                    } else if (contrail.checkIfKeyExistInObject(true, dc, 'ui_added_parameters.instance_health_check_status') && dc['ui_added_parameters']['instance_health_check_status'] === false) {
                        errorMessage = ctwm.HEALTH_CHECK_STATUS_INACTIVE;
                    }

                    return (errorMessage !== '') ? '<i class="fa fa-exclamation-triangle red" title="' + errorMessage + '"></i>' : '';
                 }
            }
        ];
        this.getVMInterfacesLazyRemoteConfig = function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig,
                            interfaceList = getValueByJsonPath(responseJSON, 'value;UveVirtualMachineAgent;interface_list', []);

                        lazyAjaxConfig = {
                            url: ctwc.URL_VM_INTERFACES,
                            type: 'POST',
                            data: JSON.stringify({kfilt: interfaceList.join(','), parentType: ctwc.TYPE_VIRTUAL_MACHINE})
                        };

                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailViewModel) {
                        var interfaceMap = ctwp.instanceInterfaceDataParser(response),
                            interfaceDetailsList = _.values(interfaceMap);

                        if (interfaceDetailsList.length > 0) {
                          contrailViewModel.attributes['value']['UveVirtualMachineAgent']['interface_details'] = interfaceDetailsList;  
                          contrailViewModel.attributes.vm_name = interfaceDetailsList[0]['vm_name'];
                        }
                    }
                }
            ]
        };

        this.instanceInterfaceColumns = [
            {
                field: "name",
                name: "Name",
                minWidth: 100,
                searchable: true
            },
            {
                field: 'uuid',
                name: 'UUID',
                minWidth: 100,
                searchable: true
            },
            {
                field: 'ip',
                name: 'IP Address',
                minWidth: 100,
                searchable: true
            },
            {
                field: 'vm_name',
                name: 'Instance Name',
                minWidth: 250,
                searchable: true
            },
            {
                field: 'floatingIP',
                name: 'Floating IPs ( Agg Stats In/Out)',
                formatter: function (r, c, v, cd, dc) {
                    if (!contrail.checkIfExist(dc['floatingIP']) || dc['floatingIP'].length == 0) {
                        return '-';
                    } else {
                        return dc['floatingIP'].join(', ');
                    }
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
            },
            {
                field: '',
                name: '',
                minWidth: 30,
                maxWidth: 30,
                formatter: function (r, c, v, cd, dc) {
                    if (dc['is_health_check_active'] === false) {
                        return '<i class="fa fa-exclamation-triangle red" title="' + ctwm.HEALTH_CHECK_STATUS_INACTIVE + '"></i>';
                    }

                    return '';
                }
            }
        ];

        this.getAcknowledgeAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_ACKNOWLEDGE,
                iconClass: 'fa fa-check-square',
                width: 80,
                disabled:true,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            };
        };
        this.getAlertHistoryAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_ALARM_HISTORY,
                iconClass: 'fa fa-th',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            };
        };
        this.getEditConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
                iconClass: 'fa fa-pencil-square-o',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getCustomConfig = function (title, iconClass, onClickFunction, divider) {
            return {
                title: title,
                iconClass: iconClass,
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getDeleteConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
                iconClass: 'fa fa-trash',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getEditAction = function (onClickFunction, title, divider) {
            return {
                title: title,
                iconClass: 'fa fa-pencil-square-o',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getListAction = function (onClickFunction, title, divider) {
            return {
                title: title,
                iconClass: 'fa fa-list-alt',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
        this.getDeleteAction = function (onClickFunction, divider) {
            return {
                title: ctwl.TITLE_DELETE_CONFIG,
                iconClass: 'fa fa-trash',
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
                        var uuids = [], lazyAjaxConfig;
                        var whereClause = null;
                        var len = responseJSON.length;

                        for (var i = 0; i < len; i++) {
                            uuids.push(responseJSON[i].name);
                        }
                        var domCookie = contrail.getCookie(cowc.COOKIE_DOMAIN);
                        var projCookie = contrail.getCookie(cowc.COOKIE_PROJECT);
                        var vnCookie = ctwc.COOKIE_VIRTUAL_NETWORK;
                        whereClause = "(name Starts with " + domCookie + ":" + projCookie +
                            ":)";
                        if (ctwc.ALL_PROJECTS === projCookie) {
                            whereClause = "(name Starts with " + domCookie + ":)";
                        } else if (ctwc.ALL_NETWORKS == vnCookie) {
                            whereClause = "(name Starts with " + domCookie + ":" +
                                projCookie + ":)";
                        }
                        var whereClause =
                            qeUtils.formatUIWhereClauseConfigByUserRole(whereClause, "vm_uuid", uuids);
                        var qObj = {table: "StatTable.UveVMInterfaceAgent.if_stats",
                                where: whereClause};
                        var postData = qeUtils.formatQEUIQuery(qObj);

                        lazyAjaxConfig = {
                            url: cowc.URL_QE_QUERY,
                            type: 'POST',
                            data: JSON.stringify(postData)
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel) {
                        var statDataList = ctwp.parseInstanceStats(response.data, type),
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
                                parentType: ctwc.TYPE_VIRTUAL_MACHINE,
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
                                dataItem['fipCnt'] = 0;
                                dataItem['size'] = throughput;
                                uveVirtualMachineAgent['interface_details'] = interfaceDetailsList;
                                dataItem['vn'] = ifNull(jsonPath(interfaceDetailsList, '$...virtual_network'), [])

                                if (dataItem['vn'] != false) {
                                    if (dataItem['vn'].length != 0) {
                                        dataItem['vnFQN'] = dataItem['vn'][0];
                                    }
                                    dataItem['vn'] = ctwu.formatVNName(dataItem['vn'],
                                                                       cowc.COOKIE_DOMAIN + ":" +
                                                                       cowc.COOKIE_PROJECT);
                                } else {
                                    dataItem['vn'] = '-';
                                }

                                dataItem['ip'] = [];
                                dataItem['fipCnt'] = 0;
                                for (var k = 0; k < interfaceDetailsList.length; k++) {

                                    if (interfaceDetailsList[k]['is_health_check_active'] === false) {
                                        dataItem['ui_added_parameters']['instance_health_check_status'] = false;
                                    }

                                    if (interfaceDetailsList[k]['ip6_active'] == true) {
                                        if (interfaceDetailsList[k]['ip_address'] != '0.0.0.0')
                                            dataItem['ip'].push(interfaceDetailsList[k]['ip_address']);
                                        if (interfaceDetailsList[k]['ip6_address'] != null)
                                            dataItem['ip'].push(interfaceDetailsList[k]['ip6_address']);
                                    } else {
                                        if (interfaceDetailsList[k]['ip_address'] != '0.0.0.0')
                                            dataItem['ip'].push(interfaceDetailsList[k]['ip_address']);
                                    }
                                    dataItem['fipCnt'] += interfaceDetailsList[k]['count_floating_ips'];
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
