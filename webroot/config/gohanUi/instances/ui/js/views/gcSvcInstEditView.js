/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.SERVICE_INSTANCES_GRID_ID,
        prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form',
        done = 0, self;

    var SvcInstEditView = ContrailView.extend({
        renderInstEditPopup: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
            self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-980',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                                 self.model.gohanServiceInstanceUpdate({
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
                    $("#" + modalId).find(formId),
                    self.model, getConfigureViewConfig(false),
                    'svcInstValidations', null, null, function(){
                        self.model.showErrorAttr(prefixId +
                                        cowc.FORM_SUFFIX_ID, false);
                        Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
               }, null, false);
        },
        renderGohanSvcInsDeletePopup : function(options){
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var selectedGridData = options['selectedGridData'];
            var self = this;
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function(){
                   self.model.deleteGohanSvcInstance(selectedGridData[0], {
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
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            var obj = {name: 'service_instances', url: 'local_service_instance', key: 'local_service_instance'};
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

           this.fetchLocation(this ,
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
        fetchLocation : function(self, callback) {
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
        renderConfigureSvcInst: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
            self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                                 self.model.addSvcInstanceCfg({
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
                                 });
                             }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
           this.fetchData(self, function(configDetails) {
                configDetails.svcInstanceDataObj = self.model.svcInstanceDataObj;
                self.model.formatModelConfig(self.model.model().attributes,
                                                configDetails);
                self.renderSIView(self, options, configDetails);
            })
        },
        renderSIView: function (self, options, configDetails) {
            self.renderView4Config($("#" + modalId).find(formId),
                               self.model,
                               getAddSvcInstViewConfig(self, self.model, configDetails),
                               "svcInstValidations",
                               null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.interfaces});
                //permissions
                //ctwu.bindPermissionsValidation(self);
            }, null, false);
        },
        fetchData: function(self, callback) {
            var tenantId = contrail.getCookie('gohanProject');
            var ajaxConfig = [];
            var multArrFlag = false;
            ajaxConfig[0] =
                $.ajax({
                    url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_TENANT_PARAM + tenantId,
                    type: "GET"
                });
            $.when.apply($, ajaxConfig).then(
                function() {
                var results = arguments[0]['networks'];
                var allVNList = [];
                var vmiList = null;
                for(var i = 0; i < results.length; i++){
                    allVNList.push({text: results[i].name, id: results[i].id});
                }
                callback({
                    'allVNList' : allVNList
                    });
            }
        )}
    });
    var getConfigureViewConfig = function(isDisable) {
       return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_CREATE_SERVICE_INSTANCE]),
            view: "SectionView",
            title: "Service Instance",
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
    function getAddSvcInstViewConfig (self, model, configDetails) {
        var prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID;
        var svcInstViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_CREATE_SERVICE_INSTANCE]),
            title: "Service Instance",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    placeholder: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                }
                              },
                              {
                                  elementId: 'description',
                                  view: 'FormInputView',
                                  viewConfig: {
                                      label: 'Description',
                                      placeholder: 'Description',
                                      path: 'description',
                                      class: 'col-xs-6',
                                      dataBindValue: 'description',
                                  }
                                }
                       ]
                    },
                    {
                        columns: [{
                            elementId: 'scale_out_max_instances',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'Max Instances',
                                path: 'scale_out_max_instances',
                                class: 'col-xs-6',
                                dataBindValue: 'scale_out_max_instances',
                            }
                          },
                          {
                              elementId: 'service_template_id',
                              view: "FormDropdownView",
                              viewConfig: {
                                  path : 'service_template_id',
                                  class: 'col-xs-6',
                                  label: 'Service Template',
                                  dataBindValue : 'service_template_id',
                                  elementConfig : {
                                      change: function(data) {
                                          var svcTemp = self.model.svcInstanceDataObj.svcTmplsFormatted;
                                          for(var i = 0 ; i < svcTemp.length; i++){
                                              if(svcTemp[i].id === data.val){
                                                  var tmpl = svcTemp[i].text;
                                                  var id = svcTemp[i].text;
                                                  break;
                                              }
                                          }
                                          var intfTypeStrStart = tmpl.indexOf('(');
                                          var intfTypeStrEnd = tmpl.indexOf(')');
                                          var itfTypes =
                                              tmpl.substr(intfTypeStrStart + 1,
                                                          intfTypeStrEnd -
                                                          intfTypeStrStart - 1);
                                          var list = itfTypes.trim();
                                          var types = list.split(',');
                                          self.model.formatModelConfigColl(id,
                                                  types, false,
                                              self.model.svcInstanceDataObj.svcInstTmplts);
                                      },
                                      placeholder: 'Select template',
                                      dataTextField: "text",
                                      dataValueField: "id",
                                      data: configDetails.svcInstanceDataObj.svcTmplsFormatted
                                  }
                              }
                          }]
                    },
                    {
                        columns: [{elementId: 'interfaceCollectionAccordian',
                            title: 'Interface Details',
                            view: 'SectionView',
                            viewConfig: {
                                rows: [{
                                    columns: [{
                                        elementId: 'interfaces-collection',
                                        view: "FormCollectionView",
                                        viewConfig: {
                                            path: 'interfaces',
                                            collection: 'interfaces',
                                            validation: 'interfacesValidation',
                                            hideAdd:true,
                                            templateId: cowc.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW,
                                            rows: [
                                                {
                                                    columns: [{
                                                        elementId: 'interfaceType',
                                                        view: 'FormInputView',
                                                        class: "", width: 395,
                                                        name: 'Interface Type',
                                                        viewConfig: {
                                                            disabled: true,
                                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                            path: 'interfaceType',
                                                            dataBindValue: 'interfaceType()'
                                                        }
                                                    },
                                                    {
                                                        elementId: 'virtualNetwork',
                                                        view: 'FormDropdownView',
                                                        class: "", width: 370,
                                                        name: 'Virtual Network',
                                                        viewConfig: {
                                                            disabled: false,
                                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                            path: 'virtualNetwork',
                                                            dataBindValue: 'virtualNetwork()',
                                                            dataBindOptionList: 'allVNListData()',
                                                            elementConfig: {
                                                                minimumResultsForSearch: 1,
                                                                placeholder: 'Select Virtual Network'
                                                            }
                                                        }
                                                    }]
                                                }
                                            ]
                                        }
                                    }]
                                }]
                            }}]
                      }
                ]
            }
        }
        return svcInstViewConfig;
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
    return SvcInstEditView;
});

