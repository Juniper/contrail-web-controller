/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/models/IPSubnetModel',
    'config/infra/globalconfig/ui/js/models/EncapPriorityModel',
    'config/infra/globalconfig/ui/js/globalConfig.utils',
    'config/infra/globalconfig/ui/js/models/FlowAgingTimeoutModel'
], function (_, ContrailModel, IPSubnetModel, EncapPriorityModel,
             GlobalConfigUtils, FlowAgingTimeoutModel) {
    var gcUtils = new GlobalConfigUtils();
    var GlobalConfigModel = ContrailModel.extend({
        defaultConfig: {
            'flow_export_rate': null,
            'vxlan_network_identifier_mode': null,
            'autonomous_system': 64513,
            'forwarding_mode': "Default",
            'ibgp_auto_mesh': true,
            'ecmp_hashing_include_fields': {
                'hashing_configured': true,
                'source_mac': true,
                'destination_mac': true,
                'source_ip': true,
                'destination_ip': true,
                'ip_protocol': true,
                'source_port': true,
                'destination_port': true
            }
        },
        validations: {
            globalConfigValidations: {
                'autonomous_system': {
                    pattern: 'number',
                    required: true
                },
                'flow_export_rate': {
                    pattern: 'number',
                    required: false
                },
                'encapsulation_priorities': function(val, attr, fieldObj) {
                    var encapPriOrdArr = [];
                    var encapPriOrdCollection =
                        fieldObj.encapPriorityOrders.toJSON();
                    var encapPriOrdCnt = encapPriOrdCollection.length;
                    for (var i = 0; i < encapPriOrdCnt; i++) {
                        encapPriOrdArr.push(encapPriOrdCollection[i].encapsulation_priorities());
                    }
                    var uniqPrioOrdList = _.uniq(encapPriOrdArr);
                    if (encapPriOrdArr.length != uniqPrioOrdList.length) {
                        return 'Same priority specified multiple times';
                    }
                    if ('configured' ==
                        fieldObj['vxlan_network_identifier_mode']) {
                        if (-1 == uniqPrioOrdList.indexOf('VxLAN')) {
                            return "Encapsulation type 'VxLAN' is required " +
                                "while setting VxLAN identifier mode";
                        }
                    }
                },
                'ecmp_hashing_include_fields': function(val, attr, fieldObj) {
                    if ((null == val) || (!val.length)) {
                        return 'At least one field should be selected';
                    }
                }
            }
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
            /* Flow Aging Timeout */
            var flowAgeModel;
            var flowAgeModels = [];
            var flowAgeCollectionModel;
            var flowAgeTuples =
                getValueByJsonPath(modelConfig,
                                   'flow_aging_timeout_list;flow_aging_timeout', []);
            var flowAgeTuplesCnt = flowAgeTuples.length;
            for (var i = 0; i < flowAgeTuplesCnt; i++) {
                flowAgeModel =
                    new FlowAgingTimeoutModel({protocol:
                                                flowAgeTuples[i]['protocol'],
                                              port: flowAgeTuples[i]['port'],
                                              timeout_in_seconds:
                                                flowAgeTuples[i]['timeout_in_seconds']});
                this.flowAgingTimeoutAttrs(flowAgeModel, this);
                flowAgeModels.push(flowAgeModel);
            }
            flowAgeCollectionModel = new Backbone.Collection(flowAgeModels);
            modelConfig['flowAgingTimeout'] = flowAgeCollectionModel;
            if (null != modelConfig['flow_aging_timeout']) {
                delete modelConfig['flow_aging_timeout'];
            }
            if (!('forwarding_mode' in modelConfig) ||
                (null == modelConfig['forwarding_mode'])) {
                modelConfig['forwarding_mode'] = 'Default';
            }
            var ecmpHashIncFields = [];
            if ('ecmp_hashing_include_fields' in modelConfig) {
                var ecmpHashIncFieldsObj =
                    modelConfig['ecmp_hashing_include_fields'];
                for (var key in ecmpHashIncFieldsObj) {
                    if (true == ecmpHashIncFieldsObj[key]) {
                        if ('hashing_configured' == key) {
                            continue;
                        }
                        ecmpHashIncFields.push(key);
                    }
                }
            }
            modelConfig['ecmp_hashing_include_fields'] =
                ecmpHashIncFields.join(',');
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
        deleteFlowAgingTuple: function(data, flowAgeTuple) {
            var flowAgeCollection = data.model().collection;
            var flowAgeEntry = flowAgeTuple.model();
            flowAgeCollection.remove(flowAgeEntry);
        },
        addFlowAgingTuple: function() {
            var flowAgeCollection = this.model().get('flowAgingTimeout');
            var newFlowAgeEntry =
                new FlowAgingTimeoutModel({protocol: "", port: "",
                                          timeout_in_seconds: ""});
            this.flowAgingTimeoutAttrs(newFlowAgeEntry, this);
            flowAgeCollection.add([newFlowAgeEntry]);
        },
        flowAgingTimeoutAttrs: function(flowAgingTimeoutModel, self) {
            flowAgingTimeoutModel.disablePort = ko.computed(function(){
               var protocol = self.getProtocolText(this.protocol());
               var disablePort = false;
               if(protocol === 'icmp' || protocol === '1') {
                   this.port('0');
                   disablePort = true;
               } else if(this.disablePort instanceof Function &&
                   this.disablePort()) {
                   this.port('');
                   disablePort = false
               }
               return disablePort;
            }, flowAgingTimeoutModel);
        },
        getProtocolText: function(protocol) {
            var protocolText = '';
            if(protocol.indexOf('(') !== -1) {
                protocolText =
                    protocol.split(' ')[1].replace(/[()]/g, '').toLowerCase();
            } else {
                protocolText = protocol;
           }
           return protocolText;
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
        getFlowAgingTupleList: function(attr) {
            var flowTupleArr = [];
            var flowTupleCollection = attr.flowAgingTimeout.toJSON();
            var flowTupleCnt = flowTupleCollection.length;
            for (var i = 0; i < flowTupleCnt; i++) {
                var timeout = flowTupleCollection[i].timeout_in_seconds();
                if (true == _.isString(timeout)) {
                    if ("" == timeout.trim()) {
                        timeout = 180; /* 3 Minutes */
                    }
                    timeout = Number(timeout);
                }
                flowTupleArr.push({protocol: this.getProtocolText(flowTupleCollection[i].protocol()),
                                   port: Number(flowTupleCollection[i].port()),
                                   timeout_in_seconds: timeout});
            }
            return flowTupleArr;
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
        getNonDefaultECMPHashingFields: function() {
            return { 'source_mac': false, 'destination_mac': false,
                'source_ip': false, 'destination_ip': false,
                'ip_protocol': false, 'source_port': false,
                'destination_port': false};
        },
        configureGlobalConfig: function (configData, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            var validations = [
                {
                    key: null,
                    type: cowc.OBJECT_TYPE_MODEL,
                    getValidation: 'globalConfigValidations'
                },
                {
                    key: 'ipFabricSubnets',
                    type: cowc.OBJECT_TYPE_COLLECTION,
                    getValidation: 'ipFabricSubnetsValidation'
                },
                {
                    key: 'flowAgingTimeout',
                    type: cowc.OBJECT_TYPE_COLLECTION,
                    getValidation: 'flowAgingTimeoutValidation'
                }
            ];

            if(this.isDeepValid(validations)) {
                var locks = this.model().attributes.locks.attributes;
                var newGlobalConfig =
                    $.extend({}, true, this.model().attributes);
                putData['global-vrouter-config'] = {};
                putData['global-system-config'] = {};

                ajaxConfig = {};
                ctwu.deleteCGridData(newGlobalConfig);

                if ('forwarding_mode' in newGlobalConfig) {
                    if ("Default" == newGlobalConfig['forwarding_mode']) {
                        newGlobalConfig['forwarding_mode'] = null;
                    }
                }

                if (null != newGlobalConfig['flow_export_rate']) {
                    putData['global-vrouter-config']['flow_export_rate'] =
                        parseInt(newGlobalConfig['flow_export_rate']);
                }
                putData['global-vrouter-config']['forwarding_mode'] =
                    newGlobalConfig['forwarding_mode'];
                putData['global-vrouter-config']
                       ['vxlan_network_identifier_mode'] =
                    newGlobalConfig['vxlan_network_identifier_mode'];
                putData['global-vrouter-config']['encapsulation_priorities'] =
                    {};
                putData['global-vrouter-config']['encapsulation_priorities']
                       ['encapsulation'] = [];
                var encapList = this.getEncapPriOrdList(newGlobalConfig);
                var flowAgeList = this.getFlowAgingTupleList(newGlobalConfig);
                if ((null != flowAgeList) & (flowAgeList.length > 0)) {
                    putData['global-vrouter-config']['flow_aging_timeout_list'] = {};
                    putData['global-vrouter-config']['flow_aging_timeout_list']
                           ['flow_aging_timeout'] = flowAgeList;
                } else {
                    putData['global-vrouter-config']['flow_aging_timeout_list']
                        = null;
                }
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
                var ecmpHashIncFields = this.getNonDefaultECMPHashingFields();
                if (null != newGlobalConfig['ecmp_hashing_include_fields']) {
                    var tmpEcmpHashIncFields =
                        newGlobalConfig['ecmp_hashing_include_fields'].split(',');
                    var cnt = tmpEcmpHashIncFields.length;
                    for (var i = 0; i < cnt; i++) {
                        if (tmpEcmpHashIncFields[i].length > 0) {
                            ecmpHashIncFields[tmpEcmpHashIncFields[i]] = true;
                        }
                    }
                } else {
                    for (key in ecmpHashIncFields) {
                        ecmpHashIncFields[key] = true;
                    }
                }
                ecmpHashIncFields['hashing_configured'] = true;
                putData['global-vrouter-config']['ecmp_hashing_include_fields']
                    = ecmpHashIncFields;
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

