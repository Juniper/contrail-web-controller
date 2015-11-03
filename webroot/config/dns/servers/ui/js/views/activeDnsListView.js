/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
    ['underscore', 'contrail-view', 'contrail-list-model'],
    function(_, ContrailView, ContrailListModel) {
        var ActiveDnsListView = ContrailView
            .extend({
                el: $(contentContainer),
                render: function() {
                    var self = this,
                        viewConfig = this.attributes.viewConfig;

                    var currentHashParams = layoutHandler.getURLHashParams();
                    var listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                // url:
                                // ctwc.get(ctwc.URL_GET_GLOBAL_VROUTER_CONFIG),
                                url: '/api/tenants/config/sandesh/virtual-DNS/' +
                                    getCookie('domain') +
                                    ":" + currentHashParams.focusedElement
                                    .dnsServer,
                                type: "GET"
                            },
                            dataParser: function(response) {

                                var gridElId =
                                    "#ActiveDnsGrid";
                                $(gridElId).data(
                                    'configObj',
                                    response);
                                return activeDnsDataParser(
                                    response)
                            }

                        }
                    };

                    var contrailListModel = new ContrailListModel(
                        listModelConfig);
                    pushBreadcrumb([currentHashParams.focusedElement
                        .dnsServer
                    ]);
                    this.renderView4Config(this.$el,
                        contrailListModel,
                        getActiveDnsViewConfig());
                }
            });

        var activeDnsDataParser = function(response) {
            var responselen = response.length;
            var ds = [];
            for (i = 0; i < response.length; i++) {
                if (response && response.length > i && response[i] &&
                    response[i].VirtualDnsRecordsResponse && response[i]
                    .VirtualDnsRecordsResponse.records && response[0].VirtualDnsRecordsResponse
                    .records.list) {
                    var nextRecSetKey = response[i].VirtualDnsRecordsResponse
                        .getnext_record_set;
                    var res = response[i].VirtualDnsRecordsResponse.records
                        .list.VirtualDnsRecordTraceData;
                    if (res) {
                        if (res.length > i) {
                            for (var j = 0; j < res.length; j++) {
                                ds.push(res[j]);
                            }
                        } else {
                            var d = res;
                            ds.push(d);
                        }
                    }
                }
            }
            return ds;
        }

        var getActiveDnsViewConfig = function() {
            return {
                elementId: 'ActiveDnsPageListSection',
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'ActiveDnsPageList',
                            title: 'ActiveDnsPageList',
                            view: "activeDnsGridView",
                            viewPathPrefix: "config/dns/servers/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {}
                        }]
                    }]
                }
            }
        };

        return ActiveDnsListView;
    });