/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'knockback',
    'contrail-view',
    'config/networking/port/ui/js/views/portFormatters'
], function (_, Backbone, ContrailListModel, Knockback, ContrailView,
             portFormatters) {
    var portFormatter = new portFormatters();
    var prefixId = ctwl.PORT_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        editTemplate = contrail.getTemplate4Id(cowc.TMPL_GENERIC_EDIT_FORM),
        self = {};

    var portEditView = ContrailView.extend({
        modalElementId: '#' + modalId,
        renderPortPopup: function (options) {
            var editLayout = editTemplate(
                                {modalId: modalId, prefixId: prefixId});
            self = this;
            cowu.createModal({'modalId': modalId,
                              'className': 'modal-700',
                              'title': options['title'],
                              'body': editLayout,
                              'onSave': function () {
                self.model.configurePorts(options['mode'], allNetworksDS,
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
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

           this.fetchAllData(this ,
                function(allNetworksDS, allNetwork) {
                    var disableElement = false;
                    self.model.setVNData(allNetwork);
                    if(options['mode'] == "add" && allNetworksDS.length > 0) {
                        self.model.virtualNetworkName(allNetworksDS[0].value);
                    }
                    if(options['mode'] == "edit") {
                        disableElement = true;
                    }
                    var selectedVN = self.model.virtualNetworkName();
                    var subnetDS = portFormatter.fixedIpSubnetDDFormatter(
                                             allNetwork, selectedVN);
                    self.model.setSubnetDataSource(subnetDS);
                    if(options['mode'] == "add") {
                        if(subnetDS.length > 0) {
                            self.model.addFixedIP();
                            self.model.subnetGroupVisible(true);
                        } else {
                            self.model.subnetGroupVisible(false);
                        }
                    } else if(options['mode'] == "edit") {
                        if(self.model.security_group_refs().length <= 0) {
                            self.model.is_sec_grp(false);
                        }
                    }
                    self.renderView4Config(
                        $("#" + modalId).find("#" + modalId + "-form"),
                        self.model, self.getConfigureViewConfig
                        (disableElement, allNetworksDS),
                        'portValidations', null, null, function(){
                            if(options['mode'] == "edit") {
                                //remove the add Fixed IP Button
                                //var addbtn = $("#fixedIPCollection").find(".editable-grid-add-link")[0];
                                //if(addbtn != undefined) {
                                //    if(self.model.fixedIPCollection().length >=
                                //       self.model.subnetDataSource.length) {
                                //        $(addbtn).addClass("hide");
                                //    }
                                //}
                            }
                            self.model.showErrorAttr(prefixId +
                                            cowc.FORM_SUFFIX_ID, false);
                            Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                            kbValidation.bind(self,
                                {collection:
                                  self.model.model().attributes.fixedIPCollection}
                                );
                            kbValidation.bind(self,
                                {collection:
                                  self.model.model().attributes.dhcpOptionCollection}
                                );
                            kbValidation.bind(self,
                                {collection:
                                  self.model.model().attributes.allowedAddressPairCollection}
                                );
                            kbValidation.bind(self,
                                {collection:
                                  self.model.model().attributes.fatFlowCollection}
                                );
                            kbValidation.bind(self,
                                {collection:
                                  self.model.model().attributes.portBindingCollection}
                                );
                        }
                   );
                   return;
               }
           );
        },
        renderDeletePort: function (options) {
            var selectedGridData = options['selectedGridData'],
                elId = 'deletePortID';
            var items = "";
            var rowIdxLen = selectedGridData.length;
            for (var i = 0; i < rowIdxLen; i++) {
                items +=
                    selectedGridData[i]["name"];
                if (i < rowIdxLen - 1) {
                    items += ',';
                }
            }
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: ctwl.TEXT_PORT,
                                        itemId: items})
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deletePort(selectedGridData, {
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
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        renderDeleteAllPort: function (options) {
            var elId = 'deleteAllPortID';
            var delTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_DEL),
                self = this;
            var delLayout = delTemplate({prefixId: prefixId,
                                        item: "all port(s)",
                                        itemId:""})
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout, 'onSave': function () {
                self.model.deleteAllPort({
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
            this.model.showErrorAttr(elId, false);
            Knockback.applyBindings(this.model,
                                    document.getElementById(modalId));
            kbValidation.bind(this);
        },
        fetchAllData : function(self, callback) {
            self.fetchAllVirtualNetworks(function (allNetworksDS, allNetwork) {
                callback(allNetworksDS, allNetwork);
            });
        },
        fetchAllVirtualNetworks : function(callback) {
            var selectedValue = ctwu.getGlobalVariable('project').uuid;
            contrail.ajaxHandler({url : ctwc.get(
                                        ctwc.URL_All_NETWORK_IN_PROJECT,
                                        selectedValue) ,type :'GET'},
                                        null,
                function(result){
                    allNetworksDS =
                             portFormatter.networkDDFormatter(result);
                    callback(allNetworksDS, result);
                },
                function(error) {}
            );
        },
        onVNSelectionChanged : function(e, edit) {
            if(!edit) {
                self.model.model().attributes.fixedIPCollection.reset();
                var subnetDS = portFormatter.fixedIpSubnetDDFormatter(
                                         self.model.getVNData(),
                                         e.val);
                if(subnetDS.length > 0) {
                    self.model.setSubnetDataSource(subnetDS);
                    self.model.addFixedIP();
                    self.model.subnetGroupVisible(true);
                } else {
                    self.model.subnetGroupVisible(false);
                }
            }
        },
    getConfigureViewConfig : function(isDisable, allNetworksDS) {
        var selectedProjectVal = ctwu.getGlobalVariable('project').uuid;
        var staticRoutArr = {};
        staticRoutArr.data = [];
        staticRoutArr.data[0] = {'type':'interface-route-tables', 'fields':''};
        var routingInstance = {};
        routingInstance.data = [];
        routingInstance.data[0] = {'type':'routing-instances', 'fields':''};
        return {
            elementId: cowu.formatElementId([prefixId, ctwl.TITLE_EDIT_PORT]),
            view: "SectionView",
            viewConfig:{
            rows: [{
                columns: [{
                    elementId: 'virtualNetworkName',
                    view: "FormDropdownView",
                    name: "Networks",
                    viewConfig: {
                        label: 'Networks',
                        disabled: isDisable,
                        path: 'virtualNetworkName',
                        dataBindValue: 'virtualNetworkName',
                        class: "span6",
                        elementConfig:{
                            allowClear: true,
                            dataTextField: "text",
                            dataValueField: "value",
                            data : allNetworksDS,
                            change : function (e) {
                                self.onVNSelectionChanged(e, isDisable);
                            }

                        }
                    }
                }, {
                    elementId: 'name',
                    name: "Name",
                    view: "FormInputView",
                    viewConfig: {
                        disabled: isDisable,
                        path: 'name',
                        label: 'Name',
                        placeholder: 'Port Name',
                        dataBindValue: 'name',
                        class: "span6"
                    }
                }]
            },{
                columns: [{
                        elementId: 'is_sec_grp',
                        view: 'FormCheckboxView',
                        name: 'is_sec_grp',
                        viewConfig: {
                            label: 'Security Group(s)',
                            templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                            path: 'is_sec_grp',
                            class: 'span12',
                            dataBindValue: 'is_sec_grp'
                        }
                    }
                ]
            },{
                columns: [{
                        elementId: 'securityGroupValue',
                        view: 'FormMultiselectView',
                        name: 'SG',
                        viewConfig: {
                            path: 'securityGroupValue',
                            dataBindValue: 'securityGroupValue',
                            class: 'span12',
                            disabled : "is_sec_grp_disabled",
                            elementConfig:{
                                allowClear: true,
                                placeholder: 'Select Security Group(s)',
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource : {
                                    type: 'remote',
                                    url:'/api/tenants/config/securitygroup',
                                    parse: function(result) {
                                        return portFormatter.sgDDFormatter(
                                                             result,
                                                             isDisable,
                                                             self);
                                    }
                                }
                            }
                        }
                    }
                ]
            },{
                columns: [{
                    elementId: 'floatingIpValue',
                    view: 'FormMultiselectView',
                    name: 'floatingIp',
                    viewConfig: {
                        path: 'floatingIpValue',
                        dataBindValue: 'floatingIpValue',
                        class: 'span12',
                        label:"Floating IPs",
                        elementConfig:{
                            allowClear: true,
                            placeholder: 'Select Floating IPs',
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource : {
                                type: 'remote',
                                url:'/api/tenants/config/floating-ips/' +
                                     selectedProjectVal,
                                parse: portFormatter.floatingIPDDFormatter
                            }
                        }
                    }
                }]
            }, {
                columns: [{
                elementId: 'advanced_options',
                view: 'AccordianView',
                viewConfig : [{
                elementId: 'advanced',
                title: 'Advanced Options',
                view: "SectionView",
                viewConfig : {
                    rows : [{
                        columns: [{
                            elementId: 'macAddress',
                            name: 'MAC Address',
                            view: 'FormInputView',
                            viewConfig: {
                                disabled: isDisable,
                                path: 'macAddress',
                                label: 'MAC Address',
                                class: 'span6',
                                placeholder: 'Specify MAC Address',
                                dataBindValue: 'macAddress'
                            }
                        },{
                    elementId: 'enable',
                    name: "Enable",
                    view: "FormDropdownView",
                    viewConfig: {
                        path: 'id_perms.enable',
                        dataBindValue: 'id_perms().enable',
                        class: "span6",
                        label: 'Admin State',
                        elementConfig:{
                            allowClear: true,
                            dataTextField: "text",
                            dataValueField: "value",
                            data : [
                              {"text":"Up","value":true},
                              {"text":"Down","value":false}
                            ]
                        }
                    }
                }]
                    },{
                        columns: [{
                        elementId: 'fixedIPCollection',
                        view: "FormEditableGridView",
                        viewConfig: {
                            visible : "subnetGroupVisible()",
                            label:"Fixed IPs",
                            path: "subnetDataSource",
                            validation: 'fixedIPValidations',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: "fixedIPCollection",
                            columns: [{
                                elementId: 'subnet_uuid',
                                name: "Subnet",
                                view: "FormDropdownView",
                                viewConfig: {
                                    visible: "visibleSubnet()",
                                    path: 'subnet_uuid',
                                    dataBindValue: 'subnet_uuid()',
                                    dataBindOptionList : "subnetDataSource()",
                                    class: "span6",
                                    label: 'Subnet',
                                    width:275,
                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    elementConfig:{
                                        dataTextField: "text",
                                        dataValueField: "value"
                                    }
                                }
                            }, {
                                elementId: 'fixedIp',
                                name: "IP",
                                view: "FormInputView",
                                viewConfig: {
                                    disabled: "disableFIP()",
                                    path: 'fixedIp',
                                    placeholder: 'Fixed IP',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    dataBindValue: 'fixedIp()',
                                    class: "span6",
                                    width:275,
                                    label: 'IP'
                                }
                            }],
                            rowActions: [{
                                onClick: "function() { $root.addFixedIP(); }",
                                iconClass: 'icon-plus',
                            },
                            {
                                onClick:
                                "function() { $root.deleteFixedIP($data, this);}",
                                 iconClass: 'icon-minus'
                            }],
                            gridActions: [{
                                name:"fixedIPAddBtn",
                                onClick: "function() { addFixedIP(); }",
                                 buttonTitle: "",
                            }]
                        }
                        }]
                    },{
                        columns: [{
                            elementId: 'staticRoute',
                            view: 'FormMultiselectView',
                            name: 'Static Routes',
                            viewConfig: {
                                label:'Static Routes',
                                path: 'staticRoute',
                                dataBindValue: 'staticRoute',
                                elementConfig:{
                                    allowClear: true,
                                    placeholder: 'Select Static Routes',
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    dataSource : {
                                        type: 'remote',
                                        requestType: 'post',
                                        postData: JSON.stringify(staticRoutArr),
                                        url:'/api/tenants/config/get-config-list',
                                        parse: function(result) {
                                            return portFormatter.srDDFormatter(
                                                                 result,
                                                                 isDisable,
                                                                 self);
                                        }
                                    }
                                }
                            }
                        }]
                    }, {
                        columns: [{
                        elementId: 'allowedAddressPairCollection',
                        view: 'FormEditableGridView',
                            viewConfig: {
                                label:"Allowed address pairs",
                                path: "allowedAddressPairCollection",
                                validation: 'allowedAddressPairValidations',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                collection: "allowedAddressPairCollection",
                                columns: [{
                                    elementId: 'ipPrefixVal',
                                    name: "IP",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: 'ipPrefixVal',
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        dataBindValue: 'ipPrefixVal()',
                                        placeholder: 'IP',
                                        width:275,
                                        label: 'IP'
                                    }
                                }, {
                                    elementId: 'mac',
                                    name: "MAC",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: 'mac',
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        dataBindValue: 'mac()',
                                        placeholder: 'MAC',
                                        width:275,
                                        label: 'MAC'
                                    }
                                }],
                                rowActions: [{
                                 onClick: "function() { $root.addAAP(); }",
                                iconClass: 'icon-plus',
                                },
                                {
                                    onClick:
                                    "function() { $root.deleteAAP($data, this);}",
                                     iconClass: 'icon-minus'
                                }],
                                gridActions: [{
                                    onClick: "function() { addAAP(); }",
                                    buttonTitle: ""
                                }]
                            }
                        }]
                    },{
                        columns: [{
                            elementId: 'local_preference',
                            name: "Local Preference",
                            view: "FormInputView",
                            viewConfig: {
                                path: 'virtual_machine_interface_properties.local_preference',
                                label: 'Local Preference',
                                placeholder: '1 - 4294967295',
                                dataBindValue: 'virtual_machine_interface_properties().local_preference',
                                class: ""
                            }
                        }]
                    }, {
                        columns: [
                            {
                                elementId: 'ecmpHashingIncFields',
                                view: 'FormMultiselectView',
                                viewConfig: {
                                    label: 'ECMP Hashing Fields',
                                    path: 'ecmp_hashing_include_fields',
                                    class: 'span12',
                                    dataBindValue:
                                            'ecmp_hashing_include_fields',
                                    elementConfig: {
                                        placeholder: 'Select ECMP Hashing Fields',
                                        dataTextField: "text",
                                        dataValueField: "id",
                                            data: [
                                                {text: 'source-ip',
                                                 id: 'source_ip'},
                                                {text: 'destination-ip',
                                                 id: 'destination_ip'},
                                                {text: 'ip-protocol',
                                                 id: 'ip_protocol'},
                                                {text: 'source-port',
                                                 id: 'source_port'},
                                                {text: 'destination-port',
                                                 id: 'destination_port'}
                                            ]
                                    }
                                }
                            }
                        ]
                    },{
                        columns: [{
                        elementId: 'deviceOwnerValue',
                        name: "Device Owner",
                        view: "FormDropdownView",
                            viewConfig: {
                                visible : "!isVCenter()",
                                path: 'deviceOwnerValue',
                                dataBindValue: 'deviceOwnerValue',
                                class: "span6",
                                label: "Device Owner",
                                elementConfig:{
                                    allowClear: true,
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    data : [
                                        {"text":"None","value":"none"},
                                        {"text":"Compute","value":"compute"},
                                        {"text":"Router","value":"router"}
                                    ]
                                }
                            }
                        },{
                        elementId: 'virtualMachineValue',
                        view: "FormComboboxView",
                        viewConfig: {
                            path: 'virtualMachineValue',
                            label: "Compute UUID",
                            dataBindValue: 'virtualMachineValue',
                            class: "span6",
                            visible: "deviceComputeShow()",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                defaultValueId : 0,
                                dataSource : {
                                    type: 'remote',
                                    url:'/api/tenants/config/listVirtualMachines',
                                    parse: function(result) {
                                        return portFormatter.computeUUIDFormatter(
                                                             result,
                                                             isDisable,
                                                             self);
                                    }
                                }
                            }
                        }
                        },{
                        elementId: 'logicalRouterValue',
                        view: "FormDropdownView",
                        viewConfig: {
                            path: 'logicalRouterValue',
                            label: "Router",
                            dataBindValue: 'logicalRouterValue',
                            class: "span6",
                            visible: "deviceRouterShow()",
                            elementConfig:{
                                dataTextField: "text",
                                dataValueField: "value",
                                //defaultValueId : 0,
                                dataSource : {
                                   type: 'remote',
                                   url:"/api/tenants/config/list-logical-routers?projUUID="
                                       +selectedProjectVal,
                                    parse: function(result) {
                                        return portFormatter.routerFormater(
                                                             result,
                                                             isDisable,
                                                             self);
                                    }
                                }
                            }}
                        }]
                    } , {
                        columns: [{
                        elementId: 'portBindingCollection',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            label:"Port Bindings",
                            path: "portBindingCollection",
                            validation: 'portBindingValidations',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: "portBindingCollection",
                            columns: [{
                                elementId: 'key',
                                name: "Key",
                                view: "FormComboboxView",
                                viewConfig: {
                                    path: 'key',
                                    templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                    dataBindValue: 'key()',
                                    placeholder: 'Key',
                                    class: "span6",
                                    width:275,
                                    label: 'Key',
                                    disabled: "disablePortBindKey()",
                                    elementConfig:{
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        defaultValueId : 0,
                                        dataSource: {
                                            type: 'local',
                                            data: [
                                                {'text':
                                                    'SR-IOV (vnic_type:direct)',
                                                 'value':
                                                     'SR-IOV (vnic_type:direct)'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }, {
                                elementId: 'value',
                                name: "Value",
                                view: "FormInputView",
                                viewConfig: {
                                    path: 'value',
                                    placeholder: 'Value',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    dataBindValue: 'value()',
                                    class: "span6",
                                    width:275,
                                    label: 'Value',
                                    disabled: "disablePortBindValue()"
                                }
                            }],
                            rowActions: [{
                                onClick: "function() { $root.addPortBinding(); }",
                                iconClass: 'icon-plus',
                                },
                                {
                                onClick:
                                "function() { $root.deletePortBinding($data, this); }",
                                iconClass: 'icon-minus',
                                visible : "hideDeleteButtonPortBinding"
                            }],
                            gridActions: [{
                                onClick: "function() { addPortBinding(); }",
                                buttonTitle: ""
                            }]
                        }
                        }]
                    }, {
                        columns: [{
                            elementId: 'is_sub_interface',
                            name: "Sub Interface",
                            view: "FormCheckboxView",
                            viewConfig: {
                                path: 'is_sub_interface',
                                label: "Sub Interface",
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue: 'is_sub_interface',
                                class: "span6"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'sub_interface_vlan_tag',
                            name: "VLAN",
                            view: "FormInputView",
                            visible: "is_sub_interface",
                            viewConfig: {
                                visible: "is_sub_interface",
                                placeholder: 'Specify VLAN',
                                path: 'virtual_machine_interface_properties.sub_interface_vlan_tag',
                                dataBindValue: 'virtual_machine_interface_properties().sub_interface_vlan_tag',
                                class: "span6",
                                label: 'VLAN',
                            }
                        },{
                            elementId: 'subInterfaceVMIValue',
                            name: "Primary Interface",
                            view: "FormDropdownView",
                            visible: "is_sub_interface",
                            viewConfig: {
                                path: 'subInterfaceVMIValue',
                                visible: "is_sub_interface",
                                placeholder: 'Primary Interface',
                                disabled: "disable_sub_interface()",
                                class: "span6",
                                label: "Primary Interface",
                                dataBindValue: 'subInterfaceVMIValue',
                                elementConfig:{
                                   dataTextField: "text",
                                   dataValueField: "value",
                                   //defaultValueId : 0,
                                   dataSource : {
                                      type: 'remote',
                                      url:"/api/tenants/config/get-virtual-machines-ips?uuid="
                                          +selectedProjectVal,
                                    parse: function(result) {
                                        return portFormatter.subInterfaceFormatter(
                                                             result,
                                                             isDisable,
                                                             self);
                                    }
                                   }
                                }
                            }
                        }],

                    },  {
                        columns: [{
                            elementId: 'subInterfaceVMIValue',
                            name: "Primary Interface",
                            view: "FormDropdownView",
                            visible: "is_sub_interface",
                            viewConfig: {
                                path: 'subInterfaceVMIValue',
                                visible: "is_sub_interface",
                                placeholder: 'Primary Interface',
                                disabled: "disable_sub_interface()",
                                label: "Primary Interface",
                                dataBindValue: 'subInterfaceVMIValue',
                                elementConfig:{
                                   dataTextField: "text",
                                   dataValueField: "value",
                                   //defaultValueId : 0,
                                   dataSource : {
                                      type: 'remote',
                                      url:"/api/tenants/config/get-virtual-machines-ips?uuid="
                                          +selectedProjectVal,
                                    parse: function(result) {
                                        return portFormatter.subInterfaceFormatter(
                                                             result,
                                                             isDisable,
                                                             self);
                                    }
                                   }
                                }
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'is_mirror',
                            name: "Enable Port Mirroring",
                            view: "FormCheckboxView",
                            viewConfig: {
                                path: 'is_mirror',
                                label: "Mirroring",
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                dataBindValue: 'is_mirror',
                                class: "span6"
                            }
                        }]
                    }, {
                                        columns: [{
                                            elementId: 'mirrorToTrafficDirection',
                                            name: "Direction",
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                path: 'mirrorToTrafficDirection',
                                                dataBindValue: 'mirrorToTrafficDirection',
                                                placeholder: 'Direction',
                                                label: 'Direction',
                                                visible: "is_mirror",
                                                elementConfig: {
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    data : [
                                                        {'text':'Ingress', 'value':'ingress'},
                                                        {'text':'Egress', 'value':'egress'},
                                                        {'text':'Both', 'value':'both'}
                                                    ]
                                                }
                                            }
                                        }]
                                    }, {
                                        columns: [{
                                            elementId: 'mirrorToAnalyzerName',
                                            name: "Analyzer Name",
                                            view: "FormInputView",
                                            viewConfig: {
                                                path: 'mirrorToAnalyzerName',
                                                dataBindValue: 'mirrorToAnalyzerName',
                                                placeholder: 'Analyzer Name',
                                                label: 'Analyzer Name',
                                                visible: "is_mirror"
                                            }
                                        }]
                                    }, {
                                        columns: [{
                                            elementId: 'mirrorToAnalyzerIpAddress',
                                            name: "Analyzer IP Address",
                                            view: "FormInputView",
                                            viewConfig: {
                                                class: "span6",
                                                path: 'mirrorToAnalyzerIpAddress',
                                                placeholder: 'xxx.xxx.xxx.xxx',
                                                dataBindValue: 'mirrorToAnalyzerIpAddress',
                                                label: 'Analyzer IP Address',
                                                visible: "is_mirror"
                                            }
                                        }, {
                                            elementId: 'mirrorToUdpPort',
                                            name: "UDP Port",
                                            view: "FormInputView",
                                            viewConfig: {
                                                class: "span6",
                                                path: 'mirrorToUdpPort',
                                                placeholder: '1 to 65535',
                                                dataBindValue: 'mirrorToUdpPort',
                                                label: 'UDP Port',
                                                visible: "is_mirror"
                                            }
                                        }]
                                    },{
                                        columns: [{
                                            elementId: 'mirrorToRoutingInstance',
                                            name: "Routing Instance",
                                            view: "FormDropdownView",
                                            viewConfig: {
                                                path: 'mirrorToRoutingInstance',
                                                dataBindValue: 'mirrorToRoutingInstance',
                                                label: 'Routing Instance',
                                                visible: "is_mirror",
                                                elementConfig: {
                                                    placeholder: 'Select Routing Instance',
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    dataSource : {
                                                        type: 'remote',
                                                        requestType: 'post',
                                                        postData: JSON.stringify(routingInstance),
                                                        url:'/api/tenants/config/get-config-list',
                                                        parse: function(result) {
                                                            return portFormatter.routingInstDDFormatter(
                                                                                 result,
                                                                                 isDisable,
                                                                                 self);
                                                        }
                                                    }
                                                }
                                            }
                                        }]
                                    }]
                    }
                }]
                }]
            },
            {
                        columns: [{
                            elementId: 'dhcpOptionsAccordion',
                            view: 'AccordianView',
                            viewConfig : [{
                                elementId: 'dhcpOptions',
                                title: 'DHCP Options',
                                view: "SectionView",
                                viewConfig : {
                                    rows : [
            {
                        columns: [{
                        elementId: 'dhcpOptionCollection',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            path: "dhcpOptionCollection",
                            validation: 'dhcpValidations',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: "dhcpOptionCollection",
                            columns: [{
                                elementId: 'dhcp_option_name',
                                name: "Code",
                                view: "FormInputView",
                                viewConfig: {
                                    path: 'dhcp_option_name',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    dataBindValue: 'dhcp_option_name()',
                                    placeholder: 'Option code',
                                    class: "span6",
                                    width:275,
                                    label: 'Code'
                                }
                            }, {
                                elementId: 'dhcp_option_value',
                                name: "Value",
                                view: "FormInputView",
                                viewConfig: {
                                    path: 'dhcp_option_value',
                                    placeholder: 'Option value',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    dataBindValue: 'dhcp_option_value()',
                                    class: "span6",
                                    width:275,
                                    label: 'Value'
                                }
                            }],
                            rowActions: [{
                                onClick: "function() { $root.addDHCP(); }",
                                iconClass: 'icon-plus',
                                },
                                {
                                onClick:
                                "function() { $root.deleteDHCP($data, this); }",
                                iconClass: 'icon-minus'
                            }],
                            gridActions: [{
                                onClick: "function() { addDHCP(); }",
                                buttonTitle: ""
                            }]
                        }
                        }]
                    }
                                    ]
                                }
                            }]
                        }]
            },
                        {
                        columns: [{
                            elementId: 'fatFlowAccordion',
                            view: 'AccordianView',
                            viewConfig : [{
                                elementId: 'fatFlow',
                                title: 'Fat Flows',
                                view: "SectionView",
                                viewConfig : {
                                    rows : [
                                    {
                        columns: [{
                        elementId: 'fatFlowCollection',
                        view: 'FormEditableGridView',
                        viewConfig: {
                            path: "fatFlowCollection",
                            validation: 'fatFlowValidations',
                            templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                            collection: "fatFlowCollection",
                            columns: [{
                                elementId: 'protocol',
                                name: "Protocol",
                                view: "FormDropdownView",
                                viewConfig: {
                                    path: 'protocol',
                                    templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                    dataBindValue: 'protocol()',
                                    placeholder: 'Protocol',
                                    class: "span6",
                                    width:275,
                                    label: 'Protocol',
                                    elementConfig:{
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        data : [
                                            {'text':'TCP','value':'tcp'},
                                            {'text':'UDP','value':'udp'},
                                            {'text':'SCTP','value':'sctp'},
                                            {'text':'ICMP','value':'icmp'}
                                        ]
                                    }
                                }
                            }, {
                                elementId: 'port',
                                name: "Port",
                                view: "FormInputView",
                                viewConfig: {
                                    path: 'port',
                                    placeholder: '1 to 65535',
                                    templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                    dataBindValue: 'port()',
                                    disabled: "disablePort()",
                                    class: "span6",
                                    width:275,
                                    label: 'Value'
                                }
                            }],
                            rowActions: [{
                                onClick: "function() { $root.addFatFlow(); }",
                                iconClass: 'icon-plus',
                                },
                                {
                                onClick:
                                "function() { $root.deleteFatFlow($data, this); }",
                                iconClass: 'icon-minus'
                            }],
                            gridActions: [{
                                onClick: "function() { addFatFlow(); }",
                                buttonTitle: ""
                            }]
                        }
                        }]
                    }]
                    }
                }]
            }]
            }]
        }
        }
    }
    });
    return portEditView;
});
