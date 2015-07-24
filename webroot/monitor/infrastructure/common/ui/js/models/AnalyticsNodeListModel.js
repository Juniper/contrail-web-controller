define(['contrail-list-model'], function(ContrailListModel) {
    var AnalyticsNodeListModel = function() {
        if (AnalyticsNodeListModel.prototype.singletonInstance) {
            return AnalyticsNodeListModel.prototype.singletonInstance;
        }
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : ctwl.ANALYTICSNODE_SUMMARY_URL
                },
                dataParser : parseAnalyticsNodesDashboardData
            },
            vlRemoteConfig : {
                vlRemoteList : [{
                    getAjaxConfig : function() {
                        return monitorInfraUtils
                            .getGeneratorsAjaxConfigForInfraNodes(
                                'analyticsNodeDS');
                    },
                    successCallback : function(response, contrailListModel) {
                        monitorInfraUtils
                            .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                                response, contrailListModel);
                    }
                }, {
                    getAjaxConfig : function() {
                        var postData =
                            getPostData("analytics-node", '', '',
                                'CollectorState:generator_infos', '');
                        return {
                            url : TENANT_API_URL,
                            type : 'POST',
                            data : JSON.stringify(postData)
                        };
                    },
                    sucessCallback : function(response, contrailListModel) {
                        if (result != null && result[0] != null) {
                            monitorInfraUtils
                                .mergeCollectorDataAndPrimaryData(result[0],
                                        contrailListModel);
                        }
                    }
                }
                //Need to add cpu stats
                ]
            },
            cacheConfig : {
                ucid : ctwc.CACHE_ANALYTICSNODE
            }
        };
        function parseAnalyticsNodesDashboardData(result) {
            var retArr = [];
            $.each(result, function(idx, d) {
                var obj = {};
                obj['x'] =
                    parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info' +
                    '[?(@.module_id=="contrail-collector")]..cpu_share')[0]);
                obj['y'] =
                    parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info' +
                    '[?(@.module_id=="contrail-collector")]..meminfo.res')[0])
                    / 1024;
                obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
                obj['memory'] = formatBytes(obj['y'] * 1024 * 1024);
                obj['x'] = $.isNumeric(obj['x']) ? obj['x'] : 0;
                obj['y'] = $.isNumeric(obj['y']) ? obj['y'] : 0;
                obj['histCpuArr'] =
                    parseUveHistoricalValues(d,'$.cpuStats.history-10');
                obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                    '$..QueryStats.queries_being_processed')[0], []).length;
                obj['pendingQueryCnt'] = ifNull(jsonPath(d,
                    '$..QueryStats.pending_queries')[0], []).length;
                obj['size'] = obj['pendingQueryCnt'] + 1;
                obj['shape'] = 'circle';
                obj['type'] = 'analyticsNode';
                obj['display_type'] = 'Analytics Node';
                obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,
                    '$.value.CollectorState.build_info')[0]), '-');
                try {
                    obj['status'] = getOverallNodeStatus(d, "analytics");
                } catch(e) {
                    obj['status'] = 'Down';
                }
                //get the ips
                var iplist = ifNull(jsonPath(d,'$..self_ip_list')[0],
                   noDataStr);
                obj['ip'] = obj['summaryIps'] = noDataStr;
                if (iplist != null && iplist != noDataStr
                   && iplist.length > 0) {
                    obj['ip'] = iplist[0];
                    var ipString = "";
                    $.each(iplist, function(idx, ip) {
                        if (idx + 1 == iplist.length) {
                            ipString = ipString + ip;
                        } else {
                            ipString = ipString + ip + ', ';
                        }
                    });
                    obj['summaryIps'] = ipString;
                }
                obj['name'] = d['name'];
                obj['link'] = {
                    p : 'mon_infra_analytics',
                    q : {
                        node : obj['name'],
                        tab : ''
                    }
                };
                obj['errorStrings'] = ifNull(jsonPath(d,
                    "$.value.ModuleCpuState.error_strings")[0], []);
                obj['isNTPUnsynced'] =
                    isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                var isConfigDataAvailable = $.isEmptyObject(jsonPath(d,
                    '$..ConfigData')[0]) ? false : true;
                obj['isUveMissing'] =
                    ($.isEmptyObject(jsonPath(d,'$..CollectorState')[0])
                    && isConfigDataAvailable) ? true : false;
                obj['processAlerts'] =
                    infraMonitorAlertUtils.getProcessAlerts(d, obj);
                obj['isPartialUveMissing'] = false;
                if (obj['isUveMissing'] == false) {
                    if (isEmptyObject(jsonPath(d,
                        '$.value.ModuleCpuState.module_cpu_info'+
                        '[?(@.module_id=="contrail-collector")].cpu_info')[0])
                        || isEmptyObject(jsonPath(d,
                                '$.value.CollectorState.build_info')[0])) {
                                obj['isPartialUveMissing'] = true;
                    }
                }
                //get the cpu for analytics node
                var cpuInfo =
                    jsonPath(d,'$..ModuleCpuState.module_cpu_info')[0];
                obj['isGeneratorRetrieved'] = false;
                var genInfos = ifNull(jsonPath(d,
                    '$.value.CollectorState.generator_infos')[0], []);
                obj['genCount'] = genInfos.length;
                obj['nodeAlerts'] = infraMonitorAlertUtils
                                        .processAnalyticsNodeAlerts(obj);
                obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                                    .sort(dashboardUtils.sortInfraAlerts);
                obj['color'] = monitorInfraUtils.getAnalyticsNodeColor(d, obj);
                retArr.push(obj);
            });
            retArr.sort(dashboardUtils.sortNodesByColor);
            return retArr;
        };
        AnalyticsNodeListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return AnalyticsNodeListModel.prototype.singletonInstance;
    };
    return AnalyticsNodeListModel;
});
