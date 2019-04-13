/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash"
], function (_) {
    var introspectUtils = function() {
        var self = this;
        this.getProxyURL = function(nodeIP, port, args) {
            var isSSLEnabled = getValueByJsonPath(globalObj, "webServerInfo;isIntrospectSSLEnabled");
            var protocol = isSSLEnabled ? "https" : "http";
            var introspectURL = protocol + "://" + nodeIP + ":" + port;
            var proxyURLPrefix = "/proxy?proxyURL=";
            if (null == args) {
                if (true === loadIntrospectViaProxy) {
                    return proxyURLPrefix + introspectURL;
                }
                return introspectURL;
            }
            if (null != args.module) {
                introspectURL += "/" + args.module + ".xml";
                if (true === loadIntrospectViaProxy) {
                    return proxyURLPrefix + introspectURL;
                }
                return introspectURL;
            }
            if (null != args.moduleRequest) {
                introspectURL += "/Snh_" + args.moduleRequest;
            }
            if (null != args.params) {
                if (true === loadIntrospectViaProxy) {
                    introspectURL = "/proxy" + ($.isEmptyObject(args.params) ? "?" : ("?" + $.param(args.params) + "&")) +
                        "proxyURL=" + protocol + "://" + nodeIP + ":" + port;
                    if (null != args.moduleRequest) {
                        introspectURL += "/Snh_" + args.moduleRequest;
                    }
                } else {
                    introspectURL += "?" + $.param(args.params);
                }
            }
            return introspectURL;
        }
    };
    return new introspectUtils;
});
