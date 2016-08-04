/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var userDefinedCountersListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'global-system-configs'}]})
                    },
                    dataParser: self.parseUserDefinedCounterData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, userDefinedCountersGridViewConfig());
        },
        parseUserDefinedCounterData : function(result){
            var gridDS = getValueByJsonPath(result,
                    "0;global-system-configs;0;global-system-config;user_defined_log_statistics;statlist", []);
            return gridDS;
        }
    });
    var userDefinedCountersGridViewConfig = function () {
        return {
            elementId: ctwc.GLOBAL_USER_DEFINED_COUNTRER_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.USER_DEFINED_COUNTRERS_GLOBAL,
                                view: "userDefinedCountersGridView",
                                viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                            }
                        ]
                    }
                ]
            }
        }
    };

    return userDefinedCountersListView;
});

