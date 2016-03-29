/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
    ['underscore', 'contrail-view', 'contrail-list-model'],
    function(_, ContrailView, ContrailListModel) {
        var dnsRecordsListView = ContrailView.extend({
            el: $(contentContainer),

            render: function() {
                var self = this,
                    viewConfig = this.attributes.viewConfig;
                var dnsUUID = viewConfig.dnsSelectedValueData.value;
                var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.URL_GET_CONFIG_DETAILS,
                            type: "POST",
                            data: JSON.stringify({data: [{type: "virtual-DNS-records",
                            parent_id: dnsUUID}]})
                        },
                        dataParser: self.dnsRecordsDataParser
                    }
                };

                var contrailListModel = new ContrailListModel(
                    listModelConfig);
                this.renderView4Config(this.$el,
                    contrailListModel,
                    self.getDnsRecordsViewConfig(viewConfig.dnsSelectedValueData));
            },

            dnsRecordsDataParser: function(result) {
                var dnsRecordsData = [],
                    vdnsData = getValueByJsonPath(result,
                    "0;virtual-DNS-records", []);
                _.each(vdnsData, function(vdns){
                    dnsRecordsData.push(getValueByJsonPath(vdns,
                        "virtual-DNS-record", {}));
                });
                return dnsRecordsData;
            },

            getDnsRecordsViewConfig: function(dnsServerData) {
                return {
                    elementId: ctwc.CONFIG_DNS_RECORDS_SECTION_ID,
                    view: "SectionView",
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: ctwc.CONFIG_DNS_RECORDS_LIST_VIEW_ID,
                                view: "dnsRecordsGridView",
                                viewPathPrefix: "config/dns/records/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: { dnsServerData : dnsServerData}
                            }]
                        }]
                    }
                }
            }
        });
        return dnsRecordsListView;
    });