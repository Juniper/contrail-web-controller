/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/instances/ui/js/models/svcInstModel',
    'config/services/instances/ui/js/views/svcInstEditView',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, SvcInstModel, SvcInstEditView, svcUtils) {
    var svcInstEditView = new SvcInstEditView(),
    gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;

    var SvcInstGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            svcInstEditView.svcInstanceDataObj = viewConfig.svcInstanceDataObj;
            self.renderView4Config(self.$el, self.model,
                                   getSvcInstGridViewConfig(pagerOptions,
                                   viewConfig.svcInstanceDataObj));
        }
    });

    var getSvcInstGridViewConfig = function (pagerOptions, svcInstanceDataObj) {
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
                                    elementConfig: getConfiguration(
                                        pagerOptions, svcInstanceDataObj)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (pagerOptions, svcInstanceDataObj) {
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
                columns: svcInstColumns
            },
            footer: {
            }
        };
        return gridElementConfig;
    };

    function subscribeModelChangeEvents (svcInstModel) {
        svcInstModel.__kb.view_model.model().on('change:display_name',
                                            function(model, newValue) {
            svcInstModel.changePortTupleName();
        });
    }

    function rowActionConfig(svcInstanceDataObj) {
        return [
            ctwgc.getEditConfig('Edit', function(rowIndex) {
                var dataItem =
                    $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
                var svcTmplDetails = dataItem['svcTmplDetails'];
                var svcTmplVer =
                    getValueByJsonPath(svcTmplDetails,
                                       '0;service_template_properties;version', 1);
                var intfList =
                    getValueByJsonPath(dataItem,
                                       'service_instance_properties;interface_list',
                                       []);
                var intfListLen = intfList.length;
                var setVNList = [];
                if (2 == svcTmplVer) {
                    for (var i = 0; i < intfListLen; i++) {
                        setVNList[i] = intfList[i]['virtual_network'];
                    }
                }
                dataItem.svcInstanceDataObj = svcInstanceDataObj;
                var svcInstModel = new SvcInstModel(dataItem);
                svcInstModel.svcInstanceDataObj = svcInstanceDataObj;
                addModelAttr(svcInstModel, svcInstanceDataObj);
                svcInstEditView.model = svcInstModel;
                svcInstModel.editView = svcInstEditView;
                svcInstEditView.renderConfigureSvcInst({
                                  "title": ctwl.EDIT,
                                  dataItem: dataItem,
                                  'setVNList': setVNList,
                                  "isEdit": true,
                                  callback: function () {
                    var dataView =
                        $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }),
            ctwgc.getDeleteConfig('Delete', function(rowIndex) {
                var svcInstModel = new SvcInstModel({
                    svcInstanceDataObj: svcInstanceDataObj});
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
                                        label: '# Instance(s)',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'instCountFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties.ha_mode',
                                        label: 'HA Mode',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'haModeFormatter',
                                        }
                                    },
                                    {
                                        key: 'service_instance_properties.interface_list',
                                        label: 'Networks',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'networksFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails[0].' +
                                        'service_template_properties.image_name',
                                        label: 'Image',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'imagesFormatter'
                                        }
                                    },
                                    {
                                        key: 'port_tuples',
                                        label: 'Port Tuples',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'portTuplesFormatter'
                                        }
                                    },
                                    {
                                        key: 'service_health_check_back_refs',
                                        label: 'Service Health Checks',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcHealtchChksFormatter'
                                        }
                                    },
                                    {
                                        key: 'interface_route_table_back_refs',
                                        label: 'Interface Route Tables',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'intfRtTablesFormatter'
                                        }
                                    },
                                    {
                                        key: 'routing_policy_back_refs',
                                        label: 'Routing Policys',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'routingPolicyFormatter'
                                        }
                                    },
                                    {
                                        key: 'route_aggregate_back_refs',
                                        label: 'Route Aggregates',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'rtAggFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails[0].' +
                                           'service_template_properties.flavor',
                                        label: 'Flavor',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'flavorsFormatter'
                                        }
                                    },
                                    {
                                        key: 'svcTmplDetails[0].' +
                                            'service_template_properties.' +
                                            'availability_zone_enable',
                                        label: 'Availability Zone',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter:
                                                'availabilityZoneFormatter'
                                        }
                                    },
                                    {
                                        key: 'statusDetails',
                                        valueClass: 'col-xs-11',
                                        label: 'Instance Status',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcInstStatusFormatter'
                                        }
                                    },
                                    {
                                        key: 'statusDetails',
                                        valueClass: 'col-xs-11',
                                        label: 'Interface Status',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcInstIntfStatusFormatter'
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
            var version =
                getValueByJsonPath(rowData['svcTmplDetails'][0],
                                   'service_template_properties;version',
                                   1);
            return rowData['svcTmplDetails'][0]['display_name'] + " (" +
                rowData['svcTmplDetails'][0]
                ['service_template_properties']['service_mode'] +
                ", version " + version.toString() + ")";
        } else {
            if ((null != val) && (val.length > 0)) {
                if (('to' in val[0]) && (val[0]['to'].length)) {
                    return val[0]['to'][1];
                }
            }
        }
        return dispStr;
    }

    function getV2SvcInstCount (dataObj, isExpand) {
        var portTuples = dataObj['port_tuples'];
        var portTuplesCnt = 0;
        var noInstCnt = 0;
        if ((null == portTuples) || (!portTuples.length)) {
            return '-';
        }
        portTuplesCnt = portTuples.length;
        var vmRefsAssigned;
        var vmRefs = {};
        for (var i = 0; i < portTuplesCnt; i++) {
            var vmListObjs = {};
            var vmList = [];
            var vmis = portTuples[i]['vmis'];
            if (null == vmis) {
                return '-';
            }
            var vmisCnt = vmis.length;
            var found = true;
            for (var j = 0; j < vmisCnt; j++) {
                vmRefs = getValueByJsonPath(vmis[j],
                                            'virtual_machine_refs', []);
                var vmId = getValueByJsonPath(vmRefs, '0;uuid', null);
                if (null == vmId) {
                    found = false;
                    break;
                }
                if (0 == j) {
                    vmListObjs = {};
                    vmListObjs[vmId] = true;
                } else {
                    if (null == vmListObjs[vmId]) {
                        if (isExpand) {
                            var errStr = 'Error';
                            errStr +=
                                ' (Different virtual machine ' +
                                'associated wth same port-tuple)';
                            return errStr;
                        } else {
                            return '-';
                        }
                    }
                }
            }
            if (true == found) {
                noInstCnt++;
            }
        }
        if (noInstCnt > portTuplesCnt) {
            var errStr = 'Error';
            if (isExpand) {
                errStr += ' (One / more port tuple have more than one ' +
                          'virtual machine)';
                return errStr;
            } else {
                return '-';
            }
        }
        if (!noInstCnt) {
            return '-';
        }
        return noInstCnt;
    }

    function instCountFormatter (row, col, val, d, rowData, isExpand) {
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
            var tmplVersion =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;version',
                                   1);
            if (2 == tmplVersion) {
                return getV2SvcInstCount(rowData, isExpand);;
            }
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
                    return maxInst;
                } else {
                    return maxInst;
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
        if ((null == rowData['svcTmplDetails']) ||
            (null == rowData['svcTmplDetails'][0])) {
            return "-";
        }
        var tmplObj = rowData['svcTmplDetails'][0];
        var intfList =
            getValueByJsonPath(rowData,
                               'service_instance_properties;interface_list',
                               []);
        if (!intfList.length) {
            return "-";
        }
        var intfTypes =
            getValueByJsonPath(tmplObj,
                               'service_template_properties;interface_type',
                               []);
        if (!intfTypes.length) {
            return "-";
        }
        var intfCnt = intfTypes.length;
        var len = intfCnt;
        if (false == isExpand) {
            len = (intfCnt > 2) ? 2 : intfCnt;
        }
        for (var i = 0; i < len; i++) {
            var intfType = intfTypes[i]['service_interface_type'];
            dispStr += '<span class="gridLabel">' +
                intfType.replace(intfType[0], intfType[0].toUpperCase()) +
                ': </span>';
            if ((null == intfList[i]) ||
                (null == intfList[i]['virtual_network'])) {
                dispStr += '-';
            } else {
                dispStr +=
                    getVirtualNetworkDisplay(intfList[i]['virtual_network']);
            }
            dispStr += '<br>';
        }
        if ((false == isExpand) && (intfCnt > 2)) {
            dispStr += '(' + (intfCnt - 2).toString() + ' more)';
        }
        return dispStr;
    }

    function imagesFormatter (row, col, val, d, rowData) {
        if (null != val) {
            return getValueByJsonPath(rowData,
                                      'svcTmplDetails;0;service_template_properties;image_name',
                                      '-');
        } else {
            return "-";
        }
    }

    function flavorsFormatter (row, col, val, d, rowData) {
        if (null != val) {
            return getValueByJsonPath(rowData,
                                      'svcTmplDetails;0;service_template_properties;flavor',
                                      '-');
        } else {
            return "-";
        }
    }

    function portTuplesFormatter (row, col, val, d, rowData, isExpand) {
        var dispStr = "";
        if (null != val) {
            var len = val.length;
            if (false == isExpand) {
                len = (len > 2) ? 2 : len;
            }
            for (var i = 0; i < len; i++) {
                dispStr += val[i]['to'][3];
                dispStr += '<br>';
            }
            if ((false == isExpand) && (len < val.length)) {
                dispStr += '(' + (val.length - len).toString() + ' more)';
            }
            return dispStr;
        }
        return "-";
    }

    function routingPolicyFormatter (row, col, val, d, rowData) {
        var dispStr = "";
        if (null == val) {
            return "-";
        }
        var len = val.length;
        var leftList = [];
        var rightList = [];
        for (var i = 0; i < len; i++) {
            var leftIntfSeq =
                getValueByJsonPath(val[i], 'attr;left_sequence',
                                   null);
            var rtPolicyStr =
                ((contrail.getCookie('domain') == val[i]['to'][0]) &&
                 (contrail.getCookie('project') == val[i]['to'][1])) ?
                val[i]['to'][2] : val[i]['to'][2] + ' (' +
                    val[i]['to'][0] + ':' + val[i]['to'][1] + ')';
            if (null != leftIntfSeq) {
                leftList.push({seqId: Number(leftIntfSeq),
                              rtPolicy: rtPolicyStr});
            }
            var rtIntfSeq =
                getValueByJsonPath(val[i], 'attr;right_sequence',
                                   null);
            if (null != rtIntfSeq) {
                rightList.push({seqId: Number(rtIntfSeq),
                               rtPolicy: rtPolicyStr});
            }
        }
        var rtList = [];
        if (leftList.length > 0) {
            leftList.sort(function(entry1, entry2) {
                return entry1.seqId - entry2.seqId;
            });
            var len = leftList.length;
            for (var i = 0; i < len; i++) {
                rtList.push(leftList[i]['rtPolicy']);
            }
            dispStr += '(Interface Type: ';
            dispStr += '<span class="gridLabel">left</span>';
            dispStr += ") ";
            dispStr += rtList.join(', ');
            dispStr += '<br>';
        }
        rtList = [];
        if (rightList.length > 0) {
            rightList.sort(function(entry1, entry2) {
                return entry1.seqId - entry2.seqId;
            });
            var len = rightList.length;
            for (var i = 0; i < len; i++) {
                rtList.push(rightList[i]['rtPolicy']);
            }
            dispStr += '(Interface Type: ';
            dispStr += '<span class="gridLabel">right</span>';
            dispStr += ") ";
            dispStr += rtList.join(', ');
        }
        return dispStr;
    }

    function svcInstBackRefsFormatter (row, col, val, d, rowData) {
        var dispStr = "";
        if (null == val) {
            return "-";
        }
        var refObjs = {};
        var len = val.length;
        for (var i = 0; i < len; i++) {
            var intfType =
                getValueByJsonPath(val[i], 'attr;interface_type', "");
            if (null == refObjs[intfType]) {
                refObjs[intfType] = [];
            }
            var value =
                ((contrail.getCookie('domain') == val[i]['to'][0]) &&
                 (contrail.getCookie('project') == val[i]['to'][1])) ?
                val[i]['to'][2] : val[i]['to'][2] + ' (' +
                    val[i]['to'][0] + ':' + val[i]['to'][1] + ')';
            refObjs[intfType].push(value);
        }
        for (intfType in refObjs) {
            dispStr += '(Interface Type: ';
            dispStr += '<span class="gridLabel">' + intfType + '</span>';
            dispStr += ") ";
            dispStr += refObjs[intfType].join(', ');
            dispStr += "<br>";
        }
        return dispStr;
    }

    function availabilityZoneFormatter (row, col, val, d, rowData) {
        var tmplVersion =
            getValueByJsonPath(rowData,
                               'svcTmplDetails;0;service_template_properties;version',
                               1);
        if (2 == tmplVersion) {
            return '-';
        }
        if (null != val) {
            var zone =
                getValueByJsonPath(val,
                                   'availability_zone',
                                   null);
            if (("" == zone) || (null == zone)) {
                return "ANY:ANY";
            }
            return zone;
        }
        return "ANY:ANY";
    }

    function svcInstIntfStatusFormatter (row, col, val, d, rowData) {
        var svcTmplVer =
            getValueByJsonPath(rowData,
                               'svcTmplDetails;0;service_template_properties;version',
                               1);
        var parentIDToNameMaps = {};
        if (1 == svcTmplVer) {
            var vms = getValueByJsonPath(rowData, 'virtual_machine_back_refs',
                                         []);
            var vmsCnt = vms.length;
            for (var i = 0; i < vmsCnt; i++) {
                var vmID = vms[i]['uuid'];
                parentIDToNameMaps[vmID] = vms[i]['to'][0];
            }
        } else {
            var portTuples = getValueByJsonPath(rowData, 'port_tuples', []);
            var portTuplesCnt = portTuples.length;
            for (var i = 0; i < portTuplesCnt; i++) {
                var portTupleID = portTuples[i]['uuid'];
                parentIDToNameMaps[portTupleID] = portTuples[i]['to'][3];
            }
        }
        var hlthChkStatusData =
            getValueByJsonPath(rowData, 'statusDetails;healthCheckStatus',
                               null);
        if (null == hlthChkStatusData) {
            return "-";
        }
        var statusObjList = [];
        for (var key in hlthChkStatusData) {
            var parName = key;
            if (null != parentIDToNameMaps[key]) {
                parName = parentIDToNameMaps[key];
            }
            for (var vmi in hlthChkStatusData[key]) {
                if ('vmis' == vmi) {
                    continue;
                }
                var hlthCheckInstList = getValueByJsonPath(hlthChkStatusData,
                                                           key + ';' + vmi +
                                                           ';health_check_instance_list',
                                                           []);
                var vmiIP = getValueByJsonPath(hlthChkStatusData, key + ';' +
                                               vmi + ';ip_address', "-");
                var isActive = getValueByJsonPath(hlthChkStatusData, key + ';'
                                                    + vmi + ';active', "-");
                var intfStatus =
                    '<span class="status-badge-rounded status-partially-active"></span>' + "InActive";
                if (true == isActive) {
                    intfStatus =
                        '<span class="status-badge-rounded status-active"></span>' + "Active";
                }
                var hlthCheckInstListLen = hlthCheckInstList.length;
                var hlthChkStr = "";
                if (!hlthCheckInstListLen) {
                    hlthChkStr = "-";
                }
                for (var i = 0; i < hlthCheckInstListLen; i++) {
                    var hlthChkName =
                        svcUtils.getVNNameFormatter(hlthCheckInstList[i]['name'].split(":"));
                    var hlthChkStatus = hlthCheckInstList[i]['status'];
                    if ('Active' != hlthChkStatus) {
                        hlthChkStr +=
                            '<span class="status-badge-rounded status-partially-active"></span>';
                    } else {
                        hlthChkStr +=
                            '<span class="status-badge-rounded status-active"></span>';
                    }
                    hlthChkStr += hlthChkName + " - " + hlthCheckInstList[i]['status'];
                    if (i < hlthCheckInstListLen - 1) {
                        hlthChkStr += ", <br>";
                    }
                }
                var vmiFqn = vmi.split(':');
                var curProject = contrail.getCookie('project');
                var curDomain = contrail.getCookie('domain');
                if ((vmiFqn[0] == curDomain) && (vmiFqn[1] == curProject)) {
                    vmi = vmiFqn[2];
                } else {
                    vmi = vmiFqn[2] + " (" + vmiFqn[0] + ":" + vmiFqn[1] + ")";
                }
                statusObjList.push({'vmi': vmi, 'parent': parName,
                                    'hlthChkStr': hlthChkStr,
                                    'vmiIP': vmiIP,
                                    'intfStatus': intfStatus});
            }
        }
        var returnHtml = "";
        var statusHeader =
            '<thead>' +
                '<th class="col-xs-4">Interface</th>' +
                '<th class="col-xs-2">Status</th>' +
                '<th class="col-xs-4">Health Status</th>' +
                '<th class="col-xs-2">IP Address</th>' +
              '</thead>'
        returnHtml += statusHeader;
        var len = statusObjList.length;
        if (!len) {
            return "-";
        }
        for (var i = 0; i < len; i++) {
            returnHtml += '<tr>';
            returnHtml += '<td class="col-xs-4" style="vertical-align:top;">' + statusObjList[i]['vmi'] +
                '</td>';
            returnHtml += '<td class="col-xs-2" style="vertical-align:top;">' +
                statusObjList[i]['intfStatus'] + '</td>';
            returnHtml += '<td class="col-xs-4" style="vertical-align:top;">';
            returnHtml += statusObjList[i]['hlthChkStr'];
            returnHtml += ' </td>';
            returnHtml += '<td class="col-xs-2" style="vertical-align:top;">' + statusObjList[i]['vmiIP'] +
                '</td>';
            returnHtml += '</tr>';
        }
        returnHtml = "<table class='row-fluid' >" + returnHtml +
            "</table>";
        return returnHtml;
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
                addrStr +='<span class="vn_key">';
                addrStr += key.toString();
                addrStr +='</span>';
                if (addr[key].length > 0) {
                    addrStr += '<span class="vn_seperator">:</span>';
                    addrStr += (null != addr[key][0]['addr']) ?
                        addr[key][0]['addr'] : '-';
                    addrStr += ' <br>';
                } else {
                    addrStr += ' <br>';
                    addrStr += "~~";
                }
            }
            statusDataList.push({id: serId, name: serName, status: serStatus,
                                address: addrStr, state: pwrState});
        }
        var cnt = statusDataList.length;
        if (!cnt) {
            return 'No Server found.';
        }
        var statusHeader =
            '<tr ><thead>' +
                 '<th class="col-xs-3">Virtual Machine</th>' +
                 '<th class="col-xs-2">Status</th>' +
                 '<th class="col-xs-2">Power State</th>' +
                 '<th class="col-xs-3">Networks</th>' +
                 '<th class="col-xs-2"></th>' +
              '</thead></tr>'
        returnHtml += statusHeader;
        for (i = 0; i < cnt; i++) {
            returnHtml += '<tr>';
            returnHtml += '<td class="col-xs-3">' + statusDataList[i]['name'] +
                '</td>';
            returnHtml += '<td class="col-xs-2">';
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
            returnHtml += '<td class="col-xs-2">' + statusDataList[i]['state'] +
                '</td>';
            var instDetailStr = statusDataList[i]['address'].split('~~');
            if (instDetailStr.length > 1) {
                returnHtml += '<td class="col-xs-3">';
                var msgSplit = instDetailStr[0].split(" ");
                var msgStr = msgSplit[msgSplit.length - 1] +
                    " IP Address not assigned.";
                var strLen = instDetailStr.length;
                for(var inc = 0; inc < strLen - 1; inc++) {
                    returnHtml += '&nbsp;&nbsp;<span class="status-badge-rounded status-inactive" title="#= msgStr #" ></span>'
                    returnHtml += instDetailStr[inc];
                }
                returnHtml += '</td>';
            } else {
                returnHtml += '<td class="col-xs-2">'+ instDetailStr +'</td>';
            }
            returnHtml += '<td class="col-xs-2"><a onClick="showViewConsoleWindow(\'' +
                statusDataList[i]['id'] +'\', \''+ statusDataList[i]['name'] +
                '\');"> View Console </a></td>';
            returnHtml += '</tr>';
        }
        returnHtml = "<table width='100%'>" + returnHtml + "</table>";
        return returnHtml;
    }

    this.showViewConsoleWindow = function(vmUUID, name) {
        var selectedProject = contrail.getCookie(cowc.COOKIE_PROJECT);
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
            var svcVirtType =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;service_virtualization_type',
                                   null);
            if (('physical-device' == svcVirtType) ||
                ((null != ordIntf) && (false != ordIntf) &&
                ('analyzer' != svcType) && ('firewall' != svcType))) {
                return ('<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                    'Active');
            }
        }
        var vmStatus =
            getValueByJsonPath(rowData, 'statusDetails;vmStatus',
                               'Updating');
        var vmStatusStr = "Updating";
        if ("Spawning" == vmStatus) {
            vmStatusStr ='<img src="/img/loading.gif">&nbsp;&nbsp;' + vmStatus;
        } else if ("Inactive" == vmStatus) {
            vmStatusStr = '<div class="status-badge-rounded status-inactive"></div>&nbsp;&nbsp;' +
                vmStatus
        } else if ("Partially Active" == vmStatus) {
            vmStatusStr = '<img src="/img/loading.gif">&nbsp;&nbsp;' + vmStatus;
        } else if ("Active" == vmStatus) {
            vmStatusStr = '<div class="status-badge-rounded status-active"></div>&nbsp;&nbsp;' +
                vmStatus;
        } else if ("Error" == vmStatus) {
            return ('Request Failed.');
        }
        /* Now check if health check is configured */
        var healthCheckStatusObjs =
            getValueByJsonPath(rowData, 'statusDetails;healthCheckStatus',
                               null);
        if (("Active" != vmStatus) && (isOpenstackOrchModel())) {
            return vmStatusStr;
        }
        var intfStatusDownCnt = 0;
        var hlthChkStatusDownCnt = 0;
        var vmisCnt = 0;
        for (var key in healthCheckStatusObjs) {
            for (var vmi in healthCheckStatusObjs[key]) {
                if ('vmis' == vmi) {
                    continue;
                }
                vmisCnt++;
                var isActive =
                    getValueByJsonPath(healthCheckStatusObjs,
                                       key + ';' + vmi + ';' + 'active', false);
                if (false == isActive) {
                    intfStatusDownCnt++;
                }
                var hlthChkInstList =
                    getValueByJsonPath(healthCheckStatusObjs,
                                       key + ';' + vmi + ';' +
                                       'health_check_instance_list', []);
                var hlthChkInstListLen = hlthChkInstList.length;
                for (var i = 0; i < hlthChkInstListLen; i++) {
                    var hlthChkStatus = getValueByJsonPath(hlthChkInstList[i],
                                                    'status', null);
                    if ("InActive" == hlthChkStatus) {
                        hlthChkStatusDownCnt++;
                    }
                }
            }
        }
        if ((!intfStatusDownCnt) && (!hlthChkStatusDownCnt)) {
            if (false == isOpenstackOrchModel()) {
                return "-";
            }
            return vmStatusStr;
        }
        var statusIcon = "status-badge-rounded status-partially-active";
        var statusStr = "";
        if (intfStatusDownCnt > 0) {
            if (intfStatusDownCnt == vmisCnt) {
                /* All are down */
                statusIcon = "status-badge-rounded status-inactive";
            }
            statusStr = "Interface Down";
        } else if (hlthChkStatusDownCnt > 0) {
            if (hlthChkStatusDownCnt == vmisCnt) {
                statusIcon = "status-badge-rounded status-inactive";
            }
            statusStr = "Health Check Down";
        }
        return '<div class=' + '"' + statusIcon + '"' + '></div>'
            + statusStr;
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

    this.portTuplesFormatter = function(val, rowData) {
        return portTuplesFormatter(null, null, val, null, rowData);
    }

    this.intfRtTablesFormatter = function(val, rowData) {
        return svcInstBackRefsFormatter(null, null, val, null, rowData);
    }

    this.svcHealtchChksFormatter = function(val, rowData) {
        return svcInstBackRefsFormatter(null, null, val, null, rowData);
    }

    this.routingPolicyFormatter = function(val, rowData) {
        return routingPolicyFormatter(null, null, val, null, rowData);
    }

    this.rtAggFormatter = function(val, rowData) {
        return svcInstBackRefsFormatter(null, null, val, null, rowData);
    }

    this.availabilityZoneFormatter = function (val, rowData) {
        return availabilityZoneFormatter(null, null, val, null, rowData);
    }

    this.svcInstStatusFormatter = function(val, rowData) {
        return svcInstStatusFormatter(null, null, val, null, rowData);
    }

    this.svcInstIntfStatusFormatter = function(val, rowData) {
        return svcInstIntfStatusFormatter(null, null, val, null, rowData);
    }

    this.instCountFormatter = function(val, rowData) {
        return instCountFormatter(null, null, val, null, rowData, true);
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
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            name: 'Status',
            width: 30,
            formatter: function(row, col, val, d, rowData) {
                return statusFormatter(row, col, val, d, rowData);
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            name: '# Instance(s)',
            width: 35,
            formatter: function(row, col, val, d, rowData) {
                return instCountFormatter(row, col, val, d, rowData, false);
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            name: 'Networks',
            formatter: function(row, col, val, d, rowData) {
                return networksFormatter(row, col, val, d, rowData, false);
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        }
    ];

    function getSvcTmplDetailsByUIStr (uiSvcTmplStr, svcInstanceDataObj) {
        var svcInstTmplts = svcInstanceDataObj.svcInstTmplts;
        var retFlag = false;
        if (null == uiSvcTmplStr) {
            return null;
        }
        var tmpl = getCookie('domain') + ':' + uiSvcTmplStr.split(' - [')[0];
        if (null == svcInstTmplts[tmpl]) {
            return null;
        }
        return svcInstTmplts[tmpl];
    }

    function addModelAttr (model, svcInstanceDataObj)
    {
        model.staticRoutesAccordianVisible = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var statRts =
                svcUtils.getStaticRtsInterfaceTypesBySvcTmpl(svcTmpl, true);
            if (statRts.length > 0) {
                return true;
            }
            return false;
        }), model);
        model.isHAModeDropDownDisabled = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return false;
            }
            var instCnt = this.no_of_instances();
            if (instCnt > 1) {
                return false;
            }
            return true;
        }), model);
        model.showHAMode = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var svcScaling =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;service_scaling',
                                   false);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return false;
            }
            return svcScaling;
        }), model);
        model.showIfV1Template = ko.computed((function(version) {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (1 == tmplVersion) {
                return true;
            }
            return false;
        }), model);
        model.showIfV2Template = ko.computed((function(version) {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return true;
            }
            return false;
        }), model);
        model.showInstCnt = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var svcScaling =
            getValueByJsonPath(svcTmpl,
                               'service_template_properties;service_scaling',
                               false);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return false;
            }
            return svcScaling;
        }), model);
        model.ifNotTransparentTmpl = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var svcMode =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;service_mode',
                                   null);
            if ('transparent' == svcMode) {
                return false;
            }
            return true;
        }), model);
        model.showPortTuplesView = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var tmplVer =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVer) {
                $( "#user_created_ha_mode" ).addClass( "no-margin" );
                return true;
            }
            $( "#user_created_ha_mode" ).removeClass( "no-margin" );
            return false;
        }), model);
        model.showAvailibilityZone = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var availZoneEnable =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;availability_zone_enable',
                                   false);
            var tmplVer =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if ((1 == tmplVer) && (true == availZoneEnable)) {
                return true;
            }
            return false;
        }), model);
        model.showInterfaceCollectionView = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template(),
                svcInstanceDataObj);
            var tmplVer =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (1 == tmplVer) {
                return true;
            }
            return false;
        }), model);
    }

    function getHeaderActionConfig(svcInstanceDataObj) {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_DEL_SERVICE_INSTANCES,
                "iconClass": 'fa fa-trash',
                "linkElementId": 'btnActionDelSvcInst',
                "onClick": function() {
                    svcInstModel = new SvcInstModel({
                        svcInstanceDataObj: svcInstanceDataObj});
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
            },
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
                    addModelAttr(svcInstModel, svcInstanceDataObj);
                    subscribeModelChangeEvents(svcInstModel);
                    svcInstEditView.model = svcInstModel;
                    svcInstModel.editView = svcInstEditView;
                    svcInstEditView.renderConfigureSvcInst({
                        "title": ctwl.CREATE,
                        "isEdit": false,
                        callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return SvcInstGridView;
});

