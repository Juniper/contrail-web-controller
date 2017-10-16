/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodashv4', 'contrail-view', 'contrail-list-model'],
        function(_, ContrailView, ContrailListModel){
    var SecurityDashboardViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'vmi-implicit-allow-deny-scatterchart': function (){
                return {
                    modelCfg: {
                        modelId:'vmi-implicit-allow-deny-model',
                        source: 'STATTABLE',
                        config: {
                            "table_name": "StatTable.EndpointSecurityStats.eps.client",
                            "select": "eps.__key, name, SUM(eps.client.in_bytes), SUM(eps.client.out_bytes)",
                            'where': '(eps.__key = 00000000-0000-0000-0000-000000000001) OR (eps.__key = 00000000-0000-0000-0000-000000000002)',
                            "parser": function(response){
                                return _.result(response, 'data', []);
                            }
                        }
                    },
                    viewCfg:{
                        elementId : 'vmi-implicit-allow-deny',
                        view:'ZoomScatterChartView',
                        viewConfig: {
                            chartOptions: {
                                xLabelFormat: function(x) {return formatBytes(x);},
                                yLabelFormat: function(y) {return formatBytes(y);},
                                xLabel: 'Implicit Allow',
                                yLabel: 'Implicit Deny',
                                dataParser: function (data) {
                                    var parsedData = [];
                                    _.each(data, function (obj, i) {
                                         if (obj['SUM(eps.client.out_bytes)'] != 0 || obj['SUM(eps.client.in_bytes)'] != 0) {
                                             obj['x'] = obj['y'] = 0;
                                             if (obj['eps.__key'] == '00000000-0000-0000-0000-000000000001') {
                                                 obj['x'] = obj['SUM(eps.client.out_bytes)'] + obj['SUM(eps.client.in_bytes)']
                                             } else if (obj['eps.__key'] == '00000000-0000-0000-0000-000000000002') {
                                                 obj['y'] = obj['SUM(eps.client.out_bytes)'] + obj['SUM(eps.client.in_bytes)']
                                             }
                                             parsedData.push(obj);
                                         }
                                    })
                                    return parsedData;
                                },
                                doBucketize:false,
                                tooltipConfigCB: function(currObj,format) {
                                    var options = {};
                                    var nodes = currObj;
                                    options['tooltipContents'] = [
                                          {label:'VMI Name', value: nodes.name},
                                          {label:'Implicit Allow', value:formatBytes(currObj['x'])},
                                          {label:'Implicit Deny', value:formatBytes(currObj['y'])}
                                      ];
                                    options['subtitle'] = 'Implicit Allow/Deny';
                                    return monitorInfraUtils.getDefaultGeneratorScatterChartTooltipFn(currObj,options);
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 2,
                        height: 1.5,
                        title: 'Implicit Allow/Deny stats of VMI'
                    }
                }
            },
            'top-5-services': function () {
                 return {
                    modelCfg: {
                        modelId:'top-5-services',
                        config: {
                            remote : {
                                ajaxConfig : {
                                    url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                                    type:'POST',
                                    data:JSON.stringify({
                                        "session_type": "client",
                                        "start_time": "now-10m",
                                        "end_time": "now",
                                        "select_fields": ["SUM(forward_logged_bytes)", "SUM(reverse_logged_bytes)", "protocol", "server_port"],
                                        "table": "SessionSeriesTable"
                                    })
                                },
                                dataParser : function (response) {
                                    return _.result(response, 'value', []);
                                }
                            }
                        }
                    },
                    viewCfg:{
                        elementId : 'top-5-services',
                        view:'MultiBarChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: function(y) {return formatBytes(y, true);},
                                xAxisLabel: 'Service',
                                yAxisLabel: 'Traffic'
                            },
                            parseFn: function (data) {
                                var parsedData = {}, chartData = [];
                                _.each(data, function (obj, i) {
                                    var service = cowf.format.protocol(obj['protocol']) + '('+obj['server_port']+')';
                                     if (parsedData[service] != null) {
                                         parsedData[service] += (_.result(obj, 'SUM(forward_logged_bytes)', 0) + _.result(obj, 'SUM(reverse_logged_bytes)', 0));
                                     } else {
                                         parsedData[service] = _.result(obj, 'SUM(forward_logged_bytes)', 0) + _.result(obj, 'SUM(reverse_logged_bytes)', 0);
                                     }
                                });
                                _.map(parsedData, function (value, key) {
                                     chartData.push({label: key, value: value})
                                });
                                chartData = _.sortBy(chartData, function (obj){
                                    return -obj.value; //minus to get descending order
                                })
                                return [{
                                    key: 'Top 5 Services',
                                    values: chartData.slice(0,10)
                                }];
                            }
                        }
                    },
                    itemAttr: {
                        width: 1,
                        height: 1.5,
                        title: 'Implicit Allow/Deny stats of VMI'
                    }
                }
            }
         };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new SecurityDashboardViewConfig()).viewConfig;
});
