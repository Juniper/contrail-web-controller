/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwPolicyListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel, dataObj
            viewConfig = self.attributes.viewConfig,
            currentProject = viewConfig["projectSelectedValueData"];
            self.mode = viewConfig.mode;
            self.selectedRows = [], self.oldRecords =[];
            deletedObj = [];
            self.selectedPolicy = viewConfig.policyList;
            self.oldRecords = viewConfig.oldRecords;
            self.selectedRows = viewConfig.seletedRows;
            self.isGlobal = viewConfig.isGlobal;
            self.projectSelected = viewConfig.projectSelected;
            if(viewConfig.isGlobal || viewConfig.isInventory || viewConfig.isEdit){
                dataObj = JSON.stringify(
                        {data: [{type: 'firewall-policys', fields: ['application_policy_set_back_refs']}]});
            }else{
                dataObj = JSON.stringify(
                        {data: [{type: 'firewall-policys',
                            fields: ['application_policy_set_back_refs'],
                            parent_id: currentProject.value}]});
            }
            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: dataObj
                    },
                    dataParser: self.parseFWPolicyData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWPolicyGlobalGridViewConfig(viewConfig));
        },

        parseFWPolicyData: function(result) {
            var fwPolicies = getValueByJsonPath(result,
                "0;firewall-policys", [], false),
                fwPolicyList = [];
            _.each(fwPolicies, function(fwPolicy) {
                if("firewall-policy" in fwPolicy)
                fwPolicyList.push(fwPolicy["firewall-policy"]);
            });
            if(self.mode === 'add'){
                if(self.selectedRows !== undefined && self.selectedRows.length > 0){
                    var policyList = [];
                    _.each(self.selectedRows, function(fwPolicy) {
                        delete fwPolicy.cgrid;
                        if(deletedObj.indexOf(fwPolicy.uuid) === -1){
                            policyList.push(fwPolicy);
                        }
                    });
                    return policyList;
                }else{
                    return [];
                }
            } else if(self.mode === 'edit'){
                if(self.selectedRows !== undefined && self.selectedRows.length > 0){
                    var updatedList = [];
                    if(deletedObj.length > 0){
                        _.each(self.selectedRows, function(row) {
                            if(deletedObj.indexOf(row.uuid) === -1){
                                updatedList.push(row);
                            }
                        });
                        return updatedList;
                     }else{
                        return self.selectedRows;
                     }
                } else if(self.selectedPolicy !== undefined){
                    var policyList = [], updatedList = [];
                    _.each(fwPolicyList, function(fwPolicy) {
                        if(self.selectedPolicy.indexOf(fwPolicy.uuid) !== -1){
                            policyList.push(fwPolicy);
                        }
                    });
                    if(deletedObj.length > 0){
                       _.each(policyList, function(policy) {
                           if(deletedObj.indexOf(policy.uuid) === -1){
                               updatedList.push(policy);
                           } 
                       });
                       return updatedList;
                    }else{
                       return policyList;  
                    }
                }
            } else {
                if(self.oldRecords.length > 0){
                    var newFwPolicyList = [];
                    _.each(fwPolicyList, function(policy) {
                        if(self.oldRecords.indexOf(policy.uuid) === -1){
                            newFwPolicyList.push(policy);
                        }
                    });
                    return self.fetchGlobalAndProjectRecord(newFwPolicyList, self.isGlobal, self.projectSelected);
                }else{
                    return self.fetchGlobalAndProjectRecord(fwPolicyList, self.isGlobal, self.projectSelected);
                }
            }
        },
        fetchGlobalAndProjectRecord: function(policyList, isGlobal, projectSelected){
            var newUpdatedList = [];
            if(isGlobal){
                _.each(policyList, function(policy) {
                    if(policy.fq_name.length === 2){
                        newUpdatedList.push(policy);
                    }
                });
                return newUpdatedList;
            }else{
                _.each(policyList, function(policy) {
                    if(policy.fq_name.length === 2){
                        newUpdatedList.push(policy);
                    }
                });
                _.each(policyList, function(policy) {
                    if(policy.fq_name.length === 3){
                        if(policy.fq_name[1] === projectSelected){
                           newUpdatedList.push(policy); 
                        }
                    }
                });
                return newUpdatedList;  
            }
        },
        getFWPolicyGlobalGridViewConfig: function(viewConfig) {
            return {
                elementId:
                cowu.formatElementId(["fw-policy-list-view"]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: "fw-policy-grid-id",
                                view: "fwApplicationPolicyGridView",
                                viewPathPrefix:
                                    "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    viewConfig: viewConfig,
                                    //isProject: false,
                                    isGlobal: false
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return fwPolicyListView;
});

