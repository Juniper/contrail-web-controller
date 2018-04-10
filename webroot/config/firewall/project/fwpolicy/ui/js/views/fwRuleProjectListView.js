/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter'
], function (_, ContrailView, ContrailListModel, FWRuleFormatter) {
    var fwRuleFormatter = new FWRuleFormatter();
    var fwRuleProjectListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentHashParams = layoutHandler.getURLHashParams(),
                policyName = currentHashParams.focusedElement.policy,
                policyId = currentHashParams.focusedElement.uuid;
                if(currentHashParams.focusedElement.isGlobal === 'true'){
                    viewConfig.isGlobal = true;
                }else{
                    viewConfig.isGlobal = false;
                }
            pushBreadcrumb([policyName]);
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'firewall-policys', obj_uuids:[policyId]},
                                    {type: 'firewall-rules',
                                fields: ['firewall_policy_back_refs']}]})
                    },
                    dataParser: self.parseFWRuleData,
                }/*,
                vlRemoteConfig : {
                    vlRemoteList : self.getDataLazyRemoteConfig()
                }*/
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getfwRuleGridViewConfig(viewConfig));
        },

        getDataLazyRemoteConfig : function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig = {
                            url: "/api/tenants/config/get-config-details",
                            type: 'POST',
                            data: JSON.stringify(
                                    {data: [{type: 'tags'}, {type: 'address-groups'}]})
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel,
                        parentModelList) {
                        ctwu.setGlobalVariable(ctwc.RULE_DATA_TAGS,
                                getValueByJsonPath(response, '0;tags', [], false));
                        ctwu.setGlobalVariable(ctwc.RULE_DATA_ADDRESS_GROUPS,
                                getValueByJsonPath(response, '1;address-groups', [], false));
                    }
                }
            ];
        },

        parseFWRuleData : function(response) {
            var currentPolicyRuleIds = getFWRuleIds(getValueByJsonPath(response,
                          "0;firewall-policys;0;firewall-policy", {}, false)),
                dataItems = [],
                rulesData = getValueByJsonPath(response,
                        "1;firewall-rules", [], false);
                _.each(rulesData, function(rule){
                        var currentRuleID = getValueByJsonPath(rule,
                                'firewall-rule;uuid', '', false);
                        if($.inArray(currentRuleID,
                                currentPolicyRuleIds) !== -1) {
                            dataItems.push(rule['firewall-rule']);
                        }
                });
            return dataItems.sort(ruleComparator);
        }
    });

    function ruleComparator (a,b) {
        // get the sequence for each and compare
        if(Number(fwRuleFormatter.sequenceFormatter(null,null,null,null,a)) >
                Number(fwRuleFormatter.sequenceFormatter(null,null,null,null,b))) {
            return 1;
        } else {
            return -1;
        }
    }
    function getFWRuleIds(dc) {
        var ruleIds = [],
             rules = getValueByJsonPath(dc, 'firewall_rule_refs', [], false);
        _.each(rules, function(rule){
            ruleIds.push(rule.uuid);
        });
        return ruleIds;
    }

    var getfwRuleGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_FW_RULE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_FW_RULE_ID,
                                view: "fwRuleGridView",
                                viewPathPrefix: "config/firewall/common/fwpolicy/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: viewConfig.isGlobal,
                                    viewMode: viewConfig.dataType
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fwRuleProjectListView;
});

