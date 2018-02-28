define(['lodash', 'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'],
        function(_, TrafficGroupsUtils){
    var SecurityDashboardModelConfig = function () {
        var self = this,
            tgHelpers = new TrafficGroupsUtils();
        self.modelCfg = {
            'TOP_TAGS_MODEL' : {
                type: 'securityDashboard',
                source: 'STATTABLE',
                config: [{
                    table_name: "StatTable.EndpointSecurityStats.eps.client",
                    select: 'eps.client.app, eps.client.tier, eps.client.remote_tier_id,'+
                            'eps.client.site, eps.client.remote_site_id, eps.client.deployment,'+
                            'eps.client.remote_deployment_id,'+
                            'eps.client.remote_app_id, SUM(eps.client.in_bytes)',
                    //modelId: 'top-tags-eps-client',
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    parser: function (data, model) {
                        // Bug from config/vrouter 0x00000000 is being assigned
                        // to tag/label which is not supposed to assign
                        data = _.filter(data, function (value) {
                            return (value['eps.client.remote_app_id'] != '0x00000000' ||
                                    value['eps.client.remote_site_id'] != '0x00000000' ||
                                    value['eps.client.remote_deployment_id'] != '0x00000000' ||
                                    value['eps.client.remote_tier_id'] != '0x00000000')
                                && value['SUM(eps.client.in_bytes)'] != 0;
                        });
                        data =  _.map(data, function (value) {
                           if (value['eps.client.remote_app_id'] != null) {
                               value['remote_app_id'] = value['eps.client.remote_app_id'];
                           }
                           if (value['eps.client.remote_site_id'] != null) {
                               value['remote_site_id'] = value['eps.client.remote_site_id'];
                           }
                           if (value['eps.client.remote_deployment_id'] != null) {
                               value['remote_deployment_id'] = value['eps.client.remote_deployment_id'];
                           }
                           if (value['eps.client.remote_tier_id'] != null) {
                               value['remote_tier_id'] = value['eps.client.remote_tier_id'];
                           }
                           if (value['eps.client.app'] != null) {
                               value['app'] = tgHelpers.getFormattedValue(value['eps.client.app']);
                           }
                           if (value['eps.client.tier'] != null) {
                               value['tier'] = tgHelpers.getFormattedValue(value['eps.client.tier']);
                           }
                           if (value['eps.server.site'] != null) {
                               value['site'] = tgHelpers.getFormattedValue(value['eps.server.site']);
                           }
                           if (value['eps.server.deployment'] != null) {
                               value['deployment'] = tgHelpers.getFormattedValue(value['eps.server.deployment']);
                           }
                           value['client'] = true;
                           return value;
                       });
                       return data;
                    }
                }, {
                    table_name: 'StatTable.EndpointSecurityStats.eps.server',
                    select: 'eps.server.app, eps.server.tier, eps.server.remote_tier_id,'+
                            'eps.server.site, eps.server.remote_site_id, eps.server.deployment,'+
                            'eps.server.remote_deployment_id,'+
                            'eps.server.remote_app_id, SUM(eps.server.out_bytes)',
                    //modelId: 'top-tags-eps-server',
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    type: 'concat',
                    parser: function (data, model) {
                        data = _.filter(data, function (value) {
                            return (value['eps.server.remote_app_id'] != '0x00000000' ||
                                    value['eps.server.remote_site_id'] != '0x00000000' ||
                                    value['eps.server.remote_deployment_id'] != '0x00000000' ||
                                    value['eps.server.remote_tier_id'] != '0x00000000')
                            && value['SUM(eps.server.out_bytes)'] != 0;
                        });
                        data =  _.map(data, function (value) {
                            if (value['eps.server.remote_app_id'] != null) {
                                value['remote_app_id'] = value['eps.server.remote_app_id'];
                            }
                            if (value['eps.server.remote_site_id'] != null) {
                                value['remote_site_id'] = value['eps.server.remote_site_id'];
                            }
                            if (value['eps.server.remote_deployment_id'] != null) {
                                value['remote_deployment_id'] = value['eps.server.remote_deployment_id'];
                            }
                            if (value['eps.server.remote_tier_id'] != null) {
                                value['remote_tier_id'] = value['eps.server.remote_tier_id'];
                            }
                            if (value['eps.server.app'] != null) {
                                value['app'] = tgHelpers.getFormattedValue(value['eps.server.app']);
                            }
                            if (value['eps.server.tier'] != null) {
                                value['tier'] = tgHelpers.getFormattedValue(value['eps.server.tier']);
                            }
                            if (value['eps.server.site'] != null) {
                                value['site'] = tgHelpers.getFormattedValue(value['eps.server.site']);
                            }
                            if (value['eps.server.deployment'] != null) {
                                value['deployment'] = tgHelpers.getFormattedValue(value['eps.server.deployment']);
                            }
                            return value;
                        });
                        return data;
                    }
                }, {
                    source: 'APISERVER',
                    //modelId: 'top-tags-apiserver-tags',
                    table_name: 'tags',
                    mergeFn: {modelKey: 'remote_app_id', joinKey: 'tag_id'}
                }]
            },
            'TOP_VN_MODEL' : {
                type: 'securityDashboard',
                //modelId: 'top-vns-model',
                source: 'STATTABLE',
                config: [{
                    table_name: "StatTable.EndpointSecurityStats.eps.client",
                    select: "eps.client.local_vn, SUM(eps.client.in_bytes)",
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    parser: function (data, model) {
                        data = _.filter(data, function (value) {
                            return value['SUM(eps.client.in_bytes)'] != 0;
                        });
                        return _.map(data, function (value) {
                            //value['local_vn'] = value['eps.client.local_vn']
                            value['client'] = true;
                            return value;
                        });
                    }
                }, {
                    table_name: "StatTable.EndpointSecurityStats.eps.server",
                    select: "eps.server.local_vn, SUM(eps.server.out_bytes)",
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    parser: function (data, model) {
                        return _.filter(data, function (value) {
                            return value['SUM(eps.server.out_bytes)'] != 0;
                        });
                    },
                    type: 'concat'
                }]
            },
            'TOP_VMI_WITH_DENY_MODEL' : {
                type: 'securityDashboard',
                //modelId: 'top-vmis-with-acl-deny-model',
                source: 'STATTABLE',
                config: [{
                    table_name: "StatTable.EndpointSecurityStats.eps.client",
                    select: "name, SUM(eps.client.in_bytes), eps.client.action",
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    parser: function (data, model) {
                        data = _.filter(data, function (value) {
                           return value['SUM(eps.client.in_bytes)'] != 0;
                        });
                        return _.map(data, function (value) {
                            if (value['eps.client.action'] != null && value['eps.client.action'].indexOf('deny')) {
                                value['vmi_uuid'] = tgHelpers.getFormattedValue(value['name']);
                                return value
                            }
                        });
                    }
                }, {
                    table_name: 'virtual-machine-interface',
                    source: 'UVE',
                    cfilt: 'UveVMInterfaceAgent:vm_name',
                    where: function (model, defObj) {
                        var uuidArr = _.map(model.get('data'), 'name').join(',');
                        defObj.resolve(uuidArr);
                    },
                    mergeFn: {modelKey: 'name', joinKey: 'name'}
                }]
            },
            'TOP_ACL_WITH_DENY_MODEL': {
                type: 'securityDashboard',
                //modelId: 'top-acl-with-deny-model',
                source: 'STATTABLE',
                config: [{
                    table_name: "StatTable.EndpointSecurityStats.eps.client",
                    select: "eps.__key, SUM(eps.client.in_pkts), eps.client.action",
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    },
                    parser: function (data, model) {
                        var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                        data = _.filter(data, function (value) {
                            return value['SUM(eps.client.in_pkts)'] != 0 &&
                                defaultRuleUUIDs.indexOf(value['eps.__key']) == -1
                                && value['eps.client.action'].indexOf('deny') > -1;
                        });
                        return _.map(data, function (value) {
                            value['formattedRuleId'] = value['eps.__key'].split(':').pop();
                            return value;
                        });
                    }
                }, {
                    table_name: 'firewall-rules',
                    source: 'APISERVER',
                    fields: ['firewall_policy_back_refs',
                             'service', 'service_group_refs'],
                    where: function (model, defObj) {
                        return getRuleUUIDs(model.get('data'), 'eps.__key', defObj);
                    },
                    mergeFn: {modelKey: 'eps.__key', joinKey: 'uuid', compareFn: function (epsKey, uuid) {
                        if (epsKey != null) {
                            // For default policy we need to compare with
                            // 2 element of array
                            return epsKey.split(':').pop() == uuid;
                        }
                        return false;
                    }}
                }]
            },
            'ALL_TAGS_TRAFFIC_MODEL': {
                type: 'securityDashboard',
                //modelId: 'top-acl-with-deny-model',
                source: 'STATTABLE',
                config: [{
                    table_name: "StatTable.EndpointSecurityStats.eps.client",
                    select: "eps.__key, SUM(eps.client.in_bytes), eps.client.action",
                    where: function (model, defObj) {
                        defObj.resolve("(name Starts with " + ctwu.getCurrentDomainProject() +')');
                    }
                }]
            }
        }
        function getRuleUUIDs (data, uuidKey, defObj) {
            var rule = _.map(data, uuidKey),
            ruleUUIDs = [], ruleUUID;
            _.forEach(rule, function (value) {
                if (value != null && typeof value == 'string' &&
                    value.indexOf(':') > -1) {
                    ruleUUID = value.split(':').pop();
                    if (ruleUUIDs.indexOf(ruleUUID) == -1) {
                        ruleUUIDs.push(ruleUUID);
                    }
                }
            })
            if (defObj != null) {
                defObj.resolve(ruleUUIDs);
            }
        };
    }
    return (new SecurityDashboardModelConfig()).modelCfg;
})
