/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "knockout",
    "knockback",
    "validation",
    "layout-handler",
    "contrail-view",
    "controller-basedir/setting/introspect/ui/js/models/IntrospectPrimaryFormModel",
    "controller-basedir/setting/introspect/ui/js/models/IntrospectSecondaryFormModel"
], function (_, ko, kb, kbValidation, LayoutHandler, ContrailView, IntrospectPrimaryFormModel, IntrospectSecondaryFormModel) {
    var layoutHandler = new LayoutHandler();

    var IntrospectFormView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                hashModelData = {}, primaryFormModelData,
                introspectNode = hashParams.node,
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = "#introspect-" + introspectNode + "-" + introspectType + "-form",
                introspectPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_INTROSPECT_PAGE),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            hashModelData.ip_address = contrail.checkIfExist(hashParams.ip_address) ? hashParams.ip_address : null;
            hashModelData.port = introspectPort;

            primaryFormModelData = $.extend(true, {}, {node: introspectNode}, hashModelData);

            self.primary = {};
            self.primary.model = new IntrospectPrimaryFormModel(primaryFormModelData, self);
            self.$el.append(introspectPageTmpl({type: introspectType, feature: introspectNode}));

            self.renderIntrospectPrimaryForm();

            if (widgetConfig !== null) {
                self.renderView4Config($(introspectFormId), self.primary.model, widgetConfig, null, null, null);
            }
        },

        renderIntrospectPrimaryForm: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectType = viewConfig.type,
                introspectPrimaryFormId = "#introspect-" + introspectNode + "-" + introspectType + "-primary-form",
                introspectPrimaryId = "introspect-" + introspectNode + "-" + introspectType + "-primary-container";

            self.renderView4Config($(introspectPrimaryFormId), self.primary.model, getIntrospectPrimaryFormViewConfig(), "runIntrospectValidation", null, modelMap, function () {
                self.primary.model.showErrorAttr(introspectPrimaryId, false);
                kb.applyBindings(self.primary.model, document.getElementById(introspectPrimaryId));
                kbValidation.bind(self.primary);
            });
        },

        hideIntrospectStatus: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectType = viewConfig.type,
                introspectFormStatusId = "#introspect-" + introspectNode + "-" + introspectType + "-form-status";

            $(introspectFormStatusId)
                .hide()
                .find(".alert").hide();
        },

        renderIntrospectErrorStatus: function(errorText) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectType = viewConfig.type,
                introspectFormStatusId = "#introspect-" + introspectNode + "-" + introspectType + "-form-status";

            $(introspectFormStatusId)
                .show()
                .find(".alert-error").show()
                .find(".error-text").html(errorText);
        },

        renderIntrospectEmptyStatus: function(emptyText) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectType = viewConfig.type,
                introspectFormStatusId = "#introspect-" + introspectNode + "-" + introspectType + "-form-status";

            $(introspectFormStatusId)
                .show()
                .find(".alert-info").show().html(emptyText);
        },

        renderIntrospectSecondaryForm: function(moduleRequestFormData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectSecondaryFormId = "#introspect-" + introspectNode + "-" + introspectType + "-secondary-form",
                introspectSecondaryId = "introspect-" + introspectNode + "-" + introspectType + "-secondary-container",
                secondaryModelData = getSecondaryModelData(moduleRequestFormData),
                primaryModelAttributes = self.primary.model.model().attributes,
                moduleRequest = primaryModelAttributes.module_request;

            self.secondary = {};
            self.secondary.model = new IntrospectSecondaryFormModel(secondaryModelData);

            self.renderView4Config($(introspectSecondaryFormId), self.secondary.model,
                getIntrospectSecondaryFormViewConfig(moduleRequestFormData, introspectNode, introspectPort), null, null, modelMap, function () {

                    var introspectResultId = "#introspect-" + introspectNode + "-" + introspectType + "-results";

                    if(contrail.checkIfKnockoutBindingExist(introspectSecondaryId)) {
                        ko.cleanNode(document.getElementById(introspectSecondaryId));
                        kbValidation.unbind(self.secondary);
                    }

                    kb.applyBindings(self.secondary.model, document.getElementById(introspectSecondaryId));
                    kbValidation.bind(self.secondary);

                    $("#submit-introspect" + introspectNode + "-" + introspectPort).on("click", function() {
                        var params = self.secondary.model.model().attributes,
                            encodedParams = {};

                        $.each(params, function(key, value) {
                            if (value !== null) {
                                if (true === loadIntrospectViaProxy) {
                                    encodedParams[key] = encodeURIComponent(value);
                                } else {
                                    encodedParams[key] = value;
                                }
                            }
                        });

                        self.renderIntrospectResult(moduleRequest, encodedParams);
                        self.primary.model.model().gridRendered = true;
                    });

                    $(introspectResultId)
                    .off("click", ".introspect-link")
                    .on("click", ".introspect-link", function () {
                        var xmlName = $(this).data("link"),
                            params = {x: $(this).text()};

                        self.renderIntrospectResult(xmlName, params);
                    });
                });
        },

        removeIntrospectForm: function(formType) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectType = viewConfig.type;

            if (!contrail.checkIfExist(formType)) {
                formType = ctwc.INTROSPECT_FORM_TYPE_RESULTS;
            }
            var introspectSecondaryFormId = "#introspect-" + introspectNode + "-" + introspectType +
                "-" + formType;

            if (self.primary.model.model().gridRendered) {
                $(introspectSecondaryFormId).empty();
                self.primary.model.model().gridRendered = false;
            }
        },

        renderIntrospectResult: function(moduleRequest, params) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams.node,
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = "#introspect-" + introspectNode + "-" + introspectType + "-form",
                introspectResultId = "#introspect-" + introspectNode + "-" + introspectType + "-results",
                primaryModelAttributes = self.primary.model.model().attributes,
                ipAddress = primaryModelAttributes.ip_address,
                hostname = self.primary.model.resolveIP2Hostname(ipAddress),
                introspectResultTabViewConfig = getIntrospectResultTabViewConfig(introspectNode, hostname, introspectPort, moduleRequest, introspectType, params);
            
            if (widgetConfig !== null) {
                $(introspectFormId).parents(".widget-box").data("widget-action").collapse();
            }

            self.renderView4Config($(introspectResultId), self.model, introspectResultTabViewConfig, null, null, modelMap, null);

        }
    });

    function getIntrospectPrimaryFormViewConfig() {
        var ipAddresFormView = (true !== loadIntrospectViaProxy) ? "FormComboboxView" :
            "FormDropdownView";
        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "ip_address",
                                view: ipAddresFormView,
                                viewConfig: {
                                    path: "ip_address", class: "col-xs-4",
                                    dataBindValue: "ip_address",
                                    dataBindOptionList: "ip_address_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: "Select Or Enter IP Address"
                                    }}
                            },
                            {
                                elementId: "module", view: "FormDropdownView",
                                viewConfig: {
                                    path: "module", class: "col-xs-4",
                                    dataBindValue: "module", dataBindOptionList: "module_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: "Select Module"
                                    },
                                    visible: "ip_address() !== null"

                                }
                            },
                            {
                                elementId: "module_request", view: "FormDropdownView",
                                viewConfig: {
                                    path: "module_request", class: "col-xs-4",
                                    label: "Request",
                                    dataBindValue: "module_request", dataBindOptionList: "module_request_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: "Select Module Request"
                                    },
                                    visible: "module() !== null"

                                }
                            }
                        ]
                    }
                ]
            }
        };
    }

    function getIntrospectSecondaryFormViewConfig(moduleRequestFormData, introspectNode, introspectPort) {
        var row, i = 0,
            isNewRow, elementName,
            secondaryFormConfig = [];

        _.each(moduleRequestFormData, function(value, key) {
            if (["_type", "errors", "locks"].indexOf(key) === -1) {
                isNewRow = ((i % 3) === 0) ? true : false;
                elementName = key;
                if (isNewRow) {
                    row = {columns: []};
                    secondaryFormConfig.push(row);
                }
                row.columns.push({
                    elementId: elementName, view: "FormInputView",
                    viewConfig: {path: elementName, dataBindValue: elementName, class: "col-xs-4"}
                });

                i++;
            }
        });

        secondaryFormConfig.push({
            columns: [
                {
                    elementId: "submit-introspect" + introspectNode + "-" + introspectPort,
                    view: "FormButtonView", label: "Submit",
                    viewConfig: {
                        class: "display-inline-block margin-0-0-0-15",
                        label: "Submit",
                        elementConfig: {
                            btnClass: "btn-primary"
                        }
                    }
                }
            ]
        });

        return {
            view: "SectionView",
            viewConfig: {
                title: secondaryFormConfig.length > 1 ? "Request Parameters" : "",
                rows: secondaryFormConfig
            }
        };
    }

    function getSecondaryModelData(moduleRequestFormData) {
        var modelData = {};

        _.each(moduleRequestFormData, function(value, key) {
            if (["_type", "errors", "locks"].indexOf(key) === -1) {
                modelData[key] = null;
            }
        });

        return modelData;
    }

    function getIntrospectResultTabViewConfig(introspectNode, hostname, port, moduleRequest, introspectType, secondaryModelAttributes) {
        return {
            elementId: "introspect-" + introspectType + "-results",
            view: "IntrospectResultTabsView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                node: introspectNode,
                hostname: hostname,
                port: port,
                module_request: moduleRequest,
                params: _.omit(secondaryModelAttributes, ["_type", "errors", "locks"])
            }
        };
    }

    return IntrospectFormView;
});
