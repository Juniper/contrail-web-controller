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
                    viewConfig: {
                        label: 'Name',
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
                    elementId: 'port-tuples-vmi-collection',
                    view: "FormCollectionView",
                    viewConfig: {
                        colSpan: '2',
                        path: 'portTupleInterfaces',
                        collection: 'portTupleInterfaces()',
                        templateId: cowc.TMPL_GEN_COLLECTION_VIEW,
                        /*
                        collectionActions: {
                            add: {onClick: "addPortTupleInterface()",
                                  iconClass: 'icon-plus',
                                  buttonTitle: 'Add Interface'
                            }
                        },
                        */
                        rows: [{
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
                                viewConfig: {
                                    placeholder: 'Select Port',
                                    templateId:
                                        cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    path: 'interface',
                                    dataBindValue: 'interface()',
                                    elementConfig: {
                                        dataTextField: 'text',
                                        dataValueField: 'value',
                                        data: window.vmiList
                                    }
                                }
                            }]
                        }]
                    }
                }]
            }
        },
        this.getPortTuplesView = function (isDisabled) {
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
                                    validations: 'portTuplesValidation',
                                    accordionable: true,
                                    templateId: cowc.TMPL_GEN_COLLECTION_VIEW,
                                    collectionActions: {
                                        add: {onClick: "function() {addPortTuple();}",
                                              iconClass: 'icon-plus',
                                              buttonTitle: 'Add Port Tuple'
                                        }
                                    },
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
        this.getPortTuplePropView = function(isDisabled) {
            return {
                elementId: 'svcInstProp',
                view: 'AccordianView',
                viewConfig: [{
                    visible: 'showPortTuplesView',
                    elementId: 'svcInstPropSection',
                    title: 'Service Instance Properties',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'svcInstPropAccordian',
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
                            elementId: 'svcHeatchChecks',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'svcHeatchChecks',
                                collection: 'svcHeatchChecks',
                                validation: 'portTuplePropertiesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Type',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
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
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
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
                title: 'Interface Route Table',
                view: 'SectionView',
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: 'intfRtTables',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                path: 'intfRtTables',
                                collection: 'intfRtTables',
                                validation: 'portTuplePropertiesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Type',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
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
                                    name: 'Interface Route Table',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        path: 'interface_route_table',
                                        dataBindValue: 'interface_route_table()',
                                        elementConfig: {
                                            minimumResultsForSearch: 1,
                                            placeholder: 'Select Interface' +
                                                         ' Route Table',
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
                                validation: 'portTuplePropertiesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Type',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
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
                                    elementId: 'routing_policy',
                                    name: 'Routing Policy',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
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
                                validation: 'portTuplePropertiesValidation',
                                columns: [{
                                    elementId: 'interface_type',
                                    name: 'Type',
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
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
                                    view: 'FormDropdownView',
                                    class: "", width: 100,
                                    viewConfig: {
                                        width: 200,
                                        templateId:
                                            cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
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
                                    validations: 'interfacesValidation',
                                    accordionable: true,
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

