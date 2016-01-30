/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/vrouters/ui/js/models/vRouterCfgModel',
    'config/infra/vrouters/ui/js/views/vRouterCfgEditView',
    'config/infra/vrouters/ui/js/views/vRouterCfgFormatters'],
    function (_, ContrailView, VRouterCfgModel,
                 VRouterCfgEditView, VRouterCfgFormatters) {
    var dataView;

    var vRouterCfgEditView  = new VRouterCfgEditView();
    var formatvRouterCfg    = new VRouterCfgFormatters();

    var vRouterCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getvRouterCfgGridViewConfig());
        }
    });



    var getvRouterCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VROUTER_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VROUTER_GRID_ID,
                                title: ctwl.CFG_VROUTER_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CFG_VROUTER_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkvRouterDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkvRouterDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getvRouterCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    empty: {
                        type: 'status',
                        iconClasses: '',
                        text: 'No Virtual Routers Found.'
                    },
                }
            },
            columnHeader: {
                columns: [
                     {
                         field:  'name',
                         name:   'Name'
                     },
                     {
                         field:  'virtual_router_type',
                         name:   'Type',
                         formatter: function(r, c, v, cd, dc) {
                             return formatVirtualRouterType(dc.virtual_router_type);
                         },
                         sortable: {
                         sortBy: 'formattedValue'
                         },
                     },
                     {
                         field:  'virtual_router_ip_address',
                         name:   'IP Address',
                         sorter: comparatorIP
                     }
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_VROUTER_TITLE_MULTI_DELETE,
                "iconClass": "icon-trash",
                "linkElementId": "linkvRouterDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_VROUTER_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    vRouterCfgEditView.model = new VRouterCfgModel();
                    vRouterCfgEditView.renderMultiDeletevRouterCfg(
                        {"title": ctwl.CFG_VROUTER_TITLE_MULTI_DELETE,
                        checkedRows: checkedRows, callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_VROUTER_TITLE_CREATE,
                "iconClass": "icon-plus",
                "onClick": function () {
                    vRouterCfgEditView.model = new VRouterCfgModel();
                    vRouterCfgEditView.renderAddvRouterCfg({
                                              "title": ctwl.CFG_VROUTER_TITLE_CREATE,
                                              callback: function () {
                    $('#' + ctwl.CFG_VROUTER_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_VROUTER_GRID_ID).data("contrailGrid")._dataView;
            vRouterCfgEditView.model = new VRouterCfgModel(dataView.getItem(rowIndex));
            vRouterCfgEditView.renderEditvRouterCfg({
                                  "title": ctwl.CFG_VROUTER_TITLE_EDIT,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_VROUTER_GRID_ID).data("contrailGrid")._dataView;
            vRouterCfgEditView.model = new VRouterCfgModel();
            vRouterCfgEditView.renderMultiDeletevRouterCfg({
                                  "title": ctwl.CFG_VROUTER_TITLE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];



    function getvRouterCfgDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VROUTER_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                //Following two need custom formatters
                                                {
                                                    key: 'virtual_router_type',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                            formatter: 'formatVirtualRouterType'
                                                        }
                                                },
                                                {
                                                    key: 'virtual_router_ip_address',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'physical_router_back_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                            formatter: 'pRouterFormatter'
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.pRouterFormatter = function (v, dc) {
        return formatvRouterCfg.pRouterFormatter(null, null,
                                                        null, null, dc);
    }

    return vRouterCfgGridView;
});
