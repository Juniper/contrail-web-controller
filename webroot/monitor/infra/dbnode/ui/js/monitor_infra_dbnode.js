/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

dbNodesView = function () {
    var self = this;
    var dbNodesData;
    this.load = function (obj) {
      var hashParams = ifNull(obj['hashParams'],{});
      if(hashParams['node'] == null)
          monitorInfraDatabaseSummaryClass.populateDbNodes();
      else
         databaseNodeView.load({name:hashParams['node'], tab:hashParams['tab']});
      //layoutHandler.setURLHashParams({node:'Db Nodes'},{merge:false,triggerHashChange:false});
    }
    this.updateViewByHash = function(hashObj,lastHashObj) {
        this.load({hashParams:hashObj});
    }

    this.getDbNodesData = function() {
        return dbNodesData;
    }
    this.setDbNodesData = function(data) {
        dbNodesData = data;
    }

    this.destroy = function () {
      var kGrid = $('.contrail-grid').data('contrailGrid');
      if(kGrid != null)
         kGrid.destroy();
    }

    
}

dbNodeView = function () {
    var consoleGrid;
    var generatorsGrid;
    var databaseNodeInfo = {}, self = this;
    var databaseNodeData = {};
    /*Selenium Testing*/
    var databaseNodeDetailsData;
    this.getDatabaseNodeDetailsData = function(){
        return databaseNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
        /*databaseNodeInfo = obj;
        //Select tab
        self.populateDbNode(obj);
        //Update URL Hashparams only if tab is empty*/
        databaseNodeInfo = obj;
      if((databaseNodeInfo == null || databaseNodeInfo.ip ==  null ||  databaseNodeInfo.ip == '') && databaseNodeInfo.tab != null){
         //issue details call and populate ip
         var dbNodeDeferredObj = $.Deferred();
         self.getDbNodeDetails(dbNodeDeferredObj,databaseNodeInfo);
         dbNodeDeferredObj.done(function(data) {
            try{
               databaseNodeInfo['ip'] = data.dbNode.ModuleCpuState.db_node_ip[0];
            } catch(e){}
              self.populateDbNode(databaseNodeInfo);
            });
      } else {
           self.populateDbNode(databaseNodeInfo);
      }
    }

    this.destroy = function () {
        //contView.destroy();
    }

    this.getDbNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url: contrail.format(monitorInfraUrls['CONFIG_DETAILS'] , obj['name'])
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
    
    this.populateDbNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in db node details page
        if (!isInitialized('#db_tabstrip' + '_' + obj.name)) {
            if(obj.detailView === undefined) {
                var databaseNodeTemplate = Handlebars.compile($("#dbnode-template").html());
                $(pageContainer).html(databaseNodeTemplate(databaseNodeInfo));
                //Set the height of all tabstrip containers to viewheight - tabstrip
                var tabContHeight = layoutHandler.getViewHeight() - 42;
              //  $('#db_tabstrip > div').height(tabContHeight);
            } else if(obj.detailView === true) {
                databaseNodeInfo = obj;
            }
            $("#db_tabstrip" + '_' + obj.name).contrailTabs({
                activate:function (e, ui) {
                    databaseNodeInfo.name = e.target.id.split('_')[2];
                    var newIP = getIPforHostName(databaseNodeInfo.name, 'dbNodeDS');
                    if(newIP != null) {
                        databaseNodeInfo.ip = newIP;
                    }                
                    infraMonitorUtils.clearTimers();
                    var selTab = $(ui.newTab.context).text();
                    if (selTab == 'Console') {
                        infraMonitorUtils.populateMessagesTab('db', {source:databaseNodeInfo['name']}, databaseNodeInfo);
                    } else if (selTab == 'Details') {
                        monitorInfraDbDetailsClass.populateDetailsTab(databaseNodeInfo);
                    }
                }
            }).data('contrailTabs');
        }
        var tabIdx = $.inArray(obj['tab'], dbNodeTabs);
        if (tabIdx == -1){
            tabIdx = 0;
            monitorInfraDbDetailsClass.populateDetailsTab(databaseNodeInfo);
        }
        //If any tab is stored in URL,select it else select the first tab
        selectTab(dbNodeTabStrip + '_' + obj.name, tabIdx);
    }
}

databaseNodesView = new dbNodesView();
databaseNodeView = new dbNodeView();

