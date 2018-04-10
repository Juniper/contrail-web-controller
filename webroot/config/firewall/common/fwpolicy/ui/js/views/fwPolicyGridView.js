/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter',
    'config/firewall/common/fwpolicy/ui/js/models/fwPolicyModel',
    'config/firewall/common/fwpolicy/ui/js/views/fwPolicyEditView',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel'
], function(_, ContrailView, FWPolicyFormatter, FWPolicyModel, FWPolicyEditView, FWZUtils,
        FwPolicyWizardEditView, FWPolicyWizardModel) {
    var self, gridElId = '#' + ctwc.FW_POLICY_GRID_ID, gridObj,
      fwPolicyFormatter = new FWPolicyFormatter(),
      fwPolicyEditView =  new FWPolicyEditView(),
      fwPolicyWizardEditView = new FwPolicyWizardEditView(),
      fwzUtils = new FWZUtils();
    var fwPolicyGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            var draftMode ="";
                if(viewConfig.viewMode == ctwc.FW_DRAFTED){
                    draftMode = " - Drafts";
                }
                viewConfig.draftTitle = draftMode;
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

    function getRowActionConfig(viewConfig) {
        if(cowu.isAdmin() === false && viewConfig['is_global'] === true){
            return false;
        }
        else{
            var rowActionConfig = [];
            rowActionConfig.push(ctwgc.getEditConfig("Edit", function (rowIndex) {
                    var dataItem = $(gridElId).data("contrailGrid").
                        _dataView.getItem(rowIndex);
                    newApplicationSet = {};
                    fwPolicyWizardEditView.model = new FWPolicyWizardModel(dataItem);
                    fwPolicyWizardEditView.renderFwWizard({
                                    "title": 'Edit Firewall Policy',
                                    'viewConfig': $.extend(viewConfig.viewConfig, { mode: 'edit', isGlobal: viewConfig.isGlobal , 
                                     seletedRows : [], isWizard: true, wizardMode: 'policy', model: dataItem}),
                                     callback: function () {
                                           $(gridElId).data("contrailGrid")._dataView.refreshData();
                                     }
                    });
                }));
            rowActionConfig.push(ctwgc.getDeleteAction(function (rowIndex) {
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
                }));
            if(viewConfig.isWizard){
               var options = [];
               options.push(rowActionConfig[1]);
               return options;
            }else{
                return rowActionConfig;
            }
        }
    };

    function getConfiguration (viewConfig) {
        var title;
        if(viewConfig.isWizard == true){
            title = '';
        }
        else{
            title = ctwl.TITLE_FW_POLICY  + viewConfig.draftTitle;
        }
        var gridElementConfig = {
            header: {
                title: {
                    text: title
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
            if(cowu.isAdmin() === false && viewConfig.isGlobal === true){
                return false;
            }
            else{
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
                            newApplicationSet = {};
                            fwPolicyWizardEditView.model = new FWPolicyWizardModel();
                            fwPolicyWizardEditView.renderFwWizard({
                                            "title": 'Create Firewall Policy',
                                            'viewConfig': $.extend(viewConfig.viewConfig, { mode: 'add', isGlobal: viewConfig.isGlobal , 
                                             seletedRows : [], isWizard: true, wizardMode: 'policy'}),
                                             callback: function () {
                                                   $(gridElId).data("contrailGrid")._dataView.refreshData();
                                             }
                            });
                        }
                    }
                ];
                    return headerActionConfig;
            }
    };

    function onPolicyClick (e, dc) {
        var isGlobal = this.viewConfig.isGlobal;
        var viewTab = isGlobal ?
                'config_security_globalrules': 'config_security_projectrules';
        var hashP = isGlobal ?
                'config_security_globalpolicies' : 'config_security_projectscopedpolicies';
        var hashParams = null,
            hashObj = {
                view: viewTab,
                focusedElement: {
                    policy: dc.name,
                    uuid: dc.uuid,
                    tab: viewTab,
                    isGlobal: isGlobal
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

    function getfwPolicyColumns(viewConfig){
        var fwPolicyColumns = [{
            id: 'name',
            field: 'name',
            name: 'Name',
            cssClass: viewConfig.isWizard ? '' : 'cell-hyperlink-blue',
            events : {
                onClick : onPolicyClick.bind({viewConfig:viewConfig})
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
              name: 'Member of Application Policy Sets',
              minWidth : 150,
              formatter: fwPolicyFormatter.policySetFormatter
           }, {
             id: 'firewall_rule_refs',
             field: 'firewall_rule_refs',
             name: 'Rules',
             cssClass: viewConfig.isWizard ? '' : 'cell-hyperlink-blue',
             events : {
                 onClick : onPolicyClick.bind({viewConfig:viewConfig})
             },
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
                                    label: 'Associated Security Logging Objects',
                                    key: 'security_logging_object_refs',
                                    templateGenerator:
                                        'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter:
                                            'SloFormatter'
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
                                }].concat(ctwu.getTagsExpandDetails())
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

    this.SloFormatter = function (v, dc) {
        return ctwu.securityLoggingObjectFormatter(dc, 'details');
    };

    return fwPolicyGridView;
});
