/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var globalControllerBarView = ContrailView.extend({
        render: function (viewConfig) {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                selector = $(contentContainer),
                globalControllerBarViewTemplate = contrail.getTemplate4Id("barView-template");
                var regionList = globalObj['webServerInfo']['regionList'];
                var index = regionList.indexOf('All Regions');
                var defaulConfig = {};
                if (index > -1) {
                      regionList.splice(index, 1);
                }
                var regionListLen = regionList.length;
                var totalNodesCnt =0;
                if (self.model.loadedFromCache == true){
                    getAggregateBarInfo(self);
                }
                self.model.onDataUpdate.subscribe(function(){
                    getAggregateBarInfo(self);
                });
                function getAggregateBarInfo(self){
                    //parse the data to get the aggregate and render the view
                     var items = self.model.getItems();
                     var alarmsCnt = 0,servivceInstanceCnt = 0,interfacesCnt = 0,floatIps = 0,
                         analyticsNodesCnt = 0, configNodesCnt = 0;controlNodesCnt=0,
                         databaseNodesCnt = 0, vRoutersCnt = 0, vnCnt = 0, zeroAlarmsFlag = 0,
                         vRoutersNodesDownCnt = 0, configNodesDownCnt = 0, controlNodesDownCnt = 0,
                         analyticsNodesDownCnt = 0, databaseNodesDownCnt = 0,totalNodesDownCnt = 0,aggregateVns = [];
                     for(i=0;i<items.length;i++){
                       var vnsItems = items[i].data.vns;
                           for(j=0;j<vnsItems.length;j++){
                               aggregateVns.push(vnsItems[j]);
                            }
                       var filterAggVns = [];
                       filterAggVns = _.uniq(aggregateVns, 'name');
                       alarmsCnt += items[i].data.alarmsCnt;
                       servivceInstanceCnt += items[i].data.svcInstsCnt;
                       interfacesCnt += items[i].data.vmiCnt;
                       floatIps += items[i].data.fipsCnt;
                       analyticsNodesCnt += items[i].data.analyticsNodesCnt;
                       configNodesCnt += items[i].data.configNodesCnt;
                       controlNodesCnt += items[i].data.controlNodesCnt;
                       databaseNodesCnt += items[i].data.databaseNodesCnt;
                       vRoutersCnt += items[i].data.vRoutersCnt;
                       if(isNaN(items[i].data.vRoutersNodesDownCnt) === false){
                           vRoutersNodesDownCnt += items[i].data.vRoutersNodesDownCnt;
                       }
                       if(isNaN(items[i].data.controlNodesDownCnt) === false){
                           controlNodesDownCnt += items[i].data.controlNodesDownCnt;
                       }
                       if(isNaN(items[i].data.analyticsNodesDownCnt) === false){
                           analyticsNodesDownCnt += items[i].data.analyticsNodesDownCnt;
                       }
                       if(isNaN(items[i].data.configNodesDownCnt) === false){
                           configNodesDownCnt += items[i].data.configNodesDownCnt;
                       }
                       if(isNaN(items[i].data.databaseNodesDownCnt) === false){
                           databaseNodesDownCnt += items[i].data.databaseNodesDownCnt;
                       }
                       vnCnt += items[i].data.vnCnt;
                       totalNodesCnt = analyticsNodesCnt +
                                       configNodesCnt + controlNodesCnt +
                                       databaseNodesCnt + vRoutersCnt;
                       totalNodesDownCnt = vRoutersNodesDownCnt + configNodesDownCnt + controlNodesDownCnt +
                                           analyticsNodesDownCnt + databaseNodesDownCnt;
                      }
                     vnCnt = filterAggVns.length;
                     if(alarmsCnt > 0) {
                        $("#alert_info").addClass("alarms-container-bgcolor-on").removeClass("alarms-container-bgcolor-off");
                        $('#pageHeader').find('#alert_info').text(alarmsCnt);
                     }
                     else{
                         $("#alert_info").addClass("alarms-container-bgcolor-off").removeClass("alarms-container-bgcolor-on");
                     }
                     self.$el.html(globalControllerBarViewTemplate({zeroAlarmsFlag:zeroAlarmsFlag, alarmCnt:alarmsCnt,regionListLen:regionListLen,
                         interfacesCnt:interfacesCnt,servivceInstanceCnt:servivceInstanceCnt,floatIps:floatIps, vnCnt:vnCnt,totalNodesCnt:totalNodesCnt,
                         totalNodesDownCnt: totalNodesDownCnt}));
                }
        }
    });
    return globalControllerBarView;
});