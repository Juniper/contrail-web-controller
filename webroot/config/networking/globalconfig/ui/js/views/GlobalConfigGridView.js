/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/globalconfig/ui/js/models/GlobalConfigModel',
    'config/networking/globalconfig/ui/js/views/GlobalConfigEditView'
], function (_, ContrailView, GlobalConfigModel, GlobalConfigEditView) {
    var globalConfigEditView = new GlobalConfigEditView(),
    gridElId = "#" + ctwl.GLOBAL_CONFIG_GRID_ID;

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
            footer: {
            }
        };
        return gridElementConfig;
    };

    var globalConfigColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Configuration Option',
            cssClass: 'cell-text-blue'
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
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
                    var len = val.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += val[i] + "  ";
                    }
                    return dispStr;
                }
                if ('ip_fabric_subnets' == rowData['key']) {
                    dispStr = '-';
                    val = val['subnet'];
                    var len = val.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += val[i] + "  ";
                    }
                    return dispStr;
                }
                return val;
            }
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

