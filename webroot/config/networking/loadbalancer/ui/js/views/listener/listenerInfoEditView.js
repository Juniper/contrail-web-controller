/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.CONFIG_LISTENER_INFO_GRID_ID,
        prefixId = ctwc.CONFIG_LISTENER_INFO_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var listenerInfoEditView = ContrailView.extend({
        renderEditListenerInfo: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.updateListener({
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
                                   this.model,
                                   listenerInfoViewConfig(),
                                   "",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var listenerInfoViewConfig = function () {
        return {
            elementId: ctwc.CONFIG_LISTENER_INFO_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "display_name",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "display_name",
                                    label: 'Name',
                                    dataBindValue: "display_name",
                                    class: "col-xs-6"
                                }
                            },
                            {
                                elementId: "description",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "description",
                                    label: 'Description',
                                    dataBindValue: "description",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'protocol',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Protocol',
                                    path : 'protocol',
                                    class: 'col-xs-6',
                                    disabled: true,
                                    dataBindValue :
                                        'protocol',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        placeholder : 'Select Protocol',
                                        data : [{id: 'HTTP', text:'HTTP'},
                                                {id: 'HTTPS', text:'HTTPS'},
                                                {id: 'TCP', text:'TCP'},
                                                {id: 'TERMINATED_HTTPS', text:'TERMINATED_HTTPS'}]
                                    }
                                }
                            },
                            {
                                elementId: "protocol_port",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "protocol_port",
                                    disabled: true,
                                    label: 'Protocol Port',
                                    dataBindValue: "protocol_port",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: "connection_limit",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "connection_limit",
                                    type:'number',
                                    label: 'Connection Limit',
                                    dataBindValue: "connection_limit",
                                    class: "col-xs-6"
                                }
                            },{
                                elementId: 'admin_state',
                                view: "FormCheckboxView",
                                viewConfig : {
                                    path : 'admin_state',
                                    class : "col-xs-6",
                                    label:'Admin State',
                                    dataBindValue : 'admin_state',
                                    elementConfig : {
                                        isChecked:false
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return listenerInfoEditView;
});

