/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var QuotasModel = ContrailModel.extend({
        defaultConfig: {
            'virtual_network': null,
            'subnet': null,
            'virtual_machine_interface': null,
            'floating_ip': null,
            'floating_ip_pool': null,
            'access_control_list': null,
            'logical_router': null,
            'network_ipam': null,
            'service_instance': null,
            'security_group': null,
            'security_group_rule': null,
            'loadbalancer_pool': null,
            'loadbalancer_member': null,
            'loadbalancer_healthmonitor': null,
            'virtual_ip': null
        },
        validations: {
            quotasConfigValidations: {
                'virtual_network': function(val, attr, computed) {
                    return this.validateStringOrNumber('Virtual Network',
                                                       val, attr, computed);
                },
                'subnet': function(val, attr, computed) {
                    return this.validateStringOrNumber('Subnet',
                                                       val, attr, computed);
                },
                'virtual_machine_interface': function(val, attr, computed) {
                    return this.validateStringOrNumber('Port',
                                                       val, attr, computed);
                },
                'floating_ip': function(val, attr, computed) {
                    return this.validateStringOrNumber('Floating IP',
                                                       val, attr, computed);
                },
                'floating_ip_pool': function(val, attr, computed) {
                    return this.validateStringOrNumber('Floating IP Pool',
                                                       val, attr, computed);
                },
                'access_control_list': function(val, attr, computed) {
                    return this.validateStringOrNumber('Policy',
                                                       val, attr, computed);
                },
                'logical_router': function(val, attr, computed) {
                    return this.validateStringOrNumber('Router',
                                                       val, attr, computed);
                },
                'network_ipam': function(val, attr, computed) {
                    return this.validateStringOrNumber('Network IPAM',
                                                       val, attr, computed);
                },
                'service_instance': function(val, attr, computed) {
                    return this.validateStringOrNumber('Service Instance',
                                                       val, attr, computed);
                },
                'security_group': function(val, attr, computed) {
                    return this.validateStringOrNumber('Sercurity Group',
                                                       val, attr, computed);
                },
                'security_group_rule': function(val, attr, computed) {
                    return this.validateStringOrNumber('Sercurity Group Rule',
                                                       val, attr, computed);
                },
                'loadbalancer_pool': function(val, attr, computed) {
                    return this.validateStringOrNumber('Loadbalancer Pool',
                                                       val, attr, computed);
                },
                'loadbalancer_member': function(val, attr, computed) {
                    return this.validateStringOrNumber('Loadbalancer Member',
                                                       val, attr, computed);
                },
                'loadbalancer_healthmonitor': function(val, attr, computed) {
                    return this.validateStringOrNumber('Loadbalancer' +
                                                       ' Healthmonitor',
                                                       val, attr, computed);
                },
                'virtual_ip': function(val, attr, computed) {
                    return this.validateStringOrNumber('Virtual IP',
                                                       val, attr, computed);
                }
            },
            validateStringOrNumber: function(str, val, attr, computed) {
                if (('Unlimited' != val) && ("" != val) && (null != val)) {
                    return Backbone.Validation.validators.pattern(val, str,
                                                                  'number', this);
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            /*
            for (key in modelConfig) {
                if (-1 == modelConfig[key]) {
                    modelConfig[key] = "Unlimited";
                }
            }
            */
            return modelConfig;
        },
        configureQuotas: function (projUUID, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "quotasConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newQuotaLimit = this.model().attributes;

                ajaxConfig = {};
                delete newQuotaLimit['cgrid'];
                delete newQuotaLimit['errors'];
                delete newQuotaLimit['locks'];
                delete newQuotaLimit['elementConfigMap'];
                for (key in newQuotaLimit) {
                    if (null != newQuotaLimit[key]) {
                        if ('Unlimited' == newQuotaLimit[key]) {
                            newQuotaLimit[key] = -1;
                        } else if ("" == newQuotaLimit[key]) {
                            newQuotaLimit[key] = null;
                        } else {
                            newQuotaLimit[key] = parseInt(newQuotaLimit[key]);
                        }
                    }
                }
                var putData = {};
                putData['quota'] = newQuotaLimit;

                ajaxConfig.async = false;
                ajaxConfig.type = "PUT";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = '/api/tenants/config/update-quotas/' + projUUID;
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.LINK_LOCAL_SERVICES_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return QuotasModel;
});

