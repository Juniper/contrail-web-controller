/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
    ['underscore', 'contrail-view', 'contrail-list-model'],
    function(_, ContrailView, ContrailListModel) {
        var DnsRecordsListView = ContrailView
            .extend({
                el: $(contentContainer),
                render: function() {
                    var self = this,
                        viewConfig = this.attributes.viewConfig;
                    window.dnsSelectedValueData = viewConfig.dnsSelectedValueData;
                    var dnsUUID = viewConfig.dnsSelectedValueData.value;
                    var listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                // url:
                                // ctwc.get(ctwc.URL_GET_GLOBAL_VROUTER_CONFIG),
                                url: '/api/admin/config/get-data?type=virtual-DNS-record&count=4&fqnUUID=' +
                                    dnsUUID,
                                //url : '/api/admin/config/get-data?type=virtual-DNS-record&count=4&fqnUUID=f76bcfaa-4019-43d7-b325-3a5be1b8bc4d&_=1444198345418',
                                type: "GET"
                            },
                            dataParser: function(response) {

                                var gridElId =
                                    "#DnsRecordsGrid";
                                $(gridElId).data(
                                    'configObj',
                                    response);
                                return dnsRecordsDataParser(
                                    response)
                            }

                        }
                    };

                    var contrailListModel = new ContrailListModel(
                        listModelConfig);
                    this.renderView4Config(this.$el,
                        contrailListModel,
                        getDnsRecordsViewConfig());
                }
            });

        var dnsRecordsDataParser = function(result) {
            //  var newdnsRecordsData = [];
            // var DNSServerData = [];
            var idCount = 0;

            var vdnsData = getValueByJsonPath(result,
                "data;virtual-DNS", null);
            var vdnsRecoedsData = getValueByJsonPath(vdnsData,
                "virtual_DNS_records", []);

            return vdnsRecoedsData;
        }

        var getDnsRecordsViewConfig = function() {
            return {
                elementId: 'DnsRecordsPageListSection',
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'DnsRecordsPageList',
                            title: 'DnsRecordsPageList',
                            view: "dnsRecordsGridView",
                            viewPathPrefix: "config/dns/records/ui/js/views/",
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {}
                        }]
                    }]
                }
            }
        };

        return DnsRecordsListView;
    });