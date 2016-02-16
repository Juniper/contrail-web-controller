/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel) {
    var InterfacesModel = ContrailModel.extend({

        defaultConfig: {
            interfaceType: null,
            interface: null,
            interfaceListData: [],
            vmiListData: [],
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
        deletePortTupleInterface: function() {
            var coll = this.model().collection;
            var item = this.model();
            coll.remove(item);
        },
        validations: {
            portTupleInterfacesValidation: {
                'interface': {
                    required: true
                },
                interfaceType: {
                    required: true
                }
            }
        }
    });

    return InterfacesModel;
});

