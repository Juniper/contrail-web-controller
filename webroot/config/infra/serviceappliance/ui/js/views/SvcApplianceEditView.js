/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.SVC_APPLIANCE_GRID_ID;
    var prefixId = ctwl.SVC_APPLIANCE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var SvcApplianceEditView = ContrailView.extend({
        renderEditSvcAppliance: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureSvcAppliance(options['isEdit'], {
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
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   self.model,
                                   getEditSvcApplianceViewConfig(options['isEdit'], self.model),
                                   "svcApplianceConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.interfaces});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.svcApplProperties});
                //permissions
                ctwu.bindPermissionsValidation(self);
            }, null, true);
        },
        renderDeleteSvcAppliance: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteSvcAppliance(options['checkedRows'], {
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

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
            kbValidation.bind(self);
        }

    });


    function userCredentialsViewConfig ()
    {
        return {
            elementId: 'user_credentials',
            title: 'User Credentials',
            view: 'SectionView',
            active: false,
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'username',
                        view: 'FormInputView',
                        viewConfig: {
                            path: 'service_appliance_user_credentials.username',
                            placeholder: 'Enter User Name',
                            label: 'User Name',
                            class: 'col-xs-6',
                            dataBindValue:
                                    'service_appliance_user_credentials().username',
                        }
                    },
                    {
                        elementId: 'password',
                        view: 'FormInputView',
                        viewConfig: {
                            path:
                                'service_appliance_user_credentials.password',
                            class: 'col-xs-6',
                            placeholder: 'Enter Password',
                            label: 'Password',
                            type: 'password',
                            dataBindValue:
                                    'service_appliance_user_credentials().password'
                        }
                    }]
               }]
            }
        }
    }

    function advancedOptionsViewConfig () {
        return {
            elementId: 'advanced_options',
            title: 'Advanced Options',
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'svcApplProperties',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            path: 'svcApplProperties',
                            collection: 'svcApplProperties',
                            validation: 'svcApplPropValidation',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            class: 'col-xs-12',
                            columns: [{
                                elementId: 'key',
                                name: 'Key',
                                view: "FormInputView",
                                viewConfig: {
                                    placeholder: 'Enter Key',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    width: 200,
                                    path: 'key',
                                    dataBindValue: 'key()'
                                }
                            },
                            {
                                elementId: 'value',
                                name: 'Value',
                                view: "FormInputView",
                                viewConfig: {
                                    placeholder: 'Enter Value',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    width: 200,
                                    path: 'value',
                                    dataBindValue: 'value()'
                                }
                            }],
                            rowActions: [
                                 {onClick: "function() { $root.addKeyValuePairByIndex($data, this); }",
                                 iconClass: 'fa fa-plus'},
                                {onClick: "function() { $root.deleteKeyValuePair($data, this); }",
                                 iconClass: 'fa fa-minus'}
                            ],
                            gridActions: [
                                {onClick: "function() { addKeyValuePair(); }",
                                 buttonTitle: ""}
                            ]
                        }
                    }]
                }]
            }
        }
    }

    function physicalInterfaceListFormatter (response) {
        var result = [];
        if ((null == response) || (null == response['physical-interfaces'])) {
            return result;
        }
        var piData = response['physical-interfaces'];
        var len = piData.length;
        for (var i = 0; i < len; i++) {
            result.push({'text': piData[i]['fq_name'].join(':'),
                         'id': piData[i]['fq_name'].join(':') + ';' +
                         piData[i]['uuid']});
        }
        return result;
    }

    function getSAInterfaceViewConfig (svcApplModel) {
        return {
            elementId: 'saInterface',
            view: 'SectionView',
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'interfaces',
                        view: "FormEditableGridView",
                        viewConfig: {
                            path : 'interfaces',
                            class: 'col-xs-12',
                            validation: 'svcApplInterfaceValidation',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: 'interfaces',
                            label: 'Interfaces',
                            columns: [{
                                elementId: 'interface_type',
                                name: 'Type',
                                view: 'FormInputView',
                                class: "",
                                viewConfig: {
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    disabled: true,
                                    width: 150,
                                    path: 'interface_type',
                                    dataBindValue: 'interface_type()',
                                }
                            },
                            {
                                elementId: 'interface_name',
                                name: 'Interface',
                                view: 'FormDropdownView',
                                class: "",
                                viewConfig: {
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    width: 300,
                                    path: 'interface_name',
                                    dataBindValue: 'interface_name()',
                                    elementConfig: {
                                        placeholder: 'Select Physical Interface',
                                        dataTextField: 'text',
                                        dataValueField: 'id',
                                        data: svcApplModel.svcApplData.piList
                                    }
                                }
                            }]
                        }
                    }]
                }]
            }
        }
    }

    function getEditSvcApplianceViewConfig (isDisabled, svcApplModel) {
        var prefixId = ctwl.SVC_APPLIANCE_PREFIX_ID;
        var svcApplianceViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_SVC_APPLIANCE]),
            title: "Service Appliance",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'display_name',
                                view: 'FormInputView',
                                viewConfig: {
                                    disabled: isDisabled,
                                    placeholder: 'Enter Service Appliance Name',
                                    label: 'Service Appliance',
                                    path: 'display_name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'display_name',
                                }
                            },
                            {
                                elementId: 'service_appliance_ip_address',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'IP Address',
                                    placeholder: 'xxx.xxx.xxx.xxx',
                                    path: 'service_appliance_ip_address',
                                    class: 'col-xs-6',
                                    dataBindValue:
                                            'service_appliance_ip_address'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'service_appliance_set',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Service Appliance Set',
                                    disabled: true,
                                    path: 'service_appliance_set',
                                    class: 'col-xs-12',
                                    dataBindValue: 'service_appliance_set'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'service_template',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Service Template',
                                    disabled: true,
                                    path: 'service_template',
                                    class: 'col-xs-12',
                                    dataBindValue: 'service_template'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            getSAInterfaceViewConfig(svcApplModel)
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'userCredentials',
                                view: 'AccordianView',
                                viewConfig: [
                                    userCredentialsViewConfig()
                                ],
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'advancedOptions',
                                view: 'AccordianView',
                                viewConfig: [
                                    advancedOptionsViewConfig()
                                ]
                            }
                        ]
                    }
                ]
            }
        };
        return svcApplianceViewConfig;
    }

    return SvcApplianceEditView;
});
