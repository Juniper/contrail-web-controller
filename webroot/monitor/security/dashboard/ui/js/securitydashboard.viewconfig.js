/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodashv4', 'contrail-view', 'contrail-list-model',
        'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'],
        function(_, ContrailView, ContrailListModel, TrafficGroupsUtils){
    var SecurityDashboardViewConfig = function () {
        var self = this,
            tgHelpers = new TrafficGroupsUtils(),
            topServiceCnt = 5;
        	//projectFQN = domain + ':' + projectSelectedValueData.name,
        //projectUUID = projectSelectedValueData.value;
        self.viewConfig = {
    		'top-10-allowed-rules': function () {
                return topRulesWidgetCfg('pass');
            },
            'top-10-denied-rules': function () {
                return topRulesWidgetCfg('deny');
            },
            'top-vns': function (){
                return {
                    modelCfg: {
                        modelId: 'top-vns-model',
                        source: 'STATTABLE',
                        config: [{
                            table_name: "StatTable.EndpointSecurityStats.eps.client",
                            select: "eps.client.local_vn, SUM(eps.client.in_bytes)",
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            parser: function (data, model) {
                                data = _.filter(data, function (value) {
                                    return value['SUM(eps.client.in_bytes)'] != 0;
                                });
                                return _.map(data, function (value) {
                                    //value['local_vn'] = value['eps.client.local_vn']
                                    value['client'] = true;
                                    return value;
                                });
                            }
                        }, {
                            table_name: "StatTable.EndpointSecurityStats.eps.server",
                            select: "eps.server.local_vn, SUM(eps.server.out_bytes)",
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            parser: function (data, model) {
                                return _.filter(data, function (value) {
                                    return value['SUM(eps.server.out_bytes)'] != 0;
                                });
                            },
                            type: 'concat'
                        }]
                    },
                    viewCfg: {
                        elementId : 'top-vns-view',
                        view: 'MultiBarChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: function(y) {return formatBytes(y);},
                                xAxisLabel: '',
                                yAxisLabel: 'Traffic',
                                barOrientation: 'horizontal',
                                chartTemplate: 'plain-chart-template',
                                stacked: true,
                                zerofill: false,
                                staggerLabels: true,
                                xLblFormatter: function (x, chartData) {
                                    if (typeof x == 'number') {
                                        return '';
                                    } else if (typeof x == 'string') {
                                        return tgHelpers.getFormattedValue(x);
                                    }
                                    return x;
                                },
                                tooltipContent: function (d) {
                                    return tooltipContent(d, {title:'Top Virtual Neworks'});
                                },
                                showLegend: true
                            },
                            parseFn: function (data) {
                                var inBytes =  cowu.parseDataForDiscreteBarChart(data, {
                                    groupBy: 'eps.server.local_vn',
                                    axisField: 'SUM(eps.server.out_bytes)',
                                    label: 'In Bytes',
                                    topCnt: topServiceCnt,
                                    color: cowc.FIVE_NODE_COLOR[0],
                                    zerofill: true,
                                });
                                var outBytes =  cowu.parseDataForDiscreteBarChart(data, {
                                    groupBy: 'eps.client.local_vn',
                                    axisField: 'SUM(eps.client.in_bytes)',
                                    label: 'Out Bytes',
                                    topCnt: topServiceCnt,
                                    color: cowc.FIVE_NODE_COLOR[1],
                                    zerofill: true,
                                });
                                return [inBytes[0], outBytes[0]];
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.5,
                        height: 1,
                        title: 'Top Virtual Neworks',
                        showTitle: true
                    }
                };
            },
            'top-tags': function (){
                return {
                    modelCfg: {
                        source: 'STATTABLE',
                        config: [{
                            table_name: "StatTable.EndpointSecurityStats.eps.client",
                            select: 'eps.client.app, eps.client.tier, eps.client.remote_tier_id,'+
                                    'eps.client.site, eps.client.remote_site_id, eps.client.deployment,'+
                                    'eps.client.remote_deployment_id,'+
                                    'eps.client.remote_app_id, SUM(eps.client.in_bytes)',
                            //modelId: 'top-tags-eps-client',
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            parser: function (data, model) {
                                // Bug from config/vrouter 0x00000000 is being assigned
                                // to tag/label which is not supposed to assign
                                data = _.filter(data, function (value) {
                                    return (value['eps.client.remote_app_id'] != '0x00000000' ||
                                            value['eps.client.remote_site_id'] != '0x00000000' ||
                                            value['eps.client.remote_deployment_id'] != '0x00000000' ||
                                            value['eps.client.remote_tier_id'] != '0x00000000')
                                        && value['SUM(eps.client.in_bytes)'] != 0;
                                }); 
                                data =  _.map(data, function (value) {
                                   if (value['eps.client.remote_app_id'] != null) {
                                       value['remote_app_id'] = value['eps.client.remote_app_id'];
                                   }
                                   if (value['eps.client.remote_site_id'] != null) {
                                       value['remote_site_id'] = value['eps.client.remote_site_id'];
                                   }
                                   if (value['eps.client.remote_deployment_id'] != null) {
                                       value['remote_deployment_id'] = value['eps.client.remote_deployment_id'];
                                   }
                                   if (value['eps.client.remote_tier_id'] != null) {
                                       value['remote_tier_id'] = value['eps.client.remote_tier_id'];
                                   }
                                   if (value['eps.client.app'] != null) {
                                       value['app'] = tgHelpers.getFormattedValue(value['eps.client.app']);
                                   }
                                   if (value['eps.client.tier'] != null) {
                                       value['tier'] = tgHelpers.getFormattedValue(value['eps.client.tier']);
                                   }
                                   if (value['eps.server.site'] != null) {
                                       value['site'] = tgHelpers.getFormattedValue(value['eps.server.site']);
                                   }
                                   if (value['eps.server.deployment'] != null) {
                                       value['deployment'] = tgHelpers.getFormattedValue(value['eps.server.deployment']);
                                   }
                                   value['client'] = true;
                                   return value;
                               });
                               return data;
                            }
                        }, {
                            table_name: 'StatTable.EndpointSecurityStats.eps.server',
                            select: 'eps.server.app, eps.server.tier, eps.server.remote_tier_id,'+
                                    'eps.server.site, eps.server.remote_site_id, eps.server.deployment,'+
                                    'eps.server.remote_deployment_id,'+
                                    'eps.server.remote_app_id, SUM(eps.server.out_bytes)',
                            //modelId: 'top-tags-eps-server',
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            type: 'concat',
                            parser: function (data, model) {
                                data = _.filter(data, function (value) {
                                    return (value['eps.server.remote_app_id'] != '0x00000000' ||
                                            value['eps.server.remote_site_id'] != '0x00000000' ||
                                            value['eps.server.remote_deployment_id'] != '0x00000000' ||
                                            value['eps.server.remote_tier_id'] != '0x00000000')
                                    && value['SUM(eps.server.out_bytes)'] != 0;
                                });
                                data =  _.map(data, function (value) {
                                    if (value['eps.server.remote_app_id'] != null) {
                                        value['remote_app_id'] = value['eps.server.remote_app_id'];
                                    }
                                    if (value['eps.server.remote_site_id'] != null) {
                                        value['remote_site_id'] = value['eps.server.remote_site_id'];
                                    }
                                    if (value['eps.server.remote_deployment_id'] != null) {
                                        value['remote_deployment_id'] = value['eps.server.remote_deployment_id'];
                                    }
                                    if (value['eps.server.remote_tier_id'] != null) {
                                        value['remote_tier_id'] = value['eps.server.remote_tier_id'];
                                    }
                                    if (value['eps.server.app'] != null) {
                                        value['app'] = tgHelpers.getFormattedValue(value['eps.server.app']);
                                    }
                                    if (value['eps.server.tier'] != null) {
                                        value['tier'] = tgHelpers.getFormattedValue(value['eps.server.tier']);
                                    }
                                    if (value['eps.server.site'] != null) {
                                        value['site'] = tgHelpers.getFormattedValue(value['eps.server.site']);
                                    }
                                    if (value['eps.server.deployment'] != null) {
                                        value['deployment'] = tgHelpers.getFormattedValue(value['eps.server.deployment']);
                                    }
                                    return value;
                                });
                                return data;
                            }
                        }, {
                            source: 'APISERVER',
                            //modelId: 'top-tags-apiserver-tags',
                            table_name: 'tags',
                            mergeFn: {modelKey: 'remote_app_id', joinKey: 'tag_id'}
                        }]
                    },
                  viewCfg: {
                      elementId : 'top-apps-view',
                      view: 'MultiBarChartView',
                      viewConfig: {
                          chartOptions: {
                              yFormatter: function(y) {return formatBytes(y);},
                              xAxisLabel: '',
                              yAxisLabel: 'Traffic',
                              barOrientation: 'horizontal',
                              stacked: true,
                              zerofill: true,
                              groupBy: ['app', 'remote_app_id.name'],
                              axisFields: ['SUM(eps.server.out_bytes)','SUM(eps.client.in_bytes)'],
                              labels: ['In Bytes', 'Out Bytes'],
                              title: 'Top Applications',
                              staggerLabels: true,
                              chartTemplate: 'plain-chart-template',
                              showLegend: true,
                              xLblFormatter: function (x) {
                                  if (typeof x == 'number') {
                                      return '';
                                  } else if (typeof x == 'string') {
                                      return x.split('=')[1];
                                  }
                                  return x;
                              },
                              tooltipContent: function (d, chartOptions) {
                                  return tooltipContent(d, {title: _.result(chartOptions, 'title', '-')});
                              }
                          },
                          parseFn: function (data, chartOptions) {
                              var groupBy = _.result(chartOptions, 'groupBy', []);
                              var axisFields = _.result(chartOptions, 'axisFields', []);
                              var labels = _.result(chartOptions, 'labels', []);
                              var chartData = [];
                              _.each(groupBy, function (value, idx) {
                                  chartData.push(cowu.parseDataForDiscreteBarChart(data, {
                                      groupBy: value,
                                      axisField: axisFields[idx] ,
                                      label: labels[idx],
                                      topCnt: topServiceCnt,
                                      color: cowc.FIVE_NODE_COLOR[idx],
                                      zerofill: true,
                                  })[0]);
                              });
                              return chartData;
                          }
                      }
                  },
                  itemAttr: {
                      width: 0.5,
                      height: 1,
                      title: 'Top Applications',
                      showTitle: true
                  }
                };
            },
            'top-vmis-with-acl-deny': function (){
                return {
                    modelCfg: {
                        modelId: 'top-vmis-with-acl-deny-model',
                        source: 'STATTABLE',
                        config: [{
                            table_name: "StatTable.EndpointSecurityStats.eps.client",
                            select: "name, SUM(eps.client.in_bytes), eps.client.action",
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            parser: function (data, model) {
                                data = _.filter(data, function (value) {
                                   return value['SUM(eps.client.in_bytes)'] != 0;
                                });
                                return _.map(data, function (value) {
                                    if (value['eps.client.action'] != null && value['eps.client.action'].indexOf('deny')) {
                                        value['vmi_uuid'] = tgHelpers.getFormattedValue(value['name']);
                                        return value
                                    }
                                });
                            }
                        }, {
                            table_name: 'virtual-machine-interface',
                            source: 'UVE',
                            cfilt: 'UveVMInterfaceAgent:vm_name',
                            where: function (model, defObj) {
                                var uuidArr = _.map(model.get('data'), 'name').join(',');
                                defObj.resolve(uuidArr);
                            },
                            mergeFn: {modelKey: 'name', joinKey: 'name'}
                        }]
                    },
                    viewCfg: {
                        elementId : 'top-vmis-with-acl-deny-view',
                        view: 'MultiBarChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: function(y) {return formatBytes(y);},
                                xAxisLabel: '',
                                yAxisLabel: 'Traffic',
                                barOrientation: 'horizontal',
                                stacked: true,
                                zerofill: true,
                                staggerLabels: true,
                                xLblFormatter: function (x, chartData) {
                                    if (typeof x == 'string') {
                                        var barObj = _.filter(_.result(chartData, '0.values', []), function (value) {
                                            return value['label'] == x;
                                        });
                                        return _.result(barObj, '0.data[0].name.value.UveVMInterfaceAgent.vm_name', '-');
                                    } else if (typeof x == 'number') {
                                        return '';
                                    }
                                    return x;
                                },
                                tooltipContent: function (d) {
                                    d.lblValue = [{
                                        key: 'VM Name',
                                        value: _.result(d, 'data.data[0].name.value.UveVMInterfaceAgent.vm_name', '-'),
                                    }]
                                    return tooltipContent(d, {title: 'Top VMIs with ACL Deny'});
                                }
                            },
                            parseFn: function (data) {
                                return  cowu.parseDataForDiscreteBarChart(data, {
                                    groupBy: 'vmi_uuid',
                                    axisField: 'SUM(eps.client.in_bytes)',
                                    label: 'Traffic',
                                    topCnt: topServiceCnt,
                                    color: cowc.FIVE_NODE_COLOR[0],
                                    zerofill: true,
                                });
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.5,
                        height: 1,
                        title: 'Top VMIs with ACL Deny',
                        showTitle: true
                    }
                };
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
            'top-acl-with-deny':function (){
                return {
                    modelCfg: {
                        modelId: 'top-acl-with-deny-model',
                        source: 'STATTABLE',
                        config: [{
                            table_name: "StatTable.EndpointSecurityStats.eps.client",
                            select: "eps.__key, SUM(eps.client.in_pkts), eps.client.action",
                            where: "(name Starts with " + ctwu.getCurrentDomainProject() +')',
                            parser: function (data, model) {
                                var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
                                data = _.filter(data, function (value) {
                                    return value['SUM(eps.client.in_pkts)'] != 0 &&
                                        defaultRuleUUIDs.indexOf(value['eps.__key']) == -1
                                        && value['eps.client.action'].indexOf('deny') > -1;
                                });
                                return _.map(data, function (value) {
                                    value['formattedRuleId'] = value['eps.__key'].split(':').pop();
                                    return value;
                                });
                            }
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
                                    // For default policy we need to compare with
                                    // 2 element of array
                                    return epsKey.split(':')[3] == uuid || epsKey.split(':')[2] == uuid;
                                }
                                return false;
                            }}
                        }]
                    },
                    viewCfg: {
                        elementId : 'top-acl-with-deny-view',
                        view: 'MultiBarChartView',
                        viewConfig: {
                            chartOptions: {
                                yFormatter: function (y) {
                                    return y;
                                },
                                xAxisLabel: '',
                                yAxisLabel: 'Hits',
                                barOrientation: 'horizontal',
                                stacked: true,
                                zerofill: true,
                                staggerLabels: true,
                                xLblFormatter: function (x, chartData) {
                                    if (typeof x == 'string') {
                                        var barObj = _.filter(_.result(chartData, '0.values', []), function (value) {
                                            return value['label'] == x;
                                        });
                                        var formattedRuleObj = tgHelpers.formatConfigRuleData(_.result(barObj, [0, 'data', 0, 'eps.__key'], {})),
                                            service = formattedRuleObj['serviceStr'],
                                            ruleObj = _.result(barObj, [0, 'data', 0, 'eps.__key'], {}),
                                            endpoint1 = _.result(ruleObj, 'endpoint_1.tags', []),
                                            endpoint2 = _.result(ruleObj, 'endpoint_2.tags', []),
                                            formattedRule = '';
                                        if (endpoint1.length > 0 || endpoint2.length > 0) {
                                            _.each([endpoint1, endpoint2], function (endpoint, i) {
                                                var appTag = endpoint.filter(function (value) {
                                                    return value.indexOf('application') > -1;
                                                });
                                                var tierTag = endpoint.filter(function (value) {
                                                    return value.indexOf('tier') > -1;
                                                });
                                                appTag = _.result(appTag, '0', "").split('=')[1];
                                                tierTag = _.result(tierTag, '0', "").split('=')[1];
                                                if (appTag != null && tierTag != null) {
                                                    formattedRule += appTag + ' - '+ tierTag;
                                                } else if (appTag != null) {
                                                    formattedRule += appTag;
                                                } else if (tierTag != null) {
                                                    formattedRule += tierTag;
                                                }
                                                if (i == 0) {
                                                    formattedRule += ' <---> ';
                                                }
                                            });
                                            return formattedRule;
                                        } else {
                                            return 'any <--> any';
                                        }
                                    } else if (typeof x == 'number') {
                                        return '';
                                    }
                                    return x;
                                },
                                tooltipContent: function (d) {
                                    var configRuleData = '', ruleHTML = '';
                                    if ( _.result(d, ['data','data',0 ,'eps.__key']) != null) {
                                        configRuleData = tgHelpers.formatConfigRuleData(_.result(d, ['data','data',0 ,'eps.__key']));
                                        ruleHTML = contrail.getTemplate4Id('firewall-rule-template')(configRuleData);
                                    }
                                    d.lblValue = [{
                                        key: 'Details',
                                        value: ruleHTML
                                    }]
                                    return tooltipContent(d, {title: 'Top ACLs with Deny', formatter: function (d) {return d}});
                                }
                            },
                            parseFn: function (data) {
                                return  cowu.parseDataForDiscreteBarChart(data, {
                                    groupBy: 'formattedRuleId',
                                    axisField: 'SUM(eps.client.in_pkts)',
                                    label: 'Hits',
                                    topCnt: topServiceCnt,
                                    color: cowc.FIVE_NODE_COLOR[0],
                                    zerofill: true,
                                });
                            }
                        }
                    },
                    itemAttr: {
                        width: 0.5,
                        height: 1,
                        title: 'Top ACLs with Deny',
                        showTitle: true
                    }
                };
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
        function tooltipContent (d, options) {
            var lblValue = getTooltipLabelValue(d, options);
            lblValue = _.result(d, 'lblValue', []).concat(lblValue);
            return contrail.getTemplate4Id(cowc.TOOLTIP_LINEAREACHART_TEMPLATE)({
                d: d,
                lblValue: lblValue,
                yAxisLabel:options['title'],
                subTitle:  d.value,
                cssClass: 'crisp-tooltip'
            });
        }
        function topRulesWidgetCfg (action) {
        	return {
                modelCfg: {
                    modelId:'top-10-rule',
                    source: 'STATTABLE',
                    config: [{
                        table_name: 'StatTable.EndpointSecurityStats.eps.server',
                        select: 'eps.__key, eps.server.action, SUM(eps.server.in_bytes), SUM(eps.server.out_bytes), SUM(eps.server.in_pkts), SUM(eps.server.out_pkts)',
                        where: '(eps.server.local_vn Starts with '+ctwu.getCurrentDomainProject()+')',
                        modelId: 'top-rule-eps-server'
                    }, {
                        table_name: 'StatTable.EndpointSecurityStats.eps.client',
                        select: 'eps.__key, eps.client.action, SUM(eps.client.in_bytes), SUM(eps.client.out_bytes), SUM(eps.client.in_pkts), SUM(eps.client.out_pkts)',
                        where: '(eps.client.local_vn Starts with '+ctwu.getCurrentDomainProject()+')',
                        type: 'concat',
                        modelId: 'top-rule-eps-client'
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
                            barOrientation: 'vertical',
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
        function getTooltipLabelValue (data, options) {
            var series = data.series, lblValArr = [];
            var formatter = formatBytes;
            if (options['formatter'] != null) {
                formatter = options['formatter'];
            }
            _.forEach(series, function (value) {
                lblValArr.push({
                    key: value['key'],
                    value: formatter(value['value']),
                    color: value['color']
                })
            })
            return lblValArr;
        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new SecurityDashboardViewConfig()).viewConfig;
});
