/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-confignode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model',
    'contrail-list-model'
], function(_,Backbone,AnalyticsNodeListModel,DatabaseNodeListModel,
    ConfigNodeListModel,ControlNodeListModel,VRouterListModel,
    ContrailListModel) {


    //Delete records from dataView that satisfy the given criteria
    function delRowsFromDataView(dataView,selFn) {
        if(typeof(selFn) != 'function')
            return;
        var items = dataView.getItems();
        for(var i=0;i<items.length;i++) {
            if(selFn(items[i]) == true) {
                dataView.deleteItem(items[i]['cgrid']);
            }
        }
    }

    var AlertListModel = function() {

        if(AlertListModel.prototype.singletonInstance) {
            return AlertListModel.prototype.singletonInstance;
        }

        var nodeListModels = [{
            model: new AnalyticsNodeListModel(),
            type: 'analyticsNode'
        },{
            model: new ConfigNodeListModel(),
            type: 'analyticsNode'
        },{
            model: new ControlNodeListModel(),
            type: 'controlNode'
        },{
            model: new DatabaseNodeListModel(),
            type: 'databaseNode'
        },{
            model: new VRouterListModel(),
            type: 'vRouter'
        }];

        var alertListModel =  new ContrailListModel({data:[]});
        $.each(nodeListModels,function(idx,obj) {
            var currModel = obj['model'];
            var currType = obj['type'];
            var alertList = [];
            currModel.onAllRequestsComplete.subscribe(function() {
                var items = currModel.getItems();
                var alerts = $.map(items,function(obj,idx) {
                    return obj['alerts'];
                });
                alerts = flattenList(alerts);
                alerts = _.filter(alerts,function(currAlertObj) {
                    return currAlertObj['detailAlert'] != false
                });

                //Remove all existing analytics node alerts
                delRowsFromDataView(alertListModel,function(obj) {
                        return obj['type'] == currType;
                    });
                alertListModel.addData(alerts);
                alertListModel.sort(dashboardUtils.sortInfraAlerts);
            });
        });
        AlertListModel.prototype.singletonInstance =
            alertListModel;
        return AlertListModel.prototype.singletonInstance;
    }
    return AlertListModel;
});
