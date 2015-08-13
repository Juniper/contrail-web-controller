define([
    'underscore',
    'backbone',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-confignode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model'
], function(_,Backbone,AnalyticsNodeListModel,DatabaseNodeListModel,ConfigNodeListModel,
    ControlNodeListModel,VRouterListModel) {

    //Delete records from dataView that satisfy the given criteria
    function delRowsFromDataView(dataView,selFn) {
        if(typeof(selFn) != 'function)
            return;
        var items = dataView.getItems();
        for(var i=0;i<items.length;i++) {
            if(selFn(items[i]) == true) {
                dataView.deleteItem(items[i]['cgrid']);
            }
        }
    }

    var AlertListModel = function() {
        if (AlertListModel.prototype.singletonInstance) {
            return AlertListModel.prototype.singletonInstance;
        }

        var nodeListModels = [{
            model:AnalyticsNodeListModel,
            type: 'analyticsNode'
        },{
            model:ConfigNodeListModel,
            type: 'analyticsNode'
        }{
            model: ControlNodeListModel
            type: 'controlNode'
        }{
            model: DatabaseNodeListModel
            type: 'databaseNode'
        }{
            model: VRouterListModel
            type: 'vRouter'
        }];

        $.each(nodeListModels,function(idx,obj) {
            var currModel = obj['model'];
            var currType = obj['type'];
            currModel.onAllRequestsComplete.subscribe(function() {
                var items = currModel.getItems();
                var alerts = $.map(items,function(idx,obj) {
                    return obj['alerts'];
                });
                alerts = flattenList(alerts);
                //Remove all existing analytics node alerts
                delRowsFromDataView(AlertListModel,function(obj) {
                        return obj['type'] == currType;
                    });
                AlertListModel.addData(alerts);
            });
        });
    }
    return AlertListModel;
});
