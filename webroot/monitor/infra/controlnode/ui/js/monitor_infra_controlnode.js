/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

controlNodesView = function () {
    var self = this;
    var ctrlNodesGrid,ctrlNodesData = [];

    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        if(hashParams['node'] == null)
            monitorInfraControlSummaryClass.populateControlNodes();
        else
            ctrlNodeView.load({name:hashParams['node'],tab:hashParams['tab']});
        //layoutHandler.setURLHashParams({node:'Control Nodes'},{merge:false,triggerHashChange:false});
    }
    this.updateViewByHash = function(hashObj,lastHashObj) {
        this.load({hashParams:hashObj});
    }
    this.setCtrlNodesData = function(data) {
        ctrlNodesData = data;
    }
    this.getCtrlNodesData = function() {
        return ctrlNodesData;
    }

    this.destroy = function () {
      var kGrid = $('.contrail-grid').data('contrailGrid');
      if(kGrid != null)
         kGrid.destroy();
    }
    
    function addActions(data) {
        $('.gridSparkline').each(function() {
            var rowIndex = $(this).closest('td').parent().index();
            $(this).initSparkLineChart({viewType:'line',container:'gridCell'});
        });
    }
}

controlNodeView = function () {
    var consoleGrid;
    var ctrlNodeInfo = {}, self = this;
    var ctrlNodeData = {};
    /*Selenium Testing*/
    var ctrlNodeDetailsData;
    this.getCtrlNodeDetailsData = function(){
        return ctrlNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
    	ctrlNodeInfo = obj;
    	if((ctrlNodeInfo == null || ctrlNodeInfo.ip ==  null ||  ctrlNodeInfo.ip == '') && ctrlNodeInfo.tab != null){
			//issue details call and populate ip
			var controlNodeDeferredObj = $.Deferred();
			self.getControlNodeDetails(controlNodeDeferredObj,ctrlNodeInfo);
			controlNodeDeferredObj.done(function(data) {
			    var ip_list = getValueByJsonPath(data,"BgpRouterState;bgp_router_ip_list",[]);
			    ctrlNodeInfo['ip'] =  ip_list[0];
    	        self.populateControlNode(ctrlNodeInfo);
            });
      } else {
           self.populateControlNode(ctrlNodeInfo);
      }
    }

    this.destroy = function () {
        //contView.destroy();
    }
    
    this.getControlNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONTROLNODE_DETAILS'], obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.populateControlNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in control node details page
        if (!isInitialized('#control_tabstrip' + '_' + obj.name)) {
            if(obj.detailView === undefined) {
                var ctrlNodeTemplate = Handlebars.compile($("#controlnode-template").html());
                $(pageContainer).html(ctrlNodeTemplate(ctrlNodeInfo));
            
                //Set the height of all tabstrip containers to viewheight - tabstrip
                var tabContHeight = layoutHandler.getViewHeight() - 42;
                //$('#control_tabstrip > div').height(tabContHeight);
            } else if(obj.detailView === true) {
                ctrlNodeInfo = obj;
            }
            $("#control_tabstrip" + '_' + obj.name).contrailTabs({
                activate:function (e, ui) {
                    ctrlNodeInfo.name = e.target.id.split('_')[2];
                    var newIP = getIPforHostName(ctrlNodeInfo.name, 'controlNodeDS');
                    if(newIP != null) {
                        ctrlNodeInfo.ip = newIP;
                    }
                    infraMonitorUtils.clearTimers();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab == 'Peers') {
                        monitorInfraControlPeersClass.populatePeersTab(ctrlNodeInfo);
                        $('#gridPeers' + '_' + obj.name).data('contrailGrid').refreshView();
                    } else if (selTab == 'Routes') {
                        monitorInfraControlRoutesClass.populateRoutesTab(ctrlNodeInfo);
                        $('#gridRoutes' + '_' + obj.name).data('contrailGrid').refreshView();
                    } else if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('control', {source:ctrlNodeInfo['name']}, ctrlNodeInfo);
                    } else if (selTab == 'Details') {
                        monitorInfraControlDetailsClass.populateDetailsTab(ctrlNodeInfo);
                    } 
                }
            });
        }
        var tabIdx = $.inArray(obj['tab'], controlNodetabs);
        if (tabIdx == -1){
            tabIdx = 0;
            monitorInfraControlDetailsClass.populateDetailsTab(ctrlNodeInfo);
        }
        //If any tab is stored in URL,select it else select the first tab
        selectTab(ctrlNodeTabStrip + '_' + obj.name, tabIdx);
    }
}

ctrlNodesView = new controlNodesView();
ctrlNodeView = new controlNodeView();

