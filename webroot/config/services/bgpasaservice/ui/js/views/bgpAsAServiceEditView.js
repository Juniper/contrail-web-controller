/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/services/bgpasaservice/ui/js/bgpAsAServiceFormatter'
], function (_, ContrailView, Knockback, BGPAsAServiceFomatter) {
    var bgpAsAServiceFomatter = new BGPAsAServiceFomatter();
    var prefixId = ctwc.BGP_AS_A_SERVICE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var self;
    var bgpAsAServiceEditView = ContrailView.extend({
        renderAddEditBGPAsAService: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId});
            self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                 'onSave': function () {
                        self.configEditBGPAsAService(options);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.bgpAsAServiceRenderView4Config(options);
        },
        configEditBGPAsAService : function(options) {
            self.model.configBGPAsAService({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options.mode === ctwl.CREATE_ACTION ? 'POST' : 'PUT');
        },
        bgpAsAServiceRenderView4Config : function(options) {
            var disableFlag =
                (options.mode === ctwl.CREATE_ACTION) ?  false : true;
            self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                self.model,
                self.getBGPASAServiceViewConfig(disableFlag),
                "configureValidation", null, null,
                function () {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                   kbValidation.bind(self,
                       {collection: self.model.model().attributes.familyAttrs});
                   //permissions
                   ctwu.bindPermissionsValidation(self);
                }, null, true
            );
        },
        renderDeleteBGPAsAService: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteBGPAsAServices(options['checkedRows'], {
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
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },
        getBGPASAServiceViewConfig : function(disableId) {
            var bgpViewConfig = {
                elementId: cowu.formatElementId([prefixId,
                                   ctwl.TITLE_ADD_BGP_AS_A_SERVICE]),
                title: "BGP as a Service",
                view: "SectionView",
                viewConfig :{
                    rows : [
                        {
                            columns : [
                                {
                                    elementId: "display_name",
                                    view: "FormInputView",
                                    viewConfig: {
                                        disabled: disableId,
                                        path: "display_name",
                                        dataBindValue: "display_name",
                                        label: "Name",
                                        class: "span6"
                                    }
                                },{
                                    elementId: "autonomous_system",
                                    view: "FormInputView",
                                    viewConfig: {
                                        placeholder: "1 - 65534",
                                        path: "autonomous_system",
                                        dataBindValue: "autonomous_system",
                                        label : "Autonomous System",
                                        class: "span6"
                                    }
                                }
                            ]
                        },
                        {
                            columns:[
                                {
                                    elementId: "family",
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        label: "Address Family",
                                        dataBindValue: "bgpaas_session_attributes().address_families.family",
                                        path: "bgpaas_session_attributes.address_families.family",
                                        class: "span12",
                                        elementConfig: {
                                            placeholder: "Select Address Family",
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data: ctwc.BGP_AS_A_SERVICE_ADDRESS_FAMILIES
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                {
                                    elementId: "user_created_virtual_machine_interface",
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        path: "user_created_virtual_machine_interface",
                                        dataBindValue: "user_created_virtual_machine_interface",
                                        label : "Virtual Machine Interface(s)",
                                        class: "span12",
                                        elementConfig: {
                                            placeholder: "Select Interface(s)",
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            separator: ctwc.MULTISELECT_VALUE_SEPARATOR,
                                            maximumSelectionSize: 1,
                                            dataSource: {
                                                type: "remote",
                                                requestType: "GET",
                                                url: "/api/tenants/config/get-virtual-machine-details?proj_fqn=" +
                                                    contrail.getCookie(cowc.COOKIE_DOMAIN) + ":"
                                                    + contrail.getCookie(cowc.COOKIE_PROJECT),
                                                parse : bgpAsAServiceFomatter.parseVMIDetails
                                            }
                                        }
                                    }
                                }
                            ]
                        },{
                            columns: [{
                                elementId: "bgpasas_advanced_opts_accordian",
                                view: "AccordianView",
                                viewConfig: [{
                                    elementId: "bgpasas_advanced_opts_section",
                                    title: "Advanced Options",
                                    view: "SectionView",
                                    active:false,
                                    viewConfig: {
                                        rows: [{
                                            columns: [
                                                {
                                                    elementId: "bgpaas_ip_address",
                                                    view: "FormInputView",
                                                    viewConfig: {
                                                        placeholder: "Enter IP Address",
                                                        path: "bgpaas_ip_address",
                                                        dataBindValue: "bgpaas_ip_address",
                                                        label : "IP Address",
                                                        class: "span6"
                                                    }
                                                }
                                            ]},{
                                            columns: [{
                                                elementId: "hold_time",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    placeholder: "Enter Hold Time",
                                                    label: "Hold Time",
                                                    dataBindValue: "bgpaas_session_attributes().hold_time",
                                                    path: "bgpaas_session_attributes.hold_time",
                                                    class: "span6"
                                                }
                                            },{
                                                elementId: "loop_count",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    placeholder: "Enter Loop Count",
                                                    label: "Loop Count",
                                                    dataBindValue: "bgpaas_session_attributes().loop_count",
                                                    path: "bgpaas_session_attributes.loop_count",
                                                    class: "span6"
                                                }
                                            }]},{
                                            columns: [{
                                                    elementId: "admin_down",
                                                    view: "FormCheckboxView",
                                                    viewConfig: {
                                                        label: "Admin State",
                                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                        dataBindValue: "bgpaas_session_attributes().admin_down",
                                                        path: "bgpaas_session_attributes.admin_down",
                                                        class: "span6",
                                                    }
                                                },{
                                                elementId: "as_override",
                                                view: "FormCheckboxView",
                                                viewConfig: {
                                                    label: "AS Override",
                                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                    dataBindValue: "bgpaas_session_attributes().as_override",
                                                    path: "bgpaas_session_attributes.as_override",
                                                    class: "span6",
                                                }
                                            }]},{
                                            columns: [{
                                                    elementId: "bgpaas_ipv4_mapped_ipv6_nexthop",
                                                    view: "FormCheckboxView",
                                                    viewConfig: {
                                                        label: "Use IPv4-mapped IPv6 Nexthop",
                                                        templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                        dataBindValue: "bgpaas_ipv4_mapped_ipv6_nexthop",
                                                        path: "bgpaas_ipv4_mapped_ipv6_nexthop",
                                                        class: "span6",
                                                    }
                                                },{
                                                elementId: "bgpaas_suppress_route_advertisement",
                                                view: "FormCheckboxView",
                                                viewConfig: {
                                                    label: "Suppress Route Advertisement",
                                                    templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                                    dataBindValue: "bgpaas_suppress_route_advertisement",
                                                    path: "bgpaas_suppress_route_advertisement",
                                                    class: "span6",
                                                }
                                            }]}/*,{
                                            columns : [{
                                                        elementId: 'user_created_auth_key_type',
                                                        view: 'FormDropdownView',
                                                        viewConfig: {
                                                            path:
                                                                'user_created_auth_key_type',
                                                            dataBindValue:
                                                                'user_created_auth_key_type',
                                                            label : 'Authentication Mode',
                                                            class: 'span6',
                                                            elementConfig : {
                                                                dataTextField :
                                                                'text',
                                                                dataValueField :
                                                                'value',
                                                                data : ctwc.AUTHENTICATION_DATA
                                                            }
                                                        }
                                                    },
                                                    {
                                                        elementId: 'user_created_auth_key',
                                                        view: 'FormInputView',
                                                        viewConfig: {
                                                            disabled: "disableAuthKey",
                                                            type: "password",
                                                            path:
                                                            'user_created_auth_key',
                                                            dataBindValue:
                                                            'user_created_auth_key',
                                                            label : 'Authentication Key',
                                                            class: 'span6'
                                                        }
                                                }]
                                            }*/]
                                       }
                                 }]
                            }]
                        }/*,
                        {
                            columns: [{
                                elementId: "bgpasas_session_attr_accordian",
                                view: "AccordianView",
                                viewConfig: [{
                                    elementId: "bgpasas_session_attr_section",
                                    title: "Address Family Attributes",
                                    view: "SectionView",
                                    active:false,
                                    viewConfig: {
                                        rows: [{
                                            columns: [{
                                                elementId: "family_attr_editable_grid",
                                                view: "FormEditableGridView",
                                                    viewConfig: {
                                                        path: "familyAttrs",
                                                        collection: "familyAttrs",
                                                        validation: "familyAttrValidation",
                                                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                                        columns: [{
                                                            elementId: "bgpaas_address_family",
                                                            name: "Address Family",
                                                            view: "FormDropdownView",
                                                            width: 200,
                                                            viewConfig: {
                                                                disabled: true,
                                                                width: 200,
                                                                path: "bgpaas_address_family",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                                dataBindValue: "bgpaas_address_family()",
                                                                elementConfig: {
                                                                    placeholder: "Select Address Family",
                                                                    dataValueField: "value",
                                                                    dataTextField: "text",
                                                                    data : ctwc.BGP_AS_A_SERVICE_ADDRESS_FAMILIES
                                                                }
                                                            }
                                                        },{
                                                            elementId: "bgpaas_loop_count",
                                                            name: "Loop Count",
                                                            view: "FormInputView",
                                                            width: 200,
                                                            viewConfig: {
                                                                placeholder: "Enter Loop Count",
                                                                width: 200,
                                                                path: "bgpaas_loop_count",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                                dataBindValue: "bgpaas_loop_count()",
                                                            }
                                                        },{
                                                            elementId: "bgpaas_prefix_limit",
                                                            name: "Prefix Limit",
                                                            view: "FormInputView",
                                                            width: 200,
                                                            viewConfig: {
                                                                placeholder: "Enter Prefix Limit",
                                                                width: 200,
                                                                path: "bgpaas_prefix_limit",
                                                                dataBindValue: "bgpaas_prefix_limit()",
                                                                templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                                            }
                                                        }],
                                                        rowActions: [
                                                            {
                                                                onClick: "function() {\
                                                                $root.addFamilyAttr(); }",
                                                                iconClass: 'icon-plus'
                                                            },
                                                            {
                                                                onClick: "function() {\
                                                                $root.deleteFamilyAttr($data, this)\
                                                                ;}",
                                                                iconClass: 'icon-minus'
                                                            }
                                                        ],
                                                        gridActions: [
                                                            {
                                                                onClick: "function() {\
                                                                addFamilyAttr(); }",
                                                                buttonTitle: ""
                                                            }
                                                        ]
                                                    }
                                            }]}]
                                        }
                                    }]
                               }]
                        }*/
                    ]
                }
            };
            return bgpViewConfig

        }
    });

    return bgpAsAServiceEditView;
});

