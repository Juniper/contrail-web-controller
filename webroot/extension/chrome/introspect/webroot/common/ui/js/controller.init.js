/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-common',
    'controller-constants',
    'controller-labels',
    'controller-utils',
    'controller-messages'
], function (_, Contrail, Constants, Labels, Utils, Messages) {
    contrail = new Contrail();
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();

    //deferredObj reading from global variable 
    var deferredObj = globalObj['initFeatureAppDefObjMap'][FEATURE_PCK_WEB_CONTROLLER];

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
