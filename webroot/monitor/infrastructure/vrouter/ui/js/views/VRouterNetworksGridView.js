/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var VRouterNetworksGridView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(self.attributes));
        },

        getViewConfig: function (attributes) {
            var viewConfig = attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];
            var columns = [{
                field: "name",
                id: "name",
                name: "Name"
            }, {
                field: "acl_uuid",
                id: "acl",
                name: "ACLs",
                cssClass: 'cell-hyperlink-blue',
                events: {
                    onClick: function(e, dc) {
                        var tabIdx = $.inArray("acl", computeNodeTabs);
                        selectTab(computeNodeTabStrip, tabIdx);
                    }
                }
            }, {
                field: "vrf_name",
                id: "vrf",
                name: "VRF",
                cssClass: 'cell-hyperlink-blue',
                events: {
                    onClick: function(e, dc) {
                        var tabIdx = $.inArray("routes", computeNodeTabs);
                        var data = {
                            tab: "routes",
                            filters: [{
                                routeName: dc['vrf_name']
                            }]
                        };
                        $('#' + ctwl.VROUTER_TAB_VIEW_ID).data('tabFilter', data);
                        selectTab(ctwl.VROUTER_TAB_VIEW_ID, tabIdx);
                    }
                }
            }];

            return {
                elementId: ctwl.VROUTER_NETWORKS_GRID_VIEW_ID,
                title: 'Routes',
                view: "GridView",
                viewConfig: {
                    elementConfig: getGridConfig( columns)
                }
            }
        }
    });

    function getGridConfig( columns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Networks'
                },
                customControls : monitorInfraUtils.getGridPaginationControls(),
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            footer:false,
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    sortable: false,
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Networks..',
                    },
                    empty: {
                        text: 'No Networks to display'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Data.'
                    }
                }
            },
            columnHeader: {
                columns: columns
            }
        };
        return gridElementConfig;
    };


    return VRouterNetworksGridView;
});
