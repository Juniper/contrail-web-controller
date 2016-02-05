/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
], function (_, Backbone, Knockout, ContrailModel, RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyTermFromModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            value : '',
            prefix_type: ''
        },

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
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

        addFromTermAtIndex: function() {
            var self = this,
                fromTerms = self.model().collection,
                fromTerm = self.model(),
                fromTermIndex = _.indexOf(fromTerms.models, fromTerm),
                newFromTerm = new RoutingPolicyTermFromModel(self.parentModel(), {});

            if (fromTerms.length < 2) {
                fromTerms.add(newFromTerm, {at: fromTermIndex + 1});
            }
        },

        deleteFromTerm: function() {
            var fromTerms = this.model().collection,
            if (fromTerms.length > 1) {
                fromTerm = this.model();
                fromTerms.remove(fromTerm);
            }
        },

        getNameOptionList: function(viewModel) {
            var namesOption = ['community','prefix'];

            return $.map(namesOption, function(optionValue, optionKey) {
                return {id: optionValue, text: optionValue}
            });
        },

        getPrefixConditionOptionList: function(viewModel) {
            return [{id: 'exact', text: 'exact'},
                {id: 'longer', text: 'longer'},
                {id: 'orlonger', text: 'orlonger'}
            ]
        },
        //TODO: Add appropriate validations.
        validations: {
            fromTermValidation: {
                //'value': {
                //    required: true,
                //    msg: 'Enter a valid value for community or prefix in From clause'
                //}
            }
        }
    });


    return RoutingPolicyTermFromModel;
});