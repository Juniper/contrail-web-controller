/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var PhysicalRoutersListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url:
                            ctwc.get(
                            ctwc.URL_PHYSICAL_ROUTERS_DETAILS_IN_CHUNKS),
                        type: "GET"
                    },
                    dataParser: self.pRoutersDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el, contrailListModel,
                getPhysicalRoutersSectionViewConfig());
        },
        pRoutersDataParser : function(result) {
            var gridDS = [];
            if(result.length > 0) {
                for(var i = 0; i < result.length;i++) {
                    gridDS.push(result[i]['physical-router']);
                }
            }
            return gridDS;
        }
    });

    var getPhysicalRoutersSectionViewConfig = function () {
        return {
            elementId:
                cowu.formatElementId([ctwl.CONFIG_PHYSICAL_ROUTERS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_PHYSICAL_ROUTERS_ID,
                                title: ctwl.TITLE_PHYSICAL_ROUTERS,
                                view: "physicalRoutersGridView",
                                viewPathPrefix:
                                    "config/physicaldevices/physicalrouters/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig:
                                    {pagerOptions: { options: { pageSize: 10,
                                    pageSizeSelect: [10, 50, 100] } }}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return PhysicalRoutersListView;
});

