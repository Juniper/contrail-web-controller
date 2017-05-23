/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var fwPermissionModel = ContrailModel.extend({
        defaultConfig: {
            "perms2": {
                "owner": "",
                "owner_access": "",
                "global_access": "",
                "share": []
            }
        },
        formatModelConfig: function(modelData) {
            modelData = (modelData == null) ? this.defaultConfig : modelData;
            var self = this, shareModel, shareModelCol = [],
            share;
            if(modelData["perms2"]) {
                modelData["perms2"]["owner_access"] =
                    self.formatAccessList(modelData["perms2"]["owner_access"]);
                modelData["perms2"]["global_access"] =
                    self.formatAccessList(modelData["perms2"]["global_access"]);
                modelData["owner_visible"] = true;
            } else {//required for create case
                modelData["perms2"] = {};
                modelData["perms2"]["owner_access"] = "4,2,1";
                modelData["perms2"]["global_access"] = "";
            }
            return modelData;
        },
        formatAccessList: function(access) {
            var retStr = "";
            switch (access) {
                case 1:
                    retStr = "1";
                    break;
                case 2:
                    retStr = "2";
                    break;
                case 3:
                    retStr = "2,1";
                    break;
                case 4:
                    retStr = "4";
                    break;
                case 5:
                    retStr = "4,1";
                    break;
                case 6:
                    retStr = "4,2";
                    break;
                case 7:
                    retStr = "4,2,1";
                    break;
                default:
                    retStr = "";
                    break;
            };
            return retStr;
        }
    });
    return fwPermissionModel;
});
