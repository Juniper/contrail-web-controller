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
                name: 'Severity',
                minWidth: 100,
                searchFn: function (d) {
                    return d['severity'];
                },
                searchable: true,
                formatter : function (r, c, v, cd, dc) {
                    var formattedDiv;
                    if(dc['ack']) {
                        formattedDiv = '<div data-color="orange" class="circle orange" style="opacity:1"></div>';
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
                minWidth: 200
            },
            {
                field: 'type',
                name: 'Alert',
                minWidth: 200
            },
            {
                field: 'name',
                name: 'Source',
                minWidth: 200
            }
        ];

        this.physicalRoutersColumns = [
                {
                    id : 'pRouterName',
                    field : 'pRouterName',
                    name : 'Name' ,
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            layoutHandler.setURLHashParams({uuid : dc.uuid},
                            {p : 'config_pd_interfaces' ,merge : false,
                            triggerHashChange : true});
                        }
                    }
                },
                {
                    id : 'mgmtIP',
                    field : 'mgmtIP',
                    name : 'Management IP',
                    sorter : comparatorIP
                },
                {
                    id : 'dataIP',
                    field : 'dataIP',
                    name : 'VTEP Address',
                    sorter : comparatorIP
                },
                {
                    id : 'interfaces',
                    field : 'totalInterfacesCount',
                    name : 'Interfaces',
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            layoutHandler.setURLHashParams({uuid : dc.uuid},
                            {p : 'config_pd_interfaces' ,merge : false,
                            triggerHashChange : true});
                        }
                    }
                }];

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
    };
    return CTGridConfig;
});
