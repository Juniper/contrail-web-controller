/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(_, ContrailView) {
            var globalvRouterConfigView = ContrailView.extend({
                el : $(contentContainer),
                render : function(viewConfig) {
                    var self = this;
                    self.renderView4Config(self.$el, null,
                            getGlobalvRouterConfig(viewConfig));
                }
            });

            function getGlobalvRouterConfig(viewConfig) {
                return {
                    elementId : cowu
                            .formatElementId([ 'global-vrouters-config-page' ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : 'global-vrouters-config-tab',
                                view : 'TabsView',
                                viewConfig : getGlobalvRouterConfigTabs(viewConfig)
                            } ]
                        } ]
                    }
                };
            }
            ;

            function getGlobalvRouterConfigTabs(viewConfig) {
                return {
                    theme : 'classic',
                    active : 0,
                    tabs : [
                            {
                                elementId : 'forwarding_options_tab',
                                title : 'Forwarding Options',
                                view : "forwardingOptionsListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_FORWARDING_OPTIONS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    }
                                }
                            },
                            {
                                elementId : 'flow_aging_tab',
                                title : 'Flow Aging',
                                view : "flowAgingListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_FLOW_OPTIONS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            } ]
                };
            }
            ;
            return globalvRouterConfigView;
        });
