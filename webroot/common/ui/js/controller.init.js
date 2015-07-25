/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-constants',
    'controller-labels',
    'controller-utils', 'nm-utils',
    'controller-messages',
    'controller-grid-config', 'nm-grid-config',
    'controller-graph-config', 'nm-graph-config',
    'controller-parsers', 'nm-parsers',
    'controller-view-config', 'nm-view-config'
], function (_, Constants, Labels, Utils, NMUtils, Messages, GridConfig, NMGridConfig, GraphConfig, NMGraphConfig, Parsers, NMParsers, ViewConfig, NMViewConfig) {
    ctwc = new Constants();
    ctwl = new Labels();

    ctwu = new Utils;
    nmwu = new NMUtils;

    ctwm = new Messages();

    ctwgc = new GridConfig();
    nmwgc = new NMGridConfig();

    ctwgrc = new GraphConfig();
    nmwgrc = new NMGraphConfig();

    ctwp = new Parsers();
    nmwp = new NMParsers();

    ctwvc = new ViewConfig();
    nmwvc = new NMViewConfig();

    ctInitComplete = true;

    var deferredObj = contentHandler.initFeatureAppDefObjMap[FEATURE_PCK_WEB_CONTROLLER];

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});