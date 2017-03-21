/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/qosControlTrafficModel',
    'config/infra/globalconfig/ui/js/views/qosControlTrafficEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, QoSControlTrafficModel, QoSControlTrafficEditView, GlobalConfigFormatters) {
    var qosControlTrafficEditView = new QoSControlTrafficEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_CONTROL_TRAFFIC_GRID_ID;

    var qosControlTrafficGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getQoSControlTrafficGridViewConfig(pagerOptions));
        }
    });

    var getQoSControlTrafficGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_CONTROL_TRAFFIC_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_CONTROL_TRAFFIC_GRID_ID,
                                title: ctwl.TITLE_CONTROL_TRAFFIC,
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
                        text: 'Loading Control Traffic Options..'
                    },
                    empty: {
                        text: 'No Control Traffic Options Found.'
                    }
                }
            },
            columnHeader: {
                columns: qosControlTrafficsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var qosControlTrafficsColumns = [
        {
            id: 'name',
            field: 'name',
            maxWidth: '365',
            name: 'Control Traffic Option',
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
                "title": ctwl.TITLE_EDIT_CONTROL_TRAFFIC,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-qos-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                        var qosControlTrafficData = getValueByJsonPath(result,
                            "0;global-qos-configs;0;global-qos-config", {});
                        qosControlTrafficModel = new QoSControlTrafficModel(qosControlTrafficData);
                        qosControlTrafficEditView.model = qosControlTrafficModel;
                        qosControlTrafficEditView.renderEditQoSControlTraffic({
                                      "title": ctwl.TITLE_EDIT_CONTROL_TRAFFIC,
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

   return qosControlTrafficGridView;
});

