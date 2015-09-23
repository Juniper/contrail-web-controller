/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
                                  "title": ctwl.TITLE_POLICY_EDIT +
                                  ' (' + dataItem.name + ')',
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
                                  "title": ctwl.TITLE_POLICY_DETAILS,
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
                dataSource: {}
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
        name:"Policy",
        width: 200,
        sortable: true,
        formatter: policyFormatters.PoliceyNameFormatter
    },
    {
        id: "virtual_network_back_refs",
        field: "virtual_network_back_refs",
        name: "Associated Networks",
        width: 150,
        formatter: policyFormatters.AssociatedNetworksFormatter
    },
    {
        id: "PolicyRules",
        field: "network_policy_entries",
        name: "Rules",
        width: 650,
        formatter: policyFormatters.PolicyRulesFormatter
    }];
    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_POLICY,
                "iconClass": "icon-plus",
                "onClick": function () {

                    var policyModel = new PolicyModel();
                    policyCreateEditView.model = policyModel;
                    policyCreateEditView.renderPolicyPopup({
                                     "title": ctwl.TITLE_ADD_POLICY,
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
                            class: 'span6',
                            rows: [{
                                title: ctwl.TITLE_POLICY_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'fq_name',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "PolicyNameFormatter"
                                    }
                                }, {
                                    key: 'uuid',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'virtual_network_back_refs',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "AssociatedNetworksFormatter"
                                    }
                                }, {
                                    key: 'network_policy_entries',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "PolicyRulesFormatter"
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };
    this.PolicyRulesFormatter = function (v, dc) {
        return policyFormatters.PolicyRulesFormatter("", "", v, "", dc);
    };
    this.AssociatedNetworksFormatter = function (v, dc) {
        return policyFormatters.AssociatedNetworksFormatter("", "", v, "", dc);
    };
    this.PolicyNameFormatter = function(v, dc) {
        return policyFormatters.PoliceyNameFormatter("", "", v, "", dc);
    };
    return PoliciesGridView;
});
