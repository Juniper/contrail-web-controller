/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/flavor/ui/js/models/gcFlavorModel',
    'config/gohanUi/flavor/ui/js/views/gcFlavorEditView',
    'config/gohanUi/common/ui/js/models/gcLocationModel'],
    function (_, ContrailView, GcFlavorModel, GcFlavorEditView, LocationModel) {
    var dataView;
    var gcFlavorEditView = new GcFlavorEditView();
    var flavorGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getFlavorGridViewConfig());
        }
    });


    var getFlavorGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_FLAVOR_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_FLAVOR_GRID_ID,
                                title: ctwl.CFG_FLAVOR_TITLE,
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
                    text: ctwl.CFG_FLAVOR_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getFlavorDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                                       var objProp = { name: 'flavors', urlKey : 'local_flavors', header : 'Local flavor'};
                                       ctwu.getLocationGrid(event, obj, objProp, ctwl.CFG_FLAVOR_GRID_ID);
                        }
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Flavors..'
                    },
                    empty: {
                        text: 'No Flavor Found.'
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
                         field: 'ram',
                         name: 'RAM (MB)',
                         id: 'ram'
                     },
                     {
                         field: 'vcpus',
                         name: 'VCPUs',
                         id: 'vcpus'
                     },
                     {
                         field: 'disk',
                         name: 'Disk (GB)',
                         id: 'disk'
                     },
                     {
                         field: 'swap',
                         name: 'Swap (GB)',
                         id: 'swap'
                     },
                     {
                         field: 'ephemeral',
                         name: 'Ephemeral (GB)',
                         id: 'ephemeral'
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
                "title": ctwl.CFG_FLAVOR_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcFlavorEditView.model = new GcFlavorModel();
                    gcFlavorEditView.renderAddFlavor({
                                              "title": 'Create Flavor',
                                              callback: function () {
                       $('#' + ctwl.CFG_FLAVOR_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_FLAVOR_GRID_ID).data("contrailGrid")._dataView;
            gcFlavorEditView.model = new GcFlavorModel(dataView.getItem(rowIndex));
            gcFlavorEditView.renderEditFlavor({
                                  "title": 'Edit Flavor',
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getEditConfig('Edit Local', function(rowIndex) {
            var dataItem = $('#' + ctwl.CFG_FLAVOR_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $('#' + ctwl.CFG_FLAVOR_GRID_ID).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: ctwc.GOHAN_FLAVOR_URL + '/' + dataItem.id + '/local_flavors' + ctwc.GOHAN_PARAM,
                    type:'GET'
            };
            contrail.ajaxHandler(ajaxConfig, null, function(model){
                var arr = model[Object.keys(model)[0]];
                var mainObj = {};
                mainObj.id = dataItem.id;
                var parentObj = [];
                for(var i = 0; i < arr.length; i++){
                    var locationObj = {};
                    locationObj.locationName = arr[i].location.name;
                    locationObj.status = arr[i].status;
                    locationObj.name = arr[i].name;
                    locationObj.description = arr[i].description;
                    locationObj.taskStatus = arr[i].task_status;
                    locationObj.locationId = arr[i].id;
                    locationObj.svcTempId = dataItem.id;
                    parentObj.push(locationObj);
                }
                mainObj.entries = parentObj;
                gcFlavorEditView.model = new LocationModel(mainObj);
                gcFlavorEditView.renderLocationGridPopup({
                                     "title": 'Edit Local Flavor',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
           },function(error){
                contrail.showErrorMsg(error.responseText);
           });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_FLAVOR_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcFlavorEditView.model = new GcFlavorModel(dataItem);
           gcFlavorEditView.renderDeleteFlavor({
                                  "title": 'Delete Flavor',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_FLAVOR_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getFlavorDetailsTemplateConfig() {
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
                                                    label: 'RAM (MB)',
                                                    key: 'ram',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'VCPUs',
                                                    key: 'vcpus',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Disk (GB)',
                                                    key: 'disk',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Swap (GB)',
                                                    key: 'swap',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Ephemeral (GB)',
                                                    key: 'ephemeral',
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
    return flavorGridView;
});
