/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

function infraMonitorClass() {
    var self = this;
    var xhrObjects = [];
    var isLoaded = 0;
    self.consoleTimer = [];
    self.downNodeCnt = {vRouter:0,controlNode:0,configNode:0,analyticNode:0};
    //Present either in config or UVE but not both
    self.tabsLoaded = {vRouter:0,controlNode:0,configNode:0,analyticNode:0};
    var infraViewModel; 
    var dashboardDataViewModel = function() {
        this.ctrlNodesData = ko.observableArray([]);
        this.vRoutersData = ko.observableArray([]);
        this.analyticNodesData = ko.observableArray([]);
        this.configNodesData = ko.observableArray([]);
    }
    var dashboardDataObj = new dashboardDataViewModel();
    /*Selenium Testing*/
    this.getDashboardDataObj = function(){
        return dashboardDataObj;
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

    this.onWindowResize = function () {

    }

    this.destroy = function () {
        //Cancel the pending ajax calls
        var kGrid = $('.contrail-grid').data('contrailGrid');
        if(kGrid != null)
            kGrid.destroy();
    }

    this.updatevRouterInfoBoxes = function(){
        var data = dashboardDataObj.vRoutersData();
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
                return {title:'vRouters',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'vRouters',values:dashboardDataObj.vRoutersData()}]};
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
                return {title:'Control Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Control Nodes',values:dashboardDataObj.ctrlNodesData()}]};
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
                return {title:'Config Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Config Nodes',values:dashboardDataObj.configNodesData()}]};
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
                return {title:'Analytic Nodes',chartOptions:{xPositive:true,addDomainBuffer:true},d:[{key:'Analytics Nodes',values:dashboardDataObj.analyticNodesData()}]};
            }});
        } else {
            if($('#analyticNode-bubble > svg').length > 0){
                $('#analyticNode-bubble > svg').trigger('refresh');
            }
            if($('#analyticNode-bubble').data('chart') != null)
                $('#analyticNode-bubble').data('chart').update();
        }
    }

    this.clearTimers = function () {
        $.each(self.consoleTimer, function (idx, value) {
            logMessage("clearing timer:", value);
            clearTimeout(value)
        });
        self.consoleTimer = [];
    }

    //Select the appropriate node in the tree and trigger the corresponding handler
    this.loadViewFromNode = function (hashObj) {
        //Initialize the details view if coming from dashboard
        if(hashObj == '') {
            hashObj = {};
            hashObj['node'] = 'Control Nodes';
        }
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
            self.loadViewFromNode(hashObj);
        }
    }
    
    this.updateAlertsAndInfoBoxes = function() {
         var infoListTemplate = contrail.getTemplate4Id("infoList-template");
         var alertTemplate=contrail.getTemplate4Id("alerts-template");
         var dashboardDataArr = [];
         var dashboardData = dashboardDataObj;
         var alerts_fatal=[],alerts_stop=[],alerts_nodes=[],alerts_core=[],alerts_shutdown=[];
         var nodeAlerts=self.getNodeAlerts(dashboardDataObj);
         var nodes = ['ctrlNodesData','vRoutersData','analyticNodesData','configNodesData'];
         $.each(nodes,function(idx,value) {
             dashboardDataArr = dashboardDataArr.concat(dashboardDataObj[value]());
         });
         for(var i=0;i<nodeAlerts.length;i++){
             alerts_nodes.push({nName:nodeAlerts[i]['name'],pName:nodeAlerts[i]['type'],sevLevel:nodeAlerts[i]['sevLevel'],
                timeStamp:nodeAlerts[i]['timeStamp'],msg:nodeAlerts[i]['msg']});
         }
         var processAlerts = self.getAllProcessAlerts(dashboardDataObj);
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
        infraViewModel.vRouterDownCnt(infraMonitorView.downNodeCnt['vRouter']);
        infraViewModel.vRouterUpCnt(data.length-infraMonitorView.downNodeCnt['vRouter']);
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
            //infraMonitorView[obj['getFn']](deferredObjs[idx]);
            var nodeDS = new SingleDataSource(dashboardConfig[idx]['dataSourceObj']);
            var  result = nodeDS.getDataSourceObj();
            var datasource = result['dataSource'];
            var deferredObj = result['deferredObj'];
            deferredObjs.push(deferredObj);
            if(idx == 0){
                //datasource.unbind("change");
                //datasource.bind("change",updateVrouterChartsAndInfoBoxes.bind(null,datasource));
                $(nodeDS).on('change',function() {
                    updateVrouterChartsAndInfoBoxes(datasource);
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
        $.when.apply(window,deferredObjs).done(
            function(vRouterResult,ctrlNodeResult,analyticsResult,configResult) {
                var vRouterData = vRouterResult['dataSource'].getItems();
                var ctrlNodeData = ctrlNodeResult['dataSource'].getItems();
                var analyticsData = analyticsResult['dataSource'].getItems();
                var configData = configResult['dataSource'].getItems();
                var vRouterDS = vRouterResult['dataSource'];
                //vRouterDS.unbind('change');
                //Info:No need to bind again as we are already bind change event while getting singleDataSource instance
                //vRouterDS.bind('change',updateVrouterChartsAndInfoBoxes.bind(null,vRouterDS));
                //Initialize dashboard stats
                infraViewModel.vRouterDownCnt(infraMonitorView.downNodeCnt['vRouter']);
                infraViewModel.vRouterUpCnt(vRouterData.length-infraMonitorView.downNodeCnt['vRouter']);
                infraViewModel.ctrlNodeDownCnt(infraMonitorView.downNodeCnt['controlNode']);
                infraViewModel.ctrlNodeUpCnt(ctrlNodeData.length-infraMonitorView.downNodeCnt['controlNode']);
                infraViewModel.analyticNodeDownCnt(infraMonitorView.downNodeCnt['analyticNode']);
                infraViewModel.analyticNodeUpCnt(analyticsData.length-infraMonitorView.downNodeCnt['analyticNode']);
                infraViewModel.configNodeDownCnt(infraMonitorView.downNodeCnt['configNode']);
                infraViewModel.configNodeUpCnt(configData.length -infraMonitorView.downNodeCnt['configNode']);
                
                self.updateAlertsAndInfoBoxes();
            });
    }

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

    this.processvRouterAlerts = function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'vRouter',ip:obj['ip']};
        if(obj['isUveMissing'] == true)
            alertsList.push($.extend({},{msg:infraAlertMsgs['UVE_MISSING'],sevLevel:sevLevels['ERROR'],tooltipLbl:'Events'},infoObj));
        if(obj['isConfigMissing'] == true)
            alertsList.push($.extend({},{msg:infraAlertMsgs['CONFIG_MISSING'],sevLevel:sevLevels['WARNING']},infoObj));
        //Alerts that are applicable only when both UVE & config data present
        if(obj['isConfigMissing'] == false && obj['isUveMissing'] == false) {
            if(obj['uveCfgIPMisMatch'] == true)
                alertsList.push($.extend({},{msg:infraAlertMsgs['CONFIG_IP_MISMATCH'],sevLevel:sevLevels['ERROR'],tooltipLbl:'Events'},infoObj));
        }
        //Alerts that are applicable only when UVE data is present
        if(obj['isUveMissing'] == false) {
            if(obj['isPartialUveMissing'] == true)
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING'],tooltipLbl:'Events'},infoObj));
            if(obj['errorIntfCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['INTERFACE_DOWN'].format(obj['errorIntfCnt']),tooltipLbl:'Events'},infoObj));
            if(obj['xmppPeerDownCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['XMPP_PEER_DOWN'].format(obj['xmppPeerDownCnt']),tooltipLbl:'Events'},infoObj));
        }
        return alertsList.sort(bgpMonitor.sortInfraAlerts);
    }

    this.processControlNodeAlerts = function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Control Node',ip:obj['ip']};
        if(obj['isUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['UVE_MISSING']},infoObj));
        if(obj['isConfigMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_MISSING']},infoObj));
        if(obj['isUveMissing'] == false) {
            //ifmap down alerts for control node
            if(obj['isIfmapDown']) {
                alertsList.push($.extend({sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['IFMAP_DOWN'],timeStamp:obj['ifmapDownAt']},infoObj));
            }
            if(obj['isPartialUveMissing'] == true)
                alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
            if(obj['downXMPPPeerCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['XMPP_PEER_DOWN'].format(obj['downXMPPPeerCnt'])},infoObj));
            if(obj['downBgpPeerCnt'] > 0)
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['BGP_PEER_DOWN'].format(obj['downBgpPeerCnt'])},infoObj));
        }
        //Alerts that are applicable only when both UVE and config data are present
        if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false) {
            if(typeof(obj['totalBgpPeerCnt']) == "number" &&  obj['configuredBgpPeerCnt'] != obj['totalBgpPeerCnt'])
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:infraAlertMsgs['BGP_CONFIG_MISMATCH']},infoObj));
            if(obj['uveCfgIPMisMatch'])
                alertsList.push($.extend({},{sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['CONFIG_IP_MISMATCH']},infoObj));
        }
        return alertsList.sort(bgpMonitor.sortInfraAlerts);
    }

    this.processConfigNodeAlerts = function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Config Node',ip:obj['ip']};
        if(obj['isPartialUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        return alertsList.sort(bgpMonitor.sortInfraAlerts);
    }

    this.processAnalyticsNodeAlerts = function(obj) {
        var alertsList = [];
        var infoObj = {name:obj['name'],type:'Analytics Node',ip:obj['ip']};
        if(obj['isPartialUveMissing'] == true)
            alertsList.push($.extend({},{sevLevel:sevLevels['INFO'],msg:infraAlertMsgs['PARTIAL_UVE_MISSING']},infoObj));
        if(obj['errorStrings'] != null && obj['errorStrings'].length > 0){
            $.each(obj['errorStrings'],function(idx,errorString){
                alertsList.push($.extend({},{sevLevel:sevLevels['WARNING'],msg:errorString},infoObj));
            });
        }
        return alertsList.sort(bgpMonitor.sortInfraAlerts);
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


    /**
     * Parses vRouter UVE data
     */
    this.parsevRoutersDashboardData = function(result,isSummaryPage) {
        var retArr = [];
        //Reset the counter
        infraMonitorView.downNodeCnt['vRouter'] = 0;
        var vRouterCnt = result.length;
        for(var i=0;i<vRouterCnt;i++) {
            var obj = {};
            var d = result[i];
            var dValue = result[i]['value'];
            //obj['nodeState'] = d['nodeStatus'];
            obj['x'] = parseFloat(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;cpu_share','--'));
            obj['y'] = parseInt(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo;virt','--'))/1024; //Convert to MB
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['ip'] = getValueByJsonPath(dValue,'VrouterAgent;control_ip','-');
            obj['uveIP'] = obj['ip'];
            obj['summaryIps'] = getVrouterIpAddresses(dValue,"summary");
            var iplist = getValueByJsonPath(dValue,'VrouterAgent;self_ip_list',[]);
            if(obj['ip'] != '-')
                iplist.push(obj['ip']);
            obj['uveIP'] = iplist;
            obj['isConfigMissing'] = $.isEmptyObject(getValueByJsonPath(dValue,'ConfigData')) ? true : false;
            obj['isUveMissing'] = ($.isEmptyObject(getValueByJsonPath(dValue,'VrouterAgent')) && $.isEmptyObject(getValueByJsonPath(dValue,'VrouterStatsAgent'))) ? true : false;
            obj['configIP'] = getValueByJsonPath(dValue,'ConfigData;virtual-router;virtual_router_ip_address','-');
            if(obj['ip'] == '-') {
                obj['ip'] = obj['configIP'];
            }
            obj['processDetails'] = getValueByJsonPath(dValue,'VrouterStatsAgent;process_state_list',[]);
            obj['processStateAvailable'] = getValueByJsonPath(dValue,'VrouterStatsAgent;process_state_list',[]).length == 0 ? false : true;
            obj['histCpuArr'] = parseUveHistoricalValues(dValue,'','VrouterStatsAgent;cpu_share;0;history-10');
            
            obj['status'] = getOverallNodeStatus(d,'compute');
            var processes = ['contrail-vrouter','contrail-vrouter-nodemgr','supervisor-vrouter'];
            obj['processDetails'] = getUpDownProcessStatus(processes,obj['processDetails']);
            obj['memory'] = formatMemory(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info;meminfo','--'));
            obj['size'] = getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;out_bandwidth_usage',0) + 
                getValueByJsonPath(dValue,'VrouterStatsAgent;phy_if_1min_usage;0;in_bandwidth_usage',0) + 1;
            obj['shape'] = 'circle';
            var xmppPeers = getValueByJsonPath(dValue,'VrouterAgent;xmpp_peer_list',[]);
            obj['xmppPeerDownCnt'] = 0;
            $.each(xmppPeers,function(idx,currPeer) {
                if(currPeer['status'] != true) {
                    obj['xmppPeerDownCnt']++;
                }
            });
            obj['name'] = d['name'];
            obj['instCnt'] = getValueByJsonPath(dValue,'VrouterAgent;virtual_machine_list',[]).length;
            obj['intfCnt'] = getValueByJsonPath(dValue,'VrouterAgent;total_interface_count',0);
            
            obj['vns'] = getValueByJsonPath(dValue,'VrouterAgent;connected_networks',[]);
            obj['vnCnt'] = obj['vns'].length;
            obj['version'] = ifNullOrEmpty(getNodeVersion(getValueByJsonPath(dValue,'VrouterAgent;build_info')),noDataStr);
            //System CPU
            //obj['cpu'] = parseFloat(jsonPath(dValue,'$..CpuLoadInfo.CpuLoadAvg.one_min_avg')[0]);
            obj['type'] = 'vRouter';
            obj['display_type'] = 'vRouter';
            obj['isPartialUveMissing'] = false;
            obj['errorIntfCnt'] = 0;
            if(obj['isUveMissing'] == false) {
                var xmppPeers = getValueByJsonPath(dValue,'VrouterAgent;xmpp_peer_list',[]);
                obj['xmppPeerDownCnt'] = 0;
                $.each(xmppPeers,function(idx,currPeer) {
                    if(currPeer['status'] != true) {
                        obj['xmppPeerDownCnt']++;
                    }
                });
                obj['isPartialUveMissing'] = $.isEmptyObject(getValueByJsonPath(dValue,'VrouterStatsAgent;cpu_info')) || 
                    $.isEmptyObject(getValueByJsonPath(dValue,'VrouterAgent;build_info')) ||
                    obj['uveIP'].length == 0 ? true : false;
                obj['errorIntfCnt'] = getValueByJsonPath(dValue,'VrouterAgent;down_interface_count',0);
            }
            if(obj['errorIntfCnt'] > 0){
                obj['errorIntfCntText'] = ", <span class='text-error'>" + obj['errorIntfCnt'] + " Down</span>";
            } else {
                obj['errorIntfCntText'] = "";
            } 
            obj['uveCfgIPMisMatch'] = false;
            if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false && obj['isPartialUveMissing'] == false) {
                obj['uveCfgIPMisMatch'] = (obj['uveIP'].indexOf(obj['configIP']) == -1 && obj['configIP'] != '-') ? true : false;
            }
            obj['hostNameColor'] = 'blue';
            if(d['nodeStatus'] != 'Up'){
                obj['color'] = 'red';
                obj['hostNameColor'] = 'red';
            }
            obj['processAlerts']=getProcessAlerts(d,obj,'VrouterStatsAgent;process_state_list');
            obj['isGeneratorRetrieved'] = false;
            obj['nodeAlerts'] = self.processvRouterAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(bgpMonitor.sortInfraAlerts);
            //Decide color based on parameters
            obj['color'] = getvRouterColor(d,obj);
			obj['downNodeCnt'] = 0;
            if(obj['color'] == d3Colors['red']){
                infraMonitorView.downNodeCnt['vRouter']++;
                obj['downNodeCnt']++;
            }
            retArr.push(obj);
        }
        infraViewModel.vRouterDownCnt(infraMonitorView.downNodeCnt['vRouter']);
        infraViewModel.vRouterUpCnt(retArr.length-infraMonitorView.downNodeCnt['vRouter']);
        retArr.sort(bgpMonitor.sortNodesByColor);
        dashboardDataObj.vRoutersData(retArr);
        return retArr;
    }

    /**
     * Return false if is there is no severity alert that decides color
     */
    function getNodeColor(obj) {
        obj = ifNull(obj,{});
        //Check if there is any nodeAlert and if yes,get the highest severity alert
        var nodeAlertSeverity = -1,processLevelSeverity = -1;
        if(obj['nodeAlerts'].length > 0) {
            nodeAlertSeverity = obj['nodeAlerts'][0]['sevLevel'];
        }
        //Check if any process Alerts
        if(obj['processAlerts'].length > 0) {
            processLevelSeverity = obj['processAlerts'][0]['sevLevel'];
        }
        if(nodeAlertSeverity == sevLevels['ERROR'] || processLevelSeverity == sevLevels['ERROR'])
            return d3Colors['red'];
        if(nodeAlertSeverity == sevLevels['WARNING'] || processLevelSeverity == sevLevels['WARNING']) 
            return d3Colors['orange'];
        return false;
    }

    function getvRouterColor(d,obj) {
        var nodeColor = getNodeColor(obj);
        if(nodeColor != false)
            return nodeColor;
        obj = ifNull(obj,{});
        var instCnt = obj['instCnt'];
        if(instCnt == 0)
            return d3Colors['blue'];
        else if(instCnt > 0)
            return d3Colors['green'];
    }

    function getUpDownProcessStatus(processList,processDetails) {
        var retObj = {};
        $.each(processDetails,function(idx,currProcess) {
            var procName = currProcess['process_name'];
            if(isProcessExcluded(procName))
                return true;
            retObj[procName] = {
                state: currProcess['process_state'],
                since: currProcess['process_state'] == 'PROCESS_STATE_RUNNING' ? currProcess['last_start_time'] : 
                (currProcess['process_state'] == 'PROCESS_STATE_STOPPED' ? currProcess['last_stop_time'] : currProcess['last_exit_time'])
            }
        });
        return retObj;
    }

    function getControlNodeColor(d,obj) {
        obj= ifNull(obj,{});
        var nodeColor = getNodeColor(obj);
        if(nodeColor != false)
            return nodeColor;
        if(obj['downBgpPeerCnt'] == 0 && obj['downXMPPPeerCnt'] == 0)
            return d3Colors['green'];
        else
            return d3Colors['blue'];    //Default color
    }
    
    function getAanalyticNodeColor(d,obj) {
        obj= ifNull(obj,{});
        var nodeColor = getNodeColor(obj);
        if(nodeColor != false)
            return nodeColor;
        return d3Colors['blue'];
    }
    
    function getConfigNodeColor(d,obj) {
        obj= ifNull(obj,{});
        var nodeColor = getNodeColor(obj);
        if(nodeColor != false)
            return nodeColor;
        return d3Colors['blue'];
    }
    
    /**
     * Parses bgp-router UVE data
     */
    this.parseControlNodesDashboardData = function(result) {
        var retArr = [];
        //Reset the counter
        infraMonitorView.downNodeCnt['controlNode'] = 0;
        $.each(result,function(idx,d) {
            /*if(d['nodeStatus'] == 'Down')
                infraMonitorView.downNodeCnt['controlNode']++;*/
            var obj = {};
            obj['x'] = parseFloat(jsonPath(d,'$..cpu_info.cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..meminfo.virt')[0])/1024; //Convert to MB
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..cpu_share[*].history-10');
            obj['uveIP'] = ifNull(jsonPath(d,'$..bgp_router_ip_list')[0],[]);
            obj['configIP'] = ifNull(jsonPath(d,'$..ConfigData..bgp_router_parameters.address')[0],'-');
            obj['isConfigMissing'] = $.isEmptyObject(jsonPath(d,'$..ConfigData')[0]) ? true : false;
            obj['configuredBgpPeerCnt'] = ifNull(jsonPath(d,'$.value.ConfigData.bgp-router.bgp_router_refs')[0],[]).length;
            //nodeStatus is down and is present in Config server implies that it's missing in UVE
            //obj['isUveMissing'] = (d['nodeStatus'] == 'Down') && (obj['isConfigMissing'] == false);
            obj['isUveMissing'] = $.isEmptyObject(jsonPath(d,'$..BgpRouterState')[0]) ? true : false;
            obj['ip'] = ifNull(jsonPath(d,'$..bgp_router_ip_list[0]')[0],'-');
            //If iplist is empty will display the config ip 
            if(obj['ip'] == '-') {
                obj['ip'] = obj['configIP'];
            }
            obj['summaryIps'] = getControlIpAddresses(d,"summary");
            obj['memory'] = formatMemory(ifNull(jsonPath(d,'$..meminfo')[0]),'-');
            obj['size'] = ifNull(jsonPath(d,'$..output_queue_depth')[0],0)+1; 
            obj['shape'] = 'circle';
            obj['name'] = d['name'];
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.BgpRouterState.build_info')[0]),'-');
            obj['totalPeerCount'] = ifNull(jsonPath(d,'$..num_bgp_peer')[0],0) + ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
            //Assign totalBgpPeerCnt as false if it doesn't exist in UVE
            obj['totalBgpPeerCnt'] = ifNull(jsonPath(d,'$..num_bgp_peer')[0],null);
            obj['upBgpPeerCnt'] = ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],null);
            obj['establishedPeerCount'] = ifNull(jsonPath(d,'$..num_up_bgp_peer')[0],0);
            obj['activevRouterCount'] = ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
            obj['upXMPPPeerCnt'] = ifNull(jsonPath(d,'$..num_up_xmpp_peer')[0],0);
            obj['totalXMPPPeerCnt'] = ifNull(jsonPath(d,'$..num_xmpp_peer')[0],0);
            if(obj['totalXMPPPeerCnt'] > 0){
                obj['downXMPPPeerCnt'] = obj['totalXMPPPeerCnt'] - obj['upXMPPPeerCnt'];
            } else {
                obj['downXMPPPeerCnt'] = 0;
            }
            obj['downBgpPeerCnt'] = 0;
            if(typeof(obj['totalBgpPeerCnt']) == "number" && typeof(obj['upBgpPeerCnt']) == "number"  && obj['totalBgpPeerCnt'] > 0) {
            	obj['downBgpPeerCnt'] = obj['totalBgpPeerCnt'] - obj['upBgpPeerCnt'];
            } 
            if(obj['downXMPPPeerCnt'] > 0){
                obj['downXMPPPeerCntText'] = ", <span class='text-error'>" + obj['downXMPPPeerCnt'] + " Down</span>";
            } else {
                obj['downXMPPPeerCntText'] = "";
            }
            obj['isPartialUveMissing'] = false;
            obj['isIfmapDown'] = false;
            if(obj['isUveMissing'] == false) {
                obj['isPartialUveMissing'] = (isEmptyObject(jsonPath(d,'$.value.BgpRouterState.cpu_info')[0]) || 
                        isEmptyObject(jsonPath(d,'$.value.BgpRouterState.build_info')[0]) || 
                        (obj['configIP'] == '-') || obj['uveIP'].length == 0) ? true : false;
                var ifmapObj = jsonPath(d,'$.value.BgpRouterState.ifmap_info')[0];
                if(ifmapObj != undefined && ifmapObj['connection_status'] != 'Up'){
                    obj['isIfmapDown'] = true;
                    obj['ifmapDownAt'] = ifNull(ifmapObj['connection_status_change_at'],'-');
                }
            }
            if(obj['downBgpPeerCnt'] > 0){
                obj['downBgpPeerCntText'] = ", <span class='text-error'>" + obj['downBgpPeerCnt'] + " Down</span>";
            } else {
                obj['downBgpPeerCntText'] = "";
            }
            obj['uveCfgIPMisMatch'] = false;
            if(obj['isUveMissing'] == false && obj['isConfigMissing'] == false && obj['isPartialUveMissing'] == false) {
                if(obj['uveIP'].indexOf(obj['configIP']) <= -1){
                    obj['uveCfgIPMisMatch'] = true;
                } 
            }
            //System CPU
            //obj['cpu'] = parseFloat(jsonPath(d,'$..CpuLoadInfo.CpuLoadAvg.one_min_avg')[0]);
            obj['type'] = 'controlNode';
            obj['display_type'] = 'Control Node';
            var upTime = new XDate(jsonPath(d,'$..uptime')[0]/1000);
            var currTime = new XDate();
            var procStateList;
            try{
                obj['status'] = getOverallNodeStatus(d,"control");
            }catch(e){
                obj['status'] = 'Down';
            }
            obj['hostNameColor'] = 'blue';
            if(d['nodeStatus'] != 'Up'){
                obj['color'] = d3Colors['red'];
                obj['hostNameColor'] = d3Colors['red'];
            }
            obj['processAlerts'] = getProcessAlerts(d,obj);
            //Process state
            obj['processDetails'] = ifNull(jsonPath(d,'$..process_state_list')[0],[]);
            obj['processStateAvailable'] = getValueByJsonPath(d,'value;BgpRouterState;process_state_list',[]).length == 0 ? false : true;
            var processes = ['contrail-control','supervisor-control','contrail-control-nodemgr','supervisor-dns','contrail-dns','contrail-named'];
            obj['processDetails'] = getUpDownProcessStatus(processes,obj['processDetails']);
            obj['isGeneratorRetrieved'] = false;
            obj['nodeAlerts'] = self.processControlNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(bgpMonitor.sortInfraAlerts);
            obj['color'] = getControlNodeColor(d,obj);
            obj['downNodeCnt'] = 0;
            if(obj['color'] == d3Colors['red']){
                infraMonitorView.downNodeCnt['controlNode']++;
                obj['downNodeCnt']++;
            }
            retArr.push(obj);
        });
        infraViewModel.ctrlNodeDownCnt(infraMonitorView.downNodeCnt['controlNode']);
        infraViewModel.ctrlNodeUpCnt(retArr.length-infraMonitorView.downNodeCnt['controlNode']);
        retArr.sort(bgpMonitor.sortNodesByColor);
        dashboardDataObj.ctrlNodesData(retArr);
        return retArr;
    }

    /**
     * Parses collector UVE data
     */
    this.parseAnalyticNodesDashboardData = function(result) {
        var retArr = [];
        //Reset the counter
        infraMonitorView.downNodeCnt['analyticNode'] = 0;
        $.each(result,function(idx,d) {
            var obj = {};
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")]..meminfo.virt')[0])/1024;
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['memory'] = formatBytes(obj['y']*1024*1024);
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..collector_cpu_share[*].history-10');
            obj['pendingQueryCnt'] = ifNull(jsonPath(d,'$..QueryStats.queries_being_processed')[0],[]).length; 
            obj['pendingQueryCnt'] = ifNull(jsonPath(d,'$..QueryStats.pending_queries')[0],[]).length; 
            obj['size'] = obj['pendingQueryCnt'] + 1;
            obj['shape'] = 'circle';
            obj['type'] = 'analyticsNode';
            obj['display_type'] = 'Analytics Node';
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.CollectorState.build_info')[0]),'-');
            try{
                obj['status'] = getOverallNodeStatus(d,"analytics");
            }catch(e){
                obj['status'] = 'Down';
            }
            //obj['color'] = Math.floor(Math.random()*5);
            //obj['color'] = 4;
            if(obj['status'].toLowerCase().search("down") != -1) {
                obj['hostNameColor'] = "red";
            } else {
                obj['hostNameColor'] = "blue";
            }
          //get the ips
          var iplist = ifNull(jsonPath(d,'$..self_ip_list')[0],noDataStr); 
          obj['ip'] = obj['summaryIps'] = noDataStr;
          if(iplist != null && iplist != noDataStr && iplist.length > 0){
                obj['ip'] = iplist[0];
                var ipString = "";
                $.each(iplist, function (idx, ip){
                    if(idx+1 == iplist.length) {
                        ipString = ipString + ip;
                      } else {
                        ipString = ipString + ip + ', ';
                      }
                });
                obj['summaryIps'] = ipString;
          }
            obj['name'] = d['name'];
            obj['errorStrings'] = ifNull(jsonPath(d,"$.value.ModuleCpuState.error_strings")[0],[]);
            obj['processAlerts'] = getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
            if(isEmptyObject(jsonPath(d,'$.value.ModuleCpuState.module_cpu_info[?(@.module_id=="Collector")].cpu_info')[0]) || isEmptyObject(jsonPath(d,'$.value.CollectorState.build_info')[0])) {
                obj['isPartialUveMissing'] = true;
            }
            //Process state
            obj['processDetails'] = ifNull(jsonPath(d,'$..process_state_list')[0],[]);
            obj['processStateAvailable'] = getValueByJsonPath(d,'value;ModuleCpuState;process_state_list',[]).length == 0 ? false : true;
            var processes = ['supervisor-analytics','contrail-analytics-nodemgr','contrail-collector','contrail-opserver',
                             'contrail-qe','redis-query','redis-sentinel','redis-uve'];             
            obj['processDetails'] = getUpDownProcessStatus(processes,obj['processDetails']);
          //get the cpu for analytics node
		  var cpuInfo = jsonPath(d,'$..ModuleCpuState.module_cpu_info')[0];
          obj['isGeneratorRetrieved'] = false;
      	  var genInfos = ifNull(jsonPath(d,'$.value.CollectorState.generator_infos')[0],[])
    	  obj['genCount'] = genInfos.length;
          obj['nodeAlerts'] = self.processAnalyticsNodeAlerts(obj);
          obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(bgpMonitor.sortInfraAlerts);
          obj['color'] = getAanalyticNodeColor(d,obj);
          obj['downNodeCnt'] = 0;
          if(obj['color'] == d3Colors['red']){
                infraMonitorView.downNodeCnt['analyticNode']++;
                obj['downNodeCnt']++;
          }
          retArr.push(obj);
        });
        infraViewModel.analyticNodeDownCnt(infraMonitorView.downNodeCnt['analyticNode']);
        infraViewModel.analyticNodeUpCnt(retArr.length-infraMonitorView.downNodeCnt['analyticNode']);
        retArr.sort(bgpMonitor.sortNodesByColor);
        dashboardDataObj.analyticNodesData(retArr);
        return retArr;
    }

    /**
     * Parses config-node UVE data
     */
    this.parseConfigNodesDashboardData = function(result) {
        var retArr = [];
        //Reset the counter
        infraMonitorView.downNodeCnt['configNode'] = 0;
        $.each(result,function(idx,d) {
            var obj = {};
            obj['x'] = parseFloat(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")]..cpu_share')[0]);
            obj['y'] = parseInt(jsonPath(d,'$..ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")]..meminfo.virt')[0])/1024;
            obj['cpu'] = $.isNumeric(obj['x']) ? obj['x'].toFixed(2) : '-';
            obj['memory'] = formatBytes(obj['y']*1024*1024);
            //Re-visit once average response time added for config nodes
            obj['size'] = 1;
            obj['version'] = ifEmpty(getNodeVersion(jsonPath(d,'$.value.configNode.ModuleCpuState.build_info')[0]),'-');
            obj['shape'] = 'circle';
            obj['type'] = 'configNode';
            obj['display_type'] = 'Config Node';
            obj['name'] = d['name'];
            obj['processAlerts'] = getProcessAlerts(d,obj);
            obj['isPartialUveMissing'] = false;
           /* try{
                obj['procStateListStatus'] = getOverallNodeStatus(d,"config");
            }catch(e){
                obj['procStateListStatus'] = 'Down';
            }
            obj['status'] = '-';*/
            try{
                obj['status'] = getOverallNodeStatus(d,"config");
            }catch(e){
                obj['status'] = 'Down';
            }
          //Disabling the red highlight for now since when HA proxy is enabled some might show as down.
//          if(obj['status'].toLowerCase().search("down") != -1) {
//              obj['hostNameColor'] = "red";
//          } else {
//              obj['hostNameColor'] = "blue";
//          }
            obj['histCpuArr'] = parseUveHistoricalValues(d,'$..api_server_cpu_share[*].history-10');
            var iplist = jsonPath(d,'$..config_node_ip')[0];
             obj['ip'] = obj['summaryIps'] = noDataStr;
                if(iplist != null && iplist != noDataStr && iplist.length > 0){
                obj['ip'] = iplist[0];
                var ipString = "";
                $.each(iplist, function (idx, ip){
                    if(idx+1 == iplist.length) {
                        ipString = ipString + ip;
                       } else {
                        ipString = ipString + ip + ', ';
                       }
                });
                obj['summaryIps'] = ipString;
            }
            obj['hostNameColor'] = "blue";
            if(isEmptyObject(jsonPath(d,'$.value.configNode.ModuleCpuState.module_cpu_info[?(@.module_id=="ApiServer")].cpu_info')[0]) || isEmptyObject(jsonPath(d,'$.value.configNode.ModuleCpuState.build_info')[0])) {
                obj['isPartialUveMissing'] = true;
            }
            //Process state
            obj['processDetails'] = ifNull(jsonPath(d,'$..process_state_list')[0],[]);
            obj['processStateAvailable'] = getValueByJsonPath(d,'value;configNode;ModuleCpuState;process_state_list',[]).length == 0 ? false : true;
            var processes = ['supervisor-config','contrail-api','contrail-config-nodemgr','contrail-discovery','contrail-schema',
                             'contrail-svc-monitor','ifmap','redis-config'];                         
            obj['processDetails'] = getUpDownProcessStatus(processes,obj['processDetails']);
            obj['isGeneratorRetrieved'] = false;
          //get the cpu for config node
	          var cpuInfo1 ;
	          try{
	          	cpuInfo1 = jsonPath(d,'$..configNode.ModuleCpuState.module_cpu_info');
	          }catch(e){}
            obj['downNodeCnt'] = 0;
            obj['nodeAlerts'] = self.processConfigNodeAlerts(obj);
            obj['alerts'] = obj['nodeAlerts'].concat(obj['processAlerts']).sort(bgpMonitor.sortInfraAlerts);
            obj['color'] = getConfigNodeColor(d,obj);
            if(obj['color'] == d3Colors['red']){
                infraMonitorView.downNodeCnt['configNode']++;
                obj['downNodeCnt']++;
            }
            retArr.push(obj);
        });
        infraViewModel.configNodeDownCnt(infraMonitorView.downNodeCnt['configNode']);
        infraViewModel.configNodeUpCnt(retArr.length - infraMonitorView.downNodeCnt['configNode']);
        retArr.sort(bgpMonitor.sortNodesByColor);
        dashboardDataObj.configNodesData(retArr);
        return retArr;
    }

    this.parseGeneratorsData = function(result){
        var retArr = [];
        if(result != null && result[0] != null){
            result = result[0].value;
        } else {
            result = [];
        }
        $.each(result,function(idx,d){
            var obj = {};
            obj['status'] = getOverallNodeStatusFromGenerators(d);
            obj['name'] = d['name'];
            retArr.push(obj);
        });
        return retArr;
    }
    
    this.populateMessagesTab = function (nodeType, options, obj) {
        var consoleTabTemplate = Handlebars.compile($('#console-tab-template').html());
        var cboMsgType, cboMsgCategory, cboMsgLevel, cboTimeRange;
        var lastMsgLogTime, lastLogLevel, userChangedQuery = false, defaultTimeRange = 5 * 60;//5 mins by default
        if (nodeType == 'control') {
            layoutHandler.setURLHashParams({tab:'console', node:contrail.format('Control Nodes:{0}', obj['name'])},{triggerHashChange:false});
            $('#ctrlNodeMessagesTab').html(consoleTabTemplate({}));
        } else if (nodeType == "analytics"){
            layoutHandler.setURLHashParams({tab:'console', node:contrail.format('Analytics Nodes:{0}', obj['name'])},{triggerHashChange:false});
            $('#analyticsNodeMessagesTab').html(consoleTabTemplate({}));
        } else if (nodeType == "config"){
            layoutHandler.setURLHashParams({tab:'console', node:contrail.format('Config Nodes:{0}', obj['name'])},{triggerHashChange:false});
            $('#configNodeMessagesTab').html(consoleTabTemplate({}));
        } else {
            layoutHandler.setURLHashParams({tab:'console', node:contrail.format('vRouters:{0}', obj['name'])},{triggerHashChange:false});
            $('#computeNodeMessagesTab').html(consoleTabTemplate({}));
        }
        initWidget4Id('#console-msgs-box');
        //Disable Auto-refresh for time-being
        //$('#msgAutoRefresh').attr('disabled','disabled');

        var MIN = 60, HOUR = MIN * 60;
        if ($('#msgTimeRange').data('contrailDropdown') == null) {
            $('#msgAutoRefresh').attr('checked', 'checked');
            $('#msgAutoRefresh').on('click', function () {
                if ($(this).is(':checked')) {
                    if (userChangedQuery)
                        loadLogs();
                    else 
                        fetchLastLogtimeAndCallLoadLogs('',nodeType);
                } else {
                    infraMonitorView.clearTimers();
                }
            });
            $('#msgTimeRange').contrailDropdown({
                data:[
                    {lbl:'Last 5 mins', value:'5m'},
                    {lbl:'Last 10 mins', value:'10m'},
                    {lbl:'Last 30 mins', value:'30m'},
                    {lbl:'Last 1 hr', value:'1h'},
                    {lbl:'Last 2 hrs', value:'2h'},
                    {lbl:'Last 4 hrs', value:'4h'},
                    {lbl:'Last 6 hrs', value:'6h'},
                    {lbl:'Last 10 hrs', value:'10h'},
                    {lbl:'Last 12 hrs', value:'12h'},
                    {lbl:'Last 18 hrs', value:'18h'},
                    {lbl:'Last 24 hrs', value:'24h'},
                    {lbl:'Custom', value:'custom'}
                ],
                dataTextField:'lbl',
                dataValueField:'value',
                change:selectTimeRange
            });
            $("#console-from-time").contrailDateTimePicker({
               // format:"MMM dd, yyyy hh:mm:ss tt",
                format: 'M d, Y h:i:s A',
//                min:new Date(2013, 2, 1),
//                value:new Date(),
//                timeFormat:"hh:mm:ss tt",
//                interval:10
            });
            $("#console-to-time").contrailDateTimePicker({
               // format:"MMM dd, yyyy hh:mm:ss tt",
                format:"MMM dd, yyyy hh:mm:ss tt",
//                min:new Date(2013, 2, 1),
//                value: new Date(),
//                timeFormat:"hh:mm:ss tt",
//                interval:10
            });
            $('#msgType').contrailCombobox({
                dataSource:[],
                placeholder:'Any'
            });
            $('#msgCategory').contrailDropdown({
                dataSource:{
                    type:'remote',
                    url: monitorInfraUrls['MSGTABLE_CATEGORY'],
                    parse:function (response) {
                        if (nodeType == 'control')
                            return ifNull(response['ControlNode'], []);
                        else if (nodeType == 'compute')
                            return ifNull(response['VRouterAgent'], []);
                        else if (nodeType == 'analytics')
                            return ifNull(response['Collector'], []);
                        else if (nodeType == 'config')
                            return ifNull(response['ApiServer'], []);
                    }
                },
                placeholder:'All'
            });
            $('#msgLevel').contrailDropdown({
                dataSource:{
                    type:'remote',
                    url: monitorInfraUrls['MSGTABLE_LEVEL'],
                    parse:function (response) {
                        var retArr = [];
                        $.map(response, function (value) {
                            $.each(value, function (key, value) {
                                retArr.push({text:value, value:key});
                            });
                        });
                        return retArr;
                    }
                },
                dataTextField:'text',
                dataValueField:'value'
            });
            $('#msgLimit').contrailDropdown({
                data:$.map(['All',10, 50, 100, 200, 500], function (value) {
                    return {value:value, text:(value == 'All')? 'All':contrail.format('{0} messages', value)};
                }),
                dataTextField:'text',
                dataValueField:'value'                    
            });
        }
        cboTimeRange = $('#msgTimeRange').data('contrailDropdown');
        cboMsgCategory = $('#msgCategory').data('contrailDropdown');
        cboMsgType = $('#msgType').data('contrailCombobox');
        cboMsgLevel = $('#msgLevel').data('contrailDropdown');
        cboMsgLimit = $('#msgLimit').data('contrailDropdown');
        cboMsgFromTime = $('#console-from-time').data('contrailDateTimePicker');
        cboMsgToTime = $('#console-to-time').data('contrailDateTimePicker');
        toTimeEle = $('#console-to-time');
        fromTimeEle = $('#console-from-time');

        cboTimeRange.value('custom');
        cboMsgLevel.value('5');
        cboMsgLimit.value('50')
        
        $('#btnDisplayLogs').on('click', function () {
            userChangedQuery = true;
            loadLogs();
        });

        //var gridConsole;
        //To show the latest records
        function moveToLastPage(e) {
            //Process only if grid is visible
            //console.info('console grid dataBound',gridConsole.dataSource._total,gridConsole.dataSource._page);
            //console.info('console grid dataBound',e.response.length,gridConsole.dataSource._page);
            //if($(gridConsole.element).is(':visible')) {
            //console.info('console grid visible',$(gridConsole.element).is(':visible'));
//            if (e.response == null)
//                return;
            var hashParams = layoutHandler.getURLHashParams();
            if (hashParams['tab'] != null && hashParams['tab'] == 'console') {
               /* var totalCnt = e.response.length, pageSize = gridConsole.dataSource._pageSize;
                if (totalCnt > 0) {
                    var lastPageNo = Math.ceil(totalCnt / pageSize);
                    setTimeout(function () {
                        selectGridPage(lastPageNo);
                    }, 100);
                }*/
                if ($('#msgAutoRefresh').is(':checked')) {
                    //Don't start the timer,if one is already pending
                    if (self.consoleTimer.length == 0) {
                        var timerId = setTimeout(function () {
                            if(userChangedQuery)
                                loadLogs(timerId);
                            else 
                                fetchLastLogtimeAndCallLoadLogs(timerId,nodeType);
                        }, 10000);
                        logMessage("Setting timer:", timerId);
                        self.consoleTimer.push(timerId);
                    }
                }
            }
        }
        function selectGridPage(lastPageNo) {
            gridConsole.dataSource.page(lastPageNo);
            gridConsole.content.scrollTop(gridConsole.tbody.height());
        }
        function fetchLastLogtimeAndCallLoadLogs(timerId,nodeType){
        	var type,moduleType="",kfilt="";
        	var hostName = obj['name'];
        	if(nodeType == 'compute'){
        		type = 'vrouter';
        		kfilt = hostName+":*:" + UVEModuleIds['VROUTER_AGENT'] + ":*";
        	} else if (nodeType == 'control'){
        		type = 'controlnode';
        		kfilt = hostName+":*:" + UVEModuleIds['CONTROLNODE'] + ":*";
        	} else if (nodeType == 'analytics'){
        		type = 'Collector';
        		kfilt = hostName+":*:" + UVEModuleIds['COLLECTOR'] + ":*,"+
        		        hostName+":*:" + UVEModuleIds['OPSERVER'] + ":*";
        	} else if (nodeType == 'config'){
        		type = 'confignode';
        		kfilt = hostName+":*:" + UVEModuleIds['APISERVER'] + "*,"+
	                    hostName+":*:" + UVEModuleIds['DISCOVERY_SERVICE'] + ":*,"+
    	                hostName+":*:" + UVEModuleIds['SERVICE_MONITOR'] + ":*,"+
    	                hostName+":*:" + UVEModuleIds['SCHEMA'] + ":*";
        	}
        	var postData = getPostData("generator","","","ModuleServerState:msg_stats",kfilt);
        	$.ajax({
                url:TENANT_API_URL,
                type:'post',
                data:postData,
                dataType:'json'
            }).done(function (result) {
                var logLevelStats = [], lastLog, lastTimeStamp,allStats = [];
                try{
                    allStats =  ifNullOrEmptyObject(jsonPath(result,"$..log_level_stats"),[]);
                }catch(e){}
                if(allStats instanceof Array){
                    for(var i = 0; i < allStats.length;i++){
                        if(!($.isEmptyObject(allStats[i]))){
                            if( allStats[i] instanceof Array){
                                logLevelStats = logLevelStats.concat(allStats[i]);
                            } else {
                                logLevelStats.push(allStats[i]);
                            }
                        }
                    }
                }
                if(logLevelStats != null){
                    lastLog = getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
                    if(lastLog != null){
                        lastTimeStamp = parseInt(lastLog.last_msg_timestamp)/1000 + 1000;
                        lastLogLevel = lastLog.level;
                    }
                }
                if(lastTimeStamp == null || lastMsgLogTime != lastTimeStamp){
                    lastMsgLogTime = lastTimeStamp;
                    if(lastMsgLogTime != null && lastLogLevel != null){
                        var dateTimePicker = $("#console-to-time").data("contrailDateTimePicker");
                        dateTimePicker.val(new Date(lastMsgLogTime));
                        dateTimePicker = $("#console-from-time").data("contrailDateTimePicker");
                        //dateTimePicker.val(adjustDate(new Date(lastMsgLogTime), {sec:-1 * defaultTimeRange}));
                        dateTimePicker.val(moment(new Date(lastMsgLogTime)).subtract('s', defaultTimeRange));
                        //select the level option which has the last log
                        //$("#msgLevel option:contains(" + lastLogLevel + ")").attr('selected', 'selected');
                        var dropdownlist = $("#msgLevel").data("contrailDropdown");
                        dropdownlist.text(lastLogLevel);
                    } else {
                        var timerangedropdownlistvalue = $("#msgTimeRange").data("contrailDropdown");
                        timerangedropdownlistvalue.value('5m');

                        $('#consoleFromTimeDiv').hide();
                        $('#consoleToTimeDiv').hide();
                        $('#msgFromTime').hide();
                        $('#msgToTime').hide();
                        selectTimeRange({val:"1800"}) ;
                    }
                    loadLogs(timerId,true);
//TODO : see if this is required                    gridConsole.dataSource.unbind('requestEnd');
//                    gridConsole.dataSource.bind('requestEnd', moveToLastPage);
                   moveToLastPage();
                }
            }).fail(displayAjaxError.bind(null, $('#computenode-dashboard')));
        }
        function selectTimeRange(obj) {
            if (obj.val == 'custom') {
                $('#consoleFromTimeDiv').show();
                $('#consoleToTimeDiv').show();
                $('#msgFromTime').show();
                $('#msgToTime').show();
            } else {
                $('#consoleFromTimeDiv').hide();
                $('#consoleToTimeDiv').hide();
                $('#msgFromTime').hide();
                $('#msgToTime').hide();
                
            }
        }
        function loadLogs(timerId) {
            logMessage("Timer triggered:", timerId);
            if ((timerId != null) && (timerId != '') && $.inArray(timerId, self.consoleTimer) == -1) {
                logMessage("Timer cancelled:", timerId);
                return;
            } else if (timerId != null && ($.inArray(timerId, self.consoleTimer) != -1)) {
                //Remove timerId from self.consoleTimer (pending timers)
                self.consoleTimer.splice($.inArray(timerId, self.consoleTimer), 1);
            }
            var timerangedropdownlistvalue = $("#msgTimeRange").data("contrailDropdown").value();
             
            var filterObj = {
                table:'MessageTable',
                source:options['source']
                //messageType:'any'
            };
            if (nodeType == 'control') {
                filterObj['moduleId'] = UVEModuleIds['CONTROLNODE'];
            } else if (nodeType == 'compute') {
                filterObj['moduleId'] = UVEModuleIds['VROUTER_AGENT'];
            } else if (nodeType == 'config') {
                filterObj['where'] = '(ModuleId='+ UVEModuleIds['SCHEMA'] +' AND Source='
                                    +obj['name']+') OR (ModuleId='+ UVEModuleIds['APISERVER'] +' AND Source='
                                    +obj['name']+') OR (ModuleId='+ UVEModuleIds['SERVICE_MONITOR'] +' AND Source='
                                    +obj['name']+') OR (ModuleId='+ UVEModuleIds['DISCOVERY_SERVICE'] +' AND Source='+obj['name']+')';
            } else if (nodeType == 'analytics') {
                filterObj['where'] = '(ModuleId='+ UVEModuleIds['OPSERVER'] +' AND Source='+obj['name']+') OR (ModuleId='+ UVEModuleIds['COLLECTOR'] +' AND Source='+obj['name']+')';
            }

            if (cboMsgCategory.value() != '') {
                filterObj['category'] = cboMsgCategory.value();
            }
            if ((cboMsgLevel.value() != null) && (cboMsgLevel.value() != '')) {
                filterObj['level'] = cboMsgLevel.value();
            } else
                filterObj['level'] = 5;
            if (cboMsgType.value() != '')
                filterObj['messageType'] = cboMsgType.value();
            if (cboMsgLimit.value() != '' && cboMsgLimit != 'All')
                filterObj['limit'] = cboMsgLimit.value();
         /*   if(!userChangedQuery){
                filterObj['toTimeUTC'] = lastMsgLogTime;
                filterObj['fromTimeUTC'] = adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * defaultTimeRange}).getTime();
            }
            else {
                filterObj['toTimeUTC'] = (new Date()).getTime();
                filterObj['fromTimeUTC'] = adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * cboTimeRange.value()}).getTime();
            }
          */
            if(timerangedropdownlistvalue === 'custom'){
                filterObj['toTimeUTC'] = new Date(toTimeEle.val()).getTime();
                filterObj['fromTimeUTC'] = new Date(fromTimeEle.val()).getTime();
            } else {
            	filterObj['toTimeUTC'] = "now";
            	filterObj['fromTimeUTC'] = "now-"+ cboTimeRange.value();//adjustDate(new Date(filterObj['toTimeUTC']), {sec:-1 * cboTimeRange.value()}).getTime();
            }
            loadSLResults({elementId:'gridConsole', btnId:'btnDisplayLogs', timeOut:60000,
                pageSize:20, //gridHeight:500,
                reqFields:['MessageTS', 'Category','Messagetype', 'Xmlmessage']}, filterObj);
            gridConsole = $('#gridConsole').data('contrailGrid');
            //Take to the last page and scroll to bottom
            //gridConsole.bind('dataBound',function() {
            //gridConsole.bind('dataBinding',function() {
            //gridConsole.bind('dataBound',moveToLastPage);
        };
        //$('#btnDisplayLogs').trigger('click');
        if(userChangedQuery){
            loadLogs();
//            TODO : see if this is required. 
//            gridConsole.dataSource.unbind('requestEnd');
//            gridConsole.dataSource.bind('requestEnd', moveToLastPage);
            
            moveToLastPage();
        }
        else {
            fetchLastLogtimeAndCallLoadLogs('',nodeType);
        }
        
        $('#btnResetLogs').on('click', function () {
            cboTimeRange.value(5 * MIN);
            cboMsgType.value('');
            cboMsgLimit.value('10');
            cboMsgCategory.value('');
            cboMsgLevel.value('5');
            if(userChangedQuery)
                loadLogs();
            else 
                fetchLastLogtimeAndCallLoadLogs('',nodeType);
        });
    }
}

/**
 * Process-specific alerts
 */
function getProcessAlerts(data,obj,processPath){
    var res,filteredResponse = [],downProcess = 0; 
    if(processPath != null)
        res = getValueByJsonPath(data['value'],processPath,[]);
    else
        res = ifNull(jsonPath(data,'$..process_state_list')[0],[]);
    var alerts=[];
    if(obj['isUveMissing'] == true)
        return alerts;
    filteredResponse = $.grep(res,function(obj,idx){
        return !isProcessExcluded(obj['process_name']);
    })
    if(filteredResponse.length == 0){
        alerts.push({sevLevel:sevLevels['ERROR'],nName:data['name'],pName:obj['display_type'],msg:infraAlertMsgs['PROCESS_STATES_MISSING']});
    } else {
        for(var i=0;i<filteredResponse.length;i++) {
          if(filteredResponse[i]['core_file_list']!=undefined && filteredResponse[i]['core_file_list'].length>0) {
              var msg = infraAlertMsgs['PROCESS_COREDUMP'].format(filteredResponse[i]['core_file_list'].length);
              var restartCount = ifNull(filteredResponse[i]['exit_count'],0);
              if(restartCount > 0)
                  msg +=", "+ infraAlertMsgs['PROCESS_RESTART'].format(restartCount);
              alerts.push({tooltipAlert:false,sevLevel:sevLevels['INFO'],nName:data['name'],pName:filteredResponse[i]['process_name'],msg:msg});
          }  
          var procName = filteredResponse[i]['process_name'];
          if (filteredResponse[i]['process_state']!='PROCESS_STATE_STOPPED' && filteredResponse[i]['process_state']!='PROCESS_STATE_RUNNING' 
                && filteredResponse[i]['last_exit_time'] != null){
              downProcess++;
              alerts.push({tooltipAlert:false,nName:data['name'],pName:procName,msg:'down',popupMsg:'Down',
                timeStamp:filteredResponse[i]['last_exit_time'],sevLevel:sevLevels['ERROR']});
          } else if (filteredResponse[i]['process_state'] == 'PROCESS_STATE_STOPPED' && filteredResponse[i]['last_stop_time'] != null) {
              downProcess++;
              alerts.push({tooltipAlert:false,nName:data['name'],pName:procName,msg:'stopped',popupMsg:'Stopped',
                timeStamp:filteredResponse[i]['last_stop_time'],sevLevel:sevLevels['ERROR']});
             //Raise only info alert if process_state is missing for a process??
          } else if  (filteredResponse[i]['process_state'] == null) {
              downProcess++;
              alerts.push({tooltipAlert:false,nName:data['name'],pName:filteredResponse[i]['process_name'],msg:'down',popupMsg:'Down',
                timeStamp:filteredResponse[i]['last_exit_time'],sevLevel:sevLevels['INFO']});
                  msg +=", "+infraAlertMsgs['RESTARTS'].format(restartCount);
              alerts.push({nName:data['name'],pName:filteredResponse[i]['process_name'],type:'core',msg:msg});
          } 
        }
        if(downProcess > 0)
            alerts.push({detailAlert:false,sevLevel:sevLevels['ERROR'],msg:infraAlertMsgs['PROCESS_DOWN'].format(downProcess)});
    }
    return alerts.sort(bgpMonitor.sortInfraAlerts);
}

var infraMonitorView = new infraMonitorClass();

function formatMemory(memory) {
    if(memory == null || memory['virt'] == null)
        return noDataStr;
    var usedMemory = parseInt(memory['virt']) * 1024;
    //var totalMemory = parseInt(memory['total']) * 1024;
    return contrail.format('{0}', formatBytes(usedMemory));
}

function getAllvRouters(defferedObj,dataSource,dsObj){
    var obj = {};
    if(dsObj['lastUpdated'] == null){
        obj['transportCfg'] = { 
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'],
                type:'GET'
            }
        defferedObj.done(function(){
            manageDataSource.refreshDataSource('computeNodeDS');
        });
    } else {
        obj['transportCfg'] = {
                url: monitorInfraUrls['VROUTER_CACHED_SUMMARY'] + '?forceRefresh',
                type:'GET',
                //set the default timeout as 5 mins
                timeout:300000
        }
    }
    
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorView.parsevRoutersDashboardData,
                        loadedDeferredObj:defferedObj});
}

function getAllControlNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['CONTROLNODE_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorView.parseControlNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

/**
 * populateFn for analyticsDS
 */
function getAllAnalyticsNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['ANALYTICS_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorView.parseAnalyticNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

/**
 * populateFn for configDS
 */
function getAllConfigNodes(defferedObj,dataSource){
    var obj = {};
    obj['transportCfg'] = { 
            url: monitorInfraUrls['CONFIG_SUMMARY'],
            type:'GET'
        }
    getOutputByPagination(dataSource,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorView.parseConfigNodesDashboardData,
                        loadedDeferredObj:defferedObj});
}

function mergeGeneratorAndPrimaryData(genDS,primaryDS,options){
    var genDSData = genDS.getItems();
    var primaryData = primaryDS.getItems();
    var updatedData = [];
    //to avoid the change event getting triggered copy the data into another array and use it.
    var genData = [];
    $.each(genDSData,function (idx,obj){
        genData.push(obj);
    });
    $.each(primaryData,function(i,d){
        var idx=0;
        while(genData.length > 0 && idx < genData.length){
            if(genData[idx]['name'].split(':')[0] == d['name']){
                var dataItem = primaryData[i];
                var status = getFinalNodeStatusFromGenerators(genData[idx]['status'],dataItem['status']);
                d['status'] = status;
                d['isGeneratorRetrieved'] = true;
                genData.splice(idx,1);
                break;
            }
            idx++;
        };
        updatedData.push(d);
    });
    
    //primaryDS.data(updatedData);
    /* ToDo: vRouter summary page
    if(options['nodeType'] == 'computeNode' && options['page'] == 'summary'){
        cmpNodesView.setvRoutersDataWithStatus(updatedData);
    }
    */
    return updatedData;
}

function getGeneratorsForInfraNodes(deferredObj,dataSource,dsName) {
    var obj = {};
    var kfilts;
    var cfilts;
    if(dsName == 'controlNodeDS') {
        kfilts =  '*:' + UVEModuleIds['CONTROLNODE'] + '*';
        cfilts =  'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'computeNodeDS') {
        kfilts = '*:' + UVEModuleIds['VROUTER_AGENT'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'configNodeDS') {
        kfilts = '*:' + UVEModuleIds['COLLECTOR'] + '*,*:' + UVEModuleIds['OPSERVER'] + '*,*:' + UVEModuleIds['QUERYENGINE'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    } else if(dsName == 'analyticsNodeDS') {
        kfilts = '*:' + UVEModuleIds['APISERVER'] + '*';
        cfilts = 'ModuleClientState:client_info,ModuleServerState:generator_info';
    }

    var postData = getPostData("generator",'','',cfilts,kfilts);
    
    obj['transportCfg'] = { 
            url:TENANT_API_URL,
            type:'POST',
            data:postData
        }
    var genDeferredObj = $.Deferred();
    var genDataView = new ContrailDataView();
    getOutputByPagination(genDataView,
                        {transportCfg:obj['transportCfg'],
                        parseFn:infraMonitorView.parseGeneratorsData,
                        loadedDeferredObj:genDeferredObj});
    genDeferredObj.done(function(genData) {
        deferredObj.resolve(mergeGeneratorAndPrimaryData(genData['dataSource'],dataSource));

    });
}

function updateChartsForSummary(dsData, nodeType) {
    var title,key,chartId,isChartInitialized = false;
    var nodeData = dsData;
    var data = [];
    if(nodeData != null){
        data = updateCharts.setUpdateParams($.extend(true,[],nodeData));
    }
    if(nodeType == 'compute'){
		title = 'vRouters';
		key = 'vRouters';
		chartId = 'vrouters-bubble';
	} else if(nodeType =="control"){
		title = 'Control Nodes';
		key = 'controlNode';
		chartId = 'controlNodes-bubble';
	} else if(nodeType == "analytics"){
		title = 'Analytic Nodes';
		key = 'analyticsNode';
		chartId = 'analyticNodes-bubble';
	} else if(nodeType == "config"){
		title = 'Config Nodes';
		key = 'configNode';
		chartId = 'configNodes-bubble';
	}
    var chartsData = [{title:title,d:[{key:key,values:data}],chartOptions:{xPositive:true,addDomainBuffer:true},link:{hashParams:{p:'mon_bgp',q:{node:'vRouters'}}},widgetBoxId:'recent'}];
    var chartObj = {},nwObj = {};
    if(!summaryChartsInitializationStatus[key]){
        $('#' + chartId).initScatterChart(chartsData[0]);
        summaryChartsInitializationStatus[key] = true;
    }  else {
        chartObj['selector'] = $('#content-container').find('#' + chartId + ' > svg').first()[0];
        chartObj['data'] = [{key:key,values:data}];
        chartObj['type'] = 'infrabubblechart';
        updateCharts.updateView(chartObj);
    }
}


