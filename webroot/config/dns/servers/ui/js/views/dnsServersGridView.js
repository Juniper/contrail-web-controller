/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/dns/servers/ui/js/models/dnsServersModel',
    'config/dns/servers/ui/js/views/dnsServersEditView',
    'config/dns/servers/ui/js/dnsServersFormatter'
], function(_, ContrailView, DnsServersModel, DnsServersEditView, DnsServersFormatter) {
    var dnsServersEditView = new DnsServersEditView(),
        dnsServersFormatters = new DnsServersFormatter(),
        gridElId = '#' + ctwc.DNS_SERVER_GRID_ID;

    var dnsServersGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            this.renderView4Config(self.$el, self.model,
                getDnsServerGridViewConfig(pagerOptions)
            );
        }
    });

    var getDnsServerGridViewConfig = function(pagerOptions) {
        return {
            elementId: ctwc.CONFIG_DNS_SERVER_ID,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.DNS_SERVER_GRID_ID,
                        title: ctwl.TITLE_DNS_SERVER,
                        view: "GridView",
                        viewConfig: {
                            elementConfig: getConfiguration(
                                pagerOptions)
                        }
                    }]
                }]
            }
        }
    };

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(
                    rowIndex);
            dnsServersModel = new DnsServersModel(dataItem);
            dnsServersEditView.model = dnsServersModel;
            dnsServersEditView.renderAddEditDNSServer({
                "title": ctwl.EDIT,
                callback: function() {
                    var dataView =
                        $(gridElId).data(
                            "contrailGrid")._dataView;
                    dataView.refreshData();
                },
                'mode': ctwl.EDIT_ACTION
            });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dnsServersModel = new DnsServersModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(
                    rowIndex);
            var checkedRows = [dataItem];
            dnsServersEditView.model = dnsServersModel;
            dnsServersEditView.renderDeleteDnsServer({
                "title": ctwl.TITLE_DEL_DNS_SERVER +
                    '(' + dataItem['display_name'] +
                    ')',
                checkedRows: checkedRows,
                callback: function() {
                    var dataView =
                        $(gridElId).data(
                            "contrailGrid")._dataView;
                    dataView.refreshData();
                }
            });
        }),
        ctwgc.getActiveDnsConfig('Active DNS Database', function(
            rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(
                    rowIndex);
            var name = dataItem.name,
                hashParams = null,
                triggerHashChange = true,
                hostName;
            var server = dataItem['fq_name'][1];
            var hashObj = {
                type: "activeDnsDatabase",
                view: "config_dns_activeDatabase",
                focusedElement: {
                    dnsServer: server,
                    tab: 'config_dns_activeDatabase'
                }
            };

            if (contrail.checkIfKeyExistInObject(true,
                    hashParams,
                    'clickedElement')) {
                hashObj.clickedElement = hashParams.clickedElement;
            }

            layoutHandler.setURLHashParams(hashObj, {
                p: "config_dns_servers",
                merge: false,
                triggerHashChange: triggerHashChange
            });

        })

    ];

    var getConfiguration = function() {
        var gridElementConfig = {
            header: {
                title: {
                    text: "DNS Servers"
                },
                advanceControls: getHeaderActionConfig(gridElId)
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                            getDNSDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e) {
                            $('#btnActionDelDNS').addClass(
                                'disabled-link');
                        },
                        onSomethingChecked: function(e) {
                            $('#btnActionDelDNS').removeClass(
                                'disabled-link');
                        }
                    },
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading DNS Servers..'
                    },
                    empty: {
                        text: 'No DNS Servers Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting DNS Servers.'
                    }
                }
            },
            columnHeader: {
                columns: DnsServerColumns
            }
        };
        return gridElementConfig;
    };

    var DnsServerColumns = [{
            id: 'display_name',
            field: 'display_name',
            name: 'DNS Server',
            cssClass: 'cell-hyperlink-blue',
            events: {
                onClick: function(e, dc) {
                    contrail.setCookie('dnsServer', dc.name);
                    layoutHandler.setURLHashParams({
                        uuid: dc.uuid
                    }, {
                        p: 'config_dns_records',
                        merge: false,
                        triggerHashChange: true
                    });

                }
            }

        }, {
            name: 'Domain Name',
            formatter: dnsServersFormatters.domainNameFormatter
        }, {
            name: 'Forwarders',
            formatter: dnsServersFormatters.forwardersFormatter
        }
    ];

    function getNetworkIpamStrings(nwIpamBackRefs) {
        var ipams = [];
        if (nwIpamBackRefs != null && nwIpamBackRefs.length > 0) {
            for (var i = 0; i < nwIpamBackRefs.length; i++) {
                var fqn = nwIpamBackRefs[i]['to'];
                var fqnString = fqn[0] + ':' + fqn[1] + ':' + fqn[2];
                ipams.push(fqnString + '**' + nwIpamBackRefs[i]['uuid']);
            }
        }
        return ipams;
    };

    function getDNSDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                title: ctwl.TITLE_DNS_SERVER,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'fq_name[1]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'DNS Server'

                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'display_name',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Display Name'
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'uuid',
                                        templateGenerator: 'TextGenerator',
                                        label: 'UUID'
                                    },

                                    {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data[domain_name]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Domain Name'

                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data[next_virtual_DNS]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Forwarder'
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data[default_ttl_seconds]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Time To Live',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "DnsTtlFormatter"
                                        }
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data[record_order]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Record Resolution Order',
                                        templateGeneratorConfig: {
                                            formatter: "RecordResolutionFormatter"
                                        }
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data[floating_ip_record]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Floating IP Record'
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data.external_visible',
                                        templateGenerator: 'TextGenerator',
                                        label: 'External Visibility',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "ExternalVisibleFormatter"
                                        }
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'virtual_DNS_data.reverse_resolution',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Reverse Resolution',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "ReverseResolutionFormatter"
                                        }
                                    }, {
                                        keyClass:'col-xs-3',
                                        valueClass:'col-xs-9',
                                        key: 'network_ipam_back_refs',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Associated IPAMs',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "DnsDomIpamsFormatter"
                                        }
                                    }
                                ]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                        }]
                    }
                }]
            }
        };
    };

    this.DnsDomIpamsFormatter = function(val, obj) {
        return dnsServersFormatters.dnsDomainIpamsFormatter("", "", val, "", obj);
    };

    this.DnsTtlFormatter = function(val, obj) {
        return dnsServersFormatters.ttlFormatter("", "", val, "", obj);
    };

    this.RecordResolutionFormatter = function(val, obj) {
       return dnsServersFormatters.recordResolutionFormatter("", "", val, "", obj);
    };

    this.ExternalVisibleFormatter = function(val, obj) {
        return dnsServersFormatters.externalVisibleFormatter("", "", val, "", obj);
    };

    this.ReverseResolutionFormatter = function(val, obj) {
        return dnsServersFormatters.reverseResolutionFormatter("", "", val, "", obj);
    };

    function getHeaderActionConfig(gridElId) {
        var headerActionConfig = [{
            "type": "link",
            "title": ctwl.TITLE_DNS_SERVER_MULTI_DELETE,
            "iconClass": 'fa fa-trash',
            "linkElementId": 'btnActionDelDNS',
            "onClick": function() {

                var checkedRows = $(gridElId).data(
                    'contrailGrid').getCheckedRows();
                if(checkedRows && checkedRows.length > 0) {
                    dnsServersModel = new DnsServersModel();
                    dnsServersEditView.model = dnsServersModel;
                    dnsServersEditView.renderDeleteDnsServer({
                        "title": ctwl.TITLE_DNS_SERVER_MULTI_DELETE,
                        checkedRows: checkedRows,
                        callback: function() {
                            var dataView =
                                $(gridElId).data(
                                    "contrailGrid")
                                ._dataView;
                            dataView.refreshData();
                        }
                    });
                }
            }
        }, {
            "type": "link",
            "title": ctwl.TITLE_CREATE_DNS_SERVER,
            "iconClass": "fa fa-plus",
            "onClick": function() {
                var gridData =
                    $(gridElId).data('contrailGrid')._dataView
                    .getItems();
                var configData = $(gridElId).data(
                    'configObj');

                var dnsServersModel = new DnsServersModel();
                dnsServersEditView.model = dnsServersModel;
                dnsServersEditView.renderAddEditDNSServer({
                    "title": ctwl.CREATE,
                    gridData: gridData,
                    configData: configData,
                    callback: function() {
                        var dataView = $(gridElId).data("contrailGrid")
                            ._dataView;
                        dataView.refreshData();
                    },
                    'mode': ctwl.CREATE_ACTION
                });
            }
        }];
        return headerActionConfig;
    }
    return dnsServersGridView;
});