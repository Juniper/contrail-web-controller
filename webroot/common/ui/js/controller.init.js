/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'controller-constants',
    'controller-grid-config',
    'controller-graph-config',
    'controller-labels',
    'controller-utils',
    'controller-messages',
    'controller-parsers'
], function (_, Constants, GridConfig, GraphConfig, Labels, Utils, Messages, Parsers) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwm = new Messages();
    ctwgc = new GridConfig();
    ctwgrc = new GraphConfig();
    ctwp = new Parsers();
    ctwu = new Utils;
    ctInitComplete = true;
});