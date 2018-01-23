/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_SVC_HEALTH_CHK_GRID_ID;
    var prefixId = ctwl.CFG_SVC_HEALTH_CHK_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var svcHealthChkCfgEditView = ContrailView.extend({
        renderAddSvcHealthChkCfg: function (options) {
            //template has SM references needs to be fixed
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditSvcHealthChkCfg({
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
                                    getSvcHealthChkCfgViewConfig(false, self),
                                    "svcHealthChkCfgConfigValidations", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
                //permissions
                ctwu.bindPermissionsValidation(self);
                                    }, null, true);
        },

        renderEditSvcHealthChkCfg: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditSvcHealthChkCfg({
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
                                    getSvcHealthChkCfgViewConfig(true, self),
                                    "svcHealthChkCfgConfigValidations", null, null,
                                    function () {
                var monitorType =  getValueByJsonPath(self.model.model(),
                        'attributes;service_health_check_properties;monitor_type', "PING");
                var healthCheckType =  getValueByJsonPath(self.model.model(),
                        'attributes;service_health_check_properties;health_check_type', "link-local");
                self.model.user_created_monitor_type(monitorType);
                self.model.user_created_health_check_type(healthCheckType);
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
                //permissions
                ctwu.bindPermissionsValidation(self);
                                    }, null, true);
        },

        renderMultiDeleteSvcHealthChkCfg: function(options) {
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeleteSvcHealthChkCfg(options['checkedRows'], {
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getSvcHealthChkCfgViewConfig (disableOnEdit, self) {
        var prefixId = ctwl.CFG_SVC_HEALTH_CHK_PREFIX_ID;
        var svcHealthChkCfgViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.CFG_SVC_HEALTH_CHK_TITLE_CREATE]),
            title: "Health Check Service",
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
                                path : 'name',
                                class: 'col-xs-12',
                                disabled: disableOnEdit,
                                dataBindValue : 'name',
                                placeholder: 'Health Check Service Name'
                           }
                        },
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'user_created_health_check_type',
                            view: "FormDropdownView",
                            viewConfig: {
                                path :
                                    'user_created_health_check_type',
                                class: 'col-xs-6',
                                dataBindValue :
                                    'user_created_health_check_type',
                                label: 'Health Check Type',
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    placeholder : 'Select Health Check Type',
                                    change: function(data) {
                                        if(data.val === 'end-to-end'){
                                            self.model.monitor_type_list([{id: 'PING', text:'PING'},{id: 'HTTP', text:'HTTP'}]);
                                        }else{
                                            self.model.monitor_type_list([{id: 'PING', text:'PING'}, {id: 'HTTP', text:'HTTP'}, {id: 'BFD', text:'BFD'}]);
                                        }
                                     },
                                    data : [{id: 'link-local',
                                                text:'Link-Local'},
                                            {id: 'end-to-end',
                                                text:'End-To-End'},
                                            {id: 'segment',
                                                 text:'Segment'},
                                                ]
                                }
                            }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'user_created_monitor_type',
                            view: "FormDropdownView",
                            viewConfig: {
                                path : 'user_created_monitor_type',
                                class: 'col-xs-6',
                                dataBindValue :
                                    'user_created_monitor_type',
                                label: 'Protocol',
                                dataBindOptionList : "monitor_type_list",
                                disabled: 'user_created_health_check_type() == "segment"',
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    placeholder : 'Select Probe Type'
                                }
                            }
                        },
                        {
                            elementId: 'url_path',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label:'Monitor Target',
                                path : 'service_health_check_properties.url_path',
                                class: 'col-xs-6',
                                dataBindValue : 'service_health_check_properties().url_path',
                                visible: 'user_created_health_check_type() != "segment"',
                                elementConfig: {
                                    placeholder: 'local-ip ' +
                                            'or URI or ip [ :port]',
                                    dataTextField : "text",
                                    dataValueField : "value",
                                    dataSource: {
                                        type: 'local',
                                        data : [
                                            {'value': 'local-ip',
                                             'text': 'local-ip'}
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
                            elementId: 'expected_codes',
                            view: 'FormInputView',
                            viewConfig: {
                                visible: 'user_created_monitor_type() === "HTTP"',
                                templateId: ctwc.CONTROLLER_CONFIG_INPUT_VIEW_TEMPLATE,
                                label:'expected_codes_label',
                                path : 'service_health_check_properties.expected_codes',
                                class: 'col-xs-6',
                                dataBindValue : 'service_health_check_properties().expected_codes'
                           }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'delay',
                            view: 'FormInputView',
                            viewConfig: {
                                templateId: ctwc.CONTROLLER_CONFIG_INPUT_VIEW_TEMPLATE,
                                label:'delay_label',
                                path : 'service_health_check_properties.delay',
                                class: 'col-xs-6',
                                dataBindValue : 'service_health_check_properties().delay',
                                placeholder: 'Delay between Health Check attempts'
                           }
                        },
                        {
                                elementId: 'timeout',
                                view: 'FormInputView',
                                viewConfig: {
                                    templateId: ctwc.CONTROLLER_CONFIG_INPUT_VIEW_TEMPLATE,
                                    label:'timeout_label',
                                    path : 'service_health_check_properties.timeout',
                                    class: 'col-xs-6',
                                    dataBindValue : 'service_health_check_properties().timeout',
                                    placeholder: 'Timeout for single Health Check attempt'
                               }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'delayUsecs',
                            view: 'FormInputView',
                            viewConfig: {
                                visible: 'user_created_monitor_type() === "BFD"',
                                label: 'Desired Min Tx Interval (micro secs)',
                                path : 'service_health_check_properties.delayUsecs',
                                class: 'col-xs-6',
                                dataBindValue : 'service_health_check_properties().delayUsecs',
                                placeholder: 'Delay in micro secs'
                           }
                        },
                        {
                                elementId: 'timeoutUsecs',
                                view: 'FormInputView',
                                viewConfig: {
                                    visible: 'user_created_monitor_type() === "BFD"',
                                    label: 'Required Min Rx Interval (micro secs)',
                                    path : 'service_health_check_properties.timeoutUsecs',
                                    class: 'col-xs-6',
                                    dataBindValue : 'service_health_check_properties().timeoutUsecs',
                                    placeholder: 'Timeout in micro secs'
                               }
                        }
                    ]
                },
                {
                    columns: [
                        {
                            elementId: 'max_retries',
                            view: 'FormInputView',
                            viewConfig: {
                                templateId: ctwc.CONTROLLER_CONFIG_INPUT_VIEW_TEMPLATE,
                                label:'max_retries_label',
                                path : 'service_health_check_properties.max_retries',
                                class: 'col-xs-6',
                                dataBindValue : 'service_health_check_properties().max_retries',
                                placeholder: 'Retries to attempt before declaring a failure'
                           }
                        }
                    ]
                },
                ]  // End Rows
            }
        }
        return svcHealthChkCfgViewConfig;
    }

    return svcHealthChkCfgEditView;
});
