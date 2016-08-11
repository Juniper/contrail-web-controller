/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/serviceapplianceset/ui/js/models/SvcApplianceSetModel',
    'config/infra/serviceapplianceset/ui/js/views/SvcApplianceSetEditView',
    'config/common/ui/js/svcTmpl.utils',
], function (_, ContrailView, SvcApplianceSetModel, SvcApplianceSetEditView,
             SvcTmplUtils) {
    var svcApplianceSetEditView = new SvcApplianceSetEditView(),
        svcTmplUtils = new SvcTmplUtils(),
        gridElId = "#" + ctwl.SVC_APPLIANCE_SET_GRID_ID;

    var SvcApplianceSetGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                getSvcApplianceSetGridViewConfig(viewConfig));
        }
    });

    var getSvcApplianceSetGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_SET_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.SVC_APPLIANCE_SET_GRID_ID,
                                title: ctwl.TITLE_SVC_APPLIANCE_SET,
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

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var svcApplianceSetModel = new SvcApplianceSetModel(dataItem);
            svcApplianceSetEditView.model = svcApplianceSetModel;
            svcApplianceSetEditView.renderEditSvcApplianceSet({
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
            var svcApplianceSetModel = new SvcApplianceSetModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var checkedRows = [dataItem];
            svcApplianceSetEditView.model = svcApplianceSetModel;
            svcApplianceSetEditView.renderDeleteSvcApplianceSet({
                    "title": ctwl.TITLE_DEL_SVC_APPLIANCE_SET +
                        ' (' + dataItem['display_name'] + ")",
                    checkedRows: checkedRows,
                    callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        })
    ];

    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_SVC_APPLIANCE_SET,
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    actionCell: rowActionConfig,
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(getServicaApplDetailsTmplConfig(),
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
                        text: 'Loading Service Appliance Sets..'
                    },
                    empty: {
                        text: 'No Service Appliance Sets Found.'
                    }
                }
            },
            columnHeader: {
                columns: svcApplianceSetColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    this.svcApplListFormatter = function(val, obj) {
        var dispStr = "";
        var svcApplList = getValueByJsonPath(obj, 'service_appliances', []);
        var len = svcApplList.length;
        if (!len) {
            return "-";
        }
        for (var i = 0; i < len; i++) {
            dispStr += svcApplList[i]['to'][2];
            if ((len != 1) && (i < len - 1)) {
                dispStr += ", ";
            }
        }
        return dispStr;
    }

    this.svcTemplateFormatter = function(val, obj) {
        return svcTmplUtils.svcTemplateFormatter(obj['service_template']);
    }

    this.displayNameFormatter = function(val, obj) {
        var displayName =
            ctwu.getDisplayNameOrName(obj);
        if ((null != displayName) && (displayName.length > 0)) {
            return displayName;
        }
        return "-";
    }

    this.svcApplSetPropFormatter = function(val, obj) {
        var dispStr = "";
        var keyValPair =
            getValueByJsonPath(obj,
                               'service_appliance_set_properties;key_value_pair', []);
        var len = keyValPair.length;
        if (!len) {
            return "-";
        }
        for (var i = 0; i < len; i++) {
            dispStr += '<span class="gridLabel">Key: </span>' + keyValPair[i]['key'];
            dispStr += '  <span class="gridLabel">Value: </span>' + keyValPair[i]['value'];
            dispStr += "<br>";
        }
        return dispStr;
    }

    this.svcApplSetNameFormatter = function(val, obj) {
        if (null != val) {
            return val[0] + ":" + val[1];
        }
        return "-";
    }

    function getServicaApplDetailsTmplConfig () {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-8',
                            rows: [{
                                title: ctwl.SVC_APPLIANCE_SET_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'uuid',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'displayNameFormatter'
                                        }
                                    },
                                    {
                                        key: 'uuid',
                                        label: 'UUID',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_appliance_driver',
                                        label: 'Load Balancer Driver',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_appliance_ha_mode',
                                        label: 'HA Mode',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_template',
                                        label: 'Service Template',
                                        valueClass: 'col-xs-8',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcTemplateFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_appliance_set_properties',
                                        label: 'Properties',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcApplSetPropFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_appliances',
                                        label: 'Associated Service Appliances',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter:
                                                'svcApplListFormatter'
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
    }

    var svcApplianceSetColumns = [
        {
            field: 'name',
            name: 'Name',
            cssClass: 'cell-hyperlink-blue',
            events: {
                onClick: function(e, dc) {
                    contrail.setCookie('serviceApplSet', dc.name);
                    layoutHandler.setURLHashParams({
                        uuid: dc.uuid
                    },
                    {
                        p: 'config_infra_sap',
                        merge: false,
                        triggerHashChange: true
                    });
                }
            }
        },
        {
            id: 'service_appliance_ha_mode',
            field: 'service_appliance_ha_mode',
            name: 'HA Mode',
            formatter: function(row, col, val, d, rowData) {
                if (null == val) {
                    return "-";
                }
                return val;
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        /*
        {
            id: 'service_appliance_set_properties',
            field: 'service_appliance_set_properties',
            name: 'Properties',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
                if ((null != val) && (null != val.key_value_pair)) {
                    var len = val.key_value_pair.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += '<span class="gridLabel">Key: </span>' + val.key_value_pair[i]['key'];
                        dispStr += '  <span class="gridLabel">Value: </span>' + val.key_value_pair[i]['value'];
                        dispStr += '<br>';
                        if (i == 1) {
                            break;
                        }
                    }
                    if (len > 2) {
                        dispStr += "(" + (len - 2).toString() + ' more)';
                    }
                    return dispStr;
                }
                return '-';
            }
        }
        */
    ];

    function getHeaderActionConfig(viewConfig) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_SVC_APPLIANCE_SET,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnActionDelSecGrp',
                "onClick": function() {
                     var svcApplianceSetModel = new SvcApplianceSetModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();
                    svcApplianceSetEditView.model = svcApplianceSetModel;
                    svcApplianceSetEditView.renderDeleteSvcApplianceSet({
                                  "title": ctwl.TITLE_DEL_SVC_APPLIANCE_SET,
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
                "title": ctwl.TITLE_CREATE_SVC_APPLIANCE_SET,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    svcApplianceSetModel = new SvcApplianceSetModel();
                    svcApplianceSetEditView.model = svcApplianceSetModel;
                    svcApplianceSetEditView.renderEditSvcApplianceSet({
                                  "title": ctwl.CREATE,
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

   return SvcApplianceSetGridView;
});

