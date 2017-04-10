/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */


var jobsApi = require(process.mainModule.exports["corePath"]  +
                      "/src/serverroot/jobs/core/jobs.api"),
    configUtils = require(process.mainModule.exports["corePath"] +
                      "/src/serverroot/common/config.utils"),
    global = require(process.mainModule.exports["corePath"]  +
                     "/src/serverroot/common/global");


function createVRouterSummaryJob ()
{
    var appData = {};
    appData['addGen'] = true;
    var jobObj = {};
    var url = '/virtual-routers';
    jobObj['jobName'] = global.STR_GET_VROUTERS_SUMMARY;
    jobObj['url'] = url;
    jobObj['firstRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['runCount'] = 0;
    jobObj['nextRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['orchModel'] = 'openstack';
    jobObj['appData'] = appData;
    jobsApi.createJobAtInit(jobObj);
}

function createVRouterGeneratorsJob ()
{
    var url = '/virtual-routers';
    var jobObj = {};
    jobObj['jobName'] = global.STR_GET_VROUTERS_GENERATORS;
    jobObj['url'] = url;
    jobObj['firstRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['runCount'] = 0;
    jobObj['nextRunDelay'] = global.VROUTER_GENR_JOB_REFRESH_TIME;
    jobObj['orchModel'] = 'openstack';
    jobsApi.createJobAtInit(jobObj);
}

function featureInit()
{
    var config = configUtils.getConfig();
    if (true != config.serviceEndPointFromConfig) {
        return;
    }
    createVRouterSummaryJob();
    createVRouterGeneratorsJob();
}

exports.featureInit = featureInit;
