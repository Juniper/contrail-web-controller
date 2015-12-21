/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var CommAttrModel = ContrailModel.extend({

        defaultConfig: {
            community_attr: ''
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
            commAttrValidation: {
            }
        },
        deleteCommunityAttr: function(data, attr) {
            var coll = this.model().collection;
            var item = this.model();
            coll.remove(item);
        },
        addCommunityAttr: function(data, obj) {
            var coll = this.model().collection;
            var commAttr =
                this.model().attributes.model().get('next_hop');

            var newCommAttr =
                new CommAttrModel({'prefix': "", 'next_hop': nextHop});
            coll.add([newCommAttr]);
        }
    });

    return CommAttrModel;
});

