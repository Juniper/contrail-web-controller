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
    'controller-view-config', 'nm-view-config',
    'config-breadcrumb-view'
], function (_, Constants, Labels, Utils, NMUtils, Messages, GridConfig,
            NMGridConfig, GraphConfig, NMGraphConfig, Parsers, NMParsers, 
			ViewConfig, NMViewConfig, ConfigBreadcrumbView) {
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

    ctbdcb = new ConfigBreadcrumbView();
    ctInitComplete = true;
});
