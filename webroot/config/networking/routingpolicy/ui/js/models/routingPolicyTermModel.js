/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'contrail-model',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermFromModel',
    'config/networking/routingpolicy/ui/js/models/routingPolicyTermThenModel'
], function (_, Knockout, ContrailModel, RoutingPolicyFormatter, routingPolicyTermFromModel, routingPolicyTermThenModel) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var RoutingPolicyTermModel = ContrailModel.extend({
        defaultConfig: {
           "term_match_condition":{
                "community_list":[],
                "prefix":[]
            },
            "term_action_list":{
                "update": {
                    "community":{},
                    "local_pref" : "",
                },
                "action": ""
            },
            "action":"Default",
            "from_terms": "",
            "then_terms": "",
            "disabled_from_names": {}
        },

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
        },

        formatModelConfig: function (config) {
            var self = this,
                modelConfig = $.extend({}, true, config),
                routingPolicyTermFromModels = [], routingPolicyTermThenModels = [],
                routingPolicyTermFromCollectionModel, routingPolicyTermThenCollectionModel;
            var termMatchArray = routingPolicyFormatter.buildTermMatchObject (modelConfig.term_match_condition);
            var termMatchArrayLen = termMatchArray.length;
            for (var i = 0; i < termMatchArrayLen; i++) {
                var termMatch = new routingPolicyTermFromModel(modelConfig, termMatchArray[i]);
                routingPolicyTermFromModels.push(termMatch);
            }
            var termActionArray = routingPolicyFormatter.buildTermActionObject (modelConfig.term_action_list);
            var termActionArrayLen = termActionArray.length;
            for (var i = 0; i < termActionArrayLen; i++) {
                var termAction = new routingPolicyTermThenModel(modelConfig, termActionArray[i]);
                routingPolicyTermThenModels.push(termAction);
            }
            //This need to be fixed
            if (termMatchArrayLen == 0) {
                routingPolicyTermFromModels.push(new routingPolicyTermFromModel(modelConfig, {name: 'community', value: '', isDisable: true}));
                routingPolicyTermFromModels.push(new routingPolicyTermFromModel(modelConfig, {name: 'protocol', value: '', isDisable: true}));
                routingPolicyTermFromModels.push(new routingPolicyTermFromModel(modelConfig, {name: 'prefix', value: '', isDisable: true}));
            }
            if (termActionArrayLen == 0) {
                routingPolicyTermThenModels.push(new routingPolicyTermThenModel(modelConfig, {name: 'add community'}));
            }
            routingPolicyTermFromCollectionModel = new Backbone.Collection(routingPolicyTermFromModels);
            routingPolicyTermThenCollectionModel = new Backbone.Collection(routingPolicyTermThenModels);
            modelConfig['from_terms'] = routingPolicyTermFromCollectionModel;
            modelConfig['then_terms'] = routingPolicyTermThenCollectionModel;
            return modelConfig;
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

        getOrClauseText: function (data) {
            var fromTerms = data.from_terms()(),
                thenTerms = data.then_terms()(),
                fromTermArray = [], thenTermArray = [], termsText = '';

            $.each(fromTerms, function (fromTermKey, fromTermValue) {
                var name = fromTermValue.name(),
                    value = fromTermValue.value(),
                    additionalValue = fromTermValue.additionalValue(),
                    fromTermStr = '';

                name = contrail.checkIfFunction(name) ? name() : name;
                value = contrail.checkIfFunction(value) ? value() : value;
                additionalValue = contrail.checkIfFunction(additionalValue) ? additionalValue() : additionalValue;

                if (name == 'protocol') {
                    fromTermStr += name + ' ' + value;
                    fromTermArray.push(fromTermStr);
                }
                if (value != '' && name != 'protocol') {
                    fromTermStr = name + ' ' + value;
                    if (name == 'prefix') {
                        fromTermStr += ' ' + additionalValue;
                    }
                    fromTermArray.push(fromTermStr)
                }
            });

            $.each(thenTerms, function (thenTermKey, thenTermValue) {
                var name = thenTermValue.name(),
                    value = thenTermValue.value(),
                    actionCondition = thenTermValue.action_condition(),
                    thenTermStr = '';

                name = contrail.checkIfFunction(name) ? name() : name;
                value = contrail.checkIfFunction(value) ? value() : value;
                actionCondition = contrail.checkIfFunction(actionCondition) ? actionCondition() : actionCondition;

                if (value != '') {
                    thenTermStr = name + ' ' + value;
                    thenTermArray.push(thenTermStr);
                } else if (name == 'action') {
                    thenTermStr = 'action ' + actionCondition;
                    thenTermArray.push(thenTermStr);
                }
            });

            termsText += 'from: { ' + fromTermArray.join(', ') + ' } ';
            termsText += 'then: { ' + thenTermArray.join(', ') + ' } ';

            return (termsText !== '') ? termsText : '...';
        },

        addTermAtIndex: function (data, event) {
            var self = this,
                orClauses = this.model().collection,
                orClause = this.model(),
                orClauseIndex = _.indexOf(orClauses.models, orClause),
                newOrClause = new RoutingPolicyTermModel(self.parentModel(), {});
            orClauses.add(newOrClause, {at: orClauseIndex + 1});

            $(event.target).parents('.collection').accordion('refresh');
            $(event.target).parents('.collection').accordion("option", "active", orClauseIndex + 1);

            event.stopImmediatePropagation();
        },

        deleteTerm: function () {
            var orClauses = this.model().collection,
                orClause = this.model();

            if (orClauses.length > 1) {
                orClauses.remove(orClause);
            }
        },

        validations: {
            termValidation: {
                'then_terms': function (value, attr, finalObj) {
                    var thenModelObj = getValueByJsonPath(finalObj, "then_terms;models", []);
                    var thenModelObjLen = thenModelObj.length;
                    var elements = {'add community':0,'set community':0,
                                    'remove community':0, 'local-preference':0, 'action':0};
                    for (var i = 0; i < thenModelObjLen; i++) {
                        var name = getValueByJsonPath(thenModelObj[i], "attributes;name")();
                        elements[name] += 1;
                        if (name == "local-preference") {
                            var value = getValueByJsonPath(thenModelObj[i], "attributes;value")();
                            if (!isNumber(String(value).trim())){
                                return "Local preference has to be a number.";
                            }
                            if (elements["local-preference"] > 1) {
                                return "cannot have more than one local preference";
                            }
                        }
                        if (name == "med") {
                            var value = getValueByJsonPath(thenModelObj[i], "attributes;value")();
                            if (!isNumber(String(value).trim())){
                                return "Med has to be a number.";
                            }
                            if (elements["med"] > 1) {
                                return "cannot have more than one Med";
                            }
                        }
                        if (elements["action"] > 1) {
                            return "cannot have more than one action";
                        }
                    }
                }
            }
        }
    });
    return RoutingPolicyTermModel;
});
