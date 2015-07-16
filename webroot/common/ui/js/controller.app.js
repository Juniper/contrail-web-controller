/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc;

require.config({
    baseUrl: '/',
    paths: {
        'controller-basedir': "./",
        'controller-constants': 'common/ui/js/controller.constants',

        'controller-grid-config': 'common/ui/js/controller.grid.config',
        'nm-grid-config': 'monitor/networking/ui/js/nm.grid.config',

        'controller-graph-config': 'common/ui/js/controller.graph.config',
        'nm-graph-config': 'monitor/networking/ui/js/nm.graph.config',

        'controller-labels': 'common/ui/js/controller.labels',

        'controller-utils': 'common/ui/js/controller.utils',
        'nm-utils': 'monitor/networking/ui/js/nm.utils',

        'controller-messages': 'common/ui/js/controller.messages',

        'controller-parsers': 'common/ui/js/controller.parsers',
        'nm-parsers': 'monitor/networking/ui/js/nm.parsers',

        'controller-view-config': 'common/ui/js/controller.view.config',
        'nm-view-config': 'monitor/networking/ui/js/nm.view.config',

        'controller-init': 'common/ui/js/controller.init'
    },
    waitSeconds: 0
})