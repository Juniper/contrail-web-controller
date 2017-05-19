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
            var tenantId = contrail.getCookie('gohanProject'),getAjaxs = [];
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.GOHAN_NETWORK + ctwc.GOHAN_TENANT_PARAM + tenantId,
                            type: "GET"
                        },
                        dataParser: ctwp.gohanNetworksParser
                    }
             };
            getAjaxs[0] = $.ajax({
                url: ctwc.GOHAN_NETWORK_POLICY + ctwc.GOHAN_TENANT_PARAM + tenantId,
                type:'GET'
            });
            getAjaxs[1] = $.ajax({
                url: ctwc.GOHAN_PROJECT_URL,
                type:'GET'
            });
            $.when.apply($, getAjaxs).then( function () {
                var policies = arguments[0][0]['network_policies'], listOfPolicies = [];
                var pjData = arguments[1][0]['projects'],projectList = [];
                    for(var j = 0; j < pjData.length; j++){
                        var uuid = pjData[j].uuid.split('-');
                        projectList.push(uuid.join(''));
                        var fqName = pjData[j].fq_name;
                        projectList.push(fqName[fqName.length -1]);
                    }
                    for(var i = 0; i < policies.length; i++){
                        var index = projectList.indexOf(policies[i].tenant_id) + 1;
                        var projectName = projectList[index];
                        var policy = policies[i].name +' ('+ projectName +')' ;
                        listOfPolicies.push({name: policy, id: policies[i].id});
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
                                view: "gcVnCfgGridView",
                                viewPathPrefix:
                                    "config/gohanUi/networks/ui/js/views/",
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
