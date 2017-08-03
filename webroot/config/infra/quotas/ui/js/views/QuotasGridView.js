/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/quotas/ui/js/models/QuotasModel',
    'config/infra/quotas/ui/js/views/QuotasEditView'
], function (_, ContrailView, QuotasModel, QuotasEditView) {
    var selectedProject = null;
    var quotasEditView = new QuotasEditView(),
    gridElId = "#" + ctwl.QUOTAS_GRID_ID;

    var QuotasGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            selectedProject = viewConfig.selectedProject;
            self.renderView4Config(self.$el, self.model,
                                   getQuotasGridViewConfig(viewConfig), null,
                                   null, null, function() {
                $(gridElId).data('selectedProject', selectedProject);
            });
        }
    });

    var getQuotasGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.QUOTAS_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PROJECT_QUOTAS
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    detail: false,
                    checkboxSelectable: false,
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Project Quotas..'
                    },
                    empty: {
                        text: 'No Project Quotas Found.'
                    }
                }
            },
            columnHeader: {
                columns: quotasColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var quotasColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Resource',
            cssClass :'cell-text-blue'
        },
        {
            id: 'limit',
            field: 'limit',
            name: 'Quota Limit',
            formatter: function(row, col, val, d, rowData) {
                var disStr = '';
                if (null == rowData) {
                    return disStr;
                }
                if (null == rowData['limit']) {
                    return 'Not Set';
                }
                if (-1 == rowData['limit']) {
                    return 'Unlimited';
                }
                return rowData['limit'];
            }
        },
        {
            id: 'used',
            field: 'used',
            name: 'Used',
        }
    ];

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_QUOTAS,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var configData = $(gridElId).data('configObj');
                    var dataItem = configData[0]['quota'];
                    for (key in dataItem) {
                        if (null != dataItem[key]) {
                            dataItem[key] = dataItem[key];
                        } else {
                            /** In case of null, Contrail Model ignores null and considers default value,
                                but to show 'Not Set' placeholder we need to retain null in model
                                so treating null as -2 and formatting it back to null in formatModelConfig **/
                            dataItem[key] = -2;
                        }
                    }
                    var selectedProject = $(gridElId).data('selectedProject');
                    quotasModel = new QuotasModel(dataItem);
                    quotasEditView.model = quotasModel;
                    var selectedProject = selectedProject['value'];
                    quotasEditView.renderEditQuotas({
                                  "title": ctwl.TITLE_EDIT_QUOTAS,
                                  "projUUID": selectedProject,
                                  callback: function() {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    }

   return QuotasGridView;
});

