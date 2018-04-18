/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'knockout',
    'config/services/instances/ui/js/models/InterfacesModel',
    'config/services/instances/ui/js/svcInst.utils',
    'config/services/instances/ui/js/models/PortTupleModel',
    'config/services/instances/ui/js/models/SvcHealthChkModel',
    'config/services/instances/ui/js/models/IntfRtTableModel',
    'config/services/instances/ui/js/models/RtPolicyModel',
    'config/services/instances/ui/js/models/RtAggregateModel',
    'config/services/instances/ui/js/models/AllowedAddressPairModel',
    'config/services/instances/ui/js/models/StaticRTModel'
], function (_, ContrailConfigModel, Knockout, InterfacesModel, svcInstUtils,
             PortTupleModel, SvcHealthChkModel, IntfRtTableModel, RtPolicyModel,
             RtAggregateModel, AllowedAddressPairModel, StaticRTModel) {
    var self;
    var svcTypeLBStr = "loadbalancer";
    var SvcInstModel = ContrailConfigModel.extend({
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
            service_template_refs: [],
            fq_name: [],
            uuid: null,
            no_of_instances: 1,
            availability_zone: 'ANY',
            host_list: [],
            host: null,
            user_created_ha_mode: "",
            parent_uuid: null
        },
        validations: {
            svcInstValidations: {
                'no_of_instances': function(val, attr, data) {
                    var svcTmpl = data.service_template;
                    var svcTmpls = self.svcInstanceDataObj.svcInstTmplts;
                    var svcTmplFqn = getCookie('domain') + ":" +
                        svcTmpl.split(' - [')[0];
                    var svcTmplObj = svcTmpls[svcTmplFqn];

                    var svcScaling =
                        getValueByJsonPath(svcTmplObj,'service_template_properties;service_scaling',
                                           false);
                    var tmplVer =
                        getValueByJsonPath(svcTmplObj,'service_template_properties;version',
                                           1);
                    if ((2 == tmplVer) || (false == svcScaling)) {
                        return;
                    }
                    if ((null == val) || (isNaN(val))) {
                        return 'Instance count must be between 1 and 64';
                    }
                    if (typeof val == 'string') {
                        val = val.trim();
                        val = Number(val);
                    }
                    if ((val < 1) || (val > 64)) {
                        return 'Instance count must be between 1 and 64';
                    }
                },
                'display_name': function(val, attr, data) {
                    if ((null == data) || (null == data['display_name'])) {
                        return "Service Instance Name is required";
                    }
                    var dispName = data['display_name'].trim();
                    if (!dispName.length) {
                        return "Service Instance Name is required";
                    }
                },
                'service_health_check': function(val, attr, data) {
                    var svcTmpl = data.service_template;
                    var svcTmplObj =
                        svcInstUtils.getSvcTmplDetailsBySvcTmplStr(svcTmpl,
                            self.svcInstanceDataObj.svcInstTmplts);
                    var tmplVer =
                        getValueByJsonPath(svcTmplObj,'service_template_properties;version',
                                           1);
                    if (1 == tmplVer) {
                        return;
                    }
                    var svcHealthChecks = data['svcHealtchChecks'];
                    if (null == svcHealthChecks) {
                        return;
                    }
                    svcHealthChecks = svcHealthChecks.toJSON();
                    var len = svcHealthChecks.length;
                    var intfTypes = [];
                    var svcHealthChks = [];
                    for (var i = 0; i < len; i++) {
                        var intfType = svcHealthChecks[i]['interface_type']();
                        var svcHealthChkEntry =
                            svcHealthChecks[i]['service_health_check']();
                        if (null == intfType) {
                            return 'Interface type is required for service '+
                                'health check';
                        }
                        if (null == svcHealthChkEntry) {
                            return 'Select service health check entry';
                        }
                        intfTypes.push(intfType);
                        svcHealthChks.push(svcHealthChkEntry);
                    }
                    if (intfTypes.length > 1) {
                        if (intfTypes.length != (_.uniq(intfTypes)).length) {
                            return 'Same interface types selected for ' +
                                'multiple service health check';
                        }
                        if (svcHealthChks.length !=
                            (_.uniq(svcHealthChks)).length) {
                            return 'Same service health check entries ' +
                                'selected for multiple interface types';
                        }
                    }
                },
                'routing_policy': function(val, attr, data) {
                    var rtPolicys = data['rtPolicys'];
                    if (null == rtPolicys) {
                        return 'Select routing policy in order';
                    }
                    rtPolicys = rtPolicys.toJSON();
                    var len = rtPolicys.length;
                    var intfTypes = [];
                    var rtPolicyList = [];
                    for (var i = 0; i < len; i++) {
                        var intfType = rtPolicys[i]['interface_type']();
                        if (null == intfType) {
                            return 'Interface type is required for routing '+
                                'policy';
                        }
                        var entry =
                            rtPolicys[i]['routing_policy']();
                        if (null == entry) {
                            return 'Select routing policy in order';
                        }
                        intfTypes.push(intfType);
                    }
                    if (intfTypes.length > 1) {
                        if (intfTypes.length != (_.uniq(intfTypes)).length) {
                            return 'Same interface types selected for ' +
                                'multiple routing policy';
                        }
                    }
                },
                'virtualNetwork': function(val, attr, data) {
                    var svcTmpl = data.service_template;
                    var svcTmplObj =
                        svcInstUtils.getSvcTmplDetailsBySvcTmplStr(svcTmpl,
                            self.svcInstanceDataObj.svcInstTmplts);
                    var svcTmplIntfs =
                        getValueByJsonPath(svcTmplObj,
                                           'service_template_properties;interface_type',
                                           []);
                    var version =
                        getValueByJsonPath(svcTmplObj,
                                           'service_template_properties;version',
                                           1);
                    var svcMode =
                        getValueByJsonPath(svcTmplObj,
                                           'service_template_properties;service_mode',
                                           null);
                    var svcType =
                        getValueByJsonPath(svcTmplObj,
                                           "service_template_properties;service_type",
                                           null);
                    var interfaceCollection = data['interfaces'];
                    if (null == interfaceCollection) {
                        return;
                    }
                    var models = interfaceCollection['models'];
                    var len = interfaceCollection.length;
                    var errStr = "Auto Configured network not allowed";
                    var vnList = [];
                    for (var i = 0; i < len; i++) {
                        var attr = models[i]['attributes'];
                        var vn = attr['virtualNetwork']();
                        if (null != vn) {
                            vnList.push(vn);
                        }
                        if ('management' !=
                             svcTmplIntfs[i]['service_interface_type']) {
                            if (('in-network' == svcMode) ||
                                ('in-network-nat' == svcMode) ||
                                ('other' ==
                                 svcTmplIntfs[i]['service_interface_type'])) {
                                if ("autoConfigured" == vn) {
                                    return errStr;
                                }
                            }
                        }
                        if (true == svcTmplIntfs[i]["static_route_enable"]) {
                            if ("autoConfigured" == vn) {
                                return errStr;
                            }
                        }
                    }
                    /* In loadbalancer, we may have null VN, but at least 1 VN
                     * should be valid
                     */
                    if ((svcTypeLBStr == svcType) && (!vnList.length)) {
                        return "At least 1 Virtual Network should be set " +
                            "for load balancer"
                    }
                },
                'interface': function(val, attr, data) {
                    var portTuples =
                        svcInstUtils.getPortTuples(data['display_name'],
                                                   data['portTuples']);
                    if (null == portTuples) {
                        return;
                    }
                    var cnt = portTuples.length;
                    var vmiListPerPortTuple = [];
                    for (var i = 0; i < cnt; i++) {
                        vmiListPerPortTuple[i] = [];
                        var vmis = portTuples[i]['vmis'];
                        if (null == vmis) {
                            continue;
                        }
                        var vmisCnt = vmis.length;
                        for (var j = 0; j < vmisCnt; j++) {
                            vmiListPerPortTuple[i].push(vmis[j]['uuid']);
                        }
                        var uniqVmisList = _.uniq(vmiListPerPortTuple[i]);
                        if (uniqVmisList.length !=
                            vmiListPerPortTuple[i].length) {
                            var errorStr = 'Same interface assigned for ' +
                                'multiple interface types';
                            if ((null != portTuples[i]['to']) &&
                                (null != portTuples[i]['to'][3])) {
                                errorStr += ' for port tuple ' +
                                    portTuples[i]['to'][3];
                            }
                            return errorStr;
                        }
                    }
                    var tmpVmiListPerPortTuple = _.flatten(vmiListPerPortTuple);
                    if (tmpVmiListPerPortTuple.length !=
                        (_.uniq(tmpVmiListPerPortTuple)).length) {
                        return 'One or more same interfaces assigned to ' +
                            'multiple port tuple';
                    }
                },
                'service_template': function(val, attr, data) {
                    if (null == val) {
                        return "Select Service Template";
                    }
                    var svcTmpl = getCookie('domain') + ":" +
                        val.split(' - [')[0];
                    var svcTmpls = self.svcInstanceDataObj.svcInstTmplts;
                    if (null == svcTmpls[svcTmpl]) {
                        return 'Service Template is not valid';
                    }
                    var tmpl = svcTmpls[svcTmpl];
                    var imgName =
                        getValueByJsonPath(tmpl,
                                           'service_template_properties;image_name',
                                           null);
                    var serviceType =
                        getValueByJsonPath(tmpl,
                                           "service_template_properties;service_type",
                                           null);
                    var tmplVersion =
                        getValueByJsonPath(tmpl,
                                           'service_template_properties;version',
                                           1);
                    if ((2 == tmplVersion) || (svcTypeLBStr == serviceType)) {
                        return;
                    }
                    var svcVirtType =
                        getValueByJsonPath(tmpl,
                                           'service_template_properties;service_virtualization_type',
                                           null);
                    if ('physical-device' == svcVirtType ||
                            'network-namespace' == svcVirtType) {
                        return;
                    }
                    if (null == imgName) {
                        return 'Image name not found for this template';
                    }
                    var imgList = self.svcInstanceDataObj.imageList;
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
        changePortTupleName: function() {
            var portTuples = this.model().get('portTuples');
            var svcInstName = this.model().get('display_name');
            if ((null == svcInstName) || (!svcInstName.trim().length)) {
                return;
            }
            var cnt = portTuples.length;
            for (var i = 0; i < cnt; i++) {
                var portTupleName = portTuples.models[i].get('portTupleName')();
                var splitArr = portTupleName.split('-port-tuple');
                if (2 == splitArr.length) {
                    splitArr[0] = svcInstName;
                    splitArr[2] = splitArr[1];
                    splitArr[1] = '-port-tuple';
                } else if (splitArr.length > 2) {
                    tmpPortTupleArr = [];
                    tmpPortTupleArr[0] = svcInstName;
                    tmpPortTupleArr[1] = '-port-tuple';
                    tmpPortTupleArr[2] = splitArr[splitArr.length - 1];
                    splitArr = tmpPortTupleArr;
                }
                portTuples.models[i].attributes.portTupleName(splitArr.join(''));
            }
        },
        formRoutingPolicyToDisplay: function(rtList, intfType) {
            if (!rtList.length) {
                return null;
            }
            var policyList = [];
            rtList.sort(function(entry1, entry2) {
                return entry1.seqId - entry2.seqId;
            });
            var entryObj = {};
            var cnt = rtList.length;
            for (var i = 0; i < cnt; i++) {
                policyList.push(rtList[i]['rtPolicy']);
            }
            entryObj['routing_policy'] = policyList.join(
                                             ctwc.MULTISELECT_VALUE_SEPARATOR);
            entryObj['interface_type'] = intfType;
            var types = [{text: 'left', id: 'left'},
                {text: 'right', id: 'right'}];
            entryObj['rtPolicyInterfaceTypesData'] = types;
            var newEntry = new RtPolicyModel(entryObj);
            return newEntry;
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
                modelKey = 'svcHealtchChecks';
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
            var rtAggIntfTypesList = [];
            var intfCnt = intfTypes.length;
            for (var i = 0; i < intfCnt; i++) {
                intfTypesList.push({text: intfTypes[i], id: intfTypes[i]});
            }
            var intfTypeToBackRefsMap = {};
            var leftRtPolSeqList = [];
            var rightRtPolSeqList = [];
            var dataObjArr = [];
            if ((null != backRefs) && (backRefsLen > 0)) {
                for (var i = 0; i < backRefsLen; i++) {
                    var value = backRefs[i]['to'].join(':') +
                        cowc.DROPDOWN_VALUE_SEPARATOR + backRefs[i]['uuid'];
                    var intfType =
                        getValueByJsonPath(backRefs[i],
                                           'attr;interface_type', null);
                    if ('routing_policy' == type) {
                        var leftRtPolSeq =
                            getValueByJsonPath(backRefs[i],
                                               'attr;left_sequence', null);
                        var rightRtPolSeq =
                            getValueByJsonPath(backRefs[i],
                                               'attr;right_sequence', null);
                        if ((null == leftRtPolSeq) && (null == rightRtPolSeq)) {
                            continue;
                        }
                        if (null != leftRtPolSeq) {
                            leftRtPolSeqList.push({seqId: Number(leftRtPolSeq),
                                                  rtPolicy: value});
                        }
                        if (null != rightRtPolSeq) {
                            rightRtPolSeqList.push({seqId:
                                                   Number(rightRtPolSeq),
                                                   rtPolicy: value});
                        }
                    } else {
                        if (null == intfType) {
                            continue;
                        }
                    }
                    if (null == intfTypeToBackRefsMap[intfType]) {
                        intfTypeToBackRefsMap[intfType] = [];
                    }

                    intfTypeToBackRefsMap[intfType].push(value);
                    if ('service_health_check' == type) {
                        var entryObj = {};
                        entryObj[type] = value;
                        entryObj['interface_type'] = intfType;
                        entryObj['interfaceTypesData'] = intfTypesList;
                        var newEntry = new modelType(entryObj);
                        properties.push(newEntry);
                    }
                }
                if (leftRtPolSeqList.length > 0) {
                    var newEntry =
                        this.formRoutingPolicyToDisplay(leftRtPolSeqList,
                                                        'left');
                    properties.push(newEntry);
                }
                if (rightRtPolSeqList.length > 0) {
                    var newEntry =
                        this.formRoutingPolicyToDisplay(rightRtPolSeqList,
                                                        'right');
                    properties.push(newEntry);
                }
            }
            if (('routing_policy' != type) &&
                ('service_health_check' != type)) {
                if ('route_aggregate' == type) {
                    intfTypesList =
                        svcInstUtils.getRouteAggregateInterfaceTypes(intfTypes);
                }
                for (var key in intfTypeToBackRefsMap) {
                    var entryObj = {};
                    entryObj[type] = intfTypeToBackRefsMap[key].join(
                                         ctwc.MULTISELECT_VALUE_SEPARATOR);
                    entryObj['interface_type'] = key;
                    entryObj['interfaceTypesData'] = intfTypesList;
                    var newEntry = new modelType(entryObj);
                    properties.push(newEntry);
                }
            }
            var collection = new Backbone.Collection(properties);
            modelConfig[modelKey] = collection;
            return modelConfig;
        },
        setVMIsByVN: function(modelConfig, vnName, intfType, vnDetails) {
            var pTuples = modelConfig.get('portTuples');
            var vmiList = [];
            if (null == pTuples) {
                return;
            }
            var portTuplesCnt = pTuples.length;
            for (var i = 0; i < portTuplesCnt; i++) {
                var portTupleIntfs =
                    pTuples.models[i].get('portTupleInterfaces')();
                var portTupleIntfsCnt = portTupleIntfs.length;
                for (var j = 0; j < portTupleIntfsCnt; j++) {
                    if (intfType == portTupleIntfs[j]['interfaceType']()()) {
                        if (vnDetails.vnVmiMaps[vnName]) {
                            vmiList = vnDetails.vnVmiMaps[vnName];
                        }
                        portTupleIntfs[j]['vmiListData']()(vmiList);
                        break;
                    }
                }
            }
            return;
        },
        getVNListBySvcIntfType: function(svcTmpl, intf, version, configDetails) {
            var vnList = $.extend([], true, configDetails.allVNList);
            if (null == intf) {
                return vnList;
            }
            if (2 == version) {
                if (vnList.length > 0) {
                    if ('autoConfigured' == vnList[0]['id']) {
                        vnList.splice(0, 1);
                    }
                }
                return vnList;
            }
            var showAuto = true;
            var svcMode =
                getValueByJsonPath(svcTmpl,
                                   'service_template_properties;service_mode',
                                   null);
            if ('management' != intf['service_interface_type']) {
                if (('in-network' == svcMode) ||
                    ('in-network-nat' == svcMode)) {
                    showAuto = false;
                }
            }
            if (-1 != intf['service_interface_type'].indexOf('other')) {
                showAuto = false;
            }
            if (true == intf['static_route_enable']) {
                showAuto = false;
            }
            if ((false == showAuto) && (vnList.length > 0)) {
                if ('autoConfigured' == vnList[0]['id']) {
                    vnList.splice(0, 1);
                }
            }
            return vnList;
        },
        addStaticRoutesCollection: function(modelConfig, interfaceData,
                                            intfType, staticRtsIntfList) {
            var staticRTModel;
            var staticRTModels = modelConfig.staticRoutes;
            var staticRTCollectionModel;
            if (null == staticRTModels) {
                staticRTCollectionModel = new Backbone.Collection([]);
                modelConfig['staticRoutes'] = staticRTCollectionModel;
                staticRTModels = modelConfig.staticRoutes;
            }
            var intfData =
                getValueByJsonPath(interfaceData, 'static_routes;route', []);
            var cnt = intfData.length;
            for (var i = 0; i < cnt; i++) {
                var prefix = ((null != intfData[i]) &&
                              (null != intfData[i]['prefix'])) ?
                    intfData[i]['prefix'] : '';
                var commAttr =
                    getValueByJsonPath(intfData[i],
                                       'community_attributes;community_attribute',
                                       []);
                staticRTModel =
                    new StaticRTModel({prefix: prefix,
                                      next_hop: null,
                                      interface_type: intfType,
                                      interfaceTypesData: staticRtsIntfList,
                                      community_attributes: commAttr.join(',')});
                staticRTModels.push(staticRTModel);
            }
        },

        getHAModeListByTmplVer: function(tmplVer) {
            var haModeList = [
                {id: "", text: 'None'},
                {id: 'active-active', text: 'Active-Active'},
                {id: 'active-standby', text: 'Active-Standby'}
            ];
            if (2 == tmplVer) {
                haModeList.splice(0, 1);
            }
            return haModeList;
        },
        formatModelConfig: function(modelConfig, configDetails) {
            var svcInstDataObj = modelConfig.svcInstanceDataObj;
            if (!svcInstDataObj ||
                !svcInstDataObj.svcTmplsFormatted.length) {
                showInfoWindow("No Service Template found.",
                               "Add Service Template");
                return null;
            }

            self = this;
            self.configDetails = configDetails;
            modelConfig.host_list = [{'text': 'ANY', 'id': 'ANY'}];
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
                    svcInstDataObj.svcTmplsFormatted[0]['id'];
                var tmpl = modelConfig['service_template'];
                var intfTypeStrStart = tmpl.indexOf('(');
                var intfTypeStrEnd = tmpl.indexOf(')');
                intfTypes =
                    tmpl.substr(intfTypeStrStart + 1,
                                intfTypeStrEnd - intfTypeStrStart - 1);
                intfTypes = intfTypes.split(', ');
                var svcTmplObjsByFqn = svcInstDataObj.svcInstTmplts;
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
            var svcTmpls = svcInstDataObj.svcInstTmplts;
            var tmpl = modelConfig['service_template'];
            var svcTmplFqn = getCookie('domain') + ":" +
                tmpl.split(' - [')[0];

            var tmplVer =
                getValueByJsonPath(svcTmpls[svcTmplFqn],
                                   'service_template_properties;version',
                                   1);

            modelConfig['haModeList'] = this.getHAModeListByTmplVer(tmplVer);
            var haMode =
                getValueByJsonPath(modelConfig,
                                   'service_instance_properties;ha_mode', null);
            if (null != haMode) {
                modelConfig.user_created_ha_mode = haMode;
            }
            if (null == configDetails) {
                return modelConfig;
            }
            var intfList =
                getValueByJsonPath(modelConfig,
                                   'service_instance_properties;interface_list',
                                   []);
            var interfaeTypes = [];
            var intfsCnt = intfTypes.length;
            if ((null != svcTmpls) && (null != svcTmpls[svcTmplFqn])) {
                interfaeTypes =
                    getValueByJsonPath(svcTmpls[svcTmplFqn],
                                       'service_template_properties;interface_type',
                                       []);
            }

            if (!intfList.length) {
                var interfaeTypesCnt = interfaeTypes.length;
                for (var i = 0; i < intfsCnt; i++) {
                    intfList.push({virtual_network: null});
                }
            }
            var len = intfList.length;
            var configuredVNList = [];
            var staticRtsIntfList =
                svcInstUtils.getStaticRtsInterfaceTypesBySvcTmpl(svcTmpls[svcTmplFqn],
                                                                 false);
            for (i = 0; i < len; i++) {
                if (null == intfList[i]['virtual_network']) {
                    continue;
                }
                if ("" == intfList[i]['virtual_network']) {
                    intfList[i]['virtual_network'] = 'autoConfigured';
                    configuredVNList.push({'id': "autoConfigured",
                                           'text': "Auto Configured"});
                } else {
                    var formattedVN =
                        svcInstUtils.getVNNameFormatter(intfList[i]['virtual_network'].split(':'));
                    configuredVNList.push({'id': intfList[i]['virtual_network'],
                                           text: formattedVN});
                }
            }
            var interfacesModels = [];
            var interfacesCollectionModel;
            var cnt = intfTypes.length;
            var staticRtsIntfList =
                svcInstUtils.getStaticRtsInterfaceTypesByStr(modelConfig['service_template'],
                false, self.svcInstanceDataObj.svcInstTmplts);
            for (var i = 0; i < cnt; i++) {
                var intfType = intfTypes[i];
                var vnList = this.getVNListBySvcIntfType(svcTmpls[svcTmplFqn],
                                                         interfaeTypes[i],
                                                         tmplVer, self.configDetails);
                if ((null == vnList) || (!vnList.length)) {
                    vnList = configuredVNList;
                }
                var vn = getValueByJsonPath(intfList, i + ";virtual_network",
                                            null);
                var interfacesModel =
                    new InterfacesModel({interfaceType: intfType,
                                        virtualNetwork: vn,
                                        interfaceIndex: i,
                                        interfaceData: intfList[i],
                                        allVNListData: vnList,
                                        tmplData: svcTmpls[svcTmplFqn]});
                interfacesModels.push(interfacesModel);
                interfacesModel.__kb.view_model.model().on('change:virtualNetwork',
                                                           function(model,
                                                                    newValue) {
                    self.editView.setVMIsByVN(self.model(),
                                     newValue,
                                     model.get('interfaceType'));
                });
                this.addStaticRoutesCollection(modelConfig, intfList[i],
                                               intfType, staticRtsIntfList);
            }
            interfacesCollectionModel = new Backbone.Collection(interfacesModels);
            modelConfig['interfaces'] = interfacesCollectionModel;

            var portTupleList = modelConfig['port_tuples'];
            var portTupleModels = [];
            var portTuplesCnt = 0;
            if (null != portTupleList) {
                portTuplesCnt = portTupleList.length;
            }
            var intfs =
                this.getInterfaceTypeVNMap(modelConfig['interfaces'].toJSON());
            for (var i = 0; i < portTuplesCnt; i++) {
                var portTupleDispName =
                    this.getPortTupleDisplayName(portTupleList[i]['to'][3],
                                                 portTupleList[i], intfTypes);
                var portTupleModel =
                    new PortTupleModel({portTupleName:
                                            portTupleList[i]['to'][3],
                                        portTupleDisplayName: portTupleDispName,
                                        portTupleData:
                                            portTupleList[i],
                                        intfTypes: intfTypes,
                                        parentIntfs: intfs, disable: true,
                                        vnVmiMaps: self.configDetails.vnDetails.vnVmiMaps});
                portTupleModels.push(portTupleModel);
            }
            var portTuplesCollection = new Backbone.Collection(portTupleModels);
            modelConfig['portTuples'] = portTuplesCollection;
            this.getBackRefsByType(modelConfig, 'interface_route_table');
            this.getBackRefsByType(modelConfig, 'service_health_check');
            this.getBackRefsByType(modelConfig, 'routing_policy');
            this.getBackRefsByType(modelConfig, 'route_aggregate');

            /* Allowed Address Pair */
            var intfList =
                getValueByJsonPath(modelConfig,
                                   'service_instance_properties;interface_list',
                                   []);
            var intfListLen = intfList.length;
            var addrPairModels = [];
            var len = intfTypes.length;
            var typesDropDownList = [];
            for (var i = 0; i < len; i++) {
                typesDropDownList.push({text: intfTypes[i], id: intfTypes[i]});
            }
            for (var i = 0; i < intfListLen; i++) {
                var allowedAddrPair =
                    getValueByJsonPath(intfList[i],
                                       'allowed_address_pairs;allowed_address_pair',
                                       []);
                var addrPairLen = allowedAddrPair.length;
                if (!addrPairLen) {
                    continue;
                }
                for (var j = 0; j < addrPairLen; j++) {
                    var aapObj = allowedAddrPair[j];
                    aapObj['interface_type'] = intfTypes[i];
                    aapObj['interfaceTypesData'] = typesDropDownList;
                    var allowAddressPairModel = new
                        AllowedAddressPairModel(aapObj);
                    addrPairModels.push(allowAddressPairModel);
                }
            }
            var appCollectionModel = new Backbone.Collection(addrPairModels);
            modelConfig['allowedAddressPairCollection'] = appCollectionModel;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        getPortTupleDisplayName: function(portTupleName, portTupleData,
                                          intfTypes) {
            var vmis = getValueByJsonPath(portTupleData,
                                          'virtual-machine-interfaces', []);
            var dispName = "port-tuple";
            var splitArr = portTupleName.split('-port-tuple');
            if (splitArr.length > 1) {
                var newArr = splitArr[1].split('-');
                if (newArr.length > 0) {
                    dispName += newArr[0];
                }
            } else {
                dispName = portTupleName;
            }
            var vmisCnt = vmis.length;
            var vmiTypeToObjMap = {};
            for (var i = 0; i < vmisCnt; i++) {
                var vmiType =
                    getValueByJsonPath(vmis[i],
                                       'virtual_machine_interface_properties;service_interface_type',
                                       null);
                if (null == vmiType) {
                    /* Weired */
                    console.error('service interface type is null');
                    continue;
                }
                vmiTypeToObjMap[vmiType] = vmis[i];
            }
            var intfTypesCnt = intfTypes.length;
            for (var i = 0; i < intfTypesCnt; i++) {
                var vmiObj = vmiTypeToObjMap[intfTypes[i]];
                if (null == vmiObj) {
                    continue;
                }
                if (0 == i) {
                    dispName += ' : ';
                }
                var vmiId = vmiObj['uuid'];
                var instIps = self.configDetails.vnDetails.vmiToInstIpsMap[vmiId];
                if ((null != instIps) && (instIps.length > 0)) {
                    dispName += instIps[0];
                }
                if (i < vmisCnt - 1) {
                    dispName += ', ';
                }
            }
            return dispName;
        },
        updateVMIToPortTuple: function(portTuples, vmiDetails) {
            var newPortTuples = [];
            if ((null == portTuples) || (!portTuples.length)) {
                return;
            }
            var portTuplesCnt = portTuples.length;
            var portTupleMap = {};
            for (var i = 0; i < portTuplesCnt; i++) {
                portTupleMap[portTuples[i]['uuid']] = i;
            }
            var vmis = vmiDetails['virtual-machine-interfaces'];
            if (null == vmis) {
                return;
            }
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
                                portTuples[idx];
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
            if (newPortTuples.length == portTuples.length) {
                portTuples = newPortTuples;
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
                newPortTuples.push(portTuples[idx]);
            }
            portTuples = newPortTuples;
            return;
        },
        setPortTupleName: function(model) {
            if (null == model) {
                return;
            }
            var portTupleEntry = model.newPortTupleEntry;
            var intfTypes = portTupleEntry.intfTypes();
            var ctIntfType = model.get('interfaceType');
            var intfIdx = intfTypes.indexOf(ctIntfType);
            if (-1 == intfIdx) {
                return;
            }
            var portTupleDispName = portTupleEntry.portTupleDisplayName();
            var portTupleSplit = portTupleDispName.split(' : ');
            var ips = [];
            if (null != portTupleSplit[1]) {
                ips = portTupleSplit[1].split(', ');
            }
            var intf = model.get('interface');
            var vmiId = intf.split('~~')[1];
            var intfCnt = intfTypes.length;
            var dispStr = portTupleSplit[0] + ' : ';
            for (var i = 0; i < intfCnt; i++) {
                if (i == intfIdx) {
                    /* Set the IP here */
                    var instIps = self.configDetails.vnDetails.vmiToInstIpsMap[vmiId];
                    if ((null != instIps) && (instIps.length > 0)) {
                        dispStr += instIps[0];
                    }
                } else {
                    if (null != ips[i]) {
                        dispStr += ips[i];
                    }
                }
                if (i < intfCnt - 1) {
                    dispStr += ', ';
                }
            }
            portTupleEntry['portTupleDisplayName'](dispStr);
        },
        deleteModelCollectionData: function(model, type) {
            var collection = model.attributes[type];
            var len = collection.length;
            for (var i = 0; i < len; i++) {
                collection.remove(collection.models[i]);
                len--;
                i--;
            }
        },
        formatModelConfigColl: function(intfTypes, isDisabled, svcTmpls) {
            if (true == isDisabled) {
                return;
            }
            var cnt = intfTypes.length;
            var svcTmpl = this.model().get('service_template');
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmpl.split(' - [')[0];

            var tmplVer = getValueByJsonPath(svcTmpls[svcTmplFqn],
                                             'service_template_properties;version',
                                             1);
            this.deleteModelCollectionData(this.model(), 'interfaces');
            this.deleteModelCollectionData(this.model(), 'portTuples');
            this.deleteModelCollectionData(this.model(), 'svcHealtchChecks');
            this.deleteModelCollectionData(this.model(), 'intfRtTables');
            this.deleteModelCollectionData(this.model(), 'rtPolicys');
            this.deleteModelCollectionData(this.model(), 'rtAggregates');
            this.deleteModelCollectionData(this.model(), 'staticRoutes');
            this.deleteModelCollectionData(this.model(),
                                           'allowedAddressPairCollection');
            var interfaces = this.model().attributes['interfaces'];
            var interfaeTypes = [];
            var svcTmplVer = 1;
            if ((null != svcTmpls) && (null != svcTmpls[svcTmplFqn])) {
                interfaeTypes =
                    getValueByJsonPath(svcTmpls[svcTmplFqn],
                                       'service_template_properties;interface_type',
                                       []);
                svcTmplVer =
                    getValueByJsonPath(svcTmpls[svcTmplFqn],
                                       'service_template_properties;version',
                                       1);
            }
            var haModeList = this.getHAModeListByTmplVer(tmplVer);
            this.haModeList(haModeList);
            if (2 == svcTmplVer) {
                this.user_created_ha_mode('active-standby');
            } else {
                this.user_created_ha_mode('');
            }

            var intfList =
                getValueByJsonPath(this.model().attributes,
                                   'service_instance_properties;interface_list',
                                   []);
            for (var i = 0; i < cnt; i++) {
                var intfType = intfTypes[i];
                var vn = null;
                var vnList = this.getVNListBySvcIntfType(svcTmpls[svcTmplFqn],
                                                         interfaeTypes[i],
                                                         tmplVer, self.configDetails);
                var newInterface =
                    new InterfacesModel({'interfaceType': intfType,
                                        'virtualNetwork': vn,
                                        'interfaceIndex': i,
                                        interfaceData: intfList[i],
                                        allVNListData: vnList,
                                        tmplData: svcTmpls[svcTmplFqn]});
                newInterface.__kb.view_model.model().on('change:virtualNetwork',
                                                           function(model,
                                                                    newValue) {
                    self.editView.setVMIsByVN(self.model(),
                                     newValue,
                                     model.get('interfaceType'));
                });
                interfaces.add([newInterface]);
            }
            return;
        },

        addPortTuple: function() {
            var svcInstName = this.model().get('display_name');
            var self = this;
            /*
            if ((null == svcInstName) || (!svcInstName.trim().length)) {
                var model = this.model();
                var attr = cowu.getAttributeFromPath('display_name');
                var errors = model.get(cowc.KEY_MODEL_ERRORS);
                var attrErrorObj = {}
                attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                    'Service Instance Name is required';
                errors.set(attrErrorObj);
                return;
            }
            */
            /* Why this function gets called, even when the port_tuple stuff
               in invisible
             */
            var svcTmpl = this.model().get('service_template');
            var svcTmpls = self.svcInstanceDataObj.svcInstTmplts;
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmpl.split(' - [')[0];
            var tmplVer = getValueByJsonPath(svcTmpls[svcTmplFqn],
                                             'service_template_properties;version',
                                             1);
            if (1 == tmplVer) {
                return;
            }
            var portTupleCollection = this.model().get('portTuples');
            var collLen = portTupleCollection.length;
            var models = portTupleCollection['models'];
            var portTupleIds = [];
            var tmpPortTupleId = 0;
            for (var i = 0; i < collLen; i++) {
                var attr = models[i].attributes;
                var ptName = attr.portTupleName();
                var splitArr = ptName.split(svcInstName + '-port-tuple');
                if (2 == splitArr.length) {
                    tmpPortTupleId = Number(splitArr[1].split('-')[0]);
                    portTupleIds.push(tmpPortTupleId);
                }
            }
            if (portTupleIds.length > 0) {
                portTupleIds.sort();
                var portTupleIdsCnt = portTupleIds.length;
                if (portTupleIds[portTupleIdsCnt - 1] == (portTupleIdsCnt - 1)) {
                    tmpPortTupleId = portTupleIdsCnt;
                } else {
                    for (var i = 0; i < portTupleIdsCnt; i++) {
                        if (i != portTupleIds[i]) {
                            tmpPortTupleId = i;
                            break;
                        }
                    }
                    if (i == portTupleIdsCnt) {
                        /* We must not come here */
                        tmpPortTupleId = portTupleIdsCnt;
                    }
                }
            }
            var newUUID = UUIDjs.create();
            var portTupleName = svcInstName + '-port-tuple' +
                tmpPortTupleId.toString() + '-' + newUUID['hex'];
            var intfs =
                this.getInterfaceTypeVNMap(this.model().get('interfaces').toJSON());
            var intfTypes = this.getIntfTypes(true);
            var portTupleDispName =
                this.getPortTupleDisplayName(portTupleName, null, intfTypes);
            var newPortTupleEntry =
                new PortTupleModel({portTupleName: portTupleName,
                                   portTupleDisplayName: portTupleDispName,
                                   portTupleData: {},
                                   intfTypes: intfTypes,
                                   parentIntfs: intfs, disable: false,
                                   vnVmiMaps: self.configDetails.vnDetails.vnVmiMaps});
            kbValidation.bind(this.editView,
                               {collection:
                               newPortTupleEntry.model().attributes.portTupleInterfaces});
            var portTupleIntfsColl =
                newPortTupleEntry.model().attributes.portTupleInterfaces;
            var portTupleIntfsCollLen = portTupleIntfsColl.length;
            for (var i = 0; i < portTupleIntfsCollLen; i++) {
                var model = portTupleIntfsColl.models[i]['attributes'].model();
                model.newPortTupleEntry = newPortTupleEntry;
                model.on('change:interface', function(model, newValue) {
                    self.setPortTupleName(model);
                });
            }
            portTupleCollection.add([newPortTupleEntry]);
        },
        getInterfaceTypeVNMap: function(intfData) {
            var intfObjs = {};
            if (null == intfData) {
                return intfs;
            }
            var cnt = intfData.length;
            for (var i = 0; i < cnt; i++) {
                var intfType = intfData[i]['interfaceType']();
                var vn = intfData[i]['virtualNetwork']();
                intfObjs[intfType] = vn;
            }
            return intfObjs;
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
            var svcHealtchChecks = this.model().get('svcHealtchChecks');
            var svcHealthChkEntry = null;
            var types = this.getIntfTypes(false);
            var newEntry =
                new SvcHealthChkModel({service_health_check: null,
                                       interface_type: null,
                                       interfaceTypesData: types});
            svcHealtchChecks.add([newEntry]);
        },
        addPropSvcHealthChkByIndex: function(data, property) {
            var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var svcHealtchChecks = this.model().get('svcHealtchChecks');
            var svcHealthChkEntry = null;
            var types = this.getIntfTypes(false);
            var newEntry =
                new SvcHealthChkModel({service_health_check: null,
                                       interface_type: null,
                                       interfaceTypesData: types});
            svcHealtchChecks.add([newEntry],{at: selectedRuleIndex+1});
        },
        addPropIntfRtTable: function() {
            var intfRtTables = this.model().get('intfRtTables');
            var types = this.getIntfTypes(false);
            var newEntry =
                new IntfRtTableModel({interface_route_table: null,
                                      interface_type: null,
                                      interfaceTypesData: types});
            intfRtTables.add([newEntry]);
        },
        addPropIntfRtTableByIndex: function(data,property) {
            var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var intfRtTables = this.model().get('intfRtTables');
            var types = this.getIntfTypes(false);
            var newEntry =
                new IntfRtTableModel({interface_route_table: null,
                                      interface_type: null,
                                      interfaceTypesData: types});
            intfRtTables.add([newEntry],{at: selectedRuleIndex+1});
        },
        addPropStaticRtTable: function() {
            var staticRtTables = this.model().get('staticRoutes');
            var svcTmplStr = this.model().get('service_template');
            var types = svcInstUtils.getStaticRtsInterfaceTypesByStr(svcTmplStr, false,
                self.svcInstanceDataObj.svcInstTmplts);
            var newEntry =
                new StaticRTModel({prefix: null,
                                   next_hop: null,
                                   interface_type: null,
                                   interfaceTypesData: types,
                                   community_attributes: ''});
            staticRtTables.add([newEntry]);
        },
        addPropStaticRtTableByIndex: function(data,property) {
            var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var staticRtTables = this.model().get('staticRoutes');
            var svcTmplStr = this.model().get('service_template');
            var types = svcInstUtils.getStaticRtsInterfaceTypesByStr(svcTmplStr, false,
                self.svcInstanceDataObj.svcInstTmplts);
            var newEntry =
                new StaticRTModel({prefix: null,
                                   next_hop: null,
                                   interface_type: null,
                                   interfaceTypesData: types,
                                   community_attributes: ''});
            staticRtTables.add([newEntry],{at: selectedRuleIndex+1});
        },
        addPropRtPolicy: function() {
            var rtPolicys = this.model().get('rtPolicys');
            var types = [{text: 'left', id: 'left'},
                {text: 'right', id: 'right'}];
            var newEntry =
                new RtPolicyModel({routing_policy: null,
                                   interface_type: null,
                                   rtPolicyInterfaceTypesData: types});
            rtPolicys.add([newEntry]);
        },
        addPropRtPolicyByIndex: function(data,property) {
            var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var rtPolicys = this.model().get('rtPolicys');
            var types = [{text: 'left', id: 'left'},
                {text: 'right', id: 'right'}];
            var newEntry =
                new RtPolicyModel({routing_policy: null,
                                   interface_type: null,
                                   rtPolicyInterfaceTypesData: types});
            rtPolicys.add([newEntry],{at: selectedRuleIndex+1});
        },
        addPropRtAggregate: function() {
            var rtAggregates = this.model().get('rtAggregates');
            var rtAgg = "";
            var types = this.getIntfTypes(true);
            var rtAggIntfTypes = [];
            if (null != types) {
                rtAggIntfTypes =
                    svcInstUtils.getRouteAggregateInterfaceTypes(types);
            }
            var newEntry =
                new RtAggregateModel({route_aggregate: null,
                                      interface_type: null,
                                      interfaceTypesData: rtAggIntfTypes});
            rtAggregates.add([newEntry]);
        },
        addPropRtAggregateByIndex: function(data,property) {
          var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var rtAggregates = this.model().get('rtAggregates');
            var rtAgg = "";
            var types = this.getIntfTypes(true);
            var rtAggIntfTypes = [];
            if (null != types) {
                rtAggIntfTypes =
                    svcInstUtils.getRouteAggregateInterfaceTypes(types);
            }
            var newEntry =
                new RtAggregateModel({route_aggregate: null,
                                      interface_type: null,
                                      interfaceTypesData: rtAggIntfTypes});
            rtAggregates.add([newEntry],{at: selectedRuleIndex+1});
        },
        addAAP: function() {
            var types = this.getIntfTypes(false);
            var aapList = this.model().attributes['allowedAddressPairCollection'],
                allowAddressPairModel = new
                AllowedAddressPairModel({'interfaceTypesData': types});
            aapList.add([allowAddressPairModel]);
        },
        addAAPByIndex: function(data,property) {
          var selectedRuleIndex = data.model().collection.indexOf(property.model());
            var types = this.getIntfTypes(false);
            var aapList = this.model().attributes['allowedAddressPairCollection'],
                allowAddressPairModel = new
                AllowedAddressPairModel({'interfaceTypesData': types});
            aapList.add([allowAddressPairModel],{at: selectedRuleIndex+1});
        },
        deleteSvcInstProperty: function(data, property) {
            var collection = data.model().collection;
            var entry = property.model();
            collection.remove(entry);
        },

        showHideStaticRTs: function(interfaceIndex) {
            var idx = interfaceIndex();
            var tmplStr = this.model().get('service_template');
            if (null == tmplStr) {
                return false;
            }
            tmplStr = tmplStr.trim();
            tmplStr = contrail.getCookie('domain') + ":" + tmplStr.split(' - [')[0];
            var tmplData = self.svcInstanceDataObj.svcInstTmplts;
            if (null == tmplData[tmplStr]) {
                return false;
            }
            var intfType =
                getValueByJsonPath(tmplData[tmplStr],
                                   'service_template_properties;interface_type',
                                   []);
            var tmplVersion =
                getValueByJsonPath(tmplData[tmplStr],
                                   'service_template_properties;version', 1);
            if (2 == tmplVersion) {
                return false;
            }
            if (null != intfType[idx]) {
                return intfType[idx]['static_route_enable'];
            }
            return false;
        },
        getSIVirtualNetwork: function(vn) {
            if ('autoConfigured' == vn) {
                return "";
            }
            return vn;
        },
        getStaticRoutesByIntfType: function(staticRtsCollection) {
            var intfTypeToStaticRtsMapList = {};
            if (null == staticRtsCollection) {
                return intfTypeToStaticRtsMapList;
            }
            var staticRtsCollectionLen = staticRtsCollection.length;
            for (var i = 0; i < staticRtsCollectionLen; i++) {
                var intfType = staticRtsCollection[i]['interface_type']();
                if (null == intfTypeToStaticRtsMapList[intfType]) {
                    intfTypeToStaticRtsMapList[intfType] = [];
                }
                var staticRtObj = {};
                staticRtObj.prefix = staticRtsCollection[i]['prefix']();
                staticRtObj.next_hop = null;
                staticRtObj.next_hop_type = null;
                var commAttrs =
                    staticRtsCollection[i]['community_attributes']();
                var arr = commAttrs.split('\n');

                var arrLen = arr.length;
                var commAttrArr = [];
                for (var k = 0; k < arrLen; k++) {
                    if (null == arr[k]) {
                        continue;
                    }
                    var tmpArr = arr[k].split(',');
                    if (tmpArr.length > 0) {
                        var arrLen = tmpArr.length;
                        for (var l = 0; l < arrLen; l++) {
                            if (tmpArr[l].length > 0) {
                                commAttrArr.push(tmpArr[l].trim());
                            }
                        }
                    }
                }
                staticRtObj.community_attributes = {
                    'community_attribute': commAttrArr
                };
                intfTypeToStaticRtsMapList[intfType].push($.extend({}, true,
                                                                   staticRtObj));
            }
            return intfTypeToStaticRtsMapList;
        },
        getAllowedAddressPairsByIntfType: function(aapCollection) {
            var intfTypeToAapMapList = {};
            if (null == aapCollection) {
                return intfTypeToAapMapList;
            }
            var aapCollectionLen = aapCollection.length;
            for (var i = 0; i < aapCollectionLen; i++) {
                var intfType = aapCollection[i]['interface_type']();
                if (null == intfTypeToAapMapList[intfType]) {
                    intfTypeToAapMapList[intfType] = [];
                }
                var aapObj = {};
                var prefix = 32;
                var ip = aapCollection[i].user_created_ip();
                var mac = aapCollection[i].mac();
                aapObj["mac"] = null;
                if ((null != mac) && ("" != mac)) {
                    aapObj["mac"] = mac;
                }
                if ((null != ip) && ("" != ip)) {
                    aapObj["ip"] = {};
                    if (2 == ip.split("/").length) {
                        prefix = Number(ip.split("/")[1]);
                        ip = ip.split("/")[0];
                    } else {
                        if (isIPv6(ip)) {
                            prefix = 128;
                        }
                    }
                    aapObj["ip"]["ip_prefix"] = ip;
                    aapObj["ip"]["ip_prefix_len"] = prefix;
                }
                aapObj["address_mode"] = 'active-standby';
                intfTypeToAapMapList[intfType].push(aapObj);
            }
            return intfTypeToAapMapList;
        },
        getSIProperties: function() {
            var siProp = {};
            var intfList = [];
            var stVersion;
            var sTemplate = getValueByJsonPath(this.model().attributes,
                "service_template", "");
            stVersion = sTemplate.split('] - ')[1];
            var coll = this.model().attributes.interfaces;
            var staticRtsCollection =
                this.model().attributes.staticRoutes.toJSON();
            var len = coll.length;
            var models = coll['models'];
            var aapCollection =
                this.model().attributes.allowedAddressPairCollection.toJSON();
            var intfTypeToAapMapList =
                this.getAllowedAddressPairsByIntfType(aapCollection);
            var intfTypeToStaticRtsMapList =
                this.getStaticRoutesByIntfType(staticRtsCollection);
            for (var i = 0; i < len; i++) {
                var attr = models[i]['attributes'];
                intfList[i] = {};
                var vn = attr['virtualNetwork']();
                vn = this.getSIVirtualNetwork(vn);
                var intfType = attr['interfaceType']();
                intfList[i]['virtual_network'] = vn;
                var aapList = intfTypeToAapMapList[intfType];
                if (null != aapList) {
                    intfList[i]['allowed_address_pairs'] =
                        {'allowed_address_pair': aapList};
                }
                var staticRtsList = intfTypeToStaticRtsMapList[intfType];
                if (null != staticRtsList) {
                    intfList[i]['static_routes'] = {};
                    intfList[i]['static_routes']['route'] = staticRtsList;
                }
                /* Now check if we have Static RTs */
                if ('right' == intfType) {
                    siProp['right_virtual_network'] = vn;
                }
                if ('left' == intfType) {
                    siProp['left_virtual_network'] = vn;
                }
                if ('management' == intfType) {
                    siProp['management_virtual_network'] = vn;
                }
            }
            var siP = this.model().get('service_instance_properties');
            var haMode = this.model().get('user_created_ha_mode');
            if (stVersion === "v1" && (null != haMode) && ("" != haMode)) {
                siProp['ha_mode'] = haMode;
            }
            siProp['interface_list'] = intfList;
            return siProp;
        },
        getSvcInstProperties: function() {
            var propObjs = {};
            var list =
                this.getSvcInstPropertiesByType('interface_route_table_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['interface_route_table_back_refs'] =
                    list;
            } else {
                propObjs['interface_route_table_back_refs'] = [];
            }

            list =
                this.getSvcInstPropertiesByType('service_health_check_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['service_health_check_back_refs'] = list;
            } else {
                propObjs['service_health_check_back_refs'] = [];
            }

            list =
                this.getSvcInstPropertiesByType('route_aggregate_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['route_aggregate_back_refs'] = list;
            }else {
                propObjs['route_aggregate_back_refs'] = [];
            }

            list =
                this.getSvcInstPropertiesByType('routing_policy_back_refs');
            if ((null != list) && (list.length > 0)) {
                propObjs['routing_policy_back_refs'] = list;
            } else {
                propObjs['routing_policy_back_refs'] = [];
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
                collKey = 'svcHealtchChecks';
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
            var leftSeqId = 1;
            var rightSeqId = 1;
            var tmpRtPolicyObjs = {};
            var tmpLeftPolicyObjs = {};
            for (var i = 0; i < len; i++) {
                var modelAttr = models[i]['attributes'];
                var intfType = modelAttr['interface_type']();
                var propValue = modelAttr[type]();
                if (null == propValue) {
                    propValue = "";
                }
                var values = propValue.split(ctwc.MULTISELECT_VALUE_SEPARATOR);
                var valCnt = values.length;
                for (var j = 0; j < valCnt; j++) {
                    var attr = {};
                    if ((null != values[j]) && ("" != values[j])) {
                        var data = values[j].split(cowc.DROPDOWN_VALUE_SEPARATOR);
                        if ((null != data[0]) && (null != data[1]) &&
                            ("" != data[0]) && ("" != data[1])) {
                            if ('routing_policy_back_refs' == backRefKey) {
                                if ('left' == intfType) {
                                    var propListIdx = tmpRtPolicyObjs[data[1]];
                                    if (null != propListIdx) {
                                        propList[propListIdx]['attr']['left_sequence']
                                            = leftSeqId.toString();
                                        leftSeqId++;
                                        continue;
                                    } else {
                                        attr['left_sequence'] =
                                            leftSeqId.toString();
                                        leftSeqId++;
                                    }
                                    tmpLeftPolicyObjs[data[1]] =
                                        propList.length;
                                } else {
                                    var propListIdx =
                                        tmpLeftPolicyObjs[data[1]];
                                    if (null != propListIdx) {
                                        propList[propListIdx]['attr']['right_sequence']
                                            = rightSeqId.toString();
                                        rightSeqId++;
                                        continue;
                                    } else {
                                        attr['right_sequence'] =
                                            rightSeqId.toString();
                                        rightSeqId++;
                                    }
                                    tmpRtPolicyObjs[data[1]] =
                                        propList.length;
                                }
                            } else {
                                attr = {'interface_type': intfType};
                            }
                            var backRefObj = {'to': data[0].split(':'), 'attr': attr,
                                'uuid': data[1]};
                            propList.push(backRefObj);
                        }
                    }
                }
            }
            return propList;
        },
        deepValidationList: function () {
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'svcInstValidations',
            },
            {
                key: 'portTuples',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'portTuplesValidation',
            },
            {
                key: 'svcHealtchChecks',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'svcHealtchChecksValidation',
            },
            {
                key: 'intfRtTables',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'intfRtTablesValidation',
            },
            {
                key: 'rtPolicys',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'rtPolicysValidation',
            },
            {
                key: 'rtAggregates',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'rtAggregatesValidation',
            },
            {
                key: 'interfaces',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'interfacesValidation',
            },
            {
                key: 'allowedAddressPairCollection',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'allowedAddressPairValidations'
            },
            {
                key: ['portTuples', 'portTupleInterfaces'],
                type: cowc.OBJECT_TYPE_COLLECTION_OF_COLLECTION,
                getValidation: 'portTupleInterfacesValidation'
            },
            {
                key: ['staticRoutes'],
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'staticRoutesValidation'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            return validationList;
        },
        configureSvcInst: function (isEdit, dataItem, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var putData = {};

            var validationList = this.deepValidationList();
            if (this.isDeepValid(validationList)) {
                var locks = this.model().attributes.locks.attributes;
                var newSvcInst =
                    $.extend({}, true, this.model().attributes);
                var siProp = this.getSIProperties();
                var portTuples =
                    svcInstUtils.getPortTuples(newSvcInst['display_name'],
                                               this.model().get('portTuples'));
                newSvcInst['port_tuples'] = [];
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
                    self.svcInstanceDataObj.currentProject.value;
                var svcTmpls = self.svcInstanceDataObj.svcInstTmplts;
                var svcTmplFqn =
                    newSvcInst['service_template_refs'][0]['to'].join(':');
                var svcTmplVersion = 1;
                if (null != svcTmpls[svcTmplFqn]) {
                    newSvcInst['svcTmplDetails'] = [];
                    newSvcInst['svcTmplDetails'][0] = svcTmpls[svcTmplFqn];
                    svcTmplVersion =
                        getValueByJsonPath(svcTmpls[svcTmplFqn],
                                           'service_template_properties;version',
                                           1);
                }
                newSvcInst['fq_name'] =
                    [getCookie('domain'), getCookie('project'),
                    newSvcInst['display_name']];
                if (1 == svcTmplVersion) {
                    newSvcInst['service_instance_properties']['scale_out'] = {};
                    newSvcInst['service_instance_properties']['scale_out']
                        ['max_instances'] =
                        parseInt(newSvcInst['no_of_instances']);
                }
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
                //permissions
                this.updateRBACPermsAttrs(newSvcInst);

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
                delete newSvcInst['svcHealtchChecks'];
                delete newSvcInst['rtPolicys'];
                delete newSvcInst['rtAggregates'];
                delete newSvcInst['allowedAddressPairCollection'];
                delete newSvcInst['svcTmplDetails'];
                delete newSvcInst['staticRoutes'];
                delete newSvcInst['user_created_ha_mode'];
                delete newSvcInst['haModeList'];
                delete newSvcInst['svcInstanceDataObj'];

                if (null == newSvcInst['uuid']) {
                    delete newSvcInst['uuid'];
                }
                ajaxConfig = {};
                ctwu.deleteCGridData(newSvcInst);
                var putData = {'service-instance': newSvcInst};
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
