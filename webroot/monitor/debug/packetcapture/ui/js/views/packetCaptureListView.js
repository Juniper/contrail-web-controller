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
    var packetCaptureListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            self.currentProject = viewConfig["projectSelectedValueData"];
            self.analyzerImageAvbl = { isAnalyzerImageCheckDone: false,
                isAnalyzerImageAvailable: false };
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_PACKET_CAPTURE_DATA)
                            + self.currentProject.value + "?template=analyzer-template",
                        type: "GET"
                    },
                    dataParser: self.parsePacketCaptureData,

                },
                vlRemoteConfig :{
                    vlRemoteList : self.getVlRemoteGLConfig(),
                }
            };
            self.contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    self.contrailListModel, getPacketCaptureGridViewConfig());
        },
        parsePacketCaptureData : function(result){
            var gridDS = [], configData, analyzerData, status, reload = false;
            var serviceInstances = getValueByJsonPath(result,
                "service_instances", []);
            _.each(serviceInstances, function(serviceInstance){
                analyzerData = getValueByJsonPath(serviceInstance,
                    "ConfigData;service-instance", null);
                status = getValueByJsonPath(serviceInstance, "vmStatus", "");
                analyzerData["vmStatus"] = status;
                //check status
                if(status.toLowerCase() !== "active") {
                    reload = true;
                } else {
                    analyzerData["vmDetails"] = getValueByJsonPath(serviceInstance,
                        "VMDetails", []);
                }
                gridDS.push(analyzerData);
            });
            if(reload) {
              setTimeout(function(){
                  self.contrailListModel.refreshData()
              }, 30000);
            }
            return gridDS;
        },
        getVlRemoteGLConfig: function () {
            var vlRemoteGLConfig = [
            {
                 getAjaxConfig: function(mainResponse) {
                     var lazyAjaxConfig = {
                         url: ctwc.get(ctwc.URL_GET_SERVICE_TEMPLATE_IMAGES),
                         type: 'GET'
                     };
                     return lazyAjaxConfig;
                 },
                 successCallback: function(response, contrailListModel) {
                     self.analyzerImageAvbl.isAnalyzerImageCheckDone = true;
                     if(response && response.images instanceof Array) {
                         for(var i = 0; i < response.images.length; i++) {
                             if(response.images[i].name == 'analyzer') {
                                 self.analyzerImageAvbl.isAnalyzerImageAvailable = true;
                                 break;
                             }
                         }
                     }
                 }
             }];
             return vlRemoteGLConfig;
        }
    });

    var getPacketCaptureGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.PACKET_CAPTURE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.PACKET_CAPTURE_ID,
                                view: "packetCaptureGridView",
                                viewPathPrefix: "monitor/debug/packetcapture/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    selectedProject: self.currentProject,
                                    analyzerImageAvbl:  self.analyzerImageAvbl
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return packetCaptureListView;
});

