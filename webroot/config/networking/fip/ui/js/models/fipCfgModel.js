/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/fip/ui/js/views/fipCfgFormatters'
], function (_, ContrailModel, FipCfgFormatters) {
    var formatFipCfg = new FipCfgFormatters();

    var fipCfgModel = ContrailModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null, //[]
            'display_name': '',
            'parent_type': 'floating-ip-pool',
            'uuid': null,
            'floating_ip_address': null,
            'project_refs': null, //[]
            'virtual_machine_interface_refs': null, //[]
            'user_created_alloc_type': 'dynamic', //dynamic/specific
            'user_created_alloc_count': 1,
            'user_created_floating_ip_pool': null
        },

        formatModelConfig: function (modelConfig) {
            var fixedIP = getValueByJsonPath(modelConfig,
                      'virtual_machine_interface_refs', []);
            
            if (fixedIP.length) {
                var fqName = getValueByJsonPath(fixedIP[0],'to', []);
                fqName = fqName.join(":");
                modelConfig['virtual_machine_interface_refs'] = fqName;
            } else {
                modelConfig['virtual_machine_interface_refs'] = null;
            }

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
                'virtual_machine_interface_refs': {
                    required: true,
                    msg: 'Associate a Port to the Floating IP'
                }
            }
        },

        allocateFipCfg: function (callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'floating-ip':{}};

            var that = this;
            if (this.model().isValid(true, "fipCfgConfigValidations")) {
                    locks = this.model().attributes.locks.attributes;

                var newFipCfgData = $.extend(true, {}, this.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                var allocType  = newFipCfgData['user_created_alloc_type'];
                var fqName = newFipCfgData['user_created_floating_ip_pool'].split(":");
                
                delete newFipCfgData['display_name'];
                delete newFipCfgData['name'];
                delete newFipCfgData['uuid'];
                delete newFipCfgData['user_created_alloc_type'];
                delete newFipCfgData['user_created_floating_ip_pool'];
                delete newFipCfgData['virtual_machine_interface_refs'];
                delete newFipCfgData.errors;
                delete newFipCfgData.locks;
                delete newFipCfgData.cgrid;


                newFipCfgData['project_refs'] =
                     [{to: [domain, project]}]; 
                newFipCfgData['fq_name'] = fqName;

                if (allocType == 'dynamic') {
                    delete newFipCfgData['floating_ip_address'];
                } else {
                    newFipCfgData['user_created_alloc_count'] = 1;
                }

                postData['floating-ip'] = newFipCfgData;

                ajaxConfig.async = false;
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
                    callbackObj.error(this.getFormErrorText(ctwl.CFG_FIP_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiReleaseFipCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
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

            var that = this;
            if (this.model().isValid(true, "fipPortCfgConfigValidations")) {
                    locks = this.model().attributes.locks.attributes;

                var newFipCfgData = $.extend(true, {}, this.model().attributes);

                if (newFipCfgData['virtual_machine_interface_refs'] == null ||
                    newFipCfgData['virtual_machine_interface_refs'] == '' ||
                    newFipCfgData['virtual_machine_interface_refs'] == '-') {
                        
                    newFipCfgData['virtual_machine_interface_refs'] = [];
                } else {
                    var fqName = newFipCfgData['virtual_machine_interface_refs'];
                    newFipCfgData['virtual_machine_interface_refs'] = [];
                    newFipCfgData['virtual_machine_interface_refs'][0] =
                                            {to: fqName.split(":")};
                }

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
                delete newFipCfgData.errors;
                delete newFipCfgData.locks;
                delete newFipCfgData.cgrid;

                postData['floating-ip'] = newFipCfgData;

                ajaxConfig.async = false;
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

            var that = this;

            var newFipCfgData = $.extend(true, {}, this.model().attributes);

            newFipCfgData['virtual_machine_interface_refs'] = [];

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
            delete newFipCfgData.errors;
            delete newFipCfgData.locks;
            delete newFipCfgData.cgrid;

            postData['floating-ip'] = newFipCfgData;

            ajaxConfig.async = false;
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
    });

    return fipCfgModel;
});
