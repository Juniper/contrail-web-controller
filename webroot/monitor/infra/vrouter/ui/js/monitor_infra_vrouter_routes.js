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
    
    this.parseIPv6RoutesData = function(response){

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
        return paths;
    
    }
    
    this.populateRoutesTab = function(obj){
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'routes',node: obj['name']},{triggerHashChange:false});
        }    
        var routesGrid,ucIndex,mcIndex;
        var rdoRouteType = $('#routeType' + '_' + obj.name).val();
        var cboVRF;
        var selectedRoute;
        var tabFilter =  $('#' + computeNodeTabStrip + '_' + obj.name).data('tabFilter');
        var filters;
        if(tabFilter != null && tabFilter['tab'] == 'routes'){
            filters = tabFilter['filters'];
            $('#' + computeNodeTabStrip + '_' + obj.name).removeData('tabFilter');
        }
        if (filters != null){
            selectedRoute = filters[0]['routeName'];
        }
        if(isDropdownInitialized('comboVRF' + '_' + obj.name)) {
            cboVRF = $('#comboVRF' + '_' + obj.name).data('contrailDropdown');
//            cboVRF.select(function(dataItem) {
//                return dataItem.name === selectedRoute;
//            });
//            cboVRF.dataSource.read();
        } else {
            cboVRF = $('#comboVRF' + '_' + obj.name).contrailDropdown({
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
                            var uc6Index = ifNull(obj.uc6index,'');
                            var value = "ucast=" + ucIndex + "&&mcast=" + mcIndex + "&&l2=" + l2Index + "&&ucast6=" + uc6Index;
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
            $('input[name="routeType' + '_' + obj.name + '"]').change(onRouteTypeChange);
        }
        if(selectedRoute != null) {
             cboVRF.text(selectedRoute);
        }
        function destroyAndHide(currentTypeDivId){
            $(currentTypeDivId).data("contrailGrid").destroy();
            //removeAllAttributesOfElement(currentTypeDivId);
            //$(currentTypeDivId).removeAttributes();
            $(currentTypeDivId).removeAttr('style');
            $(currentTypeDivId).removeAttr('data-role');
            $(currentTypeDivId).hide();
        }
        function resetAllTypes(){
            $("#gridvRouterUnicastRoutes" + '_' + obj.name).html('');
            $("#gridvRouterMulticastRoutes" + '_' + obj.name).html('');
            $("#gridvRouterL2Routes" + '_' + obj.name).html('');
            $("#gridvRouterIpv6Routes" + '_' + obj.name).html('');
        }
        function onRouteTypeChange() {
            obj.name = arguments[0].target.id.split('_')[1];
            var newIP = getIPforHostName(obj.name, 'computeNodeDS');
            if(newIP != null) {
                obj.ip = newIP; 
            }
            resetAllTypes();
            if($('#rdboxUnicast' + '_' + obj.name).is(':checked') == true) {
                if($("#gridvRouterMulticastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterL2Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes" + '_' + obj.name);
                }
                if($("#gridvRouterIpv6Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes" + '_' + obj.name);
                }
                initUnicastRoutesGrid();
                $("#gridvRouterUnicastRoutes" + '_' + obj.name).show();
            }
            else if($('#rdboxMulticast' + '_' + obj.name).is(':checked') == true) {
                if($("#gridvRouterUnicastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterL2Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes" + '_' + obj.name);
                }
                if($("#gridvRouterIpv6Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes" + '_' + obj.name);
                }
                initMulticastRoutesGrid();
                $("#gridvRouterMulticastRoutes" + '_' + obj.name).show();
            } else if($('#rdboxL2' + '_' + obj.name).is(':checked') == true) {
                if($("#gridvRouterMulticastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterUnicastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterIpv6Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes" + '_' + obj.name);
                }
                initL2RoutesGrid();
                $("#gridvRouterL2Routes" + '_' + obj.name).show();
            } else {
                if($("#gridvRouterMulticastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterUnicastRoutes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes" + '_' + obj.name);
                }
                if($("#gridvRouterL2Routes" + '_' + obj.name).data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes" + '_' + obj.name);
                }
                initIPv6Grid();
                $("#gridvRouterIpv6Routes" + '_' + obj.name).show();
            }
        }

        function onVRFChange(e) {
            var selectedRadio = "";
            var index = '';
            var selected = $("input[type='radio'][name='routeType"+ '_' + obj.name + "']:checked");
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
            if (!isGridInitialized($('#gridvRouterUnicastRoutes' + '_' + obj.name))) {
                /*cboVRF.select(function(dataItem) {
                    return dataItem.text === selectedRoute;
                });*/
                //cboVRF.select(1);

                $("#gridvRouterUnicastRoutes" + '_' + obj.name).contrailGrid({
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
                            sortable: false,
                            onRenderComplete : function() {
                                //$('#compute_tabstrip' + '_' + obj.name + ' .slick-cell').attr('style', 'font-size:0.85em;');
                                //$('#compute_tabstrip' + '_' + obj.name + ' .slick-column-name').attr('style', 'font-size:0.85em;');
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
                routesGrid = $('#gridvRouterUnicastRoutes' + '_' + obj.name).data('contrailGrid');
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterUnicastRoutes' + '_' + obj.name).data('contrailGrid');
                reloadGrid(routesGrid);
            }
        }
        
      //Initialize grid only after getting vrfList
        function initMulticastRoutesGrid() {
            if (!isGridInitialized($('#gridvRouterMulticastRoutes' + '_' + obj.name))) {
                $("#gridvRouterMulticastRoutes" + '_' + obj.name).contrailGrid({
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
                routesGrid = $('#gridvRouterMulticastRoutes' + '_' + obj.name).data('contrailGrid');     
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterMulticastRoutes' + '_' + obj.name).data('contrailGrid');  
                reloadGrid(routesGrid);
            }
        }
        
        function initL2RoutesGrid() {
            if (!isGridInitialized($('#gridvRouterL2Routes' + '_' + obj.name))) {
                
                $("#gridvRouterL2Routes" + '_' + obj.name).contrailGrid({
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
                routesGrid = $('#gridvRouterL2Routes' + '_' + obj.name).data('contrailGrid'); 
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterL2Routes' + '_' + obj.name).data('contrailGrid'); 
                reloadGrid(routesGrid);
            }
        }
        
        function initIPv6Grid(initialSelection) {
            if (!isGridInitialized($('#gridvRouterIpv6Routes' + '_' + obj.name))) {
                /*cboVRF.select(function(dataItem) {
                    return dataItem.text === selectedRoute;
                });*/
                //cboVRF.select(1);

                $("#gridvRouterIpv6Routes" + '_' + obj.name).contrailGrid({
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
                                        var ucIndex = getIndexForType(selectedVrf,'ucast6');
                                        return contrail.format(monitorInfraUrls['VROUTER_UCAST6_ROUTES'] , getIPOrHostName(obj), ucIndex)
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseIPv6RoutesData
                            }
                        },
                        statusMessages: {
                            loading: {
                                text: 'Loading IPV6 Routes..',
                            },
                            empty: {
                                text: 'No IPV6 Routes to display'
                            }, 
                            errorGettingData: {
                                type: 'error',
                                iconClasses: 'icon-warning',
                                text: 'Error in getting Data.'
                            }
                        }
                    }
                });
                routesGrid = $('#gridvRouterIpv6Routes' + '_' + obj.name).data('contrailGrid');
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterIpv6Routes' + '_' + obj.name).data('contrailGrid');
                reloadGrid(routesGrid);
            }
        }
    
    }
    return {populateRoutesTab:populateRoutesTab,
        parseUnicastRoutesData:parseUnicastRoutesData,
        parseMulticastRoutesData:parseMulticastRoutesData,
        parseL2RoutesData:parseL2RoutesData,
        parseIPv6RoutesData:parseIPv6RoutesData};
})();