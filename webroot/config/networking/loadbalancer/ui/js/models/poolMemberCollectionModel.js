/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters'
], function (_, ContrailModel, LbCfgFormatters) {
    var self;
    var lbCfgFormatters = new LbCfgFormatters();
    var poolMemberModel = ContrailModel.extend({
        defaultConfig: {
            'pool_member_ip_address' : '',
            'pool_member_subnet' : '',
            'pool_member_port': '80',
            'pool_member_weight':'1',
            'pool_name':'Member 1',
            'pool_member_admin_state': true
        },

        formatModelConfig: function (modelConfig) {
            return modelConfig;
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
            poolMemberValidation: {
                'pool_member_port' : function(value, attr, data) {
                    var port = Number(value);
                    if(port < 1 || port > 65535){
                        return "The Port must be a number between 1 and 65535.";
                    }
                },
                'pool_member_ip_address' : function(value, attr, data) {
                    if(value  !== ""){
                        if(!lbCfgFormatters.validateIP(value)){
                            return "The IP address is not valid.";
                        }
                        if(data.pool_member_subnet != "") {
                            var subnet = data.pool_member_subnet.split(';')[1];
                            if(!isIPBoundToRange(subnet, value)){
                                var ip = subnet.split('/')[0];
                                return "Enter a fixed IP within the selected subnet range " + ip;
                            }
                            if(isStartAddress(subnet, value) == true ||
                               isEndAddress(subnet, value) == true) {
                                return "Fixed IP cannot be same as broadcast/start address";
                            }
                        }
                    }else{
                        return "Please enter the IP address.";
                    }
                 }
             }
        }
    });
    return poolMemberModel;
});
