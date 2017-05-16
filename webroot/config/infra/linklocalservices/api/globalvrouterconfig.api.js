/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @globalvrouterconfig.api.js
 *     - Handlers for Global vRouter Configuration
 *     - Interfaces with config api server
 */

var rest        = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/rest.api');
var async       = require('async');
var vnconfigapi = module.exports;
var logutils    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/utils/common.utils');
var messages    = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/messages');
var global      = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/common/global');
var appErrors   = require(process.mainModule.exports["corePath"] +
                          '/src/serverroot/errors/app.errors');
var util        = require('util');
var url         = require('url');
var configApiServer = require(process.mainModule.exports["corePath"] +
                              '/src/serverroot/common/configServer.api');
var jsonDiff = require(process.mainModule.exports["corePath"] +
                       '/src/serverroot/common/jsondiff');

/**
 * Bail out if called directly as "nodejs globalvrouterconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

function getFirstGlobalvRouterConfig(appData, callback) {
    var gvrListURL     = '/global-vrouter-configs';	
    configApiServer.apiGet(gvrListURL, appData,
        function(error, data) {
    		if (error) {
    			callback(error, null);
    			return;
    		}
    		var gvrUUID = null;
    		if(data["global-vrouter-configs"].length > 0) {
    			gvrUUID = data["global-vrouter-configs"][0].uuid; 
    		} else {
    			callback(error, null);
    			return;
    		}
		    var gvrGetURL = '/global-vrouter-config/' + gvrUUID;
	        configApiServer.apiGet(gvrGetURL, appData,
	        	function(error, data) {
	            	if (error) {
	        			callback(error, null);
	            	} else {
	        			callback(error, data);
	            	}
	        	});
        });
}

function createFirstGlobalvRouterConfig(data, appData, callback) {
    var gvrPostURL = '/global-vrouter-configs';
    var gvrPostData = {};
    gvrPostData["global-vrouter-config"] = {};
    if (null !== data && typeof data !== "undefined" &&
        null !== data["global-vrouter-config"] &&
        typeof data["global-vrouter-config"] !== "undefined") {
        gvrPostData["global-vrouter-config"] = data["global-vrouter-config"];
    }

    gvrPostData["global-vrouter-config"]["parent_type"] = "global-system-config";
    gvrPostData["global-vrouter-config"]["fq_name"] = [];
    gvrPostData["global-vrouter-config"]["fq_name"][0] = "default-global-system-config";
    gvrPostData["global-vrouter-config"]["fq_name"][1] = "default-global-vrouter-config"

    configApiServer.apiPost(gvrPostURL, gvrPostData, appData, function(err, data) {
    	if (err) {
    		callback(err, null);
    	} else {
    		callback(err, data);
    	}
    });
}

/**
 * @getGlobalvRouterConfig
 * 1. URL /api/tenants/config/global-vrouter-config
 * 2. Gets global vrouter configuration from config api server and 
 * process data from config api server and sends back the http response.
 */
function getGlobalvRouterConfig (request, response, appData) 
{
    getFirstGlobalvRouterConfig(appData, function(error, data) {
    	if(error) {
    		commonUtils.handleJSONResponse(error, response, null);
        } else {
    		commonUtils.handleJSONResponse(error, response, data);
        }
    });
    return;
}

/**
 * @createGlobalvRouterConfig
 * 1. URL /api/tenants/config/global-vrouter-configs
 * 2. Creates global vrouter configuration from config api server and 
 * process data from config api server and sends back the http response.
 */
function createGlobalvRouterConfig (request, response, appData) {
	createFirstGlobalvRouterConfig(request.body, appData, function(err, data) {
	    if(err) {
			commonUtils.handleJSONResponse(err, response, null);
	    } else {
			commonUtils.handleJSONResponse(err, response, data);
	    }
	    return;
	});
}

/**
 * @updateGlobalConfig
 * 1. URL /api/tenants/config/update-global-config
 * 2. Updates global-vrouter-config and global-system-config and process
 * data from config api server and sends back the http response.
 */
function updateGlobalConfig (req, res, appData)
{
    var error = null;
    var dataObjArr = [];
    var uiGlobalConfig = req.body;
    if ((null == uiGlobalConfig) ||
        (null == uiGlobalConfig['global-vrouter-config']) ||
        (null == uiGlobalConfig['global-system-config'])) {
        error = new appErrors.RESTServerError('Invalid Request ');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
    var globalVRId =
        commonUtils.getValueByJsonPath(uiGlobalConfig,
                                       'global-vrouter-config;uuid',
                                       null);
    var globalSCId =
        commonUtils.getValueByJsonPath(uiGlobalConfig,
                                       'global-system-config;uuid',
                                       null);

    var putGVCData = {'global-vrouter-config':
        uiGlobalConfig['global-vrouter-config']};
    var putGSCData = {'global-system-config':
        uiGlobalConfig['global-system-config']};

    dataObjArr.push({type: 'global-system-config', uuid: globalSCId,
                    putData: putGSCData, appData: appData});
    dataObjArr.push({type: 'global-vrouter-config', uuid: globalVRId,
                    putData: putGVCData, appData: appData});
    async.map(dataObjArr, updateGlobalConfigCB, function(err, data) {
        commonUtils.handleJSONResponse(err, res, null);
    });
}

function updateGlobalSystemConfigCB (dataObj, callback)
{
    var appData       = dataObj['appData'];
    var config        = dataObj['config'];
    var fqnameURL     = '/fqname-to-id';
    var gscReqBody    = {
        'fq_name': ['default-global-system-config'],
        'type': 'global-system-config'
    };
    configApiServer.apiPost(fqnameURL, gscReqBody, appData,
                            function(error, data) {
        var gscURL = '/global-system-config/' + dataObj['uuid'];
        configApiServer.apiGet(gscURL, appData, function(err, gscData) {
            if ((null != err) || (null == gscData)) {
                callback(err, gscData);
                return;
            }
            var uiASN =
                dataObj['putData']['global-system-config']
                       ['autonomous_system'];
            var diffObj =
                jsonDiff.getConfigJSONDiff('global-system-config',
                                           gscData, dataObj['putData']);
            if (null == diffObj) {
                return;
            }
            configApiServer.apiPut(gscURL, diffObj, appData,
                                   function(error, data) {
                if (null == uiASN) {
                    callback(error, data);
                    return;
                }
                setTimeout(function() {
                    callback(error, data);
                    return;
                }, 3000);
            });
        });
    });
}

function updateGlobalConfigCB (dataObj, callback)
{
    var type = dataObj['type'];
    if (type == 'global-vrouter-config') {
        updateForwardingOptionsCB(dataObj, callback);
    } else {
       updateGlobalSystemConfigCB(dataObj, callback);
    }
}

/**
 * @updateForwardingOptions
 * 1. URL /api/tenants/config/global-vrouter-config/:id
 * 2. Updates 'vxlan_network_identifier_mode' and 'encapsulation_priorities' 
 * of global vrouter configuration from config api server and process
 * data from config api server and sends back the http response.
 */
function updateForwardingOptions (request, response, appData) {
    var gvrPutData = request.body;
    var gvrId = request.param('id');
    updateForwardingOptionsCB({uuid: gvrId, putData: gvrPutData,
                              appData: appData},
                              function(error, data) {
        commonUtils.handleJSONResponse(error, response, data);
    });
}

function updateForwardingOptionsCB (gvrObj, callback)
{
    var gvrPutData = gvrObj['putData'];
    var appData = gvrObj['appData'];
    var gvrId = gvrObj['uuid'];

    if (!('global-vrouter-config' in gvrPutData)) {
        error = new appErrors.RESTServerError('Invalid Request ');
        callback(error, null);
        return;
    }

    if (null == gvrId) {
        /* This is a create request */
        createFirstGlobalvRouterConfig(gvrPutData, appData, callback);
        return;
    }

    if(null === gvrId || typeof gvrId === "undefined") {
        error = new appErrors.RESTServerError('Invalid ID');
        callback(error, null);
        return;
    }
    
    var gvrGetURL = '/global-vrouter-config/' + gvrId;
    configApiServer.apiGet(gvrGetURL, appData,
        function(error, data) {
           	if (error) {
                callback(error, null);
           		return;
           	} else {
        	    var gvrPutURL = '/global-vrouter-config/' + gvrId;
        	    var gvrConfigData = commonUtils.cloneObj(data);
        	    gvrConfigData["global-vrouter-config"]["vxlan_network_identifier_mode"] =
        	    	gvrPutData["global-vrouter-config"]["vxlan_network_identifier_mode"];
                gvrConfigData["global-vrouter-config"]["forwarding_mode"] =
                    gvrPutData["global-vrouter-config"]["forwarding_mode"];
                gvrConfigData["global-vrouter-config"]["flow_export_rate"] =
                    gvrPutData["global-vrouter-config"]["flow_export_rate"];
                gvrConfigData["global-vrouter-config"]
                    ["ecmp_hashing_include_fields"] =
                    gvrPutData["global-vrouter-config"]["ecmp_hashing_include_fields"];

                if ('flow_aging_timeout_list' in
                    gvrPutData["global-vrouter-config"]) {
                    gvrConfigData["global-vrouter-config"]
                                 ['flow_aging_timeout_list'] =
                        gvrPutData["global-vrouter-config"]
                                  ['flow_aging_timeout_list'];
                }
        	    gvrConfigData["global-vrouter-config"]["encapsulation_priorities"] = {};
        	    gvrConfigData["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"] =
        	    	gvrPutData["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"];
        	    var diffObj = jsonDiff.getConfigJSONDiff('global-vrouter-config', data, gvrConfigData);
                if(diffObj != null) {
        	        configApiServer.apiPut(gvrPutURL, diffObj, appData,
        	            function (error, data) {
		                	if (error) {
                                callback(error, null);
		                		return;
		                	} else {
                                callback(error, data);
		                	}
		                	return;
        	            });
           		} else {
                    callback(error, null);
                }
            }
        });
}

function updateLinkLocalService (request, response, appData) {
    if (!("global-vrouter-config" in request.body)) {
        error = new appErrors.RESTServerError('Invalid Request ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    getFirstGlobalvRouterConfig(appData, function(error, data) {
    	if(null === data) {
    		//Global vRouter Config doesnt exist or empty.
    		createFirstGlobalvRouterConfig(request.body, appData, function(error, data) {
            	if (error) {
            		commonUtils.handleJSONResponse(error, response, null);
            		return;
            	} else {
        		    var llsPutData = request.body;
        		    gvrConfigData = data;
        		    var gvrId = gvrConfigData["global-vrouter-config"]["uuid"];
        		    var gvrPutUrl = '/global-vrouter-config/' + gvrId;
        		    configApiServer.apiPut(gvrPutUrl, llsPutData, appData,
        		        function(error, data) {
        		        	if (error) {
        		        		commonUtils.handleJSONResponse(error, response, null);
        		        	} else {
        		        		commonUtils.handleJSONResponse(error, response, data);
        		        	}
        		        	return;
        		    	});
            	}
    		});
    	} else {
		    gvrConfigData = data;
		    var gvrId = gvrConfigData["global-vrouter-config"]["uuid"];
		    var llsPutData = request.body;
		    if(gvrId === llsPutData["global-vrouter-config"]["uuid"]) {
			    var gvrPutUrl = '/global-vrouter-config/' + gvrId;
    		    if(null !== gvrConfigData["global-vrouter-config"]["linklocal_services"] &&
    		    	typeof gvrConfigData["global-vrouter-config"]["linklocal_services"] !== "undefined" &&
    		    	null !== gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"] &&
    		    	typeof gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"] !== "undefined" &&
    		    	gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"].length > 0) {
    		    	if(null === llsPutData["global-vrouter-config"]["linklocal_services"] ||
    		    		typeof llsPutData["global-vrouter-config"]["linklocal_services"] === "undefined") {
    		    		llsPutData["global-vrouter-config"]["linklocal_services"] = {};
    		    	}
    		    }

			    configApiServer.apiPut(gvrPutUrl, llsPutData, appData,
			        function(error, data) {
			        	if (error) {
			        		commonUtils.handleJSONResponse(error, response, null);
			        	} else {
			        		commonUtils.handleJSONResponse(error, response, data);
			        	}
			        	return;
			    	});
		    }
    	}
    });
} 

exports.getGlobalvRouterConfig = getGlobalvRouterConfig;
exports.createGlobalvRouterConfig = createGlobalvRouterConfig;
exports.updateForwardingOptions = updateForwardingOptions;
exports.updateLinkLocalService = updateLinkLocalService;
exports.updateGlobalConfig = updateGlobalConfig;
