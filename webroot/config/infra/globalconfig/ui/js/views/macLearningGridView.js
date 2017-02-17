/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/macLearningModel',
    'config/infra/globalconfig/ui/js/views/macLearningEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, MACLearningModel, MACLearningEditView, GlobalConfigFormatters) {
    var macLearningEditView = new MACLearningEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_MAC_LEARNING_GRID_ID;

    var macLearningGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getMACLearningGridViewConfig(pagerOptions));
        }
    });

    var getMACLearningGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_MAC_LEARNING_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_MAC_LEARNING_GRID_ID,
                                title: ctwl.TITLE_MAC_LEARNING,
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
                    text: ""
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
                        text: 'Loading MAC Learning Options..'
                    },
                    empty: {
                        text: 'No MAC Learning Options Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting MAC Learning Options.'
                    }
                }
            },
            columnHeader: {
                columns: macLearningsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var macLearningsColumns = [
        {
            id: 'name',
            field: 'name',
            maxWidth: '365',
            name: 'MAC Learning Option',
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
                "title": ctwl.TITLE_EDIT_MAC_LEARNING,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-system-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                        var macLearningData = getValueByJsonPath(result,
                            "0;global-system-configs;0;global-system-config", {});
                        macLearningModel = new MACLearningModel(macLearningData);
                        macLearningEditView.model = macLearningModel;
                        macLearningEditView.renderEditMACLearning({
                                      "title": ctwl.TITLE_EDIT_MAC_LEARNING,
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

   return macLearningGridView;
});

