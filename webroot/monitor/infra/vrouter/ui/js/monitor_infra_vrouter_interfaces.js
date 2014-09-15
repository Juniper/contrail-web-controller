/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Interfaces tab
 */
monitorInfraComputeInterfacesClass = (function() {
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
                        fipList = ifNull(jsonPath(obj,"$..FloatingIpSandeshList")[0],[]);
                        obj['disp_fip_list'] = floatingIPCellTemplate(fipList);
                    }
                    retArray.push({uuid:obj['uuid'],name:obj['name'],label:obj['label'],active:obj['active'],
                        vn_name:obj['vn_name'],disp_vn_name:dispVNName,vm_uuid:obj['vm_uuid'],
                        vm_name:obj['vm_name'],disp_vm_name:dispVMName,ip_addr:obj['ip_addr'],
                        disp_fip_list:obj['disp_fip_list'],raw_json:rawJson});
                }
            });
        }
        //$('#compute_tabstrip_nodeg2 .slick-cell').attr('style', 'font-size:0.85em;');
        return retArray;
    }
    
    this.populateInterfaceTab = function (obj) {
        //Push only tab & node parameter in URL
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'interfaces',node:obj['name']},{triggerHashChange:false});
        }    
        
        if (!isGridInitialized('#gridComputeInterfaces' + '_' + obj.name)) {
            $('#gridComputeInterfaces' + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'Interfaces'
                    }
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
                                   selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
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
                                url: contrail.format(monitorInfraUrls['VROUTER_INTERFACES'], getIPOrHostName(obj)),
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
                }
                //change:onIntfChange,
            })
            intfGrid = $('#gridComputeInterfaces' + '_' + obj.name).data('contrailGrid');
            intfGrid.showGridMessage('loading');
            //applyGridDefHandlers(intfGrid, {noMsg:'No interfaces to display'});
        } else {
            reloadGrid(intfGrid);
        }
    }
    return {populateInterfaceTab:populateInterfaceTab,
        parseInterfaceData:parseInterfaceData};
})();