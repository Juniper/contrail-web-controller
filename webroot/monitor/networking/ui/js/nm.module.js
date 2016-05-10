/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * during build time, all the view/model files under network monitoring module will be
 * concatenated to this file. build config is located in the core repo webroot/build/
 */
define([
    'controller-basedir/monitor/networking/ui/js/nm.utils',
    'controller-basedir/monitor/networking/ui/js/nm.grid.config',
    'controller-basedir/monitor/networking/ui/js/nm.graph.config',
    'controller-basedir/monitor/networking/ui/js/nm.parsers',
    'controller-basedir/monitor/networking/ui/js/nm.view.config',
    'text!monitor/networking/ui/templates/networking.tmpl',
    'controller-basedir/monitor/networking/ui/js/MNPageLoader'
], function (NMUtils, NMGridConfig, NMGraphConfig, NMParsers, NMViewConfig, NMTemplates, MNPageLoader) {
    nmwu = new NMUtils;
    nmwgc = new NMGridConfig();
    nmwgrc = new NMGraphConfig();
    nmwp = new NMParsers();
    nmwvc = new NMViewConfig();
    mnPageLoader = new MNPageLoader();
    $("body").append(NMTemplates);
});
