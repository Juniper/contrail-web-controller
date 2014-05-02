function VirtulNetworkMockData() {
    this.loadRouteTargetDom = function(numberOfEntries, asns, rts) {
        var domStr = this.getRouteTargetDomString(numberOfEntries, asns, rts);
        u.loadDom(domStr);
    }

    this.getRouteTargetDomString = function(numberOfEntries, asns, rts) {
        var start = '<div class="row-fluid" id="RTTuples">';
        var end = '</div>';
        var middle = '';
        for(var i=0; i<numberOfEntries; i++) {
            middle += 
            '<div id="rule_' + i + '">' +
                '<div class="row-fluid margin-0-0-5">' +
                    '<div class="span3">' +
                        '<input type="text" class="span12" placeholder="1-65534" value="' + asns[i] +  '">' +
                    '</div>' +
                    '<div class="span1"><span>:</span></div>' +
                    '<div class="span3">' +
                        '<input type="text" class="span12" placeholder="1-4294967295" value="' + rts[i] +  '">' +
                    '</div>' + 
                    '<div class="pull-left margin-5"><i class="icon-plus" onclick="appendRTEntry(this);" title="Add Route Target below"></i></div>' +
                    '<div class="pull-left margin-5"><i class="icon-minus" onclick="deleteRTEntry(this);" title="Delete Route Target"></i></div>' +
                '</div>' +
            '</div>'; 
        }
        return start + middle + end;
    }
    
    this.loadFloatingIpDom = function(numberOfEntries, fipNames, projects) {
        var domStr = this.getFloatingIPDomString(numberOfEntries, fipNames, projects);
        u.loadDom(domStr);
    }
    
    this.getFloatingIPDomString = function(numberOfEntries, fipNames, projects) {
        var start = '<div class="row-fluid" id="fipTuples">';
        var end = '</div>';
        var middle = '';
        for(var i=0; i<numberOfEntries; i++) {
            middle +=
            '<div id="rule_' + i + '">' +
                '<div class="row-fluid margin-0-0-5">' +
                    '<div class="span3">' +
                        '<input type="text" class="span12" placeholder="Pool Name" value="' + fipNames[i] + '">' +
                    '</div>' +
                    '<div class="span3">' +
                        '<div unselectable="on" style="">' +
                            '<div unselectable="on">' +
                                '<ul unselectable="on" role="listbox">';
                                    var lis = '';
                                    if(projects[i]) {
                                        for(var j=0; j<projects[i].length; j++) {
                                            lis += '<li unselectable="on"><span unselectable="on">' + projects[i][j] + '</span><span class="icon-minus" unselectable="on">delete</span></li>';
                                        }
                                    }
            middle += lis +     '</ul>' +
                                '<input style="width: 25px" class="" accesskey="" role="listbox" aria-expanded="false" tabindex="0" aria-owns="" aria-disabled="false" aria-readonly="false" aria-busy="false">' +
                                '<span ></span>' +
                            '</div>' +
                            '<select placeholder="Select Projects" data-role="multiselect" multiple="multiple" style="display: none;" aria-disabled="false" aria-readonly="false"><option value="77fcb541-5745-4d9f-93c2-b2a0d2f6baa4">admin</option><option value="ad25e9ec-63d5-4ae5-ac45-c555f18c3d59">demo</option><option value="395c044d-0ee2-4191-b926-07653c63ca7c">openstack00</option></select>' +
                            '<span style="font-family: &quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif; font-size: 14px; font-stretch: normal; font-style: normal; font-weight: 400; letter-spacing: normal; text-transform: none; line-height: 17.4px; position: absolute; visibility: hidden;"></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="pull-left margin-5"><i class="icon-plus" onclick="appendFipEntry(this);" title="Add FIP Pool below"></i></div>' +
                    '<div class="pull-left margin-5"><i class="icon-minus" onclick="deleteFipEntry(this);" title="Delete FIP Pool"></i></div>' +
                '</div>' +
            '</div>';
        }
        return start + middle + end;
                
    }
    
    this.getDomainsMockData = function() {
        var domains =  {
            "domains": [
                {
                    "href": "http://10.204.216.36:9100/domain/bb26d31c-2336-4516-bc3e-ce908fa63265",
                    "fq_name": [
                        "default-domain"
                    ],
                    "uuid": "bb26d31c-2336-4516-bc3e-ce908fa63265"
                }
            ]
        };
        return domains;
    }
    
    this.getProjectsMockData = function() {
        var projects = {
            "projects": [
                {
                    "fq_name": [
                        "default-domain",
                        "admin"
                    ],
                    "uuid": "77fcb541-5745-4d9f-93c2-b2a0d2f6baa4"
                },
                {
                    "fq_name": [
                        "default-domain",
                        "demo"
                    ],
                    "uuid": "ad25e9ec-63d5-4ae5-ac45-c555f18c3d59"
                },
                {
                    "fq_name": [
                        "default-domain",
                        "openstack00"
                    ],
                    "uuid": "395c044d-0ee2-4191-b926-07653c63ca7c"
                }
            ]
        };
        return projects;
    }
    
    this.getVirtualNetworksMockData = function() {
        return {
              "data": [
                {
                  "virtual-network": {
                    "virtual_network_properties": {
                      "network_id": 4,
                      "vxlan_network_identifier": null,
                      "forwarding_mode": null,
                      "extend_to_external_routers": null
                    },
                    "parent_href": "http://10.204.216.36:9100/project/77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "fq_name": [
                      "default-domain",
                      "admin",
                      "vnet0"
                    ],
                    "uuid": "2ce8a810-8a34-47e3-a623-e2737653bd67",
                    "network_policy_refs": [
                      {
                        "to": [
                          "default-domain",
                          "admin",
                          "policy0"
                        ],
                        "href": "http://10.204.216.36:9100/network-policy/77bf344e-12d8-4543-9afa-2218911bd714",
                        "attr": {
                          "timer": null,
                          "sequence": {
                            "major": 0,
                            "minor": 0
                          }
                        },
                        "uuid": "77bf344e-12d8-4543-9afa-2218911bd714"
                      }
                    ],
                    "parent_uuid": "77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "virtual_machine_interface_back_refs": [
                      {
                        "to": [
                          "24fb0ce9-e480-438a-a2f2-4392dfe3b36e",
                          "145764ff-624c-4f19-9b88-d74d2013c4df"
                        ],
                        "href": "http://10.204.216.36:9100/virtual-machine-interface/145764ff-624c-4f19-9b88-d74d2013c4df",
                        "attr": null,
                        "uuid": "145764ff-624c-4f19-9b88-d74d2013c4df"
                      }
                    ],
                    "parent_type": "project",
                    "instance_ip_back_refs": [
                      {
                        "to": [
                          "ab150133-e222-420b-8858-baa071076bb4"
                        ],
                        "href": "http://10.204.216.36:9100/instance-ip/ab150133-e222-420b-8858-baa071076bb4",
                        "attr": null,
                        "uuid": "ab150133-e222-420b-8858-baa071076bb4"
                      }
                    ],
                    "network_ipam_refs": [
                      {
                        "subnet": {
                          "ipam_subnet": "10.1.1.0/28",
                          "default_gateway": "10.1.1.14",
                          "ipam": [
                            "default-domain",
                            "admin",
                            "admin-default-ipam"
                          ]
                        }
                      },
                      {
                        "subnet": {
                          "ipam_subnet": "11.1.1.0/28",
                          "default_gateway": "11.1.1.14",
                          "ipam": [
                            "default-domain",
                            "admin",
                            "admin-default-ipam"
                          ]
                        }
                      }
                    ],
                    "name": "vnet0"
                  }
                },
                {
                  "virtual-network": {
                    "virtual_network_properties": {
                      "network_id": 5,
                      "vxlan_network_identifier": null,
                      "forwarding_mode": null,
                      "extend_to_external_routers": null
                    },
                    "parent_href": "http://10.204.216.36:9100/project/77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "fq_name": [
                      "default-domain",
                      "admin",
                      "vnet1"
                    ],
                    "uuid": "a75bdfad-f337-4e73-bddd-d755e3a06879",
                    "network_policy_refs": [
                      {
                        "to": [
                          "default-domain",
                          "admin",
                          "policy100"
                        ],
                        "href": "http://10.204.216.36:9100/network-policy/d1b94cf5-53ee-41d5-8e3d-b5ad74060b6e",
                        "attr": {
                          "timer": null,
                          "sequence": {
                            "major": 0,
                            "minor": 0
                          }
                        },
                        "uuid": "d1b94cf5-53ee-41d5-8e3d-b5ad74060b6e"
                      }
                    ],
                    "parent_uuid": "77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "virtual_machine_interface_back_refs": [
                      {
                        "to": [
                          "a2519792-966e-4fce-83f5-c7b183668737",
                          "4416e16f-4347-4478-a8ff-e7439fd43584"
                        ],
                        "href": "http://10.204.216.36:9100/virtual-machine-interface/4416e16f-4347-4478-a8ff-e7439fd43584",
                        "attr": null,
                        "uuid": "4416e16f-4347-4478-a8ff-e7439fd43584"
                      }
                    ],
                    "parent_type": "project",
                    "instance_ip_back_refs": [
                      {
                        "to": [
                          "2d0f5a5c-d2be-4092-a631-05e1c428f06d"
                        ],
                        "href": "http://10.204.216.36:9100/instance-ip/2d0f5a5c-d2be-4092-a631-05e1c428f06d",
                        "attr": null,
                        "uuid": "2d0f5a5c-d2be-4092-a631-05e1c428f06d"
                      }
                    ],
                    "network_ipam_refs": [
                      {
                        "subnet": {
                          "ipam_subnet": "12.1.1.0/28",
                          "default_gateway": "12.1.1.14",
                          "ipam": [
                            "default-domain",
                            "admin",
                            "admin-default-ipam"
                          ]
                        }
                      },
                      {
                        "subnet": {
                          "ipam_subnet": "13.1.1.0/28",
                          "default_gateway": "13.1.1.14",
                          "ipam": [
                            "default-domain",
                            "admin",
                            "admin-default-ipam"
                          ]
                        }
                      }
                    ],
                    "name": "vnet1"
                  }
                },
                {
                  "virtual-network": {
                    "virtual_network_properties": {
                      "network_id": 18,
                      "vxlan_network_identifier": null,
                      "forwarding_mode": "l2_l3",
                      "extend_to_external_routers": null
                    },
                    "fq_name": [
                      "default-domain",
                      "admin",
                      "inet1"
                    ],
                    "uuid": "a8fb930d-a5e9-42a7-9695-10d651ea50ee",
                    "network_policy_refs": [
                      {
                        "to": [
                          "default-domain",
                          "admin",
                          "p1"
                        ],
                        "href": "http://10.204.216.36:9100/network-policy/16cb8e78-e807-4e4d-be26-fe13c6b48994",
                        "attr": {
                          "timer": null,
                          "sequence": {
                            "major": 0,
                            "minor": 0
                          }
                        },
                        "uuid": "16cb8e78-e807-4e4d-be26-fe13c6b48994"
                      }
                    ],
                    "parent_uuid": "77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "parent_href": "http://10.204.216.36:9100/project/77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "parent_type": "project",
                    "route_target_list": {},
                    "name": "inet1",
                    "network_ipam_refs": []
                  }
                },
                {
                  "virtual-network": {
                    "virtual_network_properties": {
                      "network_id": 19,
                      "vxlan_network_identifier": null,
                      "forwarding_mode": "l2_l3",
                      "extend_to_external_routers": null
                    },
                    "fq_name": [
                      "default-domain",
                      "admin",
                      "inet2"
                    ],
                    "uuid": "0590e4fd-c04f-4a01-afff-5baad58cae52",
                    "network_policy_refs": [
                      {
                        "to": [
                          "default-domain",
                          "admin",
                          "p1"
                        ],
                        "href": "http://10.204.216.36:9100/network-policy/16cb8e78-e807-4e4d-be26-fe13c6b48994",
                        "attr": {
                          "timer": null,
                          "sequence": {
                            "major": 0,
                            "minor": 0
                          }
                        },
                        "uuid": "16cb8e78-e807-4e4d-be26-fe13c6b48994"
                      }
                    ],
                    "parent_uuid": "77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "parent_href": "http://10.204.216.36:9100/project/77fcb541-5745-4d9f-93c2-b2a0d2f6baa4",
                    "parent_type": "project",
                    "name": "inet2",
                    "network_ipam_refs": []
                  }
                }
              ],
              "lastKey": "0590e4fd-c04f-4a01-afff-5baad58cae52",
              "more": false
            }
    }
}

var vnMock = new VirtulNetworkMockData();