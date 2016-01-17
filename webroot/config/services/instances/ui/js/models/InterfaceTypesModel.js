/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/instances/ui/js/models/StaticRTModel'
], function (_, ContrailModel, StaticRTModel) {
    var InterfacesModel = ContrailModel.extend({

        defaultConfig: {
            interfaceType: "",
            interface: "",
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
        deletePortTupleInterface: function() {
            var coll = this.model().collection;
            var item = this.model();
            coll.remove(item);
        },
        validations: {
            interfacesValidation: {
                'virtualNetwork': {
                    required: true
                }
            }
        }
    });

    return InterfacesModel;
});

