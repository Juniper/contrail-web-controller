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

            var token = JSON.parse(sessionStorage.getItem('scopedToken'));
            var id = token[Object.keys(token)[0]]['access']['token']['id'];
            $.ajaxSetup({
              beforeSend: function (xhr) {
                  xhr.setRequestHeader('X-Auth-Token', id);
              }
            });
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: './gohan_contrail/v1.0/tenant/service_templates?sort_key=id&sort_order=asc&limit=25&offset=0',
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
                                view: "svcTemplateCfgGridView",
                                viewPathPrefix:
                                    "config/gohanUi/ui/js/views/templates/",
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
