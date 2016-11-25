/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/networking/policy/ui/js/models/policyModel',
    'config/networking/policy/ui/js/views/policyEditView',
    'contrail-view',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, Backbone, PolicyModel, PolicyCreateEditView,
             ContrailView, PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var policyCreateEditView = new PolicyCreateEditView(),
        gridElId = "#" + ctwl.POLICIES_GRID_ID;

    var PoliciesGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            policyCreateEditView.selectedProjId = viewConfig.selectedProjId;
            self.renderView4Config(self.$el, self.model,
                                  getPoliciesGridViewConfig(pagerOptions));
        }
    });
    var getPoliciesGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId
                            ([ctwl.CONFIG_POLICIES_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.POLICIES_GRID_ID,
                                title: ctwl.CONFIG_POLICIES_TITLE,
                                view: "GridView",
                                viewConfig: {
                                   elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var policyModel = new PolicyModel(dataItem);
            policyCreateEditView.model = policyModel;
            policyCreateEditView.renderPolicyPopup({
                                  //permissions
                                  "title": ctwl.EDIT,
                                  mode: "edit",
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var rowNum = this.rowIdentifier;
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var policyModel = new PolicyModel(dataItem);
            policyCreateEditView.model = policyModel;
            policyCreateEditView.renderDeletePolicy({
                                  "title": ctwl.TITLE_REMOVE,
                                  selectedGridData: [dataItem],
                                  callback: function() {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];
    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CONFIG_POLICIES_TITLE
                },
                advanceControls : getHeaderActionConfig(
                                     ctwl.POLICIES_GRID_ID)
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeletePolicy').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeletePolicy').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getPoliceyDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Policies.',
                    },
                    empty: {
                        text: 'No Policies Found.'
                    }
                }
            },
            columnHeader: {
                columns: policyColumns
            },
            footer: {
                pager: contrail.handleIfNull
                                    (pagerOptions,
                                        { options:
                                          { pageSize: 5,
                                            pageSizeSelect: [5, 10, 50, 100]
                                          }
                                        }
                                    )
            }
        };
        return gridElementConfig;
    };
    this.policyColumns = [
    {
        id:"fq_name",
        field:"fq_name",
        label:"Display Name",
        name:"Policy",
        width: 200,
        sortable: {
           sortBy: 'formattedValue'
        },
        formatter: policyFormatters.PoliceyNameFormatter
    },
    {
        id: "virtual_network_back_refs",
        label:"Connected networks",
        field: "virtual_network_back_refs",
        name: "Associated Networks",
        sortable: {
           sortBy: 'formattedValue'
        },
        width: 150,
        formatter: policyFormatters.AssociatedNetworksFormatter
    },
    {
        id: "PolicyRules",
        label:"Rules",
        field: "network_policy_entries",
        name: "Rules",
        sortable: {
           sortBy: 'formattedValue'
        },
        width: 650,
        formatter: policyFormatters.PolicyRulesFormatter
    }];
    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_REMOVE,
                "iconClass": "fa fa-trash",
                "onClick": function () {
                    var dataItem =
                        $("#"+gridElId).data('contrailGrid').getCheckedRows();
                    if(dataItem.length > 0) {
                        var policyModel = new PolicyModel(dataItem);
                        policyCreateEditView.model = policyModel;
                        policyCreateEditView.renderDeletePolicy({
                                      "title": ctwl.TITLE_REMOVE,
                                      selectedGridData: dataItem,
                                      callback: function() {
                            var dataView =
                                $("#"+gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_POLICY,
                "iconClass": "fa fa-plus",
                "onClick": function () {

                    var policyModel = new PolicyModel();
                    policyCreateEditView.model = policyModel;
                    policyCreateEditView.renderPolicyPopup({
                                     //permissions
                                     "title": ctwl.CREATE,
                                     mode : "add",
                                     callback: function () {
                        var dataView =
                            $("#"+gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    };
    function getPoliceyDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'row-fluid',
                            rows: [{
                                title: ctwl.TITLE_POLICY_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass:'col-xs-3',
                                    key: 'fq_name',
                                    label:'Display Name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "PolicyNameFormatter",
                                        sortable: {
                                           sortBy: 'formattedValue'
                                        }
                                    }
                                }, {
                                    keyClass:'col-xs-3',
                                    key: 'uuid',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    keyClass:'col-xs-3',
                                    key: 'virtual_network_back_refs',
                                    label:'Connected networks',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "AssociatedNetworksFormatter",
                                        sortable: {
                                           sortBy: 'formattedValue'
                                        }
                                    }
                                }, {
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-11',
                                    label:'Rules',
                                    key: 'network_policy_entries',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "PolicyRulesExpandFormatter",
                                        sortable: {
                                           sortBy: 'formattedValue'
                                        }
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
    this.PolicyRulesExpandFormatter = function (v, dc) {
        return policyFormatters.PolicyRulesFormatter("", "", v, -1, dc);
    };
    this.AssociatedNetworksFormatter = function (v, dc) {
        return policyFormatters.AssociatedNetworksFormatter("", "", v, -1, dc);
    };
    this.PolicyNameFormatter = function(v, dc) {
        return policyFormatters.PoliceyNameFormatter("", "", v, "", dc);
    };
    return PoliciesGridView;
});
