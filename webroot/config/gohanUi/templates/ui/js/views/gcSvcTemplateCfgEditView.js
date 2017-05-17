/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/gohanUi/templates/ui/js/views/gcSvcTemplateCfgFormatters'],
    function (_, Backbone, ContrailListModel, Knockback, ContrailView, SvcTemplateCfgFormatters) {
    var formatSvcTemplateCfg = new SvcTemplateCfgFormatters();
    var prefixId = ctwl.CFG_SVC_TEMPLATE_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
        externalGatewayDS = [],
        self = {};
    var SvcTemplateCfgEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderGohanSvcTempEditPopup: function (options) {
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                                  self.model.gohanSvcTempUpdateModel('edit',
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
                    self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getConfigureViewConfig(false),
                        'policyValidations', null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                            cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                   }, null, false);
        },
        renderAddSvcTemplateCfg: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addSvcTemplateCfg({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        Knockback.release(self.model, document.getElementById(modalId));
                        kbValidation.unbind(self);
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Needs to be fixed, id doesnt work
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                }, 'POST');
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                   self.model,
                                   getSvcTemplateCfgViewConfig(false, self.model),
                                   "svcTemplateCfgConfigValidations", null, null,
                                   function () {

                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model, document.getElementById(modalId));
                    kbValidation.bind(self,
                        {collection: self.model.model().attributes.interfaces});
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                                   }, null, false);
        },
        renderGohanSvcTempDeletePopup : function(options){
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var selectedGridData = options['selectedGridData'];
            var self = this;
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function(){
                   self.model.deleteGohanSvcTemp(selectedGridData[0], {
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
            var obj = {name: 'service_templates', url: 'local_service_templates', key: 'local_service_template'};
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

           this.fetchAllData(this ,
                function(allData) {
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
        fetchAllData : function(self, callback) {
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
        }
    });
    var getConfigureViewConfig = function(isDisable) {

        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_POLICY]),
            view: "SectionView",
            title: "Policy", //permissions
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'description',
                        view: "FormInputView",
                        viewConfig: {
                            placeholder: "Description",
                            disabled: isDisable,
                            path: 'description',
                            label:'Description',
                            dataBindValue: 'description',
                            class: "col-xs-9"}
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
    function getSvcTemplateCfgViewConfig (disableOnEdit, model) {
        var tenantId = contrail.getCookie('gohanProject');
        var prefixId = ctwl.CFG_SVC_TEMPLATE_PREFIX_ID;
        var svcTemplateCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_SVC_TEMPLATE_TITLE_CREATE]),
            title: "Service Template",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'name',
                                    placeholder: 'Name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            },
                            {
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    path: 'description',
                                    placeholder: 'Description',
                                    class: 'col-xs-6',
                                    dataBindValue: 'description',
                                    disabled: disableOnEdit
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'image_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'image_id',
                                    class: 'col-xs-6',
                                    label: 'Image Name',
                                    dataBindValue: 'image_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Image',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_IMAGES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                            parse: function(result) {
                                                return formatSvcTemplateCfg.imageDropDownFormatter(result, model);
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'service_mode',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path : 'service_mode',
                                    class: 'col-xs-6',
                                    label: 'Service Mode',
                                    dataBindValue : 'service_mode',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'transparent', text:'Transparent'},
                                                {id: 'in-network', text:'In-Network'},
                                                {id: 'in-network-nat', text:'In-Network Nat'}]
                                    }
                                }
                            }
                        ]
                    },
                    {
                      columns: [{

                          elementId : 'interfacesSection',
                          view: "SectionView",
                          viewConfig : {
                              rows : [
                                  {
                                      columns : [
                                          {
                                              elementId: 'interfaces',
                                              view: "FormEditableGridView",
                                              viewConfig: {
                                                  path : 'interfaces',
                                                  class: 'col-xs-12',
                                                  templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                                  collection: 'interfaces',
                                                  columns: [
                                                     {
                                                       elementId: 'service_interface_type',
                                                       name: 'Interface (s)',
                                                       view:
                                                           "FormComboboxView",
                                                       class: "",
                                                       viewConfig:
                                                         {
                                                          templateId:
                                                             cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                          width: 318,
                                                          path: "service_interface_type",
                                                          dataBindValue: 'service_interface_type()',
                                                          dataBindOptionList:
                                                              "interfaceTypesData()",
                                                          elementConfig : {
                                                             dataTextField: 'text',
                                                             dataValueField:
                                                                 'id'
                                                          }
                                                         }
                                                     },
                                                     {
                                                       elementId: 'shared_ip',
                                                       name: 'Shared IP',
                                                       view: "FormCheckboxView",
                                                       class: "text-center",
                                                       viewConfig:
                                                         {
                                                          disabled: '$root.disableSharedIp($root, $data)',
                                                          templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                          width: 140,
                                                          path: "shared_ip()",
                                                          dataBindValue: 'shared_ip()'
                                                         }
                                                     },
                                                     {
                                                       elementId: 'static_route_enable',
                                                       name: 'Static Routes',
                                                       view: "FormCheckboxView",
                                                       class: "text-center",
                                                       viewConfig:
                                                         {
                                                          disabled: '$root.disableStaticRoute($root, $data)',
                                                          templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                          width: 140,
                                                          path: "static_route_enable()",
                                                          dataBindValue:
                                                              'static_route_enable()'
                                                         }
                                                     }
                                                   ],
                                                  rowActions: [
                                                      {onClick: "function() {\
                                                          $root.addSvcTemplateInterface();\
                                                          }",
                                                          iconClass: 'fa fa-plus'},
                                                      {onClick: "function() {\
                                                          $root.deleteSvcTemplateInterface($root, $data, this);\
                                                         }",
                                                       iconClass: 'fa fa-minus'}
                                                  ],
                                                  gridActions: [
                                                      {onClick: "function() {\
                                                          $root.addSvcTemplateInterface();\
                                                          }",
                                                       buttonTitle:
                                                         ""}
                                                  ]
                                              }
                                          }
                                      ]
                                  }
                              ]
                          }
                      }]
                    },
                    {
                        columns: [
                            {
                            elementId: 'advanced_options',
                            view: "AccordianView",
                            viewConfig: [
                                {
                                elementId: 'advanced',
                                title: 'Advanced Options',
                                active:false,
                                view: "SectionView",
                                viewConfig: {
                                        rows: [
                                        {
                                            columns: [
                                            {
                                                elementId: 'flavor_id',
                                                view: "FormDropdownView",
                                                viewConfig: {
                                                    path : 'flavor_id',
                                                    class: 'col-xs-6',
                                                    label: 'Instance Flavor',
                                                    dataBindValue : 'flavor_id',
                                                    elementConfig : {
                                                        placeholder: 'Select Flavor',
                                                        dataTextField : "text",
                                                        dataValueField : "id",
                                                        dataSource : {
                                                            type: 'remote',
                                                            url: ctwc.GOHAN_FLAVOR_URL + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                                            parse: function(result) {
                                                                return formatSvcTemplateCfg.flavorDropDownFormatter(result, model);
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                elementId: 'availability_zone_enable',
                                                view: "FormCheckboxView",
                                                viewConfig:
                                                  {
                                                       class: 'col-xs-6 no-label-input',
                                                       label: 'Availability Zone',
                                                       path: "availability_zone_enable",
                                                       dataBindValue: 'availability_zone_enable',
                                                       templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                       elementConfig : {
                                                            label:'Availability Zone',
                                                            isChecked:false
                                                        }
                                                  }
                                              }]
                                        }]
                                    }
                                }]
                            }]
                    }
                ] //End Rows
            }
        }
        return svcTemplateCfgViewConfig;
    }

    return SvcTemplateCfgEditView;
});
