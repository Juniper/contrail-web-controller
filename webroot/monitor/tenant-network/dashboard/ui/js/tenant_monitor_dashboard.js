/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Domain Summary Page
 */

var domainSummaryView = new domainSummaryRenderer();

function domainSummaryRenderer() {
    var DomainStatsViewModel = function() {
        this.inBytes = ko.observable('-'),
        this.outBytes = ko.observable('-')
    };

    var domainStatsViewModel = new DomainStatsViewModel();

    this.load = function(cfg) {
        layoutHandler.setURLHashParams({fqName:cfg['fqName']},{merge:false,triggerHashChange:false});
        var renderDeferredObj = $.Deferred();
        var networkDS = new SingleDataSource('networkDS');
        var result = networkDS.getDataSourceObj();
        var dashboardData,callUpdateDashboard = false;
        cfg['loadedDeferredObj'] = result['deferredObj'];
        if(result['lastUpdated'] != null) {
            dashboardData = getProjectData(result['dataSource'].getItems(),globalObj['dataSources']['projectDS']);
            domainSummaryView.renderNetworkMonitoringDashboard(renderDeferredObj,cfg,dashboardData);
        } else {
            domainSummaryView.renderNetworkMonitoringDashboard(renderDeferredObj,cfg,dashboardData);
        }
        $(networkDS).on("change",function(){
            var dashboardData = getProjectData(result['dataSource'].getItems(),globalObj['dataSources']['projectDS']);
            if(callUpdateDashboard == false) {
                renderDeferredObj.resolve(dashboardData);
                callUpdateDashboard = true;
            } else {
               domainSummaryView.updateNetworkMonitoringDashboard(dashboardData,cfg);
            }
        });
    }

    /**
     * Initialize UI widgets, called once after getting the first set of records
     */
    this.renderNetworkMonitoringDashboard = function(renderDeferredObj,cfg,dashboardData) {
        var obj = {};
        var data = {stats:{},charts:{},grids:{}};
        var template = 'summary-template', fqName = cfg['fqName'];
        var container = cfg['container'];
        obj['title'] = contrail.format('Traffic Statistics for Domain ({0})',fqName);
        obj['widgetBoxId'] = 'traffic-stats';
        data['stats']['list'] = [
            { lbl : 'Total Traffic In',field:'inBytes'},
            { lbl : 'Total Traffic Out',field:'outBytes'}
        ];
        data['charts']['chartType'] = 'bubble';
        data['charts']['colCount'] = 2;
        data['charts']['id'] = 'domain';
        data['stats']['viewModel'] = domainStatsViewModel;
        if(dashboardData != null){
            domainStatsViewModel.inBytes(formatBytes(dashboardData['aggData']['inBytes']));
            domainStatsViewModel.outBytes(formatBytes(dashboardData['aggData']['outBytes']));
            data['charts']['d'] = [
                {deferredObj:renderDeferredObj,title:'Projects',parseFn:function() {
                    return getChartSettings(dashboardData['projectsData'],'project',cfg);
                    }},
                {deferredObj:renderDeferredObj,title:'Networks',parseFn:function() {
                    return getChartSettings(dashboardData['networksData'],'network',cfg);
                    }}
                 ];
        } else {
            renderDeferredObj.done(function(data) {
                var aggData = data['aggData'];
                domainStatsViewModel.inBytes(formatBytes(aggData['inBytes']));
                domainStatsViewModel.outBytes(formatBytes(aggData['outBytes']));
            });
            data['charts']['d'] = [
                {deferredObj:renderDeferredObj,title:'Projects',parseFn:function(response) {
                    return getChartSettings(response['projectsData'],'project',cfg);
                    }},
                {deferredObj:renderDeferredObj,title:'Networks',parseFn:function(response) {
                    return getChartSettings(response['networksData'],'network',cfg);
                    }}
                ];
        }
        var summaryTemplate = contrail.getTemplate4Id(template);
        $(container).html(summaryTemplate(obj));
        startWidgetLoading(obj['widgetBoxId']);
        $(container).initTemplates(data);
        cfg['loadedDeferredObj'].always(function(){
            endWidgetLoading(obj['widgetBoxId']);
            $('.icon-spinner').hide();
        });
        cfg['loadedDeferredObj'].fail(function(errObj){
            renderDeferredObj.reject(errObj);
        });
    }

    /*
     * Update UI widgets,called whenever new set of records are fetched
     */
    this.updateNetworkMonitoringDashboard = function(dashboardData,cfg) {
        domainStatsViewModel.inBytes(formatBytes(dashboardData['aggData']['inBytes']));
        domainStatsViewModel.outBytes(formatBytes(dashboardData['aggData']['outBytes']));
        var container = cfg['container'];
        $($(container).find('div.stack-chart').first()).initScatterChart(getChartSettings(dashboardData['projectsData'],'project',cfg));
        $($(container).find('div.stack-chart').last()).initScatterChart(getChartSettings(dashboardData['networksData'],'network',cfg))
    }
    
    function getChartSettings(data,type,cfg){
        var key,p,yLbl,tooltipFn;
        if (type == 'network') {
            key = 'Networks';
            p = 'mon_net_networks';
            yLbl = 'Connected Networks';
            tooltipFn = tenantNetworkMonitor.networkTooltipFn; 
        } else if(type == 'project') {
            key = 'Projects';
            p = 'mon_net_projects';
            yLbl = 'Networks';
            tooltipFn = tenantNetworkMonitor.projectTooltipFn; 
        }
        return {d:[{key:key,values:data}],hideLoadingIcon:false,loadedDeferredObj:cfg['loadedDeferredObj'],
        link:{hashParams:{q:{view:'list',type:type,fqName:cfg['fqName'],source:'uve',context:'domain'}},
        conf:{p:p,merge:false}},chartOptions:{tooltipFn:tooltipFn,xLbl:'Interfaces',yLbl:yLbl,forceX:[0,5],forceY:[0,10]}};
    }
 }

