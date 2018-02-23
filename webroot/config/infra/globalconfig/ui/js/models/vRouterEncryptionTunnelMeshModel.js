/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailModel, GlobalConfigUtils) {
	var gcUtils = new GlobalConfigUtils();
    var tunnelMeshModel = ContrailModel.extend({
        defaultConfig: {
             'tunnel_remote_ip_address': ""
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                    (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        validations: {
            tunnelMeshValidation: {
            		tunnel_remote_ip_address: function(value, attr, fieldObj) {
                	 var ip= value.split(';')[0]
                	 if(!gcUtils.validateIP(ip)) {
                         return "Enter valid IP address";
                     }
                    var remoteAddr = value.trim();
                }
            }
        },
    });
    return tunnelMeshModel;
});


