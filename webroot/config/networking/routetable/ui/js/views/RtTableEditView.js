/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.RT_TABLE_GRID_ID;
    var prefixId = ctwl.RT_TABLE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var rtTableType, viewConfigNextHop, viewConfigNextHopType, viewConfigPrefix,
        viewConfigCommunityAttr;
    var RtTableEditView = ContrailView.extend({
        renderConfigureRtTable: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            rtTableType = options['type'];
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
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.routes});
                //permissions
                ctwu.bindPermissionsValidation(self);
            }, null, true);
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

    viewConfigPrefix = {
                                elementId: 'prefix',
                                view: 'FormInputView',
                                class: "",
                                name: 'Prefix',
                                viewConfig: {
                                    width: 200,
                                    placeholder: 'Enter Prefix',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'prefix',
                                    dataBindValue: 'prefix()'
                                }
                          };
    viewConfigNextHopType = {
                                elementId: 'next_hop_type',
                                view: 'FormDropdownView',
                                class: "",
                                name: 'Next Hop Type',
                                viewConfig: {
                                    placeholder: 'Next Hop Type',
                                    width: 150,
                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    path: 'next_hop_type',
                                    dataBindValue: 'next_hop_type()',
                                    elementConfig: {
                                        dataTextField: 'text',
                                        dataValueField: 'value',
                                        data: [{
                                            value: 'ip-address',
                                            text: 'ip-address'
                                        }]
                                    }
                                }
                            };
    viewConfigNextHop = {
                                elementId: 'next_hop',
                                view: 'FormInputView',
                                class: "",
                                name: 'Next Hop',
                                viewConfig: {
                                    placeholder: 'Enter IP Address',
                                    width: 250,
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'next_hop',
                                    dataBindValue: 'next_hop()'
                                }
                        };

    viewConfigCommunityAttr = function(width) {
        return {
            elementId: 'community_attr',
            view: 'FormMultiselectView',
            class: "",
            name: 'Communities',
            viewConfig: {
                width: width,
                templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                path: 'community_attr',
                dataBindValue: 'community_attr()',
                elementConfig: {
                    placeholder: 'Select or Enter Communities',
                    dataTextField: "text",
                    dataValueField: "id",
                    data : ctwc.DEFAULT_COMMUNITIES,
                    tags: true
                }
            }
        };
    };

    function getRouteTableColViewConfigs() {
        var columns = [];
        columns.push(viewConfigPrefix);
        if(rtTableType === "route-table") {
            columns.push(viewConfigNextHopType);
            columns.push(viewConfigNextHop);
            columns.push(viewConfigCommunityAttr(200));
        } else {
            columns.push(viewConfigCommunityAttr(400));
        }
        return columns;
    }

    function getEditRtTableViewConfig (isDisable) {
        var prefixId = ctwl.RT_TABLE_PREFIX_ID;
        var rtTableViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_RT_TABLE]),
            title: "Route Table",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'display_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Name',
                            disabled: isDisable,
                            placeholder: 'Enter Route Table Name',
                            path: 'display_name',
                            class: 'col-xs-9',
                            dataBindValue: 'display_name',
                            placeHolder: 'Security Group Name',
                        }
                    }]
                },
                {
                    columns: [{
            elementId: 'route_table',
            view: 'SectionView',
            viewConfig: {

                rows: [{
                    columns: [{
                        elementId: 'routes',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            path: 'routes',
                            class: 'col-xs-12',
                            collection: 'routes',
                            validation: 'rtTableRoutesValidation',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            class: "col-xs-12",
                            columns: getRouteTableColViewConfigs(),
                            rowActions: [
                                { onClick: "function() { $root.addRtTableByIndex($data, this); }",
                                  iconClass: 'fa fa-plus'},
                                { onClick: "function() { $root.deleteRtTable($data, this); }",
                                  iconClass: 'fa fa-minus'},
                            ],
                            gridActions: [
                                { onClick: "function() { $root.addRtTable(); }",
                                  iconClass: 'fa fa-plus',
                                  buttonTitle: ''}
                            ]
                        }
                    }]
                }]
            }
                    }]
                }]
            }
        }
        return rtTableViewConfig;
    }

    return RtTableEditView;
});
