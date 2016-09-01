/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/rbac/common/ui/js/models/rbacRulesModel',
    'config/rbac/common/ui/js/rbacUtils'
], function (_, ContrailModel, RBACRulesModel, RBACUtils) {
    var rbacUtils = new RBACUtils();
    var rbacModel = RBACRulesModel.extend({
        configRBAC: function (callbackObj, options) {
            return rbacUtils.configAllRBAC(this, callbackObj, options);
        },

        deleteRBAC: function(callbackObj, options) {
            return rbacUtils.deleteAllRBAC(callbackObj, options);
        }
    });
    return rbacModel;
});
