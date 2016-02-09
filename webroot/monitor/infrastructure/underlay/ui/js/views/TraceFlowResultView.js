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
            self.renderView4Config(self.$el, null, self.getViewConfig(), null,
                null, null, function (traceFlowResultView) {
                flowKeyStack = [];
                var isPrevClicked = false;
                $("#"+ctwc.TRACEFLOW_RESULTS_GRID_ID).find('i.icon-forward')
                    .parent().click(function () {
                        var vRouterDetails = getSelectedVrouterDetails(self.model);
                        var url = monitorInfraConstants.monitorInfraUrls.VROUTER_FLOWS
                                 + '?ip=' + vRouterDetails['ip']
                                 + '&introspectPort='
                                 + vRouterDetails['introspectPort'];
                        if(flowKeyStack.length > 0 &&
                            flowKeyStack[flowKeyStack.length - 1] != null) {
                            url = monitorInfraConstants.monitorInfraUrls.VROUTER_FLOWS
                                  + '?ip=' + vRouterDetails['ip']
                                  + '&flowKey='
                                  + flowKeyStack[flowKeyStack.length - 1]
                                  + '&introspectPort='
                                  + vRouterDetails['introspectPort'];
                        }
                        fetchvRouterFlowRecords(url, traceFlowResultView);
                });
                $("#"+ctwc.TRACEFLOW_RESULTS_GRID_ID).find('i.icon-backward')
                    .parent().click(function () {
                     var vRouterDetails = getSelectedVrouterDetails(self.model);
                     var url = monitorInfraConstants.monitorInfraUrls.VROUTER_FLOWS
                               + '?ip=' + vRouterDetails['ip']
                               + '&introspectPort='
                               + vRouterDetails['introspectPort'];
                     if (!isPrevClicked) {
                         flowKeyStack.pop();
                         isPrevClicked = true;
                     }
                     // Need to remove last two keys in the array to get the
                     // previous set of records
                        flowKeyStack.pop();
                     if (flowKeyStack.length > 0) {
                         url = monitorInfraConstants.monitorInfraUrls.VROUTER_FLOWS
                               + '?ip=' + vRouterDetails['ip']
                               + '&flowKey=' + flowKeyStack.pop()
                               + '&introspectPort=' + vRouterDetails['introspectPort'];
                     }
                     fetchvRouterFlowRecords(url, traceFlowResultView);
                });
            });
        },
        getViewConfig: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                traceFlowGridColumns = [];
            var underlayGraphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel'),
                traceFlowRemoteConfig = {};
            if(self.model.traceflow_radiobtn_name() == 'vRouter') {
                var vRouterDetails = getSelectedVrouterDetails(self.model);
                var ip = vRouterDetails['ip'];
                var introspectPort = vRouterDetails['introspectPort'];
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
                    dataParser: function (response) {
                        return monitorInfraParsers.parseUnderlayFlowRecords(
                            response, vRouters);
                    }
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

    function fetchvRouterFlowRecords(url) {
        var resultGrid = $("#"+ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        resultGrid.showGridMessage('loading');
        $.ajax({
           url: url,
        }).done(function (response) {
            resultGrid.removeGridLoading('loading');
            resultGrid.removeGridMessage('loading');
            response = monitorInfraParsers.parseVRouterFlowsData(response);
            resultGrid._dataView.setData(response);
        }).fail(function () {
            resultGrid.removeGridLoading('loading');
            resultGrid.removeGridMessage('loading');
            resultGrid.showGridMessage('error');
        });
    }

    function getTraceFlowGridConfig(traceFlowRemoteConfig,
            traceFlowGridColumns,
            formModel) {
        var gridId = ctwc.TRACEFLOW_RESULTS_GRID_ID;
        var customControls = [], footer = false;
        var gridTitle = '',
            underlayGraphModel = monitorInfraUtils.getUnderlayGraphModel();
        if (formModel.traceflow_radiobtn_name() == 'vRouter') {
            customControls = [
                '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
            ];
            gridTitle = contrail.format("{0} ({1})",'Active flows of Virtual Router',
                formModel.vrouter_dropdown_name());
        } else {
            var vmDetails =
                underlayGraphModel.vmMap[formModel.instance_dropdown_name()];
            var name =
                getValueByJsonPath(vmDetails, 'more_attributes;vm_name', '-');
            if(name == '-')
                name = getValueByJsonPath(vmDetails, 'name', '-');
            footer = {
                pager: {
                    options: {
                        pageSize: 10,
                    }
                }
            };
            gridTitle = contrail.format('{0} ({1})','Last 10 minute flows of Virtual Machine', name);
        }
        function resetLoadingIcon () {
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID
                + " div.grid-canvas div.slick-cell i.icon-spinner")
                .toggleClass('icon-cog icon-spinner icon-spin');
        }
        var gridElementConfig = {
            header: {
                title: {
                    text: gridTitle,
                },
                customControls: customControls,
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
                            var graphModel = monitorInfraUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            resetLoadingIcon();
                            $(targetElement).toggleClass('icon-cog icon-spinner icon-spin');
                            $("#"+gridId + " div.selected-slick-row").each(
                                    function(idx,obj){
                                        $(obj).removeClass('selected-slick-row');
                                    }
                                );
                            $(targetElement).parent().parent()
                                  .addClass('selected-slick-row');
                            var deferredObj = $.Deferred();
                            doTraceFlow(rowId, formModel, deferredObj);
                            deferredObj.always(function (resetLoading) {
                                if (resetLoading) {
                                    $(targetElement)
                                        .toggleClass('icon-cog icon-spinner icon-spin');
                                }
                            });
                        }
                    },{
                        title:'Reverse TraceFlow',
                        iconClass: 'icon-contrail-reverse-flow',
                        onClick: function(rowId,targetElement){
                            var graphModel = monitorInfraUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            resetLoadingIcon();
                            $(targetElement).toggleClass('icon-cog icon-spinner icon-spin');
                            $("#"+gridId + " div.selected-slick-row").each(
                                    function(idx,obj){
                                        $(obj).removeClass('selected-slick-row');
                                    }
                                );
                            $(targetElement).parent().parent()
                                .addClass('selected-slick-row');
                            var deferredObj = $.Deferred();
                            doReverseTraceFlow(rowId, formModel, deferredObj);
                            deferredObj.always(function (resetLoading) {
                                if (resetLoading) {
                                    $(targetElement)
                                        .toggleClass('icon-cog icon-spinner icon-spin');
                                }
                            });
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
            footer: footer
        };
        return gridElementConfig;
    };

    function getSelectedVrouterDetails (traceFlowFormModel) {
        var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
        var vRouterMap = graphModel.vRouterMap;
        var vRouterData =
            ifNull(vRouterMap[traceFlowFormModel.vrouter_dropdown_name()], {});
        var ip = getValueByJsonPath(vRouterData,
            'more_attributes;VrouterAgent;self_ip_list;0',
            getValueByJsonPath(vRouterData,
            'more_attributes;ConfigData;virtual-router;virtual_router_ip_address'));
        var introspectPort = getValueByJsonPath(vRouterData,
            'more_attributes;VrouterAgent;sandesh_http_port',
            ctwl.DEFAULT_INTROSPECTPORT);
        return {
            ip: ip,
            introspectPort: introspectPort
        };
    }
    function doTraceFlow (rowId, formModel, deferredObj) {
        var flowGrid =
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        var graphModel = monitorInfraUtils.getUnderlayGraphModel();
        var contextVrouterIp;
        if(formModel != null && formModel.showvRouter())
            contextVrouterIp =
                getSelectedVrouterDetails(formModel)['ip'];
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
             postData['nodeIP'] = dataItem['other_vrouter_ip'] != null ?
                    dataItem['other_vrouter_ip'] : dataItem['peer_vrouter'];
            if(dataItem['raw_json'] != null && dataItem['raw_json']['vrf'] != null) {
                postData['vrfId'] = parseInt(dataItem['raw_json']['vrf']);
                postData['resolveVrfId'] = contextVrouterIp;
            }
            nwFqName = dataItem['sourcevn'] != null ?
                dataItem['sourcevn'] : dataItem['src_vn'];
        }
        if(postData['nodeIP'] != null && (!graphModel.checkIPInVrouterList(postData))) {
            if(deferredObj != null) {
                deferredObj.resolve(true);
            }
            showInfoWindow("Cannot Trace route for the selected flow", "Info");
            return;
        }
        postData['action'] = 'Trace Flow';
        if (postData['vrfId'] != null) {
            doTraceFlowRequest(postData, graphModel, deferredObj);
        } else {
            $.ajax({
                url:'/api/tenants/config/get-config-list',
                type: 'POST',
                dataType: 'json',
                data: {
                    data: [{
                        type: 'virtual-networks',
                        fields: ['routing_instances'],
                        fq_name: nwFqName,
                    }]
                },
            }).always(function(networkDetails){
                var vrfList = getValueByJsonPath(networkDetails,
                    '0;virtual-networks;0;routing_instances',[]);
                if(vrfList[0] != null && vrfList[0]['to'] != null) {
                    nwFqName = vrfList[0]['to'].join(':');
                } else {
                 // if there is no vrf name in the response then
                    // just constructing it in general format
                    nwFqName += ":"+nwFqName.split(':')[2];
                }
                postData['vrfName'] = nwFqName;
                doTraceFlowRequest(postData, graphModel, deferredObj);
            });
        }
    }

    function doReverseTraceFlow (rowId, formModel, deferredObj) {
        var flowGrid =
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        var graphModel = monitorInfraUtils.getUnderlayGraphModel();
        var dataItem = ifNull(flowGrid._grid.getDataItem(rowId),{});
        var contextVrouterIp = '';
        if(formModel != null && formModel.showvRouter())
            contextVrouterIp =
                getSelectedVrouterDetails(formModel)['ip'];
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
            destVN: dataItem['src_vn'] != null ?
                dataItem['src_vn'] : dataItem['sourcevn'],
            srcVN: dataItem['dst_vn'] != null ?
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
        if(postData['nodeIP'] != null &&
            (!graphModel.checkIPInVrouterList(postData))) {
            if(deferredObj != null) {
                deferredObj.resolve(true);
            }
            showInfoWindow("Cannot Trace route for the selected flow", "Info");
            return;
        }
        postData['action'] = 'Reverse Trace Flow';
        if(postData['vrfId'] != null) {
            doTraceFlowRequest(postData, graphModel, deferredObj);
        } else {
            $.ajax({
                url:'/api/tenants/config/get-config-list',
                type: 'POST',
                dataType: 'json',
                data: {
                    data: [{
                        type: 'virtual-networks',
                        fields: ['routing_instances'],
                        fq_name: nwFqName,
                    }]
                },
            }).always(function(networkDetails){
                var vrfList = getValueByJsonPath(networkDetails,
                    '0;virtual-networks;0;routing_instances',[]);
                if(vrfList[0] != null && vrfList[0]['to'] != null) {
                    nwFqName = vrfList[0]['to'].join(':');
                } else {
                 // if there is no vrf name in the response then
                    // just constructing it in general format
                    nwFqName += ":"+nwFqName.split(':')[2];
                }
                postData['vrfName'] = nwFqName;
                doTraceFlowRequest(postData, graphModel, deferredObj);
            });
        }
    }

    function doTraceFlowRequest (postData, graphModel, deferredObj) {
        postData['startAt'] = new Date().getTime();
        $.ajax({
            url:'/api/tenant/networking/trace-flow',
            type:'POST',
            timeout:30000,
            cache: true,
            data:{
                data: postData
            }
        }).done(function(response) {
            if(postData['startAt'] != null &&
                graphModel.lastInteracted > postData['startAt']) {
                if (deferredObj != null) {
                    deferredObj.resolve(false);
                }
                return;
            }
                
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
            if (graphModel != null) {
                graphModel.underlayPathReqObj = postData;
                graphModel.flowPath.set({
                    'nodes': ifNull(response['nodes'], []),
                    'links': ifNull(response['links'], [])
                },{silent: true});
                graphModel.flowPath.trigger('change:nodes');
                if (ifNull(response['nodes'], []).length == 0 ||
                    ifNull(response['links'], []).length == 0) {
                } else {
                    monitorInfraUtils.addUnderlayFlowInfoToBreadCrumb({
                        action: postData['action'],
                        sourceip: postData['srcIP'],
                        destip: postData['destIP'],
                        sport: postData['srcPort'],
                        dport: postData['destPort']
                    });
                }
            }
            if(typeof response != 'string')
                $('html,body').animate({scrollTop:0}, 500);
        }).fail(function(error,status) {
            if(postData['startAt'] != null &&
                graphModel.lastInteracted > postData['startAt']) {
                if (deferredObj != null) {
                    deferreObj.resolve(false);
                }
                return;
            }
            if(status == 'timeout') {
                showInfoWindow('Timeout in fetching details','Error');
            } else if (status != 'success') {
                showInfoWindow('Error in fetching details','Error');
            }
        }).always(function () {
            if(deferredObj != null) {
                deferredObj.resolve(true);
            }
        });
    }
    return TraceFlowResultView;
});
