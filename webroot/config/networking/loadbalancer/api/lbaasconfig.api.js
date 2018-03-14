/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @lbaasconfig.api.js - Handlers to manage lBaaS resources - Interfaces with
 *                     config api server
 */

var rest = require(process.mainModule.exports['corePath']
        + '/src/serverroot/common/rest.api');
var async = require('async');
var lbconfigapi = module.exports;
var logutils = require(process.mainModule.exports['corePath']
        + '/src/serverroot/utils/log.utils');
var commonUtils = require(process.mainModule.exports['corePath']
        + '/src/serverroot/utils/common.utils');
var messages = require(process.mainModule.exports['corePath']
        + '/src/serverroot/common/messages');
var global = require(process.mainModule.exports['corePath']
        + '/src/serverroot/common/global');
var appErrors = require(process.mainModule.exports['corePath']
        + '/src/serverroot/errors/app.errors');
var util = require('util');
var url = require('url');
var UUID = require('uuid-js');
var configApiServer = require(process.mainModule.exports['corePath']
        + '/src/serverroot/common/configServer.api');
var jsonDiff = require(process.mainModule.exports['corePath']
        + '/src/serverroot/common/jsondiff');
var _ = require('underscore');
var jsonPath = require('JSONPath').eval;
var portConfig = require('../../../networking/port/api/portsconfig.api');

/**
 * Bail out if called directly as 'nodejs lbaasconfig.api.js'
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
            module.filename));
    process.exit(1);
}

/**
 * @listLoadBalancers public function 1. URL
 *                    /api/tenants/config/lbaas/load-balancers 2. Gets list of
 *                    load balancer from config api server 3. Needs tenant id
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function listLoadBalancers(request, response, appData) {
    logutils.logger.debuglog('listLoadBalancers');
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var lbListURL = '/loadbalancers';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        lbListURL += '?parent_type=project&parent_fq_name_str='
                + tenantId.toString();
    }

    configApiServer.apiGet(lbListURL, appData, function(error, lbListData) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, lbListData);
    });
}

/**
 * @getLoadBalancersDetails public function 1. URL
 *                          /api/tenants/config/lbaas/load-balancers-details
 *                          2.Gets list of load balancer details from config api
 *                          server 3. Needs tenant id
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function getLoadBalancersDetails(request, response, appData) {
    logutils.logger.debug('getLoadBalancersDetails');
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var lbListURL = '/loadbalancers';
    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        lbListURL += '?parent_type=project&parent_id=' + tenantId.toString();
    }
    configApiServer.apiGet(lbListURL, appData, function(error, data) {
        getLoadBalancersDetailsCB(error, data, response, appData);
    });
}

/**
 * @getLoadBalancersDetailsCB private function Return back the response of load
 *                            balancers details.
 * @param error
 * @param lbs
 * @param response
 * @param appData
 * @returns
 */
function getLoadBalancersDetailsCB(error, lbs, response, appData) {
    logutils.logger.debug('getLoadBalancersDetailsCB');
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lbLength = 0;
    var loadbalancers = {};
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (lbs['loadbalancers'] != null) {
        lbLength = lbs['loadbalancers'].length;
        for (lb = 0; lb < lbLength; lb++) {
            reqUrl = '/loadbalancer/' + lbs['loadbalancers'][lb]['uuid']
                    + '?exclude_hrefs=true&exclude_Refs=true';
            commonUtils.createReqObj(dataObjArr, reqUrl,
                    global.HTTP_REQUEST_GET, null, null, null, appData);
        }
        if (dataObjArr.length > 0) {
            async
                    .map(
                            dataObjArr,
                            commonUtils.getAPIServerResponse(
                                    configApiServer.apiGet, true),
                            function(error, loadbalancer) {
                                if (error) {
                                    commonUtils.handleJSONResponse(error,
                                            response, null);
                                    return;
                                }
                                if (lbs['loadbalancers'].length > 0
                                        && loadbalancer != null) {
                                    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                        lbs['loadbalancers'][lb]['loadbalancer'] = {};
                                        for (var l = 0; l < loadbalancer.length; l++) {
                                            if (lbs['loadbalancers'][lb]['uuid'] == loadbalancer[l]['loadbalancer']['uuid']) {
                                                lbs['loadbalancers'][lb]['loadbalancer'] = loadbalancer[l]['loadbalancer'];
                                            }
                                        }
                                    }
                                }
                                parseLoadBalancerDetails(lbs, appData,
                                        function(error, lbs) {
                                            commonUtils.handleJSONResponse(
                                                    error, response, lbs);
                                        });
                            });
        } else {
            commonUtils.handleJSONResponse(error, response, lbs);
        }
    } else {
        commonUtils.handleJSONResponse(error, response, lbs);
    }
}

function parseLoadBalancerDetails(lbs, appData, callback) {
    logutils.logger.debug('parseLoadBalancerDetails');
    var jsonstr = JSON.stringify(lbs);
    var new_jsonstr = jsonstr.replace(/loadbalancer_listener_back_refs/g,
            'loadbalancer-listener');
    lbs = JSON.parse(new_jsonstr);
    var dataObj = {
        lbs : lbs,
        appData : appData
    };
    async.waterfall([ async.apply(getListenersDetailInfo, appData, lbs),
            async.apply(getLoadBalancerRefDetails, appData) ], function(error,
            lbs) {
        callback(error, lbs);
    });
}

/**
 * @getLoadBalancersTree public function 1. URL
 *                       /api/tenants/config/lbaas/load-balancers-tree 2. Gets
 *                       list of load balancerss from config api server 3. Needs
 *                       tenant id 4. Calls getLoadBalancersTreeInfo that
 *                       process data from config api server and sends back the
 *                       http response.
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function getLoadBalancersTree(request, response, appData) {
    logutils.logger.debug('getLoadBalancersTree');
    var tenantId = null;
    var requestParams = url.parse(request.url, true);
    var lbListURL = '/loadbalancers';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId = requestParams.query.tenant_id;
        lbListURL += '?parent_type=project&parent_id=' + tenantId.toString();
    }

    configApiServer.apiGet(lbListURL, appData, function(error, data) {
        getLoadBalancersTreeInfo(error, data, response, appData);
    });
}

/**
 * @getLoadBalancerbyId public function 1. URL
 *                      /api/tenants/config/lbaas/load-balancer/:uuid 2. Gets of
 *                      load-balancer details from config api server 3. Needs
 *                      loadbalancer uuid 4. async waterfall functions that
 *                      process data from config api server and sends back the
 *                      http response.
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function getLoadBalancerbyId(request, response, appData) {
    logutils.logger.debug('getLoadBalancerbyId');
    if (!(lb_uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Loadbalancer uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var lb_uuid = request.param('uuid');
    readLBwithUUID(lb_uuid, appData, function(err, lbData) {
        if (err) {
            callback(err, lbData);
            return;
        }
        var lbs = {
            'loadbalancers' : [ lbData ]
        };
        parseLoadBalancerDetails(lbs, appData, function(error, lbs) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                var lb = lbs['loadbalancers'][0];
                commonUtils.handleJSONResponse(error, response, lb);
            }
        });
    });
}

function getLBaaSDetailsbyIdCB(lb, appData, callback) {
    logutils.logger.debug('getLBaaSDetailsbyIdCB');
    var jsonstr = JSON.stringify(lb);
    var new_jsonstr = jsonstr.replace(/loadbalancer_listener_back_refs/g,
            'loadbalancer-listener');
    lb = JSON.parse(new_jsonstr);
    var lbs = {
        'loadbalancers' : [ lb ]
    };

    async.waterfall([ async.apply(getListenersDetailInfo, appData, lbs),
            async.apply(getPoolDetailInfo, appData),
            async.apply(getMemberHealthMonitorInfo, appData) ], function(error,
            lbs) {
        callback(error, lbs);
    });
}

/**
 * @getLoadBalancersTreeInfo private function Return back the response of load
 *                           balancers tree.
 * @param error
 * @param lbs
 * @param response
 * @param appData
 * @returns
 */
function getLoadBalancersTreeInfo(error, lbs, response, appData) {
    logutils.logger.debug('getLoadBalancersTreeInfo');
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lbLength = 0;
    var loadbalancers = {};

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (lbs['loadbalancers'] != null) {
        lbLength = lbs['loadbalancers'].length;
        for (i = 0; i < lbLength; i++) {
            reqUrl = '/loadbalancer/' + lbs['loadbalancers'][i]['uuid']
                    + '?exclude_hrefs=true&exclude_Refs=true';
            commonUtils.createReqObj(dataObjArr, reqUrl,
                    global.HTTP_REQUEST_GET, null, null, null, appData);
        }
        if (dataObjArr.length > 0) {
            async
                    .map(
                            dataObjArr,
                            commonUtils.getAPIServerResponse(
                                    configApiServer.apiGet, true),
                            function(error, loadbalancer) {
                                if (error) {
                                    commonUtils.handleJSONResponse(error,
                                            response, null);
                                    return;
                                }
                                if (lbs['loadbalancers'].length > 0
                                        && loadbalancer != null) {
                                    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                        lbs['loadbalancers'][lb]['loadbalancer'] = {};
                                        for (var l = 0; l < loadbalancer.length; l++) {
                                            if (lbs['loadbalancers'][lb]['uuid'] == loadbalancer[l]['loadbalancer']['uuid']) {
                                                lbs['loadbalancers'][lb]['loadbalancer'] = loadbalancer[l]['loadbalancer'];
                                            }
                                        }
                                    }
                                }
                                var jsonstr = JSON.stringify(lbs);
                                var new_jsonstr = jsonstr.replace(
                                        /loadbalancer_listener_back_refs/g,
                                        'loadbalancer-listener');
                                lbs = JSON.parse(new_jsonstr);
                                var dataObj = {
                                    lbs : lbs,
                                    appData : appData
                                };
                                async
                                        .waterfall(
                                                [
                                                        async
                                                                .apply(
                                                                        getListenersDetailInfo,
                                                                        appData,
                                                                        lbs),
                                                        async
                                                                .apply(
                                                                        getLoadBalancerRefDetails,
                                                                        appData),
                                                        async
                                                                .apply(
                                                                        getPoolDetailInfo,
                                                                        appData),
                                                        async
                                                                .apply(
                                                                        getMemberHealthMonitorInfo,
                                                                        appData) ],
                                                function(error, lbs) {
                                                    commonUtils
                                                            .handleJSONResponse(
                                                                    error,
                                                                    response,
                                                                    lbs);
                                                });
                            });
        } else {
            commonUtils.handleJSONResponse(error, response, lbs);
        }
    } else {
        commonUtils.handleJSONResponse(error, response, lbs);
    }
}

function getLoadBalancerRefDetails(appData, lbs, callback) {
    logutils.logger.debug('getLoadBalancerRefDetails');
    async.parallel([
            async.apply(getServiceInstanceDetailsfromLB, appData, lbs),
            async.apply(getVMIDetailsfromLB, appData, lbs) ], function(err,
            results) {
        var sviData = results[0];
        var vmiData = results[1];
        async.waterfall([
                async.apply(parseServiceInstanceDetailsfromLB, sviData, lbs),
                async.apply(parseInstanceIps, vmiData, appData),
                async.apply(parseFloatingIps, vmiData, appData),
                async.apply(parseVNSubnets, vmiData, appData) ], function(
                error, results) {
            callback(null, results);
        });
    });
}

function getServiceInstanceDetailsfromLB(appData, lbs, callback) {
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    logutils.logger.debug('getServiceInstanceDetailsfromLB');
    var sviUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var svi_refs = lbs['loadbalancers'][lb]['loadbalancer']['service_instance_refs'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && svi_refs != null && svi_refs.length > 0) {
            for (i = 0; i < svi_refs.length; i++) {
                sviUUID.push(svi_refs[i]['uuid'])
            }
        }
    }
    var lisLength = sviUUID.length;
    if (sviUUID.length < 1) {
        callback(null, {});
        return;
    }
    for (i = 0; i < lisLength; i++) {
        reqUrl = '/service-instance/' + sviUUID[i]
                + '?exclude_hrefs=true&exclude_Refs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    }
    if (!dataObjArr.length) {
        var error = new appErrors.RESTServerError(
                'Invalid Service Instance Data');
        callback(error, null);
        return;
    }
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiGet, true), function(error, sviData) {
        if (error) {
            callback(error, sviData);
            return;
        }
        callback(null, sviData);
    });
}

function parseServiceInstanceDetailsfromLB(sviData, lbs, callback) {
    logutils.logger.debug('parseServiceInstanceDetailsfromLB');
    if (sviData != null && sviData.length > 0) {
        if (lbs['loadbalancers'].length > 0 && sviData != null
                && sviData.length > 0) {
            for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                var svi_refs = lbs['loadbalancers'][lb]['loadbalancer']['service_instance_refs'];
                if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                        && svi_refs != null && svi_refs.length > 0) {
                    for (i = 0; i < svi_refs.length; i++) {
                        for (var l = 0; l < sviData.length; l++) {
                            if (svi_refs[i]['uuid'] == sviData[l]['service-instance']['uuid']) {
                                svi_refs[i]['name'] = sviData[l]['service-instance']['name'];
                                svi_refs[i]['display_name'] = sviData[l]['service-instance']['display_name'];
                                svi_refs[i]['service_instance_properties'] = sviData[l]['service-instance']['service_instance_properties'];

                            }
                        }

                    }
                }
            }
        }
    }
    callback(null, lbs);
}

/**
 * @getVMIDetailsfromLB
 * @private function
 * @param appData
 * @param lbs
 * @param callback
 * @returns call back the process FloatingIPs from virtual-machine-interfaces
 */
function getVMIDetailsfromLB(appData, lbs, callback) {
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    logutils.logger.debug('getVMIDetailsfromLB');
    var vimUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var vmi_refs = lbs['loadbalancers'][lb]['loadbalancer']['virtual_machine_interface_refs'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && vmi_refs != null && vmi_refs.length > 0) {
            for (vmi = 0; vmi < vmi_refs.length; vmi++) {
                vimUUID.push(vmi_refs[vmi]['uuid'])
            }
        }
    }
    var lisLength = vimUUID.length;
    // logutils.logger.debug('getVMIDetailsfromLB-lisLength-'+lisLength);
    if (vimUUID.length < 1) {
        callback(null, {});
        return;
    }
    _.each(vimUUID, function(id) {
        reqUrl = '/virtual-machine-interface/' + id
                + '?exclude_hrefs=true&exclude_Refs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    });
    if (!dataObjArr.length) {
        var error = new appErrors.RESTServerError(
                'Invalid virtual machine interface Data');
        callback(error, null);
        return;
    }
    async
            .map(
                    dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet,
                            true),
                    function(error, vmiData) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        if (lbs['loadbalancers'].length > 0 && vmiData != null
                                && vmiData.length > 0) {
                            for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                var vmi_refs = lbs['loadbalancers'][lb]['loadbalancer']['virtual_machine_interface_refs'];
                                if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                                        && vmi_refs != null
                                        && vmi_refs.length > 0) {
                                    for (i = 0; i < vmi_refs.length; i++) {
                                        for (var l = 0; l < vmiData.length; l++) {
                                            vmi = vmiData[l]['virtual-machine-interface']
                                            if (vmi_refs[i]['uuid'] == vmi['uuid']) {
                                                vmi_refs[i]['name'] = vmi['name'];
                                                vmi_refs[i]['display_name'] = vmi['display_name'];
                                                vmi_refs[i]['floating-ip'] = {};
                                                vmi_refs[i]['instance-ip'] = {};
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        callback(null, vmiData);
                    });
}

/**
 * @parseFloatingIps
 * @private function Return call back it parse the floating-ips.
 * @param lbs
 * @param vmiData
 * @param appData
 * @param callback
 * @returns
 */
function parseFloatingIps(vmiData, appData, lbs, callback) {
    logutils.logger.debug('parseFloatingIps');
    var reqUrlfp = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    var fIPRefs = [];
    if (vmiData != null && vmiData.length > 0) {
        _
                .each(
                        vmiData,
                        function(vmi) {
                            if ('floating_ip_back_refs' in vmi['virtual-machine-interface']) {
                                var floatingRefs = vmi['virtual-machine-interface']['floating_ip_back_refs'];
                                _.each(floatingRefs, function(fp) {
                                    fIPRefs.push(fp['uuid']);
                                });
                            }
                        });
    }
    _.each(fIPRefs, function(id) {
        reqUrl = '/floating-ip/' + id + '?exclude_hrefs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    });

    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async
            .map(
                    dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet,
                            true),
                    function(error, results) {
                        if (error) {
                            callback(error, lbs);
                            return;
                        }
                        if (results != null && results.length > 0) {
                            if (lbs['loadbalancers'].length > 0
                                    && results != null && results.length > 0) {
                                for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                    var lb_vmi_refs = lbs['loadbalancers'][lb]['loadbalancer']['virtual_machine_interface_refs'];
                                    if (lb_vmi_refs != null
                                            && lb_vmi_refs.length > 0) {
                                        for (vmi = 0; vmi < lb_vmi_refs.length; vmi++) {
                                            // logutils.logger.debug("lb_vmi_refs",lb_vmi_refs[vmi]);
                                            for (var fp = 0; fp < results.length; fp++) {
                                                if (results[fp]['floating-ip'] != null) {
                                                    var vmi_ref_fip = results[fp]['floating-ip']['virtual_machine_interface_refs']
                                                    // logutils.logger.debug("vmi_ref_fip",vmi_ref_fip);
                                                    var vmi_ref_fip_len = vmi_ref_fip.length;
                                                    for (x = 0; x < vmi_ref_fip_len; x++) {
                                                        if (lb_vmi_refs[vmi]['uuid'] == vmi_ref_fip[x]['uuid']) {
                                                            lb_vmi_refs[vmi]['floating-ip'].ip = results[fp]['floating-ip']['floating_ip_address'];
                                                            lb_vmi_refs[vmi]['floating-ip'].uuid = results[fp]['floating-ip']['uuid'];
                                                            lb_vmi_refs[vmi]['floating-ip'].floating_ip_fixed_ip_address = results[fp]['floating-ip']['floating_ip_fixed_ip_address'];
                                                        }
                                                    }

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        callback(null, lbs);
                    });
}

/**
 * parseInstanceIps
 * 
 * @private function Return call back it parse the instance-ips.
 * @param lbs
 * @param vmiData
 * @param appData
 * @param callback
 * @returns
 */
function parseInstanceIps(vmiData, appData, lbs, callback) {
    logutils.logger.debug('parseInstanceIps');
    var reqUrlfp = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;

    var instanceipPoolRef = [];
    if (vmiData != null && vmiData.length > 0) {
        _
                .each(
                        vmiData,
                        function(vmi) {
                            if ('instance_ip_back_refs' in vmi['virtual-machine-interface']) {
                                var instanceRefs = vmi['virtual-machine-interface']['instance_ip_back_refs'];
                                _.each(instanceRefs, function(ip) {
                                    instanceipPoolRef.push(ip['uuid']);
                                });
                            }
                        });
    }
    // logutils.logger.debug("instance_ip_back_refs:",instanceipPoolRef);
    _.each(instanceipPoolRef, function(id) {
        reqUrl = '/instance-ip/' + id + '?exclude_hrefs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    });
    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async
            .map(
                    dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet,
                            true),
                    function(error, results) {
                        if (error) {
                            callback(error, lbs);
                            return;
                        }
                        // logutils.logger.debug(JSON.stringify(results));
                        if (results != null && results.length > 0) {
                            if (lbs['loadbalancers'].length > 0
                                    && results != null && results.length > 0) {
                                for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                    var lb_vmi_refs = lbs['loadbalancers'][lb]['loadbalancer']['virtual_machine_interface_refs'];
                                    if (lb_vmi_refs != null
                                            && lb_vmi_refs.length > 0) {
                                        for (vmi = 0; vmi < lb_vmi_refs.length; vmi++) {
                                            // logutils.logger.debug("lb_vmi_refs",lb_vmi_refs[vmi]);
                                            for (var ip = 0; ip < results.length; ip++) {
                                                if (results[ip]['instance-ip'] != null) {
                                                    var vmi_ref_ip = results[ip]['instance-ip']['virtual_machine_interface_refs']
                                                    // logutils.logger.debug("vmi_ref_ip",vmi_ref_ip);
                                                    var vmi_ref_ip_len = vmi_ref_ip.length;
                                                    for (x = 0; x < vmi_ref_ip_len; x++) {
                                                        if (lb_vmi_refs[vmi]['uuid'] == vmi_ref_ip[x]['uuid']) {
                                                            lb_vmi_refs[vmi]['instance-ip'].instance_ip_address = results[ip]['instance-ip']['instance_ip_address'];
                                                            lb_vmi_refs[vmi]['instance-ip'].uuid = results[ip]['instance-ip']['uuid'];
                                                            lb_vmi_refs[vmi]['instance-ip'].instance_ip_mode = results[ip]['instance-ip']['instance_ip_mode'];
                                                            var vipAddress = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer_properties']['vip_address'];
                                                            if (vipAddress == null
                                                                    || vipAddress == "") {
                                                                // logutils.logger.debug("VIP
                                                                // Address
                                                                // Empty"+vipAddress);
                                                                lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer_properties']['vip_address'] = results[ip]['instance-ip']['instance_ip_address'];
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        callback(null, lbs);
                    });
}

/**
 * parseVNSubnets
 * 
 * @private function Return call back it parse the subnet info.
 * @param lbs
 * @param vmiData
 * @param appData
 * @param callback
 * @returns
 */
function parseVNSubnets(vmiData, appData, lbs, callback) {
    logutils.logger.debug('parseVNSubnets');
    var reqUrlfp = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    var vrVMIRef = [];
    _
            .each(
                    vmiData,
                    function(vmi) {
                        // logutils.logger.debug(JSON.stringify(vmi['virtual-machine-interface']));
                        if ('virtual_network_refs' in vmi['virtual-machine-interface']) {
                            vrVMIRef
                                    .push(vmi['virtual-machine-interface']['virtual_network_refs'][0]);
                        }
                    });
    // logutils.logger.debug(JSON.stringify(vrVMIRef));
    _.each(vrVMIRef, function(vrObj) {
        reqUrl = '/virtual-network/' + vrObj['uuid'] + '?exclude_hrefs=true';
        // logutils.logger.debug(reqUrl);
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    });

    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async
            .map(
                    dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet,
                            true),
                    function(error, results) {
                        if (error) {
                            callback(error, lbs);
                            return;
                        }
                        if (results != null && results.length > 0) {
                            if (lbs['loadbalancers'].length > 0
                                    && results != null && results.length > 0) {
                                // logutils.logger.debug(JSON.stringify(results));
                                for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
                                    var vmi_refs = lbs['loadbalancers'][lb]['loadbalancer']['virtual_machine_interface_refs'];
                                    // logutils.logger.debug(JSON.stringify(vmi_refs));
                                    if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                                            && vmi_refs != null
                                            && vmi_refs.length > 0) {
                                        for (i = 0; i < vmi_refs.length; i++) {
                                            for (var l = 0; l < results.length; l++) {
                                                if (results[l]['virtual-network'] != null) {
                                                    var vmibackRefs = results[l]['virtual-network']['virtual_machine_interface_back_refs'];
                                                    _
                                                            .each(
                                                                    vmibackRefs,
                                                                    function(
                                                                            vmibackRef) {
                                                                        // logutils.logger.debug(JSON.stringify('vmibackRef[uuid]:'+vmibackRef['uuid']));
                                                                        // logutils.logger.debug(JSON.stringify('vmi_refs[i][uuid]:'+vmi_refs[i]['uuid']));
                                                                        if (vmibackRef['uuid'] === vmi_refs[i]['uuid']) {
                                                                            vmi_refs[i]['virtual-network'] = {};
                                                                            vmi_refs[i]['virtual-network'].uuid = results[l]['virtual-network']['uuid'];
                                                                            vmi_refs[i]['virtual-network'].display_name = results[l]['virtual-network']['display_name'];
                                                                            vmi_refs[i]['virtual-network'].name = results[l]['virtual-network']['name'];
                                                                            vmi_refs[i]['virtual-network'].network_ipam_refs = results[l]['virtual-network']['network_ipam_refs'];
                                                                        }
                                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        callback(null, lbs);
                    });
}

/**
 * @getListenersDetailInfo
 * @private function Return call back it process listeners Detail from
 *          loadbalancer-listener_back_refs.
 * @param appData
 * @param lbs
 * @param callback
 * @returns
 */
function getListenersDetailInfo(appData, lbs, callback) {
    logutils.logger.debug('getListenersDetailInfo');
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    var lisUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && llistener_ref != null && llistener_ref.length > 0) {
            for (i = 0; i < llistener_ref.length; i++) {
                lisUUID.push(llistener_ref[i]['uuid'])
            }
        }
    }
    var lisLength = lisUUID.length;
    for (i = 0; i < lisLength; i++) {
        reqUrl = '/loadbalancer-listener/' + lisUUID[i]
                + '?exclude_hrefs=true&exclude_Refs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    }
    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiGet, true), function(error, listeners) {
        if (error) {
            callback(error, null);
            return;
        }
        mergeListenerToLB(lbs, listeners, function(lbs) {
            callback(null, lbs);
        });
    });
}

/**
 * @mergeListenerToLB
 * @private function Return call back it process listeners info and merge it to
 *          load-balancer.
 * @param lbs
 * @param listeners
 * @param callback
 * @returns
 */
function mergeListenerToLB(lbs, listeners, callback) {
    // var lbs = dataObj.lbs;
    logutils.logger.debug('mergeListenerToLB');
    if (lbs['loadbalancers'].length > 0 && listeners != null
            && listeners.length > 0) {
        for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
            var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
            if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                    && llistener_ref != null && llistener_ref.length > 0) {
                for (i = 0; i < llistener_ref.length; i++) {
                    for (var l = 0; l < listeners.length; l++) {
                        if (llistener_ref[i]['uuid'] == listeners[l]['loadbalancer-listener']['uuid']) {
                            llistener_ref[i] = listeners[l]['loadbalancer-listener'];
                        }
                    }
                }
            }
        }
    }
    var jsonstr = JSON.stringify(lbs);
    var new_jsonstr = jsonstr.replace(/loadbalancer_pool_back_refs/g,
            'loadbalancer-pool');
    lbs = JSON.parse(new_jsonstr);
    callback(lbs);
}

/**
 * @getPoolDetailInfo
 * @private function Return call back it process loadbalancer-pool details from
 *          loadbalancer-listener.
 * @param appData
 * @param lbs
 * @param callback
 * @returns
 */
function getPoolDetailInfo(appData, lbs, callback) {
    logutils.logger.debug('getPoolDetailInfo');
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    var poolUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && llistener_ref != null && llistener_ref.length > 0) {
            for (i = 0; i < llistener_ref.length; i++) {
                var pools = llistener_ref[i]['loadbalancer-pool'];
                if (pools != null && pools.length > 0) {
                    for (k = 0; k < pools.length; k++) {
                        var uuid = pools[k]['uuid']
                        poolUUID.push(uuid);
                    }
                }
            }
        }
    }
    var poolLength = poolUUID.length;
    for (i = 0; i < poolLength; i++) {
        reqUrl = '/loadbalancer-pool/' + poolUUID[i] + '?exclude_hrefs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    }
    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiGet, true), function(error, pools) {
        if (error) {
            callback(error, null);
            return;
        }
        mergePoolToLB(lbs, pools, function(lbs) {
            callback(null, lbs);
        });
    });
}

/**
 * @mergePoolToLB
 * @private function Return call back it process loadbalancer-pool details merge
 *          it to loadbalancer-listener.
 * @param lbs
 * @param pools
 * @param callback
 * @returns
 */
function mergePoolToLB(lbs, poolsData, callback) {
    logutils.logger.debug('mergePoolToLB');
    if (lbs['loadbalancers'].length > 0 && poolsData.length > 0) {
        for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
            var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
            if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                    && llistener_ref != null && llistener_ref.length > 0) {
                for (i = 0; i < llistener_ref.length; i++) {
                    var pools = llistener_ref[i]['loadbalancer-pool']
                    if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                            && pools != null && pools.length > 0) {
                        for (k = 0; k < pools.length; k++) {
                            for (var l = 0; l < poolsData.length; l++) {
                                if (pools[k]['uuid'] == poolsData[l]['loadbalancer-pool']['uuid']) {
                                    pools[k] = poolsData[l]['loadbalancer-pool'];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var jsonstr = JSON.stringify(lbs);
    var new_jsonstr = jsonstr.replace(/loadbalancer_healthmonitor_refs/g,
            'loadbalancer-healthmonitor');
    var new_jsonstr1 = new_jsonstr.replace(/loadbalancer_members/g,
            'loadbalancer-members');
    lbs = JSON.parse(new_jsonstr1);
    callback(lbs);
}

/**
 * @getMemberHealthMonitorInfo
 * @private function Return call back it process loadbalancer-member details and
 *          loadbalancer-healthmonitor from loadbalancer-pool.
 * @param appData
 * @param lbs
 * @param callback
 * @returns
 */
function getMemberHealthMonitorInfo(appData, lbs, callback) {
    var reqUrl = null;
    var dataObjArr = [];
    var i = 0, lisLength = 0;
    logutils.logger.debug('getMemberHealthMonitorInfo');
    var memUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && llistener_ref != null && llistener_ref.length > 0) {
            for (i = 0; i < llistener_ref.length; i++) {
                var pool_ref = llistener_ref[i]['loadbalancer-pool'];
                if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                        && pool_ref != null && pool_ref.length > 0) {
                    for (k = 0; k < pool_ref.length; k++) {
                        var mem = pool_ref[k]['loadbalancer-members'];
                        // logutils.logger.debug('mem:',mem);
                        if (mem != undefined && mem.length > 0) {
                            for (q = 0; q < mem.length; q++) {
                                memUUID.push(mem[q]['uuid']);
                            }
                        }
                    }
                }
            }
        }
    }
    var memLength = memUUID.length;
    for (i = 0; i < memLength; i++) {
        reqUrl = '/loadbalancer-member/' + memUUID[i] + '?exclude_hrefs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    }
    var helUUID = [];
    for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
        var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
        if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                && llistener_ref != null && llistener_ref.length > 0) {
            for (i = 0; i < llistener_ref.length; i++) {
                var pool_ref = llistener_ref[i]['loadbalancer-pool'];
                if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                        && pool_ref != null && pool_ref.length > 0) {
                    for (k = 0; k < pool_ref.length; k++) {
                        var health = pool_ref[k]['loadbalancer-healthmonitor'];
                        if (health != undefined && health.length > 0) {
                            for (q = 0; q < health.length; q++) {
                                helUUID.push(health[q]['uuid']);
                            }
                        }
                    }
                }
            }
        }
    }
    var helLength = helUUID.length;
    for (i = 0; i < helLength; i++) {
        reqUrl = '/loadbalancer-healthmonitor/' + helUUID[i]
                + '?exclude_hrefs=true';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    }
    if (!dataObjArr.length) {
        callback(null, lbs);
        return;
    }
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiGet, true), function(error, results) {
        if (error) {
            var error = new appErrors.RESTServerError(
                    'Invalid loadbalancer pool member Data');
            callback(error, null);
            return;
        }
        mergeMemberHealthDetailToLB(lbs, results, function(lbs) {
            callback(null, lbs);
        });
    });
}

/**
 * @mergeMemberHealthDetailToLB
 * @private function
 * @Return call back it process loadbalancer-member details and
 *         loadbalancer-healthmonitor details merge it to loadbalancer-pool.
 * @param lbs
 * @param results
 * @param callback
 * @returns
 */
function mergeMemberHealthDetailToLB(lbs, results, callback) {
    logutils.logger.debug('mergeMemberHealthDetailToLB');
    if (lbs['loadbalancers'].length > 0 && results.length > 0) {
        for (var lb = 0; lb < lbs['loadbalancers'].length; lb++) {
            var llistener_ref = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'];
            if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                    && llistener_ref != null && llistener_ref.length > 0) {
                for (i = 0; i < llistener_ref.length; i++) {
                    var pool_ref = llistener_ref[i]['loadbalancer-pool'];
                    if (lbs['loadbalancers'][lb]['loadbalancer'] != null
                            && pool_ref != null && pool_ref.length > 0) {
                        for (k = 0; k < pool_ref.length; k++) {
                            var healthM = pool_ref[k]['loadbalancer-healthmonitor'];
                            if (healthM != undefined && healthM.length > 0) {
                                for (z = 0; z < healthM.length; z++) {
                                    for (var l = 0; l < results.length; l++) {
                                        if (results[l]['loadbalancer-healthmonitor'] != null) {
                                            if (healthM[z]['uuid'] == results[l]['loadbalancer-healthmonitor']['uuid']) {
                                                healthM[z] = results[l]['loadbalancer-healthmonitor'];
                                            }
                                        }
                                    }
                                }
                            }

                            var mem = lbs['loadbalancers'][lb]['loadbalancer']['loadbalancer-listener'][i]['loadbalancer-pool'][k]['loadbalancer-members'];
                            if (mem != undefined && mem.length > 0) {
                                for (q = 0; q < mem.length; q++) {
                                    for (var l = 0; l < results.length; l++) {
                                        if (results[l]['loadbalancer-member'] != null) {
                                            if (mem[q]['uuid'] == results[l]['loadbalancer-member']['uuid']) {
                                                mem[q] = results[l]['loadbalancer-member'];
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
    }
    callback(lbs);
}

function listListenersByLBId(request, response, appData) {
    logutils.logger.debug('listListenersByLBId');
    var lb_uuid = request.param('lbid');
    if (!(lb_uuid = request.param('lbid').toString())) {
        error = new appErrors.RESTServerError('Loadbalancer uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var lbURL = '/loadbalancer/' + lb_uuid;
    configApiServer.apiGet(lbURL, appData, function(error, lb) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        getLBaaSDetailsbyIdCB(lb, appData, function(error, lbs) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                var lb = lbs['loadbalancers'][0];
                listenerList = commonUtils.getValueByJsonPath(lb,
                        'loadbalancer;loadbalancer-listener', [], false);
                var reLis = [];
                _.each(listenerList, function(listener) {
                    reLis.push(listener);
                });
                commonUtils.handleJSONResponse(error, response, reLis);
            }
        });

    });
}

function getListenerById(request, response, appData) {
    logutils.logger.debug('getListenerById');
    var lb_uuid = request.param('lbid');
    var l_uuid = request.param('lid');
    if (!(lb_uuid = request.param('lbid').toString())) {
        error = new appErrors.RESTServerError('Loadbalancer uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!(l_uuid = request.param('lid').toString())) {
        error = new appErrors.RESTServerError('Listener uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var lbListURL = '/loadbalancer/' + lb_uuid;
    configApiServer.apiGet(lbListURL, appData, function(error, lb) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        getLBaaSDetailsbyIdCB(lb, appData, function(error, lbs) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                var lb = lbs['loadbalancers'][0];
                parseListenerbyId(l_uuid, lb, function(error, listener) {
                    commonUtils
                            .handleJSONResponse(error, response, listener[0]);
                });
            }
        });

    });
}

function parseListenerbyId(l_uuid, lb, callback) {
    logutils.logger.debug('parseListenerbyId');
    listenerList = commonUtils.getValueByJsonPath(lb,
            'loadbalancer;loadbalancer-listener', [], false);
    var reLis = [];
    _.each(listenerList, function(listener) {
        if (listener.uuid == l_uuid) {
            reLis.push(listener);
        }
    });
    callback(null, reLis);
}

function listPoolsByListernerId(request, response, appData) {
    logutils.logger.debug('listPoolsByListernerId');
    var lb_uuid = request.param('lbid');
    var l_uuid = request.param('lid');
    if (!(lb_uuid = request.param('lbid').toString())) {
        error = new appErrors.RESTServerError('Loadbalancer uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!(l_uuid = request.param('lid').toString())) {
        error = new appErrors.RESTServerError('Listener uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var lbListURL = '/loadbalancer/' + lb_uuid;
    configApiServer.apiGet(lbListURL, appData, function(error, lb) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        getLBaaSDetailsbyIdCB(lb, appData, function(error, lbs) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                var lb = lbs['loadbalancers'][0];
                parseListenerbyId(l_uuid, lb, function(error, listener) {
                    poolList = commonUtils.getValueByJsonPath(listener[0],
                            'loadbalancer-pool', [], false);
                    commonUtils.handleJSONResponse(error, response, poolList);
                });

            }
        });

    });
}

function parsePoolsbyListenerId(l_uuid, lb, callback) {
    logutils.logger.debug('parsePoolsbyListenerId');
    listenerList = commonUtils.getValueByJsonPath(lb,
            'loadbalancer;loadbalancer-listener', [], false);
    var reLis = [];
    _.each(listenerList, function(listener) {
        if (listener.uuid == l_uuid) {
            reLis.push(listener);
        }
    });

    poolList = commonUtils.getValueByJsonPath(reLis,
            'loadbalancer-listener;loadbalancer-pool', [], false);

    callback(null, poolList);
}

/**
 * @createLoadBalancer public function 1. URL
 *                     /api/tenants/config/lbaas/load-balancer - POST 2. Sets
 *                     Post Data and sends back the load-balancer config to
 *                     client
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function createLoadBalancer(request, response, appData) {
    logutils.logger.debug('createLoadBalancer');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }
    async.waterfall([
            async.apply(createNewVMIObject, request, response, appData,
                    postData),
            async.apply(createLoadBalancerValidate, appData),
            async.apply(createListenerValidate, appData),
            async.apply(createPoolMembers, appData),
            async.apply(createFloatingIPforLB, appData), ], function(error,
            postData) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        var lbId = postData["loadbalancer"]["uuid"];
        readLBwithUUID(lbId, appData, function(error, results) {
            commonUtils.handleJSONResponse(error, response, results);
        });
    });

}

/**
 * @createLoadBalancer private function 1. Basic validation before creating the
 *                     Load Balancer
 */
function createLoadBalancerValidate(appData, postData, callback) {
    logutils.logger.debug('createLoadBalancerValidate');
    if (!('loadbalancer' in postData)) {
        error = new appErrors.RESTServerError('Load Balancer object missing ');
        callback(error, postData);
        return;
    }
    var lbCreateURL = '/loadbalancers';
    var lbPostData = {};
    lbPostData.loadbalancer = postData['loadbalancer'];
    if ((!('loadbalancer' in lbPostData))
            || (!('fq_name' in lbPostData['loadbalancer']))) {
        error = new appErrors.RESTServerError('Enter Load Balancer Name ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer' in lbPostData))
            || (!('parent_type' in lbPostData['loadbalancer']))) {
        error = new appErrors.RESTServerError('Parent Type is required ');
        callback(error, null);
        return;
    }
    if (lbPostData['loadbalancer']['fq_name'].length > 2) {
        var uuid = UUID.create();
        lbPostData['loadbalancer']['uuid'] = uuid['hex'];
        lbPostData['loadbalancer']['fq_name'][2] = lbPostData['loadbalancer']['name']
                + '-' + uuid['hex'];
    }
    if ((!('loadbalancer' in lbPostData))
            || (!('vip_subnet_id' in lbPostData['loadbalancer']['loadbalancer_properties']))) {
        error = new appErrors.RESTServerError(
                'Select a subnet for Load Balancer ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer' in lbPostData))
            || (!('loadbalancer_provider' in lbPostData['loadbalancer']))) {
        error = new appErrors.RESTServerError(
                'Select a provider for Load Balancer ');
        callback(error, null);
        return;
    }
    lbPostData['loadbalancer']['display_name'] = lbPostData['loadbalancer']['name'];
    lbPostData['loadbalancer']['loadbalancer_properties']['provisioning_status'] = 'ACTIVE';
    lbPostData['loadbalancer']['loadbalancer_properties']['operating_status'] = 'ONLINE';
    configApiServer.apiPost(lbCreateURL, lbPostData, appData, function(error,
            lbData) {
        if (error) {
            callback(error, null);
            return;
        }
        // logutils.logger.debug('lbData:'+ JSON.stringify(lbData));
        var lbId = lbData['loadbalancer']['uuid'];
        readLBwithUUID(lbId, appData, function(err, lbData) {
            if (err) {
                callback(err, lbData);
                return;
            }
            postData['loadbalancer'] = lbData['loadbalancer'];
            callback(null, postData);
        });
    });

}

function createFloatingIPforLB(appData, postData, callback) {
    logutils.logger.debug('createFloatingIPforLB');
    if (!('loadbalancer_floatingip' in postData)) {
        logutils.logger.debug("no loadbalancer_floatingip object");
        callback(null, postData);
        return;
    }
    if (!('floating-ip' in postData['loadbalancer_floatingip'])) {
        logutils.logger
                .debug("no loadbalancer_floatingip - floating-ip object");
        callback(null, postData);
        return;
    }

    var fipPostData = {};
    fipPostData['floating-ip'] = postData['loadbalancer_floatingip']['floating-ip'];
    if ((!('floating-ip' in fipPostData))
            || (!('fq_name' in fipPostData['floating-ip']))
            || (!('floating_ip_fixed_ip_address' in fipPostData['floating-ip']))) {
        logutils.logger
                .debug("in floating-ip object no fq_name or floating_ip_fixed_ip_address properties");
        callback(null, postData);
        return;
    }
    var vmiRefs = postData['loadbalancer']['virtual_machine_interface_refs'][0];

    fipPostData['floating-ip']['virtual_machine_interface_refs'] = [ {
        'to' : vmiRefs['to']
    } ];

    var uVMIRefs = vmiRefs['to'][0] + ":" + vmiRefs['to'][1] + ":"
            + vmiRefs['to'][2] + ";"
            + fipPostData['floating-ip']['floating_ip_fixed_ip_address'];

    fipPostData['floating-ip']['user_created_virtual_machine_interface_refs'] = uVMIRefs;
    if ('floating-ip' in fipPostData
            && 'virtual_machine_interface_refs' in fipPostData['floating-ip']
            && fipPostData['floating-ip']['virtual_machine_interface_refs']
            && fipPostData['floating-ip']['virtual_machine_interface_refs'].length) {

        vmRef = fipPostData['floating-ip']['virtual_machine_interface_refs'][0];
        if ((!('to' in vmRef)) || (vmRef['to'].length != 3)) {
            logutils.logger.debug('Add valid Instance \n'
                    + JSON.stringify(vmRef));
            callback(null, postData);
            return;
        }
    }

    var fipPostURL = '/floating-ip/';
    fipPostURL += fipPostData['floating-ip']['uuid'];
    configApiServer.apiPut(fipPostURL, fipPostData, appData, function(error,
            data) {
        callback(null, postData);
    });
}

function readLBwithUUID(lbId, appData, callback) {
    logutils.logger.debug('readLBwithUUID');
    var lbListURL = '/loadbalancer/' + lbId;
    configApiServer.apiGet(lbListURL, appData, function(error, lb) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, lb);
    });
}

/**
 * @updateLoadBalancer public function 1. URL
 *                     /api/tenants/config/lbaas/load-balancer/:uuid - PUT 2.
 *                     Sets Post Data and sends back the load-balancer config to
 *                     client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function updateLoadBalancer(request, response, appData) {
    logutils.logger.debug('updateLoadBalancer');
    updateLoadBalancerCB(request, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @updateLoadBalancerCB private function 1. Callback for LoadBalancer update
 *                       operations 2. Send a call to Update the LoadBalancer
 *                       diff
 */
function updateLoadBalancerCB(request, appData, callback) {
    logutils.logger.debug('updateLoadBalancer');
    var lbId = request.param('uuid');
    var lbPutData = request.body;
    var lbPutURL = '/loadbalancer/';
    if (!('loadbalancer' in lbPutData)
            || (!('uuid' in lbPutData['loadbalancer']))) {
        error = new appErrors.RESTServerError(
                'loadbalancer object or its uuid missing ');
        callback(error, lbPutData);
        return;
    }
    var lbUUID = lbPutData['loadbalancer']['uuid'];
    if (lbId != lbUUID) {
        error = new appErrors.RESTServerError(
                'loadbalancer Id and listener Object uuid mismatch ');
        callback(error, lbPutData);
        return;
    }
    lbPutURL += lbUUID;
    lbPutData = removeLoadBalancerBackRefs(lbPutData);
    lbPutData = removeLoadBalancerRefs(lbPutData);
    jsonDiff.getConfigDiffAndMakeCall(lbPutURL, appData, lbPutData, function(
            locError, data) {
        error = appendMessage(locError, locError);
        callback(error, data);
    });
}

/**
 * removeLoadBalancerBackRefs private function 1. Callback for LoadBalancer
 * update operations 2. If any back reference is available in the object from UI
 * remove it from the object
 */
function removeLoadBalancerBackRefs(lbPutData) {
    if ('loadbalancer_listener_back_refs' in lbPutData['loadbalancer']) {
        delete lbPutData['loadbalancer']['loadbalancer_listener_back_refs'];
    }
    if ('service_appliance_set_refs' in lbPutData['loadbalancer']) {
        delete lbPutData['loadbalancer']['service_appliance_set_refs'];
    }
    return lbPutData;
}
/**
 * removeLoadBalancerRefs private function 1. Callback for LoadBalancer update
 * operations 2. If any back reference is available in the object from UI remove
 * it from the object
 */
function removeLoadBalancerRefs(lbPutData) {
    if ('service_instance_refs' in lbPutData['loadbalancer']) {
        delete lbPutData['loadbalancer']['service_instance_refs'];
    }
    if ('virtual_machine_interface_refs' in lbPutData['loadbalancer']) {
        delete lbPutData['loadbalancer']['virtual_machine_interface_refs'];
    }
    return lbPutData;
}

/**
 * @deleteLoadBalancer public function 1. URL
 *                     /api/tenants/config/lbaas/load-balancer/:uuid - DELETE 2.
 *                     Sets Post Data and sends back the load-balancer config to
 *                     client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function deleteLoadBalancer(request, response, appData) {
    logutils.logger.debug('deleteLoadBalancer');
    if (!(uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Load Balancer id missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var dataObj = {};
    dataObj.uuid = uuid;
    dataObj.request = request;
    dataObj.appData = appData;

    deleteLoadBalancerCB(dataObj, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        lastMessage = printMessage(results);
        commonUtils.handleJSONResponse(error, response, lastMessage);
    });
}

function deleteLoadBalancerbyIds(request, response, appData) {
    logutils.logger.debug('deleteLoadBalancerbyIds');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('uuids' in postData)) {
        error = new appErrors.RESTServerError(
                'Load Balancer uuids object missing ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var uuids = postData['uuids'];
    if (!(uuids.length)) {
        error = new appErrors.RESTServerError(
                'Load Balancer uuids list is empty ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var allDataArr = [];
    _.each(uuids, function(uuid) {
        allDataArr.push({
            uuid : uuid,
            request : request,
            appData : appData
        });
    });
    async.mapSeries(allDataArr, deleteLoadBalancerCB, function(error, outputs) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        lastMessage = printMessage(outputs);
        commonUtils.handleJSONResponse(error, response, lastMessage);
    });
}

function deleteLoadBalancerCB(dataObj, callback) {
    logutils.logger.debug('deleteLoadBalancerCB');
    var uuid = dataObj.uuid;
    var appData = dataObj.appData;
    var request = dataObj.request;
    readLBwithUUID(uuid, appData, function(err, lbData) {
        if (err) {
            callback(err, null);
            return;
        }
        var dataObj = {};
        dataObj.lbData = lbData;
        dataObj.request = request;
        dataObj.appData = appData;
        async.waterfall([ async.apply(deleteLoadBalancerRefs, dataObj),
                async.apply(deleteLoadBalancerById, dataObj),
                async.apply(deleteLoadBalancerVMIbyId, dataObj), ], function(
                error, result) {
            callback(error, result);
        });
    });
}

function deleteLoadBalancerById(dataObj, eMessage, callback) {
    var lbData = dataObj.lbData;
    var appData = dataObj.appData;
    var request = dataObj.request;
    var uuid = lbData['loadbalancer']['uuid'];
    configApiServer.apiDelete('/loadbalancer/' + uuid, appData, function(error,
            results) {
        if (error) {
            callback(error, null);
            return;
        }
        // logutils.logger.debug(JSON.stringify('deleteLoadBalancerCB:'+results));
        var newMessage = {};
        newMessage.message = "Load Balancer are deleted....";
        callback(null, appendMessage(newMessage, eMessage));
    });
}

function deleteLoadBalancerRefs(dataObj, callback) {
    logutils.logger.debug('deleteLoadBalancerRefs');
    var lbData = dataObj.lbData;
    var appData = dataObj.appData;
    var request = dataObj.request;
    var l_back_refs = commonUtils.getValueByJsonPath(lbData,
            'loadbalancer;loadbalancer_listener_back_refs', false);

    var allDataArr = [];
    _.each(l_back_refs, function(listener) {
        allDataArr.push({
            uuid : listener['uuid'],
            request : request,
            appData : appData
        });
    });

    var lUUIDs = [];
    _.each(l_back_refs, function(listener) {
        lUUIDs.push(listener['uuid']);
    });
    async.mapSeries(allDataArr, deleteListenerCB, function(error, outputs) {
        // deleteListenerCB(lUUIDs, appData, function(error, results) {
        callback(null, outputs);
    });

}

/**
 * @createListener public function 1. URL /api/tenants/config/lbaas/listener -
 *                 POST 2. Sets Post Data and sends back the listener config to
 *                 client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function createListener(request, response, appData) {
    logutils.logger.debug('createListener');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }
    async.waterfall([ async.apply(createListenerValidate, appData, postData),
            async.apply(createPoolMembers, appData) ],
            function(error, postData) {
                commonUtils.handleJSONResponse(error, response, postData);
            });
}

/**
 * @createLoadBalancer private function 1. Basic validation before creating the
 *                     Load Balancer
 */
function createListenerValidate(appData, postData, callback) {
    logutils.logger.debug('createListenerValidate');
    if (!('loadbalancer-listener' in postData)) {
        error = new appErrors.RESTServerError(
                'Load Balancer Listener object missing ');
        callback(error, postData);
        return;
    }
    var llCreateURL = '/loadbalancer-listeners';
    var llPostData = {};
    llPostData['loadbalancer-listener'] = postData['loadbalancer-listener'];
    if ((!('loadbalancer-listener' in llPostData))
            || (!('fq_name' in llPostData['loadbalancer-listener']))) {
        error = new appErrors.RESTServerError('Enter Load Balancer Name ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-listener' in llPostData))
            || (!('parent_type' in llPostData['loadbalancer-listener']))) {
        error = new appErrors.RESTServerError('Parent Type is required ');
        callback(error, null);
        return;
    }
    if (llPostData['loadbalancer-listener']['fq_name'].length > 2) {
        var uuid = UUID.create();
        llPostData['loadbalancer-listener']['uuid'] = uuid['hex'];
        llPostData['loadbalancer-listener']['fq_name'][2] = llPostData['loadbalancer-listener']['name']
                + '-' + uuid['hex'];
    }

    if ((!('loadbalancer-listener' in llPostData))
            || (!('protocol' in llPostData['loadbalancer-listener']['loadbalancer_listener_properties']))) {
        error = new appErrors.RESTServerError('Listener Protocol is missing ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-listener' in llPostData))
            || (!('protocol_port' in llPostData['loadbalancer-listener']['loadbalancer_listener_properties']))) {
        error = new appErrors.RESTServerError('Listener Port is missing ');
        callback(error, null);
        return;
    }

    llPostData['loadbalancer-listener']['display_name'] = llPostData['loadbalancer-listener']['name'];
    llPostData['loadbalancer-listener']['loadbalancer_refs'] = [ {
        'to' : postData['loadbalancer']['fq_name']
    } ];

    configApiServer
            .apiPost(
                    llCreateURL,
                    llPostData,
                    appData,
                    function(error, llData) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        var llId = llData['loadbalancer-listener']['uuid'];
                        readLLwithUUID(
                                llId,
                                appData,
                                function(err, llData) {
                                    if (err) {
                                        callback(err, llData);
                                        return;
                                    }
                                    postData['loadbalancer-listener'] = llData['loadbalancer-listener'];
                                    callback(null, postData);
                                });
                    });
}

function readLLwithUUID(llId, appData, callback) {
    logutils.logger.debug('readLLwithUUID');
    var llURL = '/loadbalancer-listener/' + llId;
    configApiServer.apiGet(llURL, appData, function(error, listener) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, listener);
    });
}

/**
 * updateListener public function 1. URL
 * /api/tenants/config/lbaas/listener/:uuid - PUT 2. Sets Post Data and sends
 * back the listener config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function updateListener(request, response, appData) {
    logutils.logger.debug('updateListener');
    updateListenerCB(request, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @updateListenerCB private function 1. Callback for Listener update operations
 *                   2. Send a call to Update the Listener diff
 */
function updateListenerCB(request, appData, callback) {
    logutils.logger.debug('updateListenerCB');
    var lisId = request.param('uuid');
    var lisPutData = request.body;
    var lisPutURL = '/loadbalancer-listener/';
    if (!('loadbalancer-listener' in lisPutData)
            || (!('uuid' in lisPutData['loadbalancer-listener']))) {
        error = new appErrors.RESTServerError(
                'listener object or its uuid missing ');
        callback(error, lisPutData);
        return;
    }
    var lisUUID = lisPutData['loadbalancer-listener']['uuid'];
    if (lisId != lisUUID) {
        error = new appErrors.RESTServerError(
                'listener Id and listener Object uuid mismatch ');
        callback(error, lisPutData);
        return;
    }
    lisPutURL += lisUUID;
    lisPutData = removeListenerBackRefs(lisPutData);
    lisPutData = removeListenerRefs(lisPutData);
    jsonDiff.getConfigDiffAndMakeCall(lisPutURL, appData, lisPutData, function(
            locError, data) {
        error = appendMessage(locError, locError);
        callback(error, data);
    });
}

/**
 * removeListenerBackRefs private function 1. Callback for Listener update
 * operations 2. If any back reference is available in the object from UI remove
 * it from the object
 */
function removeListenerBackRefs(lisPutData) {
    if ('loadbalancer_pool_back_refs' in lisPutData['loadbalancer-listener']) {
        delete lisPutData['loadbalancer-listener']['loadbalancer_pool_back_refs'];
    }
    return lisPutData;
}
/**
 * removeListenerRefs private function 1. Callback for Listener update
 * operations 2. If any back reference is available in the object from UI remove
 * it from the object
 */
function removeListenerRefs(lisPutData) {
    if ('loadbalancer_refs' in lisPutData['loadbalancer-listener']) {
        delete lisPutData['loadbalancer-listener']['loadbalancer_refs'];
    }
    return lisPutData;
}

/**
 * deleteListener public function 1. URL
 * /api/tenants/config/lbaas/listener/:uuid - DELETE 2. Sets Post Data and sends
 * back the listener config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function deleteListener(request, response, appData) {
    logutils.logger.debug('deleteListener');
    if (!(uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Listener id missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var dataObj = {
        uuid : uuid,
        request : request,
        appData : appData
    }
    deleteListenerCB(dataObj, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function deleteListenerbyIds(request, response, appData) {
    logutils.logger.debug('deleteListener');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('uuids' in postData)) {
        error = new appErrors.RESTServerError('Listener uuids object missing ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var uuids = postData['uuids'];
    if (!(uuids.length)) {
        error = new appErrors.RESTServerError('Listener uuids list is empty ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var allDataArr = [];
    _.each(uuids, function(uuid) {
        allDataArr.push({
            uuid : uuid,
            request : request,
            appData : appData
        });
    });
    async.mapSeries(allDataArr, deleteListenerCB, function(error, results) {
        lastMessage = printMessage(results);
        commonUtils.handleJSONResponse(error, response, lastMessage);
    });
}
function deleteListenerCB(dataObj, callback) {
    logutils.logger.debug('deleteListenerCB:');
    var uuid = dataObj.uuid;
    var appData = dataObj.appData;
    var request = dataObj.request;
    deleteListenerRefs(dataObj, function(error, outputs) {
        var dataObjArr = [];
        var reqUrl = '/loadbalancer-listener/' + uuid;
        commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_DELETE, null, null, null, appData);
        async.map(dataObjArr, commonUtils.getAPIServerResponse(
                configApiServer.apiDelete, true), function(error, results) {
            if (error) {
                callback(error, null);
                return;
            }
            lastMessage = printMessage(outputs);
            var newMessage = {};
            newMessage.message = "Listener deleted....";
            callback(null, appendMessage(newMessage, lastMessage));
        });
    });
}

function deleteListenerRefs(dataObj, callback) {
    logutils.logger.debug('deleteListenerRefs');
    var uuid = dataObj.uuid;
    var appData = dataObj.appData;
    var request = dataObj.request;

    var dataObjArr = [];

    reqUrl = '/loadbalancer-listener/' + uuid;
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null,
            null, null, appData);

    async
            .map(
                    dataObjArr,
                    commonUtils.getAPIServerResponse(configApiServer.apiGet,
                            true),
                    function(error, results) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        var pool_back_refs;
                        for (i = 0; i < results.length; i++) {
                            pool_back_refs = commonUtils
                                    .getValueByJsonPath(
                                            results[i],
                                            'loadbalancer-listener;loadbalancer_pool_back_refs',
                                            false);
                        }
                        var pUUIDs = [];
                        for (i = 0; i < pool_back_refs.length; i++) {
                            pUUIDs.push(pool_back_refs[i]['uuid']);
                        }
                        // logutils.logger.debug(pUUIDs);
                        if (pUUIDs == undefined || pUUIDs == false) {
                            callback(null, '');
                            return;
                        }
                        deletePoolCB(
                                pUUIDs,
                                appData,
                                function(error, results) {
                                    var newMessage = {};
                                    newMessage.message = "All Listener refs are deleted....";
                                    // logutils.logger.debug("............"+lastMessage);
                                    callback(null, appendMessage(newMessage,
                                            results));
                                });
                    });
}

function getPoolByListenerId(request, response, appData) {
    logutils.logger.debug('getPoolById');
    var lb_uuid = request.param('lbid');
    var l_uuid = request.param('lid');
    var p_uuid = request.param('pid');
    if (!(lb_uuid = request.param('lbid').toString())) {
        error = new appErrors.RESTServerError('Loadbalancer uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!(l_uuid = request.param('lid').toString())) {
        error = new appErrors.RESTServerError('Listener uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(p_uuid = request.param('pid').toString())) {
        error = new appErrors.RESTServerError('Pool uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var lbListURL = '/loadbalancer/' + lb_uuid;
    configApiServer.apiGet(lbListURL, appData, function(error, lb) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        getLBaaSDetailsbyIdCB(lb, appData, function(error, lbs) {
            if (error) {
                commonUtils.handleJSONResponse(error, response, null);
            } else {
                var lb = lbs['loadbalancers'][0];
                parseListenerbyId(l_uuid, lb, function(error, listener) {
                    poolList = commonUtils.getValueByJsonPath(listener[0],
                            'loadbalancer-pool', [], false);

                    var reLis = [];
                    _.each(poolList, function(pool) {
                        if (pool.uuid == p_uuid) {
                            reLis.push(pool);
                        }
                    });
                    commonUtils.handleJSONResponse(error, response, reLis);
                });
            }
        });
    });
}

function getPoolById(request, response, appData) {
    logutils.logger.debug('getPoolById');
    if (!(p_uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Pool uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readPoolwithUUID(p_uuid, appData, function(err, results) {
        if (err) {
            callback(err, results);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @createPoolMembers private function 1. Basic validation before creating the
 *                    Load Balancer - Pool
 */
function createPoolMembers(appData, postData, callback) {
    logutils.logger.debug('createPoolMembers');
    async.waterfall([
            async.apply(createHealthMonitorValidate, appData, postData),
            async.apply(createPoolValidate, appData),
            async.apply(createPoolMember, appData) ], function(err, postData) {
        if (err) {
            callback(err, null);
        }
        callback(null, postData);
    });
}

function createPoolMember(appData, postData, callback) {
    logutils.logger.debug('createPoolMember');
    if (!('loadbalancer-member' in postData)) {
        callback(null, postData);
        return;
    }
    var members = postData['loadbalancer-member'];
    var allDataObj = [];
    if (members.length > 0) {
        _.each(members, function(member) {
            var mObj = {};
            mObj['loadbalancer-member'] = member;
            mObj['appData'] = appData;
            allDataObj.push(mObj);
        });
    }
    async.mapSeries(allDataObj, createMemberValidate, function(err, data) {
        postData['loadbalancer-member'] = data;
        callback(null, postData);
    });
}

/**
 * @createPool public function 1. URL /api/tenants/config/lbaas/pool - POST 2.
 *             Sets Post Data and sends back the Pool config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function createPool(request, response, appData) {
    logutils.logger.debug('createPool');
    createPoolValidate(request, request.body, appData,
            function(error, results) {
                commonUtils.handleJSONResponse(error, response, results);
            });
}
/**
 * createPoolValidate private function 1. Basic validation before creating the
 * Load Balancer - Pool
 */
function createPoolValidate(appData, postData, callback) {
    logutils.logger.debug('createPoolValidate');
    if (!('loadbalancer-pool' in postData)) {
        error = new appErrors.RESTServerError(
                'Load Balancer Pool object missing ');
        callback(error, postData);
        return;
    }
    var pCreateURL = '/loadbalancer-pools';
    var pPostData = {};
    pPostData['loadbalancer-pool'] = postData['loadbalancer-pool'];
    if ((!('loadbalancer-pool' in pPostData))
            || (!('fq_name' in pPostData['loadbalancer-pool']))) {
        error = new appErrors.RESTServerError('Enter Pool Name ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-pool' in pPostData))
            || (!('parent_type' in pPostData['loadbalancer-pool']))) {
        error = new appErrors.RESTServerError('Parent Type is required ');
        callback(error, null);
        return;
    }
    if (pPostData['loadbalancer-pool']['fq_name'].length > 2) {
        var uuid = UUID.create();
        pPostData['loadbalancer-pool']['uuid'] = uuid['hex'];
        pPostData['loadbalancer-pool']['fq_name'][2] = pPostData['loadbalancer-pool']['name']
                + '-' + uuid['hex'];
    }

    if ((!('loadbalancer-pool' in pPostData))
            || (!('loadbalancer_pool_properties' in pPostData['loadbalancer-pool']))) {
        error = new appErrors.RESTServerError('Pool Properties are missing ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-pool' in pPostData))
            || (!('loadbalancer_method' in pPostData['loadbalancer-pool']['loadbalancer_pool_properties']))) {
        error = new appErrors.RESTServerError('Pool Method is missing ');
        callback(error, null);
        return;
    }
    pPostData['loadbalancer-pool']['display_name'] = pPostData['loadbalancer-pool']['name'];
    pPostData['loadbalancer-pool']['loadbalancer_listener_refs'] = [ {
        'to' : postData['loadbalancer-listener']['fq_name']
    } ];

    if ((!('loadbalancer_healthmonitor' in pPostData))
            || (!('uuid' in pPostData['loadbalancer_healthmonitor']))) {
        pPostData['loadbalancer-pool']['loadbalancer_healthmonitor_refs'] = [ {
            'to' : postData['loadbalancer-healthmonitor']['fq_name']
        } ];
    }
    // logutils.logger.debug('pPostData:'+ JSON.stringify(pPostData));
    configApiServer
            .apiPost(
                    pCreateURL,
                    pPostData,
                    appData,
                    function(error, pData) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        var pId = pData['loadbalancer-pool']['uuid'];
                        readPoolwithUUID(
                                pId,
                                appData,
                                function(err, pData) {
                                    if (err) {
                                        callback(err, pData);
                                        return;
                                    }

                                    if (('loadbalancer-member' in postData)) {
                                        var mLength = postData['loadbalancer-member'].length;
                                        for (i = 0; i < mLength; i++) {
                                            postData['loadbalancer-member'][i]['fq_name'][2] = pData['loadbalancer-pool']['name'];
                                            postData['loadbalancer-member'][i]['parent_type'] = 'loadbalancer-pool';
                                        }
                                    }
                                    postData['loadbalancer-pool'] = pData['loadbalancer-pool'];
                                    // logutils.logger.debug('postData:'+
                                    // JSON.stringify(postData));
                                    callback(err, postData);
                                });
                    });
}

function readPoolwithUUID(pId, appData, callback) {
    logutils.logger.debug('readPoolwithUUID');
    var pURL = '/loadbalancer-pool/' + pId;
    configApiServer.apiGet(pURL, appData, function(error, pool) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, pool);
    });
}

/**
 * updatePool public function 1. URL /api/tenants/config/lbaas/pool/:uuid - PUT
 * 2. Sets Post Data and sends back the Pool config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function updatePool(request, response, appData) {
    logutils.logger.debug('updatePool');
    updatePoolCB(request, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @updatePoolCB private function 1. Callback for pool update operations 2. Send
 *               a call to Update the Pool diff
 */
function updatePoolCB(request, appData, callback) {
    logutils.logger.debug('updatePoolCB');
    if (!(poolId = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Pooluuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var poolPutData = request.body;
    var poolPutURL = '/loadbalancer-pool/';
    if (!('loadbalancer-pool' in poolPutData)
            || (!('uuid' in poolPutData['loadbalancer-pool']))) {
        error = new appErrors.RESTServerError(
                'pool object or its uuid missing ');
        callback(error, poolPutData);
        return;
    }
    var poolUUID = poolPutData['loadbalancer-pool']['uuid'];
    if (poolId != poolUUID) {
        error = new appErrors.RESTServerError(
                'pool Id and pool Object uuid mismatch ');
        callback(error, poolPutData);
        return;
    }
    poolPutURL += poolUUID;
    poolPutData = removePoolBackRefs(poolPutData);
    poolPutData = removePoolRefs(poolPutData);
    jsonDiff.getConfigDiffAndMakeCall(poolPutURL, appData, poolPutData,
            function(locError, data) {
                error = appendMessage(locError, locError);
                callback(error, data);
            });
}

/**
 * removePoolBackRefs private function 1. Callback for Pool update operations 2.
 * If any back reference is available in the object from UI remove it from the
 * object
 */
function removePoolBackRefs(poolPutData) {
    if ('loadbalancer_listener_refs' in poolPutData['loadbalancer-pool']) {
        delete poolPutData['loadbalancer-pool']['loadbalancer_listener_refs'];
    }
    if ('loadbalancer_healthmonitor_refs' in poolPutData['loadbalancer-pool']) {
        delete poolPutData['loadbalancer-pool']['loadbalancer_healthmonitor_refs'];
    }
    return poolPutData;
}
/**
 * removePoolRefs private function 1. Callback for Pool update operations 2. If
 * any back reference is available in the object from UI remove it from the
 * object
 */
function removePoolRefs(poolPutData) {
    if ('loadbalancer_members' in poolPutData['loadbalancer-pool']) {
        delete poolPutData['loadbalancer-pool']['loadbalancer_members'];
    }
    return poolPutData;
}

/**
 * deletePool public function 1. URL /api/tenants/config/lbaas/pool/:uuid -
 * DELETE 2. Sets Post Data and sends back the Pool config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function deletePool(request, response, appData) {
    if (!(uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Pool id missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var pIds = [];
    pIds.push(uuid);
    deletePoolCB(pIds, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function deletePoolByIds(request, response, appData) {
    logutils.logger.debug('deletePoolByIds');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('uuids' in postData)) {
        error = new appErrors.RESTServerError('Pool uuids object missing ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var uuids = postData['uuids'];
    if (!(uuids.length)) {
        error = new appErrors.RESTServerError('Pool uuids list is empty ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    deletePoolCB(uuids, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function deletePoolCB(pIds, appData, callback) {
    getPoolListbyIds(pIds, appData, function(error, pLists) {
        var allDataArr = [];
        for (i = 0; i < pLists.length; i++) {
            if (pLists[i]['loadbalancer-pool'] != null) {
                var ref = {};
                ref['loadbalancer-pool'] = pLists[i]['loadbalancer-pool'];
                allDataArr.push({
                    pData : ref,
                    appData : appData
                });
            }
        }
        async.mapSeries(allDataArr, deletePoolMembers,
                function(error, results) {
                    lastMessage = printMessage(results);
                    callback(null, lastMessage);
                });
    });
}

function deletePoolMembers(pDataObj, callback) {
    async.waterfall([ async.apply(deleteMembersbypData, pDataObj),
            async.apply(deletePoolsBypData, pDataObj),
            async.apply(deleteHealthMonitorsbypData, pDataObj), ], function(
            err, results) {
        if (err) {
            callback(err, null);
        }
        callback(null, results);
    });
}

function getPoolListbyIds(pIds, appData, callback) {
    logutils.logger.debug('getPoolListbyIds');
    if (!pIds.length) {
        callback(null, null);
        return;
    }
    var dataObjArr = [];
    _.each(pIds, function(pId) {
        reqUrl = '/loadbalancer-pool/' + pId
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                null, null, null, appData);
    });
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiGet, true), function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, results);
    });
}

function deletePoolsBypData(pDataObj, message, callback) {
    logutils.logger.debug('deletePoolsBypData');
    var appData = pDataObj['appData'];
    var pId = pDataObj['pData'];
    var dataObjArr = [];
    reqUrl = '/loadbalancer-pool/' + pId['loadbalancer-pool']['uuid']
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_DELETE,
            null, null, null, appData);
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiDelete, true), function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var newMessage = {};
        newMessage.message = "Pools are deleted....";
        callback(null, appendMessage(newMessage, message));
    });
}

function getMemberById(request, response, appData) {
    logutils.logger.debug('getMemberByPoolId');
    if (!(m_uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Member uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readMemberwithUUID(m_uuid, appData, function(err, results) {
        if (err) {
            callback(err, results);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @createMember public function 1. URL /api/tenants/config/lbaas/:pid/member -
 *               POST 2. Sets Post Data and sends back the Member config to
 *               client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function createMember(request, response, appData) {
    logutils.logger.debug('createMember');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        callback(error, null);
        return;
    }
    if (!(p_uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Pool uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('loadbalancer-member' in postData)) {
        error = new appErrors.RESTServerError(
                'Load Balancer Members object missing ');
        callback(error, postData);
        return;
    }
    readPoolwithUUID(
            p_uuid,
            appData,
            function(error, poolData) {
                if (error) {
                    callback(error, null);
                    return;
                }

                var members = commonUtils.cloneObj(postData);
                // logutils.logger.debug(members);
                var allDataObj = [];
                if (members['loadbalancer-member'].length > 0) {
                    for (i = 0; i < members['loadbalancer-member'].length; i++) {
                        members['loadbalancer-member'][i]['fq_name'][2] = poolData['loadbalancer-pool']['name'];
                        members['loadbalancer-member'][i]['parent_type'] = 'loadbalancer-pool';
                        var mObj = {};
                        mObj['loadbalancer-member'] = members['loadbalancer-member'][i];
                        // logutils.logger.debug('mObj:'+ JSON.stringify(mObj));
                        mObj['appData'] = appData;
                        allDataObj.push(mObj);
                    }
                }
                async.mapSeries(allDataObj, createMemberValidate, function(err,
                        data) {
                    postData['loadbalancer-member'] = data;
                    commonUtils.handleJSONResponse(error, response, postData);
                });
            });
}

/**
 * @createMemberValidate private function 1. Basic validation before creating
 *                       the Load Balancer - Pool
 */
function createMemberValidate(dataObj, callback) {
    logutils.logger.debug('createMemberValidate');
    if (!('loadbalancer-member' in dataObj)) {
        error = new appErrors.RESTServerError(
                'Load Balancer Pool Member object missing ');
        callback(error, postData);
        return;
    }
    var appData = dataObj['appData'];
    var postData = {};
    postData['loadbalancer-member'] = dataObj['loadbalancer-member'];

    var mCreateURL = '/loadbalancer-members';

    var mPostData = {};
    mPostData['loadbalancer-member'] = postData['loadbalancer-member'];
    if ((!('loadbalancer-member' in mPostData))
            || (!('fq_name' in mPostData['loadbalancer-member']))) {
        error = new appErrors.RESTServerError('Enter Pool Name ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-member' in mPostData))
            || (!('parent_type' in mPostData['loadbalancer-member']))) {
        error = new appErrors.RESTServerError('Parent Type is required ');
        callback(error, null);
        return;
    }
    if (mPostData['loadbalancer-member']['fq_name'].length > 2) {
        var uuid = UUID.create();
        mPostData['loadbalancer-member']['uuid'] = uuid['hex'];
        mPostData['loadbalancer-member']['name'] = uuid['hex'];
        mPostData['loadbalancer-member']['fq_name'][3] = uuid['hex'];
    }
    if ((!('loadbalancer-member' in mPostData))
            || (!('loadbalancer_member_properties' in mPostData['loadbalancer-member']))) {
        error = new appErrors.RESTServerError('Member Properties are missing ');
        callback(error, null);
        return;
    }
    mPostData['loadbalancer-member']['display_name'] = mPostData['loadbalancer-member']['uuid'];
    delete mPostData['loadbalancer-member']['loadbalancer_member_properties']['vip_subnet_id'];

    configApiServer.apiPost(mCreateURL, mPostData, appData, function(error,
            mData) {
        if (error) {
            callback(error, null);
            return;
        }
        var mId = mData['loadbalancer-member']['uuid'];
        readMemberwithUUID(mId, appData, function(err, results) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, results);
        });
    });
}

function readMemberwithUUID(mId, appData, callback) {
    logutils.logger.debug('readMemberwithUUID');
    var mURL = '/loadbalancer-member/' + mId;
    configApiServer.apiGet(mURL, appData, function(error, member) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, member);
    });
}

/**
 * @updateMember public function 1. URL /api/tenants/config/lbaas/member/:uuid -
 *               PUT 2. Sets Post Data and sends back the Member config to
 *               client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function updateMember(request, response, appData) {
    logutils.logger.debug('updateMember');
    updateMemberCB(request, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @updateMemberCB private function 1. Callback for Member update operations 2.
 *                 Send a call to Update the Member diff
 */
function updateMemberCB(request, appData, callback) {
    logutils.logger.debug('updateMemberCB');
    if (!(memId = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Member uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var memPutURL = '/loadbalancer-member/';
    var memPutData = request.body;
    if (!('loadbalancer-member' in memPutData)
            || (!('uuid' in memPutData['loadbalancer-member']))) {
        error = new appErrors.RESTServerError(
                'Member object or its uuid missing');
        callback(error, memPutData);
        return;
    }
    var memUUID = memPutData['loadbalancer-member']['uuid'];

    if (memId != memUUID) {
        error = new appErrors.RESTServerError(
                'Member Id and Member Object uuid mismatch ');
        callback(error, memPutData);
        return;
    }

    memPutURL += memUUID;
    jsonDiff.getConfigDiffAndMakeCall(memPutURL, appData, memPutData, function(
            locError, data) {
        error = appendMessage(locError, locError);
        callback(error, data);
    });
}

/**
 * @deleteMember public function 1. URL /api/tenants/config/lbaas/member/:uuid -
 *               DELETE 2. Sets Post Data and sends back the Member config to
 *               client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function deleteMember(request, response, appData) {
    if (!(uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Member id missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var mIds = [];
    mIds.push(uuid);
    deleteMembersByUUIDList(mIds, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function deleteMemberByIds(request, response, appData) {
    logutils.logger.debug('deletePoolByIds');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('uuids' in postData)) {
        error = new appErrors.RESTServerError('Pool uuids object missing ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var uuids = postData['uuids'];
    if (!(uuids.length)) {
        error = new appErrors.RESTServerError('Pool uuids list is empty ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    deleteMembersByUUIDList(uuids, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

function deleteMembersbypData(pDataObj, callback) {
    var appData = pDataObj['appData'];
    var pId = pDataObj['pData'];
    var memberRef = pId['loadbalancer-pool']['loadbalancer_members'];
    var mIds = [];
    var eMessage = {};
    eMessage.message = "";
    if (memberRef != undefined && memberRef.length > 0) {
        _.each(memberRef, function(member) {
            mIds.push(member['uuid']);
        });
    }
    deleteMembersByUUIDList(mIds, appData, function(error, newMessage) {
        callback(null, appendMessage(newMessage, eMessage));
    });
}

function deleteMembersByUUIDList(mIds, appData, callback) {
    logutils.logger.debug('deleteMembersByUUIDList');
    var dataObjArr = [];
    _.each(mIds, function(mId) {
        reqUrl = '/loadbalancer-member/' + mId;
        commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_DELETE, null, null, null, appData);
    });
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiDelete, true), function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var newMessage = {};
        newMessage.message = "Members are deleted....";
        callback(null, appendMessage(newMessage, null));
    });
}

function getHealthMonitorById(request, response, appData) {
    logutils.logger.debug('getHealthMonitorById');
    if (!(hm_uuid = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Health Monitor uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readHMwithUUID(hm_uuid, appData, function(err, results) {
        if (err) {
            callback(err, results);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @createHealthMonitor public function 1. URL
 *                      /api/tenants/config/lbaas/health-monitor - POST 2. Sets
 *                      Post Data and sends back the Health Monitor config to
 *                      client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function createHealthMonitor(request, response, appData) {
    createHealthMonitorValidate(appData, request.body,
            function(error, results) {
                commonUtils.handleJSONResponse(error, response, results);
            });
}

/**
 * createHealthMonitorValidate private function 1. Basic validation before
 * creating the Load Balancer - Pool
 */
function createHealthMonitorValidate(appData, postData, callback) {
    logutils.logger.debug('createHealthMonitorValidate');
    if (!('loadbalancer-healthmonitor' in postData)) {
        error = new appErrors.RESTServerError(
                'Load Balancer Pool Health Monitor object missing ');
        callback(error, postData);
        return;
    }
    var hmCreateURL = '/loadbalancer-healthmonitors';

    var hmPostData = {};
    hmPostData['loadbalancer-healthmonitor'] = postData['loadbalancer-healthmonitor'];

    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('fq_name' in hmPostData['loadbalancer-healthmonitor']))) {
        error = new appErrors.RESTServerError('Enter Health Monitor Name ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('parent_type' in hmPostData['loadbalancer-healthmonitor']))) {
        error = new appErrors.RESTServerError('Parent Type is required ');
        callback(error, null);
        return;
    }
    if (hmPostData['loadbalancer-healthmonitor']['fq_name'].length > 2) {
        var uuid = UUID.create();
        hmPostData['loadbalancer-healthmonitor']['uuid'] = uuid['hex'];
        hmPostData['loadbalancer-healthmonitor']['fq_name'][2] = uuid['hex'];
        hmPostData['loadbalancer-healthmonitor']['display_name'] = uuid['hex'];
    }

    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('loadbalancer_healthmonitor_properties' in hmPostData['loadbalancer-healthmonitor']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor Properties are missing ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('delay' in hmPostData['loadbalancer-healthmonitor']['loadbalancer_healthmonitor_properties']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor delay is missing ');
        callback(error, null);
        return;
    }

    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('monitor_type' in hmPostData['loadbalancer-healthmonitor']['loadbalancer_healthmonitor_properties']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor monitor_type is missing ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('max_retries' in hmPostData['loadbalancer-healthmonitor']['loadbalancer_healthmonitor_properties']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor max_retries is missing ');
        callback(error, null);
        return;
    }
    if ((!('loadbalancer-healthmonitor' in hmPostData))
            || (!('timeout' in hmPostData['loadbalancer-healthmonitor']['loadbalancer_healthmonitor_properties']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor timeout is missing ');
        callback(error, null);
        return;
    }
    configApiServer
            .apiPost(
                    hmCreateURL,
                    hmPostData,
                    appData,
                    function(error, hmData) {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        var hmId = hmData['loadbalancer-healthmonitor']['uuid'];
                        readHMwithUUID(
                                hmId,
                                appData,
                                function(err, hmData) {
                                    if (err) {
                                        callback(err, postData);
                                        return;
                                    }
                                    postData['loadbalancer-healthmonitor'] = hmData['loadbalancer-healthmonitor'];
                                    callback(null, postData);
                                });
                    });
}

function readHMwithUUID(hmId, appData, callback) {
    logutils.logger.debug('readHMwithUUID');
    var pURL = '/loadbalancer-healthmonitor/' + hmId;
    configApiServer.apiGet(pURL, appData, function(error, hm) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, hm);
    });
}

/**
 * updateHealthMonitor public function 1. URL
 * /api/tenants/config/lbaas/health-monitor/:uuid - PUT 2. Sets Post Data and
 * sends back the HealthMonitor config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function updateHealthMonitor(request, response, appData) {
    logutils.logger.debug('updateHealthMonitor');
    updateHealthMonitorCB(request, appData, function(error, results) {
        commonUtils.handleJSONResponse(error, response, results);
    });
}

/**
 * @updateHealthMonitorCB private function 1. Callback for HealthMonitor update
 *                        operations 2. Send a call to Update the HM diff
 */
function updateHealthMonitorCB(request, appData, callback) {
    logutils.logger.debug('updateHealthMonitorCB');
    if (!(hmId = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Health Monitor uuid is missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var hmPutData = request.body;
    var hmPutURL = '/loadbalancer-healthmonitor/';
    if (!('loadbalancer-healthmonitor' in hmPutData)
            || (!('uuid' in hmPutData['loadbalancer-healthmonitor']))) {
        error = new appErrors.RESTServerError(
                'Health Monitor object or its uuid missing ');
        callback(error, hmPutData);
        return;
    }
    var hmUUID = hmPutData['loadbalancer-healthmonitor']['uuid'];
    if (hmId != hmUUID) {
        error = new appErrors.RESTServerError(
                'healthmonitor Id and healthmonitor Object uuid mismatch ');
        callback(error, hmPutData);
        return;
    }

    hmPutURL += hmUUID;
    hmPutData = removeHMBackRefs(hmPutData);
    jsonDiff.getConfigDiffAndMakeCall(hmPutURL, appData, hmPutData, function(
            locError, data) {
        error = appendMessage(locError, locError);
        callback(error, data);
    });
}

/**
 * @removeHMBackRefs private function 1. Callback for Health Monitor update
 *                   operations 2. If any back reference is available in the
 *                   object from UI remove it from the object
 */
function removeHMBackRefs(hmPutData) {
    if ('loadbalancer_pool_back_refs' in hmPutData['loadbalancer-healthmonitor']) {
        delete hmPutData['loadbalancer-healthmonitor']['loadbalancer_pool_back_refs'];
    }
    return hmPutData;
}

/**
 * deleteHealthMonitor public function 1. URL
 * /api/tenants/config/lbaas/health-monitor/:uuid - DELETE 2. Sets Post Data and
 * sends back the HealthMonitor config to client
 * 
 * @param request
 * @param response
 * @param appData
 * @returns
 */
function deleteHealthMonitor(request, response, appData) {
    if (!(hmId = request.param('uuid').toString())) {
        error = new appErrors.RESTServerError('Health Monitor id missing');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    deleteHealthMonitorCB(hmId, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}
function deleteHealthMonitorByIds(request, response, appData) {
    logutils.logger.debug('deletePoolByIds');
    var postData = request.body;
    if (typeof (postData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if (!('uuids' in postData)) {
        error = new appErrors.RESTServerError(
                'Health Monitor uuids object missing ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var uuids = postData['uuids'];
    if (!(uuids.length)) {
        error = new appErrors.RESTServerError(
                'Health Monitor uuids list is empty ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    deleteHealthMonitorsByUUIDList(uuids, appData, function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
        commonUtils.handleJSONResponse(error, response, results);
    });
}
function deleteHealthMonitorCB(uuid, appData, callback) {
    configApiServer.apiDelete('/loadbalancer-healthmonitor/' + uuid, appData,
            function(error, results) {
                if (error) {
                    callback(error, null)
                    return;
                }
                callback(null, results)
            });
}

function deleteHealthMonitorsbypData(pDataObj, eMessage, callback) {
    logutils.logger.debug('deleteHealthMonitorsbypData');
    var appData = pDataObj['appData'];
    var pId = pDataObj['pData'];
    var allDataArr = [];
    var ref = pId['loadbalancer-pool']['loadbalancer_healthmonitor_refs'];
    var hmIds = [];
    if (ref != undefined && ref.length > 0) {
        _.each(ref, function(hm) {
            hmIds.push(hm['uuid']);
        });
    }
    deleteHealthMonitorsByUUIDList(hmIds, appData, function(error, newMessage) {
        callback(null, appendMessage(newMessage, eMessage));
    });
}

function deleteHealthMonitorsByUUIDList(hmIds, appData, callback) {
    logutils.logger.debug('deleteMembersByUUIDList');
    var dataObjArr = [];
    _.each(hmIds, function(id) {
        reqUrl = '/loadbalancer-healthmonitor/' + id;
        commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_DELETE, null, null, null, appData);
    });
    async.map(dataObjArr, commonUtils.getAPIServerResponse(
            configApiServer.apiDelete, true), function(error, results) {
        if (error) {
            callback(error, null);
            return;
        }
        var newMessage = {};
        newMessage.message = "Health Monitor are deleted....";
        callback(null, newMessage);
    });
}

function createNewVMIObject(request, response, appData, postData, callback) {
    logutils.logger.debug('createNewVMIObject');
    var lbPostData = {};
    lbPostData.loadbalancer = postData['loadbalancer'];
    if ((!('loadbalancer' in lbPostData))
            || (!('virtual_machine_interface_refs' in lbPostData['loadbalancer']))) {
        error = new appErrors.RESTServerError(
                'Load Balancer(s) virtual machine interface reference object missing... ');
        callback(error, null);
        return;
    }
    var vmiObj = lbPostData['loadbalancer']['virtual_machine_interface_refs'];
    // logutils.logger.debug('createNewVMIObject',vmiObj);
    var vmi = {};
    vmi['virtual-machine-interface'] = lbPostData['loadbalancer']['virtual_machine_interface_refs'];
    if ((!('virtual_network_refs' in vmi['virtual-machine-interface']))) {
        error = new appErrors.RESTServerError(
                'Virtual Machine Interface(s) virtual network reference object missing... ');
        callback(error, null);
        return;
    }
    if ((!('instance_ip_back_refs' in vmi['virtual-machine-interface']))) {
        error = new appErrors.RESTServerError(
                'Virtual Machine Interface(s) virtual network reference object missing... ');
        callback(error, null);
        return;
    }
    if ((!('parent_type' in vmi['virtual-machine-interface']))) {
        vmi['virtual-machine-interface']['parent_type'] = postData['loadbalancer']['parent_type'];
    }

    if ((!('virtual_machine_interface_device_owner' in vmi['virtual-machine-interface']))) {
        vmi['virtual-machine-interface']['virtual_machine_interface_device_owner'] = 'neutron:LOADBALANCER';
    }
    if ((!('fq_name' in vmi['virtual-machine-interface']))) {
        var fqName = [];
        fqName.push(postData['loadbalancer']['fq_name'][0]);
        fqName.push(postData['loadbalancer']['fq_name'][1]);

        vmi['virtual-machine-interface']['fq_name'] = fqName
    }

    if ((!('security_group_refs' in vmi['virtual-machine-interface']))) {
        var secGrp = [];
        secGrp.push(postData['loadbalancer']['fq_name'][0]);
        secGrp.push(postData['loadbalancer']['fq_name'][1]);
        secGrp.push('default');
        vmi['virtual-machine-interface']['security_group_refs'] = [ {
            'to' : secGrp
        } ];
    }
    // logutils.logger.debug('createNewVMIObject',vmi);
    var allDataArr = [];
    allDataArr.push({
        request : request,
        data : vmi,
        response : response,
        appData : appData
    });
    async
            .mapSeries(
                    allDataArr,
                    portConfig.createPortCB,
                    function(error, data) {
                        if (error) {
                            callback(error, null);
                            return;
                        }

                        var vmi = data[0]['virtual-machine-interface'];

                        var vmiRef = vmi['fq_name'];
                        postData['loadbalancer']['virtual_machine_interface_refs'] = [ {
                            'to' : vmiRef
                        } ];

                        var dataObjArr = {};
                        dataObjArr['reqDataArr'] = {};
                        dataObjArr['reqDataArr'].uuid = vmi['uuid'];
                        dataObjArr['reqDataArr'].appData = appData;
                        var instanceUUID = vmi['instance_ip_back_refs'][0]['uuid'];
                        readInstanceIPwithUUID(
                                instanceUUID,
                                appData,
                                function(error, instanceData) {
                                    var ipAddress = instanceData['instance-ip']['instance_ip_address'];
                                    postData['loadbalancer']['loadbalancer_properties']['vip_address'] = ipAddress;
                                    callback(null, postData);
                                });
                    });
}

function readInstanceFromVMIUUID(vmiId, appData, callback) {
    logutils.logger.debug('readInstanceIPwithUUID');
    var pURL = '/virtual-machine-interface/' + vmiId;
    configApiServer.apiGet(pURL, appData, function(error, vmi) {
        if (error) {
            callback(error, null);
            return;
        }
        var instanceUUID = vmi['instance_ip_back_refs'][0]['uuid'];
        readInstanceIPwithUUID(instanceUUID, appData, function(error,
                instanceData) {
            // logutils.logger.debug("instanceUUID:"+instanceData);
            callback(null, instanceData);
        });
    });
}

function readInstanceIPwithUUID(ipId, appData, callback) {
    logutils.logger.debug('readInstanceIPwithUUID');
    var pURL = '/instance-ip/' + ipId;
    configApiServer.apiGet(pURL, appData, function(error, result) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, result);
    });
}

function deleteLoadBalancerVMIbyId(dataObj, eMessage, callback) {
    logutils.logger.debug('deleteLoadBalancerVMIbyId');
    var allDataArr = [];
    var appData = dataObj.appData;
    var request = dataObj.request;
    var lbData = dataObj.lbData;
    var deleteVMIArray = commonUtils.getValueByJsonPath(lbData,
            'loadbalancer;virtual_machine_interface_refs', false);

    var delVMILength = deleteVMIArray.length;

    _.each(deleteVMIArray, function(vmi) {
        var uuid = vmi["uuid"];
        allDataArr.push({
            uuid : uuid,
            appData : appData,
            request : request
        });
    });
    async.mapSeries(allDataArr, portConfig.deletePortsCB,
            function(error, data) {
                if (error) {
                    callback(error, null);
                    return;
                }
                var newMessage = {};
                newMessage.message = "Load Balancer VMI ref's are deleted....";
                callback(null, appendMessage(newMessage, eMessage));
            });
}

/**
 * @appendMessage private function 1. Utility function to append the error
 *                message to the error object
 */
function appendMessage(newMessage, existingMessage) {
    if (newMessage) {
        if (existingMessage != null) {
            existingMessage.message += '<br>' + newMessage.message;
        } else {
            existingMessage = newMessage;
        }
    }
    return existingMessage;
}

function printMessage(listMessage) {
    var newMessage = {};
    newMessage.message = "";
    if (listMessage == undefined) {
        return newMessage;
    }
    var len = listMessage.length;

    for (i = 0; i < len; i++) {
        newMessage.message += listMessage[i].message + '<br>';
    }
    return newMessage;
}

exports.listListenersByLBId = listListenersByLBId;
exports.listPoolsByListernerId = listPoolsByListernerId;
exports.listLoadBalancers = listLoadBalancers;

exports.getLoadBalancersTree = getLoadBalancersTree;
exports.getLoadBalancersDetails = getLoadBalancersDetails;

exports.getLoadBalancerbyId = getLoadBalancerbyId;
exports.createLoadBalancer = createLoadBalancer;
exports.updateLoadBalancer = updateLoadBalancer;
exports.deleteLoadBalancer = deleteLoadBalancer;
exports.deleteLoadBalancerbyIds = deleteLoadBalancerbyIds;

exports.getListenerById = getListenerById;
exports.createListener = createListener;
exports.updateListener = updateListener;
exports.deleteListener = deleteListener;
exports.deleteListenerbyIds = deleteListenerbyIds;

exports.getPoolByListenerId = getPoolByListenerId;
exports.getPoolById = getPoolById;
exports.createPool = createPool;
exports.updatePool = updatePool;
exports.deletePool = deletePool;
exports.deletePoolByIds = deletePoolByIds;

exports.getMemberById = getMemberById;
exports.createMember = createMember;
exports.updateMember = updateMember;
exports.deleteMember = deleteMember;
exports.deleteMemberByIds = deleteMemberByIds;

exports.getHealthMonitorById = getHealthMonitorById;
exports.createHealthMonitor = createHealthMonitor;
exports.updateHealthMonitor = updateHealthMonitor;
exports.deleteHealthMonitor = deleteHealthMonitor;
exports.deleteHealthMonitorByIds = deleteHealthMonitorByIds;
