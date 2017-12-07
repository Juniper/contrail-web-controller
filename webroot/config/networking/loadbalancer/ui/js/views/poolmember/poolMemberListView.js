/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var poolMemberListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentHashParams = layoutHandler.getURLHashParams(),
                poolName = currentHashParams.focusedElement.pool,
                loadBalancerId = currentHashParams.focusedElement.uuid,
                lbName = currentHashParams.focusedElement.lbName,
                listenerRef = currentHashParams.focusedElement.listenerRef,
                poolRef = currentHashParams.focusedElement.poolRef,
                listenerName = currentHashParams.focusedElement.listenerName,
                listenerId = currentHashParams.focusedElement.listenerId,
                poolId = currentHashParams.focusedElement.poolId;
                viewConfig.projectId = currentHashParams.focusedElement.projectId;
                viewConfig.poolId = poolId;
            if($('#breadcrumb').children().length === 4){
                $('#breadcrumb li').last().remove();
            }
            if($('#breadcrumb').children().length === 3){
                pushBreadcrumb([{label: lbName, href: listenerRef},{label: listenerName, href: poolRef},{label: poolName, href: ''}]);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId + '/listener/' + listenerId + '/pool/' + poolId ,
                            type: "GET"
                        },
                        dataParser: self.parseLoadbalancersData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getPoolMemberGridViewConfig(viewConfig));
        },

        parseLoadbalancersData : function(response) {
           var poolMemberList = [];
           _.each(response, function(pool) {
               var poolMember = getValueByJsonPath(pool, 'loadbalancer-members', []);
               if(poolMember.length > 0){
                   poolMemberList = poolMemberList.concat(poolMember);
               }
           });
           return poolMemberList;
        }
    });

    var getPoolMemberGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_POOL_MEMBER_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_POOL_MEMBER_ID,
                                view: "poolMemberGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/poolmember/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    projectId: viewConfig.projectId,
                                    poolId: viewConfig.poolId//,
                                    //isGlobal: false
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return poolMemberListView;
});

