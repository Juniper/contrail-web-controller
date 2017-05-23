/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/models/fwPermissionModel',
    'knockback'
], function (_, ContrailView, FWPermissionModel,Knockback) {
    var fwPermissionView = ContrailView.extend({
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
            var parent = (self.$el.append("<div id=fwPermissionContainer></div>"));
            $("#fwPermissionContainer").append(editTmpl({prefixId:"fwPermission"}));
            var formId = "#fwPermission-form";
            contrail.ajaxHandler(ajaxConfig, function () {
            }, function (response) {
                var currentPermissionIds = getValueByJsonPath(response,
                        "0;firewall-policys;0;firewall-policy", {}, false);
                currentPermissionIds['perms2']['global_access'] = getValueByJsonPath(response,
                        "0;firewall-policys;0;firewall-policy;perms2;global_access", '-', false);
                console.log(currentPermissionIds);
                self.model = new FWPermissionModel(currentPermissionIds);
                self.renderView4Config($(self.$el).find(formId),
                        self.model, getFWPolicyInfoGridViewConfig(),
                        null,null,null,
                        function(){
                    self.model.showErrorAttr("fwPermission-form",
                            false);
                    Knockback.applyBindings(self.model,
                            document.getElementById('fwPermissionContainer'));
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
                "policy-permission-section-id",
            view: "SectionView",
            viewConfig: {
                title: "Local Permission",
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'owner',
                                view: 'FormInputView',
                                viewConfig: {
                                    disabled: true,
                                    label: "Owner",
                                    path: 'perms2.owner',
                                    dataBindValue: 'perms2().owner',
                                    class: 'col-xs-4'
                                }
                            },
                            {
                                elementId: 'owner_access',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: "Owner Permissions",
                                    path: 'perms2.owner_access',
                                    dataBindValue: 'perms2().owner_access',
                                    disabled: true,
                                    class: 'col-xs-4',
                                    elementConfig: {
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        placeholder:
                                            "Select Permissions",
                                        data: cowc.RBAC_ACCESS_TYPE_LIST
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return fwPermissionView;
});

