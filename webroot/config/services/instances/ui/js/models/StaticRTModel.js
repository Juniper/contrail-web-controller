/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var StaticRTModel = ContrailModel.extend({

        defaultConfig: {
            prefix: null,
            next_hop: null
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
        validations: {
            staticRoutesValidation: {
            }
        },
        deleteStaticRt: function(data, rt) {
            var coll = this.model().collection;
            var item = this.model();
            coll.remove(item);
        },
        addStaticRtByRow: function(data, obj) {
            var coll = this.model().collection;
            var nextHop =
                this.model().attributes.model().get('next_hop');

            var newStaticRT =
                new StaticRTModel({'prefix': "", 'next_hop': nextHop});
            coll.add([newStaticRT]);
        }
    });

    return StaticRTModel;
});

