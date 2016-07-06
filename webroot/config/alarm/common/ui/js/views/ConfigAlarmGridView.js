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
                    text: ctwl.TITLE_ALARM
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
                        maxWidth: 130,
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
                    title = ctwl.TITLE_EDIT_ALARM;
                alarmEditView.model = alarmModel;
                alarmEditView.renderAddEditRule({
                    title: title,
                    selectedGridData: [dataItem],
                    callback: function () {
                        gridObj._dataView.refreshData();
                    },
                    mode : ctwl.EDIT_ACTION,
                    rowIndex: rowIndex,
                    isProject: viewConfig.isProject,
                    isGlobal: viewConfig.isGlobal
                 });
            }, "Edit"),
            ctwgc.getDeleteAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    alarmModel = new AlarmModel(dataItem);
                alarmEditView.model = alarmModel;
                alarmEditView.renderDeleteRule({
                    title: ctwl.TITLE_ALARM_MULTI_DELETE,
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
                "title" : ctwl.TITLE_ALARM_MULTI_DELETE,
                "iconClass": 'icon-trash',
                "linkElementId": 'btnDeleteAlarm',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        dataItems = gridObj.getCheckedRows();
                    if(dataItems.length > 0) {
                        var alarmModel = new AlarmModel(dataItems);
                        alarmEditView.model = alarmModel;
                        alarmEditView.renderDeleteRule({
                              "title": ctwl.TITLE_ALARM_MULTI_DELETE,
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
                "title" : ctwl.TITLE_CREATE_ALARM,
                "iconClass" : "icon-plus",
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        alarmModel = new AlarmModel();
                    alarmEditView.model = alarmModel;
                    alarmEditView.renderAddEditRule(
                        {"title": ctwl.TITLE_CREATE_ALARM,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION,
                            gridData: gridData,
                            rowIndex: -1,
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
                            class: 'row-fluid',
                            rows: [{
                                title: 'Details',
                                templateGenerator:
                                    'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    key: "name",
                                    templateGenerator: "TextGenerator",
                                    label: "Name",
                                },{
                                    key: "id_perms.created",
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    templateGenerator: "TextGenerator",
                                    label: "Enabled",
                                    templateGeneratorConfig: {
                                        formatter: 'enable'
                                    }
                                },{
                                    key: "id_perms.description",
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    templateGenerator: "TextGenerator",
                                    label: "Description",
                                    templateGeneratorConfig: {
                                        formatter: 'description'
                                    }
                                },{
                                    key: "alarm_severity",
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    templateGenerator: "TextGenerator",
                                    label: "Severity",
                                    templateGeneratorConfig: {
                                        formatter: 'severityFormatter'
                                    }
                                },{
                                    key: "uve_keys",
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    templateGenerator: "TextGenerator",
                                    label: "UVE Keys",
                                    templateGeneratorConfig: {
                                        formatter: "uveKeysFormatter"
                                    }
                                },{
                                    key: "alarm_rules",
                                    valueClass:'span10',
                                    keyClass: 'span2',
                                    templateGenerator: "TextGenerator",
                                    label: "Rules",
                                    templateGeneratorConfig: {
                                        formatter: "rulesFormatter"
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        }
    }
    return configAlarmGridView;
});

