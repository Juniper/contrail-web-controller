/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctInitComplete = false;

require.config({
    baseUrl: '/',
    paths: {
        'controller-constants': 'common/ui/js/controller.constants',
        'controller-grid-config': 'common/ui/js/controller.grid.config',
        'controller-graph-config': 'common/ui/js/controller.graph.config',
        'controller-labels': 'common/ui/js/controller.labels',
        'controller-utils': 'common/ui/js/controller.utils',
        'controller-messages': 'common/ui/js/controller.messages',
        'controller-parsers': 'common/ui/js/controller.parsers',
        'controller-init': 'common/ui/js/controller.init'
    },
    waitSeconds: 0
})
