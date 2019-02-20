/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
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
                'expected_codes': '',
                'health_check_type': 'link-local',
                'delayUsecs': 0,
                'timeoutUsecs': 0
            },
            delay_label: 'Delay (secs)',
            timeout_label: 'Timeout (secs)',
            max_retries_label: 'Retries',
            expected_codes_label: 'Expected Codes',
            user_created_monitor_type: 'PING',
            user_created_health_check_type: "link-local",
            'monitor_type_list': []
        },

        formatModelConfig: function(modelConfig) {
            //permissions
            var monitorType = _.get(modelConfig, 'service_health_check_properties.monitor_type', 'PING');
            if(monitorType === 'BFD'){
                modelConfig.service_health_check_properties.delay = _.get(modelConfig, 'service_health_check_properties.delay', '0');
                modelConfig.service_health_check_properties.timeout = _.get(modelConfig, 'service_health_check_properties.timeout', '0');
            }
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        validations: {
            svcHealthChkCfgConfigValidations: {
                'name': {
                    required: true,
                    msg: 'Enter Name'
                },
                'service_health_check_properties.url_path': function (value, attr, finalObj) {
                   var segementObj = getValueByJsonPath(finalObj, "user_created_health_check_type", []);
                   var service_health_check_url_path =
                      getValueByJsonPath(finalObj, "service_health_check_properties;url_path", []);
                    if(segementObj != "segment" && service_health_check_url_path.length === 0){
                        return "Should have valid Url Path";
                    }
                },
                'service_health_check_properties.delay': function (value, attr, finalObj){
                    var delay = Number(finalObj.service_health_check_properties.delay);
                    if(finalObj.user_created_monitor_type === 'BFD'){
                        var delayUsecs = Number(finalObj.service_health_check_properties.delayUsecs);
                        if((delay + delayUsecs) <= 0){
                            return '';
                        }
                    }else if(delay < 1){
                        return 'Service health check properties. delay must be greater than or equal to 1';
                    }
                    if(delay > 65535){
                        return 'Service health check properties. delay must be less than or equal to 65535'; 
                    }
                },
                'service_health_check_properties.max_retries': {
                    required: false,
                    min: 1,
                    max: 65535
                },
                'service_health_check_properties.timeout': function (value, attr, finalObj){
                    var timeout = Number(finalObj.service_health_check_properties.timeout);
                    if(finalObj.user_created_monitor_type === 'BFD'){
                        var timeoutUsecs = Number(finalObj.service_health_check_properties.timeoutUsecs);
                        if((timeout + timeoutUsecs) <= 0){
                            return '';
                        }
                    }else if(timeout < 1){
                        return 'Service health check properties. timeout must be greater than or equal to 1';
                    }
                    if(timeout > 65535){
                        return 'Service health check properties. timeout must be less than or equal to 65535'; 
                    }
                },
                'service_health_check_properties.delayUsecs': function (value, attr, finalObj){
                    if(finalObj.user_created_monitor_type === 'BFD'){
                        var delay = Number(finalObj.service_health_check_properties.delay);
                        var usecs = Number(finalObj.service_health_check_properties.delayUsecs);
                        var delayUsecs = delay + usecs;
                        if(delayUsecs <= 0){
                            return "Desired Min Tx Interval (secs + micro secs) should be greater than zero.";
                        }
                    }
                },
                'service_health_check_properties.timeoutUsecs': function (value, attr, finalObj){
                    if(finalObj.user_created_monitor_type === 'BFD'){
                        var timeout = Number(finalObj.service_health_check_properties.timeout);
                        var usecs = Number(finalObj.service_health_check_properties.timeoutUsecs);
                        var timeoutUsecs = timeout + usecs;
                        if(timeoutUsecs <= 0){
                            return "Required Min Rx Interval (secs + micro secs) should be greater than zero.";
                        }
                    }
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
                if (newsvcHealthChkCfgData['fq_name'] == null ||
                    !newsvcHealthChkCfgData['fq_name'].length) {
                    newsvcHealthChkCfgData['fq_name'] = [];
                    newsvcHealthChkCfgData['fq_name'][0] = domain;
                    newsvcHealthChkCfgData['fq_name'][1] = project;
                    newsvcHealthChkCfgData['fq_name'][2] = newsvcHealthChkCfgData['name'];
                }

                var delay, timeout, max_retries,
                    monitorType = newsvcHealthChkCfgData["user_created_monitor_type"];
                var userCreatedHealthCheckType = newsvcHealthChkCfgData['user_created_health_check_type'];
                delay = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;delay', '').toString();
                timeout = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;timeout', '').toString();
                max_retries = getValueByJsonPath(newsvcHealthChkCfgData,
                                'service_health_check_properties;max_retries', '').toString();
                var expected_codes = getValueByJsonPath(newsvcHealthChkCfgData,
                        'service_health_check_properties;expected_codes', '').toString();

                delay = delay.trim().length != 0 ? Number(delay) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['delay'] = delay;
                timeout = timeout.trim().length != 0 ? Number(timeout) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['timeout'] = timeout;
                max_retries = max_retries.trim().length != 0 ? Number(max_retries) : null;
                newsvcHealthChkCfgData['service_health_check_properties']['max_retries'] = max_retries;
                newsvcHealthChkCfgData['service_health_check_properties']['expected_codes'] = expected_codes;

                //BFD
                if(monitorType === ctwc.BFD) {
                    if(newsvcHealthChkCfgData['service_health_check_properties']['delay'] === null){
                        newsvcHealthChkCfgData['service_health_check_properties']['delay'] = 0;
                    }
                    if(newsvcHealthChkCfgData['service_health_check_properties']['timeout'] === null){
                        newsvcHealthChkCfgData['service_health_check_properties']['timeout'] = 0;
                    }
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
                newsvcHealthChkCfgData['service_health_check_properties']['health_check_type'] = userCreatedHealthCheckType;
                if(newsvcHealthChkCfgData['service_health_check_properties']['health_check_type'] === ctwc.SEGMENT){
                    newsvcHealthChkCfgData['service_health_check_properties']['url_path'] = null;
                }
                //permissions
                this.updateRBACPermsAttrs(newsvcHealthChkCfgData);

                ctwu.deleteCGridData(newsvcHealthChkCfgData);
                delete newsvcHealthChkCfgData.id_perms;
                delete newsvcHealthChkCfgData.service_instance_refs;
                delete newsvcHealthChkCfgData.href;
                delete newsvcHealthChkCfgData.parent_href;
                delete newsvcHealthChkCfgData.parent_uuid;
                delete newsvcHealthChkCfgData.user_created_monitor_type;
                delete newsvcHealthChkCfgData.user_created_health_check_type;
                delete newsvcHealthChkCfgData.delay_label;
                delete newsvcHealthChkCfgData.timeout_label;
                delete newsvcHealthChkCfgData.max_retries_label;
                delete newsvcHealthChkCfgData.expected_codes_label;
                var ajaxType     = contrail.checkIfExist(ajaxMethod) ?
                                                        ajaxMethod : "POST";

                var postData = {"service-health-check": newsvcHealthChkCfgData};
                if (ajaxType == 'POST') {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
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
