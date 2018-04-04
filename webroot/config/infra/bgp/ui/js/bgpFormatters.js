/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var bgpFormatters = function() {
        var self = this;

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
                    "<table width='100%' ><thead><tr><th class='col-xs-1'>Peer Name</th>\
                    <th class='col-xs-1'>Admin State</th>\
                    <th class='col-xs-1'>Passive</th>\
                    <th class='col-xs-1'>Hold Time (seconds)</th>\
                    <th class='col-xs-1'>Loop Count</th>\
                    <th class='col-xs-1'>Local ASN</th>\
                    <th class='col-xs-1'>Auth Mode</th>\
                    <th class='col-xs-2'>Family Attributes</th></tr></thead>";
                bgpRefs.forEach(function(bgp){
                    var attr = getValueByJsonPath(bgp,
                        "attr;session;0;attributes;0", {});
                    var adminState;
                    peerString += "<tr style='vertical-align:top'><td>";
                    peerString += bgp.to[4] + "</td><td>";
                    var adminDown = getValueByJsonPath(attr, "admin_down", "-");
                    if(adminDown != "-") {
                        adminState = adminDown ? "False" : "True";
                    } else {
                        adminState = "-";
                    }
                    peerString += adminState + "</td><td>";
                    var passive = getValueByJsonPath(attr, "passive", "-");
                    if(passive != "-") {
                        passive = passive ? "True" : "False";
                    }
                    peerString += passive + "</td><td>";
                    peerString += getValueByJsonPath(attr, "hold_time", "-") + "</td><td>";
                    peerString += getValueByJsonPath(attr, "loop_count", "-") + "</td><td>";
                    peerString += getValueByJsonPath(attr, "local_autonomous_system", "-") + "</td><td>";
                    peerString += getValueByJsonPath(attr, 'auth_data;key_type', '-')
                    peerString += "</td><td>";
                    var familyAttrs = getValueByJsonPath(attr, "family_attributes", []);
                    if(familyAttrs.length > 0) {
                        for(var i = 0 ; i < familyAttrs.length; i++) {
                            var familyAttr = familyAttrs[i];
                            peerString += "<span class='sec_label'>Address Family :</span> " +  getValueByJsonPath(familyAttr, "address_family", "-");
                            peerString += ",</br><span class='sec_label'>Loop Count :</span> " + getValueByJsonPath(familyAttr, "loop_count", "-");
                            peerString += ",</br><span class='sec_label'>Prefix Limit :</span> " + getValueByJsonPath(familyAttr, "prefix_limit;maximum", "-");
                            if(i === familyAttrs.length - 1) {
                                peerString +="</br></br>";
                            } else {
                                peerString +="<hr/>";
                            }
                        }
                    } else {
                        peerString += "-";
                    }
                });
                peerString += "</td></tr>";
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
                var row = data[i]["bgp-router"];
                var routerType = getValueByJsonPath(row,
                    "bgp_router_parameters;router_type", null);
                if((currentBGP && currentBGP === row.name) ||
                    ($.inArray(routerType, ctwc.BGP_AAS_ROUTERS) !== -1)) {
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
             var adminState;
             var adminDown = getValueByJsonPath(dc,
                 "bgp_router_parameters;admin_down", "-");
             if(adminDown != "-") {
                 adminState = adminDown ? "False" : "True";
             }
             return adminState;
         };
    };
    return bgpFormatters;
});
