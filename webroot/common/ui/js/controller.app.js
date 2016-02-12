/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc, ctBuildDir, ctWebDir;

/**
 * ctBaseDir: Apps Root directory.
 * ctWebDir: Root directory from the contents will be served. Either built or source depending on env.
 *
 * controller-srcdir: Require path id pointing to root directory for the source files which are delivered.
 * in a 'prod' env to use the file in source form (i.e not minified version), use path with prefix 'core-srcdir'
 * eg: use 'controller-srcdir/monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView' as path
 * to access VRouterDashboardView source instead of minified js file.
 */
if (typeof ctBaseDir !== 'undefined') {
    ctBuildDir = '';
    ctWebDir = ctBaseDir; // will initialize the webDir with baseDir
    if ((typeof globalObj !== 'undefined') && globalObj.hasOwnProperty('buildBaseDir')) {
        ctBuildDir = globalObj['buildBaseDir'];
    }

    require.config({
        baseUrl: ctBaseDir,
        paths: getControllerAppPaths(ctBaseDir, ctBuildDir),
        waitSeconds: 0
    });

    require(['controller-init'], function () {});
}

function getControllerAppPaths (ctBaseDir, ctBuildDir) {
    ctWebDir = ctBaseDir + ctBuildDir;
    return {
        'controller-srcdir': ctBaseDir,
        'controller-basedir': ctWebDir,
        'controller-constants': ctWebDir + '/common/ui/js/controller.constants',
        'controller-grid-config': ctWebDir + '/common/ui/js/controller.grid.config',
        'controller-graph-config': ctWebDir + '/common/ui/js/controller.graph.config',
        'controller-labels': ctWebDir + '/common/ui/js/controller.labels',
        'controller-utils': ctWebDir + '/common/ui/js/controller.utils',
        'controller-messages': ctWebDir + '/common/ui/js/controller.messages',
        'controller-parsers': ctWebDir + '/common/ui/js/controller.parsers',
        'controller-view-config': ctWebDir + '/common/ui/js/controller.view.config',
        'controller-init': ctWebDir + '/common/ui/js/controller.init',

        //TODO: Only commons controller level definations should be created in this file.
        /**
         * following files should be accessed like the following from where they're referenced.
         * for eg: SearchFlowFormModel, use following in require call instead of path id:
         * 'controller-basedir/monitor/infrastructure/underlay/ui/js/models/SearchFlowFormModel'
         */
        'searchflow-model': ctWebDir + '/monitor/infrastructure/underlay/ui/js/models/SearchFlowFormModel',
        'traceflow-model': ctWebDir + '/monitor/infrastructure/underlay/ui/js/models/TraceFlowTabModel',
        'underlay-graph-model' : ctWebDir + '/monitor/infrastructure/underlay/ui/js/models/UnderlayGraphModel',
        'monitor-infra-confignode-model' : ctWebDir + '/monitor/infrastructure/common/ui/js/models/ConfigNodeListModel',
        'monitor-infra-analyticsnode-model' : ctWebDir + '/monitor/infrastructure/common/ui/js/models/AnalyticsNodeListModel',
        'monitor-infra-databasenode-model' : ctWebDir + '/monitor/infrastructure/common/ui/js/models/DatabaseNodeListModel',
        'monitor-infra-controlnode-model' : ctWebDir + '/monitor/infrastructure/common/ui/js/models/ControlNodeListModel',
        'monitor-infra-vrouter-model' : ctWebDir + '/monitor/infrastructure/common/ui/js/models/VRouterListModel',
        'monitor-infra-utils' : ctWebDir + '/monitor/infrastructure/common/ui/js/utils/monitor.infra.utils',
        'confignode-scatterchart-view': ctWebDir + '/monitor/infrastructure/common/ui/js/views/ConfigNodeScatterChartView',
        'controlnode-scatterchart-view': ctWebDir + '/monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
        'dbnode-scatterchart-view': ctWebDir + '/monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
        'analyticsnode-scatterchart-view': ctWebDir + '/monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
        'vrouter-dashboard-view': ctWebDir + '/monitor/infrastructure/dashboard/ui/js/views/VRouterDashboardView',
        'monitor-infra-parsers': ctWebDir + '/monitor/infrastructure/common/ui/js/utils/monitor.infra.parsers',
        'monitor-infra-utils': ctWebDir + '/monitor/infrastructure/common/ui/js/utils/monitor.infra.utils',
        'monitor-infra-constants': ctWebDir + '/monitor/infrastructure/common/ui/js/utils/monitor.infra.constants',
        'mon-infra-controller-dashboard': ctWebDir + '/monitor/infrastructure/dashboard/ui/js/views/ControllerDashboardView'
    }
};

if (typeof exports !== 'undefined' && module.exports) {
    exports = module.exports;
    exports.getControllerAppPaths = getControllerAppPaths;
}