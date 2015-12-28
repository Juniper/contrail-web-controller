/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var bgpFormatters = function() {
        var self = this;

        /*
         * @displayNameFormatter
         */
        self.displayNameFormatter = function(r, c, v, cd, dc) {
            var displayName = getValueByJsonPath(dc, "display_name", "");
            if(!displayName){
                displayName = getValueByJsonPath(dc, "name", "-");
            }
            return displayName;
        };

        /*
         * @routerTypeFormatter
         */
        self.routerTypeFormatter = function(r, c, v, cd, dc) {
            var routerTypeDisplayName;
            var routerType = getValueByJsonPath(dc, "bgp_router_parameters;router_type", "");
            switch(routerType) {
                case "control-node" :
                    routerTypeDisplayName = "Control Node";
                    break;
                case "external-control-node" :
                    routerTypeDisplayName = "External Control Node";
                    break;
                case "router" :
                    routerTypeDisplayName = "BGP Router";
                    break;
                case "bgpaas-server" :
                    routerTypeDisplayName = "BGP as a service Server";
                    break;
                case "bgpaas-client" :
                    routerTypeDisplayName = "BGP as a service Client";
                    break;
                default :
                    routerTypeDisplayName = "-";
                    break;
            }
            return routerTypeDisplayName;
        };

        /*
         * @ipAdressFormatter
         */
        self.ipAdressFormatter = function(r, c, v, cd, dc) {
            var ipAdress = getValueByJsonPath(dc,
                'bgp_router_parameters;address', '-');
            return ipAdress;
        };

        /*
         * @vendorFormatter
         */
        self.vendorFormatter = function(r, c, v, cd, dc) {
            var vendor = getValueByJsonPath(dc,
                'bgp_router_parameters;vendor', '-');
            return vendor;
        };

        /*
         * @peersFormatter
         */
        self.peersFormatter =  function(r, c, v, cd, dc) {
            var peerString = "";
            var bgpRefs = getValueByJsonPath(dc,"bgp_router_refs", []);
            if(bgpRefs.length > 0){
                peerString =
                    "<table style='width:500px !important;'><tr><th style='width:360px;'>Peer</th>\
                    <th style='width:250px;'>State</th>\
                    <th style='width:300px;'>Passive</th>\
                    <th style='width:500px;'>Hold Time</th>\
                    <th style='width:500px;'>Loop Count</th>\
                    <th style='width:420px;'>Auth Mode</th></tr>";
                bgpRefs.forEach(function(bgp){
                    var attr = getValueByJsonPath(bgp,
                        "attr;session;0;attributes;0", {});
                    var state;
                    var endTagStr = "</td><td style='width:300px;'>";
                    peerString += "<tr><td>";
                    peerString += bgp.to[4] + "</td><td>";
                    state = getValueByJsonPath(attr, "admin_down", "-");
                    if(state != "-") {
                        state = state.toString() === "true" ? "Down" : "Up";
                    }
                    peerString += state + "</td><td>";
                    peerString += getValueByJsonPath(attr, "passive", "-") + "</td><td>";
                    var holdTime = getValueByJsonPath(attr, "hold_time", "-");
                    if(holdTime != "-") {
                        holdTime = holdTime + " (seconds)";
                    }
                    peerString += holdTime + "</td><td>";
                    peerString += getValueByJsonPath(attr, "loop_count", "-") + "</td><td>";
                    peerString += getValueByJsonPath(attr, 'auth_data;key_type', '-')
                    peerString += "</td></tr>";
                    var familyAttrs = getValueByJsonPath(attr, "family_attributes", []);
                    if(familyAttrs.length > 0) {
                        peerString +="<tr><td class='addressFamily' colspan='6'><table width='100%'><thead><tr><th>Address Family</th><th>Loop Count</th><th>Prefix Limit</th></tr></thead><tbody>"
                        for(var i =0 ; i < familyAttrs.length; i++) {
                            var familyAttr = familyAttrs[i];
                                peerString += "<tr><td>" + familyAttr.address_family + "</td><td>" +
                                    familyAttr.loop_count + "</td><td>" + familyAttr.prefix_limit.maximum + "</td></tr>"
                        }
                        peerString += "</tbody></table></td></tr>";
                    }
                });
                peerString += "</table>";
            } else {
                peerString = "-";
            }
            return peerString;
        }

        /*
         * @availablePeers
         */
        self.availablePeers =  function(data, currentBGP) {
            var peers = [];
            for(var i = 0; i < data.length; i++) {
                var row = data[i];
                if(currentBGP && currentBGP === row.name) {
                    continue;
                }
                peers.push(row);
            }
            return peers;
        }

        /*
         * @physicalRouterFormatter
         */
        self.physicalRouterFormatter =  function(r, c, v, cd, dc) {
            var physicalRouters = [];
            var pRouterBackRefs = getValueByJsonPath(dc,
                'physical_router_back_refs', []);
            if(pRouterBackRefs.length > 0) {
                pRouterBackRefs.forEach(function(pRouter){
                    physicalRouters.push(pRouter.to[1]);
                });
            } else {
                physicalRouters = '-';
            }
            return physicalRouters;
        }

        /*
         * @authKeyFormatter
         */
        self.authKeyFormatter = function(r, c, v, cd, dc) {
            var authKey = '-';
            var authData = dc['bgp_router_parameters']['auth_data'];
            if(authData != null) {
                authKey =
                    authData.key_type != null ? authData.key_type : '-';
            }
            return authKey;
        };

        /*
         * @holdTimeFormatter
         */
        self.holdTimeFormatter = function(r, c, v, cd, dc) {
            var holdTime = getValueByJsonPath(dc,
                'bgp_router_parameters;hold_time', '-');
            if(holdTime != '-') {
                holdTime = holdTime.toString() + ' (seconds)';
            }
            return holdTime;
        };

        /*
         * @stateFormatter
         */
         self.stateFormatter = function(r, c, v, cd, dc) {
             var state = getValueByJsonPath(dc,
                 "bgp_router_parameters;admin_down", "-");
             if(state != "-") {
                 state = state.toString() === "true" ? "Down" : "Up";
             }
             return state;
         }
    };
    return bgpFormatters;
});
