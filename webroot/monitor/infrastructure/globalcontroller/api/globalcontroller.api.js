/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] +
                   '/src/serverroot/common/rest.api'),
  async = require('async'),
  logutils = require(process.mainModule.exports["corePath"] +
                     '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  global = require(process.mainModule.exports["corePath"] +
                   '/src/serverroot/common/global'),
  appErrors = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/errors/app.errors'),
  util = require('util'),
  ctrlGlobal = require('../../../../common/api/global'),
  jsonPath = require('JSONPath').eval,
  _ = require('underscore'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api'),
  configApiServer = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/configServer.api'),
  qeUtils = require(process.mainModule.exports["corePath"] +
                    "/webroot/reports/qe/api/query.utils");

function getGlobalControllerOverview (req, res, appData)
{
    var dataObjArr = [];
    var reqUrl = "/analytics/uves/vrouters";
    var resultJSON = {};
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/control-nodes";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/analytics-node";
    var anaPostData = {};
    anaPostData["cfilt"] = ["CollectorState:self_ip_list", "ContrailConfig"];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             anaPostData, opApiServer, null, appData);
    reqUrl = "/analytics/uves/config-nodes";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/database-nodes";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/virtual-machines";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/virtual-machine-interfaces";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/analytics/uves/service-instances";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    reqUrl = "/floating-ips";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, configApiServer, null,
                             appData);
    reqUrl = "/analytics/alarms";
    commonUtils.createReqObj(dataObjArr, reqUrl, null, null, opApiServer, null,
                             appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        var vrNodes = commonUtils.getValueByJsonPath(results, "0", []);
        var controlNodes = commonUtils.getValueByJsonPath(results, "1", []);
        var anaNodes = commonUtils.getValueByJsonPath(results, "2;value", []);
        var configNodes = commonUtils.getValueByJsonPath(results, "3", []);
        var databaseNodes = commonUtils.getValueByJsonPath(results, "4", []);
        var vms = commonUtils.getValueByJsonPath(results, "5", []);
        var vmis = commonUtils.getValueByJsonPath(results, "6", []);
        var svcInsts = commonUtils.getValueByJsonPath(results, "7", []);
        var fips = commonUtils.getValueByJsonPath(results, "8;floating-ips", []);
        var alarms = commonUtils.getValueByJsonPath(results, "9", {});
        resultJSON["vrNodesCnt"] = vrNodes.length;
        resultJSON["controlNodesCnt"] = controlNodes.length;
        resultJSON["anaNodesCnt"] = anaNodes.length;
        resultJSON["configNodesCnt"] = configNodes.length;
        resultJSON["databaseNodesCnt"] = databaseNodes.length;
        resultJSON["vmCnt"] = vms.length;
        resultJSON["vmiCnt"] = vmis.length;
        resultJSON["svcInstsCnt"] = svcInsts.length;
        resultJSON["fipsCnt"] = fips.length;
        var alarmsCnt = 0;
        for (var key in alarms) {
            var alarmTypes = alarms[key];
            var len = alarmTypes.length;
            for (var i = 0; i < len; i++) {
                var alrms = commonUtils.getValueByJsonPath(alarmTypes,
                                                           i + ";value;UVEAlarms;alarms",
                                                           []);
                alarmsCnt += alrms.length;
            }
        }
        resultJSON["alarmsCnt"] = alarmsCnt;
        commonUtils.handleJSONResponse(null, res, resultJSON);
    });
}

exports.getGlobalControllerOverview = getGlobalControllerOverview;

