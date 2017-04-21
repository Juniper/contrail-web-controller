/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'contrail-view'
], function (_, Backbone, ContrailListModel, ContrailView ) {
    var PoliciesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig, getAjaxs = [];
            var tenantId = contrail.getCookie('gohanProject');
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: ctwc.GOHAN_NETWORK_POLICY + ctwc.GOHAN_TENANT_PARAM + tenantId,
                           type: "GET"
                       },
                       dataParser: ctwp.gohanNetworkPolicyDataParser
                   }
            };
            getAjaxs[0] = $.ajax({
                url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_TENANT_PARAM + tenantId,
                type:"GET"
            });
            getAjaxs[1] = $.ajax({
                url: ctwc.SVC_INSTANCES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                type:'GET'
            });
            $.when.apply($, getAjaxs).then( function () {
                    var networkList = [],instanceList = [];
                    var results = arguments;
                    var networks = results[0][0]['networks'], instances = results[1][0]['service_instances'];
                    for(var i = 0; i < networks.length; i++){
                        networkList.push({id: networks[i].id, name: networks[i].name});
                    }
                    for(var j = 0; j < instances.length; j++){
                        instanceList.push({id: instances[j].id, name: instances[j].name});
                    }
                    var contrailListModel = new ContrailListModel(listModelConfig);
                    self.renderView4Config(self.$el, contrailListModel, getPoliciesListViewConfig(networkList, instanceList));
                })
        }
    });

    var getPoliciesListViewConfig = function (network, instance) {
        return {
            elementId:
              cowu.formatElementId([ctwl.CONFIG_POLICY_FORMAT_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    ctwl.CONFIG_POLICIES_LIST_VIEW_ID,
                                title: ctwl.CONFIG_POLICIES_TITLE,
                                view: "gcPolicyGridView",
                                viewPathPrefix : "config/gohanUi/networkpolicy/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                             networkList : network,
                                             instanceList : instance
                                            }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return PoliciesListView;
});