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
                viewConfig = self.attributes.viewConfig;

            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "security-logging-objects",
                            parent_type: "global-vrouter-config", fields: ['firewall_policy_back_refs', 'firewall_rule_back_refs'],
                            parent_fq_name_str:
                                "default-global-system-config:" +
                                "default-global-vrouter-config"}]})
                    },
                    dataParser: self.parseSloData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getSloGridViewConfig());
        },

        parseSloData: function(result) {
            var sloList = [],
            slo = getValueByJsonPath(result,
                "0;security-logging-objects",
                [], false);
            _.each(slo, function(sloObj) {
                if("security-logging-object" in sloObj) {
                    sloList.push(sloObj["security-logging-object"])
                }
            });

            //sort the items by UUID
            sloList = _(sloList).sortBy(function(sloObj){
               return sloObj.uuid;
           });

            return sloList;
        },

        getSloGridViewConfig: function() {
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
                                    isGlobal: true
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

