/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter',
    'config/firewall/common/fwpolicy/ui/js/views/fwRuleEditView',
    'config/firewall/common/fwpolicy/ui/js/models/fwRuleModel'
], function(_, ContrailView, FWRuleFormatter, FWRuleEditView, FWRuleModel) {
    var self, gridElId = '#' + ctwc.FW_RULE_GRID_ID, gridObj, isGlobal,
      fwRuleFormatter = new FWRuleFormatter();
    var fwRuleEditView = new FWRuleEditView();
    var fwRuleGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            isGlobal = viewConfig.isGlobal;
            var draftMode ="";
                if(viewConfig.viewMode == ctwc.FW_DRAFTED){
                    draftMode = " - Drafts";
                }
                viewConfig.draftTitle = draftMode;
            self.renderView4Config(self.$el, self.model,
                getFWRuleGridViewConfig(viewConfig));
        }
    });


    function getFWRuleGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_FW_RULE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FW_RULE_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getConfiguration (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FW_RULE  + viewConfig.draftTitle
                },
               advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteFWRule').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteFWRule').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                                    getFWRuleExpDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Firewall Rules..'
                    },
                    empty: {
                        text: 'No Firewall Rule Found.'
                    }
                }
            },
            columnHeader: { columns: getfwRuleColumns(viewConfig)}
        };
        return gridElementConfig;
    };

    function getPrevNextCurrentRows(mode, rowIndex) {
        var prev, current, next, prevRowData, currentRowData, nextRowData;
        var ruleData = $('#' + ctwc.FW_RULE_GRID_ID).
             data("contrailGrid")._dataView.getItem(rowIndex);
        if(mode === ctwc.INSERT_ABOVE) {
            if(rowIndex === 0) {
                prev = null;
            } else {
               prevRowData = $('#' + ctwc.FW_RULE_GRID_ID).
               data("contrailGrid")._dataView.getItem(rowIndex - 1);
               prev = getValueByJsonPath(prevRowData,
                       'firewall_policy_back_refs;0;attr;sequence', '0');
            }
        } else if(mode === ctwc.INSERT_BELOW) {
            var topIndex = $('#' + ctwc.FW_RULE_GRID_ID).
            data("contrailGrid")._dataView.getItems();
            if(rowIndex === (topIndex - 1)) {
                next = null;
            } else {
               nextRowData = $('#' + ctwc.FW_RULE_GRID_ID).
                   data("contrailGrid")._dataView.getItem(rowIndex + 1);
               next = getValueByJsonPath(nextRowData,
                       'firewall_policy_back_refs;0;attr;sequence', '1.1');
            }
        }
        currentRowData = $('#' + ctwc.FW_RULE_GRID_ID).
             data("contrailGrid")._dataView.getItem(rowIndex);
        current = getValueByJsonPath(currentRowData,
             'firewall_policy_back_refs;0;attr;sequence', '0');

        return { prev: prev, current: current, next: next };

    }
    function getRowActionConfig (viewConfig) {
        var rowActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_FW_INSERT_RULE_ABOVE,
                "iconClass" : "hide",
                "onClick" : function(rowIndex) {
                    var sequenceData = getPrevNextCurrentRows(ctwc.INSERT_ABOVE, rowIndex);
                    fwRuleEditView.model = new FWRuleModel();
                    fwRuleEditView.renderAddEditFwRule(
                        {"title": ctwl.TITLE_FW_INSERT_RULE_ABOVE,
                            callback: function () {
                                $('#' + ctwc.FW_RULE_GRID_ID).
                                    data("contrailGrid")._dataView.refreshData();
                            },
                            mode : ctwc.INSERT_ABOVE,
                            sequenceData: sequenceData,
                            isGlobal: viewConfig.isGlobal
                        }
                    );
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_FW_INSERT_RULE_BELOW,
                "iconClass" : "hide",
                "onClick" : function(rowIndex) {
                    var sequenceData = getPrevNextCurrentRows(ctwc.INSERT_BELOW, rowIndex);
                    fwRuleEditView.model = new FWRuleModel();
                    fwRuleEditView.renderAddEditFwRule(
                        {"title": ctwl.TITLE_FW_INSERT_RULE_ABOVE,
                            callback: function () {
                                $('#' + ctwc.FW_RULE_GRID_ID).
                                    data("contrailGrid")._dataView.refreshData();
                            },
                            mode : ctwc.INSERT_BELOW,
                            sequenceData: sequenceData,
                            isGlobal: viewConfig.isGlobal
                        }
                    );
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_FW_INSERT_RULE_AT_TOP,
                "iconClass" : "hide",
                "onClick" : function(rowIndex) {
                    var ruleData = $('#' + ctwc.FW_RULE_GRID_ID).
                                        data("contrailGrid")._dataView.getItem(rowIndex);
                    fwRuleEditView.model = new FWRuleModel();
                    fwRuleEditView.renderAddEditFwRule(
                        {"title": ctwl.TITLE_FW_INSERT_RULE_ABOVE,
                            callback: function () {
                                $('#' + ctwc.FW_RULE_GRID_ID).
                                    data("contrailGrid")._dataView.refreshData();
                            },
                            mode : ctwc.INSERT_AT_TOP,
                            ruleData: ruleData,
                            isGlobal: viewConfig.isGlobal
                        }
                    );
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_FW_INSERT_RULE_AT_END,
                "iconClass" : "hide",
                "onClick" : function(rowIndex) {
                    var ruleData = $('#' + ctwc.FW_RULE_GRID_ID).
                                        data("contrailGrid")._dataView.getItem(rowIndex);
                    fwRuleEditView.model = new FWRuleModel();
                    fwRuleEditView.renderAddEditFwRule(
                        {"title": ctwl.TITLE_FW_INSERT_RULE_AT_END,
                            callback: function () {
                                $('#' + ctwc.FW_RULE_GRID_ID).
                                    data("contrailGrid")._dataView.refreshData();
                            },
                            mode : ctwc.INSERT_AT_END,
                            ruleData: ruleData,
                            isGlobal: viewConfig.isGlobal
                        }
                    );
                }
            },
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                var dataView = $('#' + ctwc.FW_RULE_GRID_ID).data("contrailGrid")._dataView;
                var rowData = dataView.getItem(rowIndex);
                rowData.isGlobal = viewConfig.isGlobal;
                fwRuleEditView.model = new FWRuleModel(rowData);
                fwRuleEditView.renderAddEditFwRule({
                                      "title": 'Edit Firewall Rule',
                                      'mode':'edit',
                                      'isGlobal': viewConfig.isGlobal,
                                       callback: function () {
                                          dataView.refreshData();
                }});
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
               var dataItem = $('#' + ctwc.FW_RULE_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
               fwRuleEditView.model = new FWRuleModel(dataItem);
               fwRuleEditView.renderDeleteFirewallRule({
                                      "title": ctwl.TITLE_FW_RULE_DELETE,
                                      selectedGridData: [dataItem],
                                      callback: function () {
                                          var dataView = $('#' + ctwc.FW_RULE_GRID_ID).data("contrailGrid")._dataView;
                                          dataView.refreshData();
                }});
            })
        ];
        return rowActionConfig;
    };
    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_FW_RULE_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteFWRule',
                "onClick" : function() {
                    var fwRuleModel = new FWRuleModel();
                    var checkedRows = $('#' + ctwc.FW_RULE_GRID_ID).data("contrailGrid").getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        fwRuleEditView.model = fwRuleModel;
                        fwRuleEditView.renderDeleteFirewallRule(
                            {"title": ctwl.TITLE_FW_RULE_MULTI_DELETE,
                                selectedGridData: checkedRows,
                                callback: function () {
                                    var dataView =
                                        $('#' + ctwc.FW_RULE_GRID_ID).
                                        data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                }
                            }
                        );
                    }
                }

            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_FW_RULE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    fwRuleEditView.model = new FWRuleModel();
                    fwRuleEditView.renderAddEditFwRule({
                                              "title": ctwl.TITLE_CREATE_FW_RULE,
                                              'mode': 'add',
                                              'isGlobal': viewConfig.isGlobal,
                                              callback: function () {
                       $('#' + ctwc.FW_RULE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }
    function getfwRuleColumns(viewConfig){
        var fwRuleColumns = [/*{
            id: 'sequence',
            field: 'sequence',
            width: 50,
            name: 'Order',
            formatter: fwRuleFormatter.sequenceFormatter
        }, {
            id: 'enabled',
            field: 'enabled',
            width: 70,
            name: 'Status',
            formatter: fwRuleFormatter.enabledFormatter
        },*/ {
           id: 'action_list.simple_action',
           field: 'action_list.simple_action',
           width: 70,
           name: 'Action',
           sortable: false,
           formatter: fwRuleFormatter.actionFormatter
        }, {
            id: 'service',
            field: 'service',
            width: 140,
            name: 'Services',
            sortable: false,
            formatter: fwRuleFormatter.serviceFormatter.bind(viewConfig)
        }, {
            id: 'endpoint_1',
            field: 'endpoint_1',
            width: 240,
            name: 'End Point 1',
            sortable: false,
            formatter: fwRuleFormatter.endPoint1Formatter
        }, {
            id: 'direction',
            field: 'direction',
            width: 60,
            name: 'Dir',
            sortable: false,
            formatter: fwRuleFormatter.dirFormatter
        }, {
            id: 'endpoint_2',
            field: 'endpoint_2',
            width: 240,
            name: 'End Point 2',
            sortable: false,
            formatter: fwRuleFormatter.endPoint2Formatter
        }, {
            id: 'match_tags',
            field: 'match_tags',
            width: 100,
            name: 'Match Tags',
            sortable: false,
            formatter: fwRuleFormatter.matchFormatter
        }/*, {
            id: 'action_list.apply_service',
            field: 'action_list.apply_service',
            width: 90,
            name: 'Simple Actions',
            formatter: fwRuleFormatter.simpleActionFormatter
        }*/];
        return fwRuleColumns;
    }

    function getFWRuleExpDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                keyClass:'col-xs-3',
                                valueClass:'col-xs-9',
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [/*{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Rule Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Rule Display Name'
                                },*/{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Order",
                                    templateGeneratorConfig: {
                                        formatter: "sequenceFormatter"
                                    }
                                }/*,{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Status",
                                    templateGeneratorConfig: {
                                        formatter: "enabledFormatter"
                                    }
                                }*/,{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "action_list.simple_action",
                                    templateGenerator: "TextGenerator",
                                    label: "Action",
                                    templateGeneratorConfig: {
                                        formatter: "actionFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Services",
                                    templateGeneratorConfig: {
                                        formatter: "serviceFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "endpoint_1",
                                    templateGenerator: "TextGenerator",
                                    label: "End Point 1",
                                    templateGeneratorConfig: {
                                        formatter: "endPoint1Formatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "direction",
                                    templateGenerator: "TextGenerator",
                                    label: "Dir"
                                },{
                                    key: "endpoint_2",
                                    templateGenerator: "TextGenerator",
                                    label: "End Point 2",
                                    templateGeneratorConfig: {
                                        formatter: "endPoint2Formatter"
                                    }
                                },{
                                    key: "match_tags",
                                    templateGenerator: "TextGenerator",
                                    label: "Match Tags",
                                    templateGeneratorConfig: {
                                        formatter: "matchFormatter"
                                    }
                                },
                                {
                                    label: 'Associated Security Logging Objects',
                                    key: 'security_logging_object_refs',
                                    templateGenerator:
                                        'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter:
                                            'SloFormatter'
                                    }
                                }/*,{
                                    key: "action_list.apply_service",
                                    templateGenerator: "TextGenerator",
                                    label: "Simple Actions",
                                    templateGeneratorConfig: {
                                        formatter: "simpleActionFormatter"
                                    }
                                }*/]
                           }]
                      }]
                    }
                }]
            }
        };
    };

    this.actionFormatter = function(v, dc) {
        return fwRuleFormatter.actionFormatter("", "", v, "", dc);
    };

    this.sequenceFormatter = function(v, dc) {
        return fwRuleFormatter.sequenceFormatter("", "", v, "", dc);
    };

    this.enabledFormatter = function(v, dc) {
        return fwRuleFormatter.enabledFormatter("", "", v, "", dc);
    };

    this.serviceFormatter = function(v, dc) {
        return fwRuleFormatter.serviceFormatter("", "", v, "", dc, isGlobal);
    };

    this.dirFormatter = function(v, dc) {
        return fwRuleFormatter.dirFormatter("", "", v, "", dc);
    };

    this.endPoint1Formatter = function(v, dc) {
        return fwRuleFormatter.endPoint1Formatter("", "", v, "", dc);
    };

    this.endPoint2Formatter = function(v, dc) {
        return fwRuleFormatter.endPoint2Formatter("", "", v, "", dc);
    };

    this.matchFormatter = function(v, dc) {
        return fwRuleFormatter.matchFormatter("", "", v, "", dc);
    };

    this.simpleActionFormatter = function(v, dc) {
        return fwRuleFormatter.simpleActionFormatter("", "", v, "", dc);
    };

    this.SloFormatter = function (v, dc) {
        return ctwu.securityLoggingObjectFormatter(dc, 'details');
    };

    return fwRuleGridView;
});

