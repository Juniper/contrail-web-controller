/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * during build time, additional view/model files under monitor infra module will be
 * concatenated to this file. build config is located in the core repo webroot/build/
 */

define([
    'text!controller-basedir/monitor/infrastructure/common/ui/templates/monitor.infra.tmpl',
    'monitor-infra-utils',
    'monitor-infra-constants',
    'monitor-infra-parsers',
    'controller-init'
], function (MonitorInfraTmpls, MonitorInfraUtils, MonitorInfraConstants, MonitorInfraParsers) {
    $("body").append(MonitorInfraTmpls);

    monitorInfraConstants = new MonitorInfraConstants;
    monitorInfraUtils = new MonitorInfraUtils;
    monitorInfraParsers = new MonitorInfraParsers;
});
