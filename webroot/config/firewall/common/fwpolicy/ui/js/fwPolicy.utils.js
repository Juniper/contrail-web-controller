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

        }
    }
    return fwPolicyUtils;
});