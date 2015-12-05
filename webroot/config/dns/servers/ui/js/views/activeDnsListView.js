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
                            dataParser: function(result) {
                                var activeDNSRecData = [];
                                if(result instanceof Array && result.length === 1){
                                    activeDNSRecData = getValueByJsonPath(result[0],
                                    'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData',
                                    []);
                                }
                                return activeDNSRecData;
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