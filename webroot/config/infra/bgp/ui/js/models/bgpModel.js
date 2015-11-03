/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/bgp/ui/js/models/bgpPeersModel'
], function (_, ContrailModel, BGPPeersModel) {
    var self;
    var bgpCfgModel = ContrailModel.extend({
        defaultConfig: {
            'name': null,
            'display_name' : null,
            'fq_name' : null,
            'parent_type' : 'routing-instance',
            'parent_name' : '__default__',
            'bgp_router_parameters' : {
                'vendor' : null,
                'port' : 179,
                'address' : null,
                'identifier' : null,
                'hold_time' : 90,
                'autonomous_system' : null,
                'address_families' : {
                    'family' : []
                },
                'auth_data' : null
            },
            'bgp_router_refs' : [],
            'physical_router_back_refs' : [],
            'user_created_role' : 'bgp_router',
            'user_created_autonomous_system' : null,
            'user_created_address_family' :
                'inet-vpn,inet6-vpn,route-target,e-vpn',
            'user_created_auth_key_type' : 'none',
            'user_created_auth_key' : null,
            'user_created_physical_router' : 'none',
            'user_created_vendor' : null,
            'user_created_address': null,
            'user_created_identifier': null,
            'addressFamilyData' : ctwc.BGP_ADDRESS_FAMILY_DATA,
            'isAutoMeshEnabled' : null
        },
        formatModelConfig : function(modelConfig) {
            self = this;
            // populate bgp router parameters
            var bgpParams = modelConfig['bgp_router_parameters'];
            if(bgpParams['vendor'] != null) {
                modelConfig['user_created_vendor'] = bgpParams['vendor'];
            }
            if(bgpParams['address'] != null) {
                modelConfig['user_created_address'] = bgpParams['address'];
            }
            if(bgpParams['identifier'] != null) {
                modelConfig['user_created_identifier'] = bgpParams['identifier'];
            }
            if(bgpParams['autonomous_system'] != null) {
                modelConfig['user_created_autonomous_system'] =
                    bgpParams['autonomous_system'];
            }
            if(bgpParams['auth_data'] != null) {
                var authData = bgpParams['auth_data'];
                modelConfig['user_created_auth_key_type'] =
                    authData.key_type != null ? authData.key_type : 'none';
                modelConfig['user_created_auth_key'] =
                    authData.key_items != null &&
                    authData.key_items.length > 0 ?
                    authData.key_items[0].key : '';
            }
            if(bgpParams['address_families']['family'].length > 0) {
                modelConfig['user_created_address_family'] =
                    bgpParams['address_families']['family'];
            } else{
                //it is required to send default family list for bgp router type
                bgpParams['address_families']['family'] =
                   ['inet-vpn','inet6-vpn','route-target','e-vpn'];
            }

            //populate user_created_physical_router
            if(modelConfig['physical_router_back_refs'] != null &&
                modelConfig['physical_router_back_refs'].length > 0) {
                modelConfig['user_created_physical_router'] =
                    modelConfig['physical_router_back_refs'][0].uuid;
            }

            //populate available peers
            var selectedPeers = ifNull(modelConfig['bgp_router_refs'],[]),
                peerModels = [], peerModel,
                peerCollectionModel;
            var availablePeers = window.bgp != null &&
                window.bgp.availablePeers != null ?
                window.bgp.availablePeers : [];
            if(availablePeers.length > 0) {
                for(var i = 0; i < availablePeers.length; i++) {
                    var isSelected = false;
                    var currentPeer = availablePeers[i];
                    var authData = null;
                    if(selectedPeers.length > 0) {
                        for(var j = 0; j < selectedPeers.length; j++) {
                            var selectedPeer = selectedPeers[j];
                            if(currentPeer.name === selectedPeer.to[4]) {
                                isSelected = true;
                                authData = getValueByJsonPath(selectedPeer,
                                'attr;session;0;attributes;0;auth_data', null);
                                break;
                            }
                        }
                    }
                    peerModel = new BGPPeersModel({
                        isPeerSelected : isSelected,
                        peerName : currentPeer.name,
                        disabled : true,
                        auth_data : authData,
                        peerASN :
                            currentPeer.bgp_router_parameters.autonomous_system
                    });
                    peerModel.__kb.view_model.model().on('change:user_created_auth_key_type',
                        function(model, newValue){
                             var currPeer = self.getCurrentPeer(
                                 this.attributes.peerName);
                            if(newValue === 'none') {
                                currPeer.user_created_auth_key('');
                                currPeer.disableAuthKey(true);
                            } else {
                                var authKey = '';
                                if(currPeer.auth_data() != null) {
                                    var authData = currPeer.auth_data();
                                    authKey = authData.key_items != null &&
                                        authData.key_items.length > 0 ?
                                        authData.key_items[0].key : '';
                                }
                                currPeer.user_created_auth_key(authKey);
                                currPeer.disableAuthKey(false);
                            }
                        }
                    );
                    peerModels.push(peerModel)
                }
            };
            peerCollectionModel = new Backbone.Collection(peerModels);
            modelConfig['peers'] = peerCollectionModel;
            return modelConfig;
        },
        getCurrentPeer: function(name){
            var model;
            var peers = this.model().attributes['peers'].toJSON();
            for(var i = 0; i < peers.length; i++) {
                if(peers[i].peerName() === name) {
                    model = peers[i];
                    break;
                }
            }
            return model;
        },
        getPeers : function(attr) {
            var peerCollection = attr.peers.toJSON(),
                peerArray = [];
            for(var i = 0; i < peerCollection.length; i++) {
                if(peerCollection[i].isPeerSelected()) {
                    var peer = peerCollection[i];
                    var authData = null;
                    if(peer.user_created_auth_key_type() != 'none') {
                        authData = {
                            key_type : peer.user_created_auth_key_type(),
                            key_items : [{
                                key_id : 0,
                                key : peer.user_created_auth_key()
                            }]
                       };
                    }
                    peerArray.push({
                        peerName : peer.peerName(),
                        authData : authData
                    });
                }
            }
            return peerArray;
        },
        configBGPRouter: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postBGPData = {'bgp-router':{}};
            var postData = { 'content' : {}};
            var peers = [];
            var self  = this;
            if (self.model().isValid(true, "configureValidations")) {
                var attr = this.model().attributes;
                var newBGPRouterCfgData = $.extend(true, {}, attr);

                if(!newBGPRouterCfgData.isAutoMeshEnabled ||
                    newBGPRouterCfgData.user_created_role !==
                    ctwl.CONTROL_NODE_TYPE) {
                    var selectdata = self.getPeers(newBGPRouterCfgData);
                    for (var i = 0; i < selectdata.length; i++) {
                        for (var j = 0; j < self.bgpData.length; j++) {
                            if (self.bgpData[j].name == selectdata[i].peerName) {
                                var attr = {};
                                attr.session = [];
                                attr.session.push({
                                    uuid: null,
                                    attributes: [
                                        {
                                            auth_data : selectdata[i].authData
                                        }
                                    ]
                                })
                                peers.push(
                                    {
                                        "uuid":self.bgpData[j].uuid,
                                        "href":self.bgpData[j].href,
                                        "_id_params":self.bgpData[j]._id_params,
                                        "to":["default-domain", "default-project" ,
                                            "ip-fabric", "__default__", selectdata[i].peerName],
                                        "attr" : attr
                                    }
                                );
                                break;
                            }
                        }
                    }

                }
                //set physical router post data
                postData['content']['prouter-params'] = {
                    newProuter :
                        newBGPRouterCfgData.user_created_physical_router
                };
                var holdTime =
                    newBGPRouterCfgData.bgp_router_parameters.hold_time;
                if(holdTime != null && holdTime.toString().trim() != '') {
                    newBGPRouterCfgData.bgp_router_parameters.hold_time =
                        parseInt(holdTime.toString().trim());
                }

                var port = newBGPRouterCfgData.bgp_router_parameters.port;
                if(port != null && port.toString().trim() != '') {
                    newBGPRouterCfgData.bgp_router_parameters.port =
                        parseInt(port.toString().trim());
                }

                //handling auth data
                if(newBGPRouterCfgData.user_created_auth_key_type != 'none') {
                    newBGPRouterCfgData.bgp_router_parameters.auth_data = {
                        key_type : newBGPRouterCfgData.user_created_auth_key_type,
                        key_items : [{
                            key_id : 0,
                            key : newBGPRouterCfgData.user_created_auth_key
                        }]
                    };
                } else {
                   newBGPRouterCfgData.bgp_router_parameters.auth_data = null;
                }

                delete newBGPRouterCfgData.errors;
                delete newBGPRouterCfgData.locks;
                delete newBGPRouterCfgData.cgrid;
                delete newBGPRouterCfgData.id_perms;
                delete newBGPRouterCfgData.bgp_router_refs;
                delete newBGPRouterCfgData.physical_router_back_refs;
                delete newBGPRouterCfgData.user_created_role;
                delete newBGPRouterCfgData.user_created_address;
                delete newBGPRouterCfgData.user_created_identifier;
                delete newBGPRouterCfgData.user_created_address_family;
                delete newBGPRouterCfgData.user_created_auth_key_type;
                delete newBGPRouterCfgData.user_created_auth_key;
                delete newBGPRouterCfgData.user_created_physical_router;
                delete newBGPRouterCfgData.user_created_vendor;
                delete newBGPRouterCfgData.addressFamilyData;
                delete newBGPRouterCfgData.isAutoMeshEnabled;
                delete newBGPRouterCfgData.peers;
                delete newBGPRouterCfgData.elementConfigMap;

                postBGPData['bgp-router'] = newBGPRouterCfgData;
                if(peers.length > 0) {
                    postBGPData['bgp-router']['bgp_router_refs'] = peers
                }
                postData['content']['bgp-router'] = postBGPData['bgp-router'];

                ajaxConfig.type  = ajaxMethod;
                ajaxConfig.data  = JSON.stringify(postData);
                ajaxConfig.url   = ajaxMethod == 'PUT' ?
                                   '/api/admin/bgp-router/' +
                                   newBGPRouterCfgData['uuid'] :
                                   '/api/admin/bgp-router';


                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.BGP_PREFIX_ID));
                }
            }

            return returnFlag;
        },
        deleteBGPRouters : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'bgp-router',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations: {
            configureValidations: {
                'name': {
                    required: true,
                    msg: 'Hostname is required'
                },
                'user_created_autonomous_system' : function(value, attr, finalObj){
                     var asn = parseInt(value);
                     if (asn < 1 || asn > 65534 || isNaN(asn)) {
                         return "Enter valid BGP ASN number between 1-65534";
                     }
                },
                'user_created_identifier' : function(value, attr, finalObj){
                    if (!isValidIP(value) || value.trim().indexOf("/") != -1) {
                        return "Enter a valid BGP router ID in the format xxx.xxx.xxx.xxx";
                    }
                },
                'user_created_address' : function(value, attr, finalObj){
                    if (!isValidIP(value) || value.trim().indexOf("/") != -1) {
                        return "Enter a valid BGP router address in the format xxx.xxx.xxx.xxx";
                    }
                },
                'user_created_auth_key' : function(value, attr, finalObj){
                    if (finalObj['user_created_auth_key_type'] != 'none'
                        && (value == null || value.trim() == '')) {
                        return "Enter a valid Authentication key";
                    }
                },
                'bgp_router_parameters.port' :  function(value, attr, finalObj){
                     var port = parseInt(value);
                    if (port <= 0 || port > 9999 || isNaN(port)) {
                        return "Enter valid BGP port number between 1-9999";
                    }
                },
                'bgp_router_parameters.hold_time' :  function(value, attr, finalObj){
                    if(value != "") {
                        var holdTime = parseInt(value);
                        if (holdTime < 1 || holdTime > 65535 || isNaN(holdTime)) {
                            return "Enter valid  hold time between 1-65535" ;
                        }
                    }
                },
                'user_created_vendor' : function(value, attr, finalObj){
                    if (finalObj.user_created_role !== ctwl.CONTROL_NODE_TYPE){
                        if(value === null || value.trim() === '') {
                            return "Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'";
                        } else if(value.trim().toLowerCase() === "contrail"){
                            return "Vendor name cannot be 'contrail'.\
                                Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'";
                        }
                    }
                }
            }
        },
    });
    return bgpCfgModel;
});
