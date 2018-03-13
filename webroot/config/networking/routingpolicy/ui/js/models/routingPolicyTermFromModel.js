/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'backbone',
    'knockout',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
], function (_, Backbone, Knockout, ContrailModel, RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var self;
    var RoutingPolicyTermFromModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            value : '',
            additionalValue: '',
            additionalValueDS: [],
            additionalValueMultiSelect: [],
            community_match_all: false,
            isDisable: false
        },

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            self = this;
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
                prefixCnt = 0,
                fromTerms = self.model().collection,
                fromTerm = self.model(),
                fromTermIndex = _.indexOf(fromTerms.models, fromTerm),
                fromTermModels = fromTerms.models,
                newFromTerm = new RoutingPolicyTermFromModel(self.parentModel(), {name: 'prefix', value: '', isDisable:true});
                _.each(fromTermModels, function (val, index){
                    var prefixName = _.get(fromTermModels[index], 'attributes._modelAttributes.name', '');
                    if(prefixName === "prefix"){
                        prefixCnt++;
                    }
                })
                if(prefixCnt < 3){
                    fromTerms.add(newFromTerm, {at: fromTermIndex + 1});
                }
                else{
                    return false;
                }
        },

        deleteFromTerm: function() {
            var fromTerms = this.model().collection,
                fromTerm = this.model();
            if (fromTerms.length > 1) {
                fromTerms.remove(fromTerm);
            }
        },
        getNameOptionList: function(viewModel) {
            var namesOption = ['community', 'prefix', 'protocol'];
            var termFromName = viewModel.model().attributes.name();
            if (termFromName == "community") {
                viewModel.model().attributes.additionalValueMultiSelect(self.getCommunityConditionOptionList(viewModel));
            }
            else if (termFromName == "prefix") {
                viewModel.model().attributes.additionalValueDS(self.getPrefixConditionOptionList(viewModel));
            } else if(termFromName == "protocol") {
                viewModel.model().attributes.additionalValueMultiSelect(self.getProtocolConditionOptionList(viewModel));
            }
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
        getProtocolConditionOptionList: function(viewModel) {
            return ctwc.PROTOCOL_MULTISELECT;
        },
        getCommunityConditionOptionList: function(viewModel) {
            return ctwc.COMM_MULTISELECT;
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