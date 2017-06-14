/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter',
    'config/firewall/common/fwpolicy/ui/js/models/fwPolicyModel',
    'config/firewall/common/fwpolicy/ui/js/views/fwPolicyEditView'
], function(_, ContrailView, FWPolicyFormatter, FWPolicyModel, FWPolicyEditView) {
    var self, gridElId = '#' + ctwc.FW_POLICY_GRID_ID, gridObj,
      fwPolicyFormatter = new FWPolicyFormatter(),
      fwPolicyEditView =  new FWPolicyEditView();
    var fwPolicyGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getFWPolicyGridViewConfig(viewConfig));
        }
    });


    function getFWPolicyGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_FW_POLICY_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FW_POLICY_GRID_ID,
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

    function getRowActionConfig() {
        var rowActionConfig = [
          ctwgc.getDeleteAction(function (rowIndex) {
              var dataItem = $(gridElId).data("contrailGrid").
                  _dataView.getItem(rowIndex),
                  fwPolicyModel = new FWPolicyModel(dataItem),
                  checkedRow = [dataItem];

              fwPolicyEditView.model = fwPolicyModel;
              fwPolicyEditView.renderDeleteFWPolicies(
                  {"title": ctwl.TITLE_FW_POLICY_DELETE,
                      checkedRows: checkedRow,
                      callback: function () {
                          var dataView =
                              $(gridElId).data("contrailGrid")._dataView;
                          dataView.refreshData();
                      }
                  }
              );
        })];
        return rowActionConfig;
    };

    function getConfiguration (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_FW_POLICY
                },
               advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteFWPolicy').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteFWPolicy').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                                    getFWPolicyExpDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Firewall Policies..'
                    },
                    empty: {
                        text: 'No Firewall Policy Found.'
                    }
                }
            },
            columnHeader: { columns: getfwPolicyColumns(viewConfig)}
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig;
            var headerActionConfig = [
                {
                    "type" : "link",
                    "title" : ctwl.TITLE_FW_POLICY_MULTI_DELETE,
                    "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteFWPolicy',
                    "onClick" : function() {
                        var fwPolicyModel = new FWPolicyModel();
                        var checkedRows =
                            $(gridElId).data("contrailGrid").
                            getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
                            fwPolicyEditView.model = fwPolicyModel;
                            fwPolicyEditView.renderDeleteFWPolicies(
                                {"title": ctwl.TITLE_FW_POLICY_MULTI_DELETE,
                                    checkedRows: checkedRows,
                                    callback: function () {
                                        var dataView =
                                            $(gridElId).
                                            data("contrailGrid")._dataView;
                                        dataView.refreshData();
                                    }
                                }
                            );
                        }
                    }
                },
                {
                    "type" : "link",
                    "title" : ctwl.TITLE_CREATE_FW_POLICY,
                    "iconClass" : "fa fa-plus",
                    "onClick" : function() {
                        var fwPolicyModel = new FWPolicyModel();
                        fwPolicyEditView.model = fwPolicyModel;
                        fwPolicyEditView.renderAddEditFWPolicy(
                            {"title": ctwl.CREATE,
                                callback: function () {
                                    var dataView =
                                        $(gridElId).
                                        data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                },
                                mode : ctwl.CREATE_ACTION,
                                isGlobal: viewConfig.isGlobal
                            }
                        );
                    }
                }
            ];

        return headerActionConfig;
    };
    function getfwPolicyColumns(viewConfig){
    	var fwPolicyColumns = [{
            id: 'name',
            field: 'name',
            name: 'Name',
            cssClass :'cell-hyperlink-blue',
            events : {
                onClick : function(e, dc) {
                    var isGlobal = viewConfig.isGlobal;
                    var viewTab = isGlobal ? 'config_security_globalrules': 'config_security_projectrules';
                    var hashP = isGlobal ?  'config_security_globalpolicies' : 'config_security_projectscopedpolicies';
                    var hashParams = null,
                        hashObj = {
                            view: viewTab,
                            focusedElement: {
                                policy: dc.name,
                                uuid: dc.uuid,
                                tab: viewTab,
                                isGlobal: viewConfig.isGlobal
                            }
                        };
                    if (contrail.checkIfKeyExistInObject(true,
                            hashParams,
                            'clickedElement')) {
                        hashObj.clickedElement =
                            hashParams.clickedElement;
                    }

                    layoutHandler.setURLHashParams(hashObj, {
                        p: hashP,
                        merge: false,
                        triggerHashChange: true
                    });
                }
            }
         }, {
             id: 'id_perms.description',
             field: 'id_perms.description',
             name: 'Description',
             minWidth : 150,
             formatter: fwPolicyFormatter.policyDescriptionFormatter
          }, {
              id: 'application_policy_set_back_refs',
              field: 'application_policy_set_back_refs',
              name: 'Member of',
              minWidth : 150,
              formatter: fwPolicyFormatter.policySetFormatter
           }, {
             id: 'firewall_rule_refs',
             field: 'firewall_rule_refs',
             name: 'Rules',
             minWidth : 80,
             formatter:
                 fwPolicyFormatter.fwRuleFormatter
         }, {
             id: 'id_perms.last_modified',
             field: 'id_perms.last_modified',
             name: 'Last Updated',
             formatter: fwPolicyFormatter.lastUpdateFormatter
         }];
    	return fwPolicyColumns;
    };
    function getFWPolicyExpDetailsTemplateConfig() {
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
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Display Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "id_perms.description",
                                    templateGenerator: "TextGenerator",
                                    label: "Description",
                                    templateGeneratorConfig: {
                                        formatter: "policyDescriptionFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Member of",
                                    templateGeneratorConfig: {
                                        formatter: "policySetFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Number of Rules",
                                    templateGeneratorConfig: {
                                        formatter: "fwRuleFormatter"
                                    }
                                },{
                                    key: "id_perms.last_modified",
                                    templateGenerator: "TextGenerator",
                                    label: "Last Updated",
                                    templateGeneratorConfig: {
                                        formatter: "lastUpdateExpFormatter"
                                    }
                                }]
                           }]
                      }]
                    }
                }]
            }
        };
    };

    this.fwRuleFormatter = function(v, dc) {
        return fwPolicyFormatter.fwRuleFormatter("", "", v, "", dc);
    };

    this.policySetFormatter = function(v, dc) {
        return fwPolicyFormatter.policySetFormatter("", "", v, "", dc);
    };

    this.policyDescriptionFormatter = function(v, dc) {
        return fwPolicyFormatter.policyDescriptionFormatter("", "", v, "", dc);
    };

    this.lastUpdateFormatter = function(v, dc) {
        return fwPolicyFormatter.lastUpdateFormatter("", "", v, "", dc);
    };

    this.lastUpdateExpFormatter = function(v, dc) {
        return fwPolicyFormatter.lastUpdateExpFormatter("", "", v, "", dc);
    };

    return fwPolicyGridView;
});

