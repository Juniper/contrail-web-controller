/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/policy/ui/js/views/policyFormatters'
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             PolicyFormatters) {
    var policyFormatters = new PolicyFormatters();
    var prefixId = ctwl.POLICY_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        externalGatewayDS = [],
        self = {};

    var PolicyCreateEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderPolicyPopup: function (options) {
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                self.model.configurePolicy(options['mode'],
                {
                    init: function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(
                                       prefixId + cowc.FORM_SUFFIX_ID,
                                       error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

           this.fetchAllData(this ,
                function(allData) {
                   self.model.setServiceTemplateDataSource(allData.service_instances_ref);
                   var disableElement = false
                   if(options['mode'] == "edit") {
                       disableElement = true;
                   }
                   self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getConfigureViewConfig
                        (disableElement, allData),
                        'policyValidations', null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                            cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                            kbValidation.bind(self,{collection:
                                  self.model.model().attributes.PolicyRules});
                   });
                   return;
               }
           );
        },
        renderDeletePolicy: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deletePoliciesID';
            var items = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    selectedGridData[i]["name"];
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TXT_POLICY,
                                        itemId: items})
            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deletePolicy(selectedGridData, {
                    init: function () {
                        self.model.showErrorAttr(elId, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(elId, error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        fetchAllData : function(self, callback) {
            var getAjaxs = [];
            var selectedDomainUUID = ctwu.getGlobalVariable('domain').uuid;;
            var selectedDomain = ctwu.getGlobalVariable('domain').name;;
            var selectedProject = ctwu.getGlobalVariable('project').name;;

            getAjaxs[0] = $.ajax({
                url:"/api/tenants/config/virtual-networks",
                type:"GET"
            });

            getAjaxs[1] = $.ajax({
                url:"/api/tenants/config/service-instance-templates/"
                + selectedDomainUUID,
                type:"GET"
            });

            /*getAjaxs[2] = $.ajax({
                url:"/api/tenants/config/service-instances-details/",
                type:"GET"
            });*/

            //get policies
            getAjaxs[3] = $.ajax({
                url:"/api/tenants/config/policys",
                type:"GET"
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
                                   //value:"dummy",
                                   //id:"dummy",
                                   disabled : true },
                                 {text:"ANY (All Networks in Current Project)",
                                   value:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                   id:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                   //"value":"any",
                                   //"id":"any",
                                   "parent": "virtual_network"},
                                 {text:"LOCAL (All Networks to which this policy is associated)",
                                 value:"local" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                 id:"local" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                 //"value":"local",
                                 //"id":"local",
                                 "parent": "virtual_network"}];

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
                                    var fqNameTxt = vn["fq_name"][2] +' (' +
                                                    domain + ':' +
                                                    project +')';
                                    var fqNameValue = vn["fq_name"].join(":");
                                    allVns.push({text : fqNameTxt,
                                         value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                         id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                         //value : fqNameValue,
                                         //id : fqNameValue,
                                         parent : "virtual_network" });
                                } else {
                                    allVns.push({text : vn["fq_name"][2],
                                                 value:(vn["fq_name"]).join(":")
                                                       + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                                 id : (vn["fq_name"]).join(":")
                                                       + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                                 //value:(vn["fq_name"]).join(":"),
                                                 //id : (vn["fq_name"]).join(":"),
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
                                     //value : fqNameValue,
                                     //id : fqNameValue,
                                     parent : "virtual_network" });
                            }
                        }
                    }

                    var sts = jsonPath(results[1][0],
                              "$.service_templates[*].service-template");
                    //process policies data
                    var policies = results[3][0]["network-policys"];
                    if(null !== policies && policies.length > 0) {
                       returnArr["policys-input"] = policies;
                    }
                    //prepare policies sub array
                    var allPolicies = [{text:'Enter or Select a Policy',
                                        value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                        //value:"dummy",
                                        disabled : true }];
                    for(var i = 0; i < policies.length; i++) {
                        var policy = policies[i];
                        var fqn =  policy["fq_name"];
                        var domain = fqn[0];
                        var project = fqn[1];
                        if(domain === selectedDomain &&
                           project === selectedProject) {
                            allPolicies.push(
                                {text : policy["fq_name"][2],
                                 value : (policy["fq_name"]).join(":")
                                         + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                 id : (policy["fq_name"]).join(":")
                                         + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                 //value : (policy["fq_name"]).join(":"),
                                 //id : (policy["fq_name"]).join(":"),
                                 parent : "network_policy"});
                        }
                    }
                    returnArr["service_instances"] = [];
                    returnArr["service_instances_ref"] = [];
                    var analyzerInsts = [];
                    var serviceInsts = [];
                    var serviceInstsRef = [];
                    if (null !== sts && sts.length > 0) {
                        for (var i = 0; i < sts.length; i++) {
                            var serviceTemplateMode = getValueByJsonPath(sts[i],
                                    "service_template_properties;service_mode",
                                    "");
                            var serviceTemplateType = getValueByJsonPath(sts[i],
                                    "service_template_properties;service_type",
                                    "");
                            if (typeof sts[i].service_instance_back_refs
                                                      !== "undefined" &&
                                sts[i].service_instance_back_refs.length > 0) {
                                var si_backRef =
                                    sts[i].service_instance_back_refs;
                                var si_backRef_len =
                                   sts[i].service_instance_back_refs.length;
                                for (var j = 0; j < si_backRef_len; j++) {
                                    var siBackRefTo = getValueByJsonPath(
                                                  si_backRef[j], "to" , []);
                                    var text = fqnameDisplayFormat(
                                                    siBackRefTo ,
                                                    selectedDomain,
                                                    selectedProject);
                                    var si_backRef_join = siBackRefTo.join(":");
                                    var si_val_obj = {
                                                         "text":text,
                                                         "value":si_backRef_join
                                                     };
                                    if(serviceTemplateType == "analyzer") {
                                        analyzerInsts.push(si_val_obj);
                                    }
                                    var si_val_objClon =
                                            $.extend(true,{},si_val_obj);
                                    serviceInsts.push(si_val_objClon);
                                    serviceInstsRef[si_val_obj.value] =
                                            si_val_objClon.value;
                                }
                            }
                        }
                    }
                    returnArr["service_instances"] = serviceInsts;
                    returnArr["service_instances_ref"] = serviceInstsRef;
                    returnArr["analyzerInsts"] = analyzerInsts;
                    //add other project policies at the end
                    for(var i = 0; i < policies.length; i++) {
                        var policy = policies[i];
                        var fqn =  policy["fq_name"];
                        var project = fqn[1];
                        if(project !== selectedProject) {
                            var fqNameTxt = policy["fq_name"][2]+' (' +
                                            domain + ':' +
                                            project +')';
                            var fqNameValue = policy["fq_name"].join(":");
                            allPolicies.push({text : fqNameTxt,
                                              value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                              id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "network_policy",
                                              parent : 'network_policy'});
                        }
                    }
                    var addrFields = [];
                    addrFields.push({text : 'CIDR', value : 'subnet',
                                    children : [{
                                        text:'Enter a CIDR',
                                        value:"dummy",
                                        disabled : true }]},
                                   {text : 'Networks', value : 'virtual_network',
                                   children : allVns},
                                   {text : 'Policies', value : 'network_policy',
                                   children : allPolicies});
                    returnArr["addrFields"] = addrFields;
                    callback(returnArr);
                }
            )
        }
    });
    var fqnameDisplayFormat = function(fqname, selectedDomain, selectedProject) {
        var returnText = "";
        returnText = getValueByJsonPath(fqname, "2", "");
        if(returnText != "" && (
           fqname[0] != selectedDomain ||
           fqname[1] != selectedProject)) {
            returnText += "("+ fqname[0] + ":" + fqname[1] +")";
        }
        return returnText;
    }

    var getConfigureViewConfig = function(isDisable, allData) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_POLICY]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'policyName',
                        view: "FormInputView",
                        viewConfig: {
                            placeholder: "Policy Name",
                            disabled: isDisable,
                            path: 'policyName',
                            label:'Policy Name',
                            dataBindValue: 'policyName',
                            class: "span6"}
                    }]
                },{
                    columns: [{
                        elementId: 'PolicyRules',
                        view: "FormCollectionView",
                        //view: "FormEditableGridView",
                        viewConfig: {
                            label:"Policy Rule(s)",
                            path: "PolicyRules",
                            validation: 'ruleValidation',
                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                            collection: "PolicyRules",
                            rows:[{
                               rowActions: [
                                   {onClick: "function() { $root.addRule(); }",
                                   iconClass: 'icon-plus'},
                                   {onClick:
                                   "function() { $root.deleteRules($data, this); }",
                                    iconClass: 'icon-minus'}
                               ],
                            columns: [
                                {
                                 elementId: 'simple_action',
                                 name: 'Action',
                                 view: "FormDropdownView",
                                 class: "",
                                 width: 60,
                                 viewConfig: {
                                     templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                     path: "simple_action",
                                     disabled: "showService()",
                                     dataBindValue: "simple_action()",
                                     elementConfig:{
                                         data:['PASS','DENY']
                                    }}
                                },
                                {
                                 elementId: 'protocol',
                                 name: 'Protocol',
                                 view: "FormComboboxView",
                                 class: "",
                                 width: 150,
                                 viewConfig: {
                                     templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                     path: "protocol",
                                     dataBindValue: "protocol()",
                                     disabled: "mirror_to_check()",
                                     elementConfig:{
                                         dataTextField: 'text',
                                         dataValueField: 'value',
                                         dataSource: {
                                             type: 'local',
                                             data:[{text:'ANY', value:'ANY' },
                                                   {text:'TCP', value:'TCP' },
                                                   {text:'UDP', value:'UDP' },
                                                   {text:'ICMP', value:'ICMP' },
                                                   {text:'ICMP6', value:'ICMP6' }
                                                  ]
                                            }
                                        }
                                    }
                                },
                                {
                                    elementId: 'src_address',
                                    view:
                                        "FormHierarchicalDropdownView",
                                    name: 'Source',
                                    class: "",
                                    width: 200,
                                    viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        width: 200,
                                        path: 'src_address',
                                        dataBindValue: 'src_address()',
                                        elementConfig: {
                                            //defaultValueId : 1,
                                            minimumResultsForSearch : 1,
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data: allData.addrFields,
                                            queryMap: [
                                            {
                                                name : 'CIDR',
                                                value : 'subnet',
                                                iconClass:
                                                'icon-contrail-network-ipam'
                                            },
                                            {
                                                name : 'Networks',
                                                value : 'virtual_network',
                                                iconClass:
                                                'icon-contrail-virtual-network'
                                            },
                                            {
                                                name : 'Policies',
                                                value : 'network_policy',
                                                iconClass:
                                                'icon-contrail-network-policy'
                                            }
                                            ]
                                        }
                                    }
                                },
                                {
                                 elementId: 'src_ports_text',
                                 name: 'Ports',
                                 view: "FormInputView",
                                 class: "",
                                 width: 40,
                                 viewConfig: {
                                    disabled: "mirror_to_check()",
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'src_ports_text',
                                    dataBindValue: 'src_ports_text()'
                                    }
                                },
                                {
                                 elementId: 'direction',
                                 name: 'Direction',
                                 view: "FormDropdownView",
                                 class: "",
                                 width: 60,
                                 viewConfig: {
                                     templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                     path: "direction",
                                     dataBindValue: "direction()",
                                     disabled: "showService()",
                                     elementConfig:{
                                         data:['<>', '>']
                                     }}
                                },
                                {
                                    elementId: 'dst_address',
                                    view:
                                        "FormHierarchicalDropdownView",
                                    name: 'Destination',
                                    class: "span2",
                                    width: 200,
                                    viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        width: 200,
                                        path: 'dst_address',
                                        dataBindValue: 'dst_address()',
                                        elementConfig: {
                                            //defaultValueId : 1,
                                            minimumResultsForSearch : 1,
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data: allData.addrFields,
                                            queryMap: [
                                            {
                                                name : 'CIDR',
                                                value : 'subnet',
                                                iconClass:
                                                'icon-contrail-network-ipam'
                                            },
                                            {
                                                name : 'Networks',
                                                value : 'virtual_network',
                                                iconClass:
                                                'icon-contrail-virtual-network'
                                            },
                                            {
                                                name : 'Policies',
                                                value : 'network_policy',
                                                iconClass:
                                                'icon-contrail-network-policy'
                                            }]
                                        }
                                    }
                                },
                                {
                                 elementId: 'dst_ports_text',
                                 name: 'Ports',
                                 view: "FormInputView",
                                 class: "",
                                 width: 40,
                                 viewConfig: {
                                    disabled: "mirror_to_check()",
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'dst_ports_text',
                                    dataBindValue: 'dst_ports_text()'
                                    }
                                },
                                {
                                 elementId: 'log_checked',
                                 name: 'Log',
                                 view: "FormCheckboxView",
                                 class: "",
                                 width: 25,
                                 viewConfig: {
                                    templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                    path: 'log_checked',
                                    dataBindValue: 'log_checked()'
                                    }
                                },
                                {
                                 elementId: 'apply_service_check',
                                 name: 'Services',
                                 view: "FormCheckboxView",
                                 class: "",
                                 width: 60,
                                 viewConfig: {
                                    templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                    path: 'apply_service_check',
                                    dataBindValue: 'apply_service_check()'
                                    }
                                },
                                {
                                 elementId: 'mirror_to_check',
                                 name: 'Mirror',
                                 view: "FormCheckboxView",
                                 class: "",
                                 width: 60,
                                 viewConfig: {
                                     templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                     path: 'mirror_to_check',
                                     dataBindValue: 'mirror_to_check()'
                                    }
                                }]
                            },{
                            columns: [
                                {
                                     elementId: 'service_instance',
                                     name: 'Services',
                                     view: "FormMultiselectView",
                                     width: 100,
                                     viewConfig: {
                                         colSpan: "10",
                                         class: "span10",
                                         placeholder:"Select a service to apply...",
                                         //visible: "$root.showService",
                                         visible: "apply_service_check()",
                                         templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_LEFT_LABEL_VIEW,
                                         path: "service_instance",
                                         dataBindValue: "service_instance()",
                                         elementConfig:{
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                             data:allData.service_instances
                                         }
                                     }
                                }
                            ]
                            },{
                            columns: [{
                                     elementId: 'mirror',
                                     name: 'Mirror',
                                     view: "FormDropdownView",
                                     width: 100,
                                     viewConfig: {
                                         placeholder:"Select a service to mirror...",
                                         colSpan: "10",
                                         visible: "mirror_to_check()",
                                         templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_LEFT_LABEL_VIEW,
                                         path: "mirror",
                                         dataBindValue: "mirror()",
                                         elementConfig:{
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             data:allData.analyzerInsts
                                         }
                                    }
                            }],
                            /*rowActions: [
                                {onClick:
                                "function() { $root.deleteRules($data, this); }",
                                 iconClass: 'icon-minus'}
                            ]*/
                        }],
                            gridActions: [
                                {onClick: "function() { addRule(); }",
                                 buttonTitle: ""}
                            ]
                    }
                    }]
                }]
            }
        }
    }

    return PolicyCreateEditView;
});
