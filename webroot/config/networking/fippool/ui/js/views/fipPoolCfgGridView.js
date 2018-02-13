/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'config/networking/fippool/ui/js/models/fipPoolCfgModel',
    'config/networking/fippool/ui/js/views/fipPoolCfgEditView',
    'config/networking/fippool/ui/js/views/fipPoolFormatters',
    'contrail-view'
], function (_, Backbone, FipPoolCfgModel, FipPoolCfgEditView,
        FipPoolFormatters, ContrailView) {
    var fipPoolCfgEditView = new FipPoolCfgEditView(),
        fipPoolFormatters = new FipPoolFormatters(),
        gridElId = "#" + ctwc.FIP_POOL_GRID_ID;

    var fipPoolGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            fipPoolCfgEditView.selectedProjectId = viewConfig.selectedProjectId;
            self.renderView4Config(self.$el, self.model,
                    getFipPoolGridViewConfig(viewConfig));
        }
    });

    var getFipPoolGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId
                            ([ctwc.CONFIG_FIP_POOL_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.FIP_POOL_GRID_ID,
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
    function getRowActionConfig(dc) {
        var rowActionConfig = [];
        rowActionConfig.push(ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var fipPoolCfgModel = new FipPoolCfgModel(dataItem);
            fipPoolCfgEditView.model = fipPoolCfgModel;
            fipPoolCfgEditView.renderFipPoolPopup({
                                  "title": ctwl.EDIT,
                                  mode: ctwl.EDIT_ACTION,
                                  callback: function () {
                var dataView =
                    $("#" + ctwc.FIP_POOL_GRID_ID).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }));
            rowActionConfig.push(
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                var fipPoolCfgModel = new FipPoolCfgModel(dataItem);
                fipPoolCfgEditView.model = fipPoolCfgModel;
                fipPoolCfgEditView.renderDeleteFloatingIPPools({
                                      "title": ctwl.DEL_FIPPOOLS,
                                      selectedGridData: [dataItem],
                                      callback: function() {
                    var dataView =
                        $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }));
        return rowActionConfig;
    }
    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.CONFIG_FIP_POOLS_TITLE
                },
                advanceControls : getHeaderActionConfig(
                                     "#" + ctwc.FIP_POOL_GRID_ID, viewConfig)
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteFIP').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteFIP').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig.bind(viewConfig),
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                            getFIPDetailsTemplateConfig(),
                                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Floating IP Pools.',
                    },
                    empty: {
                        text: 'No Floating IP Pools.'
                    }
                }
            },
            columnHeader: {
                columns: getfipPoolColumns()
            },
            footer: {
                pager: contrail.handleIfNull
                                    (viewConfig.pagerOptions,
                                        { options:
                                          { pageSize: 5,
                                            pageSizeSelect: [5, 10, 50, 100]
                                          }
                                        }
                                    )
            }
        };
        return gridElementConfig;
    };

    function getfipPoolColumns () {
        var fipPoolColumns = [
            {
                id:"name",
                field:"name",
                name:"Name",
                sortable: {
                   sortBy: 'formattedValue'
                },
                minWidth : 120
            },
            {
                field:"description",
                name:"Description",
                sortable: {
                   sortBy: 'formattedValue'
                },
                formatter: fipPoolFormatters.networkDescriptionFormater,
                minWidth : 120
            },
            {
                id:"tenant",
                field:"tenant",
                name:"Shared Projects",
                sortable: {
                   sortBy: 'formattedValue'
                },
                formatter: fipPoolFormatters.projectName,
                minWidth : 120
            },
            {
                id:"network",
                field:"network",
                name:"Network",
                minWidth : 50,
                sortable: {
                   sortBy: 'formattedValue'
                },
                formatter: fipPoolFormatters.networkFormater
            }];
        return fipPoolColumns;
    }
    function getHeaderActionConfig(gridElId, viewConfig) {
        var project = contrail.getCookie(cowc.COOKIE_PROJECT);
        if(project === ctwc.DEFAULT_PROJECT) {
            return [];
        }
        var headerActionConfig =
        [
            {
                "type" : "link",
                "title" : ctwl.TITLE_DELETE_CONFIG,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnDeleteFIP',
                "onClick" : function() {
                    var checkedRows =
                        $(gridElId).data("contrailGrid").
                        getCheckedRows();
                    if(checkedRows.length > 0 ) {
                        var fipPoolCfgModel = new FipPoolCfgModel();
                        fipPoolCfgEditView.model = fipPoolCfgModel;
                        fipPoolCfgEditView.renderDeleteFloatingIPPools(
                            {"title": ctwl.TITLE_DELETE_CONFIG,
                                selectedGridData: checkedRows,
                                callback: function () {
                                    var dataView =
                                        $(gridElId).data("contrailGrid")._dataView;
                                    dataView.refreshData();
                                }
                            }
                        );
                    }
                }

            },
            {
                "type": "link",
                "title": "Add Floating IP Pools",
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    var dataItem = {};
                    dataItem.securityGroupValue = fipPoolFormatters.getProjectFqn()+":default";
                    var fipPoolCfgModel = new FipPoolCfgModel(dataItem);
                    fipPoolCfgEditView.model = fipPoolCfgModel;
                    fipPoolCfgEditView.renderFipPoolPopup({
                                     "title": ctwl.CREATE,
                                     mode : ctwl.CREATE_ACTION,
                                     selectedProjectId: viewConfig.selectedProjectId,
                                     callback: function () {
                                        var dataView =
                                            $("#" + ctwc.FIP_POOL_GRID_ID).data("contrailGrid")._dataView;
                                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    };
    function getFIPDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-8',
                                    rows: [
                                        {
                                            title: ctwl.CFG_FIP_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    keyClass:'col-xs-5',
                                                    valueClass:'col-xs-7',
                                                    key: 'fq_name',
                                                    name: 'network',
                                                    label:'Network',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig:{
                                                        formatter: "networkFormater"
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-5',
                                                    valueClass:'col-xs-7',
                                                    key: 'uuid',
                                                    name:"uuid",
                                                    label:"uuid",
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-5',
                                                    valueClass:'col-xs-7',
                                                    key: 'name',
                                                    name:"name",
                                                    label:"Floating IP Pool",
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-5',
                                                    valueClass:'col-xs-7',
                                                    key: 'id_perms',
                                                    name:"description",
                                                    label:"Floating IP Pool Description",
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig:{
                                                        formatter: "networkDescriptionFormater"
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-5',
                                                    valueClass:'col-xs-7',
                                                    key: 'perms2',
                                                    name:"Share Projects",
                                                    label:"Share Projects",
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig:{
                                                        formatter: "projectNameExp"
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
    this.networkFormater = function (v, dc) {
        return fipPoolFormatters.networkFormater("", "", v, "", dc);
    };
    this.networkDescriptionFormater = function (v, dc) {
        return fipPoolFormatters.networkDescriptionFormater("", "", v, "", dc);
    };
    this.projectNameExp = function (v, dc) {
        return fipPoolFormatters.projectNameExp("", "", v, "", dc);
    };
    return fipPoolGridView;
});
