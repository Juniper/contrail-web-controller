/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'legend-view',
        'monitor/infrastructure/globalcontroller/ui/js/models/globalControllerListModel','contrail-list-model'],
        function(_, ContrailView, LegendView, GlobalControllerListModel,ContrailListModel){
    var GlobalControllerViewConfig = function () {
        var self = this,
            regionList = globalObj['webServerInfo']['regionList'],
            index = regionList.indexOf('All Regions'),
            defaulConfig = {};
        if (index > -1) {
              regionList.splice(index, 1);
        }
        var barViewListModel = new ContrailListModel([]);
        defaulConfig['bar-view'] = function(){
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
                     "width": 4
                  }
              }
           }
    for (var i = 0; i < regionList.length; i++) {
        defaulConfig[regionList[i]] = function(cfg){
            var globalControllerListModel = new GlobalControllerListModel({region:cfg['id']});
                    globalControllerListModel.onAllRequestsComplete.subscribe(function(){
                        var items = globalControllerListModel.getItems()[0];
                        barViewListModel.addData([items]);
                     });
                    if(globalControllerListModel.loadedFromCache == true) {
                        var items = globalControllerListModel.getItems()[0];
                        barViewListModel.addData([items]);
                    }
                     return {
                             "modelCfg":{listModel:globalControllerListModel},
                            "viewCfg": {
                              "elementId" : ctwl.GLOBAL_CONTROLLER_REGION_SECTION_ID+i,
                              "view" : "globalControllerRegionView",
                              "viewPathPrefix":"monitor/infrastructure/globalcontroller/ui/js/views/",
                              "app":cowc.APP_CONTRAIL_CONTROLLER
                             },
                            "itemAttr": {
                               "height":2.4,
                               "width": 2.3
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
