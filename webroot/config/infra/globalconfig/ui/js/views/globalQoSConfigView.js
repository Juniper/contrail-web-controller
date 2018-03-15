/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(_, ContrailView) {
            var globalQoSConfigView = ContrailView.extend({
                el : $(contentContainer),
                render : function(viewConfig) {
                    var self = this;
                    self.renderView4Config(self.$el, null,
                            getGlobalQoSConfig(viewConfig));
                }
            });

            function getGlobalQoSConfig(viewConfig) {
                return {
                    elementId : cowu
                            .formatElementId([ 'global-qos-config-page' ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : 'global-qos-config-tab',
                                view : 'TabsView',
                                viewConfig : getGlobalQoSConfigTabs(viewConfig)
                            } ]
                        } ]
                    }
                };
            }
            ;

            function getGlobalQoSConfigTabs(viewConfig) {
                return {
                    theme : 'default',
                    active : 0,
                    tabs : [
                            {
                                elementId : 'qos_global_tab',
                                title : 'QoS Policies',
                                view : "qosGlobalListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#' + ctwc.QOS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'fc_global_tab',
                                title : 'Forwarding Classes',
                                view : "forwardingClassListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.FORWARDING_CLASS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'qos_control_traffic_global_tab',
                                title : 'Control Traffic',
                                view : "qosControlTrafficListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_CONTROL_TRAFFIC_GRID_ID);
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
            return globalQoSConfigView;
        });
