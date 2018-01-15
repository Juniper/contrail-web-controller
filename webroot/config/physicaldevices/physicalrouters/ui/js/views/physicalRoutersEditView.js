/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/physicaldevices/physicalrouters/ui/js/physicalRoutersConfigTemplates'
], function (_, ContrailView, Knockback, PhysicalRoutersConfigTemplates) {
    var pRouterConfigTemplates =  new PhysicalRoutersConfigTemplates();
    var self;
    var PhysicalRouterEditView = ContrailView.extend({
        setGlobalVRoutersMap: function() {
            self.physicalRouterData = {};
            self.physicalRouterData.globalVRoutersMap = {};
            self.model.physicalRouterData = self.physicalRouterData;
        },
        renderAddOVSDBManagedToR: function (options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configPhysicalRouter({
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
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.OVSDB_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
           this.fetchVirtualRouters(prefixId, modalId, self,
                                    {type : ctwl.OVSDB_TYPE,
                                    action: ctwl.CREATE_ACTION});
        },
        renderEditOVSDBManagedTor : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                    self.model.model().attributes.uuid}, ctwl.OVSDB_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, self,
                {type : ctwl.OVSDB_TYPE, action: ctwl.EDIT_ACTION});
        },
        renderAddNetconfMngdPR : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.NET_CONF_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, self,
                {type : ctwl.NET_CONF_TYPE, action: ctwl.CREATE_ACTION});
        },
        renderEditNetconfMngdPR : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId,
                'className': 'modal-700', 'title': options['title'],
                'body': editLayout, 'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        self.model.model().attributes.uuid},
                        ctwl.NET_CONF_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, self,
                {type : ctwl.NET_CONF_TYPE, action: ctwl.EDIT_ACTION});
        },
        renderAddCPERouter : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.CPE_ROUTER_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, self,
                {type : ctwl.CPE_ROUTER_TYPE, action : ctwl.CREATE_ACTION});
        },
        renderEditCPERouter : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        self.model.model().attributes.uuid},
                    ctwl.CPE_ROUTER_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, self,
                {type : ctwl.CPE_ROUTER_TYPE, action : ctwl.EDIT_ACTION});
        },
        renderAddPhysicalRouter: function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.PHYSICAL_ROUTER_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchBGPRouters(prefixId, modalId, self,
                {type : ctwl.PHYSICAL_ROUTER_TYPE,
                action : ctwl.CREATE_ACTION});
        },
        renderEditPhysicalRouter: function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
            self.setGlobalVRoutersMap();
            cowu.createModal({'modalId': modalId,
                'className': 'modal-700',
                'title': options['title'],'body': editLayout,
                'onSave': function () {
                self.model.configPhysicalRouter({
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
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        self.model.model().attributes.uuid},
                    ctwl.PHYSICAL_ROUTER_TYPE, self);
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.fetchBGPRouters(prefixId, modalId, self,
                {type : ctwl.PHYSICAL_ROUTER_TYPE, action : ctwl.EDIT_ACTION});
        },
        renderDeletePhysicalRouters : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId;
            var delTemplate =
                //Fix the template to be common delete template
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deletePhysicalRouters(options['checkedRows'], {
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
        fetchVirtualRouters : function(prefixId, modalId, self, typeObj) {
            contrail.ajaxHandler(
                {url : ctwc.URL_VIRTUAL_ROUTER_DETAILS,type :'GET'}, null,
                function(result){
                    self.virtualRouterDetailsParser(result);
                    var config;
                    var disable = false;
                    if(typeObj.action === "edit") {
                        disable = true;
                    }
                    switch (typeObj.type) {
                        case ctwl.OVSDB_TYPE :
                            config = self.getOVSDBManagedTorViewConfig(disable);
                            /*if(typeObj.action === ctwl.EDIT_ACTION) {
                                self.populateVirtualRouterDetails(self);
                            }*/
                            self.model.virtualRouterType("TOR Agent");
                            break;
                        case ctwl.NET_CONF_TYPE :
                            config =
                                self.getNetConfManagedTorViewConfig(disable);
                            break;
                        case ctwl.CPE_ROUTER_TYPE :
                            config = self.getCPERouterViewConfig(disable);
                            break;
                        case ctwl.PHYSICAL_ROUTER_TYPE :
                            config = self.getPhysicalRouterViewConfig(disable);
                            /*if(typeObj.action === ctwl.EDIT_ACTION) {
                                self.populateVirtualRouterDetails(self);
                            }*/
                            break;
                    }
                    self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, config, "configureValidation", null, null,
                        function(){
                            self.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                document.getElementById(modalId));
                            kbValidation.bind(self,
                                {collection:
                                    self.model.model().attributes.servicePorts});
                            //permissions
                            ctwu.bindPermissionsValidation(self);
                        }, null, true
                    );

                },
                function(error) {
                }
                );
        },
        virtualRouterDetailsParser : function(result) {
            self.torAgentVrouterDS = [];
            self.tsnVrouterDS = [];
            if(result && result['virtual-routers'] &&
                result['virtual-routers'].length > 0) {
                result = result['virtual-routers'];
                for(var i = 0; i < result.length;i++) {
                    var virtualRouter = result[i]['virtual-router'];
                    var vRouterType = null;
                    if(virtualRouter['virtual_router_type'] instanceof Array) {
                        vRouterType = virtualRouter['virtual_router_type'][0];
                    } else {
                        vRouterType = virtualRouter['virtual_router_type']
                    }
                    vRouterType = (vRouterType != null && vRouterType != '')?
                        vRouterType : 'hypervisor';
                    var vRouterIP =
                        (virtualRouter['virtual_router_ip_address'])?
                        virtualRouter['virtual_router_ip_address'] : '';
                  /*build a map with vrouter name and type to be used
                      in createEditPopup*/
                    self.physicalRouterData.
                    globalVRoutersMap[virtualRouter['name']] =
                        {type:vRouterType,ip:vRouterIP};
                    if(vRouterType == 'tor-agent'){
                        /*Tor agent can be assigned to
                            only one prouter so dont include them in the list*/
                        if(!virtualRouter['physical_router_back_refs'] ||
                            virtualRouter['physical_router_back_refs'].
                            length < 1) {
                            self.torAgentVrouterDS.push(
                                {text : virtualRouter.fq_name[1],
                                 value : virtualRouter.virtual_router_ip_address
                                }
                            );
                        }
                    } else if(vRouterType == 'tor-service-node'){
                        self.tsnVrouterDS.push(
                            {text : virtualRouter.fq_name[1],
                             value : virtualRouter.virtual_router_ip_address
                            }
                        );
                    }
                }
            }
        },
        fetchBGPRouters : function(prefixId, modalId, self, typeObj) {
            contrail.ajaxHandler(
                {url : ctwc.URL_BGP_ROUTER_DETAILS,type :'GET'}, null,
                function(result) {
                    self.bgpDS = [{text : "None", value : "none"}];
                    if(result && result.length > 0) {
                        for(var i = 0; i < result.length;i++) {
                            var bgpRouter = result[i];
                            if(bgpRouter['vendor'] != null &&
                                bgpRouter['vendor'].toLowerCase() !=
                                'contrail'){
                                self.bgpDS.push({text : bgpRouter.name,
                                    value : bgpRouter.name + "~" + bgpRouter.uuid});
                            }
                        }
                    } else {
                        self.bgpDS.push({text : 'No BGP Router found',
                            value: 'Message'});
                    }
                    self.fetchVNs(prefixId, modalId, self, typeObj);
                },
                function(error) {
                }
            );
        },
        fetchVNs : function(prefixId, modalId, self, typeObj) {
            contrail.ajaxHandler({url : ctwc.URL_VIRTUAL_NETWORK_DETAILS,
                type :'GET'}, null,
                function(result) {
                    self.vnDS = [];
                    if(result && result['virtual-networks'].length > 0) {
                        var vns = result['virtual-networks'];
                        for(var i = 0; i < vns.length;i++) {
                            var vn = vns[i];
                            var fqname = vn.fq_name;
                            var data = fqname;
                            var val = vn.uuid;
                            self.vnDS.push({text : fqname[2] + ' (' + fqname[0] +
                                ':' + fqname[1] + ')',
                                value : data[0] + ":" + data[1] + ":" + data[2]});
                        }
                    } else {
                        self.vnDS.push({text : 'No VN found', value: 'Message'});
                    }
                    self.fetchVirtualRouters(prefixId, modalId, self, typeObj);
                },
                function(error) {
                }
            );
        },
        getOVSDBManagedTorViewConfig : function(disableId) {
            return {
                elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                title: "OVSDB Managed ToR",
                viewConfig: {
                    rows: [
                        pRouterConfigTemplates.pRouterName(disableId),
                        pRouterConfigTemplates.vendorModelSection(),
                        pRouterConfigTemplates.dataIPLoopIPSection(),
                        pRouterConfigTemplates.torAgentSection(self.torAgentVrouterDS),
                        pRouterConfigTemplates.tsnSection(self.tsnVrouterDS),
                        pRouterConfigTemplates.snmpMntdChkboxView(),
                        pRouterConfigTemplates.snmpMntdView()
                    ]
                }
            };
        },
        getNetConfManagedTorViewConfig : function(disableId) {
            return {
                elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                title: "Netconf Managed Physical Router",
                viewConfig: {
                    rows: [
                        pRouterConfigTemplates.pRouterName(disableId),
                        pRouterConfigTemplates.vendorModelSection(),
                        {
                            columns: [
                                {
                                    elementId: 'netConfUserName',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label : "Netconf Username",
                                        path: "physical_router_user_credentials().username",
                                        dataBindValue: "physical_router_user_credentials().username",
                                        class: "col-xs-6"
                                    }
                                },
                                {
                                    elementId: 'netConfPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                         label : "Netconf Password",
                                         path: "physical_router_user_credentials().password",
                                         type: "password",
                                         dataBindValue: "physical_router_user_credentials().password",
                                         class: "col-xs-6"
                                     }
                                 }
                            ]
                        },
                        {
                            columns: [{
                                elementId: 'physical_router_role',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label : "Role",
                                    path: "physical_router_role",
                                    dataBindValue: "physical_router_role",
                                    dataBindOptionList : "roleDataSource",
                                    class: "col-xs-6",
                                    elementConfig:{
                                        placeholder: 'Select a Role',
                                        dataTextField: "text",
                                        dataValueField: "value"//,
                                        //data : ctwc.PHYSICAL_ROUTER_ROLE_DATA
                                    }
                                }
                            }]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'evpn_peered_tor',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        label : "EVPN Peered TOR",
                                        path: "evpn_peered_tor",
                                        dataBindValue: "evpn_peered_tor",
                                        class: "col-xs-12"
                                    }
                                }
                            ]
                        },
                        {
                            columns : [
                                 {
                                     elementId: 'evpn_tsn_section',
                                     view: "SectionView",
                                     viewConfig: {
                                        visible: "evpn_peered_tor() === true",
                                        rows: [
                                            pRouterConfigTemplates.tsnSection(self.tsnVrouterDS)
                                        ]
                                     }
                                 }
                            ]
                        },
                        pRouterConfigTemplates.svcPortsSection(),
                        pRouterConfigTemplates.snmpMntdChkboxView(),
                        pRouterConfigTemplates.snmpMntdView()
                    ]
                }
            };
        },
        getCPERouterViewConfig : function(disableId) {
            return {
                elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                title: "vCPE Router",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                              {
                                  elementId: 'name',
                                  view: "FormInputView",
                                  viewConfig: {
                                      label: 'Name',
                                      disabled: disableId,
                                      path: "name",
                                      dataBindValue: "name",
                                      class: "col-xs-6"
                                  }
                              },
                              {
                                  elementId: 'physical_router_management_ip',
                                  view: "FormInputView",
                                  viewConfig: {
                                      label : "Management IP",
                                      path: "physical_router_management_ip",
                                      dataBindValue: "physical_router_management_ip",
                                      class: "col-xs-6"
                                  }
                              }
                            ]
                        },
                        pRouterConfigTemplates.dataIPLoopIPSection()
                    ]
                }
            };
        },
        getPhysicalRouterViewConfig : function(disableId){
            return {
                elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                title: "Physical Router",
                viewConfig: {
                    rows: [
                        pRouterConfigTemplates.pRouterName(disableId),
                        pRouterConfigTemplates.vendorModelSection(),
                        pRouterConfigTemplates.dataIPLoopIPSection(),
                        {
                            columns: [
                                {
                                    elementId: 'physical_router_role',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label : "Role",
                                        path: "physical_router_role",
                                        dataBindValue: "physical_router_role",
                                        dataBindOptionList : "roleDataSource",
                                        class: "col-xs-6",
                                        elementConfig:{
                                            placeholder: 'Select a Role',
                                            dataTextField: "text",
                                            dataValueField: "value"//,
                                            //data : ctwc.PHYSICAL_ROUTER_ROLE_DATA
                                        }
                                    }
                                },
                                {
                                    elementId: 'user_created_bgp_router',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label : "BGP Router",
                                        path: "user_created_bgp_router",
                                        dataBindValue: "user_created_bgp_router",
                                        class: "col-xs-6",
                                        elementConfig: {
                                            allowClear: true,
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            data : self.bgpDS
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'user_created_virtual_network',
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        label : "Virtual Networks",
                                        path: "user_created_virtual_network",
                                        dataBindValue: "user_created_virtual_network",
                                        class: "col-xs-12",
                                        elementConfig: {
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                             data : self.vnDS
                                        }
                                    }
                                }
                            ]
                        },
                        pRouterConfigTemplates.AssociatedVRAccordion(self.torAgentVrouterDS,
                            self.tsnVrouterDS),
                        pRouterConfigTemplates.snmpMntdChkboxView(),
                        pRouterConfigTemplates.snmpMntdView()
                    ]
                }
            };
        }
    });
    return PhysicalRouterEditView;
});

