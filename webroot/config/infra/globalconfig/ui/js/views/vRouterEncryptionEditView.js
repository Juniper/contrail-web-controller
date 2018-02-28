/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
	'underscore',
	'lodashv4',
    'contrail-view',
    'knockback'
], function (_, lodashv4, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.GLOBAL_VROUTER_ENCRYPTION_GRID_ID,
        prefixId = ctwc.GLOBAL_VROUTER_ENCRYPTION_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var vRouterEncryptionEditView = ContrailView.extend({
        renderEditVRouterEncryption: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configureVRouterEncryption({
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
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   vrouterEncryptionViewConfig(self.encryptDataObj),
                                   "vrouterEncryptionValidations",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    var vrouterEncryptionViewConfig = function (encryptDataObj) {
        return {
            elementId: ctwc.GLOBAL_VROUTER_ENCRYPTION_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns:[{
                            elementId: 'encryption_mode',
                            view: "FormDropdownView",
                            viewConfig: {
                                label: 'Traffic Encrypt',
                                path : 'encryption_mode',
                                class: 'col-xs-4',
                                dataBindValue :'encryption_mode',
                                elementConfig : {
                                    dataTextField : "text",
                                    dataValueField : "id",
                                    defaultValue: 'None',
                                    placeholder : 'Select Encrpt',
                                    data : [{id: 'none', text:'None'},
                                            {id: 'all', text:'All'}]
                                }
                            }
                        }]
                    }, 	
                    {
                    columns: [
                        {
                            elementId: 'select_all_endpoints',
                            view: "FormCheckboxView",
                            viewConfig : {
                                path : 'select_all_endpoints',
                                class : "col-xs-6",
                                label:'Select All vRouters',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue : 'select_all_endpoints',
                                elementConfig : {
                                    isChecked:false
                                }
                            }
                        },
                        {
                            elementId: 'select_all_endpoints_message',
                            view: "FormTextView",
                            disabled : true,
                            viewConfig: {
                                value: "* All existing vRouters will be added to this Tunnel Encryption.",
                                visible: 'select_all_endpoints',
                                class: "col-xs-12",
                               
                            }
                        }
                    ]
                    },
                    tunnelMeshSection(encryptDataObj),
                ]
            }
        }
    };
    
    function tunnelMeshSection(encryptDataObj) {
        return {
            columns: [
            	{
                elementId: 'encryption_tunnel_endpoints',
                view: 'SectionView',
                viewConfig: {
                    class: 'col-xs-12',
                    rows: [{
                        columns: [{
                            elementId: 'encryption_tunnel_endpoints',
                            view: 'FormEditableGridView',
                            viewConfig: {
                                    label: 'Tunnel Mesh',
                                    path: 'encryption_tunnel_endpoints',
                                    validation: 'tunnelMeshValidation',
                                    templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                    collection: 'encryption_tunnel_endpoints',
                                    columns: [{
                                        elementId: 'tunnel_remote_ip_address',
                                        view:
                                            "FormHierarchicalDropdownView",
                                        name: 'Endpoints',
                                        class: "",
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                            width: 250,
                                            path: 'tunnel_remote_ip_address',
                                            dataBindValue: 'tunnel_remote_ip_address()',
                                            elementConfig: {
                                                minimumResultsForSearch : 1,
                                                width: 250,
                                                dataTextField: "text",
                                                dataValueField: "value",
                                                data: encryptDataObj.vRouterGrpList,
                                                queryMap: [
                                                    {
                                                        name : 'Virtual Router IP Address',
                                                        value : 'virtual_router_ip_address',
                                                        iconClass:
                                                            'icon-contrail-network-ipam'
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                   
                                ],
                                rowActions: [{
                                    onClick: "function() {\
                                        $root.addTunnelMeshIPByIndex($data, this);\
                                    }",
                                    iconClass: 'fa fa-plus'
                                },{
                                    onClick: "function() {\
                                        $root.deleteTunnelMeshIPs($data, this);\
                                    }",
                                    iconClass: 'fa fa-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() {\
                                        $root.addTunnelMeshIP();\
                                    }",
                                    buttonTitle: ""
                                }]
                            }
                        }
                        ]
                    	}
                    ]
                    
                }
            }]
        };
    };
    return vRouterEncryptionEditView;
});

