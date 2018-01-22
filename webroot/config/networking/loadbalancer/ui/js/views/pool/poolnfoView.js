/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var self;
    var poolInfoView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig,
            currentHashParams = layoutHandler.getURLHashParams(),
            poolName = currentHashParams.focusedElement.pool,
            loadBalancerId = currentHashParams.focusedElement.uuid,
            lbName = currentHashParams.focusedElement.lbName,
            listenerRef = currentHashParams.focusedElement.listenerRef,
            poolRef = currentHashParams.focusedElement.poolRef,
            listenerName = currentHashParams.focusedElement.listenerName,
            listenerId = currentHashParams.focusedElement.listenerId,
            poolId = currentHashParams.focusedElement.poolId;
            viewConfig.lbId = currentHashParams.focusedElement.uuid;
            viewConfig.lbProvider = currentHashParams.focusedElement.lbProvider;
            self.pool = {};
            self.pool.list = [];
            if($('#breadcrumb').children().length === 4){
                $('#breadcrumb li').last().remove();
            }
            if($('#breadcrumb').children().length === 3){
                pushBreadcrumb([{label: lbName, href: listenerRef},{label: listenerName, href: poolRef},{label: poolName, href: ''}]);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId + '/listener/' + listenerId + '/pool/' + poolId,
                            type: "GET"
                        },
                        dataParser: self.parsePoolinfoData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getPoolInfoViewConfig(viewConfig, self.pool));
        },

        parsePoolinfoData : function(response) {
           var dataItems = [];
            self.pool.list = response[0];
            var mapList = $.extend(true,[],ctwc.POOL_INFO_OPTIONS_MAP);
            if(response[0].loadbalancer_pool_properties.persistence_cookie_name == undefined){
                for(var i = 0; i < mapList.length; i++){
                    if(mapList[i].name === 'Persistence Cookie Name'){
                        mapList.splice(i, 1);
                        break;
                    }
                }
            }
            _.each(mapList, function(poolOption){
                dataItems.push({ name: poolOption.name,
                    value: response[0][poolOption.key], key: poolOption.key});
            });
            return dataItems;
         }
    });

    var getPoolInfoViewConfig = function (viewConfig, pool) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_POOL_INFO_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_POOL_INFO_ID,
                                view: "poolInfoGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/pool/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    lbId: viewConfig.lbId,
                                    pool: pool,
                                    lbProvider: viewConfig.lbProvider
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return poolInfoView;
});

