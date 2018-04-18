/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/policy/ui/js/views/policyFormatters',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter',
    'config/firewall/common/fwpolicy/ui/js/fwPolicy.utils'
], function (_, ContrailModel, PolicyFormatters, FWRuleFormatters, FWPolicyUtils) {
    var policyFormatters = new PolicyFormatters();
    var fwRuleFormatters = new FWRuleFormatters();
    var fwPolicyUtils = new FWPolicyUtils();
    var fwRuleModel = ContrailModel.extend({
        defaultConfig: {
            'name': '',
            'enable': true,
            'sequence':'',
            'simple_action':'pass',
            'user_created_service':'',
            'uuid':'',
            'endpoint_1':'',
            'endpoint_2':'',
            'direction':'<>',
            'match_tags':'',
            'action_list': {
                  'simple_action': 'pass'
              },
            'match_tags': {
                  'tag_list': []
             },
             'security_logging_object_refs': []
        },
        formatModelConfig: function(modelConfig) {
            var self = this;
            var tag = getValueByJsonPath(modelConfig, "match_tags;tag_list", []);
            if(tag.length > 0){
                var taglist = tag.join(cowc.DROPDOWN_VALUE_SEPARATOR);
                modelConfig["match_tags"] = taglist;
            }else{
                modelConfig["match_tags"] = '';
            }
            var simpleAction = getValueByJsonPath(modelConfig, "action_list;simple_action", '');
            modelConfig["simple_action"] = simpleAction;
            if(modelConfig['service'] !== undefined && Object.keys(modelConfig['service']).length > 0){
                var serviceList = [], srcPort, dstPort;
                var protocol = getValueByJsonPath(modelConfig, "service;protocol", "");
                var srcStartPort = getValueByJsonPath(modelConfig, "service;src_ports;start_port", '');
                var srcEndtPort = getValueByJsonPath(modelConfig, "service;src_ports;end_port", '');
                var dstStartPort = getValueByJsonPath(modelConfig, "service;dst_ports;start_port", '');
                var dstEndtPort = getValueByJsonPath(modelConfig, "service;dst_ports;end_port", '');
                if(protocol !== ''){
                   serviceList.push(protocol);
                }
                if(srcStartPort === srcEndtPort){
                    srcPort = srcStartPort === -1 ? ctwl.FIREWALL_POLICY_ANY : srcStartPort;
                }else{
                   if(srcStartPort === 0 && srcEndtPort === 65535){
                       srcPort = 'any';
                   }else{
                       srcPort = srcStartPort + '-' + srcEndtPort;
                   }
                }
                if(srcPort !== ''){
                   serviceList.push(srcPort);
                }
                if(dstStartPort === dstEndtPort){
                    dstPort = dstStartPort === -1 ? ctwl.FIREWALL_POLICY_ANY : dstStartPort;
                }else{
                   if(dstStartPort === 0 && dstEndtPort === 65535){
                       dstPort = 'any';
                   }else{
                       dstPort = dstStartPort + '-' + dstEndtPort;
                   }
                }
                if(dstPort !== ''){
                   serviceList.push(dstPort);
                }
                modelConfig["user_created_service"] = serviceList.join(':');
            }else if(modelConfig['service_group_refs'] !== undefined){
                var serviceGrpRef = getValueByJsonPath(modelConfig,"service_group_refs",[]), service;
                if(serviceGrpRef.length > 0){
                    var to = serviceGrpRef[0].to;
                    if(modelConfig.isGlobal){
                      service =  to[to.length - 1];
                    }else{
                      service = (to.length < 3)? "global:" + to[to.length - 1] : to[to.length - 1];
                    }
                    modelConfig["user_created_service"] = service;
                }else{
                    modelConfig["user_created_service"] = '';
                }
            }else{
                modelConfig["user_created_service"] = '';
            }
            var dir = getValueByJsonPath(modelConfig, "direction", '');
            if(dir === '<>' || dir === '>'){
                modelConfig['direction'] = dir;
            }else{
               var splitedDir = dir.split(';'), arr = [];
               var dirArr = splitedDir.slice(0,splitedDir.length-1);
               for(var i = 0; i < dirArr.length; i++){
                   if(dirArr[i] === '&gt'){
                       arr.push('>');
                   }else if(dirArr[i] === '&lt'){
                       arr.push('<');
                   }
               }
               modelConfig['direction'] = arr.join('');
            }
            var endpoint1 = getValueByJsonPath(modelConfig, "endpoint_1");
            if(endpoint1 === ''){
                modelConfig['endpoint_1'] = '';
            }else{
                modelConfig['endpoint_1'] = self.getEndpointVal(endpoint1, modelConfig);
            }
            var endpoint2 = getValueByJsonPath(modelConfig, "endpoint_2");
            if(endpoint2 === ''){
                modelConfig['endpoint_2'] = '';
            }else{
                modelConfig['endpoint_2'] = self.getEndpointVal(endpoint2, modelConfig);
            }
            modelConfig['sequence'] = fwRuleFormatters.sequenceFormatter(null,
                    null, null, null, modelConfig);
            modelConfig['security_logging_object_refs'] = ctwu.securityLoggingObjectFormatter(modelConfig, 'edit');
            return modelConfig;
        },
        getEndpointVal : function(endpoint, modelConfig){
            var endpointArr = [];

            if(endpoint.tags && endpoint.tags.length > 0){
                _.each(endpoint.tags, function(tag){
                    var grpName = tag ? tag.split(ctwc.TAG_SEPARATOR)[0]: '';
                    grpName = grpName.indexOf('global:') != -1 ? grpName.split(':')[1] : grpName;
                    grpName =
                        $.inArray(grpName.toLowerCase(), ctwc.FW_PREDEFINED_TAGS) != -1 ? grpName : 'udtag';
                    var val = tag + cowc.DROPDOWN_VALUE_SEPARATOR + grpName.toLowerCase();
                    endpointArr.push(val);
                });
            } else if(endpoint.virtual_network) {
                var vn = endpoint.virtual_network +
                     cowc.DROPDOWN_VALUE_SEPARATOR + 'virtual_network';
                endpointArr.push(vn);
            } else if(endpoint.address_group) {
                var addressGrp = endpoint.address_group +
                cowc.DROPDOWN_VALUE_SEPARATOR + 'address_group';
                endpointArr.push(addressGrp);
            }else if(endpoint.any){
                var any = 'any'+
                cowc.DROPDOWN_VALUE_SEPARATOR + 'any_workload';
                endpointArr.push(any);
            }
            if(endpointArr.length > 0){
                return endpointArr.join(',');
            }else{
                return '';
            }
        },
        getPostAddressFormat: function(arr, selectedDomain, selectedProject) {
            var array = arr.split(":");
            var returnval = null;
            if (array.length == 1) {
                if (String(array[0]).toLowerCase() != "any" &&
                    String(array[0]).toLowerCase() != "local") {
                    returnval = selectedDomain + ":" +
                                selectedProject + ":" +
                                array[0];
                } else {
                    returnval = array[0].toLowerCase();
                }
            } else if(array.length == 3) {
                returnval = arr;
            }
            return returnval;
        },

        populateEndpointData : function(inputAddress) {
            var self = this;
            var selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
            var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
            var srcArrs = inputAddress.split(',');//If multiple selected.
            endpoint  = {};
            endpoint["virtual_network"] = null;
            //endpoint["security_group"] = null;
            endpoint["address_group"] = null;
            endpoint["any"] = null;
            endpoint["tags"] = [];
            for(var i = 0 ; i < srcArrs.length; i++) {
                var srcArr = srcArrs[i].split(cowc.DROPDOWN_VALUE_SEPARATOR),
                    vnSubnetObj, subnet, endpoint;
                //tags
                if(srcArr.length == 2 && (srcArr[1] === 'application' ||
                        srcArr[1] === 'deployment' ||  srcArr[1] === 'site' || srcArr[1] === 'tier' || srcArr[1] === 'label' || srcArr[1] === 'udtag')) {
                    endpoint["tags"].push(srcArr[0]);
                } else if(srcArr.length == 2 && srcArr[1] === 'address_group'){
                    endpoint[srcArr[1]] = srcArr[0];
                } else if(srcArr.length == 2 && srcArr[1] === 'virtual_network'){
                    endpoint[srcArr[1]] = self.getPostAddressFormat(srcArr[0], selectedDomain,
                            selectedProject)
                } else if(srcArr.length == 2 && srcArr[1] === 'any_workload') {
                    endpoint["any"] = true;
                }
            }
            return endpoint;
        },
        getPolicyId : function(){
            var uuid;
            var url = decodeURIComponent(location.hash).split('&');
            for(var i = 0; i < url.length; i++){
                if(url[i].search('uuid') !== -1){
                    var spliturl = url[i].split('=').reverse();
                    uuid = spliturl[0];
                    break;
                }
            }
            return uuid;
        },
        getFormatedService : function(selectedData, list){
            var svcListRef = [], service = {};
            for(var i = 0; i < list.length; i++){
                if(list[i].text === selectedData){
                    svcListRef.push(list[i].fq_name);
                    break;
                }
            }
            if(svcListRef.length > 0){
                service['service_group_refs'] = [{to:svcListRef[svcListRef.length - 1]}];
                service['isServiceGroup'] = true;
            }else{
                var services = selectedData.split(':');
                if(services.length === 3) {
                    service['service'] = {};
                    service['service']['protocol'] = services[0].toLowerCase();
                    service['service']['dst_ports'] =
                        policyFormatters.formatPort(services[2], 'rule')[0];
                    service['service']['src_ports'] =
                        policyFormatters.formatPort(services[1], 'rule')[0];
                    service['isServiceGroup'] = false;
                }else if(services.length === 2) {
                    service['service'] = {};
                    service['service']['protocol'] = services[0].toLowerCase();
                    service['service']['dst_ports'] =
                        policyFormatters.formatPort(services[1], 'rule')[0];
                    service['service']['src_ports'] =
                        policyFormatters.formatPort('0-65535', 'rule')[0];
                    service['isServiceGroup'] = false;
                } else if(services.length === 1){
                    service['service'] = {};
                    if(services[0] === ''){
                        services[0] = 'any';
                    }
                    service['service']['protocol'] = services[0].toLowerCase();
                    service['service']['dst_ports'] =
                        policyFormatters.formatPort('0-65535', 'rule')[0];
                    service['service']['src_ports'] =
                        policyFormatters.formatPort('0-65535', 'rule')[0];
                }
                service['isServiceGroup'] = false;
            }
        return service;
        },
        deleteFirewallRule: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'firewall-rule',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations: {
            fwRuleValidation: {
                'endpoint_2' : function(value, attr, finalObj){
                    return fwPolicyUtils.validateEndPoint('endpoint_2',finalObj);
                },
                'endpoint_1' : function(value, attr, finalObj){
                    return fwPolicyUtils.validateEndPoint('endpoint_1',finalObj);
                },
                'user_created_service' : fwPolicyUtils.validateServices
            }
        },
        addEditFirewallRule: function (callbackObj, options, serviceGroupList) {
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'fwRuleValidation'
                }
            ];
            if(this.isDeepValid(validations)) {
                var ajaxConfig = {}, returnFlag = true, postFWRules = [];
                var postFWRuleData = {};
                var self = this;
                var isGlobal = options.isGlobal;
                var attr = $.extend(true,{},this.model().attributes), newFWRuleData = {};

                newFWRuleData['endpoint_1'] = self.populateEndpointData(attr['endpoint_1']);
                newFWRuleData['endpoint_2'] = self.populateEndpointData(attr['endpoint_2']);
                var getSelectedService = self.getFormatedService(attr['user_created_service'], serviceGroupList);
                    if(getSelectedService.isServiceGroup){
                        newFWRuleData['service_group_refs'] = getSelectedService['service_group_refs'];
                        if(attr['service'] !== undefined){
                            newFWRuleData['service'] = null;
                        }
                    }else{
                        if(getSelectedService['service'] !== undefined){
                            newFWRuleData['service'] = getSelectedService['service'];
                            newFWRuleData['service_group_refs'] = [];
                        }
                    }
                newFWRuleData['action_list'] = {};
                newFWRuleData['action_list']['simple_action'] = attr['simple_action'];
                newFWRuleData['security_logging_object_refs'] = ctwu.setSloToModel(attr);
                newFWRuleData['direction'] = attr['direction'];
                //newFWRuleData['sequence'] = attr['sequence'];
                //newFWRuleData['id_perms'] = {};
                //newFWRuleData['id_perms']["enable"] = attr["enable"];
                newFWRuleData['match_tags'] = {};
                newFWRuleData['match_tags']['tag_list'] = attr.match_tags ? attr.match_tags.split(';') : [];
                //postFWRules.push({'firewall-rule': $.extend(true, {}, newFWRuleData)});
                //postFWRuleData['firewall-rules'] = postFWRules;
                ajaxConfig.type  = "POST";
                if(options.mode === 'edit'){
                    newFWRuleData.uuid = attr.uuid;
                    var postData = {"firewall-rule": newFWRuleData};
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                    ajaxConfig.data  = JSON.stringify(postData);

                } else {
                    attr.name = UUIDjs.create().hex;
                    newFWRuleData['uuid'] = attr.name;
                    if(isGlobal) {
                        newFWRuleData["fq_name"] =
                            [
                              "default-policy-management",
                              attr.name
                            ];
                        newFWRuleData['parent_type'] = "policy-management";
                    } else {
                        newFWRuleData["fq_name"] =
                            [
                              contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME),
                              contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME),
                              attr.name
                            ];
                        newFWRuleData['parent_type'] = "project";
                    }
                    newFWRuleData['name'] = attr.name;
                    if(options.mode === ctwc.INSERT_ABOVE || options.mode === ctwc.INSERT_BELOW) {
                        newFWRuleData['sequenceData'] =
                            options.sequenceData;
                    } /*else {
                        newFWRuleData['sequenceData'] =
                            { prev: '0', current: '1.0', next: '1.1'};
                    }*/
                    postFWRuleData['firewall-rule'] = newFWRuleData;
                    postFWRuleData['fwPolicyId'] = self.getPolicyId();
                    postFWRuleData['mode'] = options.mode;
                    ajaxConfig.url = ctwc.URL_CREATE_POLICY_RULE;
                    ajaxConfig.data  = JSON.stringify(postFWRuleData);
                }

                ajaxConfig.type  = "POST";

                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(
                                            ctwc.FW_RULE_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return fwRuleModel;
});