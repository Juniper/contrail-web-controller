/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var poolListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentHashParams = layoutHandler.getURLHashParams(),
                listener = currentHashParams.focusedElement.listener,
                listenerId = currentHashParams.focusedElement.listenerId,
                loadBalancerId = currentHashParams.focusedElement.uuid;
                var lbName = currentHashParams.focusedElement.lbName;
                var listenerRef = currentHashParams.focusedElement.listenerRef;
                viewConfig.poolRef = window.location.href;
                viewConfig.listenerRef = listenerRef;
                viewConfig.listener = listener;
                viewConfig.lbId = currentHashParams.focusedElement.uuid;
                viewConfig.lbName = currentHashParams.focusedElement.lbName;
                viewConfig.listenerId = currentHashParams.focusedElement.listenerId;
                viewConfig.projectId = currentHashParams.focusedElement.projectId;
                viewConfig.lbProvider = currentHashParams.focusedElement.lbProvider;
            var breadcrumbCount = $('#breadcrumb').children().length;
            if(breadcrumbCount === 3){
                pushBreadcrumb([{label: lbName, href: listenerRef},{label: listener, href: ''}]);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId + '/listener/' + listenerId + '/pools' ,
                            type: "GET"
                        },
                        dataParser: self.parseLoadbalancersData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getPoolGridViewConfig(viewConfig));
        },

        parseLoadbalancersData : function(response) {
           /*var listenerList = getValueByJsonPath(response,
                        "loadbalancer;loadbalancer-listener", [], false),
               poolList = [];
           _.each(listenerList, function(listner) {
               var pool = getValueByJsonPath(listner, 'loadbalancer-pool', []);
               if(pool.length > 0){
                 poolList = poolList.concat(pool);
               }
           });*/
           return response;
        }
    });

    var getPoolGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_POOL_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_POOL_ID,
                                view: "poolGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/pool/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    listenerRef: viewConfig.listenerRef,
                                    poolRef: viewConfig.poolRef,
                                    listener: viewConfig.listener,
                                    lbId: viewConfig.lbId,
                                    lbName: viewConfig.lbName,
                                    listenerId: viewConfig.listenerId,
                                    projectId: viewConfig.projectId,
                                    lbProvider: viewConfig.lbProvider
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return poolListView;
});

