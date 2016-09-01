/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(
    ['underscore', 'contrail-view', 'contrail-list-model'],
    function(_, ContrailView, ContrailListModel) {
        var dnsServersListView = ContrailView.extend({
            el: $(contentContainer),

            render: function() {
                var self = this,
                    viewConfig = this.attributes.viewConfig;
                var domainUUID = viewConfig.domainSelectedValueData.value;
                var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.URL_GET_CONFIG_DETAILS,
                            type: "POST",
                            data: JSON.stringify({data: [{type: "virtual-DNSs",
                            /*parent_id: domainUUID,*/ fields: ["network_ipam_back_refs"]}]})
                        },
                        dataParser: self.dnsServerDataParser
                    }
                };

                var contrailListModel = new ContrailListModel(
                    listModelConfig);
                self.renderView4Config(self.$el,
                    contrailListModel,
                    self.getDnsServerViewConfig());
            },

            dnsServerDataParser: function(result) {
               var dnsServerData = [],
                   vdnsData = getValueByJsonPath(result,
                   "0;virtual-DNSs", []);
               _.each(vdnsData, function(vdns){
                   dnsServerData.push(getValueByJsonPath(vdns,
                       "virtual-DNS", {}));
               });
               return dnsServerData;
            },

            getDnsServerViewConfig: function() {
                return {
                    elementId: ctwc.CONFIG_DNS_SERVER_SECTION_ID,
                    view: "SectionView",
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: ctwc.CONFIG_DNS_SERVER_LIST_VIEW_ID,
                                view: "dnsServersGridView",
                                viewPathPrefix: "config/dns/servers/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {}
                            }]
                        }]
                    }
                };
            }
        });
        return dnsServersListView;
    });