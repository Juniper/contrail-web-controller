/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var gohanCommanServiceLoader = new gohanCommanServiceLoader();

function gohanCommanServiceLoader() {
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = currMenuObj.hash, pathView = undefined;
            var renderFn = paramObject['function'];
        $("#page-content").hide();
        $("#nav-search").hide();
        $('#main-content').show();
        if($('#gohanGrid')[0] === undefined || $('#gohanGrid')[0] === null){
            var data = '<div id="gohanGrid"></div>';
            $('#main-content').append(data);
        }
        $("#gohanGrid").show();
        $("#gohanGrid").css({"padding":"2px 10px 5px"});
        $('#alarms-popup-link').hide();
        $('#gohan-config-role').show();
        var hashList = hashParams.split('_');
        var hash = hashList[hashList.length - 1];
        if(hash === 'serviceTemplates'){
            pathView = ctBaseDir + 'config/gohanUi/ui/js/views/templates/svcTemplateCfgView.js';
        }else if(hash === 'serviceInstance'){
            pathView = ctBaseDir + 'config/gohanUi/ui/js/views/instances/svcInstView.js';
        }else if(hash === 'securityGroup'){
            pathView = ctBaseDir + 'config/gohanUi/ui/js/views/securitygroup/SecGrpView.js';
        }else if(hash === 'networkPolicy'){
            pathView = ctBaseDir + 'config/gohanUi/ui/js/views/networkpolicy/policyView.js';
        }else if(hash === 'network'){
        	pathView = ctBaseDir + 'config/gohanUi/ui/js/views/networks/vnCfgView.js';
        }
        if (self.gohanCommonService == null) {
            requirejs([pathView], function (gohanCommonService) {
                 self.gohanCommonService = new gohanCommonService();
                 self.renderView(renderFn, hashParams);
             });
        } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.gohanCommonService[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_SVC_TEMPLATE_PREFIX_ID);
    };
}
