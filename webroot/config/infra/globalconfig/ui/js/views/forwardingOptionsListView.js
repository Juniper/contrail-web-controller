/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailView, ContrailListModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var forwardingOptionsListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'global-vrouter-configs'}]})
                    },
                    dataParser: self.parseForwardingOptionsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getForwardingOptionsGridViewConfig());
        },
        parseForwardingOptionsData : function(response){
            var dataItems = [],
                globalVRConfigMap = ctwc.GLOBAL_FORWARDING_OPTIONS_MAP,
                globalVRConfigMapLen = globalVRConfigMap.length,
                gvData = getValueByJsonPath(response,
                    "0;global-vrouter-configs;0;global-vrouter-config", {});
                _.each(ctwc.GLOBAL_FORWARDING_OPTIONS_MAP, function(fwdOption){
                    dataItems.push({ name: fwdOption.name,
                        value: gvData[fwdOption.key], key: fwdOption.key});
                });
            return dataItems;
        }
    });

    var getForwardingOptionsGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_FORWARDING_OPTIONS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_FORWARDING_OPTIONS_ID,
                                view: "forwardingOptionsGridView",
                                viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
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

    return forwardingOptionsListView;
});

