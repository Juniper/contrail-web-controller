/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/instances/ui/js/models/gcSvcInstModel',
    'config/gohanUi/common/ui/js/models/gcLocationModel',
    'config/gohanUi/instances/ui/js/views/gcSvcInstEditView'
], function (_, ContrailView, SvcInstModel, LocationModel, SvcInstEditView) {
    gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var svcInstEditView = new SvcInstEditView();
    var SvcInstGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                                   getSvcInstGridViewConfig(viewConfig.svcInstanceDataObj));
        }
    });

    var getSvcInstGridViewConfig = function (svcInstanceDataObj) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.SERVICE_INSTANCES_GRID_ID,
                                title: ctwl.TITLE_SERVICE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(svcInstanceDataObj)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (svcInstanceDataObj) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_SERVICE_INSTANCES
                },
                advanceControls: getHeaderActionConfig(svcInstanceDataObj),
            },
            body: {
                options: {
                    actionCell: rowActionConfig(svcInstanceDataObj),
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(getSvcInstDetailsTemplateConfig(),
                                                            cowc.APP_CONTRAIL_CONTROLLER),
                            onExpand: function(event, obj){
                                var objProp = { name: 'service_instances', urlKey : 'local_service_instance', header : 'Local Service Instance' };
                                ctwu.getLocationGrid(event, obj, objProp, ctwl.SERVICE_INSTANCES_GRID_ID);
                            }
                    },
                    checkboxSelectable: false
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Service Instances..'
                    },
                    empty: {
                        text: 'No Service Instances Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                          {
                            field : 'name',
                            name : 'Service Instance'
                          },
                          {
                            field : 'description',
                            name : 'Description'
                          },
                          {
                            field : 'service_template.name',
                            name : 'Service Template',
                            formatter: function(row, col, val, d, rowData) {
                                return svcTmplFormatter(row, col, val, d, rowData);
                            },
                            sortable: {
                                sortBy: 'formattedValue'
                            }
                          },
                          {
                              name: '# Instance (s)',
                              formatter: function(row, col, val, d, rowData) {
                                  return instCountFormatter(row, col, val, d, rowData);
                              },
                              sortable: {
                                  sortBy: 'formattedValue'
                              }
                          }
                ]
            },
            footer: {
            }
        };
        return gridElementConfig;
    };
    function rowActionConfig() {
        return [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                svcInstEditView.model = new SvcInstModel(dataItem);
                svcInstEditView.renderInstEditPopup({
                                  "title": 'Edit Service Instance',
                                   callback: function () {
                                         dataView.refreshData();
                                  }});
            }),
            ctwgc.getEditConfig('Edit Local', function(rowIndex) {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                var ajaxConfig = {
                        url: ctwc.SVC_INSTANCES + '/' + dataItem.id + '/local_service_instance' + ctwc.GOHAN_PARAM,
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
                    svcInstEditView.model = new LocationModel(mainObj);
                    svcInstEditView.renderLocationGridPopup({
                                         "title": 'Edit Local Service Instance',
                                          callback: function () {
                                              dataView.refreshData();
                                          }});
               },function(error){
                    contrail.showErrorMsg(error.responseText);
               });
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
               var dataView = $(gridElId).data("contrailGrid")._dataView;
               var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
               svcInstEditView.model = new SvcInstModel(dataItem);
               svcInstEditView.renderGohanSvcInsDeletePopup({
                                      "title": 'Delete Service Instance',
                                      selectedGridData: [dataItem],
                                      callback: function () {
                                            dataView.refreshData();
                                      }});
            })
        ];
    }

    function getSvcInstDetailsTemplateConfig () {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                title: ctwl.SVC_INST_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'name',
                                        keyClass:'col-xs-5',
                                        label: 'Instance Name',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'description',
                                        keyClass:'col-xs-5',
                                        label: 'Description',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'id',
                                        keyClass:'col-xs-5',
                                        label: 'Id',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_template.name',
                                        keyClass:'col-xs-5',
                                        label: 'Template',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcTmplFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties.scale_out.max_instances',
                                        keyClass:'col-xs-5',
                                        label: '# Instance (s)',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'instCountFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_template.flavor.name',
                                        keyClass:'col-xs-5',
                                        label: 'Flavor',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'getFlavorName'
                                        }
                                    },
                                    {
                                        key: 'service_template.image.name',
                                        keyClass:'col-xs-5',
                                        label: 'Image',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'getImageName'
                                        }
                                    }

                                ]
                            }
                          ]
                       }]
                    }
                }]
            }
        };
    };
    function svcTmplFormatter (row, col, val, d, rowData) {
        var dispStr = "-";
        if (('service_template' in rowData) && ('service_mode' in rowData['service_template'])) {
            return rowData['service_template']['name'] + " ( " +
                rowData['service_template']['service_mode'] +
                ", version 1 )";
        }
        return dispStr;
    }
    this.svcTmplFormatter = function (val, rowData) {
        return svcTmplFormatter(null, null, val, null, rowData);
    }
    this.instCountFormatter = function(val, rowData) {
        return instCountFormatter(null, null, val, null, rowData, true);
    }
    function instCountFormatter(row, col, val, d, rowData){
        var svcInstance = getValueByJsonPath(rowData, 'service_instance_properties;scale_out;max_instances', '-');
        return svcInstance;
    }
    this.getFlavorName = function(val, rowData) {
        return getFlavorName(null, null, val, null, rowData, true);
    }
    function getFlavorName(row, col, val, d, rowData){
        var name = getValueByJsonPath(rowData, 'service_template;flavor;name', '-');
        return name;
    }
    this.getImageName = function(val, rowData) {
        return getImageName(null, null, val, null, rowData, true);
    }
    function getImageName(row, col, val, d, rowData){
        var name = getValueByJsonPath(rowData, 'service_template;image;name', '-');
        return name;
    }
    function getHeaderActionConfig(svcInstanceDataObj) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_SERVICE_INSTANCE,
                "iconClass": "fa fa-plus",
                "onClick": function() {
                    svcInstModel = new SvcInstModel({
                        svcInstanceDataObj: svcInstanceDataObj
                    });
                    svcInstModel.svcInstanceDataObj = svcInstanceDataObj;
                    if (!svcInstanceDataObj.svcTmplsFormatted.length) {
                        return;
                    }
                    svcInstEditView.model = svcInstModel;
                    svcInstModel.editView = svcInstEditView;
                    svcInstEditView.renderConfigureSvcInst({
                        "title": 'Create Service Instance',
                         callback: function() {
                            var dataView = $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                         }
                    });
                }
            }
        ];
        return headerActionConfig;
    };

   return SvcInstGridView;
});
