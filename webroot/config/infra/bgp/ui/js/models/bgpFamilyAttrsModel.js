/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "contrail-model"], function(_, ContrailModel){
     var bgpFamilyAttrsModel = ContrailModel.extend({
         defaultConfig: {
             "address_family": null,
             "loop_count": null,
             "prefix_limit": null,
             "familyAttrDataSource": [],
             "disableFamilyAttr": false
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
                     msg: "Address Family is required"
                 },
                 "loop_count" : function(value, attr, finalObj) {
                     if(value) {
                         if(isNaN(value) || Number(value) < 0 || Number(value) > 16) {
                             return "Enter Loop Count between 0 - 16"
                         }
                     }
                 },
                 "prefix_limit" : function(value, attr, finalObj) {
                     if(value && isNaN(value)) {
                         return "Prefix Limit should be a number";
                     }
                 }
             }
         }
     });
     return bgpFamilyAttrsModel;
 });