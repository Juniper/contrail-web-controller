/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/routetable/ui/js/models/RtTableModel',
    'config/networking/routetable/ui/js/views/RtTableEditView',
    'config/networking/routetable/ui/js/RtTableUtils'
], function (_, ContrailView, RtTableModel, RtTableEditView, RtTableUtils) {
    var rtTableEditView = new RtTableEditView(),
        gridElId = "#" + ctwl.RT_TABLE_GRID_ID;

    var rtUtils = new RtTableUtils();

    var RtTableGridView = ContrailView.extend({
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
            elementId: cowu.formatElementId([ctwl.CONFIG_RT_TABLE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.RT_TABLE_GRID_ID,
                                title: ctwl.TITLE_RT_TABLE,
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
                    text: ctwl.TITLE_RT_TABLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template:
                                cowu.generateDetailTemplateHTML(getSecGenDetailsTempConfig(),
                                                                cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelRtTable').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelRtTable').removeClass('disabled-link');
                        }
                    },
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: rtTableColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    this.rtTableRoutesFormatter = function(val, obj) {
        var returnHtml = "";
        var routes = getValueByJsonPath(obj, 'routes;route', []);
        var len = routes.length;
        if (!len) {
            return "-";
        }
        var routesHeader =
            '<tr class="bgCol">' +
                 '<td class="span2"><label>Prefix</label></td>' +
                 '<td class="span2"><label>Next Hop</label></td>' +
                 '<td class="span3"><label>Next Hop Type</label></td>' +
                 '<td class="span3"><label>Communities</label></td>' +
              '</tr>';
        returnHtml += routesHeader;

        for (var i = 0; i < len; i++) {
            returnHtml += '<tr>';
            var prefix =
                (null != routes[i]['prefix']) ? routes[i]['prefix'] : "-";
            returnHtml += '<td class="span2">' + prefix + '</td>';
            var nextHop =
                (null != routes[i]['next_hop']) ? routes[i]['next_hop'] : "-";
            returnHtml += '<td class="span2">' + nextHop + '</td>';
            var nextHopType =
                (null != routes[i]['next_hop_type']) ?
                routes[i]['next_hop_type'] : "-";
            returnHtml += '<td class="span3">' + nextHopType + '</td>';
            var commAttrs =
                getValueByJsonPath(routes[i],
                                   'community_attributes;community_attribute',
                                   []);
            if (commAttrs.length > 0) {
                returnHtml += '<td class="span3">' + commAttrs.join (', ') +
                    '</td>';
            }
            returnHtml += '</tr>';
        }
        returnHtml = "<table class='table detailsSub'>" + returnHtml +
            "</table>";
        return returnHtml;
    }

    function getSecGenDetailsTempConfig () {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'span6',
                            rows: [{
                                title: ctwl.RT_TABLE_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'display_name',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'uuid',
                                        label: 'UUID',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'routes',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Routes',
                                        minWidth: 300,
                                        width: 300,
                                        templateGeneratorConfig: {
                                            formatter: 'rtTableRoutesFormatter'
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }]
            }
        }
    };

    this.rtTableRulesFormatter = function(value, dc) {
        return rtUtils.rtTableRulesFormatter(null, null, null, value, dc, true);
    };

    this.rtTableIDFormatter = function(val, obj) {
        var dispStr = "";
        if (0 == Number(val)) {
            dispStr = "Auto Configured ";
            if ('security_group_id' in obj) {
                dispStr += "(" + obj['security_group_id'] + ")";
            }
        } else {
            dispStr = val;
        }
        return dispStr;
    };

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var rtTableModel = new RtTableModel(dataItem);
            rtTableEditView.model = rtTableModel;
            rtTableEditView.renderConfigureRtTable({
                                  "title": ctwl.TITLE_EDIT_RT_TABLE +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  rowIndex: rowIndex,
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
                                  "title": ctwl.TITLE_DEL_RT_TABLE +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  checkedRows: checkedRows,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];

    function rtTablesCountFormatter (r, c, v, cd, dc) {
        console.log("Hello");
        if ((null != v) && (null != v['route'])) {
            return v['route'].length;
        }
        return "-";
    }

    var rtTableColumns = [
        {
            id: 'display_name',
            field: 'display_name',
            width: 90,
            name: 'Route Table',
        },
        {
            id: "routes",
            field: "routes",
            name: "# Routes",
            formatter: rtTablesCountFormatter
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_RT_TABLE,
                "iconClass": 'icon-trash',
                "linkElementId": 'btnActionDelRtTable',
                "onClick": function() {
                     var rtTableModel = new RtTableModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();

                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderDeleteRtTables({
                                  "title": ctwl.TITLE_DEL_RT_TABLE,
                                  checkedRows: checkedRows,
                                  callback: function () {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_RT_TABLE,
                "iconClass": 'icon-plus',
                "onClick": function() {
                    var projFqn = [getCookie('domain'),
                        getCookie('project')];
                    rtTableModel = new RtTableModel();
                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderConfigureRtTable({
                                  "title": ctwl.TITLE_CREATE_RT_TABLE,
                                  "isEdit": false,
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

   return RtTableGridView;
});


