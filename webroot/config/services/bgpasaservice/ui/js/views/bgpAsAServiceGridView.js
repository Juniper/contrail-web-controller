/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/bgpasaservice/ui/js/models/bgpAsAServiceModel',
    'config/services/bgpasaservice/ui/js/views/bgpAsAServiceEditView',
    'config/services/bgpasaservice/ui/js/bgpAsAServiceFormatter'
], function(_, ContrailView,BGPAsAServiceModel,
    BGPAsAServiceEditView, BGPAsAServiceFomatter) {
    var gridElId = '#' + ctwc.BGP_AS_A_SERVICE_GRID_ID;
    var bgpAsAServiceEditView = new BGPAsAServiceEditView();
    var bgpAsAServiceFormatter = new BGPAsAServiceFomatter();
    var bgpAsAServiceGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            bgpAsAServiceEditView.currentProjectUUID =
                viewConfig.currentProjectUUID;
            self.renderView4Config(self.$el, self.model,
                getBGPAsAServiceGridViewConfig(pagerOptions));
        }
    });

    var getBGPAsAServiceGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.CONFIG_BGP_AS_A_SERVICE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.BGP_AS_A_SERVICE_GRID_ID,
                                title: ctwl.TITLE_BGP_AS_A_SERVICE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    function subscribeModelChangeEvents(bgpaasModel) {
        bgpaasModel.disableAuthKey = ko.computed((function(){
            var disable;
            if(this.user_created_auth_key_type() === 'none') {
                this.user_created_auth_key('');
                disable = true;
            } else {
                var authKey = '';
                if(this.bgpaas_session_attributes().auth_data != null) {
                    var authData = this.bgpaas_session_attributes().auth_data;
                    authKey = authData.key_items != null &&
                        authData.key_items.length > 0 ?
                        authData.key_items[0].key : '';
                }
                this.user_created_auth_key(authKey);
                disable = false;
            }
            return disable;
        }), bgpaasModel);
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_BGP_AS_A_SERVICE
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteBGPAsAService').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteBGPAsAService').removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig(),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getBGPAsAServiceDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading BGP as a Service..'
                    },
                    empty: {
                        text: 'No BGP as a Service Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    field: "name",
                    name: "Name",
                    sortable: {
                        sortBy: 'formattedValue'
                    },
                    minWidth: 200
                },
                {
                    field: "bgpaas_ip_address",
                    name: "IP Address",
                    sortable: {
                        sortBy: 'formattedValue'
                    },
                    minWidth: 200,
                    formatter: bgpAsAServiceFormatter.ipAddressFormatter
                },                {
                    field: "virtual_machine_interface_refs",
                    name: "Virtual Machine Interface(s)",
                    sortable: {
                        sortBy: 'formattedValue'
                    },
                    minWidth: 400,
                    formatter: bgpAsAServiceFormatter.vmiFormatter
                }]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $(gridElId).data("contrailGrid").
                        _dataView.getItem(rowIndex);
                var bgpAsAServiceModel = new BGPAsAServiceModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_BGP_AS_A_SERVICE +
                        ' ('+ dataItem['name'] +')';

                bgpAsAServiceEditView.model = bgpAsAServiceModel;
                /*subscribeModelChangeEvents(bgpAsAServiceModel);*/
                bgpAsAServiceEditView.renderAddEditBGPAsAService(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
                        callback: function () {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    }
                );
            }, "Edit"),
          ctwgc.getDeleteAction(function (rowIndex) {
              var dataItem = $(gridElId).data("contrailGrid").
                  _dataView.getItem(rowIndex),
                  bgpAsAServiceModel = new BGPAsAServiceModel(dataItem),
                  checkedRow = [dataItem];

              bgpAsAServiceEditView.model = bgpAsAServiceModel;
              bgpAsAServiceEditView.renderDeleteBGPAsAService(
                  {"title": ctwl.TITLE_BGP_AS_A_SERVICE_DELETE,
                      checkedRows: checkedRow,
                      callback: function () {
                          var dataView =
                              $(gridElId).data("contrailGrid")._dataView;
                          dataView.refreshData();
                      }
                  }
              );
        })];
        return rowActionConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig;
	        var headerActionConfig = [
	            {
                    "type" : "link",
	                "title" : ctwl.TITLE_BGP_AS_A_SERVICE_MULTI_DELETE,
	                "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteBGPAsAService',
	                "onClick" : function() {
	                    var bgpAsAServiceModel = new BGPAsAServiceModel();
	                    var checkedRows =
	                        $(gridElId).data("contrailGrid").
	                        getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
	                        bgpAsAServiceEditView.model = bgpAsAServiceModel;
	                        bgpAsAServiceEditView.renderDeleteBGPAsAService(
	                            {"title": ctwl.TITLE_BGP_AS_A_SERVICE_MULTI_DELETE,
	                                checkedRows: checkedRows,
	                                callback: function () {
	                                    var dataView =
	                                        $(gridElId).
	                                        data("contrailGrid")._dataView;
	                                    dataView.refreshData();
	                                }
	                            }
	                        );
                        }
	                }
	            },
	            {
	                "type" : "link",
	                "title" : ctwl.TITLE_ADD_BGP_AS_A_SERVICE,
	                "iconClass" : "fa fa-plus",
	                "onClick" : function() {
	                    var bgpAsAServiceModel = new BGPAsAServiceModel();
	                    bgpAsAServiceEditView.model = bgpAsAServiceModel;
                        /*subscribeModelChangeEvents(bgpAsAServiceModel);*/
	                    bgpAsAServiceEditView.renderAddEditBGPAsAService(
	                        {"title": ctwl.CREATE,
	                            callback: function () {
	                                var dataView =
	                                    $(gridElId).
	                                    data("contrailGrid")._dataView;
	                                dataView.refreshData();
	                            },
	                            mode : ctwl.CREATE_ACTION
	                        }
	                    );
	                }
	            }
	        ];

        return headerActionConfig;
    };

    function getBGPAsAServiceDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                keyClass:'col-xs-3',
                                valueClass:'col-xs-9',
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    key: 'name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'display_name',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Display Name'
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "autonomous_system",
                                    templateGenerator: "TextGenerator",
                                    label: "Autonomous System"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "virtual_machine_interface_refs",
                                    templateGenerator: "TextGenerator",
                                    label: "Virtual Machine Interface(s)",
                                    templateGeneratorConfig: {
                                        formatter: "VMIFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_ip_address",
                                    templateGenerator: "TextGenerator",
                                    label: "IP Address",
                                    templateGeneratorConfig: {
                                        formatter: "IPAddressFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "service_health_check_refs",
                                    templateGenerator: "TextGenerator",
                                    label: "BFD Service Health Check",
                                    templateGeneratorConfig: {
                                        formatter: "serviceHealthCheckFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.route_origin_override",
                                    templateGenerator: "TextGenerator",
                                    label: "Route Origin Override",
                                    templateGeneratorConfig: {
                                        formatter: "originOverrideFormatter"
                                    }
                                },{
                                    key: "bgpaas_session_attributes.address_families",
                                    templateGenerator: "TextGenerator",
                                    label: "Address Family",
                                    templateGeneratorConfig: {
                                        formatter: "AddressFamiliesFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.hold_time",
                                    templateGenerator: "TextGenerator",
                                    label: "Hold Time",
                                    templateGeneratorConfig: {
                                        formatter: "HoldTimeFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.loop_count",
                                    templateGenerator: "TextGenerator",
                                    label: "Loop Count",
                                    templateGeneratorConfig: {
                                        formatter: "LoopCountFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.local_autonomous_system",
                                    templateGenerator: "TextGenerator",
                                    label: "Local ASN",
                                    templateGeneratorConfig: {
                                        formatter: "LocalASNFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'bgpaas_session_attributes.admin_down',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Admin State',
                                    templateGeneratorConfig: {
                                        formatter: "AdminStateFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'bgpaas_shared',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Shared',
                                    templateGeneratorConfig: {
                                        formatter: "bgpAsaSharedFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'bgpaas_session_attributes.as_override',
                                    templateGenerator: 'TextGenerator',
                                    label: 'AS Override',
                                    templateGeneratorConfig: {
                                        formatter: "ASOverrideFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.passive",
                                    templateGenerator: "TextGenerator",
                                    label: "Passive",
                                    templateGeneratorConfig: {
                                        formatter: "PassiveFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'bgpaas_ipv4_mapped_ipv6_nexthop',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Use IPv4-mapped IPv6 Nexthop',
                                    templateGeneratorConfig: {
                                        formatter: "IPv4MappedIPv6NexthopFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: 'bgpaas_suppress_route_advertisement',
                                    templateGenerator: 'TextGenerator',
                                    label: 'Suppress Route Advertisement',
                                    templateGeneratorConfig: {
                                        formatter: "SuppressRouteAdvtFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "bgpaas_session_attributes.auth_data",
                                    templateGenerator: "TextGenerator",
                                    label: "Authentication Mode",
                                    templateGeneratorConfig: {
                                        formatter: "AuthModeFormatter"
                                    }
                                },{
                                    key: "bgpaas_session_attributes.family_attributes",
                                    templateGenerator: "TextGenerator",
                                    label: "Address Family Attributes",
                                    templateGeneratorConfig: {
                                        formatter: "FamilyAttrsFormatter"
                                    }
                                }]
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails('col-xs-3')]
                        }]
                    }
                }]
            }
        };
    };


    this.IPAddressFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.ipAddressFormatter("", "", v, "", dc);
    };
    this.originOverrideFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.originOverrideFormatter("", "", v, "", dc);
    };
    this.VMIFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.vmiFormatter("", "", v, "", dc);
    };
    this.serviceHealthCheckFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.serviceHealthCheckFormatter("", "", v, "", dc);
    };
    this.AdminStateFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.adminStateFormatter("", "", v, "", dc);
    };
    this.bgpAsaSharedFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.
              bgpassAsaSharedFormatter("", "", v, "", dc);
    };
    this.ASOverrideFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.
            bgpaasASOverrideFormatter("", "", v, "", dc);
    };
    this.PassiveFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.passiveFormatter("", "", v, "", dc);
    };
    this.HoldTimeFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.holdTimeFormatter("", "", v, "", dc);
    };
    this.LoopCountFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.loopCountFormatter("", "", v, "", dc);
    };
    this.LocalASNFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.localASNFormatter("", "", v, "", dc);
    };
    this.IPv4MappedIPv6NexthopFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.
            ipV4MappedIPv6NexthopFormatter("", "", v, "", dc);
    };
    this.SuppressRouteAdvtFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.
            suppressRouteAdvtFormatter("", "", v, "", dc);
    };
    this.AddressFamiliesFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.addressFamiliesFormatter("", "", v, "", dc);
    };
    this.AuthModeFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.authModeFormatter("", "", v, "", dc);
    };
    this.FamilyAttrsFormatter = function(v, dc) {
        return bgpAsAServiceFormatter.familyAttrsFormatter("", "", v, "", dc);
    };
    return bgpAsAServiceGridView;
});

