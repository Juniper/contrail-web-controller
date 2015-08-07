/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/physicaldevices/ui/js/PhysicalDevicesUtils'
], function (_, ContrailView, Knockback, PhysicalDevicesUtils) {
    var torAgentVrouterDS, tsnVrouterDS, bgpDS, vnDS;
    var pdUtils =  new PhysicalDevicesUtils();
    var PhysicalRouterEditView = ContrailView.extend({
        renderAddOVSDBManagedToR: function (options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.
                                showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.OVSDB_TYPE);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
           this.fetchVirtualRouters(prefixId, modalId, that,
                                    {type : ctwl.OVSDB_TYPE,
                                    action: ctwl.CREATE_ACTION});
        },
        renderEditOVSDBManagedTor : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                    that.model.model().attributes.uuid}, ctwl.OVSDB_TYPE);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, that,
                {type : ctwl.OVSDB_TYPE, action: ctwl.EDIT_ACTION});
        },
        renderAddNetconfMngdPR : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.NET_CONF_TYPE);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, that,
                {type : ctwl.NET_CONF_TYPE, action: ctwl.CREATE_ACTION});
        },
        renderEditNetconfMngdPR : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId,
                'className': 'modal-700', 'title': options['title'],
                'body': editLayout, 'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        that.model.model().attributes.uuid},
                        ctwl.NET_CONF_TYPE);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, that,
                {type : ctwl.NET_CONF_TYPE, action: ctwl.EDIT_ACTION});
        },
        renderAddCPERouter : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.CPE_ROUTER_TYPE, that);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, that,
                {type : ctwl.CPE_ROUTER_TYPE, action : ctwl.CREATE_ACTION});
        },
        renderEditCPERouter : function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        that.model.model().attributes.uuid},
                    ctwl.CPE_ROUTER_TYPE, that);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchVirtualRouters(prefixId, modalId, that,
                {type : ctwl.CPE_ROUTER_TYPE, action : ctwl.EDIT_ACTION});
        },
        renderAddPhysicalRouter: function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'body': editLayout,
                'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'POST',
                    url : '/api/tenants/config/physical-routers'},
                    ctwl.PHYSICAL_ROUTER_TYPE, that);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchBGPRouters(prefixId, modalId, that,
                {type : ctwl.PHYSICAL_ROUTER_TYPE,
                action : ctwl.CREATE_ACTION});
        },
        renderEditPhysicalRouter: function(options) {
            var prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId,
                editTemplate =
                    contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM);
            var editLayout =
                editTemplate({modalId: modalId, prefixId: prefixId}),
                that = this;
            cowu.createModal({'modalId': modalId,
                'className': 'modal-700',
                'title': options['title'],'body': editLayout,
                'onSave': function () {
                that.model.configPhysicalRouter({
                    init: function () {
                        that.model.showErrorAttr(
                            prefixId + cowc.FORM_SUFFIX_ID, false);
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            that.model.showErrorAttr(
                                prefixId + cowc.FORM_SUFFIX_ID,
                                error.responseText);
                        });
                    }
                }, {type : 'PUT',
                    url : '/api/tenants/config/physical-router/' +
                        that.model.model().attributes.uuid},
                    ctwl.PHYSICAL_ROUTER_TYPE, that);
            }, 'onCancel': function () {
                Knockback.release(that.model, document.getElementById(modalId));
                kbValidation.unbind(that);
                $("#" + modalId).modal('hide');
            }});
            this.fetchBGPRouters(prefixId, modalId, that,
                {type : ctwl.PHYSICAL_ROUTER_TYPE, action : ctwl.EDIT_ACTION});
        },
        renderDeletePhysicalRouter: function (options) {
            var textTemplate =
                contrail.getTemplate4Id("prouter-delete-template"),
                elId = 'deletePhysicalRouter',
                that = this,
                checkedRows = options['checkedRows'],
                pRoutersToBeDeleted = {'pRouterName': [], 'elementId': elId},
                prefixId = ctwl.PHYSICAL_ROUTER_PREFIX_ID,
                modalId = 'configure-' + prefixId;
            pRoutersToBeDeleted['pRouterName'].push(checkedRows['pRouterName']);
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                'title': options['title'], 'btnName': 'Confirm',
                'body': textTemplate(pRoutersToBeDeleted),
                'onSave': function () {
                that.model.deletePhysicalRouter(options['checkedRows'], {
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
        fetchVirtualRouters : function(prefixId, modalId, that, typeObj) {
            contrail.ajaxHandler(
                {url : ctwc.URL_VIRTUAL_ROUTER_DETAILS,type :'GET'}, null,
                function(result){
                    that.virtualRouterDetailsParser(result);
                    var config;
                    var disable = false;
                    if(typeObj.action === "edit") {
                        disable = true;
                    }
                    switch (typeObj.type) {
                        case ctwl.OVSDB_TYPE :
                            config = getOVSDBManagedTorViewConfig(disable);
                            if(typeObj.action === ctwl.EDIT_ACTION) {
                                that.populateVirtualRouterDetails(that);
                            }
                            that.model.virtualRouterType("TOR Agent");
                            break;
                        case ctwl.NET_CONF_TYPE :
                            config = getNetConfManagedTorViewConfig(disable);
                            break;
                        case ctwl.CPE_ROUTER_TYPE :
                            config = getCPERouterViewConfig(disable);
                            break;
                        case ctwl.PHYSICAL_ROUTER_TYPE :
                            config = getPhysicalRouterViewConfig(disable);
                            if(typeObj.action === ctwl.EDIT_ACTION) {
                                that.populateVirtualRouterDetails(that);
                            }
                            break;
                    }
                    that.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        that.model, config, "configureValidation");
                    that.model.showErrorAttr(
                        prefixId + cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(that.model,
                        document.getElementById(modalId));
                    kbValidation.bind(that);
                },
                function(error) {
                }
                );
        },
        virtualRouterDetailsParser : function(result) {
            torAgentVrouterDS = [];
            tsnVrouterDS = [];
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
                            only one prouter so dont include them in the list/*
                        /*TODO: Remove below comment once move the
                            control to combobox from dropdown*/
                        /*if(!virtualRouter['physical_router_back_refs'] ||
                            virtualRouter['physical_router_back_refs'].
                            length < 1) {*/
                            torAgentVrouterDS.push(
                                {text : virtualRouter.fq_name[1],
                                 value : virtualRouter.virtual_router_ip_address
                                }
                            );
                        //}
                    } else if(vRouterType == 'tor-service-node'){
                        tsnVrouterDS.push(
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
        fetchBGPRouters : function(prefixId, modalId, that, typeObj) {
            contrail.ajaxHandler(
                {url : ctwc.URL_BGP_ROUTER_DETAILS,type :'GET'}, null,
                function(result) {
                    bgpDS = [{text : "None", value : "none"}];
                    if(result && result.length > 0) {
                        for(var i = 0; i < result.length;i++) {
                            var bgpRouter = result[i];
                            if(bgpRouter['vendor'] != null &&
                                bgpRouter['vendor'].toLowerCase() !=
                                'contrail'){
                                bgpDS.push({text : bgpRouter.name,
                                    value : bgpRouter.uuid});
                            }
                        }
                    } else {
                        bgpDS.push({text : 'No BGP Router found',
                            value: 'Message'});
                    }
                    that.fetchVNs(prefixId, modalId, that, typeObj);
                },
                function(error) {
                }
            );
        },
        fetchVNs : function(prefixId, modalId, that, typeObj) {
            contrail.ajaxHandler({url : ctwc.URL_VIRTUAL_NETWORK_DETAILS,
                type :'GET'}, null,
                function(result) {
                    vnDS = [];
                    if(result && result['virtual-networks'].length > 0) {
                        var vns = result['virtual-networks'];
                        for(var i = 0; i < vns.length;i++) {
                            var vn = vns[i];
                            var fqname = vn.fq_name;
                            var data = fqname;
                            var val = vn.uuid;
                            vnDS.push({text : fqname[2] + ' ' + fqname[0] +
                                ':' + fqname[1] + '',
                                value : data[0]+" "+data[1]+" "+data[2]});
                        }
                    } else {
                        vnDS.push({text : 'No VN found', value: 'Message'});
                    }
                    that.fetchVirtualRouters(prefixId, modalId, that, typeObj);
                },
                function(error) {
                }
            );
        },
        populateVirtualRouterDetails : function(that) {
            var vrType = 'None';
            var virtualRouters = that.model.virtualRouters();
            if(virtualRouters != '-' && virtualRouters.length > 0){
                var selectedVRouters = virtualRouters;
                var torAgentCount = 1, tsnCount = 1;
                $.each(selectedVRouters,function(i,vrouter){
                    var vrname = vrouter.trim();
                    var vrDetails = that.getVirtualRouterDetails(vrname);
                    var vrouterType = vrDetails['type'];
                    var vrIp = vrouter['virtual_router_ip_address'];
                    if(vrouterType == 'embedded'){
                        vrType = 'Embedded';
                        that.model['torAgent' + torAgentCount]('');
                        that.model['tsn' + tsnCount]('');
                    } else if(vrouterType == 'tor-agent'){
                        vrType = 'TOR Agent';
                        that.model['torAgent' + torAgentCount](vrname);
                        torAgentCount++;
                    } else if(vrouterType == 'tor-service-node'){
                        vrType = 'TOR Agent';
                        that.model['tsn' + tsnCount](vrname);
                        tsnCount++;
                    }
                });
            }
            that.model.virtualRouterType(vrType);
        }
    });
    function getOVSDBManagedTorViewConfig(disableId) {
        return {
            elementId: ctwl.PHYSICAL_ROUTER_PREFIX_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    pdUtils.pRouterName(disableId),
                    pdUtils.vendorModelSection(),
                    pdUtils.mgmntIPdataIPSection(),
                    pdUtils.torAgentSection(torAgentVrouterDS),
                    pdUtils.tsnSection(tsnVrouterDS),
                    pdUtils.snmpMntdChkboxView(),
                    pdUtils.snmpMntdView()
                ]
            }
        };
    };
    function getNetConfManagedTorViewConfig(disableId) {
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
    };
    function getCPERouterViewConfig(disableId) {
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
    };
    function getPhysicalRouterViewConfig(disableId) {
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
                                        data : bgpDS
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
                                         data : vnDS
                                    }
                                }
                            }
                        ]
                    },
                    pdUtils.AssociatedVRAccordion(torAgentVrouterDS,
                        tsnVrouterDS),
                    pdUtils.snmpMntdChkboxView(),
                    pdUtils.snmpMntdView()
                ]
            }
        };
    };
    return PhysicalRouterEditView;
});

