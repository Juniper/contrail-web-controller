/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, Knockback, SvcInstUtils) {
    var gridElId = '#' + ctwl.SERVICE_INSTANCES_GRID_ID;
    var prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var svcInstUtils = new SvcInstUtils();
    var done = 0;

    var SvcInstEditView = ContrailView.extend({
        renderConfigureSvcInst: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureSvcInst(options['isEdit'],
                                            options['dataItem'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchData(self, options.setVNList, function(vmiDetails) {
                self.model.updateVMIToPortTuple(self.model.model().attributes.port_tuples,
                                                vmiDetails);
                self.model.formatModelConfig(self.model.model().attributes,
                                             true);
                self.renderSIView(self, options);
            })
        },
        renderSIView: function (self, options) {
            self.renderView4Config($("#" + modalId).find(formId),
                               self.model,
                               getEditSvcInstViewConfig(self,
                                                        options['isEdit']),
                               "svcInstValidations",
                               null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                var portTuples = self.model.model().attributes.portTuples;
                kbValidation.bind(self, {collection: portTuples});
                var portTupleModels = portTuples.toJSON();
                var portTuplesCnt = portTuples.length;
                for (var i = 0; i < portTuplesCnt; i++) {
                    kbValidation.bind(self,
                          {collection:
                          portTupleModels[i].model().attributes.portTupleInterfaces});
                }
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.svcHealtchChecks});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.intfRtTables});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.rtPolicys});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.rtAggregates});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.allowedAddressPairCollection});
                var interfaces = self.model.model().attributes.interfaces;
                kbValidation.bind(self, {collection: interfaces});
                var intfCnt = interfaces.length;
                var interfaceModels = interfaces.toJSON();
                for (var i = 0; i < intfCnt; i++) {
                    kbValidation.bind(self,
                                      {collection:
                                      interfaceModels[i].model().attributes.staticRoutes});
                }
            });
        },
        fetchData: function(self, setVNList, callback) {
            var ajaxConfigs = [];
            var multArrFlag = false;
            ajaxConfigs[0] =
                $.ajax({
                    url: ctwc.get('/api/tenants/config/get-config-list'),
                    type: "POST",
                    timeout: 60000,
                    data: {'data': [{
                        'type': 'virtual-networks',
                        'parent_fq_name_str': contrail.getCookie('domain') +
                            ':' + contrail.getCookie('project'),
                        'parent_type': 'project'
                    },
                    {
                        'type': 'service-health-checks'
                    },
                    {
                        'type': 'interface-route-tables'
                    },
                    {
                        'type': 'routing-policys'
                    },
                    {
                        'type': 'route-aggregates'
                    }]}
                });
            if ((null != setVNList) && (setVNList.length > 0)) {
                multArrFlag = true;
                ajaxConfigs[1] =
                    $.ajax({
                        url:
                            '/api/tenants/config/get-virtual-machine-details?vn_fqns='
                                + setVNList.join('::'),
                        type: 'GET',
                        timeout: 60000,
                    });
            }
            $.when.apply($, ajaxConfigs).then(
                function() {
                var results = arguments;
                var allVNList = null;
                var vmiList = null;
                var healthCheckServiceList = [];
                var interfaceRouteTableList = [];
                var routingPolicyList = [];
                var routeAggregateList = [];
                if ((null != setVNList) && (setVNList.length > 0)) {
                    allVNList = getValueByJsonPath(arguments, '0;0;0', []);
                    healthCheckServiceList = getValueByJsonPath(arguments,
                                                                '0;0;1', []);
                    interfaceRouteTableList = getValueByJsonPath(arguments,
                                                                 '0;0;2', []);
                    routingPolicyList = getValueByJsonPath(arguments, '0;0;3',
                                                           []);
                    routeAggregateList = getValueByJsonPath(arguments, '0;0;4',
                                                            []);
                    vmiList = getValueByJsonPath(arguments, '1;0', []);
                } else {
                    allVNList = getValueByJsonPath(arguments, '0;0', []);
                    healthCheckServiceList = getValueByJsonPath(arguments,
                                                                '0;1', []);
                    interfaceRouteTableList = getValueByJsonPath(arguments,
                                                                 '0;2', []);
                    routingPolicyList = getValueByJsonPath(arguments, '0;3',
                                                           []);
                    routeAggregateList = getValueByJsonPath(arguments, '0;4',
                                                            []);
                    vmiList = getValueByJsonPath(arguments, '0;5', []);
                }
                window.allVNList = svcInstUtils.virtNwListFormatter(allVNList);
                if (window.allVNList.length > 0) {
                    window.allVNList.unshift({'text':"Auto Configured",
                                             'id':"autoConfigured"});
                }
                window.healthCheckServiceList =
                    svcInstUtils.buildTextValueByConfigList(healthCheckServiceList,
                                                        'service-health-checks');
                window.interfaceRouteTableList =
                    svcInstUtils.buildTextValueByConfigList(interfaceRouteTableList,
                                                        'interface-route-tables');
                window.routingPolicyList =
                    svcInstUtils.buildTextValueByConfigList(routingPolicyList,
                                                        'routing-policys');
                window.routeAggregateList =
                    svcInstUtils.buildTextValueByConfigList(routeAggregateList,
                                                        'route-aggregates');
                svcInstUtils.updateVnVmiMaps(vmiList);
                callback({'virtual-machine-interfaces': vmiList});
            }
        )},
        setVMIsByVN: function(model, newValue, intfType) {
            var self = this;
            var svcTmpl = model.get('service_template');
            var tmplVersionStr = null;
            if (null != svcTmpl) {
                var tmplVersionArr = svcTmpl.split(' - ');
                if (tmplVersionArr.length > 2) {
                    tmplVersionStr = tmplVersionArr[2];
                }
            }
            if ('v1' == tmplVersionStr) {
                return;
            }
            var ajaxConfig = {
                url :
                    '/api/tenants/config/get-virtual-machine-details?vn_fqn=' + newValue,
                type : 'GET',
                timeout : 30000
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result){
                svcInstUtils.updateVnVmiMaps(result);
                self.model.setVMIsByVN(model, newValue, intfType);
            },
            function(error){
            });
        },
        renderDeleteSvcInst: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteSvcInst(options['checkedRows'], {
                    init: function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    function svcTmpListFormatter (response) {
        var svcTmpResp = getValueByJsonPath(response, 'service_templates', []);
        var svcTmpList = [];
        if (!svcTmpResp.length) {
            return ([{id: null, text: "No Service template available"}]);
        }
        var cnt = svcTmpResp.length;
        window.svcTmplFormatted = [];
        for (var i = 0; i < cnt; i++) {
            var dispStr = svcInstUtils.svcTemplateFormatter(svcTmpResp[i]);
            svcTmpList.push({id: dispStr, text: dispStr});
            window.svcTmplFormatted.push(dispStr);
        }
        return svcTmpList;
    }

    function getEditSvcInstViewConfig (self, isDisabled) {
        var prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID;
        var svcInstViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_CREATE_SERVICE_INSTANCE]),
            title: ctwl.TITLE_CREATE_SERVICE_INSTANCE,
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'display_name',
                        view: 'FormInputView',
                        viewConfig: {
                            label: 'Name',
                            disabled: isDisabled,
                            path: 'display_name',
                            class: 'span6',
                            dataBindValue: 'display_name',
                        }
                    },
                    {
                        elementId: 'service_template',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: isDisabled,
                            label: 'Service Template',
                            path: 'service_template',
                            class: 'span6',
                            dataBindValue: 'service_template',
                            elementConfig: {
                                change: function(data) {
                                    var tmpl = data['val'];
                                    var intfTypeStrStart = tmpl.indexOf('(');
                                    var intfTypeStrEnd = tmpl.indexOf(')');
                                    var itfTypes =
                                        tmpl.substr(intfTypeStrStart + 1,
                                                    intfTypeStrEnd -
                                                    intfTypeStrStart - 1);
                                    window.intfTypes = itfTypes.split(', ');
                                    self.model.formatModelConfigColl(window.intfTypes, isDisabled);
                                    var cnt = window.intfTypes.length;
                                },
                                placeholder: 'Select template',
                                dataTextField: "text",
                                dataValueField: "id",
                                data: window.svcTmplsFormatted
                            }
                        }
                    }]
                },
                /*
                {
                    columns: [{
                        elementId: 'service_template',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: isDisabled,
                            label: 'Service Template',
                            path: 'service_template',
                            class: 'span12',
                            dataBindValue: 'service_template',
                            elementConfig: {
                                change: function(data) {
                                    var tmpl = data['val'];
                                    var intfTypeStrStart = tmpl.indexOf('(');
                                    var intfTypeStrEnd = tmpl.indexOf(')');
                                    var itfTypes =
                                        tmpl.substr(intfTypeStrStart + 1,
                                                    intfTypeStrEnd -
                                                    intfTypeStrStart - 1);
                                    window.intfTypes = itfTypes.split(', ');
                                    self.model.formatModelConfigColl(window.intfTypes);
                                    var cnt = window.intfTypes.length;
                                    //self.model.setInterfaceTypesData();
                                },
                                placeholder: 'Select template',
                                dataTextField: "text",
                                dataValueField: "id",
                                data: window.svcTmplsFormatted
                            }
                        }
                    }]
                },
                */
                {
                    columns: [{
                        elementId: 'no_of_instances',
                        view: 'FormInputView',
                        viewConfig: {
                            visible: 'showInstCnt',
                            label: 'Number of instance(s)',
                            path: 'no_of_instances',
                            class: 'span6',
                            dataBindValue: 'no_of_instances'
                        }
                    },
                    {
                        elementId: 'ha_mode',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: 'isHAModeDropDownDisabled',
                            visible: 'showHAMode',
                            class: 'span6',
                            path: 'service_instance_properties.ha_mode',
                            label: 'HA Mode',
                            dataBindValue: 'service_instance_properties().ha_mode',
                            elementConfig: {
                                dataTextField : "text",
                                dataValueField : "id",
                                data : [{id: "",
                                            text: 'None'},
                                        {id: 'active-active',
                                            text: 'Active-Active'},
                                        {id: 'active-standby',
                                            text: 'Active-Standby'}]
                            }
                        }
                    }]
                },
                {
                    columns: [{
                        elementId: 'availability_zone',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: isDisabled,
                            visible: 'showAvailibilityZone',
                            class: 'span6',
                            path: 'availability_zone',
                            dataBindValue: 'availability_zone',
                            elementConfig: {
                                allowClear: true,
                                dataTextField : "text",
                                dataValueField : "value",
                                defaultValueId: 0,
                                data: window.availabilityZoneList,
                                change: function(data) {
                                    var hostListByZone = [];
                                    hostListByZone.push({'text': 'ANY',
                                                        'id': 'ANY'});
                                    if ('ANY' == data['val']) {
                                        self.model.host_list(hostListByZone);
                                        return;
                                    }
                                    var hostList = window.hostList;
                                    if ('host' in hostList) {
                                        var len = hostList['host'].length;
                                        for (var i = 0; i < len; i++) {
                                            var zone =
                                                hostList['host'][i]['zone'];
                                            var host =
                                                hostList['host'][i]['host_name'];
                                            if (data['val'] == zone) {
                                                hostListByZone.push({'text':
                                                                    host,
                                                                    'id':
                                                                    host});
                                            }
                                        }
                                    }
                                    self.model.host_list(hostListByZone);
                                }
                            }
                        }
                    },
                    {
                        elementId: 'host',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: isDisabled,
                            visible: 'showAvailibilityZone',
                            class: 'span6',
                            path: 'host',
                            dataBindValue: 'host',
                            dataBindOptionList: 'host_list()',
                            elementConfig: {
                                allowClear: true,
                                defaultValueId: 0
                            }
                        }
                    }]
                },
                {
                    columns: [
                        svcInstUtils.getInterfaceCollectionView(isDisabled)
                    ]
                },
                {
                    columns: [
                        svcInstUtils.getPortTuplesView(self, isDisabled)
                    ]
                },
                {
                    columns: [
                        svcInstUtils.getSvcInstV1PropView(isDisabled)
                    ]
                },
                {
                    columns: [
                        svcInstUtils.getSvcInstV2PropView(isDisabled)
                    ]
                }]
            }
        }
        return svcInstViewConfig;
    }

    return SvcInstEditView;
});

