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
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
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
                //permissions
                ctwu.bindPermissionsValidation(self);
            }, null, true);
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

    function getEditSvcApplianceSetViewConfig (isDisabled) {
        var prefixId = ctwl.SVC_APPLIANCE_SET_PREFIX_ID;
        var svcApplianceSetViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_EDIT_SVC_APPLIANCE_SET]),
            title: "Service Appliance Set",
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
                                    class: 'col-xs-12',
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
                                    class: 'col-xs-12',
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
                                    class: 'col-xs-12',
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
