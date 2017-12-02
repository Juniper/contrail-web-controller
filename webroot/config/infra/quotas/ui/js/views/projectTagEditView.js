/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + "project-tag-grid-id";
    var prefixId = "projecttags";
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var projectTagEditView = ContrailView.extend({
        renderEditTags: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-400',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureProjectTags(options['projUUID'], {
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
                                   self.model,
                                   getEditProjectTagsViewConfig(options),
                                   null, null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    function getEditProjectTagsViewConfig (options) {
        var appTagsOptions = options.tags_options_application;
        var tierTagsOptions =  options.tags_options_tierarry;
        var tags_options_sitearray = options.tags_option_sitearray;
        var tags_options_deploymentarray = options.tags_option_deploymentarray;
        var tags_options_lables = options.tags_option_lablesArray;
        var tags_option_customtagsArray = options.tags_option_customtagsArray;
        
        var prefixId = "projecttags";
        var projectTagsViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_PROJECT_TAGS]),
            title: ctwl.TITLE_EDIT_PROJECT_TAGS,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'Application',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Application',
                                    path : 'Application',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Application',
                                    elementConfig: {
                                        placeholder: 'Select Application Tag',
                                        dataTextField : "text",
                                        dataValueField : "value",
//                                        dataSource: {
//                                            type: 'local',
//                                            data : [{
//                                              "text":"hr",
//                                              "value":"hr"
//                                          }]
//                                        }
                                        data:appTagsOptions
                                    }
                                }
                            },
                            {
                                elementId: 'Deployment',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Deployment',
                                    path : 'Deployment',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Deployment',
                                    elementConfig: {
                                        placeholder: 'Select Deployment Tag',
                                        dataTextField : "text",
                                        dataValueField : "value",
//                                        dataSource: {
//                                            type: 'local',
//                                            data : [{
//                                              "text":"hr",
//                                              "value":"hr"
//                                          }]
//                                        }
//                                        data:[{
//                                            'text':"deployment",
//                                            'value':"1"
//                                        }]
                                        data:tags_options_deploymentarray
                                    }
                                }
                            },
                            {
                                elementId: 'Site',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Site',
                                    path : 'Site',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Site',
                                    elementConfig: {
                                        placeholder: 'Select Site Tag',
                                        dataTextField : "text",
                                        dataValueField : "value",
//                                        dataSource: {
//                                            type: 'local',
//                                            data : [{
//                                              "text":"hr",
//                                              "value":"hr"
//                                          }]
//                                        }
//                                        data:[{
//                                            'text':"Site",
//                                            'value':"1"
//                                        }]
                                        data:tags_options_sitearray
                                    }
                                }
                            },
                            {
                                elementId: 'Tier',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Tier',
                                    path : 'Tier',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Tier',
                                    elementConfig: {
                                        placeholder: 'Select Tier Tag',
                                        dataTextField : "text",
                                        dataValueField : "value",
//                                        dataSource: {
//                                            type: 'local',
//                                            data : [{
//                                              "text":"hr",
//                                              "value":"hr"
//                                          }]
//                                        }
//                                        data:[{
//                                            'text':"Site",
//                                            'value':"1"
//                                        }]
                                        data:tierTagsOptions
                                    }
                                }
                            },
                            {
                                elementId: 'Labels',
                                view: "FormMultiselectView",
                                viewConfig: {
                                    label: 'Labels',
                                    path : 'Labels',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Labels',
                                    elementConfig: {
                                        placeholder: 'Select Labels',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        data:tags_options_lables
                                    }
                                }
                            },
                            {
                                elementId: 'Custom',
                                view: "FormMultiselectView",
                                viewConfig: {
                                    label: 'Custom',
                                    path : 'Custom',
                                    class: 'col-xs-12',
                                    dataBindValue : 'Custom',
                                    elementConfig: {
                                        placeholder: 'Select Custom Tags',
                                        dataTextField : "text",
                                        dataValueField : "value",
                                        data:tags_option_customtagsArray
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return projectTagsViewConfig;
    }

    return projectTagEditView;
});

