/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, ContrailListModel, SvcInstUtils) {
    var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var svcInstObj = {};
    var svcInstTmplts = [];
    var that = this;
    var self;
    var chunkCnt = 10;
    var svcInstUtils = new SvcInstUtils();
    var svcInstTimerLevel = 0;
    var svcInstTimerArray = [20000, 35000, 45000, 55000, 65000, 75000];
    var svcInstanceTimer = null;

    window.doFetchSvcInst = false;

    var SvcInstListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            self.selectedProject = viewConfig['projectSelectedValueData'];
            window.projectDomainData = self.selectedProject;

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
                    vlRemoteList : self.getVlRemoteGLConfig(),
                    completeCallback: function() {
                        window.hostList = [];
                        var userRoles = window.svcInstProjRole;
                        userRoles = null;
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
                                window.hostList = result;
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
                window.siSlicedData.shift();
                if (!window.siSlicedData.length) {
                    return;
                }
                dataList = window.siSlicedData[0];
                self.fetchSIStatusAndUpdateListModel(dataList);
                return;
            } else {
                if (!window.siRefStatusData.length) {
                    if (true == isRefetch) {
                        window.siRefStatusData = window.siRefStatusBackupData;
                    } else {
                        return;
                    }
                }
                dataList = window.siRefStatusData[0];
            }
            if (svcInstTimerLevel < svcInstTimerArray.length) {
                svcInstanceTimer = setTimeout(function() {
                    self.fetchSIStatusAndUpdateListModel(dataList, isRefetch);
                    svcInstTimerLevel++;
                }, svcInstTimerArray[svcInstTimerLevel]);
            } else {
                window.doFetchSvcInst = false;
                return;
            }
        },
        fetchSIStatusAndUpdateListModel: function(listData, isRefetch) {
            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                              window.projectDomainData.value),
                type: "POST",
                data: JSON.stringify(listData)
            };
            contrail.ajaxHandler(ajaxConfig, null, function(result) {
                self.parseSIStatusToListModel(result, isRefetch);
                if (true == isRefetch) {
                    window.siRefStatusData.shift();
                }
            });
        },
        checkIfStatusRefetchNeeded: function() {
            return window.doFetchSvcInst;
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
            if (!window.siRefStatusData.length) {
                return;
            }
            self.clearSITimer();
            window.siListDataChunked = response;
            if (svcInstTimerLevel < svcInstTimerArray.length) {
                svcInstanceTimer = setTimeout(function() {
                    self.parseSIStatusToListModel(window.siListDataChunked,
                                                  window.doFetchSvcInst);
                    svcInstTimerLevel++;
                }, svcInstTimerArray[svcInstTimerLevel]);
            } else {
                self.clearSITimer();
            }
        },
        parseSIStatusToListModel: function(response, isRefetch) {
            self.clearSITimer();
            window.doFetchSvcInst = false;
            var dataItems = self.contrailListModel.getItems();
            var dataCnt = dataItems.length;
            var tmpSvcInstObjs = {};
            for (var i = 0; i < dataCnt; i++) {
                if (null == dataItems[i]['statusDetails']) {
                    dataItems[i]['statusDetails'] = {};
                }
                tmpSvcInstObjs[dataItems[i]['uuid']] = i;
            }
            var respCnt = response.length;
            for (var i = 0; i < respCnt; i++) {
                var uuid =
                    response[i]['ConfigData']['service-instance']['uuid'];
                var idx = tmpSvcInstObjs[uuid];
                if (null != idx) {
                    dataItems[idx]['statusDetails']['vmStatus'] =
                        response[i]['vmStatus'];
                    dataItems[idx]['statusDetails']['VMDetails'] =
                        response[i]['VMDetails'];
                    if (('Inactive' != response[i]['vmStatus']) &&
                        ('Active' != response[i]['vmStatus'])) {
                        window.doFetchSvcInst = true;
                    }
                }
            }
            self.contrailListModel.updateData(dataItems);
            self.fetchSIStatusWithChunk(window.doFetchSvcInst);
        },
        getVlRemoteGLConfig: function () {
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
                window.siSlicedData = siSlicedData;
                try {
                    window.siRefStatusData =
                        JSON.parse(JSON.stringify(siSlicedData));
                    window.siRefStatusBackupData =
                        JSON.parse(JSON.stringify(siSlicedData));
                } catch(e) {
                    window.siRefStatusData = [];
                    window.siRefStatusBackupData = [];
                }

                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                                  window.projectDomainData.value),
                    type: "POST",
                    timeout: 60000,
                    data: JSON.stringify(siSlicedData[0])
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                self.parseSIStatusToListModel(response, false);
                if (!window.siSlicedData.length) {
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
                window.imageList =
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
                window.availabilityZoneList = [];
                window.availabilityZoneList.push({'text': 'ANY', 'value':
                                                 'ANY'});
                if ('availabilityZoneInfo' in response) {
                    var zoneList = response['availabilityZoneInfo'];
                    var len = zoneList.length;
                    for (var i = 0; i < len; i++) {
                        var znStAvl =
                            getValueByJsonPath(zoneList[i],
                                               'zoneState;available', false);
                        if (true == znStAvl) {
                            window.availabilityZoneList.push({'text':
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
                    url: '/api/service/networking/user-roles?project=' +
                             getCookie('project'),
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                window.svcInstProjRole = response;
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INST_TMPLTS,
                                  window.projectDomainData.parentSelectedValueData.value),
                    type: "GET"
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                window.svcTmplsFormatted = [];
                if (('service_templates' in response) &&
                    (response['service_templates'].length > 0)) {
                    var svcTmps = response['service_templates'];
                    var respCnt = svcTmps.length;
                    var svcTmpObjs = {};
                    var svcTmplObjsByFqn ={};
                    if (!respCnt) {
                        var nullObj =
                            {id: null, text: "No Service template available"};
                        window.svcTmplsFormatted.push(nullObj);
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
                            window.svcTmplsFormatted.push({id: dispStr, text:
                                                          dispStr});
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
                self.renderView4Config(self.$el, self.contrailListModel,
                           getSvcInstViewConfig(), null, null,
                           null, function() {
                    $(gridElId).data('svcInstTmplts', svcTmplObjsByFqn);
                });
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
                window.svcInstProjRole = roles;
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

    var getSvcInstViewConfig = function () {
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
                                    }
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

