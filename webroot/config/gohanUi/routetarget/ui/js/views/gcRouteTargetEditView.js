/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'],
    function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.CFG_ROUTE_TARGET_GRID_ID;
    var prefixId = ctwl.CFG_ROUTE_TARGET_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var routeTargetEditView = ContrailView.extend({
        renderAddRouteTarget: function (options) {
            var editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
               self.model.addRouteTarget({
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                                    self.model,
                                    getRouteTargetViewConfig(),
                                    "", null, null,
                                    function () {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                                    }, null, false);
        },
        renderDeleteRouteTarget: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;
            var selectedGridData = options['selectedGridData'];
            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteRouteTarget(selectedGridData[0], {
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
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function networkDropDownFormatter(response){
        var networkResponse = getValueByJsonPath(response,
                'networks', []);
        var networkList = [];

        $.each(networkResponse, function (i, obj) {
            networkList.push({id: obj.id, text: obj.name});
        });
        return networkList;
    }

    function getRouteTargetViewConfig () {
        var prefixId = ctwl.CFG_ROUTE_TARGET_PREFIX_ID;
        var tenantId = contrail.getCookie('gohanProject');
        var routeTargetViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.CFG_ROUTE_TARGET_TITLE_CREATE]),
            title: "Route Target",//permissions
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'network_id',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'network_id',
                                    class: 'col-xs-6',
                                    label: 'Network ID',
                                    dataBindValue: 'network_id',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Network',
                                        dataValueField: 'id',
                                        dataSource : {
                                            type: 'remote',
                                            url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_PARAM,
                                            parse: function(result) {
                                                return networkDropDownFormatter(result);
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'route_target',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Route Target',
                                    path: 'route_target',
                                    class: 'col-xs-6',
                                    dataBindValue: 'route_target',
                                }
                            }
                        ]
                    }
                ]  // End Rows
            }
        }
        return routeTargetViewConfig;
    }
    return routeTargetEditView;
});
