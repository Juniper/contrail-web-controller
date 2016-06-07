/*
   rt_tuples
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/instances/ui/js/models/InterfaceTypesModel'
], function (_, ContrailModel, InterfaceTypesModel) {
    var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var InterfacesModel = ContrailModel.extend({

        defaultConfig: {
            portTupleName: "",
            portTupleDisplayName: "",
            portTupleData: null,
            intfTypes: [],
            disable: false
        },

        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        formatModelConfig: function(modelConfig) {
            var propModel;
            var propModels = [];
            var propCollectionModel;
            var vmis =
                getValueByJsonPath(modelConfig,
                                   'portTupleData;virtual-machine-interfaces',
                                   []);
            var vnVmis = modelConfig.parentIntfs;

            var vmisCnt = vmis.length;
            var vmiTypeToObjMap = {};
            for (var i = 0; i < vmisCnt; i++) {
                var intfType =
                    vmis[i]['virtual_machine_interface_properties']
                        ['service_interface_type'];
                vmiTypeToObjMap[intfType] = vmis[i];
            }

            var intfTypes = getValueByJsonPath(modelConfig, 'intfTypes', []);
            var intfCnt = intfTypes.length;
            for (var i = 0; i < intfCnt; i++) {
                intfType = intfTypes[i];
                var vmiObj = vmiTypeToObjMap[intfType];
                if (null == vmiObj) {
                    continue;
                }
                var vnName = vnVmis[intfType];
                var vmiList = [];
                if (modelConfig.vnVmiMaps[vnName]) {
                    vmiList = modelConfig.vnVmiMaps[vnName];
                }
                var vmi = vmiObj['fq_name'].join(':') + "~~" + vmiObj['uuid'];
                var propModel =
                    new InterfaceTypesModel({interfaceType: intfType,
                                      interface: vmiObj['fq_name'].join(':') +
                                      "~~" + vmiObj['uuid'],
                                      vmiListData: vmiList,
                                      disable: modelConfig['disable']});
                propModels.push(propModel);
            }
            if (!vmisCnt) {
                var vmi = null;
                for (var i = 0; i < intfCnt; i++) {
                    var vnName = vnVmis[intfTypes[i]];
                    var vmiList = [];
                    if (modelConfig.vnVmiMaps[vnName]) {
                        vmiList = modelConfig.vnVmiMaps[vnName];
                    }
                    var propModel =
                        new InterfaceTypesModel({interfaceType: intfTypes[i],
                                                interface: vmi,
                                                vmiListData: vmiList,
                                                disable: modelConfig['disable']});
                    propModels.push(propModel);
                }
            }
            propCollectionModel = new Backbone.Collection(propModels);
            modelConfig['portTupleInterfaces'] = propCollectionModel;
            return modelConfig;
        },
        deletePortTuple: function() {
            var portTupleCollection =this .model().collection;
            var portTupleEntry = this.model();
            portTupleCollection.remove(portTupleEntry);
        },
        validations: {
            portTuplesValidation: {
                'portTupleName': {
                    required: true
                },
                'interface': function(val, attr, fieldObj) {
                    console.log("Getting fieldObj as:", fieldObj);
                    var intfs = fieldObj['portTupleInterfaces'].toJSON();
                    var len = intfs.length;
                    var intfsList = [];
                    for (var i = 0; i < len; i++) {
                        var intf = intfs[i]['interface']();
                        if (null != intf) {
                            intfsList.push(intf);
                        } else {
                            /* NULL case will be handled by child model
                             * validator
                             */
                        }
                    }
                    if (intfsList.length != (_.uniq(intfsList)).length) {
                        return 'Same interface assigned to multiple interface' +
                            ' types';
                    }
                }
            }
        }
    });

    return InterfacesModel;
});

