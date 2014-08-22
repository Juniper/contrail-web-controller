/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Routes tab
 */
monitorInfraComputeRoutesClass = (function() {
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
        var paths = [];
        var l2Data = jsonPath(response,'$..RouteL2SandeshData')[0];
        if(l2Data != null){
            if(!(l2Data instanceof Array)){
                l2Data = [l2Data];
            }
            $.each(l2Data, function(i,obj){
                var mac = getValueByJsonPath(obj,'mac',noDataStr);
                var srcVRF = getValueByJsonPath(obj,'src_vrf',noDataStr);
                var pathSandeshData = getValueByJsonPath(obj,'path_list;list;PathSandeshData',[]);
                if(!(pathSandeshData instanceof Array)){
                    pathSandeshData = [pathSandeshData];
                }
                $.each(pathSandeshData,function(j,currPath){
                    var rawJson = currPath;
                    if(j == 0)
                        paths.push({mac:mac,path:currPath,src_vrf:srcVRF,raw_json:rawJson});
                    else 
                        paths.push({mac:'',path:currPath,src_vrf:srcVRF,raw_json:rawJson});
                });
            });
        }
        return paths;
    
    }
    
    this.populateRoutesTab = function(obj){

        layoutHandler.setURLHashParams({tab:'routes',node: obj['name']},{triggerHashChange:false});
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
                     url: contrail.format(monitorInfraUrls['VROUTER_VRF_LIST'], getIPOrHostName(obj)),
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
                url: monitorInfraUrls['VROUTER_BASE'] + selectedRadio +'-routes?ip=' + getIPOrHostName(obj) + '&vrfindex=' + index,
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
                            text : 'Routes'
                        }
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
                                 minWidth:200,
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
                            },
                            sortable: false
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
                                        return contrail.format(monitorInfraUrls['VROUTER_UNICAST_ROUTES'] , getIPOrHostName(obj), ucIndex)
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
                            text : 'Routes'
                        }
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
                                 minWidth:200,
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
                            },
                            sortable: false
                        },
                        dataSource : {
                            remote: {
                                ajaxConfig: {
                                    url: function(){
                                        var selectedVrf = cboVRF.value();;
                                        var mcIndex = getIndexForType(selectedVrf,'mcast');
                                        return contrail.format(monitorInfraUrls['VROUTER_MCAST_ROUTES'], getIPOrHostName(obj), mcIndex);
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
                            text : 'Routes'
                        }
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
                                 minWidth:200,
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
                            },
                            sortable: false
                        },
                        dataSource : {
                            remote: {
                                ajaxConfig: {
                                    url: function(){
                                        var selectedVrf = cboVRF.value();;
                                        var l2index = getIndexForType(selectedVrf,'l2');
                                        return contrail.format(monitorInfraUrls['VROUTER_L2_ROUTES'], getIPOrHostName(obj), l2index);
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
    return {populateRoutesTab:populateRoutesTab,
        parseUnicastRoutesData:parseUnicastRoutesData,
        parseMulticastRoutesData:parseMulticastRoutesData,
        parseL2RoutesData:parseL2RoutesData};
})();