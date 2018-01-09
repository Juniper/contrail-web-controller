/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, Knockback, GlobalConfigFormatters) {
    var prefixId = ctwc.FORWARDING_CLASS_PREFIX_ID;
    var modalId = 'configure-' + prefixId,
        globalConfigFormatters = new GlobalConfigFormatters();
    var self;
    var forwardingClassEditView = ContrailView.extend({
        renderAddEditForwardingClass: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditForwardingClass(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.forwardingClassRenderView4Config(options);
        },

        configEditForwardingClass : function(options) {
            self.model.addEditForwardingClass({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options);
        },

        forwardingClassRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.EDIT_ACTION) ?  true : false;
            self.renderView4Config(
                $("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                getForwardingClassViewConfig(disableFlag, self),
                "fwdClassConfigValidations", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                   kbValidation.bind(self);
                   //permissions
                   ctwu.bindPermissionsValidation(self);
                }, null, true
            );
        },

        renderDeleteForwardingClass: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteForwardingClass(options['checkedRows'], {
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
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function getForwardingClassViewConfig (disableOnEdit, self) {
        var prefixId = ctwc.FORWARDING_CLASS_PREFIX_ID;
        var fwdClassViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_FORWARDING_CLASS]),
            title: "Forwarding Class",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [
                        {
                            elementId: 'forwarding_class_id',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'Forwarding Class',
                                path : 'forwarding_class_id',
                                class: 'col-xs-6',
                                disabled: disableOnEdit,
                                dataBindValue : 'forwarding_class_id',
                                placeholder: 'Enter Forwarding Class ID'
                           }
                        },
                        {
                            elementId: 'forwarding_class_dscp',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'DSCP bits',
                                path : 'forwarding_class_dscp',
                                class: 'col-xs-6',
                                dataBindValue : 'forwarding_class_dscp',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder: 'Enter or Select DSCP bits',
                                    dataSource: {
                                        type: "local",
                                        data: ctwc.QOS_DSCP_VALUES
                                    }
                                }
                           }
                        }
                    ]}, {
                    columns: [
                        {
                            elementId: 'forwarding_class_mpls_exp',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'MPLS EXP bits',
                                path : 'forwarding_class_mpls_exp',
                                class: 'col-xs-6',
                                dataBindValue : 'forwarding_class_mpls_exp',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder: 'Enter or Select MPLS EXP bits',
                                    dataSource: {
                                        type: "local",
                                        data: ctwc.QOS_MPLS_EXP_VALUES
                                    }
                                }
                           }
                        },
                        {
                            elementId: 'forwarding_class_vlan_priority',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'VLAN Priority bits',
                                path : 'forwarding_class_vlan_priority',
                                class: 'col-xs-6',
                                dataBindValue :
                                    'forwarding_class_vlan_priority',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder:
                                        'Enter or Select VLAN Priority bits',
                                    dataSource: {
                                        type: "local",
                                        data: ctwc.QOS_VLAN_PRIORITY_VALUES
                                    }
                                }
                           }
                        }
                    ]},  {
                    columns: [
                        {
                            elementId: 'qos_queue_refs',
                            view: 'FormComboboxView',
                            viewConfig: {
                                label: 'QoS Queue',
                                path : 'qos_queue_refs',
                                class: 'col-xs-6',
                                dataBindValue : 'qos_queue_refs',
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder: 'Enter or Select QoS Queue',
                                    dataSource: {
                                        type: "remote",
                                        requestType: "POST",
                                        url: ctwc.URL_GET_CONFIG_DETAILS,
                                        postData:
                                            JSON.stringify({data:
                                                [{type: "qos-queues"}]}),
                                        parse: function(result){
                                            var qosQueueDS = globalConfigFormatters.
                                            formatQoSQueueData(result);
                                            self.model.qosQueueDS = qosQueueDS;
                                            return qosQueueDS;
                                        }
                                    }
                                }
                           }
                        }
                     ]}
                ]
            }
        }
        return fwdClassViewConfig;
    };

    return forwardingClassEditView;
});

