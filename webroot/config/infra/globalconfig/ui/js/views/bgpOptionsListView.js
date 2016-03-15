/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var bgpOptionsListView = ContrailView.extend({
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
                            {data: [{type: 'global-system-configs'}]})
                    },
                    dataParser: self.parseBGPOptionsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getBGPOptionsGridViewConfig());
        },
        parseBGPOptionsData : function(result){
            var gridDS = [],
                globalSysConfig = getValueByJsonPath(result,
                    "0;global-system-configs;0;global-system-config", {});
            _.each(ctwc.GLOBAL_BGP_OPTIONS_MAP, function(bgpOption){
                gridDS.push({name: bgpOption.name, key: bgpOption.key,
                    value: globalSysConfig[bgpOption.key]});
            });
            return gridDS;
        }
    });

    var getBGPOptionsGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_BGP_OPTIONS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_BGP_OPTIONS_ID,
                                view: "bgpOptionsGridView",
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

    return bgpOptionsListView;
});

