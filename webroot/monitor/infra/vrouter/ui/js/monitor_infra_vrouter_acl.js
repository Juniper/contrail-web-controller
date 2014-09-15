/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter ACL tab
 */
monitorInfraComputeACLClass = (function() {
    this.parseACLData = function(response){

        var retArr = [];
        response = getValueByJsonPath(response,"AclResp;acl_list;list;AclSandeshData");
        //Loop through ACLs
        if(response != null){
            if(!(response instanceof Array)) {
                response = [response];
            } 
            for (var i = 0; i < response.length; i++) {
                var currACL = [];
                currACL = getValueByJsonPath(response[i],"entries;list;AclEntrySandeshData",[]);
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
                        protoRange = getValueByJsonPath(currACE,"proto_l;list;SandeshRange;min") + " - " + getValueByJsonPath(currACE,"proto_l;list;SandeshRange;max");
                        srcPortRange = getValueByJsonPath(currACE,"src_port_l;list;SandeshRange;min") + " - " + getValueByJsonPath(currACE,"src_port_l;list;SandeshRange;max");
                        dstPortRange = getValueByJsonPath(currACE,"dst_port_l;list;SandeshRange;min") + " - " + getValueByJsonPath(currACE,"dst_port_l;list;SandeshRange;max");
                        var actionList = jsonPath(currACE,'$.action_l.list.ActionStr..action');
                        if(!(actionList instanceof Array)){
                            actionList = [actionList];
                        }
                        srcType = getValueByJsonPath(currACE,"src_type");
                        dstType = getValueByJsonPath(currACE,"dst_type");
                        try{
                            srcVn = ifNullOrEmptyObject(getValueByJsonPath(currACE,"src"),noDataStr);
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
                            destVn = ifNullOrEmptyObject(getValueByJsonPath(currACE,"dst"),noDataStr);
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
                            actionList:actionList,
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
    
    this.populateACLTab = function (obj) {
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'acl',node: obj['name']},{triggerHashChange:false});
        }    
        var selectedAcl = 'All';
        if(obj['filters'] != null){
            selectedAcl = obj['filters'];
        }
        
        if (!isGridInitialized($('#gridComputeACL' + '_' + obj.name))) {
            $('#gridComputeACL' + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'ACL'
                    }
                },
                columnHeader: {
                   columns:[
                       {
                           field:"dispuuid",
                           name:"UUID",
                           minWidth:200,
                       },
                       {
                           field:"flow_count",
                           name:"Flows",
                           minWidth:50,
                           cssClass:'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                   var tabIdx = $.inArray("flows", computeNodeTabs);
                                   var data = {tab:"flows",filters:[{aclUUID:dc['uuid']}]};
                                   $('#' + computeNodeTabStrip + '_' + obj.name).data('tabFilter',data);
                                   selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
                               }
                            }
                       },
                       {
                           field:"ace_action",
                           name:"Action",
                           formatter:function(r,c,v,cd,dc){
                               return getAclActions(dc);
                           },
                           minWidth:200
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
                                   selectTab(computeNodeTabStrip + '_' + obj.name,tabIdx);
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
                                   selectTab(computeNodeTabStrip + '_' + obj.name,tabIdx);
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
                      },
                      sortable : false
                   },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: contrail.format(monitorInfraUrls['VROUTER_ACL'], getIPOrHostName(obj)),
                                type: 'GET'
                            },
                            dataParser: function(response) {
                               getSGUUIDs(getIPOrHostName(obj));
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
                }
            })
            aclGrid = $('#gridComputeACL' + '_' + obj.name).data('contrailGrid');
            aclGrid.showGridMessage('loading');
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
        function getAclActions(d){
            var ret = '';
            var aclActionList = d.actionList;
            $.each(aclActionList,function(idx,action){
                if(idx == 0){
                    ret += action;
                } else {
                    ret += ',</br>' + action;
                }
            });
            return (ret == '')? noDataStr: ret;
        }
        function onACLChange() {
            var name;
            if (name = isCellSelectable(this.select())) {
                if ($.inArray(name, ['src_vn', 'dst_vn']) > -1)
                    var tabIdx = $.inArray("networks", computeNodeTabs);
                    selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
                if (name == 'flows') {
                    var dataItem = this.dataItem(this.select()[0].parentNode);
                    var filters = dataItem.uuid;
                    $('#compute_tabstrip').data(filters, uuid);
                    var tabIdx = $.inArray("flows", computeNodeTabs);
                    selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx,filters);
                    //TODO removing the filtering because of some issues layoutHandler.setURLHashParams({tab:'flows', obj['ip'],node:'vRouters:' + obj['name'], filters:filters});
                }
            }
        }
        function onAclSelect(){
            var datasource = $("#gridComputeACL" + '_' + obj.name).data("contrailGrid").dataSource;
            var filters = datasource.filter();
            var selectedAcl = $('#aclComboBox').data("contrailDropdown").value();
            if(selectedAcl == "All")
                filters = [];
            else 
                filters = { field: "uuid", operator: "eq", value: selectedAcl };
            datasource.filter(filters);
        }
    }
    return {populateACLTab:populateACLTab,
        parseACLData:parseACLData};
})();
