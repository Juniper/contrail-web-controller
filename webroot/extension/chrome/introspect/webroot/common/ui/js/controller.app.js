/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var ctwu, ctwc, cowch, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc, ctBuildDir, ctWebDir,
    monitorInfraConstants, monitorInfraUtils, monitorInfraParsers,
    mnPageLoader,controllerQEPageLoader;

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

    var bundles = {};
    require.config({
        baseUrl: "./",//ctBaseDir,
        bundles: bundles,
        paths: getControllerAppPaths(ctBaseDir, ctBuildDir),
        waitSeconds: 0
    });
    require(['controller-init'], function () {});
}

function getControllerAppPaths (ctBaseDir, ctBuildDir,env) {
    ctWebDir = ctBaseDir + ctBuildDir;
    if(env == null)
        env = globalObj['env'];
    if(env == "dev") {
        return {
            'controller-srcdir': ctBaseDir,
            'controller-basedir': ctWebDir,
            'controller-constants': ctWebDir + '/common/ui/js/controller.constants',
            'controller-labels': ctWebDir + '/common/ui/js/controller.labels',
            'controller-utils': ctWebDir + '/common/ui/js/controller.utils',
            'controller-messages': ctWebDir + '/common/ui/js/controller.messages',
            'controller-init': ctWebDir + '/common/ui/js/controller.init',

            //TODO: Only commons controller level definations should be created in this file.
            /**
            * following files should be accessed like the following from where they're referenced.
            * for eg: SearchFlowFormModel, use following in require call instead of path id:
            * 'controller-basedir/monitor/infrastructure/underlay/ui/js/models/SearchFlowFormModel'
            */
            'controller-init': ctWebDir + '/common/ui/js/controller.init',
        }
    } else if(env == "prod") {
        return {
            'controller-srcdir': ctBaseDir,
            'controller-basedir': ctWebDir,

            //Need to list paths that are not part of bundles
            'searchflow-model': ctWebDir + '/monitor/infrastructure/underlay/ui/js/models/SearchFlowFormModel',
            'traceflow-model': ctWebDir + '/monitor/infrastructure/underlay/ui/js/models/TraceFlowTabModel',

            'controller-init': ctWebDir + '/common/ui/js/controller.init',
            'controller-dashboard-libs': ctWebDir + '/monitor/infrastructure/common/ui/js/monitor.infra.module'
        }
    }
};

if (typeof exports !== 'undefined' && module.exports) {
    exports = module.exports;
    exports.getControllerAppPaths = getControllerAppPaths;
}
