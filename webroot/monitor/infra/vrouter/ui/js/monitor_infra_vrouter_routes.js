/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Routes tab
 */
monitorInfraComputeRoutesClass = (function() {
    var paginationInfo = {};
    function getPaginationInfo() {
        return paginationInfo;
    }
    this.parseUnicastRoutesData = function(response){

        var ucastPaths = jsonPath(response,'$..PathSandeshData');
        paginationInfo = getIntrospectPaginationInfo(response);
        updateGridTitleWithPagingInfo($('#gridvRouterUnicastRoutes'),paginationInfo);
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
                    paths.push({dispPrefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});
                else
                    paths.push({dispPrefix:'',prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});

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
        paginationInfo = getIntrospectPaginationInfo(response);
        updateGridTitleWithPagingInfo($('#gridvRouterMulticastRoutes'),paginationInfo);
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
                    paths.push({dispPrefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],raw_json:rawJson});
                else
                    paths.push({dispPrefix:'',prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],raw_json:rawJson});

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
        paginationInfo = getIntrospectPaginationInfo(response);
        updateGridTitleWithPagingInfo($('#gridvRouterL2Routes'),paginationInfo);
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
                        paths.push({mac:mac,searchMac:mac,path:currPath,src_vrf:srcVRF,raw_json:rawJson});
                    else 
                        paths.push({mac:'',searchMac:mac,path:currPath,src_vrf:srcVRF,raw_json:rawJson});
                });
            });
        }
        return paths;
    
    }
    
    this.parseIPv6RoutesData = function(response){

        var ucastPaths = jsonPath(response,'$..PathSandeshData');
        paginationInfo = getIntrospectPaginationInfo(response); 
        updateGridTitleWithPagingInfo($('#gridvRouterIpv6Routes'),paginationInfo);
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
                    paths.push({dispPrefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});
                else
                    paths.push({dispPrefix:'',prefix:srcIPs[idx] + ' / ' + srcPrefixLens[idx],path:currPath,src_ip:srcIPs[idx],src_plen:srcPrefixLens[idx],src_vrf:srcVRFs[idx],raw_json:rawJson});

            });
        });
        return paths;
    
    }
    
    this.populateRoutesTab = function(obj){
        layoutHandler.setURLHashParams({tab:'routes',node: obj['name']},{triggerHashChange:false});
        var routesGrid,ucIndex,mcIndex;
        var rdoRouteType = $('#routeType').val();
        var cboVRF;
        var selectedRoute;
        var tabFilter =  $('#' + computeNodeTabStrip).data('tabFilter');
        var filters,vrfDefObj = $.Deferred();
        if(tabFilter != null && tabFilter['tab'] == 'routes'){
            filters = tabFilter['filters'];
            $('#' + computeNodeTabStrip).removeData('tabFilter');
        }
        if (filters != null){
            selectedRoute = filters[0]['routeName'];
        }
        if(isDropdownInitialized('comboVRF')) {
            cboVRF = $('#comboVRF').data('contrailDropdown');
            vrfDefObj.resolve();
//            cboVRF.select(function(dataItem) {
//                return dataItem.name === selectedRoute;
//            });
//            cboVRF.dataSource.read();
        } else {
            cboVRF = $('#comboVRF').contrailDropdown({
                dataSource: {
                    type: 'remote',
                     url: contrail.format(monitorInfraUrls['VROUTER_VRF_LIST'], getIPOrHostName(obj), obj['introspectPort']),
                     dataType: 'xml',
                     async: true,
                     parse:function(response){
                      if(response != null) {
                          var ret = [];
                          var vrfs = response.getElementsByTagName('VrfSandeshData');
                          $.each(vrfs,function(idx,vrfXmlObj){
                              var name = getValueByJsonPath(vrfXmlObj.getElementsByTagName('name'),'0;innerHTML','');
                              var ucIndex = getValueByJsonPath(vrfXmlObj.getElementsByTagName('ucindex'),'0;innerHTML','');
                              var mcIndex = getValueByJsonPath(vrfXmlObj.getElementsByTagName('mcindex'),'0;innerHTML','');
                              var l2Index = getValueByJsonPath(vrfXmlObj.getElementsByTagName('l2index'),'0;innerHTML','');
                              var uc6Index = getValueByJsonPath(vrfXmlObj.getElementsByTagName('uc6index'),'0;innerHTML','');
                              var value = "ucast=" + ucIndex + "&&mcast=" + mcIndex + "&&l2=" + l2Index + "&&ucast6=" + uc6Index;
                              ret.push({name:name,value:value});
                          });
                          //Intialize the grid
                          window.setTimeout(function() { vrfDefObj.resolve();initUnicastRoutesGrid(ret[0]); },200);
                          return ret; 
                      }
                     }
                 },
                dropdownCssClass: 'select2-large-width',
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
        if(selectedRoute != null) {
             vrfDefObj.done(function(){
                 setVrfAndPopulateRoutes();
             });
             if(vrfDefObj.state() != 'pending') {
                 setVrfAndPopulateRoutes();
             }
             function setVrfAndPopulateRoutes() {
                 cboVRF.text(selectedRoute);
                 var selectedData = {};
                 var data = $("#comboVRF").data('contrailDropdown').getAllData();
                 for(var i = 0; i < data.length; i++) {
                     if(data[i].name === selectedRoute){
                         selectedData = data[i];
                         break;
                     }
                 }
                 var gridId = 'gridvRouterUnicastRoutes';
                 var gridRenderFn = initUnicastRoutesGrid;
                 var urlConstructFn = constructvRouterUnicastRouteURL;
                 if ($('#rdboxUnicast').is(':checked') == true) {
                     gridId = 'gridvRouterUnicastRoutes';
                     gridRenderFn = initUnicastRoutesGrid;
                     urlConstructFn = constructvRouterUnicastRouteURL;
                 } else if ($('#rdboxMulticast').is(':checked') == true) {
                     gridId = 'gridvRouterMulticastRoutes';
                     gridRenderFn = initMulticastRoutesGrid;
                     urlConstructFn = constructvRouterMulticastURL;
                 } else if ($('#rdboxL2').is(':checked') == true) {
                     gridId = 'gridvRouterL2Routes';
                     gridRenderFn = initL2RoutesGrid;
                     urlConstructFn = constructvRouterL2RouteURL;
                 } else if ($("#rdboxIpv6").is(':checked') ==  true) {
                     gridId = 'gridvRouterIpv6Routes';
                     gridRenderFn = initIPv6Grid;
                     urlConstructFn = constructvRouterUnicast6RouteURL;
                 }
                 if (!isGridInitialized($('#'+gridId))) {
                     gridRenderFn(selectedData);
                 } else if ($('#'+gridId).data('contrailGrid') != null){
                     var routeGrid = $('#'+gridId).data('contrailGrid');
                     var newAjaxConfig = urlConstructFn(selectedData);
                     routeGrid.setRemoteAjaxConfig({
                         url: newAjaxConfig['url'] + '?' + $.param(newAjaxConfig['params']),
                         type: 'Get'
                     });
                     reloadGrid(routeGrid);
                 }
             }
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
            $("#gridvRouterUnicastRoutes").html('');
            $("#gridvRouterMulticastRoutes").html('');
            $("#gridvRouterL2Routes").html('');
            $("#gridvRouterIpv6Routes").html('');
        }
        function onRouteTypeChange() {
            resetAllTypes();
            if($('#rdboxUnicast').is(':checked') == true) {
                if($("#gridvRouterMulticastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes");
                }
                if($("#gridvRouterL2Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes");
                }
                if($("#gridvRouterIpv6Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes");
                }
                initUnicastRoutesGrid();
                $("#gridvRouterUnicastRoutes").show();
            }
            else if($('#rdboxMulticast').is(':checked') == true) {
                if($("#gridvRouterUnicastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes");
                }
                if($("#gridvRouterL2Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes");
                }
                if($("#gridvRouterIpv6Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes");
                }
                initMulticastRoutesGrid();
                $("#gridvRouterMulticastRoutes").show();
            } else if($('#rdboxL2').is(':checked') == true) {
                if($("#gridvRouterMulticastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes");
                }
                if($("#gridvRouterUnicastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes");
                }
                if($("#gridvRouterIpv6Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterIpv6Routes");
                }
                initL2RoutesGrid();
                $("#gridvRouterL2Routes").show();
            } else {
                if($("#gridvRouterMulticastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterMulticastRoutes");
                }
                if($("#gridvRouterUnicastRoutes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterUnicastRoutes");
                }
                if($("#gridvRouterL2Routes").data("contrailGrid") !=null) {
                    destroyAndHide("#gridvRouterL2Routes");
                }
                initIPv6Grid();
                $("#gridvRouterIpv6Routes").show();
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
                url: monitorInfraUrls['VROUTER_BASE'] + selectedRadio 
                    +'-routes?ip=' + getIPOrHostName(obj) 
                    + '&vrfindex=' + index  
                    + '&introspectPort=' + obj['introspectPort'],
                type:'Get'
            };
            var constructURLMap = {
                l2: constructvRouterL2RouteURL,
                ucast: constructvRouterUnicastRouteURL,
                mcast: constructvRouterMulticastURL,
                ucast6: constructvRouterUnicast6RouteURL
            };
            newAjaxConfig = constructURLMap[selectedRadio]();
            // var gridMap = {
            //     l2 : l2RoutesGrid,
            //     ucast : unicastRoutesGrid,
            //     mcast : multicastRoutesGrid,
            //     ucast6 : ipv6RoutesGrid
            // };
            routesGrid.setRemoteAjaxConfig({
                url: newAjaxConfig['url'] + '?' + $.param(newAjaxConfig['params']),
                type: 'Get'
            });
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

        function constructvRouterUnicastRouteURL(initialSelection) {
            var selectedVrf = cboVRF.value();
            var ucIndex = getIndexForType(selectedVrf,'ucast');
            if(initialSelection != null){
                selectedVrf = initialSelection['value'];
            }
            var urlParams = {
                ip : getIPOrHostName(obj),
                introspectPort : obj['introspectPort'],
                vrfindex: ucIndex
            }
            return {
                url: monitorInfraUrls['VROUTER_UNICAST_ROUTES'],
                params:urlParams
            }
        }

        function constructvRouterL2RouteURL() {
            var selectedVrf = cboVRF.value();;
            var l2index = getIndexForType(selectedVrf,'l2');
            var urlParams = {
                ip : getIPOrHostName(obj),
                introspectPort : obj['introspectPort'],
                vrfindex: l2index
            }
            return {
                url: monitorInfraUrls['VROUTER_L2_ROUTES'],
                params:urlParams
            }
        }

        function constructvRouterMulticastURL() {
            var selectedVrf = cboVRF.value();;
            var mcIndex = getIndexForType(selectedVrf,'mcast');
            var urlParams = {
                ip : getIPOrHostName(obj),
                introspectPort : obj['introspectPort'],
                vrfindex: mcIndex
            }
            return {
                url: monitorInfraUrls['VROUTER_MCAST_ROUTES'],
                params:urlParams
            }
        }

        function constructvRouterUnicast6RouteURL(initialSelection) {
            var selectedVrf = cboVRF.value();
            if(initialSelection != null){
                selectedVrf = initialSelection['value'];
            }
            var ucIndex = getIndexForType(selectedVrf,'ucast6');
            var urlParams = {
                ip : getIPOrHostName(obj),
                introspectPort : obj['introspectPort'],
                vrfindex: ucIndex
            }
            return {
                url: monitorInfraUrls['VROUTER_UCAST6_ROUTES'],
                params:urlParams 
            }
        }

        function resetForm() {
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
                        },
                        customControls: [
                                        '<a class="widget-toolbar-icon"><i class="icon-step-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-step-backward"></i></a>',
                                ]
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"dispPrefix",
                                 id:"Prefix",
                                 name:"Prefix",
                                 minWidth:50,
                                 searchFn:function(d){
                                     return d['prefix'];
                                 },
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
                                    url: function() {
                                        var urlObj = constructvRouterUnicastRouteURL(initialSelection);
                                        return urlObj['url']  + '?' + $.param(urlObj['params']);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseUnicastRoutesData
                            },
                            events: {
                                onDataBoundCB: function() {
                                    routesGrid.removeGridMessage('loading');
                                }
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
                    footer:false
                });
                bindGridPrevNextListeners({
                    gridSel: $('#gridvRouterUnicastRoutes'),
                    resetFn: resetForm,
                    paginationInfoFn:getPaginationInfo,
                    obj: obj,
                    getUrlFn: function() {
                        return constructvRouterUnicastRouteURL();
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
                        },
                        customControls: [
                                        '<a class="widget-toolbar-icon"><i class="icon-step-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-step-backward"></i></a>',
                                ]
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"dispPrefix",
                                 id:"Prefix",
                                 name:"Source / Group",
                                 searchFn:function(d){
                                     return d['prefix'];
                                 },
                                 minWidth:150
                             },
                             {
                                 field:"next_hop",
                                 id:"next_hop",
                                 name:"Next hop Type",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopType(dc);
                                 },
                                 minWidth:100
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
                                    url: function() {
                                        var urlObj = constructvRouterMulticastURL();
                                        return urlObj['url']  + '?' + $.param(urlObj['params']);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseMulticastRoutesData
                            },
                            events: {
                                onDataBoundCB: function() {
                                    routesGrid.removeGridMessage('loading');
                                }
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
                    footer:false
                });
                bindGridPrevNextListeners({
                    gridSel: $('#gridvRouterMulticastRoutes'),
                    resetFn: resetForm,
                    paginationInfoFn:getPaginationInfo,
                    obj: obj,
                    getUrlFn: function() {
                        return constructvRouterMulticastURL();
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
                        },
                        customControls: [
                                        '<a class="widget-toolbar-icon"><i class="icon-step-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-step-backward"></i></a>',
                                ]
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"mac",
                                 id:"Mac",
                                 name:"Mac",
                                 searchFn:function(d){
                                     return d['searchMac'];
                                 },
                                 minWidth:150
                             },
                             {
                                 field:"next_hop",
                                 id:"next_hop",
                                 name:"Next hop Type",
                                 formatter:function(r,c,v,cd,dc){
                                     return bgpMonitor.getNextHopType(dc);
                                 },
                                 minWidth:100
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
                                    url: function() {
                                        var urlObj = constructvRouterL2RouteURL();
                                        return urlObj['url']  + '?' + $.param(urlObj['params']);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseL2RoutesData
                            },
                            events: {
                                onDataBoundCB: function() {
                                    routesGrid.removeGridMessage('loading');
                                }
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
                    footer:false
                });
                bindGridPrevNextListeners({
                    gridSel: $('#gridvRouterL2Routes'),
                    resetFn: resetForm,
                    paginationInfoFn:getPaginationInfo,
                    obj: obj,
                    getUrlFn: function() {
                        return constructvRouterL2RouteURL();
                    }
                });
                routesGrid = $('#gridvRouterL2Routes').data('contrailGrid'); 
                routesGrid.showGridMessage('loading');
            } else {
                routesGrid = $('#gridvRouterL2Routes').data('contrailGrid'); 
                reloadGrid(routesGrid);
            }
        }
        
        function initIPv6Grid(initialSelection) {
            if (!isGridInitialized($('#gridvRouterIpv6Routes'))) {
                /*cboVRF.select(function(dataItem) {
                    return dataItem.text === selectedRoute;
                });*/
                //cboVRF.select(1);

                $("#gridvRouterIpv6Routes").contrailGrid({
                    header : {
                        title : {
                            text : 'Routes'
                        },
                        customControls: [
                                        '<a class="widget-toolbar-icon"><i class="icon-step-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                                        '<a class="widget-toolbar-icon"><i class="icon-step-backward"></i></a>',
                                ]
                    },
                    columnHeader : {
                        columns:[
                             {
                                 field:"dispPrefix",
                                 id:"Prefix",
                                 name:"Prefix",
                                 searchFn:function(d){
                                     return d['prefix'];
                                 },
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
                                    url: function() {
                                        var urlObj = constructvRouterUnicast6RouteURL(initialSelection);
                                        return urlObj['url']  + '?' + $.param(urlObj['params']);
                                    }(),
                                    type: 'GET'
                                },
                                dataParser: self.parseIPv6RoutesData
                            },
                            events: {
                                onDataBoundCB: function() {
                                    routesGrid.removeGridMessage('loading');
                                }
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
                    },
                    footer:false
                });
                routesGrid = $('#gridvRouterIpv6Routes').data('contrailGrid');
                routesGrid.showGridMessage('loading');
                bindGridPrevNextListeners({
                    gridSel: $('#gridvRouterIpv6Routes'),
                    resetFn: resetForm,
                    paginationInfoFn:getPaginationInfo,
                    obj: obj,
                    getUrlFn: function() {
                        return constructvRouterUnicast6RouteURL();
                    }
                });
            } else {
                routesGrid = $('#gridvRouterIpv6Routes').data('contrailGrid');
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
