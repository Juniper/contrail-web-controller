/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/models/ipSubnetModel'
], function (_, ContrailModel, IPSubnetModel) {
    var bgpOptionsModel = ContrailModel.extend({
        defaultConfig: {
            "autonomous_system": 64513,
            "ibgp_auto_mesh": true,
            "ip_fabric_subnets": {
                "subnet": []
            },
            "graceful_restart_parameters": {
                "enable": false,
                "restart_time": 300,
                "long_lived_restart_time": 300,
                "end_of_rib_timeout": 300,
                "bgp_helper_enable": false,
                "xmpp_helper_enable": false
            },
            "graceful_restart_enable": false,
            "bgpaas_parameters": {
                "port_start": 50000,
                "port_end": 50512
            },
            "bgp_always_compare_med": false,
            "user_created_bgpaas_parameters": "50000 - 50512"
        },
        validations: {
            bgpOptionsValidations: {
                'autonomous_system': function(value, attr, finalObj) {
                    var asn = Number(value);
                    if (isNaN(asn) || asn < 1 || asn > 65534) {
                        return "Enter ASN number between 1-65534";
                    }
                },
                'user_created_bgpaas_parameters': function(value, attr, finalObj) {
                   if(value) {
                       var ports =  value.split('-'), startPort, endPort;
                       if(ports.length !== 2) {
                           return "Enter Start Port - End Port";
                       }
                       startPort = Number(ports[0]);
                       endPort = Number(ports[1]);
                       if(startPort < 1 || endPort > 65535) {
                           return "Enter port between 1 - 65535";
                       }
                       if(startPort > endPort) {
                           return "Start Port should be less than" +
                               " or equal to End Port";
                       }
                   }
                },
                "graceful_restart_parameters.restart_time":
                function(value, attr, finalObj) {
                    if(value) {
                        var gfRestartTime = Number(value);
                        if (isNaN(gfRestartTime) || gfRestartTime < 0 ||
                                gfRestartTime > 4095) {
                            return "Enter Graceful Restart Time " +
                                "between 0-4095";
                        }
                    }
                },
                "graceful_restart_parameters.long_lived_restart_time":
                function(value, attr,
                        finalObj) {
                    if(value) {
                        var llgRestartTime = Number(value);
                        if (isNaN(llgRestartTime) || llgRestartTime < 0 ||
                                llgRestartTime > 16777215) {
                            return "Enter LLGR Time " +
                                "between 0-16777215";
                        }
                    }
                },
                "graceful_restart_parameters.end_of_rib_timeout":
                 function(value, attr, finalObj) {
                    if(value) {
                        var endOfRIBReceiveTime = Number(value);
                        if (isNaN(endOfRIBReceiveTime) ||
                                endOfRIBReceiveTime < 0 ||
                                endOfRIBReceiveTime > 4095) {
                            return "Enter End of RIB Timeout " +
                                "between 0-4095";
                        }
                    }
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            /* Subnets */
            var fabSubnetModel;
            var fabSubnetModels = [];
            var fabSubnetCollectionModel0, subnet;
            var ipSubnets = getValueByJsonPath(modelConfig,
                "ip_fabric_subnets;subnet", []);
            var ipSubnetsCnt = ipSubnets.length;
            for (var i = 0; i < ipSubnetsCnt; i++) {
                subnet = ipSubnets[i].ip_prefix + "/" + ipSubnets[i].ip_prefix_len;
                fabSubnetModel =
                    new IPSubnetModel({ip_fabric_subnets: subnet});
                fabSubnetModels.push(fabSubnetModel);
            }
            fabSubnetCollectionModel = new Backbone.Collection(fabSubnetModels);
            modelConfig['ipFabricSubnets'] = fabSubnetCollectionModel;
            if (null != modelConfig['ip_fabric_subnets']) {
                delete modelConfig['ip_fabric_subnets'];
            }

            //populate user_created_bgpaas_parameters
            var bgpaasPortStart = getValueByJsonPath(modelConfig,
                    'bgpaas_parameters;port_start', null),
                bgpaasPortEnd = getValueByJsonPath(modelConfig,
                            'bgpaas_parameters;port_end', null);
            if(bgpaasPortStart && bgpaasPortEnd) {
                modelConfig["user_created_bgpaas_parameters"] =
                    bgpaasPortStart.toString() + ' - ' + bgpaasPortEnd.toString();
            }

            //set graceful_restart_enable
            modelConfig["graceful_restart_enable"] =
                getValueByJsonPath(modelConfig,
                        "graceful_restart_parameters;enable", false);
            modelConfig['ibgp_auto_mesh'] =
                (($.trim(modelConfig['ibgp_auto_mesh']).length === 0) ? "true" : modelConfig['ibgp_auto_mesh'].toString());
            modelConfig['bgp_always_compare_med'] =
                (($.trim(modelConfig['bgp_always_compare_med']).length === 0) ? "false" : modelConfig['bgp_always_compare_med'].toString());

            return modelConfig;
        },
        getIPSubnetList: function(attr) {
            var subnetArr = [];
            var subnetCollection = attr.ipFabricSubnets.toJSON();
            var subnetCnt = subnetCollection.length;
            for (var i = 0; i < subnetCnt; i++) {
                var subnet = subnetCollection[i].ip_fabric_subnets();
                var splitArr = subnet.split('/');
                subnetArr.push({'ip_prefix': splitArr[0], 'ip_prefix_len':
                               parseInt(splitArr[1])});
            }
            return subnetArr;
        },
        addSubnet: function() {
            var subnet = this.model().attributes['ipFabricSubnets'];
            var newSubnet = new IPSubnetModel({'ip_fabric_subnets': ""});
            subnet.add([newSubnet]);
        },
        addSubnetByIndex: function(data, kbAddr) {
            var selectedRuleIndex = data.model().collection.indexOf(kbAddr.model());
            var subnet = this.model().attributes['ipFabricSubnets'];
            var newSubnet = new IPSubnetModel({'ip_fabric_subnets': ""});
            subnet.add([newSubnet],{at: selectedRuleIndex+1});
        },
        deleteSubnet: function(data, kbAddr) {
            var subnetCollection = data.model().collection;
            var subnet = kbAddr.model();
            subnetCollection.remove(subnet);
        },
        configureBGPOptions: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newBGPOptionsConfig, putData = {}, globalSysConfigData = {},
                ipFabricSubnets, grTime, llgrTime, endOfRIBRecTime,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: "bgpOptionsValidations"
                    },
                    {
                        key: "ipFabricSubnets",
                        type: cowc.OBJECT_TYPE_COLLECTION,
                        getValidation: "ipFabricSubnetsValidation"
                    }
                ];

            if(self.isDeepValid(validations)) {
                newBGPOptionsConfig =
                    $.extend({}, true, self.model().attributes);
                globalSysConfigData["global-system-config"] = {};

                ipFabricSubnets = self.getIPSubnetList(newBGPOptionsConfig);
                if(ipFabricSubnets.length) {
                    globalSysConfigData['global-system-config']['ip_fabric_subnets'] = {};
                    globalSysConfigData['global-system-config']['ip_fabric_subnets']['subnet'] =
                        ipFabricSubnets;
                } else {
                    globalSysConfigData['global-system-config']['ip_fabric_subnets'] = null;
                }
                globalSysConfigData['global-system-config']['ibgp_auto_mesh'] =
                    newBGPOptionsConfig['ibgp_auto_mesh'];
                globalSysConfigData['global-system-config']['bgp_always_compare_med'] =
                    newBGPOptionsConfig['bgp_always_compare_med'];
                globalSysConfigData['global-system-config']['autonomous_system'] =
                    Number(newBGPOptionsConfig['autonomous_system']);

                //bgp as a service parameters
                var bgpaasPorts = getValueByJsonPath(newBGPOptionsConfig,
                        'user_created_bgpaas_parameters', '');
                globalSysConfigData['global-system-config']
                    ['bgpaas_parameters'] = {};
                if(bgpaasPorts !== '') {
                    bgpaasPorts = bgpaasPorts.split('-');
                    globalSysConfigData['global-system-config']
                        ['bgpaas_parameters']['port_start'] = Number(bgpaasPorts[0]);
                    globalSysConfigData['global-system-config']
                        ['bgpaas_parameters']['port_end'] = Number(bgpaasPorts[1]);
                } else {
                    globalSysConfigData['global-system-config']
                    ['bgpaas_parameters'] = null;
                }

                //prepare graceful restart params post object
                globalSysConfigData['global-system-config']
                    ["graceful_restart_parameters"] = {};

                //gr
                grTime = getValueByJsonPath(newBGPOptionsConfig,
                        "graceful_restart_parameters;restart_time", "");
                grTime = grTime.toString().trim().length > 0 ?
                        Number(grTime) : 300;
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["restart_time"] = grTime;

                //llgr
                llgrTime = getValueByJsonPath(newBGPOptionsConfig,
                        "graceful_restart_parameters;long_lived_restart_time",
                        "");
                llgrTime = llgrTime.toString().trim().length > 0 ?
                        Number(llgrTime) : 300;
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["long_lived_restart_time"] =
                    llgrTime;

                //end of rib
                endOfRIBRecTime = getValueByJsonPath(newBGPOptionsConfig,
                        "graceful_restart_parameters;end_of_rib_timeout", "");
                endOfRIBRecTime =
                    endOfRIBRecTime.toString().trim().length > 0 ?
                        Number(endOfRIBRecTime) : 300;
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["end_of_rib_timeout"] =
                    endOfRIBRecTime;

                //enable
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["enable"] =
                    newBGPOptionsConfig["graceful_restart_enable"];

                //bgp helper enable
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["bgp_helper_enable"] =
                    newBGPOptionsConfig["graceful_restart_parameters"]
                        ["bgp_helper_enable"];

                //xmpp helper enable
                globalSysConfigData['global-system-config']
                ["graceful_restart_parameters"]["xmpp_helper_enable"] =
                    newBGPOptionsConfig["graceful_restart_parameters"]
                        ["xmpp_helper_enable"];

                globalSysConfigData['global-system-config']['ibgp_auto_mesh'] =
                    $.parseJSON(newBGPOptionsConfig['ibgp_auto_mesh']);
                globalSysConfigData['global-system-config']['bgp_always_compare_med'] =
                    $.parseJSON(newBGPOptionsConfig['bgp_always_compare_med']);

                if (null != newBGPOptionsConfig['uuid']) {
                    globalSysConfigData['global-system-config']['uuid'] =
                        newBGPOptionsConfig['uuid'];
                    putData = {"global-system-config":
                        globalSysConfigData["global-system-config"]};
                }

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
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
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_BGP_OPTIONS_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return bgpOptionsModel;
});
