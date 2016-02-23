/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var svcHealthChkCfgModel = ContrailModel.extend({

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
                'expected_codes': null  // Unsupported 
            },
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
                },
            }
        },

        addEditSvcHealthChkCfg: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = {'service-health-check':{}};

            var self = this;
            if (self.model().isValid(true, "svcHealthChkCfgConfigValidations")) {

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

                var delay, timeout, max_retries;

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

                ctwu.deleteCGridData(newsvcHealthChkCfgData);
                delete newsvcHealthChkCfgData.id_perms;
                delete newsvcHealthChkCfgData.service_instance_refs;
                delete newsvcHealthChkCfgData.href;
                delete newsvcHealthChkCfgData.parent_href;
                delete newsvcHealthChkCfgData.parent_uuid;

 

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
