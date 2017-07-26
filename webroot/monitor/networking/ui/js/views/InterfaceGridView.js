/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var InterfaceGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                modelMap = this.modelMap, parentType = viewConfig['parentType'],
                domain = viewConfig['domain'], projectFQN = viewConfig['projectFQN'],
                networkUUID = viewConfig['networkUUID'], projectUUID = viewConfig['projectUUID'],
                networkFQN = viewConfig['networkFQN'], instanceUUID = viewConfig['instanceUUID'],
                elementId = viewConfig['elementId'], interfaceList = [],
                interfacesAjaxConfig, viewModel, ucid;

            if (parentType == ctwc.TYPE_VIRTUAL_MACHINE && contrail.checkIfExist(modelMap) && modelMap[viewConfig['modelKey']] != null) {
                ucid = ctwc.get(ctwc.UCID_INSTANCE_INTERFACE_LIST, networkFQN, instanceUUID);
                //TODO: Create a model from data coming from ModelMap
                viewModel = modelMap[viewConfig['modelKey']];
                if (!(viewModel.isRequestInProgress())) {
                    interfaceList = contrail.checkIfExist(viewModel.attributes) ? viewModel.attributes['value']['UveVirtualMachineAgent']['interface_list'] : [];
                    interfacesAjaxConfig = getInterfacesAjaxConfig(parentType, {interfaceList: interfaceList}, ucid);
                    self.renderView4Config(self.$el, this.model, getInterfaceGridViewConfig(interfacesAjaxConfig, ucid, elementId));
                }

                viewModel.onAllRequestsComplete.subscribe(function () {
                    interfaceList = contrail.checkIfExist(viewModel.attributes) ? viewModel.attributes['value']['UveVirtualMachineAgent']['interface_list'] : [];
                    interfacesAjaxConfig = getInterfacesAjaxConfig(parentType, {interfaceList: interfaceList}, ucid);
                    self.renderView4Config(self.$el, this.model, getInterfaceGridViewConfig(interfacesAjaxConfig, ucid, elementId));
                });
            } else if (parentType == ctwc.TYPE_VIRTUAL_NETWORK) {
                interfacesAjaxConfig = nmwvc.getInterfaceListModelConfig(networkUUID, networkFQN);
                self.renderView4Config(self.$el, this.model, getInterfaceGridViewConfig(interfacesAjaxConfig, ucid, elementId));
            } else if (parentType == ctwc.TYPE_PROJECT) {
                interfacesAjaxConfig = nmwvc.getInterfaceListModelConfig(projectUUID, projectFQN);
                self.renderView4Config(self.$el, this.model, getInterfaceGridViewConfig(interfacesAjaxConfig, ucid, elementId));
            }
        }
    });

    function getInterfacesAjaxConfig(parentType, options, ucid) {
        var interfaceList = contrail.checkIfExist(options['interfaceList']) ? options['interfaceList'] : [],
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_VM_INTERFACES,
                        type: 'POST',
                        data: JSON.stringify({
                            parentType: parentType,
                            domain: options['domain'],
                            projectFQN: options['projectFQN'],
                            networkFQN: options['networkFQN'],
                            kfilt: interfaceList.join(','),
                            cfilt: ctwc.FILTERS_INSTANCE_LIST_INTERFACES.join(',')
                        })
                    },
                    dataParser: ctwp.interfaceDataParser
                },
                vlRemoteConfig: {
                    vlRemoteList: nmwgc.getInterfaceStatsVLOfPrimaryRemoteConfig()
                },
                cacheConfig : {
                    ucid: ucid
                }
            };
        return listModelConfig;
    };

    function getInterfaceGridViewConfig(interfacesAjaxConfig, ucid, elementId) {
        return {
            elementId: elementId,
            title: ctwl.TITLE_INTERFACES,
            view: "GridView",
            viewConfig: {
                elementConfig: getInstanceInterfacesConfig(interfacesAjaxConfig)
            }
        };
    };

    function getInstanceInterfacesConfig(interfacesAjaxConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_INTERFACES_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getInterfaceDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    fixedRowHeight: 30
                },
                dataSource: interfacesAjaxConfig,
                statusMessages: {
                    loading: {
                        text: 'Loading Interfaces..'
                    },
                    empty: {
                        text: 'No Interfaces Found.'
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.instanceInterfaceColumns
            },
            footer: {
                pager: { options: { pageSize: 8, pageSizeSelect: [8, 25, 50, 100] } }
            }
        };
        return gridElementConfig;
    };

    function getInterfaceDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_INTERFACE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'ip',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'mac_address',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'gateway',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'virtual_network',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'vm_name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'active',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'status-boolean'
                                                    }
                                                },
                                                {
                                                    key: 'is_health_check_active',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'status-boolean'
                                                    }
                                                },
                                                {
                                                    key: 'health_check_instance_list',
                                                    templateGenerator: 'BlockGridTemplateGenerator',
                                                    templateGeneratorConfig: {
                                                        dataColumn: [
                                                            {
                                                                key: 'uuid',
                                                                templateGenerator: 'TextGenerator',
                                                                templateGeneratorConfig: {
                                                                    width: 100
                                                                }
                                                            },
                                                            {
                                                                key: 'name',
                                                                templateGenerator: 'TextGenerator',
                                                                templateGeneratorConfig: {
                                                                    width: 90
                                                                }
                                                            },
                                                            {
                                                                key: 'status',
                                                                templateGenerator: 'TextGenerator',
                                                                templateGeneratorConfig: {
                                                                    width: 45
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    class: 'col-xs-6',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_TRAFFIC_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'throughput',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'throughput'
                                                    }
                                                },

                                            ]
                                        },{
                                            title: ctwl.TITLE_TAGS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'app',
                                                    templateGenerator: 'TextGenerator',
                                                },{
                                                    key: 'deployment',
                                                    templateGenerator: 'TextGenerator',
                                                },{
                                                    key: 'tier',
                                                    templateGenerator: 'TextGenerator',
                                                },{
                                                    key: 'site',
                                                    templateGenerator: 'TextGenerator',
                                                }
                                            ]
                                        },
                                        {
                                            title: ctwl.TITLE_FLOATING_IPS,
                                            key: 'floating_ips',
                                            templateGenerator: 'BlockGridTemplateGenerator',
                                            templateGeneratorConfig: {
                                                dataColumn: [
                                                    {
                                                        key: 'ip_address',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            width: 80
                                                        }
                                                    },
                                                    {
                                                        key: 'virtual_network',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            width: 350
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    return InterfaceGridView;
});
