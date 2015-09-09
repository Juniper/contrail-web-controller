/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/physicaldevices/interfaces/ui/js/InterfacesUtils'
], function (_, ContrailView, Knockback, InterfacesUtils) {
    var infUtils =  new InterfacesUtils();
    var self, pInterfaceDS = [];
    var prefixId = ctwl.INTERFACE_PREFIX_ID;
    var modalId = 'configure-' + prefixId;
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
            infUtils.infEditView = self;
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
        renderDeleteInterface :  function (options) {
            var textTemplate =
                contrail.getTemplate4Id("inf-delete-template"),
                elId = 'deleteInterface',
                that = this,
                checkedRows = options['checkedRows'],
                infToBeDeleted = {'infName': [], 'elementId': elId},
                prefixId = ctwl.INTERFACE_PREFIX_ID,
                modalId = 'configure-' + prefixId;
            infToBeDeleted['infName'].push(checkedRows[0]['name']);
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'btnName': 'Confirm',
                'body': textTemplate(infToBeDeleted),
                'onSave': function () {
                that.model.deletePhysicalInterface(options['checkedRows'], {
                    init: function () {
                        that.model.showErrorAttr(elId, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(elId, error.responseText);
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
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var elId = 'deleteInterface';
            var items = "";
            var rowIdxLen = options['checkedRows'].length;
            var prefixId = ctwl.INTERFACE_PREFIX_ID;
            var modalId = 'configure-' + prefixId;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    options['checkedRows'][i]['name']
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TITLE_INTERFACES,
                                        itemId: items}),
                configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deletePhysicalInterface(options['checkedRows'], {
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
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(this.model,
                document.getElementById(modalId));
            kbValidation.bind(this);
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
                 self.model.disableParent(true);
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
                    kbValidation.bind(self);
                    self.subscribeDomEvents();
                    if(self.checkedRow != null) {
                        var row = self.checkedRow;
                        if(row != null) {
                            $('#parent_dropdown').data('contrailDropdown').text(
                                row.parent);
                        }
                    }
                }
            );

        },
        subscribeDomEvents : function() {
            $('#name').find('input').bind('blur', function(e) {
                  if(self.model.type() ===
                      ctwl.LOGICAL_INF) {
                      var infName = $('#name').find('input').val().trim();
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
                          physicalInfName = infNameArry[0];
                          self.verifySetSelectedItem(
                              self.setJunosPhysicalInf(physicalInfName),
                              $('#parent_dropdown').data('contrailDropdown'));
                      } else {
                         $('#parent_dropdown').data('contrailDropdown').
                             value(self.dsSrcDest[0].children[1].value);
                      }
                  }
            });
        },
        verifySetSelectedItem : function(selTxt, dropDown) {
            if(!self.isItemExists(selTxt, self.dsSrcDest)) {
                self.addNewItemMainDataSource(selTxt, self.dsSrcDest);
                dropDown.setData(self.dsSrcDest);
                dropDown.text(selTxt);
                self.removeNewItemMainDataSource(selTxt);
            } else {
                dropDown.setData(self.dsSrcDest);
                dropDown.text(selTxt);
            }
        },
        setJunosPhysicalInf : function(inf) {
            var actInf = inf;
            var junosInf = inf + '.0';
            if(self.isItemExists(junosInf, self.dsSrcDest)) {
                actInf = junosInf;
            }
            return actInf;
        },
        addNewItemMainDataSource : function(txt, data) {
            var grpTxt = "Physical Interface"
            for(var i = 0; i < data.length; i++) {
                if(data[i].text === grpTxt) {
                    data[i].children.push(
                        {
                           text : txt,
                           value : txt,
                           parent : grpTxt
                        }
                    );
                    break;
                }
            }
        },
        removeNewItemMainDataSource : function(txt) {
            var grpTxt = "Physical Interface"
            for(var i = 0; i < self.dsSrcDest.length; i++) {
                if(self.dsSrcDest[i].text === grpTxt) {
                    var remItemIndex =
                        self.getIndexOf(self.dsSrcDest[i].children, txt);
                    self.dsSrcDest[i].children.splice(remItemIndex, 1);
                    break;
                }
            }
        },
        getIndexOf : function(arry, txt) {
            for(var i = 0; i < arry.length; i ++) {
                if(arry[i].value === txt) {
                    return i;
                }
            }
            return 0;
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
                            self.checkedRow != null &&
                            self.checkedRow.virtual_network != null &&
                            self.checkedRow.virtual_network != 'none') {
                                self.fetchVirtualNetworkInternals(
                                    self.checkedRow.virtual_network);
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
        fetchVirtualNetworkInternals : function(id) {
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_VN_INTERNALS_INF, id),
                type : 'GET',
                timeout : self.ajaxTimeout
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result){
                    self.processVMIResponse(result);
                    self.renderInfCreateEditPopup();
                },
                function(error){
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
                        if((owner == null || owner == "") &&
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
                                    data:JSON.stringify(vmi)
                                }
                            );
                        }
                    }
                }
            }
        },
        fetchVMIDetails : function(id) {
            var ajaxConfig = {
                url : ctwc.get(ctwc.URL_GET_VN_INTERNALS_INF, id),
                type : 'GET',
                timeout : self.ajaxTimeout
            };
            contrail.ajaxHandler(ajaxConfig, null,
                function(result){
                    self.processVMIResponse(result);
                },
                function(error){

                }
            );
        },
        getMacAddress : function(obj) {
            var mac = '';
            if(obj != null && obj.mac_address != null &&
                obj.mac_address.length > 0) {
                mac = obj.mac_address[0];
            }
            return mac;
        },
        prepareAccordionData : function() {
            var mainDS = [];
            var pRouterDS = [];
            var pRouterDD = self.pRouterSelData;
            var firstItem = {
                text : 'Enter or Select a Interface',
                value : 'dummy', disabled : true
            };
            if(window.inf !== undefined){
                pInterfaceDS = window.inf.pInterfaceDS;
            }
            if(pInterfaceDS.length == 0 ||(pInterfaceDS.length > 0 &&
                pInterfaceDS[0].value != 'dummy')) {
                pInterfaceDS.unshift(firstItem);
            }
            pRouterDS.push(
                {
                    text : 'Select the Router',
                    id : 'dummy',
                    value : 'dummy',
                    disabled : true
                },
                {
                    text : pRouterDD.name,
                    id : pRouterDD.value,
                    value : pRouterDD.value,
                    parent : 'Physical Router'
                }
            );
            mainDS.push(
                {
                    text : 'Physical Router',
                    id : 'physical_router',
                    children : pRouterDS
                },
                {
                    text : 'Physical Interface',
                    id : 'physical_interface',
                    children : pInterfaceDS
                }
            );
            //self.dsSrcDest = $.extend(true, [], mainDS);
            self.dsSrcDest = mainDS ;
            return mainDS;
        },
        getInterfaceConfig : function(disableId) {
            return {
                elementId: ctwl.INTERFACE_PREFIX_ID,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        infUtils.infFixedSection(disableId,
                            self.prepareAccordionData()),
                        infUtils.infVariableSection(disableId,self)
                    ]
                }
            };
        },
        onServerMacChange : function() {
            var ipObj =
                $("#mac_combobox").data('contrailCombobox').getSelectedItem();
            if(typeof ipObj === 'object') {
                if(ipObj.ip != null) {
                    $("#ip").find('input').val(ipObj.ip);
                } else {
                    $("#ip").find('input').val('');
                }
                $("#ip").find('input').attr('disabled','disabled');
                self.model.model().attributes.servers.toJSON()[0].
                    isVMICreate(false);
            } else {
                $("#ip").find('input').val('');
                $("#ip").find('input').removeAttr('disabled');
                self.model.model().attributes.servers.toJSON()[0].
                    ip('');
                self.model.model().attributes.servers.toJSON()[0].
                    isVMICreate(true);
            }
            if($("#ip").find('input').is('[disabled]') &&
                $("#ip").find('input').val() === "") {
                $("#ip").find('input').val(' ');
            }
        }
    });
    return InterfacesEditView;
});