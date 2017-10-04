/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "moment"], function(_, moment){
     var fwPolicyFormatter = function(){

         /*
          * fwRuleFormatter
          */
          this.fwRuleFormatter = function(r, c, v, cd, dc) {
              var fwRules = getValueByJsonPath(dc,
                  "firewall_rule_refs", [], false);
              return fwRules.length ? fwRules.length : 0;
          };

          /*
           * policySetFormatter
           */
           this.policySetFormatter = function(r, c, v, cd, dc) {
               var formattedPolSet = "", policySets = getValueByJsonPath(dc,
                   "application_policy_set_back_refs", [], false);
               _.each(policySets, function(polSet, i) {
                   if(i === 0){
                       formattedPolSet = polSet.to[polSet.to.length - 1];
                   } else {
                       formattedPolSet += ', ' + polSet.to[polSet.to.length - 1];
                   }
               });
               return formattedPolSet ? formattedPolSet : '-';
           };

          /*
           * policyDescriptionFormatter
           */
           this.policyDescriptionFormatter = function(r, c, v, cd, dc) {
               return getValueByJsonPath(dc,
                   "id_perms;description", '-', false);
           };

           /*
            * lastUpdateFormatter
            */
            this.lastUpdateFormatter = function(r, c, v, cd, dc) {
                var lastUpdated = getValueByJsonPath(dc,
                    "id_perms;last_modified", '', false);
                if(lastUpdated) {
                    lastUpdated =
                        moment(lastUpdated, '').format('DD MMM YYYY');
                } else {
                    lastUpdated = '-';
                }
                return lastUpdated;
            };

            /*
             * lastUpdateExpFormatter
             */
             this.lastUpdateExpFormatter = function(r, c, v, cd, dc) {
                 var lastUpdated = getValueByJsonPath(dc,
                     "id_perms;last_modified", '', false);
                 if(lastUpdated) {
                     lastUpdated =
                         moment(lastUpdated, '').format('DD MMM YYYY HH:mm:ss');
                 } else {
                     lastUpdated = '-';
                 }
                 return lastUpdated;
             };
             
             var checkIsGlobal = function(){
                 var isGlobal = false;
                 var url = decodeURIComponent(location.hash).split('&');
                 for(var i = 0; i < url.length; i++){
                     if(url[i].search('isGlobal') !== -1){
                         var spliturl = url[i].split('=').reverse();
                         if(spliturl[0] === 'true'){
                             isGlobal = true;
                         }
                         break;
                     }
                 }
                 return isGlobal;
             };
             
             this.filterTagsByProjects = function(tags, global){
             	var filtedGlobalTags = [], filteredProjectTags = [], isGlobal;
             	if(global !== undefined){
             		isGlobal = global;
             	}else{
             		isGlobal = checkIsGlobal();
             	}
             	var projectName = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
             	for(var i = 0; i < tags.length; i++){
             		var fq_name =  tags[i]['tag']['fq_name'];
             		if(fq_name.length === 1){
             			filtedGlobalTags.push(tags[i]);
             		}else if(fq_name.length > 1){
             			if(fq_name.indexOf(projectName) === 1){
             				filteredProjectTags.push(tags[i]);
             			}
             		}
             		
             	}
             	if(isGlobal){
             		return filtedGlobalTags;
             	}else{
             		var projectTags = filteredProjectTags.concat(filtedGlobalTags);
             		return projectTags;
             	}
             };
             
             this.filterAddressGroupByProjects = function(addressGroup, global){
            	 var filtedGlobalAddressGrp = [], filteredProjectAddressGrp = [], isGlobal;
            	 if(global !== undefined){
              		isGlobal = global;
              	 }else{
              		isGlobal = checkIsGlobal();
              	 }
              	 var projectName = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
              	 for(var i = 0; i < addressGroup.length; i++){
              		var fq_name =  addressGroup[i]['address-group']['fq_name'];
              		if(fq_name[0] === 'default-policy-management'){
              			filtedGlobalAddressGrp.push(addressGroup[i]);
              		}else if(fq_name.length > 1){
              			if(fq_name.indexOf(projectName) === 1){
              				filteredProjectAddressGrp.push(addressGroup[i]);
              			}
              		}
              		
              	}
              	if(isGlobal){
              		return filtedGlobalAddressGrp;
              	}else{
              		var projectAddressGrp = filteredProjectAddressGrp.concat(filtedGlobalAddressGrp);
              		return projectAddressGrp;
              	}
             };

             this.filterServiceGroupByProjects = function(serviceGroup, global){
                 var filtedGlobalServiceGrp = [], filteredProjectServiceGrp = [], isGlobal;
                 if(global !== undefined){
                    isGlobal = global;
                 }else{
                    isGlobal = checkIsGlobal();
                 }
                 var projectName = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                 for(var i = 0; i < serviceGroup.length; i++){
                    var fq_name =  serviceGroup[i]['service-group']['fq_name'];
                    if(fq_name[0] === 'default-policy-management'){
                        filtedGlobalServiceGrp.push(serviceGroup[i]);
                    }else if(fq_name.length > 1){
                        if(fq_name.indexOf(projectName) === 1){
                            filteredProjectServiceGrp.push(serviceGroup[i]);
                        }
                    }
                }
                if(isGlobal){
                    return filtedGlobalServiceGrp;
                }else{
                    var projectServiceGrp = filteredProjectServiceGrp.concat(filtedGlobalServiceGrp);
                    return projectServiceGrp;
                }
             };

             this.parseTags = function(tags) {
                 var tagGroupData = {},
                     applicationMap = { Application: [{ text: "Select Application",
                         value: "dummy" +
                         cowc.DROPDOWN_VALUE_SEPARATOR +
                         "Application",
                      disabled: true}]}, siteMap = {Site: [{ text: "Select Site",
                          value: "dummy" +
                          cowc.DROPDOWN_VALUE_SEPARATOR +
                          "Site",
                       disabled: true}]},
                     deploymentMap = {Deployment: [{ text: "Select Deployment",
                         value: "dummy" +
                         cowc.DROPDOWN_VALUE_SEPARATOR +
                         "Deployment",
                      disabled: true}]}, tierMap = {Tier:[{ text: "Select Tier",
                          value: "dummy" +
                          cowc.DROPDOWN_VALUE_SEPARATOR +
                          "Tier",
                       disabled: true}]}, labelMap = {Label:[{ text: "Select Labels",
                           value: "dummy" +
                           cowc.DROPDOWN_VALUE_SEPARATOR +
                           "label",
                        disabled: true}]};
                  _.each(tags, function(tagData){
                      if('tag' in tagData) {
                          var data = tagData['tag'];
                          var val = data.fq_name.length === 1 ?
                                  'global:' + data.name : data.name;
                          var txt = data.fq_name.length === 1 ?
                                  'global:' + data.tag_value : data.tag_value;
                          if(data.tag_type === ctwc.APPLICATION_TAG_TYPE) {
                              applicationMap['Application'].push({
                                  text: txt,
                                  value: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Application",
                                  id: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Application",
                                  parent: 'Application'});
                          } else if(data.tag_type === ctwc.TIER_TAG_TYPE) {
                              tierMap['Tier'].push({
                                  text: txt,
                                  value: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Tier",
                                  id: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Tier",
                                  parent: 'Tier'});

                          } else if(data.tag_type === ctwc.DEPLOYMENT_TAG_TYPE) {
                              deploymentMap['Deployment'].push({
                                  text: txt,
                                  value: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Deployment",
                                  id: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Deployment",
                                  parent: 'Deployment'});

                          } else if(data.tag_type === ctwc.SITE_TAG_TYPE) {
                              siteMap['Site'].push({
                                  text: txt,
                                  value: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Site",
                                  id: val + cowc.DROPDOWN_VALUE_SEPARATOR + "Site",
                                  parent: 'Site'});
                          } else if(data.tag_type === ctwc.LABEL_TAG_TYPE) {
                              labelMap['Label'].push({
                                  text: txt,
                                  value: val + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                                  id: val + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                                  parent: 'label'});
                          }
                      }
                  });
                  tagGroupData.applicationMap = applicationMap;
                  tagGroupData.siteMap = siteMap;
                  tagGroupData.deploymentMap = deploymentMap;
                  tagGroupData.tierMap = tierMap;
                  tagGroupData.labelMap = labelMap;
                  return tagGroupData;
             };
             
             
     };
     return fwPolicyFormatter
 });

