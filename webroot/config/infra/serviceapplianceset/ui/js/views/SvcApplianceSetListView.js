/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/serviceapplianceset/ui/js/models/SvcApplianceSetModel'
], function (_, ContrailView, ContrailListModel, SvcApplianceSetModel) {
    var configSvcApplianceSet = null;
    var gridElId = '#' + ctwl.QUOTAS_GRID_ID;
    var SvcApplianceSetListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url:
                        ctwc.get('/api/tenants/config/service-appliance-sets?detail=true'),
                        type: "GET"
                    },
                    dataParser: function(response) {
                        configSvcApplianceSet = response;
                        return svcApplianceSetDataParser(response);
                    },
                    completeCallback: function(resp) {
                        self.renderView4Config(self.$el, contrailListModel,
                                   getSvcApplianceSetViewConfig(),
                                   null, null, null, function() {
                            if ((null != resp) && (null != resp[0])) {
                                $(gridElId).data('configObj', configSvcApplianceSet);
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

    var svcApplianceSetDataParser = function (response) {
        var results = [];
        if (null == response) {
            return results;
        }
        var len = response.length;
        for (var i = 0; i < len; i++) {
            results.push(response[i]['service-appliance-set']);
        }
        return results;
    }

    var getSvcApplianceSetViewConfig = function () {
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
                                view: "SvcApplianceSetGridView",
                                viewPathPrefix:
                                    "config/infra/serviceapplianceset/ui/js/views/",
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

    return SvcApplianceSetListView;
});

