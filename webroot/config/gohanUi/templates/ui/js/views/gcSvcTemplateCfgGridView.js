/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/templates/ui/js/models/gcSvcTemplateCfgModel',
    'config/gohanUi/common/ui/js/models/gcLocationModel',
    'config/gohanUi/templates/ui/js/views/gcSvcTemplateCfgFormatters',
    'config/gohanUi/templates/ui/js/views/gcSvcTemplateCfgEditView'
    ], function (_, ContrailView,
        SvcTemplateCfgModel, LocationModel,
        SvcTemplateCfgFormatters, SvcTemplateCfgEditView) {
    var formatSvcTemplateCfg = new SvcTemplateCfgFormatters();
    var dataView;

    var svcTemplateCfgEditView = new SvcTemplateCfgEditView();
    var self;
    var svcTemplateCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getSvcTemplateCfgGridViewConfig());
        }
    });


    var getSvcTemplateCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId(
                                    [ctwl.CFG_SVC_TEMPLATE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SVC_TEMPLATE_GRID_ID,
                                title: ctwl.CFG_SVC_TEMPLATE_TITLE,
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
                    text: ctwl.CFG_SVC_TEMPLATE_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getSvcTemplateCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                                var objProp = { name: 'service_templates', urlKey : 'local_service_templates', header : 'Local Service Template'};
                                ctwu.getLocationGrid(event, obj, objProp, ctwl.CFG_SVC_TEMPLATE_GRID_ID);
                        }
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Service Templates..'
                    },
                    empty: {
                        text: 'No Service Templates Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                    {
                      field:  'name',
                      name:   'Template'
                    },
                    {
                        field:  'service_mode',
                        name:   'Mode'
                    },
                    {
                      field:  'interface_type',
                      name:   'Interface (s)',
                      formatter: formatSvcTemplateCfg.interfaceFormatter,
                      sortable: {
                               sortBy: 'formattedValue'
                       }
                    },
                    {
                      field:  'image',
                      name:   'Image',
                      formatter: formatSvcTemplateCfg.imageFormatter,
                      sortable: {
                               sortBy: 'formattedValue'
                       }
                    },
                    {
                        field:  'flavor',
                        name:   'Flavor',
                        formatter: formatSvcTemplateCfg.flavorFormatter,
                        sortable: {
                                 sortBy: 'formattedValue'
                         }
                    },
                    {
                        field:  'description',
                        name:   'Description'
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
                "title": ctwl.CFG_SVC_TEMPLATE_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    svcTemplateCfgEditView.model = new SvcTemplateCfgModel();
                    svcTemplateCfgEditView.renderAddSvcTemplateCfg({
                              "title": 'Create Service Template',
                              callback: function () {
                                $('#' +ctwl.CFG_SVC_TEMPLATE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
       ctwgc.getEditConfig('Edit Local', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID).data("contrailGrid")._dataView;
            dataItem = $('#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            var ajaxConfig = {
                    url: ctwc.SVC_TEMPLATES + '/' + dataItem.id + '/local_service_templates' + ctwc.GOHAN_PARAM,
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
                svcTemplateCfgEditView.model = new LocationModel(mainObj);
                svcTemplateCfgEditView.renderLocationGridPopup({
                                     "title": 'Edit Local Service Template',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
            },function(error){
                contrail.showErrorMsg(error.responseText);
            });
         }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID).data("contrailGrid")._dataView;
            dataItem = $('#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            svcTemplateCfgEditView.model = new SvcTemplateCfgModel(dataItem);
            svcTemplateCfgEditView.renderGohanSvcTempDeletePopup({
                                  "title": ctwl.CFG_SVC_TEMPLATE_TITLE_DELETE,
                                   selectedGridData: [dataItem],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];

    function getSvcTemplateCfgDetailsTemplateConfig() {
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
                                            title:
                                            ctwl.CFG_SVC_TEMPLATE_TITLE_DETAILS,
                                            templateGenerator:
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'name',
                                                    label: 'Name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'description',
                                                    label: 'Description',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'id',
                                                    label: 'ID',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_mode',
                                                    label: 'Mode',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'image.name',
                                                    label: 'Image',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'flavor.name',
                                                    label: 'Flavor',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'interface_type',
                                                    label: 'Interface Type (s)',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'ifTypeDetailsFormatter'
                                                    }
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


    this.ifTypeDetailsFormatter = function (v, dc) {
        return formatSvcTemplateCfg.ifTypeDetailsFormatter(null, null,
                                                                null, null, dc);
    }

    return svcTemplateCfgGridView;
});
