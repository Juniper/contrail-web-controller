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
             }
             
             
     };
     return fwPolicyFormatter
 });

