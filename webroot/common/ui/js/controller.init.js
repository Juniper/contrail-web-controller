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
    'controller-parsers',
    'controller-cache'
], function (_, Constants, GridConfig, GraphConfig, Labels, Utils, Messages, Parsers, Cache) {
    ctwc = new Constants();
    ctwl = new Labels();
    ctwu = new Utils;
    ctwm = new Messages();
    ctwgc = new GridConfig();
    ctwgrc = new GraphConfig();
    ctwp = new Parsers();
    ctwch = new Cache();
    ctwch.init();
});