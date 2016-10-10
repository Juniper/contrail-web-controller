/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view"
], function (_, ContrailView) {
    var IntrospectView = ContrailView.extend({
        el: $(window.contentContainer),

        renderControlNodeIntrospect: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFeatureIntrospectViewConfig(viewConfig, ctwc.INTROSPECT_CONTROL_NODE_PORTS));
        },

        renderVirtualRouterIntrospect: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFeatureIntrospectViewConfig(viewConfig, ctwc.INTROSPECT_VIRTUAL_ROUTER_PORTS));
        },

        renderConfigNodeIntrospect: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFeatureIntrospectViewConfig(viewConfig, ctwc.INTROSPECT_CONFIG_NODE_PORTS));
        },

        renderAnalyticsNodeIntrospect: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFeatureIntrospectViewConfig(viewConfig, ctwc.INTROSPECT_ANALYTICS_NODE_PORTS));
        }
    });

    function getFeatureIntrospectViewConfig(config, featurePorts) {
        var hashParams = config.hashParams,
            introspectNode = hashParams.node,
            activeTab = 0;

        if (contrail.checkIfExist(hashParams.port)) {
            activeTab = _.keys(featurePorts).indexOf(hashParams.port);
        }

        return {
            elementId: "introspect-" + introspectNode+ "-tabs",
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_OVERCAST,
                active: (activeTab !== -1) ? activeTab : 0,
                tabs: getFeatureTabsConfig(featurePorts, introspectNode)
            }
        };
    }

    function getFeatureTabsConfig(featurePorts, introspectNode) {
        var tabs = [];

        _.each(featurePorts, function(value, key) {
            tabs.push({
                elementId: "introspect-" + introspectNode + "-" + value,
                title: cowl.get(value),
                view: "IntrospectFormView",
                viewPathPrefix: "setting/introspect/ui/js/views/",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                tabConfig: {
                    renderOnActivate: true
                },
                viewConfig: {
                    port: key,
                    type: value,
                    widgetConfig: {
                        elementId: "introspect-" + value + "-widget",
                        view: "WidgetView",
                        viewConfig: {
                            header: {
                                title: cowl.get(value) + " " + ctwl.TITLE_INTROSPECT,
                                iconClass: "fa fa-search"
                            },
                            controls: {
                                top: {
                                    default: {
                                        collapseable: true
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });

        return tabs;
    }

    return IntrospectView;
});
