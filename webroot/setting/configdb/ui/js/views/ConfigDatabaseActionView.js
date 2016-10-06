/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "knockback",
    "validation",
    "contrail-view"
], function (_, kb, kbValidation, ContrailView) {

    var modalId = ctwl.CDB_DELETE_MODAL_ID_,
        ConfigDatabaseActionView = ContrailView.extend({

            renderDeleteRecord: function (options) {
                var textTemplate = contrail.getTemplate4Id(ctwl.CDB_TMPL_DELETE_RECORD),
                    elId = "deleteRecord",
                    self = this,
                    checkedRows = options.checkedRows,
                    recordsToBeDeleted = {"elementId": elId, "checkedRows": checkedRows};

                cowu.createModal({
                    "modalId"  : modalId,
                    "className": "modal-700",
                    "title"    : options.title,
                    "btnName"  : "Confirm",
                    "body"     : textTemplate(recordsToBeDeleted),
                    "onSave"   : function () {
                        self.model.deleteRecord(options.checkedRows, {
                            init   : function () {
                                self.model.showErrorAttr(elId, false);
                                cowu.enableModalLoading(modalId);
                            },
                            success: function () {
                                options.callback();
                                $("#" + modalId).modal("hide");
                            },
                            error  : function (error) {
                                cowu.disableModalLoading(modalId, function () {
                                    self.model.showErrorAttr(elId, error.responseText);
                                });
                            }
                        }, options.type);
                    },
                    "onCancel" : function () {
                        $("#" + modalId).modal("hide");
                    }
                });

                self.model.showErrorAttr(elId, false);
                kb.applyBindings(this.model, document.getElementById(modalId));
                kbValidation.bind(this);
            },
        });
    return ConfigDatabaseActionView;
});
