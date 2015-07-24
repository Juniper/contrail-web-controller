var databaseNodesLoader = new DatabaseNodesLoader();

function DatabaseNodesLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathDatabaseView = rootDir + '/js/views/DatabaseNodeView.js',
            renderFn = paramObject['renderFn'];

            if (self.databaseNodeView == null) {
                requirejs([pathDatabaseView], function (DatabaseNodeListView) {
                    self.databaseNodeView = new DatabaseNodeListView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        if(hashParams.view == "details") {
            this.databaseNodeView.renderDatabaseNodeDetails({
                hashParams: hashParams});
        } else {
            this.databaseNodeView.renderDatabaseNode({hashParams: hashParams});
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams : hashObj});
    };

    this.destroy = function () {
    };
}
