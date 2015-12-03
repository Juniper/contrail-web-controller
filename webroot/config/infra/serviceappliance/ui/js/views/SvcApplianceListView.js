/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/serviceappliance/ui/js/models/SvcApplianceModel'
], function (_, ContrailView, ContrailListModel, SvcApplianceModel) {
    var configSvcAppliance = null;
    var gridElId = '#' + ctwl.QUOTAS_GRID_ID;
    var SvcApplianceListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var saSetID = viewConfig.saSetValueData.value;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url:
                        ctwc.get('/api/tenants/config/service-appliances?detail=true&parent_id='
                                 + saSetID),
                        type: "GET"
                    },
                    dataParser: function(response) {
                        configSvcAppliance = response;
                        return svcApplianceDataParser(response);
                    },
                    completeCallback: function(resp) {
                        self.renderView4Config(self.$el, contrailListModel,
                                   getSvcApplianceViewConfig(),
                                   null, null, null, function() {
                            if ((null != resp) && (null != resp[0])) {
                                $(gridElId).data('configObj', configSvcAppliance);
                            }
                        });
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList : vlRemoteServiceApplConfig,
                    completeCallback: function(response) {
                        console.log("vlRemoteConfig Done:");
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var intfTypes = ['Management', 'Left', 'Right'];

    var vlRemoteServiceApplConfig = [{
        getAjaxConfig: function(esponseJSON) {
            var lazyAjaxConfig = {
                url: '/api/tenants/config/list-physical-interfaces',
                type: 'GET'
            };
            return lazyAjaxConfig;
        },
        successCallback: function(response, contrailListModel) {
            var piData = [];
            var results = [];
            if (null == window.svcApplData) {
                window.svcApplData = {};
            }
            var intfCnt = intfTypes.length;
            window.svcApplData.intfTypes = [];
            for (var i = 0; i < intfCnt; i++) {
                var id = intfTypes[i].replace(intfTypes[i][0],
                                              intfTypes[i][0].toLowerCase());
                window.svcApplData.intfTypes.push({text: intfTypes[i],
                                                   id: id});
            }
            if ((null == response) ||
                (null == response['physical-interfaces'])) {
                window.svcApplData.piList = [];
                return
            }
            var piData = response['physical-interfaces'];
            var len = piData.length;
            for (var i = 0; i < len; i++) {
                results.push({'text': piData[i]['fq_name'].join(':'),
                             'id': piData[i]['fq_name'].join(':') + ';' +
                             piData[i]['uuid']});
            }
            window.svcApplData.piList = results;
        }
    }];

    var svcApplianceDataParser = function (response) {
        var results = [];
        var len = response.length;
        for (var i = 0; i < len; i++) {
            results.push(response[i]['service-appliance']);
        }
        return results;
    }

    var getSvcApplianceViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_QUOTAS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_QUOTAS_ID,
                                title: ctwl.TITLE_QUOTAS,
                                view: "SvcApplianceGridView",
                                viewPathPrefix: "config/infra/serviceappliance/ui/js/views/",
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

    return SvcApplianceListView;
});

