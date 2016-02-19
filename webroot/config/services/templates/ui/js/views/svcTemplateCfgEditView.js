/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/services/templates/ui/js/views/svcTemplateCfgFormatters'],
    function (_, ContrailView, Knockback, SvcTemplateCfgFormatters) {
    var formatSvcTemplateCfg = new SvcTemplateCfgFormatters();
    var gridElId = '#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID;
    var prefixId = ctwl.CFG_SVC_TEMPLATE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var svcTemplateCfgEditView = ContrailView.extend({
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
                                   });
        },

        renderMultiDeleteSvcTemplateCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeleteSvcTemplateCfg(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getSvcTemplateCfgViewConfig (disableOnEdit, model) {
        var prefixId = ctwl.CFG_SVC_TEMPLATE_PREFIX_ID;
        var svcTemplateCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_SVC_TEMPLATE_TITLE_CREATE]),
            title: ctwl.CFG_SVC_TEMPLATE_TITLE_CREATE,
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
                                    class: 'span12',
                                    dataBindValue: 'name',
                                    disabled: disableOnEdit
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'Version',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:
                                        'user_created_version',
                                    class: 'span6',
                                    dataBindValue:
                                        'user_created_version',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data: [{id: 1, text: 'v1'},
                                               {id: 2, text: 'v2'}]
                                    }
                                }
                            },
                            {
                                elementId: 'virtualization_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path :
                                        'user_created_service_virtualization_type',
                                    class: 'span6',
                                    dataBindValue :
                                            'user_created_service_virtualization_type',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'virtual-machine', text:'Virtual Machine'},
                                                {id: 'physical-device', text:'Physical Device'}]
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'user_created_service_mode',
                                view: "FormDropdownView",
                                viewConfig: {
                                    visible: 'isSvcVirtTypeNonPhysicalDevice',
                                    path : 'user_created_service_mode',
                                    class: 'span6',
                                    label: 'Service Mode',
                                    dataBindValue : 'user_created_service_mode',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'transparent', text:'Transparent'},
                                                {id: 'in-network', text:'In-Network'},
                                                {id: 'in-network-nat', text:'In-Network Nat'}]
                                    }
                                }
                            },
                            {
                                elementId: 'user_created_service_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    visible: 'isSvcVirtTypeNonPhysicalDevice',
                                    path : 'user_created_service_type',
                                    label: 'Service Type',
                                    class: 'span6',
                                    dataBindValue : 'user_created_service_type',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        data : [{id: 'firewall', text:'Firewall'},
                                                {id: 'analyzer', text:'Analyzer'}]
                                    }
                                }
                            }
                        ]
                    },

                    {
                        columns: [
                            {
                                elementId: 'image_name',
                                view: "FormDropdownView",
                                viewConfig: {
                                    visible: 'showImageList',
                                    label: 'Image Name',
                                    path : 'service_template_properties.image_name',
                                    class: 'span12',
                                    dataBindValue : 'service_template_properties().image_name',
                                    elementConfig : {
                                        placeholder: 'Select Image',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource : {
                                            type: 'remote',
                                            url: '/api/tenants/config/service-template-images',
                                            parse: function(result) {
                                                return formatSvcTemplateCfg.imageDropDownFormatter(result,
                                                                                                   model);
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
                                elementId: 'service_appliance_set',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Service Appliance Set',
                                    path : 'service_appliance_set',
                                    class: 'span12',
                                    visible: 'isSvcVirtTypePhysicalDevice',
                                    dataBindValue : 'service_appliance_set',
                                    elementConfig : {
                                        placeholder: 'Select Service Appliance Set',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource : {
                                            type: 'remote',
                                            url: '/api/admin/config/get-data?type=service-appliance-set',
                                            parse: formatSvcTemplateCfg.svcApplSetDropDownFormatter
                                        }
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
                                                     validation:
                                                         'svcTemplateInterfaceConfigValidations',
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
                                                             width: 400,
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
                                                             disabled:
                                                                '$root.disableSharedIP($root, $data)',
                                                             visible:
                                                                '$root.showIntfTypeParams($root)',
                                                             templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                             width: 80,
                                                             path: "shared_ip",
                                                             dataBindValue: 'shared_ip()'
                                                            }
                                                        },
                                                        {
                                                          elementId: 'static_route_enable',
                                                          name: 'Static Routes',
                                                          view: "FormCheckboxView",
                                                          class: "text-center", width: 100,
                                                          viewConfig:
                                                            {
                                                             visible:
                                                                '$root.showIntfTypeParams($root)',
                                                             disabled:
                                                                 '$root.disableStaticRoute($root, $data)',
                                                             templateId: cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                                                             path: "static_route_enable",
                                                             dataBindValue:
                                                                 'static_route_enable()'
                                                            }
                                                        }
                                                      ],
                                                     rowActions: [
                                                         {onClick: "function() {\
                                                             $root.addSvcTemplateInterface();\
                                                             }",
                                                             iconClass: 'icon-plus'},
                                                         {onClick: "function() {\
                                                             $root.deleteSvcTemplateInterface($root, $data, this);\
                                                            }",
                                                          iconClass: 'icon-minus'}
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
                        }
                    ]
                },
                {
                    columns: [
                        {
                        elementId: 'advanced_options',
                        view: "AccordianView",
                        viewConfig: [
                            {
                            visible: 'showIfNotTmplV2',
                            elementId: 'advanced',
                            title: 'Advanced Options',
                            view: "SectionView",
                            viewConfig: {
                                    rows: [
                                    {
                                        columns: [
                                        {
                                            elementId: 'user_created_service_scaling',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                label: 'Service Scaling',
                                                path : 'user_created_service_scaling',
                                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                class : "span6",
                                                dataBindValue : 'user_created_service_scaling',
                                                elementConfig : {
                                                    label:'Service Scaling',
                                                    isChecked:false
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'availability_zone_enable',
                                            view: "FormCheckboxView",
                                            viewConfig : {
                                                visible: 'isSvcVirtTypeNonPhysicalDevice',
                                                label: 'Availability Zone',
                                                path : 'service_template_properties.availability_zone_enable',
                                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                class : "span6",
                                                dataBindValue : 'service_template_properties().availability_zone_enable',
                                                elementConfig : {
                                                    label:'Availability Zone',
                                                    isChecked:false
                                                }
                                            }
                                        }]
                                    },
                                    {
                                        columns: [
                                        {
                                            elementId: 'flavor',
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                visible: 'isSvcVirtTypeNonPhysicalDevice',
                                                label: 'Instance Flavor',
                                                path : 'service_template_properties.flavor',
                                                class: 'span12',
                                                dataBindValue : 'service_template_properties().flavor',
                                                elementConfig : {
                                                    placeholder: 'Select Flavor',
                                                    dataTextField : "text",
                                                    dataValueField : "id",
                                                    dataSource : {
                                                        type: 'remote',
                                                        url: '/api/tenants/config/system-flavors',
                                                        parse: function(result) {
                                                            return formatSvcTemplateCfg.flavorDropDownFormatter(result,
                                                                                                                model);
                                                        }
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                                }
                            }]
                        }]
                }] //End Rows
            }
        }
        return svcTemplateCfgViewConfig;
    }

    return svcTemplateCfgEditView;
});
