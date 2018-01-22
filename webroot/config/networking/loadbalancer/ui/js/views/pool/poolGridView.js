/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/models/poolModel',
    'config/networking/loadbalancer/ui/js/views/pool/poolEditView'
    ],
    function (_, ContrailView, LbCfgFormatters, PoolModel, PoolEditView) {
    var lbCfgFormatters = new LbCfgFormatters();
    var poolEditView = new PoolEditView();
    var dataView;
    var poolGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getPoolGridViewConfig(viewConfig));
        }
    });


    var getPoolGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_POOL_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_POOL_GRID_ID,
                                title: ctwc.CONFIG_LB_POOL_TITLE,
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

    function onPoolClick(e, dc) {
        var lbId = this.viewConfig.lbId;
        var lbName = this.viewConfig.lbName;
        var listenerRef = this.viewConfig.listenerRef;
        var poolRef = this.viewConfig.poolRef;
        var listenerName = this.viewConfig.listener;
        var listenerId = this.viewConfig.listenerId;
        var projectId =  this.viewConfig.projectId;
        var viewTab = 'config_pool_details';
        var hashP = 'config_load_balancer';
        var lbProvider = this.viewConfig.lbProvider;
        var hashParams = null,
            hashObj = {
                view: viewTab,
                focusedElement: {
                    pool: dc.display_name,
                    uuid: lbId,
                    tab: viewTab,
                    lbName: lbName,
                    listenerRef: listenerRef,
                    poolRef: poolRef,
                    listenerName: listenerName,
                    listenerId: listenerId,
                    poolId: dc.uuid,
                    projectId: projectId,
                    lbProvider: lbProvider
                }
            };
        if (contrail.checkIfKeyExistInObject(true,
                hashParams,
                'clickedElement')) {
            hashObj.clickedElement =
                hashParams.clickedElement;
        }

        layoutHandler.setURLHashParams(hashObj, {
            p: hashP,
            merge: false,
            triggerHashChange: true
        });
    };

    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwc.CONFIG_LB_POOL_TITLE
                },
                defaultControls: {
                    //columnPickable:true
                 },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    autoRefresh: false,
                    disableRowsOnLoading:true,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#poolDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#poolDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(viewConfig),
                    detail: {
                        noCache: true,
                        template: cowu.generateDetailTemplateHTML(
                                       getPoolDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Pool..'
                    },
                    empty: {
                        text: 'No Pool Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                    {
                        id: 'display_name',
                        field: 'display_name',
                        name: 'Name',
                        cssClass :'cell-hyperlink-blue',
                        events : {
                            onClick : onPoolClick.bind({viewConfig:viewConfig})
                        }
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
                         name:   'Protocol',
                         formatter: lbCfgFormatters.poolProtocolFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Loadbalancer Method',
                         formatter: lbCfgFormatters.poolLbMethodFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Pool Members',
                         formatter: lbCfgFormatters.poolMemberCountFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Health Monitor',
                         formatter: lbCfgFormatters.healthMonitorCountFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Admin State',
                         formatter: lbCfgFormatters.poolAdminStateFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     }
                ]
            },
        };
        return gridElementConfig
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Delete Pool',
                "iconClass": "fa fa-trash",
                "linkElementId": "poolDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.CONFIG_LB_POOL_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    poolEditView.model = new PoolModel();
                    poolEditView.renderMultiDeletePool({"title": 'Delete Pool',
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    function  getRowActionConfig (viewConfig) {
        rowActionConfig = [
            ctwgc.getEditConfig('Edit Pool', function(rowIndex) {
                var lbProvider = viewConfig.lbProvider;
                dataView = $('#' + ctwc.CONFIG_LB_POOL_GRID_ID).data("contrailGrid")._dataView;
                var model = dataView.getItem(rowIndex);
                model['lb_provider'] = lbProvider;
                poolEditView.model = new PoolModel(model);
                poolEditView.renderEditPool({
                                      "title": 'Edit Pool',
                                      'lbProvider': lbProvider,
                                      callback: function () {
                                          dataView.refreshData();
                }});
            })
        ];
        rowActionConfig.push(ctwgc.getDeleteConfig('Delete Pool', function(rowIndex) {
                var dataView = $('#' + ctwc.CONFIG_LB_POOL_GRID_ID).data("contrailGrid")._dataView;
                poolEditView.model = new PoolModel();
                poolEditView.renderMultiDeletePool({
                                      "title": 'Delete pool',
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                }});
            }));
        return rowActionConfig;
    };

    function getHealthMonitorExpandDetailsTmpl() {
        return {
            title: "Health Monitor Details",
            templateGenerator: 'BlockListTemplateGenerator',
            templateGeneratorConfig: [
                {
                    label: 'Health Monitor',
                    key: 'uuid',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'healthMonitorFormatterList'
                    },
                    keyClass:'col-xs-3',
                    valueClass:'col-xs-9 pool-health-monitors-details'
                }
            ]
        }
    };

    function getPoolDetailsTemplateConfig() {
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
                                                    label: 'Protocol',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolProtocol'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Session Persistence',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolSessionPersistence'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Persistence Cookie Name',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolPersistenceCookie'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Load Balancer Method',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'loadBalancerMethod'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Pool Members',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolMemberCount'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Health Monitor',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'healthMonitorCount'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Admin State',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'poolAdminState'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Custom Attributes',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'customAttributes'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                }
                                            ]
                                        },
                                        getHealthMonitorExpandDetailsTmpl(),
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

    this.poolProtocol = function (v, dc) {
        return lbCfgFormatters.poolProtocolFormatter(null,
                                        null, null, null, dc);
    };

    this.loadBalancerMethod = function (v, dc){
        return lbCfgFormatters.poolLbMethodFormatter(null,
                null, null, null, dc);
    };

    this.poolMemberCount = function (v, dc) {
        return lbCfgFormatters.poolMemberCountFormatter(null,
                                        null, null, null, dc);
    };

    this.healthMonitorCount = function (v, dc) {
        return lbCfgFormatters.healthMonitorCountFormatter(null,
                                        null, null, null, dc);
    };

    this.poolAdminState = function (v, dc){
        return lbCfgFormatters.poolAdminStateFormatter(null,
                null, null, null, dc);
    };

    this.customAttributes = function (v, dc){
        return lbCfgFormatters.customAttributesList(null,
                null, null, null, dc);
    };

    this.listenerDescription = function(v, dc){
        return lbCfgFormatters.listenerDescriptionFormatter(null,
                null, null, null, dc);
    };

    this.healthMonitorFormatterList = function(v, dc){
        return lbCfgFormatters.healthMonitorFormatterList(null,
                null, null, null, dc);
    };

    this.poolSessionPersistence = function(v, dc){
        return lbCfgFormatters.poolSessionPersistence(null,
                null, null, null, dc);
    };

    this.poolPersistenceCookie = function(v, dc){
        return lbCfgFormatters.poolPersistenceCookie(null,
                null, null, null, dc);
    };
    return poolGridView;
});
