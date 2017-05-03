/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/forwardingClassModel',
    'config/infra/globalconfig/ui/js/views/forwardingClassEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function(_, ContrailView, ForwardingClassModel,
    ForwardingClassEditView, GlobalConfigFormatters, GlobalConfigUtils) {
    var self, gridElId = '#' + ctwc.FORWARDING_CLASS_GRID_ID, gridObj,
        forwardingClassEditView = new ForwardingClassEditView(),
        globalConfigFormatters = new GlobalConfigFormatters();
    var forwardingClassGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                getForwardingClassGridViewConfig(viewConfig));
        }
    });

    function getForwardingClassGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_FORWARDING_CLASS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FORWARDING_CLASS_GRID_ID,
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
                    text: ctwl.TITLE_FORWARDING_CLASS
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteForwardingClass').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteForwardingClass').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getForwardingClassDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Forwarding Class Config..'
                    },
                    empty: {
                        text: 'No Forwarding Classes Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                    {
                         field: "forwarding_class_id",
                         name: "Forwarding Class",
                         formatter:
                             globalConfigFormatters.formatForwardingClassId,
                         sortable: false
                     },
                     {
                         field: "forwarding_class_dscp",
                         name: "DSCP bits",
                         sortable: false,
                         formatter:
                             globalConfigFormatters.formatForwardingClassDSCP
                     },
                     {
                         field: "forwarding_class_mpls_exp",
                         name: "MPLS EXP bits",
                         sortable: false,
                         formatter:
                             globalConfigFormatters.formatForwardingClassMPLS
                     },
                     {
                         field: "forwarding_class_vlan_priority",
                         name: "VLAN Priority bits",
                         sortable: false,
                         formatter:
                             globalConfigFormatters.formatForwardingClassVLAN
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
                    gridData = gridObj._dataView.getItems(),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    forwardingClassModel = new ForwardingClassModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_FORWARDING_CLASS;
                forwardingClassEditView.model = forwardingClassModel;
                forwardingClassEditView.renderAddEditForwardingClass(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
                        callback: function () {
                            gridObj._dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    }
                );
            }, "Edit"),

            ctwgc.getDeleteAction(function (rowIndex) {
              var gridObj = $(gridElId).data('contrailGrid'),
                  gridData = gridObj._dataView.getItems(),
                  dataItem = gridObj._dataView.getItem(rowIndex),
                  forwardingClassModel = new ForwardingClassModel(dataItem),
                  checkedRow = [dataItem];
              forwardingClassEditView.model = forwardingClassModel;
              forwardingClassEditView.renderDeleteForwardingClass(
                  {"title": ctwl.TITLE_DEL_FORWARDING_CLASS,
                      checkedRows: checkedRow,
                      callback: function () {
                          gridObj._dataView.refreshData();
                      },
                      rowIndexes: [rowIndex],
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_FORWARDING_CLASS_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteForwardingClass',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        rowIndexes = gridObj._grid.getSelectedRows();
                        forwardingClassModel = new ForwardingClassModel(),
                        checkedRows = gridObj.getCheckedRows();
                    if(checkedRows && checkedRows.length > 0) {
                        forwardingClassEditView.model = forwardingClassModel;
                        forwardingClassEditView.renderDeleteForwardingClass(
                            {
                                "title":
                                    ctwl.TITLE_FORWARDING_CLASS_MULTI_DELETE,
                                checkedRows: checkedRows,
                                callback: function () {
                                    gridObj._dataView.refreshData();
                                },
                                rowIndexes: rowIndexes
                            }
                        );
                    }
                }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_CREATE_FORWARDING_CLASS,
                "iconClass" : "fa fa-plus",
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        gridData = gridObj._dataView.getItems(),
                        forwardingClassModel = new ForwardingClassModel();
                    forwardingClassEditView.model = forwardingClassModel;
                    forwardingClassEditView.renderAddEditForwardingClass(
                        {"title": ctwl.CREATE,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            mode : ctwl.CREATE_ACTION
                        }
                    );
                }
            }];

        return headerActionConfig;
    };

    function getForwardingClassDetailsTemplateConfig(){
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: 'Details',
                                templateGenerator:
                                    'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Forwarding Class",
                                    templateGeneratorConfig: {
                                        formatter: "FormatForwardingClassId"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "DSCP bits",
                                    templateGeneratorConfig: {
                                        formatter: "FormatForwardingClassDSCP"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "MPLS EXP bits",
                                    templateGeneratorConfig: {
                                        formatter: "FormatForwardingClassMPLS"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "VLAN Priority bits",
                                    templateGeneratorConfig: {
                                        formatter: "FormatForwardingClassVLAN"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Associated QoS Queue",
                                    templateGeneratorConfig: {
                                        formatter: "FormatQoSQueueExp"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails()]
                        }]
                    }
                }]
            }
        };
    };

    this.FormatForwardingClassId = function(v, dc) {
        return globalConfigFormatters.
        formatForwardingClassId("", "", v, "", dc);
    };

    this.FormatForwardingClassDSCP = function(v, dc) {
        return globalConfigFormatters.
        formatForwardingClassDSCP("", "", v, "", dc);
    };

    this.FormatForwardingClassVLAN = function(v, dc) {
        return globalConfigFormatters.
        formatForwardingClassVLAN("", "", v, "", dc);
    };

    this.FormatForwardingClassMPLS = function(v, dc) {
        return globalConfigFormatters.
        formatForwardingClassMPLS("", "", v, "", dc);
    };

    this.FormatQoSQueueExp = function(v, dc) {
        return globalConfigFormatters.
        formatQoSQueueExp("", "", v, "", dc);
    };

    return forwardingClassGridView;
});

