/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.SECURITY_POLICY_SERVICE_GRP_GRID_ID,
        prefixId = ctwc.SEC_POLICY_SERVICE_GRP_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var serviceGroupEditView = ContrailView.extend({
        renderAddEditServiceGroup: function(options) {
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
                self.model.addEditServiceGroup({
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
                                   getServiceGroupViewConfig(disable),
                                   "serviceGroupValidation",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.serviceTypeCollection});
            },null,true,false);
        },
        renderDeleteServiceGrp: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteServiceGroup(options['selectedGridData'], {
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

    var getServiceGroupViewConfig = function (isDisable) {
        return {
            elementId: ctwc.SEC_POLICY_SERVICE_GRP_PREFIX_ID,
            view: 'SectionView',
            title: "Service Group",
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
                            elementId: 'serviceTypeCollection',
                            view: "FormCollectionView",
                            //view: "FormEditableGridView",
                            viewConfig: {
                                path: "serviceTypeCollection",
                                class: 'col-xs-12',
                                validation: 'serviceCollectionValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "serviceTypeCollection",
                                rows:[{
                                   rowActions: [
                                        {onClick: "function() { $root.addSvcType(); }",
                                         iconClass: 'fa fa-plus'},
                                         {onClick: "function() { $root.deleteSvcType($data, this); }",
                                         iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                        elementId: 'protocol',
                                        name: 'Protocol',
                                        view: "FormComboboxView",
                                        class: "col-xs-6",
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            path: "protocol",
                                            dataBindValue: "protocol()",
                                            elementConfig:{
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource: {
                                                    type: 'local',
                                                    data:[{text:'tcp', value:'tcp' },
                                                          {text:'udp', value:'udp' },
                                                          {text:'icmp', value:'icmp' }]
                                                   }
                                               }
                                           }
                                       },
                                       {
                                           elementId: 'dst_port',
                                           name: 'Port',
                                           view: "FormInputView",
                                           class: "col-xs-6",
                                           viewConfig: {
                                              templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                              placeholder: 'Start - End Port or Any',
                                              path: 'dst_port',
                                              dataBindValue: 'dst_port()'
                                           }
                                       }
                                       /*{
                                          elementId: 'src_port',
                                          name: 'Source Ports',
                                          view: "FormInputView",
                                          class: "",
                                          width: 200,
                                          viewConfig: {
                                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                             width: 180,
                                             placeholder: '0 - 65535',
                                             path: 'src_port',
                                             dataBindValue: 'src_port()'
                                          }
                                       }*/
                                  ]
                                }],
                                gridActions: [
                                    {onClick: "function() { addSvcType(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    }
                ]
            }
        }
    };

    return serviceGroupEditView;
});
