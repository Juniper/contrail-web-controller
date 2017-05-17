/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/image/ui/js/models/gcImageModel',
    'config/gohanUi/image/ui/js/views/gcImageEditView',
    'config/gohanUi/common/ui/js/models/gcLocationModel'],
    function (_, ContrailView, GcImageModel, GcImageEditView, LocationModel) {
    var dataView;
    var gcImageEditView = new GcImageEditView();
    var imageGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getImageGridViewConfig());
        }
    });


    var getImageGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_IMAGE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_IMAGE_GRID_ID,
                                title: ctwl.CFG_IMAGE_TITLE,
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
                    text: ctwl.CFG_IMAGE_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getImageDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                                       var objProp = { name: 'images', urlKey : 'local_images', header : 'Local Image'};
                                       ctwu.getLocationGrid(event, obj, objProp, ctwl.CFG_IMAGE_GRID_ID);
                        }
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Images..'
                    },
                    empty: {
                        text: 'No Image Found.'
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
                         id: "url",
                         field: "url",
                         name: "URL",
                         formatter: urlFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         field: 'is_public',
                         name: 'Is Public',
                         id: 'is_public'
                     },
                     {
                         field: 'disk_format',
                         name: 'Disk format',
                         id: 'disk_format'
                     },
                     {
                         field: 'container_format',
                         name: 'Container format',
                         id: 'container_format'
                     },
                     {
                         field: 'min_disk',
                         name: 'Min Disk',
                         id: 'min_disk'
                     },
                     {
                         field: 'min_ram',
                         name: 'Min RAM',
                         id: 'min_ram'
                     },
                     {
                         field: 'protected',
                         name: 'Protected',
                         id: 'protected'
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
                "title": ctwl.CFG_IMAGE_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcImageEditView.model = new GcImageModel();
                    gcImageEditView.renderAddImage({
                                              "title": 'Create Image',
                                              callback: function () {
                       $('#' + ctwl.CFG_IMAGE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_IMAGE_GRID_ID).data("contrailGrid")._dataView;
            gcImageEditView.model = new GcImageModel(dataView.getItem(rowIndex));
            gcImageEditView.renderEditImage({
                                  "title": 'Edit Image',
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getEditConfig('Edit Local', function(rowIndex) {
            var dataItem = $('#' + ctwl.CFG_IMAGE_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $('#' + ctwl.CFG_IMAGE_GRID_ID).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: ctwc.GOHAN_IMAGES + '/'+ dataItem.id +'/local_images' + ctwc.GOHAN_PARAM,
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
                gcImageEditView.model = new LocationModel(mainObj);
                gcImageEditView.renderLocationGridPopup({
                                     "title": 'Edit Local Image',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
           },function(error){
                contrail.showErrorMsg(error.responseText);
           });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_IMAGE_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcImageEditView.model = new GcImageModel(dataItem);
           gcImageEditView.renderDeleteImage({
                                  "title": 'Delete Image',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_IMAGE_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getImageDetailsTemplateConfig() {
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
                                                    label: 'URL',
                                                    key: 'url',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Is Public',
                                                    key: 'is_public',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Disk format',
                                                    key: 'disk_format',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Container format',
                                                    key: 'container_format',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Min Disk',
                                                    key: 'min_disk',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Min RAM',
                                                    key: 'min_ram',
                                                    keyClass:'col-xs-3',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Protected',
                                                    key: 'protected',
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

    function urlFormatter(r, c, v, cd, dc, showAll) {
        var val = getValueByJsonPath(dc, 'url', '-');
        var  url = '<a href="'+ val +'" style="color: #3182bd !important;" target="_blank">link</a>';
        return  url;
    }
    return imageGridView;
});
