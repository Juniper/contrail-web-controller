/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var qosListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];

            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "qos-configs",
                                parent_id: currentProject.value}]})
                    },
                    dataParser: self.parseQOSProjectData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getQOSProjectGridViewConfig());
        },

        parseQOSProjectData: function(result) {
            var qosConfigDataSrc = [],
            qosConfigs = getValueByJsonPath(result,
                "0;qos-configs",
                [], false);
            _.each(qosConfigs, function(qosConfig) {
                if("qos-config" in qosConfig) {
                    qosConfigDataSrc.push(qosConfig["qos-config"])
                }
            });
            return qosConfigDataSrc;
        },

        getQOSProjectGridViewConfig: function() {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_QOS_PROJECT_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_QOS_PROJECT_ID,
                                view: "qosGridView",
                                viewPathPrefix:
                                    "config/networking/qos/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    isGlobal: false
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return qosListView;
});

