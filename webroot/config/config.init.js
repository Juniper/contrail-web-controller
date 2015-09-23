/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {

    var initJSpath = pkgBaseDir + '/config/config.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    breadcrumbSelectedObj = {};
    breadcrumbSelectedObj.project = {};
    breadcrumbSelectedObj.domain = {};

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});