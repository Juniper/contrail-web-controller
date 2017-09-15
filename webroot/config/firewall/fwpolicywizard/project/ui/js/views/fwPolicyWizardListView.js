/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var fwPolicyWizardListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig, listModelConfig,
                currentProject = viewConfig["projectSelectedValueData"];
            if(!viewConfig.isGlobal) {
                var ajaxConfig = {};
                ajaxConfig.type = "POST";
                ajaxConfig.url = "/api/tenants/config/get-config-details"
                ajaxConfig.data  = JSON.stringify(
                        {data: [{type: 'firewall-policys',
                            fields: ['application_policy_set_back_refs'],
                            parent_id: currentProject.value}]});
                contrail.ajaxHandler(ajaxConfig, function () {
                }, function (response) {
                    self.fwProjectPolicyArray = response;
                    listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: "/api/tenants/config/get-config-details",
                                    type: "POST",
                                    data: JSON.stringify(
                                        {data: [{type: 'application-policy-sets',
                                            parent_id: currentProject.value}]})
                                },
                                dataParser: function(response){
                                    return self.parseApplicationPolicyData(response,self.fwProjectPolicyArray);
                                }
                            }
                        };
                    contrailListModel = new ContrailListModel(listModelConfig);
                    self.renderView4Config(self.$el,
                           contrailListModel, getAppPolicyGridViewConfig(viewConfig));
                },
                function (error) {
                   console.log(error);
               });
            } else {
                var ajaxConfig = {};
                ajaxConfig.type = "POST";
                ajaxConfig.url = "/api/tenants/config/get-config-details"
                ajaxConfig.data  = JSON.stringify(
                        {data: [{type: 'firewall-policys', fields: ['application_policy_set_back_refs']}]});
                contrail.ajaxHandler(ajaxConfig, function () {
                }, function (response) {
                    self.fwGlobalPolicyArray = response;
                    listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: "/api/tenants/config/get-config-details",
                                    type: "POST",
                                    data: JSON.stringify(
                                            {data: [{type: 'application-policy-sets',
                                                parent_type: "policy-management",
                                                parent_fq_name_str:"default-policy-management"}]})
                                },
                                dataParser: function(response){
                                    return self.parseApplicationPolicyData(response,self.fwGlobalPolicyArray);
                                }
                            }
                        };
                    contrailListModel = new ContrailListModel(listModelConfig);
                    self.renderView4Config(self.$el,
                           contrailListModel, getAppPolicyGridViewConfig(viewConfig));
                },
                function (error) {
                   console.log(error);
               });
            }
        },
        parseApplicationPolicyData : function(response,data){
            var dataItems = [];
            var count = 0;
            var countNobackRefsArray = [];
            var firewallPoliciesData =  getValueByJsonPath(data, "0;firewall-policys", []);
            var fwPolicyArrayLen = firewallPoliciesData.length;
            if(getValueByJsonPath(data, "0;firewall-policys")){
                firewallPolicyrefs = getValueByJsonPath(data, "0;firewall-policys", []);
                _.each(firewallPolicyrefs, function(val){
                        var appPolicyBackRefsArray = getValueByJsonPath(val, "firewall-policy;application_policy_set_back_refs", []);
                        if(appPolicyBackRefsArray.length === 0){
                            countNobackRefsArray.push(count++);
                        }
                });
            }
            dataItems.push({
                "name": ctwc.STANDALONE_FIREWALL_POLICIES,
                "description": "-",
                "lastupdated":"-",
                "firewall_policy_refs": countNobackRefsArray
             });
            dataItems.push({
                "name": ctwc.ALL_FIREWALL_POLICIES,
                "description": "-",
                "lastupdated":"-",
                "firewall_policy_refs": firewallPoliciesData
            });

            if(getValueByJsonPath(response, "0;application-policy-sets")){
                appPolicyData = getValueByJsonPath(response, "0;application-policy-sets", []);
                _.each(appPolicyData, function(val){
                    if("application-policy-set" in val) {
                        dataItems.push(val['application-policy-set']);
                    }
                });
            }
            return dataItems;
        }
    });

    var getAppPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.NEW_APPLICATION_POLICY_SET,
                                view: "fwPolicyWizardGridView",
                                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: $.extend(viewConfig, {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    }
                                })
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fwPolicyWizardListView;
});