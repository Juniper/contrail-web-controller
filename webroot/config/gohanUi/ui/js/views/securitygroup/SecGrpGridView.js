/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/gohanUi/ui/js/models/SecGrpModel',
    'config/gohanUi/ui/js/views/securitygroup/SecGrpEditView',
    'config/gohanUi/ui/js/views/securitygroup/SecGrpAddView',
    'config/gohanUi/ui/js/models/locationModel'
], function (_, ContrailView, SecGrpModel, SecGrpEditView, SecGrpAddView, LocationModel) {
    var secGrpEditView = new SecGrpEditView(),
    secGrpAddView = new SecGrpAddView(),
    gridElId = "#" + ctwl.SEC_GRP_GRID_ID;

     var SecGrpGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this;
            self.renderView4Config(self.$el, self.model,
                                   getSecGrpGridViewConfig());
        }
    });

    var getSecGrpGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SEC_GRP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.SEC_GRP_GRID_ID,
                                title: ctwl.TITLE_SEC_GRP,
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
                    text: ctwl.TITLE_SEC_GRP
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template:
                                cowu.generateDetailTemplateHTML(getSecGenDetailsTempConfig(),
                                                                cowc.APP_CONTRAIL_CONTROLLER),
                                onExpand: function(event, obj){
                                    ctwu.getSecurityRulesGrid(event, obj, 'security_groups', ctwl.SEC_GRP_GRID_ID);
                                }
                    },
                    checkboxSelectable: false,
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Security Groups.',
                    },
                    empty: {
                        text: 'No Security Groups Found.'
                    }
                }
            },
            columnHeader: {
                columns: secGrpColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    function getSecGenDetailsTempConfig () {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                title: ctwl.SEC_GRP_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'name',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'description',
                                        label: 'Description',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'id',
                                        label: 'Id',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'sgRules',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Rules',
                                        templateGeneratorConfig: {
                                            formatter: 'secGrpRulesFormatter'
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }]
            }
        }
    };
    this.secGrpRulesFormatter = function(value, dc) {
        return secGrpRulesFormatter(null, null, null, value, dc, true);
    };
    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            secGrpAddView.model = new SecGrpModel(dataItem);
            secGrpAddView.renderConfigureSecGrp({
                                  "title": 'Update Security Group',
                                  "mode": 'edit',
                                  callback: function () {
                                       dataView.refreshData();
                                  }});
        }),
        ctwgc.getEditConfig('Edit Local Security Group', function(rowIndex) {
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            var ajaxConfig = {
                    url: './gohan_contrail/v1.0/tenant/security_groups/'+dataItem.id+'/local_security_groups?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+dataItem.tenant_id,
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
                secGrpEditView.model = new LocationModel(mainObj);
                secGrpEditView.renderLocationGridPopup({
                                     "title": 'Update Local Security Group',
                                      callback: function () {
                                          dataView.refreshData();
                                      }});
            },function(error){
                contrail.showErrorMsg(error.responseText);
            });
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var dataView = $(gridElId).data("contrailGrid")._dataView;
            secGrpEditView.model = new SecGrpModel(dataItem);
            secGrpEditView.renderDeleteSecGrps({
                                  "title": 'Delete Security Group',
                                  selectedGridData: [dataItem],
                                  callback: function () {
                                      dataView.refreshData();
                                  }});
        })
    ];

    var secGrpColumns = [
        {
            id: 'name',
            field: 'name',
            name: 'Security Group'
        },
        {
            id: "description",
            field: "description",
            name: "Description"
        },
        {
            id: "sgRules",
            field: "sgRules",
            name: "Rules",
            width: 350,
            formatter: secGrpRulesFormatter,
            sortable: {
                sortBy: 'formattedValue'
            }
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_SEC_GRP,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    secGrpAddView.model = new SecGrpModel();
                    secGrpAddView.renderConfigureSecGrp({
                                  "title": 'Create Security Group',
                                  "mode": 'add',
                                  callback: function() {
                                        var dataView = $(gridElId).data("contrailGrid")._dataView;
                                        dataView.refreshData();
                                   }});
                }
            }
        ];
        return headerActionConfig;
    }
    function secGrpRulesFormatter(r, c, v, cd, dc, showAll) {
        var returnString = "",rules = [];
        if(dc.sgRules != undefined){
            for(var k=0; k < dc.sgRules.length; k++){
                if(dc.sgRules[k].port_range_max < 65535){
                    var ports = '[ '+ dc.sgRules[k].port_range_min + '-' + dc.sgRules[k].port_range_max+' ]';
                }else{
                    var ports = 'any';
                }
                var rulesText = '<span class="rule-format">'+ dc.sgRules[k].direction +'</span>' + '&nbsp&nbsp<span class="rule-format">'+dc.sgRules[k].ethertype+ '</span>&nbsp&nbsp'+
                 '<span>protocol</span>&nbsp<span class="rule-format">'+dc.sgRules[k].protocol+'</span>&nbsp&nbsp<span>ports</span>&nbsp<span class="rule-format">'+ ports+ '</span>';
                   rules.push(rulesText);
            }
            if (typeof rules === "object") {
                var sgRulesCnt = rules.length;
                if ((null != showAll) && (true == showAll)) {
                    for (var i = 0; i < sgRulesCnt; i++) {
                        if (typeof rules[i] !== "undefined") {
                            returnString += rules[i] + "<br>";
                        }
                    }
                    return returnString;
                }
                for (var i = 0; i < sgRulesCnt, i < 2; i++) {
                    if (typeof rules[i] !== "undefined") {
                        returnString += rules[i] + "<br>";
                    }
                }
                if (sgRulesCnt > 2) {
                    returnString += '<span class="moredataText">(' +
                        (rules.length-2) + ' more)</span> \
                        <span class="moredata" style="display:none;" ></span>';
                }
            }
        }
        return returnString;
    }

   return SecGrpGridView;
});
