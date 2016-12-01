/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/routetable/ui/js/models/RtTableModel',
    'config/networking/routetable/ui/js/views/RtTableEditView',
    'config/networking/routetable/ui/js/rtTableUtils'
], function (_, ContrailView, RtTableModel, RtTableEditView, RTTableUtils) {
    var rtTableEditView = new RtTableEditView(),
        rtTableUtils = new RTTableUtils(),
        gridElId = "#" + ctwl.INF_RT_TABLE_GRID_ID,
        infRTType = 'interface-route-table';

    var RtTableInfGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getRtTableGridViewConfig(pagerOptions));
        }
    });

    var getRtTableGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId([ctwl.CONFIG_INF_RT_TABLE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INF_RT_TABLE_GRID_ID,
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
                    text: ctwl.INF_RT_GRID_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template:
                                cowu.generateDetailTemplateHTML(
                                        rtTableUtils.getRTTableDetailsConfig(),
                                        cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelInfRtTable').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelInfRtTable').removeClass('disabled-link');
                        }
                    },
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading ' + ctwl.INF_RT_GRID_TITLE + '..',
                    },
                    empty: {
                        text: 'No ' + ctwl.INF_RT_GRID_TITLE + ' Found.'
                    }
                }
            },
            columnHeader: {
                columns: rtTableUtils.rtTableColumns("Interface Routes")
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var rtTableModel = new RtTableModel(dataItem);
            rtTableEditView.model = rtTableModel;
            rtTableEditView.renderConfigureRtTable({
                                  "title": ctwl.EDIT,
                                  rowIndex: rowIndex,
                                  type: infRTType,
                                  dataItem: dataItem,
                                  isEdit: true,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var rtTableModel = new RtTableModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var checkedRows = [dataItem];
            rtTableEditView.model = rtTableModel;
            rtTableEditView.renderDeleteRtTables({
                                  "title": ctwl.TITLE_DEL_INF_RT_TABLE +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  checkedRows: checkedRows,
                                  type: infRTType,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_MULTI_DEL_INF_RT_TABLE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnActionDelInfRtTable',
                "onClick": function() {
                     var rtTableModel = new RtTableModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();

                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderDeleteRtTables({
                                  "title": ctwl.TITLE_MULTI_DEL_INF_RT_TABLE,
                                  checkedRows: checkedRows,
                                  type: infRTType,
                                  callback: function () {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_INF_RT_TABLE,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    var projFqn = [contrail.getCookie(cowc.COOKIE_DOMAIN),
                        getCookie(cowc.COOKIE_PROJECT)];
                    rtTableModel = new RtTableModel();
                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderConfigureRtTable({
                                  "title": ctwl.CREATE,
                                  "isEdit": false,
                                  type: infRTType,
                                  projFqn: projFqn,
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

   return RtTableInfGridView;
});

