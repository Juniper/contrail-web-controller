/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
  async = require('async'),
  logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  config = require(process.mainModule.exports["corePath"] + '/config/config.global.js'),
  global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
  appErrors = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/errors/app.errors'),
  util = require('util'),
  ctrlGlobal = require('../../../../common/api/global'),
  jsonPath = require('JSONPath').eval,
  _ = require('underscore'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api');

function getPRouterChassisInfo(req, res, appData) {
    var url = '/analytics/uves/prouters';
    opServer.api.get(url,function (error, uveData) {
        if(null != error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        if(null != uveData && uveData.length != 0) {
            var dataObjArr = [], uveDataLen = uveData.length;
            for (var i = 0; i < uveDataLen; i++) {
                if (uveData[i]['name'] != null) {
                    var reqUrl = '/analytics/uves/prouter/' + uveData[i]['name'] + '?flat';
                    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
                }
            }
            async.map(dataObjArr,
                commonUtils.getServerResponseByRestApi(opApiServer, true),
                function(err, data) {
                    if (err) {
                        commonUtils.handleJSONResponse(err, res, null);
                    } else {
                        var resultJSON = {PRouterChassisUVEs: []};
                        for (var i = 0; i < data.length; i++) {
                            resultJSON['PRouterChassisUVEs'].push(data[i]);
                        }
                        commonUtils.handleJSONResponse(null, res, resultJSON);
                    }
                });
        } else {
            logutils.logger.debug("Empty PRouters list in API response.");
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
    });
}

exports.getPRouterChassisInfo = getPRouterChassisInfo;