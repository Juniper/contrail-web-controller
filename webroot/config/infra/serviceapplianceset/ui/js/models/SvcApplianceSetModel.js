/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/infra/serviceapplianceset/ui/js/models/SvcAppliPropModel'
], function (_, ContrailConfigModel, SvcAppliPropModel) {
    var SvcApplianceSetModel = ContrailConfigModel.extend({
        defaultConfig: {
            display_name: "",
            service_appliance_driver: null,
            service_appliance_ha_mode: null
        },
        validations: {
            svcApplianceSetConfigValidations: {
                'display_name': {
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
            var pairColl = this.model().get('svcApplProperties');
                newPair = new SvcAppliPropModel({key: "", value: ""});
            pairColl.add([newPair]);
        },
        addKeyValuePairByIndex: function(data, kbData) {
          var selectedRuleIndex = data.model().collection.indexOf(kbData.model());
          var pairColl = this.model().get('svcApplProperties'),
              newPair = new SvcAppliPropModel({key: "", value: ""});
          pairColl.add([newPair],{at: selectedRuleIndex+1});
        },
        getKeyValuePairList: function(attr) {
            var pairArr = [];
            var pairCollection = attr.svcApplProperties.toJSON();
            var len = pairCollection.length;
            for (var i = 0; i < len; i++) {
                var key = pairCollection[i]['key']();
                var value = pairCollection[i]['value']();
                if (((null == key) || (!key.length)) &&
                    ((null == value) || (!value.length))) {
                    continue;
                }
                pairArr.push({key: pairCollection[i]['key'](),
                              value: pairCollection[i]['value']()});
            }
            return pairArr;
        },
        formatModelConfig: function(modelConfig) {
            /* Properties */
            var svcApplPropModel;
            var svcApplPropModels = [];
            var svcApplPropCollectionModel;
            var keyValuePair =
                getValueByJsonPath(modelConfig,
                                   'service_appliance_set_properties;key_value_pair',
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
            ctwu.setDisplayNameFromName(modelConfig);
            if (null != modelConfig['service_appliance_set_properties']) {
                delete modelConfig['service_appliance_set_properties'];
            }
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        deepValidationList: function () {
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'svcApplianceSetConfigValidations'
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
        configureSvcApplianceSet: function (isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            var validationList = this.deepValidationList();
            if (this.isDeepValid(validationList)) {
                var locks = this.model().attributes.locks.attributes;
                var newSvcAppl = $.extend({}, true, this.model().attributes);

                ajaxConfig = {};
                var putData = {};
                var keyValPairList = this.getKeyValuePairList(newSvcAppl);
                if (keyValPairList.length > 0) {
                    newSvcAppl['service_appliance_set_properties'] = {};
                    newSvcAppl['service_appliance_set_properties']['key_value_pair'] =
                        [];
                    newSvcAppl['service_appliance_set_properties']['key_value_pair'] =
                        keyValPairList;
                } else {
                    newSvcAppl['service_appliance_set_properties'] = null;
                }
                newSvcAppl['fq_name'] = ['default-global-system-config',
                    newSvcAppl['display_name']];
                newSvcAppl['parent_type'] = 'global-system-config';
                //permissions
                this.updateRBACPermsAttrs(newSvcAppl);
                delete newSvcAppl.svcApplProperties;
                ctwu.deleteCGridData(newSvcAppl);

                putData['service-appliance-set'] = newSvcAppl;

                ajaxConfig.data = JSON.stringify(putData);
                if (true == isEdit) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url = '/api/tenants/config/service-appliance-set/' +
                        newSvcAppl['uuid'];
                } else {
                    ajaxConfig.type = "POST";
                    ajaxConfig.url =
                        '/api/tenants/config/create-service-appliance-set';
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
                    callbackObj.error(this.getFormErrorText(ctwl.SVC_APPLIANCE_SET_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteSvcApplianceSet: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-appliance-set',
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
    return SvcApplianceSetModel;
});
