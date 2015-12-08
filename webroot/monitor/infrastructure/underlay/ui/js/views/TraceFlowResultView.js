/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var TraceFlowResultView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null, self.getViewConfig());
        },
        getViewConfig: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                traceFlowGridColumns = [];
            var graphView = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphView');
            var underlayGraphModel = graphView.model, traceFlowRemoteConfig = {};
            if(self.model.traceflow_radiobtn_name() == 'vRouter') {
                var vRouterMap = underlayGraphModel.vRouterMap;
                var vRouterData =
                    ifNull(vRouterMap[self.model.vrouter_dropdown_name()], {});
                var ip = getValueByJsonPath(vRouterData,
                    'more_attributes;VrouterAgent;self_ip_list;0',
                    getValueByJsonPath(vRouterData,
                    'more_attributes;ConfigData;virtual-router;virtual_router_ip_address'));
                var introspectPort = getValueByJsonPath(vRouterData,
                    'more_attributes;VrouterAgent;sandesh_http_port',
                    ctwl.DEFAULT_INTROSPECTPORT);
                traceFlowRemoteConfig = {
                    url: '/api/admin/monitor/infrastructure/vrouter/flows?ip='+
                        ip+'&introspectPort='+introspectPort,
                    dataParser: monitorInfraParsers.parseVRouterFlowsData
                };
                traceFlowGridColumns =
                    monitorInfraUtils.getTraceFlowVrouterGridColumns();
            } else if (self.model.traceflow_radiobtn_name() == 'instance') {
                var vmUUID = self.model.instance_dropdown_name();
                var vmData = underlayGraphModel.vmMap[vmUUID];
                var vRouters = underlayGraphModel.vRouters;
                var ajaxData = {
                    pageSize: 50,
                    timeRange: 300,
                    select: 'agg-bytes,agg-packets,vrouter_ip,other_vrouter_ip',
                    fromTimeUTC: 'now-300s',
                    toTimeUTC: 'now',
                    startAt: new Date().getTime(),
                    async: false,
                    table:'FlowRecordTable',
                    filters : "limit: 5000"

                };
                var intfData = getValueByJsonPath(vmData,
                    'more_attributes;interface_list',[]);
                var where = '',floatingIp = [];
                for(var i = 0; i < intfData.length; i++) {
                    for(var k = 0;k < ifNull(intfData[i]['floating_ips'],[]).length; k++) {
                        var floatingIpData = intfData[i]['floating_ips'][k];
                        where += '(sourcevn = '+floatingIpData['virtual_network'];
                        where += ' AND destvn = '+floatingIpData['virtual_network'];
                        where += ' AND sourceip = '+floatingIpData['ip_address']+') OR '
                    }
                    where += '(sourcevn = '+intfData[i]['virtual_network'];
                    where += ' AND sourceip = '+intfData[i]['ip_address']+')';
                    where += ' OR ';
                    where += '(destvn = '+intfData[i]['virtual_network'];
                    where += ' AND destip = '+intfData[i]['ip_address']+')';
                    if(i+1 < intfData.length)
                        where+= ' OR ';
                }
                ajaxData['where'] = where;
                ajaxData['engQueryStr'] = JSON.stringify(ajaxData);
                traceFlowRemoteConfig = {
                    url: '/api/admin/reports/query',
                    data: ajaxData,
                    dataParser: monitorInfraParsers.parseUnderlayFlowRecords,
                };
                traceFlowGridColumns =
                    monitorInfraUtils.getTraceFlowVMGridColumns();
            }
            return {
                elementId: ctwc.TRACEFLOW_RESULTS_GRID_ID,
                title: ctwl.TITLE_RESULTS,
                view: "GridView",
                viewConfig: {
                    elementConfig:
                        getTraceFlowGridConfig(traceFlowRemoteConfig,
                            traceFlowGridColumns, self.model)
                }
            };
        }
    });

    function getTraceFlowGridConfig(traceFlowRemoteConfig,
            traceFlowGridColumns,
            formModel) {
        var gridId = ctwc.TRACEFLOW_RESULTS_GRID_ID;
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.UNDERLAY_TRACEFLOW_TITLE,
                },
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    detail: false,
                    actionCellPosition: 'start',
                    actionCell: [{
                        title:'TraceFlow',
                        iconClass: 'icon-contrail-trace-flow',
                        onClick: function(rowId,targetElement){
                            $("#"+gridId + " div.selected-slick-row").each(
                                    function(idx,obj){
                                        $(obj).removeClass('selected-slick-row');
                                    }
                                );
                                $(targetElement).parent().parent()
                                    .addClass('selected-slick-row');
                            doTraceFlow(rowId, formModel);
                        }
                    },{
                        title:'Reverse TraceFlow',
                        iconClass: 'icon-contrail-reverse-flow',
                        onClick: function(rowId,targetElement){
                            $("#"+gridId + " div.selected-slick-row").each(
                                    function(idx,obj){
                                        $(obj).removeClass('selected-slick-row');
                                    }
                                );
                                $(targetElement).parent().parent()
                                    .addClass('selected-slick-row');
                            doReverseTraceFlow(rowId, formModel);
                        }
                    }],
                },
                dataSource: {
                    remote: {
                        ajaxConfig: traceFlowRemoteConfig,
                        dataParser: function(response) {
                            var parsedResponse =
                                traceFlowRemoteConfig['dataParser'](response);
                            return parsedResponse['data'] != null ?
                                parsedResponse['data'] : parsedResponse;
                        }
                    }
                }
            },
            columnHeader: {
                columns: traceFlowGridColumns
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 10
                    }
                }
            }
        };
        return gridElementConfig;
    };

    function getSelectedvRouterIP (vRouterName, graphModel) {
        var ip = "";
        if (graphModel != null && graphModel.vRouterMap[vRouterName] != null) {
            var vRouterDetails = graphModel.vRouterMap[vRouterName];
            ip = getValueByJsonPath(vRouterDetails,
                    'more_attributes;VrouterAgent;self_ip_list;0','-');
        }
        return ip;
    }

    function doTraceFlow (rowId, formModel) {
        var flowGrid =
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        var graphView = monitorInfraUtils.getUnderlayGraphInstance();
        var graphModel = graphView.model;
        var contextVrouterIp;
        if(formModel != null && formModel.showvRouter())
            contextVrouterIp =
                getSelectedvRouterIP(formModel.vrouter_dropdown_name(), graphModel);
        var dataItem = ifNull(flowGrid._grid.getDataItem(rowId),{});
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var nwFqName = '';
        var postData = {
            srcIP: dataItem['sourceip'] != null ?
                dataItem['sourceip'] : dataItem['sip'],
            destIP: dataItem['destip'] != null ?
                dataItem['destip'] : dataItem['dip'],
            srcPort: dataItem['sport'] != null ?
                dataItem['sport'] : dataItem['src_port'],
            destPort: dataItem['dport'] != null ?
                dataItem['dport'] : dataItem['dst_port'],
            srcVN: dataItem['src_vn'] != null ?
                dataItem['src_vn'] : dataItem['sourcevn'],
            destVN: dataItem['dst_vn'] != null ?
                dataItem['dst_vn'] : dataItem['destvn'],
            protocol: dataItem['protocol'],
            maxAttempts: 3,
            interval: 5,
         };
        // We are sending the VrfId of the flow for trace router request,
        // in some cases like egress flows, the Vrf Id is in context with the
        // current Vrouter introspect but we are issuing the trace route
        // request to other vrouter,which throws error to fix these cases
        // resolveVrfId IP used.
        if(dataItem['direction_ing'] == 1 ||
             dataItem['direction'] == 'ingress') {
            if(formModel != null && formModel.showvRouter()) {
                postData['nodeIP'] = contextVrouterIp;
                postData['resolveVrfId'] = contextVrouterIp;
            } else if(formModel != null && formModel.showInstance()) {
                if (dataItem['vrouter_ip'] != null) {
                    postData['nodeIP'] = dataItem['vrouter_ip'];
                }
            }
            if(dataItem['raw_json'] != null &&
                dataItem['raw_json']['vrf'] != null) {
                postData['vrfId'] = parseInt(dataItem['raw_json']['vrf']);
            }
            nwFqName = dataItem['sourcevn'] != null ?
                dataItem['sourcevn'] : dataItem['src_vn'];
        } else if(dataItem['direction_ing'] == 0 ||
        dataItem['direction'] == 'egress') {
            if(dataItem['raw_json'] != null && dataItem['raw_json']['vrf'] != null) {
                postData['vrfId'] = parseInt(dataItem['raw_json']['vrf']);
                postData['resolveVrfId'] = contextVrouterIp;
            }
            postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ?
                dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            nwFqName = dataItem['sourcevn'] != null ?
                dataItem['sourcevn'] : dataItem['src_vn'];
        }
        if(postData['nodeIP'] == null ||
                graphModel.checkIPInVrouterList(postData['nodeIP'])) {
            showInfoWindow("Cannot Trace route for the selected flow", "Info");
            return;
        }
        if (postData['vrfId'] != null) {
            doTraceFlowRequest(postData);
        } else {
            $.ajax({
                url:'api/tenant/networking/virtual-network/summary?fqNameRegExp='
                    +nwFqName,
            }).always(function(networkDetails){
                if(networkDetails['value']!= null &&
                      networkDetails['value'][0] != null &&
                      networkDetails['value'][0]['value'] != null) {
                    var vrfList =
                        getValueByJsonPath(networkDetails,
                        'value;0;value;UveVirtualNetworkConfig;routing_instance_list',[]);
                    if(vrfList[0] != null)
                        nwFqName += ":"+vrfList[0];
                } else
                    // if there is no vrf name in the response then
                    // just constructing it in general format
                    nwFqName += ":"+nwFqName.split(':')[2];
                postData['vrfName'] = nwFqName;
                doTraceFlowRequest(postData);
            });
        }
    }

    function doReverseTraceFlow (rowId, formModel) {
        var flowGrid =
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        var graphView = monitorInfraUtils.getUnderlayGraphInstance();
        var graphModel = graphView.model;
        var dataItem = ifNull(flowGrid._grid.getDataItem(rowId),{});
        var contextVrouterIp = '';
        if(formModel != null && formModel.showvRouter())
            contextVrouterIp =
                getSelectedvRouterIP(formModel.vrouter_dropdown_name(), graphModel);
        /*
         * For egress flows the source vm ip may not spawned in the same vrouter,
         * so need to pick the peer_vrouter
         */
        var postData = {
            srcIP: dataItem['destip'] != null ?
                dataItem['destip'] : dataItem['dip'],
            destIP: dataItem['sourceip'] != null ?
                dataItem['sourceip'] : dataItem['sip'],
            srcPort: dataItem['dport'] != null ?
                dataItem['dport'] : dataItem['dst_port'],
            destPort: dataItem['sport'] != null ?
                dataItem['sport'] : dataItem['src_port'],
            srcVN: dataItem['src_vn'] != null ?
                dataItem['src_vn'] : dataItem['sourcevn'],
            destVN: dataItem['dst_vn'] != null ?
                 dataItem['dst_vn'] : dataItem['destvn'],
            protocol: dataItem['protocol'],
            maxAttempts: 3,
            interval: 5,
        };
        if(dataItem['direction_ing'] == 0 || dataItem['direction'] == 'egress') {
            if(formModel != null && formModel.showvRouter()) {
                postData['nodeIP'] = contextVrouterIp;
                postData['resolveVrfId'] = contextVrouterIp;
            } else if(formModel != null && formModel.showInstance()) {
                if (dataItem['vrouter_ip'] != null) {
                    postData['nodeIP'] = dataItem['vrouter_ip'];
                }
            }
            nwFqName = dataItem['destvn'] != null ?
                dataItem['destvn'] : dataItem['dst_vn'];
            if(dataItem['raw_json'] != null &&
                dataItem['raw_json']['dest_vrf'] != null) {
                postData['vrfId'] =
                    parseInt(dataItem['raw_json']['dest_vrf']);
            }
        } else if(dataItem['direction_ing'] == 1 ||
              dataItem['direction'] == 'ingress') {
            postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ?
                dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            nwFqName = dataItem['destvn'] != null ?
                dataItem['destvn'] : dataItem['dst_vn'];
            if(dataItem['raw_json'] != null &&
                 dataItem['raw_json']['dest_vrf'] != null) {
                postData['vrfId'] = parseInt(dataItem['raw_json']['dest_vrf']);
                postData['resolveVrfId'] = contextVrouterIp;
            }
        }
        if(graphModel.checkIPInVrouterList(postData['nodeIP'])) {
            showInfoWindow("Cannot Trace route for the selected flow", "Info");
            return;
        }
        if(postData['vrfId'] != null) {
            doTraceFlowRequest(postData);
        } else {
            $.ajax({
                url:'api/tenant/networking/virtual-network/summary?fqNameRegExp='
                    +nwFqName,
            }).always(function(networkDetails){
                if(networkDetails['value']!= null &&
                    networkDetails['value'][0] != null &&
                    networkDetails['value'][0]['value'] != null) {
                    var vrfList = getValueByJsonPath(networkDetails,
                        'value;0;value;UveVirtualNetworkConfig;routing_instance_list',[]);
                    if(vrfList[0] != null)
                        nwFqName = vrfList[0];
                } else
                    // if there is no vrf name in the response then
                    // just constructing it in general format
                    nwFqName += ":"+nwFqName.split(':')[2];
                postData['vrfName'] = nwFqName;
                doTraceFlowRequest(postData);
            });
        }
    }

    function doTraceFlowRequest (postData) {
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            timeout:5000,
            data:{
                data: postData
            }
        }).done(function(response) {
            /*if(postData['startAt'] != null && underlayLastInteracted > postData['startAt'])
                return;*/
            if (typeof response == 'string') {
                showInfoWindow(response,'Error');
                return;
            }
            if(response.nodes.length > 0) {
                var maxAttempts = postData.maxAttempts;
                var starString = '';
                var fillString = '* ';

                for (;;) {
                    if (maxAttempts & 1)
                        starString += fillString;
                    maxAttempts >>= 1;
                    if (maxAttempts)
                        fillString += fillString;
                    else
                        break;
                }

                for(var i=0; i<response.nodes.length; i++) {
                    var node = response.nodes[i];
                    if(node.name === starString) {
                        response.nodes.splice(i, 1);
                        i--;
                    }
                }
                for(var i=0; i<response.links.length; i++) {
                    var link = response.links[i];
                    var endpoint0 = link.endpoints[0];
                    var endpoint1 = link.endpoints[1];
                    if(endpoint0 === starString ||
                        endpoint1 === starString) {
                        response.links.splice(i, 1);
                        i--;
                    }
                }
            }
            var graphView = monitorInfraUtils.getUnderlayGraphInstance();
            var graphModel = graphView != null ? graphView.model : null;
            if (graphModel != null) {
                graphModel.underlayPathReqObj = postData;
                graphModel.flowPath.set('links',ifNull(response['links'], []));
                graphModel.flowPath.set('nodes',ifNull(response['nodes'], []));
            }
            if(typeof response != 'string')
                $('html,body').animate({scrollTop:0}, 500);
        }).fail(function(error,status) {
            /*if(postData['startAt'] != null && underlayLastInteracted > postData['startAt'])
                return;*/
            if(status == 'timeout') {
                showInfoWindow('Timeout in fetching details','Error');
            } else if (status != 'success') {
                showInfoWindow('Error in fetching details','Error');
            }
        });
    }
    return TraceFlowResultView;
});