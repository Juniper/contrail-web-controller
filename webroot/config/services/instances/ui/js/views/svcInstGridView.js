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
                            var tmplVersion =
                                getValueByJsonPath(svcTmplDetails[0],
                                                   'service_template_properties;version',
                                                   1);
                            if (2 == tmplVersion) {
                                return rowActionConfig;
                            }
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

    function subscribeModelChangeEvents (svcInstModel) {
        svcInstModel.__kb.view_model.model().on('change:display_name',
                                            function(model, newValue) {
            svcInstModel.changePortTupleName();
        });
    }

    function editSvcInstPopUp (dataItem) {
        var svcInstModel = new SvcInstModel(dataItem);
        addModelAttr(svcInstModel);
        svcInstEditView.model = svcInstModel;
        svcInstModel.editView = svcInstEditView;
        svcInstEditView.renderConfigureSvcInst({
                              "title": ctwl.TITLE_EDIT_SERVICE_INSTANCE +
                              ' (' + dataItem['display_name'] +
                                 ')',
                              dataItem: dataItem,
                              "isEdit": true,
                              callback: function () {
            var dataView =
                $(gridElId).data("contrailGrid")._dataView;
            dataView.refreshData();
        }});
    }
    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            var dataItem =
                $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            var svcTmplDetails = dataItem['svcTmplDetails'];
            if ((null == svcTmplDetails) || (null == svcTmplDetails[0])) {
                editSvcInstPopUp(dataItem);
                return;
            }
            var svcTmplVer =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;version',
                                   1);
            if (1 == svcTmplVer) {
                editSvcInstPopUp(dataItem);
                return;
            }
            var portTuples = dataItem['port_tuples'];
            if (null == portTuples) {
                editSvcInstPopUp(dataItem);
                return;
            }
            var portTuplesCnt = portTuples.length;
            var portTupleUUIDList = [];
            for (var i = 0; i < portTuplesCnt; i++) {
                portTupleUUIDList.push(portTuples[i]['uuid']);
            }
            var postData = {
                'data': [{
                    'type': 'virtual-machine-interfaces',
                    'fields': ['port_tuple_refs'],
                    'back_ref_id': portTupleUUIDList
                }]
            };
            var ajaxConfig = {
                url: ctwc.get('/api/tenants/config/get-config-details'),
                type: "POST",
                timeout: 60000,
                data: JSON.stringify(postData)
            }
            contrail.ajaxHandler(ajaxConfig, null, function(result) {
                if ((null == result) || (null == result[0])) {
                    editSvcInstPopUp(dataItem);
                    return;
                }
                var portTuples = dataItem['port_tuples'];
                var newPortTuples = [];
                var portTuplesCnt = portTuples.length;
                var portTupleMap = {};
                for (var i = 0; i < portTuplesCnt; i++) {
                    portTupleMap[portTuples[i]['uuid']] = i;
                }
                var vmis = result[0]['virtual-machine-interfaces'];
                var vmisCnt = vmis.length;
                var tmpIdxToIndexMap = {};
                for (var i = 0; i < vmisCnt; i++) {
                    var vmi = vmis[i]['virtual-machine-interface'];
                    var portTupleRefs =
                        getValueByJsonPath(vmis[i],
                                           'virtual-machine-interface;port_tuple_refs',
                                           []);
                    if (!portTupleRefs.length) {
                        /* This is really strage */
                        console.log('Port Tuple Refs null, wrong here');
                        continue;
                    }
                    var refsCnt = portTupleRefs.length;
                    for (var j = 0; j < refsCnt; j++) {
                        var portTupleUUID = portTupleRefs[j]['uuid'];
                        var idx = portTupleMap[portTupleUUID];
                        if (null != idx) {
                            if (null == newPortTuples[idx]) {
                                newPortTuples[idx] = {};
                                newPortTuples[idx] =
                                    dataItem['port_tuples'][idx];
                                newPortTuples[idx]['virtual-machine-interfaces']
                                    = [];
                            }
                            newPortTuples[idx]
                                ['virtual-machine-interfaces'].push(vmi);
                        }
                    }
                }
                /* If there is no VMI, then newPortTuples will have that idx as
                 * null, so delete those entries
                 */
                var newPortTuplesCnt = newPortTuples.length;
                for (i = 0; i < newPortTuplesCnt; i++) {
                    if (null == newPortTuples[i]) {
                        newPortTuples.splice(i, 1);
                        i--;
                        newPortTuplesCnt--;
                    }
                }
                /* Now check if any port_tuple does not have any VMI associated
                 */
                if (newPortTuples.length == dataItem['port_tuples'].length) {
                    dataItem['port_tuples'] = newPortTuples;
                    editSvcInstPopUp(dataItem);
                    return;
                }
                var newPortTuplesLen = newPortTuples.length;
                for (var i = 0; i < newPortTuplesLen; i++) {
                    if (null != portTupleMap[newPortTuples[i]['uuid']]) {
                        delete portTupleMap[newPortTuples[i]['uuid']];
                    }
                }
                for (key in portTupleMap) {
                    var idx = portTupleMap[key];
                    newPortTuples.push(dataItem['port_tuples'][idx]);
                }
                dataItem['port_tuples'] = newPortTuples;
                editSvcInstPopUp(dataItem);
                return;
            });
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
                                        key: 'port_tuples',
                                        keyClass: 'span2',
                                        label: 'Port Tuples',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'portTuplesFormatter'
                                        }
                                    },
                                                                        {
                                        key: 'service_health_check_back_refs',
                                        keyClass: 'span2',
                                        label: 'Service Health Checks',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'svcHealtchChksFormatter'
                                        }
                                    },
                                    {
                                        key: 'interface_route_table_back_refs',
                                        keyClass: 'span2',
                                        label: 'Interface Route Tables',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'intfRtTablesFormatter'
                                        }
                                    },
                                    {
                                        key: 'routing_policy_back_refs',
                                        keyClass: 'span2',
                                        label: 'Routing Policys',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'routingPolicyFormatter'
                                        }
                                    },
                                    {
                                        key: 'route_aggregate_back_refs',
                                        keyClass: 'span2',
                                        label: 'Route Aggregates',
                                        templateGenerator: 'TextGenerator',
                                        templateGeneratorConfig: {
                                            formatter: 'rtAggFormatter'
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
            var tmplVersion =
                getValueByJsonPath(svcTmplDetails[0],
                                   'service_template_properties;version',
                                   1);
            if (2 == tmplVersion) {
                return '-';
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
        if (null != rowData['svcTmplDetails']) {
            var tmplVer =
                getValueByJsonPath(rowData['svcTmplDetails'][0],
                                   'service_template_properties;version',
                                   1);
            if (true == isExpand) {
                return "-";
            }
            if (2 == tmplVer) {
                return portTuplesFormatter(row, col, rowData['port_tuples'], d,
                                       rowData, isExpand);
            }
        } else if ((null != rowData['port_tuples']) &&
                   (rowData['port_tuples'].length > 0)) {
            return portTuplesFormatter(row, col, rowData['port_tuples'], d,
                                       rowData, isExpand);
        }
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
                return instCountFormatter(row, col, val, d, rowData);
            },
            sortable: {
                sortBy: 'formattedValue'
            }
        },
        {
            name: 'Networks / Port Tuples',
            formatter: function(row, col, val, d, rowData) {
                return networksFormatter(row, col, val, d, rowData, false);
            },
            sortable: {
                sortBy: 'formattedValue'
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
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
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
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            var svcScaling =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;service_scaling',
                                   false);
            var tmplVersion =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return true;
            }
            return svcScaling;
        }), model);
        model.showInstCnt = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
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
        model.showPortTuplesView = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            var tmplVer =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (2 == tmplVer) {
                return true;
            }
            return false;
        }), model);
        model.showAvailibilityZone = ko.computed((function() {
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
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
            var svcTmpl = getSvcTmplDetailsByUIStr(this.service_template());
            var tmplVer =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;version', 1);
            if (1 == tmplVer) {
                return true;
            }
            return false;
        }), model);
    }

    function getHeaderActionConfig() {
        var headerActionConfig = [
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
            },
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
                    subscribeModelChangeEvents(svcInstModel);
                    svcInstEditView.model = svcInstModel;
                    svcInstModel.editView = svcInstEditView;
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
            }

        ];
        return headerActionConfig;
    }

   return SvcInstGridView;
});

