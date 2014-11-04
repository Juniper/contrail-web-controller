/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var analyticsdbapi = module.exports,
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = process.mainModule.exports["config"],
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api');

analyticsdbapi.getDBUsage = function (req, res, appData) {
    var url = '/analytics/uves/database/*';
    opApiServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error) {
            var resultsArray = resultJSON['value'],
                responseJSON = [];

            for(var i = 0; resultsArray != null && i < resultsArray.length; i++) {
                var analyticsDBStats = {},
                    dbUsageInfo = resultsArray[i]['value']['DatabaseUsageInfo'],
                    key;

                analyticsDBStats['name'] = resultsArray[i]['name'];

                if(dbUsageInfo != null) {
                   for(key in dbUsageInfo) {
                       analyticsDBStats[key] = dbUsageInfo[key];
                   }
                }

                responseJSON.push(analyticsDBStats);
            }
            commonUtils.handleJSONResponse(null, res, responseJSON);
        } else {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
}

analyticsdbapi.purgeDB = function (req, res, appData) {
    var url = '/analytics/operation/database-purge',
        purgeInputStr = req.param('purge_input'),
        purgeInput, postData;

    try {
        purgeInput = parseInt(purgeInputStr);
        postData = {
            purge_input: purgeInput
        };

        opApiServer.apiPost(url, postData, appData, function (error, responseJSON) {
            if(!error) {
                commonUtils.handleJSONResponse(null, res, responseJSON);
            } else {
                logutils.logger.error(error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
    } catch (error) {
        logutils.logger.error(error.stack);
        commonUtils.handleJSONResponse({"status": "error", "message": "Invalid input for purge."}, res, null);
    }
}
