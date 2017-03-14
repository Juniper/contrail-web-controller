/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/gohanUi/ui/js/models/policyModel',
    'config/gohanUi/ui/js/views/networkpolicy/policyEditView',
    'contrail-view',
    'config/gohanUi/ui/js/views/networkpolicy/policyFormatters',
    'config/gohanUi/ui/js/models/locationModel',
], function (_, Backbone, PolicyModel, PolicyCreateEditView,
             ContrailView, PolicyFormatters, LocationModel) {
    var policyFormatters = new PolicyFormatters();
    var policyCreateEditView = new PolicyCreateEditView(),
    gridElId = "#" + ctwl.POLICIES_GRID_ID;

    var PoliciesGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                                  getPoliciesGridViewConfig());
        }
    });
    var getPoliciesGridViewConfig = function () {
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
                                   elementConfig: getConfiguration()
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
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            policyCreateEditView.model = new PolicyModel(dataItem);
            policyCreateEditView.renderPolicyPopup({
                                  "title": 'Edit Network Policy',
                                   mode : 'edit',
                                  callback: function () {
                                         dataView.refreshData();
                                  }});
        }),
        ctwgc.getEditConfig('Edit Local Network Policy', function(rowIndex) {
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: './gohan_contrail/v1.0/tenant/network_policies/'+dataItem.id+'/local_network_policies?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+dataItem.tenant_id,
                    type:'GET'
            };
            contrail.ajaxHandler(ajaxConfig, null, function(model){
                var arr = model[Object.keys(model)[0]];
                var mainObj = {};
                mainObj.id = dataItem.id;
                var parentObj = [];
                for(var i = 0; i < arr.length; i++){
                    var locationObj = {};
                    locationObj.locationName = arr[i].location.name;
                    locationObj.status = arr[i].status;
                    locationObj.name = arr[i].name;
                    locationObj.description = arr[i].description;
                    locationObj.taskStatus = arr[i].task_status;
                    locationObj.locationId = arr[i].id;
                    locationObj.svcTempId = dataItem.id;
                    parentObj.push(locationObj);
                }
                mainObj.entries = parentObj;
                policyCreateEditView.model = new LocationModel(mainObj);
                policyCreateEditView.renderLocationGridPopup({
                                     "title": 'Update Local Network Policy',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
           },function(error){
                contrail.showErrorMsg(error.responseText);
           });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var rowNum = this.rowIdentifier;
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            var policyModel = new PolicyModel(dataItem);
            policyCreateEditView.model = policyModel;
            policyCreateEditView.renderDeletePolicy({
                                  "title": 'Delete Network Policy',
                                  selectedGridData: [dataItem],
                                  callback: function() {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];
    var getConfiguration = function () {
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
                    checkboxSelectable: false,
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getPoliceyDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                              ctwu.getLocationGrid(event, obj, 'network_policies', ctwl.POLICIES_GRID_ID);
                        }
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
            footer: {}
        };
        return gridElementConfig;
    };
    this.policyColumns = [
    {
        id: 'name',
        field: 'name',
        name: 'Policy'
    },
    {
        id: 'description',
        field: 'description',
        name: 'Description'
    },
    {
        id: "PolicyRules",
        label:"Rules",
        field: "network_policy_entries",
        name: "Rules",
        sortable: {
           sortBy: 'formattedValue'
        },
        width: 500,
        formatter: policyFormatters.PolicyRulesFormatter
    }];

    function getHeaderActionConfig(gridElId) {
        var headerActionConfig =
        [
            {
                "type": "link",
                "title": ctwl.TITLE_ADD_POLICY,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    policyCreateEditView.model = new PolicyModel();
                    policyCreateEditView.renderPolicyPopup({
                                     "title": 'Create Network Policy',
                                      mode : 'add',
                                      callback: function () {
                                            var dataView = $("#"+gridElId).data("contrailGrid")._dataView;
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
                                    keyClass:'col-xs-6',
                                    key: 'name',
                                    label:'Display Name',
                                    templateGenerator: 'TextGenerator'
                                 },{
                                    keyClass:'col-xs-6',
                                    key: 'description',
                                    label: 'Description',
                                    templateGenerator: 'TextGenerator'
                                },{
                                    keyClass:'col-xs-6',
                                    key: 'id',
                                    label: 'ID',
                                    templateGenerator: 'TextGenerator'
                                },{
                                    keyClass:'col-xs-6',
                                    valueClass:'col-xs-11',
                                    label:'Rules',
                                    key: 'entries',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig:{
                                        formatter: "PolicyRulesExpandFormatter",
                                        sortable: {
                                           sortBy: 'formattedValue'
                                        }
                                    }
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };
    this.PolicyRulesExpandFormatter = function (v, dc) {
        return policyFormatters.PolicyRulesFormatter("", "", v, -1, dc);
    };
    return PoliciesGridView;
});
