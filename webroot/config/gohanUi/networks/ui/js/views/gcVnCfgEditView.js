/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_VN_GRID_ID;
    var prefixId = ctwl.CFG_VN_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var vnCfgEditView = ContrailView.extend({
        renderAddVNCfg: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditVNCfg({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Needs to be fixed, id doesnt work
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                    cowc.FORM_SUFFIX_ID,
                                                    error.responseText);
                        });
                    }
                }, 'POST');
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" +
                                    modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getVNCfgViewConfig(false),
                                    "vnCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },

        renderEditVNCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditVNCfg({
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
                }, 'PUT');
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" +
                                    modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getVNCfgViewConfig(true),
                                    "vnCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                }, null, false);
        },

        renderDeleteVNCfg: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteVNCfg(selectedGridData[0], {
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        },
        renderLocationGridPopup: function(options){
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            var obj = {name: 'networks', url: 'local_networks', key: 'local_network'};
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
        }
    });
    function policiesDropDownFormatter(model){
        var list = model[Object.keys(model)[0]], policies = [];
        $.each(list, function (i, obj) {
           policies.push({id: obj.id, text: obj.name});
        });
        return policies;
    };
    function getVNCfgViewConfig (isDisable) {
        var prefixId = ctwl.CFG_VN_PREFIX_ID;
        var tenantId = contrail.getCookie('gohanProject');
        var vnCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_VN_TITLE_CREATE]),
            title: "Network",//permissions
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    disabled: isDisable,
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
                        columns: [
                            {
                                elementId: 'cidr',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Subnet',
                                    disabled: isDisable,
                                    placeholder: 'xxx.xxx.xxx.xxx/xx',
                                    path: 'cidr',
                                    class: 'col-xs-6',
                                    dataBindValue: 'cidr'
                                }
                            },
                            {
                                elementId: 'local_prefix_len',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Local Prefix',
                                    disabled: isDisable,
                                    path: 'local_prefix_len',
                                    class: 'col-xs-6',
                                    dataBindValue: 'local_prefix_len'
                                 }
                            }
                        ]
                    },
                    {
                        columns: [{
                                    elementId: 'policies',
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        label: 'Network Policy (s)',
                                        class: "col-xs-12",
                                        path: "policies",
                                        dataBindValue: "policies",
                                        elementConfig:{
                                            placeholder:"Select Network Policies",
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                            dataSource : {
                                                type: 'remote',
                                                url: ctwc.GOHAN_NETWORK_POLICY + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                                parse: function(result) {
                                                    return policiesDropDownFormatter(result);
                                                }
                                            }
                                         }
                                    }
                               }]
                       }
                ]  // End Rows
            }
        }
        return vnCfgViewConfig;
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
                                       width: 250,
                                       viewConfig: {
                                          disabled: false,
                                          placeholder: 'Description',
                                          templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                          path: 'description',
                                          dataBindValue: 'description()'
                                       }
                                    },
                                    {
                                        elementId: 'subnet',
                                        name: 'Subnet',
                                        view: "FormInputView",
                                        class: "",
                                        width: 160,
                                        viewConfig: {
                                           disabled: 'showLocation()',
                                           placeholder: 'xxx.xxx.xxx.xxx/xx',
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'subnet',
                                           dataBindValue: 'subnet()'
                                        }
                                    },
                                    {
                                        elementId: 'status',
                                        name: 'Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 180,
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
                                        width: 190,
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
    return vnCfgEditView;
});
