/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var bgpPeersModel = ContrailModel.extend({
        defaultConfig: {
            'peerName' : null,
            'isPeerSelected' : false,
            'disabled' : false,
            'auth_data' : null,
            'user_created_auth_key_type' : null,
            'user_created_auth_key' : null,
            'disableAuthKey' : false,
            'peerASN' : null
        },
        formatModelConfig: function(modelConfig){
            //populate auth data
            if(modelConfig['auth_data'] != null) {
                var authData = modelConfig['auth_data']
                modelConfig['user_created_auth_key_type'] =
                    authData.key_type != null ? authData.key_type : 'none';
                if(modelConfig['user_created_auth_key_type'] === 'none') {
                    modelConfig['disableAuthKey'] = true;
                }
                modelConfig['user_created_auth_key'] =
                    authData.key_items != null &&
                    authData.key_items.length > 0 ?
                    authData.key_items[0].key : ' ';
            } else {
                modelConfig['user_created_auth_key_type'] = 'none';
                modelConfig['user_created_auth_key'] = ' ';
                modelConfig['disableAuthKey'] = true;
            }

            return  modelConfig;
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ?
                false : isValid;
            errors.set(attrErrorObj);
        },
        validations: {
            peerValidation : {
                'user_created_auth_key' : function(value, attr, finalObj){
                    if (finalObj['user_created_auth_key_type'] != 'none'
                        && (value == null || value.trim() == '')) {
                        return "Enter a valid Authentication key";
                    }
                }
            }
        }
    });
    return bgpPeersModel
});