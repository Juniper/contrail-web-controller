/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
function InfraMockData() {
    var mockData = {
        //parsevRoutersDashboardData mock input
        'parsevRoutersDashboardData' : {
            input: {
                'VROUTER_SUMMARY' : [ { "name" : "nodeh7",
                    "nodeStatus" : "Up",
                    "value" : { "ConfigData" : { "virtual-router" : { "fq_name" : [ "default-global-system-config",
                                    "nodeh7"
                                  ],
                                "href" : "http://10.204.217.111:9100/virtual-router/00679f8c-c6c7-4d79-bcc2-231aec9615b8",
                                "id_perms" : { "created" : "2014-01-30T05:59:35.812858",
                                    "description" : null,
                                    "enable" : true,
                                    "last_modified" : "2014-01-30T05:59:35.812858",
                                    "permissions" : { "group" : "cloud-admin-group",
                                        "group_access" : 7,
                                        "other_access" : 7,
                                        "owner" : "cloud-admin",
                                        "owner_access" : 7
                                      },
                                    "uuid" : { "uuid_lslong" : 13601472423157700000,
                                        "uuid_mslong" : 29167349580385656
                                      }
                                  },
                                "name" : "nodeh7",
                                "parent_href" : "http://10.204.217.111:9100/global-system-config/c569c9ee-e004-4a44-a50c-f464392d77c4",
                                "parent_type" : "global-system-config",
                                "parent_uuid" : "c569c9ee-e004-4a44-a50c-f464392d77c4",
                                "uuid" : "00679f8c-c6c7-4d79-bcc2-231aec9615b8",
                                "virtual_router_ip_address" : "10.204.217.111"
                              } },
                        "VRouterAgent" : {  },
                        "VrouterAgent" : { "build_info" : "{\"build-info\":[{\"build-time\":\"2014-01-29 10:45:37.687462\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1101.el6\",\"build-number\":\"1101\"}]}",
                            "control_ip" : "10.204.217.111",
                            "self_ip_list" : [ "10.204.217.111" ],
                            "xmpp_peer_list" : [ { "ip" : "10.204.216.40",
                                  "primary" : true,
                                  "setup_time" : 1395208421723661,
                                  "status" : true
                                },
                                { "ip" : "10.204.217.111",
                                  "primary" : false,
                                  "setup_time" : 1395208421725459,
                                  "status" : true
                                }
                              ]
                          },
                        "VrouterStatsAgent" : { "cpu_info" : { "cpu_share" : 0.050008299999999999,
                                "cpuload" : { "fifteen_min_avg" : 0.40000000000000002,
                                    "five_min_avg" : 0.53000000000000003,
                                    "one_min_avg" : 0.27000000000000002
                                  },
                                "meminfo" : { "peakvirt" : 402528,
                                    "res" : 53208,
                                    "virt" : 402524
                                  },
                                "num_cpu" : 4,
                                "sys_mem_info" : { "buffers" : 217324,
                                    "free" : 38236984,
                                    "total" : 65939744,
                                    "used" : 27702760
                                  }
                              },
                            "cpu_share" : [ { "history-10" : { "{\"ts\":1391071045678159}" : 0.051394599999999999,
                                      "{\"ts\":1391071225680551}" : 0.047230099999999997,
                                      "{\"ts\":1391071405682953}" : 0.051394599999999999,
                                      "{\"ts\":1391071585685119}" : 0.051397499999999999,
                                      "{\"ts\":1391071765687407}" : 0.051394599999999999,
                                      "{\"ts\":1391071945689822}" : 0.048619200000000001,
                                      "{\"ts\":1391072125692131}" : 0.050005599999999997,
                                      "{\"ts\":1391072305694462}" : 0.048619200000000001,
                                      "{\"ts\":1391072485696898}" : 0.051394599999999999,
                                      "{\"ts\":1391072665699197}" : 0.050008299999999999
                                    } },
                                { "s-3600-topvals" : { "2014 Jan 30 09:01:25.696" : 0.051394599999999999,
                                      "2014 Jan 30 09:04:25.699" : 0.050008299999999999
                                    } },
                                { "s-3600-summary" : { "b1" : "2",
                                      "sum" : "0.1014029"
                                    } }
                              ],
                              "NodeStatus":{
                                  "process_info" : [ 
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1391061692459593",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-vrouter-agent",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1391061690455524",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-vrouter-nodemgr",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1391061733842477",
                                          "last_stop_time" : null,
                                          "process_name" : "openstack-nova-compute",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        }
                                   ] 
                              }
                          }
                      }
                  } ],
                'test1': [ { "name" : "nodea2",
                    "nodeStatus" : "Up",
                    "value" : { "ConfigData" : { "virtual-router" : { "fq_name" : [ "default-global-system-config",
                                    "nodea2"
                                  ],
                                "href" : "http://10.204.216.46:9100/virtual-router/190ea66f-8134-4598-a238-a5c19db57dbb",
                                "id_perms" : { "created" : "2014-03-18T09:42:29.675408",
                                    "description" : null,
                                    "enable" : true,
                                    "last_modified" : "2014-03-18T10:07:53.364140",
                                    "permissions" : { "group" : "cloud-admin-group",
                                        "group_access" : 7,
                                        "other_access" : 7,
                                        "owner" : "cloud-admin",
                                        "owner_access" : 7
                                      },
                                    "uuid" : { "uuid_lslong" : 11689275083833311000,
                                        "uuid_mslong" : 1805563498461415000
                                      }
                                  },
                                "name" : "nodea2",
                                "parent_href" : "http://10.204.216.46:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                                "parent_type" : "global-system-config",
                                "parent_uuid" : "3e3fd655-d419-4141-b491-e83704ba0be3",
                                "uuid" : "190ea66f-8134-4598-a238-a5c19db57dbb",
                                "virtual_router_ip_address" : "10.204.216.40"
                              } },
                        "VRouterAgent" : {  },
                        "VrouterAgent" : { "build_info" : "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic\",\"build-number\":\"1.05-135-3.8.0-29-generic\"}]}",
                            "control_ip" : "10.204.216.40",
                            "self_ip_list" : [ "10.204.216.40" ],
                            "xmpp_peer_list" : [ { "ip" : "10.204.216.40",
                                  "primary" : true,
                                  "setup_time" : 1395208421723661,
                                  "status" : true
                                },
                                { "ip" : "10.204.217.111",
                                  "primary" : false,
                                  "setup_time" : 1395208421725459,
                                  "status" : true
                                }
                              ]
                          },
                        "VrouterStatsAgent" : { "cpu_info" : { "cpu_share" : 0.049997199999999999,
                                "cpuload" : { "fifteen_min_avg" : 0.23999999999999999,
                                    "five_min_avg" : 0.28999999999999998,
                                    "one_min_avg" : 0.28999999999999998
                                  },
                                "meminfo" : { "peakvirt" : 382380,
                                    "res" : 47924,
                                    "virt" : 382376
                                  },
                                "num_cpu" : 4,
                                "sys_mem_info" : { "buffers" : 217140,
                                    "free" : 14359924,
                                    "total" : 32922028,
                                    "used" : 18562104
                                  }
                              },
                            "cpu_share" : [ { "history-10" : { "{\"ts\":1395208604755517}" : 0.063834399999999999,
                                      "{\"ts\":1395208784757686}" : 0.0527778,
                                      "{\"ts\":1395208964760016}" : 0.048608400000000003,
                                      "{\"ts\":1395209144762270}" : 0.054166699999999998,
                                      "{\"ts\":1395209324764346}" : 0.051388900000000001,
                                      "{\"ts\":1395209504766490}" : 0.048611099999999997,
                                      "{\"ts\":1395209684768553}" : 0.054166699999999998,
                                      "{\"ts\":1395209864770518}" : 0.044444400000000002,
                                      "{\"ts\":1395210044772620}" : 0.049997199999999999
                                    } },
                                { "s-3600-topvals" : { "2014 Mar 19 06:05:44.762" : 0.054166699999999998,
                                      "2014 Mar 19 06:08:44.764" : 0.051388900000000001,
                                      "2014 Mar 19 06:11:44.766" : 0.048611099999999997,
                                      "2014 Mar 19 06:14:44.768" : 0.054166699999999998,
                                      "2014 Mar 19 06:20:44.772" : 0.049997199999999999
                                    } },
                                { "s-3600-summary" : { "b1" : "7",
                                      "sum" : "0.3513834"
                                    } }
                              ],
                              "NodeStatus":{   
                                    "process_info" : [ 
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1395208421747763",
                                          "last_stop_time" : "1395208417363453",
                                          "process_name" : "contrail-vrouter-agent",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 2,
                                          "stop_count" : 1
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1395137366570779",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-vrouter-nodemgr",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1395137360211414",
                                          "last_stop_time" : null,
                                          "process_name" : "openstack-nova-compute",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        }
                                      ]
                              }
                          }
                      }
                  },
                  { "name" : "nodea8",
                    "nodeStatus" : "Up",
                    "value" : { "ConfigData" : { "virtual-router" : { "fq_name" : [ "default-global-system-config",
                                    "nodea8"
                                  ],
                                "href" : "http://10.204.217.111:9100/virtual-router/fdad41af-75c8-4644-8d21-9810f00fd733",
                                "id_perms" : { "created" : "2014-03-18T09:42:44.682813",
                                    "description" : null,
                                    "enable" : true,
                                    "last_modified" : "2014-03-18T10:07:56.359864",
                                    "permissions" : { "group" : "cloud-admin-group",
                                        "group_access" : 7,
                                        "other_access" : 7,
                                        "owner" : "cloud-admin",
                                        "owner_access" : 7
                                      },
                                    "uuid" : { "uuid_lslong" : 10169576632093760000,
                                        "uuid_mslong" : 18279338684417853000
                                      }
                                  },
                                "name" : "nodea8",
                                "parent_href" : "http://10.204.217.111:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                                "parent_type" : "global-system-config",
                                "parent_uuid" : "3e3fd655-d419-4141-b491-e83704ba0be3",
                                "uuid" : "fdad41af-75c8-4644-8d21-9810f00fd733",
                                "virtual_router_ip_address" : "10.204.216.46"
                              } },
                        "VRouterAgent" : {  },
                        "VrouterAgent" : { "build_info" : "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic1.05-135-3.8.0-29-generic\",\"build-number\":\"\"}]}",
                            "control_ip" : "10.204.216.46",
                            "self_ip_list" : [ "10.204.216.46" ],
                            "xmpp_peer_list" : [ { "ip" : "10.204.216.40",
                                  "primary" : true,
                                  "setup_time" : 1395137373926251,
                                  "status" : true
                                },
                                { "ip" : "10.204.217.111",
                                  "primary" : false,
                                  "setup_time" : 1395206848200338,
                                  "status" : true
                                }
                              ]
                          },
                        "VrouterStatsAgent" : { "cpu_info" : { "cpu_share" : 0.062496500000000003,
                                "cpuload" : { "fifteen_min_avg" : 0.089999999999999997,
                                    "five_min_avg" : 0.17000000000000001,
                                    "one_min_avg" : 0.41999999999999998
                                  },
                                "meminfo" : { "peakvirt" : 414624,
                                    "res" : 48496,
                                    "virt" : 382480
                                  },
                                "num_cpu" : 4,
                                "sys_mem_info" : { "buffers" : 146444,
                                    "free" : 31426684,
                                    "total" : 32922028,
                                    "used" : 1495344
                                  }
                              },
                            "cpu_share" : [ { "history-10" : { "{\"ts\":1395208461179237}" : 0.065274200000000004,
                                      "{\"ts\":1395208641181687}" : 0.0722222,
                                      "{\"ts\":1395208821184068}" : 0.0625,
                                      "{\"ts\":1395209001186482}" : 0.0625,
                                      "{\"ts\":1395209181188840}" : 0.068051799999999996,
                                      "{\"ts\":1395209361191108}" : 0.065277799999999997,
                                      "{\"ts\":1395209541193466}" : 0.065277799999999997,
                                      "{\"ts\":1395209721195690}" : 0.061111100000000002,
                                      "{\"ts\":1395209901198083}" : 0.063888899999999998,
                                      "{\"ts\":1395210081200372}" : 0.062496500000000003
                                    } },
                                { "s-3600-topvals" : { "2014 Mar 19 06:03:21.186" : 0.0625,
                                      "2014 Mar 19 06:06:21.188" : 0.068051799999999996,
                                      "2014 Mar 19 06:09:21.191" : 0.065277799999999997,
                                      "2014 Mar 19 06:12:21.193" : 0.065277799999999997,
                                      "2014 Mar 19 06:18:21.198" : 0.063888899999999998
                                    } },
                                { "s-3600-summary" : { "b1" : "8",
                                      "sum" : "0.5111039"
                                    } }
                              ],
                              "NodeStatus":{
                                "process_info" : [ { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137363474175",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-vrouter-agent",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137361471053",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-vrouter-nodemgr",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137355364969",
                                      "last_stop_time" : null,
                                      "process_name" : "openstack-nova-compute",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    }
                                  ]
                              }
                          }
                      }
                  },
                  { "name" : "nodeh7",
                    "nodeStatus" : "Up",
                    "value" : { "ConfigData" : { "virtual-router" : { "fq_name" : [ "default-global-system-config",
                                    "nodeh7"
                                  ],
                                "href" : "http://10.204.216.40:9100/virtual-router/138eb56e-f875-420c-801b-cd09a29fe436",
                                "id_perms" : { "created" : "2014-03-18T09:42:32.261121",
                                    "description" : null,
                                    "enable" : true,
                                    "last_modified" : "2014-03-18T10:07:54.687991",
                                    "permissions" : { "group" : "cloud-admin-group",
                                        "group_access" : 7,
                                        "other_access" : 7,
                                        "owner" : "cloud-admin",
                                        "owner_access" : 7
                                      },
                                    "uuid" : { "uuid_lslong" : 9231197302492752000,
                                        "uuid_mslong" : 1409263221633008000
                                      }
                                  },
                                "name" : "nodeh7",
                                "parent_href" : "http://10.204.216.40:9100/global-system-config/3e3fd655-d419-4141-b491-e83704ba0be3",
                                "parent_type" : "global-system-config",
                                "parent_uuid" : "3e3fd655-d419-4141-b491-e83704ba0be3",
                                "uuid" : "138eb56e-f875-420c-801b-cd09a29fe436",
                                "virtual_router_ip_address" : "10.204.217.111"
                              } },
                        "VRouterAgent" : {  },
                        "VrouterAgent" : { "build_info" : "{\"build-info\":[{\"build-time\":\"2014-03-17 21:47:23.689911\",\"build-hostname\":\"unknown\",\"build-git-ver\":\"a0272e0\",\"build-user\":\"mganley\",\"build-version\":\"1.05\",\"build-id\":\"1.05-135-3.8.0-29-generic1.05-135-3.8.0-29-generic\",\"build-number\":\"\"}]}",
                            "control_ip" : "10.204.217.111",
                            "self_ip_list" : [ "10.204.217.111" ],
                            "xmpp_peer_list" : [ { "ip" : "10.204.216.40",
                                  "primary" : false,
                                  "setup_time" : 1395137425291334,
                                  "status" : true
                                },
                                { "ip" : "10.204.217.111",
                                  "primary" : true,
                                  "setup_time" : 1395137425290464,
                                  "status" : true
                                }
                              ]
                          },
                        "VrouterStatsAgent" : { "cpu_info" : { "cpu_share" : 0.058333299999999998,
                                "cpuload" : { "fifteen_min_avg" : 0.23000000000000001,
                                    "five_min_avg" : 0.28999999999999998,
                                    "one_min_avg" : 0.23000000000000001
                                  },
                                "meminfo" : { "peakvirt" : 414624,
                                    "res" : 48092,
                                    "virt" : 382472
                                  },
                                "num_cpu" : 4,
                                "sys_mem_info" : { "buffers" : 156304,
                                    "free" : 57796324,
                                    "total" : 65945288,
                                    "used" : 8148964
                                  }
                              },
                            "cpu_share" : [ { "history-10" : { "{\"ts\":1395208527888867}" : 0.056944399999999999,
                                      "{\"ts\":1395208707891576}" : 0.058330100000000003,
                                      "{\"ts\":1395208887894267}" : 0.055555599999999997,
                                      "{\"ts\":1395209067896948}" : 0.0527778,
                                      "{\"ts\":1395209247899917}" : 0.059718899999999998,
                                      "{\"ts\":1395209427902495}" : 0.061111100000000002,
                                      "{\"ts\":1395209607905001}" : 0.054166699999999998,
                                      "{\"ts\":1395209787907308}" : 0.055555599999999997,
                                      "{\"ts\":1395209967909967}" : 0.058330100000000003,
                                      "{\"ts\":1395210147912678}" : 0.058333299999999998
                                    } },
                                { "s-3600-topvals" : { "2014 Mar 19 06:07:27.899" : 0.059718899999999998,
                                      "2014 Mar 19 06:10:27.902" : 0.061111100000000002,
                                      "2014 Mar 19 06:16:27.907" : 0.055555599999999997,
                                      "2014 Mar 19 06:19:27.909" : 0.058330100000000003,
                                      "2014 Mar 19 06:22:27.912" : 0.058333299999999998
                                    } },
                                { "s-3600-summary" : { "b1" : "8",
                                      "sum" : "0.4555491"
                                    } }
                              ],
                              "NodeStatus":{
                                "process_info" : [ { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137426055669",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-vrouter-agent",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137424052005",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-vrouter-nodemgr",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1395137416543513",
                                      "last_stop_time" : null,
                                      "process_name" : "openstack-nova-compute",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    }
                                  ]
                              }
                          }
                      }
                  }
                ]
            },
            output: {
                'VROUTER_SUMMARY' : [ { "alerts" : [  ],
                    "color" : "#7892dd",
                    "configIP" : "10.204.217.111",
                    "cpu" : "0.05",
                    "display_type" : "vRouter",
                    "errorIntfCnt" : 0,
                    "errorIntfCntText" : "",
                    "histCpuArr" : [ 0.051394599999999999,
                        0.047230099999999997,
                        0.051394599999999999,
                        0.051397499999999999,
                        0.051394599999999999,
                        0.048619200000000001,
                        0.050005599999999997,
                        0.048619200000000001,
                        0.051394599999999999,
                        0.050008299999999999
                      ],
                    "instCnt" : 0,
                    "intfCnt" : 0,
                    "ip" : "10.204.217.111",
                    "isConfigMissing" : false,
                    "isGeneratorRetrieved" : false,
                    "isPartialUveMissing" : false,
                    "isUveMissing" : false,
                    "memory" : "393.09 MB",
                    "name" : "nodeh7",
                    "nodeAlerts" : [  ],
                    "processAlerts" : [  ],
                    "shape" : "circle",
                    "size" : 1,
                    "status" : "Up since ",
                    "summaryIps" : "10.204.217.111",
                    "type" : "vRouter",
                    "uveCfgIPMisMatch" : false,
                    "uveIP" : [ "10.204.217.111",
                        "10.204.217.111"
                      ],
                    "version" : "1.03 (Build 1101)",
                    "vnCnt" : 0,
                    "vns" : [  ],
                    "x" : 0.050008299999999999,
                    "xmppPeerDownCnt" : 0,
                    "y" : 393.08984375
                  } ],
                        "test1": []
                }
            },
            parseControlNodesDashboardData: {
                input: {
                    'CONTROLNODES_SUMMARY': [ { "name" : "nodea8",
                        "nodeStatus" : "Up",
                        "value" : { "BgpRouterState" : { "bgp_router_ip_list" : [ "10.204.216.46" ],
                                "build_info" : "{\"build-info\":[{\"build-time\":\"2014-02-05 19:03:25.840629\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1107.el6\",\"build-number\":\"1107\"}]}",
                                "cpu_info" : { "cpu_share" : 0.016669400000000001,
                                    "meminfo" : { "peakvirt" : 484484,
                                        "res" : 18292,
                                        "virt" : 421336
                                      },
                                    "num_cpu" : 4
                                  },
                                "cpu_share" : [ { "history-10" : { "{\"ts\":1392197599042938}" : 0.016669400000000001,
                                          "{\"ts\":1392197779044780}" : 0.0166667,
                                          "{\"ts\":1392197839045452}" : 0.020836799999999999,
                                          "{\"ts\":1392197899046006}" : 0.016669400000000001,
                                          "{\"ts\":1392198019047408}" : 0.0125021,
                                          "{\"ts\":1392198079048147}" : 0.020836799999999999,
                                          "{\"ts\":1392198139048775}" : 0.0166667,
                                          "{\"ts\":1392198199049703}" : 0.016669400000000001,
                                          "{\"ts\":1392198499052895}" : 0.0166667,
                                          "{\"ts\":1392198559053620}" : 0.016669400000000001
                                        } },
                                    { "s-3600-topvals" : { "2014 Feb 12 09:26:19.38" : 0.020836799999999999,
                                          "2014 Feb 12 09:30:19.41" : 0.020836799999999999,
                                          "2014 Feb 12 09:32:19.42" : 0.020836799999999999,
                                          "2014 Feb 12 09:37:19.45" : 0.020836799999999999,
                                          "2014 Feb 12 09:41:19.48" : 0.020836799999999999
                                        } },
                                    { "s-3600-summary" : { "b1" : "36",
                                          "sum" : "0.61674832"
                                        } }
                                  ],
                                "ifmap_info" : { "connection_status" : "Down",
                                    "connection_status_change_at" : 1392198537704661,
                                    "url" : "10.204.216.46:8443"
                                  },
                                "num_bgp_peer" : 0,
                                "num_routing_instance" : 6,
                                "num_up_bgp_peer" : 0,
                                "num_up_xmpp_peer" : 1,
                                "num_xmpp_peer" : 1,
                                "output_queue_depth" : 0,
                                "NodeStatus":{
                                    "process_info" : [ { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1392031408218460",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-control",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1392031406212682",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-control-nodemgr",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1392031410227087",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-dns",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        },
                                        { "core_file_list" : [  ],
                                          "exit_count" : 0,
                                          "last_exit_time" : null,
                                          "last_start_time" : "1392031412228269",
                                          "last_stop_time" : null,
                                          "process_name" : "contrail-named",
                                          "process_state" : "PROCESS_STATE_RUNNING",
                                          "start_count" : 1,
                                          "stop_count" : 0
                                        }
                                      ]
                                },
                                "uptime" : 1392031395956100,
                                "virt_mem" : [ { "history-10" : { "{\"ts\":1392167118706305}" : 421336,
                                          "{\"ts\":1392173898782740}" : 421336,
                                          "{\"ts\":1392186918928765}" : 421336,
                                          "{\"ts\":1392187758937653}" : 421336,
                                          "{\"ts\":1392189078951501}" : 421336,
                                          "{\"ts\":1392189318953851}" : 421336,
                                          "{\"ts\":1392190278964837}" : 421336,
                                          "{\"ts\":1392190698969422}" : 421336,
                                          "{\"ts\":1392191538978175}" : 421336,
                                          "{\"ts\":1392193699001033}" : 421336
                                        } },
                                    { "s-3600-topvals" : {  } },
                                    { "s-3600-summary" : { "bmax" : "1",
                                          "sum" : "421336"
                                        } }
                                  ]
                              },
                            "ConfigData" : { "bgp-router" : { "bgp_router_parameters" : { "address" : "10.204.216.46",
                                        "address_families" : { "family" : [ "inet-vpn",
                                                "e-vpn"
                                              ] },
                                        "autonomous_system" : 64512,
                                        "identifier" : "10.204.216.46",
                                        "port" : 179,
                                        "vendor" : "contrail",
                                        "vnc_managed" : null
                                      },
                                    "fq_name" : [ "default-domain",
                                        "default-project",
                                        "ip-fabric",
                                        "__default__",
                                        "nodea8"
                                      ],
                                    "href" : "http://nodea8:8082/bgp-router/45544011-52de-473c-91f7-4900674393f0",
                                    "id_perms" : { "created" : "2014-02-10T11:21:50.607752",
                                        "description" : null,
                                        "enable" : true,
                                        "last_modified" : "2014-02-10T11:21:50.708626",
                                        "permissions" : { "group" : "cloud-admin-group",
                                            "group_access" : 7,
                                            "other_access" : 7,
                                            "owner" : "cloud-admin",
                                            "owner_access" : 7
                                          },
                                        "uuid" : { "uuid_lslong" : 10517955720828391000,
                                            "uuid_mslong" : 4995688329809644000
                                          }
                                      },
                                    "name" : "nodea8",
                                    "parent_href" : "http://nodea8:8082/routing-instance/24952b3e-bff5-4957-8c00-cb1510fec4d7",
                                    "parent_type" : "routing-instance",
                                    "parent_uuid" : "24952b3e-bff5-4957-8c00-cb1510fec4d7",
                                    "uuid" : "45544011-52de-473c-91f7-4900674393f0"
                                  } }
                          }
                      } ]
                },
                output: {
                    'CONTROLNODES_SUMMARY': [ { "activevRouterCount" : 1,
                        "alerts" : [ { "ip" : "10.204.216.46",
                            "msg" : "Ifmap Connection down",
                            "name" : "nodea8",
                            "sevLevel" : 0,
                            "timeStamp" : 1392198537704661,
                            "type" : "Control Node"
                          } ],
                      "color" : "#dc6660",
                      "configIP" : "10.204.216.46",
                      "configuredBgpPeerCnt" : 0,
                      "cpu" : "0.02",
                      "display_type" : "Control Node",
                      "downBgpPeerCnt" : 0,
                      "downBgpPeerCntText" : "",
                      "downXMPPPeerCnt" : 0,
                      "downXMPPPeerCntText" : "",
                      "establishedPeerCount" : 0,
                      "histCpuArr" : [ 0.016669400000000001,
                          0.0166667,
                          0.020836799999999999,
                          0.016669400000000001,
                          0.0125021,
                          0.020836799999999999,
                          0.0166667,
                          0.016669400000000001,
                          0.0166667,
                          0.016669400000000001
                        ],
                      "ifmapDownAt" : 1392198537704661,
                      "ip" : "10.204.216.46",
                      "isConfigMissing" : false,
                      "isGeneratorRetrieved" : false,
                      "isIfmapDown" : true,
                      "isPartialUveMissing" : false,
                      "isUveMissing" : false,
                      "memory" : "411.46 MB",
                      "name" : "nodea8",
                      "nodeAlerts" : [ { "ip" : "10.204.216.46",
                            "msg" : "Ifmap Connection down",
                            "name" : "nodea8",
                            "sevLevel" : 0,
                            "timeStamp" : 1392198537704661,
                            "type" : "Control Node"
                          } ],
                      "processAlerts" : [  ],
                      "shape" : "circle",
                      "size" : 1,
                      "status" : "Up since ",
                      "summaryIps" : "10.204.216.46",
                      "totalBgpPeerCnt" : 0,
                      "totalPeerCount" : 1,
                      "totalXMPPPeerCnt" : 1,
                      "type" : "controlNode",
                      "upBgpPeerCnt" : 0,
                      "upXMPPPeerCnt" : 1,
                      "uveCfgIPMisMatch" : false,
                      "uveIP" : [ "10.204.216.46" ],
                      "version" : "1.03 (Build 1107)",
                      "x" : 0.016669400000000001,
                      "y" : 411.4609375
                    } ]
                }
            },
            parseConfigNodesDashboardData: {
                input: {
                    'CONFIGNODES_SUMMARY': [ { "name" : "nodea8",
                        "value" : { "configNode" : { "ModuleCpuState" : { "api_server_cpu_share" : [ { "history-10" : { "{\"ts\":1392198730441652}" : 0,
                            "{\"ts\":1392198790543511}" : 0,
                            "{\"ts\":1392198850645534}" : 0,
                            "{\"ts\":1392198910748639}" : 0,
                            "{\"ts\":1392198970850953}" : 0,
                            "{\"ts\":1392199030952728}" : 0,
                            "{\"ts\":1392199091054984}" : 0,
                            "{\"ts\":1392199151157109}" : 0,
                            "{\"ts\":1392199211259065}" : 0,
                            "{\"ts\":1392199271360474}" : 0
                          } },
                      { "s-3600-topvals" : { "2014 Feb 12 10:00:11.259" : 0,
                            "2014 Feb 12 10:01:11.360" : 0
                          } },
                      { "s-3600-summary" : { "b1" : "2",
                            "sum" : "0"
                          } }
                    ],
                  "api_server_mem_virt" : [ { "history-10" : { "{\"ts\":1392198730441652}" : 321703,
                            "{\"ts\":1392198790543511}" : 321703,
                            "{\"ts\":1392198850645534}" : 321703,
                            "{\"ts\":1392198910748639}" : 321703,
                            "{\"ts\":1392198970850953}" : 321703,
                            "{\"ts\":1392199030952728}" : 321703,
                            "{\"ts\":1392199091054984}" : 321703,
                            "{\"ts\":1392199151157109}" : 321703,
                            "{\"ts\":1392199211259065}" : 321703,
                            "{\"ts\":1392199271360474}" : 321703
                          } },
                      { "s-3600-topvals" : { "2014 Feb 12 10:00:11.259" : 321703,
                            "2014 Feb 12 10:01:11.360" : 321703
                          } },
                      { "s-3600-summary" : { "b400000" : "2",
                            "sum" : "643406"
                          } }
                    ],
                  "build_info" : "{\"build-info\" : [{\"build-version\" : \"1.03\", \"build-time\" : \"2014-02-05 20:11:42.095589\", \"build-user\" : \"mganley\", \"build-hostname\" : \"contrail-ec-build04\", \"build-git-ver\" : \"\", \"build-id\" : \"1.03-1107.el6\n\", \"build-number\" : \"1107\n\"}]}",
                  "module_cpu_info" : [ { "cpu_info" : { "cpu_share" : 2.5750000000000002,
                            "meminfo" : { "peakvirt" : 314396,
                                "res" : 54796,
                                "virt" : 314396
                              },
                            "num_cpu" : 4
                          },
                        "instance_id" : "0",
                        "module_id" : "Schema"
                      },
                      { "cpu_info" : { "cpu_share" : 0,
                            "cpuload" : { "fifteen_min_avg" : 0,
                                "five_min_avg" : 0,
                                "one_min_avg" : 0
                              },
                            "meminfo" : { "peakvirt" : 321703,
                                "res" : 66359,
                                "virt" : 321703
                              },
                            "num_cpu" : 4,
                            "sys_mem_info" : { "buffers" : 325513,
                                "free" : 300535,
                                "total" : 33639374,
                                "used" : 33338839
                              }
                          },
                        "instance_id" : "0",
                        "module_id" : "ApiServer"
                      },
                      { "cpu_info" : { "cpu_share" : 0,
                            "meminfo" : { "peakvirt" : 300249,
                                "res" : 51335,
                                "virt" : 300249
                              },
                            "num_cpu" : 4
                          },
                        "instance_id" : "0",
                        "module_id" : "ServiceMonitor"
                      }
                    ],
                    "NodeStatus":{
                          "process_info" : [ { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031421077655",
                            "last_stop_time" : null,
                            "process_name" : "contrail-api:0",
                            "process_state" : "PROCESS_STATE_RUNNING",
                            "start_count" : 1,
                            "stop_count" : 0
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031415064786",
                            "last_stop_time" : null,
                            "process_name" : "redis-config",
                            "process_state" : "PROCESS_STATE_RUNNING",
                            "start_count" : 1,
                            "stop_count" : 0
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031413059723",
                            "last_stop_time" : null,
                            "process_name" : "contrail-config-nodemgr",
                            "process_state" : "PROCESS_STATE_RUNNING",
                            "start_count" : 1,
                            "stop_count" : 0
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031417072072",
                            "last_stop_time" : "1392186852753830",
                            "process_name" : "contrail-discovery:0",
                            "process_state" : "PROCESS_STATE_STOPPED",
                            "start_count" : 1,
                            "stop_count" : 1
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031425086415",
                            "last_stop_time" : null,
                            "process_name" : "contrail-svc-monitor",
                            "process_state" : "PROCESS_STATE_RUNNING",
                            "start_count" : 1,
                            "stop_count" : 0
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031419075457",
                            "last_stop_time" : "1392189058210917",
                            "process_name" : "ifmap",
                            "process_state" : "PROCESS_STATE_STOPPED",
                            "start_count" : 1,
                            "stop_count" : 1
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 1,
                            "last_exit_time" : "1392189060216682",
                            "last_start_time" : "1392031423083104",
                            "last_stop_time" : null,
                            "process_name" : "contrail-schema",
                            "process_state" : "PROCESS_STATE_EXITED",
                            "start_count" : 1,
                            "stop_count" : 0
                          },
                          { "core_file_list" : [  ],
                            "exit_count" : 0,
                            "last_exit_time" : null,
                            "last_start_time" : "1392031427092471",
                            "last_stop_time" : null,
                            "process_name" : "contrail-zookeeper",
                            "process_state" : "PROCESS_STATE_RUNNING",
                            "start_count" : 1,
                            "stop_count" : 0
                          }
                        ]
                    },
                  "schema_xmer_cpu_share" : [ { "history-10" : { "{\"ts\":1392188456790712}" : 0,
                            "{\"ts\":1392188516893411}" : 0,
                            "{\"ts\":1392188576996887}" : 0,
                            "{\"ts\":1392188637098688}" : 0,
                            "{\"ts\":1392188697200420}" : 0,
                            "{\"ts\":1392188757303181}" : 2.5750000000000002,
                            "{\"ts\":1392188817407357}" : 0,
                            "{\"ts\":1392188877511734}" : 0,
                            "{\"ts\":1392188937615635}" : 2.4500000000000002,
                            "{\"ts\":1392188997719654}" : 2.5750000000000002
                          } },
                      { "s-3600-topvals" : {  } },
                      { "s-3600-summary" : { "b1" : "7",
                            "b3" : "3",
                            "sum" : "7.6"
                          } }
                    ],
                  "schema_xmer_mem_virt" : [ { "history-10" : { "{\"ts\":1392188456790712}" : 314261,
                            "{\"ts\":1392188516893411}" : 314261,
                            "{\"ts\":1392188576996887}" : 314261,
                            "{\"ts\":1392188637098688}" : 314261,
                            "{\"ts\":1392188697200420}" : 314261,
                            "{\"ts\":1392188757303181}" : 314396,
                            "{\"ts\":1392188817407357}" : 314396,
                            "{\"ts\":1392188877511734}" : 314396,
                            "{\"ts\":1392188937615635}" : 314396,
                            "{\"ts\":1392188997719654}" : 314396
                          } },
                      { "s-3600-topvals" : {  } },
                      { "s-3600-summary" : { "b400000" : "10",
                            "sum" : "3143285"
                          } }
                    ],
                  "service_monitor_cpu_share" : [ { "history-10" : { "{\"ts\":1392198733987517}" : 0,
                            "{\"ts\":1392198794090660}" : 0,
                            "{\"ts\":1392198854192274}" : 0,
                            "{\"ts\":1392198914293903}" : 0,
                            "{\"ts\":1392198974395321}" : 0,
                            "{\"ts\":1392199034496246}" : 0,
                            "{\"ts\":1392199094597889}" : 0,
                            "{\"ts\":1392199154699216}" : 0,
                            "{\"ts\":1392199214801026}" : 0,
                            "{\"ts\":1392199274902707}" : 0
                          } },
                      { "s-3600-topvals" : { "2014 Feb 12 10:00:14.801" : 0,
                            "2014 Feb 12 10:01:14.902" : 0
                          } },
                      { "s-3600-summary" : { "b1" : "2",
                            "sum" : "0"
                          } }
                    ],
                  "service_monitor_mem_virt" : [ { "history-10" : { "{\"ts\":1392198733987517}" : 300249,
                            "{\"ts\":1392198794090660}" : 300249,
                            "{\"ts\":1392198854192274}" : 300249,
                            "{\"ts\":1392198914293903}" : 300249,
                            "{\"ts\":1392198974395321}" : 300249,
                            "{\"ts\":1392199034496246}" : 300249,
                            "{\"ts\":1392199094597889}" : 300249,
                            "{\"ts\":1392199154699216}" : 300249,
                            "{\"ts\":1392199214801026}" : 300249,
                            "{\"ts\":1392199274902707}" : 300249
                          } },
                      { "s-3600-topvals" : { "2014 Feb 12 10:00:14.801" : 300249,
                            "2014 Feb 12 10:01:14.902" : 300249
                          } },
                      { "s-3600-summary" : { "b400000" : "2",
                            "sum" : "600498"
                          } }
                    ]
                } } }
    } ]
                },
                output: {
                	'CONFIGNODES_SUMMARY':[ { "alerts" : [ { "msg" : "stopped",
                        "nName" : "nodea8",
                        "pName" : "ifmap",
                        "popupMsg" : "Stopped",
                        "sevLevel" : 0,
                        "timeStamp" : "1392189058210917",
                        "tooltipAlert" : false
                      },
                      { "detailAlert" : false,
                        "msg" : "1 Process down",
                        "sevLevel" : 0
                      }
                    ],
                  "color" : "#dc6660",
                  "cpu" : "0.00",
                  "display_type" : "Config Node",
                  "histCpuArr" : [ 0,
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
                  "ip" : "-",
                  "isGeneratorRetrieved" : false,
                  "isPartialUveMissing" : false,
                  "memory" : "314.16 MB",
                  "name" : "nodea8",
                  "nodeAlerts" : [  ],
                  "processAlerts" : [ { "msg" : "stopped",
                        "nName" : "nodea8",
                        "pName" : "ifmap",
                        "popupMsg" : "Stopped",
                        "sevLevel" : 0,
                        "timeStamp" : "1392189058210917",
                        "tooltipAlert" : false
                      },
                      { "detailAlert" : false,
                        "msg" : "1 Process down",
                        "sevLevel" : 0
                      }
                    ],
                  "shape" : "circle",
                  "size" : 1,
                  "status" : "Down since ",
                  "summaryIps" : "-",
                  "type" : "configNode",
                  "version" : "-",
                  "x" : 0,
                  "y" : 314.1630859375
                } ]
                }
            },
            parseAnalyticNodesDashboardData: {
                input: {
                    'ANALYTICSNODES_SUMMARY': [{ "name" : "nodea8",
                        "value" : { "CollectorState" : { "build_info" : "{\"build-info\":[{\"build-time\":\"2014-02-05 17:58:37.582885\",\"build-hostname\":\"contrail-ec-build04\",\"build-git-ver\":\"\",\"build-user\":\"mganley\",\"build-version\":\"1.03\",\"build-id\":\"1.03-1107.el6\",\"build-number\":\"1107\"}]}",
                            "generator_infos" : [ { "instance_id" : "0",
                                  "module_id" : "ApiServer",
                                  "node_type" : "Config",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "Collector",
                                  "node_type" : "Analytics",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "Contrail-Analytics-Nodemgr",
                                  "node_type" : "Analytics",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "Contrail-Config-Nodemgr",
                                  "node_type" : "Config",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "Contrail-Control-Nodemgr",
                                  "node_type" : "Control",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "Contrail-Vrouter-Nodemgr",
                                  "node_type" : "Compute",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "ControlNode",
                                  "node_type" : "Control",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "DnsAgent",
                                  "node_type" : "Control",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "OpServer",
                                  "node_type" : "Analytics",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "QueryEngine",
                                  "node_type" : "Analytics",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "ServiceMonitor",
                                  "node_type" : "Config",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                },
                                { "instance_id" : "0",
                                  "module_id" : "VRouterAgent",
                                  "node_type" : "Compute",
                                  "source" : "nodea8",
                                  "state" : "Established"
                                }
                              ],
                            "rx_socket_stats" : { "average_blocked_duration" : null,
                                "average_bytes" : 5072,
                                "blocked_count" : 0,
                                "blocked_duration" : null,
                                "bytes" : 1116583963,
                                "calls" : 220138
                              },
                            "self_ip_list" : [ "10.204.216.46" ],
                            "tx_socket_stats" : { "average_blocked_duration" : null,
                                "average_bytes" : 1060,
                                "blocked_count" : 0,
                                "blocked_duration" : "00:00:00",
                                "bytes" : 14846,
                                "calls" : 14
                              }
                          },
                        "ModuleCpuState" : { "collector_cpu_share" : [ { "history-10" : { "{\"ts\":1392198392655090}" : 0.212535,
                                      "{\"ts\":1392198452660478}" : 0.220833,
                                      "{\"ts\":1392198512665548}" : 0.22916700000000001,
                                      "{\"ts\":1392198572670244}" : 0.22087000000000001,
                                      "{\"ts\":1392198632675068}" : 0.19583300000000001,
                                      "{\"ts\":1392198692680424}" : 0.22087000000000001,
                                      "{\"ts\":1392198752685479}" : 0.26666699999999999,
                                      "{\"ts\":1392198812690836}" : 0.216667,
                                      "{\"ts\":1392198872695629}" : 0.22503799999999999,
                                      "{\"ts\":1392198932699876}" : 0.23333300000000001
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:15:32.497" : 0.26666699999999999,
                                      "2014 Feb 12 09:32:32.585" : 0.245833,
                                      "2014 Feb 12 09:37:32.608" : 0.25420900000000002,
                                      "2014 Feb 12 09:38:32.613" : 0.26666699999999999,
                                      "2014 Feb 12 09:52:32.685" : 0.26666699999999999
                                    } },
                                { "s-3600-summary" : { "b0.2" : "7",
                                      "b0.3" : "49",
                                      "sum" : "12.454968"
                                    } }
                              ],
                            "collector_mem_virt" : [ { "history-10" : { "{\"ts\":1392198392655090}" : 352272,
                                      "{\"ts\":1392198452660478}" : 352272,
                                      "{\"ts\":1392198512665548}" : 352272,
                                      "{\"ts\":1392198572670244}" : 352272,
                                      "{\"ts\":1392198632675068}" : 352272,
                                      "{\"ts\":1392198692680424}" : 352272,
                                      "{\"ts\":1392198752685479}" : 352272,
                                      "{\"ts\":1392198812690836}" : 352272,
                                      "{\"ts\":1392198872695629}" : 352272,
                                      "{\"ts\":1392198932699876}" : 352272
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:51:32.680" : 352272,
                                      "2014 Feb 12 09:52:32.685" : 352272,
                                      "2014 Feb 12 09:53:32.690" : 352272,
                                      "2014 Feb 12 09:54:32.695" : 352272,
                                      "2014 Feb 12 09:55:32.699" : 352272
                                    } },
                                { "s-3600-summary" : { "b400000" : "56",
                                      "sum" : "19727232"
                                    } }
                              ],
                            "module_cpu_info" : [ { "cpu_info" : { "cpu_share" : 0.23333300000000001,
                                      "meminfo" : { "peakvirt" : 417484,
                                          "res" : 27996,
                                          "virt" : 352272
                                        },
                                      "num_cpu" : 4
                                    },
                                  "instance_id" : "0",
                                  "module_id" : "Collector"
                                },
                                { "cpu_info" : { "cpu_share" : 0.0041673600000000002,
                                      "meminfo" : { "peakvirt" : 412612,
                                          "res" : 26648,
                                          "virt" : 347572
                                        },
                                      "num_cpu" : 4
                                    },
                                  "instance_id" : "0",
                                  "module_id" : "QueryEngine"
                                },
                                { "cpu_info" : { "cpu_share" : 0,
                                      "meminfo" : { "peakvirt" : 255392,
                                          "res" : 38644,
                                          "virt" : 255392
                                        }
                                    },
                                  "instance_id" : "0",
                                  "module_id" : "OpServer"
                                }
                              ],
                            "opserver_cpu_share" : [ { "history-10" : { "{\"ts\":1392198362237235}" : 0,
                                      "{\"ts\":1392198422339660}" : 0,
                                      "{\"ts\":1392198482442051}" : 2.5,
                                      "{\"ts\":1392198542544282}" : 0,
                                      "{\"ts\":1392198602647156}" : 0,
                                      "{\"ts\":1392198662749913}" : 0,
                                      "{\"ts\":1392198722852727}" : 0,
                                      "{\"ts\":1392198782955050}" : 0,
                                      "{\"ts\":1392198843057682}" : 0,
                                      "{\"ts\":1392198903160449}" : 0
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:10:58.632" : 5,
                                      "2014 Feb 12 09:36:01.219" : 2.5,
                                      "2014 Feb 12 09:48:02.442" : 2.5,
                                      "2014 Feb 12 09:54:03.57" : 0,
                                      "2014 Feb 12 09:55:03.160" : 0
                                    } },
                                { "s-3600-summary" : { "b0.1" : "52",
                                      "bmax" : "3",
                                      "sum" : "10"
                                    } }
                              ],
                            "opserver_mem_virt" : [ { "history-10" : { "{\"ts\":1392198362237235}" : 255392,
                                      "{\"ts\":1392198422339660}" : 255392,
                                      "{\"ts\":1392198482442051}" : 255392,
                                      "{\"ts\":1392198542544282}" : 255392,
                                      "{\"ts\":1392198602647156}" : 255392,
                                      "{\"ts\":1392198662749913}" : 255392,
                                      "{\"ts\":1392198722852727}" : 255392,
                                      "{\"ts\":1392198782955050}" : 255392,
                                      "{\"ts\":1392198843057682}" : 255392,
                                      "{\"ts\":1392198903160449}" : 255392
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:51:02.749" : 255392,
                                      "2014 Feb 12 09:52:02.852" : 255392,
                                      "2014 Feb 12 09:53:02.955" : 255392,
                                      "2014 Feb 12 09:54:03.57" : 255392,
                                      "2014 Feb 12 09:55:03.160" : 255392
                                    } },
                                { "s-3600-summary" : { "b300000" : "55",
                                      "sum" : "14046560"
                                    } }
                              ],
                              "NodeStatus":{
                                "process_info" : [ { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031412546885",
                                      "last_stop_time" : null,
                                      "process_name" : "redis-query",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031418563789",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-query-engine",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031416558338",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-collector",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031408536264",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-analytics-nodemgr",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031414552561",
                                      "last_stop_time" : null,
                                      "process_name" : "redis-uve",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031420569403",
                                      "last_stop_time" : null,
                                      "process_name" : "contrail-analytics-api",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    },
                                    { "core_file_list" : [  ],
                                      "exit_count" : 0,
                                      "last_exit_time" : null,
                                      "last_start_time" : "1392031410542571",
                                      "last_stop_time" : null,
                                      "process_name" : "redis-sentinel",
                                      "process_state" : "PROCESS_STATE_RUNNING",
                                      "start_count" : 1,
                                      "stop_count" : 0
                                    }
                                  ]
                            },
                            "queryengine_cpu_share" : [ { "history-10" : { "{\"ts\":1392198391710580}" : 0.0083347200000000003,
                                      "{\"ts\":1392198451710998}" : 0.0041673600000000002,
                                      "{\"ts\":1392198511711397}" : 0.0041673600000000002,
                                      "{\"ts\":1392198571711694}" : 0,
                                      "{\"ts\":1392198631712093}" : 0.0041673600000000002,
                                      "{\"ts\":1392198691712456}" : 0.0083333299999999999,
                                      "{\"ts\":1392198751712860}" : 0.212535,
                                      "{\"ts\":1392198811713304}" : 0,
                                      "{\"ts\":1392198871713704}" : 0.0041673600000000002,
                                      "{\"ts\":1392198931714079}" : 0.0041673600000000002
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:11:31.695" : 0.20420099999999999,
                                      "2014 Feb 12 09:15:31.697" : 0.212535,
                                      "2014 Feb 12 09:37:31.707" : 0.20003299999999999,
                                      "2014 Feb 12 09:38:31.707" : 0.212535,
                                      "2014 Feb 12 09:52:31.712" : 0.212535
                                    } },
                                { "s-3600-summary" : { "b0.1" : "51",
                                      "b0.3" : "5",
                                      "sum" : "1.24186744"
                                    } }
                              ],
                            "queryengine_mem_virt" : [ { "history-10" : { "{\"ts\":1392198391710580}" : 347572,
                                      "{\"ts\":1392198451710998}" : 347572,
                                      "{\"ts\":1392198511711397}" : 347572,
                                      "{\"ts\":1392198571711694}" : 347572,
                                      "{\"ts\":1392198631712093}" : 347572,
                                      "{\"ts\":1392198691712456}" : 347572,
                                      "{\"ts\":1392198751712860}" : 347572,
                                      "{\"ts\":1392198811713304}" : 347572,
                                      "{\"ts\":1392198871713704}" : 347572,
                                      "{\"ts\":1392198931714079}" : 347572
                                    } },
                                { "s-3600-topvals" : { "2014 Feb 12 09:51:31.712" : 347572,
                                      "2014 Feb 12 09:52:31.712" : 347572,
                                      "2014 Feb 12 09:53:31.713" : 347572,
                                      "2014 Feb 12 09:54:31.713" : 347572,
                                      "2014 Feb 12 09:55:31.714" : 347572
                                    } },
                                { "s-3600-summary" : { "b400000" : "56",
                                      "sum" : "19464032"
                                    } }
                              ]
                          },
                        "QueryStats" : { "abandoned_queries" : [  ],
                            "error_queries" : [  ],
                            "pending_queries" : [  ],
                            "queries_being_processed" : [  ]
                          }
                      }
                  }]
                },
                output: {
                    'ANALYTICSNODES_SUMMARY': [ { "alerts" : [  ],
                        "color" : "#7892dd",
                        "cpu" : "0.23",
                        "display_type" : "Analytics Node",
                        "errorStrings" : [  ],
                        "genCount" : 12,
                        "histCpuArr" : [ 0.212535,
                            0.220833,
                            0.22916700000000001,
                            0.22087000000000001,
                            0.19583300000000001,
                            0.22087000000000001,
                            0.26666699999999999,
                            0.216667,
                            0.22503799999999999,
                            0.23333300000000001
                          ],
                        "ip" : "10.204.216.46",
                        "isGeneratorRetrieved" : false,
                        "isPartialUveMissing" : false,
                        "memory" : "344.02 MB",
                        "name" : "nodea8",
                        "nodeAlerts" : [  ],
                        "pendingQueryCnt" : 0,
                        "processAlerts" : [  ],
                        "shape" : "circle",
                        "size" : 1,
                        "status" : "Up since ",
                        "summaryIps" : "10.204.216.46",
                        "type" : "analyticsNode",
                        "version" : "1.03 (Build 1107)",
                        "x" : 0.23333300000000001,
                        "y" : 344.015625
                      } ]
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
            			        "contrail-vrouter-agent": {
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

