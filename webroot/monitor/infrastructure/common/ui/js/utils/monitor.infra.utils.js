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

        //Utility get the process uptime given process data
        self.getProcessUpTime = function (d) {
            var upTimeStr = noDataStr;
            if(d != null && d.process_state != null &&
                    d.process_state.toUpperCase() == "PROCESS_STATE_RUNNING") {
                if(d.last_start_time != null){
                    var upTime = new XDate(d.last_start_time/1000);
                    var currTime = new XDate();
                    upTimeStr = 'Up since ' + diffDates(upTime,currTime);
                }
            } else {
                var exitTime=0,stopTime=0;
                var currTime = new XDate();
                if(d.last_exit_time != null){
                    exitTime = d.last_exit_time;
                }
                if(d.last_stop_time != null){
                    stopTime = d.last_stop_time;
                }
                if(exitTime != 0 || stopTime != 0){
                    if(exitTime > stopTime){
                        exitTime = new XDate(exitTime/1000);
                        upTimeStr = 'Down since ' + diffDates(exitTime,currTime);
                    } else {
                        stopTime = new XDate(stopTime/1000);
                        upTimeStr = 'Down since ' + diffDates(stopTime,currTime);
                    }
                } else {
                    upTimeStr = "Down";
                }
            }
            return upTimeStr;
        };

        /*
         * Common function to retrieve the analytics messages count and size
         */
        self.getAnalyticsMessagesCountAndSize = function (d,procList){
            var count = 0,size = 0, obj = {};
            for(var key in d){
                var label = key.toUpperCase();
                $.each(procList,function(idx,proc){
                    if(label.indexOf(":"+proc.toUpperCase()+":") != -1){
                        obj[key] = d[key];
                    }
                });
            }
            var sizes =  ifNull(jsonPath(obj,"$..ModuleClientState.client_info.tx_socket_stats.bytes"),0);
            var counts = ifNull(jsonPath(obj,"$..ModuleClientState.session_stats.num_send_msg"),0);
            $.each(counts,function(i,cnt){
                count += cnt;
            });
            $.each(sizes,function(i,sze){
                size += sze;
            });
            return {count:count,size:size};
        }

        //Given the data and the node type get the last log time stamp for the node
        self.getLastLogTimestamp = function (d, nodeType){
            var logLevelStats = [], lastLog, lastTimeStamp;
            var procsList = [];
            if(nodeType != null){
                if(nodeType == "control"){
                    procsList = monitorInfraConstants.controlProcsForLastTimeStamp;
                } else if (nodeType == "compute"){
                    var proces = getValueByJsonPath(d,'NodeStatus;process_status;0;module_id');
                    if(proces != null){
                        procsList = [proces];
                    } else {
                        procsList = monitorInfraConstants.computeProcsForLastTimeStamp;
                    }
                } else if (nodeType =="analytics") {
                    procsList = monitorInfraConstants.analyticsProcsForLastTimeStamp;
                } else if (nodeType =="config"){
                    procsList = monitorInfraConstants.configProcsForLastTimeStamp;
                }
                $.each(procsList,function(idx,proc){
                    logLevelStats = getAllLogLevelStats(d,proc,logLevelStats);
                });
            } else {
                logLevelStats = getAllLogLevelStats(d,"",logLevelStats);
            }

            if(logLevelStats != null){
                lastLog = getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
                if(lastLog != null){
                    lastTimeStamp = lastLog.last_msg_timestamp;
                }
            }
            return lastTimeStamp;
        }

        /**
         * Function returns the overall node status html of monitor infra node details page
         */
        self.getOverallNodeStatusForDetails = function (data){
            var statusObj = this.getNodeStatusForSummaryPages(data);
            var templateData = {result:statusObj['alerts'],showMore:true,defaultItems:1};
            return contrail.getTemplate4Id('overallNodeStatusTemplate')(templateData);
        }

        /**
         * This function takes parsed nodeData from the infra parse functions and returns object with all alerts displaying in dashboard tooltip,
         * and tooltip messages array
         */
        self.getNodeStatusForSummaryPages = function (data,page) {
            var result = {},msgs = [],tooltipAlerts = [];
            for(var i = 0;i < data['alerts'].length; i++) {
                if(data['alerts'][i]['tooltipAlert'] != false) {
                    tooltipAlerts.push(data['alerts'][i]);
                    msgs.push(data['alerts'][i]['msg']);
                }
            }
            //Status is pushed to messages array only if the status is "UP" and tooltip alerts(which are displaying in tooltip) are zero
            if(ifNull(data['status'],"").indexOf('Up') > -1 && tooltipAlerts.length == 0) {
                msgs.push(data['status']);
                tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['INFO']});
            } else if(ifNull(data['status'],"").indexOf('Down') > -1) {
                //Need to discuss and add the down status
                //msgs.push(data['status']);
                //tooltipAlerts.push({msg:data['status'],sevLevel:sevLevels['ERROR']})
            }
            result['alerts'] = tooltipAlerts;
            result['nodeSeverity'] = data['alerts'][0] != null ? data['alerts'][0]['sevLevel'] : sevLevels['INFO'];
            result['messages'] = msgs;
             var statusTemplate = contrail.getTemplate4Id('statusTemplate');
            if(page == 'summary')
                return statusTemplate({sevLevel:result['nodeSeverity'],sevLevels:sevLevels});
            return result;
        }
    };
    return MonitorInfraUtils;
});