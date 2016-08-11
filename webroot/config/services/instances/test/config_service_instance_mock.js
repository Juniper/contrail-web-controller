/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
//var viewData="";
function ServiceInstanceMockData(){	
/*	this.loadView = function(){
	    var client = new XMLHttpRequest();
        client.open('GET', '../views/svcinstances_config.view');
        client.onreadystatechange = function() {
            if(client.readyState == 4){
			    if(client.responseText != "" && client.responseText != null && client.responseText != undefined){
                    viewData = client.responseText;
					start();
				}
			}
        }
        client.send();
	}
	*/
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
/*
	this.getViewData = function() {
        return(viewData);
    }
*/

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

	this.getServiceInstStatusMockData = function() {
	var SIStatus = [
    {
    "ConfigData": {
      "service-instance": {
        "fq_name": [
          "default-domain",
          "demo",
          "test"
        ],
        "uuid": "8c31d057-60dd-4adb-89d0-be5c079fff0f",
        "parent_type": "project",
        "parent_uuid": "5f5156d8-b2e6-4a00-9c78-39809c93a66a",
        "parent_href": "http://10.204.217.22:9100/project/5f5156d8-b2e6-4a00-9c78-39809c93a66a",
        "service_instance_properties": {
          "management_virtual_network": "",
          "right_virtual_network": "default-domain:admin:svc-vn-right",
          "scale_out": {
            "max_instances": 1
          },
          "left_virtual_network": "default-domain:admin:svc-vn-left",
          "interface_list": [
            {
              "virtual_network": ""
            },
            {
              "virtual_network": "default-domain:admin:svc-vn-left"
            },
            {
              "virtual_network": "default-domain:admin:svc-vn-right"
            }
          ]
        },
        "href": "http://10.204.217.22:9100/service-instance/8c31d057-60dd-4adb-89d0-be5c079fff0f",
        "id_perms": {
          "enable": true,
          "description": null,
          "created": "2014-03-12T11:34:46.382543",
          "uuid": {
            "uuid_mslong": 10102084512874580000,
            "uuid_lslong": 9930646480826139000
          },
          "last_modified": "2014-03-12T11:34:46.382543",
          "permissions": {
            "owner": "cloud-admin",
            "owner_access": 7,
            "other_access": 7,
            "group": "cloud-admin-group",
            "group_access": 7
          }
        },
        "service_template_refs": [
          {
            "to": [
              "default-domain",
              "nat-template"
            ],
            "href": "http://10.204.217.22:9100/service-template/71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b",
            "attr": null,
            "uuid": "71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b"
          }
        ],
        "name": "test"
      }
    },
    "vmStatus": "Spawning"
    }]
	return SIStatus;
    }
	
    this.getServiceInstListMockData = function() {
	var SIList =[
    {
    "service-instance": {
      "fq_name": [
        "default-domain",
        "demo",
        "test"
      ],
      "uuid": "8c31d057-60dd-4adb-89d0-be5c079fff0f",
      "parent_type": "project",
      "parent_uuid": "5f5156d8-b2e6-4a00-9c78-39809c93a66a",
      "parent_href": "http://10.204.217.22:9100/project/5f5156d8-b2e6-4a00-9c78-39809c93a66a",
      "service_instance_properties": {
        "management_virtual_network": "",
        "right_virtual_network": "default-domain:admin:svc-vn-right",
        "scale_out": {
          "max_instances": 1
        },
        "left_virtual_network": "default-domain:admin:svc-vn-left",
        "interface_list": [
          {
            "virtual_network": ""
          },
          {
            "virtual_network": "default-domain:admin:svc-vn-left"
          },
          {
            "virtual_network": "default-domain:admin:svc-vn-right"
          }
        ]
      },
      "href": "http://10.204.217.22:9100/service-instance/8c31d057-60dd-4adb-89d0-be5c079fff0f",
      "id_perms": {
        "enable": true,
        "description": null,
        "created": "2014-03-12T11:34:46.382543",
        "uuid": {
          "uuid_mslong": 10102084512874580000,
          "uuid_lslong": 9930646480826139000
        },
        "last_modified": "2014-03-12T11:34:46.382543",
        "permissions": {
          "owner": "cloud-admin",
          "owner_access": 7,
          "other_access": 7,
          "group": "cloud-admin-group",
          "group_access": 7
        }
      },
      "service_template_refs": [
        {
          "to": [
            "default-domain",
            "nat-template"
          ],
          "href": "http://10.204.217.22:9100/service-template/71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b",
          "attr": null,
          "uuid": "71aaaac8-b1d5-4bd6-aa44-46d89c0c9a0b"
        }
      ],
      "name": "test"
    }}]
	return SIList;
    }

	this.getServiceTemplateMockData = function() {
        var service_templates = {
            "service_templates": [
            {
                "service-template": {
                "fq_name": [
                    "default-domain",
                    "nat-template"
                ],
                "uuid": "73cb1400-b757-48fc-8b15-79e214af4016",
                "parent_uuid": "ff34b683-afed-46a0-9157-24f7e2266bbe",
                "parent_href": "http://10.204.217.67:9100/domain/ff34b683-afed-46a0-9157-24f7e2266bbe",
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
        "href": "http://10.204.217.67:9100/service-template/73cb1400-b757-48fc-8b15-79e214af4016",
        "id_perms": {
          "enable": true,
          "uuid": {
            "uuid_mslong": 8343784727942482000,
            "uuid_lslong": 10022050557699506000
          },
          "created": "2014-03-04T07:35:35.754455",
          "description": null,
          "last_modified": "2014-03-04T07:35:35.775910",
          "permissions": {
            "owner": "cloud-admin",
            "owner_access": 7,
            "other_access": 7,
            "group": "cloud-admin-group",
            "group_access": 7
          }
        },
        "name": "nat-template"
      }
    },
    {
      "service-template": {
        "fq_name": [
          "default-domain",
          "test"
        ],
        "uuid": "0cc8e0c1-c03f-4528-944f-06c966225b73",
        "parent_uuid": "ff34b683-afed-46a0-9157-24f7e2266bbe",
        "parent_href": "http://10.204.217.67:9100/domain/ff34b683-afed-46a0-9157-24f7e2266bbe",
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
          "image_name": "vsrxbridge",
          "service_mode": "transparent",
          "service_type": "firewall",
          "flavor": "m1.medium",
          "service_scaling": false
        },
        "href": "http://10.204.217.67:9100/service-template/0cc8e0c1-c03f-4528-944f-06c966225b73",
        "id_perms": {
          "enable": true,
          "description": null,
          "created": "2014-03-06T06:09:43.704843",
          "uuid": {
            "uuid_mslong": 921233246555948300,
            "uuid_lslong": 10686767902845196000
          },
          "last_modified": "2014-03-06T06:09:43.704843",
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
              "test"
            ],
            "href": "http://10.204.217.67:9100/service-instance/76ef3ee6-b806-4904-ad5a-f65acb7d5bf3",
            "attr": null,
            "uuid": "76ef3ee6-b806-4904-ad5a-f65acb7d5bf3"
          }
        ],
        "name": "test"
      }
    }
  ]
};
	   return service_templates;
}
	
	this.getNetworkMockData = function() {
	   var network = {
    "virtual-networks": [
    {
      "href": "http://10.204.217.22:9100/virtual-network/81cc85cf-311c-48b6-8936-1ed63bc03004",
      "fq_name": [
        "default-domain",
        "admin",
        "svc-vn-left"
      ],
      "uuid": "81cc85cf-311c-48b6-8936-1ed63bc03004"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/db1a3678-71c7-4e27-ac5f-294ff145c56b",
      "fq_name": [
        "default-domain",
        "admin",
        "svc-vn-mgmt"
      ],
      "uuid": "db1a3678-71c7-4e27-ac5f-294ff145c56b"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/d2880964-cfa4-4e8f-b34d-0ba89d2ceb5e",
      "fq_name": [
        "default-domain",
        "admin",
        "svc-vn-right"
      ],
      "uuid": "d2880964-cfa4-4e8f-b34d-0ba89d2ceb5e"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/a3949d33-139b-43bc-b31d-c1d975a9575c",
      "fq_name": [
        "default-domain",
        "admin",
        "vn1"
      ],
      "uuid": "a3949d33-139b-43bc-b31d-c1d975a9575c"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/fca74db5-e528-477f-9f3c-ea00202ace62",
      "fq_name": [
        "default-domain",
        "admin",
        "vnet0"
      ],
      "uuid": "fca74db5-e528-477f-9f3c-ea00202ace62"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/d6279113-c1bf-4123-a0fb-9966f2aa8c8d",
      "fq_name": [
        "default-domain",
        "admin",
        "vnet1"
      ],
      "uuid": "d6279113-c1bf-4123-a0fb-9966f2aa8c8d"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/876edca5-ad34-4ae9-84f5-9a913181908e",
      "fq_name": [
        "default-domain",
        "default-project",
        "__link_local__"
      ],
      "uuid": "876edca5-ad34-4ae9-84f5-9a913181908e"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/baef88e4-472f-4b74-9bc5-2f9f94f48238",
      "fq_name": [
        "default-domain",
        "default-project",
        "default-virtual-network"
      ],
      "uuid": "baef88e4-472f-4b74-9bc5-2f9f94f48238"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/63c2385a-716c-40ef-ad6e-21a3f1b25d3a",
      "fq_name": [
        "default-domain",
        "default-project",
        "ip-fabric"
      ],
      "uuid": "63c2385a-716c-40ef-ad6e-21a3f1b25d3a"
    },
    {
      "href": "http://10.204.217.22:9100/virtual-network/38c96d10-5eff-49b3-a66a-0706fca0964d",
      "fq_name": [
        "default-domain",
        "demo",
        "svc-vn-mgmt"
      ],
      "uuid": "38c96d10-5eff-49b3-a66a-0706fca0964d"
    }
    ]
    };
	return network;
    }
	
	this.getImagesMockData = function() {
	var images = {
    "images": [
    {
      "name": "sugarcrm",
      "container_format": "ovf",
      "disk_format": "vmdk",
      "checksum": "b3c17ac519a630faa1887c9fb4a51e97",
      "id": "57e71a4a-5586-4dae-88d0-46647587a5c2",
      "size": 907739136
    },
    {
      "name": "vsrx-fw-no-ping",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "cc4a985ace54a1406452f5614b4463bc",
      "id": "e5ee39c9-4290-47e6-83b3-7c9ab2bc645e",
      "size": 339410944
    },
    {
      "name": "Tier2-DB",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "684f5c787ae58082b01c194c06b4addd",
      "id": "fbe096d3-8b36-4a9a-b6dd-34eafeb23140",
      "size": 922746880
    },
    {
      "name": "Tier2-Web",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "a552cc2724660e0c2a50e8b99c48ce62",
      "id": "b2e9d83c-6635-4107-9189-d788df914884",
      "size": 925892608
    },
    {
      "name": "Tier1-LB",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "65776c837089a9b9d23734424b270124",
      "id": "e0e2da2d-c9f4-4678-abf3-56598c6f48b0",
      "size": 1191247872
    },
    {
      "name": "demo-ddos",
      "container_format": "ovf",
      "disk_format": "vmdk",
      "checksum": "b70054895b35bfe947c96f6e1641c1d6",
      "id": "00aa76f0-cd64-416c-9dc8-9d38c72d41b1",
      "size": 1387593728
    },
    {
      "name": "ddos",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "8048f0696374b8a6b5d101ae720e8e50",
      "id": "2d8c8e54-e0b2-47e7-93d0-a7a79628383c",
      "size": 2794979328
    },
    {
      "name": "analyzer",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "4344c84da0acc103f784dad943267290",
      "id": "81225aab-0bef-4521-800c-e8e8a1ba3a5e",
      "size": 3593011200
    },
    {
      "name": "ubuntu-netperf",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "99030e4e301aff8d09a40b14fcd34b14",
      "id": "5788c062-10d9-491f-8c0c-3417f090cece",
      "size": 3991863296
    },
    {
      "name": "vsrxbridge",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "2fefebaa980c819821f0ca12a7875c9b",
      "id": "04a68cdb-c739-4f23-9705-215c9ea5cf40",
      "size": 272367616
    },
    {
      "name": "nat-service",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "ca712c500e9a05805aad1a93566beeb5",
      "id": "ac7939ee-1584-474b-b636-5cebe50baa17",
      "size": 338493440
    },
    {
      "name": "ubuntu-traffic",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "f9bdfa30f3c198e7865a7967413032ec",
      "id": "65c381e3-fd0f-4e0a-bb9d-3762a1f5673f",
      "size": 1142620160
    },
    {
      "name": "ubuntu",
      "container_format": "ovf",
      "disk_format": "qcow2",
      "checksum": "f8c767da4a3dc906f9a87c9bcee9c453",
      "id": "c6efcc5d-cb19-4982-a0bb-d9693f5a8af4",
      "size": 730464256
    },
    {
      "name": "redmine-db",
      "container_format": "ovf",
      "disk_format": "vmdk",
      "checksum": "e667ba750f9969e6afdf4a05af787c8e",
      "id": "9832de79-9833-4844-900c-a6f5418350e3",
      "size": 1336279040
    },
    {
      "name": "redmine-web",
      "container_format": "ovf",
      "disk_format": "vmdk",
      "checksum": "55bb0e98590c4d92bd796850ba9fc62b",
      "id": "ba76faf7-d403-496e-bba6-4e485e416a4e",
      "size": 1343619072
    }
    ]
    };
	return images;
	}
	
    this.getdomData = function() {
	   var domStr= '<div class="row-fluid">';
           domStr+= '<div class="row-fluid margin-0-0-10">';
           domStr+= '<select id="ddDomainSwitcher" class="col-xs-2"></select>';
           domStr+= '<select id="ddProjectSwitcher" class="col-xs-2"></select>';
           domStr+= '<div class="col-xs-8">';
           domStr+= '<button id="btnDeletesvcInstances" type="button" class="btn btn-primary btn-mini pull-right" disabled="disabled">Delete</button>';
           domStr+= '<button id="btnCreatesvcInstances" type="button" class="btn btn-primary btn-mini pull-right" disabled="disabled">Create</button>';
           domStr+= '</div>';
           domStr+= '</div>';
           domStr+= '<div class="row-fluid">';
           domStr+= '<div class="col-xs-12">';
           domStr+= '<div id="gridsvcInstances"/>';
           domStr+= '</div>';
           domStr+= '</div>';
           domStr+= '<br>';
           domStr+= '<div id="vnc-console-widget" class="widget-box hide transparent">';
           domStr+= '<div class="widget-header row-fluid col-xs-12">';
           domStr+= '<h4 class="smaller col-xs-12">';
           domStr+= '<span>';
           domStr+= '<span>';
           domStr+= '<i class="fa fa-list-alt blue"></i>';
           domStr+= '<span id="vnc-console-title">VNC Console</span>';
           domStr+= '</span>';
           domStr+= '<div class="widget-toolbar pull-right">';
           domStr+= '<a data-action="close-hide">';
           domStr+= '<i class="fa fa-remove"></i>';
           domStr+= '</a>';
           domStr+= '</div>';
           domStr+= '<div class="widget-toolbar pull-right">';
           domStr+= '<a data-action="collapse">';
           domStr+= '<i class="fa fa-chevron-down"></i>';
           domStr+= '</a>';
           domStr+= '</div>';
           domStr+= '<span id="consoleText" class="smaller text-center pull-right"></span>';
           domStr+= '</h4>';
           domStr+= '</div>';
           domStr+= '<div class="widget-body">';
           domStr+= '<div class="widget-main">';
           domStr+= '<div class="row-fluid">';
           domStr+= '<iframe id="vnc-console-frame" src="" class="col-xs-12 height-840"></iframe>';
           domStr+= '</div>';
           domStr+= '</div>';
           domStr+= '</div>';
           domStr+= '</div>';
           domStr+= '</div>';
		return domStr;
	}

    this.getAlldomData = function() {
	var domStr = SIMock.getdomData();
	    domStr += '<div id="windowCreateSvcInstances" class="modal modal-700 hide" tabindex="-1">';
        domStr += '<div class="modal-header">';
        domStr += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="fa fa-remove"></i></button>';
        domStr += '<h6 class="modal-header-title"></h6>';
        domStr += '</div>';
        domStr += '<div class="modal-body">';
        domStr += '<form class="form-horizontal">';
        domStr += '<div class="control-group">';
        domStr += '<label class="control-label" class="col-xs-3">Instance Name</label>';
        domStr += '<div class="controls">';
        domStr += '<div class="row-fluid">';
        domStr += '<input type="text" id="txtsvcInstanceName" class="col-xs-10"/>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '<div class="control-group ">';
        domStr += '<label class="control-label" class="col-xs-3">Services Template</label>';
        domStr += '<div class="controls">';
        domStr += '<div class="row-fluid">';
        domStr += '<select type="text" id="ddsvcTemplate" class="col-xs-10"></select>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '<div id="maxInstances" class="control-group">';
        domStr += '<label class="control-label">Number of instances</label>';
        domStr += '<div class="controls">';
        domStr += '<div class="row-fluid">';
        domStr += '<input type="text" id="txtMaximumInstances" class="col-xs-10"/>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '<div id="instanceDiv"></div>';
        domStr += '</form>';
        domStr += '</div>';
        domStr += '<div class="modal-footer">';
        domStr += '<button id="btnCreatesvcInstencesCancel" class="btn btn-mini" data-dismiss="modal" aria-hidden="true">Cancel</button>';
        domStr += '<button id="btnCreatesvcInstencesOK" class="btn btn-primary btn-mini">Save</button>';
        domStr += '</div>';
        domStr += '</div>';

        domStr += '<div id="confirmDelete" class="modal modal-420 hide" tabindex="-1">';
        domStr += '<div class="modal-header">';
        domStr += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="fa fa-remove"></i></button>';
        domStr += '<h6 class="modal-header-title"></h6>';
        domStr += '</div>';
        domStr += '<div class="modal-body">';
        domStr += '<div class="row-fluid text-center">';
        domStr += '<h6>Confirm Service Instance(s) delete</h6>';
        domStr += '</div>';
        domStr += '</div>';
        domStr += '<div class="modal-footer">';
        domStr += '<button id="btnCnfDelSInstPopupCancel" class="btn btn-mini" data-dismiss="modal" aria-hidden="true">Cancel</button>';
        domStr += '<button id="btnCnfDelSInstPopupOK" class="btn btn-primary btn-mini">Confirm</button>';
        domStr += '</div>';
        domStr += '</div>';
		return domStr;
	}
}
var SIMock = new ServiceInstanceMockData();