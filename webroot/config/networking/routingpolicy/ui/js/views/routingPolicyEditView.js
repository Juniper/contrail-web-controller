/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/routingpolicy/ui/js/views/routingPolicyFormatter',
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             RoutingPolicyFormatter) {
    var routingPolicyFormatter = new RoutingPolicyFormatter();
    var prefixId = ctwl.ROUTING_POLICY_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        externalGatewayDS = [],
        popupData = [];

    var RoutingPolicyEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderRoutingPolicyPopup: function (options) {
            var editLayout = editTemplate(
                {modalId: modalId, prefixId: prefixId}),
                self = this;
            var footer = [];
            footer.push({
                id: 'cancelBtn',
                title: 'Cancel',
                onclick: function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                },
                onKeyupEsc: true
            });
            footer.push({
                className: 'btn-primary btnSave',
                title: (options['btnName']) ? options['btnName'] : 'Save',
                onclick: function () {
                    self.model.configureRoutingPolicy(options['mode'],
                        popupData,
                        {
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
                                    self.model.showErrorAttr(
                                        prefixId + cowc.FORM_SUFFIX_ID,
                                        error.responseText);
                                });
                            }
                        });
                }
            });
            cowu.createModal(
                {
                    'modalId': modalId,
                    className: 'modal-700',
                    'title': options['title'],
                    'body': editLayout,
                    'footer': footer
                });
            var disableElement = false
            if (options['mode'] == "edit") {
                disableElement = true;
            }
            self.renderView4Config(
                $("#" + modalId).find("#" + modalId + "-form"), self.model,
                    getConfigureViewConfig(disableElement), 'routingPolicyValidations', null, null, function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model, document.getElementById(modalId));
                    var termCollection = self.model.model().attributes.termCollection,
                        termModels = termCollection.toJSON();

                    kbValidation.bind(self, {collection: termCollection});
                    for (var i = 0; i < termModels.length; i++) {
                        kbValidation.bind(self, {collection: termModels[i].model().attributes['from_terms']});
                        kbValidation.bind(self, {collection: termModels[i].model().attributes['then_terms']});
                    }

                    //permissions
                    ctwu.bindPermissionsValidation(self);

                }, null, true);
            return;
        },
        renderDeleteRoutingPolicy: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deleteRoutingPoliciesID';
            var items = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    selectedGridData[i].name;
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delTemplate =
                    contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({
                prefixId: prefixId,
                item: ctwl.TXT_ROUTING_POLICY,
                itemId: items
            })
            cowu.createModal({
                'modalId': modalId, 'className': 'modal-980',
                'title': options['title'], 'btnName': 'Confirm',
                'body': delLayout, 'onSave': function () {
                    self.model.deleteRoutingPolicy(selectedGridData, {
                        init: function () {
                            self.model.showErrorAttr(elId, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            options['callback']();
                            $("#" + modalId).modal('hide');
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                self.model.showErrorAttr(elId, error.responseText);
                            });
                        }
                    });
                }, 'onCancel': function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                }
            });
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                document.getElementById(modalId));
            kbValidation.bind(this);
        }
    });

    var getConfigureViewConfig = function (isDisable) {
        return {
            elementId: cowu.formatElementId(
                [prefixId, ctwl.TITLE_ROUTING_POLICY_EDIT]),
            view: "SectionView",
            title: "Routing Policy",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'routingPolicyname',
                        view: "FormInputView",
                        viewConfig: {
                            class: "col-xs-12",
                            placeholder: "Routing Policy Name",
                            disabled: isDisable,
                            path: 'routingPolicyname',
                            label: 'Name',
                            dataBindValue: 'routingPolicyname'
                        }
                    }]
                }, {
                    columns: [{
                        elementId: 'term-collection',
                        view: "FormCollectionView",
                        viewConfig: {
                            class: "col-xs-12",
                            collection: 'termCollection()',
                            validation: 'termValidation',
                            templateId: 'query-routing-policy-terms-template',
                            label: "Term(s)",
                            accordionable: true,
                            accordionConfig: {
                                header: '.or-clause-header'
                            },
                            rowActions: [
                                {
                                    onClick: 'addTermAtIndex()', iconClass: 'fa fa-plus',
                                    viewConfig: {width: 20}
                                },
                                {
                                    onClick: "deleteTerm()", iconClass: 'fa fa-remove',
                                    viewConfig: {width: 20}
                                }
                            ],
                            rows: [
                                {
                                    columns: [
                                        {
                                            elementId: 'from-collection',
                                            view: "FormCollectionView",
                                            viewConfig: {
                                                label: 'From',
                                                collection: 'from_terms()',
                                                validation: 'fromTermValidation',
                                                rows: [
                                                    {
                                                        rowActions: [
                                                            {
                                                                onClick: "deleteFromTerm()", iconClass: 'fa fa-remove',
                                                                viewConfig: {width: 20}
                                                            },
                                                            {
                                                                onClick: "addFromTermAtIndex()", iconClass: 'fa fa-plus',
                                                                viewConfig: {width: 20}
                                                            }
                                                        ],
                                                        columns: [
                                                            {
                                                                elementId: 'name',
                                                                name: 'Name',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "name",
                                                                    disabled: "isDisable()",
                                                                    dataBindValue: "name()",
                                                                    dataBindOptionList: 'getNameOptionList',
                                                                    width: 145,
                                                                    placeholder: 'Select Name',
                                                                    elementConfig: {
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'value-multi',
                                                                name: 'value-name',
                                                                view: "FormMultiselectView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                                                    path: "value",
                                                                    dataBindValue: "value()",
                                                                    visible: 'name()() != "prefix"',
                                                                    dataBindOptionList: 'additionalValueMultiSelect()',
                                                                    width: 285,
                                                                    elementConfig: {
                                                                        placeholder: 'Select or Enter value',
                                                                        dataTextField: "text",
                                                                        dataValueField: "id",
                                                                        tags: true
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'value-input',
                                                                name: 'value-name',
                                                                view: "FormInputView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                    path: "value",
                                                                    visible: 'name()() == "prefix"',
                                                                    dataBindValue: "value()",
                                                                    width: 285,
                                                                    placeholder: 'Select or Enter value'
                                                                }
                                                            },
                                                            {
                                                                elementId: 'community_match_all_checkbox',
                                                                name: "Community All",
                                                                view: "FormCheckboxView",
                                                                viewConfig: {
                                                                    path: 'community_match_all',
                                                                    visible: 'name()() == "community"',
                                                                    label: "Match all",
                                                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                                    dataBindValue: 'community_match_all()',
                                                                    width:300,
                                                                }
                                                            },
                                                            {
                                                                elementId: 'additionalValue',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "additionalValue",
                                                                    visible: 'name()() == "prefix"',
                                                                    dataBindValue: "additionalValue()",
                                                                    dataBindOptionList: 'additionalValueDS()',
                                                                    placeholder: '',
                                                                    width: 80,
                                                                    elementConfig: {
                                                                        defaultValueId: 0
                                                                    }
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
                                            elementId: 'then-collection',
                                            view: "FormCollectionView",
                                            viewConfig: {
                                                label: 'Then',
                                                collection: 'then_terms()',
                                                validation: 'thenTermValidation',
                                                rows: [
                                                    {
                                                        rowActions: [
                                                            {
                                                                onClick: "deleteThenTerm()", iconClass: 'fa fa-remove',
                                                                viewConfig: {width: 20}
                                                            },
                                                            {
                                                                onClick: "addThenTermAtIndex()", iconClass: 'fa fa-plus',
                                                                viewConfig: {width: 20}
                                                            }
                                                        ],
                                                        columns: [
                                                            {
                                                                elementId: 'name',
                                                                name: 'Name',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "name",
                                                                    dataBindValue: "name()",
                                                                    dataBindOptionList: 'getNameOptionList',
                                                                    width: 145,
                                                                    placeholder: 'Select Name',
                                                                    elementConfig: {
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'value',
                                                                name: 'value',
                                                                view: "FormInputView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                    path: "value",
                                                                    disabled: 'name()() == "action"',
                                                                    dataBindValue: "value()",
                                                                    width: 285,
                                                                    placeholder: 'Enter Value'

                                                                }
                                                            },
                                                            {
                                                                elementId: 'action_condition',
                                                                view: "FormDropdownView",
                                                                class: "",
                                                                viewConfig: {
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                    path: "action_condition",
                                                                    visible: 'name()() == "action"',
                                                                    dataBindValue: "action_condition()",
                                                                    dataBindOptionList: 'getActionConditionOptionList',
                                                                    width: 80,
                                                                    placeholder: 'Select Action',
                                                                    elementConfig: {
                                                                        defaultValueId: 0
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]

                        }
                    }]
                }]
            }
        }
    }
    return RoutingPolicyEditView;
});