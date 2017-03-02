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
        var vrNodesAlarmsList = response.data.vrNodesAlarms,
            controlNodesAlarmsList = response.data.controlNodesAlarms,
            anaNodesList = response.data.anaNodesDownList,
            configNodeList =  response.data.configNodesDownAlarmList,
            databaseNodeList = response.data.databaseNodesDownAlarmList;
            this.getNodesDownList(response,vrNodesAlarmsList, 'vrDownAlarmsCnt');
            this.getNodesDownList(response,controlNodesAlarmsList, 'controlNodeDownAlarmsCnt');
            this.getNodesDownList(response,anaNodesList, 'anaNodeDownAlarmsCnt');
            this.getNodesDownList(response,configNodeList, 'configNodeDownAlarmsCnt');
            this.getNodesDownList(response,databaseNodeList, 'databaseNodeDownAlarmsCnt');
            return [response];
    }
   function getNodesDownList(response,NodesAlarmsList, nodesDownName){
       var DownAlarmsCnt = 0;var severity;
           if(NodesAlarmsList.length > 0){
                for(i=0;i<NodesAlarmsList.length;i++){
                    severity = NodesAlarmsList[i].value.UVEAlarms.alarms[0].severity;
                    if(severity == 0 || severity == 1){
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