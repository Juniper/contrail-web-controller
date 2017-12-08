/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var tagProjectPageLoader = new TagProjectPageLoader();

function TagProjectPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathProjectTagView = ctBaseDir + '/config/firewall/project/tag/ui/js/views/tagProjectView.js',
            renderFn = paramObject['function'],
            loadingStartedDefObj = paramObject['loadingStartedDefObj'];


        if (self.projectTagView == null) {
            requirejs([pathProjectTagView], function (ProjectTagView) {
                self.projectTagView = new ProjectTagView();
                self.renderView(renderFn, hashParams);
                if(contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            }, function (err) {
                console.info("Firewall Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderProjectTag':
                this.projectTagView[renderFn]({hashParams: hashParams});
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

