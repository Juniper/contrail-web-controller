var analyticsNodesLoader = new AnalyticsNodesLoader();

function AnalyticsNodesLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathAnalyticsNodeView = rootDir + '/js/views/AnalyticsNodeView.js',
            renderFn = paramObject['function'];

        if (self.monitorInfraView == null) {
            requirejs([pathAnalyticsNodeView], function(AnalyticsNodeListView) {
                self.monitorInfraView = new AnalyticsNodeListView();
                self.renderView(renderFn, hashParams);
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };
    this.renderView = function(renderFn, hashParams) {
        $(contentContainer).html("");
        this.monitorInfraView[renderFn]({
            hashParams : hashParams
        });
    };

    this.updateViewByHash = function(hashObj, lastHashObj) {
        var renderFn;
        this.load({
            hashParams : hashObj,
            'function' : renderFn
        });
    };

    this.destroy = function() {

    };
}
