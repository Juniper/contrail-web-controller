/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var forwardingClassListView = ContrailView.extend({
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
                        data: JSON.stringify({data:
                            [{type: "forwarding-classs"}]})
                    },
                    dataParser: self.parseForwardingClassData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getfwdClassGridViewConfig());
        },

        parseForwardingClassData: function(result) {
            var fwdClassDataSrc = [],
            fwdClasss = getValueByJsonPath(result,
                "0;forwarding-classs",
                [], false);
            _.each(fwdClasss, function(fwdClass) {
                if("forwarding-class" in fwdClass) {
                    fwdClassDataSrc.push(fwdClass["forwarding-class"])
                }
            });

            //sort the items by forwarding_class_id
            fwdClassDataSrc = _(fwdClassDataSrc).sortBy(function(fwdClass){
               return fwdClass.forwarding_class_id;
           });

            return fwdClassDataSrc;
        },

        getfwdClassGridViewConfig: function() {
            return {
                elementId:
                cowu.formatElementId([ctwc.CONFIG_FORWARDING_CLASS_SECTION_ID]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: ctwc.CONFIG_FORWARDING_CLASS_ID,
                                view: "forwardingClassGridView",
                                viewPathPrefix:
                                    "config/infra/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return forwardingClassListView;
});

