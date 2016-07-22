/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
], function (_, Backbone, ContrailListModel, Knockback, ContrailView) {
    var prefixId = ctwc.ALARM_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);

    var configAlarmRuleEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderAddEditRule: function (options) {
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
                    self.model.configRule(options,
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
                    className: 'modal-980',
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
                    getConfigureViewConfig(disableElement), 'configAlarmValidations', null, null, function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model, document.getElementById(modalId));
                    var orRuleCollection = self.model.model().attributes.orRules,
                        orRuleModels = orRuleCollection.toJSON();

                    kbValidation.bind(self, {collection: orRuleCollection});
                    for (var i = 0; i < orRuleModels.length; i++) {
                        kbValidation.bind(self, {collection: orRuleModels[i].model().attributes['andRules']});
                    }

                });
            return;
        },
        renderDeleteRule: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deleteConfigAlarm';
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
                item: ctwl.TXT_CONFIG_ALARM_RULE,
                itemId: items
            })
            cowu.createModal({
                'modalId': modalId, 'className': 'modal-480',
                'title': options['title'], 'btnName': 'Confirm',
                'body': delLayout, 'onSave': function () {
                    self.model.deleteRule(selectedGridData, {
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
                    [prefixId, ctwl.TITLE_EDIT_ALARM_RULE]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'display_name',
                            view: "FormInputView",
                            viewConfig: {
                                class: "span6",
                                placeholder: "Enter Rule Name",
                                disabled: isDisable,
                                path: 'display_name',
                                label: 'Name',
                                dataBindValue: 'display_name'
                            }
                        }, {
                            elementId: 'severity',
                            view: "FormDropdownView",
                            viewConfig: {
                                class: "span6",
                                path: 'alarm_severity',
                                label: 'Severity',
                                dataBindValue: 'alarm_severity',
                                elementConfig: {
                                    placeholder: "Select Severity",
                                    dataTextField: 'text',
                                    dataValueField: 'value',
                                    escapeMarkup: function (d) {
                                        return d;
                                    },
                                    dataSource: {
                                        type: 'local',
                                        data: function () {
                                            var template = contrail.getTemplate4Id(ctwc.CONFIG_ALARM_SEVERITY_TEMPLATE);
                                            return [
                                             {value: '4', text: template({
                                                 showText : true,
                                                 color : 'orange',
                                                 text : contrail.format('{0} - {1}',ctwl.CONFIG_ALARM_TEXT_MAP[4], 4)
                                             })},
                                             {value: '3', text: template({
                                                 showText : true,
                                                 color : 'red',
                                                 text : contrail.format('{0} - {1}',ctwl.CONFIG_ALARM_TEXT_MAP[3], 3)
                                             })},
                                             {value: '2', text: template({
                                                 showText : true,
                                                 color : 'red',
                                                 text : contrail.format('{0} - {1}',ctwl.CONFIG_ALARM_TEXT_MAP[2], 2)
                                             })},
                                             {value: '0', text: '0'},
                                             {value: '1', text: '1'},
                                             {value: '5', text: '5'},
                                             {value: '6', text: '6'},
                                             {value: '7', text: '7'},
                                          ];
                                        }()
                                    }

                                }
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'uve_keys',
                            view: "FormMultiselectView",
                            viewConfig: {
                                class: "span6",
                                path: 'uve_keys',
                                label: "UVE Keys",
                                dataBindValue: 'uve_keys',
                                elementConfig: {
                                    placeholder: "Select UVE",
                                    dataTextField : "text",
                                    dataValueField : "value",
                                    tags: true,
                                    dataSource : {
                                        type: 'remote',
                                        url: '/api/admin/monitor/get-uve-keys',
                                        parse: function(uveList) {
                                            var uveList = ifNull(uveList, []),
                                                uveListLen = uveList.length,
                                                multiSelectData = [];
                                            for (var i = 0; i < uveListLen; i++) {
                                                var uveObj = uveList[i];
                                                if (uveObj != null && uveObj['name']!= null) {
                                                    var uveKey = uveObj['name'].slice(0, -1);
                                                    multiSelectData.push({
                                                        text: uveKey,
                                                        value: uveKey
                                                    });
                                                }
                                            }
                                            return multiSelectData;
                                        }
                                    }
                                }
                            }
                        },{
                            elementId: 'enable',
                            view: "FormCheckboxView",
                            viewConfig: {
                                class: "span6",
                                path: 'id_perms.enable',
                                label: "Enabled",
                                dataBindValue: 'id_perms().enable',
                                elementConfig: {
                                    isChecked: true
                                }
                            }
                        }]
                    },{
                        columns: [{ elementId: 'description',
                            view: "FormTextAreaView",
                            viewConfig: {
                                class: "span12",
                                path: 'id_perms.description',
                                label: "Description",
                                dataBindValue: 'id_perms().description',
                                placeHolder: 'Description',
                            }}]
                    }, {
                        columns: [{
                            elementId: 'or-clause-collection',
                            view: "FormCollectionView",
                            viewConfig: {
                                label: "Rule",
                                collection: 'orRules()',
                                templateId: cowc.TMPL_QUERY_OR_COLLECTION_VIEW,
                                accordionable: true,
                                accordionConfig: {
                                    header: '.or-clause-header'
                                },
                                rows: [
                                    {
                                        rowActions: [
                                            {
                                                onClick: 'addOrRuleAtIndex()', iconClass: 'icon-plus',
                                                viewConfig: {width: 20}
                                            },
                                            {
                                                onClick: "deleteOrRule()", iconClass: 'icon-remove',
                                                viewConfig: {width: 20}
                                            },
                                        ],
                                        columns: [
                                            {
                                                elementId: 'and-clause-collection',
                                                view: "FormCollectionView",
                                                viewConfig: {
                                                    collection: 'andRules()',
                                                    validation: 'alarmRuleValidations',
                                                    rows: [
                                                        {
                                                            rowActions: [
                                                                {
                                                                    onClick: "deleteRule()", iconClass: 'icon-remove',
                                                                    viewConfig: {width: 20}
                                                                },
                                                                {
                                                                    onClick: "addRuleAtIndex()", iconClass: 'icon-plus',
                                                                    viewConfig: {width: 20}
                                                                }
                                                            ],
                                                            columns: [
                                                                {
                                                                    elementId: 'and-text',
                                                                    view: "FormTextView",
                                                                    viewConfig: {
                                                                        width: 40,
                                                                        value: "AND",
                                                                        class: "and-clause-text"
                                                                    }
                                                                },
                                                                {
                                                                    elementId: 'operand1',
                                                                    name: 'Operand1',
                                                                    view: "FormTextAreaView",
                                                                    viewConfig: {
                                                                        templateId: cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                                                                        path: "operand1",
                                                                        dataBindValue: "operand1()",
                                                                        width: 200,
                                                                        placeHolder: 'Operand1',
                                                                    }
                                                                },
                                                                {
                                                                    elementId: 'operation',
                                                                    name: 'operation',
                                                                    view: "FormDropdownView",
                                                                    viewConfig: {
                                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                        path: "operation",
                                                                        dataBindValue: "operation()",
                                                                        width: 80,
                                                                        elementConfig: {
                                                                            dataTextField: 'text',
                                                                            dataValueField: 'value',
                                                                            dataSource: {
                                                                                type: 'local',
                                                                                data: [
                                                                                  {value: '==', text: '=='},
                                                                                  {value: '!=', text: '!='},
                                                                                  {value: '>=', text: '>='},
                                                                                  {value: '<=', text: '<='},
                                                                                  {value: 'in', text: 'in'},
                                                                                  {value: 'not in', text: 'not in'},
                                                                                  {value: 'size ==', text: 'size=='},
                                                                                  {value: 'size!=', text: 'size!='},
                                                                                ]
                                                                            }
                                                                         }
                                                                     }
                                                                },
                                                                {
                                                                    elementId: 'operand2',
                                                                    name: 'Operand2',
                                                                    view: "FormTextAreaView",
                                                                    class: "",
                                                                    viewConfig: {
                                                                        templateId: cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                                                                        path: "operand2",
                                                                        dataBindValue: "operand2()",
                                                                        width: 200,
                                                                        placeHolder: 'Operand2',
                                                                    }
                                                                },
                                                                {
                                                                    elementId: 'vars',
                                                                    view: "FormInputView",
                                                                    class: "",
                                                                    viewConfig: {
                                                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                        path: "vars",
                                                                        dataBindValue: "vars()",
                                                                        width: 200,
                                                                        placeholder: 'Vars',
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
    return configAlarmRuleEditView;
});