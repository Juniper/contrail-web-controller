/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/forwardingOptionsModel',
    'config/infra/globalconfig/ui/js/views/forwardingOptionsEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, ForwardingOptionsModel, ForwardingOptionsEditView,
             GlobalConfigFormatters) {
    var forwardingOptionsEditView = new ForwardingOptionsEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_FORWARDING_OPTIONS_GRID_ID;

    var forwardingOptionsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getForwardingOptionsGridViewConfig(pagerOptions));
        }
    });

    var getForwardingOptionsGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_FORWARDING_OPTIONS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_FORWARDING_OPTIONS_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ""//ctwl.TITLE_FORWARDING_OPTIONS
                },
                defaultControls: {
                    exportable: false
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
                        text: 'Loading Forwarding Options..'
                    },
                    empty: {
                        text: 'No Forwarding Options Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting Forwarding Options.'
                    }
                }
            },
            columnHeader: {
                columns: forwardingOptionsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var forwardingOptionsColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Forwarding Option',
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
                "title": ctwl.TITLE_EDIT_FORWARDING_OPTIONS,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-vrouter-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(response) {
                        var fwdOptionsData = getValueByJsonPath(response,
                            "0;global-vrouter-configs;0;global-vrouter-config", {});
                        forwardingOptionsModel = new ForwardingOptionsModel(fwdOptionsData);
                        forwardingOptionsEditView.model = forwardingOptionsModel;
                        forwardingOptionsEditView.renderEditForwardingOptions({
                                      "title": ctwl.TITLE_EDIT_FORWARDING_OPTIONS,
                                      callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    },function(error){
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return forwardingOptionsGridView;
});

