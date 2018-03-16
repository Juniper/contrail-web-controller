/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([ 'underscore', 'contrail-view' ], function(_, ContrailView) {
    var globalConfigView = ContrailView
            .extend({
                el : $(contentContainer),
                renderGlobalConfig : function(viewConfig) {
                    var self = this;
                    self.renderView4Config(self.$el, null,
                            getGlobalConfig(viewConfig));
                }
            });

    function getGlobalConfig(viewConfig) {
        return {
            elementId : cowu
                    .formatElementId([ ctwl.CONFIG_GLOBAL_CONFIG_PAGE_ID ]),
            view : "SectionView",
            viewConfig : {
                rows : [ {
                    columns : [ {
                        elementId : ctwc.GLOBAL_CONFIG_TAB_ID,
                        view : 'TabsView',
                        viewConfig : getGlobalConfigTabs(viewConfig)
                    } ]
                } ]
            }
        };
    }
    ;

    function getGlobalConfigTabs(viewConfig) {
        return {
            theme : 'default',
            active : 0,
            tabs : [ {
                elementId : 'global_vrouter_configs',
                title : 'Virtual Routers',
                view : "globalvRouterConfigView",
                app : cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                viewConfig : viewConfig,
                tabConfig : {
                    renderOnActivate : true
                }
            }, {
                elementId : 'global_system_configs',
                title : 'System',
                view : "globalSystemConfigView",
                app : cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                viewConfig : viewConfig,
                tabConfig : {
                    renderOnActivate : true
                }
            }, {
                elementId : 'global_qos_configs',
                title : 'Quality of Service',
                view : "globalQoSConfigView",
                app : cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                viewConfig : viewConfig,
                tabConfig : {
                    renderOnActivate : true
                }
            }, {
                elementId : 'global_security_configs',
                title : 'Security',
                view : "globalSecurityConfigView",
                app : cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                viewConfig : viewConfig,
                tabConfig : {
                    renderOnActivate : true
                }
            }, {
                elementId : 'alarm_rule_global_tab',
                title : 'Alarms',
                view : "ConfigAlarmGlobalListView",
                app : cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                viewConfig : viewConfig,
                tabConfig : {
                    activate : function(event, ui) {
                        var gridId = $('#' + ctwc.ALARM_RULE_GRID_ID);
                        if (gridId.data('contrailGrid')) {
                            gridId.data('contrailGrid').refreshView();
                        }
                    },
                    renderOnActivate : true
                }
            } ]
        };
    }
    ;
    return globalConfigView;
});
