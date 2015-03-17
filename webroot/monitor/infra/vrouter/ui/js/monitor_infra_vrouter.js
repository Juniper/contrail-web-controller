/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var disabledTabsForTOR = ['acl','flows'];
computeNodesView = function () {
    
    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        if(hashParams['node'] == null)
            monitorInfraComputeSummaryClass.populateComputeNodes();
        else
            cmpNodeView.load({name:hashParams['node'], tab:hashParams['tab'], filters:hashParams['filters']});
        //layoutHandler.setURLHashParams({node:'vRouters'},{merge:false,triggerHashChange:false});
    }
    this.updateViewByHash = function(hashObj,lastHashObj) {
        this.load({hashParams:hashObj});
    }
    this.destroy = function () {
        //contView.destroy();
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }
}

function onComputeNodeChange(dc) {
    cmpNodeView.load({name:dc['name'], ip:dc['ip'], uuid:dc['uuid']});
}

computeNodeView = function () {
    var intfGrid, vnGrid, aclGrid, flowGrid, computeNodeInfo,computeNodeData;
    var self = this;
    var cmptNodeDetailsData;
    this.getCmptNodeDetailsData = function(){
        return cmptNodeDetailsData; 
    }
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        computeNodeInfo = obj;
        if(computeNodeInfo == null || computeNodeInfo.ip ==  null ||  computeNodeInfo.ip == '' || 
                computeNodeInfo['introspectPort'] == null || computeNodeInfo['introspectPort'] == '' ||
                computeNodeInfo['vrouterModuleId'] == null || computeNodeInfo['vrouterModuleId'] == ''){
            //issue details call and populate ip
            var computeNodeDeferredObj = $.Deferred();
            self.getComputeNodeDetails(computeNodeDeferredObj,computeNodeInfo);
            computeNodeDeferredObj.done(function(data) {
                //If IP address is not available in UVE,pick it from ConfigData
                computeNodeInfo['ip'] = getValueByJsonPath(data,'VrouterAgent;self_ip_list;0',getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_ip_address'));
                computeNodeInfo['introspectPort'] = getValueByJsonPath(data,'VrouterAgent;sandesh_http_port',defaultIntrospectPort);
                computeNodeInfo['vrouterModuleId'] = getValueByJsonPath(data,'NodeStatus;process_status;0;module_id', UVEModuleIds['VROUTER_AGENT']);
                computeNodeInfo['vRouterType'] = getValueByJsonPath(data,'ConfigData;virtual-router;virtual_router_type;0','hypervisor');
                self.populateComputeNode(computeNodeInfo);
            });
        } else {
            self.populateComputeNode(computeNodeInfo);
        }
    }

    this.destroy = function () {
        //contView.destroy();
    }
    
    this.getComputeNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['VROUTER_DETAILS'] , obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.populateComputeNode = function (obj) {
        var tabIdx = $.inArray(obj['tab'], computeNodeTabs);
        
        if (!isInitialized('#compute_tabstrip_' + obj.name)) {
            if(obj.detailView == true || obj.page == 'underlay') {
                computeNodeInfo = obj;
            } else if(obj.detailView === undefined) {
            	var compNodeTemplate = Handlebars.compile($("#computenode-template").html());
                $(pageContainer).html(compNodeTemplate(computeNodeInfo));
               
                //Set the height of all tabstrip containers to viewheight - tabstrip
                var tabContHeight = layoutHandler.getViewHeight() - 42;
            } 
            if (tabIdx == -1){
                tabIdx = 0;
                monitorInfraComputeDetailsClass.populateDetailsTab(computeNodeInfo);
            }
           
            //disable the tabs for TOR agent types
            if(obj['vRouterType'] == 'tor-agent'){
                $.each(disabledTabsForTOR, function(i,tab){
                    $('#mon-infra-vrouter-' + tab + '-tab_' + obj.name).removeClass('show').addClass('hide');
                });
            } 
            $("#compute_tabstrip_" + obj.name).contrailTabs({
                 activate: function(e, ui) {
                    computeNodeInfo.name = e.target.id.split('_')[2];
                    var newIP = getIPforHostName(computeNodeInfo.name, 'computeNodeDS');
                    if(newIP != null) {
                        computeNodeInfo.ip = newIP; 
                    }
                    infraMonitorUtils.clearTimers();
                    //var selTab = $(e.item).text();
                    var selTab = $(ui.newTab.context).text();

                    if (selTab == 'Interfaces') {
                        monitorInfraComputeInterfacesClass.populateInterfaceTab(computeNodeInfo);
                    } else if (selTab == 'Networks') {
                        monitorInfraComputeNetworksClass.populateVNTab(computeNodeInfo);
                        $('#gridComputeVN' + '_' + obj.name).data('contrailGrid').refreshView();
                    } else if (selTab == 'ACL') {
                        monitorInfraComputeACLClass.populateACLTab(computeNodeInfo);
                    } else if (selTab == 'Flows') {
                        monitorInfraComputeFlowsClass.populateFlowsTab(computeNodeInfo, e.filters);
                    } else if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('compute', {source:computeNodeInfo['name']}, computeNodeInfo);
                    } else if (selTab == 'Details') {
                        monitorInfraComputeDetailsClass.populateDetailsTab(computeNodeInfo);
                    } else if(selTab == 'Routes') {
                        monitorInfraComputeRoutesClass.populateRoutesTab(computeNodeInfo);
                        if(isGridInitialized('#gridvRouterUnicastRoutes' + '_' + obj.name))
                            $('#gridvRouterUnicastRoutes' + '_' + obj.name).data('contrailGrid').refreshView();
                        if(isGridInitialized('#gridvRouterMulticastRoutes' + '_' + obj.name))
                            $('#gridvRouterMulticastRoutes' + '_' + obj.name).data('contrailGrid').refreshView();
                        if(isGridInitialized('#gridvRouterL2Routes' + '_' + obj.name))
                            $('#gridvRouterL2Routes' + '_' + obj.name).data('contrailGrid').refreshView();
                    }
                }
            });
            selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
        } else {
            selectTab(computeNodeTabStrip + '_' + obj.name, tabIdx);
        }
    }
}


function getDisplayNameForVRouterType(type){
    switch (type){
        case 'tor-agent':
            return 'TOR Agent';
        case 'tor-service-node':
            return 'TOR Service Node';
        case 'embedded':
            return 'Embedded';
        case 'hypervisor':
            return 'Hypervisor';
    }
}

cmpNodesView = new computeNodesView();
cmpNodeView = new computeNodeView();