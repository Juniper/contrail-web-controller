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
                                   getSvcApplianceSetViewConfig());
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList : vlRemoteServiceApplConfig
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var intfTypes = ['Management', 'Left', 'Right'];

    var vlRemoteServiceApplConfig = [
    {
        getAjaxConfig: function(responseJSON) {
            var cnt = responseJSON.length;
            var uuidList = [];
            for (var i = 0; i < cnt; i++) {
                uuidList.push(responseJSON[i]['uuid']);
            }
            var lazyAjaxConfig = {
                url: '/api/tenants/config/get-config-details',
                type: 'POST',
                data: JSON.stringify({data: [{
                    type: 'service-templates',
                    fields: ['service_appliance_set_refs',
                        'service_template_properties'],
                    back_ref_id: uuidList
                }]})
            };
            return lazyAjaxConfig;
        },
        successCallback: function(response, contrailListModel) {
            var svcTmpls =
                getValueByJsonPath(response[0],
                                   'service-templates', []);
            var cnt = svcTmpls.length;
            var tmplDetailObjs = {};
            for (var i = 0; i < cnt; i++) {
                var svcApplSetRefs =
                    getValueByJsonPath(svcTmpls[i],
                                       'service-template;service_appliance_set_refs',
                                       []);
                if (svcApplSetRefs.length > 0) {
                    var svcApplSetUUID = svcApplSetRefs[0]['uuid'];
                    var svcAllsSetFqn = svcApplSetRefs[0]['to'][1];
                    tmplDetailObjs[svcApplSetUUID] =
                        svcTmpls[i]['service-template'];
                }
            }
            var dataItems = contrailListModel.getItems();
            var dataCnt = dataItems.length;
            for (var i = 0; i < dataCnt; i++) {
                svcApplSet = dataItems[i]['uuid'];
                if (null != tmplDetailObjs[svcApplSet]) {
                    dataItems[i]['service_template'] =
                        tmplDetailObjs[svcApplSet];
                }
            }
            contrailListModel.updateData(dataItems);
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
            elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SVC_APPLIANCE_SET_ID,
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

