/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'monitor/security/trafficgroups/ui/js/models/TrafficGroupsFilterModel'
], function (_, ContrailModel, filterModel) {
    var TrafficGroupsSettingsModel = ContrailModel.extend({
        defaultConfig: {
            "group_by_tag_type": null,
            "sub_group_by_tag_type": null,
            "filter_by_endpoints": {
                "endpoint" : []
            },
            "tag_type_list": [],
            "time_range": 3600,
            "from_time": null,
            "to_time": null
        },
        formatModelConfig : function(modelConfig) {
            var endpointsModelCol = [],
                tgModel = this;
                endpoints = getValueByJsonPath(modelConfig,
                "filterByEndpoints", []);
            _.each(endpoints, function(endpoint) {
                var newModel = new filterModel({
                        endpoint : endpoint,
                    });
                tgModel.bindModelChange(newModel);
                endpointsModelCol.push(newModel);
            });
            endpointsModelCol = _.filter(endpointsModelCol, function(epObj) {
                return (epObj.endpoint && epObj.endpoint());
            });
            modelConfig["endpoints"] = new Backbone.Collection(endpointsModelCol);
            return modelConfig;
        },
        bindModelChange: function(currentModel) {
            var tgModel = this;
            currentModel.__kb.view_model.model().on('change',
                function(model, newValue) {
                    tgModel.tgSettingsRule({
                        success: function (modelObj) {
                            tgModel.callback(modelObj);
                        },
                        error: function (error) {}
                    });
                }
            );
        },
        tgSettingsRule: function (callbackObj) {
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : 'tgSettingsRuleValidation'
                }
            ];
            validations.push({
                key : "endpoints",
                type : cowc.OBJECT_TYPE_COLLECTION,
                getValidation : "filterRuleValidation"
            });
            if(this.isDeepValid(validations)) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success(this.model());
                }
            } else {
               if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.TRAFFIC_GROUPS_SETTINGS));
                }
            }
        },
        onGroupByTagTypeChanged: function(newVal) {
            this.model().set('tag_type_list',
                _.filter(cowc.TRAFFIC_GROUP_TAG_TYPES,
                    function(tag) {
                        return newVal.indexOf(tag.value) < 0;
                })
            )
        },
        isTimeRangeCustom: function() {
            var self = this;
            return self.time_range() == -1;
        },
        addEndpoint: function() {
          var tgModel = this,
              endpoints = this.model().attributes["endpoints"];
              newModel = new filterModel();
          tgModel.bindModelChange(newModel);
          endpoints.add([newModel]);
        },
        addEndpointByIndex: function($data, kbInterface){
          var tgModel = this,
              selectedRuleIndex = $data.model().collection.indexOf(kbInterface.model()),
              endpoints = this.model().attributes["endpoints"],
              newModel = new filterModel();
          tgModel.bindModelChange(newModel);
          endpoints.add([newModel],{at: selectedRuleIndex+1});
        },
        deleteEndpoint: function(data, kbInterface) {
            var tgModel = this;
            data.model().collection.remove(kbInterface.model());
            tgModel.tgSettingsRule({
                success: function (modelObj) {
                    tgModel.callback(modelObj);
                },
                error: function (error) {}
            });
        },
        validations: {
            tgSettingsRuleValidation: {
                'group_by_tag_type': {
                    required: true,
                    msg: 'Select atleast one tag type'
                },
                'from_time': function(value) {
                    if((this.get('time_range') == -1 ||
                        this.get('time_range') == -2) && !value) {
                        return "Select From Time";
                    } else if(new Date(value) > new Date()) {
                        return "From Time can't be future time";
                    }
                },
                'to_time': function(value) {
                    if(this.get('time_range') == -1) {
                        if(!value) {
                            return "Select To Time";
                        } else if(new Date(value) > new Date()) {
                            return "To Time can't be future time";
                        } else if(this.get('from_time') &&
                            new Date(value) < new Date(this.get('from_time'))) {
                            return "To Time should be greater than From Time";
                        }
                    }
                }
            }
        }
    });
    return TrafficGroupsSettingsModel;
});
