/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(_, ContrailView) {
            var globalSystemConfigView = ContrailView.extend({
                el : $(contentContainer),
                render : function(viewConfig) {
                    var self = this;
                    self.renderView4Config(self.$el, null,
                            getGlobalSystemConfig(viewConfig));
                }
            });

            function getGlobalSystemConfig(viewConfig) {
                return {
                    elementId : cowu
                            .formatElementId([ 'global-system-config-page' ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : 'global-system-config-tab',
                                view : 'TabsView',
                                viewConfig : getGlobalSystemConfigTabs(viewConfig)
                            } ]
                        } ]
                    }
                };
            }
            ;

            function getGlobalSystemConfigTabs(viewConfig) {
                return {
                    theme : 'default',
                    active : 0,
                    tabs : [
                            {
                                elementId : 'bgp_options_tab',
                                title : 'BGP Options',
                                view : "bgpOptionsListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_BGP_OPTIONS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'user_defined_counter_tab',
                                title : 'Log Statistic',
                                view : "userDefinedCountersListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.USER_DEFINED_COUNTRERS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'mac_learning_tab',
                                title : 'MAC Learning',
                                view : "macLearningListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.MAC_LEARNING_GRID_ID);
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
            return globalSystemConfigView;
        });
