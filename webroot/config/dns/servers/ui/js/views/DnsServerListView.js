/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
    ['underscore', 'contrail-view', 'contrail-list-model',
        'config/dns/servers/ui/js/models/DnsServerModel',
    ],
    function(_, ContrailView, ContrailListModel, DnsServerModel) {
        var DnsServerListView = ContrailView
            .extend({
                el: $(contentContainer),
                render: function() {
                    var self = this,
                        viewConfig = this.attributes.viewConfig;
                    var domainUUID = viewConfig.domainSelectedValueData
                        .value;
                    var listModelConfig = {
                        remote: {
                            ajaxConfig: {
                       
                                url: '/api/admin/config/get-data?type=virtual-DNS&count=4&fqnUUID=' +
                                    domainUUID,
                                type: "GET"
                            },
                            dataParser: function(response) {

                                
                                return dnsServerDataParser(
                                    response)
                            }

                        }
                    };

                    var contrailListModel = new ContrailListModel(
                        listModelConfig);
                    this.renderView4Config(this.$el,
                        contrailListModel,
                        getDnsServerViewConfig());
                }
            });

        var dnsServerDataParser = function(result) {

            var DNSServerData = [];
            var idCount = 0;

            var vdnsData = getValueByJsonPath(result,
                "data;virtual_DNSs", []);
            var vdnsCnt = vdnsData.length;
            for (var i = 0; i < vdnsCnt; i++) {
                if ((null == vdnsData[i]) || (null == vdnsData[i][
                        'virtual-DNS'
                    ])) {
                    continue;
                }
                DNSServerData.push(vdnsData[i]['virtual-DNS']);
            }
            return DNSServerData;
        }

        var getDnsServerViewConfig = function() {
            return {
                elementId: 'DnsServerPageListSection',
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'DnsServerPageList',
                            title: 'DnsServerPageList',
                            view: "DnsServerGridView",
                            viewPathPrefix: "config/dns/servers/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {}
                        }]
                    }]
                }
            }
        };

        return DnsServerListView;
    });