/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
var tagGlobalPageLoader = new TagGlobalPageLoader();

function TagGlobalPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathTagView = rootDir + '/js/views/tagGlobalListView.js',
            renderFn = paramObject['function'];
            if (self.tagGlobalView == null) {
                requirejs([pathTagView], function (TagGlobalView){
                    self.tagGlobalView = new TagGlobalView();
                    self.renderView(renderFn, hashParams);
                });
            } else {
                self.renderView(renderFn, hashParams);
            }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderTagView':
                this.tagGlobalView[renderFn]({hashParams: hashParams});
                break;
        }
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };
    this.destroy = function () {
        ctwu.destroyDOMResources(ctwc.SEC_POLICY_TAG_PREFIX_ID);
    };
}

