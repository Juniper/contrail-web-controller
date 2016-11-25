/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/alarm/common/ui/js/models/AlarmModel',
    'config/alarm/common/ui/js/views/ConfigAlarmEditView',
    'config/alarm/common/ui/js/ConfigAlarmFormatters'
], function(_, ContrailView, AlarmModel,
    AlarmEditView, AlarmFormatters) {
    var self, gridElId = '#' + ctwc.ALARM_GRID_ID, gridObj,
        alarmEditView = new AlarmEditView(),
        alarmFormatters = new AlarmFormatters();
    var configAlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                getAlarmGridViewConfig(viewConfig));
        }
    });

    function getAlarmGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_ALARM_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.ALARM_GRID_ID,
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
                    text: ctwl.TITLE_ALARM_RULE
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteAlarm').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteAlarm').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(getAlarmDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Alarms ...'
                    },
                    empty: {
                        text: 'No Alarms found'
                    }
                }
            },
            columnHeader: {
                columns: [
                   {
                        field: "name",
                        name: "Name",
                        sortable: true,
                        maxWidth: 230,
                    },{
                        field: "alarm_severity",
                        name: "Severity",
                        sortable: true,
                        maxWidth: 100,
                        formatter: alarmFormatters.severityFormatter
                    },{
                        field: "uve_keys",
                        name: "UVE Keys",
                        sortable: true,
                        maxWidth: 170,
                        formatter: alarmFormatters.uveKeysFormatter
                    },{
                        field: "alarm_rules",
                        name: "Rule",
                        sortable: true,
                        formatter: alarmFormatters.rulesFormatter
                    }
                ]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    alarmModel = new AlarmModel(dataItem),
                    title = ctwl.TITLE_EDIT_ALARM_RULE;
                alarmModel.editView = alarmEditView;
                alarmEditView.model = alarmModel;
                alarmEditView.renderAddEditRule({
                    title: ctwl.EDIT,
                    selectedGridData: [dataItem],
                    callback: function () {
                        gridObj._dataView.refreshData();
                    },
                    mode : ctwl.EDIT_ACTION,
                    rowIndex: rowIndex,
                    isProject: viewConfig.isProject,
                    isGlobal: viewConfig.isGlobal
                 });
            }, 'Edit'),
            ctwgc.getDeleteAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    alarmModel = new AlarmModel(dataItem);
                alarmEditView.model = alarmModel;
                alarmEditView.renderDeleteRule({
                    title: ctwl.TITLE_ALARM_RULE_DELETE,
                    selectedGridData: [dataItem],
                    callback: function() {
                        var dataView = gridObj._dataView;
                        dataView.refreshData();
                    }
                });
            })
        ];
        return rowActionConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_ALARM_RULE_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteAlarm',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        dataItems = gridObj.getCheckedRows();
                    if(dataItems.length > 0) {
                        var alarmModel = new AlarmModel(dataItems);
                        alarmEditView.model = alarmModel;
                        alarmEditView.renderDeleteRule({
                              "title": ctwl.TITLE_ALARM_RULE_MULTI_DELETE,
                              selectedGridData: dataItems,
                              callback: function() {
                                  var dataView = gridObj._dataView;
                                  dataView.refreshData();
                        }});
                    }
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_CREATE_ALARM_RULE,
                "iconClass" : "fa fa-plus",
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        alarmModel = new AlarmModel();
                    alarmModel.editView = alarmEditView;
                    alarmEditView.model = alarmModel;
                    alarmEditView.renderAddEditRule(
                        {"title": ctwl.CREATE,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION,
                            isProject: viewConfig.isProject,
                            isGlobal: viewConfig.isGlobal
                        }
                    );
                }
            }];

        return headerActionConfig;
    };

    function getAlarmDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'row col-xs-12',
                            rows: [{
                                title: 'Details',
                                templateGenerator:
                                    'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "name",
                                    templateGenerator: "TextGenerator",
                                    label: "Name",
                                },{
                                    key: "id_perms.created",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGenerator: "TextGenerator",
                                    label: "Enabled",
                                    templateGeneratorConfig: {
                                        formatter: 'enable'
                                    }
                                },{
                                    key: "id_perms.description",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGenerator: "TextGenerator",
                                    label: "Description",
                                    templateGeneratorConfig: {
                                        formatter: 'description'
                                    }
                                },{
                                    key: "alarm_severity",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGenerator: "TextGenerator",
                                    label: "Severity",
                                    templateGeneratorConfig: {
                                        formatter: 'severityFormatter'
                                    }
                                },{
                                    key: "uve_keys",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGenerator: "TextGenerator",
                                    label: "UVE Keys",
                                    templateGeneratorConfig: {
                                        formatter: "uveKeysFormatter"
                                    }
                                },{
                                    key: "alarm_rules",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGenerator: "TextGenerator",
                                    label: "Rules",
                                    templateGeneratorConfig: {
                                        formatter: "rulesFormatter"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                        }]
                    }
                }]
            }
        }
    }
    return configAlarmGridView;
});

