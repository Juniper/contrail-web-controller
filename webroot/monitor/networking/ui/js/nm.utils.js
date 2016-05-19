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
    };

    function getUUIDByName(fqName) {
        var retUUID, fqNameLength = fqName.split(':').length;

        if (fqNameLength == 2) {
            $.ajax({
                url: ctwc.getProjectsURL({name: ctwc.COOKIE_DOMAIN}),
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
