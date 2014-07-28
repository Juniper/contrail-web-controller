/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var infraMonitorDashboardView = (function() {
    var self = this;
    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        addTabs();
        //Trigger select on tab based on hash
        infraDashboardView.selectTabByHash();
    }
    return {
        load:self.load
    }
})();

function addTabs() {
    /**
     * vRouters Tab
     */
    vRouterDashboardTab = (function() {
        var ViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return dashboardUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }

        var viewModel = new ViewModel();
        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })
        /**
        * Takes vRouters data(array) as input and creates/updates chart
        */
        var updateView = function(data) {
            var chartObj = {};
            var chartsData = {
                title: 'vRouters',
                d: splitNodesToSeriesByColor(data, {
                    Red: d3Colors['red'],
                    Orange: d3Colors['orange'],
                    Blue: d3Colors['blue'],
                    Green: d3Colors['green']
                }),
                chartOptions: {
                    tooltipFn: bgpMonitor.vRouterTooltipFn,
                    clickFn: bgpMonitor.onvRouterDrillDown,
                    xPositive: true,
                    addDomainBuffer: true
                }
            };
            var chartObj = {};
            if(!isScatterChartInitialized('#vrouter-bubble')) {
                $('#vrouterStats-header').initWidgetHeader({title:'vRouters',link:{hashParams:{p:'mon_infra_vrouter',q:{node:'vRouters'}}}});
                $('#vrouter-bubble').initScatterChart(chartsData);
            } else {
                data = updateCharts.setUpdateParams(data);
                chartObj['selector'] = $('#content-container').find('#vrouter-bubble > svg').first()[0];
                chartObj['data'] = chartsData['d'];
                chartObj['type'] = 'infrabubblechart';
                updateCharts.updateView(chartObj);
            }
            self.updatevRouterInfoBoxes();
        }

        this.updatevRouterInfoBoxes = function(){
            var data = viewModel.data();
            var instBuckets,vnBuckets,intfBuckets;
            var vnCount=0,intfCnt=0,instCnt=0,vns=[];
            var vRouterCF = crossfilter(data);
            $.each(data,function(idx,obj) {
                intfCnt += obj['intfCnt'];
                instCnt += obj['instCnt'];
                $.each(obj['vns'],function(idx,val) {
                    if($.inArray(val,vns) == -1)
                        vns.push(val);
                });
            });
            vnCnt = vns.length;
            vnBuckets = bucketizeCFData(vRouterCF,function(d) { return d.vnCnt});
            instBuckets = bucketizeCFData(vRouterCF,function(d) { return d.instCnt});
            intfBuckets = bucketizeCFData(vRouterCF,function(d) { return d.intfCnt});
            
            var sparklinesData = {
                    instances: {title:'Instances',data:[]},
                    interfaces:{title:'Interfaces',data:[]},
                    vns:{title:'Virtual Networks',data:[]}
            };
            
            $.each(ifNull(instBuckets['data'],[]), function(key,val){
                sparklinesData['instances']['data'].push(val);
            });
            
            $.each(ifNull(intfBuckets['data'],[]), function(key,val){
                sparklinesData['interfaces']['data'].push(val);
            });
            
            $.each(ifNull(vnBuckets['data'],[]), function(key,val){
                sparklinesData['vns']['data'].push(val);
            });
            
            $('#sparkLineStats').html('');
            var sparkLineTemplate  = contrail.getTemplate4Id('sparkline-template');
            var instElem = $('<div></div>').html(sparkLineTemplate({title:'Instances',totalCnt:instCnt,id:'infobox-instances'})); 
            var intfElem = $('<div></div>').html(sparkLineTemplate({title:'Interfaces',totalCnt:intfCnt,id:'infobox-interfaces'})); 
            var vnElem = $('<div></div>').html(sparkLineTemplate({title:'VNs',totalCnt:vnCnt,id:'infobox-vns'})); 
            
            $('#sparkLineStats').append(instElem,intfElem,vnElem);
            $.each(sparklinesData,function(key,val){
                drawSparkLineBar('#infobox-' + key + ' .sparkline', val);
            })
        }

        infraDashboardView.addInfoBox({
                    title:'vRouters',
                    dataSourceObj:'computeNodeDS',
                    template:'vrouter-dashboard-tab',
                    viewModel: viewModel,
                    tabId:'vRouter'     //Used in hashParams
                });
    }());

    /**
     * Control Nodes Tab
     */
    ctrlNodesDashboardTab = (function() {
        var ViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return dashboardUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }
        var viewModel = new ViewModel();

        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })

        var updateView = function(data) {
            if(!isScatterChartInitialized('#ctrlNode-bubble')) {
                $('#ctrlNodeStats-header').initWidgetHeader({title:'Control Nodes',link:{hashParams:{p:'mon_infra_control',q:{node:'Control Nodes'}}}});
                var chartsData = {
                    title: 'Control Nodes',
                    chartOptions: {
                        tooltipFn: bgpMonitor.controlNodetooltipFn,
                        clickFn: bgpMonitor.onControlNodeDrillDown,
                        xPositive: true,
                        addDomainBuffer: true
                    },
                    d: splitNodesToSeriesByColor(data,{
                        Red: d3Colors['red'],
                        Orange: d3Colors['orange'],
                        Blue: d3Colors['blue'],
                        Green: d3Colors['green']
                    })
                };
                $('#ctrlNode-bubble').initScatterChart(chartsData); 
            } else { 
            }
        }

        infraDashboardView.addInfoBox({
                    title:'Control Nodes',
                    template:'ctrlnode-dashboard-tab',
                    dataSourceObj:'controlNodeDS',
                    viewModel:viewModel,
                    tabId:'controlNode'
                });

    }());

    /**
     * Analytics Nodes Tab
     */
    analyticNodesDashboardTab = (function() {
        var AnalyticNodesViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return dashboardUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }
        var viewModel = new AnalyticNodesViewModel();
        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })
        var updateView = function(data) {
            if(!isScatterChartInitialized('#analyticNode-bubble')) {
                $('#analyticNodeStats-header').initWidgetHeader({title:'Analytics Nodes',link:{hashParams:{p:'mon_infra_analytics',q:{node:'Analytics Nodes'}}}});
                var chartsData = {
                    title: 'Analytic Nodes',
                    chartOptions: {
                        tooltipFn: bgpMonitor.analyticNodeTooltipFn,
                        clickFn: bgpMonitor.onAnalyticNodeDrillDown,
                        xPositive: true,
                        addDomainBuffer: true
                    },
                    d: splitNodesToSeriesByColor(data, {
                        Red: d3Colors['red'],
                        Orange: d3Colors['orange'],
                        Blue: d3Colors['blue'],
                        Green: d3Colors['green']
                    })
                };
                $('#analyticNode-bubble').initScatterChart(chartsData);
            } else {
            }
        }
        infraDashboardView.addInfoBox({
                    title:'Analytics Nodes',
                    template:'analyticnode-dashboard-tab',
                    dataSourceObj:'analyticsNodeDS',
                    viewModel:viewModel
                });
    }());

    /**
     * Config Node Tab
     */
    configNodesDashboardTab = (function() {
        
        var ConfigNodesViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return dashboardUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }

        var viewModel = new ConfigNodesViewModel();
        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })

        var updateView = function(data) {
            if(!isScatterChartInitialized('#configNode-bubble')) {
                $('#configNodeStats-header').initWidgetHeader({title:'Config Nodes',link:{hashParams:{p:'mon_infra_config',q:{node:'Config Nodes'}}}});
                var chartsData = {
                    title: 'Config Nodes',
                    chartOptions: {
                        tooltipFn: bgpMonitor.configNodeTooltipFn,
                        clickFn: bgpMonitor.onConfigNodeDrillDown,
                        xPositive: true,
                        addDomainBuffer: true
                    },
                    d: splitNodesToSeriesByColor(data, {
                        Red: d3Colors['red'],
                        Orange: d3Colors['orange'],
                        Blue: d3Colors['blue'],
                        Green: d3Colors['green']
                    })
                };
                $('#configNode-bubble').initScatterChart(chartsData);
            } else {
            }
        }

        infraDashboardView.addInfoBox({
                    title:'Config Nodes',
                    template:'confignode-dashboard-tab',
                    dataSourceObj:'configNodeDS',
                    viewModel:viewModel,
                    tabId:'ConfigNode'
                });
    }());
}
