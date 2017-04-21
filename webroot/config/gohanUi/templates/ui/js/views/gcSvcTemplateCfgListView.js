/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var svcTemplateCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: ctwc.SVC_TEMPLATES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                           type: "GET"
                       },
                       dataParser: ctwp.gohanServiceTempDataParser
                   }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getSvcTemplateCfgListViewConfig());
        }
    });

    var getSvcTemplateCfgListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_SVC_TEMPLATE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SVC_TEMPLATE_LIST_ID,
                                title: ctwl.CFG_SVC_TEMPLATE_TITLE,
                                view: "gcSvcTemplateCfgGridView",
                                viewPathPrefix:
                                    "config/gohanUi/templates/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return svcTemplateCfgListView;
});
