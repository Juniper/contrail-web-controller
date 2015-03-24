/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Project Summary page
 */

var projSummaryView = new projSummaryRenderer();

function projSummaryRenderer() {
    this.load = function(cfg) {
        var obj = $.extend({},cfg);
        var data = {stats:{},charts:{},grids:{}};
        var context = 'project';
        //Need to get UUID if not passed
        if(ifNull(obj['uuid'],'') == '') {
            obj['uuid'] = getUUIDByName(obj['fqName']);
        } 
        layoutHandler.setURLHashParams({fqName:obj['fqName']},{p:'mon_net_projects',merge:false,triggerHashChange:false});
        constructProjectBreadcrumbDropdown(cfg['fqName']);
        template = 'visualization-template';
        obj['title'] = contrail.format('Traffic Statistics for Project ({0})',obj['fqName'].split(':').pop());
        data['stats']['url'] = constructReqURL($.extend({},obj,{type:'summary'}));
        //For Project Topology
        data['topology']={renderFn:function() {
                //topologyView.drawTopology(obj['fqName']);
                var config= {
            		url: '/api/tenant/monitoring/project-topology?fqName=' + obj['fqName'], 
            		selectorId: '#topology', 
            		fqName: obj['fqName'],
            		focusedElement: 'Project'
            	};
                drawVisualization(config);
            }
        }

        var deferredObj = $.Deferred();
        //If useServerTime flag is true then the webserver timeStamps will be send in startTime and endTime to query engine
        var portDistributionURL = constructReqURL($.extend({},obj,{type:'port',useServerTime: true}));
        var portDistributionParams = $.deparamURLArgs(portDistributionURL);
        $.ajax({
            url:portDistributionURL,
            timeout:FLOW_QUERY_TIMEOUT
        }).done(function(result) {
            if(!jQuery.isEmptyObject(result)){
                deferredObj.resolve(result);
            }
        }).always(function(result) {
        	$('#project-tabs').data('contrailTabs').endLoading('#project-port-dist-tab-link');
        });
        data['charts']['id'] = 'project';
        data['charts']['chartType'] = 'bubble';
        data['charts']['colCount'] = 1;
        data['charts']['d'] = [
            {deferredObj:deferredObj,title:'Port Distribution',parseFn:function(response) {
                var retObj = {d:[{key:'Source Port',values:tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['sport'],[]),{startTime:response['startTime'],
                    endTime:response['endTime'],bandwidthField:'outBytes',flowCntField:'outFlowCount',portField:'sport'})},
                       {key:'Destination Port',values:tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['dport'],[]),{startTime:response['startTime'],
                           endTime:response['endTime'],bandwidthField:'inBytes',flowCntField:'inFlowCount',portField:'dport'})}],
                    fqName:obj['fqName'],link:{hashParams:{q:{view:'list',type:'project',fqName:obj['fqName'],context:'domain'}}},
                    chartOptions:{
                        tooltipFn:tenantNetworkMonitor.portTooltipFn,
                        xLbl:'Port',
                        yLbl:'Bandwidth',
                        forceX:[0,1000],
                        xLblFormat:d3.format(''),
                        yDataType:'bytes'
                    },
                        title:'Port Distribution',
                    }
                return retObj;
                }
            }];

        //Render the template
        var summaryTemplate = contrail.getTemplate4Id(template);
        var container = cfg['container'];
        $(container).html(summaryTemplate(obj));
        var tabsLoaded = {'Port Distribution':0, 'Instances':0, 'Networks': 0};
        $('#topology-visualization-tabs').html(contrail.getTemplate4Id('project-tab-template'));
        $(container).initTemplates(data);
        var projectTabs = $('#project-tabs').contrailTabs({
            activate: function(e, ui) {    
                var selTab = $(ui.newTab.context).text();
                if(selTab == 'Port Distribution') {
                	$('#projects-port-distribution-charts').find('svg').trigger('refresh');
                } 
                else if(selTab == 'Networks' && tabsLoaded[selTab] == 0) {
                    $('#projNetworks').find('.contrail-grid').data('contrailGrid').refreshView();
                    //Issue the request only for the first time when Instances tab is selected
                    $('#projNetworks').find('.contrail-grid').data('loadedDeferredObj').resolve();
                }
                else if(selTab == 'Instances' && tabsLoaded[selTab] == 0) {
                    $('#projInstances').find('.contrail-grid').data('contrailGrid').refreshView();
                    //Issue the request only for the first time when Instances tab is selected
                    $('#projInstances').find('.contrail-grid').data('loadedDeferredObj').resolve();
                }
                if(tabsLoaded[selTab] == 0) {
                    tabsLoaded[selTab] = 1;
                }
            }
        }).data('contrailTabs');
        projectTabs.startLoading('#project-port-dist-tab-link');
        objListView.load({view:'list',type:'instance',uuid:obj['uuid'],fqName:obj['fqName'],context:'project',selector:'#projInstances'});
        objListView.load({view:'list',type:'network',uuid:obj['uuid'],fqn:obj['fqName'],context:'project',selector:'#projNetworks'});
    };
}
