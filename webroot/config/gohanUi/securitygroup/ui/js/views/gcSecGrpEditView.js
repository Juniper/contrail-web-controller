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

    var SecGrpEditView = ContrailView.extend({
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
                                                          url: ctwc.GOHAN_SEC_GROUP + '/' + id + '/security_group_rules/' + rules[i].ruleId,
                                                          type: 'DELETE',
                                                          data: JSON.stringify(model)
                                                 };
                                              }else{
                                                  var ports = rules[i].port_range().split('-'), remoteIpPrefix = '', remoteGrpId = '';
                                                  var ipPrefix = rules[i].remote_ip_prefix().split(';');
                                                  if(ipPrefix[ipPrefix.length-1] === 'subnet'){
                                                      remoteIpPrefix = ipPrefix[0];
                                                  }else if(ipPrefix[ipPrefix.length-1] === 'security_group'){
                                                      remoteGrpId = ipPrefix[0];
                                                  }
                                                  var data = {direction: rules[i].direction().toLowerCase(),
                                                              ethertype : rules[i].ethertype(),
                                                              port_range_max : parseInt(ports[1].trim()),
                                                              port_range_min : parseInt(ports[0].trim()),
                                                              protocol :rules[i].protocol().toLowerCase(),
                                                              remote_group_id : remoteGrpId ,
                                                              remote_ip_prefix : remoteIpPrefix };
                                                   model['security_group_rule'] = data;
                                                  if(rules[i].ruleId() !== ''){
                                                      var ajaxConfigForJson = {
                                                              url: ctwc.GOHAN_SEC_GROUP + '/' + id + '/security_group_rules/' + rules[i].ruleId(),
                                                              type: 'PUT',
                                                              data: JSON.stringify(model)
                                                     };
                                                  }else{
                                                      var ajaxConfigForJson = {
                                                              url: ctwc.GOHAN_SEC_GROUP + '/' + id + '/security_group_rules',
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
                                                    getAddEditSecGrpViewConfig(options['sgList']),
                                                    "secGrpConfigValidations",
                                                    null, null, function() {
                            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                 document.getElementById(modalId));
                                 kbValidation.bind(self, {collection: self.model.model().attributes.rules});
                                 kbValidation.bind(self,{collection: self.model.model().attributes.GohanSecRuleDetails});
                             }, null, false);
        },
        renderDeleteSecGrps: function(options) {
            var delTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            var delLayout = delTemplate({prefixId: prefixId});
            var selectedGridData = options['selectedGridData'];
            self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'body': delLayout,
                             'btnName': 'Confirm', 'onSave': function () {
                                 self.model.deleteGohanSecurityGroup(selectedGridData[0], {
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

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
            kbValidation.bind(self);
        },
        renderLocationGridPopup: function(options){
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            var obj = {name: 'security_groups', url: 'local_security_groups', key: 'local_security_group'};
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-980',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                                    self.model.configureLocation(obj,
                                      {
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
                                                  self.model.showErrorAttr(
                                                             prefixId + cowc.FORM_SUFFIX_ID,
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

           this.fetchAllData(this ,
                function(allData) {
                  self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, getLocationViewConfig(false, allData),
                        '', null, null, function(){
                            self.model.showErrorAttr(prefixId +
                                    cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                    kbValidation.bind(self,{collection:
                          self.model.model().attributes.LocationDetails});
                        }, null, false);
                   return;
               }
           );
        },
        fetchAllData : function(self, callback) {
            var getAjaxs = [];
            getAjaxs[0] = $.ajax({
                url: ctwc.GOHAN_LOCATION,
                type:"GET"
            });

            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = []
                    var results = arguments;
                    var vns = results[0]["locations"];
                    var allVns = [];
                   if (null !== vns && typeof vns === "object" && vns.length > 0) {
                        for (var i = 0; i < vns.length; i++) {
                            allVns.push({text : vns[i].name,
                                     value : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "location_value",
                                     id : vns[i].id + cowc.DROPDOWN_VALUE_SEPARATOR + "location_value",
                                     parent : "location_value" });
                        }
                    }
                    var addrFields = [];
                    addrFields.push({text : 'Locations', value : 'location_value',
                                   children : allVns});
                    returnArr["addrFields"] = addrFields;
                    callback(returnArr);
                }
            )
        }
    });

    function getEditSecGrpViewConfig (isDisable, sgDataObj) {
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
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Description',
                                    path: 'description',
                                    class: 'col-xs-9',
                                    dataBindValue: 'description',
                                    placeHolder: 'Description'
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return secGrpViewConfig;
    }
    var getLocationViewConfig = function(isDisable, allData) {
        return {
            elementId: cowu.formatElementId(
                            [prefixId, ctwl.TITLE_EDIT_SEC_GRP]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                    columns: [{
                        elementId: 'LocationDetails',
                        view: "FormCollectionView",
                        //view: "FormEditableGridView",
                        viewConfig: {
                            label:"",
                            path: "LocationDetails",
                            class: 'col-xs-12',
                            //validation: 'ruleValidation',
                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                            collection: "LocationDetails",
                            rows:[{
                               rowActions: [
                                  {onClick: "function() { $root.addRule(); }",
                                    iconClass: 'fa fa-plus'},
                                  {onClick:
                                   "function() { $root.deleteRules($data, this); }",
                                    iconClass: 'fa fa-minus'}
                               ],
                            columns: [
                                    {
                                      elementId: 'locationName',
                                      view:
                                          "FormHierarchicalDropdownView",
                                      name: 'Location ID',
                                      width: 220,
                                      class: "",
                                       viewConfig: {
                                          disabled: 'showLocation()',
                                          templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                          path: 'locationName',
                                          dataBindValue: 'locationName()',
                                          elementConfig: {
                                              minimumResultsForSearch : 1,
                                              dataTextField: "text",
                                              dataValueField: "value",
                                              data: allData.addrFields,
                                              queryMap: [
                                              {
                                                  name : 'Locations',
                                                  value : 'location_value'
                                              }]
                                          }
                                      }
                                  },
                                  {
                                      elementId: 'name',
                                      name: 'Name',
                                      view: "FormInputView",
                                      class: "",
                                      width: 220,
                                      viewConfig: {
                                         disabled: 'showLocation()',
                                         templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                         path: 'name',
                                         dataBindValue: 'name()'
                                      }
                                   },
                                  {
                                       elementId: 'description',
                                       name: 'Description',
                                       view: "FormInputView",
                                       class: "",
                                       width: 300,
                                       viewConfig: {
                                          disabled: false,
                                          placeholder: 'Description',
                                          templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                          path: 'description',
                                          dataBindValue: 'description()'
                                       }
                                    },
                                    {
                                        elementId: 'status',
                                        name: 'Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 240,
                                        viewConfig: {
                                           disabled: true,
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'status',
                                           dataBindValue: 'status()'
                                           }
                                    },
                                    {
                                        elementId: 'taskStatus',
                                        name: 'Task Status',
                                        view: "FormInputView",
                                        class: "",
                                        width: 240,
                                        viewConfig: {
                                           disabled: true,
                                           templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                           path: 'taskStatus',
                                           dataBindValue: 'taskStatus()'
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
                }]
            }
        }
    }
    function getAddEditSecGrpViewConfig (sgList) {
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
                                    class: 'col-xs-6',
                                    dataBindValue: 'name'
                                }
                            },
                            {
                                elementId: 'description',
                                view: 'FormInputView',
                                viewConfig: {
                                    placeholder: 'Description',
                                    label: 'Description',
                                    path: 'description',
                                    class: 'col-xs-6',
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
                                           elementId: 'remote_ip_prefix',
                                           view:
                                               "FormHierarchicalDropdownView",
                                           name: 'Address',
                                           class: "",
                                           width: 240,
                                           viewConfig: {
                                               templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                               path: 'remote_ip_prefix',
                                               dataBindValue: 'remote_ip_prefix()',
                                               elementConfig: {
                                                   minimumResultsForSearch : 1,
                                                   width: 230,
                                                   dataTextField: "text",
                                                   dataValueField: "value",
                                                   data: [{text : 'CIDR', value : 'subnet', id :'subnet',
                                                            children :[{text:'Enter a CIDR', value:"-1/0", disabled : true, parent :"subnet", id: "-1/0"}]},
                                                            {text : 'Security Group', value : 'security_group', id : 'security_group', children :sgList}],
                                                   queryMap: [
                                                       {
                                                           name : 'CIDR',
                                                           value : 'subnet',
                                                           iconClass: 'icon-contrail-network-ipam'
                                                       },
                                                       {
                                                           name :'Security Group',
                                                           value : 'security_group',
                                                           iconClass: 'icon-contrail-security-group'
                                                       }
                                                   ]
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

    return SecGrpEditView;
});


