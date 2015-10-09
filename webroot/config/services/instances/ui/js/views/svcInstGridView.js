/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/instances/ui/js/models/svcInstModel',
    'config/services/instances/ui/js/views/svcInstEditView'
], function (_, ContrailView, SvcInstModel, SvcInstEditView) {
    var svcInstEditView = new SvcInstEditView(),
    gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;

    var SvcInstGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            self.renderView4Config(self.$el, self.model,
                                   getSvcInstGridViewConfig(pagerOptions));
        }
    });

    var getSvcInstGridViewConfig = function (pagerOptions) {
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
                    text: ctwl.TITLE_SERVICE_INSTANCES
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    actionCell: function(dc) {
                        if ((null != dc) && (null != dc['svcTmplDetails']) &&
                            (null != dc['svcTmplDetails'][0])) {
                            var svcTmplDetails = dc['svcTmplDetails'];
                            var staticRtEnable = false;
                            var svcScaleEnable =
                                getValueByJsonPath(svcTmplDetails[0],
                                                   'service_template_properties;service_scaling',
                                                   null);
                            var intfTypes =
                                getValueByJsonPath(svcTmplDetails[0],
                                                   'service_template_properties;interface_type',
                                                   []);
                            var cnt = intfTypes.length;
                            for (var i = 0; i < cnt; i++) {
                                if (true ==
                                    intfTypes[i]['static_route_enable']) {
                                    staticRtEnable = true;
                                    break;
                                }
                            }
                            if ((true == svcScaleEnable) ||
                                (true == staticRtEnable)) {
                                return rowActionConfig;
                            }
                        }
                        return [rowActionConfig[1]];
                    },
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(getSvcInstDetailsTemplateConfig(),
                                                            cowc.APP_CONTRAIL_CONTROLLER)
                    },
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnActionDelSvcInst').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnActionDelSvcInst').removeClass('disabled-link');
                        }
                    },
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: svcInstColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var svcInstModel = new SvcInstModel(dataItem);
            showHideModelAttr(svcInstModel);
            svcInstEditView.model = svcInstModel;
            svcInstEditView.renderConfigureSvcInst({
                                  "title": ctwl.TITLE_EDIT_SERVICE_INSTANCE +
                                  ' (' + dataItem['display_name'] +
                                     ')',
                                  "isEdit": true,
                                  callback: function () {
                var dataView =
                    $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            var svcInstModel = new SvcInstModel();
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);

            var checkedRows = [dataItem];
            svcInstEditView.model = svcInstModel;
            svcInstEditView.renderDeleteSvcInst({
                                  "title": ctwl.TITLE_DEL_SERVICE_INSTANCES +
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

    function getSvcInstDetailsTemplateConfig () {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'span6',
                            rows: [{
                                title: ctwl.SVC_INST_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        key: 'name',
                                        label: 'Instance Name',
                                        templateGenerator: 'TextGenerator',
                                    },
                                    {
                                        key: 'display_name',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator',
                                    },
                                    {
                                        key: 'uuid',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_template_refs',
                                        label: 'Template',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcTmplFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        label: 'Number of instances',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'instCountFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        label: 'Networks',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'networksFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails',
                                        label: 'Image',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'imagesFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails',
                                        label: 'Flavor',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'flavorsFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        label: 'Availability Zone',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter:
                                                'availabilityZoneFormatter'
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }]
            }
        };
    };

    function svcTmplFormatter (row, col, val, d, rowData) {
        var dispStr = "-";
        if (('svcTmplDetails' in rowData) &&
            (rowData['svcTmplDetails'].length > 0) &&
            ('service_template_properties' in
             rowData['svcTmplDetails'][0]) &&
            ('service_mode' in
             rowData['svcTmplDetails'][0]['service_template_properties'])) {
            return rowData['svcTmplDetails'][0]['display_name'] + " (" +
                rowData['svcTmplDetails'][0]
                ['service_template_properties']['service_mode'] +
                " )";
        } else {
            if ((null != val) && (val.length > 0)) {
                if (('to' in val[0]) && (val[0]['to'].length)) {
                    return val[0]['to'][1];
                }
            }
        }
        return dispStr;
    }

    function instCountFormatter (row, col, val, d, rowData) {
        var svcTmplDetails =
            getValueByJsonPath(rowData, 'svcTmplDetails', null);
        if ((null != svcTmplDetails) && (null != svcTmplDetails[0])) {
            var svcTmplProp =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties', null);
            var ordIntf =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;ordered_interfaces',
                                   null);
            var svcType =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;service_type',
                                   null);
            if ((null != ordIntf) && (false != ordIntf) &&
                ('analyzer' != svcType) && ('firewall' != svcType)) {
                return "-";
            }
            var maxInst =
                getValueByJsonPath(rowData,
                                   'service_instance_properties;scale_out;max_instances',
                                   '-')
            if ("-" != maxInst) {
                if (1 == maxInst) {
                    return maxInst + " Instance";
                } else {
                    return maxInst + " Instance(s)";
                }
            }
            return maxInst;
        }
        return "-";
    }

    function networksFormatter (row, col, val, d, rowData) {
        var dispStr = "";
        if (null != rowData['service_instance_properties']) {
            var svcInstProp = rowData['service_instance_properties'];
            if (null != svcInstProp['management_virtual_network']) {
                dispStr += 'Management Network : ';
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['management_virtual_network']);
                dispStr += ', ';
            }
            if (null != svcInstProp['left_virtual_network']) {
                dispStr += "Left Network : ";
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['left_virtual_network']);
                dispStr += ', ';
            }
            if (null != svcInstProp['right_virtual_network']) {
                dispStr += "Right Network : ";
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['right_virtual_network']);
                dispStr += ', ';
            }
            /* Now check if we have other network */
            var intfList = svcInstProp['interface_list'];
            var intfListLen = intfList.length;
            var otherNetAdded = false;
            for (var i = 0; i < intfListLen; i++) {
                if ((intfList[i]['virtual_network'] !=
                     svcInstProp['management_virtual_network']) &&
                    (intfList[i]['virtual_network'] !=
                     svcInstProp['left_virtual_network']) &&
                    (intfList[i]['virtual_network'] !=
                     svcInstProp['right_virtual_network'])) {
                    if (false == otherNetAdded) {
                        dispStr += 'Other Network : ';
                        otherNetAdded = true;
                    }
                    dispStr +=
                        getVirtualNetworkDisplay(intfList[i]['virtual_network']);
                    if (i < intfListLen -1) {
                        dispStr += ', ';
                    }
                }
            }
        }
        return dispStr;
    }

    function imagesFormatter (row, col, val, d, rowData) {
        if (null != val) {
            return getValueByJsonPath(val[0],
                                      'service_template_properties;image_name',
                                      '-');
        } else {
            return "-";
        }
    }

    function flavorsFormatter (row, col, val, d, rowData) {
        if (null != val) {
            return getValueByJsonPath(val[0],
                                      'service_template_properties;flavor',
                                      '-');
        } else {
            return "-";
        }
    }

    function availabilityZoneFormatter (row, col, val, d, rowData) {
        if (null != val) {
            var zone =
                getValueByJsonPath(val[0],
                                   'service_template_properties;',
                                   null);
            if (("" == zone) || (null == zone)) {
                return "ANY:ANY";
            }
            return zone;
        }
        return "ANY:ANY";
    }

    function statusFormatter (row, col, val, d, rowData) {
        var svcTmplDetails =
            getValueByJsonPath(rowData, 'svcTmplDetails', null);
        if ((null != svcTmplDetails) && (null != svcTmplDetails[0])) {
            var svcTmplProp =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties', null);
            var ordIntf =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;ordered_interfaces',
                                   null);
            var svcType =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;service_type',
                                   null);
            if ((null != ordIntf) && (false != ordIntf) &&
                ('analyzer' != svcType) && ('firewall' != svcType)) {
                return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                    'Active');
            }
        }
        var vmStatus =
            getValueByJsonPath(rowData, 'statusDetails;vmStatus',
                               'Updating');
        if ("Spawning" == vmStatus) {
            return ('<img src="/img/loading.gif">&nbsp;&nbsp;' +
                    vmStatus);
        }
        if ("Inactive" == vmStatus) {
            return ('<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                    vmStatus);
        }
        if ("Partially Active" == vmStatus) {
            return ('<img src="/img/loading.gif">&nbsp;&nbsp;' +
                    vmStatus);
        }
        if ("Active" == vmStatus) {
            return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                    vmStatus);
        }
        if ("Error" == vmStatus) {
            return ('Request Failed.');
        }
        return vmStatus;
    }

    this.svcTmplFormatter = function(val, rowData) {
        return svcTmplFormatter(null, null, val, null, rowData);
    }

    this.networksFormatter = function(val, rowData) {
        return networksFormatter(null, null, val, null, rowData);
    }

    this.imagesFormatter = function (val, rowData) {
        return imagesFormatter(null, null, val, null, rowData);
    }

    this.flavorsFormatter = function (val, rowData) {
        return flavorsFormatter(null, null, val, null, rowData);
    }

    this.availabilityZoneFormatter = function (val, rowData) {
        return availabilityZoneFormatter(null, null, val, null, rowData);
    }

    this.instCountFormatter = function(val, rowData) {
        return instCountFormatter(null, null, val, null, rowData);
    }

    function getVirtualNetworkDisplay (vnFQN) {
        if (!vnFQN.length) {
            return 'Automatic';
        }
        var vnArr = vnFQN.split(':');
        if (3 != vnArr.length) {
            return vnFQN;
        }
        var projFQN = null;

        var projectObj = selectedDomainProjectData;
        if (null != projectObj) {
            projFQN = projectObj['fq_name'];
        }
        var idx = vnFQN.indexOf(projFQN + ":");
        if (-1 != idx) {
            return vnArr[2];
        }
        return vnArr[2] + "(" + vnArr[0] + ":" + vnArr[1] + ")";
    };

    var svcInstColumns = [
        {
            id: 'display_name',
            width: 55,
            field: 'display_name',
            name: 'Service Instance',
            cssClass :'cell-text-blue'
        },
        {
            name: 'Service Template',
            width: 55,
            formatter: function(row, col, val, d, rowData) {
                return svcTmplFormatter(row, col, val, d, rowData);
            }
        },
        {
            name: 'Status',
            width: 30,
            formatter: function(row, col, val, d, rowData) {
                return statusFormatter(row, col, val, d, rowData);
            }
        },
        {
            name: 'Number of instances',
            width: 35,
            formatter: function(row, col, val, d, rowData) {
                return instCountFormatter(row, col, val, d, rowData);
            }
        },
        {
            name: 'Networks',
            formatter: function(row, col, val, d, rowData) {
                return networksFormatter(row, col, val, d, rowData);
            }
        }
    ];

    function getSvcTmplDetailsByUIStr (uiSvcTmplStr) {
        var svcInstTmplts = $(gridElId).data('svcInstTmplts');
        var retFlag = false;
        if (null == uiSvcTmplStr) {
            return null;
        }
        var tmpl = getCookie('domain') + ':' + uiSvcTmplStr.split(' - [')[0];
        if (null == svcInstTmplts[tmpl]) {
            return null;
        }
        if (null == window.intfToBeTaken) {
            var intfTypeStrStart = uiSvcTmplStr.indexOf('(');
            var intfTypeStrEnd = uiSvcTmplStr.indexOf(')');
            var itfTypes =
                uiSvcTmplStr.substr(intfTypeStrStart + 1,
                               intfTypeStrEnd -
                               intfTypeStrStart - 1);
            window.intfTypes = itfTypes.split(',');
            window.intfToBeTaken = window.intfTypes[0];
        }
        return svcInstTmplts[tmpl];
    }

    function showHideModelAttr (model)
    {
        model.showInstCnt = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            var svcScaling =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;service_scaling',
                                   false);
            return svcScaling;
        }), model);
        model.showAvailibilityZone = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            var availZoneEnable =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;availability_zone_enable',
                                   false);
            return availZoneEnable;
        }), model);
        /*
        model.showStaticRTs = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            if ((null == window.intfToBeTaken) || (null == svcTmpl)) {
                return false;
            }
            var intf = window.intfToBeTaken.toLowerCase();
            var intfTypes =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;interface_type',
                                   []);
            var cnt = intfTypes.length;
            for (var i = 0; i < cnt; i++) {
                if (intfTypes[i]['service_interface_type'] == intf) {
                    if (intfTypes[i]['static_route_enable'] == true) {
                        retFlag = true;
                    } else {
                        retFlag = false;
                    }
                    break;
                }
            }
            if (null != window.intfTypes) {
                var idx = window.intfTypes.indexOf(window.intfToBeTaken);
                if (null != window.intfTypes[idx + 1]) {
                    window.intfToBeTaken = window.intfTypes[idx + 1];
                } else {
                    window.intfToBeTaken = null;
                }
            } else {
                window.intfToBeTaken = null;
            }
            return retFlag;
        }), model);
        */
    }

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_SERVICE_INSTANCE,
                "iconClass": "icon-plus",
                "onClick": function() {
                    window.intfToBeTaken = null;
                    window.intfTypes = [];
                    svcInstModel = new SvcInstModel();
                    if (!window.svcTmplsFormatted.length) {
                        return;
                    }
                    showHideModelAttr(svcInstModel);
                    svcInstEditView.model = svcInstModel;
                    svcInstEditView.renderConfigureSvcInst({
                        "title": ctwl.TITLE_CREATE_SERVICE_INSTANCE,
                        "isEdit": false,
                        callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    });
                }
            },
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_SERVICE_INSTANCES,
                "iconClass": 'icon-trash',
                "linkElementId": 'btnActionDelSvcInst',
                "onClick": function() {
                    svcInstModel = new SvcInstModel();
                    var checkedRows =
                        $(gridElId).data("contrailGrid").getCheckedRows();
                    svcInstEditView.model = svcInstModel;
                    svcInstEditView.renderDeleteSvcInst({
                                  title: ctwl.TITLE_DEL_SERVICE_INSTANCES,
                                  checkedRows: checkedRows,
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

   return SvcInstGridView;
});

