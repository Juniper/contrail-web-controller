var underlayPageLoader = new UnderlayPageLoader();

function UnderlayPageLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathUnderlayView = rootDir + '/js/views/UnderlayView.js',
            renderFn = paramObject['function'];

            if (self.underlayView == null) {
                requirejs([pathUnderlayView], function (UnderlayView){
                    self.underlayView = new UnderlayView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
    };
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.underlayView[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        //this.load({hashParams: hashObj});
    };

    this.destroy = function () {
    };
}
