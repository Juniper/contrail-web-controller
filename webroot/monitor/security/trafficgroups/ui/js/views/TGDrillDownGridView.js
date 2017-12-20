/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'contrail-list-model',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsFormatters'
], function (_, ContrailView, ContrailListModel, TgFormatters) {
    var TGDrillDownGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                elementId = viewConfig.tabid != null ? viewConfig.tabid : viewConfig.elementId,
                contrailListModel = new ContrailListModel({data : viewConfig.data}),
                title = viewConfig['title'],
                type = viewConfig['configTye'];
           self.renderView4Config($("#"+elementId), contrailListModel, self.getDDGridViewConfig(type,title));
        },
        getDDGridViewConfig: function (type, title) {
            return {
                elementId: ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS + '-grid',
                view: "GridView",
                viewConfig: {
                    elementConfig: this.getcDDListConfig(title)
                }
            }
        },
        getcDDListConfig: function (title) {
            var self = this,
                data = this.rootView.ddData,
                currentLevel = data.level,
                ddGridColumns = [];
            var curLevelFields = data.levels[currentLevel-1].display_fields,
                commomFields = data.common_display_fields;
            curLevelFields = curLevelFields.concat(commomFields);
            _.each(curLevelFields, function(obj) {
                ddGridColumns.push({
                    field: obj.key,
                    name: obj.label,
                    cssClass: obj.drillDown ? 'cell-hyperlink-blue' : '',
                    formatter: obj.formatFn,
                    events : {
                        onClick : function(e, d) {
                            e.preventDefault();
                            if(obj.drillDown) {
                                var where = obj.drilldownFn(d),
                                    breadcrumbObj = obj.breadcrumb,
                                    breadcrumb = [];
                                data.where.push(where);
                                if(obj.updateData)
                                   data = obj.updateData(data, d);
                                data.level++;
                                var breadcrumbTxt = '';
                                _.each(breadcrumbObj, function(obj) {
                                    breadcrumbTxt += obj.value(d);
                                });
                                breadcrumb.push(breadcrumbTxt);
                                data.breadcrumb.push(breadcrumb);
                                self.rootView.drillDown();
                            }
                         }
                     }
                });
            });
            gridElementConfig = {
                header: {
                    title: {
                        text: title
                    },
                    defaultControls: {
                        collapseable: false,
                        exportable: true,
                        searchable: true,
                        columnPickable:true,
                        refreshable: false
                    }
                },
                columnHeader: {
                    columns: ddGridColumns
                },
                body: {
                    options : {
                        autoRefresh: false,
                        checkboxSelectable: false,
                        detail: {
                            template: cowu.generateDetailTemplateHTML(this.geDDDetailsTemplateConfig(data), cowc.APP_CONTRAIL_CONTROLLER),
                            noCache: true
                        }
                    },
                    dataSource : {data: []},
                    statusMessages: {
                        loading: {
                           text: 'Loading endpoint stats..',
                        },
                        empty: {
                           text: ctwl.TRAFFIC_GROUPS_NO_DATA
                        }
                     }
                },
                footer: {
                    pager: {
                        options: {
                            pageSize: 50,
                            pageSizeSelect: [5, 10, 50]
                        }

                    }
                }
            };
            return gridElementConfig;
        },
        geDDDetailsTemplateConfig: function(data) {
            var currentLevel = data.level,
                templateConfig = [],
                curLevelFields = data.levels[currentLevel-1].detailFields,
                common_fields = data.commom_detailFields;
                curLevelFields = curLevelFields.concat(common_fields);
            _.each(curLevelFields, function(obj) {
                templateConfig.push({
                    key: obj.key,
                    label: obj.label,
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: obj.formatFn
                    }
                })
            });
            return {
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        rows: [
                                            {
                                                title: 'Details',
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: templateConfig
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        }
    });
    $.extend(this, new TgFormatters());
    return TGDrillDownGridView;
});
