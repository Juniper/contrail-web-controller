/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'config/alarm/common/ui/js/models/AlarmRuleModel',
    'config/alarm/common/ui/js/ConfigAlarmFormatters'
], function (_, Backbone, Knockout, ContrailModel, AlarmRuleModel, AlarmFormatter) {
    var formatter = new AlarmFormatter();
    var AlarmRuleOrModel = ContrailModel.extend({

        defaultConfig: {
            andRules: null,
            and_list: []
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

        formatModelConfig: function(modelConfig) {
            var self = this,
                andRuleModels = [], andRuleModel,
                andRuleCollectionModel,
                andRuleObj = {}, andRuleList = getValueByJsonPath(modelConfig, 'and_list', []),
                andRuleListLen = andRuleList.length;
            if (andRuleListLen > 0) {
                for (var i = 0 ; i < andRuleListLen; i ++) {
                    var ruleObj = andRuleList[i];
                    andRuleObj = {
                        operand1: ruleObj['operand1'],
                        operand2: ruleObj['operand2'],
                        operation: ruleObj['operation'],
                        variables: ruleObj['variables'],
                    };
                    andRuleModel = new AlarmRuleModel(self, andRuleObj);
                    andRuleModels.push(andRuleModel);
                }
            } else {
                andRuleModels.push(new AlarmRuleModel(self, {}));
            }
            andRuleCollectionModel = new Backbone.Collection(andRuleModels);
            modelConfig['andRules'] = andRuleCollectionModel;
            return modelConfig;
        },

        addOrRuleAtIndex: function(data, event) {
            var self = this,
                orRules = this.model().collection,
                orRule = this.model(),
                orRuleIndex = _.indexOf(orRules.models, orRule),
                newOrRule = new AlarmRuleOrModel(self.parentModel(), {});

            orRules.add(newOrRule, {at: orRuleIndex + 1});
            kbValidation.bind(self.parentModel().editView,
                    {collection: newOrRule.model().attributes.andRules});

            $(event.target).parents('.collection').accordion('refresh');
            $(event.target).parents('.collection').accordion("option", "active", orRuleIndex + 1);

            event.stopImmediatePropagation();
        },

        deleteOrRule: function() {
            var orRules = this.model().collection,
                orRule = this.model();

            if (orRules.length > 1) {
                orRules.remove(orRule);
            }
        },

        getOrClauseText: function (data) {
            var andRules = data.andRules()(),
                orRuleText = '',
                andRuleArray = [];

            $.each(andRules, function (andRuleKey, andRuleObj) {
                var operand1 = andRuleObj.operand1(),
                    operand2 = andRuleObj.operand2(),
                    operation = andRuleObj.operation(),
                    vars = andRuleObj.variables(),
                    andRuleStr = '';
                operand1 = contrail.checkIfFunction(operand1) ? operand1() : operand1;
                operand2 = contrail.checkIfFunction(operand2) ? operand2() : operand2;
                operation = contrail.checkIfFunction(operation) ? operation() : operation;
                vars = contrail.checkIfFunction(vars) ? vars() : vars;
                if (operand1 != null && operand2 != null && operation != null ) {
                    andRuleStr += operand1 + ' ' + operation + ' ' + operand2;
                    if (vars != null){
                        if (typeof vars == 'string') {
                            andRuleStr += ', vars ' + vars;
                        } else if (typeof vars == 'object' && vars.length > 0){
                            andRuleStr += ', vars ' + vars.join(',');
                        }
                    }
                    andRuleArray.push(andRuleStr);
                }
            });
            if (andRuleArray.length) {
                orRuleText = andRuleArray.join('   AND   ');
            }
            return  orRuleText != '' ? orRuleText : '...'
        },
        validations: {

        }
    });


    return AlarmRuleOrModel;
});
