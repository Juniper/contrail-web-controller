define([
    'underscore',
    'contrail-list-model'
], function (_, ContrailListModel) {
    var MonitorInfraUtils = function () {
        var self = this;
        self.getNodeColor = function (obj) {
            obj = ifNull(obj,{});
            //Check if there is any nodeAlert and if yes,
            //get the highest severity alert
            var nodeAlertSeverity = -1,processLevelSeverity = -1;
            if(obj['nodeAlerts'].length > 0) {
                nodeAlertSeverity = obj['nodeAlerts'][0]['sevLevel'];
            }
            //Check if any process Alerts
            if(obj['processAlerts'].length > 0) {
                processLevelSeverity = obj['processAlerts'][0]['sevLevel'];
            }
            if(nodeAlertSeverity == sevLevels['ERROR'] || 
                    processLevelSeverity == sevLevels['ERROR'])
                return ctwc.COLOR_SEVERITY_MAP['red'];
            if(nodeAlertSeverity == sevLevels['WARNING'] || 
                    processLevelSeverity == sevLevels['WARNING']) 
                return ctwc.COLOR_SEVERITY_MAP['orange'];
            return false;  
        };
        
        self.getConfigNodeColor = function (d,obj) {
            obj= ifNull(obj,{});
            var nodeColor = self.getNodeColor(obj);
            if(nodeColor != false)
                return nodeColor;
            return ctwc.COLOR_SEVERITY_MAP['blue'];  
        };
        
        self.getControlNodeColor = function (d,obj) {
            obj= ifNull(obj,{});
            var nodeColor = self.getNodeColor(obj);
            if(nodeColor != false)
                return nodeColor;
            //If connected to atleast one XMPP Peer
            if(obj['totalXMPPPeerCnt'] - obj['downXMPPPeerCnt'] > 0)
                return ctwc.COLOR_SEVERITY_MAP['green'];
            else if(obj['downBgpPeerCnt'] == 0 && obj['downXMPPPeerCnt'] == 0)
                return ctwc.COLOR_SEVERITY_MAP['blue'];    //Default color  
        };
        
        self.getDatabaseNodeColor = function (d,obj) {
            obj= ifNull(obj,{});
            var nodeColor = self.getNodeColor(obj);
            if(nodeColor != false)
                return nodeColor;
            return ctwc.COLOR_SEVERITY_MAP['blue'];
        };
        
        self.getAnalyticsNodeColor = function (d, obj) {
            obj= ifNull(obj,{});
            var nodeColor = self.getNodeColor(obj);
            if(nodeColor != false)
                return nodeColor;
            return ctwc.COLOR_SEVERITY_MAP['blue'];
        };
        
        self.getGeneratorsAjaxConfigForInfraNodes = function (dsName) {
            var ajaxConfig = {};
            var kfilts;
            var cfilts;
            if(dsName == 'controlNodeDS') {
                kfilts =  '*:' + UVEModuleIds['CONTROLNODE'] + '*';
                cfilts =  'ModuleClientState:client_info,'+
                          'ModuleServerState:generator_info';
            } else if(dsName == 'computeNodeDS') {
                //Handling the case module id will change for the TOR agent/ TSN 
                //We need to send all the module ids if different
                var items = dataSource.getItems();
                var kfiltString = ""
                var moduleIds = [];
                $.each(items,function(i,d){
                    if(moduleIds.indexOf(d['moduleId']) == -1){
                        moduleIds.push(d['moduleId']);
                        //Exclude getting contrail-tor-agent generators
                        if(d['moduleId'] == 'contrail-tor-agent') {
                            return;
                        }
                        if(kfiltString != '')
                            kfiltString += ',';
                        kfiltString += '*:' + d['moduleId'] + '*';
                    }
                });
                kfilts =  kfiltString;
                cfilts = 'ModuleClientState:client_info,'+
                         'ModuleServerState:generator_info';
            } else if(dsName == 'analyticsNodeDS') {
                kfilts = '*:' + UVEModuleIds['COLLECTOR'] + '*,*:' + 
                                UVEModuleIds['OPSERVER'] + '*,*:' + 
                                UVEModuleIds['QUERYENGINE'] + '*';
                cfilts = 'ModuleClientState:client_info,'+
                         'ModuleServerState:generator_info';
            } else if(dsName == 'configNodeDS') {
                kfilts = '*:' + UVEModuleIds['APISERVER'] + '*';
                cfilts = 'ModuleClientState:client_info,'+
                         'ModuleServerState:generator_info';
            }

            var postData = getPostData("generator",'','',cfilts,kfilts);
            
            ajaxConfig = { 
                    url:TENANT_API_URL,
                    type:'POST',
                    data:JSON.stringify(postData)
                };
            return ajaxConfig;
        };
        
        self.parseInfraGeneratorsData = function(result) {
            var retArr = [];
            if(result != null && result[0] != null){
                result = result[0].value;
            } else {
                result = [];
            }
            $.each(result,function(idx,d){
                var obj = {};
                obj['status'] = self.getOverallNodeStatusFromGenerators(d);
                obj['name'] = d['name'];
                retArr.push(obj);
            });
            return retArr;
        };
        
        self.getOverallNodeStatusFromGenerators = function () {
            var status = "--";
            var generatorDownTime;
            
            
            // For each process get the generator_info and fetch the gen_attr 
            // which is having the highest connect_time. This is because
            // we are interseted only in the collector this is connected 
            // to the latest. 
            
            // From this gen_attr see if the reset_time > connect_time. 
            
            // If yes then the process is down track it in down list. 
            // Else it is up and track in uplist.
            
            // If any of the process is down get the least reset_time 
            // from the down list and display the node as down. 
            
            // Else get the generator with max connect_time and 
            // show the status as Up.
            try{
                var genInfos = ifNull(jsonPath(d,
                    "$..ModuleServerState..generator_info"),[]);
                if(!genInfos){
                    return 'Down';
                }
                var upGenAttrs = [];
                var downGenAttrs = [];
                var isDown = false;
                $.each(genInfos,function(idx,genInfo){
                    var genAttr = 
                        getMaxGeneratorValueInArray(genInfo,"connect_time");
                    var connTime = jsonPath(genAttr,"$..connect_time")[0];
                    var resetTime = jsonPath(genAttr,"$..reset_time")[0];
                    if(resetTime > connTime){
                        isDown = true;
                        downGenAttrs.push(genAttr);
                    } else {
                        upGenAttrs.push(genAttr);
                    }
                });
                if(!isDown){
                    var maxConnTimeGen = 
                        getMaxGeneratorValueInArray(upGenAttrs,"connect_time");
                    var maxConnTime = 
                        jsonPath(maxConnTimeGen,"$..connect_time")[0];
                    var connectTime = new XDate(maxConnTime/1000);
                    var currTime = new XDate();
                    status = 'Up since ' + diffDates(connectTime,currTime);
                } else {
                    var minResetTimeGen = 
                        getMinGeneratorValueInArray(downGenAttrs,"reset_time");
                    var minResetTime = 
                        jsonPath(minResetTimeGen,"$..reset_time")[0];
                    var resetTime = new XDate(minResetTime/1000);
                    var currTime = new XDate();
                    status = 'Down since ' + diffDates(resetTime,currTime);
                }
            }catch(e){}
            
            return status;
        };
        
        self.parseAndMergeGeneratorWithPrimaryDataForInfraNodes = 
            function(response, primaryDS) {
             
            var genDSData = self.parseInfraGeneratorsData(response);
            var primaryData = primaryDS.getItems();
            var updatedData = [];
            // to avoid the change event getting triggered 
            // copy the data into another array and use it.
            var genData = [];
            $.each(genDSData,function (idx,obj){
                genData.push(obj);
            });
            $.each(primaryData,function(i,d){
                var idx=0;
                while(genData.length > 0 && idx < genData.length){
                    if(genData[idx]['name'].split(':')[0] == d['name']){
                        d['status'] = getFinalNodeStatusFromGenerators(
                           genData[idx]['status'],primaryData[i]);
                        d['isGeneratorRetrieved'] = true;
                        genData.splice(idx,1);
                        break;
                    }
                    idx++;
                };
                updatedData.push(d);
            });
            primaryDS.updateData(updatedData);
        };
        
        // This function accepts the node data and returns the alerts 
        // array which need to displayed in chart tooltip.
        self.getTooltipAlerts = function (data) {
            var tooltipAlerts = [];
            if (ifNull(data['alerts'],[]).length > 0) {
               $.each(data['alerts'],function(idx,obj){
                  if(obj['tooltipAlert'] != false)
                      tooltipAlerts.push({
                          label : 'Events',
                          value : ifNull(obj['msg'],"")
                      });
               });
            }
            return tooltipAlerts;
        };
    };
    return MonitorInfraUtils;
});