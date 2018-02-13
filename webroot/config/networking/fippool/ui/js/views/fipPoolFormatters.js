/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'lodash'
], function (_) {
    var FipPoolFormatters = function() {
        var self = this;
        self.networkFormater = function(d, c, v, cd, dc) {
            var network = "-";
            network = _.get(dc, "fq_name.2", "-");
            return network;
        };
        self.networkDescriptionFormater = function(d, c, v, cd, dc) {
            var description;
            description = _.get(dc, "id_perms.description", null);
            if(description === null){
                description = "-"
            }
            return description;
        };
        self.projectName = function(d, c, v, cd, dc) {
            var tenant = '';
            var share = _.get(dc, 'perms2.share', []);
            if(share.length > 0){
                _.each(share, function (share, index){
                    if(share['tenant_name'] != undefined){
                        tenant += share['tenant_name'] + "<br />"
                    }
                });
                var tenantFormat = tenant.split("<br />");
                if(tenantFormat.length > 5){
                    var tenantFormatMore = tenantFormat.length-5
                    tenant = tenantFormat[0] + "<br />"+ tenantFormat[1] + "<br />"+ "(" + tenantFormatMore + " More )";
                }
            }
            else{
                tenant = "-";
            }
            return tenant;
        };
        self.projectNameExp = function(d, c, v, cd, dc) {
            var tenant = '';
            var share = _.get(dc, 'perms2.share', []);
            if(share.length > 0){
                _.each(share, function (share, index){
                    if(share['tenant_name'] != undefined){
                        tenant += share['tenant_name'] + "<br />"
                    }
                });
            }
            else{
                tenant = "-";
            }
            return tenant;
        };
        //Grid column expand label : Name//
        self.fqNameFormater = function(d, c, v, cd, dc) {
            var fqname = "-";
            var fqNameData = _.get(dc, "fq_name", []);
            if(fqNameData.length >= 3){
                fqname = fqNameData[2];
            }
            return fqname;
        };
        self.networkDDFormatter = function(response) {
            var networkList = [];
            response = response[0]['virtual-networks'];
            var responseLen = response.length;
            for(var i = 0; i < responseLen; i++) {
                var networkResponse =
                        getValueByJsonPath(response[i]["virtual-network"],
                        'fq_name', '');
                if(networkResponse != '') {
                    var objArr = networkResponse;
                    var text = "";
                    text = ctwu.formatCurrentFQName(networkResponse,
                            ctwu.getCurrentDomainProject());
                    var networkResponseVal = networkResponse.join(":");
                    networkList.push({value: networkResponseVal, text: text});
                }
            }
            return networkList;
        };
        self.getProjectFqn = function(fqn) {
            if (null == fqn) {
                return getCookie('domain') + ':' +
                    getCookie('project');
            }
            return fqn;
        };
        self.formatNetworksData = function(portEditView, result, mode) {
            var formattedNetworks =
                self.networkDDFormatter(result),
                selectedVN, subnetDS;
            portEditView.model.setVNData(result);
            return formattedNetworks;
        };
    }
    return FipPoolFormatters;
});
