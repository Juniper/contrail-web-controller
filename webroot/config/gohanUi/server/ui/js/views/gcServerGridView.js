/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/server/ui/js/models/gcServerModel',
    'config/gohanUi/server/ui/js/views/gcServerEditView',
    'config/gohanUi/common/ui/js/models/gcLocationModel'],
    function (_, ContrailView, GcServerModel, GcServerEditView, LocationModel) {
    var dataView;
    var gcServerEditView = new GcServerEditView();
    var serverGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getServerGridViewConfig());
        }
    });


    var getServerGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_SERVER_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SERVER_GRID_ID,
                                title: ctwl.CFG_SERVER_TITLE,
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
                    text: ctwl.CFG_SERVER_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getServerDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                                       var objProp = { name: 'servers', urlKey : 'local_servers', header : 'Local Server'};
                                       ctwu.getLocationGrid(event, obj, objProp, ctwl.CFG_SERVER_GRID_ID);
                        }
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Servers..'
                    },
                    empty: {
                        text: 'No Server Found.'
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
                         id: "image",
                         field: "image",
                         name: "Image ID",
                         formatter: imageFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         id: "network",
                         field: "network",
                         name: "Network ID",
                         formatter: networkFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         id: "security_group",
                         field: "security_group",
                         name: "Security Group ID",
                         formatter: SecGroupFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         id: "flavor",
                         field: "flavor",
                         name: "Flavor ID",
                         formatter: flavorFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
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
                "title": ctwl.CFG_SERVER_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    gcServerEditView.model = new GcServerModel();
                    gcServerEditView.renderAddServer({
                                              "title": 'Create Server',
                                              callback: function () {
                       $('#' + ctwl.CFG_SERVER_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_SERVER_GRID_ID).data("contrailGrid")._dataView;
            gcServerEditView.model = new GcServerModel(dataView.getItem(rowIndex));
            gcServerEditView.renderEditServer({
                                  "title": 'Edit Server',
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getEditConfig('Edit Local', function(rowIndex) {
            var dataItem = $('#' + ctwl.CFG_SERVER_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $('#' + ctwl.CFG_SERVER_GRID_ID).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: ctwc.GOHAN_SERVER + '/' + dataItem.id + '/local_servers' + ctwc.GOHAN_PARAM,
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
                    locationObj.subnet = dataItem.cidr;
                    locationObj.instanceId = arr[i].instance_id;
                    locationObj.console = arr[i].console_url;
                    parentObj.push(locationObj);
                }
                mainObj.entries = parentObj;
                gcServerEditView.model = new LocationModel(mainObj);
                gcServerEditView.renderLocationGridPopup({
                                     "title": 'Edit Local Server',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
           },function(error){
                contrail.showErrorMsg(error.responseText);
           });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
           var dataItem = $('#' + ctwl.CFG_SERVER_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
           gcServerEditView.model = new GcServerModel(dataItem);
           gcServerEditView.renderDeleteServer({
                                  "title": 'Delete Server',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_SERVER_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getServerDetailsTemplateConfig() {
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
                                                    label: 'Name',
                                                    key: 'name',
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
                                                    label: 'ID',
                                                    key: 'id',
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
                                                    key: 'image',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Image ID',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serverImageFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'network',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Network ID',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serverNetworkFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'security_group',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Security Group ID',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serverSecGroupFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'flavor',
                                                    templateGenerator: 'TextGenerator',
                                                    label: 'Flavor ID',
                                                    keyClass:'col-xs-3',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serverflavorFormatter'
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
    this.serverImageFormatter = function(value, dc) {
        return imageFormatter(null, null, null, value, dc, true);
    };
    this.serverNetworkFormatter = function(value, dc) {
        return networkFormatter(null, null, null, value, dc, true);
    };
    this.serverSecGroupFormatter = function(value, dc) {
        return SecGroupFormatter(null, null, null, value, dc, true);
    };
    this.serverflavorFormatter = function(value, dc) {
        return flavorFormatter(null, null, null, value, dc, true);
    };
    function imageFormatter(r, c, v, cd, dc, showAll) {
        var  imageName = getValueByJsonPath(dc, 'image;name', '-');
        return  imageName;
    }
    function networkFormatter(r, c, v, cd, dc, showAll){
        var  networkName = getValueByJsonPath(dc, 'network;name', '-');
        return  networkName;
    }
    function SecGroupFormatter(r, c, v, cd, dc, showAll){
        var  secGrpName = getValueByJsonPath(dc, 'security_group;name', '-');
        return  secGrpName;
    }
    function flavorFormatter(r, c, v, cd, dc, showAll){
        var  flavorName = getValueByJsonPath(dc, 'flavor;name', '-');
        return  flavorName;
    }
    return serverGridView;
});
