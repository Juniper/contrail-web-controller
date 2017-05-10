/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
/**
 * @virtualdnsrecordsconfig.api.js
 *     - Handlers for Virtual DNS Configuration
 *     - Interfaces with config api server
 */
var rest = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/rest.api');
var async = require('async');
var vnconfigapi = module.exports;
var logutils = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/messages');
var global = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/errors/app.errors');
var util = require('util');
var url = require('url');
var UUID = require('uuid-js');
var configApiServer = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/configServer.api');
var opApiServer = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/opServer.api');
var jsonPath = require('JSONPath').eval;
var infraCmn = require('../../../../common/api/infra.common.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/jsondiff');

/**
 * Bail out if called directly as "nodejs virtualdnsconfig.api.js"
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

function getVdnsAsync(vdnsObj, callback) {
    var vdnsId = vdnsObj['uuid'];
    var appData = vdnsObj['appData'];

    var reqUrl = '/virtual-DNS/' + vdnsId;

    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        callback(null, data);
    });
}

/**
 * @setVirtualDNSRead
 * private function
 * 1. Callback for Virtual DNS create / update operations
 * 2. Reads the response of Virtual DNS get from config api server
 *    and sends it back to the client.
 */
function setVirtualDNSRead(error, vdnsConfig, response, appData) {
    var vdnsGetURL = '/virtual-DNS/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsGetURL += vdnsConfig['virtual-DNS']['uuid'];

    configApiServer.apiGet(vdnsGetURL, appData,
        function(error, data) {
            virtualDNSSendResponse(error, data, response);
        });
}

/**
 * @virtualDNSSendResponse
 * private function
 * 1. Sends back the response of virtual dns read to clients after set operations.
 */
function virtualDNSSendResponse(error, vdnsConfig, response) {
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
    } else {
        commonUtils.handleJSONResponse(error, response, vdnsConfig);
    }
    return;
}

/**
 * @VDNSRecordAggCb
 * private function
 * 1. Callback for the Virtual DNS Record get for a give Virtual DNS.
 */
function VDNSRecordAggCb(error, results, vdnsConfig, callback) {
    var i = 0,
        vdnsRecordsLen = 0;

    if (error) {
        callback(error, null);
        return;
    }

    vdnsRecordsLen = results.length;
    for (i = 0; i < vdnsRecordsLen; i++) {
        vdnsConfig['virtual-DNS']['virtual_DNS_records'][i][
                'virtual_DNS_record_data'
            ] =
            results[i]['virtual-DNS-record']['virtual_DNS_record_data'];
    }

    callback(error, vdnsConfig);
}

/**
 * @updateVDNSRecordAdd
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-records
 * 2. Adds a virtual DNS record to virtual DNS
 * 3. Reads back the updated virtual DNS config and send it
 *    back to the client
 */
function updateVDNSRecordAdd(request, response, appData) {
    var vdnsRecordPostURL = '/virtual-DNS-records';
    var vdnsRecordPostData = request.body;
    var vdnsRecordCreateData = {};
    var requestParams = url.parse(request.url, true);

    if (!request.param('id').toString()) {
        error = new appErrors.RESTServerError('Virtual DNS Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('virtual_DNS_records' in vdnsRecordPostData['virtual-DNS'])) ||
        (!vdnsRecordPostData['virtual-DNS']
            ['virtual_DNS_records'][0]['to'].length)) {
        error = new appErrors.RESTServerError('Virtual DNS name ' +
            'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (typeof vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['to']
        [2] === "undefined") {
        uuid = UUID.create();
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['to'][2] =
            uuid['hex'];
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['name'] =
            uuid['hex'];
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['uuid'] =
            uuid['hex'];
    }

    vdnsRecordCreateData = {
        "virtual-DNS-record": {
            "_type": "virtual-DNS-record",
            "fq_name": vdnsRecordPostData['virtual-DNS'][
                'virtual_DNS_records'
            ][0].to,
            "name": vdnsRecordPostData['virtual-DNS']['virtual_DNS_records']
                [0]['name'],
            "uuid": vdnsRecordPostData['virtual-DNS']['virtual_DNS_records']
                [0]['uuid'],
            "parent_type": "virtual-DNS",
            "virtual_DNS_record_data": vdnsRecordPostData['virtual-DNS'][
                'virtual_DNS_records'
            ][0]['virtual_DNS_record_data']
        }
    };

    configApiServer.apiPost(vdnsRecordPostURL, vdnsRecordCreateData, appData,
        function(error, data) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            commonUtils.handleJSONResponse(error, response, data);
        });
}

/**
 * @updateVDNSRecordUpdate
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-record/:recordid
 * 2. Updates a virtual DNS record
 * 3. Reads back the updated virtual DNS config and send it
 *    back to the client
 */
function updateVDNSRecordUpdate(request, response, appData) {
    var dnsRecURL = '/virtual-DNS-record/';
    var vdnsRecPutData = request.body;
    var requestParams = url.parse(request.url, true), perms2;

    if (!(virtualDNSId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual DNS Id ' +
            'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(vdnsRecordId = request.param('recordid').toString())) {
        error = new appErrors.RESTServerError('DNS Record Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    try {
        var vdnsRecData =
            vdnsRecPutData['virtual-DNS']['virtual_DNS_records'][0][
                'virtual_DNS_record_data'
            ];
        perms2 =
            vdnsRecPutData['virtual-DNS']['virtual_DNS_records'][0][
                'perms2'
            ];
    } catch (e) {
        error = new appErrors.RESTServerError('DNS Record not found');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    dnsRecURL += vdnsRecordId;
    configApiServer.apiGet(dnsRecURL, appData, function(err, configData) {
        if ((null != err) || (null == configData)) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        var oldConfigData = commonUtils.cloneObj(configData);
        configData['virtual-DNS-record']['virtual_DNS_record_data'] =
            vdnsRecData;
        configData['virtual-DNS-record']['perms2'] =
            perms2;
        var delta =
            jsonDiff.getConfigJSONDiff('virtual-DNS-record',
                oldConfigData,
                configData);
        configApiServer.apiPut(dnsRecURL, delta, appData,
            function(err, data) {
                if (err) {
                    commonUtils.handleJSONResponse(err, response,
                        null);
                } else {
                    commonUtils.handleJSONResponse(err, response,
                        data);
                }
            });
    });
}

/**
 * @updateVDNSRecordDelete
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-record/:recordid
 * 2. Deletes the record from Virtual DNS
 * 3. Reads updated config and sends it back to client
 */
function updateVDNSRecordDelete(request, response, appData) {
    var vdnsRecordURL = '/virtual-DNS-record';
    var virtualDNSId = null;
    var vdnsRecordId = null;
    var requestParams = url.parse(request.url, true);

    if (!(virtualDNSId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual DNS Id ' +
            'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(vdnsRecordId = request.param('recordid').toString())) {
        error = new appErrors.RESTServerError('DNS Record Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsRecordURL += "/" + vdnsRecordId;
    configApiServer.apiDelete(vdnsRecordURL, appData,
        function(error, data) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                commonUtils.handleJSONResponse(error, response, data);
            }
        });
}

function sortDnsGenDataByConnectTime(genRec1, genRec2) {
    var conTime1 = jsonPath(genRec1, "$..connect_time");
    var conTime2 = jsonPath(genRec2, "$..connect_time");

    var resetTime1 = jsonPath(genRec1, "$..reset_time");
    var resetTime2 = jsonPath(genRec2, "$..reset_time");
    var connTime = (conTime1[0] > conTime2[0]) ? conTime1[0] : conTime2[0];
    var resetTime = (resetTime1[0] > resetTime2[0]) ? resetTime1[0] :
        resetTime2[0];

    return (connTime - resetTime);
}

function getDNSNodeByGeneratorsData(dnsNodes, dnsGen) {
    try {
        var dnsGen = dnsGen['value'];
        var dnsNodes = dnsNodes['value'];
        var dnsGenCnt = dnsGen.length;
        dnsGen.sort(sortDnsGenDataByConnectTime);
        /* We got sorted list, so use the first one */
        var dnsNodesCnt = dnsNodes.length;
    } catch (e) {
        return null;
    }
    var modType = infraCmn.getModuleType('contrail-dns');
    for (var i = 0; i < dnsNodesCnt; i++) {
        try {
            var dnsAgent = dnsNodes[i]['name'] + ':' + modType +
                ':contrail-dns';
            if (-1 != dnsGen[0]['name'].indexOf(dnsAgent)) {
                break;
            }
        } catch (e) {
            logutils.logger.error("In getDNSNodeByGeneratorsData(): " +
                "JSON Parse error:" + e);
            continue;
        }
    }
    if (i == dnsNodesCnt) {
        return null;
    }
    return dnsNodes[i];
}

/**
 * VDNSRecordsAggByConfig
 * private function
 * 1. Callback for readVirtualDNSRecords, sends virtual DNS recordss
 *    specified in result to client.
 */
function VDNSRecordsAggByConfig(err, result, vdnsConfig, callback) {
    var uuid = null;
    if (null != err) {
        callback(err, result);
        return;
    }
    var err = new appErrors.RESTServerError('VDNS Record not found in Config');
    var vdnsRecSetObjs = {};
    try {
        var vdnsRecs = vdnsConfig['virtual-DNS']['virtual_DNS_records'];
        var vdnsRecsLen = vdnsRecs.length;
    } catch (e) {
        callback(err, null);
        return;
    }
    for (var i = 0; i < vdnsRecsLen; i++) {
        uuid = vdnsRecs[i]['uuid'];
        vdnsRecSetObjs[uuid] = vdnsRecs[i];
    }

    var tempConf = commonUtils.cloneObj(vdnsRecs);
    var resLen = result.length;
    vdnsConfig['virtual-DNS']['virtual_DNS_records'] = [];
    for (i = 0, j = 0; i < resLen; i++) {
        try {
            uuid = result[i]['virtual-DNS-record']['uuid'];
            if (vdnsRecSetObjs[uuid]) {
                vdnsConfig['virtual-DNS']['virtual_DNS_records'][j] = {};
                vdnsConfig['virtual-DNS']['virtual_DNS_records'][j] =
                    vdnsRecSetObjs[uuid];
                vdnsConfig['virtual-DNS']['virtual_DNS_records'][j][
                    'virtual_DNS_record_data'
                ] = result[i]['virtual-DNS-record'][
                    'virtual_DNS_record_data'
                ];
                j++;
            }
        } catch (e) {
            continue;
        }
    }
    callback(null, vdnsConfig);
}

function readVirtualDNSRecords(vdnRecordsObj, callback) {
    var dataObjArr = [];
    var reqDataArr = vdnRecordsObj['reqDataArr'];
    var configData = vdnRecordsObj['configData'];
    var dataObjArr = vdnRecordsObj['dataObjArr'];
    var vdnsRecData = [];

    async.map(dataObjArr,
        commonUtils.getServerResponseByRestApi(configApiServer, true),
        function(err, result) {
            if ((null != err) || (null == result)) {
                callback(err, result);
                return;
            }
            VDNSRecordsAggByConfig(err, result, configData, function(err,
                data) {
                if ((null != err) || (null == data)) {
                    callback(err, null);
                    return;
                }
                var vdnsRec = data['virtual-DNS'][
                    'virtual_DNS_records'
                ];
                cnt = vdnsRec.length;
                for (i = 0; i < cnt; i++) {
                    if (null != vdnsRec[i][
                            'virtual_DNS_record_data'
                        ]) {
                        vdnsRecData.push(vdnsRec[i]);
                    }
                }
                data['virtual-DNS']['virtual_DNS_records'] = [];
                data['virtual-DNS']['virtual_DNS_records'] =
                    vdnsRecData;
                callback(err, data);
            });
        });
}

function listVirtualDNSs(req, res, appData) {
    var dnsUrl = '/virtual-DNSs';
    configApiServer.apiGet(dnsUrl, appData, function(err, data) {
        if ((null != err) || (null == data)) {
            commonUtils.handleJSONResponse(err, res, data);
            return;
        }
        var vdnsList = commonUtils.getValueByJsonPath(data,
            'virtual-DNSs', []);
        commonUtils.handleJSONResponse(null, res, vdnsList);
    });
}

exports.updateVDNSRecordAdd = updateVDNSRecordAdd;
exports.updateVDNSRecordUpdate = updateVDNSRecordUpdate;
exports.updateVDNSRecordDelete = updateVDNSRecordDelete;
exports.readVirtualDNSRecords = readVirtualDNSRecords;
exports.listVirtualDNSs = listVirtualDNSs;