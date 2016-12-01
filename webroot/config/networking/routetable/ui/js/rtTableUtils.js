/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore',
        'config/networking/routetable/ui/js/rtTableFormatter'],
function(_, RTTableFormatter){
    var rtTableFormatter = new RTTableFormatter();
    var rtTableUtils = function() {

        this.getRTTableDetailsConfig = function() {
            return {
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [{
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [{
                                class: 'row-fluied',
                                rows: [{
                                    title: ctwl.RT_TABLE_DETAILS,
                                    templateGenerator: 'BlockListTemplateGenerator',
                                    templateGeneratorConfig: [
                                        {
                                            key: 'display_name',
                                            label: 'Display Name',
                                            keyClass: 'col-xs-3',
                                            templateGenerator: 'TextGenerator'
                                        },
                                        {
                                            key: 'uuid',
                                            label: 'UUID',
                                            keyClass: 'col-xs-3',
                                            templateGenerator: 'TextGenerator'
                                        },
                                        {
                                            key: 'route',
                                            templateGenerator: 'TextGenerator',
                                            label: 'Routes',
                                            keyClass: 'col-xs-3',
                                            valueClass: 'col-xs-9',
                                            templateGeneratorConfig: {
                                                formatter: 'formatRoutes'
                                            }
                                        }
                                    ]
                                },
                                //permissions
                                ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                            }]
                        }
                    }]
                }
            }
        };

        this.rtTableColumns = function(rtTableName) {
            return [
                    {
                        id: 'display_name',
                        field: 'display_name',
                        maxWidth: 300,
                        name: 'Route Table',
                    },
                    {
                        id: "route",
                        field: "route",
                        name: rtTableName,
                        formatter: rtTableFormatter.formatRoutes,
                        sortable: {
                            sortBy: 'formattedValue'
                        }
                    }
                ];
        }
    };

    this.formatRoutes = function(val, obj) {
        return rtTableFormatter.formatRoutes(null, null, val, null, obj, true);
    }
    return rtTableUtils;
});

