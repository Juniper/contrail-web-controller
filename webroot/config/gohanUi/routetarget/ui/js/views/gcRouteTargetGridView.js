/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/routetarget/ui/js/models/gcRouteTargetModel',
    'config/gohanUi/routetarget/ui/js/views/gcRouteTargetEditView'],
    function (_, ContrailView, GcRouteTargetModel, GcRouteTargetEditView) {
    var dataView;
    var gcRouteTargetEditView = new GcRouteTargetEditView();
    var routeTargetGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getRouteTargetGridViewConfig());
        }
    });


    var getRouteTargetGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_ROUTE_TARGET_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_ROUTE_TARGET_GRID_ID,
                                title: ctwl.CFG_ROUTE_TARGET_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };


    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CFG_ROUTE_TARGET_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getRouteTargetDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Route Target..'
                    },
                    empty: {
                        text: 'No Route Target Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                        {
                            id: "network_id",
                            field: "network_id",
                            name: "Network ID",
                            formatter: networkIdFormatter,
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                        },
                        {
                             field: 'route_target',
                             name: 'Route Target',
                             id: 'route_target'
                        }
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_ROUTE_TARGET_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcRouteTargetEditView.model = new GcRouteTargetModel();
                    gcRouteTargetEditView.renderAddRouteTarget({
                                              "title": 'Create Route Target Association',
                                              callback: function () {
                       $('#' + ctwl.CFG_ROUTE_TARGET_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_ROUTE_TARGET_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcRouteTargetEditView.model = new GcRouteTargetModel(dataItem);
           gcRouteTargetEditView.renderDeleteRouteTarget({
                                  "title": 'Delete Route Target Association',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_ROUTE_TARGET_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getRouteTargetDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                       {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'network_id',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Network ID',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'networkIdFormatter'
                                                    }
                                                },
                                                {
                                                    label: 'Route Target',
                                                    key: 'route_target',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                }
                                            ]
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

    this.networkIdFormatter = function(value, dc) {
        return networkIdFormatter(null, null, null, value, dc, true);
    };

    function networkIdFormatter(r, c, v, cd, dc, showAll) {
        var  name = getValueByJsonPath(dc, 'network;name', '-');
        return  name;
    }
    return routeTargetGridView;
});
