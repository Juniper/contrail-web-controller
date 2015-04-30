/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
  async = require('async'),
  logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
  commonUtils = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/utils/common.utils'),
  config = require(process.mainModule.exports["corePath"] + '/config/config.global.js'),
  global = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
  appErrors = require(process.mainModule.exports["corePath"] +
                      '/src/serverroot/errors/app.errors'),
  util = require('util'),
  ctrlGlobal = require('../../../../common/api/global'),
  jsonPath = require('JSONPath').eval,
  _ = require('underscore'),
  opApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/opServer.api');

function getPRouterChassisInfo(req, res, appData) {
    var PRouterChassisUVEs =  {
        "PRouterChassisUVEs" :
        [
            {
                "PRouterChassisData": {
                    "link_details" : [
                        {
                            "src_slot" : 0,
                            "dest_slot": 0,
                            "src_pfe" : 0,
                            "dest_pfe" : 1,
                            "traffic" : 123
                        }
                    ],
                    "power_modules" : [
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519029"
                        },
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519041"
                        },
                        {
                            "model_type": "PS 1.2-1.7kW; 100-240V AC in",
                            "serial_number": "QCS07519097"
                        }
                    ],
                    "fan_modules" : [
                        {
                            "name": "Fan Tray",
                            "description": "Left Fan Tray"
                        },
                        {
                            "name": "Fan Tray",
                            "description": "Right Fan Tray"
                        }
                    ],
                    "line_cards": [
                        {
                            "model_type": "MPC4E 3D 2CGE+8XGE", 
                            "slot_identifier": 0, 
                            "cpu_count": 7, 
                            "pfe_count": 4
                        }, 
                        {
                            "model_type": "MPCE Type 2 3D",
                            "slot_identifier": 1, 
                            "cpu_count": 8, 
                            "pfe_count": 2
                        }, 
                        {
                            "model_type": "MPC 3D 16x 10GE", 
                            "slot_identifier": 2, 
                            "cpu_count": 14, 
                            "pfe_count": 4
                        }
                    ], 
                    "switch_cards": [
                        {
                            "model_type": "RE-MX2000-1800X4-S", 
                            "slot_identifier": 0
                        }, 
                        {
                            "model_type": "RE-MX2000-1800X4-S", 
                            "slot_identifier": 1
                        }
                    ], 
                    "max_line_cards": 10, 
                    "max_routing_engines": 2,
                    "max_power_modules": 3,
                    "max_fan_modules": 2,
                    "routing_engines": [
                        {
                            "model_type": "RE-S-1800x4", 
                            "slot_identifier": 0
                        }, 
                        {
                            "model_type": "RE-S-1800x4", 
                            "slot_identifier": 1
                        }
                    ], 
                    "model_type": "MX2010", 
                    "max_switch_cards": 2, 
                    "identifier": "JN122A602AFK", 
                    "protocols": [
                        {
                            "name": "IPv4"
                        }, 
                        {
                            "name": "MPLS"
                        }, 
                        {
                            "name": "IPv6"
                        }, 
                        {
                            "name": "ARP"
                        }, 
                        {
                            "name": "CLNP"
                        }, 
                        {
                            "name": "CCC"
                        }, 
                        {
                            "name": "MLPPP"
                        }, 
                        {
                            "name": "TCC"
                        }, 
                        {
                            "name": "BRIDGE"
                        }, 
                        {
                            "name": "Multiservice"
                        }, 
                        {
                            "name": "DHCP"
                        }
                    ]
                }
            }
        ]
    };
    commonUtils.handleJSONResponse(null, res, PRouterChassisUVEs);
    /*var url = '/analytics/uves/prouters';
    opServer.api.get(url,function (error, uveData) {
        if(null != error) { 
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        var dataObjArr = [],uveDataLen = uveData.length;

        for (var i = 0; i < uveDataLen; i++){
            if(uveData[i]['name'] != null) {
                var reqUrl = '/analytics/uves/prouter/'+uveData[i]['name']+'?flat';
                commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET, null, opApiServer, null, appData);
            }
        }
        async.map(dataObjArr, commonUtils.getServerResponseByRestApi(opApiServer, true), 
                function(err, results) {
                logutils.logger.debug(JSON.stringify(results));
        });
    });*/

}


exports.getPRouterChassisInfo = getPRouterChassisInfo;