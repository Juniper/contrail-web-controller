/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/ipam/ui/js/models/ipamCfgModel',
    'config/networking/ipam/ui/js/views/ipamCfgEditView',
    'config/networking/ipam/ui/js/views/ipamCfgFormatters'],
    function (_, ContrailView,
        IpamCfgModel, IpamCfgEditView, IpamCfgFormatters) {
    var formatipamCfg = new IpamCfgFormatters();
    var dataView;

    var ipamCfgEditView = new IpamCfgEditView();

    var ipamCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getIpamCfgGridViewConfig());
        }
    });


    var getIpamCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_IPAM_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_IPAM_GRID_ID,
                                title: ctwl.CFG_IPAM_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };


    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CFG_IPAM_TITLE
                },
                advanceControls: isVCenter() ? [] : getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkIpamDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkIpamDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getIpamCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    empty: {
                        type: 'status',
                        iconClasses: '',
                        text: 'No IPAMs Found.'
                    }
                }
            },
            columnHeader: {
                //Change these once the ajax url is changed
                columns: [
                     {
                         field:  'name',
                         name:   'IPAM'
                     },
                     {
                         field:  'virtual_network_back_refs',
                         name:   'IP Blocks',
                         formatter: formatipamCfg.IPBlockFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         },
                     },
                     {
                         field:  'network_ipam_mgmt',
                         name:   'DNS Server',
                         formatter: formatipamCfg.dnsModeFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         },
                     },
                     {
                         field:  'network_ipam_mgmt',
                         name:   'NTP Server',
                         formatter: formatipamCfg.dnsNTPFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         },
                     }
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_IPAM_TITLE_DELETE,
                "iconClass": "icon-trash",
                "linkElementId": "linkIpamDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_IPAM_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    ipamCfgEditView.model = new IpamCfgModel();
                    ipamCfgEditView.renderMultiDeleteIpamCfg({"title":
                                                            ctwl.CFG_IPAM_TITLE_MULTI_DELETE,
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_IPAM_TITLE_CREATE,
                "iconClass": "icon-plus",
                "onClick": function () {
                    ipamCfgEditView.model = new IpamCfgModel();

                    ipamCfgEditView.renderAddIpamCfg({
                                              "title": ctwl.CFG_IPAM_TITLE_CREATE,
                                              callback: function () {
                    $('#' + ctwl.CFG_IPAM_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_IPAM_GRID_ID).data("contrailGrid")._dataView;
            ipamCfgEditView.model = new IpamCfgModel(dataView.getItem(rowIndex));
            ipamCfgEditView.renderEditIpamCfg({
                                  "title": ctwl.CFG_IPAM_TITLE_EDIT,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })];

        if (!isVCenter()) {
            rowActionConfig.push(
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                dataView = $('#' + ctwl.CFG_IPAM_GRID_ID).data("contrailGrid")._dataView;
                ipamCfgEditView.model = new IpamCfgModel();
                ipamCfgEditView.renderMultiDeleteIpamCfg({
                                      "title": ctwl.CFG_IPAM_TITLE_DELETE,
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                }});
            }));
        }

    function getIpamCfgDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        //Change  once the AJAX call is corrected
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.CFG_IPAM_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                               {
                                                    label: 'Name',
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Display Name',
                                                    key: 'display_name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                               //Following two need custom formatters
                                                {
                                                    label: 'DNS Method',
                                                    key: 'network_ipam_mgmt.ipam_dns_method',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'dnsModeFormatter'
                                                    }
                                                },
                                                {
                                                    label: 'NTP Server',
                                                    key: 'network_ipam_mgmt.dhcp_option_list.dhcp_option',
                                                    templateGeneratorConfig: {
                                                        formatter: 'dnsNTPFormatter'
                                                    },
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Domain Name',
                                                    key: 'network_ipam_mgmt.dhcp_option_list.dhcp_option',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'dnsDomainFormatter'
                                                    }
                                                },
                                                {
                                                    label: 'IP Blocks',
                                                    key: 'virtual_network_back_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'IPBlockFormatter'
                                                    }
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.dnsModeFormatter = function (v, dc) {
        return formatipamCfg.dnsModeFormatter(null,
                                    null, null, null, dc);
    }

    this.dnsDomainFormatter = function (v, dc) {
        return formatipamCfg.dnsDomainFormatter(null,
                                    null, null, null, dc);
    }
    this.dnsNTPFormatter = function (v, dc) {
        return formatipamCfg.dnsNTPFormatter(null,
                                    null, null, null, dc);
    }
    this.IPBlockFormatter = function (v, dc) {
        return formatipamCfg.IPBlockFormatter(null,
                                    null, null, -1, dc);
    }
    return ipamCfgGridView;
});
