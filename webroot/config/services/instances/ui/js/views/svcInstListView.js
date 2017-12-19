/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, ContrailListModel, svcInstUtils) {
    var self;
    var chunkCnt = 50;
    var svcInstTimerLevel = 0;
    var svcInstanceTimer = null;

    var SvcInstListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            self.selectedProject = viewConfig['projectSelectedValueData'];
            self.svcInstProjRole = [];
            self.svcInstanceDataObj = {};
            self.svcInstanceDataObj.currentProject = self.selectedProject;
            self.svcInstanceDataObj.imageList = [];
            self.svcInstanceDataObj.availabilityZoneList = [];
            self.svcInstanceDataObj.svcTmplsFormatted = [];
            self.svcInstanceDataObj.hostList = [];
            self.svcInstanceDataObj.svcInstTmplts = [];

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_LIST_SERVICE_INSTS_CONFIG,
                                      self.selectedProject.value),
                        timeout: 600000,
                        type: "GET"
                    },
                    dataParser: self.svcInstDataParser,
                    failureCallback: function(error) {
                        console.log("Error", error);
                    }
                },
                vlRemoteConfig :{
                    vlRemoteList : self.getVlRemoteGLConfig(self.svcInstanceDataObj),
                    completeCallback: function() {
                        self.svcInstanceDataObj.hostList = [];
                        var userRoles = self.svcInstProjRole;
                        if (null == userRoles) {
                            userRoles = getValueByJsonPath(globalObj,
                                                           'webServerInfo;role',
                                                           []);
                        }
                        if (-1 != userRoles.indexOf('cloudAdmin')) {
                            var ajaxConfig = {
                                url: '/api/tenants/config/getHostList',
                                type: "GET"
                            };
                            contrail.ajaxHandler(ajaxConfig, null,
                                                 function(result) {
                                self.svcInstanceDataObj.hostList = result;
                            });
                        }
                    }
                },
                cacheConfig: {
                    ucid: 'service-instances',
                    cacheTimeout: 0
                }
            };
            self.contrailListModel = new ContrailListModel(listModelConfig);
        },
        checkAndScheduleRefetch: function() {
            var dataItems = self.contrailListModel.getItems();
            /* Check if we have any spawning VM */
            var siCnt = dataItems.length;
            for (var i = 0; i < siCnt; i++) {
                var siStatus = getValueByJsonPath(dataItems[i],
                                                  "statusDetails;vmStatus",
                                                  getValueByJsonPath(dataItems[i],
                                                                     "tempVMStatus",
                                                                     "Spawning"));
                if ("Spawning" == siStatus) {
                    /* reschedule needed */
                    break; 
                }
            }
            if (i >= siCnt) {
                return;
            }
            if (svcInstTimerLevel < svcInstUtils.svcInstTimerArray.length) {
                svcInstanceTimer = setTimeout(function() {
                    self.fetchSIStatusWithChunk();
                    svcInstTimerLevel++;
                }, svcInstUtils.svcInstTimerArray[svcInstTimerLevel]);
            } else {
                self.clearSITimer();
            }
        },
        fetchSIStatusWithChunk: function(lastKey) {
            var siListAjaxConfig = {
                url: ctwc.get(ctwc.URL_GET_LIST_SERVICE_INSTS_CONFIG,
                              self.selectedProject.value),
                timeout: 600000,
                type: "GET"
            };
            var that = this;
            contrail.ajaxHandler(siListAjaxConfig, null, function(siData) {
                if (null == siData) {
                    return;
                }
                siData = self.svcInstDataParser(siData);
                var tmpSIMap = {};
                var siCnt = siData.length;
                for (var i = 0; i < siCnt; i++) {
                    var uuid = getValueByJsonPath(siData[i], "uuid");
                    tmpSIMap[uuid] = siData[i];
                }
                var dataItems = that.contrailListModel.getItems();
                var dataItemCnt = dataItems.length;
                for (var i = 0; i < dataItemCnt; i++) {
                    var uuid = dataItems[i].uuid;
                    if (null == tmpSIMap[uuid]) {
                        continue;
                    }
                    var siData = tmpSIMap[uuid];
                    for (key in siData) {
                        dataItems[i][key] = siData[key];
                    }
                }
                //that.transientSIData = dataItems;
                //that.contrailListModel.updateData(dataItems);
                that.fetchNovaStatus(dataItems, lastKey);
            });
        },
        fetchNovaStatus: function(dataItems, lastKey) {
            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_NOVA_STATUS,
                              self.selectedProject.value, chunkCnt, lastKey),
                type : 'GET'
            };
            var that = self;
            that.transientSIData = dataItems;
            contrail.ajaxHandler(ajaxConfig, null,
                                 function(servers) {
                if (!servers.length) {
                    /* We are done */
                    self.transientSIData = null;
                    self.checkAndScheduleRefetch();
                    return;
                }
                self.parseNovaSIStatusToListModel(servers);
            });
        },
        clearSITimer: function() {
            if (null != svcInstanceTimer) {
                clearInterval(svcInstanceTimer);
                svcInstanceTimer = null;
                svcInstTimerLevel = 0;
            }
        },
        parseNovaSIStatusToListModel: function(novaStatusData, isRefetch) {
            svcInstUtils.svcInstTimerArray = svcInstUtils.svcInstStatusIntervals;
            var tmpVMToPTSIMaps = {};
            var dataItems = [];
            if (null == self.transientSIData) {
                dataItems = self.contrailListModel.getItems();
            } else {
                dataItems = $.extend([], self.transientSIData);
                delete self.transientSIData;
            }
            var dataCnt = dataItems.length;
            var tmpVMToSvcInstMap = {};
            for (var i = 0; i < dataCnt; i++) {
                if (null == dataItems[i]['statusDetails']) {
                    dataItems[i]['statusDetails'] = {};
                }
                /* SI - V1 */
                var vmBackRefs = getValueByJsonPath(dataItems[i],
                                                    "virtual_machine_back_refs",
                                                    []);
                var vmBackRefsCnt = vmBackRefs.length;
                for (var j = 0; j < vmBackRefsCnt; j++) {
                    var vmId = vmBackRefs[j]["uuid"];
                    tmpVMToSvcInstMap[vmId] = i;
                }
                /* SI - V2 */
                var portTuples = getValueByJsonPath(dataItems[i],
                                                    "port_tuples", []);
                var portTuplesCnt = portTuples.length;
                for (var j = 0; j < portTuplesCnt; j++) {
                    var vmisData = getValueByJsonPath(portTuples[j],
                                                      "vmis", []);
                    var vmisCnt = vmisData.length;
                    for (var k = 0; k < vmisCnt; k++) {
                        var vmId = getValueByJsonPath(vmisData[k],
                                                      "virtual_machine_refs;0;uuid",
                                                      null);
                        if (null == tmpVMToPTSIMaps[vmId]) {
                            tmpVMToPTSIMaps[vmId] = [];
                        }
                        //Check if index not already added and then add
                        if(tmpVMToPTSIMaps[vmId][tmpVMToPTSIMaps[vmId].length -1] != i) {
                            tmpVMToPTSIMaps[vmId].push(i);
                        }
                    }
                }
            }
            var idxArr = [];
            var respCnt = novaStatusData.length;
            for (var i = 0; i < respCnt; i++) {
                var uuid = getValueByJsonPath(novaStatusData[i], "id", null);
                /* SI - V1 */
                var idx = tmpVMToSvcInstMap[uuid];
                if (null == idx) {
                    /* SI - V2 */
                    idxArr = tmpVMToPTSIMaps[uuid];
                }
                if (null != idx) {
                    if (null == dataItems[idx]['statusDetails']['VMDetails']) {
                        dataItems[idx]['statusDetails']['VMDetails'] = [];
                    }
                    dataItems[idx]['statusDetails']['VMDetails'].push({server:
                                                                      novaStatusData[i]});
                }
                if ((null != idxArr) && (idxArr.length > 0)) {
                    var idxArrLen = idxArr.length;
                    for (var j = 0; j < idxArrLen; j++) {
                        idx = idxArr[j];
                        if (null == dataItems[idx]['statusDetails']['VMDetails']) {
                            dataItems[idx]['statusDetails']['VMDetails'] = [];
                        }
                        dataItems[idx]['statusDetails']['VMDetails'].push({server:
                                                                        novaStatusData[i]});
                    }
                }
            }
            var cntObj = self.updateSIStatus(dataItems);
            self.contrailListModel.updateData(dataItems);
            var lastKey =
                getValueByJsonPath(novaStatusData[respCnt - 1], "id", null);
            if ((cntObj.totalSpawningCnt > 0) && (respCnt < chunkCnt)) {
                self.checkAndScheduleRefetch();
                return;
            }
            if ((null != lastKey) && (respCnt == chunkCnt)) {
                self.fetchSIStatusWithChunk(lastKey);
            }
        },
        preParseSIData: function (aggSIData, siMaps) {
            var instCnt = 0;
            var v1InstTupleVMIMaps =
                getValueByJsonPath(siMaps, "instTupleVMIMaps", {});
            var instTupleVMIMaps = {};
            if (null != aggSIData) {
                instCnt = aggSIData.length;
            }
            for (var i = 0; i < instCnt; i++) {
                var svcInstUUID = getValueByJsonPath(aggSIData[i],
                                                     'service-instance;uuid', null);
                if (null == svcInstUUID) {
                    continue;
                }
                var portTuples = getValueByJsonPath(aggSIData[i],
                                                    'service-instance;port_tuples',
                                                    []);
                var portTuplesCnt = portTuples.length;
                for (var j = 0; j < portTuplesCnt; j++) {
                    var portTupleID = getValueByJsonPath(portTuples[j], 'uuid', null);
                    if (null == portTupleID) {
                        continue;
                    }
                    var vmis = getValueByJsonPath(portTuples[j], 'vmis', []);
                    var vmisCnt = vmis.length;
                    for (var k = 0; k < vmisCnt; k++) {
                        var vmiFqn = getValueByJsonPath(vmis[k],
                                                        'virtual-machine-interface;fq_name',
                                                        []);
                        vmiFqn = vmiFqn.join(':');
                        var vmiId = getValueByJsonPath(vmis[k],
                                                       'virtual-machine-interface;uuid',
                                                       []);
                        if (null == instTupleVMIMaps[svcInstUUID]) {
                            instTupleVMIMaps[svcInstUUID] = {};
                            instTupleVMIMaps[svcInstUUID][portTupleID] = {};
                            instTupleVMIMaps[svcInstUUID][portTupleID]['vmis'] = [];
                        }
                        if (null == instTupleVMIMaps[svcInstUUID][portTupleID]) {
                            instTupleVMIMaps[svcInstUUID][portTupleID] = {};
                            instTupleVMIMaps[svcInstUUID][portTupleID]['vmis'] = [];
                        }
                        instTupleVMIMaps[svcInstUUID][portTupleID]['vmis'].push(vmiFqn);
                    }
                }
            }
            var finalResult = {};
            finalResult['instTupleVMIMaps'] =
                _.extend(instTupleVMIMaps, v1InstTupleVMIMaps);
            var vmiData = getValueByJsonPath(siMaps, 'vmiData;value',
                                                         []);
            finalResult['vmiData'] = vmiData;
            finalResult['data'] = aggSIData;
            return finalResult;
        },
        svcInstDataParser: function(response) {
            if (null == response) {
                return [];
            }
            response = self.preParseSIData(response.aggSIData, response.siMaps);
            var uveHlthCheckDataCnt = 0;
            var vmiToHlthCheckMap = {}
            var tmpSvcInstObjs = {};
            var svcInstArr = [];
            var svcInstData = getValueByJsonPath(response, "data", []);
            var uveHlthCheckData = getValueByJsonPath(response, "vmiData", []);
            var instTupleVMIMaps = getValueByJsonPath(response, "instTupleVMIMaps", {});
            if (null != uveHlthCheckData) {
                uveHlthCheckDataCnt = uveHlthCheckData.length;
            }
            for (var i = 0; i < uveHlthCheckDataCnt; i++) {
                var vmiName = getValueByJsonPath(uveHlthCheckData[i], "name",
                                                 null);
                var vmiData = getValueByJsonPath(uveHlthCheckData[i],
                                                 'value;UveVMInterfaceAgent',
                                                 null);
                vmiToHlthCheckMap[vmiName] = vmiData;
            }
            for (var instID in instTupleVMIMaps) {
                for (var portTupleID in instTupleVMIMaps[instID]) {
                    var vmis = instTupleVMIMaps[instID][portTupleID]['vmis'];;
                    if (null == vmis) {
                        continue;
                    }
                    var vmisCnt = vmis.length;
                    for (var i = 0; i < vmisCnt; i++) {
                        if (null == vmiToHlthCheckMap[vmis[i]]) {
                            instTupleVMIMaps[instID][portTupleID][vmis[i]] = {};
                            continue;
                        }
                        instTupleVMIMaps[instID][portTupleID][vmis[i]] =
                            vmiToHlthCheckMap[vmis[i]];
                    }
                }
            }
            var svcInstList = [];
            var svcInstDataCnt = svcInstData.length; 
            for (var i = 0; i < svcInstDataCnt; i++) {
                var svcInstObj = getValueByJsonPath(svcInstData[i],
                                                    "service-instance", {});
                svcInstObj = $.extend({}, svcInstObj);
                var svcInstId = getValueByJsonPath(svcInstData[i],
                                                   "service-instance;uuid",
                                                   null);
                svcInstObj['statusDetails'] = {};
                if (null != instTupleVMIMaps[svcInstId]) {
                    svcInstObj['statusDetails']['healthCheckStatus'] =
                        instTupleVMIMaps[svcInstId];
                }
                svcInstList.push(svcInstObj);
            }
            //self.updateSIStatus(svcInstList);
            return svcInstList;
        },
        updateSIStatus: function (siDataItems) {
            var siDataItemLen = siDataItems.length;
            var totalSpawningCnt = 0;
            var totalActiveCnt = 0;

            for (var i = 0; i < siDataItemLen; i++) {
                /* First compute from nova status */
                var maxInsts = getValueByJsonPath(siDataItems[i],
                                                  "service_instance_properties;scale_out;max_instances",
                                                  1);
                var novaData = getValueByJsonPath(siDataItems[i],
                                                  "statusDetails;VMDetails", []);
                var tmplVersion = getValueByJsonPath(siDataItems[i],
                                                     "svcTmplDetails;0;service_template_properties;version",
                                                     1);
                var novaServerCnt = novaData.length;
                var actCnt = 0;
                var inactCnt = 0;
                var spawnCnt = 0;
                if (!novaServerCnt) {
                    /* VM not launched yet, let us check tempVMStatus now */
                    var siStatus = getValueByJsonPath(siDataItems[i],
                                                     "statusDetails;vmStatus",
                                                     getValueByJsonPath(siDataItems[i],
                                                                        "tempVMStatus"));
                    if (null != siStatus) {
                        if ("Spawning" == siStatus) {
                            totalSpawningCnt++;
                        }
                        if (null != siDataItems[i].tempVMStatus) {
                            siDataItems[i].statusDetails.vmStatus =
                                siDataItems[i].tempVMStatus;
                            delete siDataItems[i].tempVMStatus;
                        }
                    }
                    continue;
                }
                for (var j = 0; j < novaServerCnt; j++) {
                    var vmState = getValueByJsonPath(novaData[j],
                                                     'server;OS-EXT-STS:vm_state');
                    if ("active" == vmState) {
                        actCnt++;
                        totalActiveCnt++;
                    } else if ("building" == vmState) {
                        spawnCnt++;
                        totalSpawningCnt++;
                    } else {
                        inactCnt++;
                    }
                }
                if (2 == tmplVersion) {
                    maxInsts = novaServerCnt;
                }
                if (spawnCnt == maxInsts) {
                    siDataItems[i].statusDetails.vmStatus =
                        "Spawning";
                } else if (actCnt == maxInsts) {
                    siDataItems[i].statusDetails.vmStatus =
                        "Active";
                } else if (inactCnt == maxInsts) {
                    siDataItems[i].statusDetails.vmStatus =
                        "Inactive";
                } else {
                    siDataItems[i].statusDetails.vmStatus =
                        "Partially Active";
                }
            }
            return {totalSpawningCnt: totalSpawningCnt, totalActiveCnt:
                totalActiveCnt};
        },
        getVlRemoteGLConfig: function (selectedProject) {
            var openstackVLRemoteConfig = [{
            getAjaxConfig: function (resultJSON) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_NOVA_STATUS,
                                  self.selectedProject.value, chunkCnt),
                    type: "GET",
                    timeout: 60000
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.parseNovaSIStatusToListModel(response, false);
            },
            failureCallback: function(error, contrailListModel) {
                console.log("We are in failureCallback", error);
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url:
                    '/api/tenants/config/service-template-images',
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.svcInstanceDataObj.imageList =
                    ((null != response) && (null != response['images'])) ?
                    response['images'] : [];
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url: '/api/tenants/config/getAvailabilityZone',
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.svcInstanceDataObj.availabilityZoneList = [];
                self.svcInstanceDataObj.availabilityZoneList.push(
                    {'text': 'ANY', 'value':'ANY'});
                if ('availabilityZoneInfo' in response) {
                    var zoneList = response['availabilityZoneInfo'];
                    var len = zoneList.length;
                    for (var i = 0; i < len; i++) {
                        var znStAvl =
                            getValueByJsonPath(zoneList[i],
                                               'zoneState;available', false);
                        if (true == znStAvl) {
                            self.svcInstanceDataObj.availabilityZoneList.push({'text':
                                                             zoneList[i]['zoneName'],
                                                             'value':
                                                             zoneList[i]['zoneName']});
                        }
                    }
                }
            }
        }];
        var vlRemoteGLConfig = [{
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INST_TMPLTS,
                                  self.selectedProject.parentSelectedValueData.value),
                    type: "GET"
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.svcInstanceDataObj.svcTmplsFormatted = [];
                var svcTmpObjs = {};
                if (('service_templates' in response) &&
                    (response['service_templates'].length > 0)) {
                    var svcTmps = response['service_templates'];
                    var respCnt = svcTmps.length;
                    var svcTmplObjsByFqn ={};
                    if (!respCnt) {
                        var nullObj =
                            {id: null, text: "No Service template available"};
                        self.svcInstanceDataObj.svcTmplsFormatted.push(nullObj);
                    }
                    for (var i = 0; i < respCnt; i++) {
                        if ('service-template' in svcTmps[i]) {
                            var svcTmpUUID =
                                svcTmps[i]['service-template']['uuid'];
                            var fqn =
                                svcTmps[i]['service-template']['fq_name'].join(':');
                            svcTmplObjsByFqn[fqn] =
                                svcTmps[i]['service-template'];
                            svcTmpObjs[svcTmpUUID] = svcTmps[i];
                            var dispStr =
                                svcInstUtils.svcTemplateFormatter(svcTmps[i]);
                            self.svcInstanceDataObj.svcTmplsFormatted.push(
                                {id: dispStr, text: dispStr});
                        }
                    }
                }
                var dataItems = self.contrailListModel.getItems();
                var cnt = dataItems.length;
                for (var i = 0; i < cnt; i++) {
                    if (('service_template_refs' in dataItems[i]) &&
                        (dataItems[i]['service_template_refs'].length > 0)) {
                        dataItems[i]['svcTmplDetails'] = [];
                        var svcTmpRefs = dataItems[i]['service_template_refs'];
                        var svcTmpRefsCnt = svcTmpRefs.length;
                        for (var j = 0; j < svcTmpRefsCnt; j++) {
                            var uuid = svcTmpRefs[j]['uuid'];
                            if ((null != svcTmpObjs[uuid]) &&
                                (null != svcTmpObjs[uuid]['service-template'])) {
                                dataItems[i]['svcTmplDetails'].push(svcTmpObjs[uuid]['service-template']);
                            }
                        }
                    }
                }
                self.contrailListModel.updateData(dataItems);
                self.svcInstanceDataObj.svcInstTmplts = svcTmplObjsByFqn;
                self.renderView4Config(self.$el, self.contrailListModel,
                           getSvcInstViewConfig(self.svcInstanceDataObj));
            },
            failureCallback: function(error, contrailListModel) {
                self.renderView4Config(self.$el, self.contrailListModel,
                        getSvcInstViewConfig(self.svcInstanceDataObj));
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url: '/api/service/networking/web-server-info?project=' +
                        contrail.getCookie('project'),
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var roles = getValueByJsonPath(response, 'role', []);
                self.svcInstProjRole = roles;
            }
        }];
        if(isOpenstackOrchModel()) {
            vlRemoteGLConfig = openstackVLRemoteConfig.concat(vlRemoteGLConfig);
        }
        return vlRemoteGLConfig;
    }
    });

    var getSvcInstViewConfig = function (svcInstanceDataObj) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SERVICE_INSTANCES_ID,
                                title: ctwl.TITLE_SERVICE_INSTANCES,
                                view: "svcInstGridView",
                                viewPathPrefix: "config/services/instances/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10, pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    svcInstanceDataObj: svcInstanceDataObj
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return SvcInstListView;
});

