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
                self.model.configureSvcInst(options['isEdit'], {
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
                kbValidation.bind(self);
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
                                data: window.svcTmplsFormatted
                                    /*
                                dataSource: {
                                    type: 'remote',
                                    url:
                                        '/api/tenants/config/service-instance-templates/'
                                        +
                                        window.projectDomainData['parentSelectedValueData']['value'],
                                    parse: svcTmpListFormatter
                                }
                                */
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
                            class: 'span6',
                            dataBindValue: 'no_of_instances'
                        }
                    },
                    {
                        elementId: 'ha_mode',
                        view: 'FormDropdownView',
                        viewConfig: {
                            visible: 'showInstCnt',
                            class: 'span6',
                            path: 'service_instance_properties.ha_mode',
                            label: 'HA Mode',
                            dataBindValue: 'service_instance_properties().ha_mode',
                            elementConfig: {
                                dataTextField : "text",
                                dataValueField : "id",
                                data : [{id: 'active-active',
                                            text: 'Standalone'},
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
                }]
            }
        }
        return svcInstViewConfig;
    }

    return SvcInstEditView;
});

