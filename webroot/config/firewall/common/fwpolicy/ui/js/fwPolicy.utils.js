/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var fwPolicyUtils = function() {
        var self = this;
        this.validateEndPoint = function (src,finalObj) {

            var endPoints = finalObj[src].split(',');
            var typesMap = {};
            _.each(endPoints,function(ep){
                var type = (ep.split(';').length > 1)? ep.split(';')[1]: null;
                if(type != null) {
                    if(type.indexOf("global:") == 0) {
                        type = type.substring(7,type.length);
                    }
                    if(!_.has(typesMap, type)) {
                        typesMap[type] = 1
                    } else {
                        typesMap[type] = typesMap[type] + 1;
                    }
                }
            });
            if((typesMap['virtual_network'] > 0 && _.keys(typesMap).length > 1) ||
                    (typesMap['any_workload'] > 0 && _.keys(typesMap).length > 1) ||
                    (typesMap['address_group'] > 0 && _.keys(typesMap).length > 1)) {
                return "Please select only Tags or Address Group or Virtual Network or Any Workload";
            }
            for (type in typesMap) {
                if(type !== ctwc.LABEL_TAG_TYPE && typesMap[type] > 1) {
                    return "Please select only one tag from each Tag type";
                }
            }

        };

        this.validateServices = function(value, attr, finalObj) {
            if(!value) {
                return;
            }
            var serviceArry = value.split(':');
            if(serviceArry.length !== 2) {
                return;
            }
            var protocol = serviceArry[0],
                port = serviceArry[1];
            if($.inArray(protocol.toLowerCase(), ['tcp', 'udp', 'icmp']) === -1 &&
                    isNaN(protocol) || Number(protocol) < 0 || Number(protocol) > 255) {
                    return "Select a protocol or enter a code between 0 - 255";
            }
            if (_.isString(port)) {
                if (port.toLowerCase() != "any") {
                    var portArr = port.split(",");
                    for (var i = 0; i < portArr.length; i++) {
                        var portSplit = portArr[i].split("-");
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
                    }
                }
            } else if (!isNumber(port)) {
                return "Port has to be a number";
            }
            return;
        };
    }
    return fwPolicyUtils;
});