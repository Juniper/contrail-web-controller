/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/serviceappliance/ui/js/models/SvcApplianceModel',
    'config/infra/serviceappliance/ui/js/views/SvcApplianceEditView',
    'config/common/ui/js/svcTmpl.utils'
], function (_, ContrailView, SvcApplianceModel, SvcApplianceEditView,
             SvcTmplUtils) {
    var svcApplianceEditView = new SvcApplianceEditView(),
        svcTmplUtils = new SvcTmplUtils(),
        gridElId = "#" + ctwl.SVC_APPLIANCE_GRID_ID;

    var SvcApplianceGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                                   getSvcApplianceGridViewConfig(viewConfig));
        }
    });

    var getSvcApplianceGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SVC_APPLIANCE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.SVC_APPLIANCE_GRID_ID,
                                title: ctwl.TITLE_SVC_APPLIANCE,
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

    function rowActionConfig(viewConfig) {
        return [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                dataItem["service_template"] =
                    viewConfig.svcApplData.svcApplSetSvcTmpl;
                var svcApplianceModel = new SvcApplianceModel(dataItem);
                svcApplianceModel.svcApplData = viewConfig.svcApplData;
                svcApplianceEditView.model = svcApplianceModel;
                var svcApplName =
                    (null != dataItem['display_name']) ? dataItem['display_name'] :
                        dataItem['fq_name'][2];
                svcApplianceEditView.renderEditSvcAppliance({
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
                var svcApplianceModel = new SvcApplianceModel();
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                var checkedRows = [dataItem];
                svcApplianceEditView.model = svcApplianceModel;
                svcApplianceEditView.renderDeleteSvcAppliance({
                        "title": ctwl.TITLE_DEL_SVC_APPLIANCE +
                            ' (' + dataItem['display_name'] + ")",
                        checkedRows: checkedRows,
                        callback: function () {
                    var dataView =
                        $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            })
        ];
    };

    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_SVC_APPLIANCE,
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    actionCell: rowActionConfig(viewConfig),
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
                        text: 'Loading Service Appliances..'
                    },
                    empty: {
                        text: 'No Service Appliances Found.'
                    }
                }
            },
            columnHeader: {
                columns: svcApplianceColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    this.svcApplPropFormatter = function(val, obj) {
        var dispStr = "";
        var keyValPair =
            getValueByJsonPath(obj,
                               'service_appliance_properties;key_value_pair', []);
        var len = keyValPair.length;
        if (!len) {
            return "-";
        }
        for (var i = 0; i < len; i++) {
            dispStr += '<span class="gridLabel">Key: </span>' +
                keyValPair[i]['key'];
            dispStr += '<span class="gridLabel">  Value: </span>' +
                keyValPair[i]['value'];
            dispStr += "<br>";
        }
        return dispStr;
    }

    this.svcApplInterfaeFormatter = function(val, obj) {
        var dispStr = "";
        var piData = getValueByJsonPath(obj, 'physical_interface_refs', []);
        var cnt = piData.length;
        if (!cnt) {
            return '-';
        }
        for (var i = 0; i < cnt; i++) {
            var intfType =
                getValueByJsonPath(piData[i], 'attr;interface_type', null);
            if (null == intfType) {
                continue;
            }
            dispStr += '<span class="gridLabel">';
            dispStr += intfType.replace(intfType[0], intfType[0].toUpperCase());
            dispStr += ':</span>';
            dispStr += piData[i]['to'][2] + " (" + piData[i]['to'][1] + ")";
            dispStr += "<br>";
        }
        return dispStr;
    }

    this.svcApplSetNameFormatter = function(val, obj) {
        if (null != val) {
            return val[1];
        }
        return "-";
    }

    this.svcTemplateFormatter = function(val, obj) {
        return svcTmplUtils.svcTemplateFormatter(obj['service_template']);
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
                                title: ctwl.SVC_APPLIANCE_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'display_name',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'uuid',
                                        label: 'UUID',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key:
                                            'service_appliance_user_credentials.username',
                                        label: 'Username',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'fq_name',
                                        label: 'Service Appliance Set',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcApplSetNameFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_template',
                                        label: 'Service Template',
                                        templateGenerator: 'TextGenerator',
                                        valueClass: 'col-xs-8',
                                        templateGeneratorConfig: {
                                            formatter: 'svcTemplateFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_appliance_ip_address',
                                        label: 'IP Address',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'physical_interface_refs',
                                        label: 'Interfaces',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter:
                                                'svcApplInterfaeFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_appliance_properties',
                                        label: 'Properties',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcApplPropFormatter'
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

    var svcApplianceColumns = [
        {
            field: 'name',
            name: 'Name',
            width: 40
        },
        {
            id: 'service_appliance_ip_address',
            field: 'service_appliance_ip_address',
            name: 'IP Address',
            width: 40,
            formatter: function(row, col, val, d, rowData) {
                return getValueByJsonPath(rowData,
                                          'service_appliance_ip_address',
                                          '-');
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            id: 'physical_interface_refs',
            field: 'physical_interface_refs',
            name: 'Interfaces',
            formatter: function(row, col, val, d, rowData) {
                if ((null == val) || (!val.length)) {
                    return "-";
                }
                var len = val.length;
                var traverseLen = (len > 2) ? 2 : len;
                var dispStr = "";
                for (var i = 0; i < traverseLen; i++) {
                    var intfType = getValueByJsonPath(val[i],
                                                      'attr;interface_type',
                                                      null);
                    if (null == intfType) {
                        continue;
                    }
                    var intfDispStr = intfType.replace(intfType[0],
                                                       intfType[0].toUpperCase());
                    dispStr += '<span class="gridLabel">' + intfDispStr +
                        ': </span>';
                    dispStr += val[i]['to'][2] + " (" + val[i]['to'][1] + ")";
                    dispStr += '<br>';
                }
                if (len > traverseLen) {
                    dispStr += "(" + (len - traverseLen).toString() + " more)";
                }
                return dispStr;
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        /*
        {
            id: 'service_appliance_properties',
            field: 'service_appliance_properties',
            name: 'Properties',
            formatter: function(row, col, val, d, rowData) {
                var dispStr = "";
                if ((null != val) && (null != val.key_value_pair)) {
                    var len = val.key_value_pair.length;
                    for (var i = 0; i < len; i++) {
                        dispStr += '<span class="gridLabel">Key: </span>';
                        dispStr += val.key_value_pair[i]['key'];
                        dispStr += '<span class="gridLabel">  Value: </span>';
                        dispStr += val.key_value_pair[i]['value'];
                        dispStr += '<br>';
                        if (1 == i) {
                            break;
                        }
                    }
                    if (len > 2) {
                        dispStr += "(" + (len - 2).toString() + " more)";
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
                "title": ctwl.TITLE_DEL_SVC_APPLIANCE,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnActionDelSecGrp',
                "onClick": function() {
                     var svcApplianceModel = new SvcApplianceModel();
                     var checkedRows =
                         $(gridElId).data("contrailGrid").getCheckedRows();
                    svcApplianceEditView.model = svcApplianceModel;
                    svcApplianceEditView.renderDeleteSvcAppliance({
                                  "title": ctwl.TITLE_DEL_SVC_APPLIANCE,
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
                "title": ctwl.TITLE_CREATE_SVC_APPLIANCE,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    var svcApplianceModel = new SvcApplianceModel({
                        service_template: viewConfig.svcApplData.svcApplSetSvcTmpl
                    });
                    svcApplianceModel.svcApplData = viewConfig.svcApplData;
                    svcApplianceEditView.model = svcApplianceModel;
                    svcApplianceEditView.renderEditSvcAppliance({
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

   return SvcApplianceGridView;
});

