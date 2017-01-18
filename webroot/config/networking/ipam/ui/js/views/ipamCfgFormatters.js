/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var ipamCfgFormatters = function() {
        var self = this;

        /*
         * @IPBlockFormatter
         */
        this.IPBlockFormatter = function(d, c, v, cd, dc) {
            var vnObjs =
                contrail.handleIfNull(dc.virtual_network_back_refs, []);

            var length = vnObjs.length, count = 0, subnetCnt = 0, returnStr = '';

            if (!length) {
               return returnStr;
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
                            'attr;' + field + ';' + j, null, false),
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
             return returnStr;
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

             return ntpServer;
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

    }
    return ipamCfgFormatters;
});
