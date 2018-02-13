/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
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
            var description = "-";
            description = _.get(dc, "id_perms.description", "-");
            return description;
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
        /////End of Grid data formating/////
        ///////create or edit popup related function////////
        /*
            Create / Edit Network drop down data formatter
        */
        self.networkDDFormatter = function(response) {
            var networkList = [],
                responseLen = response.length;
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
        self.vnDDFormatter = function(response, edit, portModel) {
            if(!edit && response.length > 0) {
                portModel.model.virtualNetworkName(response[0].value);
            }
            return response;
        }
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
