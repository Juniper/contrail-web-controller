/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var UnderlayParsers = function () {
        var self = this;
        self.parseTopologyData = function(response) {
            response = ifNull(response, {});
            var nodes = ifNull(response['nodes'], []);
            var configMissingNodes = getValueByJsonPath(response,
                'errors;configNotFound',[]);
            var configMissingLen = configMissingNodes.length;
            var uveMissingNodes = getValueByJsonPath(response,
                'errors;uveNotFound',[]);
            var uveMissingLen = uveMissingNodes.length;
            for(var i = 0; i < configMissingLen; i++) {
                var nodeObj = {
                    name:configMissingNodes[i],
                    node_type: "physical-router",
                    chassis_type: "unknown",
                    more_attributes: {},
                    errorMsg:'Configuration Unavailable'
                };
                nodes.push(nodeObj);
            }
            for(var i = 0; i < uveMissingLen; i++) {
                var nodeObj = {
                    name:uveMissingNodes[i],
                    node_type: "physical-router",
                    chassis_type: "unknown",
                    more_attributes: {},
                    errorMsg:'System Information Unavailable'
                };
                nodes.push(nodeObj);
            }
            for(var i = 0; i < nodes.length; i++) {
                if(nodes[i].chassis_type === "-") {
                    nodes[i].chassis_type = nodes[i].node_type;
                }
            }
            var edges = ifNull(response['links'], []);
            var modelData = [{
                id                  : $.now(),
                nodes               : nodes,
                edges               : edges,
                uveMissingNodes     : uveMissingNodes,
                configMissingNodes  : configMissingNodes,
                rawData             : response
            }];
            return modelData;
        };

        self.parseUnderlayFlowRecords = function (response, vRouters) {
            vRouters = ifNull(vRouters,[]);
            var noDataStr = monitorInfraConstants.noDataStr;
            $.each(ifNull(response['data'],[]),function (idx,obj) {
                var formattedVrouter,formattedOtherVrouter,
                    formattedSrcVN,formattedDestVN;
                var vRouterIp =
                    validateIPAddress(cowu.handleNull4Grid(obj['vrouter_ip'])) == true ?
                    cowu.handleNull4Grid(obj['vrouter_ip']) : noDataStr,
                        formattedVrouter = vRouterIp;
                var vrouter = ifNull(obj['vrouter'],noDataStr);
                if(vRouterIp != noDataStr || vrouter != noDataStr)
                    formattedVrouter =
                        contrail.format('{0} ({1})',vrouter, vRouterIp);
                var othervRouterIp =
                    validateIPAddress(cowu.handleNull4Grid(obj['other_vrouter_ip'])) == true ?
                        cowu.handleNull4Grid(obj['other_vrouter_ip']) : noDataStr,
                        formattedOtherVrouter = othervRouterIp;
                    if(othervRouterIp != noDataStr) {
                        $.each(vRouters,function(idx,obj){
                            var ipList = getValueByJsonPath(obj.attributes.model().attributes,
                                'more_attributes;VrouterAgent;self_ip_list',[]);
                            if(ipList.indexOf(othervRouterIp) > -1)
                              formattedOtherVrouter = contrail.format('{0} ({1})',
                              ifNull(obj.attributes.model().attributes.name,noDataStr),
                              othervRouterIp);
                        });
                    }
               var formattedSrcVN = cowu.handleNull4Grid(obj['sourcevn']);
               formattedSrcVN = formatVN(formattedSrcVN);
               var formattedDestVN = cowu.handleNull4Grid(obj['destvn']);
               formattedDestVN = formatVN(formattedSrcVN);
               obj['formattedVrouter'] = formattedVrouter;
               obj['formattedOtherVrouter'] = formattedOtherVrouter;
               obj['formattedSrcVN'] = formattedSrcVN[0];
               obj['formattedDestVN'] = formattedDestVN[0];
            });
            response['data'].sort(function(dataItem1,dataItem2){
                if((dataItem1['vrouter_ip'] != null  && dataItem1['other_vrouter_ip']!= null)
                    && (dataItem2['vrouter_ip'] == null || dataItem2['other_vrouter_ip'] == null)) {
                    return -1;
                } else if ((dataItem2['vrouter_ip'] != null  && dataItem2['other_vrouter_ip']!= null)
                    && (dataItem1['vrouter_ip'] == null || dataItem1['other_vrouter_ip'] == null)) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return response['data'];
        }
    }
    return new UnderlayParsers();
});