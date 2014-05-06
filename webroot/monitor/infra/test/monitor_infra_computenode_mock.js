/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
function InfraComputeMockData() {
    var mockData = {
        //parsevRoutersDashboardData mock input
        'getStatusesForAllvRouterProcesses' : {
            input: {
				    'PROCESS_STATE_LIST' : [ {
					"process_name" : "contrail-vrouter",
					"process_state" : "PROCESS_STATE_RUNNING",
					"last_stop_time" : null,
					"start_count" : 1,
					"core_file_list" : [],
					"last_start_time" : "1391578930317483",
					"stop_count" : 0,
					"last_exit_time" : null,
					"exit_count" : 0
				}, {
					"process_name" : "contrail-vrouter-nodemgr",
					"process_state" : "PROCESS_STATE_RUNNING",
					"last_stop_time" : null,
					"start_count" : 1,
					"core_file_list" : [],
					"last_start_time" : "1391578924926353",
					"stop_count" : 0,
					"last_exit_time" : null,
					"exit_count" : 0
				}, {
					"process_name" : "openstack-nova-compute",
					"process_state" : "PROCESS_STATE_RUNNING",
					"last_stop_time" : null,
					"start_count" : 1,
					"core_file_list" : [],
					"last_start_time" : "1391578928312701",
					"stop_count" : 0,
					"last_exit_time" : null,
					"exit_count" : 0
				} ]
            },
			output: {
				'PROCESS_STATE_LIST':{
				"contrail-vrouter" : "Up since 4d 9h 28m",
				"contrail-vrouter-nodemgr" : "Up since 4d 9h 28m",
				"openstack-nova-compute" : "Up since 4d 9h 28m"
				}
			}
        },
        'parseInterfaceData' : {
        	input:{
        		'test1' : [ {
					"ItfResp" : {
						"itf_list" : {
							"list" : {
								"ItfSandeshData" : [
										{
											"index" : "2",
											"name" : "p6p0p0",
											"uuid" : "00000000-0000-0000-0000-000000000000",
											"vrf_name" : "default-domain:default-project:ip-fabric:__default__",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "eth",
											"label" : "-1",
											"vn_name" : {},
											"vm_uuid" : {},
											"vm_name" : {},
											"ip_addr" : {},
											"mac_addr" : {},
											"policy" : {},
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : {},
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "6",
											"fabric_port" : {},
											"alloc_linklocal_ip" : {},
											"analyzer_name" : {},
											"config_name" : {},
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "-1",
											"vxlan_id" : "0",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : {}
										},
										{
											"index" : "5",
											"name" : "tap03c3a2dc-03",
											"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "20",
											"vn_name" : "default-domain:admin:svc-vn-mgmt",
											"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
											"vm_name" : "si1_1",
											"ip_addr" : "250.250.1.253",
											"mac_addr" : "02:03:c3:a2:dc:03",
											"policy" : "Disable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.3.5",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "28",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "21",
											"vxlan_id" : "6",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										},
										{
											"index" : "4",
											"name" : "tap11a333ab-7b",
											"uuid" : "11a333ab-7bae-4847-8d4e-2074405b463b",
											"vrf_name" : "default-domain:admin:vn2:vn2",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "18",
											"vn_name" : "default-domain:admin:vn2",
											"vm_uuid" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2",
											"vm_name" : "vn2-inst",
											"ip_addr" : "10.10.11.253",
											"mac_addr" : "02:11:a3:33:ab:7b",
											"policy" : "Enable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.2.4",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "27",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2:11a333ab-7bae-4847-8d4e-2074405b463b",
											"sg_uuid_list" : {
												"list" : {
													"VmIntfSgUuid" : {
														"sg_uuid" : "aec99075-9db2-457b-86c4-3d192706acb2"
													}
												}
											},
											"l2_label" : "19",
											"vxlan_id" : "5",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										},
										{
											"index" : "7",
											"name" : "tap89d09476-c9",
											"uuid" : "89d09476-c921-47d6-8608-393650050004",
											"vrf_name" : "default-domain:admin:vn1:vn1",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "24",
											"vn_name" : "default-domain:admin:vn1",
											"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
											"vm_name" : "si1_1",
											"ip_addr" : "10.10.10.252",
											"mac_addr" : "02:89:d0:94:76:c9",
											"policy" : "Enable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.1.7",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "30",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:89d09476-c921-47d6-8608-393650050004",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "25",
											"vxlan_id" : "4",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										},
										{
											"index" : "6",
											"name" : "tape682e530-83",
											"uuid" : "e682e530-83e6-4c3d-8150-4def49be69f6",
											"vrf_name" : "default-domain:admin:vn2:vn2",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "22",
											"vn_name" : "default-domain:admin:vn2",
											"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
											"vm_name" : "si1_1",
											"ip_addr" : "10.10.11.252",
											"mac_addr" : "02:e6:82:e5:30:83",
											"policy" : "Enable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.2.6",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "29",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:e682e530-83e6-4c3d-8150-4def49be69f6",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "23",
											"vxlan_id" : "5",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										},
										{
											"index" : "3",
											"name" : "tapf7aa3b70-24",
											"uuid" : "f7aa3b70-240b-4a8b-905e-49f4b2079895",
											"vrf_name" : "default-domain:admin:vn1:vn1",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "16",
											"vn_name" : "default-domain:admin:vn1",
											"vm_uuid" : "4be3f887-762c-43e8-92ba-fc87bbe2806f",
											"vm_name" : "vn1-inst",
											"ip_addr" : "10.10.10.253",
											"mac_addr" : "02:f7:aa:3b:70:24",
											"policy" : "Enable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.1.3",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "26",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "4be3f887-762c-43e8-92ba-fc87bbe2806f:f7aa3b70-240b-4a8b-905e-49f4b2079895",
											"sg_uuid_list" : {
												"list" : {
													"VmIntfSgUuid" : {
														"sg_uuid" : "aec99075-9db2-457b-86c4-3d192706acb2"
													}
												}
											},
											"l2_label" : "17",
											"vxlan_id" : "4",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										},
										{
											"index" : "1",
											"name" : "vhost0",
											"uuid" : "00000000-0000-0000-0000-000000000000",
											"vrf_name" : "default-domain:default-project:ip-fabric:__default__",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vhost",
											"label" : "-1",
											"vn_name" : {},
											"vm_uuid" : {},
											"vm_name" : {},
											"ip_addr" : {},
											"mac_addr" : {},
											"policy" : {},
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : {},
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "10",
											"fabric_port" : {},
											"alloc_linklocal_ip" : {},
											"analyzer_name" : {},
											"config_name" : {},
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "-1",
											"vxlan_id" : "0",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Inactive",
											"vm_project_uuid" : {}
										},
										{
											"index" : "0",
											"name" : "pkt0",
											"uuid" : "00000000-0000-0000-0000-000000000000",
											"vrf_name" : "--ERROR--",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "pkt",
											"label" : "-1",
											"vn_name" : {},
											"vm_uuid" : {},
											"vm_name" : {},
											"ip_addr" : {},
											"mac_addr" : {},
											"policy" : {},
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : {},
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "11",
											"fabric_port" : {},
											"alloc_linklocal_ip" : {},
											"analyzer_name" : {},
											"config_name" : {},
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "-1",
											"vxlan_id" : "0",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : {}
										} ]
							}
						},
						"more" : "false"
					}
				} ],
				'test2' : [{
					"ItfResp" : {
						"itf_list" : {
							"list" : {
								"ItfSandeshData" : [
										{
											"index" : "5",
											"name" : "tap03c3a2dc-03",
											"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "20",
											"vn_name" : "default-domain:admin:svc-vn-mgmt",
											"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
											"vm_name" : "si1_1",
											"ip_addr" : "250.250.1.253",
											"mac_addr" : "02:03:c3:a2:dc:03",
											"policy" : "Disable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.3.5",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "28",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "21",
											"vxlan_id" : "6",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										}
										]
							}
						},
						"more" : "false"
					}
				} ],
				'test3' : [{
					"ItfResp" : {
						"itf_list" : {
							"list" : {
								"ItfSandeshData" : [
										{
											"index" : "5",
											"name" : "tap03c3a2dc-03",
											"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "20",
											"vn_name" : {},
											"vm_uuid" : {},
											"vm_name" : {},
											"ip_addr" : "250.250.1.253",
											"mac_addr" : "02:03:c3:a2:dc:03",
											"policy" : "Disable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.3.5",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "28",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "21",
											"vxlan_id" : "6",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										}
										]
							}
						},
						"more" : "false"
					}
				} ],
		        'test4' : [{
					"ItfResp" : {
						"itf_list" : {
							"list" : {
								"ItfSandeshData" : [
										{
											"index" : "5",
											"name" : "tap03c3a2dc-03",
											"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
											"active" : "Active",
											"dhcp_service" : "Enable",
											"dns_service" : "Enable",
											"type" : "vport",
											"label" : "20",
											"ip_addr" : "250.250.1.253",
											"mac_addr" : "02:03:c3:a2:dc:03",
											"policy" : "Disable",
											"fip_list" : {
												"list" : {}
											},
											"mdata_ip_addr" : "169.254.3.5",
											"service_vlan_list" : {
												"list" : {}
											},
											"os_ifindex" : "28",
											"fabric_port" : "NotFabricPort",
											"alloc_linklocal_ip" : "LL-Enable",
											"analyzer_name" : {},
											"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
											"sg_uuid_list" : {
												"list" : {}
											},
											"l2_label" : "21",
											"vxlan_id" : "6",
											"static_route_list" : {
												"list" : {}
											},
											"l2_active" : "L2 Active",
											"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143"
										}
										]
							}
						},
						"more" : "false"
					}
				} ]
        	},
	        	output :{
	        		'test1' : [{
						"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
						"name" : "tap03c3a2dc-03",
						"label" : "20",
						"active" : "Active",
						"vn_name" : "default-domain:admin:svc-vn-mgmt",
						"disp_vn_name" : "svc-vn-mgmt (admin)",
						"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
						"vm_name" : "si1_1",
						"disp_vm_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8 / si1_1",
						"ip_addr" : "250.250.1.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "5",
							"name" : "tap03c3a2dc-03",
							"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "20",
							"vn_name" : "default-domain:admin:svc-vn-mgmt",
							"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
							"vm_name" : "si1_1",
							"ip_addr" : "250.250.1.253",
							"mac_addr" : "02:03:c3:a2:dc:03",
							"policy" : "Disable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.3.5",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "28",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "21",
							"vxlan_id" : "6",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					},
					{
						"uuid" : "11a333ab-7bae-4847-8d4e-2074405b463b",
						"name" : "tap11a333ab-7b",
						"label" : "18",
						"active" : "Active",
						"vn_name" : "default-domain:admin:vn2",
						"disp_vn_name" : "vn2 (admin)",
						"vm_uuid" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2",
						"vm_name" : "vn2-inst",
						"disp_vm_name" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2 / vn2-inst",
						"ip_addr" : "10.10.11.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "4",
							"name" : "tap11a333ab-7b",
							"uuid" : "11a333ab-7bae-4847-8d4e-2074405b463b",
							"vrf_name" : "default-domain:admin:vn2:vn2",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "18",
							"vn_name" : "default-domain:admin:vn2",
							"vm_uuid" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2",
							"vm_name" : "vn2-inst",
							"ip_addr" : "10.10.11.253",
							"mac_addr" : "02:11:a3:33:ab:7b",
							"policy" : "Enable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.2.4",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "27",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "e7aa132d-8b15-4e65-9b10-7c1b920c67e2:11a333ab-7bae-4847-8d4e-2074405b463b",
							"sg_uuid_list" : {
								"list" : {
									"VmIntfSgUuid" : {
										"sg_uuid" : "aec99075-9db2-457b-86c4-3d192706acb2"
									}
								}
							},
							"l2_label" : "19",
							"vxlan_id" : "5",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					},
					{
						"uuid" : "89d09476-c921-47d6-8608-393650050004",
						"name" : "tap89d09476-c9",
						"label" : "24",
						"active" : "Active",
						"vn_name" : "default-domain:admin:vn1",
						"disp_vn_name" : "vn1 (admin)",
						"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
						"vm_name" : "si1_1",
						"disp_vm_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8 / si1_1",
						"ip_addr" : "10.10.10.252",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "7",
							"name" : "tap89d09476-c9",
							"uuid" : "89d09476-c921-47d6-8608-393650050004",
							"vrf_name" : "default-domain:admin:vn1:vn1",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "24",
							"vn_name" : "default-domain:admin:vn1",
							"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
							"vm_name" : "si1_1",
							"ip_addr" : "10.10.10.252",
							"mac_addr" : "02:89:d0:94:76:c9",
							"policy" : "Enable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.1.7",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "30",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:89d09476-c921-47d6-8608-393650050004",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "25",
							"vxlan_id" : "4",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					},
					{
						"uuid" : "e682e530-83e6-4c3d-8150-4def49be69f6",
						"name" : "tape682e530-83",
						"label" : "22",
						"active" : "Active",
						"vn_name" : "default-domain:admin:vn2",
						"disp_vn_name" : "vn2 (admin)",
						"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
						"vm_name" : "si1_1",
						"disp_vm_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8 / si1_1",
						"ip_addr" : "10.10.11.252",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "6",
							"name" : "tape682e530-83",
							"uuid" : "e682e530-83e6-4c3d-8150-4def49be69f6",
							"vrf_name" : "default-domain:admin:vn2:vn2",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "22",
							"vn_name" : "default-domain:admin:vn2",
							"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
							"vm_name" : "si1_1",
							"ip_addr" : "10.10.11.252",
							"mac_addr" : "02:e6:82:e5:30:83",
							"policy" : "Enable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.2.6",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "29",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:e682e530-83e6-4c3d-8150-4def49be69f6",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "23",
							"vxlan_id" : "5",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					},
					{
						"uuid" : "f7aa3b70-240b-4a8b-905e-49f4b2079895",
						"name" : "tapf7aa3b70-24",
						"label" : "16",
						"active" : "Active",
						"vn_name" : "default-domain:admin:vn1",
						"disp_vn_name" : "vn1 (admin)",
						"vm_uuid" : "4be3f887-762c-43e8-92ba-fc87bbe2806f",
						"vm_name" : "vn1-inst",
						"disp_vm_name" : "4be3f887-762c-43e8-92ba-fc87bbe2806f / vn1-inst",
						"ip_addr" : "10.10.10.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "3",
							"name" : "tapf7aa3b70-24",
							"uuid" : "f7aa3b70-240b-4a8b-905e-49f4b2079895",
							"vrf_name" : "default-domain:admin:vn1:vn1",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "16",
							"vn_name" : "default-domain:admin:vn1",
							"vm_uuid" : "4be3f887-762c-43e8-92ba-fc87bbe2806f",
							"vm_name" : "vn1-inst",
							"ip_addr" : "10.10.10.253",
							"mac_addr" : "02:f7:aa:3b:70:24",
							"policy" : "Enable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.1.3",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "26",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "4be3f887-762c-43e8-92ba-fc87bbe2806f:f7aa3b70-240b-4a8b-905e-49f4b2079895",
							"sg_uuid_list" : {
								"list" : {
									"VmIntfSgUuid" : {
										"sg_uuid" : "aec99075-9db2-457b-86c4-3d192706acb2"
									}
								}
							},
							"l2_label" : "17",
							"vxlan_id" : "4",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					} ],
			        	'test2' : [{
						"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
						"name" : "tap03c3a2dc-03",
						"label" : "20",
						"active" : "Active",
						"vn_name" : "default-domain:admin:svc-vn-mgmt",
						"disp_vn_name" : "svc-vn-mgmt (admin)",
						"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
						"vm_name" : "si1_1",
						"disp_vm_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8 / si1_1",
						"ip_addr" : "250.250.1.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "5",
							"name" : "tap03c3a2dc-03",
							"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "20",
							"vn_name" : "default-domain:admin:svc-vn-mgmt",
							"vm_uuid" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8",
							"vm_name" : "si1_1",
							"ip_addr" : "250.250.1.253",
							"mac_addr" : "02:03:c3:a2:dc:03",
							"policy" : "Disable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.3.5",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "28",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "21",
							"vxlan_id" : "6",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					}],
					'test3' : [{
						"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
						"name" : "tap03c3a2dc-03",
						"label" : "20",
						"active" : "Active",
						"vn_name" : "-",
						"disp_vn_name" : "-",
						"vm_uuid" : "-",
						"vm_name" : "-",
						"disp_vm_name" : "- / -",
						"ip_addr" : "250.250.1.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "5",
							"name" : "tap03c3a2dc-03",
							"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "20",
							"vn_name" : "-",
							"vm_uuid" : "-",
							"vm_name" : "-",
							"ip_addr" : "250.250.1.253",
							"mac_addr" : "02:03:c3:a2:dc:03",
							"policy" : "Disable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.3.5",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "28",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "21",
							"vxlan_id" : "6",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					}],
					'test4' : [{
						"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
						"name" : "tap03c3a2dc-03",
						"label" : "20",
						"active" : "Active",
						"vn_name" : "-",
						"disp_vn_name" : "-",
						"vm_uuid" : "-",
						"vm_name" : "-",
						"disp_vm_name" : "- / -",
						"ip_addr" : "250.250.1.253",
						"disp_fip_list" : "None",
						"raw_json" : {
							"index" : "5",
							"name" : "tap03c3a2dc-03",
							"uuid" : "03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
							"active" : "Active",
							"dhcp_service" : "Enable",
							"dns_service" : "Enable",
							"type" : "vport",
							"label" : "20",
							"vn_name" : "-",
							"vm_uuid" : "-",
							"vm_name" : "-",
							"ip_addr" : "250.250.1.253",
							"mac_addr" : "02:03:c3:a2:dc:03",
							"policy" : "Disable",
							"fip_list" : {
								"list" : {}
							},
							"mdata_ip_addr" : "169.254.3.5",
							"service_vlan_list" : {
								"list" : {}
							},
							"os_ifindex" : "28",
							"fabric_port" : "NotFabricPort",
							"alloc_linklocal_ip" : "LL-Enable",
							"analyzer_name" : {},
							"config_name" : "64177817-5704-4f7a-b6d0-ca7d52bcb7a8:03c3a2dc-033b-4dd8-8a6b-6a8438025e71",
							"sg_uuid_list" : {
								"list" : {}
							},
							"l2_label" : "21",
							"vxlan_id" : "6",
							"static_route_list" : {
								"list" : {}
							},
							"l2_active" : "L2 Active",
							"vm_project_uuid" : "b27aa7ce-422b-440e-9674-ed5545374143",
							"disp_fip_list" : "None"
						}
					}]
	        	}
        },
        'parseVNData' : {
        	input:{
        		'test1' : [ {
					"VnListResp" : {
						"vn_list" : {
							"list" : {
								"VnSandeshData" : [
										{
											"name" : "default-domain:admin:svc-vn-mgmt",
											"uuid" : "10043a55-1b79-408c-9a75-fa3e309684e9",
											"acl_uuid" : {},
											"mirror_acl_uuid" : {},
											"mirror_cfg_acl_uuid" : {},
											"vrf_name" : "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt",
											"ipam_data" : {
												"list" : {
													"VnIpamData" : {
														"ip_prefix" : "250.250.1.0",
														"prefix_len" : "24",
														"gateway" : "250.250.1.254",
														"ipam_name" : "default-domain:default-project:default-network-ipam"
													}
												}
											},
											"ipam_host_routes" : {
												"list" : {
													"VnIpamHostRoutes" : {
														"ipam_name" : "default-domain:default-project:default-network-ipam",
														"host_routes" : {
															"list" : {}
														}
													}
												}
											},
											"layer2_forwarding" : "true",
											"ipv4_forwarding" : "true"
										},
										{
											"name" : "default-domain:admin:vn2",
											"uuid" : "9ae74ce7-dd44-4a10-9dd0-3962d1025654",
											"acl_uuid" : "aa9c4863-1203-4170-bb8d-b56c6a11934f",
											"mirror_acl_uuid" : {},
											"mirror_cfg_acl_uuid" : {},
											"vrf_name" : "default-domain:admin:vn2:vn2",
											"ipam_data" : {
												"list" : {
													"VnIpamData" : {
														"ip_prefix" : "10.10.11.0",
														"prefix_len" : "24",
														"gateway" : "10.10.11.254",
														"ipam_name" : "default-domain:admin:test"
													}
												}
											},
											"ipam_host_routes" : {
												"list" : {
													"VnIpamHostRoutes" : {
														"ipam_name" : "default-domain:admin:test",
														"host_routes" : {
															"list" : {}
														}
													}
												}
											},
											"layer2_forwarding" : "true",
											"ipv4_forwarding" : "true"
										},
										{
											"name" : "default-domain:admin:vn1",
											"uuid" : "fa86f056-6d2d-416b-91a4-879cdafdef14",
											"acl_uuid" : "4c0f93d1-65ee-4985-9f95-c887236749ec",
											"mirror_acl_uuid" : {},
											"mirror_cfg_acl_uuid" : {},
											"vrf_name" : "default-domain:admin:vn1:vn1",
											"ipam_data" : {
												"list" : {
													"VnIpamData" : {
														"ip_prefix" : "10.10.10.0",
														"prefix_len" : "24",
														"gateway" : "10.10.10.254",
														"ipam_name" : "default-domain:admin:test"
													}
												}
											},
											"ipam_host_routes" : {
												"list" : {
													"VnIpamHostRoutes" : {
														"ipam_name" : "default-domain:admin:test",
														"host_routes" : {
															"list" : {}
														}
													}
												}
											},
											"layer2_forwarding" : "true",
											"ipv4_forwarding" : "true"
										} ]
							}
						},
						"more" : "false"
					}
				} ],
        		'test2' : {},
        		'test3' : [ {
					"VnListResp" : {
						"vn_list" : {
							"list" : {
								"VnSandeshData" : [
										{
											"name" : "default-domain:admin:svc-vn-mgmt",
											"uuid" : "10043a55-1b79-408c-9a75-fa3e309684e9",
											"acl_uuid" : {},
											"mirror_acl_uuid" : {},
											"mirror_cfg_acl_uuid" : {},
											"vrf_name" : {},
											"ipam_data" : {
												"list" : {
													"VnIpamData" : {
														"ip_prefix" : "250.250.1.0",
														"prefix_len" : "24",
														"gateway" : "250.250.1.254",
														"ipam_name" : "default-domain:default-project:default-network-ipam"
													}
												}
											},
											"ipam_host_routes" : {
												"list" : {
													"VnIpamHostRoutes" : {
														"ipam_name" : "default-domain:default-project:default-network-ipam",
														"host_routes" : {
															"list" : {}
														}
													}
												}
											},
											"layer2_forwarding" : "true",
											"ipv4_forwarding" : "true"
										} ]
							}
						},
						"more" : "false"
					}
				} ]
        	},
        	output:{
        		'test1' : [
        		           {
        		               "acl_uuid": "-",
        		               "name": "default-domain:admin:svc-vn-mgmt",
        		               "raw_json": {
        		                 "acl_uuid": {},
        		                 "ipam_data": {
        		                   "list": {
        		                     "VnIpamData": {
        		                       "gateway": "250.250.1.254",
        		                       "ip_prefix": "250.250.1.0",
        		                       "ipam_name": "default-domain:default-project:default-network-ipam",
        		                       "prefix_len": "24"
        		                     }
        		                   }
        		                 },
        		                 "ipam_host_routes": {
        		                   "list": {
        		                     "VnIpamHostRoutes": {
        		                       "host_routes": {
        		                         "list": {}
        		                       },
        		                       "ipam_name": "default-domain:default-project:default-network-ipam"
        		                     }
        		                   }
        		                 },
        		                 "ipv4_forwarding": "true",
        		                 "layer2_forwarding": "true",
        		                 "mirror_acl_uuid": {},
        		                 "mirror_cfg_acl_uuid": {},
        		                 "name": "default-domain:admin:svc-vn-mgmt",
        		                 "uuid": "10043a55-1b79-408c-9a75-fa3e309684e9",
        		                 "vrf_name": "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt"
        		               },
        		               "vrf_name": "default-domain:admin:svc-vn-mgmt:svc-vn-mgmt"
        		             },
        		             {
        		               "acl_uuid": "aa9c4863-1203-4170-bb8d-b56c6a11934f",
        		               "name": "default-domain:admin:vn2",
        		               "raw_json": {
        		                 "acl_uuid": "aa9c4863-1203-4170-bb8d-b56c6a11934f",
        		                 "ipam_data": {
        		                   "list": {
        		                     "VnIpamData": {
        		                       "gateway": "10.10.11.254",
        		                       "ip_prefix": "10.10.11.0",
        		                       "ipam_name": "default-domain:admin:test",
        		                       "prefix_len": "24"
        		                     }
        		                   }
        		                 },
        		                 "ipam_host_routes": {
        		                   "list": {
        		                     "VnIpamHostRoutes": {
        		                       "host_routes": {
        		                         "list": {}
        		                       },
        		                       "ipam_name": "default-domain:admin:test"
        		                     }
        		                   }
        		                 },
        		                 "ipv4_forwarding": "true",
        		                 "layer2_forwarding": "true",
        		                 "mirror_acl_uuid": {},
        		                 "mirror_cfg_acl_uuid": {},
        		                 "name": "default-domain:admin:vn2",
        		                 "uuid": "9ae74ce7-dd44-4a10-9dd0-3962d1025654",
        		                 "vrf_name": "default-domain:admin:vn2:vn2"
        		               },
        		               "vrf_name": "default-domain:admin:vn2:vn2"
        		             },
        		             {
        		               "acl_uuid": "4c0f93d1-65ee-4985-9f95-c887236749ec",
        		               "name": "default-domain:admin:vn1",
        		               "raw_json": {
        		                 "acl_uuid": "4c0f93d1-65ee-4985-9f95-c887236749ec",
        		                 "ipam_data": {
        		                   "list": {
        		                     "VnIpamData": {
        		                       "gateway": "10.10.10.254",
        		                       "ip_prefix": "10.10.10.0",
        		                       "ipam_name": "default-domain:admin:test",
        		                       "prefix_len": "24"
        		                     }
        		                   }
        		                 },
        		                 "ipam_host_routes": {
        		                   "list": {
        		                     "VnIpamHostRoutes": {
        		                       "host_routes": {
        		                         "list": {}
        		                       },
        		                       "ipam_name": "default-domain:admin:test"
        		                     }
        		                   }
        		                 },
        		                 "ipv4_forwarding": "true",
        		                 "layer2_forwarding": "true",
        		                 "mirror_acl_uuid": {},
        		                 "mirror_cfg_acl_uuid": {},
        		                 "name": "default-domain:admin:vn1",
        		                 "uuid": "fa86f056-6d2d-416b-91a4-879cdafdef14",
        		                 "vrf_name": "default-domain:admin:vn1:vn1"
        		               },
        		               "vrf_name": "default-domain:admin:vn1:vn1"
        		             }
        		           ],
        		'test2': [],
        		'test3':[
        		         {
        		             "acl_uuid": "-",
        		             "name": "default-domain:admin:svc-vn-mgmt",
        		             "raw_json": {
        		               "acl_uuid": {},
        		               "ipam_data": {
        		                 "list": {
        		                   "VnIpamData": {
        		                     "gateway": "250.250.1.254",
        		                     "ip_prefix": "250.250.1.0",
        		                     "ipam_name": "default-domain:default-project:default-network-ipam",
        		                     "prefix_len": "24"
        		                   }
        		                 }
        		               },
        		               "ipam_host_routes": {
        		                 "list": {
        		                   "VnIpamHostRoutes": {
        		                     "host_routes": {
        		                       "list": {}
        		                     },
        		                     "ipam_name": "default-domain:default-project:default-network-ipam"
        		                   }
        		                 }
        		               },
        		               "ipv4_forwarding": "true",
        		               "layer2_forwarding": "true",
        		               "mirror_acl_uuid": {},
        		               "mirror_cfg_acl_uuid": {},
        		               "name": "default-domain:admin:svc-vn-mgmt",
        		               "uuid": "10043a55-1b79-408c-9a75-fa3e309684e9",
        		               "vrf_name": {}
        		             },
        		             "vrf_name": "-"
        		           }
        		         ]
        	}        	
        },
        'parseUnicastRoutesData':{
        	input:{
        		'test1' : [ {
					"Inet4UcRouteResp" : {
						"route_list" : {
							"list" : {
								"RouteUcSandeshData" : [
										{
											"src_ip" : "0.0.0.0",
											"src_plen" : "0",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.254",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "2c:21:72:a0:4a:80"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"gw_ip" : "10.204.216.254",
														"vrf" : "default-domain:default-project:ip-fabric:__default__",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.0",
											"src_plen" : "24",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "resolve",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.4",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.4",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "0:25:90:93:d1:e0"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.38",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "receive",
																"ref_count" : "3",
																"valid" : "true",
																"policy" : "disabled",
																"itf" : "vhost0"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
														"unresolved" : "false",
														"proxy_arp" : "ProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.46",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.46",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "0:25:90:a5:3b:20"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.253",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.253",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "8:81:f4:84:7e:52"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.254",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.254",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "2c:21:72:a0:4a:80"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										},
										{
											"src_ip" : "10.204.216.255",
											"src_plen" : "32",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "receive",
																"ref_count" : "3",
																"valid" : "true",
																"policy" : "disabled",
																"itf" : "vhost0"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
														"unresolved" : "false",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										} ]
							}
						},
						"more" : "false"
					}
				} ],
        		'test2' : [ {
					"Inet4UcRouteResp" : {
						"route_list" : {
							"list" : {
								"RouteUcSandeshData" : [
										{
											"src_ip" : {},
											"src_plen" : {},
											"src_vrf" : {},
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.254",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "2c:21:72:a0:4a:80"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"gw_ip" : "10.204.216.254",
														"vrf" : "default-domain:default-project:ip-fabric:__default__",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										}
										]
							}
						},
						"more" : "false"
					}
				} ],
				'test3' : [ {
					"Inet4UcRouteResp" : {
						"route_list" : {
							"list" : {
								"RouteUcSandeshData" : [
										{
											"src_ip" : "0.0.0.0",
											"src_plen" : "0",
											"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
											"path_list" : {
												"list" : {
													"PathSandeshData" : {
														"nh" : {
															"NhSandeshData" : {
																"type" : "arp",
																"ref_count" : "1",
																"valid" : "true",
																"policy" : "disabled",
																"sip" : "10.204.216.254",
																"vrf" : "default-domain:default-project:ip-fabric:__default__",
																"itf" : "p6p0p0",
																"mac" : "2c:21:72:a0:4a:80"
															}
														},
														"label" : "-1",
														"vxlan_id" : "0",
														"peer" : "Local",
														"dest_vn" : "default-domain:default-project:ip-fabric",
														"unresolved" : "false",
														"gw_ip" : "10.204.216.254",
														"vrf" : "default-domain:default-project:ip-fabric:__default__",
														"proxy_arp" : "NoProxyArp",
														"sg_list" : {
															"list" : {}
														}
													}
												}
											}
										}
										]
							}
						},
						"more" : "false"
					}
				} ]
        	
        	},
        	output:{
        		'test1' : [
						{
							"dispPrefix" : "0.0.0.0 / 0",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"gw_ip" : "10.204.216.254",
								"vrf" : "default-domain:default-project:ip-fabric:__default__",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "0.0.0.0",
							"src_plen" : "0",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"gw_ip" : "10.204.216.254",
								"vrf" : "default-domain:default-project:ip-fabric:__default__",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.0 / 24",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "resolve",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.0",
							"src_plen" : "24",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "resolve",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.4 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.4",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "0:25:90:93:d1:e0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.4",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.4",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "0:25:90:93:d1:e0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.38 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "receive",
										"ref_count" : "3",
										"valid" : "true",
										"policy" : "disabled",
										"itf" : "vhost0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
								"unresolved" : "false",
								"proxy_arp" : "ProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.38",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "receive",
										"ref_count" : "3",
										"valid" : "true",
										"policy" : "disabled",
										"itf" : "vhost0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
								"unresolved" : "false",
								"proxy_arp" : "ProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.46 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.46",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "0:25:90:a5:3b:20"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.46",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.46",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "0:25:90:a5:3b:20"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.253 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.253",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "8:81:f4:84:7e:52"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.253",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.253",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "8:81:f4:84:7e:52"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.254 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.254",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						},
						{
							"dispPrefix" : "10.204.216.255 / 32",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "receive",
										"ref_count" : "3",
										"valid" : "true",
										"policy" : "disabled",
										"itf" : "vhost0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "10.204.216.255",
							"src_plen" : "32",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "receive",
										"ref_count" : "3",
										"valid" : "true",
										"policy" : "disabled",
										"itf" : "vhost0"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric:__default__",
								"unresolved" : "false",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						} ],
        		'test2': [
							{
								"dispPrefix" : "[object Object] / [object Object]",
								"path" : {
									"nh" : {
										"NhSandeshData" : {
											"type" : "arp",
											"ref_count" : "1",
											"valid" : "true",
											"policy" : "disabled",
											"sip" : "10.204.216.254",
											"vrf" : "default-domain:default-project:ip-fabric:__default__",
											"itf" : "p6p0p0",
											"mac" : "2c:21:72:a0:4a:80"
										}
									},
									"label" : "-1",
									"vxlan_id" : "0",
									"peer" : "Local",
									"dest_vn" : "default-domain:default-project:ip-fabric",
									"unresolved" : "false",
									"gw_ip" : "10.204.216.254",
									"vrf" : "default-domain:default-project:ip-fabric:__default__",
									"proxy_arp" : "NoProxyArp",
									"sg_list" : {
										"list" : {}
									}
								},
								"src_ip" : {},
								"src_plen" : {},
								"src_vrf" : {},
								"raw_json" : {
									"nh" : {
										"NhSandeshData" : {
											"type" : "arp",
											"ref_count" : "1",
											"valid" : "true",
											"policy" : "disabled",
											"sip" : "10.204.216.254",
											"vrf" : "default-domain:default-project:ip-fabric:__default__",
											"itf" : "p6p0p0",
											"mac" : "2c:21:72:a0:4a:80"
										}
									},
									"label" : "-1",
									"vxlan_id" : "0",
									"peer" : "Local",
									"dest_vn" : "default-domain:default-project:ip-fabric",
									"unresolved" : "false",
									"gw_ip" : "10.204.216.254",
									"vrf" : "default-domain:default-project:ip-fabric:__default__",
									"proxy_arp" : "NoProxyArp",
									"sg_list" : {
										"list" : {}
									}
								}
							}],
			'test3': [
						{
							"dispPrefix" : "0.0.0.0 / 0",
							"path" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"gw_ip" : "10.204.216.254",
								"vrf" : "default-domain:default-project:ip-fabric:__default__",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							},
							"src_ip" : "0.0.0.0",
							"src_plen" : "0",
							"src_vrf" : "default-domain:default-project:ip-fabric:__default__",
							"raw_json" : {
								"nh" : {
									"NhSandeshData" : {
										"type" : "arp",
										"ref_count" : "1",
										"valid" : "true",
										"policy" : "disabled",
										"sip" : "10.204.216.254",
										"vrf" : "default-domain:default-project:ip-fabric:__default__",
										"itf" : "p6p0p0",
										"mac" : "2c:21:72:a0:4a:80"
									}
								},
								"label" : "-1",
								"vxlan_id" : "0",
								"peer" : "Local",
								"dest_vn" : "default-domain:default-project:ip-fabric",
								"unresolved" : "false",
								"gw_ip" : "10.204.216.254",
								"vrf" : "default-domain:default-project:ip-fabric:__default__",
								"proxy_arp" : "NoProxyArp",
								"sg_list" : {
									"list" : {}
								}
							}
						}]
        	        	
        	}
        },
        'parseMulticastRoutesData':{
        	input:{
        		'test1' : [ {
					"Inet4McRouteResp" : {
						"route_list" : {
							"list" : {
								"RouteMcSandeshData" : {
									"src" : "0.0.0.0",
									"grp" : "255.255.255.255",
									"nh" : {
										"NhSandeshData" : {
											"type" : "receive",
											"ref_count" : "3",
											"valid" : "true",
											"policy" : "disabled",
											"itf" : "vhost0"
										}
									}
								}
							}
						},
						"more" : "false"
					}
				} ],
				'test2' : [ {
					"Inet4McRouteResp" : {
						"route_list" : {
							"list" : {
								
							}
						},
						"more" : "false"
					}
				} ]
        		
        	},
        	output:{
        		'test1' : [ {
					"dispPrefix" : "0.0.0.0 / 255.255.255.255",
					"path" : {
						"src" : "0.0.0.0",
						"grp" : "255.255.255.255",
						"nh" : {
							"NhSandeshData" : {
								"type" : "receive",
								"ref_count" : "3",
								"valid" : "true",
								"policy" : "disabled",
								"itf" : "vhost0"
							}
						}
					},
					"src_ip" : "0.0.0.0",
					"src_plen" : "255.255.255.255",
					"raw_json" : {
						"src" : "0.0.0.0",
						"grp" : "255.255.255.255",
						"nh" : {
							"NhSandeshData" : {
								"type" : "receive",
								"ref_count" : "3",
								"valid" : "true",
								"policy" : "disabled",
								"itf" : "vhost0"
							}
						}
					}
				} ],
				'test2':[]
        	}
        },
        'parseL2RoutesData':{
        	input:{
        		'test1' :[
        		          {
        		        	    "Layer2RouteResp": {
        		        	      "route_list": {
        		        	        "list": {
        		        	          "RouteL2SandeshData": [
        		        	            {
        		        	              "mac": "2:4:0:88:eb:31",
        		        	              "src_vrf": {},
        		        	              "path_list": {
        		        	                "list": {
        		        	                  "PathSandeshData": [
        		        	                    {
        		        	                      "nh": {
        		        	                        "NhSandeshData": {
        		        	                          "type": "tunnel",
        		        	                          "ref_count": "34",
        		        	                          "valid": "true",
        		        	                          "policy": "disabled",
        		        	                          "sip": "10.84.3.132",
        		        	                          "dip": "10.84.3.124",
        		        	                          "vrf": "default-domain:default-project:ip-fabric:__default__",
        		        	                          "mac": "0:0:5e:0:1:0",
        		        	                          "tunnel_type": "MPLSoGRE"
        		        	                        }
        		        	                      },
        		        	                      "label": "19",
        		        	                      "vxlan_id": "0",
        		        	                      "peer": "10.84.5.30",
        		        	                      "dest_vn": {},
        		        	                      "unresolved": "false",
        		        	                      "proxy_arp": {}
        		        	                    },
        		        	                    {
        		        	                      "nh": {
        		        	                        "NhSandeshData": {
        		        	                          "type": "tunnel",
        		        	                          "ref_count": "34",
        		        	                          "valid": "true",
        		        	                          "policy": "disabled",
        		        	                          "sip": "10.84.3.132",
        		        	                          "dip": "10.84.3.124",
        		        	                          "vrf": "default-domain:default-project:ip-fabric:__default__",
        		        	                          "mac": "0:0:5e:0:1:0",
        		        	                          "tunnel_type": "MPLSoGRE"
        		        	                        }
        		        	                      },
        		        	                      "label": "19",
        		        	                      "vxlan_id": "0",
        		        	                      "peer": "10.84.5.33",
        		        	                      "dest_vn": {},
        		        	                      "unresolved": "false",
        		        	                      "proxy_arp": {}
        		        	                    }
        		        	                  ]
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "more": "false"
        		        	    }
        		        	  }
        		        	],
				'test2' : [
	        		          {
	        		        	    "Layer2RouteResp": {
	        		        	      "route_list": {
	        		        	        "list": {}
	        		        	      },
	        		        	      "more": "false"
	        		        	    }
	        		        	  }
	        		        	]
        		
        	},
        	output:{
        		'test1' : [
        		           {
        		        	    "mac": "2:4:0:88:eb:31",
        		        	    "path": {
        		        	      "dest_vn": {},
        		        	      "label": "19",
        		        	      "nh": {
        		        	        "NhSandeshData": {
        		        	          "dip": "10.84.3.124",
        		        	          "mac": "0:0:5e:0:1:0",
        		        	          "policy": "disabled",
        		        	          "ref_count": "34",
        		        	          "sip": "10.84.3.132",
        		        	          "tunnel_type": "MPLSoGRE",
        		        	          "type": "tunnel",
        		        	          "valid": "true",
        		        	          "vrf": "default-domain:default-project:ip-fabric:__default__"
        		        	        }
        		        	      },
        		        	      "peer": "10.84.5.30",
        		        	      "proxy_arp": {},
        		        	      "unresolved": "false",
        		        	      "vxlan_id": "0"
        		        	    },
        		        	    "raw_json": {
        		        	      "dest_vn": {},
        		        	      "label": "19",
        		        	      "nh": {
        		        	        "NhSandeshData": {
        		        	          "dip": "10.84.3.124",
        		        	          "mac": "0:0:5e:0:1:0",
        		        	          "policy": "disabled",
        		        	          "ref_count": "34",
        		        	          "sip": "10.84.3.132",
        		        	          "tunnel_type": "MPLSoGRE",
        		        	          "type": "tunnel",
        		        	          "valid": "true",
        		        	          "vrf": "default-domain:default-project:ip-fabric:__default__"
        		        	        }
        		        	      },
        		        	      "peer": "10.84.5.30",
        		        	      "proxy_arp": {},
        		        	      "unresolved": "false",
        		        	      "vxlan_id": "0"
        		        	    },
        		        	    "src_vrf": {}
        		        	  },
        		        	  {
        		        	    "mac": "",
        		        	    "path": {
        		        	      "dest_vn": {},
        		        	      "label": "19",
        		        	      "nh": {
        		        	        "NhSandeshData": {
        		        	          "dip": "10.84.3.124",
        		        	          "mac": "0:0:5e:0:1:0",
        		        	          "policy": "disabled",
        		        	          "ref_count": "34",
        		        	          "sip": "10.84.3.132",
        		        	          "tunnel_type": "MPLSoGRE",
        		        	          "type": "tunnel",
        		        	          "valid": "true",
        		        	          "vrf": "default-domain:default-project:ip-fabric:__default__"
        		        	        }
        		        	      },
        		        	      "peer": "10.84.5.33",
        		        	      "proxy_arp": {},
        		        	      "unresolved": "false",
        		        	      "vxlan_id": "0"
        		        	    },
        		        	    "raw_json": {
        		        	      "dest_vn": {},
        		        	      "label": "19",
        		        	      "nh": {
        		        	        "NhSandeshData": {
        		        	          "dip": "10.84.3.124",
        		        	          "mac": "0:0:5e:0:1:0",
        		        	          "policy": "disabled",
        		        	          "ref_count": "34",
        		        	          "sip": "10.84.3.132",
        		        	          "tunnel_type": "MPLSoGRE",
        		        	          "type": "tunnel",
        		        	          "valid": "true",
        		        	          "vrf": "default-domain:default-project:ip-fabric:__default__"
        		        	        }
        		        	      },
        		        	      "peer": "10.84.5.33",
        		        	      "proxy_arp": {},
        		        	      "unresolved": "false",
        		        	      "vxlan_id": "0"
        		        	    },
        		        	    "src_vrf": {}
        		        	  }
        		        	],
				'test2':[]
        	}
        },
        'parseACLData':{
        	input:{
        		'test1':{
        			  "AclResp": {
        				    "acl_list": {
        				      "list": {
        				        "AclSandeshData": [
        				          {
        				            "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2",
        				            "dynamic_acl": "false",
        				            "entries": {
        				              "list": {
        				                "AclEntrySandeshData": [
        				                  {
        				                    "ace_id": "1",
        				                    "rule_type": "Terminal",
        				                    "src": "default-domain:demo:vn0",
        				                    "dst": "default-domain:demo:vn16",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  },
        				                  {
        				                    "ace_id": "2",
        				                    "rule_type": "Terminal",
        				                    "src": "default-domain:demo:vn16",
        				                    "dst": "default-domain:demo:vn0",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  },
        				                  {
        				                    "ace_id": "3",
        				                    "rule_type": "Terminal",
        				                    "src": "default-domain:demo:vn16",
        				                    "dst": "default-domain:demo:vn16",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  },
        				                  {
        				                    "ace_id": "4",
        				                    "rule_type": "Terminal",
        				                    "src": "any",
        				                    "dst": "any",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  }
        				                ]
        				              }
        				            },
        				            "name": "default-domain:demo:vn16:vn16",
        				            "flow_count": "0"
        				          },
        				          {
        				            "uuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb",
        				            "dynamic_acl": "false",
        				            "entries": {
        				              "list": {
        				                "AclEntrySandeshData": [
        				                  {
        				                    "ace_id": "1",
        				                    "rule_type": "Terminal",
        				                    "src": "0.0.0.0 0.0.0.0",
        				                    "dst": "4",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  },
        				                  {
        				                    "ace_id": "2",
        				                    "rule_type": "Terminal",
        				                    "src": "4",
        				                    "dst": "0.0.0.0 0.0.0.0",
        				                    "src_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "dst_port_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "65535"
        				                        }
        				                      }
        				                    },
        				                    "proto_l": {
        				                      "list": {
        				                        "SandeshRange": {
        				                          "min": "0",
        				                          "max": "255"
        				                        }
        				                      }
        				                    },
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  }
        				                ]
        				              }
        				            },
        				            "name": "default-domain:demo:default:default-access-control-list",
        				            "flow_count": "0"
        				          }
        				        ]
        				      }
        				    },
        				    "more": "false"
        				  }
        				},
        		'test2':{
      			  "AclResp": {
  				    "acl_list": {
  				      "list": {
  				        "AclSandeshData": [
  				          {}
  				        ]
  				      }
  				    },
  				    "more": "false"
  				  }
  				},
  				'test3':{
        			  "AclResp": {
        				    "acl_list": {
        				      "list": {
        				        
        				      }
        				    },
        				    "more": "false"
        				  }
        				},
        		'test4':{
        			  "AclResp": {
        				    "acl_list": {
        				      "list": {
        				        "AclSandeshData": [
        				          {
        				            "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2",
        				            "dynamic_acl": "false",
        				            "entries": {
        				              "list": {
        				                "AclEntrySandeshData": [
        				                  {
        				                    "ace_id": "1",
        				                    "rule_type": "Terminal",
        				                    "src": "default-domain:demo:vn0",
        				                    "dst": "default-domain:demo:vn16",
        				                    "src_port_l": {},
        				                    "dst_port_l": {},
        				                    "proto_l": {},
        				                    "action_l": {
        				                      "list": {
        				                        "ActionStr": {
        				                          "action": "pass"
        				                        }
        				                      }
        				                    }
        				                  }
        				                ]
        				              }
        				            },
        				            "name": "default-domain:demo:vn16:vn16",
        				            "flow_count": "0"
        				          }
        				        ]
        				      }
        				    },
        				    "more": "false"
        				  }
        				},
        		'test5':{}
        	},
        	output:{
        		'test1':[
        		         {
        		        	    "aceId": "1",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "default-domain:demo:vn16",
        		        	    "flow_count": "0",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "3",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "4",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "any",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "any",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:vn16:vn16",
        		        	      "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "default-domain:demo:vn0",
        		        	    "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	  },
        		        	  {
        		        	    "aceId": "2",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "default-domain:demo:vn0",
        		        	    "flow_count": "",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "3",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "4",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "any",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "any",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:vn16:vn16",
        		        	      "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "default-domain:demo:vn16",
        		        	    "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	  },
        		        	  {
        		        	    "aceId": "3",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "default-domain:demo:vn16",
        		        	    "flow_count": "",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "3",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "4",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "any",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "any",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:vn16:vn16",
        		        	      "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "default-domain:demo:vn16",
        		        	    "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	  },
        		        	  {
        		        	    "aceId": "4",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "any",
        		        	    "flow_count": "",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "3",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn16",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "4",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "any",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "any",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:vn16:vn16",
        		        	      "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "any",
        		        	    "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	  },
        		        	  {
        		        	    "aceId": "1",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "4",
        		        	    "flow_count": "0",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "4",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "0.0.0.0 0.0.0.0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "0.0.0.0 0.0.0.0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "4",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:default:default-access-control-list",
        		        	      "uuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "0.0.0.0 / 0.0.0.0",
        		        	    "uuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb"
        		        	  },
        		        	  {
        		        	    "aceId": "2",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "0 - 65535",
        		        	    "dst_vn": "0.0.0.0 / 0.0.0.0",
        		        	    "flow_count": "",
        		        	    "proto": "0 - 255",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "4",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "0.0.0.0 0.0.0.0",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            },
        		        	            {
        		        	              "ace_id": "2",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "0.0.0.0 0.0.0.0",
        		        	              "dst_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "proto_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "255",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "rule_type": "Terminal",
        		        	              "src": "4",
        		        	              "src_port_l": {
        		        	                "list": {
        		        	                  "SandeshRange": {
        		        	                    "max": "65535",
        		        	                    "min": "0"
        		        	                  }
        		        	                }
        		        	              }
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:default:default-access-control-list",
        		        	      "uuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "0 - 65535",
        		        	    "src_vn": "4",
        		        	    "uuid": "396bb630-7cdb-459b-bce7-0e1b48f955fb"
        		        	  }
        		        	]	
        			,
        		'test2':[
        		         {
        		        	    "aceId": "-",
        		        	    "ace_action": "-",
        		        	    "dispuuid": undefined,
        		        	    "dstSgId": "-",
        		        	    "dstType": "-",
        		        	    "dst_port": "-",
        		        	    "dst_vn": "-",
        		        	    "flow_count": 0,
        		        	    "proto": "-",
        		        	    "raw_json": {},
        		        	    "srcSgId": "-",
        		        	    "srcType": "-",
        		        	    "src_port": "-",
        		        	    "src_vn": "-",
        		        	    "uuid": undefined
        		        	  }
        		        	],
        		 'test3':[],
        		 'test4':[
        		          {
        		        	    "aceId": "1",
        		        	    "ace_action": "pass",
        		        	    "dispuuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2",
        		        	    "dstSgId": "-",
        		        	    "dstType": undefined,
        		        	    "dst_port": "undefined - undefined",
        		        	    "dst_vn": "default-domain:demo:vn16",
        		        	    "flow_count": "0",
        		        	    "proto": "undefined - undefined",
        		        	    "raw_json": {
        		        	      "dynamic_acl": "false",
        		        	      "entries": {
        		        	        "list": {
        		        	          "AclEntrySandeshData": [
        		        	            {
        		        	              "ace_id": "1",
        		        	              "action_l": {
        		        	                "list": {
        		        	                  "ActionStr": {
        		        	                    "action": "pass"
        		        	                  }
        		        	                }
        		        	              },
        		        	              "dst": "default-domain:demo:vn16",
        		        	              "dst_port_l": {},
        		        	              "proto_l": {},
        		        	              "rule_type": "Terminal",
        		        	              "src": "default-domain:demo:vn0",
        		        	              "src_port_l": {}
        		        	            }
        		        	          ]
        		        	        }
        		        	      },
        		        	      "flow_count": "0",
        		        	      "name": "default-domain:demo:vn16:vn16",
        		        	      "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	    },
        		        	    "srcSgId": "-",
        		        	    "srcType": undefined,
        		        	    "src_port": "undefined - undefined",
        		        	    "src_vn": "default-domain:demo:vn0",
        		        	    "uuid": "1c80d16f-5809-495e-b429-ceb84e85e2f2"
        		        	  }
        		        	],
        		 'test5':[]
        	}
        },
        'parseFlowsData':{
        	input:{
        		'test1':[]
        	},
        	output:{
        		'test1':[]
        	}
        }
    }

    this.getInput = function(obj) {
       if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['input'][obj['type']] != null)
           return mockData[obj['fnName']]['input'][obj['type']];
        else
            return null;
    },
    this.getOutput = function(obj) {
       if(obj['fnName'] != null &&  mockData[obj['fnName']] != null && mockData[obj['fnName']]['output'][obj['type']] != null)
           return mockData[obj['fnName']]['output'][obj['type']];
        else
            return null;
    }

}
var infraComputeMockData = new InfraComputeMockData();

