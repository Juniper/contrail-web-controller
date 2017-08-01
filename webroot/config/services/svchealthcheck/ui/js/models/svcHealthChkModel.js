/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var svcHealthChkCfgModel = ContrailConfigModel.extend({

        defaultConfig: {
            'name': '',
            'fq_name': null,
            'display_name': '',
            'parent_type': 'project',
            'service_health_check_properties': {
                'enabled': true,
                'monitor_type': 'PING', //HTTP|PING
                'delay': 3,             // In seconds
                'timeout': 5,           // In seconds
                'max_retries': 2,
                'http_method': null,    //Unsupported
                'url_path': null,       // i.e. http://local-ip, icmp://local-ip,
                                        // 192.168.2.1,
                                        // http://my-vm-hostname:8080
                'expected_codes': null,  // Unsupported
                'health_check_type': 'link-local',
                'delayUsecs': 0,
                'timeoutUsecs': 0
            },
            delay_label: 'Delay (secs)',
            timeout_label: 'Timeout (secs)',
            max_retries_label: 'Retries',
            user_created_monitor_type: 'PING'
        },

        formatModelConfig: function(modelConfig) {
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        validations: {
            svcHealthChkCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'service_health_check_properties.url_path': {
                    required: true,
                    msg: 'local-ip | hostname + :port | ip-address'
                },
                'service_health_check_properties.delay': {
                    required: false,
                    min: 1,
                    max: 65535
                },
                'service_health_check_properties.max_retries': {
                    required: false,
                    min: 1,
                    max: 65535
                },
                'service_health_check_properties.timeout': {
                    required: false,
                    min: 1,
                    max: 65535
                }
            }
        },

        addEditSvcHealthChkCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'service-health-check':{}};

            var self = this;
            var validation = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'svcHealthChkCfgConfigValidations'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            if (self.isDeepValid(validation)) {

                var newsvcHealthChkCfgData = $.extend(true,
                                                {}, self.model().attributes);

                var domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                var project = contrail.getCookie(cowc.COOKIE_PROJECT);

                if (newsvcHealthChkCfgData['display_name'] == '') {
                    newsvcHealthChkCfgData['display_name'] = newsvcHealthChkCfgData['name'];
                }
                if (newsvcHealthChkCfgData['fq_name'] == [] ||
                    newsvcHealthChkCfgData['fq_name'] == null) {
                    newsvcHealthChkCfgData['fq_name'] = [];
                    newsvcHealthChkCfgData['fq_name'][0] = domain;
                    newsvcHealthChkCfgData['fq_name'][1] = project;
                    newsvcHealthChkCfgData['fq_name'][2] = newsvcHealthChkCfgData['name'];
                }

                var delay, timeout, max_retries,
                    monitorType = newsvcHealthChkCfgData["user_created_monitor_type"];

                delay = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;delay', '').toString();
                timeout = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;timeout', '').toString();
                max_retries = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;max_retries', '').toString();

                delay = delay.trim().length != 0 ? Number(delay) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['delay'] = delay;
                timeout = timeout.trim().length != 0 ? Number(timeout) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['timeout'] = timeout;
                max_retries = max_retries.trim().length != 0 ? Number(max_retries) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['max_retries'] = max_retries;

                //BFD
                if(monitorType === ctwc.BFD) {
                    var delayUsecs =  getValueByJsonPath(newsvcHealthChkCfgData,
                            'service_health_check_properties;delayUsecs', '').toString();
                    var timeoutUsecs =  getValueByJsonPath(newsvcHealthChkCfgData,
                            'service_health_check_properties;timeoutUsecs', '').toString();

                    delayUsecs = delayUsecs.trim().length !== 0 ? Number(delayUsecs) : null;
                    timeoutUsecs = timeoutUsecs.trim().length !== 0 ? Number(timeoutUsecs) : null;
                    newsvcHealthChkCfgData['service_health_check_properties']['delayUsecs'] = delayUsecs;
                    newsvcHealthChkCfgData['service_health_check_properties']['timeoutUsecs'] = timeoutUsecs;
                } else {
                    delete newsvcHealthChkCfgData.service_health_check_properties.delayUsecs;
                    delete newsvcHealthChkCfgData.service_health_check_properties.timeoutUsecs;
                }
                newsvcHealthChkCfgData['service_health_check_properties']['monitor_type'] = monitorType;

                //permissions
                this.updateRBACPermsAttrs(newsvcHealthChkCfgData);

                ctwu.deleteCGridData(newsvcHealthChkCfgData);
                delete newsvcHealthChkCfgData.id_perms;
                delete newsvcHealthChkCfgData.service_instance_refs;
                delete newsvcHealthChkCfgData.href;
                delete newsvcHealthChkCfgData.parent_href;
                delete newsvcHealthChkCfgData.parent_uuid;
                delete newsvcHealthChkCfgData.user_created_monitor_type;
                delete newsvcHealthChkCfgData.delay_label;
                delete newsvcHealthChkCfgData.timeout_label;
                delete newsvcHealthChkCfgData.max_retries_label;

 

                var ajaxType     = contrail.checkIfExist(ajaxMethod) ?
                                                        ajaxMethod : "POST";

                if (ajaxType == 'POST') {
                    postData = {"data":[{"data":{"service-health-check": newsvcHealthChkCfgData},
                                "reqUrl": "/service-health-checks"}]};
                    ajaxConfig.url = '/api/tenants/config/create-config-object'; 
                } else {
                    postData = {"data":[{"data":{"service-health-check": newsvcHealthChkCfgData},
                                "reqUrl": "/service-health-check/" +
                                newsvcHealthChkCfgData.uuid}]};
                    ajaxConfig.url = '/api/tenants/config/update-config-object'; 
                }
                ajaxConfig.async = false;
                ajaxConfig.type  = 'POST';
                ajaxConfig.data  = JSON.stringify(postData);

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
                                            ctwl.CFG_SVC_HEALTH_CHK_PREFIX_ID));
                }
            }

            return returnFlag;
        },

        multiDeleteSvcHealthChkCfg: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-health-check',
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

    });

    return svcHealthChkCfgModel;
});
