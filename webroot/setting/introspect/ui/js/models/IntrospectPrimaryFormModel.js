/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "knockout",
    "contrail-model",
    "xml2json",
    "controller-basedir/setting/introspect/ui/js/introspect.utils"
], function (_, Knockout, ContrailModel, Xml2json, iUtils) {
    var IntrospectPrimaryFormModel = ContrailModel.extend({

        constructor: function (modelData, IntrospectFormView) {
            var self = this;
            var defaultConfig = {
                node: null,
                ip_address: null,
                port: null,
                module: null,
                module_request: null,

                ip_address_option_list: [],
                module_option_list: [],
                module_request_option_list: [],

                ui_added_parameters: {}
            };

            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);

            this.getIpAddressOptionList(IntrospectFormView);
            this.model().on("change:ip_address", function() {
                this.onChangeIpAddress(IntrospectFormView);
            }, this);
            this.model().on("change:module", function() {
                this.onChangeModule(IntrospectFormView);
            }, this);
            this.model().on("change:module_request", function() {
                this.onChangeModuleIntrospect(IntrospectFormView);
            }, this);


            return this;
        },

        getNodeIpAddressOptionList: function(nodeType, callback) {
            var ip = null;
            var hostname;
            var ipAddressOptionList = [];
            var url = "/api/admin/monitor/infrastructure/";
            if ("control" === nodeType) {
                nodeSummType = "controlnodes";
            } else if ("vrouter" === nodeType) {
                nodeSummType = "vrouters";
            } else if ("config" === nodeType) {
                nodeSummType = "confignodes";
            } else if ("analytics" === nodeType) {
                nodeSummType = "analyticsnodes";
            }
            url += nodeSummType + "/summary";
            $.ajax({
                url: url,
                success: function(response) {
                    _.each(response, function(value) {
                        if ("control" === nodeType) {
                            ip = getValueByJsonPath(value,
                                                    "value;ConfigData;bgp-router;bgp_router_parameters;address",
                                                    null);
                            hostname = getValueByJsonPath(value, "name", null);
                        } else if ("vrouter" === nodeType) {
                            ip = getValueByJsonPath(value,
                                                    "value;ConfigData;virtual-router;virtual_router_ip_address",
                                                    null);
                            hostname = getValueByJsonPath(value, "name", null);
                        } else if ("config" === nodeType) {
                            ip = getValueByJsonPath(value,
                                                    "value;derived-uve;ConfigData;config_node_ip_address",
                                                    null);
                            hostname = getValueByJsonPath(value, "name", null);
                        } else if ("analytics" === nodeType) {
                            ip = getValueByJsonPath(value,
                                                    "value;derived-uve;ConfigData;analytics-node;analytics_node_ip_address",
                                                    null);
                            hostname = getValueByJsonPath(value, "name", null);
                        }
                        if(ip != null){
                            ipAddressOptionList.push({id: ip, text: [hostname, " (", ip, ")"].join(""), hostname: hostname});
                        }
                  })
                   callback(ipAddressOptionList);
                },
                error: function(xhr) {
                   callback(ipAddressOptionList);
                }
            })
        },
        getIntrospectCookie: function(callback) {
            if (!cowu.isNil(window.chrome && chrome.runtime && chrome.runtime.id)) {
                /* Chrome Extension */
                getIntrospectCookie(function(cookieObj) {
                    var ipCookie = null;
                    if (null != cookieObj) {
                        ipCookie = cookieObj.introIP;
                    }
                    callback(ipCookie);
                });
            } else {
                callback(contrail.getCookie("contrailIntrospectIP"));
            }
        },
        getIpAddressOptionList: function(IntrospectFormView) {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                port = model.attributes.port,
                ipAddress = model.attributes.ip_address,
                nodeSummType,
                uiAddedParameters = model.attributes.ui_added_parameters,
                ipAddressOptionList = [];

            if (!contrail.checkIfExist(uiAddedParameters[node])) {
                uiAddedParameters[node] = {};

                if (!contrail.checkIfExist(uiAddedParameters[node][port])) {
                    uiAddedParameters[node][port] = {};

                    if (true === loadIntrospectViaProxy) {
                        self.getNodeIpAddressOptionList(node, function(ipAddressOptionList) {
                            self.ip_address_option_list(ipAddressOptionList);
                            if (ipAddressOptionList.length > 0) {
                                //self.ip_address(ipAddressOptionList[ipAddressOptionList.length - 1].id);
                            }
                        });
                    } else {
                        this.getIntrospectCookie(function(introIPs) {
                            var ipOptionList = [];
                            if (null != introIPs) {
                                var ipsArr = introIPs.split(":");
                                var len = ipsArr.length;
                                var setIP = null;
                                for (var i = 0; i < len; i++) {
                                    ipOptionList.push({id: ipsArr[i], text: ipsArr[i]});
                                }
                            }
                            self.ip_address_option_list(ipOptionList);
                            if (ipOptionList.length > 0) {
                                self.ip_address(ipOptionList[0].id);
                                self.onChangeIpAddress(IntrospectFormView);
                                setIntrospectCookie(ipOptionList[0].id, node);
                            }
                        });
                    }
                }
            } else {
                _.each(uiAddedParameters[node][port], function(value, key) {
                    ipAddressOptionList.push({id: key, text: key});
                });
                self.ip_address_option_list(ipAddressOptionList);
            }
        },

        onChangeIpAddress: function(IntrospectFormView) {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                hostname = self.resolveIP2Hostname(ipAddress),
                port = model.attributes.port,
                uiAddedParameters = model.attributes.ui_added_parameters,
                url = iUtils.getProxyURL(hostname, port),
                modules = [];

            if (ipAddress !== "") {
                IntrospectFormView.removeIntrospectForm();
                if (!contrail.checkIfExist(uiAddedParameters[node][port])) {
                    uiAddedParameters[node][port] = {};
                }

                if (!contrail.checkIfExist(uiAddedParameters[node][port][ipAddress])) {
                    uiAddedParameters[node][port][ipAddress] = {};
                }

                if (!$.isEmptyObject(uiAddedParameters[node][port][ipAddress])) {

                    _.each(uiAddedParameters[node][port][ipAddress], function (value, key) {
                        modules.push({id: key, text: key});
                    });
                    self.module_option_list(modules);

                } else {

                    contrail.ajaxHandler({
                            url: url, dataType: "html"
                        }, function () {
                            IntrospectFormView.hideIntrospectStatus();
                        }, function (html) {
                            var moduleText;

                            $(html).each(function (key, value) {
                                if ($(value).is("a")) {
                                    moduleText = $(value).text();
                                    moduleText = moduleText.replace(".xml", "");
                                    modules.push({id: moduleText, text: moduleText});

                                    uiAddedParameters[node][port][ipAddress][moduleText] = {};
                                }
                            });

                            if (modules.length === 0) {
                                IntrospectFormView.renderIntrospectEmptyStatus("No Module Found.");
                            }

                            self.module_option_list(modules);
                        },
                        function (error) {
                            if (error.status === 404) {
                                IntrospectFormView.renderIntrospectErrorStatus("Unable to fetch " + url);
                            }
                        });
                }
                if (!cowu.isNil(window.chrome && chrome.runtime && chrome.runtime.id)) {
                    /* Chrome Extension */
                    setIntrospectCookie(ipAddress);
                }
            }
        },

        onChangeModule: function(IntrospectFormView) {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                hostname = self.resolveIP2Hostname(ipAddress),
                port = model.attributes.port,
                module = model.attributes.module,
                uiAddedParameters = model.attributes.ui_added_parameters,
                url = iUtils.getProxyURL(hostname, port, {module: module}),
                moduleIntrospects = [];

            if (!$.isEmptyObject(uiAddedParameters[node][port][ipAddress][module])) {

                _.each(uiAddedParameters[node][port][ipAddress][module], function(value, key) {
                    moduleIntrospects.push({id: key, text: key});
                });
                self.module_request_option_list(moduleIntrospects);

            } else {
                IntrospectFormView.removeIntrospectForm();
                contrail.ajaxHandler({
                    url: url, dataType: "xml"
                }, function(){
                    IntrospectFormView.hideIntrospectStatus();
                }, function (xml) {
                    var x2js = new Xml2json(),
                        json = x2js.xml2json(xml);

                    _.each(json[module], function (jsonValue, jsonKey) {
                        if(jsonKey.charAt(0) !== "_") {
                            moduleIntrospects.push({id: jsonKey, text: jsonKey});
                            uiAddedParameters[node][port][ipAddress][module][jsonKey] = jsonValue;
                        }
                    });

                    if(moduleIntrospects.length === 0) {
                        IntrospectFormView.renderIntrospectEmptyStatus("No Introspect Found.");
                    }

                    self.module_request_option_list(moduleIntrospects);
                }, function (error) {
                    if (error.status === 404) {
                        IntrospectFormView.renderIntrospectErrorStatus("Unable to fetch " + url);
                    }
                });
            }
        },

        onChangeModuleIntrospect: function(IntrospectFormView) {
            var self = this,
                model = self.model(),
                node = model.attributes.node,
                ipAddress = model.attributes.ip_address,
                port = model.attributes.port,
                module = model.attributes.module,
                moduleRequest = model.attributes.module_request,
                uiAddedParameters = model.attributes.ui_added_parameters;

            IntrospectFormView.removeIntrospectForm();
            if (moduleRequest !== "") {
                IntrospectFormView.renderIntrospectSecondaryForm(uiAddedParameters[node][port][ipAddress][module][moduleRequest]);
            }
        },

        validations: {
            runIntrospectValidation: {
                "ip_address": {
                    required: true,
                    msg: ctwm.getRequiredMessage("ip address")
                }
            }
        },

        resolveIP2Hostname: function (ipAddress) {
            var self = this,
                model = self.model(),
                ipOptionsList = model.attributes.ip_address_option_list;

            var resolvedHostname = ipOptionsList
                .filter(function(ipOpt) { return ipOpt.id === ipAddress; })
                .map(function (matchedOpt) { return matchedOpt.hostname; })[0];

            return resolvedHostname || ipAddress;
        }
    });

    return IntrospectPrimaryFormModel;
});
