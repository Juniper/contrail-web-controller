/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var sloListView = ContrailView.extend({
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
                        data: JSON.stringify({data: [{type: "security-logging-objects",
                                parent_id: currentProject.value,
                                fields: ['firewall_policy_back_refs', 'firewall_rule_back_refs']}]})
                    },
                    dataParser: self.parseSloProjectData
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getSloProjectGridViewConfig(viewConfig));
        },

        parseSloProjectData: function(result) {
            var sloConfigDataSrc = [],
            sloConfigs = getValueByJsonPath(result,
                "0;security-logging-objects",
                [], false);
            _.each(sloConfigs, function(sloConfig) {
                if("security-logging-object" in sloConfig) {
                    sloConfigDataSrc.push(sloConfig["security-logging-object"])
                }
            });
            return sloConfigDataSrc;
        },

        getSloProjectGridViewConfig: function(viewConfig) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.CONFIG_SLO_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_SLO_ID,
                                view: "sloGridView",
                                viewPathPrefix:
                                    "config/networking/slo/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    isGlobal: false,
                                    currentProject: viewConfig["projectSelectedValueData"]
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return sloListView;
});

