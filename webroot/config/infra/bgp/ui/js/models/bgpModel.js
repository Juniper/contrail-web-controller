/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/infra/bgp/ui/js/models/bgpPeersModel'
], function (_, ContrailConfigModel, BGPPeersModel) {
    var self;
    var bgpCfgModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': null,
            'display_name' : null,
            'fq_name' : null,
            'parent_type' : 'routing-instance',
            'bgp_router_parameters' : {
                'router_type' : "router",
                'vendor' : null,
                'port' : 179,
                'source_port' : null,
                'address' : null,
                'identifier' : null,
                'hold_time' : 90,
                'admin_down' : false,
                'autonomous_system' : null,
                'local_autonomous_system' : null,
                'address_families' : {
                    'family' : []
                },
                'auth_data' : null
            },
            'bgp_router_refs' : [],
            'physical_router_back_refs' : [],
            'user_created_router_type' : null,
            'user_created_autonomous_system' : null,
            'user_created_address_family' :
                'inet-vpn,route-target,inet6-vpn,e-vpn',
            'user_created_auth_key_type' : 'none',
            'user_created_auth_key' : null,
            'user_created_physical_router' : 'none',
            'user_created_vendor' : null,
            'user_created_address': null,
            'user_created_identifier': null,
            'addressFamilyData' : ctwc.BGP_ADDRESS_FAMILY_DATA,
            'isAutoMeshEnabled' : null,
            'user_created_admin_state': true
        },

        formatModelConfig : function(modelConfig) {
            self = this;
            modelConfig['display_name'] = ctwu.getDisplayNameOrName(modelConfig);
            // populate bgp router parameters
            var bgpParams = modelConfig['bgp_router_parameters'];
            if(bgpParams["router_type"]) {
                modelConfig["user_created_router_type"] =
                    bgpParams["router_type"];
                if(bgpParams["router_type"] === ctwl.BGP_ROUTER_TYPE) {
                    modelConfig["addressFamilyData"] =
                        ctwc.BGP_ADDRESS_FAMILY_DATA;
                } else {
                    modelConfig["addressFamilyData"] =
                        ctwc.CN_ADDRESS_FAMILY_DATA;
                }
            } else {
                modelConfig["user_created_router_type"] = "router";
            }
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
            if(bgpParams['admin_down'] != null) {
                modelConfig['user_created_admin_state'] =
                    !bgpParams['admin_down'];
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
            if(selectedPeers.length > 0) {
                for(var i = 0; i < selectedPeers.length; i++) {
                    var currentPeer = selectedPeers[i];
                    var authData = null;
                    var adminDown = false, passive = false;
                    var holdTime = 0, loopCount = 0, localAutonomousSystem = 0;
                    var familyAttrs = [];
                    var attr = getValueByJsonPath(currentPeer,
                        "attr;session;0;attributes;0", null);
                    if(attr) {
                        authData = getValueByJsonPath(attr, "auth_data", null);
                        adminDown = getValueByJsonPath(attr, "admin_down", false);
                        passive = getValueByJsonPath(attr, "passive", false);
                        holdTime = getValueByJsonPath(attr, "hold_time", 0);
                        loopCount = getValueByJsonPath(attr, "loop_count", 0);
                        localAutonomousSystem = getValueByJsonPath(attr, "local_autonomous_system", 0);
                        familyAttrs = getValueByJsonPath(attr, "family_attributes", []);
                    }
                    peerModel = new BGPPeersModel({
                        peerName : currentPeer.uuid,
                        disabled : true,
                        auth_data : authData,
                        admin_state : !adminDown,
                        passive : passive,
                        hold_time : holdTime,
                        loop_count : loopCount,
                        local_autonomous_system : localAutonomousSystem,
                        /*peerASN :
                            currentPeer.bgp_router_parameters.autonomous_system,*/
                        family_attributes: familyAttrs,
                        user_created_auth_key_type : null,
                        user_created_auth_key: null
                    });
                    self.subscribePeerModelChangeEvents(peerModel);
                    peerModels.push(peerModel)
                }
            };
            peerCollectionModel = new Backbone.Collection(peerModels);
            modelConfig['peers'] = peerCollectionModel;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        subscribePeerModelChangeEvents: function(peerModel) {
            peerModel.__kb.view_model.model().on('change:user_created_auth_key_type',
                function(model, newValue){
                     var currPeer = self.getCurrentPeer(model.cid);
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
        },

        addPeer: function() {
            var peers = this.model().attributes['peers'],
                peersArry = peers.toJSON();
            newPeer = new BGPPeersModel({
                peerName : null,
                disabled: false,
                auth_data : null,
                admin_state : true,
                passive : false,
                hold_time : null,
                loop_count : null,
                family_attributes: [],
                user_created_auth_key_type : null,
                user_created_auth_key: null
            });
            this.subscribePeerModelChangeEvents(newPeer);
            kbValidation.bind(this.editView,
                {collection: newPeer.model().attributes.family_attrs});
            peers.add([newPeer]);
        },
        addPeerByIndex: function(data, kbInterface) {
          var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
          var peers = this.model().attributes['peers'],
                peersArry = peers.toJSON();
            newPeer = new BGPPeersModel({
                peerName : null,
                disabled: false,
                auth_data : null,
                admin_state : true,
                passive : false,
                hold_time : null,
                loop_count : null,
                family_attributes: [],
                user_created_auth_key_type : null,
                user_created_auth_key: null
            });
            this.subscribePeerModelChangeEvents(newPeer);
            kbValidation.bind(this.editView,
                {collection: newPeer.model().attributes.family_attrs});
            peers.add([newPeer],{at: selectedRuleIndex+1});
        },

        deletePeer: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model());
        },

        getCurrentPeer: function(id){
            var model;
            var peers = this.model().attributes['peers'].toJSON();
            for(var i = 0; i < peers.length; i++) {
                if(peers[i].model().cid === id) {
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
                    adminDown : !peer.admin_state(),
                    passive : peer.passive(),
                    holdTime : peer.hold_time() ? Number(peer.hold_time()) : 0,
                    loopCount : peer.loop_count() ? Number(peer.loop_count()) : 0,
                    localAutonomousSystem : peer.local_autonomous_system() ? Number(peer.local_autonomous_system()) : 0,
                    authData : authData,
                    familyAttrs : peer.getFamilyAttrs(peer.family_attrs())
                });
            }
            return peerArray;
        },

        configBGPRouter: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false,
                postBGPData = {'bgp-router':{}},
                postData = { 'content' : {}},
                peers = [],
                partialFQName = ["default-domain", "default-project",
                   "ip-fabric", "__default__"];
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "configureValidation"
                },
                {
                    key : "peers",
                    type : cowc.OBJECT_TYPE_COLLECTION,
                    getValidation : "peerValidation"
                },
                {
                    key : ["peers", "family_attrs"],
                    type : cowc.OBJECT_TYPE_COLLECTION_OF_COLLECTION,
                    getValidation : "familyAttrValidation"
                },
                //permissions
                ctwu.getPermissionsValidation()
            ];

            if (this.isDeepValid(validations)) {
                var attr = this.model().attributes;
                var newBGPRouterCfgData = $.extend(true, {}, attr);

                ctwu.setNameFromDisplayName(newBGPRouterCfgData);

                if (newBGPRouterCfgData['fq_name'] == null ||
                    !newBGPRouterCfgData['fq_name'].length) {
                    partialFQName.push(newBGPRouterCfgData["name"]);
                    newBGPRouterCfgData['fq_name'] = partialFQName;
                }
                var isControlNode = newBGPRouterCfgData.user_created_router_type === ctwl.CONTROL_NODE_TYPE;
                var isEditing = ajaxMethod === "PUT";
                if(!newBGPRouterCfgData.isAutoMeshEnabled || !isControlNode || (isControlNode && isEditing)) {
                    var selectedData = self.getPeers(newBGPRouterCfgData);
                    for (var i = 0; i < selectedData.length; i++) {
                        for (var j = 0; j < self.bgpData.length; j++) {
                            if (self.bgpData[j].uuid == selectedData[i].peerName) {
                                var peerAttr = selectedData[i];
                                var attr = {};
                                attr.session = [];
                                attr.session.push({
                                    uuid: null,
                                    attributes: [
                                        {
                                            admin_down : peerAttr.adminDown,
                                            passive : peerAttr.passive,
                                            hold_time : peerAttr.holdTime,
                                            loop_count : peerAttr.loopCount,
                                            local_autonomous_system : peerAttr.localAutonomousSystem,
                                            auth_data : selectedData[i].authData,
                                            family_attributes : selectedData[i].familyAttrs
                                        }
                                    ]
                                })
                                peers.push(
                                    {
                                        "uuid":self.bgpData[j].uuid,
                                        "href":self.bgpData[j].href,
                                        "_id_params":self.bgpData[j]._id_params,
                                        "to":["default-domain", "default-project",
                                            "ip-fabric", "__default__", self.bgpData[j].name],
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
                var localASN =
                    newBGPRouterCfgData.bgp_router_parameters.local_autonomous_system;
                if(localASN) {
                    newBGPRouterCfgData.bgp_router_parameters.local_autonomous_system =
                        Number(localASN);
                } else {
                    newBGPRouterCfgData.bgp_router_parameters.local_autonomous_system =
                        null;
                }
                var holdTime =
                    newBGPRouterCfgData.bgp_router_parameters.hold_time;
                newBGPRouterCfgData.bgp_router_parameters.hold_time =
                        holdTime ? Number(holdTime) : 90;

                var port = newBGPRouterCfgData.bgp_router_parameters.port;
                newBGPRouterCfgData.bgp_router_parameters.port =
                        port ? Number(port) : 179;
                var sourcePort =
                    newBGPRouterCfgData.bgp_router_parameters.source_port;
                newBGPRouterCfgData.bgp_router_parameters.source_port =
                    sourcePort ? Number(sourcePort) : 0;
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

                //source port
                port = newBGPRouterCfgData.bgp_router_parameters.source_port;
                if(!port) {
                   delete newBGPRouterCfgData.bgp_router_parameters.source_port;
                }
                //permissions
                this.updateRBACPermsAttrs(newBGPRouterCfgData);

                ctwu.deleteCGridData(newBGPRouterCfgData);

                delete newBGPRouterCfgData.id_perms;
                delete newBGPRouterCfgData.bgp_router_refs;
                delete newBGPRouterCfgData.physical_router_back_refs;
                delete newBGPRouterCfgData.user_created_router_type;
                delete newBGPRouterCfgData.user_created_address;
                delete newBGPRouterCfgData.user_created_identifier;
                delete newBGPRouterCfgData.user_created_autonomous_system;
                delete newBGPRouterCfgData.user_created_address_family;
                delete newBGPRouterCfgData.user_created_auth_key_type;
                delete newBGPRouterCfgData.user_created_auth_key;
                delete newBGPRouterCfgData.user_created_physical_router;
                delete newBGPRouterCfgData.user_created_vendor;
                delete newBGPRouterCfgData.addressFamilyData;
                delete newBGPRouterCfgData.isAutoMeshEnabled;
                delete newBGPRouterCfgData.peers;
                delete newBGPRouterCfgData.user_created_admin_state;

                postBGPData['bgp-router'] = newBGPRouterCfgData;
                if(peers.length > 0) {
                    postBGPData['bgp-router']['bgp_router_refs'] = peers;
                } else {
                    postBGPData['bgp-router']['bgp_router_refs'] = [];
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
            configureValidation: {
                'display_name': {
                    required: true,
                    msg: 'Enter Host Name'
                },
                'user_created_autonomous_system' : function(value, attr, finalObj){
                     var asn = Number(value);
                     if (isNaN(asn) || asn < 1 || asn > 65534) {
                         return "Enter valid Autonomous System Number between 1-65534";
                     }
                },
                'bgp_router_parameters.local_autonomous_system' : function(value, attr, finalObj){
                     if(value) {
                         var asn = Number(value);
                         if (isNaN(asn) || asn < 1 || asn > 65534) {
                             return "Enter valid BGP Router ASN between 1-65534";
                         }
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
                        return "Enter Authentication Key";
                    }
                },
                'bgp_router_parameters.port' :  function(value, attr, finalObj){
                    if(value) {
                        var port = Number(value);
                        if (isNaN(port) || port < 1 || port > 9999) {
                            return "Enter valid BGP port between 1-9999";
                        }
                    }
                },
                'bgp_router_parameters.source_port' : function(value, attr, finalObj){
                    if(value) {
                        var port = Number(value);
                        if (isNaN(port) || port < 1 || port > 9999) {
                            return "Enter valid source port between 1-9999";
                        }
                    }
                },
                'bgp_router_parameters.hold_time' :  function(value, attr, finalObj){
                    if(value) {
                        var holdTime = Number(value);
                        if (isNaN(holdTime) || holdTime < 1 || holdTime > 65535) {
                            return "Enter valid  hold time between 1-65535" ;
                        }
                    }
                },
                'user_created_vendor' : function(value, attr, finalObj){
                    if (finalObj.user_created_router_type !== ctwl.CONTROL_NODE_TYPE){
                        if(value === null || value.trim() === '') {
                            return "Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'";
                        } else if(value.trim().toLowerCase() === "contrail"){
                            return "Vendor name cannot be 'contrail'.\
                                Enter valid vendor name or SKU such as 'Juniper' or 'MX-40'";
                        }
                    }
                },
                "user_created_address_family" : function(value, attr, finalObj) {
                    if(!value) {
                        return "At least one Address Family is required";
                    }
                },
                "peers" : function(value, attr, finalObj) {
                    var peersArray =  finalObj.peers.toJSON();
                    var peers = [], sortedPeers, sortedPeerCnt, i;
                    if(peersArray) {
                        _.each(peersArray, function(item){
                            peers.push(item.peerName());
                        });
                        sortedPeers = peers.sort();
                        sortedPeerCnt = sortedPeers.length;
                        for(i = 0; i < sortedPeerCnt; i++){
                            if(sortedPeers[i] === sortedPeers[i + 1]){
                                return "Peers are repeated";
                            }
                        }
                    }
                }
            }
        },

        setGlobalASNAttributes: function(mode, result) {
            var globalSysConfig = getValueByJsonPath(result,
                "global-system-config", null),
                iBGPAutoMesh = getValueByJsonPath(globalSysConfig,
                "ibgp_auto_mesh", true);
            self.globalASN = getValueByJsonPath(globalSysConfig,
                "autonomous_system", null);
            self.isAutoMeshEnabled(iBGPAutoMesh);
            if(mode === ctwl.CREATE_ACTION) {
                self.user_created_autonomous_system(self.globalASN);
            }
        },
        getAddressFamilyStringArray : function(addressFamilies) {
            return _.map(addressFamilies,
                function(addressFamily) { return addressFamily.value;});
        },
        onRouterTypeSelectionChanged: function(newValue) {
            var addressFamilies, filterAddressFamilies,filterItemAdressFamilies;
            self.bgp_router_parameters().router_type = newValue;
            self.model().attributes['peers'].reset();
            if(newValue === ctwl.CONTROL_NODE_TYPE) {
                addressFamilies = ctwc.CN_ADDRESS_FAMILY_DATA;
                self.user_created_vendor('contrail');
                self.user_created_physical_router('none');
                filterItemAdressFamilies = addressFamilies.filter(function( obj ) {
                    return obj.text !== 'inet';
                });
                self.addressFamilyData(addressFamilies);
                filterAddressFamilies =
                    self.getAddressFamilyStringArray(filterItemAdressFamilies);
                self.user_created_address_family(filterAddressFamilies.join(","));
                //set global asn as asn for control node type
                self.user_created_autonomous_system(self.globalASN)

            } else if(newValue === ctwl.EXTERNAL_CONTROL_NODE_TYPE) {
                addressFamilies = ctwc.CN_ADDRESS_FAMILY_DATA;
                self.user_created_vendor('');
                self.user_created_physical_router('none');
                filterItemAdressFamilies = addressFamilies.filter(function( obj ) {
                    return obj.text !== 'inet';
                });
                self.addressFamilyData(addressFamilies);
                filterAddressFamilies =
                    self.getAddressFamilyStringArray(filterItemAdressFamilies);
                self.user_created_address_family(filterAddressFamilies.join(","));
            } else if(newValue === ctwl.BGP_ROUTER_TYPE) {
                addressFamilies = ctwc.BGP_ADDRESS_FAMILY_DATA;
                self.user_created_vendor('');
                filterItemAdressFamilies = addressFamilies.filter(function( obj ) {
                    return obj.text !== 'inet';
                });
                self.addressFamilyData(addressFamilies);
                filterAddressFamilies =
                    self.getAddressFamilyStringArray(filterItemAdressFamilies);
                self.user_created_address_family(filterAddressFamilies.join(","));
            }
        }
    });
    return bgpCfgModel;
});
