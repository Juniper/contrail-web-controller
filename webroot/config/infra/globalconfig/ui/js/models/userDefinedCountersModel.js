/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var userDefinedCountersModel = ContrailModel.extend({

        defaultConfig: {
            name : '',
            pattern : ''
        },

        validations: {
            userDefinedCounterValidation: {
                'name' : function(value, attr, finalObj) {
                    if(value === null || value.trim() === '') {
                        return "Enter a Name";
                    }
                },
                'pattern': function(value, attr, finalObj) {
                    if(value === null || value.trim() === '') {
                        return "Enter a Pattern";
                    }
                }
            }
        },

        getCurrentGlobalSystemConfigData : function (callbackObj,deferredObj) {
            var ajaxConfig = {
                    url : ctwc.URL_GET_CONFIG_DETAILS,
                    type : 'POST',
                    data : JSON.stringify({data:
                        [{type: 'global-system-configs'}]})
             };
            contrail.ajaxHandler(ajaxConfig, null, function(response) {
                //Got the current global system config, send back
                deferredObj.resolve(response);
            },function(error) {
                //Got error return to caller
                callbackObj.error(error);
            }
            );
        },

        configureUserDefinedCounter : function (callbackObj,
                currentGlobalSystemConfigData,currentUserDefinedCounterList) {
            //Call the configure function in the parent model
            var userDefinedCountersData = {}, putData = {};
            userDefinedCountersData['global-system-config'] = {};
            userDefinedCountersData['global-system-config']['user_defined_log_statistics'] = {};
            if ((null != currentUserDefinedCounterList) &
                    (currentUserDefinedCounterList.length > 0)) {
                userDefinedCountersData['global-system-config']['user_defined_log_statistics']
                       ['statlist'] = currentUserDefinedCounterList;
            } else {
                userDefinedCountersData['global-system-config']['user_defined_log_statistics']['statlist'] = [];
            }
            if (null != currentGlobalSystemConfigData['uuid']) {
                userDefinedCountersData['global-system-config']['uuid'] =
                    currentGlobalSystemConfigData['uuid'];
                    putData = {
                        "global-system-config" : userDefinedCountersData["global-system-config"]
                    };
            }
            var ajaxConfig = {};
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(putData);
            ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },

        deleteUserDefinedCounters : function (callbackObj,options) {
            var self = this, currentGlobalSystemConfigData = {};
            var deferredObj = $.Deferred();
            var namesTobeDeleted = [];
            var rowIndecesTobeDeleted = options.rowIndexes;
            var gridDataList = options.gridData;
            for (var i = 0; i < rowIndecesTobeDeleted.length ; i++) {
                namesTobeDeleted.push(gridDataList[rowIndecesTobeDeleted[i]]);
            }
            self.getCurrentGlobalSystemConfigData(callbackObj, deferredObj);
            deferredObj.done(function(response) {

                currentGlobalSystemConfigData = getValueByJsonPath(response,
                        "0;global-system-configs;0;global-system-config", {});
                 var currentUserDefinedCounterList =
                     getValueByJsonPath(currentGlobalSystemConfigData,
                             "user_defined_log_statistics;statlist",[]);

                 currentUserDefinedCounterList = currentUserDefinedCounterList.filter(function(val) {
                     for(var i = 0; i < namesTobeDeleted.length ; i++) {
                         if(val.name === namesTobeDeleted[i].name) {
                             return false;
                         }
                     }
                     return true;
                 });
                 self.configureUserDefinedCounter(callbackObj,
                         currentGlobalSystemConfigData,
                         currentUserDefinedCounterList);
            });
        },

        editCreateUserDefinedCounter : function (callbackObj) {
            //Read the data from the page
            //Get the parent/full object for global-system-config
            //Modify the line to be edited and call the update function in parent model

            var self = this, currentGlobalSystemConfigData = {},
                newUserDefinedCounterConfig;

            if(self.model().isValid(true, "userDefinedCounterValidation")) {
              newUserDefinedCounterConfig =
                    $.extend({}, true, self.model().attributes);
              newUserDefinedCounterConfig['pattern'] = newUserDefinedCounterConfig['pattern'].toString().trim();
              ctwu.deleteCGridData(newUserDefinedCounterConfig);
                //Fetch the current global-system-config
              var deferredObj = $.Deferred();
              self.getCurrentGlobalSystemConfigData(callbackObj, deferredObj);
              deferredObj.done (function(response) {
                   currentGlobalSystemConfigData = getValueByJsonPath(response,
                  "0;global-system-configs;0;global-system-config", {});
                   var currentUserDefinedCounterList =
                       getValueByJsonPath(currentGlobalSystemConfigData,
                               "user_defined_log_statistics;statlist",[]);
                   if(currentUserDefinedCounterList.length === 0){
                       currentUserDefinedCounterList.push(newUserDefinedCounterConfig);
                   }
                   else{
                       var found = false;
                       for (var i = 0; i < currentUserDefinedCounterList.length; i++) {
                           if (currentUserDefinedCounterList[i]['name'] ==
                               newUserDefinedCounterConfig['name']) {
                               found = true;
                               currentUserDefinedCounterList[i]['pattern'] =
                                   newUserDefinedCounterConfig['pattern'];
                           }
                       }
                       if (!found) {
                           currentUserDefinedCounterList.
                               push(newUserDefinedCounterConfig);
                       }
                   }
                   self.configureUserDefinedCounter(callbackObj,
                           currentGlobalSystemConfigData,
                           currentUserDefinedCounterList);
               });

            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.GLOBAL_COUNTERS_PREFIX_ID));
                }
            }
        }
    });

    return userDefinedCountersModel;
});

