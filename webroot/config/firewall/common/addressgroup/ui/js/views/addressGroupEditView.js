/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.SECURITY_POLICY_ADDRESS_GRP_GRID_ID,
        prefixId = ctwc.SEC_POLICY_ADDRESS_GRP_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var addressGroupEditView = ContrailView.extend({
    	renderAddEditAddressGroup: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this,disable = false;
                var mode = options.mode;
	            if(mode === 'edit'){
	            	disable = true;
	            }
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditAddressGroup({
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
                }, options);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getAddressGroupViewConfig(disable),
                                   "addressGroupValidation",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.subnetCollection});
            },null,true,false);
        },
        renderDeleteAddressGrp: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteAddressGroup(options['selectedGridData'], {
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
            Knockback.applyBindings(self.model,
                document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    var getAddressGroupViewConfig = function (isDisable) {
        return {
            elementId: ctwc.SEC_POLICY_ADDRESS_GRP_PREFIX_ID,
            view: 'SectionView',
            title: "Address Group",
           // active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                        	{
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                    disabled : isDisable
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'subnetCollection',
                            view: "FormCollectionView",
                            viewConfig: {
                                path: "subnetCollection",
                                class: 'col-xs-12',
                                //validation: 'ruleValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "subnetCollection",
                                rows:[{
                                   rowActions: [
                                        {onClick: "function() { $root.addSubnet(); }",
                                         iconClass: 'fa fa-plus'},
                                         {onClick: "function() { $root.deleteSubnet($data, this); }",
                                         iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                          elementId: 'prefix',
                                          name: 'Prefix',
                                          view: "FormInputView",
                                          class: "",
                                          width:290,
                                          viewConfig: {
                                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                             placeholder: 'xxx.xxx.xxx.xxx/xx',
                                             width:290,
                                             path: 'prefix',
                                             dataBindValue: 'prefix()'
                                          }
                                       }
                                  ]
                                }],
                                gridActions: [
                                    {onClick: "function() { addSubnet(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    },
                    {
                        columns: [
                            {
                                elementId: 'Labels',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: "Labels",
                                    path: 'Labels',
                                    dataBindValue: 'Labels',
                                    class: 'col-xs-6',
                                    elementConfig: {
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        placeholder:
                                            "Select Labels",
                                             dataSource : ctwu.getDataSourceForDropdown('label')
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    return addressGroupEditView;
});
