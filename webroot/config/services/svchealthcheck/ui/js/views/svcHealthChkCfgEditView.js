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
                                    getSvcHealthChkCfgViewConfig(false),
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
                                    getSvcHealthChkCfgViewConfig(true),
                                    "svcHealthChkCfgConfigValidations", null, null,
                                    function () {
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
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getSvcHealthChkCfgViewConfig (disableOnEdit) {
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
                                class: 'span12',
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
                            elementId: 'monitor_type',
                            view: "FormDropdownView",
                            viewConfig: {
                                path : 'service_health_check_properties.monitor_type',
                                class: 'span6',
                                dataBindValue :
                                    'service_health_check_properties().monitor_type',
                                label: 'Protocol',
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    placeholder : 'Select Probe Type',
                                    data : [{id: 'PING',
                                                text:'PING'},
                                            {id: 'HTTP',
                                                text:'HTTP'}]
                                }
                            }
                        },
                        {
                            elementId: 'url_path',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label:'Monitor Target',
                                path : 'service_health_check_properties.url_path',
                                class: 'span6',
                                dataBindValue : 'service_health_check_properties().url_path',
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
                            elementId: 'delay',
                            view: 'FormInputView',
                            viewConfig: {
                                label:'Delay (secs)',
                                path : 'service_health_check_properties.delay',
                                class: 'span6',
                                dataBindValue : 'service_health_check_properties().delay',
                                placeholder: 'Delay between Health Check attempts'
                           }
                        },
                        {
                                elementId: 'timeout',
                                view: 'FormInputView',
                                viewConfig: {
                                    label:'Timeout (secs)',
                                    path : 'service_health_check_properties.timeout',
                                    class: 'span6',
                                    dataBindValue : 'service_health_check_properties().timeout',
                                    placeholder: 'Timeout for single Health Check attempt'
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
                                label:'Retries',
                                path : 'service_health_check_properties.max_retries',
                                class: 'span6',
                                dataBindValue : 'service_health_check_properties().max_retries',
                                placeholder: 'Retries to attempt before declaring a failure'
                           }
                        },
                        {
                            elementId: 'health_check_type',
                            view: "FormDropdownView",
                            viewConfig: {
                                path :
                                    'service_health_check_properties.' +
                                    'health_check_type',
                                class: 'span6',
                                dataBindValue :
                                    'service_health_check_properties().' +
                                    'health_check_type',
                                label: 'Health Check Type',
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    placeholder : 'Select Health Check Type',
                                    data : [{id: 'link-local',
                                                text:'Link-Local'},
                                            {id: 'end-to-end',
                                                text:'End-To-End'}]
                                }
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
