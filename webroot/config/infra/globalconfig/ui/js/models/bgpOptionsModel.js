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
            }
        },
        validations: {
            bgpOptionsValidations: {
                'autonomous_system': function(value, attr, finalObj) {
                    var asn = Number(value);
                    if (isNaN(asn) || asn < 1 || asn > 65534) {
                        return "Enter ASN number between 1-65534";
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
        deleteSubnet: function(data, kbAddr) {
            var subnetCollection = data.model().collection;
            var subnet = kbAddr.model();
            subnetCollection.remove(subnet);
        },
        configureBGPOptions: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                newBGPOptionsConfig, putData = {}, globalSysConfigData = {},
                ipFabricSubnets,
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
                globalSysConfigData['global-system-config']['autonomous_system'] =
                    Number(newBGPOptionsConfig['autonomous_system']);
                if (null != newBGPOptionsConfig['uuid']) {
                    globalSysConfigData['global-system-config']['uuid'] =
                        newBGPOptionsConfig['uuid'];
                    putData = {"data":[{"data":{"global-system-config": globalSysConfigData["global-system-config"]},
                                "reqUrl": "/global-system-config/" +
                                newBGPOptionsConfig['uuid']}]}
                }

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = '/api/tenants/config/update-config-object';
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

