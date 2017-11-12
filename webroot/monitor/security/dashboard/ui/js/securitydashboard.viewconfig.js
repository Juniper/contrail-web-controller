/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodashv4', 'contrail-view', 'contrail-list-model'],
        function(_, ContrailView, ContrailListModel){
    var SecurityDashboardViewConfig = function () {
        var self = this;
        var topServiceCnt = 10;
        	//projectFQN = domain + ':' + projectSelectedValueData.name,
        //projectUUID = projectSelectedValueData.value;
        self.viewConfig = {
    		'top-10-allowed-rules': function () {
                return topRulesWidgetCfg('pass');
            },
            'top-10-denied-rules': function () {
                return topRulesWidgetCfg('deny');
            },
        	'vmi-implicit-allow-deny-scatterchart': function (){
            	return {
                    modelCfg: {
                        modelId:'vmi-implicit-allow-deny-model',
                        source: 'STATTABLE',
                        config: [{
                            "table_name": "StatTable.EndpointSecurityStats.eps.client",
                            "select": "eps.__key, name, SUM(eps.client.in_bytes), SUM(eps.client.out_bytes), SUM(eps.client.added)",
                            "from_time_utc": Date.now() - (1 * 60 * 60 * 1000),
                            "from_time": Date.now() - (1 * 60 * 60 * 1000),
                            "end_time": Date.now(),
                            "end_time_utc": Date.now(),
                            "where": "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            "parser": function(response){
                                return _.result(response, 'data', []);
                            }
                        },{
                            getAjaxConfig: function(epsClientData, postData) {
                                var ruleUUIDs = getRuleUUIDs(epsClientData, 'eps.__key');
                                return getAPIServerAjaxConfigOfRuleUUIDs(ruleUUIDs);
                            },
                            parser: function (response) {
                                return response;
                            },
                            mergeFn: function (response, contrailListModel) {
                                var ruleDataArr =
                                    mergeAnalyticsSessionDataWithConfigRuleData (response, contrailListModel.getItems(), 'eps.__key'),
                                    ruleMap = _.keyBy(response, 'eps.__key');
                                // Adding the implicit rules as these are not available
                                // in config server
                                _.map(cowc.DEFAULT_FIREWALL_RULES, function (value, key) {
                                    if (ruleMap[key] != null) {
                                        ruleDataArr.push($.extend(ruleMap[key], {
                                            implicit: true,
                                            name: _.result(value, 'name', '-')
                                        }));
                                    }
                                });
                                contrailListModel.setData(ruleDataArr);
                            }
                        }]
                    },
                    viewCfg:{
                        elementId : 'vmi-implicit-allow-deny',
                        view:'ZoomScatterChartView',
                        viewConfig: {
                            chartOptions: {
                                xLabelFormat: function(x) {return formatBytes(x);},
                                yLabelFormat: function(y) {return y;},
                                xLabel: 'Total Traffic',
                                yLabel: 'Sessions Added',
                                controlPanel: false,
                                dataParser: function (data) {
                                    var parsedData = {};
                                    data = _.groupBy(data, 'name')
                                    _.map(data, function (value, key) {
                                        parsedData[key] = {
                                            x: _.sumBy(value, 'SUM(eps.client.in_bytes)') + _.sumBy(value, 'SUM(eps.client.out_bytes)'),
                                            y: _.sumBy(value, 'SUM(eps.client.added)'),
                                            name: key,
                                            data: value,
                                            color: getVMIColor(value)
                                        };
                                    });
                                    return _.values(parsedData);
                                },
                                doBucketize:false,
                                tooltipConfigCB: function(currObj,format) {
                                    var options = {};
                                    var name = _.result(currObj, 'name', '-'),
                                        nameArr;
                                    if (name != null && name != '-' && typeof name == 'string') {
                                    	nameArr = name.split(':');
                                    	name = _.result(nameArr, 2, '-');
                                    	//name = nameArr.join('');
                                    }
                                    options['tooltipContents'] = [
                                          {label:'VMI Name', value: name},
                                          {label:'Total Traffic', value: formatBytes(currObj['x'])},
                                          {label:'Sessions Added', value: currObj['y']}
                                      ];
                                    options['subtitle'] = 'Total Traffic vs Sessions Added';
                                    return monitorInfraUtils.getDefaultGeneratorScatterChartTooltipFn(currObj,options);
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 2,
                        height: 1.5,
                        title: 'Interfaces',
                        showTitle: true
                    }
                }
            },
            'top-10-deny-rules': function () {
            	return topRulesWidgetCfg('deny');
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
                                        "start_time": "now-1h",
                                        "end_time": "now",
                                        "where": [[{"name":"vn","value":ctwu.getCurrentDomainProject(),"op":7}]],
                                        "select_fields": ["SUM(forward_logged_bytes)", "SUM(reverse_logged_bytes)", "protocol", "server_port"],
                                        "table": "SessionSeriesTable"
                                    })
                                },
                                dataParser : function (response) {
                                    var data =  _.result(response, 'value', []);
                                    return  _.filter(data, function (value) {
                                        return value['server_port'] < 36768 ? true : false;
                                    });
                                }
                            }
                        }
                    },
                    viewCfg:{
                        elementId : 'top-5-services',
                        view:'MultiBarChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: function(y) {return formatBytes(y);},
                                xAxisLabel: '',
                                yAxisLabel: 'Traffic',
                                barOrientation: 'horizontal',
                                zerofill: true,
                                xLblFormatter: function (d) {
                                    if (d != null && typeof d == 'string') {
                                       return d;
                                    }
                                },
                                margin: {top: 10, right: 30, bottom: 80, left: 100},
                            },
                            parseFn: function (data) {
                                return cowu.parseDataForDiscreteBarChart(data, {
                                    groupBy: function (obj) {
                                        return cowf.format.protocol(obj['protocol']) + ' ('+obj['server_port']+')';
                                    },
                                    axisField: function (obj) {
                                        return (_.result(obj, 'SUM(forward_logged_bytes)', 0) + _.result(obj, 'SUM(reverse_logged_bytes)', 0));
                                    },
                                    label: 'Traffic',
                                    topCnt: topServiceCnt,
                                    zerofill: true,
                                });
                            }
                        }
                    },
                    itemAttr: {
                        width: 1,
                        height: 1.5,
                        title: 'Top Services',
                        showTitle: true
                    }
                }
            }
         };
        function getVMIColor (data) {
            var color = cowc.COLOR_SEVERITY_MAP['blue'];
            _.forEach (data, function (value, key) {
                if (value['eps.__key'] == '00000000-0000-0000-0000-000000000002' ||
                        _.result(value, 'configData.action_list.simple_action') == 'deny') {
                    color = cowc.COLOR_SEVERITY_MAP['orange'];
                    return color;
                }
            })
            return color;
        }
        function getRuleUUIDs (data, uuidKey) {
            var rule = _.map(data, uuidKey),
            ruleUUIDs = [];
            _.forEach(rule, function (value) {
                if (value != null && typeof value == 'string' &&
                    value.indexOf(':') > -1) {
                    ruleUUIDs.push(value.split(':').pop());
                }
            })
            return ruleUUIDs;
        };
        function getAPIServerAjaxConfigOfRuleUUIDs (ruleUUIDs) {
            return {
                url: "/api/tenants/config/get-config-details",
                type: "POST",
                data: JSON.stringify(
                    {data: [{type: 'firewall-rules',obj_uuids: ruleUUIDs, fields: ['firewall_policy_back_refs',
                     'service', 'service_group_refs']}]})
            };
        }
        function mergeAnalyticsSessionDataWithConfigRuleData (configData, analyticsSessionData, analyticsDataKey, configDataKey) {
            var firewallRules = _.result(configData, '0.'+(configDataKey || 'firewall-rules'), []);
                ruleMap = _.keyBy(analyticsSessionData, (analyticsDataKey || 'security_policy_rule')),
                ruleDataArr = [];
                _.forEach(firewallRules, function(value) {
                    var firewallObj = _.result(value, 'firewall-rule');
                    var ruleStats = _.filter(ruleMap, function (value, key) {
                        return _.includes(key, _.result(firewallObj, 'uuid'));
                    })
                    ruleDataArr.push($.extend({}, _.result(ruleStats, '0', {}), {configData: firewallObj}));
                });
            return ruleDataArr;
        }
        function ruleUUIdFormatter (d) {
            if (cowc.DEFAULT_FIREWALL_RULES[d] != null) {
                d = cowc.DEFAULT_FIREWALL_RULES[d]['name'];
            }
            // Hack for now to differentiate between the
            // tooltip header formatter and axis tick formatter
            // because we dont want to call the formatter in
            // tooltip
            if (arguments.length == 2) {
            	return d;
            	/*return '<tspan x="10">tspan line 1</tspan>'+
                '<tspan x="10" dy="15">tspan line 2</tspan>';*/
            }
            if (d != null && typeof d == 'string') {
            	/*return '<tspan x="10">tspan line 1</tspan>'+
                '<tspan x="10" dy="15">tspan line 2</tspan>';*/
                if (d.length > 38) {
            		d = d.split('<--->')[0]+'...'; 
            	}
            	return d;
            }
        }
        function topRulesWidgetCfg (action) {
        	return {
                modelCfg: {
                    modelId:'top-10-rule',
                    config: {
                        remote : {
                            ajaxConfig : {
                                url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                                type:'POST',
                                data:JSON.stringify({
                                    "session_type": "client",
                                    "start_time": "now-1h",
                                    "end_time": "now",
                                    "where": [[{"name":"vn","value":ctwu.getCurrentDomainProject(),"op":7}]],
                                    //"select_fields": ["SUM(forward_logged_bytes)", "SUM(reverse_logged_bytes)", "security_policy_rule", "forward_action"],
                                    "select_fields": ["SUM(forward_logged_bytes)", "SUM(reverse_logged_bytes)", "security_policy_rule"],
                                    "table": "SessionSeriesTable"
                                })
                            },
                            dataParser : function (response) {
                                return _.result(response, 'value', []);
                            }
                        },
                        vlRemoteConfig : {
                            vlRemoteList : [{
                                getAjaxConfig : function (sessionSeries) {
                                    var ruleUUIDs = getRuleUUIDs(sessionSeries, 'security_policy_rule');
                                    return getAPIServerAjaxConfigOfRuleUUIDs(ruleUUIDs);
                                },
                                successCallback : function(response, contrailListModel) {
                                    var ruleDataArr =
                                        mergeAnalyticsSessionDataWithConfigRuleData (response, contrailListModel.getItems());
                                    // Adding the implicit rules as these are not available
                                    // in config server
                                    _.map(cowc.DEFAULT_FIREWALL_RULES, function (value, key) {
                                        if (ruleMap[key] != null) {
                                            ruleDataArr.push($.extend(ruleMap[key], {
                                                implicit: true,
                                                name: _.result(value, 'name', '-')
                                            }));
                                        }
                                    });
                                    contrailListModel.setData(ruleDataArr);
                                }
                            }],
                        }
                    }
                },
                viewCfg:{
                    elementId : 'top-10-rules',
                    view:'MultiBarChartView',
                    viewConfig: {
                        chartOptions: {
                            yFormatter: function(y) {return formatBytes(y);},
                            xAxisLabel: '',
                            yAxisLabel: 'Traffic',
                            barOrientation: 'horizontal',
                            zerofill: true,
                            xLblFormatter: ruleUUIdFormatter
                        },
                        parseFn: function (data) {
                            /*data = _.filter(data, function (obj) {
                                return _.result(obj, 'forward_action') == action;
                            });*/
                            return cowu.parseDataForDiscreteBarChart(data, {
                                groupBy: function (obj) {
                                    if (obj['implicit']) {
                                        return _.result(obj, 'name', '-');
                                    }
                                    var endpoint1_tags = _.result(obj, 'configData.endpoint_1.tags', []).join('&');
                                    var endpoint2_tags = _.result(obj, 'configData.endpoint_2.tags', []).join('&');
                                    return endpoint1_tags + ' <---> ' + endpoint2_tags;
                                },
                                    axisField: function (obj) {
                                    return (_.result(obj, 'SUM(forward_logged_bytes)', 0) + _.result(obj, 'SUM(reverse_logged_bytes)', 0));
                                },
                                label: 'Traffic',
                                topCnt: topServiceCnt,
                                zerofill: true,
                            });
                        }
                    }
                },
                itemAttr: {
                    width: 1,
                    height: 1.5,
                    //title: action == 'pass' ? 'Top Allowed Rules': 'Top Denied Rules',
                    title: 'Top Rules',
                    showTitle: true
                }
            
        	}
        }
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new SecurityDashboardViewConfig()).viewConfig;
});
