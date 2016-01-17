/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'knockout',
    'config/services/instances/ui/js/models/InterfacesModel',
    'config/services/instances/ui/js/svcInst.utils',
    'config/services/instances/ui/js/models/PortTupleModel',
    'config/services/instances/ui/js/models/SvcHealthChkModel',
    'config/services/instances/ui/js/models/IntfRtTableModel',
    'config/services/instances/ui/js/models/RtPolicyModel',
    'config/services/instances/ui/js/models/RtAggregateModel',
], function (_, ContrailModel, Knockout, InterfacesModel, SvcInstUtils,
             PortTupleModel, SvcHealthChkModel, IntfRtTableModel, RtPolicyModel,
             RtAggregateModel) {
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
                ha_mode: "",
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
            host: null,
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
                    var svcVirtType =
                        getValueByJsonPath(tmpl,
                                           'service_template_properties;service_virtualization_type',
                                           null);
                    if ('physical-device' == svcVirtType) {
                        return;
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
        getBackRefsByType: function(modelConfig, type) {
            var svcInstProps = [];
            var backRefs = null;
            var modelType;
            var modelKey;
            var backRefsLen = 0;
            if ('interface_route_table' == type) {
                backRefs = modelConfig['interface_route_table_back_refs'];
                modelType = IntfRtTableModel;
                modelKey = 'intfRtTables';
            }
            if ('routing_policy' == type) {
                backRefs = modelConfig['routing_policy_back_refs'];
                modelType = RtPolicyModel;
                modelKey = 'rtPolicys';
            }
            if ('service_health_check' == type) {
                backRefs = modelConfig['service_health_check_back_refs'];
                modelType = SvcHealthChkModel;
                modelKey = 'svcHeatchChecks';
            }
            if ('route_aggregate' == type) {
                backRefs = modelConfig['route_aggregate_back_refs'];
                modelType = RtAggregateModel;
                modelKey = 'rtAggregates';
            }
            if (null != backRefs) {
                backRefsLen = backRefs.length;
            }
            var properties = [];
            var intfTypes = [];
            if ((null != modelConfig) &&
                (null != modelConfig['service_template'])) {
                var tmpl = modelConfig['service_template'];
                var intfTypeStrStart = tmpl.indexOf('(');
                var intfTypeStrEnd = tmpl.indexOf(')');
                intfTypes =
                    tmpl.substr(intfTypeStrStart + 1,
                                intfTypeStrEnd - intfTypeStrStart - 1);
                intfTypes = intfTypes.split(', ');
            }

            var intfTypesList = [];
            var intfCnt = intfTypes.length;
            for (var i = 0; i < intfCnt; i++) {
                intfTypesList.push({text: intfTypes[i], id: intfTypes[i]});
            }
            if ((null != backRefs) && (backRefsLen > 0)) {
                for (var i = 0; i < backRefsLen; i++) {
                    var intfType =
                        getValueByJsonPath(backRefs[i],
                                           'attr;interface_type', null);
                    if (null == intfType) {
                        continue;
                    }
                    var value = backRefs[i]['to'].join(':') +
                        '~~' + backRefs[i]['uuid'];
                    var entryObj = {};
                    entryObj[type] = value;
                    entryObj['interface_type'] = intfType;
                    entryObj['interfaceTypesData'] = intfTypesList;
                    var newEntry = new modelType(entryObj);
                    properties.push(newEntry);
                }
            }
            var collection = new Backbone.Collection(properties);
            modelConfig[modelKey] = collection;
            return modelConfig;
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
                intfTypes = intfTypes.split(', ');
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
            var svcTmpls = $(gridElId).data('svcInstTmplts');
            var tmpl = modelConfig['service_template'];
            var svcTmplFqn = getCookie('domain') + ":" +
                tmpl.split(' - [')[0];

            var tmplVer =
                getValueByJsonPath(svcTmpls[svcTmplFqn],
                                   'service_template_properties;version',
                                   1);
            if (!intfList.length) {
                var intfsCnt = intfTypes.length;
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

            var portTupleList = modelConfig['port_tuples'];
            var portTupleModels = [];
            var portTuplesCnt = 0;
            if (null != portTupleList) {
                portTuplesCnt = portTupleList.length;
            }
            for (var i = 0; i < portTuplesCnt; i++) {
                var portTupleModel =
                    new PortTupleModel({portTupleName:
                                            portTupleList[i]['to'][3],
                                        portTupleData:
                                            portTupleList[i],
                                        intfTypes: intfTypes
                                       });
                portTupleModels.push(portTupleModel);
            }
            var portTuplesCollection = new Backbone.Collection(portTupleModels);
            modelConfig['portTuples'] = portTuplesCollection;
            this.getBackRefsByType(modelConfig, 'interface_route_table');
            this.getBackRefsByType(modelConfig, 'service_health_check');
            this.getBackRefsByType(modelConfig, 'routing_policy');
            this.getBackRefsByType(modelConfig, 'route_aggregate');

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

            var tmplVer = getValueByJsonPath(svcTmpls[svcTmplFqn],
                                             'service_template_properties;version',
                                             1);
            /*
            if (2 == tmplVer) {
                var portTuples = this.model().attributes['portTuples'];
                var len = portTuples.length;
                for (var i = 0; i < len; i++) {
                    portTuples.remove(portTuples.models[i]);
                    len--;
                    i--;
                }
                return;
            }
            */
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
            /*
            var portTupleList = this.model().attributes['port_tuples'];
            var portTupleModels = [];
            var portTuplesCnt = 0;
            if (null != portTupleList) {
                portTuplesCnt = portTupleList.length;
            }
            var portTuplesCollection = this.model().attributes['portTuples'];
            var len = portTuplesCollection.length;
            for (var i = 0; i < len; i++) {
                portTuplesCollection.remove(portTuplesCollection.models[i]);
                len--;
                i--;
            }
            len = portTuplesCollection.length;
            for (var i = 0; i < len; i++) {
                var portTupleModel =
                    new PortTupleModel({portTupleName:
                                        portTupleList[i]['to'][3],
                                       portTupleData: portTupleList[i],
                                       intfTypes: intfTypes});
                portTuplesCollection.add([portTupleModel]);
            }
            */
            return;
        },
        addPortTuple: function() {
            /*
            var noOfInsts = Number($('#no_of_instances').find('input').val());
            if (portTupleCollection.length >= noOfInsts) {
                var model = this.model();
                var attr = cowu.getAttributeFromPath('portTupleName');
                var errors = model.get(cowc.KEY_MODEL_ERRORS);
                var attrErrorObj = {}
                attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                    'Number of port tuples can not exceed number of instances';
                errors.set(attrErrorObj);
                return;
            }
            */
            /* Why this function gets called, even when the port_tuple stuff
               in invisible
             */
            var svcTmpl = this.model().get('service_template');
            var svcTmpls = $(gridElId).data('svcInstTmplts');
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmpl.split(' - [')[0];
            var tmplVer = getValueByJsonPath(svcTmpls[svcTmplFqn],
                                             'service_template_properties;version',
                                             1);
            if (1 == tmplVer) {
                return;
            }
            var portTupleCollection = this.model().get('portTuples');
            var newUUID = UUIDjs.create();
            var newPortTupleEntry =
                new PortTupleModel({portTupleName: newUUID['hex'],
                                   portTupleData: {},
                                   intfTypes: this.getIntfTypes(true)});
            portTupleCollection.add([newPortTupleEntry]);
        },
        getIntfTypes: function(isRaw) {
            var tmpl =
                $('#service_template_dropdown').data('contrailDropdown').value();
            var intfTypeStrStart = tmpl.indexOf('(');
            var intfTypeStrEnd = tmpl.indexOf(')');
            var itfTypes =
                tmpl.substr(intfTypeStrStart + 1,
                            intfTypeStrEnd -
                            intfTypeStrStart - 1);
            var intfTypes = itfTypes.split(', ');
            if (isRaw) {
                return intfTypes;
            }
            var cnt = intfTypes.length;
            var types = [];
            for (var i = 0; i < cnt; i++) {
                types.push({text: intfTypes[i], id: intfTypes[i]});
            }
            return types;
        },
        addPropSvcHealthChk: function() {
            var svcHeatchChecks = this.model().get('svcHeatchChecks');
            var svcHealthChkEntry = "";
            if (window.healthCheckServiceList.length > 0) {
                svcHealthChkEntry = window.healthCheckServiceList[0].value;
            }
            var types = this.getIntfTypes(false);
            var newEntry =
                new SvcHealthChkModel({service_health_check: svcHealthChkEntry,
                                       interface_type: types[0],
                                       interfaceTypesData: types});
            svcHeatchChecks.add([newEntry]);
        },
        addPropIntfRtTable: function() {
            var intfRtTables = this.model().get('intfRtTables');
            var intfRtTableEntry = "";
            if (window.interfaceRouteTableList.length > 0) {
                intfRtTableEntry = window.interfaceRouteTableList[0].value;
            }
            var types = this.getIntfTypes(false);
            var newEntry =
                new IntfRtTableModel({interface_route_table: intfRtTableEntry,
                                      interface_type: types[0],
                                      interfaceTypesData: types});
            intfRtTables.add([newEntry]);
        },
        addPropRtPolicy: function() {
            var rtPolicys = this.model().get('rtPolicys');
            var rtPolicy = "";
            if (window.routingPolicyList.length > 0) {
                rtPolicy = window.routingPolicyList[0].value;
            }
            var types = this.getIntfTypes(false);
            var newEntry =
                new RtPolicyModel({routing_policy: rtPolicy,
                                   interface_type: types[0],
                                   interfaceTypesData: types});
            rtPolicys.add([newEntry]);
        },
        addPropRtAggregate: function() {
            var rtAggregates = this.model().get('rtAggregates');
            var rtAgg = "";
            if (window.routeAggregateList.length > 0) {
                rtAgg = window.routeAggregateList[0].value;
            }
            var types = this.getIntfTypes(false);
            var newEntry =
                new RtAggregateModel({route_aggregate: rtAgg,
                                      interface_type: types[0],
                                      interfaceTypesData: types});
            rtAggregates.add([newEntry]);
        },
        deleteSvcInstProperty: function(data, property) {
            var collection = data.model().collection;
            var entry = property.model();
            collection.remove(entry);
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
            var siP = this.model().get('service_instance_properties');
            if ((null != siP) && (null != siP['ha_mode'])) {
                if ("" != siP['ha_mode']) {
                    siProp['ha_mode'] = siP['ha_mode'];
                }
            }
            siProp['interface_list'] = intfList;
            return siProp;
        },
        getPortTuples: function(svcInstName) {
            var nameList = [];
            var coll = this.model().get('portTuples');
            var len = coll.length;
            var models = coll['models'];
            for (var i = 0; i < len; i++) {
                var attr = models[i]['attributes'];
                nameList[i] = {};
                var name = attr['portTupleName']();
                var portTupleData = attr['portTupleData']();
                nameList[i]['to'] = [contrail.getCookie('domain'),
                    contrail.getCookie('project'), svcInstName, name];
                if (null != portTupleData) {
                    nameList[i]['uuid'] = portTupleData['uuid'];
                }
                var intfs = attr['portTupleInterfaces']();
                var intfsCnt = intfs.length;
                for (var j = 0; j < intfsCnt; j++) {
                    if (0 == j) {
                        nameList[i]['vmis'] = [];
                    }
                    var intfAttr = intfs[j].model().attributes;
                    var vmi = intfAttr['interface']();
                    var vmiArr = vmi.split('~~');
                    var intfObj = {'fq_name': vmiArr[0].split(':'),
                        'interfaceType': intfAttr['interfaceType'](),
                        'uuid': vmiArr[1]};
                    nameList[i]['vmis'].push(intfObj);
                }
            }
            return nameList;
        },
        getSvcInstProperties: function() {
            var propObjs = {};
            var list =
                this.getSvcInstPropertiesByType('interface_route_table_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['interface_route_table_back_refs'] =
                    list;
            }
            list =
                this.getSvcInstPropertiesByType('service_health_check_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['service_health_check_back_refs'] = list;
            }
            list =
                this.getSvcInstPropertiesByType('route_aggregate_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['route_aggregate_back_refs'] = list;
            }
            list =
                this.getSvcInstPropertiesByType('routing_policy_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['routing_policy_back_refs'] = list;
            }
            return propObjs;
        },
        getSvcInstPropertiesByType: function(backRefKey) {
            var collKey;
            var type;
            var propList = [];
            if ('interface_route_table_back_refs' == backRefKey) {
                type = 'interface_route_table';
                collKey = 'intfRtTables';
            }
            if ('service_health_check_back_refs' == backRefKey) {
                type = 'service_health_check';
                collKey = 'svcHeatchChecks';
            }
            if ('route_aggregate_back_refs' == backRefKey) {
                type = 'route_aggregate';
                collKey = 'rtAggregates';
            }
            if ('routing_policy_back_refs' == backRefKey) {
                type = 'routing_policy';
                collKey = 'rtPolicys';
            }
            var collection = this.model().get(collKey);
            var len = collection.length;
            var models = collection['models'];
            for (var i = 0; i < len; i++) {
                var attr = models[i]['attributes'];
                var propValue = attr[type]();
                var intfType = attr['interface_type']();
                if ((null != propValue) && ("" != propValue)) {
                    var data = propValue.split('~~');
                    if ((null != data[0]) && (null != data[1]) &&
                        ("" != data[0]) && ("" != data[1])) {
                        propList.push({
                            'to': data[0].split(':'), 'uuid': data[1],
                            'attr': {
                                'interface_type': intfType
                            }
                        });
                    }
                }
            }
            return propList;
        },
        configureSvcInst: function (isEdit, dataItem, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            if (this.model().isValid(true, "svcInstValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newSvcInst =
                    $.extend({}, true, this.model().attributes);
                var siProp = this.getSIProperties();
                var portTuples = this.getPortTuples(newSvcInst['display_name']);
                if (portTuples.length > 0) {
                    newSvcInst['port_tuples'] = portTuples;
                }
                newSvcInst['service_instance_properties'] = siProp;
                var svcProp = this.getSvcInstProperties();
                for (key in svcProp) {
                    newSvcInst[key] = svcProp[key];
                }
                var tmpl =
                    newSvcInst['service_template'].split(' - [')[0];
                newSvcInst['service_template_refs'] = [];
                newSvcInst['service_template_refs'][0] = {};
                newSvcInst['service_template_refs'][0]['to'] =
                    [getCookie('domain'), tmpl];
                newSvcInst['parent_type'] = 'project';
                newSvcInst['parent_uuid'] =
                    window.projectDomainData.value;
                var svcTmpls = $(gridElId).data('svcInstTmplts');
                var svcTmplFqn =
                    newSvcInst['service_template_refs'][0]['to'].join(':');
                if (null != svcTmpls[svcTmplFqn]) {
                    newSvcInst['svcTmplDetails'] = [];
                    newSvcInst['svcTmplDetails'][0] = svcTmpls[svcTmplFqn];
                }
                newSvcInst['fq_name'] =
                    [getCookie('domain'), getCookie('project'),
                    newSvcInst['display_name']];
                newSvcInst['service_instance_properties']['scale_out'] =
                    {};
                newSvcInst['service_instance_properties']['scale_out']
                    ['max_instances'] =
                    parseInt(newSvcInst['no_of_instances']);
                var availZone = "";
                if ('ANY' != newSvcInst['availability_zone']) {
                    availZone = newSvcInst['availability_zone'];
                }
                if ('ANY' != newSvcInst['host']) {
                    availZone += ':' + newSvcInst['host'];
                }
                if ("" != availZone) {
                    newSvcInst['service_instance_properties']
                        ['availability_zone'] = availZone;
                }
                delete newSvcInst['interfaces'];
                delete newSvcInst['host_list'];
                delete newSvcInst['service_template'];
                delete newSvcInst['status'];
                delete newSvcInst['statusDetails'];
                delete newSvcInst['no_of_instances'];
                delete newSvcInst['availability_zone'];
                delete newSvcInst['host'];
                delete newSvcInst['portTuples'];
                delete newSvcInst['intfRtTables'];
                delete newSvcInst['svcHeatchChecks'];
                delete newSvcInst['rtPolicys'];
                delete newSvcInst['rtAggregates'];

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

            var userData = {};
            var deleteObjsList = [];
            for (var i = 0; i < cnt; i++) {
                userData['port_tuples'] =
                    getValueByJsonPath(checkedRows[i], 'port_tuples', []);
                userData['template_version'] = 1;
                if ('svcTmplDetails' in checkedRows[i]) {
                    if (null != checkedRows[i]['svcTmplDetails'][0]) {
                        userData['template_version'] =
                            getValueByJsonPath(checkedRows[i]['svcTmplDetails'][0],
                                               'service_template_properties;version',
                                               1);
                    }
                }
                userData['interface_route_table_back_refs'] =
                    checkedRows[i]['interface_route_table_back_refs'];
                userData['service_health_check_back_refs'] =
                    checkedRows[i]['service_health_check_back_refs'];
                userData['routing_policy_back_refs'] =
                    checkedRows[i]['routing_policy_back_refs'];
                userData['route_aggregate_back_refs'] =
                    checkedRows[i]['route_aggregate_back_refs'];
                deleteObjsList.push(JSON.parse(JSON.stringify({'type': 'service-instance',
                                    'deleteIDs': [checkedRows[i]['uuid']],
                                    'userData': userData})));
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(deleteObjsList);
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

