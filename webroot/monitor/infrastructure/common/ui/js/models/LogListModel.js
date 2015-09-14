/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var LogListModel = function() {
        if (LogListModel.prototype.singletonInstance) {
            return LogListModel.prototype.singletonInstance;
        }
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : ctwl.DASHBOARD_LOGS_URL
                },
                dataParser : parseDashboardLogs,
            },
            cacheConfig : {
                ucid : ctwl.CACHE_DASHBORAD_LOGS
            }
        };

        function parseDashboardLogs(result) {
            retArr = $.map(result['data'],function(obj,idx) {
                obj['message'] = formatXML2JSON(obj['Xmlmessage']);
                obj['timeStr'] = diffDates(new XDate(obj['MessageTS']/1000),new XDate());
                if(obj['Source'] == null)
                    obj['moduleId'] = contrail.format('{0}',obj['ModuleId']);
                else
                    obj['moduleId'] = contrail.format('{0} ({1})',obj['ModuleId'],obj['Source']);
                if($.inArray(obj['ModuleId'],[UVEModuleIds['DISCOVERY_SERVICE'],
                    UVEModuleIds['SERVICE_MONITOR'],UVEModuleIds['SCHEMA'],
                    UVEModuleIds['CONFIG_NODE']]) != -1) {
                    obj['link'] = {p:'mon_infra_config',q:{node:obj['Source'],tab:''}};
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['COLLECTOR'],
                    UVEModuleIds['OPSERVER'],UVEModuleIds['QUERYENGINE']],
                    obj['ModuleId']) != -1) {
                    obj['link'] = {p:'mon_infra_analytics',q:{node:obj['Source'],tab:''}};
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['VROUTER_AGENT']]) != -1) {
                    obj['link'] = {p:'mon_infra_vrouter',q:{node:obj['Source'],tab:''}};
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['CONTROLNODE']]) != -1) {
                    obj['link'] = {p:'mon_infra_control',q:{node:obj['Source'],tab:''}};
                };
                return obj;
            });
            return retArr;
        };
        LogListModel.prototype.singletonInstance =
            new ContrailListModel(listModelConfig);
        return LogListModel.prototype.singletonInstance;
    };
    return LogListModel;
});
