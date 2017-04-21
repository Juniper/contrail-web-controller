/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'],
    function(_, ContrailView) {
        var configData = [];
        var gohanMenuLinkView = ContrailView.extend({
        el: $(contentContainer),
        render: function(viewConfig) {
            var self = this;
            var hashParams = viewConfig.hashParams.split('_');
            var hashList = {
                    heatInstance : '../gohan.html#/v1.0/tenant/heat_instances'
                };
            var url = hashList[hashParams[hashParams.length - 1]];
            sessionStorage.setItem('gohan_contrail',true);
            sessionStorage.setItem('tenant',JSON.stringify(loadUtils.getCookie('project')));
            $('#alarms-popup-link').hide();
            $('#nav-search').hide();
            $('#main-content').hide();
            if($('#gohanGrid')[0] === undefined || $('#gohanGrid')[0] === null){
                var data = '<div id="gohanGrid"></div>';
                $('#main-content').append(data);
            }
            if($('.iframe-view').length != 0){
                $('.iframe-view').attr("src", url + '?dt=' + Date.now());
            }else{
                require(['iframe-view'], function(IframeView){
                    self.iframeView = new IframeView({
                        el:$("#gohanGrid"),
                        url:"./gohan.html"
                    });
                    self.iframeView.options.url = url;
                    self.iframeView.render();
                });
            }
         }
    });
    return gohanMenuLinkView;
});