var underlayPageLoader = new UnderlayPageLoader();

function UnderlayPageLoader() {
    this.underlayView = underlayPageLoader ? underlayPageLoader.underlayView : null;
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathUnderlayView = rootDir + '/js/views/UnderlayView.js',
            renderFn = paramObject['function'];

            requirejs([pathUnderlayView], function (UnderlayView){
                self.underlayView = new UnderlayView();
                self.renderView(renderFn, hashParams);
            });
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.underlayView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
    };


    this.destroy = function () {
        if(this.underlayView &&
            this.underlayView.childViewMap["underlay-topology-page"]) {
            if(this.underlayView.childViewMap["underlay-topology-page"]
                .childViewMap.underlayTabsView) {
                this.destroyView(this.underlayView
                    .childViewMap["underlay-topology-page"]
                    .childViewMap.underlayTabsView);
            }
            if(this.underlayView.childViewMap["underlay-topology-page"]
                .childViewMap["underlay-topology"]) {
                var underlayGraphView = this.underlayView
                    .childViewMap["underlay-topology-page"]
                    .childViewMap["underlay-topology"];
                ugModel = underlayGraphView.model;
                ugModel.nodesCollection.reset();
                ugModel.nodesCollection.invoke('destroy');
                ugModel.edgesCollection.reset();
                ugModel.edgesCollection.invoke('destroy');
                ugModel.selectedElement().model().stopListening();
                ugModel.selectedElement().model().unbind();
                ugModel.selectedElement().destroy();
                ugModel.flowPath().model().stopListening();
                ugModel.flowPath().model().unbind();
                ugModel.flowPath().destroy();
                ugModel.model().stopListening();
                ugModel.model().unbind();
                ugModel.destroy();
                this.destroyView(underlayGraphView);
            }
        }
    };

    this.destroyView = function(view) {
        view.stopListening();
        view.undelegateEvents();
        view.$el.removeData().unbind();
        view.remove();
        Backbone.View.prototype.remove.call(view);
    };
}
