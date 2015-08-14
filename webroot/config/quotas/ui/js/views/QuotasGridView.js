/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/quotas/ui/js/models/QuotasModel',
    'config/quotas/ui/js/views/QuotasEditView'
], function (_, ContrailView, QuotasModel, QuotasEditView) {
    var quotasEditView = new QuotasEditView(),
    gridElId = "#" + ctwl.QUOTAS_GRID_ID;

    var QuotasGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getQuotasGridViewConfig(pagerOptions));
        }
    });

    var getQuotasGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.QUOTAS_GRID_ID,
                                title: ctwl.TITLE_QUOTAS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_QUOTAS
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    detail: {
                    },
                    /*
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelLLS').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelLLS').removeClass('disabled-link');
                        }
                    },
                    */
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: quotasColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions,
                                             {
                                                 options: {
                                                     pageSize: 5,
                                                     pageSizeSelect: [5, 10, 50, 100]
                                                 }
                                             })
            }
        };
        return gridElementConfig;
    };

    var quotasColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Resource',
            cssClass :'cell-hyperlink-blue'
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

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_QUOTAS,
                "iconClass": 'icon-edit',
                "onClick": function() {
                    var configData = $(gridElId).data('configObj');
                    var dataItem = configData[0]['quota'];
                    quotasModel = new QuotasModel(dataItem);
                    quotasEditView.model = quotasModel;
                    var projectObj = cobdcb.getSelectedValue('project');
                    var selectedProject = null;
                    if (null != projectObj) {
                        selectedProject = projectObj['value'];
                    }
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

