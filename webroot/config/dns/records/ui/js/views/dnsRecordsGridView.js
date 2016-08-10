/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/dns/records/ui/js/models/dnsRecordsModel',
    'config/dns/records/ui/js/views/dnsRecordsEditView',
    'config/dns/records/ui/js/dnsRecordsFormatter'
], function(_, ContrailView, DnsRecordsModel, DnsRecordsEditView,
    dnsRecordFormatters) {
    var dnsRecordsEditView = new DnsRecordsEditView(),
        gridElId = "#" + ctwc.DNS_RECORDS_GRID_ID;
    var dnsRecordFormatters = new dnsRecordFormatters();

    var dnsRecordsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            this.renderView4Config(self.$el, self.model,
                getDnsRecordsGridViewConfig(
                    viewConfig));
        }
    });

    var getDnsRecordsGridViewConfig = function(viewConfig) {
        return {
            elementId: ctwc.CONFIG_DNS_RECORDS_ID,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: ctwc.DNS_RECORDS_GRID_ID,
                        title: ctwl.TITLE_DNS_RECORDS,
                        view: "GridView",
                        viewConfig: {
                            elementConfig: getConfiguration(
                                viewConfig)
                        }
                    }]
                }]
            }
        }
    };

    function rowActionConfig(viewConfig) {
        var rowActConfig = [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(
                        rowIndex);

                dnsRecordsModel = new DnsRecordsModel(dataItem);
                dnsRecordsModel.dnsServerData = viewConfig.dnsServerData;
                subscribeModelAttrChanges(dnsRecordsModel);
                dnsRecordsEditView.model = dnsRecordsModel;
                dnsRecordsEditView.renderAddEditDnsRecords({
                    "title": ctwl.EDIT,
                    callback: function() {
                        var dataView =
                            $(gridElId).data(
                                "contrailGrid")._dataView;
                        dataView.refreshData();
                    },
                    mode : ctwl.EDIT_ACTION
                });
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                var dnsRecordsModel = new DnsRecordsModel();
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(
                        rowIndex);
                var checkedRows = [dataItem];
                dnsRecordsEditView.model = dnsRecordsModel;
                dnsRecordsEditView.renderDeleteDnsRecords({
                    "title": ctwl.TITLE_DEL_DNS_RECORD +
                        ' (' + dataItem[
                            'virtual_DNS_record_data'][
                            'record_name'
                        ] + ')',
                    checkedRows: checkedRows,
                    callback: function() {
                        var dataView =
                            $(gridElId).data(
                                "contrailGrid")._dataView;
                        dataView.refreshData();
                    }
                });
            })
        ];
        return rowActConfig;
    };
    var getConfiguration = function(viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_DNS_RECORDS
                },
                advanceControls: getHeaderActionConfig(viewConfig)
            },
            body: {
                options: {
                    actionCell: rowActionConfig(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                            getDNSRecordsDetailsTemplateConfig(),
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
                        text: 'Loading DNS Records..'
                    },
                    empty: {
                        text: 'No DNS Records Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting DNS Records.'
                    }
                }
            },
            columnHeader: {
                columns: DnsRecordsColumns
            }
        };
        return gridElementConfig;
    };

    var DnsRecordsColumns = [

        {
            name: 'DNS Record Name',
            formatter: function(row, col, val, d, rowData) {
                var domain = getValueByJsonPath(rowData,
                    'virtual_DNS_record_data;record_name',
                    "-");
                return domain;
            }
        }, {
            name: 'DNS Record Type',
            formatter: dnsRecordFormatters.recordTypeFormatter


        }, {
            name: 'DNS Record Data',
            formatter: function(row, col, val, d, rowData) {
                var fwer = getValueByJsonPath(rowData,
                    'virtual_DNS_record_data;record_data',
                    "-");
                return fwer;
            }
        }

    ];

    function getDNSRecordsDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-6',
                            rows: [{
                                title: "DNS Records",
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'virtual_DNS_record_data[record_name]',
                                    label: 'DNS Record Name',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'uuid',
                                    label: 'UUID',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'virtual_DNS_record_data[record_type]',
                                    label: 'DNS Record Type',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: "RecordTypeFormatter"
                                    }
                                }, {
                                    key: 'virtual_DNS_record_data[record_data]',
                                    label: 'DNS Record Data',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'virtual_DNS_record_data[record_ttl_seconds]',
                                    label: 'Time To Live',
                                    templateGenerator: 'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter: "TTLFormatter"
                                    }
                                }, {
                                    key: 'virtual_DNS_record_data[record_class]',
                                    label: 'DNS Record Class',
                                    templateGenerator: 'TextGenerator'
                                }, {
                                    key: 'virtual_DNS_record_data[record_mx_preference]',
                                    label: 'MX Preference',
                                    templateGenerator: 'TextGenerator'
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails()]
                        }]
                    }
                }]
            }
        };
    };

    function subscribeModelAttrChanges(model) {
        model.__kb.view_model.model().on('change:user_created_record_type',
            function(recordModel, recordType){
                switch(recordType){
                    case 'A' :
                        model.record_name_label("Host Name");
                        model.record_name_placeholder("Host Name to be resolved");
                        model.record_data_label("IPv4 Address");
                        model.record_data_placeholder("Enter an IPv4 Address");
                        break;
                    case 'AAAA' :
                        model.record_name_label("Host Name");
                        model.record_name_placeholder("Host Name to be resolved");
                        model.record_data_label("IPv6 Address");
                        model.record_data_placeholder("Enter an IPv6 Address");
                        break;
                    case 'CNAME' :
                        model.record_name_label("Host Name");
                        model.record_name_placeholder("Host Name");
                        model.record_data_label("Canonical Name");
                        model.record_data_placeholder("Enter Canonical Name");
                        break;
                    case 'PTR' :
                        model.record_name_label("IP Address");
                        model.record_name_placeholder("Enter an IP Address");
                        model.record_data_label("Host Name");
                        model.record_data_placeholder("Host Name");
                        break;
                    case 'NS' :
                        model.record_name_label("Sub Domain");
                        model.record_name_placeholder("Enter a Sub Domain");
                        break;
                    case 'MX' :
                        model.record_name_label("Domain");
                        model.record_name_placeholder("Enter a Domain");
                        model.record_data_label("Host Name");
                        model.record_data_placeholder("Enter Host Name");
                        break;
                };
            }
        );
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [{
            "type": "link",
            "title": ctwl.TITLE_DNS_RECORD_MULTI_DELETE,
            "iconClass": 'fa fa-trash',
            "linkElementId": 'btnActionDelDNS',
            "onClick": function() {

                var checkedRows = $(gridElId).data(
                    'contrailGrid').getCheckedRows();
                if(checkedRows && checkedRows.length > 0) {
                    dnsRecordsModel = new DnsRecordsModel();
                    dnsRecordsEditView.model = dnsRecordsModel;
                    dnsRecordsEditView.renderDeleteDnsRecords({
                        "title": ctwl.TITLE_DNS_RECORD_MULTI_DELETE,
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
            "title": ctwl.TITLE_CREATE_DNS_RECORD,
            "iconClass": "fa fa-plus",
            "onClick": function() {
                var dnsRecordsModel = new DnsRecordsModel();
                dnsRecordsModel.dnsServerData = viewConfig.dnsServerData;
                subscribeModelAttrChanges(dnsRecordsModel);
                dnsRecordsEditView.model = dnsRecordsModel;
                dnsRecordsEditView.renderAddEditDnsRecords({
                    "title": ctwl.CREATE,
                    callback: function() {
                        var dataView = $(
                                gridElId).data(
                                "contrailGrid")
                            ._dataView;
                        dataView.refreshData();
                    },
                    mode : ctwl.CREATE_ACTION
                });
            }
        }, ];
        return headerActionConfig;
    };

    this.RecordTypeFormatter = function(v, dc) {
        return dnsRecordFormatters.recordTypeFormatter("", "", v,
            "", dc);
    };

    this.TTLFormatter = function(v, dc) {
        return dnsRecordFormatters.ttlFormatter("", "", v, "", dc);
    };

    return dnsRecordsGridView;
});