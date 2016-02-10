/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/globalconfig/ui/js/models/GlobalConfigModel',
    'config/infra/globalconfig/ui/js/globalConfig.utils'
], function (_, ContrailView, ContrailListModel, GlobalConfigModel,
             GlobalConfigUtils) {
    var gridElId = "#" + ctwl.GLOBAL_CONFIG_GRID_ID;
    var globalConfigObj = {};
    var self = this;
    var gcUtils = new GlobalConfigUtils();
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
                if ((null == response) ||
                    (null == response['global-system-config'])) {
                    response = {};
                    response['global-system-config'] = {};
                }
                var globalVRConfigMapLen = globalVRConfigMap.length;
                for (var i = 6; i < globalVRConfigMapLen; i++) {
                    var key = globalVRConfigMap[i]['key'];
                    var value = response['global-system-config'][key];
                    var encap =
                        getValueByJsonPath(value, 'encapsulation',
                                           gcUtils.getDefaultUIEncapList());
                    if ('encapsulation_priorities' == key) {
                        if (null == value) {
                            value = {};
                        }
                        value['encapsulation'] = encap;
                    }
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
                    } else {
                        if (null == value) {
                            if ('autonomous_system' == key) {
                                value = 64513;
                                response['global-system-config']
                                        ['autonomous_system'] = 64513;
                            }
                            if ('ibgp_auto_mesh' == key) {
                                value = true;
                                response['global-system-config']
                                        ['ibgp_auto_mesh'] = true;
                            }
                        }
                    }
                    dataItems.push({'name': globalVRConfigMap[i]['name'],
                                    'value': value, 'key': key});
                }
                contrailListModel.addData(dataItems);
                globalConfigObj['global-system-config'] =
                    response['global-system-config'];
                var flowProtoList = [];
                var tmpFlowProtoList =
                    JSON.parse(JSON.stringify(protocolList));
                var protoCnt = tmpFlowProtoList.length;
                for (var i = 0; i < protoCnt; i++) {
                    var protocol = tmpFlowProtoList[i].name.toUpperCase();
                    var protocolValue = protocol.toLowerCase();
                    if(protocol === 'TCP') {
                        flowProtoList.push({
                            index : 0,
                            text : 6 + ' (' + protocol + ')',
                            value : protocolValue
                        });
                    } else if(protocol === 'UDP') {
                        flowProtoList.push({
                            index : 1,
                            text : 17 + ' (' + protocol + ')',
                            value : protocolValue
                        });
                    } else if(protocol === 'ICMP') {
                        flowProtoList.push({
                            index : 2,
                            text : 1 + ' (' + protocol + ')',
                            value : protocolValue
                        });
                    }
                }
                //sort protocols by TCP,UDP and ICMP order
                flowProtoList.sort(function(a, b){
                    return (a.index - b.index);
                });
                window.globalConfigProtocolList = flowProtoList;
            }
        }
    ];

    var globalVRConfigMap = [
        {'key': 'forwarding_mode',
         'name': 'Forwarding Mode'},
        {'key': 'vxlan_network_identifier_mode',
         'name': 'VxLAN Identifier Mode'},
        {'key': 'encapsulation_priorities',
         'name': 'Encapsulation Priority Order',},
        {'key': 'flow_export_rate', 'name': 'Flow Export Rate'},
        {'key': 'flow_aging_timeout_list', 'name': 'Flow Aging Timeout'},
        {'key': 'ecmp_hashing_include_fields',
            'name': 'ECMP Hashing Fields'},
        {'key': 'autonomous_system', 'name': 'Global ASN'},
        {'key': 'ibgp_auto_mesh', 'name': 'iBGP Auto Mesh'},
        {'key': 'ip_fabric_subnets', 'name': 'IP Fabric Subnets'}
    ];

    var globalConfigDataParser = function (response) {
        var dataItem = {};
        var dataItems = [];
        var globalVRConfigMapLen = globalVRConfigMap.length;
        var gvData = getValueByJsonPath(response, 'global-vrouter-config',
                                        null);
        if (null == gvData) {
            response = {};
            response['global-vrouter-config'] = {};
        }
        for (var i = 0; i < 6; i++) {
            dataItems[i] = {};
            var key = globalVRConfigMap[i]['key'];
            dataItems[i]['name'] = globalVRConfigMap[i]['name'];
            if ((null == gvData) || (!(key in gvData))) {
                if ('vxlan_network_identifier_mode' == key) {
                    dataItems[i]['value'] = 'automatic';
                    response['global-vrouter-config']
                            ['vxlan_network_identifier_mode'] = 'automatic';
                }
                if ('encapsulation_priorities' == key) {
                    var uiConfig = gcUtils.getDefaultUIEncapList();
                    dataItems[i]['value'] =
                        {'encapsulation': uiConfig};
                    response['global-vrouter-config']
                            ['encapsulation_priorities'] = {};
                    response['global-vrouter-config']
                            ['encapsulation_priorities']['encapsulation'] =
                            dataItems[i]['value'];
                }
                if ('forwarding_mode' == key) {
                    dataItems[i]['value'] = 'Default';
                }
                if ('ecmp_hashing_include_fields' == key) {
                    dataItems[i]['value'] = {
                        'source_ip': true,
                        'destination_ip': true,
                        'ip_protocol': true,
                        'source_port': true,
                        'destination_port': true
                    };
                }
            } else {
                dataItems[i]['value'] = response['global-vrouter-config'][key];
                if ('encapsulation_priorities' == key) {
                    var configEncap =
                        getValueByJsonPath(dataItems[i]['value'],
                                           'encapsulation',
                                           gcUtils.getDefaultConfigEncapList());
                    dataItems[i]['value']['encapsulation'] =
                        gcUtils.mapConfigEncapToUIEncap(configEncap);
                }
            }
            dataItems[i]['key'] = key;
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
                                    "config/infra/globalconfig/ui/js/views/",
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

