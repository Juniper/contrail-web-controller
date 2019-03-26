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

            var CUSTOM_TAG_TYPE = "udtag";
            var tagTypesThatCanAppearMultipleTimes = [ctwc.LABEL_TAG_TYPE, CUSTOM_TAG_TYPE];

            for (var type in typesMap) {
                var tagCanAppearMultipleTimes = _.contains(tagTypesThatCanAppearMultipleTimes, type);
                if(!tagCanAppearMultipleTimes && typesMap[type] > 1) {
                    return "Please select only one tag from each Tag type";
                }
            }
        };

        this.portValidation = function(port){
            var portArr = port.split(","), returnString = '';
            for (var i = 0; i < portArr.length; i++) {
                var portSplit = portArr[i].split("-");
                if (portSplit.length > 2) {
                    returnString = "Invalid Port Data";
                }
                for (var j = 0; j < portSplit.length; j++) {
                    if (portSplit[j] == "") {
                        returnString =  "Port has to be a number";
                    }
                    if (!isNumber(portSplit[j])) {
                        returnString =  "Port has to be a number";
                    }
                    if (portSplit[j] % 1 != 0) {
                        returnString =  "Port has to be a number";
                    }
                }
            }
            return returnString;
        };

        this.validateServices = function(value, attr, finalObj) {
             var returnString = '';
            if(!value) {
                return;
            }
            var serviceArry = value.split(':');
            if(serviceArry[0] === 'global'){
                serviceArry.splice(0,1);
            }
            if(serviceArry.length < 2 || serviceArry.length > 3) {
                return;
            }
            var protocol = serviceArry[0],
                srcPort = serviceArry[1],
                dstPort = serviceArry[2];
            if($.inArray(protocol.toLowerCase(), ['tcp', 'udp', 'icmp','any']) === -1 &&
                    isNaN(protocol) || Number(protocol) < 0 || Number(protocol) > 255) {
                    return "Select a protocol or enter a code between 0 - 255";
            }
            if (_.isString(srcPort)) {
                if (srcPort.toLowerCase() != "any") {
                    returnString = self.portValidation(srcPort);
                }
            } else if (!isNumber(srcPort)) {
                returnString = "Port has to be a number";
            }
            if(returnString !== ''){
                return returnString;
            }else{
                if(dstPort !== undefined){
                    if (_.isString(dstPort)) {
                        if (dstPort.toLowerCase() != "any") {
                            returnString = self.portValidation(dstPort);
                        }
                    } else if (!isNumber(dstPort)) {
                        returnString = "Port has to be a number";
                    }
                    return returnString;
                }
            }
            return;
        };
    }
    return fwPolicyUtils;
});