/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view',
        'monitor/infrastructure/globalcontroller/ui/js/models/globalControllerListModel','contrail-list-model'],
        function(_, ContrailView, LegendView, GlobalControllerListModel,ContrailListModel){
    var GlobalControllerViewConfig = function () {
        var self = this,
            regionList = ctwu.getRegionList(),
            defaulConfig = {};
        var barViewListModel;
        defaulConfig['bar-view'] = function(){
            barViewListModel = new ContrailListModel([]);
            return {
                "modelCfg":{listModel:barViewListModel},
                "viewCfg": {
                    "elementId" : ctwl.GLOBAL_CONTROLLER_REGION_BAR_SECTION_ID,
                    "view" : "globalControllerBarView",
                    "viewPathPrefix":"monitor/infrastructure/globalcontroller/ui/js/views/",
                    "app":cowc.APP_CONTRAIL_CONTROLLER
                    },
                "itemAttr": {
                     "height":0.71,
                     "width": 8
                  }
              }
           }
    for (var i = 0; i < regionList.length; i++) {
        defaulConfig[regionList[i]] = function(cfg){
            var globalControllerListModel = new GlobalControllerListModel({region:cfg['id']});
                    if((globalControllerListModel.loadedFromCache == true) || (globalControllerListModel.isRequestInProgress() != true)) {
                        var items = globalControllerListModel.getItems()[0];
                        barViewListModel.addData([items]);
                    }
                    globalControllerListModel.onAllRequestsComplete.subscribe(function(){
                        var items = globalControllerListModel.getItems()[0];
                        if(items != null){
                            barViewListModel.addData([items]);
                        }
                     });
                     return {
                             "modelCfg":{listModel:globalControllerListModel},
                            "viewCfg": {
                              "elementId" : ctwl.GLOBAL_CONTROLLER_REGION_SECTION_ID+cfg['id'],
                              "view" : "globalControllerRegionView",
                              "viewPathPrefix":"monitor/infrastructure/globalcontroller/ui/js/views/",
                              "app":cowc.APP_CONTRAIL_CONTROLLER
                             },
                            "itemAttr": {
                               "height":2.4,
                               "width": 4.3
                           }
                       }
                    }
     }
     self.viewConfig = defaulConfig;
     self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new GlobalControllerViewConfig()).viewConfig;
});
