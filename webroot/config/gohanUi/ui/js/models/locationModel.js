/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/gohanUi/ui/js/models/locationConfigModel'
], function (_, ContrailConfigModel, LocationConfigModel) {
    var locationStack= [];
    var self;
    var LocationModel = ContrailConfigModel.extend({
        defaultConfig: {
                "id": "",
                "location_entries":{"location":[]},
                "entries": []
             },
            formatModelConfig: function (config){
                self = this;
                locationStack = [];
                var modelConfig = $.extend({},true,config);
                modelConfig['rawData'] = config;
                var ruleModels = [];
                var rulesList = modelConfig["entries"];
                if (rulesList != null && rulesList.length > 0) {
                    for (var i = 0; i < rulesList.length; i++) {
                        var rule_obj = rulesList[i];
                        var ruleModel = new LocationConfigModel(rule_obj);
                        this.showHideLocationField(ruleModel,'edit');
                        ruleModels.push(ruleModel)
                    }
                }
                var rulesCollectionModel = new Backbone.Collection(ruleModels);
                modelConfig['LocationDetails'] = rulesCollectionModel;
                modelConfig["location_entries"]["location"] = rulesCollectionModel;
                return modelConfig;
            },
            addRule: function(){
                var rulesList = this.model().attributes['LocationDetails'],
                newRuleModel = new LocationConfigModel();
                this.showHideLocationField(newRuleModel,'add');
                rulesList.add([newRuleModel]);
            },
            deleteRules: function(data, rules) {
                var rulesCollection = data.model().collection,
                    delRule = rules.model();
                var model = $.extend(true,{},delRule.attributes);
                if(model.locationId() != ''){
                    locationStack.push({locationId : model.locationId(), svcTempId : model.svcTempId(),mode: 'delete'});
                }
                rulesCollection.remove(delRule);
            },
            showHideLocationField: function(ruleModels, type) {
                ruleModels.showLocation = ko.computed((function() {
                    if (type === 'edit') {
                        return true;
                    } else {
                        return false;
                    }
                }), ruleModels);
            },
            configureLocation: function (parentName, callbackObj) {
                console.log(locationStack);
                var ajaxConfig = {}, returnFlag = true, childName, objName;
                var getAjaxs = [];
                var locationData = $.extend(true,{},this.model().attributes),
                locationJSON = locationData["location_entries"]["location"],
                   locationVal = $.extend(true,{},locationJSON),
                   addedLocationVal = locationVal.toJSON();
                console.log(addedLocationVal);
                var svcTempId = locationData.id;
                if(addedLocationVal.length === 0 && locationStack.length === 0){
                    var error = {};
                    error.responseText = 'Please add the row.';
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                }else{
                    var emptyLocationId = true;
                    for(var j = 0; j < addedLocationVal.length; j++){
                        if(addedLocationVal[j].locationId() === ''){
                            emptyLocationId = false;
                        }
                    }
                    var emptyFlag = true;
                        for(var k = 0; k < addedLocationVal.length; k++){
                            if(addedLocationVal[k].locationId() === ''){
                            	if(parentName === 'networks'){
                            		if(addedLocationVal[k].locationName().split(';')[0] == '' || addedLocationVal[k].subnet() == '' || addedLocationVal[k].name() == '' ||  addedLocationVal[k].description() == ''){
                                        emptyFlag = false;
                                    }
                            	}else{
                            		if(addedLocationVal[k].locationName().split(';')[0] == '' || addedLocationVal[k].name() == '' ||  addedLocationVal[k].description() == ''){
                                        emptyFlag = false;
                                    }
                            	}
                             }
                        }
                        if(emptyFlag){
                          for(var l = 0; l < addedLocationVal.length; l++){
                        	  if(parentName === 'networks'){
                        		  if(addedLocationVal[l].locationId() === ''){
                                      locationStack.push({locationId : addedLocationVal[l].locationId(), subnet:addedLocationVal[l].subnet(), locationName : addedLocationVal[l].locationName().split(';')[0],
                                       name: addedLocationVal[l].name(), description: addedLocationVal[l].description(),mode: 'add'});
                                  }else{
                                      locationStack.push({locationId : addedLocationVal[l].locationId(), subnet:addedLocationVal[l].subnet(), description: addedLocationVal[l].description(),mode: 'edit'});
                                  }
                        	  }else{
                        		  if(addedLocationVal[l].locationId() === ''){
                                      locationStack.push({locationId : addedLocationVal[l].locationId(), locationName : addedLocationVal[l].locationName().split(';')[0],
                                       name: addedLocationVal[l].name(), description: addedLocationVal[l].description(),mode: 'add'});
                                  }else{
                                      locationStack.push({locationId : addedLocationVal[l].locationId(), description: addedLocationVal[l].description(),mode: 'edit'});
                                  }
                        	  }
                          }
                          if(parentName === 'service_templates'){
                              childName = 'local_service_templates';
                              objName = 'local_service_template';
                          }else if(parentName === 'network_policies'){
                              childName = 'local_network_policies';
                              objName = 'local_network_policy';
                          }else if(parentName === 'service_instances'){
                              childName = 'local_service_instance';
                              objName = 'local_service_instance';
                          }else if(parentName === 'security_groups'){
                              childName = 'local_security_groups';
                              objName = 'local_security_group';
                          }else if(parentName === 'networks'){
                        	  childName = 'local_networks';
                              objName = 'local_network';
                          }
                          for(var i = 0; i < locationStack.length; i++){
                           if(locationStack[i].mode == 'delete'){
                               var model = {};
                               model[objName] = {};
                               getAjaxs[i] = $.ajax({
                                   url:'./gohan_contrail/v1.0/tenant/'+parentName+'/'+locationStack[i].svcTempId+'/'+childName+'/'+locationStack[i].locationId,
                                   type:'DELETE',
                                   data: JSON.stringify(model)
                               });
                            }else if(locationStack[i].mode == 'add'){
                                var model = {};
                                model[objName] = {};
                                if(parentName === 'networks'){
                                  var data = {description: locationStack[i].description,location_id : locationStack[i].locationName,name :locationStack[i].name, cidr:locationStack[i].subnet};
                                }else{
                                  var data = {description: locationStack[i].description,location_id : locationStack[i].locationName,name :locationStack[i].name};
                                }
                                model[objName] = data;
                                getAjaxs[i] = $.ajax({
                                    url:'./gohan_contrail/v1.0/tenant/'+parentName+'/'+svcTempId+'/'+childName,
                                    type:'POST',
                                    data: model
                                });
                            }else{
                                var model = {};
                                model[objName] = {};
                                var data = {description: locationStack[i].description};
                                model[objName] = data;
                                getAjaxs[i] = $.ajax({
                                    url:'./gohan_contrail/v1.0/tenant/'+parentName+'/'+svcTempId+'/'+childName+'/'+locationStack[i].locationId,
                                    type:'PUT',
                                    data: model
                                });
                            }
                          }
                          $.when.apply($, getAjaxs).then(function () {
                               if(arguments[1].constructor === Array){
                                   var response = arguments[1][1];
                               }else{
                                   var response = arguments[1];
                               }
                               if(response === 'success'){
                                    if (contrail.checkIfFunction(callbackObj.success)) {
                                        callbackObj.success();
                                    }
                                    returnFlag = true;
                                }else{
                                    if(response === undefined){
                                        var error = {};
                                        error.responseText = '';
                                    }else{
                                        var error = {};
                                        error.responseText = response;
                                    }
                                    if (contrail.checkIfFunction(callbackObj.error)) {
                                        callbackObj.error(error);
                                    }
                                    returnFlag = false;
                                }
                           });
                        }else{
                            var error = {};
                            error.responseText = 'Please enter the remaining field..';
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(error);
                            }
                            returnFlag = false; 
                        }
                }
               return returnFlag;
            }
    });
    return LocationModel;
});
