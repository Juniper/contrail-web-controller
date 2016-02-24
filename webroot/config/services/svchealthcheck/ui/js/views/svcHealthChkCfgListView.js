/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var svcHealthChkCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: '/api/tenants/config/get-config-details',
                        type: "POST",
                        data: JSON.stringify({data: [{type: 'service-health-checks',
                                parent_id: viewConfig.projectSelectedValueData.value,
                                fields: ['service_instance_refs']}]})
                    },
                    dataParser: ctwp.svcHealthChkCfgDataParser
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getsvcHealthChkCfgListViewConfig());
        }
    });

    var getsvcHealthChkCfgListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_SVC_HEALTH_CHK_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SVC_HEALTH_CHK_LIST_ID,
                                title: ctwl.CFG_SVC_HEALTH_CHK_TITLE,
                                view: "svcHealthChkCfgGridView",
                                viewPathPrefix:
                                    "config/services/svchealthcheck/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return svcHealthChkCfgListView;
});
