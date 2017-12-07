/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/models/monitorModel',
    'config/networking/loadbalancer/ui/js/views/monitor/monitorEditView'
    ],
    function (_, ContrailView, LbCfgFormatters, MonitorModel, MonitorEditView) {
    var lbCfgFormatters = new LbCfgFormatters();
    var monitorEditView = new MonitorEditView();
    var dataView;
    var monitorGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getMonitorGridViewConfig(viewConfig));
        }
    });


    var getMonitorGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_MONITOR_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_MONITOR_GRID_ID,
                                title: ctwc.CONFIG_LB_MONITOR_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };


    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwc.CONFIG_LB_MONITOR_TITLE
                },
                defaultControls: {
                    //columnPickable:true
                 },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    autoRefresh: false,
                    disableRowsOnLoading:true,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#monitorDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#monitorDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig,
                    detail: {
                        noCache: true,
                        template: cowu.generateDetailTemplateHTML(
                                       geMonitorDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Monitors..'
                    },
                    empty: {
                        text: 'No Monitors Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                    {
                        id: 'display_name',
                        field: 'display_name',
                        name: 'Name',
                    },
                    {
                        field:  'uuid',
                        name:   'Description',
                        formatter: lbCfgFormatters.listenerDescriptionFormatter,
                        sortable: {
                           sortBy: 'formattedValue'
                        }
                    },
                    {
                         field:  'uuid',
                         name:   'Type',
                         formatter: lbCfgFormatters.monitorTypeFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Expected Codes',
                         formatter: lbCfgFormatters.monitorExpectedCodesFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Max Retries',
                         formatter: lbCfgFormatters.monitorMaxRetriesFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Dely',
                         formatter: lbCfgFormatters.monitorDelayFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Timeout',
                         formatter: lbCfgFormatters.monitorTimeoutFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Admin State',
                         formatter: lbCfgFormatters.monitorAdminStateFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     }
                ]
            },
        };
        return gridElementConfig
    };

    function getHeaderActionConfig() {
        /*var headerActionConfig = [
            {
                "type": "link",
                "title": 'Delete Monitor',
                "iconClass": "fa fa-trash",
                "linkElementId": "monitorDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.CONFIG_LB_MONITOR_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    monitorEditView.model = new MonitorModel();
                    monitorEditView.renderMultiDeleteMonitor({"title": 'Delete Monitor',
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];*/
        return [] //headerActionConfig;
    }

    function  getRowActionConfig (dc) {
        rowActionConfig = [
            ctwgc.getEditConfig('Edit Health Monitor', function(rowIndex) {
                dataView = $('#' + ctwc.CONFIG_LB_MONITOR_GRID_ID).data("contrailGrid")._dataView;
                monitorEditView.model = new MonitorModel(dataView.getItem(rowIndex));;
                monitorEditView.renderMonitorEdit({
                                      "title": 'Edit Monitor',
                                      callback: function () {
                                          dataView.refreshData();
                }});
            })
        ];
        /*rowActionConfig.push(ctwgc.getDeleteConfig('Delete Health Monitor', function(rowIndex) {
                dataView = $('#' + ctwc.CONFIG_LB_MONITOR_GRID_ID).data("contrailGrid")._dataView;
                monitorEditView.model = new MonitorModel();
                monitorEditView.renderMultiDeleteMonitor({
                                      "title": 'Delete Monitor',
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                }});
            }));*/
        return rowActionConfig;
    };

    function geMonitorDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        //Change  once the AJAX call is corrected
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
                                                    key: 'name',
                                                    label: 'Name',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    key: 'display_name',
                                                    label: 'Display Name',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    key: 'uuid',
                                                    label: 'UUID',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Description',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'listenerDescription'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Type',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorType'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Expected Codes',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorExpectedCodes'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Max Retries',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorMaxRetries'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Dely',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorDelay'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Timeout',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorTimeout'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Admin State',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'monitorAdminState'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                }
                                            ]
                                        },
                                        ctwu.getRBACPermissionExpandDetails('col-xs-3')
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.monitorType = function (v, dc) {
        return lbCfgFormatters.monitorTypeFormatter(null,
                                        null, null, null, dc);
    };

    this.monitorExpectedCodes = function (v, dc){
        return lbCfgFormatters.monitorExpectedCodesFormatter(null,
                null, null, null, dc);
    };

    this.monitorMaxRetries = function (v, dc) {
        return lbCfgFormatters.monitorMaxRetriesFormatter(null,
                                        null, null, null, dc);
    };

    this.monitorDelay = function (v, dc){
        return lbCfgFormatters.monitorDelayFormatter(null,
                null, null, null, dc);
    };

    this.monitorTimeout = function (v, dc) {
        return lbCfgFormatters.monitorTimeoutFormatter(null,
                                        null, null, null, dc);
    };

    this.monitorAdminState = function (v, dc){
        return lbCfgFormatters.monitorAdminStateFormatter(null,
                null, null, null, dc);
    };

    this.listenerDescription = function(v, dc){
        return lbCfgFormatters.listenerDescriptionFormatter(null,
                null, null, null, dc);
    };

    return monitorGridView;
});
