/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/bgp/ui/js/models/bgpModel',
    'config/infra/bgp/ui/js/views/bgpEditView',
    'config/infra/bgp/ui/js/bgpFormatters'
], function (_, ContrailView, BGPModel, BGPEditView, BGPFormatters) {
    var bgpEditView = new BGPEditView();
    var bgpFormatters = new BGPFormatters();
    var bgpGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                getBGPGridViewConfig(pagerOptions));
        }
    });

    var getBGPGridViewConfig = function (pagerOptions) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwl.CONFIG_BGP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.BGP_GRID_ID,
                                title: ctwl.TITLE_BGP,
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

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_BGP
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteBGP').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteBGP').removeClass('disabled-link');
                        }
                    },
                    actionCell:getRowActionConfig(),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                            getBGPDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading BGP Routers..'
                    },
                    empty: {
                        text: 'No BGP Routers Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                {
                    field:"bgp_router_parameters.address",
                    name:"IP Address",
                    sortable: true,
                    sorter : comparatorIP,
                    formatter : bgpFormatters.ipAdressFormatter
                },
                {
                    field:"bgp_router_parameters.router_type",
                    name:"Router Type",
                    sortable: true,
                    formatter : bgpFormatters.routerTypeFormatter
                },
                {
                    field:"bgp_router_parameters.vendor",
                    name:"Vendor",
                    sortable: true,
                    formatter : bgpFormatters.vendorFormatter
                },
                {
                    field:"name",
                    name:"Host Name",
                    sortable: true
                }]
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var dataItem =
                    $('#' + ctwl.BGP_GRID_ID).data("contrailGrid").
                        _dataView.getItem(rowIndex);
                var bgpModel = new BGPModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_BGP +
                        ' ('+ dataItem['name'] +')';

                bgpEditView.model = bgpModel;
                bgpModel.editView = bgpEditView;
                subscribeModelChangeEvents(bgpModel);
                bgpModel.bgpData = $('#' + ctwl.BGP_GRID_ID).
	                data("contrailGrid")._dataView.getItems();
                bgpEditView.renderAddEditBGP(
                    {"title": ctwl.EDIT, checkedRow: checkedRow,
                        callback: function () {
                            var dataView =
                                $('#' + ctwl.BGP_GRID_ID).
                                data("contrailGrid")._dataView;
                            dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION
                    }
                );
            }, "Edit"),
          ctwgc.getDeleteAction(function (rowIndex) {
              var dataItem =
                  $('#' + ctwl.BGP_GRID_ID).data("contrailGrid").
                  _dataView.getItem(rowIndex),
                  bgpModel = new BGPModel(dataItem),
                  checkedRow = [dataItem];

              bgpEditView.model = bgpModel;
              bgpEditView.renderDeleteBGPRouters(
                  {"title": ctwl.TITLE_BGP_DELETE, checkedRows: checkedRow,
                      callback: function () {
                          var dataView =
                              $('#' + ctwl.BGP_GRID_ID).
                              data("contrailGrid")._dataView;
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
	                "title" : ctwl.TITLE_BGP_MULTI_DELETE,
	                "iconClass": 'fa fa-trash',
                    "linkElementId": 'btnDeleteBGP',
	                "onClick" : function() {
	                    var bgpModel = new BGPModel();
	                    var checkedRows =
	                        $('#' + ctwl.BGP_GRID_ID).data("contrailGrid").
	                        getCheckedRows();
                        if(checkedRows && checkedRows.length > 0) {
	                        bgpEditView.model = bgpModel;
	                        bgpEditView.renderDeleteBGPRouters(
	                            {"title": ctwl.TITLE_BGP_MULTI_DELETE,
	                                checkedRows: checkedRows,
	                                callback: function () {
	                                    var dataView =
	                                        $('#' + ctwl.BGP_GRID_ID).
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
	                "title" : ctwl.TITLE_ADD_BGP,
	                "iconClass" : "fa fa-plus",
	                "onClick" : function() {
	                    var bgpModel = new BGPModel();
                        subscribeModelChangeEvents(bgpModel);
	                    bgpEditView.model = bgpModel;
                        bgpModel.editView = bgpEditView;
                        bgpModel.bgpData = $('#' + ctwl.BGP_GRID_ID).
	                        data("contrailGrid")._dataView.getItems();
	                    bgpEditView.renderAddEditBGP(
	                        {"title": ctwl.CREATE,
	                            callback: function () {
	                                var dataView =
	                                    $('#' + ctwl.BGP_GRID_ID).
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

    function subscribeModelChangeEvents(bgpModel) {
        bgpModel.__kb.view_model.model().on('change:user_created_router_type',
            function(model, newValue){
                bgpModel.onRouterTypeSelectionChanged(newValue);
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_address',
            function(model, newValue){
                bgpModel.user_created_identifier(newValue);
                bgpModel.bgp_router_parameters().address = newValue;
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_identifier',
            function(model, newValue){
                bgpModel.bgp_router_parameters().identifier = newValue;
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_autonomous_system',
            function(model, newValue){
                if(newValue) {
                    bgpModel.bgp_router_parameters().autonomous_system =
                        Number(newValue);
                }
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_vendor',
            function(model, newValue){
                bgpModel.bgp_router_parameters().vendor = newValue;
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_admin_state',
            function(model, newValue){
                bgpModel.bgp_router_parameters().admin_down = !newValue;
            }
        );
        bgpModel.__kb.view_model.model().on('change:user_created_address_family',
            function(model, newValue){
                bgpModel.bgp_router_parameters().address_families.family =
                    newValue.split(',');
            }
        );
        bgpModel.disableAttr = ko.computed((function(){
            return (this.user_created_router_type() === ctwl.CONTROL_NODE_TYPE);
        }), bgpModel);
        bgpModel.showPeersSelection = ko.computed((function(){
            return (!this.isAutoMeshEnabled() ||
                this.user_created_router_type() !== ctwl.CONTROL_NODE_TYPE);
        }), bgpModel);
        bgpModel.showPhysicalRouter = ko.computed((function(){
            return (this.user_created_router_type() === ctwl.BGP_ROUTER_TYPE);
        }), bgpModel);
        bgpModel.disableAuthKey = ko.computed((function(){
            var disable;
            if(this.user_created_auth_key_type() === 'none') {
                this.user_created_auth_key('');
                disable = true;
            } else {
                var authKey = '';
                if(this.bgp_router_parameters().auth_data != null) {
                    var authData = this.bgp_router_parameters().auth_data;
                    authKey = authData.key_items != null &&
                        authData.key_items.length > 0 ?
                        authData.key_items[0].key : '';
                }
                this.user_created_auth_key(authKey);
                disable = false;
            }
            return disable;
        }), bgpModel);
    };

    function getBGPDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title: ctwl.TITLE_BGP_DETAILS,
                                            templateGenerator :
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig : [
                                                {
                                                    key : 'name',
                                                    label : 'Name',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                },
                                                {
                                                    key : 'display_name',
                                                    label : 'Display Name',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                },
                                                {
                                                    key : 'uuid',
                                                    label : 'UUID',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key : 'bgp_router_parameters.router_type',
                                                    label : 'Router Type',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                    templateGeneratorConfig : {
                                                       formatter :
                                                           "RouterTypeFormatter"
                                                    }
                                                },
                                                {
                                                    key : 'bgp_router_parameters.vendor',
                                                    label : 'Vendor',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key : 'bgp_router_parameters.address',
                                                    label : 'IP Address',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                               {
                                                    key :
                                                    'bgp_router_parameters.identifier',
                                                    label : 'Router ID',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key :
                                                    'bgp_router_parameters.autonomous_system',
                                                    label : 'Autonomous System',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key :
                                                    'bgp_router_parameters.local_autonomous_system',
                                                    label : 'BGP Router ASN',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key :
                                                    'bgp_router_parameters.address_families.family',
                                                    label : 'Address Families',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key : 'bgp_router_parameters.port',
                                                    label : 'BGP Port',
                                                    templateGenerator :
                                                        'TextGenerator'
                                                },
                                                {
                                                    key : "bgp_router_parameters.source_port",
                                                    label : "Source Port",
                                                    templateGenerator :
                                                       "TextGenerator"
                                                },
                                                {
                                                    key : 'bgp_router_parameters.hold_time',
                                                    label : 'Hold Time',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                    templateGeneratorConfig : {
                                                       formatter :
                                                           "HoldTimeFormatter"
                                                    }
                                                },
                                                {
                                                    key : "bgp_router_parameters.admin_down",
                                                    label : "Admin State",
                                                    templateGenerator :
                                                        "TextGenerator",
                                                    templateGeneratorConfig  :{
                                                        formatter : "StateFormatter"
                                                    }
                                                },
                                                {
                                                    key :
                                                    'bgp_router_parameters',
                                                    label : 'Authentication Mode',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                    templateGeneratorConfig : {
                                                       formatter :
                                                           "AuthKeyFormatter"
                                                    }
                                                },
                                                {
                                                    key :
                                                    'physical_router_back_refs',
                                                    label : 'Physical Router',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                    templateGeneratorConfig : {
                                                       formatter :
                                                           "PhysicalRouterFormatter"
                                                    }
                                                },
                                                {
                                                    key :
                                                    'bgp_router_refs',
                                                    label : 'Peer(s)',
                                                    templateGenerator :
                                                        'TextGenerator',
                                                    templateGeneratorConfig : {
                                                        formatter :
                                                            "PeersFormatter"
                                                    }
                                                }
                                            ]
                                        },
                                        //permissions
                                        ctwu.getRBACPermissionExpandDetails()
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.PeersFormatter = function(v, dc) {
        return bgpFormatters.peersFormatter("", "", v, "", dc);
    }
    this.PhysicalRouterFormatter = function(v, dc) {
        return bgpFormatters.physicalRouterFormatter("", "", v, "", dc);
    }
    this.AuthKeyFormatter = function(v, dc) {
        return bgpFormatters.authKeyFormatter("", "", v, "", dc);
    }
    this.RouterTypeFormatter = function(v, dc) {
        return bgpFormatters.routerTypeFormatter("", "", v, "", dc);
    }
    this.HoldTimeFormatter = function(v, dc) {
        return bgpFormatters.holdTimeFormatter("", "", v, "", dc);
    }
    this.StateFormatter = function(v, dc) {
        return bgpFormatters.stateFormatter("", "", v, "", dc);
    }
    return bgpGridView;
});

