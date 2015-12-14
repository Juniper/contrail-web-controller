/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/serviceappliance/ui/js/models/SvcAppliPropModel',
    'config/infra/serviceappliance/ui/js/models/SvcAppliInterfaceModel'
], function (_, ContrailModel, SvcAppliPropModel, SvcAppliInterfaceModel) {
    var SvcApplianceModel = ContrailModel.extend({
        defaultConfig: {
            display_name: null,
            service_appliance_user_credentials: {
                username: "",
                password: ""
            },
            service_appliance_ip_address: "",
        },
        validations: {
            svcApplianceConfigValidations: {
                'display_name': {
                    required: true
                },
                'service_appliance_ip_address': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS
                },
                'service_appliance_user_credentials.username': {
                    required: true
                },
                'service_appliance_user_credentials.password': {
                    required: true
                }
            }
        },
        deleteKeyValuePair: function(data, kbData) {
            var keyValPairColl = data.model().collection,
                keyValPair = kbData.model();
            keyValPairColl.remove(keyValPair);
        },
        addKeyValuePair: function() {
            var pairColl = this.model().get('svcApplProperties'),
                newPair = new SvcAppliPropModel({key: "", value: ""});
            pairColl.add([newPair]);
        },
        addInterface: function() {
            var intfTypes = ['management', 'left', 'right'];
            var intfColl = this.model().get('interfaces');
            var len = intfColl.length;
            var intfTypesList = [];
            var otherIntfIdxList = [];
            for (var i = 0; i < len; i++) {
                var modIntf = intfColl.at(i).get('interface_type')();
                intfTypesList.push(modIntf);
                var otherIntfArr = modIntf.split('other');
                if ((2 == otherIntfArr.length) && (otherIntfArr[1].length > 0)) {
                    var idx = parseInt(otherIntfArr[1]);
                    otherIntfIdxList.push(idx);
                }
            }
            otherIntfIdxList.sort(function(a, b) {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                } else {
                    return 0;
                }
            });
            var newIntfTypes = _.difference(intfTypes, intfTypesList);
            var newIntfType = "";
            if (newIntfTypes.length > 0) {
                newIntfType = newIntfTypes[0];
            } else {
                var arrLen = otherIntfIdxList.length;
                if (!arrLen) {
                    newIntfType = 'other0';
                } else {
                    if (arrLen == otherIntfIdxList[arrLen - 1] + 1) {
                        /* All the array entries are there starting from 0 */
                        newIntfType = 'other' + arrLen.toString();
                    } else {
                        /* Get the first missing index */
                        for (var i = 0; i < arrLen; i++) {
                            if (i != otherIntfIdxList[i]) {
                                newIntfType = 'other' + i.toString();
                                break;
                            }
                        }
                    }
                }
            }
            var intfText = newIntfType;
            if (newIntfType.length > 0) {
                intfText = newIntfType.replace(newIntfType[0],
                                                  newIntfType[0].toUpperCase());
            }
            var tmpIntfObjs = {};
            var len = window.svcApplData.intfTypes.length;
            for (var i = 0; i < len; i++) {
                tmpIntfObjs[window.svcApplData.intfTypes[i]['text']] =
                    window.svcApplData.intfTypes[i]['text'];
            }
            if (null == tmpIntfObjs[intfText]) {
                window.svcApplData.intfTypes.push({text: intfText,
                                                   id: newIntfType});
            }
            var newIntfName = "";
            if (window.svcApplData.piList.length > 0) {
                newIntfName = window.svcApplData.piList[0]['id'];
            }
            newIntf = new SvcAppliInterfaceModel({'interface_type': newIntfType,
                                                  'interface_name': newIntfName});
            intfColl.add([newIntf]);
        },
        deleteInterface: function(data, kbData) {
            var intfColl = data.model().collection,
                intf = kbData.model();
            intfColl.remove(intf);
        },
        getKeyValuePairList: function(attr) {
            var pairArr = [];
            var pairCollection = attr.svcApplProperties.toJSON();
            var len = pairCollection.length;
            for (var i = 0; i < len; i++) {
                pairArr.push({key: pairCollection[i]['key'](),
                              value: pairCollection[i]['value']()});
            }
            return pairArr;
        },
        getInterfacesList: function(attr) {
            var intfArr = [];
            var intfCollection = attr.interfaces.toJSON();
            var len = intfCollection.length;
            for (var i = 0; i < len; i++) {
                var intfName = intfCollection[i]['interface_name']();
                var piRefsEntryArr = intfName.split(';');
                var intfType =
                    intfCollection[i]['interface_type']().toLowerCase();
                intfType = intfType.replace(/ /g, '');
                if (2 == piRefsEntryArr.length) {
                    var refObjs = {'to': piRefsEntryArr[0].split(':'),
                        attr: {interface_type: intfType},
                        uuid: piRefsEntryArr[1]};
                }
                intfArr.push(refObjs);
            }
            return intfArr;
        },
        formatModelConfig: function(modelConfig) {
            /* Properties */
            var svcApplPropModel;
            var svcApplPropModels = [];
            var svcApplPropCollectionModel;
            var keyValuePair =
                getValueByJsonPath(modelConfig,
                                   'service_appliance_properties;key_value_pair',
                                   []);
            var len = keyValuePair.length;
            for (var i = 0; i < len; i++) {
                svcApplPropModel =
                    new SvcAppliPropModel({
                        key: keyValuePair[i]['key'],
                        value: keyValuePair[i]['value']
                    });
                svcApplPropModels.push(svcApplPropModel);
            }
            svcApplPropCollectionModel = new
                Backbone.Collection(svcApplPropModels);
            modelConfig['svcApplProperties'] = svcApplPropCollectionModel;
            if (null != modelConfig['service_appliance_properties']) {
                delete modelConfig['service_appliance_properties'];
            }
            if ((null == modelConfig['display_name']) &&
                (null != modelConfig['fq_name'])) {
                modelConfig['display_name'] =
                    modelConfig['fq_name'][2];
            }
            var svcVirtType =
                getValueByJsonPath('service_template_properties;service_virtualization_type',
                                   null);
            modelConfig['user_created_virtualization_type'] = svcVirtType;

            /* Interfaces */
            var svcApplIntfModel;
            var svcApplIntfModels = [];
            var svcApplIntfCollectionModel;
            var intfs =
                getValueByJsonPath(modelConfig,
                                   'physical_interface_refs', []);
            var len = intfs.length;
            var loadedIntfTypesCnt = window.svcApplData.intfTypes.length;
            var tmpLoadedIntfTypeObjs = {};
            for (var i = 0; i < loadedIntfTypesCnt; i++) {
                tmpLoadedIntfTypeObjs[window.svcApplData.intfTypes[i]['id']] =
                    window.svcApplData.intfTypes[i]['id'];
            }
            for (var i = 0; i  < len; i++) {
                var intfType =
                    getValueByJsonPath(intfs[i],
                                       'attr;interface_type',
                                       null);
                if (null == intfType) {
                    continue;
                }
                svcApplIntfModel =
                    new SvcAppliInterfaceModel({
                        interface_type: intfType,
                        interface_name: intfs[i]['to'].join(':') + ';' +
                            intfs[i]['uuid']
                    });
                if (null == tmpLoadedIntfTypeObjs[intfType]) {
                    var newIntfText =
                        intfType.replace(intfType[0],
                                         intfType[0].toUpperCase());
                    window.svcApplData.intfTypes.push({id: intfType, text:
                                                      newIntfText});
                }
                svcApplIntfModels.push(svcApplIntfModel);
            }
            svcApplIntfCollectionModel = new
                Backbone.Collection(svcApplIntfModels);
            modelConfig['interfaces'] = svcApplIntfCollectionModel;
            if (null != modelConfig['physical_router_refs']) {
                delete modelConfig['physical_router_refs'];
            }
            return modelConfig;
        },
        configureSvcAppliance: function (isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "svcApplianceConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newSvcAppl = $.extend({}, true, this.model().attributes);

                ajaxConfig = {};
                var piRefs = this.getInterfacesList(newSvcAppl);
                newSvcAppl['physical_interface_refs'] = [];
                if (piRefs.length > 0) {
                    newSvcAppl['physical_interface_refs'] = piRefs;
                }
                var putData = {};
                var keyValPairList = this.getKeyValuePairList(newSvcAppl);
                if (keyValPairList.length > 0) {
                    newSvcAppl['service_appliance_properties'] = {};
                    newSvcAppl['service_appliance_properties']['key_value_pair'] =
                        [];
                    newSvcAppl['service_appliance_properties']['key_value_pair'] =
                        keyValPairList;
                } else {
                    newSvcAppl['service_appliance_properties'] = null;
                }
                newSvcAppl['fq_name'] = ['default-global-system-config',
                    contrail.getCookie('serviceApplSet'),
                    newSvcAppl['display_name']];
                newSvcAppl['parent_type'] = 'service-appliance-set';

                delete newSvcAppl.svcApplProperties;
                delete newSvcAppl.interfaces;
                ctwu.deleteCGridData(newSvcAppl);

                putData['service-appliance'] = newSvcAppl;

                ajaxConfig.async = false;
                ajaxConfig.data = JSON.stringify(putData);
                if (true == isEdit) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url = '/api/tenants/config/service-appliance/' +
                        newSvcAppl['uuid'];
                } else {
                    ajaxConfig.type = "POST";
                    ajaxConfig.url = '/api/tenants/config/create-service-appliance';
                }
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
                    callbackObj.error(this.getFormErrorText(ctwl.SVC_APPLIANCE_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteSvcAppliance: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-appliance',
                                             'deleteIDs': uuidList}]);
            ajaxConfig.url = '/api/tenants/config/delete';
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
            return returnFlag;
        }

    });
    return SvcApplianceModel;
});

