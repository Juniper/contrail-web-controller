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
    var chunkCnt = 10;
    var svcInstTimerLevel = 0;
    var svcInstanceTimer = null;

    var doFetchSvcInst = false;

    var SvcInstListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            self.selectedProject = viewConfig['projectSelectedValueData'];
            self.siSlicedData = [];
            self.siRefStatusBackupData = [];
            self.siRefStatusData = [];
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
                    dataParser: svcInstDataParser,
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
                        if (-1 != userRoles.indexOf('superAdmin')) {
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
        fetchSIStatusWithChunk: function(isRefetch) {
            var dataList = [];
            if (false == isRefetch) {
                self.siSlicedData.shift();
                if (!self.siSlicedData.length) {
                    return;
                }
                dataList = self.siSlicedData[0];
                self.fetchSIStatusAndUpdateListModel(dataList);
                return;
            } else {
                if (!self.siRefStatusData.length) {
                    if (true == isRefetch) {
                        self.siRefStatusData = self.siRefStatusBackupData;
                    } else {
                        return;
                    }
                }
                dataList = self.siRefStatusData[0];
            }
            if (svcInstTimerLevel < svcInstUtils.svcInstTimerArray.length) {
                svcInstanceTimer = setTimeout(function() {
                    self.fetchSIStatusAndUpdateListModel(dataList, isRefetch);
                    svcInstTimerLevel++;
                }, svcInstUtils.svcInstTimerArray[svcInstTimerLevel]);
            } else {
                doFetchSvcInst = false;
                svcInstTimerLevel = 0;
                return;
            }
        },
        fetchSIStatusAndUpdateListModel: function(listData, isRefetch) {
            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                              self.selectedProject.value),
                type: "POST",
                data: JSON.stringify(listData)
            };
            contrail.ajaxHandler(ajaxConfig, null, function(result) {
                self.parseSIStatusToListModel(result, isRefetch);
                if (true == isRefetch) {
                    self.siRefStatusData.shift();
                }
            });
        },
        checkIfStatusRefetchNeeded: function() {
            return doFetchSvcInst;
        },
        clearSITimer: function() {
            if (null != svcInstanceTimer) {
                clearInterval(svcInstanceTimer);
                svcInstanceTimer = null;
            }
        },
        checkAndRefreshStatusData: function(response) {
            if (false == this.checkIfStatusRefetchNeeded()) {
                self.clearSITimer();
                return;
            }
            if (!self.siRefStatusData.length) {
                return;
            }
            self.clearSITimer();
            if (svcInstTimerLevel < svcInstUtils.svcInstTimerArray.length) {
                svcInstanceTimer = setTimeout(function() {
                    self.parseSIStatusToListModel(response,
                                                  doFetchSvcInst);
                    svcInstTimerLevel++;
                }, svcInstUtils.svcInstTimerArray[svcInstTimerLevel]);
            } else {
                self.clearSITimer();
            }
        },
        parseSIStatusToListModel: function(response, isRefetch) {
            var uveHlthCheckData =
                getValueByJsonPath(response, '0;vmiData', []);
            var instTupleVMIMaps =
                getValueByJsonPath(response, '0;instTupleVMIMaps', {});
            var novaStatusData = getValueByJsonPath(response, '1', []);
            self.clearSITimer();
            doFetchSvcInst = false;
            svcInstUtils.svcInstTimerArray = svcInstUtils.svcInstStatusIntervals;

            var dataItems = self.contrailListModel.getItems();
            var dataCnt = dataItems.length;
            var tmpSvcInstObjs = {};
            var uveHlthCheckDataCnt = uveHlthCheckData.length;
            var vmiToHlthCheckMap = {};
            for (var i = 0; i < uveHlthCheckDataCnt; i++) {
                var vmiName = uveHlthCheckData[i]['name'];
                var vmiData =
                    getValueByJsonPath(uveHlthCheckData[i],
                                       'value;UveVMInterfaceAgent', null);
                vmiToHlthCheckMap[vmiName] = vmiData;
            }
            if (true == svcInstUtils.doFetchSvcInstHlthChk) {
                svcInstUtils.svcInstTimerArray =
                    svcInstUtils.healthCheckStatusIntervals;
                doFetchSvcInst = true;
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
                            continue;
                        }
                        instTupleVMIMaps[instID][portTupleID][vmis[i]] =
                            vmiToHlthCheckMap[vmis[i]];
                    }
                }
            }
            for (var i = 0; i < dataCnt; i++) {
                if (null == dataItems[i]['statusDetails']) {
                    dataItems[i]['statusDetails'] = {};
                }
                tmpSvcInstObjs[dataItems[i]['uuid']] = i;
            }
            var respCnt = novaStatusData.length;
            for (var i = 0; i < respCnt; i++) {
                var uuid =
                    novaStatusData[i]['ConfigData']['service-instance']['uuid'];
                var instTupleVMIObj = instTupleVMIMaps[uuid];
                var idx = tmpSvcInstObjs[uuid];
                if (null != idx) {
                    dataItems[idx]['statusDetails']['vmStatus'] =
                        novaStatusData[i]['vmStatus'];
                    dataItems[idx]['statusDetails']['VMDetails'] =
                        novaStatusData[i]['VMDetails'];
                    if (('Inactive' != novaStatusData[i]['vmStatus']) &&
                        ('Active' != novaStatusData[i]['vmStatus'])) {
                        doFetchSvcInst = true;
                    }
                    dataItems[idx]['statusDetails']['healthCheckStatus'] =
                        instTupleVMIMaps[uuid];
                }
            }
            self.contrailListModel.updateData(dataItems);
            self.fetchSIStatusWithChunk(doFetchSvcInst);
        },
        getVlRemoteGLConfig: function (selectedProject) {
        var vlRemoteGLConfig = [{
            getAjaxConfig: function (resultJSON) {
                var postData = [];
                var siSlicedData = [];
                var responseJSON = JSON.parse(JSON.stringify(resultJSON));
                var respLen = responseJSON.length;
                for (var i = 0; i < respLen; i++) {
                    delete responseJSON[i]['cgrid'];
                    responseJSON[i] = {'service-instance': responseJSON[i]};
                }
                for (i = 0, j = respLen; i < j; i += chunkCnt) {
                    var tempArray = responseJSON.slice(i, i + chunkCnt);
                    siSlicedData.push(tempArray);
                }
                self.siSlicedData = siSlicedData;
                try {
                    self.siRefStatusData =
                        JSON.parse(JSON.stringify(siSlicedData));
                    self.siRefStatusBackupData =
                        JSON.parse(JSON.stringify(siSlicedData));
                } catch(e) {
                    self.siRefStatusData = [];
                    self.siRefStatusBackupData = [];
                }

                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                                  self.selectedProject.value),
                    type: "POST",
                    timeout: 60000,
                    data: JSON.stringify(siSlicedData[0])
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.parseSIStatusToListModel(response, false);
                if (!self.siSlicedData.length) {
                    self.checkAndRefreshStatusData(response);
                }
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
        },
        {
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
                if (('service_templates' in response) &&
                    (response['service_templates'].length > 0)) {
                    var svcTmps = response['service_templates'];
                    var respCnt = svcTmps.length;
                    var svcTmpObjs = {};
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
        return vlRemoteGLConfig;
    }
    });

    var svcInstDataParser = function (response) {
        var retArr = [];
        if ((null != response) && (response.length > 0)) {
            var len = response.length;
            for (var i = 0; i < len; i++) {
                if ('service-instance' in response[i]) {
                    retArr.push(response[i]['service-instance']);
                }
            }
        }
        return retArr;
    }

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

