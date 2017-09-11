/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/physicaldevices/interfaces/ui/js/interfacesConfigTemplates',
    'config/physicaldevices/interfaces/ui/js/interfacesFormatters'
], function (_, ContrailView, Knockback, InterfacesConfigTemplates, InterfacesFormatters) {
    var infConfigTemplates =  new InterfacesConfigTemplates();
    var self;
    var prefixId = ctwl.INTERFACE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
    var infFormatters = new InterfacesFormatters();
    var InterfacesEditView = ContrailView.extend({
        renderAddEditInterface: function (options) {
            var editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
            self = this;
            self.ajaxTimeout = 300000;
            self.interfaceDelimiters;
            self.dsSrcDest = [];
            self.vmiDataSrc = [];
            self.vnDataSrc = [];
            self.mode = options.mode;
            self.checkedRow = options.checkedRow;
            self.vmiDataSourceMap = {};
            infConfigTemplates.infEditView = self;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configInterface({
                    init: function () {
                        self.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.
                                showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, self.getAjaxOpts(options.mode), self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.fetchConfigurations();
        },
        renderDeleteAllInterface :  function (options) {
            var textTemplate =
                contrail.getTemplate4Id("inf-all-delete-template"),
                elId = 'deleteInterface',
                self = this;
                infToBeDeleted = {'pRouterName': [], 'elementId': elId},
                prefixId = ctwl.INTERFACE_PREFIX_ID,
                modalId = 'configure-' + prefixId;
            var data = self.pRouterSelData;
            infToBeDeleted['pRouterName'].push(data['name']);
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'btnName': 'Confirm',
                'body': textTemplate(infToBeDeleted),
                'onSave': function () {
                self.model.deleteAllInterfaces(data, {
                    init: function () {
                        self.model.showErrorAttr(elId, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(elId, error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                document.getElementById(modalId));
            kbValidation.bind(this);
        },
        renderDeleteInterfaces : function(options){
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deletePhysicalInterfaces(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
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
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model, document.getElementById(modalId));
            kbValidation.bind(self);
        },
        getAjaxOpts : function(mode){
            var ajaxOpts = {};
            if(mode === ctwl.CREATE_ACTION) {
               ajaxOpts.type = 'POST';
               ajaxOpts.url = '/api/tenants/config/physical-interfaces/' +
                   self.pRouterSelData.value;
            } else if(mode == ctwl.EDIT_ACTION) {
               ajaxOpts.type = 'PUT';
               ajaxOpts.url = '/api/tenants/config/physical-interface/' +
                   self.pRouterSelData.value;
            }
            return ajaxOpts;
        },
        renderInfCreateEditPopup : function() {
            var config;
            if(self.mode === ctwl.CREATE_ACTION) {
                config = self.getInterfaceConfig(false);
            } else {
                config = self.getInterfaceConfig(true);
            }
            self.renderView4Config(
                $("#" + modalId).find("#" + modalId + "-form"),
                self.model, config, "configureValidation", null, null,
                function(){
                    self.model.showErrorAttr(
                        prefixId + cowc.FORM_SUFFIX_ID, false);
                    self.offChangeEvnt = true;
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    self.offChangeEvnt = false;
                    kbValidation.bind(self,
                        {collection: self.model.model().attributes.servers});
                    //permissions
                    ctwu.bindPermissionsValidation(self);
                    self.subscribeEvents();
                    if(self.checkedRow != null) {
                        var parentName;
                        if(self.checkedRow.type === ctwl.PHYSICAL_INF) {
                            parentName = self.checkedRow.fq_name[1];
                        } else if(self.checkedRow.type === ctwl.LOGICAL_INF) {
                           if(self.checkedRow.parent_type === ctwl.PARENT_TYPE_PROUTER) {
                               parentName = self.checkedRow.fq_name[1];
                           } else {
                               parentName = infFormatters.getActInterfaceName(
                                       getValueByJsonPath(self, "checkedRow;fq_name;2", ""));
                           }
                        }
                        self.model.name(infFormatters.getActInterfaceName(
                                getValueByJsonPath(self, "checkedRow;name", "")));
                        self.model.parent(parentName);
                        self.model.setServerDataSource();
                    }
                }, null, true
            );

        },
        subscribeEvents : function() {
            self.model.__kb.view_model.model().on('change:name',
                function(model, infName) {
                    if(self.model.type() === ctwl.LOGICAL_INF) {
                      var delimiter;
                      for(var i = 0; i < self.interfaceDelimiters.length; i++) {
                          if(infName.indexOf(self.interfaceDelimiters[i]) !==
                              -1) {
                              delimiter = self.interfaceDelimiters[i];
                              break;
                          }
                      }
                      var infNameArry = infName.split(delimiter);
                      var physicalInfName = '';
                      if(infNameArry.length === 2) {
                          self.model.parent_type(ctwl.PARENT_TYPE_PINF);
                          physicalInfName = infNameArry[0];
                              self.model.parent(
                                  self.setJunosPhysicalInf(physicalInfName));
                      } else {
                          self.model.parent_type(ctwl.PARENT_TYPE_PROUTER);
                          self.model.parent('');
                      }
                    }
                }
            );
        },
        setJunosPhysicalInf : function(inf) {
            var actInf = inf;
            var junosInf = inf + '.0';
            if(self.isItemExists(junosInf, self.model.getPhysicalInterfaceData())) {
                actInf = junosInf;
            }
            return actInf;
        },
        isItemExists : function(txt, data) {
            var isThere = false;
            for(var i = 0; i < data.length; i++) {
                if(data[i].children != null) {
                   for(var j = 0; j < data[i].children.length; j++) {
                       if(txt === data[i].children[j].text) {
                           return true;
                       }
                   }
                } else {
                   if(txt === data[i].text) {
                       return true;
                   }
                }
            }
            return isThere;
        },
        fetchConfigurations : function() {
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_INTERFACE_DELIMITERS),
                type : 'GET'
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result) {
                    if(result != null && result['interface_delimiters'] != null
                        && result['interface_delimiters'].length > 0) {
                        self.interfaceDelimiters =
                            result['interface_delimiters'];
                    }
                    self.fetchVirtualNetworks();
                },
                function(error) {
                }
            );
        },
        fetchVirtualNetworks : function() {
            var postData = {};
            postData.data = {fields : ['network_ipam_refs']};
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_VN_INF),
                type : 'POST',
                data : JSON.stringify(postData),
                timeout : self.ajaxTimeout
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result) {
                    self.vnDataSrc = [{text : 'None', value : 'none'}];
                    var data = result.data;
                    if(data != null && data['virtual-networks'] != null &&
                        data['virtual-networks'].length > 0) {
                        var vns =  data['virtual-networks'];
                        if(!result.isList) {
                            for(var i = 0; i < vns.length; i++) {
                                var vn = vns[i]['virtual-network'];
                                var fqn = vn.fq_name;
                                var subnetStr = '';
                                var subnetUUID = '';
                                var field = 'network_ipam_refs';
                                if(field in vn && vn[field].length > 0) {
                                   if(vn[field][0].attr != null &&
                                       vn[field][0].attr.ipam_subnets != null &&
                                       vn[field][0].attr.ipam_subnets.
                                       length > 0) {
                                       subnetUUID = vn[field][0].attr.
                                           ipam_subnets[0].subnet_uuid;
                                   }
                                   for(var k = 0; k < vn[field].length; k++) {
                                    var ipam = vn[field][k];
                                    if(ipam.attr != null &&
                                           ipam.attr.ipam_subnets != null &&
                                           ipam.attr.ipam_subnets.length > 0) {
                                           var ipamRefs =
                                               ipam.attr.ipam_subnets;
                                      for(var j = 0; j < ipamRefs.length; j++) {
                                          if('subnet' in ipamRefs[j]) {
                                              var subnet = ipamRefs[j].subnet;
                                              var cidr = subnet.ip_prefix + '/'
                                                  + subnet.ip_prefix_len;
                                              if(subnetStr === '') {
                                                  subnetStr = cidr;
                                              } else {
                                                  subnetStr += ', ' + cidr;
                                              }
                                          }
                                      }
                                    }
                                   }
                                }
                                var textVN = fqn[2] + " (" + fqn[0] + ":" +
                                    fqn[1] + ")";
                                if(subnetStr != '') {
                                    textVN += ' (' + subnetStr + ')';
                                }
                                var vnData =
                                    {fqName : fqn, subnetId : subnetUUID};
                                self.vnDataSrc.push({ text : textVN,
                                value : vn.uuid,data : JSON.stringify(vnData)});
                            }
                        } else {
                            for(var i = 0; i < vns.length; i++) {
                                var vn = vns[i];
                                var fqn = vn.fq_name;
                                var textVN =
                                    fqn[2] + " (" + fqn[0] + ":" + fqn[1] + ")";
                                var vnData = {fqName : fqn, subnetId : ''};
                                self.vnDataSrc.push({ text : textVN,
                                value : vn.uuid,data : JSON.stringify(vnData)});
                            }
                        }
                        if(self.mode === ctwl.EDIT_ACTION &&
                            self.model.user_created_virtual_network() != null &&
                            self.model.user_created_virtual_network() != 'none') {
                                self.fetchVMIDetails(
                                    self.model.user_created_virtual_network(),
                                    function(){
                                        self.renderInfCreateEditPopup();
                                    }
                                );
                        } else {
                            self.vmiDataSrc = [];
                            self.renderInfCreateEditPopup();
                        }
                    } else {
                        self.vnDataSrc.push({text : 'No Virtual Network found',
                            value : 'empty'});
                    }

                },
                function(error) {
                }
            );
        },
        processVMIResponse : function(result) {
            self.vmiDataSrc = [];
            if(result != null && result.length > 0) {
                for(var i = 0; i < result.length; i++) {
                    if(result[i]['virtual-machine-interface'] != null) {
                        var vmi =
                        result[i]['virtual-machine-interface'];
                        var owner =
                        vmi['virtual_machine_interface_device_owner'];
                        var subInf =
                            vmi["virtual_machine_interface_properties"];
                        if((owner == null || owner == "" ||
                            owner == ctwc.LI_VMI_DEVICE_OWNER) &&
                            (subInf == null || (subInf != null &&
                            subInf["sub_interface_vlan_tag"] == null)))
                            {
                            var txt =
                            self.getMacAddress(vmi.
                            virtual_machine_interface_mac_addresses);
                            var fixedIp =
                            vmi.instance_ip_address != null &&
                            vmi.instance_ip_address.length > 0 ?
                            vmi.instance_ip_address[0] : '';
                            var txtVMI = '';
                            if(fixedIp != '') {
                                txtVMI = txt + ' (' + fixedIp + ')';
                            } else {
                                txtVMI = txt;
                            }
                            self.vmiDataSrc.push(
                                {
                                    text : txtVMI,
                                    value : JSON.stringify(vmi.fq_name),
                                    ip : fixedIp,
                                    uuid : vmi.uuid,
                                    data:JSON.stringify(vmi)
                                }
                            );
                        }
                    }
                }
            }
        },
        fetchVMIDetails : function(id, callback) {
            if($.inArray(id, _.keys(self.vmiDataSourceMap)) !== -1) {
                self.processVMIResponse(self.vmiDataSourceMap[id]);
                if(callback) {
                    callback();
                }
            } else {
                var ajaxConfig = {
                    url : ctwc.get(ctwc.URL_GET_VN_INTERNALS_INF, id),
                    type : 'GET',
                    timeout : self.ajaxTimeout
                };
                contrail.ajaxHandler(ajaxConfig, null,
                    function(result){
                        self.vmiDataSourceMap[id] = result;
                        self.processVMIResponse(result);
                        if(callback){
                            callback();
                        }
                    },
                    function(error){

                    }
                );
            }
        },
        getMacAddress : function(obj) {
            var mac = '';
            if(obj != null && obj.mac_address != null &&
                obj.mac_address.length > 0) {
                mac = obj.mac_address[0];
            }
            return mac;
        },
        getInterfaceConfig : function(disableId) {
            return {
                elementId: ctwl.INTERFACE_PREFIX_ID,
                view: "SectionView",
                title: "Interface",
                viewConfig: {
                    rows: [
                        infConfigTemplates.infFixedSection(disableId,
                            self.model),
                        {
                            columns: [{
                                elementId: 'ethernet_segment_identifier',
                                view: "FormInputView",
                                viewConfig: {
                                    placeholder: 'xx:xx:xx:xx:xx:xx:xx:xx:xx:xx',
                                    visible: 'type() === "physical"',
                                    path: "ethernet_segment_identifier",
                                    dataBindValue: "ethernet_segment_identifier",
                                    class: "col-xs-12"
                                }
                            }]
                        },
                        infConfigTemplates.infVariableSection(disableId, self)
                    ]
                }
            };
        }
    });
    return InterfacesEditView;
});