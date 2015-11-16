/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterVirtualMachinesGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pageOptions = viewConfig['pageOptions'],
                hostName = viewConfig['hostname'];

                var instanceRemoteConfig = {
                    url: ctwc.get(
                        monitorInfraConstants.monitorInfraUrls.VROUTER_INSTANCES_IN_CHUNKS,
                        hostName, 50, $.now()),
                    type: 'POST',
                    data: JSON.stringify({
                        data: [{
                                "type": ctwc.TYPE_VIRTUAL_MACHINE,
                                "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')
                        }]
                    })
                };
                self.renderView4Config(self.$el,
                     null,
                     getInstanceGridViewConfig(instanceRemoteConfig, hostName, pageOptions));
        }
    });

    var getInstanceGridViewConfig = function (instanceRemoteConfig, hostName, pageOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_INSTANCE_GRID_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectInstancesConfig(instanceRemoteConfig, hostName, pageOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig, hostName, pageOptions) {
        var instancevlRemoteConfig = ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE);
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_INSTANCES_SUMMARY
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
                        template: cowu.generateDetailTemplateHTML(ctwvc.getDetailRowInstanceTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER, 'value')
                    },
                    fixedRowHeight: 30
                },
                dataSource: {
                    remote: {
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: ctwp.instanceDataParser
                    },
                    vlRemoteConfig: {
                        vlRemoteList: instancevlRemoteConfig
                    },
                    cacheConfig : {
                        ucid: hostName
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
            },
            footer: {
                pager: contrail.handleIfNull(pageOptions, { options: { pageSize: 50, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    return VRouterVirtualMachinesGridView;
});
