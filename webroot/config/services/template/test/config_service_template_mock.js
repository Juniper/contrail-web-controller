function ServiceTemplateMockData(){
	this.getProjectsMockData = function() {
        var projects = {
            "projects": [
            {
                "fq_name": [
                "default-domain",
                "admin"
                ],
                "uuid": "ae976876-e159-4813-9f89-0b796ee7b496"
            },
            {
                "fq_name": [
                "default-domain",
                "demo"
                ],
                "uuid": "62f6e766-fa8e-46ca-ac20-065bc1d8f976"
            }]
        };
        return projects;
    }

    this.getDomainsMockData = function() {
	    var domain = {
            "domains": [
            {
                "href": "http://10.204.217.67:9100/domain/ff34b683-afed-46a0-9157-24f7e2266bbe",
                "fq_name": [
                "default-domain"
                ],
                "uuid": "ff34b683-afed-46a0-9157-24f7e2266bbe"
            }
       ]};
	   return domain;
    }

	
	
    this.getTemplateMockData = function() {
	var template = {
    "data": {
    "service_templates": [
      {
        "service-template": {
          "fq_name": [
            "default-domain",
            "temp1"
          ],
          "uuid": "5e321c6a-7725-4982-9c04-ec506c989670",
          "parent_uuid": "33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_href": "http://10.204.217.22:9100/domain/33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_type": "domain",
          "service_template_properties": {
            "ordered_interfaces": true,
            "interface_type": [
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "management"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "left"
              }
            ],
            "image_name": "ubuntu",
            "service_mode": "transparent",
            "service_type": "firewall",
            "flavor": "m1.medium",
            "service_scaling": false
          },
          "href": "http://10.204.217.22:9100/service-template/5e321c6a-7725-4982-9c04-ec506c989670",
          "id_perms": {
            "enable": true,
            "description": null,
            "created": "2014-03-05T04:43:10.974497",
            "uuid": {
              "uuid_mslong": 6787518831991802000,
              "uuid_lslong": 11242370399987080000
            },
            "last_modified": "2014-03-05T04:43:10.974497",
            "permissions": {
              "owner": "cloud-admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "cloud-admin-group",
              "group_access": 7
            }
          },
          "service_instance_back_refs": [
            {
              "to": [
                "default-domain",
                "admin",
                "inst1"
              ],
              "href": "http://10.204.217.22:9100/service-instance/24319b29-b63b-4ba7-b422-963f35ef54d1",
              "attr": null,
              "uuid": "24319b29-b63b-4ba7-b422-963f35ef54d1"
            }
          ],
          "name": "temp1"
        }
      },
      {
        "service-template": {
          "fq_name": [
            "default-domain",
            "test1"
          ],
          "uuid": "6ba112bd-4665-4642-b474-44888ae51101",
          "parent_uuid": "33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_href": "http://10.204.217.22:9100/domain/33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_type": "domain",
          "service_template_properties": {
            "ordered_interfaces": true,
            "interface_type": [
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "management"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "left"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "right"
              }
            ],
            "image_name": "sugarcrm",
            "service_mode": "transparent",
            "service_type": "firewall",
            "flavor": "m1.medium",
            "service_scaling": false
          },
          "href": "http://10.204.217.22:9100/service-template/6ba112bd-4665-4642-b474-44888ae51101",
          "id_perms": {
            "enable": true,
            "description": null,
            "created": "2014-03-05T09:34:18.764138",
            "uuid": {
              "uuid_mslong": 7755500637447866000,
              "uuid_lslong": 13003093377361973000
            },
            "last_modified": "2014-03-05T09:34:18.764138",
            "permissions": {
              "owner": "cloud-admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "cloud-admin-group",
              "group_access": 7
            }
          },
          "service_instance_back_refs": [
            {
              "to": [
                "default-domain",
                "admin",
                "inst2"
              ],
              "href": "http://10.204.217.22:9100/service-instance/ac7d341b-31ba-401f-9b9c-0e0f910b4e5f",
              "attr": null,
              "uuid": "ac7d341b-31ba-401f-9b9c-0e0f910b4e5f"
            }
          ],
          "name": "test1"
        }
      },
      {
        "service-template": {
          "fq_name": [
            "default-domain",
            "nat-template"
          ],
          "uuid": "71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b",
          "parent_uuid": "33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_href": "http://10.204.217.22:9100/domain/33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_type": "domain",
          "service_template_properties": {
            "ordered_interfaces": true,
            "interface_type": [
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "management"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "left"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "right"
              }
            ],
            "image_name": "nat-service",
            "service_mode": "in-network-nat",
            "service_type": "firewall",
            "flavor": "m1.medium",
            "service_scaling": false
          },
          "href": "http://10.204.217.22:9100/service-template/71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b",
          "id_perms": {
            "enable": true,
            "uuid": {
              "uuid_mslong": 8190546651280395000,
              "uuid_lslong": 12269009181009025000
            },
            "created": "2014-03-03T05:20:14.832133",
            "description": null,
            "last_modified": "2014-03-03T05:20:14.838117",
            "permissions": {
              "owner": "cloud-admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "cloud-admin-group",
              "group_access": 7
            }
          },
          "service_instance_back_refs": [
            {
              "to": [
                "default-domain",
                "demo",
                "test"
              ],
              "href": "http://10.204.217.22:9100/service-instance/8c31d057-60dd-4adb-89d0-be5c079fff0f",
              "attr": null,
              "uuid": "8c31d057-60dd-4adb-89d0-be5c079fff0f"
            }
          ],
          "name": "nat-template"
        }
      },
      {
        "service-template": {
          "fq_name": [
            "default-domain",
            "test2"
          ],
          "uuid": "da1ee5e3-8c9d-4586-a9f8-ad5b75e0d841",
          "parent_uuid": "33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_href": "http://10.204.217.22:9100/domain/33dcb7dd-7122-4aa7-99b1-f204dab44d57",
          "parent_type": "domain",
          "service_template_properties": {
            "ordered_interfaces": true,
            "interface_type": [
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "management"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "left"
              },
              {
                "static_route_enable": false,
                "shared_ip": false,
                "service_interface_type": "right"
              }
            ],
            "image_name": "vsrxbridge",
            "service_mode": "in-network",
            "service_type": "firewall",
            "flavor": "m1.medium",
            "service_scaling": false
          },
          "href": "http://10.204.217.22:9100/service-template/da1ee5e3-8c9d-4586-a9f8-ad5b75e0d841",
          "id_perms": {
            "enable": true,
            "description": null,
            "created": "2014-03-05T09:44:32.416166",
            "uuid": {
              "uuid_mslong": 15717252515049064000,
              "uuid_lslong": 12247729794965363000
            },
            "last_modified": "2014-03-05T09:44:32.416166",
            "permissions": {
              "owner": "cloud-admin",
              "owner_access": 7,
              "other_access": 7,
              "group": "cloud-admin-group",
              "group_access": 7
            }
          },
          "service_instance_back_refs": [
            {
              "to": [
                "default-domain",
                "admin",
                "inst4"
              ],
              "href": "http://10.204.217.22:9100/service-instance/96123ba1-83ab-4365-b0c0-875d89450265",
              "attr": null,
              "uuid": "96123ba1-83ab-4365-b0c0-875d89450265"
            },
            {
              "to": [
                "default-domain",
                "admin",
                "inst3"
              ],
              "href": "http://10.204.217.22:9100/service-instance/cbd4888c-984d-4759-a421-4b7eceb6dade",
              "attr": null,
              "uuid": "cbd4888c-984d-4759-a421-4b7eceb6dade"
            }
          ],
          "name": "test2"
        }
      }
    ]
    },
    "lastKey": null,
    "more": false
    };
	return domain;
    }
}
var STMock = new ServiceTemplateMockData();