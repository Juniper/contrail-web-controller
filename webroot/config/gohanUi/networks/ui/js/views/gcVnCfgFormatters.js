/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'underscore'
], function (_) {
    var vnCfgFormatters = function() {
        var self = this;

        /*
         * @IPBlockFormatter
         */
        this.IPBlockFormatter = function(d, c, v, cd, dc) {
            var ipamObjs =
                contrail.handleIfNull(dc['network_ipam_refs'], []);

            var len = ipamObjs.length, count = 0, subnetCnt = 0, returnStr = '';

            if (!len) {
               return "-";
            }

            for(var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var subnetStr = '', field = 'ipam_subnets';
                var subnetLen = ipam['attr'][field].length;

                subnetCnt += subnetLen;

                if (count > 2 && cd != -1) {
                    continue;
                }

                for(var j = 0; j < subnetLen; j++) {
                    count++;
                    if (count > 2 && cd != -1) {
                        break;
                    }
                    var subnet = getValueByJsonPath(ipam,
                            'attr;'+ field + ";" + j + ';subnet', null, false),
                         cidr;
                    if(subnet) {
                        cidr = subnet.ip_prefix + '/' + subnet.ip_prefix_len;
                    } else {
                        cidr = "-";
                    }
                    returnStr += cidr +
                                 '<br>';
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
         * private @getSubnetDNSStatus
         */
        var getSubnetDNSStatus = function(subnetObj) {
            var dhcpOpts = getValueByJsonPath(subnetObj,
                                'dhcp_option_list;dhcp_option', []);
            if (dhcpOpts.length) {
                return getdhcpValuesByOption(dhcpOpts, 6).indexOf("0.0.0.0")
                        == -1 ? true : false;
            }
             return true;
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

             return dhcpValues.trim();
        };

        /*
         * @adminStateFormatter
         */
        this.adminStateFormatter = function(d, c, v, cd, dc) {
            var  adminState =
                getValueByJsonPath(dc, 'id_perms;enable', false);

            return adminState ? 'Up' : 'Down';
        };

        /*
         * @staticIPAddressingFormatter
         */
        this.staticIPAddressingFormatter = function(d, c, v, cd, dc) {
            return getValueByJsonPath(dc, 'external_ipam', false) ? "Enabled" : "Disabled";
        };

        /*
         * @sharedFormatter
         */
        this.sharedFormatter = function(d, c, v, cd, dc) {
            var  sharedState =
                getValueByJsonPath(dc, 'is_shared', false);

            return sharedState ? 'Enabled' : 'Disabled';
        };

        /*
         * @rtrExternalFormatter
         */
        this.rtrExternalFormatter = function(d, c, v, cd, dc) {
            var  rtrExternal =
                getValueByJsonPath(dc, 'router_external', false);

            return rtrExternal ? 'Enabled' : 'Disabled';
        };

        /*
         * @polColFormatter
         */
        this.polColFormatter = function(d, c, v, cd, dc) {
            var domain  = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var project = contrail.getCookie(cowc.COOKIE_PROJECT);
            var polStr = '';
            var pols   =
                getValueByJsonPath(dc, 'network_policy_refs', []);

            if (!pols.length) {
                return '-';
            }

            var sortedPols =
             _.sortBy(pols, function (pol) {
                 var sequence =
                    Number(getValueByJsonPath(pol, 'attr;sequence;major', 0));
                 return ((1 + sequence) * 100000 ) - sequence;
            });

            var pLen = 2;
            if (cd == -1) {
                pLen = pols.length
            }
            $.each(_.first(sortedPols, pLen),
                function (i, obj) {
                    polStr += obj.to[2];
                    if (obj.to[0] != domain ||
                        obj.to[1] != project) {
                        if (obj.to[0] == domain) {
                            polStr += ' (' + obj.to[1] + ')';
                        } else {
                            polStr += ' (' + obj.to[0] +
                                        ':' + obj.to[1] +')';
                        }
                    }
                    polStr += '<br/>';
                }
            );
            if (pols.length > pLen && cd != -1) {
                polStr += (pols.length - pLen) + ' more';
            }

            return polStr;
        };

        /*
         * @polRefFormatter
         */
        this.polRefFormatter = function(d, c, v, cd, dc) {
            var polArr = [];
            var pols   =
                getValueByJsonPath(dc, 'network_policy_refs', []);

            if (!pols.length) {
                return '-';
            }

            var sortedPols =
             _.sortBy(pols, function (pol) {
                 var sequence =
                    Number(getValueByJsonPath(pol, 'attr;sequence;major', 0));
                 return ((1 + sequence) * 100000 ) - sequence;
            });

            pLen = pols.length;

            $.each(sortedPols,
                function (i, obj) {
                    polArr.push(obj.to.join(':'));
                }
            );

            return polArr;
        };

        /*
         * @fipPoolTmplFormatter
         */
        this.fipPoolTmplFormatter = function(d, c, v, cd, dc) {
            var poolStr = [], poolArr = [];
            var pools   =
                getValueByJsonPath(dc, 'floating_ip_pools', []);

            if (!pools.length) {
                return cd == -1 ? poolArr : '-';
            }

            $.each(pools, function (i, obj) {
                var poolName = getValueByJsonPath(obj, 'to;3', '');
                var disable = poolName == 'default' ? true : false;
                var poolProjects = getValueByJsonPath(obj, 'projects', []);
                var projects = [], projectsStr = [];
                $.each(poolProjects, function (projIdx, proj) {
                    projects.push(proj.uuid);
                    projectsStr.push(proj.to.join(':'));
                });

                poolArr.push({'name': poolName,
                    'projects': projects.join(cowc.DROPDOWN_VALUE_SEPARATOR),
                    'disable': disable});

                poolStr.push(poolName + (projectsStr.length ?
                    ' (' + projectsStr.join(', ') + ')' : ''));
            });

            return cd == -1 ? poolArr : poolStr.join('<br>');
        };

        /*
         * @subnetTmplFormatter
         */
        this.subnetTmplFormatter =  function(d, c, v, cd, dc) {
            var subnetString = "";
            var ipamObjs = getValueByJsonPath(dc,"network_ipam_refs", []);
             var len = ipamObjs.length, count = 0,
                        subnetCnt = 0, returnStr = '';

            if (!len) {
                if (cd == -1) {
                    return [];
                } else {
                    return '-';
                }
            }

            for(var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var field = 'ipam_subnets';
                var subnet = ipam['attr'][field];
                var subnetLen = ipam['attr'][field].length;
                for(var j = 0; j < subnetLen; j++) {
                    var ip_block = ipam['attr'][field][j];
                    var ipam_block= ipam['to'];
                    var ipamto = ipam_block[2] + ' ( ' + ipam_block[0] + ':' +ipam_block[1] + ')';
                    var cidr = getValueByJsonPath(ip_block,"subnet;ip_prefix", null, false);
                    var cidrlen=getValueByJsonPath(ip_block,"subnet;ip_prefix_len", false);
                    cidr = cidr ? cidr + '/' + cidrlen : "-";
                    var gw   = ip_block.default_gateway ? ip_block.default_gateway: "-";
                    var dhcp = ip_block.enable_dhcp ? 'Enabled' : 'Disabled';
                    var dns  = getSubnetDNSStatus(ip_block) ? 'Enabled' : 'Disabled';
                    var gwStatus =  (gw == null || gw == "" || gw == "0.0.0.0") ?
                                        'Disabled' : gw;

                    var allocPools = [];
                    if ('allocation_pools' in ip_block &&
                                ip_block.allocation_pools.length) {
                        allocPools = getValueByJsonPath(ip_block,"allocation_pools", []);
                    }
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
                    subnetString += dns + "</td><td>";
                    subnetString += dhcp + "</td><td>";
                    subnetString += allocPoolStr+ "</td>";
                    subnetString += "</tr>";
                }
            }
            var returnString = "";
            if(subnetString != ""){
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:25%'>CIDR</th>\
                    <th style='width:25%'>Gateway</th>\
                    <th style='width:10%'>DNS</th>\
                    <th style='width:10%'>DHCP</th>\
                    <th style='width:30%'>Allocation Pools</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
            } else {
                returnString += "";
            }
            return returnString;
        }

        /*
         * @subnetModelFormatter
         */
        this.subnetModelFormatter = function(d, c, v, cd, dc) {
            var ipamObjs =
                contrail.handleIfNull(dc['network_ipam_refs'], []);

            var len = ipamObjs.length, count = 0,
                        subnetCnt = 0, returnStr = '';

            var returnArr = [];

            if (!len) {
                return returnArr;
            }

            for(var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var ipamFQN = ipamObjs[i].to.join(cowc.DROPDOWN_VALUE_SEPARATOR);
                var field = 'ipam_subnets';
                var subnetLen = ipam['attr'][field].length;

                for(var j = 0; j < subnetLen; j++) {
                    var subnetObj = {};
                    var ip_block = getValueByJsonPath(ipam,
                            'attr;' + field + ';' + j, null, false);
                    subnetObj['user_created_ipam_fqn'] = ipamFQN;
                    if(!ip_block || !ip_block.subnet){
                        subnetObj['disable'] = true;
                        returnArr.push(subnetObj);
                        continue;
                    }
                    subnetObj = ip_block;
                    var cidr = ip_block.subnet.ip_prefix + '/' +
                               ip_block.subnet.ip_prefix_len;
                    subnetObj['user_created_cidr'] = cidr;
                    var allocPools = [];
                    if ('allocation_pools' in ip_block &&
                                ip_block.allocation_pools.length) {
                        allocPools = ip_block.allocation_pools;
                    }
                    var allocPoolStr = '';
                    allocPools.every(function(pool) {
                        allocPoolStr += pool.start + "-" + pool.end + "\n";
                        return true;
                    });
                    subnetObj['allocation_pools'] = allocPoolStr.trim();
                    subnetObj['user_created_enable_gateway'] =
                        getValueByJsonPath(ip_block, 'default_gateway', "");
                    subnetObj['user_created_enable_gateway'] =
                        subnetObj['user_created_enable_gateway'].length &&
                        subnetObj['user_created_enable_gateway'].indexOf("0.0.0.0")
                                    == -1 ? true : false;
                    subnetObj['user_created_enable_dns']  = getSubnetDNSStatus(ip_block);
                    subnetObj['disable'] = true;
                    returnArr.push(subnetObj);
                 }
             }

             return returnArr;
        };


        /*
         * @subnetHostRouteFormatter
         */
        this.subnetHostRouteFormatter = function(d, c, v, cd, dc) {
            var ipamObjs =
                contrail.handleIfNull(dc['network_ipam_refs'], []);

            var len = ipamObjs.length, count = 0,
                        subnetCnt = 0, returnArr = [], returnStr = '';

            if (!len) {
               return cd == -1 ? []: '-';
            }

            for (var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var field = 'ipam_subnets';
                var subnetLen = ipam['attr'][field].length;

                for (var j = 0; j < subnetLen; j++) {
                    var ipBlock = ipam['attr'][field][j];
                    var hRoutes = getValueByJsonPath(ipBlock,
                                'host_routes;route', []);
                    if (hRoutes.length) {
                       returnArr.push(hRoutes);
                    }
                }
            }

            returnArr = _.flatten(returnArr);
            returnArr = _.uniq(returnArr, function(returnArr){
                    return JSON.stringify(returnArr)
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
            var ipamObjs =
                contrail.handleIfNull(dc['network_ipam_refs'], []);

            var len = ipamObjs.length, count = 0, returnArr = [];

            if (!len) {
                if (cd != -1 ) {
                   return '-';
                } else {
                    return [];
                }
            }

            for (var i = 0; i < len; i++) {
                var ipam = ipamObjs[i];
                var field = 'ipam_subnets';
                var subnetLen = ipam['attr'][field].length;

                for (var j = 0; j < subnetLen; j++) {
                    var ipBlock = ipam['attr'][field][j];
                    var dhcpOpts = getValueByJsonPath(ipBlock,
                                'dhcp_option_list;dhcp_option', []);
                    if (dhcpOpts.length) {
                        returnArr.push(getdhcpValuesByOption(dhcpOpts, 6).split(' '));
                    }
                }
            }

            returnArr = _.flatten(returnArr);
                        returnArr = _.uniq(returnArr, function(returnArr){
                                                return JSON.stringify(returnArr)
                                        });
            if (returnArr.length) {
                returnArr = _.without(returnArr, '0.0.0.0');
                returnArr = _.without(returnArr, '');
            }

            return returnArr.length ?
                (cd == -1 ? [returnArr.join(' ')] : returnArr.join('<br/>')):
                (cd == -1 ? [] : '-');
        };

        /*
         * @routeTargetFormatter
         */
        this.routeTargetFormatter = function(d, c, v, cd, dc) {
            var rtObj =
                contrail.handleIfNull(
                        dc[v]['route_target'], []);
            var rtArr = [];
            var returnStr = '';

            $.each(rtObj, function (i, obj) {
                returnStr += obj.replace('target:','') + '<br/>';
                var rtSplit = obj.split(':');
                if (rtSplit.length == 3) {
                    rtArr.push({'asn': rtSplit[1],
                                'target': rtSplit[2]});
                }
            });

            return cd == -1 ? rtArr: returnStr;
        };

        /*
         * @fwdModeFormatter
         */
        this.fwdModeFormatter = function(d, c, v, cd, dc) {
            var fwdMode = getValueByJsonPath(dc,
                'virtual_network_properties;forwarding_mode', 'l2_l3');

            if (fwdMode == 'l2_l3') {
                return 'L2 and L3';
            } else if (fwdMode == 'l2') {
                return 'L2 only';
            } else if (fwdMode == 'l3') {
                return 'L3 only';
            }
        };

        /*
         * @vxLanIdFormatter
         */
        this.vxLanIdFormatter = function(d, c, v, cd, dc) {
            var vnId = getValueByJsonPath(dc,
                'virtual_network_network_id', 0);
            var vxLanId = getValueByJsonPath(dc,
                'virtual_network_properties;vxlan_network_identifier', 0);
            var vxLanMode = getValueByJsonPath(window.globalObj,
                'global-vrouter-config;global-vrouter-config;vxlan_network_identifier_mode',
                'automatic');

            //Add global mode check to this
            if (vxLanMode == 'configured') {
                if (vxLanId != 0) {
                    return 'Configured (' + vxLanId + ')';
                } else {
                    return 'Not Configured (' + vnId + ')';
                }
            } else {
                return 'Automatic (' + vnId + ')';
            }
        };

        /*
         * @allowTransitFormatter
         */
        this.allowTransitFormatter = function(d, c, v, cd, dc) {
            var allowTransit = getValueByJsonPath(dc,
                'virtual_network_properties;allow_transit', false);

            return allowTransit ? 'Enabled' : 'Disabled';
        };

        /*
         * @mirrorDestinationFormatter
         */
        this.mirrorDestinationFormatter = function(d, c, v, cd, dc) {
            var mirrorDest = getValueByJsonPath(dc,
                'virtual_network_properties;mirror_destination', false);

            return mirrorDest ? 'Enabled' : 'Disabled';
        };

        /*
         * @rpfFormatter
         */
        this.rpfFormatter = function(d, c, v, cd, dc) {
            var rpf = getValueByJsonPath(dc,
                'virtual_network_properties;rpf', 'enable');

            return rpf  == 'enable' ? 'Enabled' : 'Disabled';
        };

        /*
         * @floodUnUcastFormatter
         */
        this.floodUnUcastFormatter = function(d, c, v, cd, dc) {
            var uCastEnabled = getValueByJsonPath(dc,
                'flood_unknown_unicast', false);

            return uCastEnabled ? 'Enabled' : 'Disabled';
        };

        /*
         * @multiSvcChainFormatter
         */
        this.multiSvcChainFormatter = function(d, c, v, cd, dc) {
            var multiSvcChainEnabled = getValueByJsonPath(dc,
                'multi_policy_service_chains_enabled', false);

            return multiSvcChainEnabled ? 'Enabled' : 'Disabled';
        };

        /*
         * @sriovFormatter
         */
        this.sriovFormatter = function(d, c, v, cd, dc) {
            var segment_id   = getValueByJsonPath(dc,
                                'provider_properties;segmentation_id', null);
            var physical_net = getValueByJsonPath(dc,
                                'provider_properties;physical_network', null);

            if (segment_id != null && physical_net != null) {
                return 'Physical Network: ' + physical_net +
                        ' , VLAN: ' + segment_id;
            } else {
                return 'Disabled';
            }
        };

        /*
         * @ecmpHashFormatter
         */
        this.ecmpHashFormatter = function(d, c, v, cd, dc) {
            var hashArr       = [];
            var hashingFields = getValueByJsonPath(dc,
                                'ecmp_hashing_include_fields', {});

            var hashingConfigured = getValueByJsonPath(hashingFields,
                    'hashing_configured', false);

            if (hashingConfigured == false) {
                return hashArr;
            }

            for (var key in hashingFields) {
                if (true == hashingFields[key] &&
                        key != 'hashing_configured') {
                    hashArr.push(key.replace(/_/,'-'));
                }
            }
            return hashArr.join(', ');
        };

        /*
         * @phyRouterFormatter
         */
        this.phyRouterFormatter = function(d, c, v, cd, dc) {
            var phyRouters = getValueByJsonPath(dc,
                    'physical_router_back_refs', []);
            var phyRouterList = [], phyRouterArr = [];

            $.each(phyRouters, function (i, obj) {
                var flatName = '';
                cd == -1 ? flatName = obj.uuid : flatName = obj['to'][1];
                //var flatName = obj['to'][1];
                phyRouterList.push(flatName);
                phyRouterArr.push(flatName);
            });

            return cd == -1 ? phyRouterArr :
                    phyRouterList.length ?
                        phyRouterList.join('<br/>'): '-';
        };

        /*
         * @staticRouteFormatter
         */
        this.staticRouteFormatter = function(d, c, v, cd, dc) {
            var staticRoutes = getValueByJsonPath(dc,
                    'route_table_refs', []);
            var staticRouteList = [], staticRouteArr = [];

            $.each(staticRoutes, function (i, obj) {
                var flatName = '';
                cd == -1 ? flatName = obj.to.join(':') :
                        flatName = obj['to'][2] + ' (' + obj['to'][1] + ')';
                staticRouteList.push(flatName);
                staticRouteArr.push(flatName);
            });

            return cd == -1 ? staticRouteArr :
                    staticRouteList.length ?
                        staticRouteList.join('<br/>'): '-';
        };
        /*
         * @polMSFormatter
         */
        this.polMSFormatter = function(response) {
            var polResponse = getValueByJsonPath(response,
                    'network-policys', []);
            var polList = [];

            $.each(polResponse, function (i, obj) {
                var flatName = obj.fq_name[0] + ':' +
                    obj.fq_name[1] + ':' + obj.fq_name[2];
                polList.push({id: flatName, text: flatName});
            });

            return polList;
        };

        /*
         * @allProjMSFormatter
         */
        this.allProjMSFormatter = function(response) {
            var projResponse = getValueByJsonPath(response,
                    'projects', []);
            var projList = [];

            $.each(projResponse, function (i, obj) {
                var flatName = obj.fq_name[0] + ':' +
                                obj.fq_name[1];
                projList.push({
                    id: obj.uuid,
                    text: flatName
                });
            });

            return projList;
        };

        /*
         * @phyRouterMSFormatter
         */
        this.phyRouterMSFormatter = function(response) {
            var phyRouterResponse = getValueByJsonPath(response,
                    'physical-routers', []);
            var phyRouterList = [];

            $.each(phyRouterResponse, function (i, obj) {
                var flatName = obj.fq_name;
                phyRouterList.push({id: obj.uuid, text: flatName[1]});
            });

            return phyRouterList;
        };

        /*
         * @staticRouteMSFormatter
         */
        this.staticRouteMSFormatter = function(response) {
            var staticRouteResponse = getValueByJsonPath(response,
                    '0;route-tables', []);
            var staticRouteList = [];

            $.each(staticRouteResponse, function (i, obj) {
                var flatName = obj.fq_name;
                staticRouteList.push({id: obj.fq_name.join(':'),
                                text: flatName[2]+ ' (' + flatName[1] + ')'});
            });

            return staticRouteList;
        };

        /*
         * @ipamDropDownFormatter
         */
        this.ipamDropDownFormatter = function(response) {
            var ipamResponse = getValueByJsonPath(response,
                    'network-ipams', []);
            var ipamList = [];
            var domain  = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var project = contrail.getCookie(cowc.COOKIE_PROJECT);
            var vCenter = isVCenter();

            $.each(ipamResponse, function (i, obj) {
                var flatName = obj.fq_name[2];

                if (domain != obj.fq_name[0] ||
                    project != obj.fq_name[1]) {
                        flatName += ' (' + obj.fq_name[0] +
                                    ':' + obj.fq_name[1] + ')';
                }
                if (vCenter) {
                    if (domain == obj.fq_name[0] &&
                        project == obj.fq_name[1]) {
                        ipamList.push({
                            id: obj.fq_name.join(cowc.DROPDOWN_VALUE_SEPARATOR),
                            text: flatName
                        });
                    }
                } else {
                    ipamList.push({
                        id: obj.fq_name.join(cowc.DROPDOWN_VALUE_SEPARATOR),
                        text: flatName
                    });
                }
            });

            return ipamList;
        };

        /*
         * @qosDropDownFormatter
         */
        this.qosDropDownFormatter = function(response) {
            var ddQoSDataSrc = [{text: "None", id: "none"}], qos,
            qosConfigs = getValueByJsonPath(response,
                "0;qos-configs",
                [], false);
            _.each(qosConfigs, function(qosConfig) {
                if("qos-config" in qosConfig) {
                    qos = qosConfig["qos-config"];
                    ddQoSDataSrc.push({
                        text: qos.name,
                        id: qos.fq_name && qos.fq_name.length === 3 ?
                                (qos.fq_name[0] +
                                cowc.DROPDOWN_VALUE_SEPARATOR + qos.fq_name[1]
                                + cowc.DROPDOWN_VALUE_SEPARATOR +
                                qos.fq_name[2]) : qos.uuid
                    });
                }
            });
            return ddQoSDataSrc;
        };

        /*
         * @qosExpansionFormatter
         */
        this.qosExpansionFormatter = function(d, c, v, cd, dc) {
            return getValueByJsonPath(dc, "qos_config_refs;0;to;2", "-");
        };

        /*
         * @pbbEvpnFormatter
         */
        this.pbbEvpnFormatter = function(d, c, v, cd, dc) {
            return dc.pbb_evpn_enable ? "Enabled" : "Disabled";
        };

        /*
         * @pbbETreeFormatter
         */
        this.pbbETreeFormatter = function(d, c, v, cd, dc) {
            return dc.pbb_etree_enable ? "Enabled" : "Disabled";
        };

        /*
         * @layer2CWFormatter
         */
        this.layer2CWFormatter = function(d, c, v, cd, dc) {
            return dc.layer2_control_word ? "Enabled" : "Disabled";
        };

        /*
         * @macLearningFormatter
         */
        this.macLearningFormatter = function(d, c, v, cd, dc) {
            return dc.mac_learning_enabled ? "Enabled" : "Disabled";
        };

        /*
         * @macMoveTimeWindowFormatter
         */
        this.macMoveTimeWindowFormatter = function(d, c, v, cd, dc) {
            var timeWindow = getValueByJsonPath(dc,
                    "mac_move_control;mac_move_time_window", null, false);
            if(timeWindow != null) {
                timeWindow = timeWindow + " (secs)";
            } else {
                timeWindow = "-";
            }
            return timeWindow;
        };

        /*
         * @macAgingTimeFormatter
         */
        this.macAgingTimeFormatter = function(d, c, v, cd, dc) {
            var agingTime = getValueByJsonPath(dc,
                    "mac_aging_time", null, false);
            if(agingTime != null) {
                agingTime = agingTime + " (secs)";
            } else {
                agingTime = "-";
            }
            return agingTime;
        };

        /*
         * @bridgeDomainFormatter
         */
        this.bridgeDomainFormatter = function(d, c, v, cd, dc) {
            var bdString = "", bdDataList =  getValueByJsonPath(dc,
                    'bridge_domains', [], false), returnString= "";
            _.each(bdDataList, function(bdData){
                bdString += "<tr style='vertical-align:top'><td>";
                bdString += (bdData.name ? bdData.name :
                    getValueByJsonPath(bdData, "fq_name;3", "", false))  + "</td><td>";
                bdString += bdData.isid + "</td><td>";
                bdString += (bdData.mac_learning_enabled ? "Enabled" : "Disabled") + "</td><td>";
                bdString += getValueByJsonPath(bdData,
                        "mac_limit_control;mac_limit", "-", false)  + "</td><td>";
                bdString += getValueByJsonPath(bdData,
                        "mac_limit_control;mac_limit_action", "-", false)  + "</td><td>";
                bdString += getValueByJsonPath(bdData,
                        "mac_move_control;mac_move_limit", "-", false)  + "</td><td>";
                bdString += getValueByJsonPath(bdData,
                        "mac_move_control;mac_move_limit_action", "-", false)  + "</td><td>";
                bdString += getValueByJsonPath(bdData,
                        "mac_move_control;mac_move_time_window", "-", false)  + "</td><td>";
                bdString += getValueByJsonPath(bdData, 'mac_aging_time', "-", false) + "</td>";
                bdString += "</tr>";
            });

            if(bdString != ""){
                returnString =
                    "<table style='width:100%'><thead><tr>" +
                    "<th style='width:10%'>Name</th>" +
                    "<th style='width:5%'>I-SID</th>" +
                    "<th style='width:10%'>MAC Learning</th>" +
                    "<th style='width:10%'>MAC Limit</th>" +
                    "<th style='width:10%'>Action</th>" +
                    "<th style='width:15%'>MAC Move Limit</th> " +
                    "<th style='width:10%'>Action</th>" +
                    "<th style='width:15%'>Time Window (secs)</th>" +
                    "<th style='width:15%'>Aging Time (secs)</th>" +
                    "</tr></thead><tbody>";
                returnString += bdString;
                returnString += "</tbody></table>";
            } else {
                returnString += "-";
            }
            return returnString;
        };
    }
    return vnCfgFormatters;
});
