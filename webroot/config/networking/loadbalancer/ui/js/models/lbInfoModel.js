/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var lbInfoModel = ContrailModel.extend({
        defaultConfig: {
            "display_name": "",
            "description":"",
            "loadbalancer_provider": "",
            "loadbalancer_properties": {},
            "admin_state": true,
            "fixed_ip": "",
            "associated_ip_address": ""
        },

        formatModelConfig: function(modelConfig) {
            modelConfig["admin_state"] = getValueByJsonPath(modelConfig,
                    "loadbalancer_properties;admin_state", false);
            var ips = getValueByJsonPath(modelConfig,
                    "loadbalancer_properties;vip_address", '');
            if(ips != ''){
                modelConfig["fixed_ip"] = ips;
            }
            var description = getValueByJsonPath(modelConfig,
                    "id_perms;description", '');
            if(description != ''){
                modelConfig["description"] = description;
            }
            return modelConfig;
        },
        updateLoadBalancer: function(callbackObj){
            var ajaxConfig = {};
            var self = this;
            var model = $.extend(true,{},this.model().attributes);
            var obj = {};
            obj.loadbalancer = {};
            obj.loadbalancer.display_name = model.display_name;
            obj.loadbalancer.uuid = model.uuid;
            model.id_perms.description = model.description;
            obj.loadbalancer.id_perms = model.id_perms;
            obj.loadbalancer.loadbalancer_properties = {};
            obj.loadbalancer.loadbalancer_properties['admin_state'] = model.admin_state;
            ajaxConfig.url = ' /api/tenants/config/lbaas/load-balancer/'+ model.uuid;
            ajaxConfig.type  = 'PUT';
            ajaxConfig.data  = JSON.stringify(obj);
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
        },
        associateFloatingIp: function(callbackObj, options){
            var ajaxConfig = {}, floatingObj, selPoolObj;
            var self = this;
            var model = $.extend(true,{},this.model().attributes);
            var obj = {};
            if(model.associated_ip_address !== ''){
                var uuid = model.associated_ip_address;
                //var objType = model.associated_ip_address.split(';')[1];
                //if(objType === 'floating_ip_address'){
                    var fipObj = options.floatingIpObj;
                    _.each(fipObj, function(obj) {
                        if(obj.uuid === uuid){
                            floatingObj = obj;
                        }
                    });
                /*}else{
                    var poolObj = options.fipPoolObj;
                    _.each(poolObj, function(obj) {
                        if(obj.uuid === uuid){
                            floatingObj = obj;
                        }
                    });
                }*/
                obj['fixed_ip_aap'] = 'fixed-ip';
                obj['floating_ip_fixed_ip_address'] = options.vmiFixedIp;
                if(floatingObj.fq_name === undefined){
                    obj['fq_name'] = floatingObj.to;
                }else{
                   obj['fq_name'] = floatingObj.fq_name;
                }
                obj['owner_visible'] = true;
                obj.uuid = floatingObj.uuid;
                var vmi = options.vmiTo.join(':');
                var newVmi = vmi + ';' +  options.vmiFixedIp;
                obj['user_created_virtual_machine_interface_refs'] = newVmi;
                var vmiObj = {};
                vmiObj.to = options.vmiTo;
                var vmiObjList = [];
                vmiObjList.push(vmiObj);
                obj['virtual_machine_interface_refs'] = vmiObjList;
                var modelObj = {};
                modelObj['floating-ip'] = obj;
                ajaxConfig.url = ' /api/tenants/config/floating-ip/' + uuid;
                ajaxConfig.type  = 'PUT';
                ajaxConfig.data  = JSON.stringify(modelObj);
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
            }
        },
        deAssociateFloatingIp: function(callbackObj, options){
            var ajaxConfig = {}, defloatingObj, selPoolObj;
            var self = this;
            var model = $.extend(true,{},this.model().attributes);
            var obj = {};
            var uuid = options.floatingUuid;
            var fipObj = options.floatingIpObj;
            _.each(fipObj, function(obj) {
                if(obj.uuid === uuid){
                    defloatingObj = obj;
                }
            });
            obj['fixed_ip_aap'] = 'fixed-ip';
            obj['floating_ip_fixed_ip_address'] = options.vmiFixedIp;
            obj['fq_name'] = defloatingObj.fq_name;
            obj['owner_visible'] = true;
            obj.uuid = defloatingObj.uuid;
            obj['virtual_machine_interface_refs'] = [];
            var modelObj = {};
            modelObj['floating-ip'] = obj;
            ajaxConfig.url = ' /api/tenants/config/floating-ip/' + uuid;
            ajaxConfig.type  = 'PUT';
            ajaxConfig.data  = JSON.stringify(modelObj);
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
        },
        multiDeleteLB: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];
            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });
            ajaxConfig.type = "POST";
            ajaxConfig.url = '/api/tenants/config/lbaas/load-balancer/delete';
            ajaxConfig.data = JSON.stringify({'uuids': uuidList});
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
        }
    });
    return lbInfoModel;
});