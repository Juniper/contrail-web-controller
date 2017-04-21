/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/gohanUi/common/ui/js/models/gcLocationConfigModel'
], function (_, ContrailConfigModel, LocationConfigModel) {
    var locationStack= [];
    var self;
    var locationModel = ContrailConfigModel.extend({
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
            configureServerLocation: function (callbackObj) {
                var ajaxConfig = {}, returnFlag = true;
                var getAjaxs = [];
                var locationData = $.extend(true,{},this.model().attributes),
                locationJSON = locationData["location_entries"]["location"],
                   locationVal = $.extend(true,{},locationJSON),
                   addedLocationVal = locationVal.toJSON();
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
                                if(addedLocationVal[k].locationName().split(';')[0] == '' || addedLocationVal[k].name() == '' ||  addedLocationVal[k].description() == '' ||
                                        addedLocationVal[k].instanceId() == '' || addedLocationVal[k].console() == ''){
                                        emptyFlag = false;
                                }
                            }
                        }
                        if(emptyFlag){
                          for(var l = 0; l < addedLocationVal.length; l++){
                              if(addedLocationVal[l].locationId() === ''){
                                  locationStack.push({locationId : addedLocationVal[l].locationId(), locationName : addedLocationVal[l].locationName().split(';')[0],
                                  name: addedLocationVal[l].name(), description: addedLocationVal[l].description(),instanceId: addedLocationVal[l].instanceId(),console: addedLocationVal[l].console(), mode: 'add'});
                              }else{
                                  locationStack.push({locationId : addedLocationVal[l].locationId(), description: addedLocationVal[l].description(),mode: 'edit'});
                              }
                          }
                          var parentName  = 'servers', childName = 'local_servers',objName = 'local_server';
                          for(var i = 0; i < locationStack.length; i++){
                           if(locationStack[i].mode == 'delete'){
                               var model = {};
                               model[objName] = {};
                               getAjaxs[i] = $.ajax({
                                   url: ctwc.GOHAN_URL + parentName +'/'+ locationStack[i].svcTempId +'/'+ childName +'/'+ locationStack[i].locationId,
                                   type:'DELETE',
                                   data: JSON.stringify(model)
                               });
                            }else if(locationStack[i].mode == 'add'){
                                var model = {};
                                model[objName] = {};
                                var data = {description: locationStack[i].description,location_id : locationStack[i].locationName,
                                            instance_id: locationStack[i].instanceId,console_url: locationStack[i].console, name :locationStack[i].name};
                                model[objName] = data;
                                getAjaxs[i] = $.ajax({
                                    url: ctwc.GOHAN_URL + parentName +'/'+ svcTempId +'/'+ childName,
                                    type:'POST',
                                    data: model
                                });
                            }else{
                                var model = {};
                                model[objName] = {};
                                var data = {description: locationStack[i].description};
                                model[objName] = data;
                                getAjaxs[i] = $.ajax({
                                    url: ctwc.GOHAN_URL + parentName +'/'+ svcTempId +'/'+ childName +'/'+ locationStack[i].locationId,
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
            },
            configureLocation: function (obj, callbackObj) {
                var ajaxConfig = {}, returnFlag = true;
                var getAjaxs = [];
                var locationData = $.extend(true,{},this.model().attributes),
                locationJSON = locationData["location_entries"]["location"],
                   locationVal = $.extend(true,{},locationJSON),
                   addedLocationVal = locationVal.toJSON();
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
                                if(obj.name === 'networks'){
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
                              if(obj.name === 'networks'){
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
                          for(var i = 0; i < locationStack.length; i++){
                           if(locationStack[i].mode == 'delete'){
                               var model = {};
                               model[obj.key] = {};
                               getAjaxs[i] = $.ajax({
                                   url: ctwc.GOHAN_TENANT_URL + obj.name +'/'+ locationStack[i].svcTempId +'/'+ obj.url +'/'+ locationStack[i].locationId,
                                   type:'DELETE',
                                   data: JSON.stringify(model)
                               });
                            }else if(locationStack[i].mode == 'add'){
                                var model = {};
                                model[obj.key] = {};
                                if(obj.name === 'networks'){
                                  var data = {description: locationStack[i].description,location_id : locationStack[i].locationName,name :locationStack[i].name, cidr:locationStack[i].subnet};
                                }else{
                                  var data = {description: locationStack[i].description,location_id : locationStack[i].locationName,name :locationStack[i].name};
                                }
                                model[obj.key] = data;
                                getAjaxs[i] = $.ajax({
                                    url: ctwc.GOHAN_TENANT_URL + obj.name +'/'+ svcTempId +'/'+ obj.url,
                                    type:'POST',
                                    data: model
                                });
                            }else{
                                var model = {};
                                model[obj.key] = {};
                                var data = {description: locationStack[i].description};
                                model[obj.key] = data;
                                getAjaxs[i] = $.ajax({
                                    url: ctwc.GOHAN_TENANT_URL + obj.name +'/'+ svcTempId +'/'+ obj.url +'/'+ locationStack[i].locationId,
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
    return locationModel;
});
