/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var flavorListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_FLAVOR_URL + ctwc.GOHAN_TENANT_PARAM + tenantId,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanFlavorParser
                    }
             };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getFlavorListViewConfig());
        }
    });
    var getFlavorListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_FLAVOR_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_FLAVOR_LIST_ID,
                                title: ctwl.CFG_FLAVOR_TITLE,
                                view: "gcFlavorGridView",
                                viewPathPrefix:
                                    "config/gohanUi/flavor/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return flavorListView;
});
