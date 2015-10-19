/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var ControlRoutesResultView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, self.model, self.getViewConfig());
        },

        getViewConfig: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];
            var routesGridColumns = [
                                     {
                                        field:"table",
                                        name:"Routing Table",
                                        minWidth:200
                                     },
                                     {
                                         field:"dispPrefix",
                                         name:"Prefix",
                                         minWidth:200
                                     },
                                     {
                                         field:"protocol",
                                         name:"Protocol",
                                         minWidth:40
                                     },
                                     {
                                         field:"source",
                                         name:"Source",
                                         minWidth:130
                                     },
                                     {
                                         field:"next_hop",
                                         name:"Next hop",
                                         minWidth:70
                                     },
                                     {
                                         field:"label",
                                         name:"Label",
                                         minWidth:40
                                     },
                                     {
                                         field:"sg",
                                         name:"Security Group",
                                         minWidth:80
                                     },
                                     {
                                        field:"originVn",
                                        name:"Origin VN",
                                        minWidth:180
                                     }
                                  ];


            return {
                elementId: ctwl.CONTROLNODE_ROUTES_GRID_ID,
                title: 'Routes',
                view: "GridView",
                viewConfig: {
                    elementConfig: getControlRoutesGridConfig( routesGridColumns)
                }
            }
        }
    });

    function getControlRoutesGridConfig( routesGridColumns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Routes',
                    icon : 'icon-table'
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    sortable: false,
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: routesGridColumns
            }
        };
        return gridElementConfig;
    };


    return ControlRoutesResultView;
});