/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var secGrpRulesModel = ContrailModel.extend({
        defaultConfig: {
            'direction': '>',
            'ethertype': 'IPv4',
            'protocol': 'ANY',
            'remotePorts': '0 - 65535',
            'remoteAddr': ""
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
            secGrpRulesValidation: {
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
                'remotePorts': function(val, attr, fieldObj) {
                    if (("" == val) || (-1 == val) ||
                        ('ANY' == val.toUpperCase().trim())) {
                        /* ANY */
                        return;
                    }
                    var splitArr = val.split('-');
                    if (2 == splitArr.length) {
                        if (('ANY' == splitArr[0].trim().toUpperCase()) &&
                            ('ANY' == splitArr[1].trim().toUpperCase())) {
                            return;
                        }
                        var portStr = '';
                        if (isNaN(splitArr[0])) {
                            portStr = 'Start port';
                        }
                        if (isNaN(splitArr[1])) {
                            portStr = 'End port';
                        }
                        if ('' != portStr) {
                            return portStr + ' should be -1, any or 0 - 65535';
                        }
                        var startPort = Number(splitArr[0].trim());
                        var endPort = Number(splitArr[1].trim());
                        if (startPort > endPort) {
                            return 'Port range should be -1, any or 0 - 65535';
                        }
                    } else {
                        return 'Port range should be -1, any or 0 - 65535';
                    }
                },
                remoteAddr: function(val, attr, fieldObj) {
                    if (("" == val) || (null == val)) {
                        return "Enter valid address";
                    }
                    var remoteAddr = val.trim();
                    var splitArr = remoteAddr.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                    var remoteAddrType = splitArr[1];
                    remoteAddr = splitArr[0];
                    if ('subnet' == remoteAddrType) {
                        if (2 != splitArr.length) {
                            return 'Enter valid CIDR';
                        }
                        if ('IPv4' == fieldObj['ethertype']) {
                            if (!isIPv4(remoteAddr)) {
                                return "Enter a valid IPv4 Address";
                            }
                        }
                        if ('IPv6' == fieldObj['ethertype']) {
                            if(!isIPv6(remoteAddr)) {
                                return "Enter a valid IPv6 Address";
                            }
                        }
                    }
                    if ('security_group' == remoteAddrType) {
                        if (isSet(remoteAddr) && isString(remoteAddr) &&
                            (-1 != remoteAddr.indexOf(":")) &&
                            (3 != remoteAddr.split(":").length)) {
                            return 'FQN of Security Group should be in the format' +
                                ' Domain:Project:SecurityGroup';
                        }
                    }
                }
            }
        }
    });
    return secGrpRulesModel;
});


