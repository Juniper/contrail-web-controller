/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, ContrailView, ContrailListModel, qeUtils) {
    var InstanceListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig,
                networkSelectedValueData = viewConfig.networkSelectedValueData,
                domainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                projectSelectedValueData = $('#' + ctwl.PROJECTS_BREADCRUMB_DROPDOWN).data('contrailDropdown').getSelectedData()[0],
                projectUUID = (projectSelectedValueData.value === 'all') ? null : projectSelectedValueData.value,
                projectFQN = (projectSelectedValueData.value === 'all') ? null : domainFQN + ':' + projectSelectedValueData.name,
                contrailListModel;

            if (projectUUID != null) {
                var networkUUID = (networkSelectedValueData.value === 'all') ? null : networkSelectedValueData.value,
                    networkFQN = (networkSelectedValueData.value === 'all') ? null : projectFQN + ':' + networkSelectedValueData.name,
                    parentUUID = (networkUUID == null) ? projectUUID : networkUUID,
                    parentFQN = (networkUUID == null) ? projectFQN : networkFQN,
                    parentType = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_VN,
                    parentHashtype = (networkUUID == null) ? ctwc.TYPE_PROJECT : ctwc.TYPE_NETWORK,
                    extendedHashOb = {};

                contrailListModel = new ContrailListModel(getInstanceListModelConfig(parentUUID, parentFQN));

                self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig(parentUUID, parentType, parentFQN));
                extendedHashOb[parentHashtype] = parentFQN;
                ctwu.setNetwork4InstanceListURLHashParams(extendedHashOb);
            } else {
                contrailListModel = new ContrailListModel(getInstanceListModelConfig(null, null));
                self.renderView4Config(self.$el, contrailListModel, getInstanceListViewConfig(null, null, null));
                ctwu.setNetwork4InstanceListURLHashParams({});
            }
        }
    });

    function updateInstanceModel (contrailListModel, parentListModelArray) {
        var uuidList = contrailListModel.getItems();
        var instDetailsList = parentListModelArray[0].getItems();
        var uuidListLen = uuidList.length;
        var instDetailsListLen = instDetailsList.length;
        var tmpUUIDObjs = {};
        var missingUUIDList = [];
        for (i = 0; i < instDetailsListLen; i++) {
            var uuid = instDetailsList[i].uuid;
            tmpUUIDObjs[uuid] = uuid;
        }
        for (var i = 0; i < uuidListLen; i++) {
            uuid = uuidList[i].name;
            if (cowu.isNil(tmpUUIDObjs[uuid])) {
                missingUUIDList.push({uuid: uuid, name: uuid});
            }
        }
        parentListModelArray[0].addData(missingUUIDList);
    }

    function getInstanceListModelConfig(parentUUID, parentFQN) {
        var ajaxConfig = {
            url: ctwc.get(ctwc.URL_GET_NETWORK_INSTANCES, 100, 1000, $.now()),
            type: 'POST',
            data: JSON.stringify({
                id: qeUtils.generateQueryUUID(),
                FQN: parentFQN
            })
        };

        return {
            remote: {
                ajaxConfig: ajaxConfig,
                dataParser: ctwp.instanceDataParser,
                hlRemoteConfig: {
                    remote: {
                        ajaxConfig: {
                            url: ctwc.get(ctwc.URL_GET_INSTANCES_LIST, $.now()),
                            type: 'POST',
                            data: JSON.stringify({
                                reqId: qeUtils.generateQueryUUID(),
                                FQN: parentFQN,
                                fqnUUID: parentUUID
                            })
                        },
                        dataParser: function(vmList) {
                            var retArr = [];
                            var opVMList = vmList.opVMList;
                            var configVMList = vmList.configVMList;
                            var configVMListLen = 0;
                            var tmpOpVMObjs = {};
                            if ((null == opVMList) || (!opVMList.length)) {
                                return retArr;
                            }
                            if (!cowu.isNil(configVMList)) {
                                configVMListLen = configVMList.length;
                            }
                            _.each(opVMList, function(vmUUID) {
                                tmpOpVMObjs[vmUUID] = vmUUID;
                                retArr.push({name: vmUUID, source: "analytics"});
                            });
                            for (var i = 0; i < configVMListLen; i++) {
                                var vmId = configVMList[i];
                                if (cowu.isNil(tmpOpVMObjs[vmId])) {
                                    retArr.push({name: vmId, source: "config"});
                                }
                            }
                            return retArr;
                        },
                        completeCallback: function(response, contrailListModel, parentListModelArray) {
                            if (contrail.checkIfExist(parentListModelArray) &&
                                contrail.checkIfFunction(parentListModelArray[0].isRequestInProgress)) {
                                if (parentListModelArray[0].isRequestInProgress()) {
                                    var updateInstanceModelCB = function() {
                                        return updateInstanceModel(contrailListModel, parentListModelArray);
                                    };
                                    parentListModelArray[0].onAllRequestsComplete.subscribe(updateInstanceModelCB);
                                }
                            } else {
                                updateInstanceModel(contrailListModel, parentListModelArray);
                            }
                        }
                    },
                    vlRemoteConfig: {
                        vlRemoteList: [{
                            getAjaxConfig: function (responseJSON) {
                                var uuids = [], lazyAjaxConfig;
                                var whereClause = null;

                                var cnt = responseJSON.length;
                                for (var i = 0; i < cnt; i++) {
                                    if ("config" === responseJSON[i].source) {
                                        /* Config UUIDs are pushed at end, so once we get source as
                                         * config, then rest all are from config, so no need to
                                         * traverse more
                                         */
                                        break;
                                    }
                                    uuids.push(responseJSON[i].name);
                                }
                                var domCookie =
                                    contrail.getCookie(cowc.COOKIE_DOMAIN);
                                var projCookie =
                                    contrail.getCookie(cowc.COOKIE_PROJECT);
                                var vnCookie =
                                    contrail.getCookie(ctwc.TYPE_VIRTUAL_NETWORK);
                                whereClause = "(name Starts with " + domCookie + ":" + projCookie +
                                    ":)";
                                if (ctwc.ALL_PROJECTS === projCookie) {
                                    whereClause = "(name Starts with " + domCookie + ":)";
                                } else if (ctwc.ALL_NETWORKS == vnCookie) {
                                    whereClause = "(name Starts with " + domCookie + ":" +
                                        projCookie + ":)";
                                }
                                var whereClause =
                                    qeUtils.formatUIWhereClauseConfigByUserRole(whereClause, "vm_uuid", uuids);
                                var qObj = {table: "StatTable.UveVMInterfaceAgent.if_stats",
                                    where: whereClause};
                                var postData = qeUtils.formatQEUIQuery(qObj);

                                lazyAjaxConfig = {
                                    url: cowc.URL_QE_QUERY,
                                    type: 'POST',
                                    data: JSON.stringify(postData)
                                }
                                return lazyAjaxConfig;
                            },
                            successCallback: function (response, contrailListModel,
                                                       parentListModelArray) {
                                var statDataList =
                                    ctwp.parseInstanceStats(response.data,
                                                            ctwc.TYPE_VIRTUAL_MACHINE),
                                    dataItems = parentListModelArray[0].getItems(),
                                    updatedDataItems = [],
                                    statData;

                                for (var j = 0; j < statDataList.length; j++) {
                                    statData = statDataList[j];
                                    for (var i = 0; i < dataItems.length; i++) {
                                        var dataItem = dataItems[i];
                                        if (statData['name'] == dataItem['name']) {
                                            dataItem['inBytes60'] = ifNull(statData['inBytes'], 0);
                                            dataItem['outBytes60'] = ifNull(statData['outBytes'], 0);
                                            updatedDataItems.push(dataItem);
                                            break;
                                        }
                                    }
                                }
                                parentListModelArray[0].updateData(updatedDataItems);
                            }
                        }],
                    }
                }
            },
            cacheConfig : {
                ucid: (parentUUID != null) ? (ctwc.UCID_PREFIX_MN_LISTS + parentUUID + ":" +
                                              'virtual-machines') : ctwc.UCID_ALL_VM_LIST
            }
        };
    }

    function getInstanceListViewConfig(parentUUID, parentType, parentFQN) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.INSTANCES_CPU_MEM_CHART_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "ZoomScatterChartView",
                                viewConfig: {
                                    loadChartInChunks: true,
                                    chartOptions: {
                                        xLabel: 'CPU Utilization (%)',
                                        yLabel: 'Memory Usage',
                                        forceX: [0, 1],
                                        forceY: [0, 1000],
                                        dataParser: function (response) {
                                            return response;
                                        },
                                        yLabelFormat: function(yValue) {
                                            var formattedValue = formatBytes(yValue * 1024, true);
                                            return formattedValue;
                                        },
                                        xLabelFormat: d3.format(".01f"),
                                        tooltipConfigCB: getInstanceTooltipConfig,
                                        clickCB: onScatterChartClick,
                                        sizeFieldName: 'throughput',
                                        margin: {left: 60},
                                        noDataMessage: "No virtual machine available."
                                    }
                                }
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: ctwl.PROJECT_INSTANCES_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "InstanceGridView",
                                viewPathPrefix: "monitor/networking/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    parentUUID: parentUUID,
                                    parentType: parentType,
                                    parentFQN: parentFQN,
                                    pagerOptions: { options: { pageSize: 8, pageSizeSelect: [8, 25, 50, 100] } }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function onScatterChartClick (chartConfig) {
        var instanceUUID = chartConfig['name'],
            networkFQN = chartConfig['vnFQN'],
            vmName = chartConfig['vmName'];

        if (contrail.checkIfExist(networkFQN) && !ctwu.isServiceVN(networkFQN)) {
            ctwu.setInstanceURLHashParams(null, networkFQN, instanceUUID, vmName, true);
        }
    };

    function getInstanceTooltipConfig(data) {
        var vmUUID = data.name,
            vnFQN = data.vnFQN,
            tooltipConfig = {
                title: {
                    name: vmUUID,
                    type: ctwl.TITLE_GRAPH_ELEMENT_VIRTUAL_MACHINE
                },
                content: {
                    iconClass: 'icon-contrail-virtual-machine font-size-30',
                    info: [
                        {label: 'Name', value: data.vmName},
                        {label: 'UUID', value: vmUUID},
                        //{label: 'Network', value: data.vnFQN},
                        {label:'CPU Utilization', value: d3.format('.02f')(data['x']) + " %"},
                        {label:'Memory Usage', value: formatBytes(data['y'] * 1024, false, null, 1)},
                        {label:'Throughput', value:formatThroughput(data['throughput'])}
                    ]
                },
                dimension: {
                    width: 400
                }
            };
        if (contrail.checkIfExist(vnFQN) && !ctwu.isServiceVN(vnFQN)) {
            tooltipConfig['content']['actions'] = [
                {
                    type: 'link',
                    text: 'View',
                    iconClass: 'fa fa-external-link',
                    callback: onScatterChartClick
                }
            ];
        }

        return tooltipConfig;
    };

    return InstanceListView;
});
