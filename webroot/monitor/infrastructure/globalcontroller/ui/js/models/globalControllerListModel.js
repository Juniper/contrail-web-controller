/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'contrail-list-model'
], function (ContrailListModel) {
    var GlobalControllerListModel = function (modelConfig) {
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.GLOBALCONTROLLER_REGIONS_SUMMARY_URL+ modelConfig.region
                    },
                   successCallback: function(modelData, listModel, origResponse) {
                    },
                    dataParser : function (response) {
                        return this.parseGlobalControllerModelData(response);
                    },
                }
            };
        return ContrailListModel(listModelConfig);
    };
    return GlobalControllerListModel;
    }
);
    function parseGlobalControllerModelData(response){
        var vRoutersNodesDown = response.data.vRoutersNodesDown,
            controlNodesDown = response.data.controlNodesDown,
            analyticsNodesDown = response.data.analyticsNodesDown,
            configNodesDown =  response.data.configNodesDown,
            databaseNodesDown = response.data.databaseNodesDown;
            this.getNodesDownList(response,vRoutersNodesDown, 'vRoutersNodesDownCnt');
            this.getNodesDownList(response,controlNodesDown, 'controlNodesDownCnt');
            this.getNodesDownList(response,analyticsNodesDown, 'analyticsNodesDownCnt');
            this.getNodesDownList(response,configNodesDown, 'configNodesDownCnt');
            this.getNodesDownList(response,databaseNodesDown, 'databaseNodesDownCnt');
            return [response];
    }
   function getNodesDownList(response,NodesAlarmsList, nodesDownName){
       var DownAlarmsCnt = 0;var severity;var ack;var vroutertype;
           if(NodesAlarmsList.length > 0){
                for(i=0;i<NodesAlarmsList.length;i++){
                    if(NodesAlarmsList[i].value.UVEAlarms){
                        severity = NodesAlarmsList[i].value.UVEAlarms.alarms[0].severity;
                        ack = NodesAlarmsList[i].value.UVEAlarms.alarms[0].ack;
                    }
                    if(NodesAlarmsList[i].value.ContrailConfig){
                        vroutertype = NodesAlarmsList[i].value.ContrailConfig.elements.virtual_router_type;
                        if(vroutertype === '"' + "tor-service-node" + '"'){
                                vroutertype = 'tor-service-node';
                        }
                        else if(vroutertype === '"' + "tor-agent" + '"'){
                            vroutertype = 'tor-agent';
                        }
                        else{
                            vroutertype = null;
                        }
                    }
                    if((severity == 0 || severity == 1) && (ack === false) && (vroutertype === null)){
                    DownAlarmsCnt++;
                    response.data[nodesDownName] = DownAlarmsCnt;
                    }
                }
            }
          else{
              response.data[nodesDownName] = 0;
           }
    return response;
  }