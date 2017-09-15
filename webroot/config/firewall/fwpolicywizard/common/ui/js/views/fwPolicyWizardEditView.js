/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter'
], function (_, ContrailView, Knockback, FWZUtils, FwPolicyFormatter) {
    var gridElId = '#' + ctwc.APPLICATION_POLICY_SET_GRID_ID,
        prefixId = ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';
    var fwzUtils = new FWZUtils();
    var fwPolicyFormatter = new FwPolicyFormatter();
    var fwPolicyWizardEditView = ContrailView.extend({
        renderFwWizard: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_APPLICATION_POLICY_SET),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-1120',
                             'title': options['title'], 'body': editLayout});

            self.renderView4Config($("#" + modalId).find('#aps-button-container'),
                                   this.model,
                                   getApplicationPolicyViewConfig(), "",
                                   null, null, function() {
                    $("#" + modalId).find('.modal-footer').hide();

                    function getAdressGroupClick(e){
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $('#aps-overlay-container .dropdown').hide();
                        self.renderObject(options, 'address_groups');
                        return true;
                    }
                    function getServiceGroupClick(e){
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $('#aps-overlay-container .dropdown').hide();
                        self.renderObject(options, 'service_groups');
                    }
                    function visibleTagClick(e){
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $('#aps-overlay-container .dropdown').hide();
                        self.renderObject(options, 'tag');
                    }
                    function backButtonClick(){
                        $('#modal-landing-container').show();
                        $("#aps-gird-container").empty();
                        $('#aps-landing-container').hide();
                    }

                    $("#review_address_groups").on('click', function(e) {
                        getAdressGroupClick(e);
                    });
                    $("#review_service_groups").on('click', function(e) {
                        getServiceGroupClick(e);
                    });
                    $("#review_visible_tag_for_project").on('click', function(e) {
                        visibleTagClick(e);
                    });
                    $("#aps-plus-icon").on('click', function(){
                        $('#aps-overlay-container .dropdown').show();
                        self.renderObject(options, 'addIcon', self);
                    });
                    $("#view-address-group").on('click', function(e) {
                        getAdressGroupClick(e);
                    });
                    $("#view-service-group").on('click', function(e) {
                       getServiceGroupClick(e);
                    });
                    $("#view-visble-tags").on('click', function(e) {
                        visibleTagClick(e);
                    });
                    $("#aps-back-button").on('click', function(){
                        backButtonClick();
                    });
                    $("#aps-main-back-button").on('click', function(){
                       backButtonClick();
                    });
                    $("#aps-create-fwpolicy-remove-icon").on('click', function(){
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $('#aps-overlay-container').hide();
                    });
                    $("#aps-remove-icon").on('click', function(){
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        backButtonClick();
                    })
            },null,false);
        },
        renderObject: function(options, objName, self){
            $('#modal-landing-container').hide();
            $('#aps-save-button').hide();
            $('#aps-landing-container').show();
            var placeHolder = $('#aps-gird-container');
            var viewConfig = options['viewConfig'];
            if(objName === 'address_groups'){
                $('#aps-main-container').hide();
                $('#aps-create-fwpolicy-remove-icon').hide();
                $('#aps-remove-icon').show();
                $('#aps-overlay-container').show();
                this.renderView4Config(placeHolder, null, getAddressGroup(viewConfig));
            }else if(objName === 'service_groups'){
                $('#aps-main-container').hide();
                $('#aps-create-fwpolicy-remove-icon').hide();
                $('#aps-remove-icon').show();
                $('#aps-overlay-container').show();
                this.renderView4Config(placeHolder, null, getServiceGroup(viewConfig));
            }else if(objName === 'tag'){
                $('#aps-main-container').hide();
                $('#aps-create-fwpolicy-remove-icon').hide();
                $('#aps-remove-icon').show();
                $('#aps-overlay-container').show();
                this.renderView4Config(placeHolder, null, getTag(viewConfig));
            }else if(objName === 'addIcon'){
                $('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                isBinding = false;
                self.fetchAllData(self, options, function(allData){
                    self.renderView4Config($('#aps-sub-container'), self.model, getAddPolicyViewConfig(self.model, viewConfig, allData, options),'policyValidation', null, null,function(){
                        if (isBinding) {
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_add-new-firewall-policy'));
                        }
                        if(isBinding){
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_rules'));
                            kbValidation.bind(self);
                        }
                    });
                });
            }
         },
         fetchAllData : function(self, options, callback) {
             var getAjaxs = [];
             var selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
             var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
             var serviceGrp = {data: [{type: 'service-groups'}]};
             getAjaxs[0] = $.ajax({
                 url:"/api/tenants/config/virtual-networks",
                 type:"GET"
             });
             //get tags
             getAjaxs[1] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data:JSON.stringify(
                         {data: [{type: 'tags'}]}),
             });

             //get address groups
             getAjaxs[2] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data: JSON.stringify(
                         {data: [{type: 'address-groups'}]})
             });
           //get service groups
             getAjaxs[3] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data: JSON.stringify(serviceGrp)
             });
             $.when.apply($, getAjaxs).then(
                 function () {
                     //all success
                     var returnArr = []
                     var results = arguments;
                     var vns = results[0][0]["virtual-networks"];
                     returnArr["virtual-networks"] = [];
                     var allVns = [{text:'Enter or Select a Network',
                                    value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                    id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                    disabled : true }];

                     if (null !== vns && typeof vns === "object" &&
                                      vns.length > 0) {
                         for (var i = 0; i < vns.length; i++) {
                             var vn = vns[i];
                             var virtualNetwork = vn["fq_name"];
                             var domain = virtualNetwork[0];
                             var project = virtualNetwork[1];
                             if(domain === selectedDomain &&
                                project === selectedProject) {
                                 if(vn["fq_name"][2].toLowerCase() === "any" ||
                                    vn["fq_name"][2].toLowerCase() === "local"){
                                     var fqNameTxt = vn["fq_name"][2];
                                     var fqNameValue = vn["fq_name"].join(":");
                                     allVns.push({text : fqNameTxt,
                                          value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                          id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                          parent : "virtual_network" });
                                 } else {
                                     allVns.push({text : vn["fq_name"][2],
                                                  value:(vn["fq_name"]).join(":")
                                                        + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                                  id : (vn["fq_name"]).join(":")
                                                        + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                                        parent : "virtual_network" });
                                 }
                             } else {
                                 var fqNameTxt = vn["fq_name"][2] +' (' +
                                                 domain + ':' +
                                                 project +')';
                                 var fqNameValue = vn["fq_name"].join(":");
                                 allVns.push({text : fqNameTxt,
                                      value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                      id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                      parent : "virtual_network" });
                             }
                         }
                     }
                     //tags
                     var tags = fwPolicyFormatter.filterTagsByProjects(getValueByJsonPath(results, '1;0;0;tags', [], false), options.viewConfig.isGlobal);
                     var addrFields = [];
                     //application
                     var tagGroupData = fwPolicyFormatter.parseTags(tags);
                     addrFields.push({text: 'Application', value: 'Application',
                         children: tagGroupData.applicationMap['Application']
                     });

                     //Deployment
                     addrFields.push({text: 'Deployment', value: 'Deployment',
                         children: tagGroupData.deploymentMap['Deployment']
                     });

                     //Site
                     addrFields.push({text: 'Site', value: 'Site',
                         children: tagGroupData.siteMap['Site']
                     });

                     //Tier
                     addrFields.push({text: 'Tier', value: 'Tier',
                         children: tagGroupData.tierMap['Tier']
                     });

                     //Labels
                     addrFields.push({text: 'Label', value: 'label',
                         children: tagGroupData.labelMap['Label']
                     });
                     var addressGrpChild = [{text:'Select a Address Group',
                         value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                         id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                         disabled : true }];
                     var addressGroups = fwPolicyFormatter.filterAddressGroupByProjects(getValueByJsonPath(results, '2;0;0;address-groups', [], false), options.viewConfig.isGlobal);
                     if(addressGroups.length > 0){
                         for(var k = 0; k < addressGroups.length; k++){
                             var address = addressGroups[k]['address-group'];
                             var fqNameTxt = address["fq_name"][address["fq_name"].length - 1];
                             var fqNameValue = address["fq_name"].join(":");
                             addressGrpChild.push({text : address.name,
                                 value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                                 id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                                 parent : "address_group" });
                         }
                         addrFields.push({text : 'Address Group', value : 'address_group', children : addressGrpChild});
                     }

                     addrFields.push({text : 'Network', value : 'virtual_network',
                                    children : allVns});
                     var anyList = [{text:'',
                         value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "any_workload",
                         id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "any_workload",
                         disabled : true }];
                         anyList.push({text : 'Select Any Workloads',
                         value : 'any' + cowc.DROPDOWN_VALUE_SEPARATOR + "any_workload",
                         id : 'any' + cowc.DROPDOWN_VALUE_SEPARATOR + "any_workload",
                         parent : "any_workload" });
                     addrFields.push({text : 'Any Workload', value : 'any_workload', children : anyList});
                     returnArr["addrFields"] = addrFields;
                     var secGrpList = getValueByJsonPath(results, "3;0;0;service-groups", []);
                     var serviceGrpList = [];
                     $.each(secGrpList, function (i, obj) {
                         var obj = obj['service-group'];
                         //serviceGrpList.push({value: obj.uuid, text: obj.name});
                         serviceGrpList.push({fq_name : obj.fq_name, text: obj.name});
                      });
                     returnArr["serviceGrpList"] = serviceGrpList;
                     callback(returnArr);
                 }
             )
         }
    });
    function getNewFirewallPolicyViewConfig(model) {
        var gridPrefix = "add-firewall-policy",
            addNewFwPolicyViewConfig = {
            elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy1"]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy"]),
                        title: "Name Policy",
                        view: "AccordianView",
                        viewConfig: fwzUtils.getFirewallPolicyViewConfig(prefixId),
                        stepType: "step",
                        buttons: {
                            next: {
                                visible: true,
                                label: "Next"
                            },
                            previous: {
                                visible: true,
                                label: "Back"
                            }
                        },
                        onNext: function(params) {
                            isBinding = true;
                            if(params.model.onNext()){
                               if(params.model.policy_name() !== ''){
                                   $('#applicationpolicyset_policy_wizard .alert-error span').text('');
                                   $('#applicationpolicyset_policy_wizard .alert-error').hide();
                                   return true;
                               }else{
                                   $('#applicationpolicyset_policy_wizard .alert-error span').text('Please enter the Policy Name.');
                                   $('#applicationpolicyset_policy_wizard .alert-error').show();
                               }
                            }else{
                                params.model.onNext(true);
                            }
                        },
                        onPrevious: function(params) {
                            $("#aps-main-back-button").show();
                            $('#applicationpolicyset_policy_wizard .actions').css("display", "none");
                            params.model.onNext(false);
                            return true;
                        }
                    }
                ]
            }
        };
        return addNewFwPolicyViewConfig;
    }
    function getAddRulesViewConfig(viewConfig, allData, options) {
        var gridPrefix = "add-rules",
        addRulesViewConfig = {
            elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
                        title: "Create Rules",
                        view: "SectionView",
                        viewConfig: fwzUtils.getRulesViewConfig(allData),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                label: "Back",
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            return params.model.addEditApplicationSet({
                                success: function () {
                                    if($("#" + modalId).find(".contrailWizard").data("contrailWizard")){
                                        $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                                    }
                                    $("#" + modalId).modal("hide");
                                    if($('#fw-policy-grid').data("contrailGrid") !== undefined){
                                        $('#fw-policy-grid').data("contrailGrid")._dataView.refreshData();
                                    }
                                    if($('#firewall-application-policy-grid').data("contrailGrid") !== undefined){
                                        $('#firewall-application-policy-grid').data("contrailGrid")._dataView.refreshData();
                                    }
                                    isBinding = false;
                                },
                                error: function (error) {
                                    $('#applicationpolicyset_policy_wizard .alert-error span').text(error.responseText);
                                    $('#applicationpolicyset_policy_wizard .alert-error').show();
                                }
                            }, options, false, allData.serviceGrpList);
                        }
                    }
                ]
            }
        };
        return addRulesViewConfig;
    }
    function getAddPolicyViewConfig(model, viewConfig, allData, options) {
        var addPolicyViewConfig = {
            elementId: cowu.formatElementId([prefixId, 'policy_wizard']),
            view: "WizardView",
            viewConfig: {
                steps: []
            }
        }
    steps = [];
    createStepViewConfig = null;
    addnewFwPolicyStepViewConfig = null;
    addRulesStepViewConfig = null;
    createStepViewConfig = {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_LIST_VIEW_ID]),
                                view: "fwPolicyWizardListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix: "config/firewall/fwpolicywizard/project/ui/js/views/",
                                viewConfig: $.extend(true, {}, viewConfig,
                                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
                            }
                        ]
                    }
                ]
            },
            title: "Select set",
            stepType: "step",
            onNext: function (options) {
                return true;
            },
            buttons: {
                next: {
                    visible: false
                },
                previous: {
                    visible: false,
                }
            }
        };
    steps = steps.concat(createStepViewConfig);
    addnewFwPolicyStepViewConfig = $.extend(true, {}, getNewFirewallPolicyViewConfig(model).viewConfig).steps;
    addRulesStepViewConfig = $.extend(true, {}, getAddRulesViewConfig(viewConfig, allData, options).viewConfig).steps;
    steps = steps.concat(addnewFwPolicyStepViewConfig);
    steps = steps.concat(addRulesStepViewConfig);
    addPolicyViewConfig.viewConfig.steps = steps;
    return addPolicyViewConfig;
  }
    function getAddressGroup(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_AS_GLOBAL_LIST_VIEW_ID]),
                view: "fwPolicyWizardASGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_AS_PROJECT_LIST_VIEW_ID]),
                view: "fwPolicyWizardASProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    function getServiceGroup(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_GLOBAL_LIST_VIEW_ID]),
                view: "fwPolicyWizardServiceGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_PROJECT_LIST_VIEW_ID]),
                view: "fwPolicyWizardServiceProjectListview",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    function getTag(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "tagGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/tag/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "tagProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/tag/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    var getApplicationPolicyViewConfig = function () {
        return {
            elementId: ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
            view: 'SectionView',
            title: "Application Policy Set",
           // active:false,
            viewConfig: {
                rows: [{
                        columns: [
                            {
                                elementId: 'review_address_groups',
                                view: "FormButtonView",
                                label: "Review Address Groups",
                                width:300,
                                viewConfig: {
                                    class: 'display-inline-block'
                                }
                            }
                         ]
                      },
                      {
                          columns: [
                              {
                                  elementId: 'review_service_groups',
                                  view: "FormButtonView",
                                  label: "Review Service Groups",
                                  width:300,
                                  viewConfig: {
                                      class: 'display-inline-block'
                                  }
                              }
                           ]
                        },{
                            columns: [
                                {
                                    elementId: 'review_visible_tag_for_project',
                                    view: "FormButtonView",
                                    label: "Review Visible Tag For Project",
                                    width:300,
                                    viewConfig: {
                                        class: 'display-inline-block'
                                    }
                                }
                             ]
                          }
                    ]
               }
          }
     };

    return fwPolicyWizardEditView;
});