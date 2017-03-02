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
                },
                cacheConfig : {
                     // ucid: ctwc.GLOBAL_CONTROLLER_NODESCOUNT+modelConfig
                 }
            };
        return ContrailListModel(listModelConfig);
    };
    return GlobalControllerListModel;
    }
);
    function parseGlobalControllerModelData(response){
        var vRoutersNodes = response.data.vRoutersNodes,
            controlNodes = response.data.controlNodes,
            analyticsNodes = response.data.analyticsNodes,
            configNodes =  response.data.configNodes,
            databaseNodes = response.data.databaseNodes;
            this.getNodesDownList(response,vRoutersNodes, 'vRoutersNodesDownCnt');
            this.getNodesDownList(response,controlNodes, 'controlNodesDownCnt');
            this.getNodesDownList(response,analyticsNodes, 'analyticsNodesDownCnt');
            this.getNodesDownList(response,configNodes, 'configNodesDownCnt');
            this.getNodesDownList(response,databaseNodes, 'databaseNodesDownCnt');
            return [response];
    }
   function getNodesDownList(response,NodesAlarmsList, nodesDownName){
       var DownAlarmsCnt = 0,
           severity,
           ack,
           checkUVEAlarms;
           if(NodesAlarmsList.length > 0){
               for(i=0;i<NodesAlarmsList.length;i++){
                    checkUVEAlarms = getValueByJsonPath(NodesAlarmsList[i], 'value;UVEAlarms', null);
                    if(checkUVEAlarms != null){
                        severity = NodesAlarmsList[i].value.UVEAlarms.alarms[0].severity;
                        ack = NodesAlarmsList[i].value.UVEAlarms.alarms[0].ack;
                    }
                    if((severity == 0 || severity == 1) && (ack === false)){
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