/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/models/poolMemberModel',
    'config/networking/loadbalancer/ui/js/views/poolmember/poolMemberEditView'
    ],
    function (_, ContrailView, LbCfgFormatters, PoolMemberModel, PoolMemberEditView) {
    var lbCfgFormatters = new LbCfgFormatters();
    var poolMemberEditView = new PoolMemberEditView();
    var dataView;
    var poolMemberGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getPoolMemberGridViewConfig(viewConfig));
        }
    });


    var getPoolMemberGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_POOL_MEMBER_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID,
                                title: ctwc.CONFIG_LB_POOL_MEMBER_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };


    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwc.CONFIG_LB_POOL_MEMBER_TITLE
                },
                defaultControls: {
                    //columnPickable:true
                 },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    autoRefresh: false,
                    disableRowsOnLoading:true,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#poolMemberDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#poolMemberDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        noCache: true,
                        template: cowu.generateDetailTemplateHTML(
                                       getPoolMemberDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Pool Members..'
                    },
                    empty: {
                        text: 'No Pool Members Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                    {
                        id: 'display_name',
                        field: 'display_name',
                        name: 'Name',
                    },
                    {
                        field:  'uuid',
                        name:   'Description',
                        formatter: lbCfgFormatters.listenerDescriptionFormatter,
                        sortable: {
                           sortBy: 'formattedValue'
                        }
                    },
                    {
                         field:  'uuid',
                         name:   'Port',
                         formatter: lbCfgFormatters.poolMemberPortFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Address',
                         formatter: lbCfgFormatters.poolMemberAddressFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Weight',
                         formatter: lbCfgFormatters.poolMemberWeightFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Admin State',
                         formatter: lbCfgFormatters.poolMemberAdminStateFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     }
                ]
            },
        };
        return gridElementConfig
    };

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Delete Pool Members',
                "iconClass": "fa fa-trash",
                "linkElementId": "poolMemberDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    poolMemberEditView.model = new PoolMemberModel();
                    poolMemberEditView.renderMultiDeletePoolMember({"title": 'Delete pool Members',
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": 'Create Pool Member',
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    poolMemberEditView.model = new PoolMemberModel();
                    poolMemberEditView.renderAddPoolMember({
                                              "title": 'Create Pool Member',
                                              'projectId': viewConfig.projectId,
                                               'poolId': viewConfig.poolId,
                                              callback: function () {
                    $('#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    function  getRowActionConfig (viewConfig) {
        rowActionConfig = [
            ctwgc.getEditConfig('Edit Pool Member', function(rowIndex) {
                dataView = $('#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID).data("contrailGrid")._dataView;
                poolMemberEditView.model = new PoolMemberModel(dataView.getItem(rowIndex));
                poolMemberEditView.renderEditPoolMember({
                                      "title": 'Edit Pool Member',
                                      'projectId': viewConfig.projectId,
                                      callback: function () {
                                          dataView.refreshData();
                }});
            })
        ];
        rowActionConfig.push(ctwgc.getDeleteConfig('Delete Pool Member', function(rowIndex) {
                dataView = $('#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID).data("contrailGrid")._dataView;
                poolMemberEditView.model = new PoolMemberModel();
                poolMemberEditView.renderMultiDeletePoolMember({
                                      "title": 'Delete Pool Member',
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                }});
            }));
        return rowActionConfig;
    };

    function getPoolMemberDetailsTemplateConfig() {
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
                                    class: 'col-xs-12',
                                    rows: [
                                          {
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'name',
                                                    label: 'Name',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    key: 'display_name',
                                                    label: 'Display Name',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    key: 'uuid',
                                                    label: 'UUID',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Description',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'listenerDescription'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Port',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberPort'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    key: 'uuid',
                                                    label: 'Subnet',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberSubnet'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Address',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberAddress'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Weight',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberWeight'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Admin State',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberAdminState'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                }
                                            ]
                                        },
                                        ctwu.getRBACPermissionExpandDetails('col-xs-3')
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.poolMemberPort = function (v, dc) {
        return lbCfgFormatters.poolMemberPortFormatter(null,
                                        null, null, null, dc);
    };
    this.poolMemberSubnet = function (v, dc) {
        return lbCfgFormatters.poolMemberSubnetFormatter(null,
                                        null, null, null, dc);
    };

    this.poolMemberAddress = function (v, dc){
        return lbCfgFormatters.poolMemberAddressFormatter(null,
                null, null, null, dc);
    };

    this.poolMemberWeight = function (v, dc) {
        return lbCfgFormatters.poolMemberWeightFormatter(null,
                                        null, null, null, dc);
    };

    this.poolMemberAdminState = function (v, dc){
        return lbCfgFormatters.poolMemberAdminStateFormatter(null,
                null, null, null, dc);
    };

    this.listenerDescription = function(v, dc){
        return lbCfgFormatters.listenerDescriptionFormatter(null,
                null, null, null, dc);
    };

    return poolMemberGridView;
});
