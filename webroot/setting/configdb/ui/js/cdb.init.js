/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-basedir/setting/configdb/ui/js/cdb.main'
], function (_) {

    var initJSpath = pkgBaseDir + '/setting/configdb/ui/js/cdb.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
