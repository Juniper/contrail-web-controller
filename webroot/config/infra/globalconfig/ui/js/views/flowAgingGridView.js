/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/flowAgingModel',
    'config/infra/globalconfig/ui/js/views/flowAgingEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, FlowOptionsModel, FlowOptionsEditView,
             GlobalConfigFormatters) {
   var flowOptionsEditView = new FlowOptionsEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_FLOW_AGING_GRID_ID;

    var flowAgingGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getFlowAgingGridViewConfig(pagerOptions));
        }
    });

    var getFlowAgingGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_FLOW_AGING_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_FLOW_AGING_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FLOW_AGING
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable : false,
                    detail: false,
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Flow Aging..'
                    },
                    empty: {
                        text: 'No Flow Aging Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting Flow Aging.'
                    }
                }
            },
            columnHeader: {
                columns: flowOptionsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var flowOptionsColumns = [
        {
            field: 'protocol',
            name: 'Protocol',
            sortable: true
        },
        {
            field: 'port',
            name: 'Port',
            sortable: true
        },
        {
            field: 'timeout_in_seconds',
            name: 'Timeout (secs)',
            sortable: true
        },
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_FLOW_AGING,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-vrouter-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(response) {
                        var flowOptionsData = getValueByJsonPath(response,
                            "0;global-vrouter-configs;0;global-vrouter-config", {});
                        flowOptionsModel = new FlowOptionsModel(flowOptionsData);
                        flowOptionsEditView.model = flowOptionsModel;
                        flowOptionsEditView.renderEditFlowOptions({
                                      "title": ctwl.TITLE_EDIT_FLOW_AGING,
                                      callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }, function(error) {
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return flowAgingGridView;
});

