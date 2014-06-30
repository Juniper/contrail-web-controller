/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
function InfraControlMockData() {
    var mockData = {
        'processPeerInfo' : {
            "input" : {
                "test1" : {
                    "bgp-peer" : {
                        "value" : []
                    },
                    "xmpp-peer" : {
                        "value" : [ {
                            "name" : "nodeb7:10.204.216.38",
                            "value" : {
                                "XmppPeerInfoData" : {
                                    "event_info" : {
                                        "last_event" : "xmsm::EvXmppIqReceive",
                                        "last_event_at" : 1392612288344266
                                    },
                                    "identifier" : "nodeb7",
                                    "peer_stats_info" : {
                                        "rx_proto_stats" : {
                                            "close" : 0,
                                            "keepalive" : 751,
                                            "notification" : 0,
                                            "open" : 1,
                                            "total" : 754,
                                            "update" : 2
                                        },
                                        "rx_update_stats" : {
                                            "reach" : 0,
                                            "total" : 0,
                                            "unreach" : 0
                                        },
                                        "tx_proto_stats" : {
                                            "close" : 0,
                                            "keepalive" : 749,
                                            "notification" : 0,
                                            "open" : 1,
                                            "total" : 758,
                                            "update" : 8
                                        },
                                        "tx_update_stats" : {
                                            "reach" : 0,
                                            "total" : 0,
                                            "unreach" : 0
                                        }
                                    },
                                    "routing_tables" : [ "inet.0" ],
                                    "send_state" : "in sync",
                                    "state_info" : {
                                        "last_state" : "Active",
                                        "last_state_at" : 1392612288303484,
                                        "state" : "Established"
                                    }
                                }
                            }
                        } ]
                    }
                },
                "test2" : {
                    "bgp-peer" : {
                        "value" : []
                    },
                    "xmpp-peer" : {
                        "value" : []
                    }
                },
                "test3" : {
                    "bgp-peer" : {
                        "value" : []
                    },
                    "xmpp-peer" : {
                        "value" : [ {
                            "name" : "",
                            "value" : {
                                "XmppPeerInfoData" : {
                                    "event_info" : {
                                        "last_event" : "xmsm::EvXmppIqReceive",
                                        "last_event_at" : 1392612288344266
                                    },
                                    "identifier" : "nodeb7",
                                    "peer_stats_info" : {
                                        "rx_proto_stats" : {
                                            "close" : 0,
                                            "keepalive" : 751,
                                            "notification" : 0,
                                            "open" : 1,
                                            "total" : 754,
                                            "update" : 2
                                        },
                                        "rx_update_stats" : {
                                            "reach" : 0,
                                            "total" : 0,
                                            "unreach" : 0
                                        },
                                        "tx_proto_stats" : {
                                            "close" : 0,
                                            "keepalive" : 749,
                                            "notification" : 0,
                                            "open" : 1,
                                            "total" : 758,
                                            "update" : 8
                                        },
                                        "tx_update_stats" : {
                                            "reach" : 0,
                                            "total" : 0,
                                            "unreach" : 0
                                        }
                                    },
                                    "routing_tables" : [ "inet.0" ],
                                    "send_state" : "in sync",
                                    "state_info" : {
                                        "last_state" : "Active",
                                        "last_state_at" : 1392612288303484,
                                        "state" : "Established"
                                    }
                                }
                            }
                        } ]
                    }
                },
                "test4" : {
                    "bgp-peer" : {
                        "value" : []
                    },
                    "xmpp-peer" : {
                        "value" : [ {
                            "name" : "",
                            "value" : {
                                "XmppPeerInfoData" : {
                                    "event_info" : {
                                        "last_event" : "xmsm::EvXmppIqReceive",
                                        "last_event_at" : 1392612288344266
                                    },
                                    "identifier" : "nodeb7",
                                    "routing_tables" : [ "inet.0" ],
                                    "send_state" : "in sync",
                                    "state_info" : {
                                        "last_state" : "Active",
                                        "last_state_at" : 1392612288303484,
                                        "state" : "Established"
                                    }
                                }
                            }
                        } ]
                    }
                }
            },
            "output" : {
                "test1" : [ {
                    "encoding" : "XMPP",
                    "introspect_state" : "Established, in sync",
                    "last_event" : "xmsm::EvXmppIqReceive",
                    "last_event_at" : 1392612288344266,
                    "last_flap" : "-",
                    "last_state" : "Active",
                    "last_state_at" : 1392612288303484,
                    "messsages_in" : 754,
                    "messsages_out" : 758,
                    "name" : "nodeb7:10.204.216.38",
                    "peer_address" : "10.204.216.38",
                    "peer_asn" : "-",
                    "raw_json" : {
                        "name" : "nodeb7:10.204.216.38",
                        "value" : {
                            "XmppPeerInfoData" : {
                                "event_info" : {
                                    "last_event" : "xmsm::EvXmppIqReceive",
                                    "last_event_at" : 1392612288344266
                                },
                                "identifier" : "nodeb7",
                                "peer_stats_info" : {
                                    "rx_proto_stats" : {
                                        "close" : 0,
                                        "keepalive" : 751,
                                        "notification" : 0,
                                        "open" : 1,
                                        "total" : 754,
                                        "update" : 2
                                    },
                                    "rx_update_stats" : {
                                        "reach" : 0,
                                        "total" : 0,
                                        "unreach" : 0
                                    },
                                    "tx_proto_stats" : {
                                        "close" : 0,
                                        "keepalive" : 749,
                                        "notification" : 0,
                                        "open" : 1,
                                        "total" : 758,
                                        "update" : 8
                                    },
                                    "tx_update_stats" : {
                                        "reach" : 0,
                                        "total" : 0,
                                        "unreach" : 0
                                    }
                                },
                                "routing_tables" : [ "inet.0" ],
                                "send_state" : "in sync",
                                "state_info" : {
                                    "last_state" : "Active",
                                    "last_state_at" : 1392612288303484,
                                    "state" : "Established"
                                }
                            }
                        }
                    },
                    "routing_tables" : [ "inet.0" ],
                    "send_state" : [ "in sync" ],
                    "state" : "Established"
                } ],
                "test2" : [],
                "test3" : [ {
                    "encoding" : "XMPP",
                    "introspect_state" : "Established, in sync",
                    "last_event" : "xmsm::EvXmppIqReceive",
                    "last_event_at" : 1392612288344266,
                    "last_flap" : "-",
                    "last_state" : "Active",
                    "last_state_at" : 1392612288303484,
                    "messsages_in" : 754,
                    "messsages_out" : 758,
                    "name" : "",
                    "peer_address" : undefined,
                    "peer_asn" : "-",
                    "raw_json" : {
                        "name" : "",
                        "value" : {
                            "XmppPeerInfoData" : {
                                "event_info" : {
                                    "last_event" : "xmsm::EvXmppIqReceive",
                                    "last_event_at" : 1392612288344266
                                },
                                "identifier" : "nodeb7",
                                "peer_stats_info" : {
                                    "rx_proto_stats" : {
                                        "close" : 0,
                                        "keepalive" : 751,
                                        "notification" : 0,
                                        "open" : 1,
                                        "total" : 754,
                                        "update" : 2
                                    },
                                    "rx_update_stats" : {
                                        "reach" : 0,
                                        "total" : 0,
                                        "unreach" : 0
                                    },
                                    "tx_proto_stats" : {
                                        "close" : 0,
                                        "keepalive" : 749,
                                        "notification" : 0,
                                        "open" : 1,
                                        "total" : 758,
                                        "update" : 8
                                    },
                                    "tx_update_stats" : {
                                        "reach" : 0,
                                        "total" : 0,
                                        "unreach" : 0
                                    }
                                },
                                "routing_tables" : [ "inet.0" ],
                                "send_state" : "in sync",
                                "state_info" : {
                                    "last_state" : "Active",
                                    "last_state_at" : 1392612288303484,
                                    "state" : "Established"
                                }
                            }
                        }
                    },
                    "routing_tables" : [ "inet.0" ],
                    "send_state" : [ "in sync" ],
                    "state" : "Established"
                } ],
                "test4" : [ {
                    "encoding" : "XMPP",
                    "introspect_state" : "Established, in sync",
                    "last_event" : "xmsm::EvXmppIqReceive",
                    "last_event_at" : 1392612288344266,
                    "last_flap" : "-",
                    "last_state" : "Active",
                    "last_state_at" : 1392612288303484,
                    "messsages_in" : "-",
                    "messsages_out" : "-",
                    "name" : "",
                    "peer_address" : undefined,
                    "peer_asn" : "-",
                    "raw_json" : {
                        "name" : "",
                        "value" : {
                            "XmppPeerInfoData" : {
                                "event_info" : {
                                    "last_event" : "xmsm::EvXmppIqReceive",
                                    "last_event_at" : 1392612288344266
                                },
                                "identifier" : "nodeb7",
                                "routing_tables" : [ "inet.0" ],
                                "send_state" : "in sync",
                                "state_info" : {
                                    "last_state" : "Active",
                                    "last_state_at" : 1392612288303484,
                                    "state" : "Established"
                                }
                            }
                        }
                    },
                    "routing_tables" : [ "inet.0" ],
                    "send_state" : [ "in sync" ],
                    "state" : "Established"
                } ]
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
var infraControlMockData = new InfraControlMockData();