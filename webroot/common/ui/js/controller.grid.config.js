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
                            contrail.setCookie(ctwl.PROUTER_KEY, dc.pRouterName)
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

        this.interfacesColumns = [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'
                },
                {
                    id : 'type',
                    field : 'type',
                    name : 'Type'
                },
                {
                    id : 'parent',
                    field : 'parent',
                    name : 'Parent'
                },
                {
                    id : ctwl.VLAN,
                    field : ctwl.VLAN,
                    name : 'VLAN'
                },
                {
                    id : 'server',
                    field : 'server',
                    name : 'Servers',
                    formatter:function(r,c,v,cd,dc){
                        var servers = v;
                        var serverString = '';
                        if(servers == '' || servers == '-' ||
                            servers.length < 1)
                            return '-';
                        $.each(servers,function(i,d){
                            if(i == 0){
                                serverString = d;
                            } else {
                                serverString += '</br>' + d;
                            }
                        })
                        return serverString;
                    },
                    searchFn:function(d) {
                        return d['server'];
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
