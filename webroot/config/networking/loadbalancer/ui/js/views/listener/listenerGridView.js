/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters',
    'config/networking/loadbalancer/ui/js/views/listener/listenerEditView',
    'config/networking/loadbalancer/ui/js/models/listenerModel',
    'config/networking/loadbalancer/ui/js/models/lbCfgModel',
    'config/networking/loadbalancer/ui/js/views/lbCfgEditView'
    ],
    function (_, ContrailView, LbCfgFormatters, ListenerEditView, ListenerModel, LbCfgModel, LbCfgEditView) {
    var lbCfgFormatters = new LbCfgFormatters();
    var listenerEditView = new ListenerEditView();
    var lbCfgEditView = new LbCfgEditView();
    var dataView;
    var listenerGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getListenerGridViewConfig(viewConfig));
        }
    });


    var getListenerGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_LISTENER_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_LISTENER_GRID_ID,
                                title: ctwc.CONFIG_LB_LISTENER_TITLE,
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

    function onListenerClick(e, dc) {
        var lbId = this.viewConfig.lbId;
        var lbName = this.viewConfig.lbName;
        var lbProvider = this.viewConfig.lbProvider;
        var projectId = this.viewConfig.projectId;
        var listenerRef = this.viewConfig.listenerRef;
        var viewTab = 'config_listener_details';
        var hashP = 'config_load_balancer';
        var hashParams = null,
            hashObj = {
                view: viewTab,
                focusedElement: {
                    listener: dc.display_name,
                    listenerId: dc.uuid,
                    uuid: lbId,
                    tab: viewTab,
                    lbName: lbName,
                    listenerRef: listenerRef,
                    projectId : projectId,
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
                    text: ctwc.CONFIG_LB_LISTENER_TITLE
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
                            $('#listenerDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#listenerDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig,
                    detail: {
                        noCache: true,
                        template: cowu.generateDetailTemplateHTML(
                                       getListenerDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Listener..'
                    },
                    empty: {
                        text: 'No Listener Found.'
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
                            onClick : onListenerClick.bind({viewConfig:viewConfig})
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
                         formatter: lbCfgFormatters.listenerProtocolFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Port',
                         formatter: lbCfgFormatters.listenerPortFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Pool',
                         formatter: lbCfgFormatters.listenerPoolCountFormatter,
                         sortable: {
                            sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'uuid',
                         name:   'Admin State',
                         formatter: lbCfgFormatters.listenerAdminStateFormatter,
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
                "title": 'Delete Listeners',
                "iconClass": "fa fa-trash",
                "linkElementId": "listenerDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwc.CONFIG_LB_LISTENER_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    listenerEditView.model = new ListenerModel();
                    listenerEditView.renderMultiDeleteListener({"title": 'Delete Listeners',
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": 'Create Listener',
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var title = viewConfig.lbName + ' > '+ 'Create Listener'
                    var lbodel = new LbCfgModel({'existing_port': viewConfig.port.list});
                    var lbObj = {
                        'fq_name':  viewConfig.lbFqName,
                        'uuid': viewConfig.lbId,
                        'parent_type': 'project',
                        'lbProvider': viewConfig.lbProvider
                    }
                    lbCfgEditView.model = lbodel;
                    lbCfgEditView.renderAddLb({
                                              "title": title,
                                              'mode': 'listener',
                                              'projectId': viewConfig.projectId,
                                              'lbObj': lbObj,
                                              callback: function () {
                    $('#' + ctwc.CONFIG_LB_LISTENER_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    function  getRowActionConfig (dc) {
        rowActionConfig = [
            ctwgc.getEditConfig('Edit Listener', function(rowIndex) {
                dataView = $('#' + ctwc.CONFIG_LB_LISTENER_GRID_ID).data("contrailGrid")._dataView;
                listenerEditView.model = new ListenerModel(dataView.getItem(rowIndex));;
                listenerEditView.renderListenerEdit({
                                      "title": 'Edit Listener',
                                      callback: function () {
                                          dataView.refreshData();
                }});
            })
        ];
        rowActionConfig.push(ctwgc.getDeleteConfig('Delete Listener', function(rowIndex) {
                var dataView = $('#' + ctwc.CONFIG_LB_LISTENER_GRID_ID).data("contrailGrid")._dataView;
                listenerEditView.model = new ListenerModel();
                listenerEditView.renderMultiDeleteListener({
                                      "title": 'Delete Listener',
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                }});
            }));
        return rowActionConfig;
    };

    function getPoolExpandDetailsTmpl() {
        return {
            title: "Pool Details",
            templateGenerator: 'BlockListTemplateGenerator',
            templateGeneratorConfig: [
                {
                    label: 'Pool',
                    key: 'uuid',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'poolFormatterList'
                    },
                    keyClass:'col-xs-3',
                    valueClass:'col-xs-9'
                }
            ]
        }
    };

    function getListenerDetailsTemplateConfig() {
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
                                                        formatter: 'listenerProtocol'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Port',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'listenerPort'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Pool',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'listenerPoolCount'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Connection Limit',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'connectionLimit'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                },
                                                {
                                                    label: 'Admin State',
                                                    key: 'uuid',
                                                    templateGeneratorConfig: {
                                                        formatter: 'listenerAdminState'
                                                    },
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-3',
                                                    valueClass:'col-xs-9'
                                                }
                                            ]
                                        },
                                        getPoolExpandDetailsTmpl(),
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

    this.listenerProtocol = function (v, dc) {
        return lbCfgFormatters.listenerProtocolFormatter(null,
                                        null, null, null, dc);
    };

    this.listenerPort = function (v, dc){
        return lbCfgFormatters.listenerPortFormatter(null,
                null, null, null, dc);
    };

    this.listenerPoolCount = function (v, dc) {
        return lbCfgFormatters.listenerPoolCountFormatter(null,
                                        null, null, null, dc);
    };

    this.connectionLimit = function (v, dc) {
        return lbCfgFormatters.listenerConnectionLimit(null,
                null, null, null, dc);
    };

    this.listenerAdminState = function (v, dc){
        return lbCfgFormatters.listenerAdminStateFormatter(null,
                null, null, null, dc);
    };

    this.listenerDescription = function(v, dc){
        return lbCfgFormatters.listenerDescriptionFormatter(null,
                null, null, null, dc);
    };

    this.poolFormatterList = function(v, dc){
        return lbCfgFormatters.poolFormatterList(null,
                null, null, null, dc);
    };

    return listenerGridView;
});
