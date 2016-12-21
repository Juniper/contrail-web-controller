/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view",
    "xml2json",
    "controller-basedir/setting/introspect/ui/js/views/IntrospectResultTabsView"
], function (_, ContrailView, Xml2json, IntrospectResultTabsView) {
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
        },
        renderIntrospectXML: function (viewConfig) {
            this.attributes = {viewConfig: viewConfig};
            var tabsView = new IntrospectResultTabsView();
            var x2js = new Xml2json();
            var json = x2js.xml_str2json(contrailIntrospectSandeshXML);
            var oParser = new DOMParser();
            var xml = oParser.parseFromString(contrailIntrospectSandeshXML, "text/xml");
            tabsView.renderIntrospectTabs({xml: xml, json: json});
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

    function getIntrospectViewConfig (nodeType, port, introspectNode) {
        var introViewConfig = {
            elementId: "introspect-" + introspectNode + "-" + nodeType,
            title: cowl.get(nodeType),
            view: "IntrospectFormView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
                tabConfig: {
                renderOnActivate: true
            },
            viewConfig: {
                port: port,
                type: nodeType,
                widgetConfig: {
                    elementId: "introspect-" + nodeType + "-widget",
                    view: "WidgetView",
                    viewConfig: {
                        header: {
                            title: cowl.get(nodeType) + " " + ctwl.TITLE_INTROSPECT,
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
        };
        return introViewConfig;
    }

    function getFeatureTabsConfig(featurePorts, introspectNode) {
        var tabs = [];

        _.each(featurePorts, function(key, value) {
            tabs.push(getIntrospectViewConfig(key, value, introspectNode));
        });
        return tabs;
    }

    return IntrospectView;
});
