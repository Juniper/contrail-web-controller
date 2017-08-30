/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var TrafficGroupsSettingsView = ContrailView.extend({
        el: $(contentContainer),
        editFilterOptions: function (tagTypeList, callback) {
            var filterView = this,
                filterModel = this.model,
                prefixId = ctwl.TRAFFIC_GROUPS_SETTINGS,
                editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM),
                editLayout = editTemplate({prefixId: prefixId}),
                modalId = 'configure-' + prefixId ;//+ '-modal',
                modalConfig = {
                   'modalId': modalId,
                   'className': 'modal-700',
                   'title': ctwl.TITLE_TRAFFIC_GROUPS_SETTINGS,
                   'body': editLayout,
                   'onSave': function () {
                        filterModel.tgSettingsRule({
                            init: function () {
                                cowu.enableModalLoading(modalId);
                            },
                            success: function (modelObj) {
                                callback(modelObj);
                                $("#" + modalId).modal('hide');
                            },
                            error: function (error) {
                                cowu.disableModalLoading(modalId, function () {
                                });
                            }
                        });
                    },
                   'onCancel': function() {
                        Knockback.release(filterModel, document.getElementById(modalId));
                        kbValidation.unbind(filterView);
                        $("#" + modalId).modal('hide');
                    }
                };
            this.subscribeModelChangeEvents(filterModel, ctwl.EDIT_ACTION);
            cowu.createModal(modalConfig);
            $('#'+ modalId).on('shown.bs.modal', function () {
                 filterView.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                    filterModel, filterView.tagsFilterViewConfig(tagTypeList),'tgSettingsRuleValidation', null, null,
                    function () {
                        Knockback.applyBindings(filterModel, document.getElementById(modalId));
                        kbValidation.bind(filterView, {collection:filterModel.model().attributes.endpoints});
                    }, null, null);
            });
        },
        getTagValuesObj: function(tagTypeList) {
            var tagsObj = [],
                tagsMap = cowc.TRAFFIC_GROUP_TAG_TYPES;
            _.each(tagsMap, function(tagObj) {
                var tagValues = tagTypeList[tagObj.value],
                    tagData = [];
                _.each(tagValues, function(tagValue) {
                    tagData.push({
                        text: tagValue,
                        value: tagValue + cowc.DROPDOWN_VALUE_SEPARATOR + tagObj.value,
                        id: tagValue + cowc.DROPDOWN_VALUE_SEPARATOR + tagObj.value,
                        parent: tagObj.value
                     });
                });
                tagsObj.push({text : tagObj.text, value : tagObj.value, children : tagData});
            });
            return tagsObj;
        },
        tagsFilterViewConfig: function(tagTypeList) {
            var addrFields = [],
                tagsMap = cowc.TRAFFIC_GROUP_TAG_TYPES,
                tagValues = this.getTagValuesObj(tagTypeList);
            return {
                elementId: 'Traffic_Groups_Settings',
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'tg_filter',
                                    view: "AccordianView",
                                    viewConfig: [
                                        {
                                            elementId: 'Traffic_Groups_Filter',
                                            title: 'Filter',
                                            view: "SectionView",
                                            viewConfig: {
                                                rows: [
                                                    {
                                                        columns: [{
                                                            elementId: "filter_by_endpoints",
                                                            view: "FormEditableGridView",
                                                                viewConfig: {
                                                                    path: "endpoints",
                                                                    collection: "endpoints",
                                                                    class:'col-xs-12',
                                                                    validation:
                                                                        "filterRuleValidation",
                                                                    templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                                                    columns: [{
                                                                        elementId: "endpoint",
                                                                        name: "Filter By",
                                                                        view: "FormHierarchicalDropdownView",
                                                                        viewConfig: {
                                                                            templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                                                            class:'col-xs-12',
                                                                            path: 'endpoint',
                                                                            width: 600,
                                                                            dataBindValue: 'endpoint()',
                                                                            elementConfig: {
                                                                                placeholder: 'Select Endpoint',
                                                                                minimumResultsForSearch : 1,
                                                                                dataTextField: "text",
                                                                                dataValueField: "value",
                                                                                data: tagValues,
                                                                                width: 600,
                                                                                queryMap: [
                                                                                    { name : 'Application',  value : 'app', iconClass:'fa fa-list-alt' },
                                                                                    { name : 'Deployment',  value : 'deployment', iconClass:'fa fa-database' },
                                                                                    { name : 'Site',  value : 'site', iconClass:'fa fa-life-ring' },
                                                                                    { name : 'Tier',  value : 'tier', iconClass:'fa fa-clone' }]
                                                                            }
                                                                        }
                                                                    }],
                                                                    rowActions: [
                                                                        {
                                                                            onClick: "function() {\
                                                                            $root.addEndpointByIndex($data, this); }",
                                                                            iconClass: 'fa fa-plus'
                                                                        },
                                                                        {
                                                                            onClick: "function() {\
                                                                            $root.deleteEndpoint($data, this)\
                                                                            ;}",
                                                                            iconClass: 'fa fa-minus'
                                                                        }
                                                                    ],
                                                                    gridActions: [
                                                                        {
                                                                            onClick: "function() {\
                                                                            addEndpoint(); }",
                                                                            buttonTitle: ""
                                                                        }
                                                                    ]
                                                                }
                                                        }]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'tg_categorization',
                                    view: "AccordianView",
                                    viewConfig: [
                                        {
                                            elementId: 'Traffic_Groups_Categorization',
                                            title: 'Display',
                                            view: "SectionView",
                                            viewConfig: {
                                                rows: [
                                                   {
                                                        columns: [
                                                            {
                                                                elementId: 'groupByTagType',
                                                                view: 'FormMultiselectView',
                                                                viewConfig: {
                                                                    label: "Category",
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_WITH_ICON_VIEW,
                                                                    path: 'groupByTagType',
                                                                    icon: 'fa fa-info-circle',
                                                                    iconInfo: 'Choose tag types to group data for first level',
                                                                    dataBindValue: 'groupByTagType',
                                                                    class: 'col-xs-10',
                                                                    elementConfig: {
                                                                        dataTextField: "text",
                                                                        dataValueField: "value",
                                                                        placeholder: "Select Tags",
                                                                        data: tagsMap
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                elementId: 'subGroupByTagType',
                                                                view: 'FormMultiselectView',
                                                                viewConfig: {
                                                                    label: "Subcategory",
                                                                    templateId: cowc.TMPL_EDITABLE_GRID_MULTISELECT_WITH_ICON_VIEW,
                                                                    path: 'subGroupByTagType',
                                                                    icon: 'fa fa-info-circle',
                                                                    iconInfo: 'Choose tag types to group data for second level',
                                                                    dataBindValue: 'subGroupByTagType',
                                                                    dataBindOptionList : "tagTypeList",
                                                                    class: 'col-xs-10',
                                                                    elementConfig: {
                                                                        dataTextField: "text",
                                                                        dataValueField: "value",
                                                                        placeholder: "Select Tags"
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
                        },
                        {
                            columns: [
                                {
                                    elementId: 'stats_time',
                                    view: "AccordianView",
                                    viewConfig: [
                                        {
                                            elementId: 'Traffic_Groups_Time_Range',
                                            title: 'Time Range',
                                            view: "SectionView",
                                            active: false,
                                            viewConfig: {
                                                rows: [
                                                    ctwvc.getTimeRangeConfig("hh:mm A")
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }   
                    ]
                }
            }
        },
        subscribeModelChangeEvents: function(filterModel) {
            filterModel.__kb.view_model.model().on('change:groupByTagType',
                function(model, newValue){
                    filterModel.onGroupByTagTypeChanged(newValue);
                }
            );
        }
    });
    return TrafficGroupsSettingsView;
});
