/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_IMAGE_GRID_ID;
    var prefixId = ctwl.CFG_IMAGE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var imageEditView = ContrailView.extend({
        renderAddImage: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
               self.model.addEditImage({
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
                                    getImageViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },
        renderEditImage: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditImage({
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
                                    getImageEditViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                }, null, false);
        },
        renderDeleteImage: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteImage(selectedGridData[0], {
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
            var obj = {name: 'images', url: 'local_images', key: 'local_image'};
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                                  self.model.configureLocation(obj,{
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

    function getImageViewConfig () {
        var prefixId = ctwl.CFG_IMAGE_PREFIX_ID;
        var imageViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_IMAGE_TITLE_CREATE]),
            title: "Image",//permissions
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
                                elementId: 'url',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'URL',
                                    placeholder: 'URL',
                                    path: 'url',
                                    class: 'col-xs-6',
                                    dataBindValue: 'url',
                                }
                            },
                            {
                                elementId: 'is_public',
                                view: "FormCheckboxView",
                                viewConfig:
                                  {
                                       class: 'col-xs-6 no-label-input',
                                       label: 'Is Public',
                                       path: "is_public",
                                       dataBindValue: 'is_public',
                                       templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                       elementConfig : {
                                            label:'Is Public',
                                            isChecked:false
                                        }
                                  }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'disk_format',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'disk_format',
                                    class: 'col-xs-6',
                                    label: 'Disk Format',
                                    dataBindValue: 'disk_format',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Disk Format',
                                        dataValueField: 'id',
                                        data : [{text:'raw', id:'raw' },
                                                {text:'vhd', id:'vhd' },
                                                {text:'vmdk', id:'vmdk' },
                                                {text:'vdi', id:'vdi' },
                                                {text:'iso', id:'iso' },
                                                {text:'qcow2', id:'qcow2' },
                                                {text:'aki', id:'aki' },
                                                {text:'ari', id:'ari' },
                                                {text:'ami', id:'ami' }
                                               ]
                                    }
                                }
                            },
                            {
                                elementId: 'container_format',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'container_format',
                                    class: 'col-xs-6',
                                    label: 'Container Format',
                                    dataBindValue: 'container_format',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Container Format',
                                        dataValueField: 'id',
                                        data : [{text:'ami', id:'ami' },
                                                {text:'ari', id:'ari' },
                                                {text:'aki', id:'aki' },
                                                {text:'bare', id:'bare' },
                                                {text:'ovf', id:'ovf' },
                                                {text:'ova', id:'ova' },
                                                {text:'docker', id:'docker' }
                                               ]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'min_disk',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Min Disk',
                                    placeholder: 'Min Disk',
                                    path: 'min_disk',
                                    class: 'col-xs-6',
                                    dataBindValue: 'min_disk',
                                }
                            },
                            {
                                elementId: 'min_ram',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Min RAM',
                                    placeholder: 'Min RAM',
                                    path: 'min_ram',
                                    class: 'col-xs-6',
                                    dataBindValue: 'min_ram',
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'protected',
                                view: "FormCheckboxView",
                                viewConfig:
                                  {
                                       class: 'col-xs-6 no-label-input',
                                       label: 'Protected',
                                       path: 'protected',
                                       dataBindValue: 'protected',
                                       templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                       elementConfig : {
                                            label:'Protected',
                                            isChecked:false
                                        }
                                  }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return imageViewConfig;
    }
    function getImageEditViewConfig () {
        var prefixId = ctwl.CFG_IMAGE_PREFIX_ID;
        var serverViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_IMAGE_TITLE_CREATE]),
            title: "Image",
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
    return imageEditView;
});
