/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var svcInstUtils = function() {
        var self = this;
        this.getVNNameFormatter = function (vnFqn, domain, project) {
            if (null == domain) {
                domain = getCookie('domain');
            }
            if (null == project) {
                project = getCookie('project');
            }
            if ((null == vnFqn) || (null == vnFqn[0]) ||
                (null == vnFqn[1])) {
                return null;
            }
            if ((domain == vnFqn[0]) && (project == vnFqn[1])) {
                return vnFqn[2];
            }
            return vnFqn[2] + " (" + vnFqn[0] + ":" + vnFqn[1] + ")";
        }
        this.virtNwListFormatter = function(response) {
            var vnListResp =
                getValueByJsonPath(response, 'virtual-networks', []);
            if (!vnListResp.length) {
                return ([{id: null, text: "No Virtual Networks found"}]);
            }
            var vnList = [];
            var vnCnt = vnListResp.length;
            for (var i = 0; i < vnCnt; i++) {
                var vnText = this.getVNNameFormatter(vnListResp[i]['fq_name']);
                vnList.push({'text': vnText, id:
                            vnListResp[i]['fq_name'].join(':')});
            }
            return vnList;
        }
        this.svcTemplateFormatter = function(svcTmpl) {
            var svcIntfTypes = [];
            var dispStr =
                getValueByJsonPath(svcTmpl,
                                   'service-template;display_name', '-');
            dispStr += " - ";
            var svcTempProp =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties',
                                   {});
            var svcTempVersion = getValueByJsonPath(svcTempProp, 'version', 1);
            var intfType =
                getValueByJsonPath(svcTempProp, 'interface_type', []);
            var intfCnt = intfType.length;
            for (var j = 0; j < intfCnt; j++) {
                svcIntfTypes.push(intfType[j]['service_interface_type']);
            }

            dispStr += "[" +
                getValueByJsonPath(svcTempProp, 'service_mode', '-') + " (" +
                svcIntfTypes.join(', ') + ")]";
            return dispStr + ' - v' + svcTempVersion;
        },
        this.getSvcTmplDetailsBySvcTmplStr = function(svcTmplStr) {
            /* This function must be called after grid is initialized */
            if (null == svcTmplStr) {
                return null;
            }
            var gridElId = "#" + ctwl.SERVICE_INSTANCES_GRID_ID;
            try {
                var svcTmpls = $(gridElId).data('svcInstTmplts');
            } catch(e) {
                return null;
            }
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmplStr.split(' - [')[0];
            return svcTmpls[svcTmplFqn];
        },
        this.getSvcTmplIntfTypes = function(svcTmpl) {
            var svcIntfTypes = [];
            var svcTempProp =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties',
                                   {});
            var intfType =
                getValueByJsonPath(svcTempProp, 'interface_type', []);
            var intfCnt = intfType.length;
            for (var j = 0; j < intfCnt; j++) {
                svcIntfTypes.push(intfType[j]['service_interface_type']);
            }
            return svcIntfTypes;
        },
        this.getPortTuples = function(svcInstName, portTupleCollection) {
            var nameList = [];
            if (null == portTupleCollection) {
                return nameList;
            }
            var len = portTupleCollection.length;
            var models = portTupleCollection['models'];
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
                    if (null == vmi) {
                        continue;
                    }
                    var vmiArr = vmi.split('~~');
                    var intfObj = {'fq_name': vmiArr[0].split(':'),
                        'interfaceType': intfAttr['interfaceType'](),
                        'uuid': vmiArr[1]};
                    nameList[i]['vmis'].push(intfObj);
                }
            }
            return nameList;
        },
        this.getVNByTmplType = function(intfType, svcTmpl) {
            if ((null == window.vnList) ||
                (!window.vnList.length)) {
                return null;
            }
            var intfTypes =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties;interface_type',
                                   []);
            var svcMode =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties;service_mode',
                                   null);
            var intfTypesCnt = intfTypes.length;
            for (var i = 0; i < intfTypesCnt; i++) {
                if (intfTypes[i]['service_interface_type'] == intfType) {
                    break;
                }
            }
            if (i == intfTypesCnt) {
                return null;
            }
            if (true == intfTypes[i]['static_route_enable']) {
                return window.vnList[1];
            }
            if ('management' != intfTypes[i]['service_interface_type']) {
                if (('in-network' == svcMode) ||
                    ('in-network-nat' == svcMode)) {
                    return window.vnList[1];
                }
                if ('other' == intfTypes[i]['service_interface_type']) {
                    return window.vnList[1];
                }
            }
            return window.vnList[0];
        },
        this.getPowerState = function(val) {
            var powerString="";
            switch(val){
            case 0:
            case 0x00:
                powerString = "NOSTATE";
                break;
            case 1:
            case 0x01:
                powerString = "RUNNING";
                break;
            case 3:
            case 0x03:
                powerString = "PAUSED";
                break;
            case 4:
            case 0x04:
                powerString = "SHUTDOWN";
                break;
            case 6:
            case 0x06:
                powerString = "CRASHED";
                break;
            case 7:
            case 0x07:
                powerString = "SUSPENDED";
                break;
            }
            return(powerString);
        },
        this.getIntfVNCollectionView = function(isDisabled) {
            return {
                columns: [{
                    elementId: 'interfaceType',
                    view: 'FormInputView',
                    class: "", width: 375,
                    viewConfig: {
                        label: 'Interface Type',
                        disabled: true,
                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                        path: 'interfaceType',
                        dataBindValue: 'interfaceType()'
                    }
                },
                {
                    elementId: 'virtualNetwork',
                    view: 'FormDropdownView',
                    class: "", width: 340,
                    viewConfig: {
                        disabled: isDisabled,
                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                        label: 'Virtual Network',
                        path: 'virtualNetwork',
                        dataBindValue: 'virtualNetwork()',
                        elementConfig: {
                            dataTextField: 'text',
                            dataValueField: 'id',
                            data: window.vnList
                        }
                    }
                }]
            }
        },
        this.getStaticRtsCollectionView = function(isDisabled) {
            return {
                columns: [{
                    elementId: 'static-routes-collection',
                    view: "FormCollectionView",
                    viewConfig: {
                        colSpan:"2",
                        visible:
                            '$root.showHideStaticRTs(interfaceIndex())',
                        path: 'staticRoutes',
                        collection: 'staticRoutes()',
                        validation: 'staticRoutesValidation',
                        templateId: cowc.TMPL_GEN_COLLECTION_VIEW,
                        collectionActions: {
                            add: {onClick: "addStaticRt()",
                                  iconClass: 'icon-plus',
                                  buttonTitle: 'Add Static Routes'
                            }
                        },
                        rows: [{
                            rowActions: [
                                {onClick: "deleteStaticRt()",
                                 iconClass: 'icon-minus'}/*,
                                {onClick: "addStaticRtByRow()",
                                 iconClass: 'icon-plus'}
                                 */
                            ],
                            columns: [{
                                elementId: 'prefix',
                                view: 'FormInputView',
                                class: "", width: 385,
                                viewConfig: {
                                    label: 'Prefix',
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'prefix',
                                    dataBindValue: 'prefix()'
                                }
                            },
                            {
                                elementId: 'next_hop',
                                view: 'FormInputView',
                                class: "", width: 345,
                                viewConfig: {
                                    disabled: true,
                                    label: 'Next Hop',
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'next_hop',
                                    dataBindValue: 'next_hop()'
                                }
                            }]
                        }]
                    }
                }]
            }
        },
        this.getPortTupleNameViewConfig = function(isDisabled) {
            return {
                rowActions: [
                    {onClick: "deletePortTuple()",
                     iconClass: 'icon-minus'}
                ],
                columns: [{
                    elementId: 'portTupleName',
                    view: 'FormInputView',
                    class: "", width: "600",
                    name: 'Port Tuple Name',
                    viewConfig: {
                        disabled: true,
                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                        path: 'portTupleName',
                        dataBindValue: 'portTupleName()'
                    }
                }]
            }
        },
        this.getPortTupleViewConfig = function(isDisabled) {
            return {
                columns: [{
                    elementId: 'port_tuples_vmi_collection',
                    view: "FormEditableGridView",
                    viewConfig: {
                        colSpan: '2',
                        path: 'portTupleInterfaces',
                        collection: 'portTupleInterfaces()',
                        validation: 'portTupleInterfacesValidation',
                        templateId: cowc.TMP_EDITABLE_GRID_VIEW,
                        /*
                        collectionActions: {
                            add: {onClick: "addPortTupleInterface()",
                                  iconClass: 'icon-plus',
                                  buttonTitle: 'Add Interface'
                            }
                        },
                        */
                        //rows: [{
                            /*
                            rowActions: [
                                {onClick: "deletePortTupleInterface()",
                                 iconClass: 'icon-minus'}
                            ],
                            */
                            columns: [{
                                elementId: 'interfaceType',
                                view: 'FormInputView',
                                class: "", width: 385,
                                name:'Interface Type',
                                viewConfig: {
                                    placeholder: 'Select Interface Type',
                                    disabled: true,
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    path: 'interfaceType',
                                    dataBindValue: 'interfaceType()'
                                }
                            },
                            {
                                elementId: 'interface',
                                view: 'FormDropdownView',
                                class: "", width: 345,
                                name:'Interface',
                                viewConfig: {
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    path: 'interface',
                                    dataBindValue: 'interface()',
                                    elementConfig: {
                                        placeholder: 'Select Virtual Machine' +
                                                     ' Interface',
                                        dataTextField: 'text',
                                        dataValueField: 'value',
                                        data: window.vmiList
                                    }
                                }
                            //}]
                        }]
                    }
                }]
            }
        },
        this.getPortTuplesView = function (self, isDisabled) {
            return {
                elementId: 'portTuplesCollection',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'portTuplesCollectionAccordian',
                    visible: 'showPortTuplesView',
                    title: 'Port Tuples',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'port-tuples-collection',
                                view: 'FormCollectionView',
                                viewConfig: {
                                    path: 'portTuples',
                                    collection: 'portTuples()',
                                    validation: 'portTuplesValidation',
                                    //accordionable: true,
                                    templateId: cowc.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW,
                                        gridActions: [
                                            {
                                                onClick: "function() {addPortTuple();}",
                                                buttonTitle: ""
                                            }
                                        ],
                                    rows: [/*{
                                        rowActions: [
                                            {onClick: "deletePortTuple()",
                                             iconClass: 'icon-minus'}
                                        ]},*/
                                        this.getPortTupleNameViewConfig(isDisabled),
                                        this.getPortTupleViewConfig(isDisabled),
                                    ]
                                }
                            }]
                        }]
                    }
                }]
            }
        },
        this.getSvcInstV1PropView = function(isDisabled) {
            return {
                elementId: 'svcInstPropV1',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'svcInstV1PropSection',
                    title: 'Advanced Options',
                    view: 'SectionView',
                    visible: 'showInterfaceCollectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'svcInstV1PropAccordian',
                                view: 'AccordianView',
                                viewConfig: [
                                    this.getRtPolicyAccordianView(isDisabled),
                                    this.getRtAggregateAccordianView(isDisabled)
                                ]
                            }]
                        }]
                    }
                }]
            }
        },
        this.getSvcInstV2PropView = function(isDisabled) {
            return {
                elementId: 'svcInstPropV2',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'svcInstV2PropSection',
                    title: 'Advanced Options',
                    visible: 'showPortTuplesView',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'svcInstV2PropAccordian',
                                view: 'AccordianView',
                                viewConfig: [
                                    this.getSvcHealthCheckAccordianView(isDisabled),
                                    this.getIntfRtTableAccordianView(isDisabled),
                                    this.getRtPolicyAccordianView(isDisabled),
                                    this.getRtAggregateAccordianView(isDisabled)
                                ]
                            }]
                        }]
                    }
                }]
            }
        },
        this.getSvcHealthCheckAccordianView = function (isDisabled) {
            return {
                elementId: 'healthChkSection',
                title: 'Service Health Check',
                view: 'SectionView',
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'svcHealtchChecks',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'svcHealtchChecks',
                                collection: 'svcHealtchChecks',
                                validation: 'svcHealtchChecksValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Interface Type',
                                    view: 'FormDropdownView',
                                    class: "",
                                    viewConfig: {
                                        width: 150,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'interface_type',
                                        dataBindValue: 'interface_type()',
                                        dataBindOptionList:
                                            'interfaceTypesData()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Interface ' +
                                                         'Type',
                                        }
                                    }
                                },
                                {
                                    elementId: 'service_health_check',
                                    name: 'Service Health Check',
                                    view: 'FormDropdownView',
                                    class: "",
                                    viewConfig: {
                                        width: 350,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'service_health_check',
                                        dataBindValue: 'service_health_check()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Health' +
                                                         ' Check Service',
                                            dataTextField: 'text',
                                            dataValueField: 'value',
                                            data: window.healthCheckServiceList
                                        }
                                    }
                                }],
                                rowActions: [{
                                    onClick: "function() {\
                                        $root.deleteSvcInstProperty($data, this);\
                                    }",
                                    iconClass: 'icon-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() {\
                                        $root.addPropSvcHealthChk();\
                                    }"
                                }]
                            }
                        }]
                    }]
                }
            }
        },
        this.getIntfRtTableAccordianView = function (isDisabled) {
            return {
                elementId: 'intfRtTableSection',
                title: 'Route Table',
                view: 'SectionView',
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'intfRtTables',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'intfRtTables',
                                collection: 'intfRtTables',
                                validation: 'intfRtTablesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Interface Type',
                                    view: 'FormDropdownView',
                                    class: "",
                                    viewConfig: {
                                        width: 150,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'interface_type',
                                        dataBindValue: 'interface_type()',
                                        dataBindOptionList:
                                            'interfaceTypesData()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Interface ' +
                                                         'Type',
                                        }
                                    }
                                },
                                {
                                    elementId: 'interface_route_table',
                                    name: 'Route Table',
                                    view: 'FormMultiselectView',
                                    class: "",
                                    viewConfig: {
                                        width: 350,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                        path: 'interface_route_table',
                                        dataBindValue: 'interface_route_table()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select ' +
                                                         'Route Table',
                                            dataTextField: 'text',
                                            dataValueField: 'value',
                                            data: window.interfaceRouteTableList
                                        }
                                    }
                                }],
                                rowActions: [{
                                    onClick: "function() {\
                                        $root.deleteSvcInstProperty($data, this);\
                                    }",
                                    iconClass: 'icon-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() {\
                                        $root.addPropIntfRtTable();\
                                    }"
                                }]
                            }
                        }]
                    }]
                }
            }
        },
        this.getRtPolicyAccordianView = function (isDisabled) {
            return {
                elementId: 'rtPolicySection',
                title: 'Routing Policy',
                view: 'SectionView',
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'rtPolicys',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'rtPolicys',
                                collection: 'rtPolicys',
                                validation: 'rtPolicysValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Interface Type',
                                    view: 'FormDropdownView',
                                    class: "",
                                    viewConfig: {
                                        width: 150,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'interface_type',
                                        dataBindValue: 'interface_type()',
                                        dataBindOptionList:
                                            'rtPolicyInterfaceTypesData()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Interface ' +
                                                'Type'
                                            /*
                                            dataTextField: 'text',
                                            dataValueField: 'value',
                                            data: [
                                                {text: 'left', value: 'left'},
                                                {text: 'right', value: 'right'}
                                            ]
                                            */
                                        }
                                    }
                                },
                                {
                                    elementId: 'routing_policy',
                                    name: 'Routing Policy',
                                    view: 'FormMultiselectView',
                                    class: "",
                                    viewConfig: {
                                        width: 350,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                        path: 'routing_policy',
                                        dataBindValue: 'routing_policy()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Routing ' +
                                                         'Policy',
                                            dataTextField: 'text',
                                            dataValueField: 'value',
                                            data: window.routingPolicyList
                                        }
                                    }
                                }],
                                rowActions: [{
                                    onClick: "function() {\
                                        $root.deleteSvcInstProperty($data, this);\
                                    }",
                                    iconClass: 'icon-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() {\
                                        $root.addPropRtPolicy();\
                                    }"
                                }]
                            }
                        }]
                    }]
                }
            }
        },
        this.getRtAggregateAccordianView = function (isDisabled) {
            return {
                elementId: 'rtAggregateSection',
                title: 'Route Aggregate',
                view: 'SectionView',
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'rtAggregates',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'rtAggregates',
                                collection: 'rtAggregates',
                                validation: 'rtAggregatesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Interface Type',
                                    view: 'FormDropdownView',
                                    class: "",
                                    viewConfig: {
                                        width: 150,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'interface_type',
                                        dataBindValue: 'interface_type()',
                                        dataBindOptionList:
                                            'interfaceTypesData()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Interface ' +
                                                         'Type',
                                        }
                                    }
                                },
                                {
                                    elementId: 'route_aggregate',
                                    name: 'Route Aggregate',
                                    view: 'FormMultiselectView',
                                    class: "",
                                    viewConfig: {
                                        width: 350,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                        path: 'route_aggregate',
                                        dataBindValue: 'route_aggregate()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Route' +
                                                         ' Aggregate',
                                            dataTextField: 'text',
                                            dataValueField: 'value',
                                            data: window.routeAggregateList
                                        }
                                    }
                                }],
                                rowActions: [{
                                    onClick: "function() {\
                                        $root.deleteSvcInstProperty($data, this);\
                                    }",
                                    iconClass: 'icon-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() {\
                                        $root.addPropRtAggregate();\
                                    }"
                                }]
                            }
                        }]
                    }]
                }
            }
        },
        this.getInterfaceCollectionView = function (isDisabled) {
            return {
                elementId: 'interfaceCollection',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'interfaceCollectionAccordian',
                    visible: 'showInterfaceCollectionView',
                    title: 'Interface Details',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'interfaces-collection',
                                view: "FormCollectionView",
                                viewConfig: {
                                    path: 'interfaces',
                                    collection: 'interfaces()',
                                    validation: 'interfacesValidation',
                                    //accordionable: true,
                                    templateId: cowc.TMPL_GEN_COLLECTION_VIEW,
                                    rows: [
                                        this.getIntfVNCollectionView(isDisabled),
                                        this.getStaticRtsCollectionView(isDisabled)
                                    ]
                                }
                            }]
                        }]
                    }
                }]
            }
        }
    };
    return svcInstUtils;
});

