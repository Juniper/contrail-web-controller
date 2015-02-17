/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils'),
  global = require(process.mainModule.exports["corePath"] +
                   '/src/serverroot/common/global'),
  ctrlGlobal = require('../../../../common/api/global'),
  jobsUtils = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/common/jobs.utils'),
  underlayCmn = require('../../../../common/api/underlay_overlay.cmn.api'),
  queries = require(process.mainModule.exports["corePath"] +
                    '/src/serverroot/common/queries.api');

function processUnderlayTopology (pubChannel, saveChannelKey, jobData, done)
{
    var prouter = jobData['taskData']['prouter'];
    underlayCmn.buildTopology(prouter, jobData, function(err, topology) {
        if ((null != err) || (null == topology)) {
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                        global.HTTP_STATUS_INTERNAL_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR, 0,
                                        0, done, jobData);
            return;
        }
        var dataObj = jobsUtils.fillJobResponseData(jobData, topology);
        /* Will delete the below assignemnet once UI does the new structure
         * changes
         */
        dataObj = topology;
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    JSON.stringify(dataObj),
                                    JSON.stringify(dataObj), 1, 0,
                                    done, jobData);
    });
}

exports.processUnderlayTopology = processUnderlayTopology;

