/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "config/rbac/common/ui/js/rbacUtils"],
     function(_, RBACUtils){
     var rbacUtils = new RBACUtils(), self;
     var rbacFormatters = function(){
         self = this;
         /*
          * objPropFormatter
          */
         self.objPropFormatter = function(r, c, v, cd, dc) {
              var rbacRuleObj = getValueByJsonPath(dc,
                          "rule_object", null, false),
                  rbacRuleField = getValueByJsonPath(dc,
                          "rule_field", "*", false),
                  formattedObjProp;
              if(rbacRuleField.trim() === ""){
                  rbacRuleField = "*";
              }
              if(rbacRuleObj) {
                  formattedObjProp = rbacRuleObj + "." + rbacRuleField;
              } else {
                  formattedObjProp = "-";
              }
              return formattedObjProp;
          };

          /*
           * roleAccessFormatter
           */
          self.roleAccessExpandDetailsFormatter = function(r, c, v, cd, dc) {
               var rbacRulePerms =  getValueByJsonPath(dc,
                       "rule_perms",
                       [], false),
                   formattedRoleAccessStr, roleAccessStr = "", roleName,
                   roleCrud, rbacRulePermsCnt = rbacRulePerms.length;
               if(rbacRulePermsCnt) {
                   for(i = 0; i < rbacRulePermsCnt; i++) {
                       roleName = getValueByJsonPath(rbacRulePerms[i],
                               "role_name", null, false);
                       roleName = roleName === "*" ?
                               ctwc.RBAC_ALL_ROLES : roleName;
                       roleCrud = getValueByJsonPath(rbacRulePerms[i],
                               "role_crud", null, false);
                       roleCrud = rbacUtils.getTextForRoleCrud(roleCrud);
                       roleAccessStr += "<tr style='vertical-align:top'><td>";
                       roleAccessStr += roleName + "</td><td>";
                       roleAccessStr += roleCrud + "</td><td>";
                       roleAccessStr += "</tr>";
                   }
                   if(roleAccessStr) {
                       formattedRoleAccessStr =
                           "<table style='width:100%'><thead><tr>\
                           <th style='width:25%'>Role</th>\
                           <th style='width:75%'>Access</th>\
                           </tr></thead><tbody>";
                       formattedRoleAccessStr += roleAccessStr;
                       formattedRoleAccessStr += "</tbody></table>";
                   }
               } else {
                   formattedRoleAccessStr = "-";
               }
               return formattedRoleAccessStr;
           };

           /*
            * roleFormatter
            */
           self.roleFormatter = function(r, c, v, cd, dc) {
                var rbacRulePerms =  getValueByJsonPath(dc,
                        "rule_perms",
                        [], false),
                    formattedRoleStr, roleAccessStr, roleName,
                    rbacRulePermsCnt = rbacRulePerms.length;
                if(rbacRulePermsCnt) {
                    for(i = 0; i < rbacRulePermsCnt; i++) {
                        if(i > 1 && cd) {
                            break;
                        }
                        roleName = getValueByJsonPath(rbacRulePerms[i],
                                "role_name", null, false);
                        if(roleName) {
                            roleAccessStr = roleName === "*" ?
                                    ctwc.RBAC_ALL_ROLES : roleName;
                        } else {
                            roleAccessStr = "-";
                        }

                        if(i === 0) {
                            formattedRoleStr = roleAccessStr;
                        } else {
                            formattedRoleStr += "<br>" + roleAccessStr;
                        }
                    }
                    if (rbacRulePermsCnt > 2 && cd) {
                        formattedRoleStr +=
                            '<br><span class="moredataText">(' +
                            (rbacRulePermsCnt - 2) +
                            ' more)</span><span class="moredata"' +
                            ' style="display:none;"></span>';
                    }
                } else {
                    formattedRoleStr = "-";
                }
                return formattedRoleStr;
            };

            /*
             * accessFormatter
             */
            self.accessFormatter = function(r, c, v, cd, dc) {
                 var rbacRulePerms =  getValueByJsonPath(dc,
                         "rule_perms",
                         [], false),
                     formattedAccessStr, roleAccessStr, roleCrud,
                     rbacRulePermsCnt = rbacRulePerms.length;
                 if(rbacRulePermsCnt) {
                     for(i = 0; i < rbacRulePermsCnt; i++) {
                         if(i > 1 && cd) {
                             break;
                         }
                         roleCrud = getValueByJsonPath(rbacRulePerms[i],
                                 "role_crud", null, false);
                         if(roleCrud) {
                             roleAccessStr =
                                 rbacUtils.getTextForRoleCrud(roleCrud);;
                         } else {
                             roleAccessStr = "-";
                         }

                         if(i === 0) {
                             formattedAccessStr = roleAccessStr;
                         } else {
                             formattedAccessStr += "<br>" + roleAccessStr;
                         }
                     }
                     if (rbacRulePermsCnt > 2 && cd) {
                         formattedAccessStr +=
                             '<br><span class="moredataText">(' +
                             (rbacRulePermsCnt - 2) +
                             ' more)</span><span class="moredata"' +
                             ' style="display:none;"></span>';
                     }
                 } else {
                     formattedAccessStr = "-";
                 }
                 return formattedAccessStr;
             };

           self.rolesComboFormatter = function(response) {
               var roles = getValueByJsonPath(response, "roles", []),
                   rolesArry = [{text: ctwc.RBAC_ALL_ROLES, value: "*"}];
               _.each(roles, function(role){
                   if(role){
                       rolesArry.push({text: role.name, value: role.id});
                   }
               });
               return rolesArry;
           };
     };

     this.ObjPropFormatter = function(v, dc) {
         return self.objPropFormatter("", "", v, "", dc);
     };

     this.RoleAccessFormatter = function(v, dc) {
         return self.roleAccessExpandDetailsFormatter("", "", v, "", dc);
     }
     return rbacFormatters;
 });

