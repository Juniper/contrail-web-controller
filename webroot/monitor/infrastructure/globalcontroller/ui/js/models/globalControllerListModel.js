/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'contrail-list-model',
    'core-alarm-utils'
], function (ContrailListModel,coreAlarmUtils) {
    var self = this;
   var GlobalControllerListModel = function (modelConfig) {
       var listModelConfig = {
           remote : {
                    ajaxConfig : {
                        url : ctwc.GLOBALCONTROLLER_REGIONS_SUMMARY_URL+ modelConfig.region
                    },
                    dataParser : parseGlobalControllerModelData
                },
                cacheConfig : {
                 }
            };
        return ContrailListModel(listModelConfig);
    };
    function parseGlobalControllerModelData(response){
        var vRoutersNodes = response.data.vRoutersNodes,
            controlNodes = response.data.controlNodes,
            analyticsNodes = response.data.analyticsNodes,
            configNodes =  response.data.configNodes,
            databaseNodes = response.data.databaseNodes;
            alarms = response.data.alarms;
            response.data['vnCnt'] = response.data.vns.length;
            response.data['vRoutersCnt'] = response.data.vRoutersNodes.length;
            response.data['controlNodesCnt'] = response.data.controlNodes.length;
            response.data['analyticsNodesCnt'] = response.data.analyticsNodes.length;
            response.data['configNodesCnt'] = response.data.configNodes.length;
            response.data['databaseNodesCnt'] = response.data.databaseNodes.length;
            response.data['vmCnt'] = response.data.vms.length;
            response.data['vmiCnt'] = response.data.vmis.length;
            response.data['svcInstsCnt'] = response.data.svcInsts.length;
            response.data['fips'] = response.data.fips.length;
            //called the same method getAlarmCounts used in Infra dashbaord
            response.data['alarmsCnt'] = getValueByJsonPath(coreAlarmUtils.getAlarmCounts(alarms,false),'unacked', 0);
            getNodesDownCounts(response,vRoutersNodes, 'vRoutersNodesDownCnt');
            getNodesDownCounts(response,controlNodes, 'controlNodesDownCnt');
            getNodesDownCounts(response,analyticsNodes, 'analyticsNodesDownCnt');
            getNodesDownCounts(response,configNodes, 'configNodesDownCnt');
            getNodesDownCounts(response,databaseNodes, 'databaseNodesDownCnt');
            return [response];
    };
    function getNodesDownCounts(response,NodesAlarmsList, nodesDownCnt){
       var downAlarmsCnt = 0,
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
                    downAlarmsCnt++;
                    response.data[nodesDownCnt] = downAlarmsCnt;
                    }
                }
            }
          else{
              response.data[nodesDownCnt] = 0;
           }
    return response;
  }
    return GlobalControllerListModel;
    }
);