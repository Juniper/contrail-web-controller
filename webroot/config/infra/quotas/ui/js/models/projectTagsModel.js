/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var projectTagsModel = ContrailModel.extend({
        defaultConfig: {
            'Application': '',
            'Tier': '',
            'Site': '',
            'Deployment': '',
            'Labels': '',
            "Custom": ''
        },
        formatModelConfig: function (modelConfig) {
            modelConfig["Application"] = modelConfig["Application"].replace(/,/g, ":");
            modelConfig["Site"] = modelConfig["Site"].replace(/,/g, ":");
            modelConfig["Deployment"] = modelConfig["Deployment"].replace(/,/g, ":");
            modelConfig["Tier"] = modelConfig["Tier"].replace(/,/g, ":");
            modelConfig["Labels"] = modelConfig["Labels"];
            modelConfig["Custom"] = modelConfig["Custom"];
            return modelConfig;
        },
        configureProjectTags: function (projUUID, callbackObj) {
            var ajaxConfig = {}, returnFlag = false, updatedVal = {};
               // var locks = this.model().attributes.locks.attributes;
                var newProjectTags = $.extend({}, true, this.model().attributes);
                var tagList = [];
                var to = [];
                newProjectTags.fq_name = [];
                _.each(newProjectTags, function(refs){
                    if(typeof refs === "string" && refs != '' && refs != '-'){
                         var actRef = refs.split(',');
                         if(actRef.length > 1){
                             _.each(actRef, function(refsItems){
                                 actRef =  refsItems.split(':');
                                 tagList.push({to: actRef});
                             });
                             return false;
                         }
                         actRef = actRef[0].split(':');
                         tagList.push({to: actRef});
                    }
                });
                newProjectTags.fq_name.push(contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME));
                newProjectTags.fq_name.push(contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME));
                ajaxConfig = {};
                var putData = {};
                updatedVal.fq_name = newProjectTags.fq_name;
                updatedVal.tag_refs = tagList;
                updatedVal.uuid = projUUID;
                updatedVal.parent_type = "domain";

                ajaxConfig.type = "POST";

                var postData = {"project": updatedVal};

                ajaxConfig.data = JSON.stringify(postData);
                ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;

                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            //}
            return returnFlag;
        }
    });
    return projectTagsModel;
});
