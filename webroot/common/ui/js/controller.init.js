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
    'lls-grid-config',
    'lls-parsers',
    'monitor-infra-utils'
], function (_, Constants, Labels, Utils, Messages, GridConfig, GraphConfig, Parsers, ViewConfig, LLSGridConfig, LLSParsers, MonitorInfraUtils) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    ctwgrc = new GraphConfig();
    ctwp = new Parsers();
    ctwvc = new ViewConfig();

    llswgc = new LLSGridConfig();
    llswp = new LLSParsers();
    var deferredObj = contentHandler.initFeatureAppDefObjMap[FEATURE_PCK_WEB_CONTROLLER];

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
