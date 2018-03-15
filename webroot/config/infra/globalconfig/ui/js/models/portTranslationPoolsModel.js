/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var PortTranslationPoolsModel = ContrailModel.extend({
        defaultConfig: {
            "protocol": "",
            "port_range": "",
            "port_count": ""
        },

        formatModelConfig: function (modelConfig) {
            self = this;
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
            portTranslationValidation: {
               'protocol' : function(val, attr, data) {
                    if (val.trim() == "") {
                        return "Select a valid Protocol.";
                    }
                    var protocolValue = val.trim();
                    var allProtocol = ['any', 'icmp', 'tcp', 'udp', 'icmp6'];
                    if (allProtocol.indexOf(protocolValue) < 0) {
                        if (!isNumber(protocolValue)) {
                            return "Invalid protocol " + protocolValue;
                        }
                        protocolValue = Number(protocolValue);
                        if (protocolValue % 1 != 0 || protocolValue < 0 || protocolValue > 255) {
                            return "Invalid protocol " + protocolValue;
                        }
                    }
                },
                'port_count': function(val, attr, data) {
                   if(data.port_range === '' && data.port_count !== ''){
                       if(!isNumber(data.port_count)){
                           return 'Invalid Port Count';
                       } else {
                           return;
                       }
                   }else if(data.port_range !== '' && data.port_count === ''){
                       return '';
                   }else if(data.port_range === '' && data.port_count === ''){
                       return 'Please enter Port range or Port count';
                   }else{
                      return "Port range and Port count are mutually exclusive.";
                   }
                },
                'port_range': function(val, attr, data) {
                    if(data.port_count === '' && data.port_range !== ''){
                        if(data.port_range.indexOf('-') !== -1 &&
                                (data.port_range.match(/-/g) || []).length == 1){
                           var portRange = data.port_range.split('-');
                           if(!isNumber(portRange[0].trim()) && !isNumber(portRange[1].trim())){
                               return 'Invalid Port Range';
                           }
                           if(!isNumber(portRange[0].trim()) ||
                                   portRange[0] < 0 ||
                                   portRange[0] > 65535){
                              return 'Invalid Start Port';
                           }
                           if(!isNumber(portRange[1].trim()) ||
                                   portRange[1] < 0 ||
                                   portRange[1] > 65535){
                               return 'Invalid End Port';
                            }
                           if(portRange[0] >= portRange[1]){
                               return 'Invalid Port Range';
                            }
                        }else{
                           return 'Invalid Port Range';
                        }
                    }else if(data.port_count !== '' && data.port_range === ''){
                        return '';
                    }else if(data.port_count === '' && data.port_range === ''){
                        return 'Please enter Port range or Port count';
                    }else{
                       return "Port range and Port count are mutually exclusive";
                    }
                 }
             }
        }
    });

    return PortTranslationPoolsModel;
});

