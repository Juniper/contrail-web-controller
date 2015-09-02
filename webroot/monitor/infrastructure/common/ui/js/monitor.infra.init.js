/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'monitor/infrastructure/common/ui/js/utils/monitor.infra.utils',
    'monitor/infrastructure/common/ui/js/utils/monitor.infra.constants',
    'monitor/infrastructure/common/ui/js/utils/monitor.infra.parsers'
], function (_, MonitorInfraUtils, MonitorInfraConstants, MonitorInfraParsers) {
    monitorInfraUtils = new MonitorInfraUtils;
    monitorInfraConstants = new MonitorInfraConstants;
    monitorInfraParsers = new MonitorInfraParsers;

    var initJSpath = pkgBaseDir +
        '/monitor/infrastructure/common/ui/js/monitor.infra.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve()
    }
});
