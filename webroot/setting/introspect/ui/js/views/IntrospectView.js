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
            var nodePortObjs = getValueByJsonPath(globalObj,
                                                  "webServerInfo;proxyPortList;control_node_ports;introspect",
                                                  ctwc.INTROSPECT_CONTROL_NODE_PORTS);
            this.renderView4Config(this.$el, null,
                                   getFeatureIntrospectViewConfig(viewConfig,
                                                                  nodePortObjs));
        },

        renderVirtualRouterIntrospect: function (viewConfig) {
            var nodePortObjs = getValueByJsonPath(globalObj,
                                                  "webServerInfo;proxyPortList;vrouter_node_ports;introspect",
                                                  ctwc.INTROSPECT_VIRTUAL_ROUTER_PORTS);
            this.renderView4Config(this.$el, null,
                                   getFeatureIntrospectViewConfig(viewConfig,
                                                                  nodePortObjs));
        },

        renderConfigNodeIntrospect: function (viewConfig) {
            var nodePortObjs = getValueByJsonPath(globalObj,
                                                  "webServerInfo;proxyPortList;config_node_ports;introspect",
                                                  ctwc.INTROSPECT_CONFIG_NODE_PORTS);
            this.renderView4Config(this.$el, null,
                                   getFeatureIntrospectViewConfig(viewConfig,
                                                                  nodePortObjs));
        },

        renderAnalyticsNodeIntrospect: function (viewConfig) {
            var nodePortObjs = getValueByJsonPath(globalObj,
                                                  "webServerInfo;proxyPortList;analytics_node_ports;introspect",
                                                  ctwc.INTROSPECT_ANALYTICS_NODE_PORTS);
            this.renderView4Config(this.$el, null,
                                   getFeatureIntrospectViewConfig(viewConfig,
                                                                  nodePortObjs));
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

    function getFeatureIntrospectViewConfig(config, nodePortObjs) {
        var hashParams = config.hashParams,
            introspectNode = hashParams.node,
            activeTab = 0;

        var nodeTypeList = _.keys(nodePortObjs);
        nodeTypeList = _.sortBy((nodeTypeList), function(nodeType) {
            return nodeType.toLowerCase();
        });

        return {
            elementId: "introspect-" + introspectNode+ "-tabs",
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_OVERCAST,
                tabs: getFeatureTabsConfig(nodePortObjs, nodeTypeList, introspectNode)
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

    function getFeatureTabsConfig(nodePortObjs, sortedNodeTypeList, introspectNode) {
        var tabs = [];

        var nodeTypeList = [];
        if (null == nodePortObjs) {
            return tabs;
        }
        var nodeTypesCnt = sortedNodeTypeList.length;
        for (var i = 0; i < nodeTypesCnt; i++) {
            var nodeType = sortedNodeTypeList[i];
            var port = nodePortObjs[nodeType];
            tabs.push(getIntrospectViewConfig(nodeType, port, introspectNode));
        }
        return tabs;
    }

    return IntrospectView;
});
