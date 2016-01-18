/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/routetable/ui/js/RtTableUtils'
], function (_, ContrailView, Knockback, RtTableUtils) {
    var gridElId = '#' + ctwl.RT_TABLE_GRID_ID;
    var prefixId = ctwl.RT_TABLE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var rtUtils = new RtTableUtils();

    var RtTableEditView = ContrailView.extend({
        renderConfigureRtTable: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureRtTable(options['type'],
                                            options['projFqn'],
                                            options['dataItem'], {
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

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getEditRtTableViewConfig(options['isEdit']),
                                   "rtTableConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        },
        renderDeleteRtTables: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteRtTables(options['type'], options['checkedRows'], {
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

    function getRtTableViewConfig () {
        return {
            elementId: 'route_table',
            title: 'Route Table',
            view: 'SectionView',
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'routes',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            path: 'routes',
                            collection: 'routes',
                            validation: 'routesValidation',
                            class: "span12",
                            columns: [{
                                elementId: 'prefix',
                                view: 'FormInputView',
                                class: "",
                                name: 'Prefix',
                                viewConfig: {
                                    width: 150,
                                    placeholder: 'Prefix',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'prefix',
                                    dataBindValue: 'prefix()'
                                }
                            },
                            {
                                elementId: 'next_hop',
                                view: 'FormInputView',
                                class: "",
                                name: 'Next Hop',
                                viewConfig: {
                                    placeholder: 'Next Hop',
                                    width: 150,
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'next_hop',
                                    dataBindValue: 'next_hop()'
                                }
                            },
                            {
                                elementId: 'next_hop_type',
                                view: 'FormInputView',
                                class: "",
                                name: 'Next Hop Type',
                                viewConfig: {
                                    placeholder: 'Next Hop Type',
                                    width: 150,
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'next_hop_type',
                                    dataBindValue: 'next_hop_type()'
                                }
                            },
                            {
                                elementId: 'community_attr',
                                view: 'FormTextAreaView',
                                class: "",
                                name: 'Community Attributes',
                                viewConfig: {
                                    width: 200,
                                    placeHolder: 'Attributes seperated by ' +
                                        'comma or press enter',
                                    templateId: cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                                    path: 'community_attr',
                                    dataBindValue: 'community_attr()'
                                }
                            }],
                            rowActions: [
                                { onClick: "function() { $root.deleteRtTable($data, this); }",
                                  iconClass: 'icon-minus'},
                            ],
                            gridActions: [
                                { onClick: "function() { $root.addRtTable(); }",
                                  iconClass: 'icon-plus',
                                  buttonTitle: 'Add Routes'}
                            ]
                        }
                    }]
                }]
            }
        }
    }

    function getEditRtTableViewConfig (isDisable) {
        var prefixId = ctwl.RT_TABLE_PREFIX_ID;
        var rtTableViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_RT_TABLE]),
            title: ctwl.TITLE_EDIT_RT_TABLE,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'display_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Name',
                            placeholder: 'Enter Route Table Name',
                            path: 'display_name',
                            class: 'span9',
                            dataBindValue: 'display_name',
                            placeHolder: 'Security Group Name',
                        }
                    }]
                },
                {
                    columns: [{
                        elementId: 'routesCollection',
                        view: 'AccordianView',
                        viewConfig: [
                            getRtTableViewConfig()
                        ]
                    }]
                }]
            }
        }
        return rtTableViewConfig;
    }

    return RtTableEditView;
});


