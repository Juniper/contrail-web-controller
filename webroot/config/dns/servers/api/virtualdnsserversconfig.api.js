/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
/**
 * @virtualdnsserversconfig.api.js
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
var contrailService = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/contrailservice.api');


/**
 * Bail out if called directly as "nodejs virtualdnsconfig.api.js"
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
        module.filename));
    process.exit(1);
}

/**
 * listVirtualDNSsFromAllDomains
 * private function
 * 1. Callback for listVirtualDNSs
 * 2. Reads the response of all Virtual DNS from all domains
 * list from config api server and sends it back to the client.
 */
function listVirtualDNSsFromAllDomains(request, response, appData) {
    //Get Virtuanl DNS Servers from all domains 
    //the user has access to.
    var vdnsURL = '/virtual-DNSs';
    configApiServer.apiGet(vdnsURL, appData,
        function(error, data) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            if (data && data.hasOwnProperty("virtual-DNSs") &&
                data["virtual-DNSs"].length > 0) {
                var vdns = data["virtual-DNSs"];
                var result = {};
                if (vdns.length > 0) {
                    result["virtual_DNSs"] = [];
                }
                for (var i = 0; i < vdns.length; i++) {
                    result["virtual_DNSs"][i] = {};
                    result["virtual_DNSs"][i]["virtual-DNS"] = vdns[i];
                }
                commonUtils.handleJSONResponse(error, response, result);
            } else {
                var result = {
                    "virtual_DNSs": []
                };
                commonUtils.handleJSONResponse(error, response, result);
            }
        }
    );
}

function getVdnsAsync(vdnsObj, callback) {
    var vdnsId = vdnsObj['uuid'];
    var appData = vdnsObj['appData'];

    var reqUrl = '/virtual-DNS/' + vdnsId;

    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        callback(null, data);
    });
}

function readVirtualDNSs(vdnsObj, callback) {
    var dataObjArr = vdnsObj['reqDataArr'];
    async.map(dataObjArr, getVdnsAsync, function(err, data) {
        virtualDNSsListAggCb(err, data, callback);
    });
}

/**
 * virtualDNSsListAggCb
 * private function
 * 1. Callback for the readVirtualDNSs gets, sends all virtual DNSs to client.
 */
function virtualDNSsListAggCb(error, results, callback) {
    if (error) {
        callback(error, null);
        return;
    }
    vdnss = {};
    vdnss["virtual_DNSs"] = results;
    callback(error, vdnss);
}

/**
 * @createDnsSetIpam
 * private function
 * 1. Reads newly created IPAM object and calls updateVirtualDnsAssocIpamRead
 *    to update the DNS ref in IPAM objects.
 */
function createDnsSetIpam(error, vdnsConfig, vdnsPostData,
    response, appData) {
    var dnsId = null;
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    dnsId = vdnsConfig['virtual-DNS']['uuid'];


    updateVirtualDnsAssocIpamRead(error, vdnsConfig, vdnsPostData,
        dnsId, appData,
        function(err, data) {
            setVirtualDNSRead(err, vdnsConfig, response, appData);
        });
}

/**
 * @createVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNSs - Post
 * 2. Sets Post Data and sends back the virtual dns config to client
 */
function createVirtualDNS(request, response, appData) {
    var vdnsCreateURL = '/virtual-DNSs';
    var vdnsPostData = request.body;
    var vdnsIpamRefs = null;

    if (typeof(vdnsPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('virtual-DNS' in vdnsPostData)) ||
        (!('fq_name' in vdnsPostData['virtual-DNS'])) ||
        (!(vdnsPostData['virtual-DNS']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid virtual-DNS');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsIpamRefs = commonUtils.cloneObj(vdnsPostData);
    delete vdnsPostData['virtual-DNS']['network_ipam_back_refs'];

    configApiServer.apiPost(vdnsCreateURL, vdnsPostData, appData,
        function(error, data) {
            createDnsSetIpam(error, data, vdnsIpamRefs,
                response, appData);
        });

}

/**
 * @updateVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNSs - Post
 * 2. Update Virtual DNS and sends back the virtual dns config to client
 */
function updateVirtualDNS(request, response, appData) {
    var vdnsURL = '/virtual-DNS/';
    var vdnsId = null;
    var vdnsPutData = request.body;

    if (vdnsId = request.param('id').toString()) {
        vdnsURL += vdnsId;
    } else {
        error = new appErrors.RESTServerError('Virtual DNS ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (null == vdnsPutData['virtual-DNS']['virtual_DNS_data']) {
        error = new appErrors.RESTServerError('Virtual DNS Data not found');
        return;
    }

    jsonDiff.getJSONDiffByConfigUrl(vdnsURL, appData, vdnsPutData,
        function(err, delta) {
            configApiServer.apiPut(vdnsURL, delta, appData,
                function(err, data) {
                    if (err) {
                        commonUtils.handleJSONResponse(err, response,
                            null);
                        return;
                    }
                    configApiServer.apiGet(vdnsURL, appData, function(
                        err, configData) {
                        updateVirtualDnsAssocIpamRead(err,
                            configData, vdnsPutData,
                            vdnsId, appData,
                            function(err, data) {
                                if (err) {
                                    commonUtils.handleJSONResponse(
                                        err, response,
                                        null);
                                    return;
                                }
                                readVirtualDNS(response,
                                    vdnsId, appData);
                            });
                    });
                });
        });
}

/**
 * @deleteVirtualDNSCb
 * private function
 * 1. Return back the response of virtual dns delete.
 */
function deleteVirtualDNSCb(error, vdnsDelResp, response) {

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, vdnsDelResp);
}

/**
 * @deleteVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id
 * 2. Deletes the virtual DNS from config api server
 */
function deleteVirtualDNS(request, response, appData) {
    var vdnsId = null;
    var requestParams = url.parse(request.url, true);

    if (vdnsId = request.param('id').toString()) {
        var vdnsObj = {
            'uuid': vdnsId,
            appData: appData
        };
    } else {
        error = new appErrors.RESTServerError('Virtual DNS ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    deleteVirtualDNSCallback(vdnsObj, function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
}

function deleteVirtualDNSCallback(vdnsObj, callback) {
    var vdnsId = vdnsObj['uuid'];
    var appData = vdnsObj['appData'];
    var vdnsDelURL = '/virtual-DNS/' + vdnsId;

    configApiServer.apiGet(vdnsDelURL, appData, function(err, configData) {
        /* Now delete the ipam_refs */
        var vdnsPostData = commonUtils.cloneObj(configData);
        delete vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
        updateVirtualDnsAssocIpamRead(err, configData, vdnsPostData,
            vdnsId,
            appData,
            function(err, data) {
                if (err) {
                    callback(null, {error: err, data: data});
                    return;
                }

                /* Now delete the virtual DNS */
                configApiServer.apiDelete(vdnsDelURL, appData,
                    function(error, data) {
                        callback(null, {
                            error: error,
                            data: data
                        });
                    });
            });
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
 * @getVirtualDNSCb
 * private function
 * 1. Callback for readVirtualDNS
 * 2. Reads the response of a particular Virtual DNS from config
 *    api server
 *    - Gets each DNSRecord
 */
function getVirtualDNSCb(error, vdnsGetData, response, appData) {

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    parseVDNSRecords(error, response, vdnsGetData, appData);
}

/**
 * @readVirtualDNS
 * private function
 * 1. Needs VDNS uuid in string format
 */
function readVirtualDNS(response, dnsIdStr, appData) {
    var vdnsGetURL = '/virtual-DNS/';

    if (dnsIdStr.length) {
        vdnsGetURL += dnsIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Virtual DNS id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(vdnsGetURL, appData,
        function(error, data) {
            getVirtualDNSCb(error, data, response, appData);
        });
}

/**
 * @parseVDNSRecords
 * private function
 * 1. Gets the Virtual DNS record list and then does an individual get on
 *    the record for a given virtual DNS
 */
function parseVDNSRecords(error, response, vdnsConfig, appData) {
    var vdnsRecordRef = null;
    var vdnsRecordUrl = null;
    var dataObjArr = [];
    var vdnsObj = null;
    var vdnsRecordRefsLen = 0;

    if ('virtual_DNS_records' in vdnsConfig['virtual-DNS']) {
        vdnsRecordRef = vdnsConfig['virtual-DNS']['virtual_DNS_records'];
        vdnsRecordRefsLen = vdnsRecordRef.length;
    }

    for (i = 0; i < vdnsRecordRefsLen; i++) {
        if (vdnsRecordRef) {
            vdnsObj = vdnsRecordRef[i];
            vdnsRecordUrl = '/virtual-DNS-record/' + vdnsObj['uuid'];
            commonUtils.createReqObj(dataObjArr, vdnsRecordUrl,
                global.HTTP_REQUEST_GET, response[i], null, null,
                appData);

        }
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function(error, results) {
            VDNSRecordAggCb(error, results, vdnsConfig,
                function(error, data) {
                    commonUtils.handleJSONResponse(error, response,
                        data);
                });
        });

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
 * @updateVDNSIpams
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/network-ipams
 * 2. Gets VDNS config and updates network ipam references for it.
 * 3. Reads updated config and sends it back to client
 */
function updateVDNSIpams(request, response, appData) {
    var vdnsURL = '/virtual-DNS/';
    var vdnsId = null;
    var vdnsPostData = request.body;
    var requestParams = url.parse(request.url, true);

    if (!(vdnsId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add DNS name');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsURL += vdnsId;
    configApiServer.apiGet(vdnsURL, appData,
        function(error, data) {
            updateVirtualDnsAssocIpamRead(error, data, vdnsPostData,
                vdnsId, appData,
                function(err, data) {
                    setVirtualDNSRead(err, data, response, appData);
                });
        });
}

/**
 * @updateVirtualDnsAssocIpamRead
 * private function
 */
function updateVirtualDnsAssocIpamRead(error, vdnsConfig, vdnsPostData,
    vdnsId, appData, callback) {
    var reqUrl = null;
    var ipamRef = [];
    var ipamURL = [];
    var ipamRefLen = 0,
        i = 0;
    var ipamUIRef = [];
    var ipamUIRefLen = 0;
    var dataObjArr = [];
    var curCfgAllDel = false;

    if (error) {
        callback(error, null);
        return;
    }

    vdnsConfig['virtual-DNS']['ipams'] = [];

    try {
        if ((!('network_ipam_back_refs' in vdnsPostData['virtual-DNS'])) ||
            (!vdnsPostData['virtual-DNS']['network_ipam_back_refs']
                [0]['uuid'].length)) {
            curCfgAllDel = true;
        }
    } catch (e) {
        callback(null, null);
        return;
    }
    if ((!(['network_ipam_back_refs'] in vdnsConfig['virtual-DNS']) ||
            (!vdnsConfig['virtual-DNS']['network_ipam_back_refs'].length)) &&
        curCfgAllDel) {
        callback(null, null);
        return;
    }
    if ((!['network_ipam_back_refs'] in vdnsConfig['virtual-DNS']) && !
        curCfgAllDel) {
        vdnsConfig['virtual-DNS']['network_ipam_back_refs'] = [];
        ipamUIRef = vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
        ipamUIRefLen = ipamUIRef.length;
        for (i = 0; i < ipamUIRefLen; i++) {
            uuid = ipamUIRef[i]['uuid'];
            vdnsConfig['virtual-DNS']['ipams'].push({
                'to': ipamUIRef[i]['to'],
                'attr': ipamUIRef[i]['attr'],
                'uuid': uuid,
                'oper': 'add'
            });
        }
        updateVirtualDnsUpdateIpams(error, vdnsConfig, vdnsId, appData,
            callback);
        return;
    }
    ipamUIRef = vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
    ipamUIRefLen = ipamUIRef != null ? ipamUIRef.length : 0;
    var uiUUIDs = [];
    for (i = 0; i < ipamUIRefLen; i++) {
        uiUUIDs.push(ipamUIRef[i]['uuid']);
    }
    var apiUUIDs = [];
    if (['network_ipam_back_refs'] in vdnsConfig['virtual-DNS'] &&
        vdnsConfig['virtual-DNS']['network_ipam_back_refs'].length) {
        ipamRef = vdnsConfig['virtual-DNS']['network_ipam_back_refs'];
        ipamRefLen = ipamRef.length;
        for (i = 0; i < ipamRefLen; i++) {
            uuid = ipamRef[i]['uuid'];
            apiUUIDs.push(uuid);
            if (uiUUIDs.indexOf(uuid) > -1) {
                continue;
            }
            vdnsConfig['virtual-DNS']['ipams'].push({
                'to': ipamRef[i]['to'],
                'attr': null,
                'uuid': uuid,
                'oper': 'delete'
            });
        }
        if (curCfgAllDel) {
            updateVirtualDnsUpdateIpams(error, vdnsConfig, vdnsId, appData,
                callback);
            return;
        }
    }

    for (i = 0; i < ipamUIRefLen; i++) {
        uuid = ipamUIRef[i]['uuid'];
        if (apiUUIDs.indexOf(uuid) > -1) {
            continue;
        }
        vdnsConfig['virtual-DNS']['ipams'].push({
            'to': ipamUIRef[i]['to'],
            'attr': ipamUIRef[i]['attr'],
            'uuid': uuid,
            'oper': 'add'
        });
    }
    updateVirtualDnsUpdateIpams(error, vdnsConfig, vdnsId, appData, callback);
    return;
}

/**
 * @getIpamMgmtObjectMap
 * private function
 * get network_ipam_mgmt map with UUID as key
 */
function getIpamMgmtObjectMap (ipams)
{
    var networkIpamMgmtMap = {}, networkIpams, ipamsLen, i, ipamUUID;
    networkIpams = commonUtils.getValueByJsonPath(ipams, "network-ipams", []);
    ipamsLen = networkIpams.length;
    for(i = 0; i < ipamsLen; i++) {
        ipamUUID = commonUtils.getValueByJsonPath(networkIpams[i], "uuid", "");
        if(ipamUUID) {
            networkIpamMgmtMap[ipamUUID] = commonUtils.getValueByJsonPath(networkIpams[i],
                "network_ipam_mgmt", {});
        }
    }
    return networkIpamMgmtMap;
}

/**
 * @updateVirtualDnsUpdateIpams
 * private function
 * Updates Virtual DNSs references from Ipams
 */
function updateVirtualDnsUpdateIpams(error, vdnsConfig,
    vdnsId, appData, callback) {
    var ipamRef = null;
    var vdnsIpamRef = {};
    var ipamVdnsRef = [];
    var ipamURL = null;
    var ipamLen = 0,
        i = 0,
        j = 0;
    var vdnsIpamRefLen = [];
    var vdnsIpamRefObj = {};
    var ipamUUID = null;
    var dataObjArr = [];
    var ipams = vdnsConfig['virtual-DNS']['ipams'],
        ipamUUIDs = [];
    ipamLen = ipams.length;

    if (error || !ipamLen) {
        callback(error, null);
        return;
    }
    for(i = 0; i < ipamLen; i++) {
        ipamUUIDs.push(ipams[i]["uuid"]);
    }
    configApiServer.apiGet("/network-ipams?fields=network_ipam_mgmt&obj_uuids=" + ipamUUIDs.join(","),
        appData,
        function(ipamError, oldIpams) {
            var ipamMgmtObjectMap;
            if(ipamError) {
                callback(ipamError, null);
                return;
            }
            ipamMgmtObjectMap = getIpamMgmtObjectMap(oldIpams);
            for (i = 0; i < ipamLen; i++) {
                var ipam = ipams[i];
                ipamUUID = ipam['uuid'];
                ipamURL = '/network-ipam/' + ipamUUID;
                var putIPAMPayload = {};
                putIPAMPayload['network-ipam'] = {};
                putIPAMPayload['network-ipam']['fq_name'] = ipam['to'];
                putIPAMPayload['network-ipam']['uuid'] = ipam['uuid'];
                putIPAMPayload['network-ipam']['virtual_DNS_refs'] = [];
                ipamVdnsRef = putIPAMPayload['network-ipam']['virtual_DNS_refs'];
                if (ipam['oper'] == 'add') {
                    vdnsIpamRefObj = {
                        to: vdnsConfig['virtual-DNS']['fq_name'],
                        attr: null,
                        uuid: vdnsConfig['virtual-DNS']['uuid']
                    };
                    ipamVdnsRef.push(vdnsIpamRefObj);
                } else {
                    ipamVdnsRefLen = ipamVdnsRef.length;
                    for (j = 0; j < ipamVdnsRefLen; j++) {
                        if (vdnsConfig['virtual-DNS']['uuid'] == ipamVdnsRef[j]['uuid']) {
                            ipamVdnsRef.splice(j, 1);
                            break;
                        }
                    }
                }
                putIPAMPayload['network-ipam']['network_ipam_mgmt'] =
                    ipamMgmtObjectMap[ipamUUID] ? ipamMgmtObjectMap[ipamUUID]: {};
                var ipamNwIpamMgmtRefObj = putIPAMPayload['network-ipam'][
                    'network_ipam_mgmt'
                ];
                if (ipam['oper'] == 'add') {
                    ipamNwIpamMgmtRefObj.ipam_dns_method = "virtual-dns-server";
                    ipamNwIpamMgmtRefObj.ipam_dns_server = {};
                    ipamNwIpamMgmtRefObj.ipam_dns_server.tenant_dns_server_address = {};
                    ipamNwIpamMgmtRefObj.ipam_dns_server.virtual_dns_server_name =
                        vdnsConfig['virtual-DNS']['fq_name'][0] + ":" +
                        vdnsConfig['virtual-DNS']['fq_name'][1];
                } else {
                    ipamNwIpamMgmtRefObj.ipam_dns_method = "none";
                    ipamNwIpamMgmtRefObj.ipam_dns_server = {};
                    ipamNwIpamMgmtRefObj.ipam_dns_server.tenant_dns_server_address = {};
                    ipamNwIpamMgmtRefObj.ipam_dns_server.virtual_dns_server_name = null;
                }
                commonUtils.createReqObj(dataObjArr, ipamURL, global.HTTP_REQUEST_PUT,
                    putIPAMPayload, null, null, appData);
            }
            async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
                function(error, results) {
                    callback(error, null);
                });
            return;
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

function getVirtualDNSSandeshRecordsCB(ipObj, callback) {
    var ip = ipObj['ip'];
    var dnsName = ipObj['dnsName'];
    var dataObjArr = [];
    var reqUrl = '/Snh_ShowVirtualDnsRecords?virtual_dns=' + dnsName;

    commonUtils.createReqObj(dataObjArr, reqUrl);
    var dnsAgentRestApi =
        commonUtils.getRestAPIServer(ip, global.SANDESH_DNS_AGENT_PORT,
                                     global.SANDESH_API);
    async.map(dataObjArr,
        commonUtils.getServerRespByRestApi(dnsAgentRestApi, true),
        function(err, data) {
            var dataObj = {
                'err': err,
                'data': data
            };
            callback(null, dataObj);
        });
}

function getVirtualDNSSandeshRecords(req, res, appData) {
    var dataObjArr = [];
    var dataIPObjArr = [];
    var dnsName = req.param('dnsfqn');

    var contrailServ = contrailService.getActiveServiceRespDataList();
    var vdnsContrailData = commonUtils.getValueByJsonPath(contrailServ,
            global.CONTRAIL_SERVICE_TYPE_DNS_SERVER +';data;' +
            global.CONTRAIL_SERVICE_TYPE_DNS_SERVER, []);
    if(!vdnsContrailData.length) {
        var error = new appErrors.RESTServerError('We did not get contrail ' +
            'service response for ' + global.CONTRAIL_SERVICE_TYPE_DNS_SERVER);
            commonUtils.handleJSONResponse(error, res, null);
            return;
    }
    var vdnsContrailDataCnt = vdnsContrailData.length;
    for (var i = 0; i < vdnsContrailDataCnt; i++) {
        dataIPObjArr.push({
            'ip': vdnsContrailData[i]['ip-address'],
            'dnsName': dnsName
        });
    }
    async.map(dataIPObjArr, getVirtualDNSSandeshRecordsCB, function(err, data) {
        if ((null != err) || (null == data)) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }
        var cnt = data.length;
        for (var i = 0; i < cnt; i++) {
            if ((null != data[i]) && (null == data[i]['err']) && (null !=
                    data[i]['data'])) {
                commonUtils.handleJSONResponse(null, res, data[i][
                    'data'
                ]);
                return;
            }
        }
        commonUtils.handleJSONResponse(null, res, []);
    });
}

exports.createVirtualDNS = createVirtualDNS;
exports.updateVirtualDNS = updateVirtualDNS;
exports.deleteVirtualDNS = deleteVirtualDNS;
exports.readVirtualDNSs = readVirtualDNSs;
exports.updateVDNSIpams = updateVDNSIpams;
exports.getVirtualDNSSandeshRecords = getVirtualDNSSandeshRecords;
exports.listVirtualDNSsFromAllDomains = listVirtualDNSsFromAllDomains;
exports.deleteVirtualDNSCallback = deleteVirtualDNSCallback;
