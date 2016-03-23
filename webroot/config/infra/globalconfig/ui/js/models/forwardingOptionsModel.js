/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/globalconfig/ui/js/models/encapPriorityModel',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailModel, EncapPriorityModel,
             GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var forwardingOptionsModel = ContrailModel.extend({
        defaultConfig: {
            "forwarding_mode": "Default",
            "vxlan_network_identifier_mode": "automatic",
            "encapsulation_priorities": {
                "encapsulation": []
            },
            'ecmp_hashing_include_fields': {
                'hashing_configured': true,
                'source_ip': true,
                'destination_ip': true,
                'ip_protocol': true,
                'source_port': true,
                'destination_port': true
            },
            "flow_export_rate": null
        },

        validations: {
            forwardingOptionsValidations: {
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
                        if (-1 == uniqPrioOrdList.indexOf('VXLAN')) {
                            return "Encapsulation type 'VxLAN' is required " +
                                "while setting VxLAN identifier mode";
                        }
                    }
                },
                'ecmp_hashing_include_fields': function(val, attr, fieldObj) {
                    if ((null == val) || (!val.length)) {
                        return 'At least one field should be selected';
                    }
                },
                'flow_export_rate': function(val, attr, fieldObj) {
                    if(val && !$.isNumeric(val)) {
                        return "Flow export rate must be a number";
                    }
                }
            }
        },

        formatModelConfig: function(modelConfig) {
            /* Encap Priority Order */
            var encapPriOrdModel;
            var encapPriOrdModels = [];
            var encapPriOrdCollectionModel;
            var encapPrioList = getValueByJsonPath(modelConfig,
                "encapsulation_priorities;encapsulation", []);
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
            var encapPriorityList = gcUtils.getDefaultConfigEncapList();
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
            return { 'source_ip': false, 'destination_ip': false,
                'ip_protocol': false, 'source_port': false,
                'destination_port': false};
        },

        configureForwardingOptions: function (callbackObj) {
            var self = this, ajaxConfig = {}, returnFlag = false,
                putData = {}, fwdOptionsData = {}, newFwdOptionsConfig,
                validations = [
                    {
                        key: null,
                        type: cowc.OBJECT_TYPE_MODEL,
                        getValidation: 'forwardingOptionsValidations'
                    }
                ];

            if(self.isDeepValid(validations)) {
                newFwdOptionsConfig =
                    $.extend({}, true, self.model().attributes);
                fwdOptionsData['global-vrouter-config'] = {};

                ajaxConfig = {};

                if ('forwarding_mode' in newFwdOptionsConfig) {
                    if ("Default" == newFwdOptionsConfig['forwarding_mode']) {
                        newFwdOptionsConfig['forwarding_mode'] = null;
                    }
                }
                fwdOptionsData['global-vrouter-config']['forwarding_mode'] =
                    newFwdOptionsConfig['forwarding_mode'];
                fwdOptionsData['global-vrouter-config']
                       ['vxlan_network_identifier_mode'] =
                    newFwdOptionsConfig['vxlan_network_identifier_mode'];
                fwdOptionsData['global-vrouter-config']['encapsulation_priorities'] =
                    {};
                fwdOptionsData['global-vrouter-config']['encapsulation_priorities']
                       ['encapsulation'] = [];
                var encapList = self.getEncapPriOrdList(newFwdOptionsConfig);
                fwdOptionsData['global-vrouter-config']['encapsulation_priorities']
                    ['encapsulation'] = encapList;

                var ecmpHashIncFields = self.getNonDefaultECMPHashingFields();
                if (null != newFwdOptionsConfig['ecmp_hashing_include_fields']) {
                    var tmpEcmpHashIncFields =
                        newFwdOptionsConfig['ecmp_hashing_include_fields'].split(',');
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
                fwdOptionsData['global-vrouter-config']['ecmp_hashing_include_fields']
                    = ecmpHashIncFields;

                if (null != newFwdOptionsConfig['uuid']) {
                    fwdOptionsData['global-vrouter-config']['uuid'] =
                        newFwdOptionsConfig['uuid'];
                    putData = {"data":[{"data":{"global-vrouter-config": fwdOptionsData["global-vrouter-config"]},
                                "reqUrl": "/global-vrouter-config/" +
                                newFwdOptionsConfig['uuid']}]}
                }

                //flow export rate
                if (newFwdOptionsConfig['flow_export_rate']) {
                    fwdOptionsData['global-vrouter-config']['flow_export_rate'] =
                        Number(newFwdOptionsConfig['flow_export_rate']);
                } else {
                    fwdOptionsData['global-vrouter-config']['flow_export_rate'] = null;
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
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID));
                }
            }
            return returnFlag;
        }
    });
    return forwardingOptionsModel;
});

