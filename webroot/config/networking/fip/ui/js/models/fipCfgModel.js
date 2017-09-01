/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {

    var fipCfgModel = ContrailConfigModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null, //[]
            'display_name': '',
            'parent_type': 'floating-ip-pool',
            'uuid': null,
            'floating_ip_address': null,
            'project_refs': null, //[]
            'virtual_machine_interface_refs': null, //[]
            'user_created_virtual_machine_interface_refs': null, //[]
            'user_created_alloc_type': 'dynamic', //dynamic/specific
            'user_created_alloc_count': 1,
            'user_created_floating_ip_pool': null,
            'is_specific_ip': true, //flag to map selected fixed ip to fip
            'floating_ip_fixed_ip_address': null,
            'fixed_ip_aap': 'fixed-ip'
        },

        formatModelConfig: function (modelConfig) {
            var vmiRef = getValueByJsonPath(modelConfig,
                      'virtual_machine_interface_refs', null),
                floatingIPFixedIP = getValueByJsonPath(modelConfig,
                    'floating_ip_fixed_ip_address', null),
                fixedIP;
            var vmiArray = [];
            var fixedIPList = [];
            var containsFixedIp;

            if (vmiRef) {
               for(var i= 0; i<vmiRef.length; i++){
                    fixedIPList.push(getValueByJsonPath(vmiRef[i],
                            "instance_ip_back_refs;0;fixedip;ip", ""));
                }
                containsFixedIp = _.contains(fixedIPList, floatingIPFixedIP);
                if(floatingIPFixedIP === null && containsFixedIp == false) {
                    modelConfig["is_specific_ip"] = false;
                    modelConfig['fixed_ip_aap'] = "fixed-ip";
                }
                else if(floatingIPFixedIP && containsFixedIp == true) {
                    modelConfig["is_specific_ip"] = true;
                    modelConfig['fixed_ip_aap'] = "fixed-ip";
                    modelConfig['floating_ip_fixed_ip_address'] = '';
                } else {
                    modelConfig["is_specific_ip"] = false;
                    modelConfig['fixed_ip_aap'] = "aap";
                }
                _.each(vmiRef, function(refs){
                     var fqNameItem = getValueByJsonPath(refs,'to', []);
                     vmiArray.push(fqNameItem.join(":") + cowc.DROPDOWN_VALUE_SEPARATOR + getValueByJsonPath(refs, 'instance_ip_back_refs;0;fixedip;ip', ''));
                });
                modelConfig['virtual_machine_interface_refs'] = vmiArray;
                modelConfig['user_created_virtual_machine_interface_refs'] = vmiArray[0];
            } else {
                modelConfig['virtual_machine_interface_refs'] = null;
            }
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        validations: {
            fipCfgConfigValidations: {
                'user_created_floating_ip_pool': {
                    required: true,
                    msg: 'Associate a Floating IP Pool to the Project'
                },
                'user_created_alloc_count': {
                    min: 1,
                    max: 50,
                    required: false,
                    msg: 'Number of IP Addresses must be within 1 - 50'
                },
                'floating_ip_address': {
                    required: false,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            },
            fipPortCfgConfigValidations: {
                'virtual_machine_interface_refs' : function(value, attr, finalObj){
                    if(finalObj['fixed_ip_aap'] == "aap" && finalObj['is_specific_ip'] == false){
                        if(value === '' || value === null){
                            return "Associate a Port to the Floating IP";
                        }
                    }
                },
                'user_created_virtual_machine_interface_refs' : function(value, attr, finalObj){
                    if(finalObj['fixed_ip_aap'] == "fixed-ip" && finalObj['is_specific_ip'] == true){
                        if(value === '' || value === null){
                            return "Associate a Port to the Floating IP";
                        }
                    }
                }
            }
        },

        allocateFipCfg: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'floating-ip':{}};

            var self = this;

            var validation = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'fipCfgConfigValidations'
              },
              //permissions
              ctwu.getPermissionsValidation()
            ];

            if (this.isDeepValid(validation)) {

                var newFipCfgData = $.extend(true, {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                var allocType  = newFipCfgData['user_created_alloc_type'];
                var fqName = newFipCfgData['user_created_floating_ip_pool'].split(":");
                //permissions
                this.updateRBACPermsAttrs(newFipCfgData);
                ctwu.deleteCGridData(newFipCfgData);
                delete newFipCfgData['display_name'];
                delete newFipCfgData['name'];
                delete newFipCfgData['uuid'];
                delete newFipCfgData['user_created_alloc_type'];
                delete newFipCfgData['user_created_floating_ip_pool'];
                delete newFipCfgData['user_created_virtual_machine_interface_refs'];
                delete newFipCfgData['virtual_machine_interface_refs'];
                delete newFipCfgData["is_specific_ip"];
                delete newFipCfgData["floating_ip_fixed_ip_address"];

                newFipCfgData['project_refs'] =
                     [{to: [domain, project]}];
                newFipCfgData['fq_name'] = fqName;

                if (allocType == 'dynamic') {
                    delete newFipCfgData['floating_ip_address'];
                } else {
                    newFipCfgData['user_created_alloc_count'] = 1;
                }
                postData['floating-ip'] = newFipCfgData;

                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = '/api/tenants/config/floating-ips';

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
                    callbackObj.error(self.getFormErrorText(ctwl.CFG_FIP_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiReleaseFipCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'floating-ip',
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

        associateFipCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'floating-ip':{}};
            var fqnameList;
            var fqName;
            var self = this;
            if (self.model().isValid(true, "fipPortCfgConfigValidations")) {

                var newFipCfgData = $.extend(true, {}, self.model().attributes);
                if (newFipCfgData['virtual_machine_interface_refs'] == ''
                    && newFipCfgData['user_created_virtual_machine_interface_refs' =='']) {
                    newFipCfgData['virtual_machine_interface_refs'] = [];
                } else {
                    if(newFipCfgData["is_specific_ip"] &&  newFipCfgData['fixed_ip_aap'] !== "aap"){
                        fqnameList = newFipCfgData['user_created_virtual_machine_interface_refs'].split(",");
                    }
                    else{
                        fqnameList = newFipCfgData['virtual_machine_interface_refs'].split(",");
                    }
                    newFipCfgData['virtual_machine_interface_refs'] = [];
                    for(i=0; i<fqnameList.length; i++){
                        fqName = fqnameList[i].split(cowc.DROPDOWN_VALUE_SEPARATOR);
                        if(fqName.length === 2) {
                            newFipCfgData['virtual_machine_interface_refs'].push({to: fqName[0].split(":")});
                            if(newFipCfgData["is_specific_ip"] && newFipCfgData["fixed_ip_aap"] != "aap") {
                                newFipCfgData['floating_ip_fixed_ip_address'] =
                                    fqName[1];
                             }
                            else if(newFipCfgData["fixed_ip_aap"] === "aap") {
                                newFipCfgData['floating_ip_fixed_ip_address'] = newFipCfgData['floating_ip_fixed_ip_address'];
                            }
                            else{
                                newFipCfgData['floating_ip_fixed_ip_address'] = null;
                            }
                        }
                    }
                }

                self.deleteAttributes(newFipCfgData);

                postData['floating-ip'] = newFipCfgData;

                ajaxConfig.type  = 'PUT';
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = '/api/tenants/config/floating-ip/' + newFipCfgData['uuid'];

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
                    callbackObj.error(this.getFormErrorText(ctwl.CFG_FIP_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        disAssociateFipCfg: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'floating-ip':{}};

            var self = this;

            var newFipCfgData = $.extend(true, {}, self.model().attributes);

            newFipCfgData['virtual_machine_interface_refs'] = [];
            newFipCfgData['floating_ip_fixed_ip_address'] = null;

            self.deleteAttributes(newFipCfgData);

            postData['floating-ip'] = newFipCfgData;

            ajaxConfig.type  = 'PUT';
            ajaxConfig.data  = JSON.stringify(postData);
            ajaxConfig.url   = '/api/tenants/config/floating-ip/' + newFipCfgData['uuid'];

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
         return returnFlag;
        },

        deleteAttributes: function (newFipCfgData) {
            ctwu.deleteCGridData(newFipCfgData);
            delete newFipCfgData['display_name'];
            delete newFipCfgData['name'];
            delete newFipCfgData['project_refs'];
            delete newFipCfgData['id_perms'];
            delete newFipCfgData['parent_href'];
            delete newFipCfgData['parent_uuid'];
            delete newFipCfgData['parent_type'];
            delete newFipCfgData['href'];
            delete newFipCfgData['floating_ip_address'];
            delete newFipCfgData['user_created_alloc_type'];
            delete newFipCfgData['user_created_alloc_count'];
            delete newFipCfgData['user_created_floating_ip_pool'];
            delete newFipCfgData['perms2'];
            delete newFipCfgData['share_list'];
            delete newFipCfgData["is_specific_ip"];
        }
    });

    return fipCfgModel;
});
