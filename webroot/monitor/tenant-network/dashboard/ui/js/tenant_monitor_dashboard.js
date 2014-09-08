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
        $(networkDS).on("startLoading",function(){
            $('#traffic-stats-loading').show();
            $('#domain_0').parent().parent().siblings('div.widget-header').find('.icon-spinner').show();
            $('#domain_1').parent().parent().siblings('div.widget-header').find('.icon-spinner').show();
        });
        $(networkDS).on("endLoading",function(){
            $('#traffic-stats-loading').hide();
            $('#domain_0').parent().parent().siblings('div.widget-header').find('.icon-spinner').hide();
            $('#domain_1').parent().parent().siblings('div.widget-header').find('.icon-spinner').hide();
        });
        var dashboardData,callUpdateDashboard = false;
        cfg['loadedDeferredObj'] = result['deferredObj'];
        //Info: Create a renderDeferredObj (which will be resolved on getting first set of results) and pass it to initTemplates, 
        if(result['lastUpdated'] != null) {
            dashboardData = getProjectData(result['dataSource'].getItems(),globalObj['dataSources']['projectDS']);
            domainSummaryView.renderNetworkMonitoringDashboard(renderDeferredObj,cfg,dashboardData);
        } else {
            domainSummaryView.renderNetworkMonitoringDashboard(renderDeferredObj,cfg,dashboardData);
        }
        //result['dataSource'].unbind("change");
        $(networkDS).on("change",function(){
            var dashboardData = getProjectData(result['dataSource'].getItems(),globalObj['dataSources']['projectDS']);
            if(callUpdateDashboard == false) {
                //Info: Need to resolve renderDeferredObj
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
            { lbl : 'Total Traffic In (Last 1 hr)',field:'inBytes'},
            { lbl : 'Total Traffic Out (Last 1 hr)',field:'outBytes'}
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
                    return {
                        d:[{key:'Projects',values:dashboardData['projectsData']}],
                        link:{hashParams:{q:{view:'list',type:'project',fqName:fqName,context:'domain',source:'uve'}},
                        conf:{p:'mon_net_projects',merge:false}},
                        chartOptions:{
                            tooltipFn:tenantNetworkMonitor.projectTooltipFn,
                            xLbl:'Interfaces',
                            yLbl:'Networks',
                            forceX:[0,5],
                            forceY:[0,10]
                        },
                        hideLoadingIcon:false
                    }}},
                {deferredObj:renderDeferredObj,title:'Networks',parseFn:function() {
                    return {
                        d:[{key:'Networks',values:dashboardData['networksData']}],
                        link:{hashParams:{q:{view:'list',type:'network',fqName:fqName,source:'uve',context:'domain'}},
                        conf:{p:'mon_net_networks',merge:false}},
                        chartOptions:{
                            tooltipFn:tenantNetworkMonitor.networkTooltipFn,
                            xLbl:'Interfaces',
                            yLbl:'Connected Networks',
                            forceX:[0,5],
                            forceY:[0,10],
                        },
                        hideLoadingIcon:false
                        }
                    }
                 }
           ];
        } else {
            renderDeferredObj.done(function(data) {
                var aggData = data['aggData'];
                domainStatsViewModel.inBytes(formatBytes(aggData['inBytes']));
                domainStatsViewModel.outBytes(formatBytes(aggData['outBytes']));
            });
            data['charts']['d'] = [
                {deferredObj:renderDeferredObj,title:'Projects',parseFn:function(response) {
                    return {
                        d:[{key:'Projects',values:response['projectsData']}],xLbl:'Interfaces',yLbl:'Networks',forceX:[0,5],forceY:[0,10],
                        link:{hashParams:{q:{view:'list',type:'project',fqName:fqName,context:'domain',source:'uve'}},
                        conf:{p:'mon_net_projects',merge:false}},
                        chartOptions:{tooltipFn:tenantNetworkMonitor.projectTooltipFn},hideLoadingIcon:false,loadedDeferredObj:cfg['loadedDeferredObj']
                    }}},
                {deferredObj:renderDeferredObj,title:'Networks',forceX:[0,5],forceY:[0,10],parseFn:function(response) {
                    return {
                        d:[{key:'Networks',values:response['networksData']}],xLbl:'Interfaces',yLbl:'Connected Networks',forceX:[0,5],forceY:[0,10],
                        link:{hashParams:{q:{view:'list',type:'network',fqName:fqName,source:'uve',context:'domain'}},
                        conf:{p:'mon_net_networks',merge:false}},
                        chartOptions:{tooltipFn:tenantNetworkMonitor.networkTooltipFn},hideLoadingIcon:false,loadedDeferredObj:cfg['loadedDeferredObj']
                   }}}
                ];
        }
        var summaryTemplate = contrail.getTemplate4Id(template);
        $(container).html(summaryTemplate(obj));
        startWidgetLoading(obj['widgetBoxId']);
        $(container).initTemplates(data);
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
        var projectChart = $(container).find('#domain_0').first().data('chart');
        var networkChart = $(container).find('#domain_1').last().data('chart');
        dashboardData['projectsData'] = updateCharts.setUpdateParams(dashboardData['projectsData']);
        dashboardData['networksData'] = updateCharts.setUpdateParams(dashboardData['networksData']);
        var projObj = {},nwObj = {};
        projObj['selector'] = $(container).find('#domain_0 > svg').first()[0];
        projObj['data'] = [{key:'Projects',values:dashboardData['projectsData']}];
        projObj['type'] = 'bubblechart';
        nwObj['selector'] = $(container).find('#domain_1 > svg').last()[0];
        nwObj['data'] = [{key:'Networks',values:dashboardData['networksData']}];
        nwObj['type'] = 'bubblechart';
        updateCharts.updateView(projObj);
        updateCharts.updateView(nwObj);
    }
 }

