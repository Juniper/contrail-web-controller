/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    "protocol",
    'contrail-view',
    'knockback'
], function (_, protocolUtils, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_FLOW_AGING_GRID_ID,
        prefixId = ctwc.GLOBAL_FLOW_AGING_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var flowAgingEditView = ContrailView.extend({
        renderEditFlowOptions: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureFlowOptions({
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
                                   flowOptionsViewConfig(),
                                   "globalConfigValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.ipFabricSubnets});
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.flowAgingTimeout});
            });
        }
    });

    function getProtocalList() {
        var flowProtoList = [],
            availableProtocols = ["TCP", "UDP", "ICMP"];

        flowProtoList = _.map(availableProtocols, function(protocolName, idx) {
            return {
                index: idx,
                text: protocolUtils.getProtocolCode(protocolName) + " (" + protocolName + ")",
                value: protocolName.toLowerCase()
            };
        });

        return flowProtoList;
    }

    var flowOptionsViewConfig = function () {

        return {
            elementId: ctwc.GLOBAL_FLOW_AGING_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'flowAgingTimeout',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                    path: 'flowAgingTimeout',
                                    class: 'col-xs-12',
                                    collection: 'flowAgingTimeout',
                                    validation: 'flowAgingTimeoutValidation',
                                    templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                    label: '',
                                    columns: [{
                                        elementId: 'protocol',
                                        name: 'Protocol',
                                        view: 'FormComboboxView',
                                        viewConfig: {
                                            templateId:
                                                cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            width: 200,
                                            path: 'protocol',
                                            dataBindValue: 'protocol()',
                                            elementConfig: {
                                                placeholder: 'Protocol Code',
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource:{
                                                    type : 'local',
                                                    data : getProtocalList()
                                                }
                                            }
                                        }
                                    },
                                    {
                                        elementId: 'port',
                                        name: 'Port',
                                        view: 'FormInputView',
                                        class: "",
                                        viewConfig: {
                                            disabled : 'disablePort()',
                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                            width: 200,
                                            path: 'port',
                                            dataBindValue: 'port()',
                                            placeholder: 'All Ports'
                                        }
                                    },
                                    {
                                        elementId: 'timeout_in_seconds',
                                        name: 'Timeout (secs)',
                                        view: 'FormInputView',
                                        class: "",
                                        viewConfig: {
                                            width: 200,
                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                            path: 'timeout_in_seconds',
                                            dataBindValue: 'timeout_in_seconds()',
                                            placeholder: '180'
                                        }
                                    }],
                                    rowActions: [
                                        {onClick: "function() {\
                                            $root.addFlowAgingTupleByIndex($data, this);\
                                        }",
                                        iconClass: 'fa fa-plus'},{
                                        onClick: "function() {\
                                            $root.deleteFlowAgingTuple($data, this);\
                                        }",
                                        iconClass: 'fa fa-minus'
                                    }],
                                    gridActions: [{
                                        onClick: "function() {\
                                            $root.addFlowAgingTuple();\
                                        }",
                                        buttonTitle: ''
                                    }]
                                }
                            }
                        ]
                    }
                ]
            }
        }
    }

    return flowAgingEditView;
});
