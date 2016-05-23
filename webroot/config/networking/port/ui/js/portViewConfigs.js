/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_) {
     var portViewConfigs = function() {
         var self = this,
             staticRoutArr = {},
             routingInstance = {},
             healthCheck = {};

         staticRoutArr.data = [];
         staticRoutArr.data[0] = {'type':'interface-route-tables', 'fields':''
                                 };
         routingInstance.data = [];
         routingInstance.data[0] = {'type':'routing-instances', 'fields':''};

         healthCheck.data = [];
         healthCheck.data[0] = {'type':'service-health-checks', 'fields':''};

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
                         class: "span6",
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
                         class: "span6"
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
                             }, self.fixedIPCollectionSection(),
                             {
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
                                 view: "FormComboboxView",
                                     viewConfig: {
                                         disabled: isDisable,
                                         visible : "!isVCenter()",
                                         path: 'deviceOwnerValue',
                                         dataBindValue: 'deviceOwnerValue',
                                         class: "span6",
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
                                     class: "span6",
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
                             } , {
                                 columns: [{
                                 elementId: 'portBindingCollection',
                                 view: 'FormEditableGridView',
                                 viewConfig: {
                                     label:"Port Binding(s)",
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
                                     elementId: 'virtual_machine_interface_disable_policy',
                                     view: "FormCheckboxView",
                                     viewConfig: {
                                         path: 'virtual_machine_interface_disable_policy',
                                         label: "Disable Policy",
                                         templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                         dataBindValue: 'virtual_machine_interface_disable_policy',
                                         class: "span6"
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
                             }, {
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
                             }]
                         }
                     }]
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
                             }]
                         }
                     }]
                 }]
             };
         };

         self.fatFlowSection = function() {
             return {
                 columns: [{
                     elementId: 'fatFlowAccordion',
                     view: 'AccordianView',
                     viewConfig : [{
                         elementId: 'fatFlow',
                         title: 'Fat Flow(s)',
                         view: "SectionView",
                         active:false,
                         viewConfig : {
                             rows : [{
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
                             path: 'securityGroupValue',
                             dataBindValue: 'securityGroupValue',
                             class: 'span12',
                             disabled : "is_sec_grp_disabled",
                             elementConfig:{
                                 allowClear: true,
                                 placeholder: 'Select Security Group(s)',
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
