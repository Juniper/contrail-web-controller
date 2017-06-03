/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/models/fwPolicyInfoModel',
    'knockback'
], function (_, ContrailView, FWPolicyInfoModel,Knockback) {
    var fwPolicyInfoView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentHashParams = layoutHandler.getURLHashParams(),
                policyName = currentHashParams.focusedElement.policy,
                policyId = currentHashParams.focusedElement.uuid;
                var ajaxConfig = {};
            ajaxConfig.type = "POST";
            ajaxConfig.url = "/api/tenants/config/get-config-details"
            ajaxConfig.data  = JSON.stringify(
                  {data: [{type: 'firewall-policys', obj_uuids:[policyId]}]});
           // ajaxConfig.parser = self.parseFWPolicyData;
            var editTmpl = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var parent = (self.$el.append("<div id=fwPolicyContainer></div>"));
            $("#fwPolicyContainer").append(editTmpl({prefixId:"fwPolicy"}));
            var formId = "#fwPolicy-form";
            contrail.ajaxHandler(ajaxConfig, function () {
            }, function (response) {
                var currentPolicyInfoIds = getValueByJsonPath(response,
                        "0;firewall-policys;0;firewall-policy", {}, false);
                currentPolicyInfoIds['description'] = getValueByJsonPath(response,
                        "0;firewall-policys;0;firewall-policy;id_perms;description", '-', false);
                currentPolicyInfoIds['tags_refs'] = getValueByJsonPath(response,
                        "0;firewall-policys;0;firewall-policy;tags_refs", '-', false);
                self.model = new FWPolicyInfoModel(currentPolicyInfoIds);
                self.renderView4Config($(self.$el).find(formId),
                        self.model, getFWPolicyInfoGridViewConfig(),
                        null,null,null,
                        function(){
                    self.model.showErrorAttr("fwPolicy-form",
                            false);
                    Knockback.applyBindings(self.model,
                            document.getElementById('fwPolicyContainer'));
                    kbValidation.bind(self);
                });
            }, function (error) {
               console.log(error);
           });
        },
        parseFWPolicyData : function(response) {
            var currentPolicyRuleIds = getValueByJsonPath(response,
                          "0;firewall-policys;0;firewall-policy", {}, false);
            return currentPolicyRuleIds;
        }
    });
     function getFWPolicyInfoGridViewConfig(viewConfig) {
        return {
            elementId:
                "policy-info-grid-view",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "display_name",
                                view: "FormInputView",
                                viewConfig: {
                                    disabled: true,
                                    path: "display_name",
                                    dataBindValue: "display_name",
                                    label: "Policy Name",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: "description",
                                view: "FormTextAreaView",
                                viewConfig: {
                                    disabled: true,
                                    path: "description",
                                    dataBindValue: "description",
                                    label: "Description",
                                    rows:"5",
                                    cols:"100%",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: "tags",
                                view: "FormMultiselectView",
                                viewConfig: {
                                    disabled: true,
                                    path: "tag_refs",
                                    dataBindValue: "tag_refs",
                                    label: "Tags",
                                    class: "col-xs-6",
                                    elementConfig: {
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        placeholder:
                                            "-"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return fwPolicyInfoView;
});

