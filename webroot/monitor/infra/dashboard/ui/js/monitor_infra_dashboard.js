/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

function infraMonitorClass() {
    var self = this;
    var viewModels=[]; 
    var dashboardConfig = [];
    var tabs = [];

    //Show down node count only if it's > 0
    function showHideDownNodeCnt() {
        var downSelectors = $('[data-bind="text:downCnt"]');
        $.each(downSelectors,function(idx,elem) {
            if($(elem).text() == "0")
                $(elem).hide();
            else
                $(elem).show();
        });
    }

    /*Selenium Testing*/
    this.getDashboardDataObj = function(){
        return dashboardViewModel;
    }
    /*End of Selenium Testing*/    

    this.destroy = function () {
        //Cancel the pending ajax calls
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }

    this.updateViewByHash = function (hashObj, lastHashObj) {
        self.load({hashParams:hashObj});
    }
    
    this.updateAlertsAndInfoBoxes = function() {
         var infoListTemplate = contrail.getTemplate4Id("infoList-template");
         var alertTemplate=contrail.getTemplate4Id("alerts-template");
         var dashboardDataArr = [];
         var alerts_fatal=[],alerts_stop=[],alerts_nodes=[],alerts_core=[],alerts_shutdown=[];
         var nodeAlerts=self.getNodeAlerts(viewModels);
         $.each(viewModels,function(idx,currViewModel) {
             dashboardDataArr = dashboardDataArr.concat(currViewModel.data());
         });
         for(var i=0;i<nodeAlerts.length;i++){
             alerts_nodes.push({nName:nodeAlerts[i]['name'],pName:nodeAlerts[i]['type'],sevLevel:nodeAlerts[i]['sevLevel'],
                timeStamp:nodeAlerts[i]['timeStamp'],msg:nodeAlerts[i]['msg']});
         }
         var processAlerts = self.getAllProcessAlerts(viewModels);
         var allAlerts = alerts_nodes.concat(processAlerts);
         allAlerts.sort(bgpMonitor.sortInfraAlerts);
         var dashboardCF = crossfilter(dashboardDataArr);
         var nameDimension = dashboardCF.dimension(function(d) { return d.name });
         var verDimension = dashboardCF.dimension(function(d) { return d.version });
         var verGroup = verDimension.group();
         var verArr = [];
         var systemCnt = nameDimension.group().all().length;
         var infoData = [{lbl:'No of servers',value:systemCnt}];
         //Distinct Versions
         if(verGroup.all().length > 1) {
             //verArr = verGroup.order(function(d) { return d.value;}).top(2);
             verArr = verGroup.top(Infinity);
             var unknownVerInfo = [];
             $.each(verArr,function(idx,value) {
                 if(verArr[idx]['key'] == '' || verArr[idx]['key'] ==  '-')
                    unknownVerInfo.push({lbl:'Logical nodes with version unknown',value:verArr[idx]['value']}) ;
                 else
                     infoData.push({lbl:'Logical nodes with version ' + verArr[idx]['key'],value:verArr[idx]['value']});
             });
             if(unknownVerInfo.length > 0)
                 infoData = infoData.concat(unknownVerInfo);
         } else if(verGroup.all().length == 1)
             infoData.push({lbl:'version',value:verGroup.all()[0]['key']});
         $('#system-info-stat').html(infoListTemplate(infoData));
         endWidgetLoading('sysinfo');
         if(timeStampAlert.length > 0)
             allAlerts = allAlerts.concat(timeStampAlert)
         globalObj['alertsData'] = allAlerts;
         if(globalObj.showAlertsPopup){
             loadAlertsContent();
         }
         var detailAlerts = [];
         for(var i = 0; i < allAlerts.length; i++ ){
             if(allAlerts[i]['detailAlert'] != false)
                 detailAlerts.push(allAlerts[i]);
         }
         //Display only 5 alerts in "Dashboard"
         $('#alerts-box-content').html(alertTemplate(detailAlerts.slice(0,5)));
         endWidgetLoading('alerts');
         $("#moreAlertsLink").click(loadAlertsContent);
    }
    

    this.addInfoBox = function(infoBoxObj) {
        dashboardConfig.push(infoBoxObj);
        viewModels.push(infoBoxObj['viewModel']);
        var infoBoxTemplate  = contrail.getTemplate4Id('infobox-template');
        var obj = infoBoxObj;
        $('#topStats').append(infoBoxTemplate({title:obj['title'],totalCntField:'totalCnt',
            activeCntField:'upCnt',inactiveCntField:'downCnt'})); 
        ko.applyBindings(obj['viewModel'],$('#topStats').children(':last')[0]);
        //Issue calls to fetch data
        var nodeDS = new SingleDataSource(obj['dataSourceObj']);
        var result = nodeDS.getDataSourceObj();
        var dataSource = result['dataSource'];
        var deferredObj = result['deferredObj'];
        //Update the viewModel
        $(nodeDS).on('change',function() {
            var data = dataSource.getItems();
            obj['viewModel'].data(data);
            self.updateAlertsAndInfoBoxes();
        });
        infoBoxObj['viewModel'].downCnt.subscribe(function(newValue) {
            showHideDownNodeCnt();
        });
    }

    function loadLogs() {
        function getLogs(deferredObj) {
            var retArr = [];
            $.ajax({
                url: monitorInfraUrls['QUERY'] + '?where=&filters=&level=4&fromTimeUTC=now-10m' + 
                    '&toTimeUTC=now&table=MessageTable&limit=10'
            }).done(function(result) {
                retArr = $.map(result['data'],function(obj,idx) {
                    obj['message'] = formatXML2JSON(obj['Xmlmessage']);
                    obj['timeStr'] = diffDates(new XDate(obj['MessageTS']/1000),new XDate());
                    if(obj['Source'] == null)
                        obj['moduleId'] = contrail.format('{0}',obj['ModuleId']);
                    else
                        obj['moduleId'] = contrail.format('{0} ({1})',obj['ModuleId'],obj['Source']);
                    return obj;
                });
                deferredObj.resolve(retArr);
            }).fail(function(result) {
                deferredObj.resolve(retArr);
            });
        }
        var logListTemplate = contrail.getTemplate4Id("logList-template");
        var logDeferredObj = $.Deferred();
        getLogs(logDeferredObj);
        logDeferredObj.done(function(data) {
            //Display only recent 3 log messages
        	$('#logs-box .widget-main').empty().html(logListTemplate(data.reverse().slice(0,3)));
            endWidgetLoading('logs');
        });
    }

    function loadInfoBoxes() {

        $('.infobox-container').on('click','.infobox',function() {
            tabs = [];
            $.each(dashboardConfig,function(idx,obj) {
                tabs.push(obj['tabId']);
            });
            var tabIdx = $(this).index();
            layoutHandler.setURLHashParams({tab:tabs[tabIdx]},{triggerHashChange:false});
            //Hide all tab contents
            $('#dashboard-charts .dashboard-chart-item').hide();
            $('.infobox').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
            $($('.infobox')[tabIdx]).removeClass('infobox-grey').addClass('infobox-blue infobox-dark active');
            var currTabContainer = $('#dashboard-charts .dashboard-chart-item')[tabIdx];
            //Show the current tab content
            $(currTabContainer).show();
            //Trigger refresh on svg charts
            $(currTabContainer).find('svg').trigger('refresh');
        });

        //When all node details are fetched,upedate alerts & info boxes
        /*
        var deferredObjs = [];
        $.when.apply(window,deferredObjs).done(
            function(vRouterResult,ctrlNodeResult,analyticsResult,configResult) {
                self.updateAlertsAndInfoBoxes();
            });
        */
    }

    //Concatenate Process alerts across all nodes
    this.getAllProcessAlerts = function(data) {
        var alertsList = [];
        $.each(viewModels,function(idx,currViewModel) {
            $.each(currViewModel.data(),function(i,obj) {
                alertsList = alertsList.concat(obj['processAlerts']);
            });
        });
        return alertsList;
    }

    //Construct Node-specific Alerts looping through all nodes
    this.getNodeAlerts = function(data) {
        var alertsList = [];
        $.each(viewModels,function(idx,currViewModel) {
            $.each(currViewModel.data(),function(i,obj) {
                alertsList = alertsList.concat(obj['nodeAlerts']);
            });
        });
        return alertsList;
    }

    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        var infraDashboardTemplate = contrail.getTemplate4Id('infra-dashboard');
        $(contentContainer).html('');
        $(contentContainer).html(infraDashboardTemplate);

        loadInfoBoxes();
        loadLogs();
        addTabs();

        //Initialize the common stuff
        $($('#dashboard-stats .widget-header')[0]).initWidgetHeader({title:'Logs',widgetBoxId :'logs'});
        $($('#dashboard-stats .widget-header')[1]).initWidgetHeader({title:'System Information', widgetBoxId: 'sysinfo'});
        $($('#dashboard-stats .widget-header')[2]).initWidgetHeader({title:'Alerts', widgetBoxId: 'alerts' });

        //Select node tab based on URL hash parameter
        var tabIdx = $.inArray(ifNull(hashParams['tab']),tabs);
        if(tabIdx <= -1)
            tabIdx = 0;
        $($('.infobox-container .infobox')[tabIdx]).trigger('click');
    }
}

var infraDashboardView = new infraMonitorClass();
    
function addTabs() {
    /**
     * vRouters Tab
     */
    vRouterDashboardTab = (function() {
        var ViewModel = function() {
            var self = this;
            self.data = ko.observableArray([]);
            self.downCnt =  ko.computed(function() { return infraMonitorUtils.getDownNodeCnt(self.data());});
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
            var chartsData = {title:'vRouters',d:[{key:'vRouters',values:data}],chartOptions:{tooltipFn:bgpMonitor.vRouterTooltipFn,xPositive:true,addDomainBuffer:true}};
            var chartObj = {};
            if(!isScatterChartInitialized('#vrouter-bubble')) {
                $('#vrouterStats-header').initWidgetHeader({title:'vRouters',link:{hashParams:{p:'mon_infra_vrouter',q:{node:'vRouters'}}}});
                $('#vrouter-bubble').initScatterChart(chartsData);
            } else {
                data = updateCharts.setUpdateParams(data);
                chartObj['selector'] = $('#content-container').find('#vrouter-bubble > svg').first()[0];
                chartObj['data'] = [{key:'vRouters',values:data}];
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
            self.downCnt =  ko.computed(function() { return infraMonitorUtils.getDownNodeCnt(self.data());});
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
                var chartsData = {title:'Control Nodes',chartOptions:{tooltipFn:bgpMonitor.controlNodetooltipFn,xPositive:true,addDomainBuffer:true},d:[{key:'Control Nodes',values:data}]};
                $('#ctrlNode-bubble').initScatterChart(chartsData); 
            } else { 
            }
        }

        infraDashboardView.addInfoBox({
                    title:'Control Nodes',
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
            self.downCnt =  ko.computed(function() { return infraMonitorUtils.getDownNodeCnt(self.data());});
            self.upCnt = ko.computed(function() { return self.data().length - self.downCnt();});
            self.totalCnt = ko.computed(function() { return self.upCnt() === '' ? '' : self.upCnt() + self.downCnt();});
        }
        var viewModel = new AnalyticNodesViewModel();
        viewModel.data.subscribe(function(newValue) {
            updateView(newValue);
        })
        this.updateView = function(data) {
            if(!isScatterChartInitialized('#analyticNode-bubble')) {
                $('#analyticNodeStats-header').initWidgetHeader({title:'Analytics Nodes',link:{hashParams:{p:'mon_infra_analytics',q:{node:'Analytics Nodes'}}}});
                var chartsData = {title:'Analytic Nodes',chartOptions:{tooltipFn:bgpMonitor.analyticNodeTooltipFn,xPositive:true,addDomainBuffer:true},d:[{key:'Analytics Nodes',values:data}]};
                $('#analyticNode-bubble').initScatterChart(chartsData);
            } else {
            }
        }
        infraDashboardView.addInfoBox({
                    title:'Analytics Nodes',
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
            self.downCnt =  ko.computed(function() { return infraMonitorUtils.getDownNodeCnt(self.data());});
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
                var chartsData = {title:'Config Nodes',chartOptions:{tooltipFn:bgpMonitor.vRouterTooltipFn,xPositive:true,addDomainBuffer:true},d:[{key:'Config Nodes',values:data}]};
                $('#configNode-bubble').initScatterChart(chartsData);
            } else {
            }
        }

        infraDashboardView.addInfoBox({
                    title:'Config Nodes',
                    dataSourceObj:'configNodeDS',
                    viewModel:viewModel,
                    tabId:'ConfigNode'
                });
    }());
}
