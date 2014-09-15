/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

analyticsNodesView = function () {
    var self = this,analyticNodesData;
    
    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        if(hashParams['node'] == null)
            monitorInfraAnalyticsSummaryClass.populateAnalyticsNodes();
        else
            aNodeView.load({name:hashParams['node'], tab:hashParams['tab']});
    	//layoutHandler.setURLHashParams({node:'Analytics Nodes'},{merge:false,triggerHashChange:false});
    }
    this.updateViewByHash = function(hashObj,lastHashObj) {
        this.load({hashParams:hashObj});
    }
    this.getAnalyticNodesData = function() {
        return analyticNodesData;
    }
    this.setAnalyticNodesData = function(data) {
        analyticNodesData = data;
    }

    this.destroy = function () {
    	var kGrid = $('.contrail-grid').data('contrailGrid');
    	if(kGrid != null)
    		kGrid.destroy();
    }
}

analyticsNodeView = function () {
    var consoleGrid ;
    var aNodeInfo = {}, self = this;
    var aNodeData = {};
    /*Selenium Testing*/
    var aNodeDetailsData;
    this.getaNodeDetailsData = function(){
        return aNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        aNodeInfo = obj;
    	if((aNodeInfo == null || aNodeInfo.ip ==  null ||  aNodeInfo.ip == '') && aNodeInfo.tab != null){
			//issue details call and populate ip
			var analyticsNodeDeferredObj = $.Deferred();
			self.getAnalyticsNodeDetails(analyticsNodeDeferredObj,aNodeInfo);
			analyticsNodeDeferredObj.done(function(data) {
			    var ipList = getValueByJsonPath(data,"CollectorState.self_ip_list",[])
				aNodeInfo['ip'] = ipList[0];
    	        self.populateAnalyticsNode(aNodeInfo);
            });
		} else {
	        self.populateAnalyticsNode(aNodeInfo);
		}
    }

    this.destroy = function () {
        //contView.destroy();
    }

    this.getAnalyticsNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['ANALYTICS_DETAILS'], obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }

    this.populateAnalyticsNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in analytics node details page
        if (!isInitialized('#analytics_tabstrip' + '_' + obj.name)) {
            if(obj.detailView === undefined) {
                var aNodeTemplate = Handlebars.compile($("#analyticsnode-template").html());
                $(pageContainer).html(aNodeTemplate(aNodeInfo));
                //Set the height of all tabstrip containers to viewheight - tabstrip
                var tabContHeight = layoutHandler.getViewHeight() - 42;
              //  $('#analytics_tabstrip > div').height(tabContHeight);
            } else if(obj.detailView === true) {
               aNodeInfo = obj; 
            }
            $("#analytics_tabstrip" + '_' + obj.name).contrailTabs({
                activate:function (e, ui) {
                    aNodeInfo.name = e.target.id.split('_')[2];
                    var newIP = getIPforHostName(aNodeInfo.name, 'analyticsNodeDS');
                    if(newIP != null) {
                        aNodeInfo.ip = newIP;
                    }
                    infraMonitorUtils.clearTimers();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab == 'Generators') {
                        monitorInfraAnalyticsGeneratorsClass.populateGeneratorsTab(aNodeInfo);
                        $('#gridGenerators' + '_' + obj.name).data('contrailGrid').refreshView();
                    } else if (selTab == 'QE Queries') {
                        monitorInfraAnalyticsQEQueriesClass.populateQEQueriesTab(aNodeInfo);
                        $('#gridQEQueries' + '_' + obj.name).data('contrailGrid').refreshView();
                    } else if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('analytics', {source:aNodeInfo['name']}, aNodeInfo);
                    } else if (selTab == 'Details') {
                        monitorInfraAnalyticsDetailsClass.populateDetailsTab(aNodeInfo);
                    }
                }
            }).data('contrailTabs');
        }
        var tabIdx = $.inArray(obj['tab'], analyticsNodeTabs);
        if (tabIdx == -1){
            tabIdx = 0;
            monitorInfraAnalyticsDetailsClass.populateDetailsTab(aNodeInfo);
        }
        selectTab(aNodeTabStrip + '_' + obj.name, tabIdx);
    }
}

function getGeneratorsListForAnalyticsNode(deferredObj,postData) {
    $.ajax({
    	url:TENANT_API_URL,
        type:"post",
        data:postData,
        dataType:'json'
    }).done(function(result) {
        deferredObj.resolve(result);
    });
}

aNodesView = new analyticsNodesView();
aNodeView = new analyticsNodeView();

