/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var QuotasModel = ContrailModel.extend({
        defaultConfig: {
            'virtual_network': -1,
            'subnet': -1,
            'virtual_machine_interface': -1,
            'floating_ip': -1,
            'floating_ip_pool': -1,
            'network_policy': -1,
            'logical_router': -1,
            'network_ipam': -1,
            'service_instance': -1,
            'security_group': -1,
            'security_group_rule': -1,
            'loadbalancer_pool': -1,
            'loadbalancer_member': -1,
            'loadbalancer_healthmonitor': -1,
            'virtual_ip': -1
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
                'network_policy': function(val, attr, computed) {
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
                var numPat = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
                if (null != val) {
                    if (typeof val === 'string') {
                        val = val.trim();
                    }
                    if (('Unlimited' != val) && ("" != val) && (-1 != val)) {
                        if (!(_.isNumber(val) ||
                              (_.isString(val) && val.match(numPat)))) {
                            return "Value must be 'Unlimited' or -1 or " +
                                "any positive integer";
                        }
                    }
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            _.forEach(this.defaultConfig, function(value, key) {
              if(modelConfig[key] === -2)
                modelConfig[key] = null;
            });
            return modelConfig;
        },
        configureQuotas: function (projUUID, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "quotasConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newQuotaLimit = $.extend({}, true, this.model().attributes);

                ajaxConfig = {};
                ctwu.deleteCGridData(newQuotaLimit);
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
                    callbackObj.error(this.getFormErrorText(ctwl.QUOTAS_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return QuotasModel;
});

