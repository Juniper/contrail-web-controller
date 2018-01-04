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
                            "where": "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                        },{
                            table_name: 'firewall-rules',
                            source: 'APISERVER',
                            fields: ['firewall_policy_back_refs',
                                     'service', 'service_group_refs'],
                            where: function (model, defObj) {
                                return getRuleUUIDs(model.get('data'), 'eps.__key', defObj);
                            },
                            mergeFn: function (data, model) {
                                var analyticsEpsClientData = model.get('data');
                                    ruleDataArr = cowu.updateModelDataWithAdditionalFields({
                                        model: model,
                                        data: data,
                                        modelKey: 'eps.__key',
                                        joinKey: 'uuid',
                                        compareFn: function (epsKey, uuid) {
                                            if (epsKey != null) {
                                                return epsKey.split(':')[2] == uuid;
                                            }
                                            return false;
                                        }
                                    });
                                // Adding the implicit rules as these are not available
                                // in config server
                                var implicitDenied = _.filter (analyticsEpsClientData, function (value, key) {
                                    return _.result(value, 'eps.__key') == cowc.IMPLICIT_DENY_UUID;
                                })
                                _.forEach(implicitDenied, function (value) {
                                    ruleDataArr.push($.extend(value, {
                                        implicit: true,
                                    }));
                                });
                                model.set({data:ruleDataArr});
                                return ruleDataArr;
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
                                    var data = _.result(currObj, 'data', []),
                                        name = _.result(currObj, 'name', '-'),
                                        nameArr;
                                    var implicitDeny = _.filter(data, function (value, key) {
                                        return _.result(value, 'eps.__key') == cowc.IMPLICIT_DENY_UUID;
                                    });
                                    var deny = _.filter(data, function (value, key) {
                                        return _.result(value, 'configData.action_list.simple_action') == 'deny';
                                    })
                                    if (name != null && name != '-' && typeof name == 'string') {
                                    	nameArr = name.split(':');
                                    	name = _.result(nameArr, 2, '-');
                                    	//name = nameArr.join('');
                                    }
                                    var tooltipContents = [
                                                           {label:'VMI Name', value: name},
                                                           {label:'Total Traffic', value: formatBytes(currObj['x'])},
                                                           {label:'Sessions Added', value: currObj['y']}
                                                       ];
                                    if (implicitDeny.length) {
                                        tooltipContents.push({label: 'Implicit Denied Traffic',
                                            value: formatBytes(_.sumBy(implicitDeny, 'SUM(eps.client.in_bytes)')
                                                    + _.sumBy(implicitDeny, 'SUM(eps.client.out_bytes)'))})
                                    }
                                    if (deny.length) {
                                        tooltipContents.push({label: 'Denied Traffic',
                                            value: formatBytes(_.sumBy(deny, 'SUM(eps.client.in_bytes)')
                                                    + _.sumBy(deny, 'SUM(eps.client.out_bytes)'))})
                                    }
                                    options['tooltipContents'] = tooltipContents
                                    options['subtitle'] = 'Total Traffic vs Sessions Added';
                                    return monitorInfraUtils.getDefaultGeneratorScatterChartTooltipFn(currObj,options);
                                },
                            }
                        }
                    },
                    itemAttr: {
                        width: 1,
                        height: 1,
                        title: 'Workloads',
                        showTitle: true
                    }
                }
            },
            'top-5-services': function () {
                return {
                    modelCfg: {
                        modelId:'top-5-services',
                        needContrailListModel: true,
                        source: 'STATTABLE',
                        config: [{
                            "table_name": "StatTable.EndpointSecurityStats.eps.client",
                            "select": "eps.__key, name, SUM(eps.client.in_bytes), SUM(eps.client.out_bytes), SUM(eps.client.added)",
                            "where": "(eps.local_vn Starts with " + ctwu.getCurrentDomainProject() +')',
                        }, {
                            "table_name": 'firewall-rules',
                            "source": 'APISERVER',
                            "fields": ['firewall_policy_back_refs',
                                     'service', 'service_group_refs'],
                            "where": function (model, defObj) {
                                return getRuleUUIDs(model.get('data'), 'eps.__key', defObj);
                            },
                            "mergeFn": function (data, model) {
                                return cowu.mergeAnalyticsAndConfigData({
                                    configData: data,
                                    analyticsData: model.get('data'),
                                    analyticsDataKey: 'eps.__key',
                                    configDataKey: 'uuid',
                                    configObjType: 'firewall-rule'
                                });
                            }
                        }, {
                            "table_name": 'service-groups',
                            "source": 'APISERVER',
                            //"fields": ['firewall_policy_back_refs',
                              //       'service', 'service_group_refs'],
                            "where": function (model, defObj) {
                                var data = model.get('data'),
                                    serviceGrpUUID = [],
                                    serviceGrpRefArr = [];
                                _.forEach(data, function (obj) {
                                    serviceGrpRefArr = _.result(obj, 'configData.service_group_refs',[]);
                                    serviceGrpUUID.concat(_.map(serviceGrpRefArr, 'uuid'));
                                })
                                if (defObj != null) {
                                    defObj.resolve(serviceGrpUUID);
                                }
                            },
                            mergeFn: function (response, model) {
                                var serviceGrpArr = _.result(response, '0.service-groups', []),
                                    serviceGrpArr = _.keyBy(serviceGrpArr, 'uuid'),
                                    serviceGrpRef = [],
                                    service = {};
                                    data = model.get('data');
                                data = _.filter(data, function (statObj) {
                                    return _.result(statObj, 'configData.service_group_refs', []).length > 0 ? true : false
                                });
                                $.each(data, function (idx, statObj) {
                                    service = _.result(statObj, 'configData.service', {});
                                    serviceGrpRef = _.result(statObj, 'configData.service_group_refs', [])
                                    _.forEach(serviceGrpRef, function (refObj) {
                                        var serviceGrpObj = serviceGrpArr[refObj['uuid']];
                                        service = $.extend(true, service,
                                            _.result(serviceGrpObj, 'service_group_firewall_service_list.firewall_service', []));
                                    });
                                    _.set(statObj, 'configData.service', service);
                                });
                                return data;
                            }
                        }]
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
                                        return (_.result(obj, 'SUM(reverse_sampled_bytes)', 0) + _.result(obj, 'SUM(forward_sampled_bytes)', 0));
                                    },
                                    label: 'Traffic',
                                    topCnt: topServiceCnt,
                                    zerofill: true,
                                });
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.5,
                        height: 1,
                        title: 'Top Services',
                        showTitle: true
                    }
                }
            }
         };
        function getVMIColor (data) {
            var color = cowc.COLOR_SEVERITY_MAP['blue'];
            _.forEach (data, function (value, key) {
                if (value['eps.__key'] == cowc.IMPLICIT_DENY_UUID ||
                        _.result(value, 'action_list.simple_action') == 'deny') {
                    color = cowc.COLOR_SEVERITY_MAP['orange'];
                    return color;
                }
            })
            return color;
        }
        function getRuleUUIDs (data, uuidKey, defObj) {
            var rule = _.map(data, uuidKey),
            ruleUUIDs = [], ruleUUID;
            _.forEach(rule, function (value) {
                if (value != null && typeof value == 'string' &&
                    value.indexOf(':') > -1) {
                    ruleUUID = value.split(':').pop();
                    if (ruleUUIDs.indexOf(ruleUUID) == -1) {
                        ruleUUIDs.push(ruleUUID);
                    }
                }
            })
            if (defObj != null) {
                defObj.resolve(ruleUUIDs);
            }
        };
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
                    source: 'STATTABLE',
                    config: [{
                        table_name: 'StatTable.EndpointSecurityStats.eps.server',
                        select: 'eps.__key, eps.server.action, SUM(eps.server.in_bytes), SUM(eps.server.out_bytes), SUM(eps.server.in_pkts), SUM(eps.server.out_pkts)',
                        where: '(eps.server.local_vn Starts with '+ctwu.getCurrentDomainProject()+')'
                    }, {
                        table_name: 'StatTable.EndpointSecurityStats.eps.client',
                        select: 'eps.__key, eps.client.action, SUM(eps.client.in_bytes), SUM(eps.client.out_bytes), SUM(eps.client.in_pkts), SUM(eps.client.out_pkts)',
                        where: '(eps.client.local_vn Starts with '+ctwu.getCurrentDomainProject()+')',
                        type: 'concat'
                    }, {
                        table_name: 'firewall-rules',
                        source: 'APISERVER',
                        fields: ['firewall_policy_back_refs',
                                 'service', 'service_group_refs'],
                        where: function (model, defObj) {
                            return getRuleUUIDs(model.get('data'), 'eps.__key', defObj);
                        },
                        mergeFn: {modelKey: 'eps.__key', joinKey: 'uuid', compareFn: function (epsKey, uuid) {
                            if (epsKey != null) {
                                return epsKey.split(':')[2] == uuid;
                            }
                            return false;
                        }}
                    }]
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
                            var ruleAction;
                            data = _.filter(data, function (obj) {
                                if (obj != null && obj['eps.server.action'] != null) {
                                    ruleAction = obj['eps.server.action']
                                } else if (obj != null && obj['eps.client.action'] != null) {
                                    ruleAction = obj['eps.client.action']
                                }
                                return ruleAction != null && ruleAction.indexOf(action) > -1 ? true : false;
                            });
                            return cowu.parseDataForDiscreteBarChart(data, {
                                groupBy: function (obj) {
                                    if (obj['implicit']) {
                                        return _.result(obj, 'name', '-');
                                    }
                                    var direction = ' --> '
                                    if (_.result(obj, 'direction') == '<>') {
                                        direction = ' <--> ';
                                    }
                                    var endpoint1_tags = _.result(obj, 'endpoint_1.tags', []).join('&');
                                    var endpoint1_ag = '', endpoint1_any = '', service = '';
                                    if (_.result(obj, 'endpoint_1.address_group') != null) {
                                        endpoint1_ag = 'addressgroup='+_.result(obj, 'endpoint_1.address_group');
                                    }
                                    if (_.result(obj, 'endpoint_1.any') != null) {
                                        endpoint1_any = 'any='+_.result(obj, 'endpoint_1.any');
                                    }
                                    var endpoint2_tags = _.result(obj, 'endpoint_2.tags', []).join('&');
                                    var endpoint2_ag = '', endpoint2_any = "";
                                    if (_.result(obj, 'endpoint_2.address_group') != null) {
                                        endpoint2_ag = 'addressgroup='+_.result(obj, 'endpoint_2.address_group');
                                    }
                                    if (_.result(obj, 'endpoint_2.any') != null) {
                                        endpoint2_any = 'any='+_.result(obj, 'endpoint_2.any');
                                    }
                                    if (_.result(obj, 'service') != null && !$.isEmptyObject(obj['service'])) {
                                        var service_dst_port_obj = _.result(obj, 'service.dst_ports');
                                        if (service_dst_port_obj != null && service_dst_port_obj['start_port'] != null &&
                                                service_dst_port_obj['end_port'] != null) {
                                                if (service_dst_port_obj['start_port'] == service_dst_port_obj['end_port']) {
                                                    service_dst_port = service_dst_port_obj['start_port'];
                                                } else {
                                                    service_dst_port = contrail.format('{0}-{1}', service_dst_port_obj['start_port'], service_dst_port_obj['end_port']);
                                                }
                                                service_dst_port == '-1' ? 'any' : service_dst_port;
                                                service = contrail.format('{0}: {1}', _.result(obj, 'service.protocol'), service_dst_port);
                                            }
                                    }
                                    if (service != '') {
                                        return service;
                                    }
                                    return endpoint1_tags + endpoint1_ag + endpoint1_any + direction + endpoint2_tags + endpoint2_ag + endpoint2_any + service;
                                },
                                axisField: function (obj) {
                                    return (_.result(obj, 'SUM(eps.client.in_bytes)', 0) + _.result(obj, 'SUM(eps.client.out_bytes)', 0)
                                            + _.result(obj, 'SUM(eps.server.in_bytes)', 0) + _.result(obj, 'SUM(eps.server.out_bytes)', 0));
                                },
                                label: 'Traffic',
                                topCnt: topServiceCnt,
                                zerofill: true,
                            });
                        }
                    }
                },
                itemAttr: {
                    width: 0.5,
                    height: 1,
                    title: action == 'pass' ? 'Top Allowed Rules': 'Top Denied Rules',
                    //title: 'Top Endpoints',
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
