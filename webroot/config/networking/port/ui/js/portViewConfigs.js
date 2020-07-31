/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_) {
     var portViewConfigs = function() {
         var self = this,
             staticRoutArr = {},
             routingInstance = {},
             healthCheck = {},
             bridgeDomain  = {};

         staticRoutArr.data = [];
         staticRoutArr.data[0] = {'type':'interface-route-tables', 'fields':''
                                 };
         routingInstance.data = [];
         routingInstance.data[0] = {'type':'routing-instances', 'fields':''};

         healthCheck.data = [];
         healthCheck.data[0] = {'type':'service-health-checks', 'fields':''};

         bridgeDomain.data = [];
         bridgeDomain.data[0] =  {'type' : 'bridge-domains', 'fields': ''};
         self.virtualNetworkSection = function(portEditView, portFormatter, mode, isDisable) {
             return {
                 columns: [{
                     elementId: 'virtualNetworkName',
                     view: "FormDropdownView",
                     name: "Networks",
                     viewConfig: {
                         label: 'Networks',
                         disabled: isDisable,
                         path: 'virtualNetworkName',
                         dataBindValue: 'virtualNetworkName',
                         dropdownAutoWidth : false,
                         class: "col-xs-6",
                         elementConfig:{
                             allowClear: true,
                             dataTextField: "text",
                             dataValueField: "value",
                             defaultValueId : 0,
                             dataSource : {
                                 type: "remote",
                                 requestType: "GET",
                                 url: ctwc.get(
                                         ctwc.URL_All_NETWORK_IN_PROJECT,
                                         portEditView.selectedProjectId),
                                 parse: function(result) {
                                     return portFormatter.formatNetworksData(portEditView,
                                         result, mode);
                                 }
                             }
                         }
                     }
                 }, {
                     elementId: 'display_name',
                     name: "Name",
                     view: "FormInputView",
                     viewConfig: {
                         disabled: isDisable,
                         path: 'display_name',
                         label: 'Name',
                         placeholder: 'Port Name',
                         dataBindValue: 'display_name',
                         class: "col-xs-6"
                     }
                 }]
             };
         };

         self.fixedIPCollectionSection = function() {
             return {
                 columns: [{
                 elementId: 'fixedIPCollection',
                 view: "FormEditableGridView",
                 viewConfig: {
                     visible : "subnetGroupVisible()",
                     label:"Fixed IPs",
                     path: "subnetDataSource",
                     class: 'col-xs-12',
                     validation: 'fixedIPValidations',
                     templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                     collection: "fixedIPCollection",
                     userVisible: "userVisible()",
                     columns: [{
                         elementId: 'subnet_uuid',
                         name: "Subnet",
                         view: "FormDropdownView",
                         viewConfig: {
                             visible: "visibleSubnet()",
                             path: 'subnet_uuid',
                             dataBindValue: 'subnet_uuid()',
                             dataBindOptionList : "subnetDataSource()",
                             class: "col-xs-6",
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
                             class: "col-xs-6",
                             width:275,
                             label: 'IP'
                         }
                     }],
                     rowActions: [{
                         onClick: "function() { $root.addFixedIPByIndex($data, this); }",
                         iconClass: 'fa fa-plus',
                     },
                     {
                         onClick:
                         "function() { $root.deleteFixedIP($data, this);}",
                          iconClass: 'fa fa-minus'
                     }],
                     gridActions: [{
                         name:"fixedIPAddBtn",
                         onClick: "function() { addFixedIP(); }",
                          buttonTitle: "",
                     }]
                 }
                 }]
             };
         };

         self.allowedAddressPairColSection = function() {
             return {
                 columns: [{
                 elementId: 'allowedAddressPairCollection',
                 view: 'FormEditableGridView',
                     viewConfig: {
                         label:"Allowed address pair(s)",
                         path: "allowedAddressPairCollection",
                         class: 'col-xs-12',
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
                                 width:200,
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
                                 width:200,
                                 label: 'MAC'
                             }
                         }, {
                             elementId: 'address_mode',
                             view: 'FormDropdownView',
                             name: 'Address Mode',
                             viewConfig: {
                                 path: 'mac',
                                 templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                 dataBindValue: 'address_mode()',
                                 placeholder: 'Select Mode',
                                 width:200,
                                 elementConfig: {
                                     dataTextField: 'text',
                                     dataValueField: 'value',
                                     data: ctwc.AAP_MODE_DATA
                                 }
                             }
                         }],
                         rowActions: [{
                          onClick: "function() { $root.addAAPByIndex($data, this); }",
                         iconClass: 'fa fa-plus',
                         },
                         {
                             onClick:
                             "function() { $root.deleteAAP($data, this);}",
                              iconClass: 'fa fa-minus'
                         }],
                         gridActions: [{
                             onClick: "function() { addAAP(); }",
                             buttonTitle: ""
                         }]
                     }
                 }]
             };
         };

         self.advancedSection = function(isDisable, selectedProjectId,
             portFormatter, portEditView) {
             return {
                 columns: [{
                     elementId: 'advanced_options',
                     view: 'AccordianView',
                     viewConfig : [{
                         elementId: 'advanced',
                         title: 'Advanced Options',
                         view: "SectionView",
                         active:false,
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
                                         class: 'col-xs-6',
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
                                         class: "col-xs-6",
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
                             }, self.fixedIPCollectionSection(),
                             {
                                 columns: [{
                                     elementId: 'staticRoute',
                                     view: 'FormMultiselectView',
                                     name: 'Static Routes',
                                     viewConfig: {
                                         label:'Static Routes',
                                         path: 'staticRoute',
                                         class: 'col-xs-12',
                                         dataBindValue: 'staticRoute',
                                         elementConfig:{
                                             allowClear: true,
                                             placeholder: 'Select Static Routes',
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                             dataSource : {
                                                 type: 'remote',
                                                 requestType: 'post',
                                                 postData: JSON.stringify(staticRoutArr),
                                                 url:'/api/tenants/config/get-config-list',
                                                 parse: function(result) {
                                                     return portFormatter.srDDFormatter(
                                                                          result,
                                                                          isDisable,
                                                                          portEditView);
                                                 }
                                             }
                                         }
                                     }
                                 }]
                             },{
                                 columns: [{
                                     elementId: 'ServiceHealthCheck',
                                     view: 'FormDropdownView',
                                     name: 'Static Routes',
                                     viewConfig: {
                                         label:'Service Health Check',
                                         class: "col-xs-6",
                                         path: 'service_health_check_refs',
                                         dataBindValue: 'service_health_check_refs',
                                         elementConfig:{
                                             allowClear: true,
                                             placeholder: 'Service Health Check',
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             dropdownAutoWidth : false,
                                             dataSource : {
                                                 type: 'remote',
                                                 requestType: 'post',
                                                 postData: JSON.stringify(healthCheck),
                                                 url:'/api/tenants/config/get-config-list',
                                                 parse: function(result) {
                                                     return portFormatter.healthCheckDDFormatter(
                                                                          result,
                                                                          isDisable,
                                                                          portEditView);
                                                 }
                                             }
                                         }
                                     }
                                 },
                                 {
                                     elementId: 'qos_config_refs',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         label: "QoS",
                                         path : 'qos_config_refs',
                                         class: "col-xs-6",
                                         dataBindValue :
                                             'qos_config_refs',
                                         elementConfig : {
                                             placeholder: 'Select QoS',
                                             dataTextField : "text",
                                             dataValueField : "id",
                                             dataSource : {
                                                 type: 'remote',
                                                 requestType: 'POST',
                                                 postData: JSON.stringify({data: [{type: "qos-configs",
                                                     parent_id: selectedProjectId}]}),
                                                 url: ctwc.URL_GET_CONFIG_DETAILS,
                                                 parse: portFormatter.qosDropDownFormatter
                                             }
                                         }
                                     }
                                 }]
                             }, self.allowedAddressPairColSection(),
                             {
                                 columns: [{
                                     elementId: 'local_preference',
                                     name: "Local Preference",
                                     view: "FormInputView",
                                     viewConfig: {
                                         path: 'virtual_machine_interface_properties.local_preference',
                                         label: 'Local Preference',
                                         placeholder: '0 - 4294967295',
                                         dataBindValue: 'virtual_machine_interface_properties().local_preference',
                                         class: "col-xs-6"
                                     }
                                 }, {
                                     elementId: 'bridge_domain_refs',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         class: "col-xs-6",
                                         path: 'bridge_domain_refs',
                                         dataBindValue: 'bridge_domain_refs',
                                         label: 'Bridge Domain',
                                         dataBindOptionList: 'user_created_bridge_domain_list',
                                         elementConfig: {
                                             placeholder: 'Select Bridge Domain',
                                             dataTextField: "text",
                                             dataValueField: "id",
                                             dropdownAutoWidth : false,
                                         }
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
                                             class: 'col-xs-12',
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
                                 view: "FormComboboxView",
                                     viewConfig: {
                                         disabled: isDisable,
                                         visible : "!isVCenter()",
                                         path: 'deviceOwnerValue',
                                         dataBindValue: 'deviceOwnerValue',
                                         class: "col-xs-6",
                                         label: "Device Owner",
                                         elementConfig:{
                                             allowClear: true,
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             dataSource :{
                                                 type: "local",
                                                 data: [
                                                     {"text":"None","value":"none"},
                                                     {"text":"Compute","value":"compute"},
                                                     {"text":"Router","value":"router"}
                                                 ]
                                             }
                                         }
                                     }
                                 },{
                                 elementId: 'virtualMachineValue',
                                 view: "FormComboboxView",
                                 viewConfig: {
                                     path: 'virtualMachineValue',
                                     label: "Compute UUID",
                                     dataBindValue: 'virtualMachineValue',
                                     class: "col-xs-6",
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
                                                                      portEditView);
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
                                     class: "col-xs-6",
                                     visible: "deviceRouterShow()",
                                     elementConfig:{
                                         dataTextField: "text",
                                         dataValueField: "value",
                                         //defaultValueId : 0,
                                         dropdownAutoWidth : false,
                                         dataSource : {
                                            type: 'remote',
                                            url:"/api/tenants/config/list-logical-routers?projUUID="
                                                + selectedProjectId,
                                             parse: function(result) {
                                                 return portFormatter.routerFormater(
                                                                      result,
                                                                      isDisable,
                                                                      portEditView);
                                             }
                                         }
                                     }}
                                 }]
                             },
                             {
                                 columns: [
                                     {
                                         elementId: 'security_logging_object_refs',
                                         view: 'FormMultiselectView',
                                         viewConfig: {
                                             label: 'Security Logging Object(s)',
                                             path: 'security_logging_object_refs',
                                             class: 'col-xs-6',
                                             dataBindValue: 'security_logging_object_refs',
                                             elementConfig: {
                                                 placeholder: 'Select Security Logging Object(s)',
                                                 dataTextField: "text",
                                                 dataValueField: "id",
                                                 separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                                 dataSource : {
                                                     type: "remote",
                                                     requestType: 'post',
                                                     url: ctwc.URL_GET_CONFIG_DETAILS,
                                                     postData: JSON.stringify({data: [{type: "security-logging-objects"}]}),
                                                     parse: ctwu.securityLoggingObjectFormatter
                                                 }
                                              }
                                         }
                                    }]
                             },
                             {
                                 columns: [{
                                 elementId: 'portBindingCollection',
                                 view: 'FormEditableGridView',
                                 viewConfig: {
                                     label:"Port Binding(s)",
                                     path: "portBindingCollection",
                                     class: 'col-xs-12',
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
                                             class: "col-xs-6",
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
                                             class: "col-xs-6",
                                             width:275,
                                             label: 'Value',
                                             disabled: "disablePortBindValue()"
                                         }
                                     }],
                                     rowActions: [{
                                         onClick: "function() { $root.addPortBindingByIndex($data, this); }",
                                         iconClass: 'fa fa-plus',
                                         },
                                         {
                                         onClick:
                                         "function() { $root.deletePortBinding($data, this); }",
                                         iconClass: 'fa fa-minus',
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
                                     elementId: 'virtual_machine_interface_disable_policy',
                                     view: "FormCheckboxView",
                                     viewConfig: {
                                         path: 'virtual_machine_interface_disable_policy',
                                         label: "Packet Mode",
                                         templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                         dataBindValue: 'virtual_machine_interface_disable_policy',
                                         class: "col-xs-6"
                                     }
                                 }]
                             }, {
                                 columns: [{
                                     elementId: 'is_sub_interface',
                                     name: "Sub Interface",
                                     view: "FormCheckboxView",
                                     viewConfig: {
                                         visible : "!isParent()",
                                         disabled: "disable_sub_interface",
                                         path: 'is_sub_interface',
                                         label: "Sub Interface",
                                         templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                         dataBindValue: 'is_sub_interface',
                                         class: "col-xs-6"
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
                                         disabled: isDisable,
                                         path: 'virtual_machine_interface_properties.sub_interface_vlan_tag',
                                         dataBindValue: 'virtual_machine_interface_properties().sub_interface_vlan_tag',
                                         class: "col-xs-6",
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
                                         class: "col-xs-6",
                                         label: "Primary Interface",
                                         dataBindValue: 'subInterfaceVMIValue',
                                         elementConfig:{
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            //defaultValueId : 0,
                                            dropdownAutoWidth : false,
                                            dataSource : {
                                               type: 'remote',
                                               url:"/api/tenants/config/get-virtual-machines-ips?uuid="
                                                   + selectedProjectId,
                                             parse: function(result) {
                                                 return portFormatter.subInterfaceFormatter(
                                                                      result,
                                                                      isDisable,
                                                                      portEditView);
                                             }
                                            }
                                         }
                                     }
                                 }],
                             }, {
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
                                            dropdownAutoWidth : false,
                                            //defaultValueId : 0,
                                            dataSource : {
                                               type: 'remote',
                                               url:"/api/tenants/config/get-virtual-machines-ips?uuid="
                                                   + selectedProjectId,
                                             parse: function(result) {
                                                 return portFormatter.subInterfaceFormatter(
                                                                      result,
                                                                      isDisable,
                                                                      portEditView);
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
                                         class: "col-xs-6"
                                     }
                                 }]
                             },
                             self.mirroringSection(portFormatter, isDisable, portEditView)]
                         }
                     }]
                 }]
             };
         };

         self.mirroringSection = function(portFormatter, isDisable, portEditView) {
             return {
                 columns: [{
                         elementId: 'mirroringOptions',
                         view: "SectionView",
                         viewConfig : {
                             visible: "is_mirror",
                             rows: [{
                                 columns: [{
                                     elementId: 'analyzer_name',
                                     view: "FormInputView",
                                     viewConfig: {
                                         visible: "is_mirror",
                                         class: "col-xs-6",
                                         path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_name',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.analyzer_name',
                                         placeholder: 'Enter Analyzer Name',
                                         label: 'Analyzer Name'
                                     }
                                 }]
                             }, {
                                 columns: [{
                                     elementId: 'user_created_nic_assisted',
                                     view: "FormCheckboxView",
                                     viewConfig: {
                                         visible: "is_mirror",
                                         class: "col-xs-6",
                                         path: 'user_created_nic_assisted',
                                         dataBindValue: 'user_created_nic_assisted',
                                         templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                         label: 'NIC Assisted Mirroring'
                                     }
                                 }, {
                                     elementId: 'nic_assisted_mirroring_vlan',
                                     view: "FormInputView",
                                     viewConfig: {
                                         visible: "is_mirror() && (user_created_nic_assisted() == true)",
                                         class: "col-xs-6",
                                         path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.nic_assisted_mirroring_vlan',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.nic_assisted_mirroring_vlan',
                                         placeholder: 'Enter NIC Assisted VLAN ID',
                                         label: 'NIC Assisted VLAN ID'
                                     }
                                 }]
                             }, {
                                 columns: [{
                                     elementId: 'analyzer_ip_address',
                                     view: "FormInputView",
                                     viewConfig: {
                                         visible: "is_mirror()  && (user_created_nic_assisted() === false)",
                                         class: "col-xs-6",
                                         path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_ip_address',
                                         placeholder: 'xxx.xxx.xxx.xxx',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.analyzer_ip_address',
                                         label: 'Analyzer IP Address'
                                     }
                                 }, {
                                     elementId: 'analyzer_mac_address',
                                     view: "FormInputView",
                                     viewConfig: {
                                         visible: "is_mirror() && (user_created_nic_assisted() === false)",
                                         class: "col-xs-6",
                                         path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.analyzer_mac_address',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.analyzer_mac_address',
                                         placeholder: 'Enter Analyzer MAC',
                                         label: 'Analyzer MAC Address'
                                     }
                                 }]
                             }, {
                                 columns: [{
                                     elementId: 'udp_port',
                                     name: "UDP Port",
                                     view: "FormInputView",
                                     viewConfig: {
                                         visible: "is_mirror() && (user_created_nic_assisted() === false)",
                                         class: "col-xs-6",
                                         path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.udp_port',
                                         placeholder: '1 to 65535',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.udp_port',
                                         label: 'UDP Port'
                                     }
                                 }, {
                                     elementId: 'traffic_direction',
                                     name: "Traffic Direction",
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         class: "col-xs-6",
                                         visible: "is_mirror() && user_created_nic_assisted() === false",
                                         path: 'virtual_machine_interface_properties.interface_mirror.traffic_direction',
                                         dataBindValue: 'virtual_machine_interface_properties().interface_mirror.traffic_direction',
                                         placeholder: 'Direction',
                                         label: 'Direction',
                                         elementConfig: {
                                             placeholder: "Select Direction",
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
                                     elementId: 'user_created_juniper_header',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         visible: "is_mirror() && (user_created_nic_assisted() === false)",
                                         class: "col-xs-6",
                                         path: 'user_created_juniper_header',
                                         dataBindValue: 'user_created_juniper_header',
                                         label: 'Juniper Header',
                                         elementConfig: {
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             data : [
                                                 {'text':'Enabled', 'value':'enabled'},
                                                 {'text':'Disabled', 'value':'disabled'}]
                                         }
                                     }
                                 }, {
                                     elementId: 'mirrorToRoutingInstance',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         visible: "is_mirror() && " +
                                             "(user_created_juniper_header() == 'disabled') &&" +
                                             "(user_created_nic_assisted() === false)",
                                         class: "col-xs-6",
                                         path: 'mirrorToRoutingInstance',
                                         dataBindValue: 'mirrorToRoutingInstance',
                                         label: 'Routing Instance',
                                         elementConfig: {
                                             placeholder: 'Select Routing Instance',
                                             dataTextField: "text",
                                             dataValueField: "value",
                                             dropdownAutoWidth : false,
                                             dataSource : {
                                                 type: 'remote',
                                                 requestType: 'post',
                                                 postData: JSON.stringify(routingInstance),
                                                 url:'/api/tenants/config/get-config-list',
                                                 parse: function(result) {
                                                     return portFormatter.routingInstDDFormatter(
                                                         result, isDisable, portEditView);
                                                 }
                                             }
                                         }
                                     }
                                 }]
                             }, {
                                 columns: [{
                                 elementId: 'mirrorToNHMode',
                                 view: "FormDropdownView",
                                 viewConfig: {
                                     visible: "is_mirror() && (user_created_nic_assisted() === false)",
                                     class: "col-xs-6",
                                     path: 'mirrorToNHMode',
                                     dataBindValue: 'mirrorToNHMode',
                                     placeholder: 'Enter Next Hop Mode',
                                     label: 'Nexthop Mode',
                                     elementConfig: {
                                         placeholder: "Select Direction",
                                         dataTextField: "text",
                                         dataValueField: "value",
                                         data : [
                                             {'text':'Static', 'value':'static'},
                                             {'text':'Dynamic', 'value':'dynamic'}]
                                     }
                                 }
                             }]
                          },{
                              columns:[{
                                  elementId: 'staticNHHeaderSection',
                                  view: "SectionView",
                                  viewConfig: {
                                      visible: "is_mirror() && (mirrorToNHMode() == 'static') && (user_created_nic_assisted() === false)",
                                      rows: [{
                                          columns:[{
                                              elementId: 'vtep_dst_ip_address',
                                              view: "FormInputView",
                                              viewConfig: {
                                                  class: "col-xs-6",
                                                  path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vtep_dst_ip_address',
                                                  placeholder: 'Enter IP Address',
                                                  dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.static_nh_header.vtep_dst_ip_address',
                                                  label: 'VTEP Destination IP Address'
                                              }
                                          }, {
                                              elementId: 'vtep_dst_mac_address',
                                              view: "FormInputView",
                                              viewConfig: {
                                                  class: "col-xs-6",
                                                  path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vtep_dst_mac_address',
                                                  placeholder: 'Enter MAC Address',
                                                  dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.static_nh_header.vtep_dst_mac_address',
                                                  label: 'VTEP Destination MAC Address'
                                              }
                                          }]
                                      },{
                                          columns:[{
                                              elementId: 'vni',
                                              view: "FormInputView",
                                              viewConfig: {
                                                  class: "col-xs-6",
                                                  path: 'virtual_machine_interface_properties.interface_mirror.mirror_to.static_nh_header.vni',
                                                  placeholder: 'Enter VxLAN ID',
                                                  dataBindValue: 'virtual_machine_interface_properties().interface_mirror.mirror_to.static_nh_header.vni',
                                                  label: 'VxLAN ID'
                                              }
                                          }]
                                      }]
                                  }
                              }]
                          }]
                     }
                 }]
             };
         };

         self.dhcpOptionsSection = function() {
             return {
                 columns: [{
                     elementId: 'dhcpOptionsAccordion',
                     view: 'AccordianView',
                     viewConfig : [{
                         elementId: 'dhcpOptions',
                         title: 'DHCP Option(s)',
                         view: "SectionView",
                         active:false,
                         viewConfig : {
                             rows : [{
                                 columns: [{
                                     elementId: 'dhcpOptionCollection',
                                     view: 'FormEditableGridView',
                                     viewConfig: {
                                         path: "dhcpOptionCollection",
                                         class: 'col-xs-12',
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
                                                 width: 200,
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
                                                 width: 300,
                                             }
                                         }, {
                                             elementId: 'dhcp_option_value_bytes',
                                             name: "Value in Bytes",
                                             view: "FormInputView",
                                             viewConfig: {
                                                 path: 'dhcp_option_value_bytes',
                                                 placeholder: 'Option value in bytes',
                                                 templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                 dataBindValue: 'dhcp_option_value_bytes()',
                                                 width: 300,
                                             }
                                         }],
                                         rowActions: [{
                                             onClick: "function() { $root.addDHCPByIndex($data, this); }",
                                             iconClass: 'fa fa-plus',
                                             },
                                             {
                                             onClick:
                                             "function() { $root.deleteDHCP($data, this); }",
                                             iconClass: 'fa fa-minus'
                                         }],
                                         gridActions: [{
                                             onClick: "function() { addDHCP(); }",
                                             buttonTitle: ""
                                         }]
                                     }
                                 }]
                             }]
                         }
                     }]
                 }]
             };
         };

         self.floatingIPSection = function(portEditView, portFormatter) {
             return {
                 columns: [{
                     elementId: 'floatingIpValue',
                     view: 'FormMultiselectView',
                     name: 'floatingIp',
                     viewConfig: {
                         path: 'floatingIpValue',
                         dataBindValue: 'floatingIpValue',
                         class: 'col-xs-12',
                         label:"Floating IPs",
                         elementConfig:{
                             allowClear: true,
                             placeholder: 'Select Floating IPs',
                             dataTextField: "text",
                             dataValueField: "value",
                             dataSource : {
                                 type: 'remote',
                                 url:'/api/tenants/config/floating-ips/' +
                                      portEditView.selectedProjectId,
                                 parse: portFormatter.floatingIPDDFormatter
                             }
                         }
                     }
                 }]
             };
         };

         self.secGrpCheckboxSection = function() {
             return {
                 columns: [{
                         elementId: 'port_security_enabled',
                         view: 'FormCheckboxView',
                         viewConfig: {
                             label: 'Security Group(s)',
                             templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                             path: 'port_security_enabled',
                             class: 'col-xs-12',
                             dataBindValue: 'port_security_enabled'
                         }
                     }
                 ]
             };
         };

         self.securityGroupSection = function(portEditView,
             portFormatter, isDisable) {
             return {
                 columns: [{
                         elementId: 'securityGroupValue',
                         view: 'FormMultiselectView',
                         name: 'SG',
                         viewConfig: {
                             label: '',
                             path: 'securityGroupValue',
                             dataBindValue: 'securityGroupValue',
                             class: 'col-xs-12',
                             disabled : "is_sec_grp_disabled",
                             elementConfig:{
                                 allowClear: true,
                                 dataTextField: "text",
                                 dataValueField: "value",
                                 separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                 dataSource : {
                                     type: 'remote',
                                     url:'/api/tenants/config/securitygroup',
                                     parse: function(result) {
                                         return portFormatter.sgDDFormatter(
                                                              result,
                                                              isDisable,
                                                              portEditView);
                                     }
                                 }
                             }
                         }
                     }
                 ]
             };
         };
     };
     return portViewConfigs;
 });
