var analyticsNodesLoader = new AnalyticsNodesLoader();

function AnalyticsNodesLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathAnalyticsNodeView = rootDir + '/js/views/AnalyticsNodeView.js',
            renderFn = paramObject['renderFn'];

        if (self.analyticsNodeView == null) {
            requirejs([pathAnalyticsNodeView], function(AnalyticsNodeView) {
                self.analyticsNodeView = new AnalyticsNodeView();
                self.renderView(renderFn, hashParams);
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };
    this.renderView = function(renderFn, hashParams) {
        $(contentContainer).html("");
        if(hashParams.view == "details") {
            this.analyticsNodeView.renderAnalyticsNodeDetails({
                    hashParams: hashParams});
        } else {
            this.analyticsNodeView.renderAnalyticsNode({
                    hashParams: hashParams});
        }
    };

    this.updateViewByHash = function(hashObj, lastHashObj) {
        this.load({hashParams : hashObj});
    };

    this.destroy = function() {

    };
}
