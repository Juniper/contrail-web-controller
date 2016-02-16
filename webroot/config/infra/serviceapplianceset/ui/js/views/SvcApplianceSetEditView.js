/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.SVC_APPLIANCE_SET_GRID_ID;
    var prefixId = ctwl.SVC_APPLIANCE_SET_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var SvcApplianceSetEditView = ContrailView.extend({
        renderEditSvcApplianceSet: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureSvcApplianceSet(options['isEdit'], {
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
                                   getEditSvcApplianceSetViewConfig(options['isEdit']),
                                   "svcApplianceSetConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.svcApplProperties});
            });
        },
        renderDeleteSvcApplianceSet: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteSvcApplianceSet(options['checkedRows'], {
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
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'username',
                        view: 'FormInputView',
                        viewConfig: {
                            path: 'service_appliance_user_credentials.username',
                            label: 'User Name',
                            class: 'span6',
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
                            class: 'span6',
                            label: 'Password',
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
                            class: 'span12',
                            columns: [{
                                elementId: 'key',
                                name: 'Key',
                                view: "FormInputView",
                                viewConfig: {
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    placeholder: 'Enter Key',
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
                                {onClick: "function() { $root.addKeyValuePair(); }",
                                 iconClass: 'icon-plus'},
                                {onClick: "function() { $root.deleteKeyValuePair($data, this); }",
                                 iconClass: 'icon-minus'}
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

    function getSAInterfaceViewConfig () {
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
                            validations: 'svcApplInterfaceValidation',
                            collection: 'interfaces',
                            label: 'Interfaces',
                            columns: [{
                                elementId: 'interface_type',
                                name: 'Type',
                                view: 'FormDropdownView',
                                class: "", width: 150,
                                viewConfig: {
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    width: 150,
                                    path: 'interface_type',
                                    dataBindValue: 'interface_type()',
                                    elementConfig: {
                                        dataTextField: 'text',
                                        dataValueField: 'id',
                                        data: window.svcApplData.intfTypes
                                    }
                                }
                            },
                            {
                                elementId: 'interface_name',
                                name: 'Interface',
                                view: 'FormDropdownView',
                                class: "", width: 150,
                                viewConfig: {
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    width: 150,
                                    path: 'interface_name',
                                    dataBindValue: 'interface_name()',
                                    elementConfig: {
                                        dataTextField: 'text',
                                        dataValueField: 'id',
                                        data: window.svcApplData.piList
                                    }
                                }
                            }],
                            rowActions: [
                                {onClick: "function() { $root.deleteInterface($data, this); }",
                                 iconClass: 'icon-minus'}
                            ],
                            gridActions: [
                                {onClick: "function() { addInterface(); }", buttonTitle: "Add"}
                            ]
                        }
                    }]
                }]
            }
        }
    }

    function getEditSvcApplianceSetViewConfig (isDisabled) {
        var prefixId = ctwl.SVC_APPLIANCE_SET_PREFIX_ID;
        var svcApplianceSetViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_EDIT_SVC_APPLIANCE_SET]),
            title: ctwl.TITLE_EDIT_SVC_APPLIANCE_SET,
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
                                    placeholder: 'Enter Service Appliance Set' +
                                        ' Name',
                                    label: 'Service Appliance Set',
                                    path: 'display_name',
                                    class: 'span12',
                                    dataBindValue: 'display_name',
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'service_appliance_driver',
                                view: 'FormComboboxView',
                                viewConfig: {
                                    label: 'Load Balancer Driver',
                                    path: 'service_appliance_driver',
                                    class: 'span12',
                                    dataBindValue: 'service_appliance_driver',
                                    elementConfig: {
                                        placeholder: 'Select or Enter Load ' +
                                                     'Balancer Driver',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                            {text:
                                                'svc_monitor.services.loadbalancer.drivers.ha_proxy.driver.OpencontrailLoadbalancerDriver',
                                             value:
                                                'svc_monitor.services.loadbalancer.drivers.ha_proxy.driver.OpencontrailLoadbalancerDriver'}
                                            ]
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'service_appliance_ha_mode',
                                view: 'FormInputView',
                                viewConfig: {
                                    class: 'span12',
                                    placeholder: 'Enter HA Mode',
                                    path: 'service_appliance_ha_mode',
                                    label: 'HA Mode',
                                    dataBindValue: 'service_appliance_ha_mode'
                                }
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
        return svcApplianceSetViewConfig;
    }

    return SvcApplianceSetEditView;
});

