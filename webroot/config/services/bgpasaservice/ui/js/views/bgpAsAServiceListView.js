/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var configObj = {};
    var self;
    var bgpAsAServiceListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            var currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_BGP_AS_A_SERVICE_DATA)
                            + currentProject.value,
                        type: "GET"
                    },
                    dataParser: self.parseBGPAsAServiceData,

                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getBGPAsAServiceGridViewConfig(currentProject));
        },
        parseBGPAsAServiceData : function(result){
            var gridDS = [];
            if(result && result["bgp-as-a-services"] instanceof  Array)  {
               var bgpAsAServices = result["bgp-as-a-services"];
               for(var i = 0; i < bgpAsAServices.length; i++) {
                   gridDS.push(bgpAsAServices[i]["bgp-as-a-service"]);
               }
            }
            return gridDS;
        }
    });

    var getBGPAsAServiceGridViewConfig = function (currentProject) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_BGP_AS_A_SERVICE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_BGP_AS_A_SERVICE_ID,
                                title: ctwc.TITLE_BGP_AS_A_SERVICE,
                                view: "bgpAsAServiceGridView",
                                viewPathPrefix: "config/services/bgpasaservice/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    currentProjectUUID: currentProject.value
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return bgpAsAServiceListView;
});

