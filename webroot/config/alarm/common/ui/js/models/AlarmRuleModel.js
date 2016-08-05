/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var AlarmRuleModel = ContrailModel.extend({

        defaultConfig: {
            operation: '==' + cowc.DROPDOWN_VALUE_SEPARATOR + 'uve_attribute',
            variables: [],
            operand1: null,
            operand2: null,
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

        addRuleAtIndex: function() {
            var self = this,
                alarmRules = this.model().collection,
                alarmRule = this.model(),
                alarmRuleIndex = _.indexOf(alarmRules.models, alarmRule),
                alarmRuleModel = new AlarmRuleModel(self.parentModel(), {});

            alarmRules.add(alarmRuleModel, {at: alarmRuleIndex + 1});
        },

       deleteRule: function() {
            var alarmRules = this.model().collection,
            alarmRule = this.model();

            if (alarmRules.length > 1) {
                alarmRules.remove(alarmRule);
            }
        },

        validations: {
            alarmRuleValidations : {
                operand1: {
                    required: true,
                    msg: 'Enter Operand1'
                },operand2: {
                    required: true,
                    msg: 'Enter Operand2'
                }
            }
        }
    });


    return AlarmRuleModel;
});
