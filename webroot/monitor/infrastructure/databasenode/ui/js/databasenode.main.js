var databaseNodesLoader = new DatabaseNodesLoader();

function DatabaseNodesLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathDatabaseView = rootDir + '/js/views/DatabaseNodeView.js',
            renderFn = paramObject['function'];

            if (self.monitorInfraView == null) {
                requirejs([pathDatabaseView], function (DatabaseNodeListView) {
                    self.monitorInfraView = new DatabaseNodeListView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.monitorInfraView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
    };
}
