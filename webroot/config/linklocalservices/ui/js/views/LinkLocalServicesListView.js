/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/linklocalservices/ui/js/models/LinkLocalServicesModel'
], function (_, ContrailView, ContrailListModel, LinkLocalServicesModel) {
    var LinkLocalServicesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_GLOBAL_VROUTER_CONFIG),
                        type: "GET"
                    },
                    dataParser: function(response){
                        var linkLocalServicesModel = new
                            LinkLocalServicesModel();
                        var gridElId = '#' + ctwl.LINK_LOCAL_SERVICES_GRID_ID;
                        $(gridElId).data('configObj', response);
                        return llswp.llsDataParser(response)
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel, getLinkLocalServicesViewConfig());
        }
    });

    var getLinkLocalServicesViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_LINK_LOCAL_SERVICES_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_LINK_LOCAL_SERVICES_ID,
                                title: ctwl.TITLE_LINK_LOCAL_SERVICES,
                                view: "LinkLocalServicesGridView",
                                viewPathPrefix: "config/linklocalservices/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10, pageSizeSelect: [10, 50, 100]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return LinkLocalServicesListView;
});

