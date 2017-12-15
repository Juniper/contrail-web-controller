/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var monitorListView = ContrailView.extend({
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
                        contrailListModel, getMonitorGridViewConfig());
        },

        parseLoadbalancersData : function(response) {
           var monitorList = [];
           _.each(response, function(pool) {
               var monitor = getValueByJsonPath(pool, 'loadbalancer-healthmonitor', []);
               if(monitor.length > 0){
                   monitorList = monitorList.concat(monitor);
               }
           });
           return monitorList;
        }
    });

    var getMonitorGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_MONITOR_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_MONITOR_MEMBER_ID,
                                view: "monitorGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/monitor/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    }//,
                                    //isGlobal: false
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return monitorListView;
});

