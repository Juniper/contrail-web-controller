/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var self;
    var listenerListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
                self = this;
                var viewConfig = this.attributes.viewConfig,
                currentHashParams = layoutHandler.getURLHashParams(),
                loadBalancer = currentHashParams.focusedElement.loadBalancer,
                loadBalancerId = currentHashParams.focusedElement.uuid;
                viewConfig.lbFqName = currentHashParams.focusedElement.lbFqName.reverse();
                viewConfig.lbName = loadBalancer;
                viewConfig.listenerRef = window.location.href;
                viewConfig.lbProvider = currentHashParams.focusedElement.lbProvider;
                self.port = {};
                self.port.list = [];
            var breadcrumbCount = $('#breadcrumb').children().length;
            if(breadcrumbCount === 3){
                pushBreadcrumb([loadBalancer]);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId + '/listeners' ,
                            type: "GET"
                        },
                        dataParser: self.parseLoadbalancersData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getListenerGridViewConfig(viewConfig, self.port));
        },

        parseLoadbalancersData : function(response) {
            var portList = [];
            _.each(response, function(obj) {
                var port = getValueByJsonPath(obj,
                        "loadbalancer_listener_properties;protocol_port", '');
                if(port != ''){
                    portList.push(port);
                }
            });
            self.port.list = portList;
           return response;
        }
    });

    var getListenerGridViewConfig = function (viewConfig, port) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_LISTENER_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_LISTENER_ID,
                                view: "listenerGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/listener/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    lbId: viewConfig.lbId,
                                    lbName: viewConfig.lbName,
                                    lbFqName: viewConfig.lbFqName,
                                    listenerRef: viewConfig.listenerRef,
                                    projectId: viewConfig.projectId,
                                    port: port,
                                    lbProvider: viewConfig.lbProvider//,
                                    //isGlobal: false
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return listenerListView;
});

