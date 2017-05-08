/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/networks/ui/js/models/gcVnCfgModel',
    'config/gohanUi/networks/ui/js/views/gcVnCfgEditView',
    'config/gohanUi/common/ui/js/models/gcLocationModel'],
    function (_, ContrailView, VNCfgModel, VNCfgEditView, LocationModel) {
    var dataView, viewConfig;
    var vnCfgEditView = new VNCfgEditView();

    var vnCfgGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            viewConfig = this.attributes.viewConfig;
            this.renderView4Config(self.$el, self.model,
                                   getVNCfgGridViewConfig());
        }
    });


    var getVNCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_VN_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_VN_GRID_ID,
                                title: ctwl.CFG_VN_TITLE,
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
                    text: ctwl.CFG_VN_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    checkboxSelectable: false,
                    actionCell: rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getVNCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER),
                        onExpand: function(event, obj){
                                       var objProp = { name: 'networks', urlKey : 'local_networks', header : 'Local Network' };
                                       ctwu.getLocationGrid(event, obj, objProp, ctwl.CFG_VN_GRID_ID);
                        }
                    }
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Networks..'
                    },
                    empty: {
                        text: 'No Networks Found.'
                    }
                }
            },
            columnHeader: {
                //Change these once the ajax url is changed
                columns: [
                     {
                         field: 'name',
                         name: 'Network',
                         id: 'name'
                     },
                     {
                         field: 'cidr',
                         name: 'Subnet',
                         id: 'cidr'
                     },
                     {
                         field: 'local_prefix_len',
                         name: 'Local Prefix',
                         id: 'local_prefix_len'
                     },
                     {
                         field: 'policies',
                         name: 'Attached Policies',
                         id: 'policies',
                         formatter: networkPoliciesFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     }
                ]
            },
        };
        return gridElementConfig;
    };

    function networkPoliciesFormatter(r, c, v, cd, dc, showAll) {
        var policies = dc.policies, returnString = '-', str = [];
        if(policies.length > 0){
            returnString = '';
            var list = viewConfig.listOfPolicies;
            for(var i = 0; i < policies.length; i++){
                for(var j = 0;j < list.length; j++){
                    if(list[j].id === policies[i]){
                        str.push(list[j].name);
                    }
                }
            }
            if (typeof str === "object") {
                var sgRulesCnt = str.length;
                if ((null != showAll) && (true == showAll)) {
                    for (var i = 0; i < sgRulesCnt; i++) {
                        if (typeof str[i] !== "undefined") {
                            returnString += str[i] + "<br>";
                        }
                    }
                    return returnString;
                }
                for (var i = 0; i < sgRulesCnt, i < 2; i++) {
                    if (typeof str[i] !== "undefined") {
                        returnString += str[i] + "<br>";
                    }
                }
                if (sgRulesCnt > 2) {
                    returnString += '<span class="moredataText">(' +
                        (str.length-2) + ' more)</span> \
                        <span class="moredata" style="display:none;" ></span>';
                }
            }
        }
        return returnString;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_VN_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    vnCfgEditView.model = new VNCfgModel();
                    vnCfgEditView.renderAddVNCfg({
                                              "title": 'Create Network',
                                              callback: function () {
                    $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }
    
    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView;
            vnCfgEditView.model = new VNCfgModel(dataView.getItem(rowIndex));
            vnCfgEditView.renderEditVNCfg({
                                  "title": 'Edit Network',
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getEditConfig('Edit Local', function(rowIndex) {
            var dataItem = $('#' + ctwl.CFG_VN_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: ctwc.GOHAN_NETWORK + '/' + dataItem.id + '/local_networks' + ctwc.GOHAN_PARAM,
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
                    parentObj.push(locationObj);
                }
                mainObj.entries = parentObj;
                vnCfgEditView.model = new LocationModel(mainObj);
                vnCfgEditView.renderLocationGridPopup({
                                     "title": 'Edit Local Network',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
           },function(error){
                contrail.showErrorMsg(error.responseText);
           });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dataItem = $('#' + ctwl.CFG_VN_GRID_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            vnCfgEditView.model = new VNCfgModel(dataItem);
            vnCfgEditView.renderDeleteVNCfg({
                                  "title": 'Delete Network',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      var dataView = $('#' + ctwl.CFG_VN_GRID_ID).data("contrailGrid")._dataView;
                                      dataView.refreshData();
            }});
        })
    ];
    function getVNCfgDetailsTemplateConfig() {
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
                                                    label: 'Name',
                                                    key: 'name',
                                                    keyClass:'col-xs-5',
                                                    templateGenerator: 'TextGenerator',
                                                    
                                                },
                                                {
                                                    label: 'Description',
                                                    key: 'description',
                                                    keyClass:'col-xs-5',
                                                    templateGenerator: 'TextGenerator',
                                                    
                                                },
                                                {
                                                    label: 'Id',
                                                    key: 'id',
                                                    keyClass:'col-xs-5',
                                                    templateGenerator: 'TextGenerator',
                                                    
                                                },
                                                {
                                                    label: 'Subnet',
                                                    key: 'cidr',
                                                    keyClass:'col-xs-5',
                                                    templateGenerator: 'TextGenerator',
                                                    
                                                },
                                                {
                                                    label: 'Local Prefix',
                                                    key: 'local_prefix_len',
                                                    keyClass:'col-xs-5',
                                                    templateGenerator: 'TextGenerator',
                                                    
                                                },
                                                {
                                                    key: 'policies',
                                                    templateGenerator: 'TextGenerator',
                                                    keyClass:'col-xs-5',
                                                    label: 'Attached Network Policies',
                                                    templateGeneratorConfig: {
                                                        formatter: 'networkPoliciesFormatter'
                                                    }
                                                }
                                            ]
                                        },
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };
    this.networkPoliciesFormatter = function(value, dc) {
        return networkPoliciesFormatter(null, null, null, value, dc, true);
    };
    return vnCfgGridView;
});
