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
            'disabled' : false,
            'auth_data' : null,
            'user_created_auth_key_type' : null,
            'user_created_auth_key' : null,
            'disableAuthKey' : false,
            'peerASN' : null,
            'admin_state' : true,
            'passive' : false,
            'hold_time' : null,
            'loop_count' : null,
            'family_attributes': [],
            'local_autonomous_system': null
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
                                           prefix_limit: getValueByJsonPath(familyAttrs[i], "prefix_limit;maximum", null),
                                           familyAttrDataSource : ctwc.FAMILY_ATTR_ADDRESS_FAMILY_DATA,
                                           disableFamilyAttr : true
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
            var newFamilyAttr;
            var avlFamilyAttrs = ctwc.FAMILY_ATTR_ADDRESS_FAMILY_DATA;
            if(root.model().attributes.user_created_router_type ===
                ctwl.BGP_ROUTER_TYPE) {
                avlFamilyAttrs = _.filter(avlFamilyAttrs, function(familyAttr){
                    return familyAttr.text !== "erm-vpn";
                });
            }
            newFamilyAttr = new BGPFamilyAttrsModel(
                {
                    address_family: null,
                    loop_count: null,
                    prefix_limit: null,
                    familyAttrDataSource: avlFamilyAttrs,
                    disableFamilyAttr : false
                }
            );
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
                 "peerName" : {
                     required: true,
                     msg: "Enter Peer Name"
                 },
                'user_created_auth_key' : function(value, attr, finalObj){
                    if (finalObj['user_created_auth_key_type'] != 'none'
                        && (value == null || value.trim() == '')) {
                        return "Enter Auth Key";
                    }
                },
                "hold_time" : function(value, attr, finalObj) {
                    if(value) {
                        var holdTime = Number(value);
                        if (isNaN(holdTime) || holdTime < 1 || holdTime > 65535) {
                            return "Enter valid  Hold Time between 1 - 65535" ;
                        }
                    }
                },
                'local_autonomous_system' : function(value, attr, finalObj){
                    if(value) {
                        var asn = Number(value);
                        if (isNaN(asn) || asn < 1 || asn > 65534) {
                            return "Enter valid Local ASN between 1-65534";
                        }
                    }
                },
                 "loop_count" : function(value, attr, finalObj) {
                     if(value) {
                         if(isNaN(value) || Number(value) < 0 || Number(value) > 16) {
                             return "Enter Loop count between  0 - 16 "
                         }
                     }
                },
                "family_attrs" : function(value, attr, finalObj) {
                    var familyAttrsArray =  finalObj.family_attrs.toJSON();
                    var familyAttrs = [], sortedFamilyAttrs,
                        sortedFamilyAttrsCnt, i;
                    if(familyAttrsArray) {
                        _.each(familyAttrsArray, function(item){
                            familyAttrs.push(item.address_family());
                        });
                        sortedFamilyAttrs = familyAttrs.sort();
                        sortedFamilyAttrsCnt = sortedFamilyAttrs.length;
                        for(i = 0; i < sortedFamilyAttrsCnt; i++){
                            if(sortedFamilyAttrs[i] === sortedFamilyAttrs[i + 1]){
                                return "Family Attributes are repeated";
                            }
                        }
                    }
                }
            }
        }
    });
    return bgpPeersModel
});