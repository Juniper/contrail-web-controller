/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-view",
    "xml2json",
    "controller-basedir/setting/introspect/ui/js/introspect.utils"
], function (_, ContrailView, Xml2json, iUtils) {
    var IntrospectResultTabsView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                hostname = viewConfig.hostname,
                port = viewConfig.port,
                moduleRequest = viewConfig.module_request,
                params = viewConfig.params,
                url = iUtils.getProxyURL(hostname, port,
                                         {params: params, moduleRequest: moduleRequest});
            self.fetchIntrospect(url);
        },

        fetchIntrospect: function(url) {
            var self = this;

            contrail.ajaxHandler({
                url: url, cache: true, dataType: "xml"
            }, function() {
                self.$el.html('<p class="padding-10-0"><i class="fa fa-spin fa fa-spinner"></i> Loading Results.</p>');
            }, function (xml) {
                var x2js = new Xml2json(),
                    json = x2js.xml2json(xml),
                    data = { xml: xml, json: json };

                self.renderIntrospectTabs(data);
            }, function(error) {
                if (null != error) {
                    var viewConfig = getValueByJsonPath(self, "attributes;viewConfig", {});
                    var remoteHostname = viewConfig.hostname;
                    var remotePort = viewConfig.port;
                    var defaultErrorStr = "Request could not be established";
                    if ((null != remoteHostname) && (null != remotePort)) {
                        defaultErrorStr += " with " + remoteHostname + ":" + remotePort;
                    }
                    var errorText = (null != error.responseText) ? error.responseText :
                        defaultErrorStr;
                    self.$el.html('<div class="alert alert-error">' +
                        '<button type="button" class="close" data-dismiss="alert"></button> ' +
                        "<strong>Error: </strong> <span> " + errorText + " </span>" +
                        "</div>");
                }
            }, null);
        },

        renderIntrospectTabs: function(data) {
            var self = this,
                viewConfig = (self.attributes) ? self.attributes.viewConfig : {},
                node = viewConfig.node,
                hostname = viewConfig.hostname,
                port = viewConfig.port,
                modelMap = contrail.handleIfNull(self.modelMap, {});

            self.renderView4Config(self.$el, self.model, getIntrospectTabViewConfig(data, node, port), null, null, modelMap, function() {
                var json = data.json,
                    jsonKeys = _.keys(json),
                    moduleItemName =jsonKeys[0];

                var nextPageLink =
                    getValueByJsonPath(json, moduleItemName +
                                       ";Pagination;req;PageReqData;next_page", null);
                var nextBatchLink =
                    getValueByJsonPath(json, moduleItemName + ";next_batch", null);
                var link = null, text = null;
                if (!cowu.isNil(nextPageLink)) {
                    link = nextPageLink._link;
                    text = nextPageLink.__text;
                } else if (!cowu.isNil(nextBatchLink)) {
                    link = nextBatchLink.link;
                    text = nextBatchLink._text;
                }

                if (!(cowu.isNil(link)) && !(cowu.isNil(text))) {
                    $("#introspect-result-" + node + "-" + port + "-next-batch-tab-extra-link")
                        .parent("li").show()
                        .off("click")
                        .on("click", function() {
                            var url = iUtils.getProxyURL(hostname, port,
                                                         {moduleRequest: moduleRequest,
                                                          params: {x: text}});
                            self.fetchIntrospect(url);
                        });
                } else {
                    $("#introspect-result-" + node + "-" + port + "-next-batch-tab-extra-link")
                        .parent("li").hide();
                }
            });
        }
    });

    function getIntrospectTabViewConfig(data, node, port) {
        return {
            elementId: "introspect-result-" + node + "-" + port + "tabs",
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                active: 0,
                tabs: [
                    getIntrospectJSGridTabViewConfig(data, node, port),
                    getIntrospectXSLGridTabViewConfig(data, node, port),
                    getIntrospectJSONTabViewConfig(data, node, port)
                ],
                extra_links: [
                    {
                        elementId: "introspect-result-" + node + "-" + port + "-next-batch",
                        title: "Next Batch"
                    }
                ]
            }
        };
    }

    function getIntrospectJSGridTabViewConfig(data, node, port) {
        var json = data.json,
            gridId = "introspect-result-" + node + "-" + port + "-js-grid";

        return {
            elementId: gridId,
            title: "Grid",
            view: "IntrospectJSGridView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            tabConfig: {
                renderOnActivate: true,
                activate: function () {
                    _.each($("#" + gridId).find(".contrail-grid"), function (gridEl) {
                        if ($(gridEl).data("contrailGrid")) {
                            $(gridEl).data("contrailGrid").refreshView();
                        }
                    });
                }
            },
            viewConfig: {
                jsonData: json,
                node: node,
                port: port
            }
        };
    }

    function getIntrospectXSLGridTabViewConfig(data, node, port) {
        var xml = data.xml,
            gridId = "introspect-result-" + node + "-" + port + "-xsl-grid";

        return {
            elementId: gridId,
            title: "XSL Grid",
            view: "IntrospectXSLGridView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            tabConfig: {
                renderOnActivate: true
            },
            viewConfig: {
                xmlData: xml
            }
        };
    }

    function getIntrospectJSONTabViewConfig(data, node, port) {
        var json = data.json,
            jsonId = "introspect-result-" + node + "-" + port + "-json";

        return {
            elementId: jsonId,
            title: "JSON",
            view: "IntrospectJSONView",
            viewPathPrefix: "setting/introspect/ui/js/views/",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            tabConfig: {
                renderOnActivate: true
            },
            viewConfig: {
                jsonData: json
            }
        };
    }

    return IntrospectResultTabsView;
});
