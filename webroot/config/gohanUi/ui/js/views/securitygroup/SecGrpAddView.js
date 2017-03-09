/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.SEC_GRP_GRID_ID;
    var prefixId = ctwl.SEC_GRP_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var formId = '#' + modalId + '-form';

    var SecGrpAddView = ContrailView.extend({
        renderConfigureSecGrp: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-840',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                                 self.model.addSecurityGroupCfg({
                                     init: function () {
                                         cowu.enableModalLoading(modalId);
                                     },
                                     success: function () {
                                         options['callback']();
                                         Knockback.release(self.model, document.getElementById(modalId));
                                         kbValidation.unbind(self);
                                         $("#" + modalId).modal('hide');
                                     },
                                     error: function (error) {
                                         //Needs to be fixed, id doesnt work
                                         cowu.disableModalLoading(modalId, function () {
                                             self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                                      error.responseText);
                                         });
                                     }
                                 });
                             },
                             'onCancel': function () {
                                        Knockback.release(self.model, document.getElementById(modalId));
                                        kbValidation.unbind(self);
                                        $("#" + modalId).modal('hide');
                             }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getEditSecGrpViewConfig(),
                                   "secGrpConfigValidations",
                                   null, null, function() {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                        Knockback.applyBindings(self.model,
                                                document.getElementById(modalId));
                        kbValidation.bind(self,
                                          {collection:
                                          self.model.model().attributes.rules});
                        kbValidation.bind(self,{collection:
                            self.model.model().attributes.GohanSecRuleDetails});
            }, null, false);
        }
    });

    function getEditSecGrpViewConfig () {
        var prefixId = ctwl.SEC_GRP_PREFIX_ID;
        var secGrpViewConfig = {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_SEC_GRP]),
            title: "Security Group",//permissions
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    placeholder: 'Name',
                                    label: 'Name',
                                    path: 'name',
                                    class: 'col-xs-9',
                                    dataBindValue: 'name'
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    placeholder: 'Description',
                                    label: 'Description',
                                    path: 'description',
                                    class: 'col-xs-9',
                                    dataBindValue: 'description'
                                }
                            }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'GohanSecRuleDetails',
                            view: "FormCollectionView",
                            //view: "FormEditableGridView",
                            viewConfig: {
                                label:"Security Group Rule (s)",
                                path: "GohanSecRuleDetails",
                                class: 'col-xs-12',
                                //validation: 'ruleValidation',
                                templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                                collection: "GohanSecRuleDetails",
                                rows:[{
                                   rowActions: [
                                        {onClick: "function() { $root.addRule(); }",
                                         iconClass: 'fa fa-plus'},
                                         {onClick: "function() { $root.deleteRules($data, this); }",
                                         iconClass: 'fa fa-minus'}
                                   ],
                                columns: [
                                    {
                                        elementId: 'direction',
                                        name: 'Direction',
                                        view: "FormComboboxView",
                                        class: "",
                                        width: 140,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            path: "direction",
                                            dataBindValue: "direction()",
                                            disabled: false,
                                            elementConfig:{
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource: {
                                                    type: 'local',
                                                    data:[{text:'Egress', value:'egress' },
                                                          {text:'Ingress', value:'ingress' }]
                                                   }
                                               }
                                           }
                                       },
                                       {
                                           elementId: 'ethertype',
                                           name: 'Ether Type',
                                           view: "FormComboboxView",
                                           class: "",
                                           width: 140,
                                           viewConfig: {
                                               templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                               path: "ethertype",
                                               dataBindValue: "ethertype()",
                                               disabled: false,
                                               elementConfig:{
                                                   dataTextField: 'text',
                                                   dataValueField: 'value',
                                                   dataSource: {
                                                       type: 'local',
                                                       data:[{text:'IPv4', value:'IPv4' },
                                                             {text:'IPv6', value:'IPv6' }]
                                                      }
                                                  }
                                              }
                                          },
                                       {
                                        elementId: 'protocol',
                                        name: 'Protocol',
                                        view: "FormComboboxView",
                                        class: "",
                                        width: 140,
                                        viewConfig: {
                                            templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                            path: "protocol",
                                            dataBindValue: "protocol()",
                                            disabled: false,
                                            elementConfig:{
                                                dataTextField: 'text',
                                                dataValueField: 'value',
                                                dataSource: {
                                                    type: 'local',
                                                    data:[{text:'ANY', value:'any' },
                                                          {text:'TCP', value:'tcp' },
                                                          {text:'UDP', value:'udp' },
                                                          {text:'ICMP', value:'icmp' },
                                                          {text:'ICMP6', value:'icmp6' }
                                                         ]
                                                   }
                                               }
                                           }
                                       },
                                      {
                                          elementId: 'port_range',
                                          name: 'Port Range',
                                          view: "FormInputView",
                                          class: "",
                                          width: 100,
                                          viewConfig: {
                                             disabled: false,
                                             templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                             path: 'port_range',
                                             dataBindValue: 'port_range()'
                                          }
                                       },
                                       {
                                           elementId: 'remote_group_id',
                                           name: 'Remote Group ID',
                                           view: "FormInputView",
                                           class: "",
                                           width: 140,
                                           viewConfig: {
                                              disabled: false,
                                              templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                              path: 'remote_group_id',
                                              dataBindValue: 'remote_group_id()'
                                           }
                                        },
                                        {
                                            elementId: 'remote_ip_prefix',
                                            name: 'Remote IP Prefix',
                                            view: "FormInputView",
                                            class: "",
                                            width: 140,
                                            viewConfig: {
                                               disabled: false,
                                               templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                               path: 'remote_ip_prefix',
                                               dataBindValue: 'remote_ip_prefix()'
                                            }
                                         }
                                  ]
                                }],
                                gridActions: [
                                    {onClick: "function() { addRule(); }",
                                     buttonTitle: ""}
                                ]
                        }
                        }]
                    }
                ]
            }
        }
        return secGrpViewConfig;
    }

    return SecGrpAddView;
});


