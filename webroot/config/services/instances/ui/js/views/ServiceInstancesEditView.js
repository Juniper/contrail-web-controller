/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/services/instances/ui/js/svcInst.utils'
], function (_, ContrailView, Knockback, SvcInstUtils) {
    var gridElId = '#' + ctwl.GLOBAL_CONFIG_GRID_ID;
    var prefixId = ctwl.GLOBAL_CONFIG_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';
    var svcInstUtils = new SvcInstUtils();
    var done = 0;

    var ServiceInstancesEditView = ContrailView.extend({
        renderConfigureServiceInstances: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-400',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureServiceInstances(options['isEdit'], {
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
            this.fetchVNListAndRender(self, options['isEdit']);
        },
        renderDeleteServiceInstances: function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                self.model.deleteServiceInstances(options['checkedRows'], {
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
        },
        fetchVNListAndRender: function(self, isDisabled) {
            contrail.ajaxHandler(
                {url: '/api/tenants/config/virtual-networks',
                 type: 'GET'}, null,
                 function(result) {
                window.vnList = svcInstUtils.virtNwListFormatter(result);
                self.renderView4Config($("#" + modalId).find(formId),
                                   self.model,
                                   getEditServiceInstancesViewConfig(self,
                                                                     isDisabled),
                                   "serviceInstancesValidations",
                                   null, null, function() {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                    kbValidation.bind(self);
                });
             },
             function(error) {
             });
        }
    });

    function svcTmpListFormatter (response) {
        var svcTmpResp = getValueByJsonPath(response, 'service_templates', []);
        var svcTmpList = [];
        if (!svcTmpResp.length) {
            return ([{id: null, text: "No Service template available"}]);
        }
        var cnt = svcTmpResp.length;
        for (var i = 0; i < cnt; i++) {
            var dispStr = svcInstUtils.svcTemplateFormatter(svcTmpResp[i]);
            svcTmpList.push({id: dispStr, text: dispStr});
        }
        return svcTmpList;
    }

    function getEditServiceInstancesViewConfig (self, isDisabled) {
        var prefixId = ctwl.GLOBAL_CONFIG_PREFIX_ID;
        var serviceInstancesViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_GLOBAL_CONFIG]),
            title: ctwl.TITLE_EDIT_GLOBAL_CONFIG,
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
                            class: 'span12',
                            dataBindValue: 'display_name'
                        }
                    }],
                },
                {
                    columns: [{
                        elementId: 'service_template',
                        view: 'FormDropdownView',
                        viewConfig: {
                            disabled: isDisabled,
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
                                    window.intfTypes = itfTypes.split(',');
                                    self.model.formatModelConfigColl(window.intfTypes);
                                },
                                placeholder: 'Select template',
                                dataTextField: "text",
                                dataValueField: "id",
                                dataSource: {
                                    type: 'remote',
                                    url:
                                        '/api/tenants/config/service-instance-templates/'
                                        +
                                        window.projectDomainData['parentSelectedValueData']['value'],
                                    parse: svcTmpListFormatter
                                }
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
                            label: 'Number of instances',
                            path: 'no_of_instances',
                            class: 'span12',
                            dataBindValue: 'no_of_instances'
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
                }]
            }
        }
        return serviceInstancesViewConfig;
    }

    return ServiceInstancesEditView;
});

