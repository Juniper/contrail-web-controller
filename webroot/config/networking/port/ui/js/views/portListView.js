/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'contrail-view',
    'config/networking/port/ui/js/views/portFormatters'
], function (_, Backbone, ContrailListModel, ContrailView,
             PortFormatters) {
    var self;
    var portFormatters = new PortFormatters();
    var portListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            viewConfig = this.attributes.viewConfig;
            self.portGetChunkCnt = 50,
            self.portAjaxRef = 0,
            self.ajaxTimeout = 300000;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_PORT_UUID,
                                      viewConfig.selectedProjectId),
                        type: "GET"
                    },
                    dataParser: self.fetchPortData
                }
            };

            self.contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, self.contrailListModel,
                                   getportListViewConfig(viewConfig));
        },

    fetchPortData : function (result) {
        if(result.length > 0) {
            self.fetchPortWithUUID(result, function() {
                return [];
            });
        }
        return [];
    },
    fetchPortWithUUID : function(allUUID, callback) {
        self.portAjaxRef += 1;
        self.fetchPortChunk(allUUID, self.portAjaxRef, callback);
    },
    fetchPortChunk : function(allUUID, cbparam, callback) {
        var vmiUUIDObj = {};
        vmiUUIDObj.type = "virtual-machine-interface";
        vmiUUIDObj.uuidList = allUUID.slice(0, self.portGetChunkCnt);
        if(vmiUUIDObj.uuidList.length > 0) {
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_PORT),
                type : 'POST',
                data : JSON.stringify(vmiUUIDObj),
                timeout : self.ajaxTimeout
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result, cbparam){
                    if (cbparam.cbparam != self.portAjaxRef){
                        return;
                    }
                    self.appendNewData(result);
                        cbparam.allUUID = cbparam.allUUID.slice(
                                          self.portGetChunkCnt,
                                          cbparam.allUUID.length);
                    self.portGetChunkCnt = 200;
                    if(cbparam.allUUID.length > 0) {
                        self.fetchPortChunk(cbparam.allUUID, cbparam.cbparam, callback);
                    } else {
                        callback();
                    }
                },
                function(error){
                },
                {allUUID : allUUID, cbparam : cbparam}
            );
        }
    },

    appendNewData: function(result){
        //$("#"+ctwl.PORT_GRID_ID).data("contrailGrid").showGridMessage("loading");
        var gridData = self.contrailListModel.getItems();
        var newData = [];
        $.extend(true, newData, gridData);
        var formatted_data = portFormatters.formatVMIGridData(result);
        var resultLen = result.length;
        for(var i = 0; i < resultLen; i++) {
            newData.push(formatted_data[i]);
        }
        self.contrailListModel.setData(newData)
    }

    });

    var getportListViewConfig = function (viewConfig) {
        return {
            elementId:
              cowu.formatElementId([ctwc.CONFIG_PORT_FORMAT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    ctwc.CONFIG_PORT_LIST_VIEW_ID,
                                title: ctwl.CONFIG_PORT_TITLE,
                                view: "portGridView",
                                viewPathPrefix : ctwc.URL_PORT_VIEW_PATH_PREFIX,
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentType: 'project',
                                    pagerOptions: {
                                      options: {
                                         pageSize: 50,
                                         pageSizeSelect: [10, 50, 100, 500]
                                         }
                                    },
                                    selectedProjectId : viewConfig.selectedProjectId
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return portListView;
});