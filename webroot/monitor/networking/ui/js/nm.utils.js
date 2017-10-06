/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {

    var NMUtils = function () {
        var self = this;

        self.getMNConfigGraphConfig = function (url, elementNameObject, keySuffix, type) {
            var graphConfig = {
                remote: {
                    ajaxConfig: {
                        url: url,
                        type: 'GET'
                    }
                },
                cacheConfig: {
                    ucid: ctwc.UCID_PREFIX_MN_GRAPHS + elementNameObject.fqName + keySuffix
                },
                focusedElement: {
                    type: type,
                    name: elementNameObject
                }
            };

            return graphConfig;
        };
        
        self.getUUIDByName = function (fqName) {
            var fqArray = fqName.split(":"),
                ucid, modeltems, cachedData;

            if (fqArray.length == 1) {
                ucid = ctwc.UCID_BC_ALL_DOMAINS;
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    ctwu.getAllDomains();
                    return null;
                }
            } else if (fqArray.length == 2) {
                ucid = ctwc.get(ctwc.UCID_BC_DOMAIN_ALL_PROJECTS, fqArray[0]);
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    ctwu.getProjects4Domain(fqArray[0]);
                    return getUUIDByName(fqName);
                }
            } else if (fqArray.length == 3) {
                ucid = ctwc.get(ctwc.UCID_BC_PROJECT_ALL_NETWORKS, fqArray[0] + ":" + fqArray[1]);
                cachedData = cowch.get(ucid);
                if (cachedData == null) {
                    ctwu.getNetworks4Project(fqArray[0] + ":" + fqArray[1]);
                    return getUUIDByName(fqName);
                }
            }

            if (cachedData != null) {
                modeltems = cachedData['dataObject']['listModel'].getItems();
                var cachedObject = _.find(modeltems, function (domainObj) {
                    return domainObj['fq_name'] == fqName;
                });
                if (contrail.checkIfExist(cachedObject)) {
                    return cachedObject['value'];
                } else {
                    return getUUIDByName(fqName);
                }
            }
        };
        /* @getUniqElements
           @ array1: Array of objects where value of identifer matches with elemets in array1
           @ array2: Array of UUID list
           @identifier: key to search in array2
         */
        self.getUniqElements = function(array1, array2, identifier) {
            var tmpObjs = {};
            var array1Len = array1.length;
            for (var i = 0; i < array1Len; i++) {
                var id = array1[i];
                if (!cowu.isNil(id) && ("object" === typeof id)) {
                    key = id[identifier];
                } else {
                    key = id;
                }
                tmpObjs[key] = true;
            }
            var uniqList = [];
            var array2Len = array2.length;
            for (i = 0; i < array2Len; i++) {
                id = array2[i];
                if (!cowu.isNil(id) && ("object" === typeof id)) {
                    key = id[identifier];
                } else {
                    key = id;
                }
                if (cowu.isNil(tmpObjs[key])) {
                    var obj = {};
                    obj[identifier] = key;
                    uniqList.push(obj);
                }
            }
            return uniqList;
        };
    };

    function getUUIDByName(fqName) {
        var retUUID, fqNameLength = fqName.split(':').length;

        if (fqNameLength == 2) {
            $.ajax({
                url: ctwc.getProjectsURL({name:
                                         contrail.getCookie(cowc.COOKIE_DOMAIN)}),
                async: false
            }).done(function (response) {
                $.each(response['projects'], function (idx, projObj) {
                    if (projObj['fq_name'].join(':') === fqName) {
                        retUUID = projObj['uuid'];
                        return false;
                    }
                });
            });
        } else {
            $.ajax({
                url:'/api/tenants/config/virtual-networks',
                async:false
            }).done(function(response) {
                $.each(response['virtual-networks'],function(idx, vnObj) {
                    if(vnObj['fq_name'].join(':') === fqName) {
                        retUUID = vnObj['uuid'];
                        return false;
                    }
                });
            });
        }
        return retUUID;
    };

    return NMUtils;
});
