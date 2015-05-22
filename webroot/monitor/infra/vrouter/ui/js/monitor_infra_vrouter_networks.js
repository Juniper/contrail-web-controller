/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * vRouter Networks tab
 */
monitorInfraComputeNetworksClass = (function() {

    var paginationInfo = {};
    
    /*
     * //If we want to populate DS completely
     * var vRouterNetworksDS = new ContrailDataView();
     * function populatevRouterNetworksDS(obj) {
     *     var transportCfg = {
     *         url:contrail.format(monitorInfraUrls['VROUTER_NETWORKS'], getIPOrHostName(obj),obj['introspectPort'])
     *     }
     *     getOutputByPagination(vRouterNetworksDS, {
     *         transportCfg: transportCfg,
     *         paginationServer: 'introspect',
     *         parseFn: self.parseVNData
     *     });
     * }
     */

    this.parseVNData = function(response) {
        var data = jsonPath(response,'$..VnSandeshData')[0];
        paginationInfo = getIntrospectPaginationInfo(response); 
        updateGridTitleWithPagingInfo($('#gridComputeVN'),paginationInfo);
        //Disable/Enable prev Next buttons
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

    function getPaginationInfo() {
        return paginationInfo;
    }

    function resetForm() {
        $('#gridComputeVN').parent().find("[name='vnName']").val('');
    }

    function constructvRouterVNUrl(obj) {
        var vRouterNetworkURL = monitorInfraUrls['VROUTER_NETWORKS'];
        var urlParams = {
            ip : getIPOrHostName(obj),
            introspectPort : obj['introspectPort']
        }
        var vnNameFilter = $('#gridComputeVN').parent().find("[name='vnName']").val();
        if(vnNameFilter != null) {
            urlParams['vnNameFilter'] = vnNameFilter.trim();
        }
        return {
            url: vRouterNetworkURL,
            params:urlParams
        }
    }
    
    this.populateVNTab = function (obj) {
        layoutHandler.setURLHashParams({tab:'networks',node: obj['name']},{triggerHashChange:false});
        if (!isGridInitialized('#gridComputeVN')) {
            //Issue a call to populate vRouter networks data
            // populatevRouterNetworksDS(obj);
            $("#gridComputeVN").contrailGrid({
                header : {
                    title : {
                        text : 'Networks'
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
                                         var data = {tab:"routes",filters:[{routeName:dc['vrf_name']}]};
                                         $('#' + computeNodeTabStrip).data('tabFilter',data);
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
                                     layoutHandler.setURLHashParams({},{p:'config_net_vn',merge:false});
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
                        // dataView: vRouterNetworksDS,
                        remote: {
                            ajaxConfig: {
                                url: monitorInfraUrls['VROUTER_NETWORKS']  + '?' + $.param({
                                      ip: getIPOrHostName(obj),
                                      introspectPort: obj['introspectPort']}),
                                type: 'GET'
                            },
                            dataParser: self.parseVNData
                        },
                        events: {
                            onDataBoundCB: function() {
                                vnGrid.removeGridMessage('loading');
                            }
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
            vnGrid = $('#gridComputeVN').data('contrailGrid');
            vnGrid.showGridMessage('loading');
            //Bind listeners
            bindGridPrevNextListeners({
                gridSel: $('#gridComputeVN'),
                resetFn: resetForm,
                paginationInfoFn:getPaginationInfo,
                obj: obj,
                getUrlFn: function() {
                    return constructvRouterVNUrl(obj);
                }
            });
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
