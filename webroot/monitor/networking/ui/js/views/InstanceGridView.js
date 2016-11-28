/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, ContrailView, qeUtils) {
    var InstanceGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                parentUUID = viewConfig['parentUUID'],
                parentType = viewConfig['parentType'],
                parentFQN = viewConfig['parentFQN'],
                pagerOptions = viewConfig['pagerOptions'];

            var instanceRemoteConfig = {
                url: ctwc.get(ctwc.URL_GET_NETWORK_INSTANCES, 100, 1000, $.now()),
                type: 'POST',
                data: JSON.stringify({
                    id: qeUtils.generateQueryUUID(),
                    FQN: parentFQN
                })
            };

            // TODO: Handle multi-tenancy
            var ucid = (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" + 'virtual-machines') : ctwc.UCID_ALL_VM_LIST;

            self.renderView4Config(self.$el, this.model, getInstanceGridViewConfig(instanceRemoteConfig, ucid, pagerOptions));
        }
    });

    var getInstanceGridViewConfig = function (instanceRemoteConfig, ucid, pagerOptions) {
        return {
            elementId: ctwl.PROJECT_INSTANCE_GRID_ID,
            title: ctwl.TITLE_INSTANCES,
            view: "GridView",
            viewConfig: {
                elementConfig: getProjectInstancesConfig(instanceRemoteConfig, ucid, pagerOptions)
            }
        };
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig, ucid, pagerOptions) {
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
                        vlRemoteList: ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE)
                    },
                    cacheConfig : {
                        ucid: ucid
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Instances..'
                    },
                    empty: {
                        text: 'No Instances Found.'
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.projectInstancesColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, { options: { pageSize: 5, pageSizeSelect: [5, 10, 50, 100] } })
            }
        };
        return gridElementConfig;
    };

    return InstanceGridView;
});
