/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/models/poolModel',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/views/pool/poolEditView'
], function (_, ContrailView, PoolModel, LbCfgFormatters, PoolEditView) {
    var gridElId = "#" + ctwc.CONFIG_POOL_INFO_GRID_ID;
    var lbCfgFormatters = new LbCfgFormatters();
    var poolEditView = new PoolEditView();
    var poolInfoGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   gePoolInfoGriewConfig(pagerOptions, viewConfig));
        }
    });

    var gePoolInfoGriewConfig = function (pagerOptions, viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_POOL_INFO_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_POOL_INFO_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions, viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions, viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ""//ctwl.TITLE_FORWARDING_OPTIONS
                },
                defaultControls: {
                    exportable: false
                },
                advanceControls: getHeaderActionConfig(viewConfig),
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
                        text: 'Loading Pool Details..'
                    },
                    empty: {
                        text: 'No Pool Details Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting Pool Details'
                    }
                }
            },
            columnHeader: {
                columns: poolInfoColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var poolInfoColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Pool Details',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: lbCfgFormatters.poolValueFormatter,
            sortable: false
        }
    ];

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Edit Pool Details',
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var lbProvider = viewConfig.lbProvider;
                    var model = viewConfig.pool.list;
                    model['lb_provider'] = lbProvider;
                    poolEditView.model = new PoolModel(model);
                    poolEditView.renderEditPool({
                              "title": 'Edit Pool Details',
                              'lbProvider': lbProvider,
                              callback: function () {
                                  var dataView =
                                      $(gridElId).data("contrailGrid")._dataView;
                                  dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    }

   return poolInfoGridView;
});

