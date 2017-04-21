/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var configGohanUiLoader = new ConfigGohanUiLoader();

function ConfigGohanUiLoader() {
    this.load = function(paramObject) {
        var self = this,
            currMenuObj = globalObj.currMenuObj,
            hashParams = currMenuObj.hash,
            pathMenuLinkView = ctBaseDir + '/config/gohanUi/common/ui/js/views/gohanMenuLinkView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];
        $('#alarms-popup-link').hide();
        if(self.gohanMenuLinkView == null) {
            require([pathMenuLinkView], function(GohanMenuLinkView){
                self.gohanMenuLinkView = new GohanMenuLinkView();
                self.renderView(renderFn, hashParams);
            });
        } else {
            self.renderView(renderFn, hashParams);
        }
    };
    this.renderView = function(renderFn, hashParams) {
        $(contentContainer).html("");
        this.gohanMenuLinkView.render({
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
    this.destroy = function() {
    	//var latestHash = layoutHandler.getURLHashObj().p;
    	//if(ctwc.GOHAN_HASH_LIST.indexOf(latestHash) === -1){
    		$('iframe').remove();
    		$("#main-content").show();
            $("#gohanGrid").hide();
            $("#page-content").show();
            $("#alarms-popup-link").show();
    	//}         
    };
}
