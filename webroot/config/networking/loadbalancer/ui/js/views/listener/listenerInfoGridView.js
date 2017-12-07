/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/models/listenerInfoModel',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/views/listener/listenerInfoEditView'
], function (_, ContrailView, ListenerInfoModel, LbCfgFormatters, ListenerInfoEditView) {
    var gridElId = "#" + ctwc.CONFIG_LISTENER_INFO_GRID_ID;
    var lbCfgFormatters = new LbCfgFormatters();
    var listenerInfoEditView = new ListenerInfoEditView();
    var listenerInfoGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getListenerInfoGriewConfig(pagerOptions, viewConfig));
        }
    });

    var getListenerInfoGriewConfig = function (pagerOptions, viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LISTENER_INFO_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LISTENER_INFO_GRID_ID,
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
                        text: 'Loading Listener Details..'
                    },
                    empty: {
                        text: 'No Listener Details Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting Listener Details.'
                    }
                }
            },
            columnHeader: {
                columns: listenerInfoColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var listenerInfoColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Listener Details',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: lbCfgFormatters.listenerValueFormatter,
            sortable: false
        }
    ];

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Edit Listener Details',
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    listenerInfoEditView.model = new ListenerInfoModel(viewConfig.listener.list);
                    listenerInfoEditView.renderEditListenerInfo({
                                  "title": 'Edit Listener Details',
                                  callback: function() {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    }

   return listenerInfoGridView;
});

