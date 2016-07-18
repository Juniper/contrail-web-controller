/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var vRouterCfgModel = ContrailConfigModel.extend({
        constructor: function () {
            ContrailConfigModel.apply(this,arguments);
            if (this.virtual_router_type() == '' ||
                this.virtual_router_type() == [] ||
                this.virtual_router_type() == null) {
                this.virtual_router_type('hypervisor');
            }
        },

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'global-system-config',
            'virtual_router_type': 'hypervisor',
            'virtual_router_ip_address': null
        },

        formatModelConfig: function(modelConfig) {
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        validations: {
            vRouterCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Virtual Router Name'
                },
                'virtual_router_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                    msg: 'Enter valid IP Address'
                }
            }
        },

        addEditvRouterCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'virtual-router':{}};

            var self  = this;
            var validation = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'vRouterCfgConfigValidations'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            if (self.isDeepValid(validation)) {

                var newvRouterCfgData = $.extend({},this.model().attributes);
                if (newvRouterCfgData['display_name'] == '') {
                    newvRouterCfgData['display_name'] = newvRouterCfgData['name'];
                }
                if (newvRouterCfgData['fq_name'] == [] ||
                    newvRouterCfgData['fq_name'] == null) {
                    newvRouterCfgData['fq_name'] = [];
                    newvRouterCfgData['fq_name'][0] = 'default-global-system-config';
                    newvRouterCfgData['fq_name'][1] = newvRouterCfgData['name'];
                }

                if (newvRouterCfgData['virtual_router_type'] === 'hypervisor') {
                    newvRouterCfgData['virtual_router_type'] = null;
                }
                //permissions
                self.updateRBACPermsAttrs(newvRouterCfgData);
                ctwu.deleteCGridData(newvRouterCfgData);
                delete newvRouterCfgData.id_perms;
                delete newvRouterCfgData.physical_router_back_refs;
                delete newvRouterCfgData.href;
                delete newvRouterCfgData.parent_href;
                delete newvRouterCfgData.parent_uuid;


                postData['virtual-router'] = newvRouterCfgData;

                var ajaxType     = contrail.checkIfExist(ajaxMethod) ? ajaxMethod : "POST";
                ajaxConfig.async = false;
                ajaxConfig.type  = ajaxType;
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = ajaxType == 'PUT' ?
                                   '/api/tenants/config/virtual-router/' +
                                   newvRouterCfgData['uuid'] :
                                   '/api/tenants/config/virtual-routers';


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
                    callbackObj.error(this.getFormErrorText(ctwl.CFG_VROUTER_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiDeletevRouterCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'virtual-router',
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
        }

    });
    return vRouterCfgModel;
});
