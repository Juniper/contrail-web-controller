/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var vnCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_CFG_VN_DETAILS) + '?tenant_id=' +
                            viewConfig.projectSelectedValueData.value,
                        type: "GET"
                    },
                    dataParser: ctwp.vnCfgDataParser
                },
                vlRemoteConfig:{
                    vlRemoteList: [ {
                        getAjaxConfig  : function () {
                            return {
                                url: ctwc.get(ctwc.URL_CFG_VN_DETAILS) +
                                         '?filters=is_shared==true',
                                type: "GET",
                                timeout: 300000
                            }
                        }, 
                        successCallback: function (response, contrailListModel) {
                            contrailListModel.addData(ctwp.vnCfgDataParser(response, true));
                            var ajaxConfig = {
                                url: '/api/tenants/config/get-config-details',
                                type: 'POST',
                                data: JSON.stringify({
                                        'data': [
                                        {type: 'floating-ip-pools',
                                        fields: ['project_back_refs']}]
                                        }),
                            }
                            contrail.ajaxHandler(ajaxConfig, null, function (response) {
                                                setFIPEnabledNets(response, contrailListModel);
                            });
                        }
                    },
                    {
                        getAjaxConfig  : function () {
                            return {
                                url: ctwc.get('/api/tenants/config/global-vrouter-config'),
                                type: "GET",
                                timeout: 300000
                            }
                        }, 
                        successCallback: function (response, contrailListModel) {
                            window.globalObj['global-vrouter-config'] = response;
                        }
                    }]
                } // vlRemoteCOnfig
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                     contrailListModel, getVNCfgListViewConfig());
        }
    });

    var setFIPEnabledNets = function (response, contrailListModel) {
        var nets = contrailListModel.getItems();

        if (response == null || response.length != 1) {
            return;
        }
        var poolProjByUUID = [],
            poolList = getValueByJsonPath(response, '0;floating-ip-pools', []);
        if (!poolList.length) {
            return;
        }

        $.each(poolList, function(idx, pool) {
            poolProjByUUID[pool['floating-ip-pool'].uuid] =
                    pool['floating-ip-pool'];
        });

        $.each(nets, function (netIdx, net) {
            var fipPools = getValueByJsonPath(net, 'floating_ip_pools', []);
            $.each(fipPools, function (poolIdx, fipPool) {
                var uuid = fipPool.uuid;
                var projs = getValueByJsonPath(poolProjByUUID[uuid],
                                    'project_back_refs', []);
                if (projs.length) {
                    nets[netIdx].floating_ip_pools[poolIdx]['projects'] =
                            projs;
                }
            });
        });
    };

    var getVNCfgListViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VN_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VN_LIST_ID,
                                title: ctwl.CFG_VN_TITLE,
                                view: "vnCfgGridView",
                                viewPathPrefix:
                                    "config/networking/networks/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }
                        ]
                    }
                ]
            }
        }
    };

    return vnCfgListView;
});
