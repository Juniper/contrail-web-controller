/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
                    dataParser: ctwp.pRoutersDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el, contrailListModel,
                getPhysicalRoutersSectionViewConfig());
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
                                view: "PhysicalRouterGridView",
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

