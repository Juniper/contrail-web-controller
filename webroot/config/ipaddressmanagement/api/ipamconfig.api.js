/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @ipamconfig.api.js
 *     - Handlers for IPAM Configuration
 *     - Interfaces with config api server
 */

var rest          = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/rest.api');
var async         = require('async');
var ipamconfigapi = module.exports;
var logutils      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/log.utils');
var commonUtils   = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/utils/common.utils');
var config        = process.mainModule.exports["config"];
var messages      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/messages');
var global        = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/global');
var appErrors     = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/errors/app.errors');
var util          = require('util');
var url           = require('url');
var jsonDiff      = require(process.mainModule.exports["corePath"] +
                            '/src/serverroot/common/jsondiff');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');


/**
 * Bail out if called directly as "nodejs ipamconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listIpamsCb
 * private function
 * 1. Callback for listIpams
 * 2. Reads the response of per project ipams from config api server
 *    and sends it back to the client.
 */
function listIpamsCb (error, ipamListData, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    commonUtils.handleJSONResponse(error, response, ipamListData);
}

/**
 * @listIpams
 * public function
 * 1. URL /api/tenants/config/ipams
 * 2. Gets list of ipams from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listIpamsCb that process data from config
 *    api server and sends back the http response.
 */
function listIpams (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var ipamListURL   = '/network-ipams';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId     = requestParams.query.tenant_id;
        ipamListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(ipamListURL, appData,
                         function(error, data) {
                         listIpamsCb(error, data, response)
                         });
}

/**
 * @getIpamCb
 * private function
 * 1. Callback for getIpam
 * 2. Reads the response of ipam get from config api server
 *    and sends it back to the client.
 */
function getIpamCb (ipamConfig, appData, callback)
{
    delete ipamConfig['network-ipam']['id_perms'];
    delete ipamConfig['network-ipam']['href'];
    delete ipamConfig['network-ipam']['_type'];
    callback(null, ipamConfig);
}

/**
 * @getIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id
 * 2. Gets  ipam config from config api server
 * 3. Needs ipam id
 * 4. Calls getIapmCb that process data from config
 *    api server and sends back the http response.
 */
function getIpam (request, response, appData) 
{
    var iapmId        = null;
    var requestParams = url.parse(request.url,true);
    var ipamGetURL    = '/network-ipam';

    if ((ipamId = request.param('id'))) {
        getIpamAsync({uuid: ipamId, appData: appData},
                     function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
}

function getIpamAsync (ipamObj, callback)
{
    var ipamId = ipamObj['uuid'];
    var appData = ipamObj['appData'];

    var reqUrl = '/network-ipam/' + ipamId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        if ((null != err) || (null == data)) {
            callback(null, null);
            return;
        }
        getIpamCb(data, appData, callback);
    });
}

function readIpams (ipamObj, callback)
{
    var dataObjArr = ipamObj['reqDataArr'];
    async.map(dataObjArr, getIpamAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @ipamSendResponse
 * private function
 * 1. Sends back the response of ipam read to clients after set operations.
 */
function ipamSendResponse(error, ipamConfig, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
    } else {
       commonUtils.handleJSONResponse(error, response, ipamConfig);
    }
    return;
}

/**
 * @setIpamRead
 * private function
 * 1. Callback for ipam create / update operations
 * 2. Reads the response of ipam get from config api server
 *    and sends it back to the client.
 */
function setIpamRead(error, ipamConfig, response, appData) 
{
    var ipamGetURL = '/network-ipam/';

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    ipamGetURL += ipamConfig['network-ipam']['uuid'];
    configApiServer.apiGet(ipamGetURL, appData,
                         function(error, data) {
                         ipamSendResponse(error, data, response)
                         });
}

/**
 * @createIpam
 * public function
 * 1. URL /api/tenants/config/ipams - Post
 * 2. Sets Post Data and sends back the ipam config to client
 */
function createIpam (request, response, appData) 
{
    var ipamCreateURL = '/network-ipams';
    var ipamPostData  = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (('network_ipam_mgmt' in ipamPostData['network-ipam']) &&
        ('dhcp_option_list' in ipamPostData['network-ipam']
         ['network_ipam_mgmt']) &&
        ('dhcp_option' in ipamPostData['network-ipam']
         ['network_ipam_mgmt']['dhcp_option_list']) &&
        (ipamPostData['network-ipam']['network_ipam_mgmt']
         ['dhcp_option_list']['dhcp_option'].length) &&
        (!(ipamPostData['network-ipam']['network_ipam_mgmt']
       ['dhcp_option_list']['dhcp_option'][0]['dhcp_option_value'].length))) {
        delete ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    }

    configApiServer.apiPost(ipamCreateURL, ipamPostData, appData,
                         function(error, data) {
                         commonUtils.handleJSONResponse(error, response, data);
                         });

}

/**
 * @setIpamMgmt
 * private function
 * 1. Callback for updateIpam
 * 2. Updates the Ipam Mgmt Object, right now only dhcp options
 */
function setIpamOptions(error, ipamPostData, ipamId, response,
                        appData) 
{
    var ipamPostURL = '/network-ipam/' + ipamId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    /*
    if (!('network_ipam_mgmt' in ipamPostData['network-ipam'])) {
        ipamPostData['network-ipam']['network_ipam_mgmt'] = [];
    }

    ipamConfig['network-ipam']['network_ipam_mgmt'] = [];
    ipamConfig['network-ipam']['network_ipam_mgmt'] =
           ipamPostData['network-ipam']['network_ipam_mgmt'];
	ipamConfig["network-ipam"]["virtual_DNS_refs"] = [];
    if(typeof ipamPostData["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"] !== "undefined") {
    	if(typeof ipamPostData["network-ipam"]["network_ipam_mgmt"]
			["ipam_dns_server"]["virtual_dns_server_name"] !== "undefined") {
    		var vdnsName = ipamPostData["network-ipam"]["network_ipam_mgmt"]
    			["ipam_dns_server"]["virtual_dns_server_name"];
    		var dnsMethod = ipamPostData["network-ipam"]["network_ipam_mgmt"]["ipam_dns_method"];

    		if(dnsMethod != null && typeof dnsMethod !== "undefined" && dnsMethod === "virtual-dns-server" && 
    			vdnsName !== null && typeof vdnsName !== "undefined" && vdnsName.indexOf(":") != -1) {
        		var domainName = vdnsName.split(":")[0];
        		var vdnsName   = vdnsName.split(":")[1];
        		ipamConfig["network-ipam"]["virtual_DNS_refs"][0] = {
        			"to" : [
        			    domainName,
        			    vdnsName
        			]
        		};
    		}
    	}
    }
    */
    configApiServer.apiPut(ipamPostURL, ipamPostData, appData,
                         function(error, data) {
                             commonUtils.handleJSONResponse(error, response, data);
                         });
}

/**
 * @updateIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id - Put
 * 2. Sets Post Data and sends back the policy to client
 */
function updateIpam (request, response, appData) 
{
    var ipamId         = null;
    var ipamGetURL     = '/network-ipam/';
    var ipamOptionsRef = [];
    var ipamOPtionsLen = 0, i = 0;
    var ipamPostData   = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (ipamId = request.param('id').toString()) {
        ipamGetURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Add Ipam ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ('network-ipam' in ipamPostData &&
        'network_ipam_mgmt' in ipamPostData['network-ipam'] &&
        'dhcp_option_list' in ipamPostData['network-ipam']['network_ipam_mgmt']) {
    	var ipamOptionList = ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    	if(typeof ipamOptionList !== "undefined" && ipamOptionList !== null) {
    		ipamOptionsRef = ipamOptionList['dhcp_option'];
            if(typeof ipamOptionsRef === "undefined")
            	ipamOptionsLen = 0;
            else
            	ipamOptionsLen = ipamOptionsRef.length;
            for (i = 0; i < ipamOptionsLen; i++) {
                if (!('dhcp_option_value' in ipamOptionsRef[i])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                } else if (!(ipamOptionsRef[i]['dhcp_option_value'])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                if (!('dhcp_option_name' in ipamOptionsRef[i])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                } else if (!(ipamOptionsRef[i]['dhcp_option_name'])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
            }
    	}
    }

    if ('network-ipam' in ipamPostData &&
            'network_ipam_mgmt' in ipamPostData['network-ipam'] &&
            'ipam_dns_method' in ipamPostData['network-ipam']
                                              ['network_ipam_mgmt'] &&
            'ipam_dns_server' in ipamPostData['network-ipam']['network_ipam_mgmt']) {
    	var ipam_dns_method = ipamPostData['network-ipam']['network_ipam_mgmt']['ipam_dns_method'];
    	if(null == ipam_dns_method) {
            error = new appErrors.RESTServerError('Enter Valid DNS Method');
            commonUtils.handleJSONResponse(error, response, null);
            return;
    	}
    	var ipam_dns_server = ipamPostData['network-ipam']['network_ipam_mgmt']['ipam_dns_server'];
    	if(!('tenant_dns_server_address' in ipam_dns_server) ||
    			!('virtual_dns_server_name' in ipam_dns_server)) {
            error = new appErrors.RESTServerError('Enter Valid DNS Value');
            commonUtils.handleJSONResponse(error, response, null);
            return;
    	}
    }
    
    jsonDiff.getJSONDiffByConfigUrl(ipamGetURL, appData, ipamPostData,
                                    function(err, ipamDeltaConfig) {
        setIpamOptions(err, ipamDeltaConfig, ipamId, response, appData);
    });
}

/**
 * @deleteIpamCb
 * private function
 * 1. Return back the response of Ipam delete.
 */
function deleteIpamCb (error, ipamDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, ipamDelResp);
}

/**
 * @deleteIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id
 * 2. Deletes the Ipam from config api server
 */
function deleteIpam (request, response, appData) 
{
    var ipamDelURL     = '/network-ipam/';
    var ipamId         = null;
    var requestParams = url.parse(request.url, true);

    if (ipamId = request.param('id').toString()) {
        ipamDelURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Provide IPAM Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(ipamDelURL, appData,
                            function(error, data) {
                            deleteIpamCb(error, data, response)
                            });
}

function updateIpamDns (request, response, appData) 
{
    var ipamId         = null;
    var ipamGetURL     = '/network-ipam/';
    var ipamOptionsRef = [];
    var ipamOPtionsLen = 0, i = 0;
    var ipamPostData   = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (ipamId = request.param('id').toString()) {
        ipamGetURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Add Ipam ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(ipamGetURL, appData,
                        function(error, data) {
    						setIpamDnsOptions(error, data, ipamPostData,
                                       ipamId, response, appData);
                        });
}

/**
 * @setIpamDnsOptions
 * private function
 * 1. Callback for updateIpamDns
 * 2. Updates the Ipam Mgmt Object
 */
function setIpamDnsOptions(error, ipamConfig, ipamPostData, ipamId, response,
                        appData) 
{
    var ipamPostURL = '/network-ipam/' + ipamId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if(!('network_ipam_mgmt' in ipamConfig['network-ipam'])) {
    	ipamConfig['network-ipam']['network_ipam_mgmt'] = {};
    }
    var vdnsRef = null;
    if(typeof ipamConfig["network-ipam"]["virtual_DNS_refs"] !== "undefined" &&
    		ipamConfig["network-ipam"]["virtual_DNS_refs"].length > 0) {
    	vdnsRef = ipamConfig["network-ipam"]["virtual_DNS_refs"][0];
    	ipamConfig["network-ipam"]["virtual_DNS_refs"].splice(0,ipamConfig["network-ipam"]["virtual_DNS_refs"].length);
    }
    
    var emptyConfig = {
		"ipam_method": null,
		"ipam_virtual_DNS": null,
		"ipam_dns_method": "",
		"ipam_dns_server": {
			"tenant_dns_server_address": null,
			"virtual_dns_server_name": null
		}
    };
    if(typeof ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'] !== "undefined") {
    	emptyConfig.dhcp_option_list = 
    		ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    }
    
    ipamConfig['network-ipam']['network_ipam_mgmt'] = emptyConfig;

    configApiServer.apiPut(ipamPostURL, ipamConfig, appData, 
                         function(error, data) {
    					 updateIpamInVDNS(error, data, response, ipamId, vdnsRef, appData);
                         });
}

function updateIpamInVDNS(error, ipamConfig, response, ipamId, vdnsRef, appData) 
{
	if (error) {
    	commonUtils.handleJSONResponse(error, response, null);
        return;
    }

	if (null !== vdnsRef && typeof vdnsRef !== "undefined") {
        var vdnsURL = '/virtual-DNS/' + vdnsRef['uuid'];
	    configApiServer.apiGet(vdnsURL, appData,
                function(error, data) {
	    			updateIpamInVDNSCb(error, data, ipamConfig, response, ipamId, appData);
                });
	} else {
        setIpamRead(error, ipamConfig, response, appData);		
	}
}

function updateIpamInVDNSCb(error, result, ipamConfig, response, ipamId, appData) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(!('network_ipam_back_refs' in result['virtual-DNS'])) {
    	setIpamRead(error, ipamConfig, response, appData);
    	return;
    }
    var vdnsURL = '/virtual-DNS/' + result['virtual-DNS']['uuid'];
    for(var i=0; result['virtual-DNS']['network_ipam_back_refs'].length; i++) {
    	if(result['virtual-DNS']['network_ipam_back_refs'][i].uuid === ipamId) {
    		result['virtual-DNS']['network_ipam_back_refs'].splice(i,1);
    		break;
    	}
    }
    //delete result['virtual-DNS']['network_ipam_back_refs'];
    configApiServer.apiPut(vdnsURL, result, appData, 
            function(error, data) {
    			setIpamRead(error, ipamConfig, response, appData);
            });
}
exports.listIpams  = listIpams;
exports.getIpam    = getIpam;
exports.readIpams  = readIpams;
exports.createIpam = createIpam;
exports.deleteIpam = deleteIpam;
exports.updateIpam = updateIpam;
exports.updateIpamDns = updateIpamDns;
exports.getIpamCb = getIpamCb;

