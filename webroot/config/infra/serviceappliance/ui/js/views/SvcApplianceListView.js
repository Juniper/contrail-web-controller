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
    var saSetID = null;
    var SvcApplianceListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            saSetID = viewConfig.saSetValueData.value;
            self.svcApplData = {};
            self.svcApplData.svcApplSetSvcTmpl = "";
            self.svcApplData.intfTypes = [];
            self.svcApplData.piList = [];
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
                                   getSvcApplianceViewConfig(self.svcApplData));
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList : vlRemoteServiceApplConfig(self.svcApplData)
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var intfTypes = ['management', 'left', 'right'];

    function vlRemoteServiceApplConfig(svcApplData) {
        return [{
            getAjaxConfig: function(responseJSON) {
                var lazyAjaxConfig = {
                    url: '/api/tenants/config/get-config-details',
                    type: 'POST',
                    data: JSON.stringify({data: [{
                        type: 'service-templates',
                        fields: ['service_appliance_set_refs',
                            'service_template_properties'],
                        back_ref_id: [saSetID]
                    }]})
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var svcTmpls =
                    getValueByJsonPath(response[0],
                                       'service-templates',
                                       []);
                var cnt = svcTmpls.length;
                var tmplDetailObjs = {};
                for (var i = 0; i < cnt; i++) {
                    var svcApplSetRefs =
                        getValueByJsonPath(svcTmpls[i],
                                           'service-template;service_appliance_set_refs',
                                           []);
                    if (svcApplSetRefs.length > 0) {
                        var svcApplSetUUID = svcApplSetRefs[0]['uuid'];
                        tmplDetailObjs[svcApplSetUUID] =
                            svcTmpls[i]['service-template'];
                    }
                }
                var dataItems = contrailListModel.getItems();
                var dataCnt = dataItems.length;
                var svcApplSet = null;
                for (var i = 0; i < dataCnt; i++) {
                    svcApplSet = dataItems[i]['parent_uuid'];
                    if (null != tmplDetailObjs[svcApplSet]) {
                        dataItems[i]['service_template'] =
                            tmplDetailObjs[svcApplSet];
                    }
                }
                contrailListModel.updateData(dataItems);
                if ((svcTmpls.length > 0) && (null != svcTmpls[0]) &&
                    (null != svcTmpls[0]['service-template'])) {
                    svcApplData.svcApplSetSvcTmpl
                        = svcTmpls[0]['service-template'];
                }
            }
        },
        {
            getAjaxConfig: function(responseJSON) {
                var lazyAjaxConfig = {
                    url: '/api/tenants/config/list-physical-interfaces',
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var piData = [];
                var results = [];
                var intfCnt = intfTypes.length;
                for (var i = 0; i < intfCnt; i++) {
                    var id = intfTypes[i].replace(intfTypes[i][0],
                                                  intfTypes[i][0].toLowerCase());
                    svcApplData.intfTypes.push({text: intfTypes[i],
                                                       id: id});
                }
                if ((null == response) ||
                    (null == response['physical-interfaces'])) {
                    svcApplData.piList = [];
                    return
                }
                var piData = response['physical-interfaces'];
                var len = piData.length;
                for (var i = 0; i < len; i++) {
                    results.push({'text': piData[i]['fq_name'][2] + " (" +
                                    piData[i]['fq_name'][1] + ")",
                                 'id': piData[i]['fq_name'].join(':') +
                                 cowc.DROPDOWN_VALUE_SEPARATOR +
                                 piData[i]['uuid']});
                }
                svcApplData.piList = results;
            }
        }];
    };

    var svcApplianceDataParser = function (response) {
        var results = [];
        var len = response.length;
        for (var i = 0; i < len; i++) {
            results.push(response[i]['service-appliance']);
        }
        return results;
    }

    var getSvcApplianceViewConfig = function (svcApplData) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SVC_APPLIANCE_ID,
                                view: "SvcApplianceGridView",
                                viewPathPrefix: "config/infra/serviceappliance/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    svcApplData: svcApplData
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

