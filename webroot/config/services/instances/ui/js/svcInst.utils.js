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
            return vnFqn[2] + "(" + vnFqn[0] + ":" + vnFqn[1] + ")";
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
            var intfType =
                getValueByJsonPath(svcTempProp, 'interface_type', []);
            var intfCnt = intfType.length;
            for (var j = 0; j < intfCnt; j++) {
                svcIntfTypes.push(intfType[j]['service_interface_type']);
            }

            dispStr += "[" +
                getValueByJsonPath(svcTempProp, 'service_mode', '-') + " (" +
                svcIntfTypes.join(',') + ")]";
            return dispStr;
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
        this.getIntfVNCollectionView = function(isDisabled) {
            return {
                columns: [{
                    elementId: 'interfaceType',
                    view: 'FormInputView',
                    class: "", width: 400,
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
                    class: "", width: 250,
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
                                class: "", width: 250,
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
                                class: "", width: 250,
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
        this.getInterfaceCollectionView = function (isDisabled) {
            return {
                elementId: 'interfaceCollection',
                view: 'AccordianView',
                viewConfig: [{
                    elementId: 'interfaceCollectionAccordian',
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

