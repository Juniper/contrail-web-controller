/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var fipCfgFormatters = function() {
        var self = this;

        /*
         * private @fixedIPFormatterHelper
         */
        var fixedIPFormatterHelper = function(model) {

            var portRef = getValueByJsonPath(model, 'virtual_machine_interface_refs', []),
                fixedIP = '', portId = '', portLen = portRef.length;

            for (var i = 0; i < portLen; i++) {
                var fixedIPList = getValueByJsonPath(portRef[i],
                        'instance_ip_back_refs', []);

                var fixedIPLen = fixedIPList.length;
                var fq_name = getValueByJsonPath(portRef[i], 'to', []);

                if (fq_name.length == 3) {
                    portId += fq_name[2];
                }

                for (var j = 0; j < fixedIPLen; j++) {
                    var ip = getValueByJsonPath(fixedIPList[j], 'fixedip;ip', '');

                    fixedIP += ip;
                    if (j < Math.abs(fixedIPLen - 1)) {
                        fixedIP += ', ';
                    }
                }
            }

            if (portLen) {
                return fixedIP + ' (' + portId + ')'
            } else {
                return '-';
            }
        };


        /*
         * @fixedIPFormatter
         */
        this.fixedIPFormatter = function(d, c, v, cd, dc) {
            var floatingIPFixedIP = getValueByJsonPath(dc,
                    "floating_ip_fixed_ip_address", null),
                fixedIP, portId;
            if(floatingIPFixedIP) {
                portId = getValueByJsonPath(dc,
                    "virtual_machine_interface_refs;0;to;2", null);
                fixedIP = portId ? floatingIPFixedIP +
                    " (" + portId + ")" : floatingIPFixedIP;
            } else {
                fixedIP = fixedIPFormatterHelper(dc);
            }
            return fixedIP;
        };

        /*
         * @fipPoolFormatter
         */
        this.fipPoolFormatter = function(d, c, v, cd, dc) {

            var fipPool = getValueByJsonPath(dc, 'fq_name', []);

            if (fipPool.length == 5) {
                return fipPool[2] + ':' + fipPool[3];
            }

            return '-';
        };


        /*
         * @fipPoolDropDownFormatter
         */
        this.fipPoolDropDownFormatter = function(response) {
            var fipPoolResponse = getValueByJsonPath(response,
                    'floating_ip_pool_refs', []);
            var fipPoolList = [];

            if (!fipPoolResponse.length) {
                return ([{id: null,
                            text: 'No Floating IP Pools allocated for the Project'}]);
            }
            $.each(fipPoolResponse, function (i, obj) {
                var flatName =      obj['to'][1] + ":" +
                                    obj['to'][2] + ":" + obj['to'][3];
                var flatNameId =    obj['to'][0] + ":" + obj['to'][1] + ":" +
                                    obj['to'][2] + ":" + obj['to'][3];
                var subnets = getValueByJsonPath(obj, 'subnets', '')
                subnets = subnets.length ? subnets : 'No subnets available';
                fipPoolList.push({id: flatNameId.toString(),
                                    text: flatName + ' (' + subnets + ')'});
            });

            return fipPoolList;
        };

        /*
         * @fipPortDropDownFormatter
         */
        this.fipPortDropDownFormatter = function(response) {
            var fipPortList = [];

            if (!response || !response.length) {
                return ([{id: null,
                            text: 'No Ports created in the Project'}]);
            }

            $.each(response, function (i, obj) {
                var ips  = getValueByJsonPath(obj,
                    'virtual-machine-interface;instance_ip_address', []),
                    fqName = getValueByJsonPath(obj,
                    'virtual-machine-interface;fq_name', ''),
                    actId;
                fqName = fqName.join(":");

                var uuid = getValueByJsonPath(obj,
                    'virtual-machine-interface;uuid', '');
                $.each(ips, function(j, ip) {
                    actId = fqName + ctwc.FLOATING_IP_PORT_DELIMITER + ip;
                    fipPortList.push({id: actId,
                        text: ip + ' (' + uuid + ')'});
                });
            });

            return fipPortList;
        };

    }
    return fipCfgFormatters;
});
