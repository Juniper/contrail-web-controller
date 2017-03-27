/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/infra/serviceappliance/ui/js/models/SvcAppliPropModel',
    'config/infra/serviceappliance/ui/js/models/SvcAppliInterfaceModel',
    'config/common/ui/js/svcTmpl.utils'
], function (_, ContrailConfigModel, SvcAppliPropModel, SvcAppliInterfaceModel,
             SvcTmplUtils) {
    var svcTmplUtils = new SvcTmplUtils();
    var SvcApplianceModel = ContrailConfigModel.extend({
        defaultConfig: {
            display_name: null,
            service_appliance_user_credentials: {
                username: null,
                password: null
            },
            service_template: "",
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
                    required: false
                },
                'service_appliance_user_credentials.password': {
                    required: false
                },
                'interface_name': function(val, attr, fieldObj) {
                    var interfaces = getValueByJsonPath(fieldObj, 'interfaces',
                                                        null);
                    if (null == interfaces) {
                        return 'Interface is required';
                    }
                    var interfaces = interfaces.toJSON();
                    var len = interfaces.length;
                    var intfList = [];
                    for (var i = 0; i < len; i++) {
                        var intf = interfaces[i].interface_name();
                        intfList.push(intf);
                    }
                    var tmpIntfList = _.uniq(intfList);
                    if (tmpIntfList.length != intfList.length) {
                        return 'One or multiple interfaces assigned ' +
                            'for multiple interface type';
                    }
                }
            }
        },
        deleteKeyValuePair: function(data, kbData) {
            var keyValPairColl = data.model().collection,
                keyValPair = kbData.model();
            keyValPairColl.remove(keyValPair);
        },
        addKeyValuePairByIndex: function(data, kbData) {
          var selectedRuleIndex = data.model().collection.indexOf(kbData.model());
          var pairColl = this.model().get('svcApplProperties'),
              newPair = new SvcAppliPropModel({key: "", value: ""});
          pairColl.add([newPair],{at: selectedRuleIndex+1});
        },
        addKeyValuePair: function() {
            var pairColl = this.model().get('svcApplProperties'),
                newPair = new SvcAppliPropModel({key: "", value: ""});
            pairColl.add([newPair]);
        },
        addInterface: function() {
            var self = this;
            if (!self.svcApplData.svcApplSetSvcTmpl) {
                return;
            }
            var intfTypes = svcTmplUtils.getSvcTmplIntfTypes(
                self.svcApplData.svcApplSetSvcTmpl);
            var intfColl = this.model().get('interfaces');
            var len = intfColl.length;
            if (len >= intfTypes.length) {
                return;
            }
            var intfTypesList = [];
            var otherIntfIdxList = [];
            for (var i = 0; i < len; i++) {
                var modIntf = intfColl.at(i).get('interface_type')();
                intfTypesList.push(modIntf);
            }
            var newIntfTypes = _.difference(intfTypes, intfTypesList);
            if (newIntfTypes.length > 0) {
                newIntfType = newIntfTypes[0];
            }
            var tmpIntfObjs = {};
            var len = self.svcApplData.intfTypes.length;
            for (var i = 0; i < len; i++) {
                tmpIntfObjs[self.svcApplData.intfTypes[i]['text']] =
                    self.svcApplData.intfTypes[i]['text'];
            }
            if (null == tmpIntfObjs[newIntfType]) {
                self.svcApplData.intfTypes.push({text: newIntfType,
                                                   id: newIntfType});
            }
            var newIntfName = "";
            if (self.svcApplData.piList.length > 0) {
                newIntfName = self.svcApplData.piList[0]['id'];
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
                var key = pairCollection[i]['key']();
                var value = pairCollection[i]['value']();
                if (((null == key) || (!key.length)) &&
                    ((null == value) || (!value.lnegth))) {
                    continue;
                }
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
                var piRefsEntryArr =
                    intfName.split(cowc.DROPDOWN_VALUE_SEPARATOR);
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
            modelConfig['service_appliance_set'] =
                contrail.getCookie('serviceApplSet');
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

            /* Interfaces */
            var svcApplIntfModel;
            var svcApplIntfModels = [];
            var svcApplIntfCollectionModel;
            var intfs =
                getValueByJsonPath(modelConfig,
                                   'physical_interface_refs', []);
            var len = intfs.length;
            var tmpIntfTypeToPIMaps = {};
            for (var i = 0; i  < len; i++) {
                var intfType =
                    getValueByJsonPath(intfs[i],
                                       'attr;interface_type',
                                       null);
                if (null == intfType) {
                    continue;
                }
                var intfName = intfs[i]['to'].join(':') +
                    cowc.DROPDOWN_VALUE_SEPARATOR + intfs[i]['uuid']
                tmpIntfTypeToPIMaps[intfType] = intfName;
            }
            var svcApplSet = contrail.getCookie('serviceApplSet');
            var intfTypes = svcTmplUtils.getSvcTmplIntfTypes(
                modelConfig['service_template']);

            var intfTypesCnt = 0;
            if (null != intfTypes) {
                intfTypesCnt = intfTypes.length;
            }
            for (var i = 0; i < intfTypesCnt; i++) {
                var intfName = "";
                if (null != tmpIntfTypeToPIMaps[intfTypes[i]]) {
                    intfName = tmpIntfTypeToPIMaps[intfTypes[i]];
                }
                svcApplIntfModel =
                    new SvcAppliInterfaceModel({
                        interface_type: intfTypes[i],
                        interface_name: intfName
                    });
                svcApplIntfModels.push(svcApplIntfModel);
            }
            svcApplIntfCollectionModel = new
                Backbone.Collection(svcApplIntfModels);
            modelConfig['interfaces'] = svcApplIntfCollectionModel;
            if (null != modelConfig['physical_router_refs']) {
                delete modelConfig['physical_router_refs'];
            }
            if(modelConfig["service_template"]) {
                modelConfig['service_template'] =
                    svcTmplUtils.
                    svcTemplateFormatter(modelConfig['service_template']);
            }
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        deepValidationList: function () {
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'svcApplianceConfigValidations'
            },
            {
                key: 'interfaces',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'svcApplInterfaceValidation'
            },
            {
                key: 'svcApplProperties',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'svcApplPropValidation'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            return validationList;
        },
        configureSvcAppliance: function (isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            var validationList = this.deepValidationList();
            if (this.isDeepValid(validationList)) {
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
                var userName =
                    getValueByJsonPath(newSvcAppl,
                                       'service_appliance_user_credentials;username',
                                       null);
                var password =
                    getValueByJsonPath(newSvcAppl,
                                       'service_appliance_user_credentials;password',
                                       null);
                if ((null == userName) && (null == password)) {
                    newSvcAppl['service_appliance_user_credentials'] = null;
                }
                //permissions
                this.updateRBACPermsAttrs(newSvcAppl);
                delete newSvcAppl.svcApplProperties;
                delete newSvcAppl.interfaces;
                delete newSvcAppl.service_template;
                ctwu.deleteCGridData(newSvcAppl);

                putData['service-appliance'] = newSvcAppl;

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
