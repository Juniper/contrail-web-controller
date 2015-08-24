/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'monitor/networking/ui/js/nm.utils',
    'monitor/networking/ui/js/nm.grid.config',
    'monitor/networking/ui/js/nm.graph.config',
    'monitor/networking/ui/js/nm.parsers',
    'monitor/networking/ui/js/nm.view.config',
    'text!monitor/networking/ui/templates/networking.tmpl',
    'monitor/networking/ui/js/networking.main'
], function (_, NMUtils, NMGridConfig, NMGraphConfig, NMParsers, NMViewConfig, NMTemplates) {
    nmwu = new NMUtils;
    nmwgc = new NMGridConfig();
    nmwgrc = new NMGraphConfig();
    nmwp = new NMParsers();
    nmwvc = new NMViewConfig();
    $("body").append(NMTemplates);

    var initJSpath = pkgBaseDir + '/monitor/networking/ui/js/nm.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
