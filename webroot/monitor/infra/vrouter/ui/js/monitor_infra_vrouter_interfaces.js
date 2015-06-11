/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Interfaces tab
 */
monitorInfraComputeInterfacesClass = (function() {

    var paginationInfo = {};
    /*
     * var vRouterInterfacesDS = new ContrailDataView();
     * function populatevRouterInterfacesDS(obj) {
     *     var transportCfg = {
     *         url:contrail.format(monitorInfraUrls['VROUTER_INTERFACES'], getIPOrHostName(obj),obj['introspectPort'])
     *     }
     *     getOutputByPagination(vRouterInterfacesDS, {
     *         transportCfg: transportCfg,
     *         paginationServer: 'introspect',
     *         parseFn: self.parseInterfaceData
     *     });
     * }
     */
    this.parseInterfaceData = function(response) {
        var retArray = [];
        var sandeshData = jsonPath(response,'$..ItfSandeshData');
        paginationInfo = getIntrospectPaginationInfo(response);
        updateGridTitleWithPagingInfo($('#gridComputeInterfaces'),paginationInfo);
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
                if(obj['vm_uuid'] == "" && obj['vm_name'] == "") {
                    dispVMName = '';
                }
                obj['dispName'] = obj['name'];
                if(new RegExp(/logical-port|remote-physical-port/).test(obj['type'])) {
                    var parts = obj['name'].split(":"); 
                    if(parts.length == 3){ 
                        obj['dispName'] = contrail.format('{0} ({1}:{2})',parts[2],parts[0],parts[1]);
                    } 
                } 
                if(new RegExp(/vport|logical-port|remote-physical-port/).test(obj['type'])) {
                    if(obj.fip_list != null) {
                        var fipList = [];
                        fipList = ifNull(jsonPath(obj,"$..FloatingIpSandeshList")[0],[]);
                        obj['disp_fip_list'] = floatingIPCellTemplate(fipList);
                    }
                    retArray.push({uuid:obj['uuid'],name:obj['name'],label:obj['label'],active:obj['active'],
                        dispName: obj['dispName'],
                        type:obj['type'],
                        vn_name:obj['vn_name'],disp_vn_name:dispVNName,vm_uuid:obj['vm_uuid'],
                        vm_name:obj['vm_name'],disp_vm_name:dispVMName,ip_addr:obj['ip_addr'],
                        disp_fip_list:obj['disp_fip_list'],raw_json:rawJson});
                }
            });
        }
        return retArray;
    }

    function getPaginationInfo() {
        return paginationInfo;
    }

    function resetForm() {
        $('#gridComputeInterfaces').parent().find("[name='itfMac']").val('');
        $('#gridComputeInterfaces').parent().find("[name='itfNetwork']").val('');
        $('#gridComputeInterfaces').parent().find("[name='itfName']").val('');
        $('#gridComputeInterfaces').parent().find("[name='itfNetwork']").val('');
        if($('#itfType').length > 0 && $('#itfType').data('contrailDropdown') != null) { 
            $('#itfType').data('contrailDropdown').value('');
        }
    }

    function constructvRouterIntfUrl(obj) {
        var vRouterIntfURL = monitorInfraUrls['VROUTER_INTERFACES'];
        var urlParams = {
            ip : getIPOrHostName(obj),
            introspectPort : obj['introspectPort'],
            name:'',
            type:'',
            uuid:'',
            vn:'',
            mac:'',
            ipv4_address:'',
            ipv6_address:'',
            parent_uuid:''
        }
        var itfMacFilter = $('#gridComputeInterfaces').parent().find("[name='itfMac']").val();
        if(itfMacFilter != null) {
            urlParams['mac'] = itfMacFilter.trim();
        }
        var itfNetworkFilter = $('#gridComputeInterfaces').parent().find("[name='itfNetwork']").val();
        if(itfNetworkFilter != null) {
            urlParams['vn'] = itfNetworkFilter.trim();
        }
        var itfNameFilter = $('#gridComputeInterfaces').parent().find("[name='itfName']").val();
        if(itfNameFilter != null) {
            urlParams['name'] = itfNameFilter.trim();
        }
        var itfTypeFilter = $('#gridComputeInterfaces').parent().find("[name='itfType']").val();
        if(itfTypeFilter != null) {
            if(itfTypeFilter == 'any') {
                urlParams['type'] = '';
            } else {
                urlParams['type'] = itfTypeFilter.trim();
            }
        }

        var itfIPFilter = $('#gridComputeInterfaces').parent().find("[name='itfIP']").val();
        if(isIPv4(itfIPFilter)) {
            urlParams['ipv4_address'] = itfIPFilter.trim();
        }
        if(isIPv6(itfIPFilter)) {
            urlParams['ipv6_address'] = itfIPFilter.trim();
        }
        return {
            url: vRouterIntfURL,
            params:urlParams
        }
    }
    
    this.populateInterfaceTab = function (obj) {
        //Push only tab & node parameter in URL
        layoutHandler.setURLHashParams({tab:'interfaces',node:obj['name']},{triggerHashChange:false});
        
        if (!isGridInitialized('#gridComputeInterfaces')) {
            $('#itfType').contrailDropdown({
                data: [{
                    id:'any',
                    text:'Any'
                },{
                    id:'vmi',
                    text:'vport'
                },{
                    id:'physical',
                    text:'remote-physical-port'
                },{
                    id:'logical',
                    text:'logical-port'
                }]
            });
            $('#itfType').select2('val','any');
            $('#gridComputeInterfaces').contrailGrid({
                header : {
                    title : {
                        text : 'Interfaces'
                    },
                    customControls: [
                                    '<a class="widget-toolbar-icon"><i class="icon-step-forward"></i></a>',
                                    '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                                    '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                                    '<a class="widget-toolbar-icon"><i class="icon-step-backward"></i></a>',
                            ]
                },
                columnHeader: {
                   columns:[
                       {
                           field:"dispName",
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
                           field:"type",
                           name:"Type",
                           minWidth:130
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
                           minWidth:100,
                           formatter:function(r,c,v,cd,dc) {
                               var ipColumnContent = '',breakStmt = false;
                               if(dc['ip_addr'] != '0.0.0.0') {
                                   ipColumnContent = getLabelValueForIP(dc['ip_addr']);
                                   breakStmt = true;
                               }
                               if(dc['raw_json']['ip6_active'] == 'Active') {
                                   if(breakStmt)
                                       ipColumnContent += "<br/>"+getLabelValueForIP(dc['raw_json']['ip6_addr']);
                                   else
                                       ipColumnContent += getLabelValueForIP(dc['raw_json']['ip6_addr']);
                               }
                               return ipColumnContent;
                           }
                       },
                       {
                           field:"disp_fip_list",
                           name:"Floating IP",
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
                                if(dc['vm_name'] != null && dc['vm_name'].trim() != '') {
                                  setInstanceURLHashParams(null, dc['vn_name'], dc['vm_uuid'], true);
                                  //layoutHandler.setURLHashParams({vmName:dc['vm_name'],fqName:dc['vm_uuid'],srcVN:dc['vn_name']},{p:'mon_networking_instances',merge:false,triggerHashChange:true});
                                }
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
                                url: monitorInfraUrls['VROUTER_INTERFACES']  + '?' + $.param({
                                      ip: getIPOrHostName(obj),
                                      introspectPort: obj['introspectPort']}),
                                type: 'GET'
                            },
                            dataParser: self.parseInterfaceData
                        },
                        events: {
                            onDataBoundCB: function() {
                                intfGrid.removeGridMessage('loading');
                            }
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
                footer : false
                //change:onIntfChange,
            })
            intfGrid = $('#gridComputeInterfaces').data('contrailGrid');
            intfGrid.showGridMessage('loading');
            bindGridPrevNextListeners({
                gridSel: $('#gridComputeInterfaces'),
                resetFn: resetForm,
                paginationInfoFn:getPaginationInfo,
                obj: obj,
                getUrlFn: function() {
                    return constructvRouterIntfUrl(obj);
                }
            });
            var interfaceGridObj = $("#gridComputeInterfaces").data('contrailGrid');
            function adjustInterfaceGridRowHeight() {
                if($('#gridComputeInterfaces').find('.input-searchbox input').val() != null && interfaceGridObj != null)
                    interfaceGridObj.adjustAllRowHeight();
            }
            if(interfaceGridObj != null) {
                interfaceGridObj._dataView.onDataUpdate.unsubscribe(adjustInterfaceGridRowHeight);
                interfaceGridObj._dataView.onDataUpdate.subscribe(adjustInterfaceGridRowHeight);
            }
            //applyGridDefHandlers(intfGrid, {noMsg:'No interfaces to display'});
        } else {
            reloadGrid(intfGrid);
        }
    }
    return {populateInterfaceTab:populateInterfaceTab,
        parseInterfaceData:parseInterfaceData};
})();
