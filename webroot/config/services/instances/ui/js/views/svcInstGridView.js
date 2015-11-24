/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/instances/ui/js/models/svcInstModel',
    'config/services/instances/ui/js/views/svcInstEditView',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, SvcInstModel, SvcInstEditView, svcInstUtils) {
    var svcInstEditView = new SvcInstEditView(),
    gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var svcUtils = new svcInstUtils();

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
            addModelAttr(svcInstModel);
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
                            class: 'span12',
                            rows: [{
                                title: ctwl.SVC_INST_DETAILS,
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [
                                    {
                                        keyClass: 'span2',
                                        key: 'name',
                                        label: 'Instance Name',
                                        templateGenerator: 'TextGenerator',
                                    },
                                    {
                                        key: 'display_name',
                                        keyClass: 'span2',
                                        label: 'Display Name',
                                        templateGenerator: 'TextGenerator',
                                    },
                                    {
                                        key: 'uuid',
                                        keyClass: 'span2',
                                        templateGenerator: 'TextGenerator'
                                    },
                                    {
                                        key: 'service_template_refs',
                                        keyClass: 'span2',
                                        label: 'Template',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcTmplFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        keyClass: 'span2',
                                        label: '# Instance(s)',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'instCountFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        keyClass: 'span2',
                                        label: 'HA Mode',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'haModeFormatter',
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        keyClass: 'span2',
                                        label: 'Networks',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'networksFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails',
                                        keyClass: 'span2',
                                        label: 'Image',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'imagesFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails',
                                        keyClass: 'span2',
                                        label: 'Flavor',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'flavorsFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties',
                                        keyClass: 'span2',
                                        label: 'Availability Zone',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter:
                                                'availabilityZoneFormatter'
                                        }
                                    },
                                    {
                                        key: 'statusDetails',
                                        keyClass: 'span2',
                                        valueClass: 'span11',
                                        label: 'Instance Status',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcInstStatusFormatter'
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
                    return maxInst + " Instances";
                }
            }
            return maxInst;
        }
        return "-";
    }

    function haModeFormatter (row, col, val, d, rowData) {
        var haMode = getValueByJsonPath(rowData,
                                        'service_instance_properties;ha_mode',
                                        '-');
        return haMode;
    }

    function networksFormatter (row, col, val, d, rowData, isExpand) {
        var dispStr = "";
        if (null != rowData['service_instance_properties']) {
            var svcInstProp = rowData['service_instance_properties'];
            if (null != svcInstProp['management_virtual_network']) {
                dispStr += '<span class="gridLabel">Management: </span>';
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['management_virtual_network']);
                if (isExpand) {
                    dispStr += '<br>';
                } else {
                    dispStr += ',<br> ';
                }
            }
            if (null != svcInstProp['left_virtual_network']) {
                dispStr += '<span class="gridLabel">Left: </span>';
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['left_virtual_network']);
                if (isExpand) {
                    dispStr += '<br>';
                } else {
                    dispStr += ',<br> ';
                }
            }
            if (null != svcInstProp['right_virtual_network']) {
                dispStr += '<span class="gridLabel">Right: </span>';
                dispStr +=
                    getVirtualNetworkDisplay(svcInstProp['right_virtual_network']);
                if (isExpand) {
                    dispStr += '<br>';
                } else {
                    dispStr += ',<br> ';
                }
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
                        dispStr += '<span class="gridLabel">Other: </span>';
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

    function svcInstStatusFormatter (row, col, val, d, rowData) {
        var vmDetails =
            getValueByJsonPath(rowData,
                               'statusDetails;VMDetails', []);
        var vmCnt = vmDetails.length;
        var returnHtml = '';
        var statusDataList = [];
        for (var i = 0; i < vmCnt; i++) {
            var serId = getValueByJsonPath(vmDetails[i], 'server;id', null);
            if (null == serId) {
                console.error("serId got errorceous");
                continue;
            }
            var serName = getValueByJsonPath(vmDetails[i], 'server;name', "-");
            var serStatus = getValueByJsonPath(vmDetails[i], 'server;status',
                                               "-");
            var pwrState = getValueByJsonPath(vmDetails[i],
                                              'server;OS-EXT-STS:power_state',
                                              '-');
            pwrState = svcUtils.getPowerState(pwrState);
            var addr = getValueByJsonPath(vmDetails[i], 'server;addresses', {});
            var addrStr = "";
            for (key in addr) {
                addrStr += key.toString();
                if (addr[key].length > 0) {
                    addrStr += ':';
                    addrStr += (null != addr[key][0]['addr']) ?
                        addr[key][0]['addr'] : '-';
                } else {
                    addrStr += "~~";
                }
                addrStr += ' <br>';
            }
            statusDataList.push({id: serId, name: serName, status: serStatus,
                                address: addrStr, state: pwrState});
        }
        var cnt = statusDataList.length;
        if (!cnt) {
            return 'No Service Instance found.';
        }
        var statusHeader =
            '<tr class="bgCol">' +
                 '<td class="span3"><label>Virtual Machine</label></td>' +
                 '<td class="span2"><label>Status</label></td>' +
                 '<td class="span2"><label>Power State</label></td>' +
                 '<td class="span3"><label>Networks</label></td>' +
                 '<td class="span2"><label></label></td>' +
              '</tr>'
        returnHtml += statusHeader;
        for (i = 0; i < cnt; i++) {
            returnHtml += '<tr>';
            returnHtml += '<td class="span3">' + statusDataList[i]['name'] +
                '</td>';
            returnHtml += '<td class="span2">';
            var stat = String(statusDataList[i]['status']).toUpperCase();
            if ('SPAWNING' == stat) {
                returnHtml += '<img src="/img/loading.gif">';
            } else if ('INACTIVE' == stat) {
                returnHtml += '<span class="status-badge-rounded status-inactive"></span>';
            } else if ('PARTIALLY ACTIVE' == stat) {
                returnHtml += '<img src="/img/loading.gif">'
            } else if ('ACTIVE' == stat) {
                returnHtml += '<span class="status-badge-rounded status-active"></span>'
            } else if ('UPDATE' == stat) {
                returnHtml += 'Updating';
            }
            returnHtml += statusDataList[i]['status'] + ' </td>';
            returnHtml += '<td class="span2">' + statusDataList[i]['state'] +
                '</td>';
            var instDetailStr = statusDataList[i]['address'].split('~~');
            if (instDetailStr.length > 1) {
                returnHtml += '<td class="span3">';
                var msgSplit = instDetailStr[0].split(" ");
                var msgStr = msgSplit[msgSplit.length - 1] +
                    " IP Address not assigned.";
                var strLen = instDetailStr.length;
                for(var inc = 0; inc < strLen - 1; inc++) {
                    returnHtml += '&nbsp;&nbsp;<span class="status-badge-rounded status-inactive" title="#= msgStr #" ></span>'
                    returnHtml += instDetailStr[inc + 1];
                }
                returnHtml += '</td>';
            } else {
                returnHtml += '<td class="span2">'+ instDetailStr +'</td>';
            }
            returnHtml += '<td class="span2"><a onClick="showViewConsoleWindow(\'' +
                statusDataList[i]['id'] +'\', \''+ statusDataList[i]['name'] +
                '\');"> View Console </a></td>';
            returnHtml += '</tr>';
        }
        returnHtml = "<table class='table detailsSub'>" + returnHtml + "</table>";
        return returnHtml;
    }

    this.showViewConsoleWindow = function(vmUUID, name) {
        var selectedProject = window.projectDomainData.name;
        var ajaxConfig = {
            url: '/api/tenants/config/service-instance-vm?project_id=' +
                     selectedProject + "&vm_id=" + vmUUID,
            type: "GET"
        };
        contrail.ajaxHandler(ajaxConfig, null, function(result) {
            var href = jsonPath(result, "$.console.url")[0];
            window.open(href);
        });
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
        return networksFormatter(null, null, val, null, rowData, true);
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

    this.svcInstStatusFormatter = function(val, rowData) {
        return svcInstStatusFormatter(null, null, val, null, rowData);
    }

    this.instCountFormatter = function(val, rowData) {
        return instCountFormatter(null, null, val, null, rowData);
    }

    this.haModeFormatter = function(val, rowData) {
        return haModeFormatter(null, null, val, null, rowData);
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
        return vnArr[2] + " (" + vnArr[0] + ":" + vnArr[1] + ")";
    };

    var svcInstColumns = [
        {
            id: 'display_name',
            width: 55,
            field: 'display_name',
            name: 'Service Instance'
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
            name: '# Instance(s)',
            width: 35,
            formatter: function(row, col, val, d, rowData) {
                return instCountFormatter(row, col, val, d, rowData);
            }
        },
        {
            name: 'Networks',
            formatter: function(row, col, val, d, rowData) {
                return networksFormatter(row, col, val, d, rowData, false);
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
            window.intfTypes = itfTypes.split(', ');
            window.intfToBeTaken = window.intfTypes[0];
        }
        return svcInstTmplts[tmpl];
    }

    function addModelAttr (model)
    {
        model.isHAModeDropDownDisabled = ko.computed((function() {
            var instCnt = this.no_of_instances();
            if (instCnt > 1) {
                return false;
            }
            return true;
        }), model);
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
                    addModelAttr(svcInstModel);
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

