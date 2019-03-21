/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/common/fwpolicy/ui/js/fwPolicyFormatter'
], function (_, ContrailView, Knockback, FWPolicyFormatter) {
    var gridElId = '#' + ctwc.FW_RULE_GRID_ID,
        prefixId = ctwc.FW_RULE_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form',
        serviceGroupList = [];
    var fwPolicyFormatter = new FWPolicyFormatter();
    var fwRuleEditView = ContrailView.extend({
        renderAddEditFwRule: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this,disable = false;
            var mode = options.mode;
            if(mode === 'edit'){
                disable = true;
            }
            cowu.createModal({'modalId': modalId, 'className': 'modal-610',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditFirewallRule({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                }, options, serviceGroupList);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchAllData(this, options, 
                    function(allData) {
                       self.renderView4Config($("#" + modalId).find(formId),
                                self.model,
                                getFwRuleViewConfig(disable, allData, options),
                                "fwRuleValidation",
                                null, null, function() {
                                 self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                                 Knockback.applyBindings(self.model,
                                                         document.getElementById(modalId));
                                 kbValidation.bind(self);
                        },null,false);
                      return;
                   }
               );

        },
        renderDeleteFirewallRule: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteFirewallRule(options['selectedGridData'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                document.getElementById(modalId));
            kbValidation.bind(self);
        },
        fetchAllData : function(self, options, callback) {
            var getAjaxs = [];
            var tagParam = {data: [{type: 'tags'}]};
            var addressGrpParam = {data: [{type: 'address-groups'}]};
            getAjaxs[0] = $.ajax({
                url: '/api/tenants/config/get-config-details',
                type:"POST",
                data: tagParam
            });
            getAjaxs[1] = $.ajax({
                url: '/api/tenants/config/get-config-details',
                type:"POST",
                data: addressGrpParam
            });
            getAjaxs[2] = $.ajax({
                url:"/api/tenants/config/virtual-networks",
                type:"GET"
            });
            //get SLO
            getAjaxs[3] = $.ajax({
              url: ctwc.URL_GET_CONFIG_DETAILS,
              type:"POST",
              dataType: "json",
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify({data: [{type: "security-logging-objects"}]})
            });
            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = [], results = arguments, applicationChild = [{text:'Select a Application',
                        value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "application",
                        id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "application",
                        disabled : true }];
                    var tierChild = [{text:'Select a Tier',
                        value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "tier",
                        id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "tier",
                        disabled : true }], deploymentChild = [{text:'Select a Deployment',
                            value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "deployment",
                            id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "deployment",
                            disabled : true }], siteChild = [{text:'Select a Site',
                                value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "site",
                                id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "site",
                                disabled : true }], addrFields = [],
                        labelChild = [{text:'Select Labels',
                            value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                            id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                            disabled : true }],
                        udTagChild = [{text:'Select Custom tags',
                            value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                            id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                            disabled : true }];

                    var addressGrpChild = [{text:'Select Address Group',
                        value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                        id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                        disabled : true }];
                    var tagList = ['Application','Deployment','Site','Tier', 'Label', 'Custom'];
                    var tags = fwPolicyFormatter.filterTagsByProjects(results[0][0][0]['tags']);
                    var addressGrp = fwPolicyFormatter.filterAddressGroupByProjects(results[1][0][0]['address-groups']);
                    var virtualNet = results[2][0]['virtual-networks'];
                    var domain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
                    var project = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                    if(tags.length > 0){
                        for(var i = 0; i < tags.length; i++){
                            var tagType = getValueByJsonPath(tags[i], 'tag;tag_type_name', '', false);
                            var val = tags[i]['tag'].fq_name.length === 1 ?
                                    'global:' + tags[i]['tag']['name'] : tags[i]['tag']['name'];
                            var txt = tags[i]['tag'].fq_name.length === 1 ?
                                    'global:' + tags[i]['tag']['tag_value'] :
                                        tags[i]['tag']['tag_value'];
                            if(tagType === ctwc.APPLICATION_TAG_TYPE){
                                applicationChild.push({text : txt,
                                     value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "application",
                                     id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "application",
                                     parent : "application" })
                            }else if(tagType === ctwc.TIER_TAG_TYPE){
                                tierChild.push({text : txt,
                                    value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "tier",
                                    id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "tier",
                                    parent : "tier" });
                            }else if(tagType === ctwc.DEPLOYMENT_TAG_TYPE){
                                deploymentChild.push({text : txt,
                                    value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "deployment",
                                    id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "deployment",
                                    parent : "deployment" });
                            }else if(tagType === ctwc.SITE_TAG_TYPE){
                                siteChild.push({text : txt,
                                    value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "site",
                                    id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "site",
                                    parent : "site" });
                            }else if(tagType === ctwc.LABEL_TAG_TYPE){
                                labelChild.push({text : txt,
                                    value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                                    id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "label",
                                    parent : "label" });
                            } else {
                                txt = tags[i]['tag'].fq_name.length === 1 ?
                                        'global:' + tags[i]['tag']['name'] :
                                            tags[i]['tag']['name'];
                                udTagChild.push({text : txt,
                                    value : val + cowc.DROPDOWN_VALUE_SEPARATOR + "udtag",
                                    id : val + cowc.DROPDOWN_VALUE_SEPARATOR + "udtag",
                                    parent : "udtag" });
                            }
                        }
                        for(var j = 0; j < tagList.length; j++){
                            var tagVal, tagData;
                            if(tagList[j] === 'Application'){
                                tagVal = 'application';
                                tagData = sortTagsByText(applicationChild);
                            }else if(tagList[j] === 'Tier'){
                                tagVal = 'tier';
                                tagData = sortTagsByText(tierChild);
                            }else if(tagList[j] === 'Deployment'){
                                tagVal = 'deployment';
                                tagData = sortTagsByText(deploymentChild);
                            }else if(tagList[j] === 'Site'){
                                tagVal = 'site';
                                tagData = sortTagsByText(siteChild);
                            }else if(tagList[j] === 'Label'){
                                tagVal = 'label';
                                tagData = sortTagsByText(labelChild);
                            } else {
                                tagVal = 'udtag';
                                tagData = sortTagsByText(udTagChild);
                            }
                            addrFields.push({text : tagList[j], value : tagVal, children : tagData});
                        }
                    }
                    if(addressGrp.length > 0){
                        for(var a = 0; a< addressGrp.length; a++){
                            var address = addressGrp[a]['address-group'];
                            var fqNameTxt = address["fq_name"][address["fq_name"].length - 1];
                            var fqNameValue = address["fq_name"].join(":");
                            addressGrpChild.push({text : fqNameTxt,
                                 value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                                 id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "address_group",
                                 parent : "address_group" });
                        }
                        var sortedAddressGroups = sortTagsByText(addressGrpChild);
                        addrFields.push({text : 'Address Group', value : 'address_group', children : sortedAddressGroups});
                    }
                    if(virtualNet.length > 0){
                        var virtualNetworkList = [{text:'Enter or Select a Virtual Network',
                            value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                            id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                            disabled : true }/*,
                          {text:"ANY (All Networks in Current Project)",
                            value:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                            id:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                            "parent": "virtual_network"}*/];
                          for(var i = 0; i< virtualNet.length; i++){
                              var vn = getValueByJsonPath(virtualNet[i],
                                      'fq_name', [], false);
                              /*if(vn[2].toLowerCase() === "any" ||
                                      vn[2].toLowerCase() === "local"){*/
                                       var fqNameTxt = vn[2]; /*+' (' +
                                                       domain + ':' +
                                                       project +')';*/
                                       var fqNameValue = vn.join(":");
                                       virtualNetworkList.push({text : fqNameTxt,
                                            value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                            id : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                            parent : "virtual_network" });
                              //}
                          }
                          var sortedVirtualNetworkList = sortTagsByText(virtualNetworkList);
                          addrFields.push({text : 'Virtual Networks', value : 'virtual_network', children : sortedVirtualNetworkList});
                    }
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
                    var sloObj = fwPolicyFormatter.filterSloByProjects(getValueByJsonPath(results, '3;0;0;security-logging-objects', [], false), options.isGlobal);
                    var sloList = [];
                    _.each(sloObj, function(obj) {
                        if("security-logging-object" in obj) {
                            var slo = obj["security-logging-object"];
                            var fqName = slo.fq_name;
                            if(options.isGlobal){
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
    function sortTagsByText(tagsWithPlaceholder) {
        var placeholder = tagsWithPlaceholder[0];
        var tags = tagsWithPlaceholder.slice(1);
        var sortedTags = _.sortBy(tags, function(tag) { return tag.text; });
        var partitionResult = _.partition(sortedTags, function (tag) { return tag.text.indexOf("global:") === 0; });
        var globalTags = partitionResult[0];
        var projectTags = partitionResult[1];

        return [].concat(placeholder, projectTags, globalTags);
    }
    function tagDropDownFormatter(response){
        var matchList = [{text:'Application', id:'application' },
            {text:'Tier', id:'tier' },
            {text:'Deployment', id:'deployment' },
            {text:'Site', id:'site' }];

        return matchList;
    };
    function serviceGroupDataFormatter(response){
        var serviceGrpList = [], isGlobal = this.isGlobal;
        serviceGroupList =[];
        var secGrpList = getValueByJsonPath(response, "0;service-groups", []);
        $.each(secGrpList, function (i, obj) {
            var obj = obj['service-group'];
            if(isGlobal){
                if(obj.fq_name.length < 3){
                    serviceGrpList.push({value: obj.uuid, text: obj.name});
                    serviceGroupList.push({fq_name : obj.fq_name, text: obj.name});
                }
            }else{
                if(obj.fq_name.length < 3){
                    var text = 'global:' + obj.name;
                    serviceGrpList.push({value: obj.uuid, text: text});
                    serviceGroupList.push({fq_name : obj.fq_name, text: text});
                }else{
                    serviceGrpList.push({value: obj.uuid, text: obj.name});
                    serviceGroupList.push({fq_name : obj.fq_name, text: obj.name});
                }
            }
         });
        return serviceGrpList;
    };
    var getFwRuleViewConfig = function (isDisable, allData, options) {
        var tagParam = {data: [{type: 'tags'}]};
        var serviceGrp = {data: [{type: 'service-groups'}]};
        return {
            elementId: ctwc.SEC_POLICY_SERVICE_GRP_PREFIX_ID,
            view: 'SectionView',
            title: "Firewall Rule",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'simple_action',
                                name:'Action',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Action',
                                    path: "simple_action",
                                    class:'col-xs-6',
                                    dataBindValue: "simple_action",
                                    elementConfig:{
                                        data:['pass','deny']
                                 }}
                             },
                             {
                                 elementId: 'user_created_service',
                                 name: 'Services',
                                 view: "FormComboboxView",
                                 viewConfig: {
                                     label: 'Services',
                                     class:'col-xs-6',
                                     path: 'user_created_service',
                                     dataBindValue: 'user_created_service',
                                     elementConfig: {
                                         dataTextField: "text",
                                         dataValueField: "value",
                                         placeholder: "Protocol:SrcPort:DstPort",
                                         dataSource: {
                                             type: "remote",
                                             requestType: "POST",
                                             url: "/api/tenants/config/get-config-details",
                                             postData: JSON.stringify(serviceGrp),
                                             parse : serviceGroupDataFormatter.bind(options)
                                         }
                                     }
                                 }
                             }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'endpoint_1',
                                view:"FormHierarchicalDropdownView",
                                name: 'End Point 1',
                                viewConfig: {
                                    templateId: cowc.TMPL_MULTISELECT_VIEW,
                                    class:'col-xs-12',
                                    path: 'endpoint_1',
                                    dataBindValue: 'endpoint_1',
                                    selectOnBlur: false,
                                    elementConfig: {
                                        placeholder: 'Select Endpoint',
                                        //defaultValueId : 1,
                                        minimumResultsForSearch : 1,
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        data: allData.addrFields,
                                        queryMap: [
                                            { name : 'Application',  value : 'application', iconClass:'fa fa-list-alt' },
                                            { name : 'Deployment',  value : 'deployment', iconClass:'fa fa-database' },
                                            { name : 'Site',  value : 'site', iconClass:'fa fa-life-ring' },
                                            { name : 'Tier',  value : 'tier', iconClass:'fa fa-clone' },
                                            { name : 'Custom',  value : 'udtag', iconClass:'fa fa-asterisk' },
                                            { name : 'Label',  value : 'label', iconClass:'fa fa-tags' },
                                            { name : 'Address Group',  value : 'address_group', iconClass:'icon-contrail-network-ipam' },
                                            { name : 'Virtual Networks',  value : 'virtual_network', iconClass:'icon-contrail-virtual-network' },
                                            { name : 'Any Workload',  value : 'any_workload', iconClass:'fa fa-globe'}]
                                    }
                                }
                            }
                        ]
                    }, {
                        columns:[{
                            elementId: 'direction',
                            name: 'Direction',
                            view: "FormDropdownView",
                            viewConfig: {
                                label: 'Direction',
                                class: "col-xs-6",
                                path: "direction",
                                dataBindValue: "direction",
                                elementConfig:{
                                    data:['<>', '>', '<']
                                }}
                         }]
                    },
                    {
                        columns: [
                            {
                                elementId: 'endpoint_2',
                                view:"FormHierarchicalDropdownView",
                                name: 'End Point 2',
                                viewConfig: {
                                    templateId: cowc.TMPL_MULTISELECT_VIEW,
                                    class:'col-xs-12',
                                    path: 'endpoint_2',
                                    dataBindValue: 'endpoint_2',
                                    selectOnBlur: false,
                                    elementConfig: {
                                        placeholder: 'Select Endpoint',
                                        //defaultValueId : 1,
                                        minimumResultsForSearch : 1,
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        data: allData.addrFields,
                                        queryMap: [
                                            { name : 'Application',  value : 'application', iconClass:'fa fa-list-alt' },
                                            { name : 'Deployment',  value : 'deployment', iconClass:'fa fa-database' },
                                            { name : 'Site',  value : 'site', iconClass:'fa fa-life-ring' },
                                            { name : 'Tier',  value : 'tier', iconClass:'fa fa-clone' },
                                            { name : 'Custom',  value : 'udtag', iconClass:'fa fa-asterisk' },
                                            { name : 'Label',  value : 'label', iconClass:'fa fa-tags' },
                                            { name : 'Address Group',  value : 'address_group', iconClass:'icon-contrail-network-ipam' },
                                            { name : 'Virtual Networks',  value : 'virtual_network', iconClass:'icon-contrail-virtual-network' },
                                            { name : 'Any Workload',  value : 'any_workload', iconClass:'fa fa-globe' }]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'match_tags',
                            view: "FormMultiselectView",
                            viewConfig: {
                                label: 'Match Tags',
                                class: "col-xs-12",
                                path: "match_tags",
                                dataBindValue: "match_tags",
                                elementConfig:{
                                    dataTextField: "text",
                                    placeholder:"Select Tag Types",
                                    dataValueField: "id",
                                    separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                    dataSource: {
                                        type: "remote",
                                        requestType: "POST",
                                        url: "/api/tenants/config/get-config-details",
                                        postData: JSON.stringify(tagParam),
                                        parse : tagDropDownFormatter
                                    }
                                 }
                            }
                       }]
                    },
                    {
                        columns: [
                            {
                                elementId: 'security_logging_object_refs',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: 'Security Logging Object(s)',
                                    path: 'security_logging_object_refs',
                                    class: 'col-xs-12',
                                    dataBindValue: 'security_logging_object_refs',
                                    elementConfig: {
                                        placeholder: 'Select Security Logging Object(s)',
                                        dataTextField: "text",
                                        dataValueField: "id",
                                        separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                        data : allData.sloList
                                     }
                                }
                           }]
                    }
                ]
            }
        }
    };

    return fwRuleEditView;
});
