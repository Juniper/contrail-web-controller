/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var lbCfgFormatters = function() {
        var self = this;

        this.setPostUrlData = function (options) {
            var type = options.type;
            var fields = options.fields;
            var parent_id = options.parentId;
            var postData = {
               "data" : [ {
                   "type" : type
               } ]
            }
            if(fields != null && fields.length > 0) {
                postData['data'][0]['fields'] = fields;
            }
            if(parent_id != null && parent_id.length > 0) {
                postData['data'][0]['parent_id'] = parent_id;
            }
            return JSON.stringify(postData);
        };

        this.descriptionFormatter = function(d, c, v, cd, dc) {
            var description = getValueByJsonPath(dc, 'loadbalancer;id_perms;description', '');
            if (description !== '') {
                return description;
            }else{
                return '-';
            }
        };
        this.haModeFormatterText = function(d, c, v, cd, dc){
            var haMode = getValueByJsonPath(dc, 'loadbalancer;service_instance_refs;0;service_instance_properties;ha_mode', '');
            if(haMode !== ''){
                return haMode;
            }else{
                return '-';
            }
        };
        this.serviceInstanceFormatter = function(d, c, v, cd, dc){
            var si = getValueByJsonPath(dc, 'loadbalancer;service_instance_refs;0;display_name', '');
            if(si !== ''){
                var siHash = '/#p=config_sc_svcInstances';
                var siUrl = window.location.origin + siHash;
                return ( '<a href="'+ siUrl + '" style="color: #3184c5">' + si + '</a>');
            }else{
                return '-';
            }
        };
        this.virtualMachineFormatter = function(d, c, v, cd, dc){
            var vmi = getValueByJsonPath(dc, 'loadbalancer;virtual_machine_interface_refs;0;display_name', '');
            if(vmi !== ''){
                var vmiHash = '/#p=config_net_ports';
                var vmiUrl = window.location.origin + vmiHash;
                return ( '<a href="'+ vmiUrl+ '" style="color: #3184c5">' + vmi + '</a>');
            }else{
                return '-';
            }
        };
        this.operatingStatusFormatter = function(d, c, v, cd, dc) {
            var status = getValueByJsonPath(dc, 'loadbalancer;loadbalancer_properties;operating_status', '');
            if (status !== '') {
                var getIndex = ctwc.OPERATING_STATUS_MAP.indexOf(status) + 1;
                var statusVal = ctwc.OPERATING_STATUS_MAP[getIndex];
                if(statusVal === 'Online'){
                    return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                            statusVal);
                }else if(statusVal === 'Error'){
                    return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                            statusVal);
                }else {
                    return ('<div class="status-badge-rounded status-partially-active"></div>&nbsp;&nbsp;' +
                            statusVal);
                }
            }else{
                return '-';
            }
        };

        this.provisioningStatusFormatter = function(d, c, v, cd, dc) {
            var status = getValueByJsonPath(dc, 'loadbalancer;loadbalancer_properties;provisioning_status', '');
            if (status !== '') {
                var getIndex = ctwc.PROVISIONING_STATUS_MAP.indexOf(status) + 1;
                var statusVal = ctwc.PROVISIONING_STATUS_MAP[getIndex];
                if(statusVal === 'Active'){
                    return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                            statusVal);
                }else if(statusVal === 'Error'){
                    return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                            statusVal);
                }else{
                    return ('<div class="status-badge-rounded status-partially-active"></div>&nbsp;&nbsp;' +
                            statusVal);
                }
            }else{
                return '-';
            }
        };

        this.ipAddressFormatter = function(d, c, v, cd, dc) {
            var ip = getValueByJsonPath(dc, 'loadbalancer;loadbalancer_properties;vip_address', '');
            if (ip !== '') {
                return ip;
            }else{
                return '-';
            }
        };

        this.listenersCountFormatter = function(d, c, v, cd, dc) {
            var listener = getValueByJsonPath(dc, 'loadbalancer;loadbalancer-listener', []);
            if (listener.length > 0) {
                return listener.length.toString();
            }else{
                return '0';
            }
        };

        this.nameFormatter = function(d, c, v, cd, dc) {
            var name = getValueByJsonPath(dc, 'loadbalancer;name', '');
            if (name !== '') {
                return name;
            }else{
                return '-';
            }
        };

        this.displayNameFormatter = function(d, c, v, cd, dc) {
            var name = getValueByJsonPath(dc, 'loadbalancer;display_name', '');
            if (name !== '') {
                return name;
            }else{
                return '-';
            }
        };

        this.loadbalancerProviderFormatter = function(d, c, v, cd, dc) {
            var provider = getValueByJsonPath(dc, 'loadbalancer;loadbalancer_provider', '');
            if (provider !== '') {
                var providerHash = '/#p=config_infra_sapset';
                var providerUrl = window.location.origin + providerHash;
                return ( '<a href="'+ providerUrl + '" style="color: #3184c5">' + provider + '</a>');
            }else{
                return '-';
            }
        };

        this.floatingIpFormatter = function(d, c, v, cd, dc) {
            var vmi = getValueByJsonPath(dc, 'loadbalancer;virtual_machine_interface_refs', []),
            fixedIpList = [], returnString = '';
            if(vmi.length > 0){
              _.each(vmi, function(ref) {
                    var ip = getValueByJsonPath(ref, 'floating-ip;ip', '');
                    if(ip != ''){
                        var floatingIp = '<span>'+ ip +'</span>';
                        fixedIpList.push(floatingIp);
                    }
               });
            }
            if(fixedIpList.length > 0){
                for(var j = 0; j< fixedIpList.length,j < 2; j++){
                    if(fixedIpList[j]) {
                        returnString += fixedIpList[j] + "<br>";
                    }
                }
                if (fixedIpList.length > 2) {
                    returnString += '<span class="moredataText">(' +
                        (fixedIpList.length-2) + ' more)</span> \
                        <span class="moredata" style="display:none;" ></span>';
                }else{
                    return returnString;
                }
            }else{
                return '-';
            }
        };

        this.floatingIpFormatterWithUrl = function(d, c, v, cd, dc) {
            var vmi = getValueByJsonPath(dc, 'loadbalancer;virtual_machine_interface_refs', []),
            fixedIpList = [], returnString = '';
            if(vmi.length > 0){
              _.each(vmi, function(ref) {
                    var ip = getValueByJsonPath(ref, 'floating-ip;ip', '');
                    if(ip != ''){
                        var floatingIp = '<span>'+ ip +'</span>';
                        fixedIpList.push(floatingIp);
                    }
               });
            }
            if(fixedIpList.length > 0){
                for(var j = 0; j< fixedIpList.length,j < 2; j++){
                    if(fixedIpList[j]) {
                        returnString += fixedIpList[j] + "<br>";
                    }
                }
                var fipHash = '/#p=config_networking_fip';
                var fipUrl = window.location.origin + fipHash;
                return ( '<a href="'+ fipUrl+ '" style="color: #3184c5">' + returnString + '</a>');
            }else{
                return '-';
            }
        };

        this.adminStatusFormatter = function(d, c, v, cd, dc){
            var adminStatus = getValueByJsonPath(dc, 'loadbalancer;loadbalancer_properties;admin_state', false);
            if(adminStatus){
                return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                //'Yes');
            }else{
                return 'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                //'No');
            }
        };
        this.validateIP = function(ip){
            //Check Format
            var ip = ip.split(".");

            if(ip.length != 4){
                return false;
            }

            //Check Numbers
            for(var c = 0; c < 4; c++){
                //Perform Test
                if( !(1/ip[c] > 0) ||
                            ip[c] > 255 ||
                            isNaN(parseFloat(ip[c])) ||
                            !isFinite(ip[c])  ||
                            ip[c].indexOf(" ") !== -1){

                            return false;
                }
            }

            //Invalidate addresses that start with 192.168
            if( ip[0] == 192 && ip[1] == 168 ){
                return false;
            }

            return true;
        };
        this.subnetFormatter = function(d, c, v, cd, dc){
            var vmiref = getValueByJsonPath(dc, 'loadbalancer;virtual_machine_interface_refs', []),
            subnetList = [], returnString = '';
            if(vmiref.length > 0){
                _.each(vmiref, function(vmi) {
                    var vn = getValueByJsonPath(vmi, 'virtual-network', {});
                    if(Object.keys(vn).length > 0){
                       var ipamRef = getValueByJsonPath(vn, 'network_ipam_refs', []);
                       _.each(ipamRef, function(ipam) {
                           var attr = getValueByJsonPath(ipam, 'attr;ipam_subnets', []);
                           if(attr.length > 0){
                               _.each(attr, function(obj) {
                                   var subnet = getValueByJsonPath(obj, 'subnet',{});
                                   var text = subnet.ip_prefix + '/' + subnet.ip_prefix_len;
                                   var prefix_ip = '<span>'+ text +'</span>';
                                   subnetList.push(prefix_ip);
                               });
                           }else{
                              return '-';
                           }
                       });
                    }else{
                       return '-';
                    }
                 });
                if(subnetList.length > 0){
                    for(var j = 0; j< subnetList.length,j < 2; j++){
                        if(subnetList[j]) {
                            returnString += subnetList[j] + "<br>";
                        }
                    }
                    if (subnetList.length > 2) {
                        returnString += '<span class="moredataText">(' +
                            (subnetList.length-2) + ' more)</span> \
                            <span class="moredata" style="display:none;" ></span>';
                    }else{
                        return returnString;
                    }
                }else{
                    return '-';
                }
            }else{
                return '-';
            }
        };

        var validateFlatSubnetIPAM = function (ipam) {
            var isFlatSubnetIPAM = getValueByJsonPath(ipam,
                    'attr;ipam_subnets;0;subnet', null, false) ? false : true;
            if(isFlatSubnetIPAM){
                return true;
            } else {
                return false;
            }
        };

        var flatSubnetIPAMsFormatter = function(d, c, v, cd, dc) {
            var ipamString,
                ipamObjs = getValueByJsonPath(dc,"network_ipam_refs", [], false),
                domain  = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                flatSubnetIpams = [];
            _.each(ipamObjs, function(ipamObj) {
                var isFlatSubnetIPAM = getValueByJsonPath(ipamObj,
                        'attr;ipam_subnets;0;subnet', null, false) ? false : true;
                if(isFlatSubnetIPAM) {
                    ipamFqn = ipamObj.to;
                    if (domain != ipamFqn[0] ||
                            project != ipamFqn[1]) {
                        ipamString = ipamFqn[2] + ' (' + ipamFqn[0] +
                                            ':' + ipamFqn[1] + ')';
                    } else {
                        ipamString = ipamFqn[2];
                    }
                    flatSubnetIpams.push(ipamString);
                }
            });
            return flatSubnetIpams;
        };

        this.getSubnetDNSStatus = function(subnetObj) {
            var dhcpOpts = getValueByJsonPath(subnetObj,
                                'dhcp_option_list;dhcp_option', []);
            if (dhcpOpts.length) {
                return this.getdhcpValuesByOption(dhcpOpts, 6).indexOf("0.0.0.0")
                        == -1 ? true : false;
            }
             return true;
        };
        this.listenerDescriptionFormatter = function(d, c, v, cd, dc) {
            var description = getValueByJsonPath(dc,
                                'id_perms;description', '');
            if (description != '') {
                return description;
            }else{
                return '-';
            }
        };

        this.listenersFormatterList = function(d, c, v, cd, dc){
            var subnetString = "", protocol, port, state, returnString = '',
            listeners = getValueByJsonPath(dc, 'loadbalancer;loadbalancer-listener', []);
            if(listeners.length > 0){
                _.each(listeners, function(listener) {
                    var listenerProp = getValueByJsonPath(listener, 'loadbalancer_listener_properties', {});
                    if(listenerProp.protocol != undefined){
                        protocol = listenerProp.protocol;
                    }else{
                        protocol = '-';
                    }
                    if(listenerProp.protocol_port != undefined){
                        port = listenerProp.protocol_port;
                    }else{
                        port = '-';
                    }
                    if(listenerProp.admin_state != undefined){
                        status = listenerProp.admin_state;
                        if(status){
                           state = 'Yes';//'<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;Yes';
                        }else{
                           state = 'No'; //'<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;No';
                        }
                    }else{
                        state = '-';
                    }
                    subnetString += "<tr style='vertical-align:top'><td>";
                    subnetString += protocol + "</td><td>";
                    subnetString += port + "</td><td>";
                    subnetString += state + "</td>";
                    subnetString += "</tr>";
                });
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:30%'>Protocol</th>\
                    <th style='width:30%'>Port</th>\
                    <th style='width:30%'>Admin State</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
                return returnString;
            }else{
               return '-';
            }
        };

        this.poolFormatterList = function(d, c, v, cd, dc){
            var subnetString = "", protocol, lbMethod, state, cookieName, returnString = '',
            pool = getValueByJsonPath(dc, 'loadbalancer-pool', []);
            if(pool.length > 0){
                _.each(pool, function(poolObj) {
                    var poolProp = getValueByJsonPath(poolObj, 'loadbalancer_pool_properties', {});
                    if(poolProp.protocol != undefined){
                        protocol = poolProp.protocol;
                    }else{
                        protocol = '-';
                    }
                    if(poolProp.loadbalancer_method != undefined){
                        var splitedMethod = poolProp.loadbalancer_method.split('_'), textList = [];
                        _.each(splitedMethod, function(text) {
                            var mText = text.toLocaleLowerCase();
                            textList.push(cowl.getFirstCharUpperCase(mText));
                         });
                        lbMethod = textList.join(' ');
                    }else{
                        lbMethod = '-';
                    }
                    if(poolProp.session_persistence != undefined){
                        var splitedCookie = poolProp.session_persistence.split('_'), textList = [];
                        _.each(splitedCookie, function(text) {
                            var mText = text.toLocaleLowerCase();
                            textList.push(cowl.getFirstCharUpperCase(mText));
                         });
                        cookieName = textList.join(' ');
                    }else{
                        cookieName = '-';
                    }
                    if(poolProp.admin_state != undefined){
                        status = poolProp.admin_state;
                        if(status){
                           state = 'Yes';
                        }else{
                           state = 'No';
                        }
                    }else{
                        state = '-';
                    }
                    subnetString += "<tr style='vertical-align:top'><td>";
                    subnetString += protocol + "</td><td>";
                    subnetString += lbMethod + "</td><td>";
                    subnetString += cookieName + "</td><td>";
                    subnetString += state + "</td>";
                    subnetString += "</tr>";
                });
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:25%'>Protocol</th>\
                    <th style='width:25%'>Loadbalancer Method</th>\
                    <th style='width:25%'>Session Persistence</th>\
                    <th style='width:25%'>Admin State</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
                return returnString;
            }else{
               return '-';
            }
        };

        this.healthMonitorFormatterList = function(d, c, v, cd, dc){
            var subnetString = "", code, delay, state, retries, method, timeout, path, type, returnString = '',
            monitor = getValueByJsonPath(dc, 'loadbalancer-healthmonitor', []);
            if(monitor.length > 0){
                _.each(monitor, function(monitorObj) {
                    var monitorProp = getValueByJsonPath(monitorObj, 'loadbalancer_healthmonitor_properties', {});
                    if(monitorProp.expected_codes != undefined){
                        code = monitorProp.expected_codes;
                    }else{
                        code = '-';
                    }
                    if(monitorProp.delay != undefined){
                        delay = monitorProp.delay;
                    }else{
                        delay = '-';
                    }
                    if(monitorProp.max_retries != undefined){
                        retries = monitorProp.max_retries;
                    }else{
                        retries = '-';
                    }
                    if(monitorProp.http_method != undefined){
                        method = monitorProp.http_method;
                    }else{
                        method = '-';
                    }
                    if(monitorProp.timeout != undefined){
                        timeout = monitorProp.timeout;
                    }else{
                        timeout = '-';
                    }
                    if(monitorProp.url_path != undefined){
                        path = monitorProp.url_path;
                    }else{
                        path = '-';
                    }
                    if(monitorProp.monitor_type != undefined){
                        type = monitorProp.monitor_type;
                    }else{
                        type = '-';
                    }
                    if(monitorProp.admin_state != undefined){
                        status = monitorProp.admin_state;
                        if(status){
                           state = 'Yes';
                        }else{
                           state = 'No';
                        }
                    }else{
                        state = 'No';
                    }
                    subnetString += "<tr style='vertical-align:top'><td>";
                    subnetString += code + "</td><td>";
                    subnetString += delay + "</td><td>";
                    subnetString += retries + "</td><td>";
                    subnetString += method + "</td><td>";
                    subnetString += timeout + "</td><td>";
                    subnetString += path + "</td><td>";
                    subnetString += type + "</td><td>";
                    subnetString += state + "</td>";
                    subnetString += "</tr>";
                });
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:12%'>Expected Codes</th>\
                    <th style='width:12%'>Delay</th>\
                    <th style='width:12%'>Max Retries</th>\
                    <th style='width:12%'>Http Method</th>\
                    <th style='width:12%'>Timeout</th>\
                    <th style='width:12%'>URL Path</th>\
                    <th style='width:12%'>Monitor Type</th>\
                    <th style='width:12%'>Admin State</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
                return returnString;
            }else{
               return '-';
            }
        };

        this.customAttributesFormatter = function(keyValuePair){
            var subnetString = "", key, value, returnString = '';
            _.each(keyValuePair, function(obj) {
                if(obj.key != undefined){
                    key = obj.key;
                }else{
                    key = '-';
                }
                if(obj.value != undefined){
                    value = obj.value;
                }else{
                    value = '-';
                }
                subnetString += "<tr style='vertical-align:top; border-bottom:1pt solid #F1F1F1;'><td>";
                subnetString += key + "</td><td>";
                subnetString += value + "</td>";
                subnetString += "</tr>";
            });
            returnString =
                "<table style='width:50%'><thead style='background-color:#f9f9f9;'><tr>\
                <th style='width:60%'>Key</th>\
                <th style='width:40%'>Value</th>\
                </tr></thead><tbody>";
            returnString += subnetString;
            returnString += "</tbody></table>";
            return returnString;
        };

        this.customAttributesList = function(d, c, v, cd, dc){
            var keyValuePair = getValueByJsonPath(dc, 'loadbalancer_pool_custom_attributes;key_value_pair', []);
            if(keyValuePair.length > 0){
                return this.customAttributesFormatter(keyValuePair);
            }else{
               return '-';
            }
        };

        this.subnetTmplFormatterList =  function(d, c, v, cd, dc) {
            var subnetString = "", flatSubnetIPAMs, ipamObjs = [];
            var count = 0,subnetCnt = 0, returnStr = '';
            var vmiref = getValueByJsonPath(dc, 'loadbalancer;virtual_machine_interface_refs', []);
            _.each(vmiref, function(ref) {
                var ipamRef = getValueByJsonPath(ref, 'virtual-network;network_ipam_refs', []);
                ipamObjs = ipamObjs.concat(ipamRef);
            });
            var len = ipamObjs.length;
            if (!len) {
                if (cd == -1) {
                    return [];
                } else {
                    return '-';
                }
            }
            for(var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var field = 'ipam_subnets';
                var subnet = ipam['attr'][field];
                var subnetLen = ipam['attr'][field].length;
                if(validateFlatSubnetIPAM(ipam)){
                    continue;
                }
                for(var j = 0; j < subnetLen; j++) {
                    var ip_block = ipam['attr'][field][j];
                    var ipam_block= ipam['to'];
                    var ipamto = ipam_block[2] + ' ( ' + ipam_block[0] + ':' +ipam_block[1] + ')';
                    var cidr = getValueByJsonPath(ip_block,"subnet;ip_prefix", null, false);
                    var cidrlen = getValueByJsonPath(ip_block,"subnet;ip_prefix_len", null, false);
                    if(cidr){
                        cidr = cidr + '/' + cidrlen ;
                    } else {
                        continue;
                    }
                    var gw   = ip_block.default_gateway ? ip_block.default_gateway: "-";
                    var dhcp = ip_block.enable_dhcp ? 'Enabled' : 'Disabled';
                    var dns  = this.getSubnetDNSStatus(ip_block) ? 'Enabled' : 'Disabled';
                    var gwStatus =  (gw == null || gw == "" || gw == "0.0.0.0") ?
                                        'Disabled' : gw;

                    var allocPools = [];
                    if ('allocation_pools' in ip_block &&
                                ip_block.allocation_pools.length) {
                        allocPools = getValueByJsonPath(ip_block,"allocation_pools", []);
                    }
                    var allocPoolStr = "-";
                    _.each(allocPools, function(pool, index) {
                        pool = pool.start + ' - ' + pool.end;
                        if(index === 0) {
                            allocPoolStr = pool;
                        } else {
                            allocPoolStr += "<br/>" + pool;
                        }
                    });
                    subnetString += "<tr style='vertical-align:top'><td>";
                    subnetString += cidr + "</td><td>";
                    subnetString += gw + "</td><td>";
                    subnetString += dns + "</td><td>";
                    subnetString += dhcp + "</td><td>";
                    subnetString += allocPoolStr+ "</td>";
                    subnetString += "</tr>";
                }
            }

            //flat subnet ipams
            flatSubnetIPAMs = flatSubnetIPAMsFormatter(d, c, v, -1, dc);
            _.each(flatSubnetIPAMs, function(ipam) {
                subnetString += "<tr style='vertical-align:top'><td>";
                subnetString += ipam + "</td><td>";
                subnetString += '-' + "</td><td>";
                subnetString += '-' + "</td><td>";
                subnetString += '-' + "</td><td>";
                subnetString += '-' + "</td>";
                subnetString += "</tr>";
            });
            var returnString = "";
            if(subnetString != ""){
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:25%'>CIDR</th>\
                    <th style='width:25%'>Gateway</th>\
                    <th style='width:10%'>DNS</th>\
                    <th style='width:10%'>DHCP</th>\
                    <th style='width:30%'>Allocation Pools</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
            } else {
                returnString += "";
            }
            return returnString ? returnString : "-";
        };

        this.lbOwnerPermissionFormatter = function(d, c, v, cd, dc){
            var ownerAccess = getValueByJsonPath(dc, 'loadbalancer;perms2;owner_access', 0);
            return this.PermissionFormatter(ownerAccess);
        };

        this.lbGlobalPermissionFormatter = function(d, c, v, cd, dc){
            var globalAccess = getValueByJsonPath(dc, 'loadbalancer;perms2;global_access', 0);
            return this.PermissionFormatter(globalAccess);
        };

        this.lbOwnerFormatter = function(d, c, v, cd, dc){
            var owner = getValueByJsonPath(dc, 'loadbalancer;perms2;owner', '');
            if(owner != ''){
                return owner;
            }else{
                return '-';
            }
        };

        this.lbSharedPermissionFormatter = function(d, c, v, cd, dc) {
            var formattedSharedPerms = "", sharedPermsStr = "",
                sharedPerms =  getValueByJsonPath(dc, "loadbalancer;perms2;share", []),
                i, sharedPermsCnt = sharedPerms.length;
            if(sharedPermsCnt) {
                for(i = 0; i < sharedPermsCnt; i++) {
                    if(sharedPerms[i]) {
                        sharedPermsStr += "<tr style='vertical-align:top'><td>";
                        sharedPermsStr += sharedPerms[i].tenant + "</td><td>";
                        sharedPermsStr +=
                            permissionFormatter(sharedPerms[i].tenant_access) +
                            "</td><td>";
                        sharedPermsStr += "</tr>";
                    }
                }
                if(sharedPermsStr) {
                    formattedSharedPerms =
                        "<table class='sharedlist_permission' style='width:100%'><thead><tr>" +
                        "<th style='width:70%'>Project</th>" +
                        "<th style='width:30%'>Permissions</th>" +
                        "</tr></thead><tbody>";
                    formattedSharedPerms += sharedPermsStr;
                    formattedSharedPerms += "</tbody></table>";
                }
            } else {
                formattedSharedPerms = "-";
            }
            return formattedSharedPerms;
        };

        this.PermissionFormatter =  function(v) {
            var retStr = "";
            switch (Number(v)) {
                case 1:
                    retStr = "Refer";
                    break;
                case 2:
                    retStr = "Write";
                    break;
                case 3:
                    retStr = "Write, Refer";
                    break;
                case 4:
                    retStr = "Read";
                    break;
                case 5:
                    retStr = "Read, Refer";
                    break;
                case 6:
                    retStr = "Read, Write";
                    break;
                case 7:
                    retStr = "Read, Write, Refer";
                    break;
                default:
                    retStr = "-";
                    break;
            };
            return retStr;
        };

        this.listenerProtocolFormatter = function(d, c, v, cd, dc){
            var protocol = getValueByJsonPath(dc, 'loadbalancer_listener_properties;protocol', '');
            if(protocol !== ''){
                return protocol;
            }else{
                return '-';
            }
        };

        this.listenerPortFormatter = function(d, c, v, cd, dc){
            var port = getValueByJsonPath(dc, 'loadbalancer_listener_properties;protocol_port', '');
            if(port !== ''){
                return port;
            }else{
                return '-';
            }
        };

        this.listenerPoolCountFormatter = function(d, c, v, cd, dc){
            var poolCount = getValueByJsonPath(dc, 'loadbalancer-pool', []);
            if(poolCount.length > 0){
                return poolCount.length;
            }else{
                return '0';
            }
        };

        this.listenerConnectionLimit = function(d, c, v, cd, dc){
            return getValueByJsonPath(dc, 'loadbalancer_listener_properties;connection_limit', '');
        };

        this.listenerAdminStateFormatter = function(d, c, v, cd, dc){
            var adminStatus = getValueByJsonPath(dc, 'loadbalancer_listener_properties;admin_state', false);
            if(adminStatus){
                return  'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                //'Yes');
            }else{
                return 'No'; //('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                //'No');
            }
        };

        this.poolProtocolFormatter = function(d, c, v, cd, dc){
            var protocol = getValueByJsonPath(dc, 'loadbalancer_pool_properties;protocol', '');
            if(protocol !== ''){
                return protocol;
            }else{
                return '-';
            }
        };

        this.poolLbMethodFormatter = function(d, c, v, cd, dc){
            var method = getValueByJsonPath(dc, 'loadbalancer_pool_properties;loadbalancer_method', '');
            if(method !== ''){
                var splitedMethod = method.split('_'), textList = [];
                _.each(splitedMethod, function(text) {
                    var mText = text.toLocaleLowerCase();
                    textList.push(cowl.getFirstCharUpperCase(mText));
                 });
                return textList.join(' ');
            }else{
                return '-';
            }
        };

        this.poolMemberCountFormatter = function(d, c, v, cd, dc){
            var poolMemberCount = getValueByJsonPath(dc, 'loadbalancer-members', []);
            if(poolMemberCount.length > 0){
                return poolMemberCount.length;
            }else{
                return '0';
            }
        };

        this.healthMonitorCountFormatter = function(d, c, v, cd, dc){
            var healthMonitorCount = getValueByJsonPath(dc, 'loadbalancer-healthmonitor', []);
            if(healthMonitorCount.length > 0){
                return healthMonitorCount.length;
            }else{
                return '0';
            }
        };

        this.poolAdminStateFormatter = function(d, c, v, cd, dc){
            var adminStatus = getValueByJsonPath(dc, 'loadbalancer_pool_properties;admin_state', false);
            if(adminStatus){
                return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                //'Yes');
            }else{
                return  'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                //'No');
            }
        };

        this.poolMemberPortFormatter = function(d, c, v, cd, dc){
            var port = getValueByJsonPath(dc, 'loadbalancer_member_properties;protocol_port', 0);
            if(port !== 0){
                return port;
            }else{
                return '0';
            }
        };
        this.poolMemberSubnetFormatter = function(d, c, v, cd, dc){
            var subnet = getValueByJsonPath(dc, 'loadbalancer_member_properties;subnet_id', '');
            if(subnet !== ''){
                return subnet;
            }else{
                return '-';
            }
        };

        this.poolMemberAddressFormatter = function(d, c, v, cd, dc){
            var address = getValueByJsonPath(dc, 'loadbalancer_member_properties;address', '');
            if(address !== ''){
               return address;
            }else{
                return '-';
            }
        };

        this.poolSessionPersistence = function(d, c, v, cd, dc){
            var session = getValueByJsonPath(dc, 'loadbalancer_pool_properties;session_persistence', '');
            if(session !== ''){
               return session;
            }else{
                return '-';
            }
        };

        this.poolPersistenceCookie = function(d, c, v, cd, dc){
            var cookie = getValueByJsonPath(dc, 'loadbalancer_pool_properties;persistence_cookie_name', '');
            if(cookie !== ''){
               return cookie;
            }else{
                return '-';
            }
        };

        this.poolMemberWeightFormatter = function(d, c, v, cd, dc){
            var weight = getValueByJsonPath(dc, 'loadbalancer_member_properties;weight', 0);
            if(weight !== 0){
                return weight;
            }else{
                return '0';
            }
        };

        this.poolMemberAdminStateFormatter = function(d, c, v, cd, dc){
            var adminStatus = getValueByJsonPath(dc, 'loadbalancer_member_properties;admin_state', false);
            if(adminStatus){
                return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                //'Yes');
            }else{
                return 'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                //'No');
            }
        };
        ///
        this.monitorTypeFormatter = function(d, c, v, cd, dc){
            var type = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;monitor_type', '');
            if(type !== ''){
                return type;
            }else{
                return '-';
            }
        };

        this.monitorExpectedCodesFormatter = function(d, c, v, cd, dc){
            var codes = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;expected_codes', '');
            if(codes !== ''){
               return codes;
            }else{
                return '-';
            }
        };

        this.monitorMaxRetriesFormatter = function(d, c, v, cd, dc){
            var retries = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;max_retries', 0);
            if(retries !== 0){
                return retries;
            }else{
                return '0';
            }
        };

        this.monitorDelayFormatter = function(d, c, v, cd, dc){
            var delay = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;delay', 0);
            if(delay !== 0){
               return delay;
            }else{
                return '0';
            }
        };

        this.monitorTimeoutFormatter = function(d, c, v, cd, dc){
            var timeout = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;timeout', 0);
            if(timeout !== 0){
                return timeout;
            }else{
                return '0';
            }
        };

        this.monitorAdminStateFormatter = function(d, c, v, cd, dc){
            var adminStatus = getValueByJsonPath(dc, 'loadbalancer_healthmonitor_properties;admin_state', false);
            if(adminStatus){
                return  'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                //'Yes');
            }else{
                return  'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                //'No');
            }
        };

        this.valueFormatter = function(row, col, val, d, rowData) {
               if ('name' == rowData['key']) {
                   return val;
               }
               if('display_name' === rowData['key']) {
                   if(val == '' || val == null){
                       return '-';
                   }else{
                       return val;
                   }
               }
               if('id_perms' === rowData['key']) {
                   if(val.description == '' || val.description == null){
                       return '-';
                   }else{
                       return val.description;
                   }
               }
               if('loadbalancer_provider' === rowData['key']) {
                   if(val == '' || val == null){
                       return '-';
                   }else{
                       var providerHash = '/#p=config_infra_sapset';
                       var providerUrl = window.location.origin + providerHash;
                       return ( '<a href="'+ providerUrl + '" style="color: #3184c5">' + val + '</a>');
                   }
               }
               if('loadbalancer_properties' === rowData['key']){
                  if(rowData['name'] === 'Provisioning Status'){
                      if(val.provisioning_status == '' || val.provisioning_status == null){
                          return '-';
                      }else{
                          var getIndex = ctwc.PROVISIONING_STATUS_MAP.indexOf(val.provisioning_status) + 1;
                          var statusVal = ctwc.PROVISIONING_STATUS_MAP[getIndex];
                          if(statusVal === 'Active'){
                              return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }else if(statusVal === 'Error'){
                              return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }else{
                              return ('<div class="status-badge-rounded status-partially-active"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }
                      }
                  }
                  if(rowData['name'] === 'Admin State'){
                      if(val.admin_state == '' || val.admin_state == null){
                          return 'No';
                      }else{
                          if(val.admin_state == true){
                              return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                              //'Yes');
                          }else{
                              return 'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                             // 'No');
                          }
                      }
                  }
                  if(rowData['name'] === 'Fixed IPs'){
                      if(val.vip_address == '' || val.vip_address == null){
                          return '-';
                      }else{
                          return val.vip_address;
                      }
                  }
                  if(rowData['name'] === 'Operating Status'){
                      if(val.operating_status == '' || val.operating_status == null){
                          return '-';
                      }else{
                          var getIndex = ctwc.OPERATING_STATUS_MAP.indexOf(val.operating_status) + 1;
                          var statusVal = ctwc.OPERATING_STATUS_MAP[getIndex];
                          if(statusVal === 'Online'){
                              return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }else if(statusVal === 'Error'){
                              return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }else{
                              return ('<div class="status-badge-rounded status-partially-active"></div>&nbsp;&nbsp;' +
                                      statusVal);
                          }
                      }
                  }
              }
              if('loadbalancer-listener' === rowData['key']) {
                   if( val == undefined || val.length == 0 || val == null) {
                       return '-';
                   }else{
                       return val.length;
                   }
              }
              if('service_instance_refs' === rowData['key']) {
                  if(rowData['name'] === 'Service Instance'){
                      var siName = [];
                      if(val == undefined || val.length == 0 || val == null ){
                          return '-';
                      }else{
                          for(var i = 0; i < val.length; i++){
                              siName.push(val[i].display_name);
                          }
                          var siDisplayName = siName.join(',');
                          var siHash = '/#p=config_sc_svcInstances';
                          var siUrl = window.location.origin + siHash;
                          return ( '<a href="'+ siUrl + '" style="color: #3184c5">' + siDisplayName + '</a>');
                      }
                  }
                  if(rowData['name'] === 'HA Mode'){
                      var haMode = getValueByJsonPath(val, '0;service_instance_properties;ha_mode', '');
                      if(haMode !== ''){
                          return haMode
                      }else{
                          return '-';
                      }
                  }
             }
              if('virtual_machine_interface_refs' === rowData['key']) {
                  if(rowData['name'] === 'Floating IPs'){
                      var vmi = val,
                      fixedIpList = [], returnString = '';
                      if(vmi!= undefined && vmi.length > 0){
                       // _.each(vmi, function(ref) {
                              var ip = getValueByJsonPath(vmi[0], 'floating-ip;ip', '');
                              if(ip != ''){
                                  //var floatingIp = '<span>'+ ip +'</span>';
                                  //fixedIpList.push(floatingIp);
                                  var fipHash = '/#p=config_networking_fip';
                                  var fipUrl = window.location.origin + fipHash;
                                  return ( '<a href="'+ fipUrl+ '" style="color: #3184c5">' + ip + '</a>');
                              }else{
                                  return '-';
                              }
                         //});
                      }else{
                          return '-';
                      }
                      /*if(fixedIpList.length > 0){
                          for(var j = 0; j < fixedIpList.length; j++){
                              if(fixedIpList[j]) {
                                  returnString += fixedIpList[j] + "<br>";
                              }
                          }
                          return returnString;
                      }else{
                          return '-';
                      }*/
                  }
                  if(rowData['name'] === 'Subnet'){
                      var vmiref = val,
                      subnetList = [], returnString = '';
                      if(vmiref.length > 0){
                          _.each(vmiref, function(vmi) {
                              var vn = getValueByJsonPath(vmi, 'virtual-network', {});
                              if(Object.keys(vn).length > 0){
                                 var ipamRef = getValueByJsonPath(vn, 'network_ipam_refs', []);
                                 _.each(ipamRef, function(ipam) {
                                     var attr = getValueByJsonPath(ipam, 'attr;ipam_subnets', []);
                                     if(attr.length > 0){
                                         _.each(attr, function(obj) {
                                             var subnet = getValueByJsonPath(obj, 'subnet',{});
                                             var text = subnet.ip_prefix + '/' + subnet.ip_prefix_len;
                                             var prefix_ip = '<span>'+ text +'</span>';
                                             subnetList.push(prefix_ip);
                                         });
                                     }else{
                                        return '-';
                                     }
                                 });
                              }else{
                                 return '-';
                              }
                           });
                          if(subnetList.length > 0){
                              for(var j = 0; j < subnetList.length; j++){
                                  if(subnetList[j]) {
                                      returnString += subnetList[j] + "<br>";
                                  }
                              }
                              return returnString;
                          }else{
                              return '-';
                          }
                      }else{
                          return '-';
                      }
                  }
                  if(rowData['name'] === 'Virtual Machine Interface'){
                      var vmiName = [];
                      if(val == undefined || val.length == 0 || val == null ){
                          return '-';
                      }else{
                          for(var i = 0; i < val.length; i++){
                              var to = val[i].to;
                              vmiName.push(val[i].display_name);
                          }
                          var vmiDisplayName = vmiName.join(',');
                          var vmiHash = '/#p=config_net_ports';
                          var vmiUrl = window.location.origin + vmiHash;
                          return ( '<a href="'+ vmiUrl+ '" style="color: #3184c5">' + vmiDisplayName + '</a>');
                      }
                  }
             }
              return val;
         };

         this.listenerValueFormatter = function(row, col, val, d, rowData) {
             if ('name' == rowData['key']) {
                 return val;
             }
             if('display_name' === rowData['key']) {
                 if(val == '' || val == null){
                     return '-';
                 }else{
                     return val;
                 }
             }
             if('id_perms' === rowData['key']) {
                 if(val.description == '' || val.description == null){
                     return '-';
                 }else{
                     return val.description;
                 }
             }
             if('loadbalancer_listener_properties' === rowData['key']){
                if(rowData['name'] === 'Protocol'){
                    if(val.protocol == '' || val.protocol == null){
                        return '-';
                    }else{
                        return val.protocol;
                    }
                }
                if(rowData['name'] === 'Admin State'){
                    if(val.admin_state == '' || val.admin_state == null){
                        return 'No';
                    }else{
                        if(val.admin_state == true){
                            return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                            //'Yes');
                        }else{
                            return 'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                            //'No');
                        }
                    }
                }
                if(rowData['name'] === 'Connection Limit'){
                    if(val.connection_limit == '' || val.connection_limit == null){
                        return '-';
                    }else{
                        if(val.connection_limit == -1){
                            return 'UnLimited';
                        }else{
                            return val.connection_limit;
                        }
                    }
                }
                if(rowData['name'] === 'Protocol Port'){
                    if(val.protocol_port == '' || val.protocol_port == null){
                        return '-';
                    }else{
                        return val.protocol_port;
                    }
                }
            }
            if('loadbalancer-pool' === rowData['key']) {
                 if(val == undefined || val.length == 0 || val == null ){
                     return '-';
                 }else{
                     return val.length;
                 }
            }
            return val;
       };

       this.poolValueFormatter = function(row, col, val, d, rowData) {
           if ('name' == rowData['key']) {
               return val;
           }
           if('display_name' === rowData['key']) {
               if(val == '' || val == null){
                   return '-';
               }else{
                   return val;
               }
           }
           if('id_perms' === rowData['key']) {
               if(val.description == '' || val.description == null){
                   return '-';
               }else{
                   return val.description;
               }
           }
           if('loadbalancer_pool_properties' === rowData['key']){
              if(rowData['name'] === 'Protocol'){
                  if(val.protocol == '' || val.protocol == null){
                      return '-';
                  }else{
                      return val.protocol;
                  }
              }
              if(rowData['name'] === 'Admin State'){
                  if(val.admin_state == '' || val.admin_state == null){
                      return 'No';
                  }else{
                      if(val.admin_state == true){
                          return 'Yes';//('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                          //'Yes');
                      }else{
                          return 'No';//('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                          //'No');
                      }
                  }
              }
              if(rowData['name'] === 'Session Persistence'){
                  if(val.session_persistence == '' || val.session_persistence == null){
                      return '-';
                  }else{
                      return val.session_persistence;
                  }
              }

              if(rowData['name'] === 'Persistence Cookie Name'){
                  if(val.persistence_cookie_name == '' || val.persistence_cookie_name == null){
                      return '-';
                  }else{
                      return val.persistence_cookie_name;
                  }
              }
              if(rowData['name'] === 'Status Description'){
                  if(val.status_description == '' || val.status_description == null){
                      return '-';
                  }else{
                      return val.status_description;
                  }
              }
              if(rowData['name'] === 'Loadbalancer Method'){
                  if(val.loadbalancer_method == '' || val.loadbalancer_method == null){
                      return '-';
                  }else{
                      var splitedMethod = val.loadbalancer_method.split('_'), textList = [];
                      _.each(splitedMethod, function(text) {
                          var mText = text.toLocaleLowerCase();
                          textList.push(cowl.getFirstCharUpperCase(mText));
                       });
                      return textList.join(' ');
                  }
              }
          }
          if('loadbalancer-healthmonitor' === rowData['key']) {
               if(val == undefined || val.length == 0 || val == null ){
                   return '-';
               }else{
                   return val.length;
               }
          }
          if('loadbalancer-members' === rowData['key']) {
              if(val == undefined){
                  return '0';
              }else{
                  return val.length;
              }
         }
         if('loadbalancer_pool_custom_attributes' === rowData['key']) {
              if(val == undefined || val.length == 0 || val == null ){
                  return '-';
              }else{
                  var keyValuePair = getValueByJsonPath(val, 'key_value_pair', []);
                  if(keyValuePair.length > 0){
                      return self.customAttributesFormatter(keyValuePair);
                  }else{
                     return '-';
                  }
              }
         }
         return val;
     };
    }
    return lbCfgFormatters;
});
