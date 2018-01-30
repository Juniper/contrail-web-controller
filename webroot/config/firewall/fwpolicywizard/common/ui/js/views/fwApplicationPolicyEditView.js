/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID,
    prefixId = ctwc.FIREWALL_APPLICATION_POLICY_PREFIX_ID,
    modalId = 'configure-' + prefixId,
    formId = '#' + modalId + '-form';
    var fwApplicationPolicyEditView = ContrailView.extend({
        el: $(contentContainer),
        render: function(options) {
            var self = this,disable = false, slecectedPolicyList, apsName, viewConfig;
            if(options !== undefined){
                viewConfig = options.viewConfig;
            }else{
                viewConfig = this.attributes.viewConfig;
            }
            var mode = viewConfig.mode, headerText;
            if(mode === 'edit'){
                disable = true;
                headerText = 'Edit Application Policy Set';
                viewConfig.isEdit = true;
                slecectedPolicyList  = getPolicyList(viewConfig.policy);
                apsName = viewConfig.apsName;
            }else if(mode === 'add'){
                headerText = 'Create Application Policy Set';
            }
            deletedObj = [];
            var seletedRows = viewConfig.seletedRows;
            self.renderView4Config(self.$el,
                    this.model,
                    getApplicationPolicyViewConfig(disable, viewConfig, seletedRows, slecectedPolicyList, apsName),
                    "applicationPolicyValidation",
                    null, null, function() {
                    Knockback.applyBindings(self.model, document.getElementById('new-application-policy-set-section'));
                    kbValidation.bind(self);
                    //$('#Application').append('<div id="app-tag-create-container" style="font-size:15px;position:absolute;left:680px;top:75px;z-index:1000;" class="fa fa-plus" title="Create New Application Tags"></div>');
            },null,false);
        },

        setErrorContainer : function(headerText){
            $('#aps-gird-container').append($('<h6></h6>').text(headerText).addClass('aps-details-header'));
            var errorHolder = $('<div></div>').addClass('alert-error clearfix aps-details-error-container');
            var errorSpan = $('<span>Error : </span>').addClass('error-font-weight');
            var errorText = $('<span id="grid-details-error-container"></span>');
            errorHolder.append(errorSpan);
            errorHolder.append(errorText);
            $('#aps-gird-container').append(errorHolder);
            $('#aps-gird-container').append($('<div id = "gird-details-container"></div>'));
        }
    });
    function getPolicyList(policy){
        var uuidList = [];
        _.each(policy, function(obj) {
            uuidList.push(obj.uuid);
        });
        return uuidList;
    };
    var getAllfwPoliciesStandAlonePoliciesViewConfig = function (viewConfig, mode) {
        return {
            elementId: "create_application_policy_prefixid",
            view: 'SectionView',
            title: "Application Policy",
            viewConfig: {
                rows: [
                       {
                           columns: [
                               {
                                   elementId: 'fw_policy_wizard_global_list_view',
                                   view: "fwPolicyWizardGlobalListView",
                                   viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                   viewConfig: $.extend(true, {}, viewConfig,{
                                       mode: mode
                                   })
                               }
                           ]
                       }
                ]
            }
        }
    }
    var getAllfwPoliciesStandAloneProjectPoliciesViewConfig = function (viewConfig, mode) {
        return {
            elementId: "fw-policies-wizard-project-section",
            view: 'SectionView',
            title: "Firewall Policies",
            viewConfig: {
                rows: [
                       {
                           columns: [
                               {
                                   elementId: 'fw_policy_wizard_project_list_view',
                                   view: "fwPolicyWizardProjectListView",
                                   viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                   viewConfig: $.extend(true, {}, viewConfig,{
                                       mode: mode
                                   })
                               }
                           ]
                       }
                ]
            }
        }
    }
    var getApplicationPolicyViewConfig = function (isDisable, viewConfig, seletedRows, slecectedPolicyList, apsName) {
        var policyParam = {data: [{type: 'firewall-policys'}]};
        var tagsFiiteredArray = [];
        var tagsArray = [], tagName;
        return {
            elementId: "create_application_policy_prefixid",
            view: 'SectionView',
            title: "Application Policy",
            viewConfig: {
                rows: [{
                           columns: [
                               {
                                   elementId: 'name',
                                   view: 'FormInputView',
                                   viewConfig: {
                                       label: 'Name',
                                       path: 'name',
                                       class: 'col-xs-6',
                                       dataBindValue: 'name',
                                       disabled : isDisable
                                   }
                               },{
                                   elementId: 'Application',
                                   view: 'FormDropdownView',
                                   viewConfig: {
                                       visible:
                                           'name() !== "' + ctwc.GLOBAL_APPLICATION_POLICY_SET + '"',
                                       label: "Application Tag",
                                       path: 'Application',
                                       plusFlag : true,
                                       dataBindValue: 'Application',
                                       class: 'col-xs-6',
                                       dataBindOptionList : "dataSource",
                                       elementConfig: {
                                           dataTextField: "text",
                                           dataValueField: "id",
                                           allowClear: true,
                                           placeholder:
                                               "Select Tags"
                                       }
                                   }
                               }
                           ]
                       },
                       {
                           columns: [
                               {
                                   elementId: "description",
                                   view: "FormTextAreaView",
                                   viewConfig: {
                                       path: "description",
                                       dataBindValue: "description",
                                       label: "Description",
                                       rows:"1",
                                       cols:"100%",
                                       class: "col-xs-12"
                                   }
                               }
                           ]
                       },
                       {
                           columns: [
                               {
                                   elementId: "fw-policy-global-grid-id",
                                   view: "fwApplicationPolicyListView",
                                   viewPathPrefix:
                                       "config/firewall/fwpolicywizard/project/ui/js/views/",
                                   app: cowc.APP_CONTRAIL_CONTROLLER,
                                   viewConfig: $.extend(true, {}, viewConfig,{
                                       projectSelectedValueData: viewConfig.projectSelectedValueData,
                                       seletedRows : seletedRows,
                                       policyList : slecectedPolicyList,
                                       apsName : apsName,
                                       girdId : viewConfig.girdId
                                   })
                               }
                           ]
                       },
                       {
                           columns: [
                               {
                                   elementId: "fw-policy-global-grid-id",
                                   view: "fwApplicationPolicyListView",
                                   viewPathPrefix:
                                       "config/firewall/fwpolicywizard/project/ui/js/views/",
                                   app: cowc.APP_CONTRAIL_CONTROLLER,
                                   viewConfig: $.extend(true, {}, viewConfig,{
                                       projectSelectedValueData: viewConfig.projectSelectedValueData,
                                       seletedRows : seletedRows,
                                       policyList : slecectedPolicyList,
                                       apsName : apsName,
                                       girdId : viewConfig.girdId
                                   })
                               }
                           ]
                       },
                       {
                           columns:[{
                               elementId: "fw_security_application_permission_accordion_create",
                               view: "AccordianView",
                               viewConfig:[
                                  {
                                                           elementId: "fw_app_security_permissions",
                                                           active:false,
                                                           view: 'SectionView',
                                                           title:"Permissions",
                                                           viewConfig: {
                                                               rows: [
                                                                   {
                                                                       columns: [
                                                                           {
                                                                               elementId: 'fw_app_owner_access_security',
                                                                               view: 'FormMultiselectView',
                                                                               viewConfig: {
                                                                                   label: "Owner Permissions",
                                                                                   path: 'perms2.owner_access',
                                                                                   dataBindValue: 'perms2().owner_access',
                                                                                   class: 'col-xs-6',
                                                                                   elementConfig: {
                                                                                       dataTextField: "text",
                                                                                       dataValueField: "value",
                                                                                       placeholder:
                                                                                           "Select Permissions",
                                                                                       data: cowc.RBAC_ACCESS_TYPE_LIST
                                                                                   }
                                                                               }
                                                                           },
                                                                           {
                                                                               elementId: 'fw_app_global_access_secuirty',
                                                                               view: 'FormMultiselectView',
                                                                               viewConfig: {
                                                                                   label: "Global Share Permissions",
                                                                                   path: 'perms2.global_access',
                                                                                   dataBindValue: 'perms2().global_access',
                                                                                   class: 'col-xs-6',
                                                                                   elementConfig: {
                                                                                       dataTextField: "text",
                                                                                       dataValueField: "value",
                                                                                       placeholder:
                                                                                           "Select Permissions",
                                                                                       data: cowc.RBAC_ACCESS_TYPE_LIST
                                                                                   }
                                                                               }
                                                                           }
                                                                       ]
                                                                   },
                                                                   {
                                                                       columns:[{
                                                                           elementId: "fw_app_security_share_accordion_create",
                                                                           view: "AccordianView",
                                                                           viewConfig:[{
                                                                              elementId: "security_app_share_accordion_create",
                                                                              view:  "SectionView",
                                                                              title: "Share List",
                                                                              viewConfig:{
                                                                                  rows: [{
                                                                                      columns:
                                                                                         shareViewConfig()
                                                                                   }]
                                                                               }
                                                                           }]
                                                                       }]
                                                                    }

                                                               ]
                                                           }
                        }
                               ]
                           }]
                        }
                ]
            }
        }
    }
    return fwApplicationPolicyEditView;
});