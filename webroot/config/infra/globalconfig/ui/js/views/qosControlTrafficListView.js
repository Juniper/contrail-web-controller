/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailView, ContrailListModel, GlobalConfigUtils) {
    var gcUtils = new GlobalConfigUtils();
    var qosControlTrafficListView = ContrailView.extend({
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
                            {data: [{type: 'global-qos-configs'}]})
                    },
                    dataParser: self.parseQoSControlTrafficData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getQoSControlTrafficGridViewConfig());
        },
        parseQoSControlTrafficData : function(result){
            var gridDS = [],
                globalSysConfig = getValueByJsonPath(result,
                    "0;global-qos-configs;0;global-qos-config", {});
            _.each(ctwc.GLOBAL_CONTROL_TRAFFIC_MAP, function(qosControlTraffic){
                gridDS.push({name: qosControlTraffic.name, key: qosControlTraffic.key,
                    value: gcUtils.getTextByValue(
                        ctwc.QOS_DSCP_VALUES,
                            getValueByJsonPath(globalSysConfig,
                                qosControlTraffic.key, "-", false))});
            });
            return gridDS;
        }
    });

    var getQoSControlTrafficGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_CONTROL_TRAFFIC_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_CONTROL_TRAFFIC_ID,
                                view: "qosControlTrafficGridView",
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

    return qosControlTrafficListView;
});

