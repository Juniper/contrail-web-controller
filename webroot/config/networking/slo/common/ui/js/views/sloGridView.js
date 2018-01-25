/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/slo/common/ui/js/models/sloModel',
    'config/networking/slo/common/ui/js/views/sloEditView',
    'config/networking/slo/common/ui/js/sloFormatters'
], function(_, ContrailView, SloModel, SloEditView, SloFormatters) {
    var self, gridElId = '#' + ctwc.SLO_GRID_ID, gridObj,
        sloEditView = new SloEditView(),
        sloFormatters = new SloFormatters();
    var sloGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig;
            if(viewConfig.isGlobal){
                viewConfig.policyUrl = ctwc.URL_NETWORK_POLICIES;
                viewConfig.secGrpUrl = ctwc.URL_GET_SECURITY_GROUP;
            }else{
                viewConfig.policyUrl = ctwc.get(ctwc.URL_POLICIES_IN_CHUNKS, 50, viewConfig.currentProject.value);
                viewConfig.secGrpUrl = ctwc.get(ctwc.URL_GET_SECURITY_GROUP_DETAILS, viewConfig.currentProject.value);
            }
            getPolicyAndSecGrp(viewConfig, self, function(viewConfig){
                self.renderView4Config(self.$el, self.model, getSloGridViewConfig(viewConfig));
            });
        }
    });
    function getPolicyAndSecGrp (viewConfig, self, callback) {
        var getAjaxs = [];
        getAjaxs[0] = $.ajax({
            url: viewConfig.policyUrl,
            type:"GET"
        });
        getAjaxs[1] = $.ajax({
            url: viewConfig.secGrpUrl,
            type:"GET"
        });
        $.when.apply($, getAjaxs).then(
            function () {
                var policymodel = [], secGrpModel = [];
                var results = arguments;
                var polResponse = getValueByJsonPath(results[0][0], 'data', []);
                var secGrpResponse = getValueByJsonPath(results[1][0], 'security-groups', []);
                $.each(polResponse, function (i, obj) {
                    var model = obj['network-policy'];
                    policymodel.push(model);
                });
                $.each(secGrpResponse, function (i, obj) {
                    var model = obj['security-group'];
                    secGrpModel.push(model);
                });
                viewConfig.policymodel = policymodel;
                viewConfig.secGrpModel = secGrpModel;
                callback(viewConfig);
            }
        )
    }
    function getSloGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_SLO_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SLO_GRID_ID,
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
                    text: ctwl.TITLE_SLO
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteSlo').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteSlo').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getSloDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Security Logging Object Config..'
                    },
                    empty: {
                        text: 'No Security Logging Object Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                     {
                        field: 'name',
                        name: 'Name',
                        sortable: true
                     },
                     {
                         field: "security_logging_object_rate",
                         name: "Rate",
                         sortable: true
                     },
                     {
                         field: "security_logging_object_rules",
                         name: "Rules",
                         sortable: true,
                         formatter:
                             sloFormatters.formatSloRules
                     }
                ]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig(viewConfig) {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
               var policymodel = [], secGrpModel = [];
                    var gridObj = $(gridElId).data('contrailGrid'),
                    dataItem = gridObj._dataView.getItem(rowIndex);
                    dataItem.policyModel = viewConfig.policymodel;
                    dataItem.secGrpModel = viewConfig.secGrpModel;
                    var sloModel = new SloModel(dataItem);
                    sloModel.sloEditView = sloEditView;
                    sloEditView.model = sloModel;
                    sloEditView.renderAddEditSol({
                        "title": ctwl.EDIT,
                        isGlobal : viewConfig.isGlobal,
                        policyUrl: viewConfig.policyUrl,
                        secGrpUrl: viewConfig.secGrpUrl,
                        policyModel: viewConfig.policymodel,
                        secGrpModel: viewConfig.secGrpModel,
                        callback: function () {
                            gridObj._dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    });
            }, "Edit"),

            ctwgc.getDeleteAction(function (rowIndex) {
              var gridObj = $(gridElId).data('contrailGrid'),
                  dataItem = gridObj._dataView.getItem(rowIndex),
                  sloModel = new SloModel(dataItem);
                  checkedRow = [dataItem];
                  sloEditView.model = sloModel;
                  sloEditView.renderDeleteSlo(
                  {"title": ctwl.TITLE_DELETE_SLO,
                      checkedRows: checkedRow,
                      callback: function () {
                          gridObj._dataView.refreshData();
                      }
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type" : "link",
                "title" : ctwl.TITLE_SLO_MULTI_DELETE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteSlo',
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        rowIndexes = gridObj._grid.getSelectedRows();
                        sloModel = new SloModel(),
                        checkedRows = gridObj.getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
                            sloEditView.model = sloModel;
                            sloEditView.renderDeleteSlo(
                                {"title": ctwl.TITLE_DELETE_SLO,
                                    checkedRows: checkedRows,
                                    callback: function () {
                                        gridObj._dataView.refreshData();
                                    }
                                }
                            );
                        }
                  }
            },
            {
                "type" : "link",
                "title" : ctwl.TITLE_CREATE_SLO,
                "iconClass" : "fa fa-plus",
                "onClick" : function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        sloModel = new SloModel();
                        sloModel.sloEditView = sloEditView;
                        sloEditView.model = sloModel;
                        sloEditView.renderAddEditSol(
                            {"title": ctwl.CREATE,
                                isGlobal : viewConfig.isGlobal,
                                policyUrl: viewConfig.policyUrl,
                                secGrpUrl: viewConfig.secGrpUrl,
                                policyModel: viewConfig.policymodel,
                                secGrpModel: viewConfig.secGrpModel,
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

    function getSloDetailsTemplateConfig(){
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                title: 'Details',
                                templateGenerator:
                                    'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: "name",
                                    templateGenerator: "TextGenerator",
                                    label: "Name",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9'
                                },{
                                    key: "display_name",
                                    templateGenerator: "TextGenerator",
                                    label: "Display Name",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9'
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9'
                                },{
                                    key: "security_logging_object_rate",
                                    templateGenerator: "TextGenerator",
                                    label: "Rate",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9'
                                },{
                                    label: 'Admin State',
                                    key: 'uuid',
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    templateGeneratorConfig: {
                                        formatter: 'adminStateFormatter'
                                    },
                                    templateGenerator: 'TextGenerator'
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    label: "Rules",
                                    templateGeneratorConfig: {
                                        formatter: "FormatSloRules"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    label: "Associated Firewall Policies",
                                    templateGeneratorConfig: {
                                        formatter: "FormatFirewallPolicy"
                                    }
                                },{
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    label: "Associated Firewall Rules",
                                    templateGeneratorConfig: {
                                        formatter: "FormatFirewallRule"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                        }]
                    }
                }]
            }
        };
    };

    this.FormatSloRules = function(v, dc) {
        return sloFormatters.formatSloRuleDetails("", "", v, "", dc);
    };

    this.FormatFirewallPolicy = function(v, dc){
        return sloFormatters.FormatFirewallPolicy("", "", v, "", dc);
    };

    this.FormatFirewallRule = function(v, dc){
        return sloFormatters.FormatFirewallRule("", "", v, "", dc);
    };

    this.adminStateFormatter = function (v, dc) {
        return sloFormatters.adminStateFormatter(null,
                                        null, null, null, dc);
    }

    return sloGridView;
});