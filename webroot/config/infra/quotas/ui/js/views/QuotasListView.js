/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/quotas/ui/js/models/QuotasModel'
], function (_, ContrailView, ContrailListModel, QuotasModel) {
    var configQuotas = null;
    var gridElId = '#' + ctwl.QUOTAS_GRID_ID;
    var QuotasListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var selectedProject = viewConfig['projectSelectedValueData'];

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_PROJECT_QUOTA_USED,
                                      selectedProject.value),
                        type: "GET"
                    },
                    dataParser: function(response) {
                        configQuotas = response;
                        return quotasDataParser(response);
                    },
                    completeCallback: function(resp) {
                        self.renderView4Config(self.$el, contrailListModel,
                                   getQuotasViewConfig(selectedProject),
                                   null, null, null, function() {
                            if ((null != resp) && (null != resp[0])) {
                                $(gridElId).data('configObj', configQuotas);
                            }
                        });
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var quotaList = [{key : "virtual_network", name : "Virtual Networks"},
        {key : "subnet", name :"Subnets"},
        {key : "virtual_machine_interface", name :"Ports"},
        {key : "floating_ip", name : "Floating IPs"},
        {key : "floating_ip_pool", name :"Floating IP Pools"},
        {key : "network_policy", name : "Policies"},
        {key : "logical_router", name : "Routers"},
        {key : "network_ipam", name :"Network IPAMs"},
        {key : "service_instance", name :"Service Instances"},
        {key : "security_group", name :"Security Groups"},
        {key : "security_group_rule", name :"Security Group Rules"},
        {key : "loadbalancer", name :"Loadbalancers"},
        {key : "loadbalancer_listener", name :"Loadbalancer Listeners"},
        {key : "loadbalancer_pool", name :"Loadbalancer Pools"},
        {key : "loadbalancer_member", name :"Loadbalancer Members"},
        {key : "loadbalancer_healthmonitor", name :"Loadbalancer Health Monitors"},
        {key : "virtual_ip", name :"Virtual IPs"}
    ];

    function getQuota (key, quota) {
        if (!(key in quota)) {
            if (null != quota['defaults']) {
                return quota['defaults'];
            }
        }
        return quota[key];
    }

    var quotasDataParser = function (response) {
        var results = [];
        var quotaListCnt = quotaList.length;
        for (var i = 0; i < quotaListCnt; i++) {
            var key = quotaList[i]['key'];
            results[i] = {};
            results[i]['name'] = quotaList[i]['name'];
            results[i]['used'] = response[1]['used'][key];
            results[i]['limit'] = getQuota(key, response[0]['quota']);
        }
        return results;
    }

    var getQuotasViewConfig = function (selectedProject) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_QUOTAS_ID,
                                title: ctwl.TITLE_QUOTAS,
                                view: "QuotasGridView",
                                viewPathPrefix: "config/infra/quotas/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    selectedProject: selectedProject
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return QuotasListView;
});

