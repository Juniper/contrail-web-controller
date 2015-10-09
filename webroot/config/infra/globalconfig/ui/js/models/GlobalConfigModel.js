/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/models/IPSubnetModel',
    'config/infra/globalconfig/ui/js/models/EncapPriorityModel',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailModel, IPSubnetModel, EncapPriorityModel,
             GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var GlobalConfigModel = ContrailModel.extend({
        defaultConfig: {
            'vxlan_network_identifier_mode': null,
            'autonomous_system': 64513,
            'ibgp_auto_mesh': true,
        },
        validations: {
            globalConfigValidations: {
                'autonomous_system': {
                    pattern: 'number'
                }
            },
        },
        formatModelConfig: function(modelConfig) {
            /* Encap Priority Order */
            var encapPriOrdModel;
            var encapPriOrdModels = [];
            var encapPriOrdCollectionModel;
            var encapPrioList =
                modelConfig['encapsulation_priorities']['encapsulation'];
            var encapPrioListLen = encapPrioList.length;
            for (var i = 0; i < encapPrioListLen; i++) {
                encapPriOrdModel =
                    new EncapPriorityModel({encapsulation_priorities:
                                           encapPrioList[i]});
                encapPriOrdModels.push(encapPriOrdModel);
            }
            encapPriOrdCollectionModel = new Backbone.Collection(encapPriOrdModels);
            modelConfig['encapPriorityOrders'] = encapPriOrdCollectionModel;
            if (null != modelConfig['encapsulation_priorities']) {
                delete modelConfig['encapsulation_priorities'];
            }
            /* Subnets */
            var fabSubnetModel;
            var fabSubnetModels = [];
            var fabSubnetCollectionModel;
            var ipSubnets = modelConfig['ip_fabric_subnets']['subnet'];
            var ipSubnetsCnt = ipSubnets.length;
            for (var i = 0; i < ipSubnetsCnt; i++) {
                fabSubnetModel =
                    new IPSubnetModel({ip_fabric_subnets: ipSubnets[i]});
                fabSubnetModels.push(fabSubnetModel);
            }
            fabSubnetCollectionModel = new Backbone.Collection(fabSubnetModels);
            modelConfig['ipFabricSubnets'] = fabSubnetCollectionModel;
            if (null != modelConfig['ip_fabric_subnets']) {
                delete modelConfig['ip_fabric_subnets'];
            }
            return modelConfig;
        },
        getEncapPriorities: function() {
            return gcUtils.getDefaultUIEncapList();
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
        getEncapPriOrdList: function(attr) {
            var encapPriOrdArr = [];
            var encapPriOrdCollection = attr.encapPriorityOrders.toJSON();
            var encapPriOrdCnt = encapPriOrdCollection.length;
            for (var i = 0; i < encapPriOrdCnt; i++) {
                encapPriOrdArr.push(encapPriOrdCollection[i].encapsulation_priorities());
            }
            return encapPriOrdArr;
        },
        addEncapPriOrders: function(data, dataObj, index) {
            var prioOrdList = [];
            var encapPriorityList = gcUtils.getDefaultUIEncapList();
            var encapPriOrd = this.model().attributes['encapPriorityOrders'];
            var encapPrioOrdLen = encapPriOrd.length;
            if (3 == encapPrioOrdLen) {
                return;
            }
            for (var i = 0; i < encapPrioOrdLen; i++) {
                var model = encapPriOrd.at(i);
                prioOrdList.push(model.attributes.encapsulation_priorities());
            }
            var newEncap = _.difference(encapPriorityList, prioOrdList);
            if (!newEncap.length) {
                return;
            }
            var newOrder =
                new EncapPriorityModel({'encapsulation_priorities':
                                       newEncap[0]});
            encapPriOrd.add([newOrder]);
            /* Remove any error message if any */
            var glModel = data.model().attributes.model();
            var attr =
                cowu.getAttributeFromPath('encapsulation_priorities');
            var errors = glModel.get(cowc.KEY_MODEL_ERRORS);
            var attrErrorObj = {};
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = null;
            errors.set(attrErrorObj);
        },
        deleteEncapPriOrders: function(data, kbAddr) {
            var encapPrioOrd = this.model().attributes.encapPriorityOrders;
            var encapPrioOrdLen = encapPrioOrd.length;
            if (encapPrioOrdLen <= 1) {
                /* Send error message */
                var glModel = data.model().attributes.model();
                var attr =
                    cowu.getAttributeFromPath('encapsulation_priorities');
                var errors = glModel.get(cowc.KEY_MODEL_ERRORS);
                var attrErrorObj = {}
                attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                    'Atleast one required';
                errors.set(attrErrorObj);
                return;
            }
            var encapOrdCollection = data.model().collection;
            var encapOrd = kbAddr.model();
            encapOrdCollection.remove(encapOrd);
        },
        configureGlobalConfig: function (configData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            if (this.model().isValid(true, "globalConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newGlobalConfig =
                    $.extend({}, true, this.model().attributes);
                putData['global-vrouter-config'] = {};
                putData['global-system-config'] = {};

                ajaxConfig = {};
                ctwu.deleteCGridData(newGlobalConfig);

                putData['global-vrouter-config']
                       ['vxlan_network_identifier_mode'] =
                    newGlobalConfig['vxlan_network_identifier_mode'];
                putData['global-vrouter-config']['encapsulation_priorities'] =
                    {};
                putData['global-vrouter-config']['encapsulation_priorities']
                       ['encapsulation'] = [];
                var encapList = this.getEncapPriOrdList(newGlobalConfig);
                putData['global-vrouter-config']['encapsulation_priorities']
                    ['encapsulation'] =
                    gcUtils.mapUIEncapToConfigEncap(encapList);
                putData['global-system-config']['ip_fabric_subnets'] = {};
                putData['global-system-config']['ip_fabric_subnets']['subnet'] =
                    this.getIPSubnetList(newGlobalConfig);
                putData['global-system-config']['ibgp_auto_mesh'] =
                    newGlobalConfig['ibgp_auto_mesh'];
                putData['global-system-config']['autonomous_system'] =
                    newGlobalConfig['autonomous_system'];
                if (null != configData['global-vrouter-config']) {
                    putData['global-vrouter-config']['uuid'] =
                        configData['global-vrouter-config']['uuid'];
                    putData['global-vrouter-config']['uuid'] =
                        configData['global-vrouter-config']['uuid'];
                }
                if (null != configData['global-system-config']) {
                    putData['global-system-config']['uuid'] =
                        configData['global-system-config']['uuid'];
                }
                ajaxConfig.async = false;
                ajaxConfig.type = "PUT";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.url = '/api/tenants/config/update-global-config';
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
                    callbackObj.error(this.getFormErrorText(ctwl.GLOBAL_CONFIG_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return GlobalConfigModel;
});

