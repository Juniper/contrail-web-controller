/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view'
], function (_, Backbone, ContrailListModel, Knockback, ContrailView ) {
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
                   var disableElement = false
                   if(options['mode'] == "edit") {
                      disableElement = true;
                   }
                   self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getConfigureViewConfig
                        (disableElement, allData, self.selectedProjId),
                        'policyValidations', null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                            cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                            kbValidation.bind(self,{collection:
                                  self.model.model().attributes.PolicyRules});
                   }, null, false);
                   return;
               }
           );
        },
        renderDeletePolicy: function (options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var selectedGridData = options['selectedGridData'];
            var self = this;
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function(){
                   self.model.deletePolicy(selectedGridData[0], {
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
               }, 
               'onCancel': function(){
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
               }});
               self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
               Knockback.applyBindings(self.model, document.getElementById(modalId));
               kbValidation.bind(self);
        },
        renderLocationGridPopup: function(options){
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            var obj = {name: 'network_policies', url: 'local_network_policies', key: 'local_network_policy'};
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                                  self.model.configureLocation(obj,
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
                              },
                              'onCancel': function () {
                                  Knockback.release(self.model, document.getElementById(modalId));
                                  kbValidation.unbind(self);
                                  $("#" + modalId).modal('hide');
                              }});

           this.fetchLocations(this ,
                function(allData) {
                  // self.model.setServiceTemplateDataSource(allData.service_instances_ref);
                   self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getLocationViewConfig(false, allData),
                        '', null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                    cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                    kbValidation.bind(self,{collection:
                          self.model.model().attributes.LocationDetails});
                        }, null, false);
                   return;
               }
           );
        },
        fetchLocations : function(self, callback) {
            var getAjaxs = [];
            getAjaxs[0] = $.ajax({
                url: ctwc.GOHAN_LOCATION,
                type:"GET"
            });

            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = []
                    var results = arguments;
                    var vns = results[0]["locations"];
                    //returnArr["virtual-networks"] = [];
                    var allVns = [];
                   if (null !== vns && typeof vns === "object" && vns.length > 0) {
                        for (var i = 0; i < vns.length; i++) {
                            allVns.push({text : vns[i].name,
                                     value : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "location_value",
                                     id : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "location_value",
                                     parent : "location_value" });
                        }
                    }
                    var addrFields = [];
                    addrFields.push({text : 'Locations', value : 'location_value',
                                   children : allVns});
                    returnArr["addrFields"] = addrFields;
                    callback(returnArr);
                }
            )
        },
        fetchAllData : function(self, callback) {
            var tenantId = contrail.getCookie('gohanProject');
            var getAjaxs = [];
            getAjaxs[0] = $.ajax({
                url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_TENANT_PARAM + tenantId,
                type:"GET"
            });

            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = []
                    var results = arguments;
                    var vns = results[0]["networks"];
                    returnArr["virtual-networks"] = [];
                    var allVns = [{text:'Enter or Select a Network',
                        value:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                        id:"dummy" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                        disabled : true },
                      {text:"ANY (All Networks in Current Project)",
                        value:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                        id:"any" + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                        "parent": "virtual_network"}];
                   if (null !== vns && typeof vns === "object" && vns.length > 0) {
                        for (var i = 0; i < vns.length; i++) {
                            allVns.push({text : vns[i].name,
                                     value : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                     id : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "virtual_network",
                                     parent : "virtual_network" });
                        }
                    }
                    var addrFields = [];
                    addrFields.push({text : 'Network', value : 'virtual_network',
                                   children : allVns});
                    returnArr["addrFields"] = addrFields;
                    callback(returnArr);
                }
            )
        }
    });

   function serviceInstanceDropDownFormatter(model){
       var list = model[Object.keys(model)[0]], serviceLsit = [];
       $.each(list, function (i, obj) {
           serviceLsit.push({value: obj.id, text: obj.name});
       });
       return serviceLsit;
   };

    var getConfigureViewConfig = function(isDisable, allData, selectedProjId) {
        var tenantId = contrail.getCookie('gohanProject');
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_POLICY]),
            view: "SectionView",
            title: "Policy", //permissions
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'name',
                        view: "FormInputView",
                        viewConfig: {
                            disabled: isDisable,
                            placeholder: "Name",
                            path: 'name',
                            label:'Policy Name',
                            dataBindValue: 'name',
                            class: "col-xs-6"}
                    },
                    {
                        elementId: 'description',
                        view: "FormInputView",
                        viewConfig: {
                            placeholder: "Description",
                            path: 'description',
                            label:'Description',
                            dataBindValue: 'description',
                            class: "col-xs-6"}
                    }]
                },
                {
                    columns: [{
                        elementId: 'PolicyRules',
                        view: "FormCollectionView",
                        //view: "FormEditableGridView",
                        viewConfig: {
                            label:"Policy Rule (s)",
                            path: "PolicyRules",
                            class: 'col-xs-12',
                            validation: 'ruleValidation',
                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                            collection: "PolicyRules",
                            rows:[{
                               rowActions: [
                                   {onClick: "function() { $root.addRule(); }",
                                   iconClass: 'fa fa-plus'},
                                   {onClick:
                                   "function() { $root.deleteRules($data, this); }",
                                    iconClass: 'fa fa-minus'}
                               ],
                            columns: [
                                {
                                 elementId: 'simple_action',
                                 name: 'Action',
                                 view: "FormDropdownView",
                                 class: "",
                                 width: 60,
                                 viewConfig: {
                                     width: 60,
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
                                 width: 120,
                                 viewConfig: {
                                     width: 120,
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
                                    width: 180,
                                    viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        width: 210,
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
                                                name : 'Network',
                                                value : 'virtual_network',
                                                iconClass:
                                                'icon-contrail-virtual-network'
                                            }]
                                        }
                                    }
                                },
                                {
                                    elementId: 'src_ports_text',
                                    name: 'Ports',
                                    view: "FormInputView",
                                    class: "",
                                    width: 100,
                                    viewConfig: {
                                       templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                       width: 100,
                                       path: 'src_ports_text',
                                       dataBindValue: 'src_ports_text()'
                                       }
                                   },
                                {
                                 elementId: 'direction',
                                 name: 'Direction',
                                 view: "FormDropdownView",
                                 class: "",
                                 width: 70,
                                 viewConfig: {
                                     templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                     width: 70,
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
                                    class: "col-xs-2",
                                    width: 210,
                                    viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        width: 210,
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
                                                name : 'Network',
                                                value : 'virtual_network',
                                                iconClass:
                                                'icon-contrail-virtual-network'
                                            }]
                                        }
                                    }
                                },
                                {
                                    elementId: 'dst_ports_text',
                                    name: 'Ports',
                                    view: "FormInputView",
                                    class: "",
                                    width: 100,
                                    viewConfig: {
                                       templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                       width: 100,
                                       path: 'dst_ports_text',
                                       dataBindValue: 'dst_ports_text()'
                                       }
                                 },
                                 {
                                     elementId: 'apply_service_check',
                                     name: 'Services',
                                     view: "FormCheckboxView",
                                     class: "",
                                     width: 40,
                                     viewConfig: {
                                        templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                        width: 40,
                                        path: 'apply_service_check',
                                        dataBindValue: 'apply_service_check()'
                                        }
                                 }
                              ]
                            },
                            {
                                columns: [{
                                            elementId: 'service_instance',
                                            name: 'Services',
                                            view: "FormMultiselectView",
                                            width: 100,
                                            viewConfig: {
                                                colSpan: "8",
                                                class: "col-xs-10",
                                                placeholder:"Select a service to apply...",
                                                visible: "apply_service_check()",
                                                templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_LEFT_LABEL_VIEW,
                                                path: "service_instance",
                                                dataBindValue: "service_instance()",
                                                elementConfig:{
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                                    dataSource : {
                                                        type: 'remote',
                                                        url: './gohan_contrail/v1.0/tenant/service_instances?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                                                        parse: function(result) {
                                                            return serviceInstanceDropDownFormatter(result);
                                                        }
                                                    }
                                                 }
                                            }
                                       }]
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
    var getLocationViewConfig = function(isDisable, allData) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_POLICY]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'LocationDetails',
                        view: "FormCollectionView",
                        //view: "FormEditableGridView",
                        viewConfig: {
                            label:"",
                            path: "LocationDetails",
                            class: 'col-xs-12',
                            //validation: 'ruleValidation',
                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                            collection: "LocationDetails",
                            rows:[{
                               rowActions: [
                                  {onClick: "function() { $root.addRule(); }",
                                        iconClass: 'fa fa-plus'},
                                  {onClick:
                                   "function() { $root.deleteRules($data, this); }",
                                    iconClass: 'fa fa-minus'}
                               ],
                            columns: [
                                    {
                                      elementId: 'locationName',
                                      view:
                                          "FormHierarchicalDropdownView",
                                      name: 'Location ID',
                                      width: 220,
                                      class: "",
                                       viewConfig: {
                                          disabled: 'showLocation()',
                                          templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                          path: 'locationName',
                                          dataBindValue: 'locationName()',
                                          elementConfig: {
                                              minimumResultsForSearch : 1,
                                              dataTextField: "text",
                                              dataValueField: "value",
                                              data: allData.addrFields,
                                              queryMap: [
                                              {
                                                  name : 'Locations',
                                                  value : 'location_value'
                                              }]
                                          }
                                      }
                                  },
                                  {
                                      elementId: 'name',
                                      name: 'Name',
                                      view: "FormInputView",
                                      class: "",
                                      width: 220,
                                      viewConfig: {
                                         disabled: 'showLocation()',
                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                         path: 'name',
                                         dataBindValue: 'name()'
                                      }
                                   },
                                  {
                                       elementId: 'description',
                                       name: 'Description',
                                       view: "FormInputView",
                                       class: "",
                                       width: 300,
                                       viewConfig: {
                                          disabled: false,
                                          placeholder: 'Description',
                                          templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                          path: 'description',
                                          dataBindValue: 'description()'
                                       }
                                    },
                                    {
                                        elementId: 'status',
                                        name: 'Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 240,
                                        viewConfig: {
                                           disabled: true,
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'status',
                                           dataBindValue: 'status()'
                                           }
                                    },
                                    {
                                        elementId: 'taskStatus',
                                        name: 'Task Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 240,
                                        viewConfig: {
                                           disabled: true,
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'taskStatus',
                                           dataBindValue: 'taskStatus()'
                                        }
                                     }
                              ]
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
