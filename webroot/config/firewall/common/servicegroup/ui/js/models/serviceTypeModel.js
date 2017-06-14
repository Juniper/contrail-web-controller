/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var serviceTypeModel = ContrailModel.extend({
        defaultConfig: {
            "protocol": "tcp",
            "dst_start_port": "",
            "dst_end_port": "",
            "src_end_port": 65535,
            "src_start_port":0,
            "src_port":"",
            "dst_port": ""
        },
        formatModelConfig: function (modelConfig) {
            self = this;
            var srcRange, dstRange;
            modelConfig["protocol"] = getValueByJsonPath(modelConfig, "protocol");
            var srcMax = getValueByJsonPath(modelConfig,"src_end_port");
            var srcMin = getValueByJsonPath(modelConfig,"src_start_port");
            if(srcMax !== '' && srcMin !== ''){
                if(srcMin === srcMax){
                    srcRange = srcMin;
                }else{
                    srcRange = srcMin +'-'+ srcMax;
                }
                modelConfig["src_port"] = srcRange;
            }else{
                modelConfig["src_port"] = '';
            }
            var dstMax = getValueByJsonPath(modelConfig,"dst_end_port");
            var dstMin = getValueByJsonPath(modelConfig,"dst_start_port");
            if(dstMax !== '' && dstMin !== ''){
            	if(dstMin === dstMax){
            	  dstRange = dstMin;
            	}else{
            		dstRange = dstMin +'-'+ dstMax;
            	}
                modelConfig["dst_port"] = dstRange;
            }else{
                modelConfig["dst_port"] = '';
            }
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
        	serviceCollectionValidation: {
               'protocol' : function(val, attr, data) {
                    if (val.trim() == "") {
                        return "Select a valid Protocol.";
                    }
                    var protocolValue = val.trim().toUpperCase();
                    var allProtocol = ['ANY', 'ICMP', 'TCP', 'UDP', 'ICMP6'];
                    if (allProtocol.indexOf(protocolValue) < 0) {
                        if (!isNumber(protocolValue)) {
                            return "Rule with invalid protocol " + protocolValue;
                        }
                        protocolValue = Number(protocolValue);
                        if (protocolValue % 1 != 0 || protocolValue < 0 || protocolValue > 255) {
                            return "Rule with invalid protocol " + protocolValue;
                        }
                    }
                },
                /*'dst_port': function(val, attr, data) {
                   var result = self.validatePort(val);
                   if (result != "") {
                        return result;
                    }
                }*/
             }
        },
        validatePort: function(port) {
            if (_.isString(port)) {
                if (port.toUpperCase() != "ANY") {
                    if(port.search(',') === -1) {
                        var portSplit = port.split("-");
                        if (portSplit.length > 2) {
                            return "Invalid Port Data";
                        }
                        for (var j = 0; j < portSplit.length; j++) {
                            if (portSplit[j] == "") {
                                return "Port has to be a number";
                            }
                            if (!isNumber(portSplit[j])) {
                                return "Port has to be a number";
                            }
                            if (portSplit[j] % 1 != 0) {
                                return "Port has to be a number";
                            }
                        }
                    }else{
                    	return "Invalid Port Data";
                    }
                }
            } else if (!isNumber(port)) {
                return "Port has to be a number";
            }
            return "";
        }
    });
    return serviceTypeModel;
});