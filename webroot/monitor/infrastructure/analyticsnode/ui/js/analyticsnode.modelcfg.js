define(['lodash', 'contrail-view', 'legend-view', 'monitor-infra-confignode-model', 'node-color-mapping'],
        function(_, ContrailView, LegendView, configNodeListModelCfg, NodeColorMapping){
    var ConfigNodeModelConfig = function () {
        var self = this;
        self.modelCfg = {
            'ANALYTICSNODE_SANDESH_MSG_MODEL': {
                type: "analyticsNode",
                source: 'STATTABLE',
                config: {
                    table_name: 'StatTable.SandeshMessageStat.msg_info',
                    select: 'Source, T=, SUM(msg_info.messages), AVG(msg_info.bytes)'
                }
            },
            'ANALYTICSNODE_PERCENTILE_MODEL' : {
                type: "analyticsNode",
                source: 'STATTABLE',
                config: {
                    "table_name": "StatTable.SandeshMessageStat.msg_info",
                    "select": "PERCENTILES(msg_info.bytes), PERCENTILES(msg_info.messages)",
                    "parser": monitorInfraParsers.percentileAnalyticsNodeSummaryChart
                }
            },
            'ANALYTICSNODE_QUERYSTATS_MODEL' : {
                type: "analyticsNode",
                source: 'STATTABLE',
                config: {
                    table_name: 'StatTable.QueryPerfInfo.query_stats',
                    select: 'Source,T=, COUNT(query_stats)',
                    where: 'Source Starts with '
                }
            },
            'ANALYTICSNODE_GENERATORS_MODEL': {
                type: "analyticsNode",
                source: 'STATTABLE',
                config: {
                    "table_name": "StatTable.SandeshMessageStat.msg_info",
                    "select": "name, SUM(msg_info.messages),SUM(msg_info.bytes)",
                    "parser": function(response){
                        var apiStats = cowu.ifNull(response, []),
                            parsedData = [];
                        var cf = crossfilter(apiStats);
                        var sourceDim = cf.dimension(function (d) {return d['name']});
                        var totalResMessages = sourceDim.group().reduceSum(
                                function (d) {
                                    return d['SUM(msg_info.messages)'];
                                });
                        var totalResSize = sourceDim.group().reduceSum(
                                function (d) {
                                    return d['SUM(msg_info.bytes)'];
                                });
                        totalResMessagesData = totalResMessages.all();
                        totalResSize = totalResSize.all();
                            $.each(totalResSize, function (key, value){
                                var xValue = Math.round(value['value']/120);
                                var Source = value['key'].substring(0, 6);
                                xValue = formatBytes(xValue);
                                xValue = parseFloat(xValue);
                                xValue = Math.round(xValue);
                                parsedData.push({
                                    Source : Source,
                                    label: value['key'],
                                    x: parseFloat(xValue)
                                    //color: colors[value['key']]
                                });
                            });
                            $.each(totalResMessagesData, function (key, value){
                                var dataWithX = _.find(parsedData, function(xValue){
                                    return xValue.label === value["key"];
                                });
                                dataWithX.y = value['value']/120;
                                dataWithX.y = parseFloat(dataWithX.y);
                                dataWithX.y = Math.round(dataWithX.y);
                            });
                        return parsedData;

                    }
                }
            },
            'ANALYTICSNODE_DB_READWRITE_MODEL': {
                type: "analyticsNode",
                source:'STATTABLE',
                config: {
                    table_name: 'StatTable.CollectorDbStats.table_info',
                    select: 'Source, SUM(table_info.writes), SUM(table_info.write_fails),T='
                }
            }

        }
    }

    return (new ConfigNodeModelConfig()).modelCfg;
})
