define([
    'contrail-list-model'
], function (ContrailListModel) {
    var ConfigNodeListModel = function () {
        if(ConfigNodeListModel.prototype.singletonInstance) {
            return ConfigNodeListModel.prototype.singletonInstance;
        }
        var vlRemoteList = [
            {
                getAjaxConfig: function() {
                    return monitorInfraUtils
                       .getGeneratorsAjaxConfigForInfraNodes('configNodeDS');
                },
                successCallback: function(response,contrailListModel) {
                    monitorInfraUtils
                       .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                       response,contrailListModel);
                }
            }
                            //Need to add cpu stats
        ];
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.CONFIGNODE_SUMMARY_URL
                    },
                    dataParser : parseConfigNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteList
                },
                cacheConfig : {
                    ucid: ctwc.CACHE_CONFIGNODE
                }
            };
        function parseConfigNodesDashboardData (result) {
            var retArr = [];
            $.each(result,function(idx,d) {
                var obj = {};
                obj['x'] = parseFloat(jsonPath(d,
                    '$..ModuleCpuState.module_cpu_info'+
                    '[?(@.module_id=="contrail-api")]..cpu_share')[0]);
                obj['y'] = parseInt(jsonPath(d,
                    '$..ModuleCpuState.module_cpu_info'+
                    '[?(@.module_id=="contrail-api")]..meminfo.res')[0])/1024;
                obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
                obj['memory'] = formatBytes(obj['y']*1024*1024);
                obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                //Re-visit once average response time added for config nodes
                obj['size'] = 1;
                obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,
                    '$.value.configNode.ModuleCpuState.build_info')[0]),'-');
                obj['shape'] = 'circle';
                obj['type'] = 'configNode';
                obj['display_type'] = 'Config Node';
                obj['name'] = d['name'];
                obj['link'] =
                    {p:'mon_infra_config',q:{node:obj['name'],tab:''}};
                obj['isNTPUnsynced'] =
                    isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                obj['isConfigMissing'] =
                    $.isEmptyObject(getValueByJsonPath(d,
                                            'value;ConfigData')) ? true : false;
                obj['isUveMissing'] =
                    ($.isEmptyObject(getValueByJsonPath(d,'value;configNode')))
                        ? true : false;
                obj['processAlerts'] =
                    infraMonitorAlertUtils.getProcessAlerts(d,obj);
                obj['isPartialUveMissing'] = false;
                try{
                    obj['status'] = getOverallNodeStatus(d,"config");
                }catch(e){
                    obj['status'] = 'Down';
                }
                obj['histCpuArr'] =
                    parseUveHistoricalValues(d,'$.cpuStats.history-10');
                var iplist = jsonPath(d,'$..config_node_ip')[0];
                obj['ip'] = obj['summaryIps'] = noDataStr;
                if(iplist != null && iplist != noDataStr && iplist.length > 0){
                obj['ip'] = iplist[0];
                var ipString = "";
                    $.each(iplist, function (idx, ip){
                        if(idx+1 == iplist.length) {
                            ipString = ipString + ip;
                           } else {
                            ipString = ipString + ip + ', ';
                           }
                    });
                    obj['summaryIps'] = ipString;
                }
                if(isEmptyObject(jsonPath(d,
                   '$.value.configNode.ModuleCpuState.module_cpu_info'+
                   '[?(@.module_id=="contrail-api")].cpu_info')[0]) ||
                   isEmptyObject(jsonPath(d,
                        '$.value.configNode.ModuleCpuState.build_info')[0])) {
                   obj['isPartialUveMissing'] = true;
                }
                obj['isGeneratorRetrieved'] = false;
                obj['nodeAlerts'] =
                    infraMonitorAlertUtils.processConfigNodeAlerts(obj);
                obj['alerts'] =
                    obj['nodeAlerts'].concat(obj['processAlerts'])
                        .sort(dashboardUtils.sortInfraAlerts);
                obj['color'] = monitorInfraUtils.getConfigNodeColor(d,obj);
                retArr.push(obj);
            });
            retArr.sort(dashboardUtils.sortNodesByColor);
            return retArr;
        }
        ConfigNodeListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return ConfigNodeListModel.prototype.singletonInstance;
    };
    return ConfigNodeListModel;
    }
);