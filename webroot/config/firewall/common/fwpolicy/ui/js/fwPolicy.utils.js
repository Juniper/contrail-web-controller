/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var fwPolicyUtils = function() {
        var self = this;
        this.validateEndPoint = function (src,finalObj) {
            
            var CUSTOM_TAG_TYPE = "udtag";
            var endPoints = finalObj[src].split(',');
            var typesMap = {};
            /**
             * @type {{ [tagName: string]: number }}
             */
            var customTagsDictionary = {};

            _.each(endPoints,function(ep){
                var splitEndpoint = ep.split(';');
                if (splitEndpoint.length < 2) {
                    return;
                }

                var tagType = splitEndpoint[1];
                if(tagType.indexOf("global:") == 0) {
                    tagType = tagType.substring(7,tagType.length);
                }

                if(!_.has(typesMap, tagType)) {
                    typesMap[tagType] = 1;
                } else {
                    typesMap[tagType] = typesMap[tagType] + 1;
                }

                if (tagType === CUSTOM_TAG_TYPE) {
                    var tag = splitEndpoint[0];
                    var splitTag = tag.split("=");
                    var tagName = splitTag[0];
                    if (!_.has(customTagsDictionary, tagName)) {
                        customTagsDictionary[tagName] = 1;
                    } else {
                        customTagsDictionary[tagName] += 1;
                    }
                }
            });
            if((typesMap['virtual_network'] > 0 && _.keys(typesMap).length > 1) ||
                    (typesMap['any_workload'] > 0 && _.keys(typesMap).length > 1) ||
                    (typesMap['address_group'] > 0 && _.keys(typesMap).length > 1)) {
                return "Please select only Tags or Address Group or Virtual Network or Any Workload";
            }

            for (var tagName in customTagsDictionary) {
                if(customTagsDictionary[tagName] > 1) {
                    return "Please select only one tag from custom tags";
                }
            }

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