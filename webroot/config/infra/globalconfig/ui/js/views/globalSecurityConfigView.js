/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view' ],
        function(_, ContrailView) {
            var globalSecurityConfigView = ContrailView.extend({
                el : $(contentContainer),
                render : function(viewConfig) {
                    var self = this;
                    self.renderView4Config(self.$el, null,
                            getGlobalSecurityConfig(viewConfig));
                }
            });

            function getGlobalSecurityConfig(viewConfig) {
                return {
                    elementId : cowu
                            .formatElementId([ 'global-security-config-page' ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : 'global-security-config-tab',
                                view : 'TabsView',
                                viewConfig : getGlobalSecurityConfigTabs(viewConfig)
                            } ]
                        } ]
                    }
                };
            }
            ;

            function getGlobalSecurityConfigTabs(viewConfig) {
                return {
                    theme : 'default',
                    active : 0,
                    tabs : [{
                                elementId : 'slo_tab',
                                title : 'Logging',
                                view : "sloGlobalListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#' + ctwc.SLO_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'sec_policy_options_tab',
                                title : 'Security Policy',
                                view : "securityPolicyOptionsListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_POLICY_MGMT_OPTIONS_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            },
                            {
                                elementId : 'vrouter_encryption_global_tab',
                                title : 'Encryption',
                                view : "vRouterEncryptionListView",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                viewConfig : viewConfig,
                                tabConfig : {
                                    activate : function(event, ui) {
                                        var gridId = $('#'
                                                + ctwc.GLOBAL_VROUTER_ENCRYPTION_GRID_ID);
                                        if (gridId.data('contrailGrid')) {
                                            gridId.data('contrailGrid')
                                                    .refreshView();
                                        }
                                    },
                                    renderOnActivate : true
                                }
                            }]
                };
            }
            ;
            return globalSecurityConfigView;
        });
