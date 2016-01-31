/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/GlobalConfigModel',
    'config/infra/globalconfig/ui/js/views/GlobalConfigEditView',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailView, GlobalConfigModel, GlobalConfigEditView,
             GlobalConfigUtils) {
    var globalConfigEditView = new GlobalConfigEditView(),
    gridElId = "#" + ctwl.GLOBAL_CONFIG_GRID_ID;
    var gcUtils = new GlobalConfigUtils();

    var GlobalConfigGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getGlobalConfigGridViewConfig(pagerOptions));
        }
    });

    var getGlobalConfigGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_GLOBAL_CONFIG_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.GLOBAL_CONFIG_GRID_ID,
                                title: ctwl.TITLE_GLOBAL_CONFIG,
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
                    text: ctwl.TITLE_GLOBAL_CONFIG
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable : false,
                    detail: false,
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: globalConfigColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var globalConfigColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Configuration Option',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
                if ('forwarding_mode' == rowData['key']) {
                    if (("" == val) || (undefined == val)) {
                        return 'Default';
                    }
                    if ('l2' == val) {
                        return 'L2 Only';
                    }
                    if ('l3' == val) {
                        return 'L3 Only';
                    }
                    if ('l2_l3' == val) {
                        return 'L2 and L3';
                    }
                }
                if ('flow_export_rate' == rowData['key']) {
                    if ((undefined == val) || ("" == val)) {
                        return "-";
                    } else {
                        return val;
                    }
                }
                if ('flow_aging_timeout_list' == rowData['key']) {
                    var list = getValueByJsonPath(val, 'flow_aging_timeout', []);
                    if (!list.length) {
                        return "-";
                    }
                    var cnt = list.length;
                    for (var i = 0; i < cnt; i++) {
                        dispStr += "Protocol: " +
                            list[i]['protocol'].toUpperCase();
                        dispStr += ", Port: " + list[i]['port'];
                        dispStr += ", Timeout: " + list[i]['timeout_in_seconds']
                            + ' seconds';
                        dispStr += '<br>';
                    }
                    return dispStr;
                }
                if ('vxlan_network_identifier_mode' == rowData['key']) {
                    if ("automatic" == val) {
                        return 'Auto Configured';
                    } else if ("configured" == val) {
                        return "User Configured";
                    }
                    return val;
                }
                if ('ibgp_auto_mesh' == rowData['key']) {
                    if (false == val) {
                        return 'Disabled';
                    }
                    return 'Enabled';
                }
                if ('encapsulation_priorities' == rowData['key']) {
                    val = val['encapsulation'];
                    var uiEncap = gcUtils.mapConfigEncapToUIEncap(val);
                    var len = val.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += val[i] + '<br>';
                    }
                    return dispStr;
                }
                if ('ip_fabric_subnets' == rowData['key']) {
                    dispStr = '-';
                    val = val['subnet'];
                    var len = val.length;
                    for (var i = 0; i < len; i++) {
                        if (0 == i) {
                            dispStr = "";
                        }
                        dispStr += val[i] + "<br>";
                    }
                    return dispStr;
                }
                if ('ecmp_hashing_include_fields' == rowData['key']) {
                    dispStr = '-';
                    var fields = [];
                    for (var key in val) {
                        if (true == val[key]) {
                            key = key.replace('_', '-');
                            fields.push(key);
                        }
                    }
                    if (fields.length > 0) {
                        return fields.join(', ');
                    }
                    return dispStr;
                }
                return val;
            },
            sortable: false
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_GLOBAL_CONFIG,
                "iconClass": 'icon-edit',
                "onClick": function() {
                    var configData = $(gridElId).data('configObj');
                    var gridData =
                        $(gridElId).data('contrailGrid')._dataView.getItems();
                    var gridDataCnt = gridData.length;
                    var configObj = {};
                    for (var i = 0; i < gridDataCnt; i++) {
                        configObj[gridData[i]['key']] = gridData[i]['value'];
                    }
                    globalConfigModel = new GlobalConfigModel(configObj);
                    globalConfigEditView.model = globalConfigModel;
                    globalConfigEditView.renderEditGlobalConfig({
                                  "title": ctwl.TITLE_EDIT_GLOBAL_CONFIG,
                                  "configData": configData,
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

   return GlobalConfigGridView;
});

