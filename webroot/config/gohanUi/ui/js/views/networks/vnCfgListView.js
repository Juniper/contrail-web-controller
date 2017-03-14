/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var vnCfgListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var tenantId = contrail.getCookie('gohanRole'),getAjaxs = [];
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: './gohan_contrail/v1.0/tenant/networks?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanNetworksParser
                    }
             };
            getAjaxs[0] = $.ajax({
            	url: './gohan_contrail/v1.0/tenant/network_policies?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                type:'GET'
            });
            $.when.apply($, getAjaxs).then( function () {
            	var policies = arguments[0]['network_policies'], listOfPolicies = [];
            	    for(var j = 0; j < policies.length; j++){
            	    	listOfPolicies.push({name: policies[j].name, id: policies[j].id});
            	    }
            	    var contrailListModel = new ContrailListModel(listModelConfig);
	                self.renderView4Config(self.$el, contrailListModel, getVNCfgListViewConfig(listOfPolicies));
            });
            
        }
    });
    var getVNCfgListViewConfig = function (listOfPolicies) {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VN_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VN_LIST_ID,
                                title: ctwl.CFG_VN_TITLE,
                                view: "vnCfgGridView",
                                viewPathPrefix:
                                    "config/gohanUi/ui/js/views/networks/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                	listOfPolicies: listOfPolicies
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return vnCfgListView;
});
