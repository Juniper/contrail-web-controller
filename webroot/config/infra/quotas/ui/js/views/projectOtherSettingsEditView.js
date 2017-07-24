/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.CONFIG_PROJECT_OTHER_SETTINGS_GRID_ID,
        prefixId = ctwc.CONFIG_PROJECT_OTHER_SETTINGS_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var projectOtherSettingsEditView = ContrailView.extend({
        renderEditProjectOtherSettings: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureProjectOtherSettings(options.projUUID, {
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
                                   projectOtherSettingsViewConfig(),
                                   "projectOtherSettingsValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var projectOtherSettingsViewConfig = function () {
        return {
            elementId: ctwc.CONFIG_PROJECT_OTHER_SETTINGS_VIEW_CONFIG_SECTION_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [{
                            elementId: 'vxlan_routing',
                            view: "FormDropdownView",
                            viewConfig : {
                                path : 'vxlan_routing',
                                class : "col-xs-6",
                                label: 'VxLAN Routing',
                                dataBindValue : 'vxlan_routing',
                                elementConfig : {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    data: [{text: "Enabled", value: "enabled"},
                                           {text: "Disabled", value: "disabled"}]
                                }
                            }
                        }]
                    }
                ]
            }
        }
    };

    return projectOtherSettingsEditView;
});

