var configNodesLoader = new ConfigNodesLoader();

function ConfigNodesLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathConfigNodeView = rootDir + '/js/views/ConfigNodeView.js',
            renderFn = paramObject['renderFn'];

        if (self.configNodeView == null) {
            requirejs([pathConfigNodeView], function (ConfigNodeView) {
                self.configNodeView = new ConfigNodeView();
                self.renderView(renderFn, hashParams);
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        if(hashParams.view == "details") {
            this.configNodeView.renderConfigNodeDetails({hashParams: hashParams});
        } else {
            this.configNodeView.renderConfigNode({hashParams: hashParams});
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams : hashObj});
    };

    this.destroy = function () {
    };
}
