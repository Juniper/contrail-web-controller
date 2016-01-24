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
            portTupleData: null,
            intfTypes: []
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
            var vmisCnt = vmis.length;
            for (var i = 0; i < vmisCnt; i++) {
                var intfType =
                    vmis[i]['virtual_machine_interface_properties']
                        ['service_interface_type'];
                var propModel =
                    new InterfaceTypesModel({interfaceType: intfType,
                                      interface: vmis[i]['fq_name'].join(':') +
                                      "~~" + vmis[i]['uuid']});
                propModels.push(propModel);
            }
            if (!vmisCnt) {
                var intfTypes = getValueByJsonPath(modelConfig, 'intfTypes',
                                                   []);
                var intfCnt = intfTypes.length;
                var vmi = null;
                for (var i = 0; i < intfCnt; i++) {
                    var propModel =
                        new InterfaceTypesModel({interfaceType: intfTypes[i],
                                                interface: vmi});
                    propModels.push(propModel);
                }
            }
            propCollectionModel = new Backbone.Collection(propModels);
            modelConfig['portTupleInterfaces'] = propCollectionModel;
            return modelConfig;
        },
        addPortTupleInterface: function() {
            var svcTmpl = $('#service_template_dropdown').val();
            var svcTmpls = $(gridElId).data('svcInstTmplts');
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmpl.split(' - [')[0];
            var svcTmplObj = svcTmpls[svcTmplFqn];
            var intfTypes =
                getValueByJsonPath(svcTmplObj,
                                   'service_template_properties;interface_type',
                                   []);
            var origList = [];
            var intfCnt = intfTypes.length;
            for (var i = 0; i < intfCnt; i++) {
                origList.push(intfTypes[i]['service_interface_type']);
            }
            var props = this.model().attributes.model().get('portTupleInterfaces');
            if (props.length >= intfTypes.length) {
                return;
            }
            var count = props.length;
            var vmi = window.vmiList.length > 0 ? window.vmiList[0].value : "";
            var propsList = [];
            for (var i = 0; i < count; i++) {
                var model = props.at(i);
                propsList.push(model.attributes.interfaceType());
            }
            var newIntf = _.difference(origList, propsList);
            var newProp =
                new InterfaceTypesModel({'interfaceType': newIntf[0],
                                       'interface': vmi});
            props.add([newProp]);
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
            }
        }
    });

    return InterfacesModel;
});

