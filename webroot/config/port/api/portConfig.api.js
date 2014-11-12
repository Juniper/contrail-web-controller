/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var nwMgr = require(process.mainModule.exports["corePath"] +
                    '/src/serverroot/common/networkmanager.api');
var computeApi = require(process.mainModule.exports["corePath"] +
                         '/src/serverroot/common/computemanager.api');
var appErrors   = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/errors/app.errors');
function createPort (req, res, appData)
{
    var body = req.body;
    var vnUUID = body['vnUUID'];
    var fixedIP = body['fixedIPs'];
    var macAddress = body['macAddress'];
    var postData = {};
    postData['port'] = {};
    postData['port']['admin_state_up'] = true;
    if (null != macAddress) {
        postData['port']['mac_address'] = macAddress;
    }
    if ((null != fixedIP) && (fixedIP instanceof Array)) {
        postData['port']['fixed_ips'] = [];
        var fixedIPLen = fixedIP.length;
        for (var i = 0; i < fixedIPLen; i++) {
            postData['port']['fixed_ips'].push({'ip_address': fixedIP[i]});
        }
    }
    /* Now get the network ID */
    var vnURL = '/virtual-network/' + vnUUID;
    configApiServer.apiGet(vnURL, appData, function(err, vnData) {
        if ((null != err) || (null == vnData)) {
            var errStr = 'VN UUID not found';
            error = new appErrors.RESTServerError(errStr);
            commonUtils.handleJSONResponse(error, res, errStr);
            return;
        }
        postData['port']['network_id'] = vnUUID;
        var project = vnData['virtual-network']['fq_name'][1];
        nwMgr.createNetworkPort(req, postData, project, function(err, results) {
            if ((null != err) || (null == results)) {
                commonUtils.handleJSONResponse(err, res, null);
                return;
            }
            var vmiID = results['port']['id'];
            var vmiURL = '/virtual-machine-interface/' + vmiID;
            configApiServer.apiGet(vmiURL, appData, function(err, vmiData) {
                commonUtils.handleJSONResponse(err, res, vmiData);
            });
        });
    });
}

function deletePort (req, res, appData)
{
    var portId = req.param('portid');
    nwMgr.deleteNetworkPort(req, portId, function(err, results) {
        commonUtils.handleJSONResponse(err, res, results);
    });
}

function portAttach (req, res, appData)
{
    computeApi.portAttach(req, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

function portDetach (req, res, appData)
{
    computeApi.portDetach(req, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

exports.createPort = createPort;
exports.deletePort = deletePort;
exports.portAttach = portAttach;
exports.portDetach = portDetach;

