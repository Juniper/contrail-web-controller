/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/rbac/common/ui/js/models/rbacRulePermsModel'
], function (_, ContrailModel, RBACRulePermsModel) {
    var rbacRulesModel = ContrailModel.extend({

        defaultConfig: {
            "rule_object": null,
            "rule_field": null,
            "rule_perms": [],
            "domain": null,
            "project": null,
            "rule_field_ds":[]
        },

        formatModelConfig: function(modelConfig) {
            var rulePermsModel, rulePermsModelCol = [],
            rulePerms = getValueByJsonPath(modelConfig,
                "rule_perms", []), roleCrud, roleName;
            _.each(rulePerms, function(rulePerm){
                if(rulePerm) {
                    roleName = rulePerm.role_name === "*" ?
                            ctwc.RBAC_ALL_ROLES: rulePerm.role_name;
                    roleCrud = rulePerm.role_crud ?
                        rulePerm.role_crud.split("") : "";
                    rulePermsModel = new RBACRulePermsModel({
                        role_name: roleName,
                        role_crud: roleCrud
                    });
                    rulePermsModelCol.push(rulePermsModel);
                }
            });
            modelConfig["rule_perms"] =
                new Backbone.Collection(rulePermsModelCol);
            return modelConfig;
        },

        addRulePerm: function() {
            var routes = this.model().attributes["rule_perms"];
            routes.add([new RBACRulePermsModel()]);
        },

        addRulePermByIndex: function(data, kbInterface) {
            var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
            var routes = this.model().attributes["rule_perms"];
            routes.add([new RBACRulePermsModel()],{at: selectedRuleIndex+1});
        },

        deleteRulePerm: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },

        getRulePerms: function(attr) {
            var rulePerms = attr && attr.rule_perms ?
                    attr.rule_perms.toJSON() : [],
                actRulePerms = [], roleCrud, roleName;
            _.each(rulePerms, function(r){
                roleName  = (r.role_name() && r.role_name().trim() ===
                    ctwc.RBAC_ALL_ROLES) ? "*" : r.role_name();
                roleCrud = r.role_crud() ?
                    r.role_crud().split(",").join(""): "";
                actRulePerms.push({
                    role_name: roleName,
                    role_crud: roleCrud
                });
            });
            return actRulePerms;
        }/*,

        validations: {
            rbacValidations: {
                rule_object : {
                    required : true,
                    msg : "Object is Required"
                }
            }
        }*/
    });

    return rbacRulesModel;
});
