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

        this.linkLocalServicesColumns = [
            {
                id: 'linklocal_service_name',
                field: 'linklocal_service_name',
                name: 'Service Name',
                cssClass :'cell-hyperlink-blue'
            },
            {
                id: 'linklocal_service_ip',
                field: 'linklocal_service_ip',
                name: 'Service Address',
                formatter: function(row, col, val, d, rowData) {
                    var dispStr = "";
                    if (null != rowData) {
                        if (null != rowData['linklocal_service_ip']) {
                            dispStr = rowData['linklocal_service_ip'];
                        }
                        if (null != rowData['linklocal_service_port']) {
                            dispStr += ":" +
                                rowData['linklocal_service_port'].toString();
                        }
                        return dispStr;
                    }
                    return "";
                }
            },
            {
                id: 'ip_fabric_service_ip',
                field: 'ip_fabric_service_ip',
                name: 'Fabric Address',
                formatter: function(row, col, val, d, rowData) {
                    var dispStr = "";
                    if (null != rowData) {
                        if ((null != rowData['ip_fabric_service_ip']) &&
                            (rowData['ip_fabric_service_ip'] instanceof Array) &&
                            (rowData['ip_fabric_service_ip'].length > 0)) {
                            dispStr = rowData['ip_fabric_service_ip'].join(',');
                        } else {
                            dispStr = rowData['ip_fabric_DNS_service_name'];
                        }
                        if (null != rowData['ip_fabric_service_port']) {
                            dispStr += ":" +
                                rowData['ip_fabric_service_port'].toString();
                        }
                        return dispStr;
                    }
                    return "";
                }
            }
        ];

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
        this.doDeleteConfig = function (title, onClickFunction, divider) {
            return {
                title: title,
                iconClass: 'icon-trash',
                width: 80,
                divider: contrail.checkIfExist(divider) ? divider : false,
                onClick: onClickFunction
            }
        };
    };
    return CTGridConfig;
});
