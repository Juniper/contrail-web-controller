/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 *
 * Instance Summary Page
 */

var instSummaryView = new instSummaryRenderer();

function instSummaryRenderer() {
    var InstanceViewModel = function() {
        this.network = ko.observable('');
        this.vRouter = ko.observable('');
        this.trafficInBytes = ko.observable('-');
        this.trafficOutBytes = ko.observable('-');
        this.totalTrafficBytes = ko.observable('-');
        this.interfaceTrafficBytes = ko.observable('-');
    };

    var instViewModel = new InstanceViewModel(),
        intfList = [], intfStatList = [];

    this.load = function(cfg) {
        hideHardRefresh();
        var obj = $.extend({},cfg);
        var data = {stats:{},charts:{},grids:{}};
        layoutHandler.setURLHashParams({vmName:obj['vmName'],fqName:obj['fqName'],srcVN:obj['srcVN']},{p:'mon_net_instances',merge:false,triggerHashChange:false});
        pushBreadcrumb([obj['vmName']]);
        template = 'inst-template';
        obj['title'] = contrail.format("Traffic Statistics",obj['fqName'],obj['srcVN'].split(':').pop());
        data['stats'] = [{},{}];
        data['stats'][0] = {
                'list' : [
                    { lbl : 'Total Traffic (In/Out)',field:'totalTrafficBytes' },
                    { lbl : 'Interface Traffic (In/Out)',field:'interfaceTrafficBytes'}
                ],
                viewModel:instViewModel
            }
        data['stats'][1] = {
            'list' : [
                { lbl : 'Network',field:'network' },
                { lbl : 'vRouter',field:'vRouter'}
            ],
            viewModel:instViewModel
        }
        data['ts-chart'] = {};
        data['ts-chart']['url'] = function() {
            return instSummaryView.getInstanceURL($.extend({},obj,{context:'instance',widget:'flowseries'}));
        };
        data['charts']['colCount'] = 3;
        data['charts']['id'] = 'instance';
        data['charts']['d'] = [{
                title:'Top Ports' ,
                link:{view:'list',type:'port',fqName:obj['fqName'],srcVN:obj['srcVN'],context:'instance'},
                class:tenantNetworkMonitorView,
                url:function() {
                    return instSummaryView.getInstanceURL($.extend({},obj,{context:'instance',type:'port'}));
                },
                objectType:'port'
            },{
                title:'Top Peers',
                link:{view:'list',type:'peer',fqName:obj['fqName'],srcVN:obj['srcVN'],context:'instance'},
                url: function() {
                    return instSummaryView.getInstanceURL($.extend({},obj,{context:'instance',type:'peer'}));
                },
                objectType:'peer'
            },{
                title :'Top Flows',
                link :{view:'list',type:'flow',fqName:obj['fqName'],srcVN:obj['srcVN'],context:'instance'},
                url: function() {
                    return instSummaryView.getInstanceURL($.extend({},obj,{context:'instance',type:'flow'}));
                },
                objectType:'flow'
            }];
        $.ajax({
            url:'/api/tenant/networking/virtual-machine/summary?fqNameRegExp=' + obj['fqName'] + '*'
        }).done(function(result) {
            $("#uve-information").html(syntaxHighlight(result))
            instDeferredObj.done(function(response) {
                var statData = [{ lbl : 'Network',field:'network'},
                                { lbl : 'vRouter',field:'vRouter'}];
                var instanceData = {};
                if(result != null)
                    result['value'] = ifNull(result['value'],[]);
                    if(result['value'].length > 0)
                        instanceData = result['value'][0]['value'];
                var vRouter = getValueByJsonPath(instanceData,'UveVirtualMachineAgent;vrouter','-');
                intfList = getValueByJsonPath(instanceData,'UveVirtualMachineAgent;interface_list',[]);
                intfStatList = getValueByJsonPath(instanceData,'UveVirtualMachineAgent;if_stats_list',[]);
                instViewModel.vRouter(vRouter);
                instViewModel.network(obj['srcVN'])
                var inBytes = 0 ,outBytes = 0 ,totalInBytes = 0 ,totalOutBytes = 0;
                $.each(getValueByJsonPath(instanceData,'UveVirtualMachineAgent;if_stats_list',[]), function (idx, value) {
                    if($.isNumeric(value['in_bytes'])) 
                        totalInBytes += value['in_bytes'];
                    if($.isNumeric(value['out_bytes'])) 
                        totalOutBytes += value['out_bytes'];
                });
                var selItem = getSelInstanceFromDropDown();
                var selIntfName = '';
                var stats = instSummaryView.getStatsOfInterface(selItem['ip']);
                inBytes = ifNull(stats['inBytes'],'-'),outBytes = ifNull(stats['outBytes'],'-');
                instViewModel.totalTrafficBytes(formatBytes(totalInBytes)+"/"+formatBytes(totalOutBytes));
                instViewModel.interfaceTrafficBytes(formatBytes(inBytes)+"/"+formatBytes(outBytes));
                var dataSource = $('.summary-stats').data('dataSource');
                var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
                $('#inst-stats').html(dashboardTemplate({noTitle:true,colCount:2,d:statData}));
            });
        });

        //Render the template
        var summaryTemplate = contrail.getTemplate4Id(template);
        var container = cfg['container'];
        $(container).html(summaryTemplate(obj));
        var instDeferredObj = $.Deferred();
        var dropdownIP = $(container).find('.z-dropdown').contrailDropdown({
            dataTextField:"name",
            dataValueField: "name",
            dataSource:{
                type: 'remote',
                url:'/api/tenant/networking/vm/ip-list?vmName=' + obj['fqName'],
                parse: function(response){
                    return instSummaryView.parseIpListofInstance(response,instDeferredObj,data,obj);
                }
            },
            change: instSummaryView.onInstanceIntfChange
        });
        
        var tabsLoaded = {'Summary':0, 'Details':0};
        $('#instance-tabs').contrailTabs({
            activate: function(e,ui) {
                //var selTab = $(e.item).text();
                var selTab = $(ui.newTab.context).text();
                if(selTab == 'Summary' && tabsLoaded[selTab] == 1) {
                    $('#ts-instance-chart').find('svg').trigger('refresh');
                }
                if(tabsLoaded[selTab] == 0) {
                    tabsLoaded[selTab] = 1;
                }
            }
        });
    }
    
    this.parseIpListofInstance = function(response,instDeferredObj,data,obj){
        if(response['ipList'].length > 0) {
            setTimeout(function() {
                $(pageContainer).initTemplates(data);
                instSummaryView.onInstanceIntfChange(null,false,obj);
                instDeferredObj.resolve();
                },200);
        } else {
            $('.ts-chart').html("<div class='no-data'><div class='no-data-text'>Error in fetching Instance IP List</div></div>");
            $('.z-dropdown').hide();
            $('.flow-series.sub-title').hide();
        }
        response['ipList'] = $.map(response['ipList'],function(obj,idx) {
            obj['name'] = contrail.format('{0} ({1})',obj['ip_address'],obj['virtual_network']);
            return obj;
        });
        response['fipList'] = $.map(response['fipList'],function(obj,idx) {
            obj['name'] = contrail.format('{0} ({1})',obj['ip_address'],obj['virtual_network']);
            return obj;
        });
        return response['ipList'].concat(response['fipList']);
    }
    
    this.onInstanceIntfChange = function(e,refresh,obj) {
        var refresh = ifNull(refresh,true);
        var ip = getSelInstanceFromDropDown()['ip'];
        var network = getSelInstanceFromDropDown()['vnName'];
        var stats = instSummaryView.getStatsOfInterface(ip);
        instViewModel.network(network);
        instViewModel.interfaceTrafficBytes(formatBytes(ifNull(stats['inBytes'],'-'))+"/"+formatBytes(ifNull(stats['outBytes'],'-')));
        $('.example-title.main').html(function(idx,oldHtml) {
            var str = $.trim(oldHtml);
            return str.replace(/(.* -) ([^ ]*) (\(.*\))/,'$1 ' + ip + ' $3');
        });
        if(refresh == true) {
            //monitorRefresh();
            var refreshObj = {};
            refreshObj['url'] = instSummaryView.getInstanceURL($.extend({},obj,{context:'instance',widget:'flowseries'}));
            refreshObj['type'] = 'timeseriescharts'
            refreshObj['parseFn'] = parseTSChartData;
            refreshObj['selector'] = $(contentContainer).find('div.ts-chart > svg').first()[0];
            updateCharts.getResponse(refreshObj);
        }
    }
    
    this.getInstanceURL = function(obj) {
        var vmIntfObj = $('#dropdownIP').data('contrailDropdown').getSelectedData()[0];
        return constructReqURL($.extend({},obj,{ip:vmIntfObj['ip_address'],vnName:vmIntfObj['virtual_network'],vmName:obj['fqName'],vmVnName:vmIntfObj['vm_vn_name']}));
    }
    
    this.getStatsOfInterface = function(ip) {
        var selIntfName = '';
        var result = {};
        if(ip == null)
            return result;
        for(var i = 0;i<intfList.length; i++){
            if(intfList[i]['ip_address'] == ip)
                selIntfName = intfList[i]['name'];
        }
        $.each(intfStatList,function (idx, value) {
            if(value['name'] == selIntfName) 
                result['inBytes'] = ifNull(value['in_bytes'],'-'),result['outBytes'] = ifNull(value['out_bytes'],'-');
        });
        return result;
    }
}

/**
 * Getter for all Instances
 */
function getAllInstances(deferredObj,dataSource,dsObj) {
    var instCfilts = ['UveVirtualMachineAgent:interface_list','UveVirtualMachineAgent:vrouter','UveVirtualMachineAgent:if_stats_list',
                      'UveVirtualMachineAgent:fip_stats_list'];
    var obj = {};
    obj['transportCfg'] = { 
            url:'/api/tenant/networking/virtual-machines/details?count=' + INST_PAGINATION_CNT,
            type:'POST',
            data:{data:[{"type":"virtual-machine", "cfilt":instCfilts.join(',')}]}
        }
    //Todo: pass deferredObj as loadedDeferredObj
    getOutputByPagination(dataSource,{transportCfg:obj['transportCfg'],parseFn:tenantNetworkMonitorUtils.instanceParseFn,loadedDeferredObj:deferredObj},dsObj);
    obj['dataSource'] = dataSource;
}
