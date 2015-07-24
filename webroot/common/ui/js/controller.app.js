/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc, ctbdcb;

require.config({
    baseUrl: ctBaseDir,
    paths: {
        'controller-basedir': ctBaseDir,
        'controller-constants': ctBaseDir + '/common/ui/js/controller.constants',

        'controller-grid-config': ctBaseDir + '/common/ui/js/controller.grid.config',
        'nm-grid-config': ctBaseDir + '/monitor/networking/ui/js/nm.grid.config',

        'controller-graph-config': ctBaseDir + '/common/ui/js/controller.graph.config',
        'nm-graph-config': ctBaseDir + '/monitor/networking/ui/js/nm.graph.config',

        'controller-labels': ctBaseDir + '/common/ui/js/controller.labels',

        'controller-utils': ctBaseDir + '/common/ui/js/controller.utils',
        'nm-utils': ctBaseDir + '/monitor/networking/ui/js/nm.utils',

        'controller-messages': ctBaseDir + '/common/ui/js/controller.messages',

        'controller-parsers': ctBaseDir + '/common/ui/js/controller.parsers',
        'nm-parsers': ctBaseDir + '/monitor/networking/ui/js/nm.parsers',

        'controller-view-config': ctBaseDir + '/common/ui/js/controller.view.config',
        'nm-view-config': ctBaseDir + '/monitor/networking/ui/js/nm.view.config',

        'controller-init': ctBaseDir + '/common/ui/js/controller.init',
        'config-breadcrumb-view': ctBaseDir 
		                        + '/common/ui/js/views/ControllerBreadcrumbView'
    },
    waitSeconds: 0
});