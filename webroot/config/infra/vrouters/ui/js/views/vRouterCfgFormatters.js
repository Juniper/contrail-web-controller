/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'lodash'
], function (_) {
    var vRouterCfgFormatters = function() {
        var self = this;

        /*
         * @pRouterFormatter
         */
        this.pRouterFormatter = function(d, c, v, cd, dc) {
            var  pRouterList =
                getValueByJsonPath(dc, 'physical_router_back_refs', []);

            var pRouterNameList = [];

            $.each(pRouterList, function (i, obj) {
                pRouterNameList.push(obj['to'][1]);
            });
             return pRouterNameList.length ? pRouterNameList.join(", ") : '';
        };
        /*
         * @subnetTmplFormatter
         */
        this.subnetTmplFormatter =  function(d, c, v, cd, dc) {
            var subnetString = "", flatSubnetIPAMs;
            var returnArr = [];
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

            for(var k = 0; k < len; k++) {
                var ipam = ipamObjs[k];
                var ipamFQN = ipamObjs[k].to.join(cowc.DROPDOWN_VALUE_SEPARATOR)+":"+ipamObjs[k].uuid;
                var field = 'ipam_subnets';
                var allocPoolStr = '';
                var subnetArr;
                var allocationPol = ipam['attr']['allocation_pools'];
                var allocationPolLen = allocationPol.length;
             if(ipam['attr']['subnet']){
                subnetArr = ipam['attr']['subnet'];
                if(validateFlatSubnetIPAM(ipam)){
                    continue;
                }
                $.each(subnetArr, function(i, val) {
                    var subnetObj = {};
                    for(var j=0; j<allocationPol.length;j++){
                        if(val.ip_prefix === allocationPol[j].start){
                            subnetObj['allocation_pools'] =
                                allocationPol[j].start + "-" + allocationPol[j].end;
                            allocationPol.splice(j,1);
                        }
                    }
                    subnetObj['user_created_ipam_fqn'] = ipamFQN;
                    var cidr = val.ip_prefix + '/' +val.ip_prefix_len;
                    subnetObj['vr_user_created_cidr'] = cidr;
                    subnetObj['disable'] = true;
                    returnArr.push(subnetObj);
                  });
                }
             if(ipam['attr']['allocation_pools']){
                 $.each(allocationPol, function(i, val) {
                     var subnetObj = {};
                     var ip_block_ap = val;
                     var allocPoolStr = '';
                     var allocPools = [];
                     allocPoolStr += ip_block_ap.start + "-" + ip_block_ap.end + "\n";
                     subnetObj['allocation_pools'] = allocPoolStr.trim();
                     subnetObj['vr_user_created_cidr'] = '';
                     subnetObj['user_created_ipam_fqn'] = ipamFQN;
                     subnetObj['disable'] = true;
                     returnArr.push(subnetObj);
                   });
                 }
             }
            $.each(returnArr, function(i, val) {
                if(val.vr_user_created_cidr === ''){
                    val.vr_user_created_cidr = "-";
                }
                subnetString += "<tr style='vertical-align:top'><td>";
                subnetString += val.vr_user_created_cidr + "</td><td>";
                subnetString += val.allocation_pools+ "</td>";
                subnetString += "</tr>";
            });
            var returnString = "";
            if(subnetString != ""){
                returnString =
                    "<table style='width:100%'><thead><tr>\
                    <th style='width:25%'>CIDR</th>\
                    <th style='width:30%'>Allocation Pools</th>\
                    </tr></thead><tbody>";
                returnString += subnetString;
                returnString += "</tbody></table>";
            } else {
                returnString += "";
            }
            return returnString ? returnString : "-";
        }
        var validateFlatSubnetIPAM = function (ipam) {
            var isFlatSubnetIPAM = getValueByJsonPath(ipam,
                    'attr;subnet', null, false) ? false : true;
            if(isFlatSubnetIPAM){
                return true;
            } else {
                return false;
            }
        };
        this.vRoutersubnetModelFormatter = function(d, c, v, cd, dc) {
            var ipamObjs =
                contrail.handleIfNull(dc['network_ipam_refs'], []);
            var len = ipamObjs.length, count = 0,
                        subnetCnt = 0, returnStr = '';
            var returnArr = [];
            if (!len) {
                return returnArr;
            }
            for(var k = 0; k < len; k++) {
                var ipam = ipamObjs[k];
                var ipamFQN = ipamObjs[k].to.join(cowc.DROPDOWN_VALUE_SEPARATOR)+":"+ipamObjs[k].uuid;
                var field = 'ipam_subnets';
                var allocPoolStr = '';
                var subnetArr;
                var allocationPol = ipam['attr']['allocation_pools'];
                var allocationPolLen = allocationPol.length;
             if(ipam['attr']['subnet']){
                subnetArr = ipam['attr']['subnet'];
                if(validateFlatSubnetIPAM(ipam)){
                    continue;
                }
                $.each(subnetArr, function(i, val) {
                    var subnetObj = {};
                    for(var j=0; j<allocationPol.length;j++){
                        if(val.ip_prefix === allocationPol[j].start){
                            subnetObj['allocation_pools'] =
                                allocationPol[j].start + "-" + allocationPol[j].end;
                            allocationPol.splice(j,1);
                        }
                    }
                    subnetObj['user_created_ipam_fqn'] = ipamFQN;
                    var cidr = val.ip_prefix + '/' +val.ip_prefix_len;
                    subnetObj['vr_user_created_cidr'] = cidr;
                    subnetObj['alloc_pool_flag'] = true;
                    subnetObj['disable'] = true;
                    returnArr.push(subnetObj);
                  });
                }
             if(ipam['attr']['allocation_pools']){
                 $.each(allocationPol, function(i, val) {
                     var subnetObj = {};
                     var ip_block_ap = val;
                     var allocPoolStr = '';
                     var allocPools = [];
                     allocPoolStr += ip_block_ap.start + "-" + ip_block_ap.end + "\n";
                     subnetObj['allocation_pools'] = allocPoolStr.trim();
                     subnetObj['vr_user_created_cidr'] = ' ';
                     subnetObj['user_created_ipam_fqn'] = ipamFQN;
                     subnetObj['alloc_pool_flag'] = true;
                     subnetObj['disable'] = true;
                     returnArr.push(subnetObj);
                   });
                 }
             }
             return returnArr;
        };
        this.ipamSubnetDropDownFormatter = function(response) {
            var ipamResponse = getValueByJsonPath(response,
                    '0;network-ipams', []);
            var ipamList = [];
            var domain  = contrail.getCookie(cowc.COOKIE_DOMAIN);
            var project = contrail.getCookie(cowc.COOKIE_PROJECT);
            $.each(ipamResponse, function (i, ipam) {
                var ipBlocks = '';
                var obj = getValueByJsonPath(ipam,
                        'network-ipam', "", false),
                    flatName = obj.fq_name[2];
                if(obj.ipam_subnet_method == null ||
                        obj.ipam_subnet_method === ctwc.USER_DEFINED_SUBNET) {
                    return true;
                }
                var subnets = _.get(obj,'ipam_subnets.subnets',null);
                if(subnets){
                    _.each(subnets, function(val) {
                        ipBlocks += "("+val.subnet.ip_prefix+"/"+
                        val.subnet.ip_prefix_len+")"
                     });
                }
                if (domain != obj.fq_name[0] ||
                    project != obj.fq_name[1]) {
                        flatName += ' (' + obj.fq_name[0] +
                                    ':' + obj.fq_name[1] + ')';
                }
                ipamList.push({
                    id: obj.fq_name.join(cowc.DROPDOWN_VALUE_SEPARATOR)+":"+obj.uuid,
                    text: flatName+ipBlocks
                });
            });
            return ipamList;
        };

    }
    return vRouterCfgFormatters;
});
