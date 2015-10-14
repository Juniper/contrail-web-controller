/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var bgpFormatters = function() {
        var self = this;

        /*
         * @roleFormatter
         */
        self.roleFormatter = function(r, c, v, cd, dc) {
            var role;
            var vendor = getValueByJsonPath(dc,
                'bgp_router_parameters;vendor', '');
            if(vendor.trim().toLowerCase() === '' ||
                vendor.trim().toLowerCase() === 'contrail') {
                    role = 'Control Node';
            } else {
                role = 'BGP Router';
            }
            return role;
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
                    "<table><tr><td style='width:200px;'>Name</td><td>Authentication Type</td></tr>";
                bgpRefs.forEach(function(bgp){
                    peerString += "<tr><td style='width:200px;'>";
                    peerString += bgp.to[4]
                    peerString += "</td><td>";
                    peerString += cowu.getJSONValueByPath(
                        'attr.session[0].attributes[0].auth_data.key_type', bgp)
                    peerString += "</td></tr>";
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
    };
    return bgpFormatters;
});
