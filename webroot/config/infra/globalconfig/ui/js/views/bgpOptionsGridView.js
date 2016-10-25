/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/bgpOptionsModel',
    'config/infra/globalconfig/ui/js/views/bgpOptionsEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, BGPOptionsModel, BGPOptionsEditView, GlobalConfigFormatters) {
    var bgpOptionsEditView = new BGPOptionsEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_BGP_OPTIONS_GRID_ID;

    var bgpOptionsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getBGPOptionsGridViewConfig(pagerOptions));
        }
    });

    var getBGPOptionsGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_BGP_OPTIONS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_BGP_OPTIONS_GRID_ID,
                                title: ctwl.TITLE_BGP_OPTIONS,
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
                    text: ""//ctwl.TITLE_BGP_OPTIONS
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
                        text: 'Loading BGP Options..'
                    },
                    empty: {
                        text: 'No BGP Options Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting BGP Options.'
                    }
                }
            },
            columnHeader: {
                columns: bgpOptionsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var bgpOptionsColumns = [
        {
            id: 'name',
            field: 'name',
            maxWidth: '365',
            name: 'BGP Option',
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
                "title": ctwl.TITLE_EDIT_BGP_OPTIONS,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-system-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                        var bgpOptionsData = getValueByJsonPath(result,
                            "0;global-system-configs;0;global-system-config", {});
                        bgpOptionsModel = new BGPOptionsModel(bgpOptionsData);
                        bgpOptionsEditView.model = bgpOptionsModel;
                        bgpOptionsEditView.renderEditBGPOptions({
                                      "title": ctwl.TITLE_EDIT_BGP_OPTIONS,
                                      callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }, function(error){
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return bgpOptionsGridView;
});

