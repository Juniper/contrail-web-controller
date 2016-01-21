/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/networks/ui/js/models/vnCfgModel',
    'config/networking/networks/ui/js/views/vnCfgEditView',
    'config/networking/networks/ui/js/views/vnCfgFormatters'],
    function (_, ContrailView,
        VNCfgModel, VNCfgEditView, VNCfgFormatters) {
    var formatVNCfg = new VNCfgFormatters();
    var dataView;

    var vnCfgEditView = new VNCfgEditView();

    var vnCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getVNCfgGridViewConfig());
        }
    });


    var getVNCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VN_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VN_GRID_ID,
                                title: ctwl.CFG_VN_TITLE,
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
                    text: ctwl.CFG_VN_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkVNDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkVNDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell: function(dc) {
                        var isShared = getValueByJsonPath(dc,
                                            'is_shared', false);
                        var domain  = contrail.getCookie(cowc.COOKIE_DOMAIN);
                        var project = contrail.getCookie(cowc.COOKIE_PROJECT);
                        var fqName  = getValueByJsonPath(dc, 'fq_name', []);

                        if ((fqName.length == 3 &&
                            (fqName[1] != project || 
                             fqName[0] != domain)) && isShared) {
                            return [];
                        } else {
                            return rowActionConfig;
                        }
                    },
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getVNCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    empty: {
                        type: 'status',
                        iconClasses: '',
                        text: 'No Networks Found.'
                    }
                }
            },
            columnHeader: {
                //Change these once the ajax url is changed
                columns: [
                     {
                         field:  'display_name',
                         name:   'Network'
                     },
                     {
                         field:  'network_ipam_refs',
                         name:   'Subnets',
                         formatter: formatVNCfg.IPBlockFormatter
                     },
                     {
                         field:  'network_policy_refs',
                         name:   'Attached Policies',
                         formatter: formatVNCfg.polColFormatter
                     },
                     {
                         field:  'is_shared',
                         name:   'Shared',
                         formatter: formatVNCfg.sharedFormatter
                     },
                     {
                         field:  'id_perms.enable',
                         name:   'Admin State',
                         formatter: formatVNCfg.adminStateFormatter
                     }
                ]
            },
        };
        return gridElementConfig;
    };


    function subscribeModelChangeEvents (vnModel) {
        vnModel.__kb.view_model.model().on('change:router_external',
            function(backBoneModel, value) {
                vnModel.externalRouterHandler(value);
        });
    };


    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_VN_TITLE_DELETE,
                "iconClass": "icon-trash",
                "linkElementId": "linkVNDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_VN_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    vnCfgEditView.model = new VNCfgModel();
                    vnCfgEditView.renderMultiDeleteVNCfg({"title":
                                                            ctwl.CFG_VN_TITLE_MULTI_DELETE,
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_VN_TITLE_CREATE,
                "iconClass": "icon-plus",
                "onClick": function () {
                    var vnModel = new VNCfgModel();
                    vnCfgEditView.model = vnModel;
                    subscribeModelChangeEvents(vnModel);
                    vnCfgEditView.renderAddVNCfg({
                                              "title": ctwl.CFG_VN_TITLE_CREATE,
                                              callback: function () {
                    $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView;
            var vnModel = new VNCfgModel(dataView.getItem(rowIndex));
            vnCfgEditView.model = vnModel;
            subscribeModelChangeEvents(vnModel);
            vnCfgEditView.renderEditVNCfg({
                                  "title": ctwl.CFG_VN_TITLE_EDIT,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView;
            vnCfgEditView.model = new VNCfgModel();
            vnCfgEditView.renderMultiDeleteVNCfg({
                                  "title": ctwl.CFG_VN_TITLE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];


    function getVNCfgDetailsTemplateConfig() {
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
                                    class: 'span12',
                                    rows: [
                                        {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'Subnet(s)',
                                                    key: 'network_ipam_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'subnetTmplFormatter'
                                                    }
                                                },
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
                                                {
                                                    label: 'Admin State',
                                                    key: 'id_perms.enable',
                                                    templateGeneratorConfig: {
                                                        formatter: 'adminStateFormatter'
                                                    },
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Shared',
                                                    key: 'is_shared',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'sharedFormatter'
                                                    }
                                                },
                                                
                                                {
                                                    label: 'External',
                                                    key: 'router_external',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'rtrExternalFormatter'
                                                    }
                                                },
                                                {
                                                    label: 'Attached Network Policies',
                                                    key: 'network_policy_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'polColFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Floating IP Pool(s)',
                                                    key: 'floating_ip_pools',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'fipPoolTmplFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Route Target(s)',
                                                    key: 'route_target_list',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'routeTargetFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Forwarding Mode',
                                                    key: 'virtual_network_properties.forwarding_mode',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'fwdModeFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'VxLAN Identifier',
                                                    key: 'virtual_network_properties',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'vxLanIdFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Allow Transit',
                                                    key: 'virtual_network_properties',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'allowTransitFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Reverse Path Forwarding',
                                                    key: 'virtual_network_properties',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'rpfFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Flood Unknown Unicast',
                                                    key: 'flood_unknown_unicast',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'floodUnUcastFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Host Route(s)',
                                                    key: 'route_target_list',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'subnetHostRouteFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'DNS Server(s)',
                                                    key: 'network_ipam_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'subnetDNSFormatter',
                                                    }
                                                },
                                                {
                                                    label: 'Extend to Physical Router(s)',
                                                    key: 'physical_router_back_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'phyRouterFormatter',
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

    this.subnetTmplFormatter = function (v, dc) {
        return formatVNCfg.subnetTmplFormatter(null,
                                        null, null, null, dc);
    }
    this.adminStateFormatter = function (v, dc) {
        return formatVNCfg.adminStateFormatter(null,
                                        null, null, null, dc);
    }
    this.sharedFormatter = function (v, dc) {
        return formatVNCfg.sharedFormatter(null,
                                        null, null, null, dc);
    }
    this.rtrExternalFormatter = function (v, dc) {
        return formatVNCfg.rtrExternalFormatter(null,
                                        null, null, null, dc);
    }
    this.polColFormatter = function (v, dc) {
        return formatVNCfg.polColFormatter(null,
                                        null, null, -1, dc);
    }
    this.fipPoolTmplFormatter = function (v, dc) {
        return formatVNCfg.fipPoolTmplFormatter(null,
                                        null, null, null, dc);
    }
    this.routeTargetFormatter = function (v, dc) {
        return formatVNCfg.routeTargetFormatter(null,
                                        null, null, null, dc);
    }
    this.subnetHostRouteFormatter = function (v, dc) {
        return formatVNCfg.subnetHostRouteFormatter(null,
                                        null, null, null, dc);
    }
    this.fwdModeFormatter = function (v, dc) {
        return formatVNCfg.fwdModeFormatter(null,
                                        null, null, null, dc);
    }
    this.vxLanIdFormatter = function (v, dc) {
        return formatVNCfg.vxLanIdFormatter(null,
                                        null, null, null, dc);
    }
    this.allowTransitFormatter = function (v, dc) {
        return formatVNCfg.allowTransitFormatter(null,
                                        null, null, null, dc);
    }
    this.rpfFormatter = function (v, dc) {
        return formatVNCfg.rpfFormatter(null,
                                        null, null, null, dc);
    }
    this.floodUnUcastFormatter = function (v, dc) {
        return formatVNCfg.floodUnUcastFormatter(null,
                                        null, null, null, dc);
    }
    this.subnetDNSFormatter = function (v, dc) {
        return formatVNCfg.subnetDNSFormatter(null,
                                        null, null, null, dc);
    }
    this.phyRouterFormatter = function (v, dc) {
        return formatVNCfg.phyRouterFormatter(null,
                                        null, null, null, dc);
    }
    return vnCfgGridView;
});
