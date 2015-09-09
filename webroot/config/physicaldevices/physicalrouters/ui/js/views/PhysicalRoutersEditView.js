/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/physicaldevices/physicalrouters/ui/js/PhysicalRoutersUtils'
], function (_, ContrailView, Knockback, PhysicalRoutersUtils) {
    var pdUtils =  new PhysicalRoutersUtils();
    var self;
    var PhysicalRouterEditView = ContrailView.extend({
        renderAddOVSDBManagedToR: function (options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId});
                self = this;
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
        renderDeletePhysicalRouter: function (options) {
            var textTemplate =
                contrail.getTemplate4Id("prouter-delete-template"),
                elId = 'deletePhysicalRouter',
                checkedRows = options['checkedRows'],
                pRoutersToBeDeleted = {'pRouterName': [], 'elementId': elId},
                prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId;
            self = this;
            pRoutersToBeDeleted['pRouterName'].push(
                checkedRows[0]['pRouterName']);
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'btnName': 'Confirm',
                'body': textTemplate(pRoutersToBeDeleted),
                'onSave': function () {
                self.model.deletePhysicalRouter(options['checkedRows'], {
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
        renderDeletePhysicalRouters : function(options) {
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL);
            self = this;
            var elId = 'deletePhysicalRouter';
            var items = "";
            var rowIdxLen = options['checkedRows'].length;
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID;
            var modalId = 'configure-' + prefixId;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    options['checkedRows'][i]['pRouterName']
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TITLE_PHYSICAL_ROUTERS,
                                        itemId: items}),
                configData = options['configData'];
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deletePhysicalRouter(options['checkedRows'], {
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
                            if(typeObj.action === ctwl.EDIT_ACTION) {
                                self.populateVirtualRouterDetails(self);
                            }
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
                            if(typeObj.action === ctwl.EDIT_ACTION) {
                                self.populateVirtualRouterDetails(self);
                            }
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
                            kbValidation.bind(self);
                        }
                    );

                },
                function(error) {
                }
                );
        },
        virtualRouterDetailsParser : function(result) {
            self.torAgentVrouterDS = [];
            self.tsnVrouterDS = [];
            globalVRoutersMap = {};
            if(result && result['virtual-routers'] &&
                result['virtual-routers'].length > 0) {
                result = result['virtual-routers'];
                for(var i = 0; i < result.length;i++) {
                    var virtualRouter = result[i]['virtual-router'];
                    var vRouterType = (virtualRouter['virtual_router_type'])?
                        virtualRouter['virtual_router_type'][0] : '';
                    vRouterType = (vRouterType != null && vRouterType != '')?
                        vRouterType : 'hypervisor';
                    var vRouterIP =
                        (virtualRouter['virtual_router_ip_address'])?
                        virtualRouter['virtual_router_ip_address'] : '';
                  /*build a map with vrouter name and type to be used
                      in createEditWindow*/
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
            //Update the grids DS with the Vrouter type
            var gridDS =
                 $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                 data("contrailGrid")._dataView.getItems();
            if(gridDS != null) {
                for(var j = 0; j < gridDS.length ; j++) {
                    var pr = gridDS[j];
                    var virtualRouters = pr['virtualRouters'];
                    var displayVRouters = '';
                    if(virtualRouters != null && virtualRouters.length > 0){
                        for (var k = 0; k < virtualRouters.length; k++){
                            var vrdetails =
                                this.getVirtualRouterDetails(virtualRouters[k]);
                            var vrType = vrdetails['type'];
                            var vrString = virtualRouters[k];
                            /*Deduce the type for the prouter
                            If the prouter has a reference to
                                virtual router which is a TSN then it is - OVSDB
                            If the prouter has a reference to virtual router
                                which is a Embedded then it is - VCPE
                            If the prouter has autoconfig enabled then
                                it is - NETCONF
                            Else it is PROUTER*/
                            if(vrType.indexOf('tor-service-node') >= 0){
                                  vrString += ' (ToR Service Node)';
                            }
                            if(vrType.indexOf('tor-agent') >= 0){
                                vrString += ' (ToR Agent)';
                            }
                            if(vrType.indexOf('embedded') >= 0){
                                vrString += ' (Embedded)';
                            }
                            if(k == 0){
                                displayVRouters += vrString;
                            } else {
                                displayVRouters += ', ' + vrString;
                            }
                        }
                    }
                    pr['displayVirtualRouters'] = (displayVRouters == '')?
                        '-' : displayVRouters;
                }
                $('#' + ctwl.PHYSICAL_ROUTERS_GRID_ID).
                    data("contrailGrid")._dataView.setData(gridDS);
            }
        },
        getVirtualRouterDetails : function(vRouterName) {
            return (globalVRoutersMap[vRouterName.trim()])?
                globalVRoutersMap[vRouterName.trim()] : '';
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
                                    value : bgpRouter.uuid});
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
                            self.vnDS.push({text : fqname[2] + ' ' + fqname[0] +
                                ':' + fqname[1] + '',
                                value : data[0]+" "+data[1]+" "+data[2]});
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
        populateVirtualRouterDetails : function(self) {
            var vrType = 'None';
            var virtualRouters = self.model.virtualRouters();
            if(virtualRouters != '-' && virtualRouters.length > 0){
                var selectedVRouters = virtualRouters;
                var torAgentCount = 1, tsnCount = 1;
                $.each(selectedVRouters,function(i,vrouter){
                    var vrname = vrouter.trim();
                    var vrDetails = self.getVirtualRouterDetails(vrname);
                    var vrouterType = vrDetails['type'];
                    var vrIp = vrouter['virtual_router_ip_address'];
                    if(vrouterType == 'embedded'){
                        vrType = 'Embedded';
                        self.model['torAgent' + torAgentCount]('');
                        self.model['tsn' + tsnCount]('');
                    } else if(vrouterType == 'tor-agent'){
                        vrType = 'TOR Agent';
                        self.model['torAgent' + torAgentCount](vrname);
                        torAgentCount++;
                    } else if(vrouterType == 'tor-service-node'){
                        vrType = 'TOR Agent';
                        self.model['tsn' + tsnCount](vrname);
                        tsnCount++;
                    }
                });
            }
            self.model.virtualRouterType(vrType);
        },
        getOVSDBManagedTorViewConfig : function(disableId) {
            return {
                elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        pdUtils.pRouterName(disableId),
                        pdUtils.vendorModelSection(),
                        pdUtils.mgmntIPdataIPSection(),
                        pdUtils.torAgentSection(self.torAgentVrouterDS),
                        pdUtils.tsnSection(self.tsnVrouterDS),
                        pdUtils.snmpMntdChkboxView(),
                        pdUtils.snmpMntdView()
                    ]
                }
            };
        },
        getNetConfManagedTorViewConfig : function(disableId) {
            return {
                elementId: ctwc.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        pdUtils.pRouterName(disableId),
                        pdUtils.vendorModelSection(),
                        {
                            columns: [
                                {
                                    elementId: 'mgmtIP',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "mgmtIP",
                                        dataBindValue: "mgmtIP",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'netConfUserName',
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "netConfUserName",
                                        dataBindValue: "netConfUserName",
                                        class: "span6"
                                    }
                                },
                                {
                                    elementId: 'netConfPasswd',
                                    view: "FormInputView",
                                    viewConfig: {
                                         path: "netConfPasswd",
                                         type: "password",
                                         dataBindValue: "netConfPasswd",
                                         class: "span6"
                                     }
                                 }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'isJunosPortEnabled',
                                    view: "FormCheckboxView",
                                    viewConfig: {
                                        path: "isJunosPortEnabled",
                                        dataBindValue: "isJunosPortEnabled",
                                        class: "span12"
                                    }
                                }
                            ]
                        },
                        pdUtils.svcPortsSection(),
                        pdUtils.snmpMntdChkboxView(),
                        pdUtils.snmpMntdView()
                    ]
                }
            };
        },
        getCPERouterViewConfig : function(disableId) {
            return {
                elementId: ctwc.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        pdUtils.pRouterName(disableId),
                        pdUtils.mgmntIPdataIPSection()
                    ]
                }
            };
        },
        getPhysicalRouterViewConfig : function(disableId){
            return {
                elementId: ctwc.PHYSICAL_ROUTER_PREFIX_ID,
                view: "SectionView",
                viewConfig: {
                    rows: [
                        pdUtils.pRouterName(disableId),
                        pdUtils.vendorModelSection(),
                        pdUtils.mgmntIPdataIPSection(),
                        {
                            columns: [
                                {
                                    elementId: 'bgpGateWay',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: "bgpGateWay",
                                        dataBindValue: "bgpGateWay",
                                        class: "span12",
                                        elementConfig: {
                                            allowClear: true,
                                            dataTextField: "text",
                                            dataValueField: "text",
                                            data : self.bgpDS
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'vns',
                                    view: "FormMultiselectView",
                                    viewConfig: {
                                        path: "vns",
                                        dataBindValue: "vns",
                                        class: "span12",
                                        elementConfig: {
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             data : self.vnDS
                                        }
                                    }
                                }
                            ]
                        },
                        pdUtils.AssociatedVRAccordion(self.torAgentVrouterDS,
                            self.tsnVrouterDS),
                        pdUtils.snmpMntdChkboxView(),
                        pdUtils.snmpMntdView()
                    ]
                }
            };
        }
    });
    return PhysicalRouterEditView;
});

