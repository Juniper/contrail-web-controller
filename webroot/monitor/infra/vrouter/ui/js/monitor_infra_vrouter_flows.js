/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Flows tab
 */
monitorInfraComputeFlowsClass = (function() {
    var nodeObj;
    this.parseFlowsData = function(response,deferredObj){

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
                var aclUUID = $('#aclDropDown' + '_' + nodeObj.name).data('contrailDropdown').value();
                $.each(response,function(idx,obj) {
                    var rawJson = obj;
                    
                    ret.push({acl_uuid:(idx != 0)? '' : aclUUID,
                        searchUUID:aclUUID,
                        src_vn:ifNullOrEmptyObject(obj['source_vn'],noDataStr),
                        dst_vn:ifNullOrEmptyObject(obj['dest_vn'],noDataStr),
                        sip:ifNullOrEmptyObject(obj['src'],noDataStr),
                        src_port:ifNullOrEmptyObject(obj['src_port'],noDataStr),
                        dst_port:ifNullOrEmptyObject(obj['dst_port'],noDataStr),
                        setup_time_utc:ifNullOrEmptyObject(obj['setup_time_utc'],noDataStr),
                        protocol:ifNullOrEmptyObject(obj['protocol'],noDataStr),
                        dip:ifNullOrEmptyObject(obj['dst'],noDataStr),
                        stats_bytes:ifNullOrEmptyObject(obj['bytes'],noDataStr),
                        stats_packets:ifNullOrEmptyObject(obj['packets'],noDataStr),
                        direction: ifNullOrEmptyObject(obj['direction'],noDataStr),
                        peer_vrouter:ifNullOrEmptyObject(obj['peer_vrouter'],noDataStr),
                        deny:ifNullOrEmptyObject(obj['implicit_deny'],noDataStr),
                        raw_json:rawJson});
                });
            } else {
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
                        direction: ifNullOrEmptyObject(obj['direction'],noDataStr),
                        peer_vrouter:ifNullOrEmptyObject(obj['peer_vrouter'],noDataStr),
                        deny:ifNullOrEmptyObject(obj['implicit_deny'],noDataStr),
                        raw_json:rawJson});
                });
            }
        }
        //Push the flowKey to the stack for Next use
        if(flowKey != null && !$.isEmptyObject(flowKey)){
            //Had to add this hack because sometimes we get into to this parse function twice leading this to be added twice to the stack
            if(flowKey != "0:0:0:0:0.0.0.0:0.0.0.0" && flowKeyStack[flowKeyStack.length - 1] != flowKey) 
                flowKeyStack.push(flowKey);
        }
        if((flowKey == null) || (flowKey == "0:0:0:0:0.0.0.0:0.0.0.0")) {
            lastFlowReq = true;
        }
        //Push the aclIterKey to the stack for Next use
        if(iterationKey != null && !$.isEmptyObject(iterationKey)){
            //Had to add this hack because sometimes we get into to this parse function twice leading this to be added twice to the stack
            if(iterationKey.indexOf('0:0:0:0:0.0.0.0:0.0.0.0') == -1 && aclIterKeyStack[aclIterKeyStack.length - 1] != iterationKey)
                aclIterKeyStack.push(iterationKey);
        }
        //$('#flowCnt').text(response.flowData.length);
        if(deferredObj != null)
            deferredObj.resolve();
        return ret;
    
    }
    
    this.populateFlowsTab = function (obj) {
        var isAclPrevFirstTimeClicked = true;
        var isAllPrevFirstTimeClicked = true;
        var selectedAcl = 'All';
        var tabFilter =  $('#' + computeNodeTabStrip + '_' + obj.name).data('tabFilter');
        var filters;
        if(tabFilter != null && tabFilter['tab'] == 'flows'){
            filters = tabFilter['filters'];
            $('#' + computeNodeTabStrip + '_' + obj.name).removeData('tabFilter');
        }
        if (filters != null){
            selectedAcl = filters[0]['aclUUID'];
        }
        //flowkeystack is global variable used in underlay/overlay vrouter flows
        flowKeyStack = [];
        aclIterKeyStack = [];
        $('#btnNextFlows' + '_' + obj.name).unbind("click").click(onNextClick);
        $('#btnPrevFlows' + '_' + obj.name).unbind("click").click(onPrevClick);
        if(obj.detailView === undefined &&  obj.page == null) {
            layoutHandler.setURLHashParams({tab:'flows',node: obj['displayName']},{triggerHashChange:false});
        }    
        if (!isDropdownInitialized('aclDropDown' + '_' + obj.name)){
            $('#aclDropDown' + '_' + obj.name).contrailDropdown({
                dataSource: {
                    type: 'remote',
                     url: contrail.format(monitorInfraUrls['VROUTER_ACL'], getIPOrHostName(obj), obj['introspectPort']),
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
                         $.each(uuidArr, function (key, value) {
                             retArr.push({text:value, value:value});
                         });
                         return retArr;
                     }
                 },
                dataValueField:'value',
                dataTextField:'text',
                change:onSelectAcl
            }).data('contrailDropdown');
            $('#aclDropDown' + '_' + obj.name).data('contrailDropdown').value(selectedAcl);
        } 
        if(selectedAcl != 'All'){
            $('#aclDropDown' + '_' + obj.name).data('contrailDropdown').value(selectedAcl);
        }   
        if (!isGridInitialized('#gridComputeFlows' + '_' + obj.name)) {
            $("#gridComputeFlows" + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'Flows'
                    }
                },
                columnHeader : {
                    columns: [

                                   {
                                    field:"acl_uuid",
                                    name:"ACL UUID",
                                    formatter:function(r,c,v,cd,dc){
                                        return getAclSgUuuidString(dc,false);
                                    },
                                    searchFn: function(data) {
                                       return getAclSgUuuidString(data,true);
                                    },
                                    minWidth:280
                                    },
                                   {
                                       field:"protocol",
                                       name:"Protocol",
                                       minWidth:60,
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
                                               selectTab(computeNodeTabStrip + '_' + obj.name,tabIdx);
                                           }
                                        },
                                       minWidth:185
                                   },
                                   {
                                       field:"sip",
                                       name:"Src IP",
                                       minWidth:70
                                   },
                                   {
                                       field:"src_port",
                                       name:"Src Port",
                                       minWidth:50
                                   },
                                   {
                                       field:"dst_vn",
                                       name:"Dest Network",
                                       cssClass:'cell-hyperlink-blue',
                                       events: {
                                           onClick: function(e,dc){
                                               var tabIdx = $.inArray("networks", computeNodeTabs);
                                               selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
                                           }
                                        },
                                       minWidth:185
                                   },
                                   {
                                       field:"dip",
                                       name:"Dest IP",
                                       minWidth:70
                                   },
                                   {
                                       field:"dst_port",
                                       name:"Dest Port",
                                       minWidth:50
                                   },
                                   {
                                       field:"deny",
                                       name:"Implicit Deny",
                                       minWidth:60
                                   },
                                   {
                                       field:"stats_bytes",
                                       name:"Bytes/Pkts",
                                       minWidth:80,
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
                                       minWidth:85
                                   }
                               ]
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        },
                        sortable : false
                    },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: function () {
                                    var aclFilter = '';
                                    if(selectedAcl != 'All'){
                                        aclFilter = '&aclUUID=' + selectedAcl;
                                        return monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) + aclFilter + '&introspectPort=' + obj['introspectPort'];
                                    }
                                    return monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) + '&introspectPort=' + obj['introspectPort'];
                                }(),
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
                footer : false,
                change:onFlowChange
            });
            flowGrid = $('#gridComputeFlows' + '_' + obj.name).data('contrailGrid');
            flowGrid.showGridMessage('loading');
            /*TODO context filtering
             * if(filters == null || filters == "" || filters == undefined){
                flowGrid.dataSource.filter({});
            }*/
        } else { 
            var newAjaxConfig;
            flowGrid = $('#gridComputeFlows' + '_' + obj.name).data('contrailGrid');
            if(selectedAcl != 'All'){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                                                            + '&aclUUID=' + selectedAcl  + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
                flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            } 
            reloadGrid(flowGrid);
        }
        function getAclSgUuuidString (data,isSearch){
            //if the request is based on a particular acl return the uuid
            if(data['acl_uuid'] != null && data['acl_uuid'] != 'All'){
                if(isSearch){
                    return data['searchUUID'];
                } else {
                    return data['acl_uuid'];
                }
            }
            var aclUuidList = ifNull(jsonPath(data,"$..policy..FlowAclUuid..uuid"),noDataStr);
            var outPolicyAclUuidList = ifNull(jsonPath(data,"$..out_policy..FlowAclUuid..uuid"),noDataStr);
            var sgUuidList = ifNull(jsonPath(data,"$..sg..FlowAclUuid..uuid"),noDataStr);
            var outSgUuidList = ifNull(jsonPath(data,"$..out_sg..FlowAclUuid..uuid"),noDataStr);
            
            var ret = '';
            if(aclUuidList.length > 0){
                ret += "<span class='text-info'>Policy:</span>";
            }
            $.each(aclUuidList,function(idx,aclUuid){
                ret += "</br>" + aclUuid;
            });
            if(outPolicyAclUuidList.length > 0){
                ret += (ret != '')?" </br><span class='text-info'>Out Policy:</span>" : 
                    "<span class='text-info'>Out Policy:</span>";
            }
            $.each(outPolicyAclUuidList,function(idx,outPolicyAclUuid){
                ret += "</br>" + outPolicyAclUuid;
            });
            if(sgUuidList.length > 0){
                ret += (ret != '')?"</br><span class='text-info'>SG:</span>" : 
                    "<span class='text-info'>SG:</span>";
            }
            $.each(sgUuidList,function(idx,sgUuid){
                ret += "</br>" + sgUuid;
            });
            if(outSgUuidList.length > 0){
                ret += (ret != '')?"</br><span class='text-info'>Out SG:</span>" : 
                    "<span class='text-info'>Out SG:</span>";
            }
            $.each(outSgUuidList,function(idx,outSgUuid){
                ret += "</br>" + outSgUuid;
            });
            return (ret == '')? noDataStr: ret;
        }
        function onSelectAcl() {
            obj.name = arguments[0].target.id.split('_')[1];
            var newIP = getIPforHostName(obj.name, 'computeNodeDS');
            if(newIP != null) {
                obj.ip = newIP; 
            }     
            nodeObj = obj;
            var acluuid = $('#aclDropDown' + '_' + obj.name).data("contrailDropdown").value();
            var flowGrid = $('#gridComputeFlows' + '_' + obj.name).data('contrailGrid');
            var newAjaxConfig = "";
            flowKeyStack = [];
            aclIterKeyStack = [];
            if (acluuid != 'All') {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                                                            + '&aclUUID=' + acluuid + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            } else {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            }
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(flowGrid);
        }
        function onNextClick(){
            obj.name = arguments[0].target.id.split('_')[1];
            var newIP = getIPforHostName(obj.name, 'computeNodeDS');
            if(newIP != null) {
                obj.ip = newIP;
            }
            var flowGrid = $('#gridComputeFlows' + '_' + obj.name).data('contrailGrid');
            var acluuid = $('#aclDropDown' + '_' + obj.name).data("contrailDropdown").value();
            var newAjaxConfig = "";
            isAllPrevFirstTimeClicked = true;
            isAclPrevFirstTimeClicked = true;
            if(acluuid == 'All' && flowKeyStack.length > 0 && flowKeyStack[flowKeyStack.length - 1] != null){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                                                            + '&flowKey=' + flowKeyStack[flowKeyStack.length - 1] + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            }
            else if (acluuid != 'All' && aclIterKeyStack.length > 0 && aclIterKeyStack[aclIterKeyStack.length -1] != null){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                        + '&iterKey=' + aclIterKeyStack[aclIterKeyStack.length -1] + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            } else if (acluuid == "All"){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            }
            flowGrid.setRemoteAjaxConfig(newAjaxConfig);
            reloadGrid(flowGrid);
        }
        function onPrevClick(){
            obj.name = arguments[0].target.id.split('_')[1];
            var newIP = getIPforHostName(obj.name, 'computeNodeDS');
            if(newIP != null) {
                obj.ip = newIP;
            }
            var flowGrid = $('#gridComputeFlows' + '_' + obj.name).data('contrailGrid');
            var acluuid = $('#aclDropDown' + '_' + obj.name).data("contrailDropdown").value();
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
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                            + '&flowKey=' + flowKeyStack.pop() 
                            + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            } else if (acluuid == 'All' && flowKeyStack.length < 1){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                        + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length > 0) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                        + '&iterKey=' + aclIterKeyStack.pop()
                        + '&introspectPort=' + obj['introspectPort'],
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length < 1) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj)
                            + '&aclUUID=' + acluuid
                            + '&introspectPort=' + obj['introspectPort'],
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
                    selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
                }
            }
        }
    }
    return {populateFlowsTab:populateFlowsTab,
        parseFlowsData:parseFlowsData};
})();
