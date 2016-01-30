/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/networking/routetable/ui/js/models/RtTableModel'
], function (_, ContrailView, ContrailListModel, RtTableModel) {
    var gridElId = '#' + ctwl.RT_TABLE_GRID_ID;
    var selectedProject = null;
    var rtTableList = [];
    var RtTableListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            selectedProject =
                viewConfig['projectSelectedValueData'];
            var postData = {
                "data": [{
                    "type": "route-tables",
                    "fields": ["routes"],
                    "parent_id": selectedProject['value']
                }]
            };
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url:
                            ctwc.get('/api/tenants/config/get-config-details'),
                        type: "POST",
                        data: JSON.stringify(postData)
                    },
                    dataParser: rtTableParser,
                    completeCallback: function(resp) {
                        self.renderView4Config(self.$el, contrailListModel,
                                               getRtTableViewConfig(selectedProject),
                                               null, null, null, function() {
                        });
                    }
                },
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    function rtTableParser (response) {
        if ((null == response) || (null == response[0]) ||
            (null == response[0]['route-tables'])) {
            return [];
        }
        var results = [];
        var rtTabs = response[0]['route-tables'];
        var cnt = rtTabs.length;
        for (var i = 0; i < cnt; i++) {
            var rts = getValueByJsonPath(rtTabs[i], 'route-table;routes;route', null);
            if (null != rts) {
                rtTabs[i]['route-table']['route'] = rts;
                delete rtTabs[i]['route-table']['routes'];
            } else {
                rtTabs[i]['route-table']['route'] = [];
            }
            results.push(rtTabs[i]['route-table']);
        }
        return results;
    };

    var getRtTableViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_RT_TABLE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.NETWORK_ROUTE_TABLE_ID,
                                title: ctwl.TITLE_RT_TABLE,
                                view: "RtTableGridView",
                                viewPathPrefix: "config/networking/routetable/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    gridId: 'networkgrid'
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return RtTableListView;
});


