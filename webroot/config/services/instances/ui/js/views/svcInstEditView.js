/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, Knockback, svcInstUtils) {
    var gridElId = '#' + ctwl.SERVICE_INSTANCES_GRID_ID,
        prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form',
        done = 0, self;

    var SvcInstEditView = ContrailView.extend({
        renderConfigureSvcInst: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
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
                        /* Check if user has associated Health Check Object */
                        var hlthChkBackRefs = self.model.svcHealtchChecks();
                        svcInstUtils.doFetchSvcInstHlthChk = false;
                        if ((null == hlthChkBackRefs) ||
                            (!hlthChkBackRefs.length)) {
                            /* Check if older was having SVC health check object
                             */
                            hlthChkBackRefs =
                                getValueByJsonPath(options,
                                                   'dataItem;service_health_check_back_refs',
                                                   []);
                        }
                        if ((null != hlthChkBackRefs) &&
                            (hlthChkBackRefs.length > 0)) {
                            svcInstUtils.doFetchSvcInstHlthChk = true;
                            svcInstUtils.svcInstTimerArray =
                                svcInstUtils.healthCheckStatusIntervals;
                        } else {
                            svcInstUtils.doFetchSvcInstHlthChk = false;
                            svcInstUtils.svcInstTimerArray =
                                svcInstUtils.svcInstStatusIntervals;
                        }
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
            this.fetchData(self, options.setVNList, function(configDetails) {
                self.model.updateVMIToPortTuple(self.model.model().attributes.port_tuples,
                                                configDetails);
                configDetails.svcInstanceDataObj = self.svcInstanceDataObj;
                self.model.formatModelConfig(self.model.model().attributes,
                                                configDetails);
                self.renderSIView(self, options, configDetails);
            })
        },
        renderSIView: function (self, options, configDetails) {
            self.renderView4Config($("#" + modalId).find(formId),
                               self.model,
                               getEditSvcInstViewConfig(self,
                                   options['isEdit'], configDetails),
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
                                  self.model.model().attributes.staticRoutes});
                kbValidation.bind(self,
                                  {collection:
                                  self.model.model().attributes.allowedAddressPairCollection});
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.interfaces});
                //permissions
                ctwu.bindPermissionsValidation(self);
            }, null, true);
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
                    },
                    {
                        'type': 'virtual-networks',
                        'filters': 'is_shared==true'
                    }]}
                });
            if ((null != setVNList) && (setVNList.length > 0)) {
                multArrFlag = true;
                ajaxConfigs[1] =
                    $.ajax({
                        url:
                            '/api/tenants/config/get-virtual-machine-details?' +
                            'filter_svc_inst_ip=true&vn_fqns='
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
                var sharedVNList = [];
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
                    sharedVNList = getValueByJsonPath(arguments, '0;0;5', []);
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
                    vmiList = getValueByJsonPath(arguments, '0;6', []);
                    sharedVNList = getValueByJsonPath(arguments, '0;5', []);
                }
                allVNList = svcInstUtils.virtNwListFormatter(allVNList,
                                                                    false);
                sharedVNList =
                    svcInstUtils.virtNwListFormatter(sharedVNList, true);
                allVNList = allVNList.concat(sharedVNList);
                allVNList.unshift({'text':"Auto Configured",
                                         'id':"autoConfigured"});
                if (1 == allVNList.length) {
                    /* Only Auto Configured, so no VN */
                    allVNList.push({id: null,
                        text: "No Virtual Networks found"});
                }
                healthCheckServiceList =
                    svcInstUtils.buildTextValueByConfigList(healthCheckServiceList,
                                                        'service-health-checks');
                interfaceRouteTableList =
                    svcInstUtils.buildTextValueByConfigList(interfaceRouteTableList,
                                                        'interface-route-tables');
                routingPolicyList =
                    svcInstUtils.buildTextValueByConfigList(routingPolicyList,
                                                        'routing-policys');
                routeAggregateList =
                    svcInstUtils.buildTextValueByConfigList(routeAggregateList,
                                                        'route-aggregates');
                var vnDetails = svcInstUtils.vmiListFormatter(vmiList);
                callback({'virtual-machine-interfaces': vmiList,
                    'allVNList' : allVNList,
                    'healthCheckServiceList' : healthCheckServiceList,
                    'interfaceRouteTableList' : interfaceRouteTableList,
                    'routingPolicyList' : routingPolicyList,
                    'routeAggregateList' : routeAggregateList,
                    'vnDetails' : vnDetails});
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
                    '/api/tenants/config/get-virtual-machine-details?' +
                    'filter_svc_inst_ip=true&vn_fqn=' + newValue,
                type : 'GET',
                timeout : 30000
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result){
                var vnDetails = svcInstUtils.vmiListFormatter(result,
                        self.model.configDetails.vnDetails);

                self.model.setVMIsByVN(model, newValue, intfType, vnDetails);
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

    function getEditSvcInstViewConfig (self, isDisabled, configDetails) {
        var prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID;
        var svcInstViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_CREATE_SERVICE_INSTANCE]),
            title: "Service Instance",
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
                            class: 'col-xs-6',
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
                            class: 'col-xs-6',
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
                                    self.model.formatModelConfigColl(
                                        itfTypes.split(', '), isDisabled,
                                        self.svcInstanceDataObj.svcInstTmplts);
                                },
                                placeholder: 'Select template',
                                dataTextField: "text",
                                dataValueField: "id",
                                data: configDetails.svcInstanceDataObj.svcTmplsFormatted
                            }
                        }
                    }]
                },
                {
                    columns: [{
                        elementId: 'no_of_instances',
                        view: 'FormInputView',
                        viewConfig: {
                            visible: 'showInstCnt',
                            label: 'Number of instance(s)',
                            path: 'no_of_instances',
                            class: 'col-xs-6',
                            dataBindValue: 'no_of_instances'
                        }
                    },
                    {
                        elementId: 'user_created_ha_mode',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: 'isHAModeDropDownDisabled',
                            visible: 'showHAMode',
                            class: 'col-xs-6',
                            path: 'user_created_ha_mode',
                            label: 'HA Mode',
                            dataBindValue: 'user_created_ha_mode',
                            dataBindOptionList: 'haModeList()',
                            elementConfig: {
                                dataTextField : "text",
                                dataValueField : "id"
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
                            class: 'col-xs-6',
                            path: 'availability_zone',
                            dataBindValue: 'availability_zone',
                            elementConfig: {
                                allowClear: true,
                                dataTextField : "text",
                                dataValueField : "value",
                                defaultValueId: 0,
                                data: configDetails.svcInstanceDataObj.availabilityZoneList,
                                change: function(data) {
                                    var hostListByZone = [];
                                    hostListByZone.push({'text': 'ANY',
                                                        'id': 'ANY'});
                                    if ('ANY' == data['val']) {
                                        self.model.host_list(hostListByZone);
                                        return;
                                    }
                                    var hostList =
                                        configDetails.svcInstanceDataObj.hostList;
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
                            class: 'col-xs-6',
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
                        svcInstUtils.getSvcInstV2PropView(isDisabled,
                            configDetails)
                    ]
                }]
            }
        }
        return svcInstViewConfig;
    }

    return SvcInstEditView;
});

