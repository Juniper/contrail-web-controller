/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Flows tab
 */
monitorInfraComputeFlowsClass = (function() {
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
                    ret.push({src_vn:ifNullOrEmptyObject(obj['source_vn'],noDataStr),
                        dst_vn:ifNullOrEmptyObject(obj['dest_vn'],noDataStr),
                        sip:ifNullOrEmptyObject(obj['src'],noDataStr),
                        src_port:ifNullOrEmptyObject(obj['src_port'],noDataStr),
                        dst_port:ifNullOrEmptyObject(obj['dst_port'],noDataStr),
                        setup_time_utc:ifNullOrEmptyObject(obj['setup_time_utc'],noDataStr),
                        protocol:ifNullOrEmptyObject(obj['protocol'],noDataStr),
                        dip:ifNullOrEmptyObject(obj['dst'],noDataStr),
                        stats_bytes:ifNullOrEmptyObject(obj['bytes'],noDataStr),
                        stats_packets:ifNullOrEmptyObject(obj['packets'],noDataStr),
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
        //Push the aclIterKey to the stack for Next use
        if(iterationKey != null && !$.isEmptyObject(iterationKey)){
            //Had to add this hack because sometimes we get into to this parse function twice leading this to be added twice to the stack
            if(iterationKey.indexOf('0:0:0:0:0.0.0.0:0.0.0.0') == -1 && aclIterKeyStack[aclIterKeyStack.length - 1] != iterationKey)
                aclIterKeyStack.push(iterationKey);
        }
        //$('#flowCnt').text(response.flowData.length);
        return ret;
    
    }
    
    this.populateFlowsTab = function (obj,filters) {
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
        layoutHandler.setURLHashParams({tab:'flows',node: obj['name']},{triggerHashChange:false});
        if (!isInitialized('#aclDropDown')){
            $('#aclDropDown').contrailDropdown({
                dataSource: {
                    type: 'remote',
                     url: contrail.format(monitorInfraUrls['VROUTER_ACL'], getIPOrHostName(obj)),
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
        } 
        
        if (!isInitialized('#gridComputeFlows')) {
            $("#gridComputeFlows").contrailGrid({
                header : {
                    title : {
                        text : 'Flows'
                    }
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
                                    minWidth:260
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
                                               selectTab(computeNodeTabStrip,tabIdx);
                                           }
                                        },
                                       minWidth:195
                                   },
                                   {
                                       field:"sip",
                                       name:"Src IP",
                                       minWidth:100
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
                                               selectTab(computeNodeTabStrip,tabIdx);
                                           }
                                        },
                                       minWidth:195
                                   },
                                   {
                                       field:"dip",
                                       name:"Dest IP",
                                       minWidth:100
                                   },
                                   {
                                       field:"dst_port",
                                       name:"Dest Port",
                                       minWidth:50
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
                                url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj),
                                /* TODO use this while implementing context filtering
                                function () {
                                    var aclFilter = '';
                                    if(selectedAcl != 'All'){
                                        aclFilter = '&aclUUID=' + selectedAcl;
                                    }
                                    return '/api/admin/monitor/infrastructure/vrouter/flows?ip=' + getIPOrHostName(obj) + aclFilter;
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
            flowGrid.dataSource.transport.options.read.url = '/api/admin/monitor/infrastructure/vrouter/flows?ip=' + getIPOrHostName(obj);
            */
            reloadGrid(flowGrid);
            //flowGrid.showColumn(0);
        }
        function getAclSgUuuidString (data){
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
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                                                            + '&aclUUID=' + acluuid,
                        type:'Get'
                    };
            } else {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj),
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
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                                                            + '&flowKey=' + flowKeyStack[flowKeyStack.length - 1],
                        type:'Get'
                    };
            }
            else if (acluuid != 'All' && aclIterKeyStack.length > 0 && aclIterKeyStack[aclIterKeyStack.length -1] != null){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                        + '&iterKey=' + aclIterKeyStack[aclIterKeyStack.length -1],
                        type:'Get'
                    };
            } else if (acluuid == "All"){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj),
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
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                            + '&flowKey=' + flowKeyStack.pop(),
                        type:'Get'
                    };
            } else if (acluuid == 'All' && flowKeyStack.length < 1){
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj),
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length > 0) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj) 
                        + '&iterKey=' + aclIterKeyStack.pop(),
                        type:'Get'
                    };
            } else if(acluuid != 'All' && aclIterKeyStack.length < 1) {
                newAjaxConfig = {
                        url: monitorInfraUrls['VROUTER_FLOWS'] + '?ip=' + getIPOrHostName(obj)
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
    return {populateFlowsTab:populateFlowsTab};
})();