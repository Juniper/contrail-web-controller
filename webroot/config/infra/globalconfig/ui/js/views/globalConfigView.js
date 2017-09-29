/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var globalConfigView = ContrailView.extend({
        el: $(contentContainer),
        renderGlobalConfig: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null, getGlobalConfig(viewConfig));
        }
    });

    function getGlobalConfig(viewConfig){
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_GLOBAL_CONFIG_PAGE_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.GLOBAL_CONFIG_TAB_ID,
                        view: 'TabsView',
                        viewConfig: getGlobalConfigTabs(viewConfig)
                    }]
                }]
            }
        };
    };

    function getGlobalConfigTabs(viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [{
               elementId: 'forwarding_options_tab',
               title: 'Forwarding Options',
               view: "forwardingOptionsListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.GLOBAL_FORWARDING_OPTIONS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   }
               }
           },{
               elementId: 'bgp_options_tab',
               title: 'BGP Options',
               view: "bgpOptionsListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.GLOBAL_BGP_OPTIONS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'flow_aging_tab',
               title: 'Flow Aging',
               view: "flowAgingListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.GLOBAL_FLOW_OPTIONS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'fc_global_tab',
               title: 'Forwarding Classes',
               view: "forwardingClassListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.FORWARDING_CLASS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'qos_global_tab',
               title: 'QoS',
               view: "qosGlobalListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.QOS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'qos_control_traffic_global_tab',
               title: 'Control Traffic',
               view: "qosControlTrafficListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.GLOBAL_CONTROL_TRAFFIC_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },{
               elementId: 'alarm_rule_global_tab',
               title: 'Alarm Rules',
               view: "ConfigAlarmGlobalListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.ALARM_RULE_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },
           {
               elementId: 'user_defined_counter_tab',
               title: 'Log Statistic',
               view: "userDefinedCountersListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.USER_DEFINED_COUNTRERS_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },
           {
               elementId: 'mac_learning_tab',
               title: 'MAC Learning',
               view: "macLearningListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.MAC_LEARNING_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           },
           {
               elementId: 'slo_tab',
               title: 'Security Logging Object',
               view: "sloGlobalListView",
               viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
               viewConfig: viewConfig,
               tabConfig: {
                   activate: function(event, ui) {
                       var gridId = $('#' + ctwc.SLO_GRID_ID);
                       if (gridId.data('contrailGrid')) {
                           gridId.data('contrailGrid').refreshView();
                       }
                   },
                   renderOnActivate: true
               }
           }]
        };
    };
    return globalConfigView;
});
