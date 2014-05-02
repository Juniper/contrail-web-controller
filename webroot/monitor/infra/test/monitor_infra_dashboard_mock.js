function InfraMockData() {
    var mockData = {
        //parsevRoutersDashboardData mock input
        'parsevRoutersDashboardData' : {
            input: {
                'VROUTER_SUMMARY' : [{
                    "name": "nodeh7",
                    "value": {
                        "VrouterStatsAgent": {
                            "cpu_info": {
                                "sys_mem_info": {
                                    "total": 65939744,
                                    "buffers": 217324,
                                    "free": 38236984,
                                    "used": 27702760
                                },
                                "meminfo": {
                                    "virt": 402524,
                                    "peakvirt": 402528,
                                    "res": 53208
                                },
                                "cpu_share": 0.0500083,
                                "num_cpu": 4,
                                "cpuload": {
                                    "fifteen_min_avg": 0.4,
                                    "five_min_avg": 0.53,
                                    "one_min_avg": 0.27
                                }
                            },
                            "cpu_share": [{
                                "history-10": {
                                    "{\"ts\":1391071405682953}": 0.0513946,
                                    "{\"ts\":1391071945689822}": 0.0486192,
                                    "{\"ts\":1391072125692131}": 0.0500056,
                                    "{\"ts\":1391072305694462}": 0.0486192,
                                    "{\"ts\":1391072485696898}": 0.0513946,
                                    "{\"ts\":1391071045678159}": 0.0513946,
                                    "{\"ts\":1391072665699197}": 0.0500083,
                                    "{\"ts\":1391071225680551}": 0.0472301,
                                    "{\"ts\":1391071765687407}": 0.0513946,
                                    "{\"ts\":1391071585685119}": 0.0513975
                                }
                            }, {
                                "s-3600-topvals": {
                                    "2014 Jan 30 09:04:25.699": 0.0500083,
                                    "2014 Jan 30 09:01:25.696": 0.0513946
                                }
                            }, {
                                "s-3600-summary": {
                                    "sum": "0.1014029",
                                    "b1": "2"
                                }
                            }],
                            "process_state_list": [{
                                "process_name": "contrail-vrouter",
                                "process_state": "PROCESS_STATE_RUNNING",
                                "last_stop_time": null,
                                "start_count": 1,
                                "core_file_list": [],
                                "last_start_time": "1391061692459593",
                                "stop_count": 0,
                                "last_exit_time": null,
                                "exit_count": 0
                            }, {
                                "process_name": "contrail-vrouter-nodemgr",
                                "process_state": "PROCESS_STATE_RUNNING",
                                "last_stop_time": null,
                                "start_count": 1,
                                "core_file_list": [],
                                "last_start_time": "1391061690455524",
                                "stop_count": 0,
                                "last_exit_time": null,
                                "exit_count": 0
                            }, {
                                "process_name": "openstack-nova-compute",
                                "process_state": "PROCESS_STATE_RUNNING",
                                "last_stop_time": null,
                                "start_count": 1,
                                "core_file_list": [],
                                "last_start_time": "1391061733842477",
                                "stop_count": 0,
                                "last_exit_time": null,
                                "exit_count": 0
                            }]
                        },
                        "VrouterAgent": {
                            "xmpp_peer_list": [
                                               {
                                                 "status": true,
                                                 "ip": "10.204.216.40",
                                                 "primary": true,
                                                 "setup_time": 1395208421723661
                                               },
                                               {
                                                 "status": true,
                                                 "ip": "10.204.217.111",
                                                 "primary": false,
                                                 "setup_time": 1395208421725459
                                               }
                                             ],
                            "control_ip": "10.204.217.111",
                            "build_info": "{\"build-info\":[{\"build-time\":\"2014-01-29 10:45:37.687462\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1101.el6\",\"build-number\":\"1101\"}]}",
                            "self_ip_list": ["10.204.217.111"]
                        },
                        "ConfigData": {
                            "virtual-router": {
                                "fq_name": ["default-global-system-config", "nodeh7"],
                                "uuid": "00679f8c-c6c7-4d79-bcc2-231aec9615b8",
                                "parent_uuid": "c569c9ee-e004-4a44-a50c-f464392d77c4",
                                "parent_href": "http://10.204.217.111:9100/global-system-config/c569c9ee-e004-4a44-a50c-f464392d77c4",
                                "parent_type": "global-system-config",
                                "href": "http://10.204.217.111:9100/virtual-router/00679f8c-c6c7-4d79-bcc2-231aec9615b8",
                                "id_perms": {
                                    "enable": true,
                                    "description": null,
                                    "created": "2014-01-30T05:59:35.812858",
                                    "uuid": {
                                        "uuid_mslong": 29167349580385656,
                                        "uuid_lslong": 13601472423157700000
                                    },
                                    "last_modified": "2014-01-30T05:59:35.812858",
                                    "permissions": {
                                        "owner": "cloud-admin",
                                        "owner_access": 7,
                                        "other_access": 7,
                                        "group": "cloud-admin-group",
                                        "group_access": 7
                                    }
                                },
                                "virtual_router_ip_address": "10.204.217.111",
                                "name": "nodeh7"
                            }
                        },
                        "VRouterAgent": {}
                    },
                    "nodeStatus": "Up"
                }],
                'test1': [
                	    {
                	      "name": "nodea2",
                	      "value": {
                	        "VrouterStatsAgent": {
                	          "cpu_info": {
                	            "sys_mem_info": {
                	              "total": 32922028,
                	              "buffers": 217140,
                	              "free": 14359924,
                	              "used": 18562104
                	            },
                	            "meminfo": {
                	              "virt": 382376,
                	              "peakvirt": 382380,
                	              "res": 47924
                	            },
                	            "cpu_share": 0.0499972,
                	            "num_cpu": 4,
                	            "cpuload": {
                	              "fifteen_min_avg": 0.24,
                	              "five_min_avg": 0.29,
                	              "one_min_avg": 0.29
                	            }
                	          },
                	          "cpu_share": [
                	            {
                	              "history-10": {
                	                "{\"ts\":1395208604755517}": 0.0638344,
                	                "{\"ts\":1395210044772620}": 0.0499972,
                	                "{\"ts\":1395208964760016}": 0.0486084,
                	                "{\"ts\":1395209144762270}": 0.0541667,
                	                "{\"ts\":1395209684768553}": 0.0541667,
                	                "{\"ts\":1395208784757686}": 0.0527778,
                	                "{\"ts\":1395209864770518}": 0.0444444,
                	                "{\"ts\":1395209324764346}": 0.0513889,
                	                "{\"ts\":1395209504766490}": 0.0486111
                	              }
                	            },
                	            {
                	              "s-3600-topvals": {
                	                "2014 Mar 19 06:14:44.768": 0.0541667,
                	                "2014 Mar 19 06:08:44.764": 0.0513889,
                	                "2014 Mar 19 06:05:44.762": 0.0541667,
                	                "2014 Mar 19 06:20:44.772": 0.0499972,
                	                "2014 Mar 19 06:11:44.766": 0.0486111
                	              }
                	            },
                	            {
                	              "s-3600-summary": {
                	                "sum": "0.3513834",
                	                "b1": "7"
                	              }
                	            }
                	          ],
                	          "process_state_list": [
                	            {
                	              "process_name": "contrail-vrouter",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": "1395208417363453",
                	              "start_count": 2,
                	              "core_file_list": [],
                	              "last_start_time": "1395208421747763",
                	              "stop_count": 1,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "contrail-vrouter-nodemgr",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137366570779",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "openstack-nova-compute",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137360211414",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            }
                	          ]
                	        },
                	        "VrouterAgent": {
                	          "xmpp_peer_list": [
                	            {
                	              "status": true,
                	              "ip": "10.204.216.40",
                	              "primary": true,
                	              "setup_time": 1395208421723661
                	            },
                	            {
                	              "status": true,
                	              "ip": "10.204.217.111",
                	              "primary": false,
                	              "setup_time": 1395208421725459
                	            }
                	          ],
                	          "control_ip": "10.204.216.40",
                	          "self_ip_list": [
                	            "10.204.216.40"
                	          ],
                	          "build_info": "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic\",\"build-number\":\"1.05-135-3.8.0-29-generic\"}]}"
                	        },
                	        "ConfigData": {
                	          "virtual-router": {
                	            "fq_name": [
                	              "default-global-system-config",
                	              "nodea2"
                	            ],
                	            "uuid": "190ea66f-8134-4598-a238-a5c19db57dbb",
                	            "parent_uuid": "3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_href": "http://10.204.216.46:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_type": "global-system-config",
                	            "href": "http://10.204.216.46:9100/virtual-router/190ea66f-8134-4598-a238-a5c19db57dbb",
                	            "id_perms": {
                	              "enable": true,
                	              "uuid": {
                	                "uuid_mslong": 1805563498461415000,
                	                "uuid_lslong": 11689275083833311000
                	              },
                	              "created": "2014-03-18T09:42:29.675408",
                	              "description": null,
                	              "last_modified": "2014-03-18T10:07:53.364140",
                	              "permissions": {
                	                "owner": "cloud-admin",
                	                "owner_access": 7,
                	                "other_access": 7,
                	                "group": "cloud-admin-group",
                	                "group_access": 7
                	              }
                	            },
                	            "virtual_router_ip_address": "10.204.216.40",
                	            "name": "nodea2"
                	          }
                	        },
                	        "VRouterAgent": {}
                	      },
                	      "nodeStatus": "Up"
                	    },
                	    {
                	      "name": "nodea8",
                	      "value": {
                	        "VrouterStatsAgent": {
                	          "cpu_info": {
                	            "sys_mem_info": {
                	              "total": 32922028,
                	              "buffers": 146444,
                	              "free": 31426684,
                	              "used": 1495344
                	            },
                	            "meminfo": {
                	              "virt": 382480,
                	              "peakvirt": 414624,
                	              "res": 48496
                	            },
                	            "cpu_share": 0.0624965,
                	            "num_cpu": 4,
                	            "cpuload": {
                	              "fifteen_min_avg": 0.09,
                	              "five_min_avg": 0.17,
                	              "one_min_avg": 0.42
                	            }
                	          },
                	          "cpu_share": [
                	            {
                	              "history-10": {
                	                "{\"ts\":1395209541193466}": 0.0652778,
                	                "{\"ts\":1395210081200372}": 0.0624965,
                	                "{\"ts\":1395209001186482}": 0.0625,
                	                "{\"ts\":1395208461179237}": 0.0652742,
                	                "{\"ts\":1395209901198083}": 0.0638889,
                	                "{\"ts\":1395209181188840}": 0.0680518,
                	                "{\"ts\":1395208821184068}": 0.0625,
                	                "{\"ts\":1395209721195690}": 0.0611111,
                	                "{\"ts\":1395208641181687}": 0.0722222,
                	                "{\"ts\":1395209361191108}": 0.0652778
                	              }
                	            },
                	            {
                	              "s-3600-topvals": {
                	                "2014 Mar 19 06:09:21.191": 0.0652778,
                	                "2014 Mar 19 06:06:21.188": 0.0680518,
                	                "2014 Mar 19 06:12:21.193": 0.0652778,
                	                "2014 Mar 19 06:03:21.186": 0.0625,
                	                "2014 Mar 19 06:18:21.198": 0.0638889
                	              }
                	            },
                	            {
                	              "s-3600-summary": {
                	                "sum": "0.5111039",
                	                "b1": "8"
                	              }
                	            }
                	          ],
                	          "process_state_list": [
                	            {
                	              "process_name": "contrail-vrouter",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137363474175",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "contrail-vrouter-nodemgr",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137361471053",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "openstack-nova-compute",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137355364969",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            }
                	          ]
                	        },
                	        "VrouterAgent": {
                	          "xmpp_peer_list": [
                	            {
                	              "status": true,
                	              "ip": "10.204.216.40",
                	              "primary": true,
                	              "setup_time": 1395137373926251
                	            },
                	            {
                	              "status": true,
                	              "ip": "10.204.217.111",
                	              "primary": false,
                	              "setup_time": 1395206848200338
                	            }
                	          ],
                	          "control_ip": "10.204.216.46",
                	          "build_info": "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic1.05-135-3.8.0-29-generic\",\"build-number\":\"\"}]}",
                	          "self_ip_list": [
                	            "10.204.216.46"
                	          ]
                	        },
                	        "ConfigData": {
                	          "virtual-router": {
                	            "fq_name": [
                	              "default-global-system-config",
                	              "nodea8"
                	            ],
                	            "uuid": "fdad41af-75c8-4644-8d21-9810f00fd733",
                	            "parent_uuid": "3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_href": "http://10.204.217.111:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_type": "global-system-config",
                	            "href": "http://10.204.217.111:9100/virtual-router/fdad41af-75c8-4644-8d21-9810f00fd733",
                	            "id_perms": {
                	              "enable": true,
                	              "uuid": {
                	                "uuid_mslong": 18279338684417853000,
                	                "uuid_lslong": 10169576632093760000
                	              },
                	              "created": "2014-03-18T09:42:44.682813",
                	              "description": null,
                	              "last_modified": "2014-03-18T10:07:56.359864",
                	              "permissions": {
                	                "owner": "cloud-admin",
                	                "owner_access": 7,
                	                "other_access": 7,
                	                "group": "cloud-admin-group",
                	                "group_access": 7
                	              }
                	            },
                	            "virtual_router_ip_address": "10.204.216.46",
                	            "name": "nodea8"
                	          }
                	        },
                	        "VRouterAgent": {}
                	      },
                	      "nodeStatus": "Up"
                	    },
                	    {
                	      "name": "nodeh7",
                	      "value": {
                	        "VrouterStatsAgent": {
                	          "cpu_info": {
                	            "sys_mem_info": {
                	              "total": 65945288,
                	              "buffers": 156304,
                	              "free": 57796324,
                	              "used": 8148964
                	            },
                	            "meminfo": {
                	              "virt": 382472,
                	              "peakvirt": 414624,
                	              "res": 48092
                	            },
                	            "cpu_share": 0.0583333,
                	            "num_cpu": 4,
                	            "cpuload": {
                	              "fifteen_min_avg": 0.23,
                	              "five_min_avg": 0.29,
                	              "one_min_avg": 0.23
                	            }
                	          },
                	          "cpu_share": [
                	            {
                	              "history-10": {
                	                "{\"ts\":1395209067896948}": 0.0527778,
                	                "{\"ts\":1395208527888867}": 0.0569444,
                	                "{\"ts\":1395208707891576}": 0.0583301,
                	                "{\"ts\":1395209427902495}": 0.0611111,
                	                "{\"ts\":1395208887894267}": 0.0555556,
                	                "{\"ts\":1395209247899917}": 0.0597189,
                	                "{\"ts\":1395210147912678}": 0.0583333,
                	                "{\"ts\":1395209967909967}": 0.0583301,
                	                "{\"ts\":1395209607905001}": 0.0541667,
                	                "{\"ts\":1395209787907308}": 0.0555556
                	              }
                	            },
                	            {
                	              "s-3600-topvals": {
                	                "2014 Mar 19 06:10:27.902": 0.0611111,
                	                "2014 Mar 19 06:07:27.899": 0.0597189,
                	                "2014 Mar 19 06:22:27.912": 0.0583333,
                	                "2014 Mar 19 06:19:27.909": 0.0583301,
                	                "2014 Mar 19 06:16:27.907": 0.0555556
                	              }
                	            },
                	            {
                	              "s-3600-summary": {
                	                "sum": "0.4555491",
                	                "b1": "8"
                	              }
                	            }
                	          ],
                	          "process_state_list": [
                	            {
                	              "process_name": "contrail-vrouter",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137426055669",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "contrail-vrouter-nodemgr",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137424052005",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            },
                	            {
                	              "process_name": "openstack-nova-compute",
                	              "process_state": "PROCESS_STATE_RUNNING",
                	              "last_stop_time": null,
                	              "start_count": 1,
                	              "core_file_list": [],
                	              "last_start_time": "1395137416543513",
                	              "stop_count": 0,
                	              "last_exit_time": null,
                	              "exit_count": 0
                	            }
                	          ]
                	        },
                	        "VrouterAgent": {
                	          "xmpp_peer_list": [
                	            {
                	              "status": true,
                	              "ip": "10.204.216.40",
                	              "primary": false,
                	              "setup_time": 1395137425291334
                	            },
                	            {
                	              "status": true,
                	              "ip": "10.204.217.111",
                	              "primary": true,
                	              "setup_time": 1395137425290464
                	            }
                	          ],
                	          "control_ip": "10.204.217.111",
                	          "build_info": "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic1.05-135-3.8.0-29-generic\",\"build-number\":\"\"}]}",
                	          "self_ip_list": [
                	            "10.204.217.111"
                	          ]
                	        },
                	        "ConfigData": {
                	          "virtual-router": {
                	            "fq_name": [
                	              "default-global-system-config",
                	              "nodeh7"
                	            ],
                	            "uuid": "138eb56e-f875-420c-801b-cd09a29fe436",
                	            "parent_uuid": "3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_href": "http://10.204.216.40:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                	            "parent_type": "global-system-config",
                	            "href": "http://10.204.216.40:9100/virtual-router/138eb56e-f875-420c-801b-cd09a29fe436",
                	            "id_perms": {
                	              "enable": true,
                	              "uuid": {
                	                "uuid_mslong": 1409263221633008000,
                	                "uuid_lslong": 9231197302492752000
                	              },
                	              "created": "2014-03-18T09:42:32.261121",
                	              "description": null,
                	              "last_modified": "2014-03-18T10:07:54.687991",
                	              "permissions": {
                	                "owner": "cloud-admin",
                	                "owner_access": 7,
                	                "other_access": 7,
                	                "group": "cloud-admin-group",
                	                "group_access": 7
                	              }
                	            },
                	            "virtual_router_ip_address": "10.204.217.111",
                	            "name": "nodeh7"
                	          }
                	        },
                	        "VRouterAgent": {}
                	      },
                	      "nodeStatus": "Up"
                	    }
                	  ]
            },
            output: {
                'VROUTER_SUMMARY' : [
                                     {
                                         "x":0.0500083,
                                         "y":393.08984375,
                                         "cpu":"0.05",
                                         "ip":"10.204.217.111",
                                         "uveIP":[
                                            "10.204.217.111",
                                            "10.204.217.111"
                                         ],
                                         "summaryIps":"10.204.217.111",
                                         "isConfigMissing":false,
                                         "isUveMissing":false,
                                         "configIP":"10.204.217.111",
                                         "processDetails":{
                                            "contrail-vrouter":{
                                               "state":"PROCESS_STATE_RUNNING",
                                               "since":"1391061692459593"
                                            }
                                         },
                                         "histCpuArr":[
                                            0.0513946,
                                            0.0472301,
                                            0.0513946,
                                            0.0513975,
                                            0.0513946,
                                            0.0486192,
                                            0.0500056,
                                            0.0486192,
                                            0.0513946,
                                            0.0500083
                                         ],
                                         "status":"Up since ",
                                         "memory":"393.09 MB",
                                         "size":1,
                                         "shape":"circle",
                                         "xmppPeerDownCnt":0,
                                         "name":"nodeh7",
                                         "instCnt":0,
                                         "intfCnt":0,
                                         "vns":[

                                         ],
                                         "vnCnt":0,
                                         "version":"1.03 (Build 1101)",
                                         "type":"vRouter",
                                         "display_type":"vRouter",
                                         "isPartialUveMissing":false,
                                         "errorIntfCnt":0,
                                         "errorIntfCntText":"",
                                         "uveCfgIPMisMatch":false,
                                         "hostNameColor":"blue",
                                         "processAlerts":[

                                         ],
                                         "isGeneratorRetrieved":false,
                                         "nodeAlerts":[

                                         ],
                                         "alerts":[

                                         ],
                                         "color":"#7892dd",
                                         "downNodeCnt":0
                                      }
                                   ],
                        "test1": []
                }
            },
            parseControlNodesDashboardData: {
                input: {
                    'CONTROLNODES_SUMMARY': [{
                        "name": "nodea8",
                        "value": {
                            "BgpRouterState": {
                                "uptime": 1392031395956100,
                                "num_routing_instance": 6,
                                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-05 19:03:25.840629\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1107.el6\",\"build-number\":\"1107\"}]}",
                                "cpu_info": {
                                    "meminfo": {
                                        "virt": 421336,
                                        "peakvirt": 484484,
                                        "res": 18292
                                    },
                                    "cpu_share": 0.0166694,
                                    "num_cpu": 4
                                },
                                "num_bgp_peer": 0,
                                "cpu_share": [{
                                    "history-10": {
                                        "{\"ts\":1392198499052895}": 0.0166667,
                                        "{\"ts\":1392197599042938}": 0.0166694,
                                        "{\"ts\":1392197899046006}": 0.0166694,
                                        "{\"ts\":1392198559053620}": 0.0166694,
                                        "{\"ts\":1392198139048775}": 0.0166667,
                                        "{\"ts\":1392198019047408}": 0.0125021,
                                        "{\"ts\":1392198199049703}": 0.0166694,
                                        "{\"ts\":1392198079048147}": 0.0208368,
                                        "{\"ts\":1392197839045452}": 0.0208368,
                                        "{\"ts\":1392197779044780}": 0.0166667
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:37:19.45": 0.0208368,
                                        "2014 Feb 12 09:32:19.42": 0.0208368,
                                        "2014 Feb 12 09:41:19.48": 0.0208368,
                                        "2014 Feb 12 09:26:19.38": 0.0208368,
                                        "2014 Feb 12 09:30:19.41": 0.0208368
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "sum": "0.61674832",
                                        "b1": "36"
                                    }
                                }],
                                "bgp_router_ip_list": ["10.204.216.46"],
                                "num_up_xmpp_peer": 1,
                                "num_up_bgp_peer": 0,
                                "output_queue_depth": 0,
                                "num_xmpp_peer": 1,
                                "ifmap_info": {
                                    "url": "10.204.216.46:8443",
                                    "connection_status_change_at": 1392198537704661,
                                    "connection_status": "Down"
                                },
                                "virt_mem": [{
                                    "history-10": {
                                        "{\"ts\":1392189078951501}": 421336,
                                        "{\"ts\":1392189318953851}": 421336,
                                        "{\"ts\":1392173898782740}": 421336,
                                        "{\"ts\":1392186918928765}": 421336,
                                        "{\"ts\":1392167118706305}": 421336,
                                        "{\"ts\":1392191538978175}": 421336,
                                        "{\"ts\":1392187758937653}": 421336,
                                        "{\"ts\":1392190278964837}": 421336,
                                        "{\"ts\":1392193699001033}": 421336,
                                        "{\"ts\":1392190698969422}": 421336
                                    }
                                }, {
                                    "s-3600-topvals": {}
                                }, {
                                    "s-3600-summary": {
                                        "sum": "421336",
                                        "bmax": "1"
                                    }
                                }],
                                "process_state_list": [{
                                    "process_name": "contrail-control",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031408218460",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-control-nodemgr",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031406212682",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-dns",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031410227087",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-named",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031412228269",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }]
                            },
                            "ConfigData": {
                                "bgp-router": {
                                    "fq_name": ["default-domain", "default-project", "ip-fabric", "__default__", "nodea8"],
                                    "uuid": "45544011-52de-473c-91f7-4900674393f0",
                                    "parent_uuid": "24952b3e-bff5-4957-8c00-cb1510fec4d7",
                                    "parent_href": "http://nodea8:8082/routing-instance/24952b3e-bff5-4957-8c00-cb1510fec4d7",
                                    "parent_type": "routing-instance",
                                    "bgp_router_parameters": {
                                        "vendor": "contrail",
                                        "autonomous_system": 64512,
                                        "vnc_managed": null,
                                        "address": "10.204.216.46",
                                        "identifier": "10.204.216.46",
                                        "port": 179,
                                        "address_families": {
                                            "family": ["inet-vpn", "e-vpn"]
                                        }
                                    },
                                    "href": "http://nodea8:8082/bgp-router/45544011-52de-473c-91f7-4900674393f0",
                                    "id_perms": {
                                        "enable": true,
                                        "uuid": {
                                            "uuid_mslong": 4995688329809644000,
                                            "uuid_lslong": 10517955720828391000
                                        },
                                        "created": "2014-02-10T11:21:50.607752",
                                        "description": null,
                                        "last_modified": "2014-02-10T11:21:50.708626",
                                        "permissions": {
                                            "owner": "cloud-admin",
                                            "owner_access": 7,
                                            "other_access": 7,
                                            "group": "cloud-admin-group",
                                            "group_access": 7
                                        }
                                    },
                                    "name": "nodea8"
                                }
                            }
                        },
                        "nodeStatus": "Up"
                    }]
                },
                output: {
                    'CONTROLNODES_SUMMARY': [
                                             {
                                                 "x":0.0166694,
                                                 "y":411.4609375,
                                                 "cpu":"0.02",
                                                 "histCpuArr":[
                                                    0.0166694,
                                                    0.0166667,
                                                    0.0208368,
                                                    0.0166694,
                                                    0.0125021,
                                                    0.0208368,
                                                    0.0166667,
                                                    0.0166694,
                                                    0.0166667,
                                                    0.0166694
                                                 ],
                                                 "uveIP":[
                                                    "10.204.216.46"
                                                 ],
                                                 "configIP":"10.204.216.46",
                                                 "isConfigMissing":false,
                                                 "configuredBgpPeerCnt":0,
                                                 "isUveMissing":false,
                                                 "ip":"10.204.216.46",
                                                 "summaryIps":"10.204.216.46",
                                                 "memory":"411.46 MB",
                                                 "size":1,
                                                 "shape":"circle",
                                                 "name":"nodea8",
                                                 "version":"1.03 (Build 1107)",
                                                 "totalPeerCount":1,
                                                 "totalBgpPeerCnt":0,
                                                 "upBgpPeerCnt":0,
                                                 "establishedPeerCount":0,
                                                 "activevRouterCount":1,
                                                 "upXMPPPeerCnt":1,
                                                 "totalXMPPPeerCnt":1,
                                                 "downXMPPPeerCnt":0,
                                                 "downBgpPeerCnt":0,
                                                 "downXMPPPeerCntText":"",
                                                 "isPartialUveMissing":false,
                                                 "isIfmapDown":true,
                                                 "ifmapDownAt":1392198537704661,
                                                 "downBgpPeerCntText":"",
                                                 "uveCfgIPMisMatch":false,
                                                 "type":"controlNode",
                                                 "display_type":"Control Node",
                                                 "status":"Up since ",
                                                 "hostNameColor":"blue",
                                                 "processAlerts":[

                                                 ],
                                                 "processDetails":{
                                                    "contrail-control":{
                                                       "state":"PROCESS_STATE_RUNNING",
                                                       "since":"1392031408218460"
                                                    },
                                                    "contrail-dns":{
                                                       "state":"PROCESS_STATE_RUNNING",
                                                       "since":"1392031410227087"
                                                    },
                                                    "contrail-named":{
                                                       "state":"PROCESS_STATE_RUNNING",
                                                       "since":"1392031412228269"
                                                    }
                                                 },
                                                 "isGeneratorRetrieved":false,
                                                 "nodeAlerts":[
                                                    {
                                                       "sevLevel":0,
                                                       "msg":"Ifmap Connection down",
                                                       "timeStamp":1392198537704661,
                                                       "name":"nodea8",
                                                       "type":"Control Node",
                                                       "ip":"10.204.216.46"
                                                    }
                                                 ],
                                                 "alerts":[
                                                    {
                                                       "sevLevel":0,
                                                       "msg":"Ifmap Connection down",
                                                       "timeStamp":1392198537704661,
                                                       "name":"nodea8",
                                                       "type":"Control Node",
                                                       "ip":"10.204.216.46"
                                                    }
                                                 ],
                                                 "color":"#dc6660",
                                                 "downNodeCnt":1
                                              }
                                           ]
                }
            },
            parseConfigNodesDashboardData: {
                input: {
                    'CONFIGNODES_SUMMARY': [{
                        "name": "nodea8",
                        "value": {
                            "configNode": {
                                "ModuleCpuState": {
                                    "module_cpu_info": [{
                                        "instance_id": "0",
                                        "module_id": "Schema",
                                        "cpu_info": {
                                            "meminfo": {
                                                "virt": 314396,
                                                "peakvirt": 314396,
                                                "res": 54796
                                            },
                                            "cpu_share": 2.575,
                                            "num_cpu": 4
                                        }
                                    }, {
                                        "instance_id": "0",
                                        "module_id": "ApiServer",
                                        "cpu_info": {
                                            "sys_mem_info": {
                                                "total": 33639374,
                                                "buffers": 325513,
                                                "free": 300535,
                                                "used": 33338839
                                            },
                                            "meminfo": {
                                                "virt": 321703,
                                                "peakvirt": 321703,
                                                "res": 66359
                                            },
                                            "cpu_share": 0,
                                            "num_cpu": 4,
                                            "cpuload": {
                                                "fifteen_min_avg": 0,
                                                "five_min_avg": 0,
                                                "one_min_avg": 0
                                            }
                                        }
                                    }, {
                                        "instance_id": "0",
                                        "module_id": "ServiceMonitor",
                                        "cpu_info": {
                                            "meminfo": {
                                                "virt": 300249,
                                                "peakvirt": 300249,
                                                "res": 51335
                                            },
                                            "cpu_share": 0,
                                            "num_cpu": 4
                                        }
                                    }],
                                    "service_monitor_cpu_share": [{
                                        "history-10": {
                                            "{\"ts\":1392198794090660}": 0,
                                            "{\"ts\":1392199274902707}": 0,
                                            "{\"ts\":1392199094597889}": 0,
                                            "{\"ts\":1392198974395321}": 0,
                                            "{\"ts\":1392198733987517}": 0,
                                            "{\"ts\":1392199154699216}": 0,
                                            "{\"ts\":1392199214801026}": 0,
                                            "{\"ts\":1392198914293903}": 0,
                                            "{\"ts\":1392199034496246}": 0,
                                            "{\"ts\":1392198854192274}": 0
                                        }
                                    }, {
                                        "s-3600-topvals": {
                                            "2014 Feb 12 10:00:14.801": 0,
                                            "2014 Feb 12 10:01:14.902": 0
                                        }
                                    }, {
                                        "s-3600-summary": {
                                            "sum": "0",
                                            "b1": "2"
                                        }
                                    }],
                                    "build_info": "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-05 20:11:42.095589\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1107.el6\n\", \"build-number\" : \"1107\n\"}]}",
                                    "schema_xmer_mem_virt": [{
                                        "history-10": {
                                            "{\"ts\":1392188997719654}": 314396,
                                            "{\"ts\":1392188637098688}": 314261,
                                            "{\"ts\":1392188516893411}": 314261,
                                            "{\"ts\":1392188937615635}": 314396,
                                            "{\"ts\":1392188697200420}": 314261,
                                            "{\"ts\":1392188877511734}": 314396,
                                            "{\"ts\":1392188456790712}": 314261,
                                            "{\"ts\":1392188817407357}": 314396,
                                            "{\"ts\":1392188576996887}": 314261,
                                            "{\"ts\":1392188757303181}": 314396
                                        }
                                    }, {
                                        "s-3600-topvals": {}
                                    }, {
                                        "s-3600-summary": {
                                            "b400000": "10",
                                            "sum": "3143285"
                                        }
                                    }],
                                    "api_server_mem_virt": [{
                                        "history-10": {
                                            "{\"ts\":1392199271360474}": 321703,
                                            "{\"ts\":1392199091054984}": 321703,
                                            "{\"ts\":1392198730441652}": 321703,
                                            "{\"ts\":1392198970850953}": 321703,
                                            "{\"ts\":1392199151157109}": 321703,
                                            "{\"ts\":1392198910748639}": 321703,
                                            "{\"ts\":1392198850645534}": 321703,
                                            "{\"ts\":1392199211259065}": 321703,
                                            "{\"ts\":1392198790543511}": 321703,
                                            "{\"ts\":1392199030952728}": 321703
                                        }
                                    }, {
                                        "s-3600-topvals": {
                                            "2014 Feb 12 10:01:11.360": 321703,
                                            "2014 Feb 12 10:00:11.259": 321703
                                        }
                                    }, {
                                        "s-3600-summary": {
                                            "b400000": "2",
                                            "sum": "643406"
                                        }
                                    }],
                                    "process_state_list": [{
                                        "process_name": "contrail-api:0",
                                        "process_state": "PROCESS_STATE_RUNNING",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031421077655",
                                        "stop_count": 0,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "redis-config",
                                        "process_state": "PROCESS_STATE_RUNNING",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031415064786",
                                        "stop_count": 0,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "contrail-config-nodemgr",
                                        "process_state": "PROCESS_STATE_RUNNING",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031413059723",
                                        "stop_count": 0,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "contrail-discovery:0",
                                        "process_state": "PROCESS_STATE_STOPPED",
                                        "last_stop_time": "1392186852753830",
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031417072072",
                                        "stop_count": 1,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "contrail-svc-monitor",
                                        "process_state": "PROCESS_STATE_RUNNING",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031425086415",
                                        "stop_count": 0,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "ifmap",
                                        "process_state": "PROCESS_STATE_STOPPED",
                                        "last_stop_time": "1392189058210917",
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031419075457",
                                        "stop_count": 1,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }, {
                                        "process_name": "contrail-schema",
                                        "process_state": "PROCESS_STATE_EXITED",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031423083104",
                                        "stop_count": 0,
                                        "last_exit_time": "1392189060216682",
                                        "exit_count": 1
                                    }, {
                                        "process_name": "contrail-zookeeper",
                                        "process_state": "PROCESS_STATE_RUNNING",
                                        "last_stop_time": null,
                                        "start_count": 1,
                                        "core_file_list": [],
                                        "last_start_time": "1392031427092471",
                                        "stop_count": 0,
                                        "last_exit_time": null,
                                        "exit_count": 0
                                    }],
                                    "service_monitor_mem_virt": [{
                                        "history-10": {
                                            "{\"ts\":1392198794090660}": 300249,
                                            "{\"ts\":1392199274902707}": 300249,
                                            "{\"ts\":1392199094597889}": 300249,
                                            "{\"ts\":1392198974395321}": 300249,
                                            "{\"ts\":1392198733987517}": 300249,
                                            "{\"ts\":1392199154699216}": 300249,
                                            "{\"ts\":1392199214801026}": 300249,
                                            "{\"ts\":1392198914293903}": 300249,
                                            "{\"ts\":1392199034496246}": 300249,
                                            "{\"ts\":1392198854192274}": 300249
                                        }
                                    }, {
                                        "s-3600-topvals": {
                                            "2014 Feb 12 10:00:14.801": 300249,
                                            "2014 Feb 12 10:01:14.902": 300249
                                        }
                                    }, {
                                        "s-3600-summary": {
                                            "b400000": "2",
                                            "sum": "600498"
                                        }
                                    }],
                                    "api_server_cpu_share": [{
                                        "history-10": {
                                            "{\"ts\":1392199271360474}": 0,
                                            "{\"ts\":1392199091054984}": 0,
                                            "{\"ts\":1392198730441652}": 0,
                                            "{\"ts\":1392198970850953}": 0,
                                            "{\"ts\":1392199151157109}": 0,
                                            "{\"ts\":1392198910748639}": 0,
                                            "{\"ts\":1392198850645534}": 0,
                                            "{\"ts\":1392199211259065}": 0,
                                            "{\"ts\":1392198790543511}": 0,
                                            "{\"ts\":1392199030952728}": 0
                                        }
                                    }, {
                                        "s-3600-topvals": {
                                            "2014 Feb 12 10:01:11.360": 0,
                                            "2014 Feb 12 10:00:11.259": 0
                                        }
                                    }, {
                                        "s-3600-summary": {
                                            "sum": "0",
                                            "b1": "2"
                                        }
                                    }],
                                    "schema_xmer_cpu_share": [{
                                        "history-10": {
                                            "{\"ts\":1392188997719654}": 2.575,
                                            "{\"ts\":1392188637098688}": 0,
                                            "{\"ts\":1392188516893411}": 0,
                                            "{\"ts\":1392188937615635}": 2.45,
                                            "{\"ts\":1392188697200420}": 0,
                                            "{\"ts\":1392188877511734}": 0,
                                            "{\"ts\":1392188456790712}": 0,
                                            "{\"ts\":1392188817407357}": 0,
                                            "{\"ts\":1392188576996887}": 0,
                                            "{\"ts\":1392188757303181}": 2.575
                                        }
                                    }, {
                                        "s-3600-topvals": {}
                                    }, {
                                        "s-3600-summary": {
                                            "sum": "7.6",
                                            "b1": "7",
                                            "b3": "3"
                                        }
                                    }]
                                }
                            }
                        }
                    }]
                },
                output: {
                	'CONFIGNODES_SUMMARY':[
                	                       {
                	                           "x":0,
                	                           "y":314.1630859375,
                	                           "cpu":"0.00",
                	                           "memory":"314.16 MB",
                	                           "size":1,
                	                           "version":"-",
                	                           "shape":"circle",
                	                           "type":"configNode",
                	                           "display_type":"Config Node",
                	                           "name":"nodea8",
                	                           "processAlerts":[
                	                              {
                	                                 "tooltipAlert":false,
                	                                 "nName":"nodea8",
                	                                 "pName":"ifmap",
                	                                 "msg":"stopped",
                	                                 "popupMsg":"Stopped",
                	                                 "timeStamp":"1392189058210917",
                	                                 "sevLevel":0
                	                              },
                	                              {
                	                                  "detailAlert": false,
                	                                  "msg": "1 Process down",
                	                                  "sevLevel": 0
                	                                 }
                	                           ],
                	                           "isPartialUveMissing":false,
                	                           "status":"Down since ",
                	                           "histCpuArr":[
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0,
                	                              0
                	                           ],
                	                           "summaryIps":"-",
                	                           "ip":"-",
                	                           "hostNameColor":"blue",
                	                           "processDetails":{
                	                              "contrail-api:0":{
                	                                 "state":"PROCESS_STATE_RUNNING",
                	                                 "since":"1392031421077655"
                	                              },
                	                              "redis-config":{
                	                                 "state":"PROCESS_STATE_RUNNING",
                	                                 "since":"1392031415064786"
                	                              },
                	                              "ifmap":{
                	                                 "state":"PROCESS_STATE_STOPPED",
                	                                 "since":"1392189058210917"
                	                              }
                	                           },
                	                           "isGeneratorRetrieved":false,
                	                           "configCpu":"0.00",
                	                           "configMem":"314.16 MB",
                	                           "downNodeCnt":1,
                	                           "nodeAlerts":[

                	                           ],
                	                           "alerts":[
                	                              {
                	                                 "tooltipAlert":false,
                	                                 "nName":"nodea8",
                	                                 "pName":"ifmap",
                	                                 "msg":"stopped",
                	                                 "popupMsg":"Stopped",
                	                                 "timeStamp":"1392189058210917",
                	                                 "sevLevel":0
                	                              },
                	                              {
                	                                  "detailAlert": false,
                	                                  "msg": "1 Process down",
                	                                  "sevLevel": 0
                	                                 }
                	                           ],
                	                           "color":"#dc6660"
                	                        }
                	                     ]
                }
            },
            parseAnalyticNodesDashboardData: {
                input: {
                    'ANALYTICSNODES_SUMMARY': [{
                        "name": "nodea8",
                        "value": {
                            "ModuleCpuState": {
                                "opserver_mem_virt": [{
                                    "history-10": {
                                        "{\"ts\":1392198662749913}": 255392,
                                        "{\"ts\":1392198903160449}": 255392,
                                        "{\"ts\":1392198422339660}": 255392,
                                        "{\"ts\":1392198362237235}": 255392,
                                        "{\"ts\":1392198782955050}": 255392,
                                        "{\"ts\":1392198722852727}": 255392,
                                        "{\"ts\":1392198602647156}": 255392,
                                        "{\"ts\":1392198542544282}": 255392,
                                        "{\"ts\":1392198843057682}": 255392,
                                        "{\"ts\":1392198482442051}": 255392
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:55:03.160": 255392,
                                        "2014 Feb 12 09:54:03.57": 255392,
                                        "2014 Feb 12 09:51:02.749": 255392,
                                        "2014 Feb 12 09:52:02.852": 255392,
                                        "2014 Feb 12 09:53:02.955": 255392
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "b300000": "55",
                                        "sum": "14046560"
                                    }
                                }],
                                "module_cpu_info": [{
                                    "instance_id": "0",
                                    "module_id": "Collector",
                                    "cpu_info": {
                                        "meminfo": {
                                            "virt": 352272,
                                            "peakvirt": 417484,
                                            "res": 27996
                                        },
                                        "cpu_share": 0.233333,
                                        "num_cpu": 4
                                    }
                                }, {
                                    "instance_id": "0",
                                    "module_id": "QueryEngine",
                                    "cpu_info": {
                                        "meminfo": {
                                            "virt": 347572,
                                            "peakvirt": 412612,
                                            "res": 26648
                                        },
                                        "cpu_share": 0.00416736,
                                        "num_cpu": 4
                                    }
                                }, {
                                    "instance_id": "0",
                                    "module_id": "OpServer",
                                    "cpu_info": {
                                        "cpu_share": 0,
                                        "meminfo": {
                                            "virt": 255392,
                                            "peakvirt": 255392,
                                            "res": 38644
                                        }
                                    }
                                }],
                                "queryengine_cpu_share": [{
                                    "history-10": {
                                        "{\"ts\":1392198631712093}": 0.00416736,
                                        "{\"ts\":1392198511711397}": 0.00416736,
                                        "{\"ts\":1392198811713304}": 0,
                                        "{\"ts\":1392198931714079}": 0.00416736,
                                        "{\"ts\":1392198391710580}": 0.00833472,
                                        "{\"ts\":1392198751712860}": 0.212535,
                                        "{\"ts\":1392198571711694}": 0,
                                        "{\"ts\":1392198871713704}": 0.00416736,
                                        "{\"ts\":1392198451710998}": 0.00416736,
                                        "{\"ts\":1392198691712456}": 0.00833333
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:37:31.707": 0.200033,
                                        "2014 Feb 12 09:11:31.695": 0.204201,
                                        "2014 Feb 12 09:52:31.712": 0.212535,
                                        "2014 Feb 12 09:15:31.697": 0.212535,
                                        "2014 Feb 12 09:38:31.707": 0.212535
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "b0.1": "51",
                                        "sum": "1.24186744",
                                        "b0.3": "5"
                                    }
                                }],
                                "opserver_cpu_share": [{
                                    "history-10": {
                                        "{\"ts\":1392198662749913}": 0,
                                        "{\"ts\":1392198903160449}": 0,
                                        "{\"ts\":1392198422339660}": 0,
                                        "{\"ts\":1392198362237235}": 0,
                                        "{\"ts\":1392198782955050}": 0,
                                        "{\"ts\":1392198722852727}": 0,
                                        "{\"ts\":1392198602647156}": 0,
                                        "{\"ts\":1392198542544282}": 0,
                                        "{\"ts\":1392198843057682}": 0,
                                        "{\"ts\":1392198482442051}": 2.5
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:10:58.632": 5,
                                        "2014 Feb 12 09:55:03.160": 0,
                                        "2014 Feb 12 09:48:02.442": 2.5,
                                        "2014 Feb 12 09:36:01.219": 2.5,
                                        "2014 Feb 12 09:54:03.57": 0
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "b0.1": "52",
                                        "sum": "10",
                                        "bmax": "3"
                                    }
                                }],
                                "collector_cpu_share": [{
                                    "history-10": {
                                        "{\"ts\":1392198572670244}": 0.22087,
                                        "{\"ts\":1392198392655090}": 0.212535,
                                        "{\"ts\":1392198452660478}": 0.220833,
                                        "{\"ts\":1392198632675068}": 0.195833,
                                        "{\"ts\":1392198932699876}": 0.233333,
                                        "{\"ts\":1392198752685479}": 0.266667,
                                        "{\"ts\":1392198512665548}": 0.229167,
                                        "{\"ts\":1392198872695629}": 0.225038,
                                        "{\"ts\":1392198692680424}": 0.22087,
                                        "{\"ts\":1392198812690836}": 0.216667
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:32:32.585": 0.245833,
                                        "2014 Feb 12 09:37:32.608": 0.254209,
                                        "2014 Feb 12 09:52:32.685": 0.266667,
                                        "2014 Feb 12 09:38:32.613": 0.266667,
                                        "2014 Feb 12 09:15:32.497": 0.266667
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "sum": "12.454968",
                                        "b0.3": "49",
                                        "b0.2": "7"
                                    }
                                }],
                                "process_state_list": [{
                                    "process_name": "redis-query",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031412546885",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-qe",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031418563789",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-collector",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031416558338",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-analytics-nodemgr",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031408536264",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "redis-uve",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031414552561",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "contrail-opserver",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031420569403",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }, {
                                    "process_name": "redis-sentinel",
                                    "process_state": "PROCESS_STATE_RUNNING",
                                    "last_stop_time": null,
                                    "start_count": 1,
                                    "core_file_list": [],
                                    "last_start_time": "1392031410542571",
                                    "stop_count": 0,
                                    "last_exit_time": null,
                                    "exit_count": 0
                                }],
                                "collector_mem_virt": [{
                                    "history-10": {
                                        "{\"ts\":1392198572670244}": 352272,
                                        "{\"ts\":1392198392655090}": 352272,
                                        "{\"ts\":1392198452660478}": 352272,
                                        "{\"ts\":1392198632675068}": 352272,
                                        "{\"ts\":1392198932699876}": 352272,
                                        "{\"ts\":1392198752685479}": 352272,
                                        "{\"ts\":1392198512665548}": 352272,
                                        "{\"ts\":1392198872695629}": 352272,
                                        "{\"ts\":1392198692680424}": 352272,
                                        "{\"ts\":1392198812690836}": 352272
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:53:32.690": 352272,
                                        "2014 Feb 12 09:51:32.680": 352272,
                                        "2014 Feb 12 09:55:32.699": 352272,
                                        "2014 Feb 12 09:54:32.695": 352272,
                                        "2014 Feb 12 09:52:32.685": 352272
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "b400000": "56",
                                        "sum": "19727232"
                                    }
                                }],
                                "queryengine_mem_virt": [{
                                    "history-10": {
                                        "{\"ts\":1392198631712093}": 347572,
                                        "{\"ts\":1392198511711397}": 347572,
                                        "{\"ts\":1392198811713304}": 347572,
                                        "{\"ts\":1392198931714079}": 347572,
                                        "{\"ts\":1392198391710580}": 347572,
                                        "{\"ts\":1392198751712860}": 347572,
                                        "{\"ts\":1392198571711694}": 347572,
                                        "{\"ts\":1392198871713704}": 347572,
                                        "{\"ts\":1392198451710998}": 347572,
                                        "{\"ts\":1392198691712456}": 347572
                                    }
                                }, {
                                    "s-3600-topvals": {
                                        "2014 Feb 12 09:54:31.713": 347572,
                                        "2014 Feb 12 09:53:31.713": 347572,
                                        "2014 Feb 12 09:55:31.714": 347572,
                                        "2014 Feb 12 09:51:31.712": 347572,
                                        "2014 Feb 12 09:52:31.712": 347572
                                    }
                                }, {
                                    "s-3600-summary": {
                                        "b400000": "56",
                                        "sum": "19464032"
                                    }
                                }]
                            },
                            "CollectorState": {
                                "build_info": "{\"build-info\":[{\"build-time\":\"2014-02-05 17:58:37.582885\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1107.el6\",\"build-number\":\"1107\"}]}",
                                "generator_infos": [{
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Config",
                                    "module_id": "ApiServer"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Analytics",
                                    "module_id": "Collector"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Analytics",
                                    "module_id": "Contrail-Analytics-Nodemgr"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Config",
                                    "module_id": "Contrail-Config-Nodemgr"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Control",
                                    "module_id": "Contrail-Control-Nodemgr"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Compute",
                                    "module_id": "Contrail-Vrouter-Nodemgr"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Control",
                                    "module_id": "ControlNode"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Control",
                                    "module_id": "DnsAgent"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Analytics",
                                    "module_id": "OpServer"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Analytics",
                                    "module_id": "QueryEngine"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Config",
                                    "module_id": "ServiceMonitor"
                                }, {
                                    "instance_id": "0",
                                    "source": "nodea8",
                                    "state": "Established",
                                    "node_type": "Compute",
                                    "module_id": "VRouterAgent"
                                }],
                                "tx_socket_stats": {
                                    "blocked_count": 0,
                                    "calls": 14,
                                    "bytes": 14846,
                                    "average_bytes": 1060,
                                    "blocked_duration": "00:00:00",
                                    "average_blocked_duration": null
                                },
                                "rx_socket_stats": {
                                    "blocked_count": 0,
                                    "calls": 220138,
                                    "bytes": 1116583963,
                                    "average_bytes": 5072,
                                    "blocked_duration": null,
                                    "average_blocked_duration": null
                                },
                                "self_ip_list": ["10.204.216.46"]
                            },
                            "QueryStats": {
                                "error_queries": [],
                                "pending_queries": [],
                                "abandoned_queries": [],
                                "queries_being_processed": []
                            }
                        }
                    }]
                },
                output: {
                    'ANALYTICSNODES_SUMMARY': [
                                               {
                                                   "x":0.233333,
                                                   "y":344.015625,
                                                   "cpu":"0.23",
                                                   "memory":"344.02 MB",
                                                   "histCpuArr":[
                                                      0.212535,
                                                      0.220833,
                                                      0.229167,
                                                      0.22087,
                                                      0.195833,
                                                      0.22087,
                                                      0.266667,
                                                      0.216667,
                                                      0.225038,
                                                      0.233333
                                                   ],
                                                   "pendingQueryCnt":0,
                                                   "size":1,
                                                   "shape":"circle",
                                                   "type":"analyticsNode",
                                                   "display_type":"Analytics Node",
                                                   "version":"1.03 (Build 1107)",
                                                   "status":"Up since ",
                                                   "hostNameColor":"blue",
                                                   "summaryIps":"10.204.216.46",
                                                   "ip":"10.204.216.46",
                                                   "name":"nodea8",
                                                   "errorStrings":[

                                                   ],
                                                   "processAlerts":[

                                                   ],
                                                   "isPartialUveMissing":false,
                                                   "processDetails":{
                                                      "redis-query":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031412546885"
                                                      },
                                                      "contrail-qe":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031418563789"
                                                      },
                                                      "contrail-collector":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031416558338"
                                                      },
                                                      "redis-uve":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031414552561"
                                                      },
                                                      "contrail-opserver":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031420569403"
                                                      },
                                                      "redis-sentinel":{
                                                         "state":"PROCESS_STATE_RUNNING",
                                                         "since":"1392031410542571"
                                                      }
                                                   },
                                                   "analyticsCpu":"0.23",
                                                   "analyticsMem":"344.02 KB",
                                                   "isGeneratorRetrieved":false,
                                                   "genCount":12,
                                                   "nodeAlerts":[

                                                   ],
                                                   "alerts":[

                                                   ],
                                                   "color":"#7892dd",
                                                   "downNodeCnt":0
                                                }
                                             ]
                }
            },
            getCores:{
            	input:{
            		'test1':{}
            	},
            	output:{
            		'test1':[]
            	}
            },
            processAlerts:{
            	input:{
            		'test1':{
            			  "ctrlNodesData": [],
            			  "vRoutersData": [
            			    {
            			      "x": 0.0375042,
            			      "y": 392.61328125,
            			      "cpu": "0.04",
            			      "ip": "10.204.217.11",
            			      "uveIP": [
            			        "10.204.217.11",
            			        "10.204.217.11"
            			      ],
            			      "summaryIps": "10.204.217.11",
            			      "isConfigMissing": false,
            			      "isUveMissing": false,
            			      "configIP": "10.204.217.11",
            			      "processDetails": {
            			        "contrail-vrouter": {
            			          "state": "PROCESS_STATE_RUNNING",
            			          "since": "1393912630664005"
            			        }
            			      },
            			      "histCpuArr": [
            			        0.0462107,
            			        0.0375042,
            			        0.0333389,
            			        0.0375042
            			      ],
            			      "status": "Up since 14m",
            			      "memory": "392.61 MB",
            			      "size": 1,
            			      "shape": "circle",
            			      "xmppPeerDownCnt": 0,
            			      "name": "nodec26",
            			      "instCnt": 0,
            			      "intfCnt": 0,
            			      "vns": [],
            			      "vnCnt": 0,
            			      "version": "1.04 (Build 460)",
            			      "type": "vRouter",
            			      "display_type": "vRouter",
            			      "isPartialUveMissing": false,
            			      "errorIntfCnt": 0,
            			      "errorIntfCntText": "0 Down",
            			      "uveCfgIPMisMatch": false,
            			      "hostNameColor": "blue",
            			      "color": "#7892dd",
            			      "alerts": [],
            			      "downNodeCnt": 0,
            			      "isGeneratorRetrieved": false
            			    }
            			  ],
            			  "analyticNodesData": [],
            			  "configNodesData": []
            			}
            	},
            	output:{
            		'test1':[],
            		Vrouter_UVE_ConfigMissingVrouter:[
            		                                  {
            		                                      "msg":"System Information unavailable",
            		                                      "sevLevel":0,
            		                                      "tooltipLbl":"Events",
            		                                      "name":"nodeh7",
            		                                      "type":"vRouter",
            		                                      "ip":"-"
            		                                   },
            		                                   {
            		                                      "msg":"Configuration unavailable",
            		                                      "sevLevel":1,
            		                                      "name":"nodeh7",
            		                                      "type":"vRouter",
            		                                      "ip":"-"
            		                                   }
            		                                ],
                     Vrouter_partialSystemInfo:[
                                                {
                                                    "sevLevel":3,
                                                    "msg":"Partial System Information",
                                                    "tooltipLbl":"Events",
                                                    "name":"nodeh7",
                                                    "type":"vRouter",
                                                    "ip":"10.204.217.111"
                                                 }
                                              ],
                    Vrouter_xmpp_interface_down:[
                                                 {
                                                     "sevLevel":0,
                                                     "msg":"1 XMPP Peer down",
                                                     "tooltipLbl":"Events",
                                                     "name":"nodeh7",
                                                     "type":"vRouter",
                                                     "ip":"10.204.217.111"
                                                  },
                                                  {
                                                     "sevLevel":1,
                                                     "msg":"1 Interface down",
                                                     "tooltipLbl":"Events",
                                                     "name":"nodeh7",
                                                     "type":"vRouter",
                                                     "ip":"10.204.217.111"
                                                  },
                                                  {
                                                     "sevLevel":3,
                                                     "msg":"Partial System Information",
                                                     "tooltipLbl":"Events",
                                                     "name":"nodeh7",
                                                     "type":"vRouter",
                                                     "ip":"10.204.217.111"
                                                  }
                                               ],
                   Vrouter_config_ip_missing:[
                                                {
                                                    "msg":"Configured IP mismatch",
                                                    "sevLevel":0,
                                                    "tooltipLbl":"Events",
                                                    "name":"nodeh7",
                                                    "type":"vRouter",
                                                    "ip":"10.204.217.111"
                                                 }
                                              ],
                 ControlNode_UVE_ConfigMissingVrouter:[
                                                    {
                                                        "sevLevel":0,
                                                        "msg":"System Information unavailable",
                                                        "name":"nodea8",
                                                        "type":"Control Node",
                                                        "ip":"-"
                                                     },
                                                     {
                                                        "sevLevel":0,
                                                        "msg":"Configuration unavailable",
                                                        "name":"nodea8",
                                                        "type":"Control Node",
                                                        "ip":"-"
                                                     }
                                              ],
                         ControlNode_partialSystemInfo_downpeers:[
                                                                     {
                                                                        "sevLevel":1,
                                                                        "msg":"1 XMPP Peer down",
                                                                        "name":"nodea8",
                                                                        "type":"Control Node",
                                                                        "ip":"10.204.216.46"
                                                                     },
                                                                     {
                                                                        "sevLevel":1,
                                                                        "msg":"1 BGP Peer down",
                                                                        "name":"nodea8",
                                                                        "type":"Control Node",
                                                                        "ip":"10.204.216.46"
                                                                     },
                                                                     {
                                                                        "sevLevel":1,
                                                                        "msg":"BGP peer configuration mismatch",
                                                                        "name":"nodea8",
                                                                        "type":"Control Node",
                                                                        "ip":"10.204.216.46"
                                                                     },
                                                                     {
                                                                        "sevLevel":3,
                                                                        "msg":"Partial System Information",
                                                                        "name":"nodea8",
                                                                        "type":"Control Node",
                                                                        "ip":"10.204.216.46"
                                                                     }
                                                                  ],
                                   ControlNode_bgppeer_mismatch:[
                                                                        {
                                                                           "sevLevel":1,
                                                                           "msg":"2 BGP Peers down",
                                                                           "name":"nodea8",
                                                                           "type":"Control Node",
                                                                           "ip":"10.204.216.46"
                                                                        },
                                                                        {
                                                                           "sevLevel":1,
                                                                           "msg":"BGP peer configuration mismatch",
                                                                           "name":"nodea8",
                                                                           "type":"Control Node",
                                                                           "ip":"10.204.216.46"
                                                                        },
                                                                        {
                                                                           "sevLevel":3,
                                                                           "msg":"Partial System Information",
                                                                           "name":"nodea8",
                                                                           "type":"Control Node",
                                                                           "ip":"10.204.216.46"
                                                                        }
                                                                    ],
                                            ControlNode_ip_mismatch_IfmapDown:[
                                                                     {
                                                                         "sevLevel":0,
                                                                         "msg":"Ifmap Connection down",
                                                                         "timeStamp":1392198537704661,
                                                                         "name":"nodea8",
                                                                         "type":"Control Node",
                                                                         "ip":"10.204.216.46"
                                                                      },
                                                                      {
                                                                         "sevLevel":0,
                                                                         "msg":"Configured IP mismatch",
                                                                         "name":"nodea8",
                                                                         "type":"Control Node",
                                                                         "ip":"10.204.216.46"
                                                                      }
                                                                   ],
                                      AnalyticsNode_partial_info:[
                                                                   {
                                                                       "sevLevel":3,
                                                                       "msg":"Partial System Information",
                                                                       "name":"nodea8",
                                                                       "type":"Analytics Node",
                                                                       "ip":"10.204.216.46"
                                                                    }
                                                                  ],
                                      ConfigNode_partial_info:[
                                                               {
                                                                   "sevLevel":3,
                                                                   "msg":"Partial System Information",
                                                                   "name":"nodea8",
                                                                   "type":"Config Node",
                                                                   "ip":"-"
                                                                }
                                                             ]
            	}
            },
            getNodeStatusForSummaryPages:{
                input:{
                    processStopData:{
                        "x":null,
                        "y":null,
                        "cpu":"-",
                        "histCpuArr":[

                        ],
                        "uveIP":[

                        ],
                        "configIP":"10.204.216.40",
                        "isConfigMissing":false,
                        "configuredBgpPeerCnt":2,
                        "isUveMissing":false,
                        "ip":"10.204.216.40",
                        "summaryIps":"10.204.216.40",
                        "memory":"-",
                        "size":1,
                        "shape":"circle",
                        "name":"nodea2",
                        "version":"-",
                        "totalPeerCount":0,
                        "totalBgpPeerCnt":null,
                        "upBgpPeerCnt":null,
                        "establishedPeerCount":0,
                        "activevRouterCount":0,
                        "upXMPPPeerCnt":0,
                        "totalXMPPPeerCnt":0,
                        "downXMPPPeerCnt":0,
                        "downBgpPeerCnt":0,
                        "downXMPPPeerCntText":"",
                        "isPartialUveMissing":true,
                        "isIfmapDown":false,
                        "downBgpPeerCntText":"",
                        "uveCfgIPMisMatch":false,
                        "type":"controlNode",
                        "display_type":"Control Node",
                        "status":"Down since 6h 41m",
                        "hostNameColor":"#dc6660",
                        "color":"#dc6660",
                        "processAlerts":[
                           {
                              "tooltipAlert":false,
                              "nName":"nodea2",
                              "pName":"contrail-control",
                              "msg":"stopped",
                              "popupMsg":"Stopped",
                              "timeStamp":"1395744632588367",
                              "sevLevel":0
                           },
                           {
                              "detailAlert":false,
                              "sevLevel":0,
                              "msg":"1 Process down"
                           }
                        ],
                        "processDetails":{
                           "contrail-control":{
                              "state":"PROCESS_STATE_STOPPED",
                              "since":"1395744632588367"
                           },
                           "contrail-dns":{
                              "state":"PROCESS_STATE_RUNNING",
                              "since":"1395137371548582"
                           },
                           "contrail-named":{
                              "state":"PROCESS_STATE_RUNNING",
                              "since":"1395137373550816"
                           }
                        },
                        "isGeneratorRetrieved":false,
                        "nodeAlerts":[
                           {
                              "sevLevel":3,
                              "msg":"Partial System Information",
                              "name":"nodea2",
                              "type":"Control Node",
                              "ip":"10.204.216.40"
                           }
                        ],
                        "alerts":[
                           {
                              "tooltipAlert":false,
                              "nName":"nodea2",
                              "pName":"contrail-control",
                              "msg":"stopped",
                              "popupMsg":"Stopped",
                              "timeStamp":"1395744632588367",
                              "sevLevel":0
                           },
                           {
                              "detailAlert":false,
                              "sevLevel":0,
                              "msg":"1 Process down"
                           },
                           {
                              "sevLevel":3,
                              "msg":"Partial System Information",
                              "name":"nodea2",
                              "type":"Control Node",
                              "ip":"10.204.216.40"
                           }
                        ],
                        "downNodeCnt":1
                     },
                    processDownData:{
                        data:{
                            "x":null,
                            "y":null,
                            "cpu":"-",
                            "histCpuArr":[

                            ],
                            "uveIP":[

                            ],
                            "configIP":"10.204.216.46",
                            "isConfigMissing":false,
                            "configuredBgpPeerCnt":0,
                            "isUveMissing":false,
                            "ip":"10.204.216.46",
                            "summaryIps":"10.204.216.46",
                            "memory":"-",
                            "size":1,
                            "shape":"circle",
                            "name":"nodea8",
                            "version":"-",
                            "totalPeerCount":0,
                            "totalBgpPeerCnt":0,
                            "upBgpPeerCnt":0,
                            "establishedPeerCount":0,
                            "activevRouterCount":0,
                            "upXMPPPeerCnt":0,
                            "totalXMPPPeerCnt":0,
                            "downXMPPPeerCnt":0,
                            "downBgpPeerCnt":0,
                            "downXMPPPeerCntText":"0 Down",
                            "isPartialUveMissing":true,
                            "isIfmapDown":false,
                            "downBgpPeerCntText":"0 Down",
                            "uveCfgIPMisMatch":false,
                            "type":"controlNode",
                            "display_type":"Control Node",
                            "status":"Down since 19h 0m",
                            "hostNameColor":"#dc6660",
                            "color":"#dc6660",
                            "alerts":[
                               {
                                  "nName":"nodea8",
                                  "pName":"contrail-control",
                                  "timeStamp":"1394102844161904",
                                  "diff":"19h 0m",
                                  "type":"fatal",
                                  "msg":"contrail-control down",
                                  "severity":"SEVERITY_0"
                               }
                            ],
                            "processDetails":{
                               "contrail-control":{
                                  "state":"PROCESS_STATE_FATAL",
                                  "since":"1394102844161904"
                               },
                               "contrail-dns":{
                                  "state":"PROCESS_STATE_RUNNING",
                                  "since":"1394090654378199"
                               },
                               "contrail-named":{
                                  "state":"PROCESS_STATE_RUNNING",
                                  "since":"1394090656381014"
                               }
                            },
                            "downNodeCnt":1,
                            "isGeneratorRetrieved":false
                         },
                         nodeType:'ctrlNodesData'
                    }
                },
                output:{
                    processStopData:{
                        "alerts": [
                                   {
                                     "detailAlert": false,
                                     "msg": "1 Process down",
                                     "sevLevel": 0
                                   },
                                   {
                                     "ip": "10.204.216.40",
                                     "msg": "Partial System Information",
                                     "name": "nodea2",
                                     "sevLevel": 3,
                                     "type": "Control Node"
                                   }
                                 ],
                                 "messages": [
                                   "1 Process down",
                                   "Partial System Information"
                                 ],
                                 "nodeSeverity": 0
                               },
                    processDownData:{
                        "alerts":[
                                  {
                                     "msg":"1 Process down",
                                     "sevLevel":0
                                  },
                                  {
                                     "nName":"nodea8",
                                     "pName":"contrail-control",
                                     "timeStamp":"1394102844161904",
                                     "diff":"19h 0m",
                                     "type":"fatal",
                                     "msg":"contrail-control down",
                                     "severity":"SEVERITY_0"
                                  }
                               ],
                               "severity":3,
                               "tooltip":"1 Process down,&#10 contrail-control down",
                               "status":"1 Process down,contrail-control down"
                            }
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
var infraMockData = new InfraMockData();

