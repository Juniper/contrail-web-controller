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
            seletedInventoryList = [];
            policyGridList = {};
            policyGridList.list = [];
            self.apsName = viewConfig.apsName;
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
                    updatedGridList = [];
                    policyGridList.list = self.getFqNameList(policyList);
                    return policyList;
                }else if(self.selectedPolicy !== undefined){
                    if(deletedObj.length > 0){
                        var updatedList = [];
                        _.each(self.selectedPolicy, function(policy) {
                            if(deletedObj.indexOf(policy.uuid) === -1){
                                delete policy.cgrid;
                                updatedList.push(policy);
                            }
                        });
                        updatedGridList = [];
                        policyGridList.list = self.getFqNameList(updatedList);
                        return updatedList;
                    }else{
                        policyGridList.list = self.getFqNameList(self.selectedPolicy);
                        return self.selectedPolicy;
                    }
                }else{
                    policyGridList.list = [];
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
                        updatedGridList = [];
                        policyGridList.list = self.getFqNameList(updatedList);
                        return updatedList;
                     }else{
                        policyGridList.list = self.getFqNameList(self.selectedRows);
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
                       updatedGridList = [];
                       return self.sortPolicy(updatedList, self.apsName);
                    }else{
                       return self.sortPolicy(policyList, self.apsName);
                    }
                }
            } else {
                if(seletedInventoryList.length > 0){
                    if(seletedInventoryList[0] == 'cancel'){
                        return [];
                    }else{
                        if(deletedObj.length > 0){
                            var updatedInventoryList = [];
                            _.each(seletedInventoryList, function(row) {
                                if(deletedObj.indexOf(row.uuid) === -1){
                                    updatedInventoryList.push(row);
                                }
                            });
                            updatedGridList = [];
                            policyGridList.list = self.getFqNameList(updatedInventoryList);
                            return updatedInventoryList;
                         }else{
                             updatedGridList = [];
                             policyGridList.list = self.getFqNameList(seletedInventoryList);
                             return seletedInventoryList;
                         }
                    }
                }else if(self.oldRecords.length > 0){
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
        sortPolicy: function(policyList, apsName){
            var matchAps;
            var updatedList =
                _.sortBy(policyList, function (pol) {
                    var apsBackRefs = getValueByJsonPath(pol, 'application_policy_set_back_refs', []);
                    _.each(apsBackRefs, function(aps) {
                        var to = aps.to;
                        if(to[to.length - 1] === apsName){
                            matchAps = aps
                        }
                    });
                    var sequence = Number(getValueByJsonPath(matchAps, 'attr;sequence', 0));
                    return ((1 + sequence) * 100000 ) - sequence;
               });
            policyGridList.list = self.getFqNameList(updatedList);
            return updatedList;
        },
        getFqNameList: function(list){
           var fqNameList = [];
           _.each(list, function(obj) {
               var fqName = obj.fq_name;
               fqNameList.push(fqName[fqName.length - 1]);
           });
           return fqNameList;
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
                cowu.formatElementId([viewConfig.idList.sectionId]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: viewConfig.idList.id,
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