/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/bgp/ui/js/models/bgpFamilyAttrsModel'
], function (_, ContrailModel, BGPFamilyAttrsModel) {
    var bgpPeersModel = ContrailModel.extend({
        defaultConfig: {
            'peerName' : null,
            'isPeerSelected' : false,
            'disabled' : false,
            'auth_data' : null,
            'user_created_auth_key_type' : null,
            'user_created_auth_key' : null,
            'disableAuthKey' : false,
            'peerASN' : null,
            'admin_down' : false,
            'passive' : false,
            'hold_time' : 0,
            'loop_count' : 0,
            'family_attributes': []
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
                    authData.key_items[0].key : '';
            } else {
                modelConfig['user_created_auth_key_type'] = 'none';
                modelConfig['user_created_auth_key'] = '';
                modelConfig['disableAuthKey'] = true;
            }
            //prepare family attributes collection
            var familyAttrs = getValueByJsonPath(modelConfig,
                "family_attributes", []);
            var familyAttrArray = [];
            if(familyAttrs.length > 0) {
                for(var i = 0; i < familyAttrs.length; i++) {
                    var familyAttr =  new BGPFamilyAttrsModel({
                                           address_family: familyAttrs[i].address_family,
                                           loop_count: familyAttrs[i].loop_count,
                                           prefix_limit: getValueByJsonPath(familyAttrs[i], "prefix_limit;maximum", null)
                                       });
                    familyAttrArray.push(familyAttr);
                }
            }
            modelConfig["family_attrs"] = new Backbone.Collection(familyAttrArray);
            return  modelConfig;
        },
        addFamilyAttrs: function(root, index) {
            var familyAttrs = root.model().attributes.peers.toJSON()[index()].
                model().attributes.family_attrs;
            var newFamilyAttr = new BGPFamilyAttrsModel({address_family: null,
                loop_count: null, prefix_limit: null});
            familyAttrs.add([newFamilyAttr]);
        },
        deleteFamilyAttrs: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },
        getFamilyAttrs: function(familyAttrs) {
            var actFamilyAttrs = [];
            if(familyAttrs instanceof Array) {
                for(var i = 0; i < familyAttrs.length; i++) {
                    var familyAttr = familyAttrs[i];
                    actFamilyAttrs.push({
                        address_family: familyAttr.address_family()(),
                        loop_count: Number(familyAttr.loop_count()()),
                        prefix_limit: {maximum : Number(familyAttr.prefix_limit()())}
                    });
                }
            }
            return actFamilyAttrs;
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
                        return "Enter Auth key";
                    }
                },
                "hold_time" : function(value, attr, finalObj) {
                    if(value) {
                        var holdTime = Number(value);
                        if (isNaN(holdTime) || holdTime < 1 || holdTime > 65535) {
                            return "Enter valid  hold time between 1-65535" ;
                        }
                    }
                },
                 "loop_count" : function(value, attr, finalObj) {
                     if(value) {
                         if(isNaN(value) || Number(value) < 0 || Number(value) > 16) {
                             return "Loop count should be in 0-16 range"
                         }
                     }
                 }
            }
        }
    });
    return bgpPeersModel
});