/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var self;
    var listenerInfoView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig,
            currentHashParams = layoutHandler.getURLHashParams(),
            listener = currentHashParams.focusedElement.listener,
            listenerId = currentHashParams.focusedElement.listenerId,
            loadBalancerId = currentHashParams.focusedElement.uuid;
            var lbName = currentHashParams.focusedElement.lbName;
            var listenerRef = currentHashParams.focusedElement.listenerRef;
            viewConfig.lbId = currentHashParams.focusedElement.uuid;
            viewConfig.lbProvider = currentHashParams.focusedElement.lbProvider;
            self.listener = {};
            self.listener.list = [];
            if($('#breadcrumb').children().length === 3){
                pushBreadcrumb([{label: lbName, href: listenerRef},{label: listener, href: ''}]);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId + '/listener/' + listenerId ,
                            type: "GET"
                        },
                        dataParser: self.parseListenerinfoData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getListenerInfoViewConfig(viewConfig, self.listener));
        },

        parseListenerinfoData : function(response) {
            var listener = response, dataItems = [];
            self.listener.list = listener;
            _.each(ctwc.LISTENER_INFO_OPTIONS_MAP, function(listenerOption){
                dataItems.push({ name: listenerOption.name,
                    value: listener[listenerOption.key], key: listenerOption.key});
            });
            return dataItems;
         }
    });

    var getListenerInfoViewConfig = function (viewConfig, listener) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LISTENER_INFO_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LISTENER_INFO_ID,
                                view: "listenerInfoGridView",
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
                                    listener: listener,
                                    lbProvider: viewConfig.lbProvider
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return listenerInfoView;
});

