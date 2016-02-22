/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/routetable/ui/js/models/RtTableModel',
    'config/networking/routetable/ui/js/views/RtTableEditView',
], function (_, ContrailView, RtTableModel, RtTableEditView) {
    var rtTableEditView = new RtTableEditView(),
        elId = "#" + ctwl.RT_TABLE_GRID_ID,
        tabId = 0, tabText = 'Tab' + tabId;
        var gridElId;
        //tabId = $('#rt-table-tab').tabs('option', 'active'),
        //tabText = 'Tab' + tabId.toString();

    var RtTableGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'],
                tabId = $('#rt-table-tab').tabs('option', 'active'),
                tabText = 'Tab' + tabId.toString();
            gridElId = elId + tabText;
            self.renderView4Config(self.$el, self.model,
                                   getRtTableGridViewConfig(pagerOptions));
        }
    });

    var getRtTableGridViewConfig = function (pagerOptions) {
        tabId = $('#rt-table-tab').tabs('option', 'active');
        var tabText = 'Tab' + tabId.toString();
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_RT_TABLE_LIST_VIEW_ID +
                                            tabText]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.RT_TABLE_GRID_ID + tabText,
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
        var tabId = $('#rt-table-tab').tabs('option', 'active');
        var tabText = 'Tab' + tabId.toString();

        var text = 'Network Route Tables';
        if (1 == tabId) {
            text = 'Interface Route Tables';
        }
        var gridElementConfig = {
            header: {
                title: {
                    text: text
                },
                advanceControls: getHeaderActionConfig(tabText),
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
                            $('#btnActionDelRtTable'  + tabText).addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelRtTable' + tabText).removeClass('disabled-link');
                        }
                    },
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: rtTableColumns(tabId)
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    this.routetTablesFormatter = function(val, obj) {
        return rtTablesFormatter(null, null, val, null, obj, true);
    }

    function getSecGenDetailsTempConfig () {
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
                                        keyClass: 'span3',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'uuid',
                                        label: 'UUID',
                                        keyClass: 'span3',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'route',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Routes',
                                        keyClass: 'span3',
                                        valueClass: 'span9',
                                        templateGeneratorConfig: {
                                            formatter: 'routetTablesFormatter'
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

    function getRtTableDisplayName () {
        var tabId = $('#rt-table-tab').tabs('option', 'active');
        if (0 == tabId) {
            return 'Network Route Table';
        }
        return 'Interface Route Table';
    }

    function getRTTableName () {
        var tabId = $('#rt-table-tab').tabs('option', 'active');
        if (0 == tabId) {
            return 'route-table';
        }
        return 'interface-route-table';
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var tabId = $('#rt-table-tab').tabs('option', 'active');
            gridElId = elId + 'Tab' + tabId.toString();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var rtTableModel = new RtTableModel(dataItem);
            rtTableEditView.model = rtTableModel;
            rtTableEditView.renderConfigureRtTable({
                                  "title": 'Edit ' + getRtTableDisplayName() +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  rowIndex: rowIndex,
                                  type: getRTTableName(),
                                  dataItem: dataItem,
                                  isEdit: true,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var tabId = $('#rt-table-tab').tabs('option', 'active');
            gridElId = elId + 'Tab' + tabId.toString();
            var rtTableModel = new RtTableModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var checkedRows = [dataItem];
            rtTableEditView.model = rtTableModel;
            rtTableEditView.renderDeleteRtTables({
                                  "title": 'Delete ' + getRtTableDisplayName() +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  checkedRows: checkedRows,
                                  type: getRTTableName(),
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];

    function rtTablesFormatter (r, c, v, cd, dc, details) {
        var dispStr = "";
        if (null != v) {
            if (!v.length) {
                return "-";
            }
            var len = v.length;
            if ((null == details) || (false == details)) {
                if (v.length > 2) {
                    len = 2;
                } else {
                    len = v.length;
                }
            }
            for (var i = 0; i < len; i++) {
                if (null != v[i]['prefix']) {
                    dispStr += 'prefix ';
                    dispStr += '<span class="gridLabel">' + v[i]['prefix'] + '</span>';
                }
                if (null != v[i]['next_hop_type']) {
                    dispStr += 'next-hop-type ';
                    dispStr += '<span class="gridLabel">' +
                        v[i]['next_hop_type'] + '</span>';
                }
                if (null != v[i]['next_hop']) {
                    dispStr += 'next-hop ';
                    dispStr += '<span class="gridLabel">' + v[i]['next_hop'] +
                        '</span>';
                }
                var commAttr =
                    getValueByJsonPath(v[i],
                                       'community_attributes;community_attribute',
                                       []);
                if (commAttr.length > 0) {
                    dispStr += 'community-attributes ';
                    dispStr += '<span class="gridLabel">' +
                        commAttr.join(', ') + '</span>';
                }
                dispStr += '<br>';
            }
            if (((null == details) || (false == details)) && (v.length > 2)) {
                dispStr += '(' + (v.length - 2).toString() + ' more)';
            }
        }
        return dispStr;
    }

    var rtTableColumns = function(tabId) {
        return [
            {
                id: 'display_name',
                field: 'display_name',
                width: 20,
                name: 'Route Table',
            },
            {
                id: "route",
                field: "route",
                width: 80,
                name: (tabId == 0) ? 'Network Routes' : 'Interface Routes',
                formatter: rtTablesFormatter,
                sortable: {
                    sortBy: 'formattedValue'
                }
            }
        ];
    }

    function getHeaderActionConfig(tabText) {
        var rtTableName = getRtTableDisplayName();
        var tabId = $('#rt-table-tab').tabs('option', 'active');
        var tabText = 'Tab' + tabId.toString();
        gridElId = elId + 'Tab' + tabId.toString();
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Delete ' + rtTableName,
                "iconClass": 'icon-trash',
                "linkElementId": 'btnActionDelRtTable' + tabText,
                "onClick": function() {
                     var rtTableModel = new RtTableModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();

                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderDeleteRtTables({
                                  "title": 'Delete ' + rtTableName,
                                  checkedRows: checkedRows,
                                  type: getRTTableName(),
                                  callback: function () {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": 'Create ' + rtTableName,
                "iconClass": 'icon-plus',
                "onClick": function() {
                    var projFqn = [getCookie('domain'),
                        getCookie('project')];
                    rtTableModel = new RtTableModel();
                    rtTableEditView.model = rtTableModel;
                    rtTableEditView.renderConfigureRtTable({
                                  "title": 'Create ' + rtTableName,
                                  "isEdit": false,
                                  type: getRTTableName(),
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


