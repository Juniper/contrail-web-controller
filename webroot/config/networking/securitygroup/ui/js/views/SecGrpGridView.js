/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/securitygroup/ui/js/models/SecGrpModel',
    'config/networking/securitygroup/ui/js/views/SecGrpEditView',
    'config/networking/securitygroup/ui/js/SecGrpUtils'
], function (_, ContrailView, SecGrpModel, SecGrpEditView, SecGrpUtils) {
    var secGrpEditView = new SecGrpEditView(),
        gridElId = "#" + ctwl.SEC_GRP_GRID_ID;

    var sgUtils = new SecGrpUtils();

    var SecGrpGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            secGrpEditView.sgDataObj = viewConfig.sgDataObj;
            self.renderView4Config(self.$el, self.model,
                                   getSecGrpGridViewConfig(pagerOptions));
        }
    });

    var getSecGrpGridViewConfig = function (pagerOptions) {
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
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions) {
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
                                                                cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelSecGrp').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelSecGrp').removeClass('disabled-link');
                        }
                    },
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
                            class: 'col-xs-6',
                            rows: [{
                                title: ctwl.SEC_GRP_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'display_name',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'configured_security_group_id',
                                        templateGenerator: 'TextGenerator',
                                        label: 'Security Group ID',
                                        templateGeneratorConfig: {
                                            formatter: 'secGrpIDFormatter'
                                        }
                                    },
                                    {
                                        key: 'uuid',
                                        label: 'UUID',
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
                            },
                            //permissions
                            ctwu.getRBACPermissionExpandDetails()]
                        }]
                    }
                }]
            }
        }
    };

    this.secGrpRulesFormatter = function(value, dc) {
        return sgUtils.secGrpRulesFormatter(null, null, null, value, dc, true);
    };

    this.secGrpIDFormatter = function(val, obj) {
        var dispStr = "";
        if (0 == Number(val)) {
            dispStr = "Auto Configured ";
            if ('security_group_id' in obj) {
                dispStr += "(" + obj['security_group_id'] + ")";
            }
        } else {
            dispStr = val;
        }
        return dispStr;
    };

    function showHideModelAttr (secGrpModel) {
        secGrpModel.showConfigSecGrpID = ko.computed((function() {
            return ((true == this.is_sec_grp_id_auto()) ||
                    ("true" == this.is_sec_grp_id_auto())) ? false : true;
        }), secGrpModel);
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var secGrpModel = new SecGrpModel(dataItem);
            showHideModelAttr(secGrpModel);
            secGrpEditView.model = secGrpModel;
            secGrpEditView.renderConfigureSecGrp({
                                  "title": ctwl.EDIT,
                                  rowIndex: rowIndex,
                                  dataItem: dataItem,
                                  isEdit: true,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var secGrpModel = new SecGrpModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var checkedRows = [dataItem];
            secGrpEditView.model = secGrpModel;
            secGrpEditView.renderDeleteSecGrps({
                                  "title": ctwl.TITLE_DEL_SEC_GRP +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  checkedRows: checkedRows,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];

    var secGrpColumns = [
        {
            id: 'display_name',
            field: 'display_name',
            name: 'Security Group',
        },
        {
            id: "sgRules",
            field: "sgRules",
            name: "Rules",
            width: 650,
            formatter: sgUtils.secGrpRulesFormatter,
            sortable: {
                sortBy: 'formattedValue'
            }
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_SEC_GRP,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnActionDelSecGrp',
                "onClick": function() {
                     var secGrpModel = new SecGrpModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();

                    secGrpEditView.model = secGrpModel;
                    secGrpEditView.renderDeleteSecGrps({
                                  "title": ctwl.TITLE_DEL_SEC_GRP,
                                  checkedRows: checkedRows,
                                  callback: function () {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_SEC_GRP,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    var projFqn = [getCookie('domain'),
                        getCookie('project')];
                    secGrpModel = new SecGrpModel();
                    showHideModelAttr(secGrpModel);
                    secGrpEditView.model = secGrpModel;
                    secGrpEditView.renderConfigureSecGrp({
                                  "title": ctwl.CREATE,
                                  "isEdit": false,
                                  projFqn: projFqn,
                                  callback: function() {
                        var dataView =
                            $(gridElId).data("contrailGrid")._dataView;
                        dataView.refreshData();
                    }});
                }
            }
        ];
        return headerActionConfig;
    }

   return SecGrpGridView;
});


