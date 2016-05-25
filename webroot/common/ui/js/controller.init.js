/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-constants',
    'controller-labels',
    'controller-utils',
    'controller-messages',
    'controller-grid-config',
    'controller-graph-config',
    'controller-parsers',
    'controller-view-config',
], function (_, Constants, Labels, Utils, Messages, GridConfig, GraphConfig, Parsers, ViewConfig) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    ctwgrc = new GraphConfig();
    ctwp = new Parsers();
    ctwvc = new ViewConfig();

    //deferredObj reading from global variable 
    var deferredObj = globalObj['initFeatureAppDefObjMap'][FEATURE_PCK_WEB_CONTROLLER];

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
