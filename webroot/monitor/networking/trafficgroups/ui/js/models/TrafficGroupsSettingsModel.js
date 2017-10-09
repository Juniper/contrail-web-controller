/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'monitor/networking/trafficgroups/ui/js/models/TrafficGroupsFilterModel'
], function (_, ContrailModel, filterModel) {
    var TrafficGroupsSettingsModel = ContrailModel.extend({
        defaultConfig: {
            "groupByTagType": null,
            "subGroupByTagType": null,
            "filter_by_endpoints": {
                "endpoint" : []
            },
            "tagTypeList": [],
            "time_range": 3600,
            "from_time": null,
            "to_time": null
        },
        formatModelConfig : function(modelConfig) {
            var endpointsModelCol = [],
                endpoints = getValueByJsonPath(modelConfig,
                "filterByEndpoints", []);
            _.each(endpoints, function(endpoint){
                endpointsModelCol.push(new filterModel({
                    endpoint : endpoint
                }));
            });
            modelConfig["endpoints"] = new Backbone.Collection(endpointsModelCol);
            return modelConfig;
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
            this.model().set('tagTypeList',
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
          var endpoints = this.model().attributes["endpoints"];
          endpoints.add([new filterModel()]);
        },
        addEndpointByIndex: function($data, kbInterface){
          var selectedRuleIndex = $data.model().collection.indexOf(kbInterface.model());
          var endpoints = this.model().attributes["endpoints"];
          endpoints.add([new filterModel()],{at: selectedRuleIndex+1});
        },
        deleteEndpoint: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },
        validations: {
            tgSettingsRuleValidation: {
                'groupByTagType': {
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
