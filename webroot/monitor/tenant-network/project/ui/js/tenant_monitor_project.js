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
        pushBreadcrumb([cfg['fqName']]);
        template = 'project-template';
        obj['title'] = contrail.format('Traffic Statistics for Project ({0})',obj['fqName'].split(':').pop());
        //obj['topologyTitle'] = contrail.format('Topology for Project ({0})',obj['fqName'].split(':').pop());
        obj['topologyTitle'] = contrail.format('Connectivity Details');
        data['stats']['url'] = constructReqURL($.extend({},obj,{type:'summary'}));
        //For Project Topology
        data['topology']={renderFn:function(){
            topologyView.drawTopology(obj['fqName']);
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
            endWidgetLoading('charts');
        });
        data['charts']['id'] = 'project';
        data['charts']['chartType'] = 'bubble';
        data['charts']['colCount'] = 1;
        data['charts']['d'] = [
            {deferredObj:deferredObj,title:'Port Distribution',parseFn:function(response) {
                var retObj = {d:[{key:'Source Port',values:tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['sport'],[]),{startTime:response['startTime'],
                    endTime:response['endTime'],bandwidthField:'outBytes',flowCntField:'outFlowCount',portField:'sport'})},
                       {key:'Destination Port',values:tenantNetworkMonitorUtils.parsePortDistribution(ifNull(response['dport'],[]),{startTime:response['startTime'],
                           endTime:response['endTime'],bandwidthField:'inBytes',flowCntField:'inFlowCount',portField:'dport'})}],fqName:obj['fqName'],
                    link:{hashParams:{q:{view:'list',type:'project',fqName:obj['fqName'],context:'domain'}}},
                    chartOptions:{tooltipFn:tenantNetworkMonitor.portTooltipFn,forceX:[0,1000],xLblFormat:d3.format(''),yDataType:'bytes',xLbl:'Port',yLbl:'Bandwidth'},
                    title:'Port Distribution'}
                return retObj;
                }
            }];

        //Render the template
        var summaryTemplate = contrail.getTemplate4Id(template);
        var container = cfg['container'];
        $(container).html(summaryTemplate(obj));
        $(container).initTemplates(data);
        var tabsLoaded = {'Summary':0, 'Instances':0};
        startWidgetLoading('charts');
        $('#project-tabs').contrailTabs({
            activate: function(e, ui) {    
                var topoDivId = escape(obj['fqName']).replace(/%/g,'_').replace(/\*/g,'-').replace(/@/g,':').replace(/\+/g,'.');
                if($('#project-tabs').find('#topology').is(":visible") && $('#project-tabs').find('#topology').length>0 && $("#" + topoDivId).data('topology')!=undefined){
                    $("#" + topoDivId).html('');
                    topologyView.renderTopology($("#" + topoDivId).data('topology'));
                }
                var selTab = $(ui.newTab.context).text();
                if(selTab == 'Summary' && tabsLoaded[selTab] == 1) {
                    $('#projects-summary-charts').find('svg').trigger('refresh');
                } else if(selTab == 'Instances' && tabsLoaded[selTab] == 0) {
                    $('.contrail-grid').data('contrailGrid').refreshView();
                    //Issue the request only for the first time when Instances tab is selected
                    $('.contrail-grid').data('loadedDeferredObj').resolve();
                }
                if(tabsLoaded[selTab] == 0) {
                    tabsLoaded[selTab] = 1;
                }
            }
        });
        objListView.load({view:'list',type:'instance',uuid:obj['uuid'],fqName:obj['fqName'],context:'project',selector:'#projInstances'});
    }
}
