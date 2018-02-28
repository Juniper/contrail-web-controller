/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var RoutingPolicyTermThenModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            value : '',
            action_condition: '',
            protocol: ''
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

        addThenTermAtIndex: function() {
            var self = this,
                thenTerms = self.model().collection,
                thenTerm = self.model(),
                thenTermIndex = _.indexOf(thenTerms.models, thenTerm),
                newThenTerm = new RoutingPolicyTermThenModel(self.parentModel(), {});
            thenTerms.add(newThenTerm, {at: thenTermIndex + 1});
        },

        deleteThenTerm: function() {
            var thenTerms = this.model().collection,
                thenTerm = this.model();

            if (thenTerms.length > 1) {
                thenTerms.remove(thenTerm);
            }
        },

        getNameOptionList: function(viewModel) {
            var namesOption = ['add community','set community', 'remove community', 'local-preference', 
                'med', 'action','as-path-expand'];

            return $.map(namesOption, function(optionValue, optionKey) {
                return {id: optionValue, text: optionValue}
            });
        },

        getActionConditionOptionList: function(viewModel) {
            return [
                {id: 'default', text: 'Default'},
                {id: 'reject', text: 'Reject'},
                {id: 'accept', text: 'Accept'},
                {id: 'next', text: 'Next'}
            ]
        },

        validations: {
            thenTermValidation: {
                //TODO: Add appropriate validations.
                //'name': {
                //    required: true,
                //    msg: 'Select a valid value for action in Then clause.'
                //},
                'value':
                function(value, attr, finalObj) {
                    if (finalObj.name == "local-preference") {
                        if (!isNumber(String(value).trim())){
                            return "Local preference has to be a number.";
                        }
                    }
                }
            }
        }
    });


    return RoutingPolicyTermThenModel;
});