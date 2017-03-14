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
                                 self.model.addSecurityGroupCfg(options['mode'],{
                                     init: function () {
                                         cowu.enableModalLoading(modalId);
                                     },
                                     success: function (model, updatedRules, deletedRules) {
                                      var rules = updatedRules.concat(deletedRules);
                                      if(rules.length != 0){
                                          var rulesLength = rules.length;
                                          var count = 0;
                                          var id = model[Object.keys(model)[0]].id;
                                          var getAjaxs = [];
                                          for(var i = 0; i < rules.length; i++){
                                              var model = {};
                                              model['security_group_rule'] = {};
                                              if(Object.keys(rules[i]).length === 1){
                                                  var ajaxConfigForJson = {
                                                          url: './gohan_contrail/v1.0/tenant/security_groups/'+id+'/security_group_rules/'+rules[i].ruleId,
                                                          type: 'DELETE',
                                                          data: JSON.stringify(model)
                                                 };
                                              }else{
                                                  var ports = rules[i].port_range().split('-');
                                                  var data = {direction: rules[i].direction().toLowerCase(),
                                                              ethertype : rules[i].ethertype(),
                                                              port_range_max : parseInt(ports[1].trim()),
                                                              port_range_min : parseInt(ports[0].trim()),
                                                              protocol :rules[i].protocol().toLowerCase(),
                                                              remote_group_id : rules[i].remote_group_id(),
                                                              remote_ip_prefix : rules[i].remote_ip_prefix()};
                                                   model['security_group_rule'] = data;
                                                  if(rules[i].ruleId() !== ''){
                                                      var ajaxConfigForJson = {
                                                              url: './gohan_contrail/v1.0/tenant/security_groups/'+id+'/security_group_rules/'+rules[i].ruleId(),
                                                              type: 'PUT',
                                                              data: JSON.stringify(model)
                                                     };
                                                  }else{
                                                      var ajaxConfigForJson = {
                                                              url: './gohan_contrail/v1.0/tenant/security_groups/'+id+'/security_group_rules',
                                                              type: 'POST',
                                                              data: JSON.stringify(model)
                                                     };
                                                  }
                                              }
                                              contrail.ajaxHandler(ajaxConfigForJson, null, function(){
                                                    count++;
                                                    if(rulesLength === count){
                                                        options['callback']();
                                                        Knockback.release(self.model, document.getElementById(modalId));
                                                        kbValidation.unbind(self);
                                                        $("#" + modalId).modal('hide');
                                                    }
                                                },function(error){
                                                    contrail.showErrorMsg(error.responseText);
                                                });
                                           }
                                      }else{
                                          options['callback']();
                                          Knockback.release(self.model, document.getElementById(modalId));
                                          kbValidation.unbind(self);
                                          $("#" + modalId).modal('hide');
                                      }
                                     },
                                     error: function (error) {
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
            if(options['mode'] == 'edit'){
                this.model.hideField(true);
            }
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
                                    disabled: 'hideField()',
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


