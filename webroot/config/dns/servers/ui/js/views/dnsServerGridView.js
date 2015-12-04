/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/dns/servers/ui/js/models/dnsServerModel',
    'config/dns/servers/ui/js/views/dnsServerEditView'
], function(_, ContrailView, DnsServerModel, DnsServerEditView) {
    var DnsServerEditView = new DnsServerEditView(),
        gridElId = "#DnsServerGrid";

    var DnsServerGridView = ContrailView.extend({
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
            elementId: "DnsServerListView",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'DnsServerGrid',
                        title: 'DNS Servers',
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
            dnsServerModel = new DnsServerModel(dataItem);
            DnsServerEditView.model = dnsServerModel;
            DnsServerEditView.renderEditDnsServer({
                "title": ctwl.TITLE_EDIT_DNS_SERVER +
                    ' (' + dataItem['display_name'] +
                    ')',
                callback: function() {
                    var dataView =
                        $(gridElId).data(
                            "contrailGrid")._dataView;
                    dataView.refreshData();
                },
                'mode': 'Edit'
            });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dnsServerModel = new DnsServerModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(
                    rowIndex);
            var checkedRows = [dataItem];
            DnsServerEditView.model = dnsServerModel;
            DnsServerEditView.renderDeleteDnsServer({
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
                dataSource: {}
            },
            columnHeader: {
                columns: DnsServerColumns
            }
        };
        return gridElementConfig;
    };

    DnsServerColumns = [{
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
            formatter: function(row, col, val, d, rowData) {
                var domain = getValueByJsonPath(rowData,
                    'virtual_DNS_data;domain_name', "-");
                return domain;
            }
        }, {
            name: 'Forwarders',
            formatter: function(row, col, val, d, rowData) {
                var fwer = getValueByJsonPath(rowData,
                    'virtual_DNS_data;next_virtual_DNS',
                    "-");
                return fwer;
            }
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
    }

    function getDNSDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'span6',
                            rows: [{
                                title: "DNS Servers",
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                        key: 'fq_name[1]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'DNS Server'

                                    }, {
                                        key: 'display_name',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Display Name'
                                    }, {
                                        key: 'uuid',
                                        templateGenerator: 'TextGenerator',
                                        label: 'UUID'
                                    },

                                    {
                                        key: 'virtual_DNS_data[domain_name]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Domain Name'

                                    }, {
                                        key: 'virtual_DNS_data[next_virtual_DNS]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Forwarder'
                                    }, {
                                        key: 'virtual_DNS_data[default_ttl_seconds]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Time To Live',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "DnsTtlFormatter"
                                        }
                                    }, {
                                        key: 'virtual_DNS_data[record_order]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Record Resolution Order',
                                        templateGeneratorConfig: {
                                            formatter: "RecordResolutionFormatter"
                                        }
                                    }, {
                                        key: 'virtual_DNS_data[floating_ip_record]',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Floating IP Record'
                                    }, {
                                        key: 'virtual_DNS_data.external_visible',
                                        templateGenerator: 'TextGenerator',
                                        label: 'External Visibility',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "ExternalVisibleFormatter"
                                        }
                                    }, {
                                        key: 'virtual_DNS_data.reverse_resolution',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Reverse Resolution',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "ReverseResolutionFormatter"
                                        }
                                    }, {
                                        key: 'network_ipam_back_refs',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Associated IPAMs',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: "DnsDomIpamsFormatter"
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    this.DnsDomIpamsFormatter = function(val, obj) {
        var nwIpams = getValueByJsonPath(obj,
            'network_ipam_back_refs', null);
        if (null == nwIpams) {
            return "-";
        }
        var dispStr = "";
        var cnt = nwIpams.length;
        var domain = getCookie('domain');
        for (var i = 0; i < cnt; i++) {
            if (domain == nwIpams[i]['to'][0]) {
                dispStr += nwIpams[i]['to'][1] + ":" + nwIpams[i][
                    'to'
                ][2];
                if (i < cnt - 1) {
                    dispStr += ", ";
                }
            }
        }
        return dispStr;
    };
    this.DnsTtlFormatter = function(val, obj) {
        return val + " (seconds)";
    };
    this.RecordResolutionFormatter = function(val, obj) {
       var retValue = '-';
       switch(val) {
           case 'random' :
               retValue = 'Random';
               break;
           case 'fixed' :
               retValue = 'Fixed';
               break;
           case 'round-robin' :
               retValue = 'Round-Robin';
               break;
       }
       return retValue;
    };
    this.ExternalVisibleFormatter = function(val, obj) {
        return val === 'true' ? 'Enabled' : 'Disabled';
    };
    this.ReverseResolutionFormatter = function(val, obj) {
        return val === 'true' ? 'Enabled' : 'Disabled';
    };
    function getHeaderActionConfig(gridElId) {
        var headerActionConfig = [{
            "type": "link",
            "title": ctwl.TITLE_DEL_DNS_SERVER,
            "iconClass": 'icon-trash',
            "linkElementId": 'btnActionDelDNS',
            "onClick": function() {

                var checkedRows = $(gridElId).data(
                    'contrailGrid').getCheckedRows();
                if(checkedRows && checkedRows.length > 0) {
                    dnsServerModel = new DnsServerModel();
                    DnsServerEditView.model = dnsServerModel;
                    DnsServerEditView.renderDeleteDnsServer({
                        "title": ctwl.TITLE_DEL_DNS_SERVER,
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
            "iconClass": "icon-plus",
            "onClick": function() {
                var gridData =
                    $(gridElId).data('contrailGrid')._dataView
                    .getItems();
                var configData = $(gridElId).data(
                    'configObj');

                var dnsServerModel = new DnsServerModel();
                DnsServerEditView.model = dnsServerModel;
                DnsServerEditView.renderAddDnsServer({
                    "title": ctwl.TITLE_CREATE_DNS_SERVER,
                    gridData: gridData,
                    configData: configData,
                    callback: function() {
                        var dataView = $(
                                gridElId).data(
                                "contrailGrid")
                            ._dataView;
                        dataView.refreshData();
                    },
                    'mode': 'Create'
                });
            }
        }, ];
        return headerActionConfig;
    }

    return DnsServerGridView;
});