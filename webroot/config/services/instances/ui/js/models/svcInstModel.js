/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'knockout',
    'config/services/instances/ui/js/models/InterfacesModel',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailModel, Knockout, InterfacesModel, SvcInstUtils) {
    var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
    var svcInstUtils = new SvcInstUtils();
    var SvcInstModel = ContrailModel.extend({
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
            svcInstValidations: {
                'display_name': function(val, attr, data) {
                    if ((null == data) || (null == data['display_name'])) {
                        return "Service Instance Name is required";
                    }
                    var dispName = data['display_name'].trim();
                    if (!dispName.length) {
                        return "Service Instance Name is required";
                    }
                    if (-1 != dispName.indexOf('_')) {
                        return 'Underscore is not allowed in Service ' +
                            'Instance Name';
                    }
                },
                'service_template': function(val, attr, data) {
                    if (null == val) {
                        return "Select Service Template";
                    }
                    var svcTmpl = getCookie('domain') + ":" +
                        val.split(' - [')[0];
                    var svcTmpls = $(gridElId).data('svcInstTmplts');
                    if (null == svcTmpls[svcTmpl]) {
                        return 'Service Template is not valid';
                    }
                    var tmpl = svcTmpls[svcTmpl];
                    var imgName =
                        getValueByJsonPath(tmpl,
                                           'service_template_properties;image_name',
                                           null);
                    if (null == imgName) {
                        return 'Image name not found for this template';
                    }
                    var imgList = window.imageList;
                    var imgCnt = imgList.length;
                    for (var i = 0; i < imgCnt; i++) {
                        if (imgList[i]['name'] == imgName) {
                            break;
                        }
                    }
                    if (i == imgCnt) {
                        return 'Image not found as specified in template';
                    }
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            if (!window.svcTmplsFormatted.length) {
                showInfoWindow("No Service Template found.",
                               "Add Service Template");
                return null;
            }
            var intfTypes = [];
            if ((null != modelConfig) &&
                (null != modelConfig['svcTmplDetails']) &&
                (null != modelConfig['svcTmplDetails'][0])) {
                var svcTmplDetails = modelConfig['svcTmplDetails'][0];
                var svcTmpl = {'service-template': svcTmplDetails};
                svcTmpl = svcInstUtils.svcTemplateFormatter(svcTmpl);
                modelConfig['service_template'] = svcTmpl;
                svcTmpl = {'service-template': svcTmplDetails};
                intfTypes = svcInstUtils.getSvcTmplIntfTypes(svcTmpl);
            } else {
                modelConfig['service_template'] =
                    window.svcTmplsFormatted[0]['id'];
                var tmpl = modelConfig['service_template'];
                var intfTypeStrStart = tmpl.indexOf('(');
                var intfTypeStrEnd = tmpl.indexOf(')');
                intfTypes =
                    tmpl.substr(intfTypeStrStart + 1,
                                intfTypeStrEnd - intfTypeStrStart - 1);
                intfTypes = intfTypes.split(',');
                var svcTmplObjsByFqn = $(gridElId).data('svcInstTmplts');
                if (null != tmpl) {
                    var tmplFqn = getCookie('domain') + ':' +
                    tmpl.split(' - [')[0];
                    svcTmpl = {'service-template': svcTmplObjsByFqn[tmplFqn]};
                } else {
                    svcTmpl = null;
                }
            }
            var maxInst =
                getValueByJsonPath(modelConfig,
                                   'service_instance_properties;scale_out;max_instances',
                                   null);
            if (null != maxInst) {
                modelConfig['no_of_instances'] = maxInst;
            }
            var intfList =
                getValueByJsonPath(modelConfig,
                                   'service_instance_properties;interface_list',
                                   []);
            if (!intfList.length) {
                var intfsCnt = intfTypes.length;
                var svcTmpls = $(gridElId).data('svcInstTmplts');
                var tmpl = modelConfig['service_template'];
                var svcTmplFqn = getCookie('domain') + ":" +
                    tmpl.split(' - [')[0];
                var interfaeTypes = [];
                if ((null != svcTmpls) && (null != svcTmpls[svcTmplFqn])) {
                    interfaeTypes =
                        getValueByJsonPath(svcTmpls[svcTmplFqn],
                                           'service_template_properties;interface_type',
                                           []);
                }
                var interfaeTypesCnt = interfaeTypes.length;
                for (var i = 0; i < intfsCnt; i++) {
                    var intfType =
                        intfTypes[i].replace(intfTypes[i][0],
                                             intfTypes[i][0].toUpperCase());
                    var vn = "";
                    if ((null != window.vnList) && (window.vnList.length > 0)) {
                        vn = svcInstUtils.getVNByTmplType(intfType, svcTmpl);
                        if (null == vn) {
                            vn = "";
                        } else {
                            vn = vn['id'];
                        }
                    }
                    intfList.push({virtual_network: vn});
                }
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
            var svcTmpl = this.model().get('service_template');
            var svcTmpls = $(gridElId).data('svcInstTmplts');
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmpl.split(' - [')[0];
            var svcTmplObj = {'service-template': svcTmpls[svcTmplFqn]};

            for (var i = 0; i < cnt; i++) {
                var intfType =
                    intfTypes[i].replace(intfTypes[i][0],
                                         intfTypes[i][0].toUpperCase());
                var vn = "";
                if ((null != window.vnList) && (window.vnList.length > 0)) {
                    vn = svcInstUtils.getVNByTmplType(intfTypes[i], svcTmplObj);
                    if (null == vn) {
                        vn = "";
                    } else {
                        vn = vn['id'];
                    }
                }
                var intfList =
                    getValueByJsonPath(this.model().attributes,
                                       'service_instance_properties;interface_list',
                                       []);
                var newInterface =
                    new InterfacesModel({'interfaceType': intfType,
                                        'virtualNetwork': vn,
                                        'interfaceIndex': i,
                                        interfaceData: intfList[i]});
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
        configureSvcInst: function (isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            if (this.model().isValid(true, "svcInstValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newSvcInst =
                    $.extend({}, true, this.model().attributes);
                var siProp = this.getSIProperties();
                newSvcInst['service_instance_properties'] = siProp;
                var tmpl =
                    newSvcInst['service_template'].split(' - [')[0];
                newSvcInst['service_template_refs'] = [];
                newSvcInst['service_template_refs'][0] = {};
                newSvcInst['service_template_refs'][0]['to'] =
                    [getCookie('domain'), tmpl];
                newSvcInst['parent_type'] = 'project';
                newSvcInst['parent_uuid'] =
                    window.projectDomainData.value;
                newSvcInst['fq_name'] =
                    [getCookie('domain'), getCookie('project'),
                    newSvcInst['display_name']];
                newSvcInst['service_instance_properties']['scale_out'] =
                    {};
                newSvcInst['service_instance_properties']['scale_out']
                    ['max_instances'] =
                    parseInt(newSvcInst['no_of_instances']);
                delete newSvcInst['interfaces'];
                delete newSvcInst['host_list'];
                delete newSvcInst['service_template'];
                delete newSvcInst['status'];
                delete newSvcInst['statusDetails'];
                delete newSvcInst['svcTmplDetails'];
                delete newSvcInst['no_of_instances'];
                if (null == newSvcInst['uuid']) {
                    delete newSvcInst['uuid'];
                }
                ajaxConfig = {};
                ctwu.deleteCGridData(newSvcInst);
                var putData = {'service-instance': newSvcInst};
                ajaxConfig.async = false;
                ajaxConfig.url = '/api/tenants/config/service-instances';
                if (true == isEdit) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url += '/' + newSvcInst['uuid'];
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
                    callbackObj.error(this.getFormErrorText(ctwl.SERVICE_INSTANCES_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteSvcInst: function(checkedRows, callbackObj) {
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
    return SvcInstModel;
});

