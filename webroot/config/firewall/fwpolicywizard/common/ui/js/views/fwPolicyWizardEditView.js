/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
    'config/firewall/common/fwpolicy/ui/js/models/fwRuleCollectionModel',
    'config/firewall/common/tag/ui/js/models/tagModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/overlayTagEditView',
    'knockout'
], function (_, ContrailView, Knockback, FWZUtils, FwPolicyFormatter, FwPolicyWizardModel,RuleModel, TagModel,
        OverlayTagEditView, ko) {
    var gridElId = '#' + ctwc.APPLICATION_POLICY_SET_GRID_ID,
        prefixId = ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
        modalId = 'configure-' + prefixId, firewallPolicyId;
        formId = '#' + modalId + '-form';
        overlayTagEditView = new OverlayTagEditView();
        var self;
    var titleTags = '';
    var fwzUtils = new FWZUtils();
    var fwPolicyFormatter = new FwPolicyFormatter();
    var fwPolicyWizardEditView = ContrailView.extend({
        el: $(contentContainer),
        renderFwWizard: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_APPLICATION_POLICY_SET),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
                self = this;
                if(!options.noResetModal){
                    cowu.createModal({'modalId': modalId, 'className': 'modal-1120',
                        'title': options['title'], 'body': editLayout});
                }
                if(options.title !== undefined){
                    $('.modal-header-title').text(options.title);
                }
                $('#helper').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                $("#overlay-background-id").removeClass("overlay-background");
                self.fetchAllData(self, options,function(allData){
                    self.renderView4Config($("#" + modalId).find('#aps-sub-container'), self.model,
                        getAddPolicyViewConfig(self, options['viewConfig'], allData, options),'policyValidation', null, null,function(){
                            Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_add-new-firewall-policy'));
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_rules'));
                            kbValidation.bind(self);
                            function getAdressGroupClick(e){
                                fwzUtils.viewAdressGroup();
                                e.preventDefault();
                                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                self.renderObject(options, 'address_groups',self.model);
                                return true;
                            }
                            function getServiceGroupClick(e){
                                fwzUtils.viewServiceGroup();
                                e.preventDefault();
                                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                self.renderObject(options, 'service_groups',self.model);
                            }
                            function visibleTagClick(e){
                                fwzUtils.viewTags();
                                e.preventDefault();
                                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                self.renderObject(options,'tag',self.model);
                            }
                            function createTags(e,tagCreate){
                                fwzUtils.viewTags();
                                e.preventDefault();
                                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                self.renderObject(options,'tag-create',tagCreate, self.model);
                            }
                            $("#view-address-group").on('click', function(e) {
                                getAdressGroupClick(e);
                            });
                            $("#view-service-group").on('click', function(e) {
                                getServiceGroupClick(e);
                            });
                            $("#view-visble-tags").on('click', function(e) {
                                visibleTagClick(e);
                            });
                            $(".plus-button").on('click',function(e){
                                createTags(e,'create-tag');
                            });
                            $(".plus-button-endpoints").on('click',function(e){
                                createTags(e,"create-tag-endpoints");
                            });
                            var info = $('<i class="fa fa-info-circle" aria-hidden="true" title="Enter Port format ( Protocol:SrcPort:DstPort or Protocol:DstPort )"></i>');
                            $('#applicationpolicyset_rules table thead tr th:nth-child(2').append(info);
                    },null,false);
                });
                $("#save-aps").off('click').on('click', function(){
                    self.model.addEditApplicationSet({
                        success: function () {
                            options['callback']();
                            $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                            $('#applicationpolicyset_policy_wizard-p-0 .alert-error').hide();
                            $("#" + modalId).modal('hide');
                            options.viewConfig.isWizard = false;
                        },
                        error: function (error) {
                            $('#applicationpolicyset_policy_wizard-p-0 .alert-error span').text('');
                            $('#applicationpolicyset_policy_wizard-p-0 .alert-error span').text(error.responseText);
                            $('#applicationpolicyset_policy_wizard-p-0 .alert-error').show();
                        }
                    }, options, true, undefined);
               });
                $("#aps-cancel-btn").off('click').on('click', function(){
                    Knockback.release(self.model,
                            document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                    $("#" + modalId).modal("hide");
                    options.viewConfig.isWizard = false;
               });
                $("#modal-header-close").off('click').on('click', function(){
                    options['viewConfig'].isWizard = false;
               });
        },
        renderFirewallRule: function(options) {
            var rulePrefixId = 'firepolicyrulelist',
            ruleModalId = 'configure-' + rulePrefixId;
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: rulePrefixId, modalId: ruleModalId});
                self = this;
            cowu.createModal({'modalId': ruleModalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {}, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(ruleModalId));
                kbValidation.unbind(self);
                $("#" + ruleModalId).modal('hide');
            }});
            $('#configure-firepolicyrulelist .modal-footer button:last-child').hide();
                self.renderView4Config($("#" + ruleModalId).find("#" + ruleModalId + "-form"),
                        this.model,
                        getApsFireWallRuleList(options),
                        "",
                        null, null, function() {
                        //Knockback.ko.cleanNode($("#configure-firepolicyrulelist")[0]);
                        //Knockback.applyBindings(self.model, document.getElementById(ruleModalId));
                        kbValidation.bind(self);
                },null,false);
        },
        renderObject: function(options, objName, tagCreate, wizardModel){
            $('#aps-save-button').hide();
            var viewConfig = options['viewConfig'];
            if(objName === 'address_groups'){
                $('#aps-overlay-container').show();
                $('#helper').hide();
                $("#aps-gird-container").empty();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('.modal-header-title').text("Review Address Groups");
                $("#aps-gird-container").append($("<div id='addressgroup-wrapper'></div>"));
                this.renderView4Config($('#addressgroup-wrapper'), null, getAddressGroup(viewConfig,wizardModel));
            }else if(objName === 'service_groups'){
                $('#aps-overlay-container').show();
                $('#helper').hide();
                $("#aps-gird-container").empty();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('.modal-header-title').text("Review Service Groups");
                $("#aps-gird-container").append($("<div id='servicegroup-wrapper'></div>"));
                this.renderView4Config($('#servicegroup-wrapper'), null, getServiceGroup(viewConfig,wizardModel));
            }else if(objName === 'tag'){
                $('#aps-overlay-container').show();
                $('#helper').hide();
                $("#aps-gird-container").empty();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                if(options.viewConfig.isGlobal === false){
                    $('.modal-header-title').text("Review Visible Tags For Project");
                }
                else{
                    $('.modal-header-title').text("Review visible Tags");
                }
                $("#aps-gird-container").append($("<div id='tag-wrapper'></div>"));
                this.renderView4Config($('#tag-wrapper'), null, getTag(viewConfig,wizardModel));
            }
            else if(objName === 'tag-create'){
                $('#aps-overlay-container').show();
                $('#helper').hide();
                $('#app-tag-create-container').hide();
                $("#aps-gird-container").empty();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                if(options.viewConfig.isGlobal === false){
                    $('.modal-header-title').text("Review Visible Tags For Project");
                }
                else{
                    $('.modal-header-title').text("Review visible Tags");
                }
                overlayTagEditView.model = new TagModel();
                overlayTagEditView.renderTag({
                          'mode': 'add',
                          'viewConfig': viewConfig,
                          'isGlobal': viewConfig.isGlobal,
                          viewConfig: $.extend(true, {}, viewConfig, { wizardModel: wizardModel}),
                          'createTag' : true,
                          'tagCreate' :tagCreate
                });
                //$("#aps-gird-container").append($("<div id='tag-wrapper'></div>"));
                //this.renderView4Config($('#tag-wrapper'), null, getTag(viewConfig,wizardModel));
            }
         },
         fetchAllData : function(self, options, callback) {
             var getAjaxs = [];
             var data;
             var selectedDomain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
             var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
             var serviceGrp = {data: [{type: 'service-groups'}]};
             if(options.viewConfig.isGlobal == true){
                 data = JSON.stringify({data: [{type: "firewall-policys",
                     fields: ['application_policy_set_back_refs'],
                     parent_fq_name_str: "default-policy-management",
                     parent_type: "policy-management"}]})
             }
             else{
                 data = JSON.stringify(
                         {data: [{type: 'firewall-policys',
                             fields: ['application_policy_set_back_refs'],
                             parent_id: options.viewConfig["projectSelectedValueData"].value}]})
             }
             getAjaxs[0] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data:data,
             });
             getAjaxs[1] = $.ajax({
                 url:"/api/tenants/config/virtual-networks",
                 type:"GET"
             });
             //get tags
             getAjaxs[2] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data:JSON.stringify(
                         {data: [{type: 'tags'}]}),
             });

             //get address groups
             getAjaxs[3] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data: JSON.stringify(
                         {data: [{type: 'address-groups'}]})
             });

             //get service groups
             getAjaxs[4] = $.ajax({
                 url:"/api/tenants/config/get-config-details",
                 type:"POST",
                 dataType: "json",
                 contentType: "application/json; charset=utf-8",
                 data: JSON.stringify(serviceGrp)
             });

             //get SLO
             getAjaxs[5] = $.ajax({
               url: ctwc.URL_GET_CONFIG_DETAILS,
               type:"POST",
               dataType: "json",
               contentType: "application/json; charset=utf-8",
               data: JSON.stringify({data: [{type: "security-logging-objects"}]})
             });
             $.when.apply($, getAjaxs).then(
                 function () {
                     //all success
                     var returnArr = [];
                     var count = 0;
                     var countNobackRefsArray = [];
                     var results = arguments;
                     var fwPolicies = results[0][0][0]["firewall-policys"];
                     returnArr['fwPolicies-len'] = fwPolicies.length;
                     if(results[0][0][0]["firewall-policys"]){
                         firewallPolicyrefs = results[0][0][0]["firewall-policys"];
                         _.each(firewallPolicyrefs, function(val){
                                 var appPolicyBackRefsArray = getValueByJsonPath(val, "firewall-policy;application_policy_set_back_refs", []);
                                 if(appPolicyBackRefsArray.length === 0){
                                     countNobackRefsArray.push(count++);
                                 }
                         });
                     }
                     returnArr['standAlonePolicies-len'] = countNobackRefsArray.length;
                     var vns = results[1][0]["virtual-networks"];
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
                     var applicationTagList = fwPolicyFormatter.filterApplicationTagList(getValueByJsonPath(results, '2;0;0;tags', [], false), options.viewConfig.isGlobal);
                     self.model.dataSource(applicationTagList);
                     //tags
                     var tags = fwPolicyFormatter.filterTagsByProjects(getValueByJsonPath(results, '2;0;0;tags', [], false), options.viewConfig.isGlobal);
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
                     var addressGroups = fwPolicyFormatter.filterAddressGroupByProjects(getValueByJsonPath(results, '3;0;0;address-groups', [], false), options.viewConfig.isGlobal);
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
                     var secGrpList = fwPolicyFormatter.filterServiceGroupByProjects(getValueByJsonPath(results, '4;0;0;service-groups', [], false), options.viewConfig.isGlobal);
                     var serviceGrpList = [];
                     $.each(secGrpList, function (i, obj) {
                         var obj = obj['service-group'];
                         if(options.viewConfig.isGlobal){
                             serviceGrpList.push({value: obj.uuid, fq_name : obj.fq_name, text: obj.name});
                         }else{
                             if(obj.fq_name.length < 3){
                                var name = 'global:' + obj.name;
                                serviceGrpList.push({value: obj.uuid, fq_name : obj.fq_name, text: name});
                             }else{
                                serviceGrpList.push({value: obj.uuid, fq_name : obj.fq_name, text: obj.name});
                             }
                         }
                      });
                     returnArr["serviceGrpList"] = serviceGrpList;
                     var sloObj = fwPolicyFormatter.filterSloByProjects(getValueByJsonPath(results, '5;0;0;security-logging-objects', [], false), options.viewConfig.isGlobal);
                     var sloList = [];
                     _.each(sloObj, function(obj) {
                         if("security-logging-object" in obj) {
                             var slo = obj["security-logging-object"];
                             var fqName = slo.fq_name;
                             if(options.viewConfig.isGlobal){
                                 sloList.push({id: fqName.join(':'), text: fqName[fqName.length - 1]});
                             }else{
                                 if(fqName[0] === 'default-global-system-config'){
                                     var name = 'global:' + fqName[fqName.length - 1];
                                     sloList.push({id: fqName.join(':'), text: name});
                                 }else{
                                    sloList.push({id: fqName.join(':'), text: fqName[fqName.length - 1]});
                                 }
                             }
                         }
                     });
                     returnArr["sloList"] = sloList;
                     callback(returnArr);
                 }
             )
         }
    });
    function getApsFireWallRuleList(options) {
        return {
            elementId: "aps_fw_policy_rule_list",
            view: 'SectionView',
            viewConfig: {
                rows: [{
                    columns: [
                        {
                            elementId: "aps-fw-policy-rule-list-grid-id",
                            view: "fwApsRuleListView",
                            viewPathPrefix:
                                "config/firewall/fwpolicywizard/project/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: $.extend(true, {},{
                                uuidList: options.uuidList,
                                isGlobal: options.isGlobal,
                                projectSelectedValueData:options.projectSelectedValueData
                            })
                        }
                    ]
                }]
            }
        }
    }
    function getPolicyRelatedRules(uuid, callback){
        var getAjaxs = [];
        getAjaxs[0] = $.ajax({
            url:"/api/tenants/config/get-config-details",
            type:"POST",
            dataType: "json",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(
                    {data: [{type: 'firewall-policys', obj_uuids:[uuid]},
                        {type: 'firewall-rules',
                    fields: ['firewall_policy_back_refs']}]})
        });
        $.when.apply($, getAjaxs).then(
                function () {
                var results = arguments[0];
                var currentPolicyRuleIds = getFWRuleIds(getValueByJsonPath(results,
                        "0;firewall-policys;0;firewall-policy", {}, false)),
              dataItems = [],
              rulesData = getValueByJsonPath(results,
                      "1;firewall-rules", [], false);
              _.each(rulesData, function(rule){
                      var currentRuleID = getValueByJsonPath(rule,
                              'firewall-rule;uuid', '', false);
                      if($.inArray(currentRuleID,
                              currentPolicyRuleIds) !== -1) {
                          dataItems.push(rule['firewall-rule']);
                      }
              });
              return callback(dataItems.sort(ruleComparator));    
        });
    }
    function ruleComparator (a,b) {
        // get the sequence for each and compare
        if(Number(sequenceFormatter(null,null,null,null,a)) >
                Number(sequenceFormatter(null,null,null,null,b))) {
            return 1;
        } else {
            return -1;
        }
    }
    function sequenceFormatter(r, c, v, cd, dc) {
        var sequence = '', policies = getValueByJsonPath(dc,
            "firewall_policy_back_refs", [], false),
            policyId = firewallPolicyId;

        for(var i = 0; i < policies.length; i++) {
            if(policies[i].uuid === policyId) {
                sequence = getValueByJsonPath(policies[i],
                        'attr;sequence', '', false);
                break;
            }
        }
        return sequence ? sequence : (cd ? '-' : '');
    };
    function getFWRuleIds(dc) {
        var ruleIds = [],
             rules = getValueByJsonPath(dc, 'firewall_rule_refs', [], false);
        _.each(rules, function(rule){
            ruleIds.push(rule.uuid);
        });
        return ruleIds;
    }
    function getNewFirewallPolicyViewConfig(model, viewConfig, allData, policyPreviousBtn) {
        var isPolicyDisable = false;
        if(viewConfig.wizardMode === 'policy' && viewConfig.mode === 'edit'){
            isPolicyDisable = true;
        }
        var gridPrefix = "add-firewall-policy",
            addNewFwPolicyViewConfig = {
            elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy1"]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy"]),
                        title: "Add Firewall Policy",
                        view: "AccordianView",
                        viewConfig: fwzUtils.getFirewallPolicyViewConfig(prefixId, allData, isPolicyDisable),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            next: {
                                visible: true,
                                label: "Next"
                            },
                            previous: {
                                visible: policyPreviousBtn,
                                label: "Back"
                            }
                        },
                        onNext: function(params) {
                            if(params.model.policy_name() !== ''){
                                var modalHeader;
                                if(Object.keys(newApplicationSet).length > 0){
                                  modalHeader = newApplicationSet.name + ' > ' + params.model.policy_name() + ' > New Rules';
                                  if(newApplicationSet.mode === 'add' || newApplicationSet.mode === 'edit'){
                                      params.model.firewall_rules(new Backbone.Collection([]));
                                  }
                                } else {
                                  if(viewConfig.mode === 'add'){
                                      params.model.firewall_rules(new Backbone.Collection([]));
                                      modalHeader = params.model.policy_name() + ' > New Rules'; 
                                  }else{
                                      modalHeader = params.model.policy_name() + ' > Existing Rules';
                                      /*TO DO** Need to move into model*/
                                      if(params.model.firewall_rule_refs != undefined && params.model.firewall_rule_refs().length > 0){
                                          firewallPolicyId = params.model.uuid();
                                          getPolicyRelatedRules(params.model.uuid(), function(policyRule){
                                              var ruleCollection = [];
                                              for(var i = 0; i < policyRule.length; i++){
                                                  var ruleModel = new RuleModel($.extend({}, policyRule[i], { disabled: false, isGlobal: viewConfig.isGlobal }));
                                                  ruleCollection.push(ruleModel);
                                              }
                                              var coll = new Backbone.Collection(ruleCollection);
                                              params.model.firewall_rules([]);
                                              params.model.firewall_rules(coll);
                                         });
                                      }
                                  }  
                                }
                                $('.modal-header-title').text('');
                                $('.modal-header-title').text(modalHeader);
                                if(viewConfig.wizardMode === 'policy'){
                                    $('#applicationpolicyset_policy_wizard-p-0 .alert-error span').text('');
                                    $('#applicationpolicyset_policy_wizard-p-0 .alert-error').hide();
                                }else{
                                    $('#applicationpolicyset_policy_wizard-p-1 .alert-error span').text('');
                                    $('#applicationpolicyset_policy_wizard-p-1 .alert-error').hide();
                                    $('#applicationpolicyset_policy_wizard .actions > ul li:nth-child(3) a').text('Save Policy');
                                }
                                return true;
                            } else {
                                if(viewConfig.wizardMode === 'policy'){
                                    $('#applicationpolicyset_policy_wizard-p-0 .alert-error span').text('Please enter the Policy Name.');
                                    $('#applicationpolicyset_policy_wizard-p-0 .alert-error').show();
                                }else{
                                    $('#applicationpolicyset_policy_wizard-p-1 .alert-error span').text('Please enter the Policy Name.');
                                    $('#applicationpolicyset_policy_wizard-p-1 .alert-error').show();
                                }
                            }
                        },
                        onPrevious: function(params) {
                            $('#applicationpolicyset_policy_wizard-p-1 .alert-error').hide();
                            $('#applicationpolicyset_policy_wizard .actions').css("display", "none");
                            params.model.onNext(false);
                            if(Object.keys(newApplicationSet).length > 0){
                                $('.modal-header-title').text('');
                                if(newApplicationSet.mode === 'add'){
                                    $('.modal-header-title').text(ctwl.TITLE_CREATE_APP_POLICY_SET);
                                }
                                if(newApplicationSet.mode === 'edit'){
                                    $('.modal-header-title').text('Edit Application Policy Set');
                                }
                                $('#aps-save-btn-container').show();
                            }
                            return true;
                        }
                    }
                ]
            }
        };
        return addNewFwPolicyViewConfig;
    }
    function getAddRulesViewConfig(viewConfig, allData, options, self) {
        var gridPrefix = "add-rules",policySet = {},
        addRulesViewConfig = {
            elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
                        title: "Add Firewall Rules",
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
                            if(viewConfig.wizardMode === 'policy'){
                                policySet.mode =  viewConfig.mode; 
                                if(viewConfig.mode === 'edit'){
                                   policySet.model = viewConfig.model;
                                }
                            }
                            return params.model.addEditApplicationSet({
                                success: function (obj) {
                                   if(viewConfig.wizardMode === 'aps'){
                                        require(['config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
                                            'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizardEditView'],
                                            function (FWPolicyWizardModel, FWPolicyWizardEditView) {
                                                var fwPolicyWizardModel =  new FWPolicyWizardModel(newApplicationSet),
                                                    fwPolicyWizardEditView = new FWPolicyWizardEditView(), apsTitle;
                                                if(options.viewConfig.mode === 'add'){
                                                    apsTitle = 'Add Application Policy Set';
                                                }else{
                                                    apsTitle = 'Edit Application Policy Set';
                                                }
                                                if($('#fw-policy-grid').data("contrailGrid") !== undefined){
                                                    $('#fw-policy-grid').data("contrailGrid")._dataView.refreshData();
                                                }
                                                options.seletedRows =  newApplicationSet.existingRows;
                                                if(newApplicationSet.insert === 'above'){
                                                    options.seletedRows.splice(newApplicationSet.currentIndex, 0, obj);
                                                }else if(newApplicationSet.insert === 'below'){
                                                    options.seletedRows.splice(newApplicationSet.currentIndex + 1, 0, obj);
                                                }else if(newApplicationSet.insert === 'top'){
                                                    options.seletedRows.splice(0, 0, obj);
                                                }else if(newApplicationSet.insert === 'end'){
                                                    options.seletedRows.push(obj);
                                                }else{
                                                    options.seletedRows.push(obj);
                                                }
                                                var policyList = [];
                                                for(var i = 0; i < options.seletedRows.length; i++){
                                                    policyList.push(options.seletedRows[i]);
                                                }
                                                options.seletedRows = policyList;
                                                options.viewConfig.seletedRows = options.seletedRows;
                                                fwPolicyWizardEditView.model = fwPolicyWizardModel;
                                                fwPolicyWizardEditView.renderFwWizard({
                                                    'mode': options.viewConfig.mode,
                                                    "title": apsTitle,
                                                    'isGlobal': options.viewConfig.isGlobal,
                                                    'viewConfig': options.viewConfig,
                                                    'seletedRows': options.seletedRows,
                                                    'isWizard': options.viewConfig.isWizard,
                                                     'noResetModal': true,
                                                     callback: function () {
                                                         $('#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID).data("contrailGrid")._dataView.refreshData();}
                                                });
                                                $('#aps-save-btn-container').show();
                                        });
                                        $('#applicationpolicyset_policy_wizard-p-2 .alert-error').hide();
                                    }else{
                                        if($('#fw-policy-grid').data("contrailGrid") !== undefined){
                                            $('#fw-policy-grid').data("contrailGrid")._dataView.refreshData();
                                        }
                                        $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                                        $('#applicationpolicyset_policy_wizard-p-1 .alert-error').hide();
                                        $("#" + modalId).modal('hide');
                                        options.viewConfig.isWizard = false;
                                    }
                                },
                                error: function (error) {
                                    if(viewConfig.wizardMode === 'policy'){
                                        $('#applicationpolicyset_policy_wizard-p-1 .alert-error span').text('');
                                        $('#applicationpolicyset_policy_wizard-p-1 .alert-error span').text(error.responseText);
                                        $('#applicationpolicyset_policy_wizard-p-1 .alert-error').show();
                                    }else{
                                        $('#applicationpolicyset_policy_wizard-p-2 .alert-error span').text('');
                                        $('#applicationpolicyset_policy_wizard-p-2 .alert-error span').text(error.responseText);
                                        $('#applicationpolicyset_policy_wizard-p-2 .alert-error').show(); 
                                    }
                                }
                            }, options, false, allData.serviceGrpList, policySet);
                        },
                        onPrevious: function(params) {
                            var modalHeader;
                            if(viewConfig.wizardMode === 'policy'){
                                $('#applicationpolicyset_policy_wizard-p-0 .alert-error').hide();
                            }else{
                                $('#applicationpolicyset_policy_wizard-p-1 .alert-error').hide();
                            }
                            if(Object.keys(newApplicationSet).length > 0){
                              modalHeader =  newApplicationSet.name + ' > New Policy';
                            }else{
                              modalHeader = 'Create Firewall Policy';
                            }
                            $('.modal-header-title').text('');
                            $('.modal-header-title').text(modalHeader);
                            return true;
                        }
                    }
                ]
            }
        };
        return addRulesViewConfig;
    }
    function getAddPolicyViewConfig(self, viewConfig, allData, options) {
        var addPolicyViewConfig = {
            elementId: cowu.formatElementId([prefixId, 'policy_wizard']),
            view: "WizardView",
            viewConfig: {
                steps: []
            }
        }, model = self.model;
        steps = [];
        createStepViewConfig = null;
        addnewFwPolicyStepViewConfig = null;
        addRulesStepViewConfig = null;
        var policyPreviousBtn = false;
        if(viewConfig.wizardMode === 'aps'){
            policyPreviousBtn = true;
            delete viewConfig.isTab;
            createStepViewConfig = {
                    elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
                    view: "SectionView",
                    viewConfig: {
                        rows: [
                            {
                                columns: [
                                    {
                                        elementId:
                                            cowu.formatElementId([ctwc.CREATE_NEW_APPLICATION_POLICY_SET_VIEW_ID]),
                                        view: "fwApplicationPolicyEditView",
                                        app: cowc.APP_CONTRAIL_CONTROLLER,
                                        viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                        viewConfig: $.extend(true, {}, viewConfig, { mode: options.mode },{ policy: options.policy },{ seletedRows : options.seletedRows },
                                                             { projectSelectedValueData: viewConfig.projectSelectedValueData },
                                                             { idList: ctwc.ASSOCIATED_POLICY_GRID_ID })
                                    }
                                ]
                            }
                        ]
                    },
                    title: "Policy Set",
                    stepType: "step",
                    onNext: function (params) {
                        if(params.model.name() === ''){
                              $('#applicationpolicyset_policy_wizard-p-0 .alert-error span').text('Enter Application Policy set name');
                              $('#applicationpolicyset_policy_wizard-p-0 .alert-error').show();
                              $('#aps-save-btn-container').show();
                              return false;
                        }
                        if(params.model.policy_name() != ''){
                              params.model.policy_name('');
                        }
                        if(params.model.policy_description() != ''){
                             params.model.policy_description('');
                        }
                        if(params.model.security_logging_object_refs() != ''){
                             params.model.security_logging_object_refs([]);
                        }
                        $('#applicationpolicyset_policy_wizard .alert-error').hide();
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
        }
        if(!policyPreviousBtn){
            $('#aps-save-btn-container').hide();
            $('#applicationpolicyset_policy_wizard .actions').css("display", "block");
        }
        addnewFwPolicyStepViewConfig = $.extend(true, {}, getNewFirewallPolicyViewConfig(model, viewConfig, allData, policyPreviousBtn).viewConfig).steps;
        addRulesStepViewConfig = $.extend(true, {}, getAddRulesViewConfig(viewConfig, allData, options, self).viewConfig).steps;
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
                view: "addressGroupGlobalListView",
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_AS_PROJECT_LIST_VIEW_ID]),
                view: "addressGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/addressgroup/ui/js/views/",
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
                view: "serviceGroupGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/firewall/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.FW_WZ_SECURITY_POLICY_SG_PROJECT_LIST_VIEW_ID]),
                view: "serviceGroupProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
            };
        }
    }
    function getTag(viewConfig,wizardModel){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "tagGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/tag/ui/js/views/",
                viewConfig: $.extend(viewConfig, {wizardModel: wizardModel})
            };
        } else {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "tagProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/tag/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData: viewConfig.projectSelectedValueData, wizardModel: wizardModel})
            };
        }
    }
    return fwPolicyWizardEditView;
});