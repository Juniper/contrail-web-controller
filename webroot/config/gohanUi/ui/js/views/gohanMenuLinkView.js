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
                    location : '../gohan.html#/v1.0/locations',
                    heatInstance : '../gohan.html#/v1.0/tenant/heat_instances',
                    image : '../gohan.html#/v1.0/tenant/images',
                    flavor : '../gohan.html#/v1.0/tenant/flavors',
                    //serviceTemplates : '../gohan.html#/v1.0/tenant/service_templates',
                    //serviceInstance : '../gohan.html#/v1.0/tenant/service_instances',
                    //securityGroup : '../gohan.html#/v1.0/tenant/security_groups',
                    //networkPolicy : '../gohan.html#/v1.0/tenant/network_policies',
                    network : '../gohan.html#/v1.0/tenant/networks',
                    server : '../gohan.html#/v1.0/servers',
                    idPool : '../gohan.html#/v1.0/admin/id_pools',
                    association : '../gohan.html#/v1.0/admin/route_target_associations'
                };
            var url = hashList[hashParams[hashParams.length - 1]];
            sessionStorage.setItem('gohan_contrail',true);
            sessionStorage.setItem('tenant',JSON.stringify(loadUtils.getCookie('project')));
            $('#alarms-popup-link').hide();
            $('#nav-search').hide();
            $('#main-content').hide();
            if($('.iframe-view').length != 0){
                $('.iframe-view').attr("src", url);
            }else{
                require(['iframe-view'], function(IframeView){
                    self.iframeView = new IframeView({
                        el:$("#main-content"),
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