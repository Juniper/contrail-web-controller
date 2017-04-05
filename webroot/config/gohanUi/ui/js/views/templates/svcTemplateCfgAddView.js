/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/gohanUi/ui/js/views/templates/svcTemplateCfgFormatters'],
    function (_, ContrailView, Knockback, SvcTemplateCfgFormatters) {
    var formatSvcTemplateCfg = new SvcTemplateCfgFormatters();
    var gridElId = '#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID;
    var prefixId = ctwl.CFG_SVC_TEMPLATE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var svcTemplateCfgAddView = ContrailView.extend({
        renderAddSvcTemplateCfg: function (options) {
            //template has SM references needs to be fixed
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
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
        }
    });

    function getSvcTemplateCfgViewConfig (disableOnEdit, model) {
        var tenantId = contrail.getCookie('gohanRole');
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
                                            url: './gohan_contrail/v1.0/tenant/images?sort_key=id&sort_order=asc&tenant_id='+tenantId,
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
				                                            url: './gohan_contrail/v1.0/tenant/flavors?sort_key=id&sort_order=asc&tenant_id='+tenantId,
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

    return svcTemplateCfgAddView;
});
