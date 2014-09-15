/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

configNodesView = function () {
    var self = this;
    var configNodesData;
    this.load = function (obj) {
      var hashParams = ifNull(obj['hashParams'],{});
      if(hashParams['node'] == null)
          monitorInfraConfigSummaryClass.populateConfigNodes();
      else
         confNodeView.load({name:hashParams['node'], tab:hashParams['tab']});
      //layoutHandler.setURLHashParams({node:'Config Nodes'},{merge:false,triggerHashChange:false});
    }
    this.updateViewByHash = function(hashObj,lastHashObj) {
        this.load({hashParams:hashObj});
    }

    this.getConfigNodesData = function() {
        return configNodesData;
    }
    this.setConfigNodesData = function(data) {
        configNodesData = data;
    }

    this.destroy = function () {
      var kGrid = $('.contrail-grid').data('contrailGrid');
      if(kGrid != null)
         kGrid.destroy();
    }

    
}

configNodeView = function () {
    var consoleGrid;
    var generatorsGrid;
    var confNodeInfo = {}, self = this;
    var confNodeData = {};
    /*Selenium Testing*/
    var confNodeDetailsData;
    this.getConfNodeDetailsData = function(){
        return confNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        /*confNodeInfo = obj;
        //Select tab
        self.populateConfigNode(obj);
        //Update URL Hashparams only if tab is empty*/
        confNodeInfo = obj;
      if((confNodeInfo == null || confNodeInfo.ip ==  null ||  confNodeInfo.ip == '') && confNodeInfo.tab != null){
         //issue details call and populate ip
         var configNodeDeferredObj = $.Deferred();
         self.getConfigNodeDetails(configNodeDeferredObj,confNodeInfo);
         configNodeDeferredObj.done(function(data) {
            try{
               confNodeInfo['ip'] = data.configNode.ModuleCpuState.config_node_ip[0];
            } catch(e){}
              self.populateConfigNode(confNodeInfo);
            });
      } else {
           self.populateConfigNode(confNodeInfo);
      }
    }

    this.destroy = function () {
        //contView.destroy();
    }

    this.getConfigNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONFIG_DETAILS'] , obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.populateConfigNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in config node details page
        if (!isInitialized('#config_tabstrip' + '_' + obj.name)) {
            if(obj.detailView === undefined) {
                var confNodeTemplate = Handlebars.compile($("#confignode-template").html());
                $(pageContainer).html(confNodeTemplate(confNodeInfo));
                //Set the height of all tabstrip containers to viewheight - tabstrip
                var tabContHeight = layoutHandler.getViewHeight() - 42;
              //  $('#config_tabstrip > div').height(tabContHeight);
            } else if(obj.detailView === true) {
                confNodeInfo = obj;
            }
            $("#config_tabstrip" + '_' + obj.name).contrailTabs({
                activate:function (e, ui) {
                    confNodeInfo.name = e.target.id.split('_')[2];
                    var newIP = getIPforHostName(confNodeInfo.name, 'configNodeDS');
                    if(newIP != null) {
                        confNodeInfo.ip = newIP;
                    }                
                    infraMonitorUtils.clearTimers();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('config', {source:confNodeInfo['name']}, confNodeInfo);
                    } else if (selTab == 'Details') {
                        monitorInfraConfigDetailsClass.populateDetailsTab(confNodeInfo);
                    }
                }
            }).data('contrailTabs');
        }
        var tabIdx = $.inArray(obj['tab'], configNodeTabs);
        if (tabIdx == -1){
            tabIdx = 0;
            monitorInfraConfigDetailsClass.populateDetailsTab(confNodeInfo);
        }
        //If any tab is stored in URL,select it else select the first tab
        selectTab(configNodeTabStrip + '_' + obj.name, tabIdx);
    }
}

confNodesView = new configNodesView();
confNodeView = new configNodeView();

