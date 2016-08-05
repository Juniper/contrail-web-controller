/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'controller-basedir/setting/introspect/ui/js/models/IntrospectPrimaryFormModel',
    'controller-basedir/setting/introspect/ui/js/models/IntrospectSecondaryFormModel'
], function (_, Knockback, ContrailView, IntrospectPrimaryFormModel, IntrospectSecondaryFormModel) {
    var IntrospectFormView = ContrailView.extend({
        el: $(contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = '#introspect-' + introspectNode + '-' + introspectType + '-form',
                introspectPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_INTROSPECT_PAGE),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            self['primary'] = {};
            self['primary']['model'] = new IntrospectPrimaryFormModel({port: introspectPort, node: introspectNode}, self);
            self.$el.append(introspectPageTmpl({type: introspectType, feature: introspectNode}));

            self.renderIntrospectPrimaryForm();

            if (widgetConfig !== null) {
                self.renderView4Config($(introspectFormId), self['primary']['model'], widgetConfig, null, null, null);
            }
        },

        renderIntrospectPrimaryForm: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectPrimaryFormId = '#introspect-' + introspectNode + '-' + introspectType + '-primary-form',
                introspectPrimaryId = 'introspect-' + introspectNode + '-' + introspectType + '-primary-container';

            self.renderView4Config($(introspectPrimaryFormId), self['primary']['model'], getIntrospectPrimaryFormViewConfig(), 'runIntrospectValidation', null, modelMap, function () {
                self['primary']['model'].showErrorAttr(introspectPrimaryId, false);
                Knockback.applyBindings(self['primary']['model'], document.getElementById(introspectPrimaryId));
                kbValidation.bind(self['primary']);
            });
        },

        hideIntrospectStatus: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectType = viewConfig.type,
                introspectFormStatusId = '#introspect-' + introspectNode + '-' + introspectType + '-form-status';

            $(introspectFormStatusId)
                .hide()
                .find('.alert').hide();
        },

        renderIntrospectErrorStatus: function(errorText) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectType = viewConfig.type,
                introspectFormStatusId = '#introspect-' + introspectNode + '-' + introspectType + '-form-status';

            $(introspectFormStatusId)
                .show()
                .find('.alert-error').show()
                .find('.error-text').html(errorText);
        },

        renderIntrospectEmptyStatus: function(emptyText) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectType = viewConfig.type,
                introspectFormStatusId = '#introspect-' + introspectNode + '-' + introspectType + '-form-status';

            $(introspectFormStatusId)
                .show()
                .find('.alert-info').show().html(emptyText);
        },

        renderIntrospectSecondaryForm: function(moduleIntrospectFormData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectSecondaryFormId = '#introspect-' + introspectNode + '-' + introspectType + '-secondary-form',
                introspectSecondaryId = 'introspect-' + introspectNode + '-' + introspectType + '-secondary-container',
                secondaryModelData = getSecondaryModelData(moduleIntrospectFormData),
                primaryModelAttributes = self['primary']['model'].model()['attributes'],
                moduleIntrospect = primaryModelAttributes.module_introspect;

            self['secondary'] = {};
            self['secondary']['model'] = new IntrospectSecondaryFormModel(secondaryModelData);

            self.renderView4Config($(introspectSecondaryFormId), self['secondary']['model'],
                getIntrospectSecondaryFormViewConfig(moduleIntrospectFormData, introspectNode, introspectPort), null, null, modelMap, function () {

                var introspectResultId = '#introspect-' + introspectNode + '-' + introspectType + '-results';

                if(contrail.checkIfKnockoutBindingExist(introspectSecondaryId)) {
                    ko.cleanNode(document.getElementById(introspectSecondaryId));
                    kbValidation.unbind(self['secondary']);
                }

                Knockback.applyBindings(self['secondary']['model'], document.getElementById(introspectSecondaryId));
                kbValidation.bind(self['secondary']);

                $('#submit-introspect' + introspectNode + '-' + introspectPort).on('click', function() {
                    var params = self['secondary']['model'].model()['attributes'],
                        encodedParams = {};

                    $.each(params, function(key, value) {
                        if (value !== null) {
                            encodedParams[key] = encodeURIComponent(value);
                        }
                    });

                    self.renderIntrospectResult(moduleIntrospect, encodedParams);
                });

                $(introspectResultId)
                    .off("click", '.introspect-link')
                    .on("click", '.introspect-link', function () {
                        var xmlName = $(this).data('link'),
                            params = {x: $(this).text()};

                        self.renderIntrospectResult(xmlName, params);
                    });
            });
        },

        removeIntrospectSecondaryForm: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectType = viewConfig.type,
                introspectSecondaryFormId = '#introspect-' + introspectNode + '-' + introspectType + '-secondary-form',
                primaryModelAttributes = self['primary']['model'].model()['attributes'];

            $(introspectSecondaryFormId).empty();

        },

        renderIntrospectResult: function(moduleIntrospect, params) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                introspectNode = hashParams['node'],
                introspectPort = viewConfig.port,
                introspectType = viewConfig.type,
                introspectFormId = '#introspect-' + introspectNode + '-' + introspectType + '-form',
                introspectResultId = '#introspect-' + introspectNode + '-' + introspectType + '-results',
                primaryModelAttributes = self['primary']['model'].model()['attributes'],
                ipAddress = primaryModelAttributes.ip_address,
                introspectResultTabViewConfig = getIntrospectResultTabViewConfig(introspectNode, ipAddress, introspectPort, moduleIntrospect, introspectType, params);
            
            if (widgetConfig !== null) {
                $(introspectFormId).parents('.widget-box').data('widget-action').collapse();
            }

            self.renderView4Config($(introspectResultId), self.model, introspectResultTabViewConfig, null, null, modelMap, null);

        }
    });

    function getIntrospectPrimaryFormViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'ip_address', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'ip_address', class: "span4",
                                    dataBindValue: 'ip_address',
                                    dataBindOptionList: "ip_address_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select IP Address'
                                    }}
                            },
                            {
                                elementId: 'module', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'module', class: "span4",
                                    dataBindValue: 'module', dataBindOptionList: "module_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select Module'
                                    },
                                    visible: "ip_address() !== null"

                                }
                            },
                            {
                                elementId: 'module_introspect', view: "FormDropdownView",
                                viewConfig: {
                                    path: 'module_introspect', class: "span4",
                                    label: 'Introspect',
                                    dataBindValue: 'module_introspect', dataBindOptionList: "module_introspect_option_list()",
                                    elementConfig: {
                                        dataTextField: "text", dataValueField: "id",
                                        placeholder: 'Select Module Introspect'
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

    function getIntrospectSecondaryFormViewConfig(moduleIntrospectFormData, introspectNode, introspectPort) {
        var row, columns, i = 0,
            isNewRow, elementName,
            secondaryFormConfig = [];

        _.each(moduleIntrospectFormData, function(value, key) {
            if (['_type', 'errors', 'locks'].indexOf(key) === -1) {
                isNewRow = ((i % 3) == 0) ? true : false;
                elementName = key;
                if (isNewRow) {
                    row = {columns: []};
                    secondaryFormConfig.push(row);
                }
                row['columns'].push({
                    elementId: elementName, view: "FormInputView",
                    viewConfig: {path: elementName, dataBindValue: elementName, class: "span4"}
                });

                i++;
            }
        });

        secondaryFormConfig.push({
            columns: [
                {
                    elementId: 'submit-introspect' + introspectNode + '-' + introspectPort,
                    view: "FormButtonView", label: "Submit",
                    viewConfig: {
                        class: 'display-inline-block margin-5-10-0-0',
                        label: 'Submit',
                        elementConfig: {
                            btnClass: 'btn-primary'
                        }
                    }
                }
            ]
        });

        return {
            view: "SectionView",
            viewConfig: {
                rows: secondaryFormConfig
            }
        };
    }

    function getSecondaryModelData(moduleIntrospectFormData) {
        var modelData = {};

        _.each(moduleIntrospectFormData, function(value, key) {
            if (['_type', 'errors', 'locks'].indexOf(key) === -1) {
                modelData[key] = null;
            }
        });

        return modelData;
    }

    function getIntrospectResultTabViewConfig(introspectNode, ipAddress, port, moduleIntrospect, introspectType, secondaryModelAttributes) {
        return {
            elementId: 'introspect-' + introspectType + '-results',
            view: "IntrospectResultTabsView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                node: introspectNode,
                ip_address: ipAddress,
                port: port,
                module_introspect: moduleIntrospect,
                params: _.omit(secondaryModelAttributes, ['_type', 'errors', 'locks'])
            }
        };
    }

    return IntrospectFormView;
});