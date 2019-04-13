/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterDetailPageView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var detailsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW);
            var viewConfig = this.attributes.viewConfig;
            var leftContainerElement = $('#left-column-container');
            var hostname = viewConfig['hostname'];
            this.$el.html(detailsTemplate);

            monitorInfraUtils.doAjaxCallsForNodeDetails ({
                ajaxConfigList:[
                    {
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['VROUTER_DETAILS'],
                                    hostname,true),
                            type: 'GET'
                        },
                        dataParser: dataParser,
                        callBack:function(parsedData,viewConfig){
                            self.renderView4Config($('#left-column-container'), null,
                                    getVRouterDetailPageViewConfig(viewConfig,parsedData));
                        }
                    },
                    {
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['VROUTER_DETAILS'],
                                    hostname,false),
                            type: 'GET'
                        },
                        dataParser: dataParser,
                        callBack:function(parsedData){
                            self.renderView4Config($('#left-column-container'), null,
                                    getVRouterDetailPageViewConfig(viewConfig,parsedData));
                        }
                    }
                ],
                viewConfig:viewConfig
            });
            self.renderView4Config($('#right-column-container'), null,
                    getVRouterDetailChartViewConfig(viewConfig));
        }
    });
    var noDataStr = monitorInfraConstants.noDataStr;
    var getVRouterDetailPageViewConfig = function (viewConfig,data) {
        var hostname = viewConfig['hostname'];
        return {
            elementId: ctwl.VROUTER_DETAIL_PAGE_ID,
            title: ctwl.TITLE_DETAILS,
            view: "DetailsView",
            viewConfig: {
                data:data,
                templateConfig: getDetailsViewTemplateConfig(),
                app: cowc.APP_CONTRAIL_CONTROLLER,
            }
        }
    }

    function getVRouterDetailChartViewConfig (viewConfig) {
        return {
            elementId: 'vrouter_detail_charts_id',
            title: ctwl.TITLE_DETAILS,
            view: "VRouterDetailsChartsView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix : ctwl.VROUTER_VIEWPATH_PREFIX,
            viewConfig: viewConfig
        }
    }

    function getDetailsViewTemplateConfig() {
        return {
            advancedViewOptions: false,
            templateGenerator: 'ColumnSectionTemplateGenerator',
            templateGeneratorConfig: {
                columns: [
                    {
                        class: 'col-xs-12',
                        rows: [
                            {
                                title: 'Virtual Router',
                                theme: 'widget-box',
                                keyClass: 'label-blue',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorData: 'rawData',
                                templateGeneratorConfig: getTemplateGeneratorConfig()
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getTemplateGeneratorConfig () {
        var templateGeneratorConfig = [];
        templateGeneratorConfig = templateGeneratorConfig.concat([
            {
                key: 'name',
                label:'Hostname',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'ips',
                label:'IP Address',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'version',
                label: 'Version',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'overallNodeStatus',
                label: 'Overall Node Status',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'vrouterType',
                label: 'Type',
                templateGenerator: 'TextGenerator'
            }
        ]);
        //Add proccesses info only if the node manager is installed
        templateGeneratorConfig = templateGeneratorConfig.concat(
            (monitorInfraConstants.IS_NODE_MANAGER_INSTALLED)?
                    [
                        {
                            key: 'processes',
                            label: 'Processes',
                            templateGenerator: 'TextGenerator'
                        },
                        {
                            key: 'vrouterProcessStatusList.contrail-vrouter-agent',
                            label: 'vRouter Agent',
                            keyClass: 'indent-right',
                            templateGenerator: 'TextGenerator'
                        }
                    ]
                        : []
        );
        templateGeneratorConfig = templateGeneratorConfig.concat([
            {
                key: 'controlNodesDetails',
                label: 'Control Nodes',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'xmppMessages',
                label: 'XMPP Messages',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'dnsServerIP',
                label: 'DNS Server IPs',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'analyticsNodeDetails',
                label: 'Analytics Node',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'analyticsMessages',
                label: 'Analytics Messages',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'flowCount',
                label: 'Flow Count',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'vnCnt',
                label: 'Networks',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'interfaces',
                label: 'Interfaces',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'instCnt',
                label: 'Instances',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'cpu',
                label: ctwl.TITLE_CPU,
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'memory',
                label: 'Memory',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'lastLogTimestamp',
                label: 'Last Log',
                templateGenerator: 'TextGenerator'
            },
            {
                key: 'cores',
                label: 'Core File(s)',
                templateGenerator: 'TextGenerator'
            }
        ]);
        return templateGeneratorConfig;
    }

    function getStatusesForAllvRouterProcesses(processStateList){
        var ret = [];
        if(processStateList != null){
            for(var i=0; i < processStateList.length; i++){
                var currProc = processStateList[i];
                if(currProc.process_name == "contrail-vrouter-nodemgr"){
                    ret['contrail-vrouter-nodemgr'] = monitorInfraUtils.getProcessUpTime(currProc);
                } else if (currProc.process_name == "openstack-nova-compute"){
                    ret['openstack-nova-compute'] = monitorInfraUtils.getProcessUpTime(currProc);
                } else if (currProc.process_name == "contrail-vrouter-agent"){
                    ret['contrail-vrouter-agent'] = monitorInfraUtils.getProcessUpTime(currProc);
                } else if (currProc.process_name.indexOf('contrail-tor-agent') != -1){
                    ret['contrail-tor-agent'] = monitorInfraUtils.getProcessUpTime(currProc);
                }
            }
        }
        return ret;
    }

    function getAnalyticsNodeDetails (vrouterData) {
        var anlNode = noDataStr;
        var secondaryAnlNode, status;
        try{
            anlNode = jsonPath(vrouterData,
                    "$..ModuleClientState..collector_ip")[0].split(':')[0];
            status = jsonPath(vrouterData,"$..ModuleClientState..status")[0];
            secondaryAnlNode = ifNull(jsonPath(vrouterData,
                    "$..ModuleClientState..secondary")[0],'').split(':')[0];
        }catch(e){
            anlNode = noDataStr;
        }
        try{
            if(anlNode != null && anlNode != noDataStr &&
                    status.toLowerCase() == "established")
                anlNode = anlNode.concat(' (Up)');
        }catch(e){
            if(anlNode != null && anlNode != noDataStr) {
                anlNode = anlNode.concat(' (Down)');
            }
        }
        if(secondaryAnlNode != null && secondaryAnlNode != "" &&
                secondaryAnlNode != "0.0.0.0"){
            anlNode = anlNode.concat(', ' + secondaryAnlNode);
        }
        return ifNull(anlNode,noDataStr);
    }

    function getControlNodesDetails (vrouterData) {
        var peerList ;
        try{
            peerList = vrouterData.VrouterAgent.xmpp_peer_list;
        }catch(e){}
        var nodeArr=noDataStr ;
        if(peerList != null && peerList.length>0){
            nodeArr = '<div class="table-cell dashboard-item-value">';
            var nodes = '';

            for (var i=0; i< peerList.length;i++){
                var node = '';
                node = '<span onclick="monitorInfraUtils.showObjLogs(\'default-domain%3Adefault-project%3Aip-fabric%3A__default__%3A'+
                    peerList[i].ip+'\',\'vRouter\');" onmouseover="" style="cursor: pointer;">'+
                    peerList[i].ip +'</span>' ;

                if(peerList[i].primary != null && peerList[i].primary == true){
                    if(peerList[i].status == true){
                        if((i+1) == peerList.length){//only primary present
                            node =  node + "* (Up) " ;
                        } else {
                            node = node + "* (Up), " ;
                        }
                    } else {
                        node = "<span class='text-error'>" + node + "* (Down)</span>, " ;
                    }
                    if(nodes == ''){
                        nodes = node;
                    } else {
                        nodes = node + nodes
                    }
                } else {
                    if(peerList[i].status == true)
                        node = node + " (Up)" ;
                    else
                        node = "<span class='text-error'>" + node + " (Down)</span>" ;
                    if(node != ''){
                        nodes = nodes + node
                    } else {
                        nodes = node;
                    }
                }
            }
            nodeArr = nodeArr + nodes + '</div>'
        }
        return nodeArr;
    }

    function getAnalyticsMessages (vrouterData) {
        var msgs = monitorInfraUtils.getAnalyticsMessagesCountAndSize(
                vrouterData['derived-uve'],
                ['contrail-vrouter-agent']);
        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
    }

    function getXmppMessages (vrouterData) {
        var xmppStatsList = getValueByJsonPath(vrouterData,
                'VrouterStatsAgent;xmpp_stats_list',[]);
        var inMsgs = outMsgs = 0;
        for(var i = 0; i < xmppStatsList.length ; i++) {
            inMsgs += getValueByJsonPath(xmppStatsList[i],'in_msgs',0);
            outMsgs += getValueByJsonPath(xmppStatsList[i],'out_msgs',0);
        }
        return (inMsgs + ' In, ' + outMsgs + ' Out');
    }

    function getFlowCount (vrouterData) {
        return (getValueByJsonPath(vrouterData,"VrouterStatsAgent;flow_rate;active_flows",
                noDataStr) + ' Active, ' +
                getValueByJsonPath(vrouterData,"VrouterStatsAgent;total_flows",
                noDataStr) + ' Total');
    }

    function getInterfaces (parsedData) {
        var downInts = parsedData['errorIntfCnt'];
        var totInts = parsedData['intfCnt'];
        var ret;
        if(downInts > 0){
            downInts = ", <span class='text-error'>" + downInts + " Down</span>";
        } else {
            downInts = "";
        }
        return totInts + " Total" + downInts;
    }

    function getLastLogTime(vrouterData) {
        var lmsg;
        lmsg = monitorInfraUtils.getLastLogTimestamp(vrouterData['derived-uve'],
                "compute");
        if(lmsg != null){
            try{
                return new Date(parseInt(lmsg)/1000).toLocaleString();
            }catch(e){return noDataStr;}
        } else return noDataStr;
    }

    function getVrouterIpAddressList(data){
        var controlIp = getValueByJsonPath(data,'VrouterAgent;control_ip',noDataStr);
        var ips = getValueByJsonPath(data,'VrouterAgent;self_ip_list',[]);
        var configip = getValueByJsonPath(data,'derived-uve;ConfigData;virtual-router;virtual_router_ip_address');
        var ipList = [];
        if(controlIp != noDataStr){
            ipList.push({
                ip: controlIp
            });
        }
        if(ips.length > 0){
            $.each(ips,function(idx,obj){
                if(obj != null && ipList.indexOf(obj) == -1){
                    ipList.push({
                        ip: obj
                    });
                }
            });
        }
        if(configip != null && ipList.indexOf(configip) == -1){
            var configHostname = getValueByJsonPath(data,'derived-uve;ConfigData;virtual-router;name');
            ipList.push({
                ip: configip,
                hostname: configHostname
            });
        }
        return ipList;
    }

    function dataParser (result,viewConfig) {
        var hostname = viewConfig['hostname'];
        var vrouterData = result;
        var obj = monitorInfraParsers.
                    parsevRoutersDashboardData([{
                        name: monitorInfraUtils.getIPOrHostName(viewConfig),
                        value: result
                    }])[0];
        //Further parsing required for Details page done below
        var overallStatus;
        try{
            overallStatus = monitorInfraUtils.
                getOverallNodeStatusForDetails(obj);
        }catch(e){
            overallStatus = "<span> "+ statusTemplate({color:'red',
                colorSevMap:cowc.COLOR_SEVERITY_MAP})+" Down</span>";
        }

        try{
            //Add the process status list with uptime
            procStateList = getValueByJsonPath(vrouterData,
                    "NodeStatus;process_info");
            obj['vrouterProcessStatusList'] =
                getStatusesForAllvRouterProcesses(procStateList);
        }catch(e){
            console.log(e);
        }

        obj['name'] = hostname;

        obj['ips'] = monitorInfraUtils.getVrouterIpAddresses(
                            vrouterData,'details');

        obj['overallNodeStatus'] = overallStatus;

        //dummy entry to show empty value in details
        obj['processes'] = '&nbsp;';

        obj['vrouterType'] = monitorInfraUtils.
                                getDisplayNameForVRouterType(
                                    obj);

        obj['analyticsNodeDetails'] =
                getAnalyticsNodeDetails(vrouterData);

        obj['controlNodesDetails'] =
                getControlNodesDetails(vrouterData);

        obj['analyticsMessages'] =
                getAnalyticsMessages(vrouterData);

        obj['xmppMessages'] =
                getXmppMessages(vrouterData);

        obj['flowCount'] =
                getFlowCount(vrouterData);

        obj['interfaces'] = getInterfaces (obj);

        obj['cpu'] = monitorInfraParsers.getCpuText(obj['cpu'],'--');

        obj['lastLogTimestamp'] =
                getLastLogTime(vrouterData);

        var ipList = getVrouterIpAddressList(vrouterData);
        monitorInfraUtils.createMonInfraDetailsFooterLinks (
                $('#left-column-container').parent(),
                ipList,
                getValueByJsonPath(viewConfig,'introspectPort',
                        monitorInfraConstants.VRouterIntrospectPort));

        return obj;
    }

    return VRouterDetailPageView;
});
