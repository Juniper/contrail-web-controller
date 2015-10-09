/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/services/instances/ui/js/models/InterfacesModel',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailModel, InterfacesModel, SvcInstUtils) {
    var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var svcInstUtils = new SvcInstUtils();
    var ServiceInstancesModel = ContrailModel.extend({
        defaultConfig: {
            service_template: null,
            display_name: null,
            status: 'Inactive',
            service_instance_properties: {
                interface_list: [],
                left_virtual_network: "",
                management_virtual_network: "",
                right_virtual_network: "",
                scale_out: {
                    max_instances: 1
                },
            },
            service_template: null,
            service_template_refs: [],
            fq_name: [],
            uuid: null,
            no_of_instances: 1,
            availability_zone: 'ANY',
            host_list: [],
            parent_uuid: null
        },
        validations: {
            serviceInstancesValidations: {
                'display_name': {
                    required: true
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            var intfTypes = [];
            if ((null != modelConfig) &&
                (null != modelConfig['svcTmplDetails']) &&
                (null != modelConfig['svcTmplDetails'][0])) {
                var svcTmplDetails = modelConfig['svcTmplDetails'][0];
                var svcTmpl = {'service-template': svcTmplDetails};
                svcTmpl = svcInstUtils.svcTemplateFormatter(svcTmpl);
                modelConfig['service_template'] = svcTmpl;
                var maxInst =
                    getValueByJsonPath(modelConfig,
                                       'service_instance_properties;scale_out;max_instances',
                                       null);
                var intfList =
                    getValueByJsonPath(modelConfig,
                                       'service_instance_properties;interface_list',
                                       []);
                if (null != maxInst) {
                    modelConfig['no_of_instances'] = maxInst;
                }
                svcTmpl = {'service-template': svcTmplDetails};
                var intfTypes = svcInstUtils.getSvcTmplIntfTypes(svcTmpl);
            }
            
            var interfacesModels = [];
            var interfacesCollectionModel;
            var cnt = intfTypes.length;
            for (var i = 0; i < cnt; i++) {
                var intfType = intfTypes[i];
                intfType = intfType.replace(intfType[0], intfType[0].toUpperCase());
                var interfacesModel =
                    new InterfacesModel({interfaceType: intfType,
                                        virtualNetwork:
                                        intfList[i]['virtual_network'],
                                        interfaceIndex: i,
                                        interfaceData: intfList[i]});
                interfacesModels.push(interfacesModel);
            }
            interfacesCollectionModel = new Backbone.Collection(interfacesModels);
            modelConfig['interfaces'] = interfacesCollectionModel;
            modelConfig.host_list = [{'text': 'ANY', 'id': 'ANY'}];
            return modelConfig;
        },
        formatModelConfigColl: function(intfTypes) {
            var interfaces = this.model().attributes['interfaces'];
            var len = interfaces.length;
            for (var i = 0; i < len; i++) {
                interfaces.remove(interfaces.models[i]);
                len--;
                i--;
            }
            var cnt = intfTypes.length;
            for (var i = 0; i < cnt; i++) {
                var intfType =
                    intfTypes[i].replace(intfTypes[i][0],
                                         intfTypes[i][0].toUpperCase());
                var vn = ((window.vnList) && (window.vnList.length > 0)) ?
                    window.vnList[0]['text'] : "";
                var newInterface =
                    new InterfacesModel({'interfaceType': intfType,
                                        'virtualNetwork': vn,
                                        'interfaceIndex': i});
                interfaces.add([newInterface]);
            }
            return;
        },
        getHostListByZone: function() {
            var self = this;
            return ko.computed(function () {
                return window.hostListByZone;
            }, this);
        },
        showHideStaticRTs: function(interfaceIndex) {
            var idx = interfaceIndex();
            var tmplStr = this.model().get('service_template');
            if (null == tmplStr) {
                return false;
            }
            tmplStr = tmplStr.trim();
            tmplStr = contrail.getCookie('domain') + ":" + tmplStr.split(' - [')[0];
            var tmplData = $(gridElId).data('svcInstTmplts');
            if (null == tmplData[tmplStr]) {
                return false;
            }
            var intfType =
                getValueByJsonPath(tmplData[tmplStr],
                                   'service_template_properties;interface_type',
                                   []);
            if (null != intfType[idx]) {
                return intfType[idx]['static_route_enable'];
            }
            return false;
        },
        getSIProperties: function() {
            var siProp = {};
            var intfList = [];
            var coll = this.model().attributes.interfaces;
            var len = coll.length;
            var models = coll['models'];
            for (var i = 0; i < len; i++) {
                var attr = models[i]['attributes'];
                intfList[i] = {};
                var vn = attr['virtualNetwork']();
                var intfType = attr['interfaceType']();
                intfList[i]['virtual_network'] = vn;
                /* Now check if we have Static RTs */
                if ('Right' == intfType) {
                    siProp['right_virtual_network'] = vn;
                }
                if ('Left' == intfType) {
                    siProp['left_virtual_network'] = vn;
                }
                if ('Management' == intfType) {
                    siProp['management_virtual_network'] = vn;
                }
                var staticRTs = attr.staticRoutes();
                var staticRTsCnt = staticRTs.length;
                for (var j = 0; j < staticRTsCnt; j++) {
                    if (0 == j) {
                        intfList[i]['static_routes'] = {'route': []};
                    }
                    var staticRTAttr = staticRTs[j].model().attributes;
                    var routeObj = {'prefix': staticRTAttr['prefix'](),
                        'next_hop': null, 'next_hop_type': null};
                    intfList[i]['static_routes']['route'].push(routeObj);
                }
            }
            siProp['interface_list'] = intfList;
            return siProp;
        },
        configureServiceInstances: function (isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            if (this.model().isValid(true, "serviceInstancesValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newServiceInstance = this.model().attributes;
                var siProp = this.getSIProperties();
                newServiceInstance['service_instance_properties'] = siProp;
                var tmpl =
                    newServiceInstance['service_template'].split(' - [')[0];
                newServiceInstance['service_template_refs'] = [];
                newServiceInstance['service_template_refs'][0] = {};
                newServiceInstance['service_template_refs'][0]['to'] =
                    [getCookie('domain'), tmpl];
                newServiceInstance['parent_type'] = 'project';
                newServiceInstance['parent_uuid'] =
                    window.projectDomainData.value;
                newServiceInstance['fq_name'] =
                    [getCookie('domain'), getCookie('project'),
                    newServiceInstance['display_name']];
                newServiceInstance['service_instance_properties']['scale_out'] =
                    {};
                newServiceInstance['service_instance_properties']['scale_out']
                    ['max_instances'] =
                    parseInt(newServiceInstance['no_of_instances']);
                delete newServiceInstance['interfaces'];
                delete newServiceInstance['host_list'];
                delete newServiceInstance['service_template'];
                delete newServiceInstance['status'];
                delete newServiceInstance['statusDetails'];
                delete newServiceInstance['svcTmplDetails'];
                delete newServiceInstance['no_of_instances'];
                if (null == newServiceInstance['uuid']) {
                    delete newServiceInstance['uuid'];
                }
                ajaxConfig = {};
                ctwu.deleteCGridData(newServiceInstance);
                var putData = {'service-instance': newServiceInstance};
                ajaxConfig.async = false;
                ajaxConfig.url = '/api/tenants/config/service-instances';
                if (true == isEdit) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url += '/' + newServiceInstance['uuid'];
                } else {
                    ajaxConfig.type = "POST";
                }
                ajaxConfig.data = JSON.stringify(putData);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.LINK_LOCAL_SERVICES_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteServiceInstances: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'service-instance',
                                             'deleteIDs': uuidList}]);
            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return ServiceInstancesModel;
});

