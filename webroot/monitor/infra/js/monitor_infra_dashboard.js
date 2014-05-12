/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

function infraMonitorClass() {
    var self = this;
    var xhrObjects = [];
    var isLoaded = 0;
    self.consoleTimer = [];
    self.downNodeCnt = {vRouter:0,controlNode:0,configNode:0,analyticNode:0};
    self.tabsLoaded = {vRouter:0,controlNode:0,configNode:0,analyticNode:0};
    var infraViewModel; 
    var DashboardViewModel = function() {
        this.ctrlNodesData = ko.observableArray([]);
        this.vRoutersData = ko.observableArray([]);
        this.analyticNodesData = ko.observableArray([]);
        this.configNodesData = ko.observableArray([]);
    }
    var dashboardViewModel = new DashboardViewModel();
    //Update the node counts
    dashboardViewModel.vRoutersData.subscribe(function(data) {
        var downNodeCnt = infraMonitorUtils.getDownNodeCnt(data);
        infraViewModel.vRouterDownCnt(downNodeCnt);
        infraViewModel.vRouterUpCnt(data.length-downNodeCnt);
    });
    dashboardViewModel.ctrlNodesData.subscribe(function(data) {
        var downNodeCnt = infraMonitorUtils.getDownNodeCnt(data);
        infraViewModel.ctrlNodeDownCnt(downNodeCnt);
        infraViewModel.ctrlNodeUpCnt(data.length-downNodeCnt);
    });
    dashboardViewModel.configNodesData.subscribe(function(data) {
        var downNodeCnt = infraMonitorUtils.getDownNodeCnt(data);
        infraViewModel.configNodeDownCnt(downNodeCnt);
        infraViewModel.configNodeUpCnt(data.length-downNodeCnt);
    });
    dashboardViewModel.analyticNodesData.subscribe(function(data) {
        var downNodeCnt = infraMonitorUtils.getDownNodeCnt(data);
        infraViewModel.analyticNodeDownCnt(downNodeCnt);
        infraViewModel.analyticNodeUpCnt(data.length-downNodeCnt);
    });
    /*Selenium Testing*/
    this.getDashboardDataObj = function(){
        return dashboardViewModel;
    }
    /*End of Selenium Testing*/    
    this.initInfraViewModel = function() {
        function InfraViewModel() {
            var self = this;
            self.vRouterUpCnt =  ko.observable('');
            self.analyticNodeUpCnt =  ko.observable('');
            self.ctrlNodeUpCnt =  ko.observable('');
            self.configNodeUpCnt =  ko.observable('');
            self.vRouterDownCnt =  ko.observable(0);
            self.analyticNodeDownCnt =  ko.observable(0);
            self.ctrlNodeDownCnt = ko.observable(0);
            self.configNodeDownCnt = ko.observable(0);
            self.vRouterCnt = ko.computed(function() { return self.vRouterUpCnt() === '' ? '' : self.vRouterUpCnt() + self.vRouterDownCnt();});
            self.ctrlNodeCnt = ko.computed(function() { return self.ctrlNodeUpCnt() === '' ? '' : self.ctrlNodeUpCnt() + self.ctrlNodeDownCnt();});
            self.analyticNodeCnt = ko.computed(function() { return self.analyticNodeUpCnt() === '' ? '' : self.analyticNodeUpCnt() + self.analyticNodeDownCnt();});
            self.configNodeCnt = ko.computed(function() { return self.configNodeUpCnt() === '' ? '' : self.configNodeUpCnt() + self.configNodeDownCnt();});
        };
        infraViewModel = new InfraViewModel();

        //Show down node count only if it's > 0
        function showHideDownNodeCnt(fieldName,downNodeCnt) {
            if(downNodeCnt > 0)
                $('[data-bind="text:' + fieldName + '"]').show();
            else
                $('[data-bind="text:' + fieldName + '"]').hide();
        }

        infraViewModel.vRouterDownCnt.subscribe(function(newValue) {
            showHideDownNodeCnt('vRouterDownCnt',newValue);
        });
        infraViewModel.analyticNodeDownCnt.subscribe(function(newValue) {
            showHideDownNodeCnt('analyticNodeDownCnt',newValue);
        });
        infraViewModel.ctrlNodeDownCnt.subscribe(function(newValue) {
            showHideDownNodeCnt('ctrlNodeDownCnt',newValue);
        });
        infraViewModel.configNodeDownCnt.subscribe(function(newValue) {
            showHideDownNodeCnt('configNodeDownCnt',newValue);
        });
    }

    this.destroy = function () {
        //Cancel the pending ajax calls
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }

    this.updatevRouterInfoBoxes = function(){
        var data = dashboardViewModel.vRoutersData();
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

    this.updatevRouterDashboard = function(deferredObj) {
        if(infraMonitorView.tabsLoaded['vRouter'] == 0) {
            vRouterDashboardChartInitialized = true;
            infraMonitorView.tabsLoaded['vRouter'] = 1;
            deferredObj.always(function(response) {
                self.updatevRouterInfoBoxes();
            });

            $('#vrouterStats-header').initWidgetHeader({title:'vRouters',link:{hashParams:{p:'mon_infra_dashboard',q:{node:'vRouters'}}}});
            initDeferred({deferredObj:deferredObj,renderFn:'initScatterChart',selector:$('#vrouter-bubble'),parseFn:function(response) {
                return {title:'vRouters',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'vRouters',values:dashboardViewModel.vRoutersData()}]};
            }});
        } else {
            if($('#vrouter-bubble > svg').length > 0){
                $('#vrouter-bubble > svg').trigger('refresh');
            }
            if($('#vrouter-bubble').data('chart') != null)
                $('#vrouter-bubble').data('chart').update();
        }
    }

    this.getLogs = function(deferredObj) {
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

    this.updatectrlNodeDashboard = function(deferredObj) {
        if(infraMonitorView.tabsLoaded['controlNode'] == 0) {
            infraMonitorView.tabsLoaded['controlNode'] = 1;
            $('#ctrlNodeStats-header').initWidgetHeader({title:'Control Nodes',link:{hashParams:{p:'mon_infra_control',q:{node:'Control Nodes'}}}});
            initDeferred({deferredObj:deferredObj,renderFn:'initScatterChart',selector:$('#ctrlNode-bubble'),parseFn:function(response) {
                return {title:'Control Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Control Nodes',values:dashboardViewModel.ctrlNodesData()}]};
            }});
        } else {
            if($('#ctrlNode-bubble > svg').length > 0){
                $('#ctrlNode-bubble > svg').trigger('refresh');
            }
            if($('#ctrlNode-bubble').data('chart') != null) 
                $('#ctrlNode-bubble').data('chart').update();
        }
    }
    this.updateconfigNodeDashboard = function(deferredObj) {
        if(infraMonitorView.tabsLoaded['configNode'] == 0) {
            infraMonitorView.tabsLoaded['configNode'] = 1;
            $('#configNodeStats-header').initWidgetHeader({title:'Config Nodes',link:{hashParams:{p:'mon_infra_config',q:{node:'Config Nodes'}}}});
            initDeferred({deferredObj:deferredObj,renderFn:'initScatterChart',selector:$('#configNode-bubble'),parseFn:function(response) {
                return {title:'Config Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Config Nodes',values:dashboardViewModel.configNodesData()}]};
            }});
        } else {
            if($('#configNode-bubble > svg').length > 0){
                $('#configNode-bubble > svg').trigger('refresh');
            }
            if($('#configNode-bubble').data('chart') != null)
                $('#configNode-bubble').data('chart').update();
        }
    }

    this.updateanalyticNodeDashboard = function(deferredObj) {
        if(infraMonitorView.tabsLoaded['analyticNode'] == 0) {
            infraMonitorView.tabsLoaded['analyticNode'] = 1;
            $('#analyticNodeStats-header').initWidgetHeader({title:'Analytics Nodes',link:{hashParams:{p:'mon_infra_analytics',q:{node:'Analytics Nodes'}}}});
            initDeferred({deferredObj:deferredObj,renderFn:'initScatterChart',selector:$('#analyticNode-bubble'),parseFn:function(response) {
                return {title:'Analytic Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Analytics Nodes',values:dashboardViewModel.analyticNodesData()}]};
            }});
        } else {
            if($('#analyticNode-bubble > svg').length > 0){
                $('#analyticNode-bubble > svg').trigger('refresh');
            }
            if($('#analyticNode-bubble').data('chart') != null)
                $('#analyticNode-bubble').data('chart').update();
        }
    }

    //Select the appropriate node in the tree and trigger the corresponding handler
    this.loadViewFromNode = function (hashObj) {
        if (hashObj['node'].indexOf('Control Nodes:') == 0) {
            ctrlNodeView.load({name:hashObj['node'].split(':')[1],tab:hashObj['tab']});
        } else if (hashObj['node'].indexOf('vRouters:') == 0) {
            cmpNodeView.load({name:hashObj['node'].split(':')[1], tab:hashObj['tab'], filters:hashObj['filters']});
        } else if (hashObj['node'].indexOf('Analytics Nodes:') == 0) {
            aNodeView.load({name:hashObj['node'].split(':')[1], tab:hashObj['tab']});
        } else if (hashObj['node'].indexOf('Config Nodes:') == 0) {
            confNodeView.load({name:hashObj['node'].split(':')[1], tab:hashObj['tab']});
        } else {
            if(hashObj['node'] == 'vRouters')
                cmpNodesView.load();
            else if(hashObj['node'] == 'Analytics Nodes')
                aNodesView.load();
            else if(hashObj['node'] == 'Config Nodes')
                confNodesView.load();
            else
                ctrlNodesView.load();
        }
    }

    this.updateViewByHash = function (hashObj, lastHashObj) {
        //If no current state,load dashboard 
        if((hashObj == null) || hashObj['node'] == null || (getKeyCnt(hashObj) == 0))  {
            self.load({hashParams:hashObj});
        } else if ((hashObj != null) && (hashObj != '')) {
            //self.loadViewFromNode(hashObj);
        }
    }
    
    this.updateAlertsAndInfoBoxes = function() {
         var infoListTemplate = contrail.getTemplate4Id("infoList-template");
         var alertTemplate=contrail.getTemplate4Id("alerts-template");
         var dashboardDataArr = [];
         var dashboardData = dashboardViewModel;
         var alerts_fatal=[],alerts_stop=[],alerts_nodes=[],alerts_core=[],alerts_shutdown=[];
         var nodeAlerts=self.getNodeAlerts(dashboardViewModel);
         var nodes = ['ctrlNodesData','vRoutersData','analyticNodesData','configNodesData'];
         $.each(nodes,function(idx,value) {
             dashboardDataArr = dashboardDataArr.concat(dashboardViewModel[value]());
         });
         for(var i=0;i<nodeAlerts.length;i++){
             alerts_nodes.push({nName:nodeAlerts[i]['name'],pName:nodeAlerts[i]['type'],sevLevel:nodeAlerts[i]['sevLevel'],
                timeStamp:nodeAlerts[i]['timeStamp'],msg:nodeAlerts[i]['msg']});
         }
         var processAlerts = self.getAllProcessAlerts(dashboardViewModel);
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
    
    function updateVrouterChartsAndInfoBoxes(ds){
        if(ds != null && ds.getItems() != null){
            data = updateCharts.setUpdateParams(ds.getItems());
        } 
        var chartObj = {};
        
        var chartsData = {title:'vRouters',d:[{key:'vRouters',values:data}],link:{hashParams:{p:'mon_bgp',q:{node:'vRouters'}}},widgetBoxId:'recent'};
        var chartObj = {},nwObj = {};
        if(!vRouterDashboardChartInitialized){
        	infraMonitorView.tabsLoaded['vRouter'] = 1;
        	$('#vrouter-bubble').initScatterChart(chartsData);
        	vRouterDashboardChartInitialized = true;
        } else {
            if($('#vrouter-bubble > svg').length > 0){
                $('#vrouter-bubble > svg').trigger('refresh');
            }
            chartObj['selector'] = $('#content-container').find('#vrouter-bubble > svg').first()[0];
            chartObj['data'] = [{key:'vRouters',values:data}];
            chartObj['type'] = 'infrabubblechart';
            updateCharts.updateView(chartObj);
        }
        self.updatevRouterInfoBoxes();
        self.updateAlertsAndInfoBoxes();
    }

    function loadInfoBoxes(hashParams) {
        //destroy all grids which could cause issue in this page
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
        controlNodesDashboardChartInitialized = false;
        vRouterDashboardChartInitialized = false;
        analyticsNodesDashboardChartInitialized = false;
        configNodesDashboardChartInitialized = false;
        var infoBoxTemplate  = contrail.getTemplate4Id('infobox-template');
        var VROUTER_IDX = 0,CTRLNODE_IDX = 1,ANALYTICNODE_IDX = 2,CONFIGNODE_IDX = 3;
        var TOTAL_FIELD_IDX = 0, ACTIVE_FIELD_IDX = 1,INACTIVE_FIELD_IDX = 2;
        var dashboardConfig = [{
                title:'vRouters',
                dataFields: ['vRouterCnt','vRouterUpCnt','vRouterDownCnt'],
                renderFn:'updatevRouterDashboard',
                getFn:'getvRoutersDashboardData',
                dataSourceObj:'computeNodeDS'
            },{
                title:'Control Nodes',
                dataFields:['ctrlNodeCnt','ctrlNodeUpCnt','ctrlNodeDownCnt'],
                renderFn:'updatectrlNodeDashboard',
                getFn:'getControlNodesDashboardData',
                dataSourceObj:'controlNodeDS'
            },{
                title:'Analytics Nodes',
                dataFields:['analyticNodeCnt','analyticNodeUpCnt','analyticNodeDownCnt'],
                renderFn:'updateanalyticNodeDashboard',
                getFn:'getAnalyticsNodesDashboardData',
                dataSourceObj:'analyticsNodeDS'
            },{
                title:'Config Nodes',
                dataFields:['configNodeCnt','configNodeUpCnt','configNodeDownCnt'],
                renderFn:'updateconfigNodeDashboard',
                getFn:'getConfigNodesDashboardData',
                dataSourceObj:'configNodeDS'
            }];
        var deferredObjs = [];

        var logListTemplate = contrail.getTemplate4Id("logList-template");
        var logDeferredObj = $.Deferred();
        infraMonitorView.getLogs(logDeferredObj);
        logDeferredObj.done(function(data) {
            //Display only recent 3 log messages
        	$('#logs-box .widget-main').empty().html(logListTemplate(data.reverse().slice(0,3)));
            endWidgetLoading('logs');
        });

        $.each(dashboardConfig,function(idx,obj) {
            $('#topStats').append(infoBoxTemplate({title:obj['title'],totalCntField:obj['dataFields'][TOTAL_FIELD_IDX],
                activeCntField:obj['dataFields'][ACTIVE_FIELD_IDX],inactiveCntField:obj['dataFields'][INACTIVE_FIELD_IDX]})); 
            
            //Issue calls to fetch data
            var nodeDS = new SingleDataSource(dashboardConfig[idx]['dataSourceObj']);
            var result = nodeDS.getDataSourceObj();
            var dataSource = result['dataSource'];
            var deferredObj = result['deferredObj'];
            deferredObjs.push(deferredObj);
            //Update the viewModel
            $(nodeDS).on('change',function() {
                var data = dataSource.getItems();
                if(idx == 0)
                    dashboardViewModel.vRoutersData(data);
                else if(idx == 1)
                    dashboardViewModel.ctrlNodesData(data);
                else if(idx == 2)
                    dashboardViewModel.analyticNodesData(data);
                else if(idx == 3)
                    dashboardViewModel.configNodesData(data);

            });
            if(idx == 0) {
                $(nodeDS).on('change',function() {
                    updateVrouterChartsAndInfoBoxes(dataSource);
                });
                //Info: why to call triggerDatasourceEvents in case of abort??
                if(result['lastUpdated'] != null && (result['error'] == null || result['error']['errTxt'] == 'abort')){
                    triggerDatasourceEvents(nodeDS);
                }
            }
            
          //Select the first infobox
            if(idx == 0) {
                $('#topStats div:first').addClass('infobox-blue infobox-dark active');
                $('#topStats div:first').removeClass('infobox-grey');
            }
        });
        //Reset infraViewModel
        ko.applyBindings(infraViewModel,document.getElementById('topStats'));

        var tabs = ['vRouter','ControlNode','AnalyticNode','ConfigNode'];
        $('.infobox-container').on('click','.infobox',function() {
            var tabIdx = $(this).index();
            var renderFns = ['updatevRouterDashboard','updatectrlNodeDashboard','updateanalyticNodeDashboard','updateconfigNodeDashboard']
            var bubbleCharts = ['vrouter-bubble','ctrlNode-bubble','analyticNode-bubble','configNode-bubble'];
            layoutHandler.setURLHashParams({tab:tabs[tabIdx]},{triggerHashChange:false});
            //Hide all tab contents
            $('#dashboard-charts .dashboard-chart-item').hide();
            $('.infobox').removeClass('infobox-blue infobox-dark active').addClass('infobox-grey');
            $($('.infobox')[tabIdx]).removeClass('infobox-grey').addClass('infobox-blue infobox-dark active');
            $($('#dashboard-charts .dashboard-chart-item')[tabIdx]).show();
            if(tabIdx >= 0) {
                infraMonitorView[renderFns[tabIdx]](deferredObjs[tabIdx]);
            }
        });
        //Select node tab based on URL hash parameter
        var tabIdx = $.inArray(ifNull(hashParams['tab']),tabs);
        if(tabIdx <= -1)
            tabIdx = 0;
        $($('.infobox-container .infobox')[tabIdx]).trigger('click');

        //When all node details are fetched,upedate alerts & info boxes
        $.when.apply(window,deferredObjs).done(
            function(vRouterResult,ctrlNodeResult,analyticsResult,configResult) {
                self.updateAlertsAndInfoBoxes();
            });
    }

    //Concatenante Process alerts across all nodes
    this.getAllProcessAlerts = function(data) {
        var alertsList = [];
        $.each(data.vRoutersData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['processAlerts']);
        });
        $.each(data.ctrlNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['processAlerts']);
        });
        $.each(data.analyticNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['processAlerts']);
        });
        $.each(data.configNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['processAlerts']);
        });
        return alertsList;
    }

    //Construct Node-specific Alerts looping through all nodes
    this.getNodeAlerts = function(data) {
        var alertsList = [];
        $.each(data.vRoutersData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['nodeAlerts']);
        });
        $.each(data.ctrlNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['nodeAlerts']);
        });
        $.each(data.analyticNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['nodeAlerts']);
        });
        $.each(data.configNodesData(),function(idx,obj) {
            alertsList = alertsList.concat(obj['nodeAlerts']);
        });
        return alertsList;
    }


    this.load = function (obj) {
        var hashParams = ifNull(obj['hashParams'],{});
        infraMonitorView.initInfraViewModel();
        if(hashParams['node'] != null) {
            infraMonitorView.loadViewFromNode(hashParams);
        } else {    //Load Dashboard
            infraMonitorView['tabsLoaded'] = {vRouter:0,controlNode:0,configNode:0,analyticNode:0};
            var infraDashboardTemplate = contrail.getTemplate4Id('infra-dashboard');
            $(contentContainer).html('');
            $(contentContainer).html(infraDashboardTemplate);

            loadInfoBoxes(hashParams);
            //Initialize the common stuff
            $($('#dashboard-stats .widget-header')[0]).initWidgetHeader({title:'Logs',widgetBoxId :'logs'});
            $($('#dashboard-stats .widget-header')[1]).initWidgetHeader({title:'System Information', widgetBoxId: 'sysinfo'});
            $($('#dashboard-stats .widget-header')[2]).initWidgetHeader({title:'Alerts', widgetBoxId: 'alerts' });
        }
    }
}

    
var infraMonitorView = new infraMonitorClass();

