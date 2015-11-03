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
    var DnsRecordsEditView = new DnsRecordsEditView(),
        gridElId = "#DnsRecordsGrid";
    var dnsRecordFormatters = new dnsRecordFormatters();

    var DnsRecordsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            this.renderView4Config(self.$el, self.model,
                getDnsRecordsGridViewConfig(
                    pagerOptions));
        }
    });

    var getDnsRecordsGridViewConfig = function(pagerOptions) {
        return {
            elementId: "DnsRecordsListView",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'DnsRecordsGrid',
                        title: 'DNS Records',
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

            dnsRecordsModel = new DnsRecordsModel(dataItem);
            showHideModelAttr(dnsRecordsModel);
            DnsRecordsEditView.model = dnsRecordsModel;
            DnsRecordsEditView.renderEditDnsRecords({
                "title": ctwl.TITLE_EDIT_DNS_RECORD +
                    ' (' + dataItem[
                        'virtual_DNS_record_data'][
                        'record_name'
                    ] +
                    ')',
                callback: function() {
                    var dataView =
                        $(gridElId).data(
                            "contrailGrid")._dataView;
                    dataView.refreshData();
                }
            });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dnsRecordsModel = new DnsRecordsModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(
                    rowIndex);
            var checkedRows = [dataItem];
            DnsRecordsEditView.model = dnsRecordsModel;
            DnsRecordsEditView.renderDeleteDnsRecords({
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

    var getConfiguration = function() {
        var gridElementConfig = {
            header: {
                title: {
                    text: "DNS Records"
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
                columns: DnsRecordsColumns
            }
        };
        return gridElementConfig;
    };

    DnsRecordsColumns = [

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
                                }]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    function showHideModelAttr(model) {
        model.hostName = ko.computed((function() {
            if (this.user_created_record_type() == 'A') {
                return true;
            }
            return false;
        }), model);
        model.reverseIPAddress = ko.computed((function() {
            if (this.user_created_record_type() == 'PTR') {
                return true;
            }
            return false;
        }), model);
        model.ipAddress = ko.computed((function() {

            if (this.user_created_record_type() == 'A') {
                return true;
            }
            return false;
        }), model);
        model.canonicalName = ko.computed((function() {
            if (this.user_created_record_type() == 'CNAME') {
                return true;
            }
            return false;
        }), model);
        model.subDomain = ko.computed((function() {
            if (this.user_created_record_type() == 'NS') {
                return true;
            }
            return false;
        }), model);
        model.dnsServ = ko.computed((function() {
            if (this.user_created_record_type() == 'NS') {
                return true;
            }
            return false;
        }), model);
    }

    function getHeaderActionConfig(gridElId) {
        var headerActionConfig = [{
            "type": "link",
            "title": ctwl.TITLE_DEL_DNS,
            "iconClass": 'icon-trash',
            "linkElementId": 'btnActionDelDNS',
            "onClick": function() {

                var checkedRows = $(gridElId).data(
                    'contrailGrid').getCheckedRows();

                dnsRecordsModel = new DnsRecordsModel();
                DnsRecordsEditView.model = dnsRecordsModel;
                DnsRecordsEditView.renderDeleteDnsRecords({
                    "title": ctwl.TITLE_DEL_DNS_RECORD,
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

                var dnsRecordsModel = new DnsRecordsModel();
                showHideModelAttr(dnsRecordsModel);
                DnsRecordsEditView.model = dnsRecordsModel;
                DnsRecordsEditView.renderAddDnsRecords({
                    "title": ctwl.TITLE_CREATE_DNS_RECORD,
                    gridData: gridData,
                    configData: configData,
                    callback: function() {
                        var dataView = $(
                                gridElId).data(
                                "contrailGrid")
                            ._dataView;
                        dataView.refreshData();
                    }
                });
            }
        }, ];
        return headerActionConfig;
    }
    this.RecordTypeFormatter = function(v, dc) {
        return dnsRecordFormatters.recordTypeFormatter("", "", v,
            "", dc);
    }
    this.TTLFormatter = function(v, dc) {
        return dnsRecordFormatters.TTLFormatter("", "", v, "", dc);
    }
    return DnsRecordsGridView;
});