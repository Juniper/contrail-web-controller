/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/location/ui/js/models/gcLocationModel',
    'config/gohanUi/location/ui/js/views/gcLocationEditView'],
    function (_, ContrailView, GcLocationModel, GcLocationEditView) {
    var dataView;
    var gcLocationEditView = new GcLocationEditView();
    var locationGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getLocationGridViewConfig());
        }
    });


    var getLocationGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_lOCATION_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_LOCATION_GRID_ID,
                                title: ctwl.CFG_LOCATION_TITLE,
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
                    text: ctwl.CFG_LOCATION_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getLocationDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Locations..'
                    },
                    empty: {
                        text: 'No Location Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                     {
                         field: 'name',
                         name: 'Name',
                         id: 'name'
                     },
                     {
                         field: 'description',
                         name: 'Description',
                         id: 'description'
                     },
                     {
                         id: "webui",
                         field: "webui",
                         name: "Horizon WebUI",
                         formatter: horizonWebUiFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         id: "contrail_webui",
                         field: "contrail_webui",
                         name: "Contrail WebUI",
                         formatter: contrailWebUiFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         field: 'region',
                         name: 'Region',
                         id: 'region'
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
                "title": ctwl.CFG_LOCATION_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcLocationEditView.model = new GcLocationModel();
                    gcLocationEditView.renderAddLocation({
                                              "title": 'Create Location',
                                              callback: function () {
                       $('#' + ctwl.CFG_LOCATION_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_LOCATION_GRID_ID).data("contrailGrid")._dataView;
            gcLocationEditView.model = new GcLocationModel(dataView.getItem(rowIndex));
            gcLocationEditView.renderEditLocation({
                                  "title": 'Edit Location',
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_LOCATION_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcLocationEditView.model = new GcLocationModel(dataItem);
           gcLocationEditView.renderDeleteLocation({
                                  "title": 'Delete Location',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_LOCATION_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getLocationDetailsTemplateConfig() {
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
                                            title: ctwl.CFG_VN_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'ID',
                                                    key: 'id',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Name',
                                                    key: 'name',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Tenant ID',
                                                    key: 'tenant_id',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Description',
                                                    key: 'description',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Keystone endpoint',
                                                    key: 'keystone_endpoint',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Contrail endpoint',
                                                    key: 'contrail_endpoint',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Horizon WebUI',
                                                    key: 'webui',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Contrail WebUI',
                                                    key: 'contrail_webui',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Region',
                                                    key: 'region',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Endpoint address',
                                                    key: 'address',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                }
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

    function horizonWebUiFormatter(r, c, v, cd, dc, showAll) {
        var val = getValueByJsonPath(dc, 'webui', '-');
        var  url = '<a href="'+ val +'" style="color: #3182bd !important;" target="_blank">link</a>';
        return  url;
    }

    function contrailWebUiFormatter(r, c, v, cd, dc, showAll) {
        var val = getValueByJsonPath(dc, 'contrail_webui', '-');
        var  url = '<a href="'+ val +'" style="color: #3182bd !important;" target="_blank">link</a>';
        return  url;
    }
    return locationGridView;
});
