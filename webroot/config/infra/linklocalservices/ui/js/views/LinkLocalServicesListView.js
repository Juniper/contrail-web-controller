/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/infra/linklocalservices/ui/js/models/LinkLocalServicesModel'
], function (_, ContrailView, ContrailListModel, LinkLocalServicesModel) {
    var configObj = {};
    var gridElId = '#' + ctwl.LINK_LOCAL_SERVICES_GRID_ID;

    var LinkLocalServicesListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_GLOBAL_VROUTER_CONFIG),
                        type: "GET"
                    },
                    dataParser: function(response){
                        var linkLocalServicesModel = new
                            LinkLocalServicesModel();
                        configObj = response;
                        return llsDataParser(response)
                    },
                    completeCallback: function(respArr) {
                        self.renderView4Config(self.$el, contrailListModel,
                                   getLinkLocalServicesViewConfig(), null, null,
                                   null, function() {
                            $(gridElId).data('configObj', configObj);
                        });
                    }
                }
            };

            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var llsDataParser = function(results) {
        results = contrail.handleIfNull(results, {});
        var llsData = [];
        if ((null != results) &&
            (null != results['global-vrouter-config']) &&
            (null !=
             results['global-vrouter-config']['linklocal_services']) &&
            (null !=
             results['global-vrouter-config']['linklocal_services']
             ['linklocal_service_entry'])) {
            llsData =
                results['global-vrouter-config']['linklocal_services']
                ['linklocal_service_entry'];
        }
        var llsCnt = llsData.length;
        for (var i = 0; i < llsCnt; i++) {
            llsData[i]['lls_fab_address_ip'] = 'IP';
            if (!llsData[i]['ip_fabric_service_ip'].length) {
                llsData[i]['lls_fab_address_ip'] = 'DNS';
            }
        }
        return llsData;
    };

    var getLinkLocalServicesViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_LINK_LOCAL_SERVICES_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_LINK_LOCAL_SERVICES_ID,
                                title: ctwl.TITLE_LINK_LOCAL_SERVICES,
                                view: "LinkLocalServicesGridView",
                                viewPathPrefix: "config/infra/linklocalservices/ui/js/views/",
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

    return LinkLocalServicesListView;
});

