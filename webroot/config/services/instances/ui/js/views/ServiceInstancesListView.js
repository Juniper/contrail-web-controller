/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/services/instances/ui/js/models/ServiceInstancesModel'
], function (_, ContrailView, ContrailListModel, ServiceInstancesModel) {
    var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var serviceInstancesObj = {};
    var svcInstTmplts = [];
    var that = this;
    var self;
    var chunkCnt = 4;

    var ServiceInstancesListView = ContrailView.extend({
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
                        type: "GET"
                    },
                    dataParser: serviceInstancesDataParser,
                    /*
                    successCallback: function(response) {
                        console.log("In SuccessCall");
                    }*/
                    failureCallback: function(error) {
                        console.log("Error");
                    }
                },
                vlRemoteConfig :{
                    vlRemoteList : self.getVlRemoteGLConfig(),
                },
                cacheConfig: {
                    ucid: 'service-instances',
                    cacheTimeout: 0
                }
            };
            self.contrailListModel = new ContrailListModel(listModelConfig);
        },
        fetchSIStatusWithChunk: function() {
            window.siSlicedData.shift();
            if (!window.siSlicedData.length) {
                return;
            }
            var ajaxConfig = {
                url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                              window.projectDomainData.value),
                type: "POST",
                data: JSON.stringify(window.siSlicedData[0])
            };
            contrail.ajaxHandler(ajaxConfig, null, function(result) {
                self.parseSIStatusToListModel(result);
            });
        },
        parseSIStatusToListModel: function(response) {
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
                }
            }
            self.contrailListModel.updateData(dataItems);
            self.fetchSIStatusWithChunk();
            console.log("Done");
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

                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SERVICE_INSTS_STATUS,
                                  window.projectDomainData.value),
                    type: "POST",
                    data: JSON.stringify(siSlicedData[0])
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                console.log("Getting in successCallback");
                self.parseSIStatusToListModel(response);
                console.log("Done");
            },
            failureCallback: function(error, contrailListModel) {
                console.log("We are in failureCallback");
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url:
                    '/api/tenants/config/service-template-images?' +
                        getCookie('domain'),
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                window.imageList = response;
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
                window.userRoles = response;
            }
        },
        {
            getAjaxConfig: function(response) {
                var lazyAjaxConfig = {
                    url: '/api/tenants/config/getHostList',
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                window.hostList = response;
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
                if (('service_templates' in response) &&
                    (response['service_templates'].length > 0)) {
                    var svcTmps = response['service_templates'];
                    var respCnt = svcTmps.length;
                    var svcTmpObjs = {};
                    var svcTmplObjsByFqn ={};
                    for (var i = 0; i < respCnt; i++) {
                        if ('service-template' in svcTmps[i]) {
                            var svcTmpUUID =
                                svcTmps[i]['service-template']['uuid'];
                            var fqn =
                                svcTmps[i]['service-template']['fq_name'].join(':');
                            svcTmplObjsByFqn[fqn] =
                                svcTmps[i]['service-template'];
                            svcTmpObjs[svcTmpUUID] = svcTmps[i];
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
                           getServiceInstancesViewConfig(), null, null,
                           null, function() {
                    $(gridElId).data('svcInstTmplts', svcTmplObjsByFqn);
                });
            }
        }];
        return vlRemoteGLConfig;
    }
    });

    var serviceInstancesDataParser = function (response) {
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

    var getServiceInstancesViewConfig = function () {
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
                                view: "ServiceInstancesGridView",
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

    return ServiceInstancesListView;
});

