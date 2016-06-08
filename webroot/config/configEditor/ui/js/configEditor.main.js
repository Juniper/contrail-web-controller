/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var configEditorLoader = new ConfigEditorLoader();

function ConfigEditorLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            pathEditorView = ctBaseDir + '/config/configEditor/ui/js/views/ConfigEditorView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];

        if(self.configEditorView == null) {
            require([pathEditorView], function(ConfigEditorView){
                self.configEditorView = new ConfigEditorView();
                self.renderView(renderFn, hashParams);
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };
    this.renderView = function(renderFn, hashParams) {
        $(contentContainer).html("");
        this.configEditorView.render({
                hashParams: hashParams
            });
    };
    this.updateViewByHash = function(hashObj, lastHashObj) {
        var renderFn;
        this.load({
            hashParams: hashObj,
            'function': renderFn
        });
    };  
}
