/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore',
    'config/networking/networks/ui/js/views/vnCfgFormatters'
], function (_, VNCfgFormatters) {
    var formatVNCfg = new VNCfgFormatters();
    var ipamCfgFormatters = function() {
        var self = this;

        /*
         * @IPBlockFormatter
         */
        this.IPBlockFormatter = function(d, c, v, cd, dc) {
            var vnObjs, length, count = 0, subnetCnt = 0, returnStr = '',
                subnetMethod = getValueByJsonPath(dc,
                    'ipam_subnet_method', ctwc.USER_DEFINED_SUBNET, false);

            if(subnetMethod !== ctwc.USER_DEFINED_SUBNET) {
                var flatSubnets = getValueByJsonPath(dc,
                        'ipam_subnets;subnets', [], false);
                if(cd === -1){
                    return this.subnetFormatter(d, c, v, cd, dc);
                }
                subnetCnt = flatSubnets.length;
                _.each(flatSubnets, function(flatSubnet, idx) {
                    count++;
                    if (count > 2 && cd != -1) {
                        return true;
                    }
                    if(flatSubnet.subnet) {
                        var cidr = flatSubnet.subnet.ip_prefix + '/' +
                                   flatSubnet.subnet.ip_prefix_len;
                        returnStr += cidr + '<br>';
                    }
                });

            } else {
                vnObjs = getValueByJsonPath(dc,
                        'virtual_network_back_refs', [], false);
                length = vnObjs.length;
            }

            for(var i = 0; i < length; i++) {
                var vn = vnObjs[i];
                var fqn = vn.to[2], subnetStr = '', field = 'ipam_subnets';
                var subnetLen = vn['attr'][field].length;

                subnetCnt += subnetLen;

                if (count > 2 && cd != -1) {
                    continue;
                }

                for(var j = 0; j < subnetLen; j++) {
                    count++;
                    if (count > 2 && cd != -1) {
                        break;
                    }
                    var subnet = getValueByJsonPath(vn,
                            'attr;' + field + ';' + j + ';subnet', null, false),
                        cidr;
                    if(subnet && subnet.ip_prefix) {
                        cidr = subnet.ip_prefix + '/' +
                               subnet.ip_prefix_len;
                        returnStr += fqn + ' (' + cidr + ') ' +
                                 '<br>';
                    } else {
                        returnStr += fqn + '<br>';
                    }
                                 //ip_block.default_gateway + '<br>';
                 }
             }

             if (subnetCnt > 2 && cd != -1) {
                 returnStr += '<span class="moredataText">(' + (subnetCnt - 2) +
                              ' more)</span><span class="moredata"' +
                              ' style="display:none;"></span>';
             }
             return returnStr ? returnStr : '-';
        };

        /*
         * private @getdhcpValueByOption
         */
        var getdhcpValuesByOption = function(dhcpObj, optCode) {
            var dhcpValues = '', dhcpObjLen = dhcpObj.length;

            if (dhcpObjLen == 0 ) {
               return dhcpValues;
            }

            try {
                for (var i = 0; i < dhcpObjLen; i++) {
                    if (parseInt(dhcpObj[i].dhcp_option_name) ==
                        parseInt(optCode)) {
                       dhcpValues += dhcpObj[i].dhcp_option_value + ' ';
                    }
                }
            } catch (e) {
                console.trace(e);
                return "Error";
            }

             return dhcpValues;
        };

        /*
         * @getDhcpOptions
         */
        this.getDhcpOptions = function(dhcpObj, optCode) {
            return  getdhcpValuesByOption(dhcpObj, optCode);
        };

        /*
         * @dnsModeFormatter
         */
        this.dnsModeFormatter = function(d, c, v, cd, dc) {
            var mgmtObj =
                contrail.handleIfNull(dc.network_ipam_mgmt, {});
            var dhcpObj =
                getValueByJsonPath(dc,
                'network_ipam_mgmt;dhcp_option_list;dhcp_option', []);

            var dnsServer = '', dhcpOptDNS = '';

            if (mgmtObj == {}) {
               return dnsServer;
            }

            try {
                var dnsAddr = getValueByJsonPath(mgmtObj,
                   'ipam_dns_server;tenant_dns_server_address;ip_address', []);
                var vDnsName = getValueByJsonPath(mgmtObj,
                   'ipam_dns_server;virtual_dns_server_name', '');
                var vDnsMethod = getValueByJsonPath(mgmtObj,
                                'ipam_dns_method', 'default');

                if (dnsAddr.length) {
                    dnsServer += ' Tenant Managed DNS: ' + dnsAddr.join(", ");
                }
                if (vDnsName.length) {
                    dnsServer += ' Virtual DNS: ' + vDnsName;
                }
                if (vDnsMethod == 'none') {
                    if (dnsServer != '') {
                        dnsServer += ', ';
                    }
                    dnsServer += 'DNS Mode : None';
                }
                if (vDnsMethod == 'default') {
                    dnsServer += 'Default';
                }
                if (dhcpObj.length) {
                   dhcpOptDNS =  getdhcpValuesByOption(dhcpObj, 6);
                   if (dhcpOptDNS.length) {
                       dnsServer = 'Tenant Managed DNS: ' + dhcpOptDNS;
                   }
                }
            } catch (e) {
                console.trace(e);
                return 'Error';
            }

            if (dnsServer == '') {
                dnsServer = 'Default';
            }

             return dnsServer;
        };

        /*
         * @dnsNTPFormatter
         */
        this.dnsNTPFormatter = function(d, c, v, cd, dc) {
            var dhcpObj =
                getValueByJsonPath(dc,
                'network_ipam_mgmt;dhcp_option_list;dhcp_option', []);
            var ntpServer = '';

            try {
                ntpServer = getdhcpValuesByOption(dhcpObj, 4);
            } catch (e) {
                console.trace(e);
                return "Error";
            }

             return ntpServer ? ntpServer : "-";
        };

        /*
         * @dnsDomainFormatter
         */
        this.dnsDomainFormatter = function(d, c, v, cd, dc) {
            var dhcpObj =
                getValueByJsonPath(dc,
                'network_ipam_mgmt;dhcp_option_list;dhcp_option', []);
            var domainName = '';

            try {
                domainName = getdhcpValuesByOption(dhcpObj, 15);
            } catch (e) {
                console.trace(e);
                return "Error";
            }

             return domainName;
        };

        /*
         * @dnsDropDownFormatter
         */
        this.dnsDropDownFormatter = function(response) {
            var vDNSResponse = getValueByJsonPath(response,
                    'virtual_DNSs', []);
            var vDnsList = [];

            $.each(vDNSResponse, function (i, obj) {
                var flatName = obj['virtual-DNS'].fq_name[0] + ':' +
                    obj['virtual-DNS'].fq_name[1];
                vDnsList.push({id: flatName, text: flatName});
            });

            return vDnsList;
        };

        /*
         * @ipamSubnetMethodFormatter
         */
        this.ipamSubnetMethodFormatter =  function(d, c, v, cd, dc) {
            var subnetType = getValueByJsonPath(dc,
                    "ipam_subnet_method", ctwc.USER_DEFINED_SUBNET, false),
                returnString = "";
            if(subnetType === ctwc.USER_DEFINED_SUBNET){
                returnString = "User Defined";
            } else {
                returnString = "Flat";
            }

            return returnString ? returnString : '-';
        };

        /*
         * @subnetFormatter
         */
        this.subnetFormatter = function(d, c, v, cd, dc) {
            var subnetType = getValueByJsonPath(dc,
                    "ipam_subnet_method", ctwc.USER_DEFINED_SUBNET, false),
                returnString, subnetString = "", subnets;
            if(subnetType === ctwc.USER_DEFINED_SUBNET){
                returnString = "-";
            } else {
                returnString = '';
                subnets =  getValueByJsonPath(dc,
                        'ipam_subnets;subnets', [], false);
                _.each(subnets, function(subnetObj){
                    var cidr = getValueByJsonPath(subnetObj,
                            "subnet;ip_prefix", null, false);
                    var cidrlen = getValueByJsonPath(subnetObj,
                            "subnet;ip_prefix_len", null, false);
                    cidr = cidr ? cidr + '/' + cidrlen : "-";
                    var gw   = subnetObj.default_gateway ?
                            subnetObj.default_gateway: "-";
                    var dhcp = subnetObj.enable_dhcp ? 'Enabled' : 'Disabled';
                    var gwStatus =  (gw == null || gw == "" || gw == "0.0.0.0") ?
                                        'Disabled' : gw;

                    var allocPools = getValueByJsonPath(subnetObj,
                            "allocation_pools", []);
                    var allocPoolStr = "-";
                    _.each(allocPools, function(pool, index) {
                        pool = pool.start + ' - ' + pool.end;
                        if(index === 0) {
                            allocPoolStr = pool;
                        } else {
                            allocPoolStr += "<br/>" + pool;
                        }
                    });
                    subnetString += "<tr style='vertical-align:top'><td>";
                    subnetString += cidr + "</td><td>";
                    subnetString += gw + "</td><td>";
                    subnetString += dhcp + "</td><td>";
                    subnetString += allocPoolStr+ "</td>";
                    subnetString += "</tr>";
                });
            }
            if(subnetString != ""){
                var subnetHeader =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:25%'>CIDR</th>\
                    <th style='width:25%'>Gateway</th>\
                    <th style='width:15%'>DHCP</th>\
                    <th style='width:30%'>Allocation Pools</th>\
                    </tr></thead><tbody>";
                returnString += subnetHeader + subnetString;
                returnString += "</tbody></table>";
            } else {
                returnString += "";
            }
            return returnString;
        };

        /*
         * @subnetHostRouteFormatter
         */
        this.subnetHostRouteFormatter = function(d, c, v, cd, dc) {
            var subnetList = getValueByJsonPath(dc,
                    "ipam_subnets;subnets", []),
                len = subnetList.length, returnArr = [], returnStr = '';

            if (!len) {
               return cd == -1 ? []: '-';
            }

            _.each(subnetList, function(subnetObj) {
                var hostRoutes = getValueByJsonPath(subnetObj,
                        'host_routes;route', []);
                if (hostRoutes.length) {
                    returnArr.push(hostRoutes);
                 }
            });

            returnArr = _.flatten(returnArr);
            returnArr = _.uniq(returnArr, function(hostRoute){
                    return JSON.stringify(hostRoute)
            });

            if (cd == -1) {
                return returnArr;
            }

            $.each(returnArr, function (i, obj) {
                returnStr += obj.prefix + ' ' + obj.next_hop + '<br/>';
            });

            return returnStr;
        };

        /*
         * @subnetDNSFormatter
         */
        this.subnetDNSFormatter = function(d, c, v, cd, dc) {
            var subnetList = getValueByJsonPath(dc,
                    "ipam_subnets;subnets", []);

            var len = subnetList.length, count = 0, returnArr = [];

            if (!len) {
                if (cd != -1 ) {
                   return '-';
                } else {
                    return [];
                }
            }

            _.each(subnetList, function(subnetObj){
                var dhcpOpts = getValueByJsonPath(subnetObj,
                        'dhcp_option_list;dhcp_option', []);
                if (dhcpOpts.length) {
                    returnArr.push(formatVNCfg.
                            getdhcpValuesByOption(dhcpOpts, 6).split(' '));
                }
            });

            returnArr = _.flatten(returnArr);
                        returnArr = _.uniq(returnArr, function(dnsObj){
                                                return JSON.stringify(dnsObj)
                                        });
            if (returnArr.length) {
                returnArr = _.without(returnArr, '0.0.0.0');
                returnArr = _.without(returnArr, '');
            }

            return returnArr.length ?
                (cd == -1 ? [returnArr.join(' ')] : returnArr.join('<br/>')):
                (cd == -1 ? [] : '-');
        };
    }
    return ipamCfgFormatters;
});
