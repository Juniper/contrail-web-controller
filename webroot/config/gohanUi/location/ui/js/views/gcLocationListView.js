/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var locationListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_LOCATION + ctwc.GOHAN_PARAM,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanLocationParser
                    }
             };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getLocationListViewConfig());
        }
    });
    var getLocationListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_LOCATION_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_LOCATION_LIST_ID,
                                title: ctwl.CFG_LOCATION_TITLE,
                                view: "gcLocationGridView",
                                viewPathPrefix:
                                    "config/gohanUi/location/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return locationListView;
});
