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

    var NodeListModel = function() {

        if(NodeListModel.prototype.singletonInstance) {
            return NodeListModel.prototype.singletonInstance;
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

        var nodeListModel =  new ContrailListModel({data:[]});

        function updateNodeListModel() {
            nodeListModel.setData([]);
            //Loop through listModels and concatenate the records
            $.each(nodeListModels,function(idx,obj) {
                var currModel = obj['model'];
                nodeListModel.addData(currModel.getItems());
            });
        }

        $.each(nodeListModels,function(idx,obj) {
            var currModel = obj['model'];
            var currType = obj['type'];
            var alertList = [];
            currModel.onDataUpdate.subscribe(function() {
                //When ever there is a change in any nodeModel (vRouter,
                //ControlNode,..), concatenate all the records and return
                updateNodeListModel();
            });
        });
        NodeListModel.prototype.singletonInstance =
            nodeListModel;
        return NodeListModel.prototype.singletonInstance;
    }
    return NodeListModel;
});
