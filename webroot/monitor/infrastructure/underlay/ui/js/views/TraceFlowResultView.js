/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'monitor/infrastructure/underlay/ui/js/underlay.utils',
    'monitor/infrastructure/underlay/ui/js/underlay.parsers'
], function (_, ContrailView, Knockback, underlayUtils, underlayParsers) {
    var TraceFlowResultView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;
            self.renderView4Config(self.$el, null, self.getViewConfig(), null,
                null, null, function (traceFlowResultView) {
                flowKeyStack = [];
                var isPrevClicked = false;
                $("#"+ctwc.TRACEFLOW_RESULTS_GRID_ID).find('i.fa-forward')
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
                $("#"+ctwc.TRACEFLOW_RESULTS_GRID_ID).find('i.fa-backward')
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
                    underlayUtils.getTraceFlowVrouterGridColumns();
            } else if (self.model.traceflow_radiobtn_name() == 'instance') {
                var vmUUID = self.model.instance_dropdown_name();
                var vmData = underlayGraphModel.vmMap()[vmUUID];
                var vRouters = underlayGraphModel.getVirtualRouters();
                var ajaxData = {
                    chunkSize: 50,
                    chunk: 1,
                    async: false,
                };
                var queryData = {
                    table_name: 'FlowRecordTable',
                    from_time_utc: 'now-10m',
                    to_time_utc: 'now',
                    filters : "limit: 5000",
                    select: 'agg-bytes,agg-packets,vrouter_ip,other_vrouter_ip,' +
                        'vrouter,sourcevn,sourceip,sport,destvn,destip,dport,' +
                        'protocol,direction_ing,UuidKey,action,sg_rule_uuid,' +
                        'nw_ace_uuid,underlay_proto,underlay_source_port'
                }
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
                queryData['where'] = where;
                ajaxData['formModelAttrs'] = queryData;
                ajaxData['engQueryStr'] = JSON.stringify(ajaxData);
                traceFlowRemoteConfig = {
                    url: '/api/qe/query',
                    data: JSON.stringify(ajaxData),
                    type: 'POST',
                    dataParser: function (response) {
                        return underlayParsers.parseUnderlayFlowRecords(
                            response, vRouters);
                    }
                };
                traceFlowGridColumns =
                    underlayUtils.getTraceFlowVMGridColumns();
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
            resultGrid._dataView.setData(cowu.getValueByJsonPath(response, 'data', []));
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
            underlayGraphModel = underlayUtils.getUnderlayGraphModel();
        if (formModel.traceflow_radiobtn_name() == 'vRouter') {
            customControls = [
                '<a class="widget-toolbar-icon"><i class="fa fa-forward"></i></a>',
                '<a class="widget-toolbar-icon"><i class="fa fa-backward"></i></a>',
            ];
            var selectedVrouter = formModel.vrouter_dropdown_name();
            if(selectedVrouter == "") {
                selectedVrouter =
                underlayGraphModel.getVirtualRouters()[0].attributes.name();
            }
            gridTitle = contrail.format("{0} ({1})",'Active flows of Virtual Router',
                selectedVrouter);
        } else {
            var selectedVM = formModel.instance_dropdown_name();
            if(selectedVM == "") {
              selectedVM = underlayGraphModel.getVirtualMachines()[0].attributes.name();
            }
            var vmDetails =
                underlayGraphModel.vmMap()[selectedVM];
            var name =
                getValueByJsonPath(vmDetails, 'more_attributes;vm_name', '-');
            if(name == '-')
                name = underlayGraphModel.getVirtualMachines()[0].attributes.name();
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
                + " div.grid-canvas div.slick-cell i.fa-spinner")
                .toggleClass('fa-cog fa-spinner fa-spin');
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
                },
                advanceControls: getHeaderActionConfig(formModel.traceflow_radiobtn_name())
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
                            var graphModel = underlayUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            resetLoadingIcon();
                            $(targetElement).toggleClass('fa-cog fa-spinner fa-spin');
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
                                        .toggleClass('fa-cog fa-spinner fa-spin');
                                }
                            });
                        }
                    },{
                        title:'Reverse TraceFlow',
                        iconClass: 'icon-contrail-reverse-flow',
                        onClick: function(rowId,targetElement){
                            var graphModel = underlayUtils.getUnderlayGraphModel();
                            graphModel.lastInteracted = new Date().getTime();
                            resetLoadingIcon();
                            $(targetElement).toggleClass('fa-cog fa-spinner fa-spin');
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
                                        .toggleClass('fa-cog fa-spinner fa-spin');
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
                        },
                        successCallback: function() {
                            $("#applyTraceFlowsFilter").click();
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

    function getHeaderActionConfig(selectedElement) {
        var headerActionConfig = [{
            "type": "link",
            "title": 'Show all flows',
            "linkElementId": "applyTraceFlowsFilter",
            "iconClass": "fa fa-filter disabled",
            "onClick": function () {
                var gridElId = '#'+ctwc.TRACEFLOW_RESULTS_GRID_ID;
                var applyFilter =
                    $("#applyTraceFlowsFilter").find('i').hasClass("disabled") ?
                        true : false;
                if(true == applyFilter) {
                    $("#applyTraceFlowsFilter").prop("title", "Show all flows");
                    $("#applyTraceFlowsFilter").find("i").css("color", "#000");
                } else {
                    $("#applyTraceFlowsFilter").prop("title", "Show filtered flows");
                    $("#applyTraceFlowsFilter").find("i").css("color", "#898989");
                }
                $(gridElId).data('contrailGrid')._dataView.setFilterArgs({
                    applyFilter: applyFilter,
                    selectedEntity: selectedElement
                });
                $(gridElId).data('contrailGrid')._dataView.
                    setFilter(flowsGridFilter);
                $("#applyTraceFlowsFilter").find('i').toggleClass("disabled");
            }
        }];
        return headerActionConfig;
    }

    function flowsGridFilter(item, args) {
        var applyFilter = args.applyFilter;
        if(applyFilter == false)
            return true;
        var selectedEntity = args.selectedEntity,
            excludeNetworks =
                ['__UNKNOWN__', 'default-domain:default-project:ip-fabric'],
            keysToCheck = ['sourceip', 'destip', 'vrouter_ip', 'other_vrouter_ip',
                'sourcevn', 'destvn'],
            srcVN = 'sourcevn',
            dstVN = 'destvn',
            allKeysExists = true;
            if (selectedEntity == 'vRouter') {
                keysToCheck =
                    ['sip', 'dip','peer_vrouter', 'src_vn', 'dst_vn'];
                srcVN = 'src_vn', dstVN = 'dst_vn';
            }
            keysToCheckLen = keysToCheck.length;
            for (var i = 0; i < keysToCheckLen; i++) {
                if (_.result(item, keysToCheck[i]) == null) {
                    allKeysExists = false;
                    break;
                }
            }
            if (allKeysExists &&
                excludeNetworks.indexOf(item[srcVN]) == -1 &&
                excludeNetworks.indexOf(item[dstVN]) == -1) {
                return true;
            } else {
                return false;
            }
    };

    function getSelectedVrouterDetails (traceFlowFormModel) {
        var graphModel = $("#"+ctwl.UNDERLAY_GRAPH_ID).data('graphModel');
        var vRouterMap = graphModel.vRouterMap();
        var vRouterData =
            ifNull(vRouterMap[traceFlowFormModel.vrouter_dropdown_name()], {});
        if(JSON.stringify(vRouterData) == "{}" &&
            JSON.stringify(vRouterMap) != "{}" ) {
            vRouterData = vRouterMap[Object.keys(vRouterMap)[0]];
        }
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
        var graphModel = underlayUtils.getUnderlayGraphModel();
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
        updateTraceFlowParams (dataItem, postData, nwFqName);
        if (postData['vrfId'] != null || postData['vrfName'] != null) {
            doTraceFlowRequest(postData, graphModel, deferredObj);
        } else {
            getVRFListForVN(nwFqName, postData, graphModel, deferredObj);
        }
    }

    function doReverseTraceFlow (rowId, formModel, deferredObj) {
        var flowGrid =
            $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID).data('contrailGrid');
        var graphModel = underlayUtils.getUnderlayGraphModel();
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
        updateTraceFlowParams (dataItem, postData, nwFqName);
        if(postData['vrfId'] != null || postData['vrfName'] != null) {
            doTraceFlowRequest(postData, graphModel, deferredObj);
        } else {
            getVRFListForVN(nwFqName, postData, graphModel, deferredObj);
        }
    }
    // Checks the source VRF and dest VRF are same and source VN
    // and Dest VN are different then based on the direction either source or dest vn
    // is used to construct the VRF name which is hack because of bug in vrouter
    // https://bugs.launchpad.net/juniperopenstack/+bug/1541794
    function updateTraceFlowParams (dataItem, postData, nwFqName) {
        var vrfName = null;
        if (dataItem['raw_json'] != null && dataItem['raw_json']['vrf'] != null &&
           dataItem['raw_json']['dest_vrf'] != null &&
           dataItem['src_vn'] != null && dataItem['dst_vn'] != null &&
           dataItem['raw_json']['vrf'] == dataItem['raw_json']['dest_vrf'] &&
           dataItem['src_vn'] != dataItem['dst_vn'] && nwFqName != null) {
            vrfName = nwFqName + ':' + nwFqName.split(":")[2]
            postData['vrfName'] = vrfName;
            delete postData['vrfId'];
        } else if (dataItem['raw_json'] != null && dataItem['raw_json']['vrf'] != null &&
                dataItem['raw_json']['dest_vrf'] != null &&
                dataItem['src_vn'] != null && dataItem['dst_vn'] != null &&
                dataItem['raw_json']['vrf'] != dataItem['raw_json']['dest_vrf'] &&
                dataItem['src_vn'] == dataItem['dst_vn'] && nwFqName != null) {
            vrfName = nwFqName + ':' + nwFqName.split(":")[2]
            postData['vrfName'] = vrfName;
            delete postData['vrfId'];
        }
        // When we associate floating IP of VN2 to VM1(belongs to VN1) and do a ping from
        // VM1 to a VM in VN2 we see the src and dest n/w's are VN2 and srcIP will be
        // original(interface IP of VM) which belongs to VN1 for which trace flow fails.
        // Hence we are updating the src/dest IP with floating IP based on direction. 
        if (dataItem['raw_json'] != null && dataItem['src_vn'] != null &&
            dataItem['dst_vn'] != null && dataItem['src_vn'] == dataItem['dst_vn']
            && dataItem['raw_json']['fip'] != null &&
            dataItem['raw_json']['fip'] != '0.0.0.0' &&
            dataItem['peer_vrouter'] != postData['resolveVrfId']) {
            if ((dataItem['direction'] == 'ingress' && postData['action'] == 'Trace Flow') ||
                 (dataItem['direction'] == 'egress' && postData['action'] == 'Reverse Trace Flow')) {
                postData['srcIP'] = dataItem['raw_json']['fip'];
            } else if ((dataItem['direction'] == 'ingress' && postData['action'] == 'Reverse Trace Flow') ||
                    (dataItem['direction'] == 'egress' && postData['action'] == 'Trace Flow')) {
                postData['destIP'] = dataItem['raw_json']['fip'];
            }
        }
        return postData;
    }
    /*
     * Fetches this VRF list of the give VN from the config server
     */
    function getVRFListForVN (nwFqName, postData, graphModel, deferredObj) {
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
                graphModel.underlayPathReqObj(postData);
                graphModel.flowPath().model().set({
                    'nodes': ifNull(response['nodes'], []),
                    'edges': ifNull(response['links'], [])
                },{silent: true});
                graphModel.flowPath().model().trigger('change:nodes');
                if (ifNull(response['nodes'], []).length == 0 ||
                    ifNull(response['links'], []).length == 0) {
                } else {
                    /*underlayUtils.addUnderlayFlowInfoToBreadCrumb({
                        action: postData['action'],
                        sourceip: postData['srcIP'],
                        destip: postData['destIP'],
                        sport: postData['srcPort'],
                        dport: postData['destPort']
                    });*/
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
            var statusMsg = "";
            if(status == 'timeout') {
                statusMsg = "Timeout";
                //showInfoWindow('Timeout in fetching details','Error');
            } else if (status != 'success') {
                statusMsg = "Error";
                //showInfoWindow('Error in fetching details','Error');
            }
            showInfoWindow(
                statusMsg + " in tracing flow from [" +
                postData.srcIP + "]:" + postData.srcPort +
                " to [" + postData.destIP + "]:" +
                postData.destPort, statusMsg);
        }).always(function () {
            if(deferredObj != null) {
                deferredObj.resolve(true);
            }
        });
    }
    return TraceFlowResultView;
});
