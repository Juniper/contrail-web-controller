/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "contrail-model"], function(_, ContrailModel){
     var bgpaasFamilyAttrsModel = ContrailModel.extend({
         defaultConfig: {
             "address_family": "inet",
             "loop_count": 0,
             "prefix_limit": 0
         },
         formatModelConfig: function(modelConfig){
             return modelConfig
         },
         validateAttr: function (attributePath, validation, data) {
             var model = data.model().attributes.model(),
                 attr = cowu.getAttributeFromPath(attributePath),
                 errors = model.get(cowc.KEY_MODEL_ERRORS),
                 attrErrorObj = {}, isValid;

             isValid = model.isValid(attributePath, validation);

             attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ?
                 false : isValid;
             errors.set(attrErrorObj);
         },
         validations: {
             familyAttrValidation : {
                 "address_family" : {
                     required: true,
                     msg: "Address family is required"
                 },
                 "loop_count" : function(value, attr, finalObj) {
                     if(value) {
                         if(isNaN(value) || Number(value) < 0 || Number(value) > 16) {
                             return "Loop count should be in 0-16 range"
                         }
                     }
                 },
                 "prefix_limit" : function(value, attr, finalObj) {
                     if(value && isNaN(value)) {
                         return "Prefix limit should be a number";
                     }
                 }
             }
         }
     });
     return bgpaasFamilyAttrsModel;
 });

