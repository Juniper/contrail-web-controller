/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/gohanUi/server/ui/js/views/gcServerFormatters'],
    function (_, ContrailView, Knockback, GcServerFormatters) {
    var gridElId = '#' + ctwl.CFG_SERVER_GRID_ID;
    var prefixId = ctwl.CFG_SERVER_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var gcServerFormatters = new GcServerFormatters();
    var serverEditView = ContrailView.extend({
        renderAddServer: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
               self.model.addEditServer({
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
                }, 'POST');
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getServerViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },
        renderEditServer: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditServer({
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
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getServerEditViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                }, null, false);
        },
        
        renderDeleteServer: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteServer(selectedGridData[0], {
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
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                                  self.model.configureServerLocation({
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

    function getServerViewConfig () {
        var prefixId = ctwl.CFG_SERVER_PREFIX_ID;
        var tenantId = contrail.getCookie('gohanProject');
        var serverViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_SERVER_TITLE_CREATE]),
            title: "Server",//permissions
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
                                elementId: 'image_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'image_id',
                                    class: 'col-xs-6',
                                    label: 'Image ID',
                                    dataBindValue: 'image_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Image',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_IMAGES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                            parse: function(result) {
                                                return gcServerFormatters.imageDropDownFormatter(result);
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'network_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'network_id',
                                    class: 'col-xs-6',
                                    label: 'Network ID',
                                    dataBindValue: 'network_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Network',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                            parse: function(result) {
                                                return gcServerFormatters.networkDropDownFormatter(result);
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
                                elementId: 'security_group_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'security_group_id',
                                    class: 'col-xs-6',
                                    label: 'Security Group ID',
                                    dataBindValue: 'security_group_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Security Group',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_SEC_GROUP + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                            parse: function(result) {
                                                return gcServerFormatters.secGrpDropDownFormatter(result);
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'flavor_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'flavor_id',
                                    class: 'col-xs-6',
                                    label: 'Flavor ID',
                                    dataBindValue: 'flavor_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Flavor',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_FLAVOR_URL + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                            parse: function(result) {
                                                return gcServerFormatters.flavorDropDownFormatter(result);
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return serverViewConfig;
    }
    function getServerEditViewConfig () {
        var prefixId = ctwl.CFG_SERVER_PREFIX_ID;
        var serverViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_SERVER_TITLE_CREATE]),
            title: "Server",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Description',
                                    placeholder: 'Description',
                                    path: 'description',
                                    class: 'col-xs-12',
                                    dataBindValue: 'description',
                                }
                            }
                        ]
                    }
                ]
        
            }
        }
        return serverViewConfig;
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
                                      width: 170,
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
                                      width: 180,
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
                                       width: 180,
                                       viewConfig: {
                                          disabled: false,
                                          placeholder: 'Description',
                                          templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                          path: 'description',
                                          dataBindValue: 'description()'
                                       }
                                    },
                                    {
                                        elementId: 'instanceId',
                                        name: 'Instance ID',
                                        view: "FormInputView",
                                        class: "",
                                        width: 200,
                                        viewConfig: {
                                           disabled: 'showLocation()',
                                           placeholder: 'Instance ID',
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'instanceId',
                                           dataBindValue: 'instanceId()'
                                        }
                                    },
                                    {
                                        elementId: 'console',
                                        name: 'Console',
                                        view: "FormInputView",
                                        class: "",
                                        width: 150,
                                        viewConfig: {
                                           disabled: 'showLocation()',
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'console',
                                           dataBindValue: 'console()'
                                        }
                                    },
                                    {
                                        elementId: 'status',
                                        name: 'Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 100,
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
                                        width: 150,
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
    return serverEditView;
});
