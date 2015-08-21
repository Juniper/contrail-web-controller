/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/networking/globalconfig/ui/js/models/GlobalConfigModel'
], function (_, ContrailView, ContrailListModel, GlobalConfigModel) {
    var gridElId = "#" + ctwl.GLOBAL_CONFIG_GRID_ID;
    var globalConfigObj = {};
    var self = this;
    var GlobalConfigListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_GLOBAL_VROUTER_CONFIG),
                        type: "GET"
                    },
                    dataParser: globalConfigDataParser,
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteGLConfig,
                    completeCallback: function() {
                        self.renderView4Config(self.$el, contrailListModel,
                                   getGlobalConfigViewConfig(), null, null,
                                   null, function() {
                            $(gridElId).data('configObj', globalConfigObj);
                        });
                    }
                },
                cacheConfig: {
                    ucid: 'global:config',
                    cacheTimeout: 0
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var vlRemoteGLConfig = [
        {
            getAjaxConfig: function (responseJSON) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_GLOBAL_ASN),
                    type: "GET"
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var dataItems = [];
                var globalASNData = response;
                var dataItem = {};
                var globalVRConfigMapLen = globalVRConfigMap.length;
                for (var i = 2; i < globalVRConfigMapLen; i++) {
                    var key = globalVRConfigMap[i]['key'];
                    var value = response['global-system-config'][key];
                    if (key == 'ip_fabric_subnets') {
                        if (null == value) {
                            dataItems.push({'name': globalVRConfigMap[i]['name'],
                                           'value': {'subnet': []}, 'key': key});
                            continue;
                        }
                        var subnet = value['subnet'];
                        var subnetLen = subnet.length;
                        var subnets = {'subnet': []};
                        for (var j = 0; j < subnetLen; j++) {
                            subnets['subnet'].push(subnet[j]['ip_prefix'] + "/" +
                                         subnet[j]['ip_prefix_len']);
                        }
                        value = subnets;
                    }
                    dataItems.push({'name': globalVRConfigMap[i]['name'],
                                    'value': value, 'key': key});
                }
                contrailListModel.addData(dataItems);
                globalConfigObj['global-system-config'] =
                    response['global-system-config'];
            }
        }
    ];

    var globalVRConfigMap = [
        {'key': 'vxlan_network_identifier_mode',
         'name': 'VxLAN Identifier Mode'},
        {'key': 'encapsulation_priorities',
         'name': 'Encapsulation Priority Order',},
        {'key': 'autonomous_system', 'name': 'Global ASN'},
        {'key': 'ibgp_auto_mesh', 'name': 'iBGP Auto Mesh'},
        {'key': 'ip_fabric_subnets', 'name': 'IP Fabric Subnets'}
    ];

    var globalConfigDataParser = function (response) {
        console.log("Inside :", response);
        var dataItem = {};
        var dataItems = [];
        var globalVRConfigMapLen = globalVRConfigMap.length;
        for (var i = 0; i < 2; i++) {
            dataItems[i] = {};
            var key = globalVRConfigMap[i]['key'];
            dataItems[i]['name'] = globalVRConfigMap[i]['name'];
            dataItems[i]['value'] = response['global-vrouter-config'][key];
            dataItems[i]['key'] = key;
            /*
            if (key == 'encapsulation_priorities') {
                dataItems[i]['value'] = dataItems[i]['value']['encapsulation'];
            }
            */
        }
        globalConfigObj['global-vrouter-config'] = response['global-vrouter-config'];
        return dataItems;
    }

    var getGlobalConfigViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_GLOBAL_CONFIG_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_GLOBAL_CONFIG_ID,
                                title: ctwl.TITLE_GLOBAL_CONFIG,
                                view: "GlobalConfigGridView",
                                viewPathPrefix:
                                    "config/networking/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return GlobalConfigListView;
});

