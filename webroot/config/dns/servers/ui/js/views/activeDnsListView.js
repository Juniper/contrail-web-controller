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
                    prevNextCache = {};
                    var currentHashParams = layoutHandler.getURLHashParams();
                    var currentDNSServer = currentHashParams.focusedElement.dnsServer;
                    var listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: ctwc.ACTIVE_DNS_DATA + getCookie('domain') +
                                    ":" + currentDNSServer,
                                type: "GET"
                            },
                            dataParser: ctwp.parseActiveDNSRecordsData
                        }
                    };

                    var contrailListModel = new ContrailListModel(
                        listModelConfig);
                    pushBreadcrumb([currentDNSServer]);
                    this.renderView4Config(this.$el,
                        contrailListModel,
                        getActiveDnsViewConfig(currentDNSServer));
                }
            });

        var getActiveDnsViewConfig = function(currentDNSServer) {
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
                            viewConfig: {currentDNSServer : currentDNSServer}
                        }]
                    }]
                }
            }
        };

        return ActiveDnsListView;
    });