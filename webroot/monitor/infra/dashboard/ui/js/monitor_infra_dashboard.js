/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var infraMonitorDashboardView = (function() {
    var self = this;
    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        //Disable callbacks for DS
        manageCrossFilters.removeAllCallBacks('vRoutersCF');
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
        var vRouterCF = 'vRoutersCF';
        var viewModel = new ViewModel();
        viewModel.data.subscribe(function(newValue) {
            $.each(newValue,function(idx,obj){
                    if(obj['xField'] != null)
                        obj['x'] = obj[obj['xField']];
                    if(obj['yField'] != null)
                        obj['y'] = obj[obj['yField']];
                });
            manageCrossFilters.updateCrossFilter(vRouterCF,newValue);
            //Add crossfilter dimensions for charts ie x and y
            manageCrossFilters.addDimension(vRouterCF,'x');
            manageCrossFilters.addDimension(vRouterCF,'y');
            var source = 'datasource';
            if(newValue[0] != null && newValue[0]['isGeneratorRetrieved'] == true){
                source = 'generator';
            }
            manageCrossFilters.fireCallBacks(vRouterCF,{source:source});
        })
        
        /**
        * Takes vRouters data(array) as input and creates/updates chart
        */
        var updateView = function(result) {
            var filteredNodes = result['data'];
            var source = result['cfg']['source'];
            if (source == 'generator'){
                return;
            }
            data = filteredNodes.reverse();//reversing to get the reds on top
            var chartObj = {};
            var chartsData = {
                title: 'vRouters',
                // d: splitNodesToSeriesByColor(data, chartsLegend),
                d: [{
                    key: 'Virtual Routers',
                    values: data
                }],
                chartOptions: {
                    // dataSplitFn: function(data) {
                    //                     return splitNodesToSeriesByColor(data, chartsLegend);
                    //              },
                    tooltipFn: bgpMonitor.vRouterTooltipFn,
                    bucketTooltipFn: bgpMonitor.vRouterBucketTooltipFn,
                    clickFn: bgpMonitor.onvRouterDrillDown,
                    xPositive: true,
                    addDomainBuffer: true,
                    isBucketize: false,//(getCookie(DO_BUCKETIZE_COOKIE) == 'yes')? true : false,
                    bucketOptions:{
                        maxBucketizeLevel: defaultMaxBucketizeLevel,
                        bucketSizeParam: defaultBucketSizeParam,
                        bucketsPerAxis: defaultBucketsPerAxis
                    },
                    crossFilter: vRouterCF,
                    deferredObj: $.Deferred(),
                    showSettings: false,
                    showLegend: false
                    // yAxisParams: axisParams['vRouter']['yAxisParams'],
                    // xAxisParams: axisParams['vRouter']['xAxisParams'],
                }
            };
            
            $('#vrouterStats-header').initWidgetHeader({title:'vRouters',link:{hashParams:{p:'mon_infra_vrouter',q:{node:'vRouters'}}}});
            //filterAndUpdateScatterChart('vrouter-bubble',chartsData);
            $('#vrouter-bubble').initScatterChart(chartsData);
            self.updatevRouterInfoBoxes();
        }
        
      //register to listen to callbacks for updates on the crossfilter and update the 
        //components which are listening to changes on it. 
        manageCrossFilters.addCallBack(vRouterCF,'updateView',updateView);

        this.updatevRouterInfoBoxes = function(){
            var data = viewModel.data();
            var instBuckets,vnBuckets,intfBuckets;
            var vnCount=0,intfCnt=0,instCnt=0,vns={};
            var vRouterCF = crossfilter(data);
            $.each(data,function(idx,obj) {
                if(obj['vRouterType'] != 'tor-agent') {
                    intfCnt += obj['intfCnt'];
                }
                //Excluding considering instance count from TOR Service Node & ToR Agent
                if(obj['vRouterType'] != 'tor-agent' && obj['vRouterType'] != 'tor-service-node') {
                    instCnt += obj['instCnt'];
                }
                $.each(obj['vns'],function(idx,val) {
                    if(vns[val] == null)
                        vns[val] = true;
                });
            });
            var vnCnt = 0;
            $.each(vns,function(idx,val) {
                vnCnt++;
            });
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
            data = data.reverse();//reversing to get the reds on top
            var chartsData = {
                title: 'Control Nodes',
                chartOptions: {
                    tooltipFn: bgpMonitor.controlNodetooltipFn,
                    clickFn: bgpMonitor.onControlNodeDrillDown,
                    xPositive: true,
                    addDomainBuffer: true
                },
                // d: splitNodesToSeriesByColor(data,chartsLegend)
                d: [{
                    key: 'Control Nodes',
                    values: data
                }],
            };
            $('#ctrlNodeStats-header').initWidgetHeader({
                title: 'Control Nodes',
                link: {
                    hashParams: {
                        p: 'mon_infra_control',
                        q: {
                            node: 'Control Nodes'
                        }
                    }
                }
            });
            $('#ctrlNode-bubble').initScatterChart(chartsData); 
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
                $('#analyticNodeStats-header').initWidgetHeader({
                    title: 'Analytics Nodes',
                    link: {
                        hashParams: {
                            p: 'mon_infra_analytics',
                            q: {
                                node: 'Analytics Nodes'
                            }
                        }
                    }
                });
                var chartsData = {
                    title: 'Analytic Nodes',
                    chartOptions: {
                        tooltipFn: bgpMonitor.analyticNodeTooltipFn,
                        clickFn: bgpMonitor.onAnalyticNodeDrillDown,
                        xPositive: true,
                        addDomainBuffer: true
                    },
                    d: [{
                        key: 'Analytics Nodes',
                        values: data
                    }]
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
                $('#configNodeStats-header').initWidgetHeader({
                    title: 'Config Nodes',
                    link: {
                        hashParams: {
                            p: 'mon_infra_config',
                            q: {
                                node: 'Config Nodes'
                            }
                        }
                    }
                });
                var chartsData = {
                    title: 'Config Nodes',
                    chartOptions: {
                        tooltipFn: bgpMonitor.configNodeTooltipFn,
                        clickFn: bgpMonitor.onConfigNodeDrillDown,
                        xPositive: true,
                        addDomainBuffer: true
                    },
                    d: [{
                        key: 'Config Nodes',
                        values: data
                    }]
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
    
    /**
     * Database Node Tab
     */
    dbNodesDashboardTab = (function() {
        
        var DBNodesViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return dashboardUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }

        var viewModel = new DBNodesViewModel();
        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })

        var updateView = function(data) {
            if(!isScatterChartInitialized('#dbNode-bubble')) {
                $('#dbNodeStats-header').initWidgetHeader({title:'Database Nodes',link:{hashParams:{p:'mon_infra_database',q:{node:'Database Nodes'}}}});
                var chartsData = {
                    title : 'Database Nodes',
                    chartOptions : {
                        xLbl : 'Available Space (GB)',
                        yLbl : 'Used Space (GB)',
                        tooltipFn : bgpMonitor.dbNodeTooltipFn,
                        clickFn : bgpMonitor.onDbNodeDrillDown,
                        xPositive : true,
                        addDomainBuffer : true
                    },
                    d : [ {
                        key : 'Database Nodes',
                        values : data
                    } ]
                };
                $('#dbNode-bubble').initScatterChart(chartsData);
            } else {
            }
        }

        infraDashboardView.addInfoBox({
                    title:'Database Nodes',
                    template:'dbnode-dashboard-tab',
                    dataSourceObj:'dbNodeDS',
                    viewModel:viewModel,
                    tabId:'DatabaseNode'
                });
    }());
}
