define([
    'contrail-list-model'
], function (ContrailListModel) {
    var DatabaseNodeListModel = function () {
        if(DatabaseNodeListModel.prototype.singletonInstance) {
            return DatabaseNodeListModel.prototype.singletonInstance;
        }
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.DATABASENODE_SUMMARY_URL
                    },
                    dataParser : parseDatabaseNodesDashboardData
                },
                cacheConfig : {
                    ucid: ctwc.CACHE_DATABASENODE
                }
            };
        function parseDatabaseNodesDashboardData (result){
            var retArr = [];
            $.each(result,function(idx,d) {
                var obj = {};
                var dbSpaceAvailable =
                    parseFloat(jsonPath(d,
                    '$.value.databaseNode.DatabaseUsageInfo.'+
                    'database_usage[0].disk_space_available_1k')[0]);
                var dbSpaceUsed = parseFloat(jsonPath(d,
                    '$.value.databaseNode.DatabaseUsageInfo.'+
                    'database_usage[0].disk_space_used_1k')[0]);
                var analyticsDbSize = parseFloat(jsonPath(d,
                    '$.value.databaseNode.DatabaseUsageInfo.'+
                    'database_usage[0].analytics_db_size_1k')[0]);

                obj['x'] = $.isNumeric(dbSpaceAvailable)?
                    dbSpaceAvailable / 1024 / 1024 : 0;
                obj['y'] = $.isNumeric(dbSpaceUsed)?
                    dbSpaceUsed / 1024 / 1024 : 0;

                obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(d,
                    'value;ConfigData')) ? true : false;
                obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(d,
                    'value;databaseNode'))) ? true : false;
                var configData;
                if(!obj['isConfigMissing']){
                    configData = getValueByJsonPath(d,'value;ConfigData');
                    obj['ip'] = configData.database_node_ip_address;
                } else {
                    obj['ip'] = noDataStr;
                }
                obj['dbSpaceAvailable'] = dbSpaceAvailable;
                obj['dbSpaceUsed'] = dbSpaceUsed;
                obj['analyticsDbSize'] = analyticsDbSize;
                obj['formattedAvailableSpace'] = $.isNumeric(dbSpaceAvailable)?
                    formatBytes(dbSpaceAvailable * 1024) : '-';
                obj['formattedUsedSpace'] = $.isNumeric(dbSpaceUsed)?
                    formatBytes(dbSpaceUsed * 1024) : '-';
                obj['formattedAnalyticsDbSize'] = $.isNumeric(analyticsDbSize)?
                    formatBytes(analyticsDbSize * 1024) : '-';
                //Use the db usage percentage for bubble size
                var usedPercentage = (obj['y'] * 100) / (obj['y']+obj['x']);
                obj['usedPercentage'] = usedPercentage;
                obj['formattedUsedPercentage'] = $.isNumeric(usedPercentage)?
                    usedPercentage.toFixed(2) + ' %': '-' ;
                obj['size'] = obj['usedPercentage']  ;
                obj['shape'] = 'circle';
                obj['type'] = 'dbNode';
                obj['display_type'] = 'Database Node';
                obj['name'] = d['name'];
                obj['link'] = {p:'mon_infra_database',
                    q:{node:obj['name'],tab:''}};
                obj['processAlerts'] =
                    infraMonitorAlertUtils.getProcessAlerts(d,obj);
                obj['isPartialUveMissing'] = false;
                try{
                    obj['status'] = getOverallNodeStatus(d,"db");
                }catch(e){
                    obj['status'] = 'Down';
                }
                obj['isNTPUnsynced'] =
                    isNTPUnsynced(jsonPath(d,'$..NodeStatus')[0]);
                obj['nodeAlerts'] =
                    infraMonitorAlertUtils.processDbNodeAlerts(obj);
                obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts'])
                    .sort(dashboardUtils.sortInfraAlerts);
                obj['color'] = monitorInfraUtils.getDatabaseNodeColor(d,obj);
                retArr.push(obj);
            });
            retArr.sort(dashboardUtils.sortNodesByColor);
            return retArr;
        };
        DatabaseNodeListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return DatabaseNodeListModel.prototype.singletonInstance;
    };
    return DatabaseNodeListModel;
    }
);