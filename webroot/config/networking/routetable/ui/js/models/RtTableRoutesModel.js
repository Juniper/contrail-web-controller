/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/routetable/ui/js/models/CommAttrModel'
], function (_, ContrailModel, CommAttrModel) {
    var rtTableModel = ContrailModel.extend({
        defaultConfig: {
            'prefix': '',
            'next_hop': '',
            'next_hop_type': '',
            'community_attr': ''
        },
        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                    (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        validations: {
            rtTableConfigValidations: {
            }
        },
        formatModelConfig: function(modelConfig) {
            var commAttrModel;
            var commAttrModels = [];
            var commAttrCollectionModel;
            var commAttrs =
                getValueByJsonPath(modelConfig,
                                   'community_attributes;community_attribute',
                                   []);
            var cnt = commAttrs.length;;
            for (var i = 0; i < cnt; i++) {
                commAttrModel =
                    new CommAttrModel({community_attr: commAttrs[i]});
                commAttrModels.push(commAttrModel);
            }
            commAttrCollectionModel = new Backbone.Collection(commAttrModels);
            modelConfig['communityAttrs'] = commAttrCollectionModel;
            return modelConfig;
        },
        addCommunityAttr: function() {
            var newCommAttr = new CommAttrModel({community_attr: ""});
            var communityAttrs =
                this.model().attributes.model().get('communityAttrs');
            communityAttrs.add([newCommAttr]);
        }
    });
    return rtTableModel;
});


