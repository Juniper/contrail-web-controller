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
    'config/firewall/fwpolicywizard/common/ui/js/views/fwApplicationPolicyEditView',
    'config/firewall/common/fwpolicy/ui/js/models/fwRuleCollectionModel',
    'knockout'
], function (_, ContrailView, Knockback, FWZUtils, FwPolicyFormatter, FwPolicyWizardModel,
        FwApplicationPolicyEditView, RuleModel, ko) {
    var gridElId = '#' + ctwc.APPLICATION_POLICY_SET_GRID_ID,
        prefixId = ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';
        var self;
    var fwApplicationPolicyEditView = new FwApplicationPolicyEditView();
    var titleTags = '';
    var fwzUtils = new FWZUtils();
    var fwPolicyFormatter = new FwPolicyFormatter();
    var fwPolicyWizardEditView = ContrailView.extend({
        renderFwWizard: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_APPLICATION_POLICY_SET),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
                self = this;
                policyEditSet = {};
                newModel = self.model
            cowu.createModal({'modalId': modalId, 'className': 'modal-1120',
                             'title': options['title'], 'body': editLayout});
                $('.modal-header-title').text("Firewall Policy Wizard");
                //$('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                self.fetchAllData(self, options, function(allData){
                    self.renderView4Config($("#" + modalId).find('#aps-sub-container'), self.model,
                        getAddPolicyViewConfig(self, options['viewConfig'], allData, options),'policyValidation', null, null,function(){
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_add-new-firewall-policy'));
                            if(Object.keys(policyEditSet).length > 0){
                                if(policyEditSet.mode === 'edit'){
                                    $("#policy_name input").attr('disabled','disabled'); 
                                }
                            }
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_rules'));
                            kbValidation.bind(self);
                    },null,false);
                });
            /*self.renderView4Config($("#" + modalId).find('#aps-button-container'),
                                   this.model,
                                   getApplicationPolicyViewConfig(options), "",
                                   null, null, function() {
                    $("#" + modalId).find('.modal-footer').hide();
                    function getAdressGroupClick(e){
                        fwzUtils.viewAdressGroup();
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        self.renderObject(options, 'address_groups');
                        return true;
                    }
                    function getServiceGroupClick(e){
                        fwzUtils.viewServiceGroup();
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        self.renderObject(options, 'service_groups');
                    }
                    function visibleTagClick(e){
                        fwzUtils.viewTags();
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        self.renderObject(options, 'tag');
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
                    $("#create-firewall-policy").on('click',function(e){
                        e.preventDefault();
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        fwzUtils.viewApplicationPolicySet();
                        self.renderObject(options, 'addIcon', self);
                    });
                    $("#aps-plus-icon").on('click', function(){
                        fwzUtils.viewApplicationPolicySet();
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
                        fwzUtils.backButtonClick();
                    });
                    $("#aps-main-back-button").on('click', function(){
                        $('.modal-header-title').text("Firewall Policy Wizard");
                        fwzUtils.backButtonClick();
                    });
                    $("#aps-create-fwpolicy-remove-icon").on('click', function(){
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $('#aps-overlay-container').hide();
                        $("#overlay-background-id").removeClass("overlay-background");
                    });
                    $("#aps-remove-icon").on('click', function(){
                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                        $("#overlay-background-id").removeClass("overlay-background");
                        fwzUtils.backButtonClick();
                    })
            },null,false);*/
        },
        /*renderObject: function(options, objName, self){
            //$('#modal-landing-container').hide();
            $('#aps-save-button').hide();
            //$('#aps-landing-container').show();
            //var placeHolder = $('#aps-gird-container');
            var viewConfig = options['viewConfig'];
            if(objName === 'address_groups'){
                $('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                $('.modal-header-title').text("Review Address Groups");
                this.renderView4Config($('#aps-sub-container'), null, getAddressGroup(viewConfig));
            }else if(objName === 'service_groups'){
                $('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                $('.modal-header-title').text("Review Service Groups");
                this.renderView4Config($('#aps-sub-container'), null, getServiceGroup(viewConfig));
            }else if(objName === 'tag'){
                $('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                if(options.viewConfig.isGlobal === false){
                    $('.modal-header-title').text("Review Visible Tags For Project");
                }
                else{
                    $('.modal-header-title').text("Review visible Tags");
                }
                this.renderView4Config($('#aps-sub-container'), null, getTag(viewConfig));
            }else if(objName === 'addIcon'){
                $('.modal-header-title').text("Firewall Policy Wizard");
                //$('#aps-main-container').show();
                $('#aps-create-fwpolicy-remove-icon').show();
                $('#aps-remove-icon').hide();
                $('#aps-overlay-container').hide();
                //isBinding = false;
                self.fetchAllData(self, options, function(allData){
                    self.renderView4Config($('#aps-sub-container'), self.model, getAddPolicyViewConfig(self, viewConfig, allData, options),'policyValidation', null, null,function(){
                        //if (isBinding) {
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_add-new-firewall-policy'));
                            if(Object.keys(policyEditSet).length > 0){
                                if(policyEditSet.mode === 'edit'){
                                    $("#policy_name input").attr('disabled','disabled'); 
                                }
                            }
                        //}
                        //if(isBinding){
                            Knockback.applyBindings(self.model, document.getElementById('applicationpolicyset_rules'));
                            kbValidation.bind(self);
                        //}
                    });
                });
            }
         },*/
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
                     //getValueByJsonPath(response, "0;firewall-policys", [])
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
    
    function getPolicyRelatedRules(model, callback){
        var getAjaxs = [];
        getAjaxs[0] = $.ajax({
            url:"/api/tenants/config/get-config-details",
            type:"POST",
            dataType: "json",
            async: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(
                    {data: [{type: 'firewall-policys', obj_uuids:[model.uuid]},
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
            policyId = policyEditSet.uuid;

        for(var i = 0; i < policies.length; i++) {
            if(policies[i].uuid === policyId) {
                sequence = getValueByJsonPath(policies[i],
                        'attr;sequence', '', false);
                break;
            }
        }
        return sequence ? sequence : (cd ? '-' : '');
    };
    Knockback.ko.utils.clone = function (obj) {
        var target = new obj.constructor();
        for (var prop in obj) {
            var propVal = obj[prop];
            if (ko.isObservable(propVal)) {
                var val = propVal();
                if ($.type(val) == 'object') {
                    target[prop] = ko.utils.clone(val);
                    continue;
                }
                target[prop](val);
            }
        }
        return target;
    };
    function getFWRuleIds(dc) {
        var ruleIds = [],
             rules = getValueByJsonPath(dc, 'firewall_rule_refs', [], false);
        _.each(rules, function(rule){
            ruleIds.push(rule.uuid);
        });
        return ruleIds;
    }
    function getNewFirewallPolicyViewConfig(model, viewConfig, allData) {
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
                        viewConfig: fwzUtils.getFirewallPolicyViewConfig(prefixId, allData),
                        stepType: "step",
                        onInitRender: true,
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
                            if(params.model.policy_name() !== ''){
                                var modalHeader;
                                if(Object.keys(newApplicationSet).length > 0){
                                  modalHeader = ctwc.APS_MODAL_HEADER + ' > '+ newApplicationSet.name + ' > ' + params.model.policy_name();
                                } else {
                                  modalHeader = ctwc.APS_MODAL_HEADER + ' > '+ params.model.policy_name();
                                }
                                $('.modal-header-title').text('');
                                $('.modal-header-title').text(modalHeader);
                                $('#applicationpolicyset_policy_wizard .alert-error span').text('');
                                $('#applicationpolicyset_policy_wizard .alert-error').hide();
                                return true;
                            } else {
                                $('#applicationpolicyset_policy_wizard .alert-error span').text('Please enter the Policy Name.');
                                $('#applicationpolicyset_policy_wizard .alert-error').show();
                            }
                        },
                        onPrevious: function(params) {
                            $('#applicationpolicyset_policy_wizard .alert-error').hide();
                            $("#aps-main-back-button").show();
                            $('#applicationpolicyset_policy_wizard .actions').css("display", "none");
                            params.model.onNext(false);
                            if(Object.keys(newApplicationSet).length > 0){
                                if(newApplicationSet.mode === 'add'){
                                    fwzUtils.createApplicationPolicySet();
                                    var policy = newApplicationSet.existingRows;
                                    fwApplicationPolicyEditView.model = new FwPolicyWizardModel(newApplicationSet);
                                    fwApplicationPolicyEditView.renderApplicationPolicy({
                                                              'viewConfig': $.extend({mode:'add'}, viewConfig),
                                                              'policy': policy
                                    });
                                }else if(newApplicationSet.mode === 'edit'){
                                    var policy = newApplicationSet.existingRows;
                                    var apsName = newApplicationSet.name;
                                    fwApplicationPolicyEditView.model = new FwPolicyWizardModel(newApplicationSet);
                                    fwApplicationPolicyEditView.renderApplicationPolicy({
                                                              'viewConfig': $.extend({mode:'edit'}, viewConfig),
                                                              'policy': policy,
                                                              'apsName':apsName
                                    });
                                } 
                            }
                            if(Object.keys(policyEditSet).length > 0){
                                if(policyEditSet.mode === 'edit'){
                                    $("#policy_name input").removeAttr('disabled');
                                }
                                Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                if(policyEditSet.state === 'grid_firewall_policies'){
                                    fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                                    fwApplicationPolicyEditView.renderApplicationPolicy({
                                        'viewConfig': $.extend({mode:'grid_firewall_policies',isGlobal:viewConfig.isGlobal}, viewConfig)
                                    });
                                    policyEditSet = {};
                                }else if(policyEditSet.state === 'grid_stand_alone'){
                                    fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                                    fwApplicationPolicyEditView.renderApplicationPolicy({
                                                              'viewConfig': $.extend({mode:'grid_stand_alone',isGlobal:viewConfig.isGlobal}, viewConfig)
                                    });
                                    policyEditSet = {};
                                }
                                $("#overlay-background-id").addClass("overlay-background");
                            }
                            $('.modal-header-title').text('');
                            $('.modal-header-title').text(ctwc.APS_MODAL_HEADER);
                            return true;
                        }
                    }
                ]
            }
        };
        return addNewFwPolicyViewConfig;
    }
    function getAddRulesViewConfig(viewConfig, allData, options, self) {
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
                                    if($('#fw-policy-grid').data("contrailGrid") !== undefined){
                                        $('#fw-policy-grid').data("contrailGrid")._dataView.refreshData();
                                    }
                                    if($('#firewall-application-policy-grid').data("contrailGrid") !== undefined){
                                        $('#firewall-application-policy-grid').data("contrailGrid")._dataView.refreshData();
                                    }
                                    if(Object.keys(policyEditSet).length > 0){
                                        self.renderObject(options, 'addIcon', self);
                                        Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                        if(policyEditSet.state === 'grid_firewall_policies'){
                                            fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                                            fwApplicationPolicyEditView.renderApplicationPolicy({
                                                'viewConfig': $.extend({mode:'grid_firewall_policies',isGlobal:viewConfig.isGlobal}, viewConfig)
                                            });
                                            policyEditSet = {};
                                        }else if(policyEditSet.state === 'grid_stand_alone'){
                                            fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                                            fwApplicationPolicyEditView.renderApplicationPolicy({
                                                                      'viewConfig': $.extend({mode:'grid_stand_alone',isGlobal:viewConfig.isGlobal}, viewConfig)
                                            });
                                            policyEditSet = {};
                                        }
                                        $("#overlay-background-id").addClass("overlay-background");
                                    }else{
                                       self.renderObject(options, 'addIcon', self);  
                                    }
                                    $('.modal-header-title').text('');
                                    $('.modal-header-title').text(ctwc.APS_MODAL_HEADER);
                                    $("#aps-main-back-button").show();
                                },
                                error: function (error) {
                                    $('#applicationpolicyset_policy_wizard .alert-error span').text(error.responseText);
                                    $('#applicationpolicyset_policy_wizard .alert-error').show();
                                }
                            }, options, false, allData.serviceGrpList, policyEditSet);
                        },
                        onPrevious: function(params) {
                            var modalHeader;
                            $('#applicationpolicyset_policy_wizard .alert-error').hide();
                            if(Object.keys(newApplicationSet).length > 0){
                              modalHeader = ctwc.APS_MODAL_HEADER + ' > '+ newApplicationSet.name;
                            }else{
                              modalHeader = ctwc.APS_MODAL_HEADER;
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
    createStepViewConfig = {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'top_bar_id',
                                view: 'fwWizardTxtValContainerView',
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                viewConfig: {
                                    firewallPolicyLen : allData['fwPolicies-len'],
                                    standAlonePolicyLen : allData['standAlonePolicies-len'],
                                    isGlobal:viewConfig.isGlobal,
                                    projectSelectedValueData:viewConfig.projectSelectedValueData
                                }
                            }
                        ]
                    },
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
            onNext: function (params) {
                if(params.model.policy_name() != ''){
                    params.model.policy_name('');
                }
                if(params.model.policy_description() != ''){
                    params.model.policy_description('');
                }
                $('#applicationpolicyset_policy_wizard .alert-error').hide();
                if(Object.keys(policyEditSet).length > 0){
                    if(policyEditSet.mode === 'edit'){
                        params.model.policy_name(policyEditSet.model.name);
                        if(policyEditSet.model.id_perms.description != null){
                            params.model.policy_description(policyEditSet.model.id_perms.description);
                        }
                        var slo = policyEditSet.model.security_logging_object_refs, sloList = [];
                        if(slo !== undefined && slo.length > 0){
                            _.each(slo, function(obj) {
                                sloList.push(obj.to.join(':'));
                            });
                            var updatedSloList = sloList.join(';');
                            params.model.security_logging_object_refs(updatedSloList);
                        }
                        if(policyEditSet.model.firewall_rule_refs != undefined && policyEditSet.model.firewall_rule_refs.length > 0){
                            getPolicyRelatedRules(policyEditSet.model, function(policyRule){
                                var ruleCollection = [];
                                for(var i = 0; i < policyRule.length; i++){
                                    var ruleModel = new RuleModel($.extend({}, policyRule[i], { disabled: false, isGlobal: options.viewConfig.isGlobal }));
                                    ruleCollection.push(ruleModel);
                                }
                                var coll = new Backbone.Collection(ruleCollection);
                                params.model.firewall_rules([]);
                                params.model.firewall_rules(coll);
                           });
                        } else {
                            params.model.firewall_rules(new Backbone.Collection([]));
                        }
                        if($("#policy_name input").length == 1){
                           $("#policy_name input").attr('disabled','disabled');
                        }
                    }else{
                        params.model.firewall_rules(new Backbone.Collection([]));
                    }
                }
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
    addnewFwPolicyStepViewConfig = $.extend(true, {}, getNewFirewallPolicyViewConfig(model, viewConfig, allData).viewConfig).steps;
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
    /*var getApplicationPolicyViewConfig = function (options) {
        if(options.viewConfig.isGlobal === true){
            titleTags = "Review Visible Tags";
        }
        else if(options.viewConfig.isGlobal === false){
            titleTags = "Review Visible Tags For Project";
        }
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
                                width:300,
                                viewConfig: {
                                    label: "Review Address Groups",
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
                                  width:300,
                                  viewConfig: {
                                      label: "Review Service Groups",
                                      class: 'display-inline-block'
                                  }
                              }
                           ]
                        },{
                            columns: [
                                {
                                    elementId: 'review_visible_tag_for_project',
                                    view: "FormButtonView",
                                    width:300,
                                    viewConfig: {
                                        label: titleTags,
                                        class: 'display-inline-block'
                                    }
                                }
                             ]
                          }
                    ]
               }
          }
     };*/

    return fwPolicyWizardEditView;
});