/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodashv4', 'contrail-view', 'contrail-list-model',
        'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers'],
        function(_, ContrailView, ContrailListModel, TrafficGroupsUtils){
    var SecurityDashboradViewConfig = function () {
        var self = this,
            tgHelpers = new TrafficGroupsUtils(),
            topServiceCnt = 5;
        self.viewConfig = {
            'TOP_TAGS_VIEW': {
                elementId : 'top-tags-view',
                view: 'MultiBarChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: function(y) {return formatBytes(y);},
                        xAxisLabel: '',
                        yAxisLabel: 'Traffic',
                        yUnit: 'bytes',
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
                            return tooltipContent(d, chartOptions);
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
            'TOP_VN_VIEW': {
                elementId : 'top-vns-view',
                view: 'MultiBarChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: function(y) {return formatBytes(y);},
                        xAxisLabel: '',
                        yAxisLabel: 'Traffic',
                        yUnit: 'bytes',
                        barOrientation: 'horizontal',
                        chartTemplate: 'plain-chart-template',
                        groupBy: ['eps.server.local_vn', 'eps.client.local_vn'],
                        axisFields: ['SUM(eps.server.out_bytes)','SUM(eps.client.in_bytes)'],
                        labels: ['In Bytes', 'Out Bytes'],
                        title: 'Top Virtual Neworks',
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
                        tooltipContent: function (d, chartOptions) {
                            return tooltipContent(d, chartOptions);
                        },
                        showLegend: true
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
            'TOP_ACL_WITH_DENY_VIEW': {
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
                        title: 'Top ACLs with Deny',
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
                        tooltipContent: function (d, chartOptions) {
                            var configRuleData = '', ruleHTML = '';
                            if ( _.result(d, ['data','data',0 ,'eps.__key']) != null) {
                                configRuleData = tgHelpers.formatConfigRuleData(_.result(d, ['data','data',0 ,'eps.__key']));
                                ruleHTML = contrail.getTemplate4Id('firewall-rule-template')(configRuleData);
                            }
                            d.lblValue = [{
                                key: 'Details',
                                value: ruleHTML
                            }]
                            return tooltipContent(d, chartOptions);
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
            'TOP_VMI_WITH_DENY_VIEW': {
                elementId : 'top-vmis-with-acl-deny-view',
                view: 'MultiBarChartView',
                viewConfig: {
                    chartOptions: {
                        yFormatter: function(y) {return formatBytes(y);},
                        xAxisLabel: '',
                        yAxisLabel: 'Traffic',
                        yUnit: 'bytes',
                        barOrientation: 'horizontal',
                        title: 'Top VMIs with Deny',
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
                        tooltipContent: function (d, chartOptions) {
                            d.lblValue = [{
                                key: 'VM Name',
                                value: _.result(d, 'data.data[0].name.value.UveVMInterfaceAgent.vm_name', '-'),
                            }]
                            return tooltipContent(d, chartOptions);
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
            }
        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
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
        function getTooltipLabelValue (data, options) {
            var series = _.result(options, 'chartData'), lblValArr = [],
                index = _.result(data, 'index');
            _.forEach(series, function (value) {
                lblValArr.push({
                    key: value['key'],
                    value: options['yFormatter']((_.result(value, 'values.'+index+'.value'))),
                    color: value['color']
                })
            })
            return lblValArr;
        };
    };
    return (new SecurityDashboradViewConfig()).viewConfig;
});
