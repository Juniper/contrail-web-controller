/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var rtTableUtils = function() {
        var self = this;

        self.getRtsHopCollectionView = function() {
            return {
                columns: [{
                    elementId: 'prefix',
                    view: 'FormInputView',
                    class: "", width: 375,
                    viewConfig: {
                        label: 'Prefix',
                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                        path: 'prefix',
                        dataBindValue: 'prefix()'
                    }
                },
                {
                    elementId: 'next_hop',
                    view: 'FormInputView',
                    class: "", width: 375,
                    viewConfig: {
                        label: 'Next Hop',
                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                        path: 'next_hop',
                        dataBindValue: 'next_hop()'
                    }
                },
                {
                    elementId: 'next_hop_type',
                    view: 'FormInputView',
                    class: "", width: 375,
                    viewConfig: {
                        label: 'Next Hop Type',
                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                        path: 'next_hop_type',
                        dataBindValue: 'next_hop_type()'
                    }
                },
                {
                    elementId: 'community_attr',
                    view: 'FormTextAreaView',
                    class: "", width: 375,
                    viewConfig: {
                        scrollHeight: 200,
                        height: 200,
                        label: 'Community Attribute',
                        templateId: cowc.TMPL_EDITABLE_GRID_TEXTAREA_VIEW,
                        path: 'community_attr',
                        dataBindValue: 'community_attr()'
                    }
                }]
            }
        },
        self.getRtsCommAttrCollectionView = function() {
            return {
                columns: [{
                    elementId: 'community-attr-collection',
                    view: "FormCollectionView",
                    viewConfig: {
                        colSpan: "2",
                        path: 'communityAttrs',
                        collection: 'communityAttrs()',
                        templateId: cowc.TMPL_GEN_COLLECTION_VIEW,
                        collectionActions: {
                            add: {onClick: "addCommunityAttr()",
                                  iconClass: 'icon-plus',
                                  buttonTitle: 'Add Community Attributes',
                            }
                        },
                        rows: [{
                            rowActions: [
                                {onClick: "deleteCommunityAttr()",
                                 iconClass: 'icon-minus'}
                            ],
                            columns: [{
                                elementId: 'community_attr',
                                view: 'FormComboboxView',
                                class: "", width: 385,
                                viewConfig: {
                                    label: 'Community Attribute',
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                    path: 'community_attr',
                                    dataBindValue: 'community_attr()',
                                    elementConfig: {
                                        placeholder: 'Select or Enter ' +
                                                     'Community Attribute ' +
                                                     'String',
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        dataSource: {
                                            type: 'local',
                                            data : [
                                                {'text': 'no-export',
                                                 'id': 'no-export'},
                                                {'text': 'accept-own',
                                                 'id': 'accept-own'},
                                                {'text': 'no-advertise',
                                                 'id': 'no-advertise'},
                                                {'text': 'no-export-subconfed',
                                                 'id': 'no-export-subconfed'},
                                                {'text': 'no-reoriginate',
                                                 'id': 'no-reoriginate'}
                                            ]
                                        }
                                    }
                                }
                            }]
                        }]
                    }
                }]
            }
        },
        self.getRtTableView = function () {
            return {
                elementId: 'rtTypesCollection',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'rtTypesCollectionAccordian',
                    title: 'Routes',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'route-collection',
                                view: "FormEditableGridView",
                                viewConfig: {
                                    path: 'routes',
                                    collection: 'routes()',
                                    collectionActions: {
                                        add: {onClick: "$root.addRtTable()",
                                              iconClass: 'icon-plus',
                                              buttonTitle: 'Add Static Routes'
                                        }
                                    },
                                    validations: 'routesValidation',
                                }
                            }]
                        }]
                    }
                }]
            }
        }
    };
    return rtTableUtils;
});

