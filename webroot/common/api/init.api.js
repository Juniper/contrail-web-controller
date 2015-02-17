/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jobsApi = require(process.mainModule.exports["corePath"]
                      +'/src/serverroot/jobs/core/jobs.api'),
    ctrlGlobal = require('./global'),
    config = process.mainModule.exports.config,
    initApi = module.exports;

function createUnderlayTopologyJob ()
{
    var disabledFeatureList = [];
    if ((null != config.features) &&
        (null != config.features.disabled)) {
        disabledFeatureList = config.features.disabled;
    }
    if (-1 != disabledFeatureList.indexOf('mon_infra_underlay')) {
        return;
    }

    var appData = {};
    var jobObj = {};
    var url = '/analytics/uves/prouter';
    jobObj['jobName'] = ctrlGlobal.STR_GET_UNDERLAY_TOPOLOGY;
    jobObj['url'] = url;
    jobObj['firstRunDelay'] = 2 * 60 * 1000;
    jobObj['runCount'] = 0;
    jobObj['orchModel'] = 'openstack';
    jobObj['nextRunDelay'] = ctrlGlobal.UNDERLAY_TOPO_JOB_REFRESH_TIME;
    jobObj['appData'] = appData;
    jobsApi.createJobAtInit(jobObj);

}

function featureInit()
{
    createUnderlayTopologyJob();
}

exports.featureInit = featureInit;

