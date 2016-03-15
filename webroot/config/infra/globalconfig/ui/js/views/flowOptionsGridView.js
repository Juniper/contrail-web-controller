/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/flowOptionsModel',
    'config/infra/globalconfig/ui/js/views/flowOptionsEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, FlowOptionsModel, FlowOptionsEditView,
             GlobalConfigFormatters) {
   var flowOptionsEditView = new FlowOptionsEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_FLOW_OPTIONS_GRID_ID;

    var flowOptionsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getFLOWOptionsGridViewConfig(pagerOptions));
        }
    });

    var getFLOWOptionsGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_FLOW_OPTIONS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_FLOW_OPTIONS_GRID_ID,
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
                    text: ""//ctwl.TITLE_FLOW_OPTIONS
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
                        text: 'Loading Flow Options..'
                    },
                    empty: {
                        text: 'No Flow Options.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Flow Options.'
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
            id: 'name',
            field: 'name',
            name: 'Configuration Option',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: globalConfigFormatters.valueFormatter,
            sortable: false
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_FLOW_OPTIONS,
                "iconClass": 'icon-edit',
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
                                      "title": ctwl.TITLE_EDIT_FLOW_OPTIONS,
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

   return flowOptionsGridView;
});

