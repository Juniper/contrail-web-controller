/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters'
], function (_, ContrailView, ContrailListModel, LbCfgFormatters) {
    var self;
    var lbCfgFormatter = new LbCfgFormatters();
    var lbCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            self.floatingIp = {};
            self.floatingIp.list = [];
            self.lb = {};
            self.lb.list = [];
            var currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancers-details?tenant_id=' + currentProject.value ,
                            type: "GET"
                        },
                        dataParser: self.parseLoadbalancersData,
                    }
                };
                var contrailListModel = new ContrailListModel(listModelConfig);
                self.renderView4Config(self.$el,
                        contrailListModel, getLbCfgListViewConfig(viewConfig, self.floatingIp, self.lb));
        },
        parseLoadbalancersData : function(response){
             var lbList = getValueByJsonPath(response, "loadbalancers", []),
             vmiList = [], fIpList = [], loadBalancerList = [];
             _.each(lbList, function(obj) {
                 var vmi = getValueByJsonPath(obj, "loadbalancer;virtual_machine_interface_refs", []);
                 var loadBalancer = getValueByJsonPath(obj, "loadbalancer", {});
                 loadBalancerList.push({id: loadBalancer.uuid, text: loadBalancer.display_name, fqName:loadBalancer.fq_name });
                 vmiList = vmiList.concat(vmi);
             });
             _.each(vmiList, function(obj) {
                 var floatingIp = getValueByJsonPath(obj, "floating-ip", {});
                 if(Object.keys(floatingIp).length > 0){
                     fIpList.push(floatingIp.uuid);
                 }
             });
             self.floatingIp.list = fIpList;
             self.lb.list = loadBalancerList;
             return lbList;
        }
    });
    var getLbCfgListViewConfig = function (viewConfig, floatingIp, lb) {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_LB_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_LB_LIST_ID,
                                title: ctwl.CFG_LB_TITLE,
                                view: "lbCfgGridView",
                                viewPathPrefix:
                                    "config/networking/loadbalancer/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    selectedProjId:
                                      viewConfig.projectSelectedValueData.value,
                                      floatingIp: floatingIp,
                                      lb: lb
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return lbCfgListView;
});
