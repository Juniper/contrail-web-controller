/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Networks tab
 */
monitorInfraComputeNetworksClass = (function() {
    
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
    
    this.populateVNTab = function (obj) {
        if(obj.detailView === undefined && obj.page == null) {
            layoutHandler.setURLHashParams({tab:'networks',node: obj['displayName']},{triggerHashChange:false});
        }    
        if (!isGridInitialized('#gridComputeVN' + '_' + obj.name)) {
            $("#gridComputeVN" + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'Networks'
                    }
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
                                         selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
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
                                         var data = {tab:"routes",filters:[{routeName:dc['vrf_name']}]};
                                         $('#' + computeNodeTabStrip + '_' + obj.name).data('tabFilter',data);
                                         selectTab(computeNodeTabStrip + '_' + obj.name,tabIdx);
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
                                     layoutHandler.setURLHashObj({p:'config_net_vn',merge:false});
                                 }
                             },
                             {
                                 title: 'Monitor',
                                 iconClass: 'icon-tasks',
                                 onClick: function(rowIndex){
                                     var rowData = vnGrid._dataView.getItem(rowIndex);
                                     setNetworkURLHashParams(null, rowData['name'], true);
                                     //layoutHandler.setURLHashParams({fqName:rowData['name']},{p:'mon_networking_networks',merge:false});
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
                                url: contrail.format(monitorInfraUrls['VROUTER_NETWORKS'], getIPOrHostName(obj),obj['introspectPort']),
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
                }
            });
            vnGrid = $('#gridComputeVN' + '_' + obj.name).data('contrailGrid');
            vnGrid.showGridMessage('loading');
        } else {
            vnGrid = $('#gridComputeVN' + '_' + obj.name).data('contrailGrid');
            vnGrid.setRemoteAjaxConfig( {
                                url: contrail.format(monitorInfraUrls['VROUTER_NETWORKS'], getIPOrHostName(obj),obj['introspectPort']),
                                //timeout: timeout,
                                type: 'GET'
                            });
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
                    layoutHandler.setURLHashParams({tab:'acl', ip:obj['ip'],node:''vRouters:' ' + obj['name'], filters:filters});
                    */
                } else if (name == 'vrf') {
                    //var obj = obj;
                    //ctrlNodeView.load({ip:obj['ip'], name:'Control Nodes:' + obj['name'], tab:'routes'});
                    //commenting out so that the filter happens for routes
                    //var tabIdx = 6;
                    //computeNodeTabStrip.select(tabIdx);
                    var dataItem = this.dataItem(this.select()[0].parentNode);
                    var filters = dataItem.vrf;
                    layoutHandler.setURLHashParams({tab:'routes',node: obj['name']});
                }
            }
        }
    }
    return {populateVNTab:populateVNTab,
        parseVNData:parseVNData};
})();
