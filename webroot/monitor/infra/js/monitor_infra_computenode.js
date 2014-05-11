/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

computeNodesView = function () {
    var computeNodesGrid,vRoutersData = [];
    var vRouterDataWithStatusInfo = [];
    var filteredNodeNames = [];
    var vRouterCF;
    updateCrossFilters = true;
    var dimensions = [],filterDimension;
    var self = this;
    var vRoutersResult = null;
    var vRoutersDataSource = null;
    var vRouterDeferredObj = null;
    var shouldRefresh = true;
    this.getvRouterCF = function() {
        return vRouterCF;
    }
    this.getvRoutersData = function() {
        return vRoutersData;
    }
    this.setvRoutersData = function(data) {
        vRoutersData = data;
    }
    this.getvRoutersDataWithStatus = function() {
        return vRouterDataWithStatusInfo;
    }
    this.setvRoutersDataWithStatus = function(data) {
        vRouterDataWithStatusInfo = data;
    }
    this.getCFDimensions = function() {
        return dimensions;
    }
    this.load = function (obj) {
        populateComputeNodes();
        layoutHandler.setURLHashParams({node:'vRouters'},{merge:false,triggerHashChange:false});
    }
    this.destroy = function () {
        //contView.destroy();
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }
    
    
    function updateView() {
        //Update the grid
        var selectedData = filterDimension.top(Infinity);
        var selectedDataWithStatus = [];
        filteredNodeNames = [];
        $.each(selectedData,function(idx,obj){
          filteredNodeNames.push(obj['name']);
        });
        computeNodesGrid = $('#divcomputesgrid').data('contrailGrid');
        computeNodesGrid._dataView.setFilterArgs({
            filteredNodeNames:filteredNodeNames
        });
        //Don't update crossfilters as updateView is triggered on change of crossfilter selection
        updateCrossFilters = false;
        computeNodesGrid._dataView.setFilter(function(item,args) {
            if($.inArray(item['name'],args['filteredNodeNames']) > -1)
                return true;
            return false;
        });
    }
    
    this.updateCrossFilter = function(vRouterData){
         $('.chart > svg').remove();
        //Start updating the crossfilter
        vRouterCF = crossfilter(vRouterData);
        var intfDimension = vRouterCF.dimension(function(d) { return d.intfCnt;});
        var instDimension = vRouterCF.dimension(function(d) { return d.instCnt;});
        var vnDimension = vRouterCF.dimension(function(d) { return d.vnCnt;});
        dimensions.push(intfDimension,instDimension,vnDimension);
        filterDimension = vRouterCF.dimension(function(d) { return d.intfCnt;});
        //Set crossfilter bucket count based on number of max VNs/interfaces/instances on a vRouter
        var vnCnt = 24;
        var intfCnt = 24;
        var instCnt = 24;
        //Max bar value across all 3 cross-filter charts
        var vnMaxValue=0,instMaxValue=0,intfMaxValue=0;
        if(vnDimension.top(1).length > 0) {
            vnCnt = Math.max(vnCnt,d3.max(vnDimension.group().all(),function(d) { return d['key'] }));
            vnMaxValue = d3.max(vnDimension.group().all(),function(d) { return d['value'] });
        }
        if(instDimension.top(1).length > 0) {
            instCnt = Math.max(instCnt,d3.max(instDimension.group().all(),function(d) { return d['key'] })); 
            instMaxValue = d3.max(instDimension.group().all(),function(d) { return d['value'] }); 
        }
        if(intfDimension.top(1).length > 0) {
            intfCnt = Math.max(intfCnt,d3.max(intfDimension.group().all(),function(d) { return d['key'] })); 
            intfMaxValue = d3.max(intfDimension.group().all(),function(d) { return d['value'] }); 
        }
        var maxBarValue = Math.max(vnMaxValue,instMaxValue,intfMaxValue);
    
        //Initialize CrossFilter Charts
        charts = [
            barChart()
                .dimension(vnDimension)
                .group(vnDimension.group(Math.floor))
                .toolTip(true)
              .x(d3.scale.linear()
                .domain([0, vnCnt+(vnCnt/24)])
                .rangeRound([0, 10 * 26])) //Width
              .y(d3.scale.linear()
                .domain([0,maxBarValue])
                .range([50,0])),
    
            barChart()
                .dimension(instDimension)
                .group(instDimension.group())
                .toolTip(false)
              .x(d3.scale.linear()
                .domain([0, instCnt+(instCnt/24)])
                .rangeRound([0, 10 * 26]))
              .y(d3.scale.linear()
                .domain([0,maxBarValue])
                .range([50,0])),
    
            barChart()
                .dimension(intfDimension)
                .group(intfDimension.group())
                .toolTip(false)
              .x(d3.scale.linear()
                .domain([0, intfCnt+(intfCnt/24)])
                .rangeRound([0, 10 * 26]))
              .y(d3.scale.linear()
                .domain([0,maxBarValue])
                .range([50,0]))
            ];
         
          chart = d3.selectAll(".chart")
              .data(charts)
              .each(function(currChart) { currChart.on("brush", function() {
                  logMessage('bgpMonitor',filterDimension.top(10));
                  updateView();
                  renderAll(chart);
              }).on("brushend", function() { 
                  updateView();
                  renderAll(chart);
              }); 
          });
          renderAll(chart);
          //Add reset listener
          $('.reset').unbind('click');
          $('.reset').bind('click',function() {
              var idx = $(this).closest('.chart').index();
              charts[idx].filter(null);
              renderAll(chart);
              updateView();
          });
          //End update to crossfilter
     }//updateCrossFilter
    
    function populateComputeNodes() {
        summaryChartsInitializationStatus['vRouters'] = false;
        infraMonitorUtils.clearTimers();
        var compNodesTemplate = contrail.getTemplate4Id("computenodes-template");
        $(pageContainer).html(compNodesTemplate({}));
        //Initialize widget header
        $('#vrouter-header').initWidgetHeader({title:'vRouters',widgetBoxId:'recent'});
        //Create the managedDS
        var vRouterDS = new SingleDataSource('computeNodeDS');
        vRoutersResult = vRouterDS.getDataSourceObj();
        vRoutersDataSource = vRoutersResult['dataSource'];
        vRouterDeferredObj = vRoutersResult['deferredObj'];//gives the deferred object from managed datasource
       
        $(vRouterDS).on('change',function() {
            var filteredNodes = [];
            for(var i=0;i<vRoutersDataSource.getLength();i++) {
                filteredNodes.push(vRoutersDataSource.getItem(i));
            }
            updateChartsForSummary(filteredNodes,'compute');
            if(updateCrossFilters == true) 
                cmpNodesView.updateCrossFilter(filteredNodes);
            else
                updateCrossFilters = true;

            //ToDo: Need to see issue with sparkLine update
            //updateCpuSparkLines(computeNodesGrid,localDS.data());
        });

        $('#divcomputesgrid').contrailGrid({
            header : {
                title : {
                    text : 'Virtual Routers',
                    cssClass : 'blue',
                },
                customControls: []
            },
            body: {
                options: {
                    autoHeight : true,
                    enableAsyncPostRender:true,
                    forceFitColumns:true,
                    lazyLoading:true
                },
                dataSource: {
                    dataView: vRoutersDataSource
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Virtual Routers..',
                     },
                     empty: {
                         text: 'No Virtual Routers to display'
                     }, 
                     errorGettingData: {
                         type: 'error',
                         iconClasses: 'icon-warning',
                         text: 'Error in getting Data.'
                     }
                 }
            },
             footer : {
                 pager : {
                     options : {
                         pageSize : 50,
                         pageSizeSelect : [10, 50, 100, 200, 500 ]
                     }
                 }
             },
            columnHeader: {
                columns:[
                    {
                        field:"name",
                        name:"Host name",
                        minWidth:110,
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
                              onComputeNodeChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                    },
                    {
                        field:"ip",
                        name:"IP Address",
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
                        minWidth:110
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:110
                    },
                    {
                        field:"status",
                        name:"Status",
                        formatter: function(r,c,v,cd,dc) {
                            return getNodeStatusContentForSummayPages(dc,'html');
                        },
                        searchFn: function(d) {
                            return getNodeStatusContentForSummayPages(dc,'text');
                        },
                        minWidth:150
                    },
                    {
                        field:"cpu",
                        name:"CPU (%)",
                        minWidth:150,
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">'  + dc['cpu'] +  '</span>'
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn:function(d){
                            return d['cpu'];
                        }
                    },
                    {
                        field:"memory",
                        name:"Memory",
                        minWidth:110
                    },
                    {
                        field:"vnCnt",
                        name:"Networks",
                        minWidth:100
                    },
                    {
                        field:"instCnt",
                        name:"Instances",
                        minWidth:100
                    },
                    {
                        field:"intfCnt",
                        name:"Interfaces",
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total{1}",dc['intfCnt'],dc['errorIntfCntText']);
                        },
                        minWidth:150
                    },
                ],
            }
        });
        computeNodesGrid = $('#divcomputesgrid').data('contrailGrid');

        vRouterDeferredObj.done(function() {
           computeNodesGrid.removeGridLoading();
        });
        vRouterDeferredObj.fail(function() {
           computeNodesGrid.showGridMessage('errorGettingData');
        });
        if(vRoutersResult['lastUpdated'] != null && (vRoutersResult['error'] == null || vRoutersResult['error']['errTxt'] == 'abort')){
            triggerDatasourceEvents(vRouterDS);
        } else {
            computeNodesGrid.showGridMessage('loading');
        }
        $(vRouterDS).on('change',function() {
            var infoElem = $('#vrouter-header h4');
            var innerText = infoElem.text().split('(')[0].trim();
            var totalCnt = vRoutersDataSource.getItems().length;
            var filteredCnt = vRoutersDataSource.getLength();
            //totalCnt = ifNull(options['totalCntFn'](), totalCnt);
            if (totalCnt == filteredCnt)
                innerText += ' (' + totalCnt + ')';
            else
                innerText += ' (' + filteredCnt + ' of ' + totalCnt + ')';
            infoElem.text(innerText);
        });
        /*
        applyGridDefHandlers(computeNodesGrid, {noMsg:'No vRouters to display',
            selector:$('#vrouter-header h4'),
            totalCntFn: function() { 
                return self.getvRoutersDataWithStatus().length;
            },
            dataView:vRoutersDataSource
        });*/
    }
}

function onComputeNodeChange(dc) {
    cmpNodeView.load({name:dc['name'], ip:dc['ip'], uuid:dc['uuid']});
}

computeNodeView = function () {
    var intfGrid, vnGrid, aclGrid, flowGrid, computeNodeInfo,computeNodeData;
    var computeNodeTabStrip = "compute_tabstrip";
    var self = this;
    var cmptNodeDetailsData;
    this.getCmptNodeDetailsData = function(){
        return cmptNodeDetailsData; 
    }
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        computeNodeInfo = obj;
        if(computeNodeInfo == null || computeNodeInfo.ip ==  null ||  computeNodeInfo.ip == ''){
            //issue details call and populate ip
            var computeNodeDeferredObj = $.Deferred();
            self.getComputeNodeDetails(computeNodeDeferredObj,computeNodeInfo);
            computeNodeDeferredObj.done(function(data) {
                try{
                    //If IP address is not available in UVE,pick it from ConfigData
                    computeNodeInfo['ip'] = ifNull(getValueByJsonPath(data,'VrouterAgent;self_ip_list;0'),data['ConfigData']['virtual-router']['virtual_router_ip_address']);
                }catch(e){}
                self.populateComputeNode(computeNodeInfo);
            });
        } else {
            self.populateComputeNode(computeNodeInfo);
        }
    }

    this.destroy = function () {
        //contView.destroy();
    }
    
    this.getComputeNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['VROUTER_DETAILS'] , obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.parseInterfaceData = function(response) {
        var retArray = [];
        var sandeshData = jsonPath(response,'$..ItfSandeshData');
        var sdata = [];
        if(sandeshData != null){
            $.each(sandeshData,function(idx,obj){
                if(!(obj instanceof Array)){
                    sdata = sdata.concat([obj]);
                } else {
                    sdata = sdata.concat(obj)
                }
            });
            
            $.each(sdata, function (idx, obj) {
                var rawJson = obj;
                obj['vn_name'] = ifNullOrEmptyObject(obj['vn_name'],noDataStr);
                obj['vm_uuid'] = ifNullOrEmptyObject(obj['vm_uuid'],noDataStr);
                obj['vm_name'] = ifNullOrEmptyObject(obj['vm_name'],noDataStr);
                
                var parts = obj['vn_name'].split(":"), dispVNName=obj['vn_name'];
                if(parts.length == 3){ 
                    if(parts[2] != null) {dispVNName = parts[2];}
                    if(parts[1] != null) {dispVNName += " ("+parts[1]+")";}
                } 
                var dispVMName = obj['vm_uuid'] + ' / ' + obj['vm_name'];
                if(obj['type'] == "vport"){
                    if(obj.fip_list != null) {
                        var fipList = [];
                        try{
                            fipList = jsonPath(obj,"$..FloatingIpSandeshList")[0];
                        }catch(e){}
                        obj['disp_fip_list'] = floatingIPCellTemplate(fipList);
                    }
                    retArray.push({uuid:obj['uuid'],name:obj['name'],label:obj['label'],active:obj['active'],
                        vn_name:obj['vn_name'],disp_vn_name:dispVNName,vm_uuid:obj['vm_uuid'],
                        vm_name:obj['vm_name'],disp_vm_name:dispVMName,ip_addr:obj['ip_addr'],
                        disp_fip_list:obj['disp_fip_list'],raw_json:rawJson});
                }
            });
        }
        return retArray;
    }
    this.parseVNData = function(response){
        var data = jsonPath(response,'$..VnSandeshData')[0];
        var ret = [];
        if(data != null){
            if(!(data instanceof Array)){
                data = [data];
            }
            $.each(data, function (idx, obj) {
                var rawJson = obj, acl = noDataStr, vrf = noDataStr;
                if(!$.isEmptyObject(obj['acl_uuid'])){
                    acl = obj['acl_uuid'];
                }
                if(!$.isEmptyObject(obj['vrf_name'])){
                    vrf = obj['vrf_name'];
                }
                ret.push({
                    acl_uuid:acl,
                    vrf_name:vrf,
                    name:obj['name'],
                    raw_json:rawJson
                });
            });
            return ret;
        }
        else {
            return [];
        }
    }
    this.parseACLData = function(response){

        var retArr = [];
        response = jsonPath(response,"$..AclSandeshData")[0];
        //Loop through ACLs
        if(response != null){
            if(!(response instanceof Array)) {
                response = [response];
            } 
            for (var i = 0; i < response.length; i++) {
                var currACL = [];
                try{
                    currACL = jsonPath(response[i],"$..AclEntrySandeshData")[0];
                } catch (e) {
                }
                //Loop through ACEs
                if(!(currACL instanceof Array)) {
                    currACL = [currACL];
                } 
                for (var j = 0; j < currACL.length; j++) {
                    var currACE = currACL[j];
                        var dispuuid = uuid = response[i]['uuid'];
                        var flowCnt = response[i]['flow_count'];
                        if(flowCnt == null){
                            flowCnt = 0;
                        }
                        if(j > 0) {
                            dispuuid = '';
                            flowCnt = '';
                        }
                        var protoRange = srcPortRange = dstPortRange = actionVal = srcVn = destVn = aceid = srcType = dstType = srcSgId = dstSgId = noDataStr;
                        try{
                            protoRange = jsonPath(currACE,"$.proto_l.list.SandeshRange.min")[0] + " - " + jsonPath(currACE,"$.proto_l.list.SandeshRange.max")[0];
                        } catch(e){}
                        try{
                            srcPortRange = jsonPath(currACE,"$.src_port_l.list.SandeshRange.min")[0] + " - " + jsonPath(currACE,"$.src_port_l.list.SandeshRange.max")[0];
                        }catch(e){}
                        try{
                            dstPortRange = jsonPath(currACE,"$.dst_port_l.list.SandeshRange.min")[0] + " - " + jsonPath(currACE,"$.dst_port_l.list.SandeshRange.max")[0];
                        }catch(e){}
                        try{
                            actionVal = jsonPath(currACE,"$.action_l.list.ActionStr.action")[0];
                        }catch(e){}
                        try{
                            srcType = jsonPath(currACE,"$.src_type")[0];
                        }catch(e){}
                        try{
                            dstType = jsonPath(currACE,"$.dst_type")[0];
                        }catch(e){}
                        try{
                            srcVn = ifNullOrEmptyObject(jsonPath(currACE,"$.src")[0],noDataStr);
                            if(srcType == 'sg'){
                                srcSgId = srcVn;
                                srcVn = noDataStr;
                            } else {
                                var srcVnParts = srcVn.split(' ');
                                if(srcVnParts.length > 1){
                                    srcVn = '';
                                    $.each(srcVnParts,function(i,part){
                                        if(i != 0){
                                            srcVn = srcVn + ' / ' + part;
                                        } else {
                                            srcVn = part;
                                        }
                                    });
                                }
                            }
                        }catch(e){}
                        try{
                            destVn = ifNullOrEmptyObject(jsonPath(currACE,"$.dst")[0],noDataStr);
                            if(dstType == 'sg'){
                                dstSgId = destVn;
                                destVn = noDataStr;
                            } else {
                                var dstVnParts = destVn.split(' ');
                                if(dstVnParts.length > 1){
                                    destVn = '';
                                    $.each(dstVnParts,function(i,part){
                                        if(i != 0){
                                            destVn = destVn + ' / ' + part;
                                        } else {
                                            destVn = part;
                                        }
                                    });
                                }
                            }
                        }catch(e){}
                        try{
                            aceid = ifNull(currACE['ace_id'],noDataStr);
                        }catch(e){}
                        retArr.push({uuid:uuid,
                            dispuuid:dispuuid,
                            dst_vn:destVn,
                            src_vn:srcVn, 
                            srcSgId:srcSgId,
                            dstSgId:dstSgId,
                            srcType:srcType,
                            dstType:dstType,
                            flow_count:flowCnt,
                            aceId:aceid, 
                            proto:protoRange,
                            src_port:srcPortRange, 
                            dst_port:dstPortRange,
                            ace_action:actionVal,
                            raw_json:response[i]});
                }
            }
           /* TODO for context switching if(selectedAcl != null){
                comboAcl.select(function(dataItem) {
                    return dataItem.text === selectedAcl;
                });
            } else {
                onAclSelect();
            } */
        }
        return retArr;
    
    }
    this.parseFlowsData = function(response){

        var origResponse = response;
        var isFromACLFlows = false;
        var ret = [];
        response = jsonPath(origResponse,"$..SandeshFlowData")[0];
        if (response == null){
            isFromACLFlows = true;
            response = jsonPath(origResponse,"$..FlowSandeshData")[0];
        }
        var flowKey = jsonPath(origResponse,"$..flow_key")[0];
        var iterationKey = jsonPath(origResponse,"$..iteration_key")[0];
       // var retArr = [];
       /* for (var i = 0; i < response.length; i++) {
            var currACL = response[i];
            for (var j = 0; j < currACL['flowData'].length; j++) {
                var currFlow = currACL['flowData'][j];
                var aclUuid = currACL['acl_uuid'];
                retArr.push($.extend(currFlow, {acl_uuid:aclUuid}));
            }
        }*/
        if( response != null ){
            if(!(response instanceof Array)){
                response = [response];
            }
            if(isFromACLFlows) {
                $.each(response,function(idx,obj) {
                    var rawJson = obj;
                    ret.push({src_vn:ifNullOrEmptyObject(obj['src_vn'],noDataStr),
                        dst_vn:ifNullOrEmptyObject(obj['dst_vn'],noDataStr),
                        sip:ifNullOrEmptyObject(obj['sip'],noDataStr),
                        protocol:ifNullOrEmptyObject(obj['protocol'],noDataStr),
                        dip:ifNullOrEmptyObject(obj['dst'],noDataStr),
                        stats_bytes:ifNullOrEmptyObject(obj['bytes'],noDataStr),
                        stats_packets:ifNullOrEmptyObject(obj['packets'],noDataStr),
                        raw_json:rawJson});
                });
            }
            $.each(response,function(idx,obj) {
                var rawJson = obj;
                ret.push({src_vn:ifNullOrEmptyObject(obj['src_vn'],noDataStr),
                        dst_vn:ifNullOrEmptyObject(obj['dst_vn'],noDataStr),
                        protocol:ifNullOrEmptyObject(obj['protocol'],noDataStr),
                        sip:ifNullOrEmptyObject(obj['sip'],noDataStr),
                        src_port:ifNullOrEmptyObject(obj['src_port'],noDataStr),
                        dip:ifNullOrEmptyObject(obj['dip'],noDataStr),
                        dst_port:ifNullOrEmptyObject(obj['dst_port'],noDataStr),
                        setup_time_utc:ifNullOrEmptyObject(obj['setup_time_utc'],noDataStr),
                        stats_bytes:ifNullOrEmptyObject(obj['stats_bytes'],noDataStr),
                        stats_packets:ifNullOrEmptyObject(obj['stats_packets'],noDataStr),
                        raw_json:rawJson});
            });
        }
        //Push the flowKey to the stack for Next use
        if(flowKey != null && !$.isEmptyObject(flowKey)){
            //Had to add this hack because sometimes we get into to this parse function twice leading this to be added twice to the stack
            if(flowKey != "0:0:0:0:0.0.0.0:0.0.0.0" && flowKeyStack[flowKeyStack.length - 1] != flowKey) 
                flowKeyStack.push(flowKey);
        }
        //Push the aclIterKey to the stack for Next use
        if(iterationKey != null && !$.isEmptyObject(iterationKey)){
            //Had to add this hack because sometimes we get into to this parse function twice leading this to be added twice to the stack
            if(iterationKey.indexOf('0:0:0:0:0.0.0.0:0.0.0.0') == -1 && aclIterKeyStack[aclIterKeyStack.length - 1] != iterationKey)
                aclIterKeyStack.push(iterationKey);
        }
        //$('#flowCnt').text(response.flowData.length);
        return ret;
    
    }
    
    this.parseUnicastRoutesData = function(response){

        var ucastPaths = jsonPath(response,'$..PathSandeshData');
        var paths = [];
        var uPaths = [];
        ucastPaths = $.each(ucastPaths,function(idx,obj) {
            if(obj instanceof Array) {
                uPaths.push(obj);
            } else {
                uPaths.push([obj]);
            }
        });
        var srcIPs = jsonPath(response,'$..src_ip');
        var srcPrefixLens = jsonPath(response,'$..src_plen');
        var srcVRFs = jsonPath(response,'$..src_vrf');

        $.each(uPaths,function(idx,obj) {
            $.each(obj,function(i,currPath) {
                var rawJson = currPath;
                if(i == 0)
                    paths.push({dispPrefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});
                else
                    paths.push({dispPrefix:'',path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});

            });
        });
       /* paths = $.map(paths,function(obj,idx) {
            if(obj['path']['nh']['NhSandeshData']['type'] == 'Composite')
                return null;
            else
                return obj;
        });*/
        //console.info(paths);
        return paths;
    
    }
    
    this.parseMulticastRoutesData = function(response){

        var ucastPaths = jsonPath(response,'$..RouteMcSandeshData');
        var paths = [];
        var uPaths = [];
        ucastPaths = $.each(ucastPaths,function(idx,obj) {
            if(obj instanceof Array) {
                uPaths.push(obj);
            } else {
                uPaths.push([obj]);
            }
        });
        var srcIPs = jsonPath(response,'$..src');
        var srcPrefixLens = jsonPath(response,'$..grp');

        $.each(uPaths,function(idx,obj) {
            $.each(obj,function(i,currPath) {
                var rawJson = currPath;
                if(i == 0)
                    paths.push({dispPrefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],raw_json:rawJson});
                else
                    paths.push({dispPrefix:'',path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],raw_json:rawJson});

            });
        });
       /* TODO i am not ignoring the composite paths for the multicast 
        * paths = $.map(paths,function(obj,idx) {
            if(obj['path']['nh']['NhSandeshData']['type'] == 'Composite')
                return null;
            else
                return obj;
        }); */
        //console.info(paths);
        return paths;
    
    }
    this.parseL2RoutesData = function(response){

        var ucastPaths = jsonPath(response,'$..PathSandeshData');
        var paths = [];
        var uPaths = [];
        ucastPaths = $.each(ucastPaths,function(idx,obj) {
            if(obj instanceof Array) {
                uPaths.push(obj);
            } else {
                uPaths.push([obj]);
            }
        });
        var macs = jsonPath(response,'$..mac');
        var srcVRFs = jsonPath(response,'$..src_vrf');

        $.each(uPaths,function(idx,obj) {
            $.each(obj,function(i,currPath) {
                var rawJson = currPath;
                if(i == 0)
                    paths.push({mac:macs[idx],path:currPath,src_vrf:srcVRFs[idx],raw_json:rawJson});
                else
                    paths.push({mac:'',path:currPath,src_vrf:srcVRFs[idx],raw_json:rawJson});

            });
        });
        return paths;
    
    }
    function populateInterfaceTab(obj) {
        //Push only tab & node parameter in URL
        layoutHandler.setURLHashParams({tab:'interfaces',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        
        if (!isGridInitialized('#gridComputeInterfaces')) {
            $('#gridComputeInterfaces').contrailGrid({
                header : {
                    title : {
                        text : 'Interfaces',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    },
                },
                columnHeader: {
                   columns:[
                       {
                           field:"name",
                           name:"Name",
                           minWidth:125
                       },
                       {
                           field:"label",
                           name:"Label",
                           minWidth:50
                       },
                       {
                           field:"active",
                           name:"Status",
                           minWidth:50,
                           //template:cellTemplate({cellText:'#= (active == "Active")? "Up": "Down"#', tooltip:false}),
                           formatter: function(r,c,v,cd,dc) {
                              if(dc['active'] == 'Active')
                                 return 'Up';
                              else
                                 return 'Down'
                           },
                           searchFn:function(d){
                               var status = 'Down';
                               if(d['active'] == 'Active')
                                   status = 'Up';
                               return status;
                           }
                       },
                       {
                           field:"disp_vn_name",
                           name:"Network",
                           cssClass: 'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("networks", computeNodeTabs);
                                   selectTab(computeNodeTabStrip,tabIdx);
                               }
                            },
                           minWidth:120
                       },
                       {
                           field:"ip_addr",
                           name:"IP Address",
                           minWidth:100
                       },
                       {
                           field:"disp_fip_list",
                           name:"Floating IP",
                           //Need to check the scope of template javascript functions
                           //template:cellTemplate({cellText:'#= disp_fip_list#', tooltip:true})
                           formatter:function(r,c,v,cd,dc) {
                              return cellTemplateLinks({cellText:'disp_fip_list'});
                           },
                           minWidth:100
                       },
                       {
                           field:"disp_vm_name",
                           name:"Instance",
                           cssClass: 'cell-hyperlink-blue',
                           //template:cellTemplate({cellText:'#= disp_vm_name #', name:'instance', tooltip:true}),
                           formatter:function(r,c,v,cd,dc) {
                              return cellTemplateLinks({cellText:'disp_vm_name',name:'name',rowData:dc});
                           },
                           events: {
                              onClick: function(e,dc) {
                                 layoutHandler.setURLHashParams({vmName:dc['vm_name'],fqName:dc['vm_uuid'],srcVN:dc['vn_name']},{p:'mon_net_instances',merge:false,triggerHashChange:true});
                              }
                           },
                           minWidth:200
                       }
                   ],
                },
                body: {
                   options: {
                      forceFitColumns: true,
                      detail: {
                         template: $('#gridsTemplateJSONDetails').html()
                      },
                      actionCell: [
                                   {
                                       title: 'Start Packet Capture',
                                       //iconClass: 'icon-cog',
                                       onClick: function(rowIndex){
                                           var rowData = intfGrid._dataView.getItem(rowIndex);
                                           startPacketCapture4Interface(rowData['uuid'],rowData['vn_name'],rowData['vm_name']);
                                       }
                                   }
                               ]
                   },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: contrail.format(monitorInfraUrls['VROUTER_SUMMARY'], getIPOrHostName(computeNodeInfo)),
                                type: 'GET'
                            },
                            dataParser: self.parseInterfaceData
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Interfaces..',
                        },
                        empty: {
                            text: 'No Interfaces to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                }
                //change:onIntfChange,
            })
            intfGrid = $('#gridComputeInterfaces').data('contrailGrid');
            intfGrid.showGridMessage('loading');
            //applyGridDefHandlers(intfGrid, {noMsg:'No interfaces to display'});
        } else {
            reloadGrid(intfGrid);
        }
    }
    function populateVNTab(obj) {

        if (obj == null)
            obj = computeNodeInfo;
        layoutHandler.setURLHashParams({tab:'networks',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        if (!isGridInitialized('#gridComputeVN')) {
            $("#gridComputeVN").contrailGrid({
                header : {
                    title : {
                        text : 'Networks',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    },
                },
                columnHeader : {
                    columns:[
                             {
                                 field:"name",
                                 id:"name",
                                 name:"Name"
                             },
                             {
                                 field:"acl_uuid",
                                 id:"acl",
                                 name:"ACLs",
                                 cssClass: 'cell-hyperlink-blue',
                                 events: {
                                     onClick: function(e,dc){
                                         var tabIdx = $.inArray("acl", computeNodeTabs);
                                         selectTab(computeNodeTabStrip,tabIdx);
                                     }
                                  }
                             },
                             {
                                 field:"vrf_name",
                                 id:"vrf",
                                 name:"VRF",
                                 cssClass: 'cell-hyperlink-blue',
                                 events: {
                                     onClick: function(e,dc){
                                         var tabIdx = $.inArray("routes", computeNodeTabs);
                                         selectTab(computeNodeTabStrip,tabIdx);
                                     }
                                  }
                             }
                         ],
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        },
                        actionCell: [
                             {
                                 title: 'Configure',
                                 iconClass: 'icon-cog',
                                 onClick: function(rowIndex){
                                     var rowData = vnGrid._dataView.getItem(rowIndex);
                                     //window.location.href = "/tenants/monitor/network\\#p=config_net_vn&q=";
                                     layoutHandler.setURLHashParams({},{p:'config_net_vn',merge:false});
                                 }
                             },
                             {
                                 title: 'Monitor',
                                 iconClass: 'icon-tasks',
                                 onClick: function(rowIndex){
                                     var rowData = vnGrid._dataView.getItem(rowIndex);
                                     //window.location.href = "/tenants/monitor/network\\#p=mon_net_networks&q[fqName]=" + rowData['name'];
                                     layoutHandler.setURLHashParams({fqnName:rowData['name']},{p:'mon_net_networks',merge:false});
                                 }
                             },
                             {
                                 title: 'View Object Logs',
                                 iconClass: 'icon-list-alt',
                                 onClick: function(rowIndex){
                                     var rowData = vnGrid._dataView.getItem(rowIndex);
                                     showObjLog(rowData['name'],'vn');
                                 }
                             }
                         ]
                    },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: contrail.format(monitorInfraUrls['VROUTER_NETWORKS'], getIPOrHostName(computeNodeInfo)),
                                //timeout: timeout,
                                type: 'GET'
                            },
                            dataParser: self.parseVNData
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Networks..',
                        },
                        empty: {
                            text: 'No Networks to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                }
            });
            vnGrid = $('#gridComputeVN').data('contrailGrid');
            vnGrid.showGridMessage('loading');
        } else {
            reloadGrid(vnGrid);
        }
        function onVNChange() {
            var name;
            if (name = isCellSelectable(this.select())) {
                if (name == 'acl') {
                    var tabIdx = 4;
                    computeNodeTabStrip.select(tabIdx);
                    /* TODO add this to do context switching var dataItem = this.dataItem(this.select()[0].parentNode);
                    var filters = dataItem.vrf;
                    layoutHandler.setURLHashParams({tab:'acl', ip:computeNodeInfo['ip'],node:''vRouters:' ' + obj['name'], filters:filters});
                    */
                } else if (name == 'vrf') {
                    //var obj = computeNodeInfo;
                    //ctrlNodeView.load({ip:obj['ip'], name:'Control Nodes:' + obj['name'], tab:'routes'});
                    //commenting out so that the filter happens for routes
                    //var tabIdx = 6;
                    //computeNodeTabStrip.select(tabIdx);
                    var dataItem = this.dataItem(this.select()[0].parentNode);
                    var filters = dataItem.vrf;
                    layoutHandler.setURLHashParams({tab:'routes',node:'vRouters:' + obj['name']});
                }
            }
        }
        
    }
    
    function populateDetailsTab(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp; 
        layoutHandler.setURLHashParams({tab:'',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        //showProgressMask('#computenode-dashboard', true);
        startWidgetLoading('vrouter-sparklines');
        toggleWidgetsVisibility(['vrouter-chart-box'], ['system-chart-box']);

        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#computenode-dashboard').html(dashboardTemplate({title:'vRouter',colCount:2,showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   

        $.ajax({
            url: contrail.format(monitorInfraUrls['VROUTER_DETAILS'], obj['name'])
        }).done(function (result) {
                    computeNodeData = result;
                    var parsedData = infraMonitorView.parsevRoutersDashboardData([{name:obj['name'],value:result}])[0];
                    var noDataStr = '--',
                    cpu = "N/A",
                    memory = "N/A",
                    computeNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;
                // var chartWidths3 = $('#vrouter-detail-charts').width();
                //var cwd1 = (parseInt(chartWidths3));
                //var cwd = cwd1/3;
                var parentWidth = parseInt($('#computenode-dashboard').width());
                var chartWdth = parentWidth/2;
                $('#vrouter-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'cpu_share', color: 'blue-sparkline'}, {name: 'virt_mem', color: 'green-sparkline'}]}, slConfig);
                $('#system-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'VrouterStatsAgent':[{name: 'one_min_avg_cpuload', color: 'blue-sparkline'}, {name: 'used_sys_mem', color: 'green-sparkline'}]}, slConfig);
                endWidgetLoading('vrouter-sparklines');
                var procStateList, overallStatus = noDataStr;
                var vRouterProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                try{
                    overallStatus = getOverallNodeStatusForDetails(parsedData);
                }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
                try{
                    procStateList = jsonPath(computeNodeData,"$..process_state_list")[0];
                    vRouterProcessStatusList = getStatusesForAllvRouterProcesses(procStateList);
                }catch(e){}
                computeNodeDashboardInfo = [
                    {lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address', value:(function(){
                        try{
                            var ip = ifNullOrEmpty(getVrouterIpAddresses(computeNodeData,"details"),noDataStr);
                            return ip;
                        } catch(e){return noDataStr;}
                    })()},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Overall Node Status', value:overallStatus},
                    {lbl:'Processes', value:" "},
                    {lbl:INDENT_RIGHT+'vRouter Agent', value:(function(){
                        try{
                            return ifNull(vRouterProcessStatusList['contrail-vrouter'],noDataStr);
                        }catch(e){return noDataStr;}
                    })()},
                    /*{lbl:INDENT_RIGHT+'vRouter Node Manager', value:(function(){
                        try{
                            return ifNull(vRouterProcessStatusList['contrail-vrouter-nodemgr'],noDataStr);
                        }catch(e){return noDataStr;}
                    })()},
                    {lbl:INDENT_RIGHT+'Openstack Nova Compute', value:(function(){
                        try{
                            return ifNull(vRouterProcessStatusList['openstack-nova-compute'],noDataStr);
                        }catch(e){return noDataStr;}
                    })()},*/
                    {lbl:'Analytics Node', value:(function(){
                        var anlNode = noDataStr; 
                        var secondaryAnlNode, status;
                        try{
                            //anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                            anlNode = jsonPath(computeNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                            status = jsonPath(computeNodeData,"$..ModuleClientState..status")[0];
                            secondaryAnlNode = jsonPath(computeNodeData,"$..ModuleClientState..secondary")[0].split(':')[0];
                        }catch(e){
                            anlNode = noDataStr;
                        }
                        try{
                            if(anlNode != null && anlNode != noDataStr && status.toLowerCase() == "established")
                                anlNode = anlNode.concat(' (Up)');
                        }catch(e){
                            if(anlNode != null && anlNode != noDataStr) {
                                anlNode = anlNode.concat(' (Down)');
                            }
                        }
                        if(secondaryAnlNode != null && secondaryAnlNode != "" && secondaryAnlNode != "0.0.0.0"){
                            anlNode.concat(', ' + secondaryAnlNode);
                        }
                        return ifNull(anlNode,noDataStr);
                    })()},
                    {lbl:'Control Nodes', value:(function(){
                        var peerList ;
                        try{
                            peerList = computeNodeData.VrouterAgent.xmpp_peer_list;
                        }catch(e){}
                        var nodeArr=noDataStr ;
                        if(peerList != null && peerList.length>0){
                            nodeArr = '<div class="table-cell dashboard-item-value">';
                            var nodes = '';

                            for (var i=0; i< peerList.length;i++){
                                var node = '';
                                node = '<span onclick="showObjLog(\'default-domain%3Adefault-project%3Aip-fabric%3A__default__%3A'+peerList[i].ip+'\',\'vRouter\');" onmouseover="" style="cursor: pointer;">'+ peerList[i].ip +'</span>' ;

                                if(peerList[i].primary != null && peerList[i].primary == true){
                                    if(peerList[i].status == true){
                                        if((i+1) == peerList.length){//only primary present
                                            node =  node + "* (Up) " ;
                                        } else {
                                            node = node + "* (Up), " ;
                                        }
                                    } else {
                                        node = "<span class='text-error'>" + node + "* (Down)</span>, " ;
                                    }
                                    if(nodes == ''){
                                        nodes = node;
                                    } else {
                                        nodes = node + nodes
                                    }
                                } else {
                                    if(peerList[i].status == true)
                                        node = node + " (Up)" ;
                                    else
                                        node = "<span class='text-error'>" + node + " (Down)</span>" ;
                                    if(node != ''){
                                        nodes = nodes + node
                                    } else {
                                        nodes = node;
                                    }
                                }
                            }
                            nodeArr = nodeArr + nodes + '</div>'
                        }
                        return nodeArr;
                    })(),clk:'url'},

                    //Best way to get the primary node - jsonPath(computeNodeData,'$.VrouterAgent.xmpp_peer_list[?(@.primary==true)].ip')},
                    {lbl:'Analytics Messages', value:(function(){
                    	var msgs = getAnalyticsMessagesCountAndSize(computeNodeData,['VRouterAgent']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
                    {lbl:'XMPP Messages', value:(function(){
                        try {
                            return (ifNull(computeNodeData.VrouterStatsAgent.xmpp_stats_list[0].in_msgs, noDataStr) + ' In, ' + 
                            ifNull(computeNodeData.VrouterStatsAgent.xmpp_stats_list[0].out_msgs, noDataStr) + ' Out');
                        }catch (e){return '0';}
                    })()},
                    {lbl:'Flow Count', value:(function(){
                        try {
                            return (ifNull(computeNodeData.VrouterStatsAgent.active_flows, noDataStr) + ' Active, ' + 
                            ifNull(computeNodeData.VrouterStatsAgent.total_flows, noDataStr) + ' Total');
                        }catch (e){return '0';}
                    })()},  
                    {lbl:'Networks', value:parsedData['vnCnt']},
                    {lbl:'Interfaces', value:(function(){
                    	try{
                    		var downInts = parsedData['errorIntfCnt'];
                    		var totInts = parsedData['intfCnt'];
	                    	var ret;
	                        if(downInts > 0){
	                        	downInts = ", <span class='text-error'>" + downInts + " Down</span>";
	                        } else {
	                        	downInts = "";
	                        } 
	                        return totInts + " Total" + downInts;
                    	}catch(e){return noDataStr;}
                    })()},
                    {lbl:'Instances', value:parsedData['instCnt']},
                    {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Last Log', value: (function(){
                        var lmsg;
                        lmsg = getLastLogTimestamp(computeNodeData,"compute");
                        if(lmsg != null){
                            try{
                                return new Date(parseInt(lmsg)/1000).toLocaleString();  
                            }catch(e){return noDataStr;}
                        } else return noDataStr;
                    })()}
                ]
                var cores=getCores(computeNodeData);
                for(var i=0;i<cores.length;i++)
                    computeNodeDashboardInfo.push(cores[i]);
                //showProgressMask('#computenode-dashboard');
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#computenode-dashboard .widget-body').html(dashboardBodyTemplate({colCount:2, d:computeNodeDashboardInfo, nodeData:computeNodeData, showSettings:true, ip:nodeIp}));
                /*Selenium Testing*/
                cmptNodeDetailsData = computeNodeDashboardInfo;
                /*End of Selenium Testing*/
                var ipList = getVrouterIpAddressList(computeNodeData);
                var ipDeferredObj = $.Deferred();
                getReachableIp(ipList,"8085",ipDeferredObj);
                ipDeferredObj.done(function(nodeIp){
                    if(nodeIp != null && nodeIp != noDataStr) {  
                        $('#linkIntrospect').unbind('click');
                        $('#linkIntrospect').click(function(){
                            window.open('/proxy?proxyURL=http://'+nodeIp+':8085&indexPage', '_blank');
                        });
                        $('#linkStatus').unbind('click');
                        $('#linkStatus').on('click', function(){
                            showStatus(nodeIp);
                        });
                        $('#linkLogs').unbind('click');
                        $('#linkLogs').on('click', function(){
                            showLogs(nodeIp);
                        });
                    }
                });
                initWidget4Id('#dashboard-box');
                initWidget4Id('#vrouter-chart-box');
                initWidget4Id('#system-chart-box');

                endWidgetLoading('dashboard');
            }).fail(displayAjaxError.bind(null, $('#computenode-dashboard')));
        $('#vrouter-chart').initMemCPULineChart($.extend({url:function() {
            return contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', computeNodeInfo['name'], endTime); 
        }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: ['vrouter-chart-box'], hideWidgetIds: ['system-chart-box'], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}), 110);
        $('#system-chart').initMemCPULineChart($.extend({url:function() {
            return  contrail.format(monitorInfraUrls['FLOWSERIES_CPU'], 'vRouterAgent', '30', '10', computeNodeInfo['name'], endTime);
        }, parser: "parseSystemMemCPUData", plotOnLoad: false, showWidgetIds: ['system-chart-box'], hideWidgetIds: ['vrouter-chart-box'], titles: {memTitle:'Memory',cpuTitle:'Avg CPU Load'}}),110);
    };

    function populateACLTab(obj) {
        layoutHandler.setURLHashParams({tab:'acl',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        var selectedAcl = 'All';
        if(obj['filters'] != null){
            selectedAcl = obj['filters'];
        }
        
        if (!isGridInitialized($('#gridComputeACL'))) {
            $('#gridComputeACL').contrailGrid({
                header : {
                    title : {
                        text : 'ACL',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    },
                },
                columnHeader: {
                   columns:[
                       {
                           field:"dispuuid",
                           name:"UUID",
                           minWidth:110,
                       },
                       {
                           field:"flow_count",
                           name:"Flows",
                           minWidth:65
                       },
                       {
                           field:"ace_action",
                           name:"Action",
                           minWidth:60
                       },
                       {
                           field:"proto",
                           name:"Protocol",
                           minWidth:76,
                           formatter:function(r,c,v,cd,dc) {
                               return formatProtcolRange(dc['proto']);
                           }
                       },
                       {
                           field:"src_vn",
                           name:"Source Network or Prefix",
                           minWidth:175,
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("networks", computeNodeTabs);
                                   selectTab(computeNodeTabStrip,tabIdx);
                               }
                            }
                       },
                       //{field:"src_ip",     name:"Source IP",minWidth:95},
                       {
                           field:"src_port",
                           name:"Source Port",
                           minWidth:95,
                           formatter:function(r,c,v,cd,dc){
                               return formatPortRange(dc['src_port']);
                           }
                       },
                       {
                           field:"dst_vn",
                           name:"Destination Network or Prefix",
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("networks", computeNodeTabs);
                                   selectTab(computeNodeTabStrip,tabIdx);
                               }
                            },
                           minWidth:200
                       },
                       //{field:"dst_ip",       name:"Destination IP",minWidth:110},
                       {
                           field:"dst_port",
                           name:"Destination Port",
                           formatter:function(r,c,v,cd,dc){
                               return formatPortRange(dc['dst_port']);
                           },
                           minWidth:120
                       },
                       /*{
                           field:"proto_range",
                           name:"Source Policy Rule",
                           minWidth:125
                       },*/
                       {
                           field:"aceId",
                           name:"ACE Id",
                           minWidth:60
                       }
                   ]
                },
                body: {
                   options: {
                      forceFitColumns: true,
                      detail: {
                         template: $('#gridsTemplateJSONDetails').html()
                      }
                   },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: contrail.format(monitorInfraUrls['VROUTER_ACL'], getIPOrHostName(computeNodeInfo)),
                                type: 'GET'
                            },
                            dataParser: function(response) {
                               getSGUUIDs(getIPOrHostName(computeNodeInfo));
                               return self.parseACLData(response);
                            }
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading ACLs..',
                        },
                        empty: {
                            text: 'No ACLs to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                }
            })
            aclGrid = $('#gridComputeACL').data('contrailGrid');
            aclGrid.showGridMessage('loading');
            applyGridDefHandlers(aclGrid, {noMsg:'No ACL to display'});
        } else {
            reloadGrid(aclGrid);
        }
        function mergeACLAndSGData(sgData){
            var primaryDS = aclGrid._dataView;
            var primaryData = primaryDS.getItems();
            //map all the sg ids with uuids
            var sgMap = {};
            var sgList = ifNull(jsonPath(sgData,"$.SgListResp.sg_list.list.SgSandeshData")[0],[]);
            if(!(sgList instanceof Array)){
                sgList = [sgList];
            }
            $.each(sgList,function(idx,obj){
                sgMap[sgList[idx]['sg_id']] =  sgList[idx]['sg_uuid'];
            });
            $.each(primaryData,function(idx,obj){
                if(obj['srcType'] == 'sg'){
                    if(sgMap[obj['srcSgId']] != null){
                        obj['src_vn'] = 'SG : ' + sgMap[obj['srcSgId']];
                    } else {
                        obj['src_vn'] = obj['srcSgId'];
                    }
                }
                if(obj['dstType'] == 'sg'){
                    if(sgMap[obj['dstSgId']] != null){
                        obj['dst_vn'] = 'SG : ' + sgMap[obj['dstSgId']];
                    } else {
                        obj['dst_vn'] = obj['dstSgId'];
                    }
                }
            });
            primaryDS.setItems(primaryData);
            aclGrid._grid.invalidate();
            aclGrid.refreshView();
        }
        function getSGUUIDs(ip){
            var postData = getSandeshPostData(ip,"8085","/Snh_SgListReq");
            $.ajax({
                url:SANDESH_DATA_URL,
                type:'POST',
                data:postData
            }).done(function(result) {
                if(result != null){
                    mergeACLAndSGData(result);
                }
            }).fail(function(result) {
                //nothing to do..the SG UUIDs will not be updated
            });
        }
        function onACLChange() {
            var name;
            if (name = isCellSelectable(this.select())) {
                if ($.inArray(name, ['src_vn', 'dst_vn']) > -1)
                    var tabIdx = $.inArray("networks", computeNodeTabs);
                    selectTab(computeNodeTabStrip, tabIdx);
                if (name == 'flows') {
                    var dataItem = this.dataItem(this.select()[0].parentNode);
                    var filters = dataItem.uuid;
                    $('#compute_tabstrip').data(filters, uuid);
                    var tabIdx = $.inArray("flows", computeNodeTabs);
                    selectTab(computeNodeTabStrip, tabIdx,filters);
                    //TODO removing the filtering because of some issues layoutHandler.setURLHashParams({tab:'flows', ip:computeNodeInfo['ip'],node:'vRouters:' + obj['name'], filters:filters});
                }
            }
        }
        function onAclSelect(){
            var datasource = $("#gridComputeACL").data("contrailGrid").dataSource;
            var filters = datasource.filter();
            var selectedAcl = $('#aclComboBox').data("contrailDropdown").value();
            if(selectedAcl == "All")
                filters = [];
            else 
                filters = { field: "uuid", operator: "eq", value: selectedAcl };
            datasource.filter(filters);
        }
    }

    function populateFlowsTab(obj,filters) {
        var isAclPrevFirstTimeClicked = true;
        var isAllPrevFirstTimeClicked = true;
        var selectedAcl = 'All';
        flowKeyStack = [];
        aclIterKeyStack = [];
        /*TODO this filtering is causing issues like unable to move next and previous so commenting for now.
         * if(obj['filters'] != null){
            selectedAcl = obj['filters'];
        }*/
        $('#btnNextFlows').unbind("click").click(onNextClick);
        $('#btnPrevFlows').unbind("click").click(onPrevClick);
        layoutHandler.setURLHashParams({tab:'flows',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        if (!isInitialized('#aclDropDown')){
            $('#aclDropDown').contrailDropdown({
                dataSource: {
                    type: 'remote',
                     url: contrail.format(monitorInfraUrls['VROUTER_ACL'], getIPOrHostName(computeNodeInfo)),
                     parse:function(response){
                         var retArr = [{text:'All',value:'All'}];
                         response = jsonPath(response,'$..AclSandeshData')[0];
                         var uuidArr = [];
                         if(response != null){
                             if(!(response instanceof Array)){
                                 response = [response];
                             }
                             for (var i = 0; i < response.length; i++) {
                                 uuidArr.push(response[i].uuid);
                             }
                         }
                        // $.map(uuidArr, function (value) {
                             $.each(uuidArr, function (key, value) {
                                 retArr.push({text:value, value:value});
                             });
                        // });
                         return retArr;
                     }
                 },
                dataValueField:'value',
                dataTextField:'text',
                change:onSelectAcl
            }).data('contrailDropdown');
        } 
        
        if (!isInitialized('#gridComputeFlows')) {
            $("#gridComputeFlows").contrailGrid({
                header : {
                    title : {
                        text : 'Flows',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    },
                },
                columnHeader : {
                    columns: [

                                   {
                                    field:"acl_uuid",
                                    name:"ACL / SG UUID",
                                    formatter:function(r,c,v,cd,dc){
                                        return getAclSgUuuidString(dc);
                                    },
                                    searchFn: function(data) {
                                       return getAclSgUuuidString(data);
                                    },
                                    minWidth:270
                                    },
                                   {
                                       field:"protocol",
                                       name:"Protocol",
                                       minWidth:70,
                                       formatter:function(r,c,v,cd,dc){
                                           return formatProtocol(dc['protocol']);
                                       }
                                   },
                                   {
                                       field:"src_vn",
                                       name:"Src Network",
                                       cssClass:'cell-hyperlink-blue',
                                       events: {
                                           onClick: function(e,dc){
                                               var tabIdx = $.inArray("networks", computeNodeTabs);
                                               selectTab(computeNodeTabStrip,tabIdx);
                                           }
                                        },
                                       minWidth:220
                                   },
                                   {
                                       field:"sip",
                                       name:"Src IP",
                                       minWidth:80
                                   },
                                   {
                                       field:"src_port",
                                       name:"Src Port",
                                       minWidth:70
                                   },
                                   {
                                       field:"dst_vn",
                                       name:"Dest Network",
                                       cssClass:'cell-hyperlink-blue',
                                       events: {
                                           onClick: function(e,dc){
                                               var tabIdx = $.inArray("networks", computeNodeTabs);
                                               selectTab(computeNodeTabStrip,tabIdx);
                                           }
                                        },
                                       minWidth:220
                                   },
                                   {
                                       field:"dip",
                                       name:"Dest IP",
                                       minWidth:80
                                   },
                                   {
                                       field:"dst_port",
                                       name:"Dest Port",
                                       minWidth:70
                                   },
                                   {
                                       field:"stats_bytes",
                                       name:"Bytes/Pkts",
                                       minWidth:135,
                                       formatter:function(r,c,v,cd,dc){
                                           return contrail.format("{0}/{1}",dc['stats_bytes'],dc['stats_packets']);
                                       },
                                       searchFn:function(d){
                                           return d['stats_bytes']+ '/ ' +d['stats_packets'];
                                       }
                                   },
                                   {
                                       field:"setup_time_utc",
                                       name:"Setup Time",
                                       formatter:function(r,c,v,cd,dc){
                                           return new XDate(dc['setup_time_utc']/1000).toLocaleString();
                                       },
                                       minWidth:150
                                   }
                               ]
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        }
                    },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo),
                                /* TODO use this while implementing context filtering
                                function () {
                                    var aclFilter = '';
                                    if(selectedAcl != 'All'){
                                        aclFilter = '&aclUUID=' + selectedAcl;
                                    }
                                    return '/api/admin/monitor/infrastructure/vrouter/flows?ip=' + getIPOrHostName(computeNodeInfo) + aclFilter;
                                }*/
                                type: 'GET'
                            },
                            dataParser: self.parseFlowsData
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Flows..',
                        },
                        empty: {
                            text: 'No Flows to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                },
                footer : {
                    pager : {
                        options : {
                            pageSize : 50,
                            pageSizeSelect : [10, 50, 100, 200, 500 ]
                        }
                    }
                },
                change:onFlowChange
            });
            flowGrid = $('#gridComputeFlows').data('contrailGrid');
            flowGrid.showGridMessage('loading');
            /*TODO context filtering
             * if(filters == null || filters == "" || filters == undefined){
                flowGrid.dataSource.filter({});
            }*/
        } else {
            /* TODO use it when implementing context filtering 
             * if(filters != null) {
                flowGrid.filter({field: "acl_uuid", operator: "startswith", value: filters});
            }
            flowGrid.dataSource.transport.options.read.url = '/api/admin/monitor/infrastructure/vrouter/flows?ip=' + getIPOrHostName(computeNodeInfo);
            */
            reloadGrid(flowGrid);
            //flowGrid.showColumn(0);
        }
        this.getAclSgUuuidString = function(data){
            var aclUuid = ifNull(jsonPath(data,"$..policy..FlowAclUuid..uuid")[0],noDataStr);
            var sgUuid = ifNull(jsonPath(data,"$..sg..FlowAclUuid..uuid")[0],noDataStr);
            if(aclUuid != null)
            var ret = aclUuid;
            if(sgUuid != null && sgUuid != noDataStr){
                ret = ret + ' / </br>' + sgUuid;
            }
            return ret;
        }
        function onSelectAcl() {
            var acluuid = $('#aclDropDown').data("contrailDropdown").value();
            var flowGrid = $('#gridComputeFlows').data('contrailGrid');
            var newAjaxConfig = "";
            flowKeyStack = [];
            aclIterKeyStack = [];
            if (acluuid != 'All') {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                                                            + '&aclUUID=' + acluuid,
                        type:'Get'
                    };
            } else {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo),
                        type:'Get'
                    };
            }
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(flowGrid);
        }
        function onNextClick(){
            var flowGrid = $('#gridComputeFlows').data('contrailGrid');
            var acluuid = $('#aclDropDown').data("contrailDropdown").value();
            var newAjaxConfig = "";
            isAllPrevFirstTimeClicked = true;
            isAclPrevFirstTimeClicked = true;
            if(acluuid == 'All' && flowKeyStack.length > 0 && flowKeyStack[flowKeyStack.length - 1] != null){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                                                            + '&flowKey=' + flowKeyStack[flowKeyStack.length - 1],
                        type:'Get'
                    };
            }
            else if (acluuid != 'All' && aclIterKeyStack.length > 0 && aclIterKeyStack[aclIterKeyStack.length -1] != null){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                        + '&iterKey=' + aclIterKeyStack[aclIterKeyStack.length -1],
                        type:'Get'
                    };
            } else if (acluuid == "All"){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo),
                        type:'Get'
                    };
            }
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(flowGrid);
        }
        function onPrevClick(){
            var flowGrid = $('#gridComputeFlows').data('contrailGrid');
            var acluuid = $('#aclDropDown').data("contrailDropdown").value();
            var newAjaxConfig = "";
            if(isAllPrevFirstTimeClicked) {
                //we need to do this because when we click the prev for the first time the stack would contain the next uuid as well. 
                //We need to pop out the uuids 3 times to get the prev uuid.
                flowKeyStack.pop();
                isAllPrevFirstTimeClicked = false;
            }
            flowKeyStack.pop();//need to pop twice to get the prev last flowkey
            if(isAclPrevFirstTimeClicked) {
                aclIterKeyStack.pop();
                isAclPrevFirstTimeClicked = false;
            }
            aclIterKeyStack.pop();
            if(acluuid == 'All' && flowKeyStack.length > 0) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                            + '&flowKey=' + flowKeyStack.pop(),
                        type:'Get'
                    };
            } else if (acluuid == 'All' && flowKeyStack.length < 1){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo),
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length > 0) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo) 
                        + '&iterKey=' + aclIterKeyStack.pop(),
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length < 1) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(computeNodeInfo)
                            + '&aclUUID=' + acluuid,
                        type:'Get'
                    };
            }
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(flowGrid);
        }
        function onFlowChange() {
            var name;
            if (name = isCellSelectable(this.select())) {
                if ($.inArray(name, ['src_vn', 'dst_vn']) > -1){
                    var tabIdx = $.inArray("networks", computeNodeTabs);
                    selectTab(computeNodeTabStrip, tabIdx);
                }
            }
        }
    }

    function populateRoutesTab(obj) {
        layoutHandler.setURLHashParams({tab:'routes',node:'vRouters:' + obj['name']},{triggerHashChange:false});
        var routesGrid,ucIndex,mcIndex;
        var rdoRouteType = $('#routeType').val();
        var cboVRF;
        var selectedRoute;
        if(obj['filters'] != null){
            var postfix = obj['filters'].split(':');
            selectedRoute = obj['filters'] + ':' + postfix[postfix.length - 1];
        }
        if(isDropdownInitialized('comboVRF')) {
            cboVRF = $('#comboVRF').data('contrailDropdown');
//            cboVRF.select(function(dataItem) {
//                return dataItem.name === selectedRoute;
//            });
//            cboVRF.dataSource.read();
        } else {
            cboVRF = $('#comboVRF').contrailDropdown({
                dataSource: {
                    type: 'remote',
                     url: contrail.format(monitorInfraUrls['VROUTER_VRF_LIST'], getIPOrHostName(computeNodeInfo)),
                     parse:function(response){
                         var ret = [];
                         if(!(response instanceof Array)){
                            response = [response];
                         }
                         $.each(response,function(idx,obj){
                            var ucIndex = ifNull(obj.ucindex,'');
                            var mcIndex = ifNull(obj.mcindex,'');
                            var l2Index = ifNull(obj.l2index,'');
                            var value = "ucast=" + ucIndex + "&&mcast=" + mcIndex + "&&l2=" + l2Index;
                            ret.push({name:obj.name,value:value}) 
                         });
                         //Intialize the grid
                         window.setTimeout(function() { initUnicastRoutesGrid(ret[0]); },200);
                         return ret; 
                     }
                 },
                dataValueField:'value',
                dataTextField:'name',
                change:onVRFChange
            }).data('contrailDropdown');
            if(cboVRF.getAllData().length > 0){
                cboVRF.value(cboVRF.getAllData()[0]['value']);
            }
           // cboVRF.list.width(300);
            $('input[name="routeType"]').change(onRouteTypeChange);
        }
        function onRouteTypeChange() {
            if($('#rdboxUnicast').is(':checked') == true) {
                if($("#gridvRouterMulticastRoutes").data("contrailGrid") !=null) {
                    $("#gridvRouterMulticastRoutes").data("contrailGrid").destroy();
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    $("#gridvRouterL2Routes").html('');
                    //removeAllAttributesOfElement("#gridvRouterMulticastRoutes");
                    //$("#gridvRouterMulticastRoutes").removeAttributes();
                    $("#gridvRouterMulticastRoutes").removeAttr('style');
                    $("#gridvRouterMulticastRoutes").removeAttr('data-role');
                    $("#gridvRouterMulticastRoutes").hide();
                }
                if($("#gridvRouterL2Routes").data("contrailGrid") !=null) {
                    $("#gridvRouterL2Routes").data("contrailGrid").destroy();
                    $("#gridvRouterL2Routes").html('');
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    //removeAllAttributesOfElement("#gridvRouterUnicastRoutes");
                    //$("#gridvRouterUnicastRoutes").removeAttributes();
                    $("#gridvRouterL2Routes").removeAttr('style');
                    $("#gridvRouterL2Routes").removeAttr('data-role');
                    $("#gridvRouterL2Routes").hide();
                }
                //removeAllAttributesOfElement("#gridvRouterUnicastRoutes");
                //$("#gridvRouterUnicastRoutes").removeAttributes();
                initUnicastRoutesGrid();
                $("#gridvRouterUnicastRoutes").show();
            }
            else if($('#rdboxMulticast').is(':checked') == true) {
                if($("#gridvRouterUnicastRoutes").data("contrailGrid") !=null) {
                    $("#gridvRouterUnicastRoutes").data("contrailGrid").destroy();
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    $("#gridvRouterL2Routes").html('');
                    //removeAllAttributesOfElement("#gridvRouterUnicastRoutes");
                    //$("#gridvRouterUnicastRoutes").removeAttributes();
                    $("#gridvRouterUnicastRoutes").removeAttr('style');
                    $("#gridvRouterUnicastRoutes").removeAttr('data-role');
                    $("#gridvRouterUnicastRoutes").hide();
                }
                if($("#gridvRouterL2Routes").data("contrailGrid") !=null) {
                    $("#gridvRouterL2Routes").data("contrailGrid").destroy();
                    $("#gridvRouterL2Routes").html('');
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    //removeAllAttributesOfElement("#gridvRouterUnicastRoutes");
                    //$("#gridvRouterUnicastRoutes").removeAttributes();
                    $("#gridvRouterL2Routes").removeAttr('style');
                    $("#gridvRouterL2Routes").removeAttr('data-role');
                    $("#gridvRouterL2Routes").hide();
                }
                //removeAllAttributesOfElement("#gridvRouterMulticastRoutes");
                //$("#gridvRouterMulticastRoutes").removeAttributes();
                initMulticastRoutesGrid();
                $("#gridvRouterMulticastRoutes").show();
            } else {
                if($("#gridvRouterMulticastRoutes").data("contrailGrid") !=null) {
                    $("#gridvRouterMulticastRoutes").data("contrailGrid").destroy();
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    $("#gridvRouterL2Routes").html('');
                    //removeAllAttributesOfElement("#gridvRouterMulticastRoutes");
                    //$("#gridvRouterMulticastRoutes").removeAttributes();
                    $("#gridvRouterMulticastRoutes").removeAttr('style');
                    $("#gridvRouterMulticastRoutes").removeAttr('data-role');
                    $("#gridvRouterMulticastRoutes").hide();
                }
                if($("#gridvRouterUnicastRoutes").data("contrailGrid") !=null) {
                    $("#gridvRouterUnicastRoutes").data("contrailGrid").destroy();
                    $("#gridvRouterUnicastRoutes").html('');
                    $("#gridvRouterMulticastRoutes").html('');
                    $("#gridvRouterL2Routes").html('');
                    //removeAllAttributesOfElement("#gridvRouterUnicastRoutes");
                    //$("#gridvRouterUnicastRoutes").removeAttributes();
                    $("#gridvRouterUnicastRoutes").removeAttr('style');
                    $("#gridvRouterUnicastRoutes").removeAttr('data-role');
                    $("#gridvRouterUnicastRoutes").hide();
                }
                initL2RoutesGrid();
                $("#gridvRouterL2Routes").show();
            }
        }

        function onVRFChange(e) {
            var selectedRadio = "";
            var index = '';
            var selected = $("input[type='radio'][name='routeType']:checked");
            if (selected.length > 0) {
                selectedRadio = selected.val();
            }
            var selectedVRF = cboVRF.value();
            if(selectedVRF != null){
                index = getIndexForType(selectedVRF,selectedRadio);
            }
            var newAjaxConfig = {
                url: monitorInfraUrls['VROUTER_BASE'] + selectedRadio +'-routes?ip=' + getIPOrHostName(computeNodeInfo) + '&vrfindex=' + index,
                type:'Get'
            };
            routesGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(routesGrid);
//            if(routesGrid != null){
//                reloadGrid(routesGrid);
//                routesGrid._grid.invalidate();
//                routesGrid.refreshView();
//                routesGrid.refreshData();
//            }
        }
        
        function getIndexForType(selectedVRF,type){
            var parts = selectedVRF.split('&&');
            var index = '';
            $.each(parts,function(i,d){
                if(d.indexOf(type) != -1){
                    index = d.split('=')[1];
                }
            });
            return index;
        }
        
        //Initialize grid only after getting vrfList
        function initUnicastRoutesGrid(initialSelection) {
            if (!isGridInitialized($('#gridvRouterUnicastRoutes'))) {
                /*cboVRF.select(function(dataItem) {
                    return dataItem.text === selectedRoute;
                });*/
                //cboVRF.select(1);

                $("#gridvRouterUnicastRoutes").contrailGrid({
                    header : {
                        title : {
                            text : 'Routes',
                            cssClass : 'blue'
                        },
                        defaultControls: {
                            collapseable: true,
                            exportable: false,
                            refreshable: false,
                            searchable: true
                        },
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"dispPrefix",
                                 id:"Prefix",
                                 name:"Prefix",
                                 minWidth:50
                             },
                             {
                                 field:"next_hop",
                                 id:"next_hop",
                                 name:"Next hop Type",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopType(dc);
                                 },
                                 minWidth:50
                             },
                             {
                                 field:"label",
                                 id:"label",
                                 name:"Next hop details",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopDetails(dc);
                                 }
                             }
                         ],
                    },
                    body : {
                        options : {
                            //checkboxSelectable: true,
                            forceFitColumns: true,
                            detail:{
                                template: $("#gridsTemplateJSONDetails").html()
                            }
                        },
                        dataSource : {
                            remote: {
                                ajaxConfig: {
                                    url: function(){
                                        var selectedVrf = cboVRF.value();
                                        if(initialSelection != null){
                                            selectedVrf = initialSelection['value'];
                                        }
                                        var ucIndex = getIndexForType(selectedVrf,'ucast');
                                        return contrail.format(monitorInfraUrls['VROUTER_UNICAST_ROUTES'] , getIPOrHostName(computeNodeInfo), ucIndex)
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseUnicastRoutesData
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading Unicast Routes..',
                            },
                            empty: {
                                text: 'No Unicast Routes to display'
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
                            }
                        }
                    },
                    footer : {
                        pager : {
                            options : {
                                pageSize : 50,
                                pageSizeSelect : [10, 50, 100, 200, 500 ]
                            }
                        }
                    }
                });
                routesGrid = $('#gridvRouterUnicastRoutes').data('contrailGrid');
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterUnicastRoutes').data('contrailGrid');
                reloadGrid(routesGrid);
            }
        }
        
      //Initialize grid only after getting vrfList
        function initMulticastRoutesGrid() {
            if (!isGridInitialized($('#gridvRouterMulticastRoutes'))) {
                $("#gridvRouterMulticastRoutes").contrailGrid({
                    header : {
                        title : {
                            text : 'Routes',
                            cssClass : 'blue'
                        },
                        defaultControls: {
                            collapseable: true,
                            exportable: false,
                            refreshable: false,
                            searchable: true
                        },
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"dispPrefix",
                                 id:"Prefix",
                                 name:"Source / Group",
                                 minWidth:5
                             },
                             {
                                 field:"next_hop",
                                 id:"next_hop",
                                 name:"Next hop Type",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopType(dc);
                                 },
                                 minWidth:5
                             },
                             {
                                 field:"label",
                                 id:"label",
                                 name:"Next hop details",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopDetailsForMulticast(dc);
                                 }
                             }
                         ],
                    },
                    body : {
                        options : {
                            //checkboxSelectable: true,
                            forceFitColumns: true,
                            detail:{
                                template: $("#gridsTemplateJSONDetails").html()
                            }
                        },
                        dataSource : {
                            remote: {
                                ajaxConfig: {
                                    url: function(){
                                        var selectedVrf = cboVRF.value();;
                                        var mcIndex = getIndexForType(selectedVrf,'mcast');
                                        return contrail.format(monitorInfraUrls['VROUTER_MCAST_ROUTES'], getIPOrHostName(computeNodeInfo), mcIndex);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseMulticastRoutesData
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading Multicast Routes..',
                            },
                            empty: {
                                text: 'No Multicast Routes to display'
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
                            }
                        }
                    },
                    footer : {
                        pager : {
                            options : {
                                pageSize : 50,
                                pageSizeSelect : [10, 50, 100, 200, 500 ]
                            }
                        }
                    }
                });
                routesGrid = $('#gridvRouterMulticastRoutes').data('contrailGrid');     
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterMulticastRoutes').data('contrailGrid');  
                reloadGrid(routesGrid);
            }
        }
        
        function initL2RoutesGrid() {
            if (!isGridInitialized($('#gridvRouterL2Routes'))) {
                
                $("#gridvRouterL2Routes").contrailGrid({
                    header : {
                        title : {
                            text : 'Routes',
                            cssClass : 'blue'
                        },
                        defaultControls: {
                            collapseable: true,
                            exportable: false,
                            refreshable: false,
                            searchable: true
                        },
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"mac",
                                 id:"Mac",
                                 name:"Mac",
                                 minWidth:5
                             },
                             {
                                 field:"next_hop",
                                 id:"next_hop",
                                 name:"Next hop Type",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopType(dc);
                                 },
                                 minWidth:5
                             },
                             {
                                 field:"label",
                                 id:"label",
                                 name:"Next hop details",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopDetailsForL2(dc);
                                 }
                             }
                         ],
                    },
                    body : {
                        options : {
                            //checkboxSelectable: true,
                            forceFitColumns: true,
                            detail:{
                                template: $("#gridsTemplateJSONDetails").html()
                            }
                        },
                        dataSource : {
                            remote: {
                                ajaxConfig: {
                                    url: function(){
                                        var selectedVrf = cboVRF.value();;
                                        var l2index = getIndexForType(selectedVrf,'l2');
                                        return contrail.format(monitorInfraUrls['VROUTER_L2_ROUTES'], getIPOrHostName(computeNodeInfo), l2index);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseL2RoutesData
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading L2 Routes..',
                            },
                            empty: {
                                text: 'No L2 Routes to display'
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
                            }
                        }
                    },
                    footer : {
                        pager : {
                            options : {
                                pageSize : 50,
                                pageSizeSelect : [10, 50, 100, 200, 500 ]
                            }
                        }
                    }
                });
                routesGrid = $('#gridvRouterL2Routes').data('contrailGrid'); 
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterL2Routes').data('contrailGrid'); 
                reloadGrid(routesGrid);
            }
        }
    }


    this.populateComputeNode = function (obj) {
        var tabIdx = $.inArray(obj['tab'], computeNodeTabs);
        
        if (!isInitialized('#compute_tabstrip')) {
        	var compNodeTemplate = Handlebars.compile($("#computenode-template").html());
            $(pageContainer).html(compNodeTemplate(computeNodeInfo));
           
            //Set the height of all tabstrip containers to viewheight - tabstrip
            var tabContHeight = layoutHandler.getViewHeight() - 42;
            if (tabIdx == -1){
                tabIdx = 0;
                populateDetailsTab(computeNodeInfo);
            }
            $("#compute_tabstrip").contrailTabs({
                 activate: function(e, ui) {
                    infraMonitorUtils.clearTimers();
                    //var selTab = $(e.item).text();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab != 'Console') {
                    }

                    if (selTab == 'Interfaces') {
                        populateInterfaceTab(computeNodeInfo);
                    } else if (selTab == 'Networks') {
                        populateVNTab(computeNodeInfo);
                        $('#gridComputeVN').data('contrailGrid').refreshView();
                    } else if (selTab == 'ACL') {
                        populateACLTab(computeNodeInfo);
                    } else if (selTab == 'Flows') {
                        populateFlowsTab(computeNodeInfo, e.filters);
                    } else if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('compute', {source:computeNodeInfo['name']}, computeNodeInfo);
                    } else if (selTab == 'Debug Info') {
                        populateDebugTab(computeNodeInfo);
                    } else if (selTab == 'Details') {
                        populateDetailsTab(computeNodeInfo);
                    } else if(selTab == 'Routes') {
                        populateRoutesTab(computeNodeInfo);
                        if(isGridInitialized('#gridvRouterUnicastRoutes'))
                            $('#gridvRouterUnicastRoutes').data('contrailGrid').refreshView();
                        if(isGridInitialized('#gridvRouterMulticastRoutes'))
                            $('#gridvRouterMulticastRoutes').data('contrailGrid').refreshView();
                        if(isGridInitialized('#gridvRouterL2Routes'))
                            $('#gridvRouterL2Routes').data('contrailGrid').refreshView();
                    }
                }
            });
            selectTab(computeNodeTabStrip,tabIdx);
        } else {
            selectTab(computeNodeTabStrip,tabIdx);
        }
    }
}

cmpNodesView = new computeNodesView();
cmpNodeView = new computeNodeView();

function getStatusesForAllvRouterProcesses(processStateList){
    var ret = [];
    if(processStateList != null){
        for(var i=0; i < processStateList.length; i++){
            var currProc = processStateList[i];
            if(currProc.process_name == "contrail-vrouter-nodemgr"){
                ret['contrail-vrouter-nodemgr'] = getProcessUpTime(currProc);
            } else if (currProc.process_name == "openstack-nova-compute"){
                ret['openstack-nova-compute'] = getProcessUpTime(currProc);
            } else if (currProc.process_name == "contrail-vrouter"){
                ret['contrail-vrouter'] = getProcessUpTime(currProc);
            }
        }
    }
    return ret;
}

function getvRoutersDashboardDataForSummary(deferredObj,dataSource) {
    $.ajax({
        url: monitorInfraUrls['VROUTER_SUMMARY']
    }).done(function(result) {
        var r = infraMonitorView.parsevRoutersDashboardData(result);
        $.each(r,function(idx,obj){
            dataSource.add(obj);
        });
        deferredObj.resolve({dataSource:dataSource,response:r});
        
    }).fail(function(result) {
        showInfoWindow('Error in fetching vRouter Node details','Error');
        return([]);
    });
}

function getVrouterIpAddressList(data){
    var controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
    var ips = getValueByJsonPath(data,'VrouterAgent;self_ip_list',[]);
    var configip = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address');
    var ipList = [];
    if(controlIp != noDataStr){
        ipList.push(controlIp);
    }
    if(ips.length > 0){
        $.each(ips,function(idx,obj){
            if(obj != null && ipList.indexOf(obj) == -1){
                ipList.push(obj);
            }
        });
    }
    if(configip != null && ipList.indexOf(configip) == -1){
        ipList.push(configip);
    }
    return ipList;
}
