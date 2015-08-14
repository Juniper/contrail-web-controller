/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/quotas/ui/js/models/QuotasModel'
], function (_, ContrailView, ContrailListModel, QuotasModel) {
    var QuotasListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var projectObj = cobdcb.getSelectedValue('project');
            if (null != projectObj) {
                selectedProject = projectObj['value'];
            }

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_PROJECT_QUOTA_USED,
                                      selectedProject),
                        type: "GET"
                    },
                    dataParser: function(response) {
                        var quotasModel = new QuotasModel();
                        var gridElId = '#' + ctwl.QUOTAS_GRID_ID;
                        $(gridElId).data('configObj', response);
                        return quotasDataParser(response);
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(this.$el, contrailListModel,
                                   getQuotasViewConfig());
        }
    });

    var quotaList = [{key : "virtual_network", name : "Virtual Networks"},
        {key : "subnet", name :"Subnets"},
        {key : "virtual_machine_interface", name :"Ports"},
        {key : "floating_ip", name : "Floating IPs"},
        {key : "floating_ip_pool", name :"Floating IP Pools"},
        {key : "access_control_list", name : "Policies"},
        {key : "logical_router", name : "Routers"},
        {key : "network_ipam", name :"Network IPAMs"},
        {key : "service_instance", name :"Service Instances"},
        {key : "security_group", name :"Security Groups"},
        {key : "security_group_rule", name :"Security Group Rules"},
        {key : "loadbalancer_pool", name :"Loadbalancer Pools"},
        {key : "loadbalancer_member", name :"Loadbalancer Members"},
        {key : "loadbalancer_healthmonitor", name :"Loadbalancer Health Monitors"},
        {key : "virtual_ip", name :"Virtual IPs"}
    ];

    var quotasDataParser = function (response) {
        var results = [];
        var quotaListCnt = quotaList.length;
        for (var i = 0; i < quotaListCnt; i++) {
            var key = quotaList[i]['key'];
            results[i] = {};
            results[i]['name'] = quotaList[i]['name'];
            results[i]['used'] = response[1]['used'][key];
            if ('access_control_list' == key) {
                results[i]['used'] =
                    response[1]['used']['network_policy'];
            }
            results[i]['limit'] = response[0]['quota'][key];
        }
        return results;
    }

    var getQuotasViewConfig = function () {
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
                                viewPathPrefix: "config/quotas/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10, pageSizeSelect: [10, 50, 100]
                                        }
                                    }
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

