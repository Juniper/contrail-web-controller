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
                                       label: "Application Tags",
                                       path: 'Application',
                                       dataBindValue: 'Application',
                                       class: 'col-xs-6',
                                       elementConfig: {
                                           dataTextField: "text",
                                           dataValueField: "id",
                                           placeholder:
                                               "Select Tags",
                                               dataSource : {
                                                   type: 'remote',
                                                   requestType: 'post',
                                                   postData: JSON.stringify(
                                                         {data: [{type: 'tags'}]}),
                                                   url:'/api/tenants/config/get-config-details',
                                                   parse: function(result) {
                                                       for(var i=0; i<result.length; i++){
                                                         tagsDetails = result[i].tags;
                                                         for(var j= 0; j<tagsDetails.length; j++){
                                                             var domain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
                                                             var project = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                                                             if (tagsDetails[j]['tag'].fq_name.length > 1 &&
                                                                     (domain != tagsDetails[j]['tag'].fq_name[0] ||
                                                                     project != tagsDetails[j]['tag'].fq_name[1])) {
                                                                 continue;
                                                             }
                                                             if(tagsDetails[j].tag.fq_name &&
                                                                     tagsDetails[j].tag.fq_name.length === 1) {
                                                                 actValue = tagsDetails[j].tag.fq_name[0];
                                                             }
                                                             else{
                                                                 actValue =  tagsDetails[j].tag.fq_name[0] +
                                                                 ":" + tagsDetails[j].tag.fq_name[1] +
                                                                 ":" + tagsDetails[j].tag.fq_name[2];
                                                             }
                                                             if(viewConfig.isGlobal){
                                                                 tagName = (tagsDetails[j]['tag'].fq_name.length == 1)?
                                                                         tagsDetails[j].tag.name : '';
                                                              }else{
                                                                  tagName = (tagsDetails[j]['tag'].fq_name.length == 1)?
                                                                          "global:" + tagsDetails[j].tag.name :
                                                                              tagsDetails[j].tag.name;
                                                              }
                                                              if(tagName !== ''){
                                                                  data = {
                                                                          "text": tagName,
                                                                          "id":actValue
                                                                     };
                                                                  if (tagsDetails[j].tag.tag_type_name === 'application') {
                                                                      tagsArray.push(data);
                                                                  }
                                                              }
                                                         }
                                                       }
                                                       return tagsArray;
                                                   }
                                               }
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
                       }
                ]
            }
        }
    }
    return fwApplicationPolicyEditView;
});