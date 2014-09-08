/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

//@@ sourceURL=tenant_monitor_network.js

/**
 * Network Summary page
 */
var networkSummaryView = new networkSummaryRenderer();
function networkSummaryRenderer() {
    this.load = function(cfg) {
        var obj = $.extend({}, cfg);
        obj['vnName'] = obj['fqName'].split(':').pop();
        var data = {stats:{},charts:{},grids:{}};
        var context = 'network';
        //Need to get UUID if not passed
        if(ifNull(obj['uuid'],'') == '') {
            obj['uuid'] = getUUIDByName(obj['fqName']);
        } 
        layoutHandler.setURLHashParams({fqName:obj['fqName']},{p:'mon_net_networks',merge:false,triggerHashChange:false});
        constructNetworkBreadcrumbDropdown(obj['fqName']);
        template = 'visualization-template';
        data['grids'] = [{},{}];
        var detailURL = constructReqURL($.extend({},obj,{type:'details'}));

        //Time-series chart
        data['ts-chart'] = {};
        data['ts-chart'] = {
           'url' : constructReqURL($.extend({},obj,{widget:'flowseries'})),
           height: 250
        };

        //For Network Topology
        data['topology']={renderFn:function(){
                drawNetworkTopology(obj['fqName']);
            }
        }
        //data['charts'] = {};
        data['charts']['chartType'] = 'bubble';
        var portDeferredObj = $.Deferred();
        var uveDeferredObj = $.Deferred();
        //If useServerTime flag is true then the webserver timeStamps will be send in startTime and endTime to query engine
        var portDistributionURL = constructReqURL($.extend({},obj,{type:'port',useServerTime: true}));
        var portDistributionParams = $.deparamURLArgs(portDistributionURL);
        data['charts']['colCount'] = 1;
        data['charts']['d'] = [
            {deferredObj:portDeferredObj,title:'Port Distribution',parseFn:function(response) {
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
                        xPositive:true,
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
        $('#topology-visualization-tabs').html(contrail.getTemplate4Id('network-tab-template'));
        $(container).initTemplates(data);
        var instanceTabLoaded = 0;
        var tabsLoaded = {'Traffic Statistics':0, 'Port Distribution':0, 'Port Map':0, 'Instances':0, 'Details':0};
        $('#network-tabs').contrailTabs({
            activate: function(e, ui) {
                //var selTab = $(ui.newTab).text();
                var selTab = $(ui.newTab.context).text();
                if (selTab == 'Port Distribution') {
                    if (tabsLoaded[selTab] == 0) {
                    	$('#network-tabs').data('contrailTabs').startLoading('#network-port-dist-tab-link')
                        $.ajax({
                            url: portDistributionURL,
                            timeout: FLOW_QUERY_TIMEOUT
                        }).done(function(result) {
                            if (!jQuery.isEmptyObject(result)) {
                                portDeferredObj.resolve(result);
                            }
                        }).always(function(result) {
                        	$('#network-tabs').data('contrailTabs').endLoading('#network-port-dist-tab-link')
                        });
                    } else {
                        $('#networks-summary-charts').find('svg').trigger('refresh');
                    }
                } else if (selTab == 'Instances') {
                    $('#networkInstances .contrail-grid').data('contrailGrid').refreshView(); 
                    $('#networkInstances .contrail-grid').data('loadedDeferredObj').resolve();
                } else if ($.inArray(selTab, ['Details', 'Port Map']) > -1) {
                	$('#network-tabs').data('contrailTabs').startLoading('#network-port-map-tab-link');
                	if (tabsLoaded['Details'] == 0 && tabsLoaded['Port Map'] == 0) {
                        $.ajax({
                            url: '/api/tenant/networking/virtual-network/summary?fqNameRegExp=' + obj['fqName']
                        }).done(function(result) {
                            $("#uve-information").html(syntaxHighlight(result));
                            uveDeferredObj.resolve(result);
                        });
                        tabsLoaded['Details'] = 1;
                        tabsLoaded['Port Map'] = 1;
                    }
                	$('#network-tabs').data('contrailTabs').endLoading('#network-port-map-tab-link');
                } else if (selTab == 'Traffic Statistics' && tabsLoaded[selTab] == 1) {
                	$('#ts-vn-chart').find('svg').trigger('refresh');
                }
                if (tabsLoaded[selTab] == 0) {
                    tabsLoaded[selTab] = 1;
                }
                var topo_divId = escape(obj['fqName']).replace(/%/g, '_').replace(/\*/g, '-').replace(/@/g, ':').replace(/\+/g, '.');
                if ($('#network-tabs').find('#topology').is(":visible") && $('#network-tabs').find('#topology').length > 0 && $("#" + topo_divId).data('topology')!= null){
                    $("#" + topo_divId).html('');
                    topologyView.renderTopology($("#" + topo_divId).data('topology'));
                }
            }
        });
        //Init Port Distribution map charts
        initPortMapCharts(uveDeferredObj);
        objListView.load({view:'list',type:'instance',uuid:obj['uuid'],fqName:obj['fqName'],context:'network',selector:'#networkInstances'});
    }
}

/*
 * Initializes the 4 port map charts shown in Port Map Tab
 */
function initPortMapCharts(uveDeferredObj) {
    $('#srcUdpPortMap').html('');
    $('#dstUdpPortMap').html('');
    $('#srcTcpPortMap').html('');
    $('#dstTcpPortMap').html('');
    initDeferred({deferredObj:uveDeferredObj,renderFn:'initHeatMap',selector:$('#srcUdpPortMap'),parseFn:function(response) {
            return tenantNetworkMonitorUtils.parsePortMap({res:jsonPath(response,'$..udp_sport_bitmap')[0],type:'src',pType:'udp'});
        }
    });
    initDeferred({deferredObj:uveDeferredObj,renderFn:'initHeatMap',selector:$('#dstUdpPortMap'),parseFn:function(response) {
            return tenantNetworkMonitorUtils.parsePortMap({res:jsonPath(response,'$..udp_dport_bitmap')[0],type:'dst',pType:'udp'});
        }
    });
    initDeferred({deferredObj:uveDeferredObj,renderFn:'initHeatMap',selector:$('#srcTcpPortMap'),parseFn:function(response) {
            return tenantNetworkMonitorUtils.parsePortMap({res:jsonPath(response,'$..tcp_sport_bitmap')[0],type:'src',pType:'tcp'});
        }
    });
    initDeferred({deferredObj:uveDeferredObj,renderFn:'initHeatMap',selector:$('#dstTcpPortMap'),parseFn:function(response) {
            return tenantNetworkMonitorUtils.parsePortMap({res:jsonPath(response,'$..tcp_dport_bitmap')[0],type:'dst',pType:'tcp'});
        }
    });
}

//Center Region
function contentView() {
    this.destroy = function() {
        $(pageContainer).html('');
    }
}

contView = new contentView();

//@@ sourceURL=tenant_monitor_network.js

function initializeRefreshBtn() {
    $(pageContainer).siblings().filter('.refresh-btn').on('click',function() {
        monitorRefresh($(pageContainer));
    });
}

function autoRefresh() {
    //Once the view is loaded,call autoRefresh and cancel on switching to a different view
    //Start the timer only after all the ajax calls are done..Need to poll for this
    //Some-times only one ajax call is issued if datasource is shared,but good thing that parseFn is called twice
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function getProtocolName(protNo) {
    var protMAP = {'17':'UDP','6':'TCP','2':'IGMP','1':'ICMP'}
    if(protNo in protMAP)
        return protMAP[protNo];
    else
        return protNo;
}

function drawNetworkTopology(fqName) {
    var config= {
    	url: '/api/tenant/monitoring/network-topology?fqName=' + fqName, 
    	selectorId: '#topology', 
    	fqName: fqName,
    	focusedElement: 'VirtualNetwork'
    };
    drawVisualization(config);
};
