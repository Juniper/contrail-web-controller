/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
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
                    return {
                        d:[{key:'Projects',values:dashboardData['projectsData']}],xLbl:'Interfaces',yLbl:'Networks',forceX:[0,5],forceY:[0,10],
                        link:{hashParams:{q:{view:'list',type:'project',fqName:fqName,context:'domain',source:'uve'}},
                        conf:{p:'mon_net_projects',merge:false}},
                        tooltipFn:tenantNetworkMonitor.projectTooltipFn,hideLoadingIcon:false
                    }}},
                {deferredObj:renderDeferredObj,title:'Networks',forceX:[0,5],forceY:[0,10],parseFn:function() {
                    return {
                        d:[{key:'Networks',values:dashboardData['networksData']}],xLbl:'Interfaces',yLbl:'Connected Networks',forceX:[0,5],forceY:[0,10],
                        link:{hashParams:{q:{view:'list',type:'network',fqName:fqName,source:'uve',context:'domain'}},
                        conf:{p:'mon_net_networks',merge:false}},
                        tooltipFn:tenantNetworkMonitor.networkTooltipFn,hideLoadingIcon:false
                        }}}
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
                        tooltipFn:tenantNetworkMonitor.projectTooltipFn,hideLoadingIcon:false,loadedDeferredObj:cfg['loadedDeferredObj']
                    }}},
                {deferredObj:renderDeferredObj,title:'Networks',forceX:[0,5],forceY:[0,10],parseFn:function(response) {
                    return {
                        d:[{key:'Networks',values:response['networksData']}],xLbl:'Interfaces',yLbl:'Connected Networks',forceX:[0,5],forceY:[0,10],
                        link:{hashParams:{q:{view:'list',type:'network',fqName:fqName,source:'uve',context:'domain'}},
                        conf:{p:'mon_net_networks',merge:false}},
                        tooltipFn:tenantNetworkMonitor.networkTooltipFn,hideLoadingIcon:false,loadedDeferredObj:cfg['loadedDeferredObj']
                   }}}
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
        var projectChart = $(container).find('div.stack-chart').first().data('chart');
        var networkChart = $(container).find('div.stack-chart').last().data('chart');
        var container = cfg['container'];
        dashboardData['projectsData'] = updateCharts.setUpdateParams(dashboardData['projectsData']);
        dashboardData['networksData'] = updateCharts.setUpdateParams(dashboardData['networksData']);
        var projObj = {},nwObj = {};
        projObj['selector'] = $(container).find('div.stack-chart > svg').first()[0];
        projObj['data'] = [{key:'Projects',values:dashboardData['projectsData']}];
        projObj['type'] = 'bubblechart';
        nwObj['selector'] = $(container).find('div.stack-chart > svg').last()[0];
        nwObj['data'] = [{key:'Networks',values:dashboardData['networksData']}];
        nwObj['type'] = 'bubblechart';
        updateCharts.updateView(projObj);
        updateCharts.updateView(nwObj);
    }
 }

/**
 * Compute Projects summary data based on networks data by grouping together the networks in each project
 */
function getProjectData(vnData,project){
    var vnArr = [],obj = {},projArr = [];projData = {},projCfgData = [],projList =ifNull( project['data'],[]);
    var inBytes = 0;outBytes=0;interVNInBytes=0;interVNOutBytes=0;
    var projNamesArr = [];
    $.each(projList,function(idx,projObj) {
        projNamesArr.push(projObj['fq_name'].join(':'));
    });
    $.each(vnData,function(idx,d) {
        obj = {};
        obj['name'] = d['name'];
        obj['uuid'] = d['uuid'];
        obj['project'] = obj['name'].split(':').slice(0,2).join(':');
        obj['intfCnt'] = ifNull(jsonPath(d,'$..interface_list')[0],[]).length;
        obj['vnCnt'] = ifNull(jsonPath(d,'$..connected_networks')[0],[]).length;
        obj['inThroughput'] = ifNull(jsonPath(d,'$..in_bandwidth_usage')[0],0);
        obj['outThroughput'] = ifNull(jsonPath(d,'$..out_bandwidth_usage')[0],0);
        obj['throughput'] = obj['inThroughput'] + obj['outThroughput'];
        obj['x'] = obj['intfCnt'];
        obj['y'] = obj['vnCnt'];
        obj['size'] = obj['throughput']+1;
        obj['type'] = 'network';
        obj['inBytes']  = ifNull(jsonPath(d,'$..in_bytes')[0],0);
        obj['outBytes'] = ifNull(jsonPath(d,'$..out_bytes')[0],0);
        vnArr.push(obj);
    });
    var vnCF = crossfilter(vnArr);
    var projDimension = vnCF.dimension(function(d) { return d.project;});
    var defProjObj = {
                    intfCnt : 0,
                    vnCnt   : 0,
                    throughput:0,
                    inThroughput:0,
                    outThroughput:0,
                    inBytes:0,
                    outBytes:0
                };
    $.each(vnArr,function(idx,d) {
        inBytes += d['inBytes'];
        outBytes += d['outBytes'];
        if(!(d['project'] in projData)) {
            projData[d['project']] = $.extend({},defProjObj);
        }
        //projData[d['project']]['uuid'] = projList[cfgIdx]['uuid'];
        projData[d['project']]['inBytes'] += d['inBytes'];
        projData[d['project']]['outBytes'] += d['outBytes'];
        projData[d['project']]['inThroughput'] += d['inThroughput'];
        projData[d['project']]['outThroughput'] += d['outThroughput'];
        projData[d['project']]['intfCnt'] += d['intfCnt'];
        projData[d['project']]['throughput'] += d['throughput'];
        projData[d['project']]['vnCnt']++;
    });
    $.each(projNamesArr,function(idx,currProjName) {
        if(projData[currProjName] == null) {
            projData[currProjName] = $.extend({},defProjObj);
        }
    });
    $.each(projData,function(key,obj) {
        var cfgIdx = $.inArray(key,projNamesArr);
        $.extend(obj,{type:'project',id:key,name:key,uuid:projList[cfgIdx]['uuid'],size:obj['throughput']+1,x:obj['intfCnt'],y:obj['vnCnt']});
        projArr.push(obj);
    });
    return {projectsData:projArr,networksData:vnArr,aggData:{inBytes:inBytes,outBytes:outBytes}};
}
function getVirtualNetworksData(deferredObj,dataSource,dsObj) {
    //Check whether networkDatatSource is available and if not populate, else take it
    //options = ifNull(options,{});
    //var objType = ifNull(options['objType'],'');
    var vnCfilts = ['UveVirtualNetworkAgent:interface_list','UveVirtualNetworkAgent:in_bandwidth_usage','UveVirtualNetworkAgent:out_bandwidth_usage',
                'UveVirtualNetworkAgent:in_bytes','UveVirtualNetworkAgent:out_bytes',//'UveVirtualNetworkAgent:in_stats','UveVirtualNetworkAgent:out_stats',
                'UveVirtualNetworkConfig:connected_networks','UveVirtualNetworkAgent:virtualmachine_list'];
    var obj = {};
    $.when($.ajax({
                url:'/api/tenants/projects/default-domain',
                abortOnNavigate:enableHardRefresh == true ? false : true
            }), $.ajax({
                url:'/api/tenants/config/virtual-networks',
                abortOnNavigate:enableHardRefresh == true ? false : true
            })).done(function(projList,vnList) {
                var kfilts = [],projNamesArr = [],projData = [];
                $.each(ifNull(projList[0]['projects'],[]),function(idx,projObj) {
                    kfilts.push(projObj['fq_name'].join(':') + ':*');
                    projData.push(projObj);
                    projNamesArr.push(projObj['fq_name'].join(':'));
                    //globalObj['dataSources']['projectData'] = projData;
                    if(globalObj['dataSources']['projectDS'] != null)
                        globalObj['dataSources']['projectDS']['data'] = projData;
                    else
                        globalObj['dataSources']['projectDS'] = {data:projData};
                });
                obj['transportCfg'] = { 
                        url:'/api/tenant/networking/virtual-networks/details?count='+NETWORKS_PAGINATION_CNT,
                        type:'POST',
                        data:{data:[{"type":"virtual-network", "cfilt":vnCfilts.join(',')}]}
                    }
                getOutputByPagination(dataSource,{transportCfg:obj['transportCfg'],
                    parseFn:function(response){return networkParseFnForPagination(response,vnList,projData);},loadedDeferredObj:deferredObj},dsObj);
            }).fail(function(errObj,status,errorText) {
                deferredObj.reject({errObj:errObj,status:status,errTxt:errorText});
            });
}

/**
 * Filters the following Networks from the list received from opserver
 * 1. Networks not present in API Server
 * 2. Filter service networks
 */
function networkParseFnForPagination(uveData,configVNList,projData) {
    var configVNs = [],filteredVNs=[],uveVNs = [],configData = [];
    //uveData = uveData[0];
    configVNList = configVNList[0];
    var excludeVNs = ['svc-vn-left','svc-vn-right','svc-vn-mgmt'];
    $.each(configVNList['virtual-networks'],function(idx,obj) {
        configVNs.push(obj['fq_name'].join(':'));
        configData.push(obj);
    });
    if(uveData['value'] != null)
    filteredVNs = $.map(uveData['value'],function(obj,idx) {
        if($.inArray(obj['name'].split(':')[2],excludeVNs) > -1)
            return null;
        //If it's present in Api Server
        var cfgIdx = $.inArray(obj['name'],configVNs);
        if(cfgIdx > -1) {
            obj['uuid'] = configData[cfgIdx]['uuid'];
            uveVNs.push(obj['name']);
            return obj;
        } else
            return null;
    });
    /*$.each(configVNs,function(idx,vnName) {
        if($.inArray(vnName,uveVNs) == -1 && $.inArray(vnName.split(':')[2],excludeVNs) == -1 && vnName != 'default-domain:default-project:ip-fabric') {
            var vnObj = {name:vnName,value:{},uuid:configData[idx]['uuid']};
            filteredVNs.push(vnObj);
        }
    });*/
    return chartsParseFn({objectType:'network',source:'uve'},filteredVNs);
}

