/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var ConfigNodesDetailPageView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var detailsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW);
            var viewConfig = this.attributes.viewConfig;
            var leftContainerElement = $('#left-column-container');
            this.$el.html(detailsTemplate);

            self.renderView4Config($('#left-column-container'), null,
                    getConfigNodeDetailPageViewConfig(viewConfig));
        }
    });
    var getConfigNodeDetailPageViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];
        return {
            elementId: ctwl.CONFIGNODE_DETAIL_PAGE_ID,
            title: ctwl.TITLE_DETAILS,
            view: "DetailsView",
            viewConfig: {
                ajaxConfig: {
                    url: contrail.format(
                            monitorInfraConstants.
                            monitorInfraUrls['CONFIG_DETAILS'], hostname),
                    type: 'GET'
                },
                templateConfig: getDetailsViewTemplateConfig(),
                app: cowc.APP_CONTRAIL_CONTROLLER,
                dataParser: function(result) {
                    var configNodeData = result;
                    var obj = monitorInfraParsers.
                        parseConfigNodesDashboardData([result])[0];
                    //Further parsing required for Details page done below

                    var overallStatus;
                    try{
                        overallStatus = monitorInfraUtils.
                            getOverallNodeStatusForDetails(obj);
                    }catch(e){overallStatus = "<span> "+
                        statusTemplate({sevLevel:sevLevels['ERROR'],
                            sevLevels:sevLevels})+" Down</span>";
                    }

                    try{
                        //Add the process status list with uptime
                        var procStateList = jsonPath(configNodeData,
                                "$..NodeStatus.process_info")[0];
                        obj['configProcessStatusList'] =
                            getStatusesForAllConfigProcesses(procStateList);
                    }catch(e){}

                    obj['name'] = hostname;

                    obj['ips'] = getIpAddresses(result);

                    obj['overAllStatus'] = overallStatus;

                    obj['analyticsDetails'] = getAnalyticsNodeDetails(result);

                    obj['lastLogTimestamp'] = getLastLogTime(result);
                    return obj;
                }
            }
        }
    }

    function getDetailsViewTemplateConfig() {
        return {
            title: 'Config Node',
            templateGenerator: 'BlockListTemplateGenerator',
            theme: 'widget-box',
            keyClass: 'label-blue',
            templateGeneratorConfig: getTemplateGeneratorConfig()
        };
    };

    function getTemplateGeneratorConfig() {
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
                    key: 'overAllStatus',
                    label: 'Overall Node Status',
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
                             key: 'configProcessStatusList.' +
                                 monitorInfraConstants.
                                     UVEModuleIds['APISERVER'],
                             label: 'API Server',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'configProcessStatusList.' +
                                 monitorInfraConstants.
                                     UVEModuleIds['SCHEMA'],
                             label: 'Schema Transformer',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'configProcessStatusList.' +
                                 monitorInfraConstants.
                                     UVEModuleIds['SERVICE_MONITOR'],
                             label: 'Service Monitor',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'configProcessStatusList.' +
                                 monitorInfraConstants.
                                     UVEModuleIds['DISCOVERY_SERVICE'],
                             label: 'Discovery',
                             templateGenerator: 'TextGenerator'
                         },
                         {
                             key: 'configProcessStatusList.' +
                                 monitorInfraConstants.UVEModuleIds['IFMAP'],
                             label: 'Ifmap',
                             templateGenerator: 'TextGenerator'
                         }
                    ]
                    : []
        );

        templateGeneratorConfig = templateGeneratorConfig.concat(
                [
                    {
                        key: 'analyticsDetails',
                        label: 'Analytics Node',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'cpu',
                        label: 'CPU',
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
                    }
                ]
        );
        return templateGeneratorConfig;
    }

    function getIpAddresses (confNodeData) {
        var ips = '';
           try{
               iplist = getValueByJsonPath(confNodeData,
                       "configNode;ModuleCpuState;config_node_ip",[]);
               if(iplist instanceof Array){
                   nodeIp = iplist[0];//using the first ip in the list for status
               } else {
                   nodeIp = iplist;
               }
           } catch(e){return noDataStr;}
           if(iplist != null && iplist != noDataStr && iplist.length>0){
               for (var i=0; i< iplist.length;i++){
                   if(i+1 == iplist.length) {
                       ips = ips + iplist[i];
                   } else {
                       ips = ips + iplist[i] + ', ';
                   }
               }
           } else {
              ips = noDataStr;
           }
           return ips;
    }

    function getAnalyticsNodeDetails (confNodeData) {
        var anlNode = noDataStr;
        var secondaryAnlNode, status;
        try{
           var contrailApiDetails = jsonPath(confNodeData,
                                   "$..Config:contrail-api:0")[0];

           anlNode = jsonPath(contrailApiDetails,
                   "$..ModuleClientState..primary")[0].split(':')[0];
           status = jsonPath(contrailApiDetails,
                   "$..ModuleClientState..status")[0];
           secondaryAnlNode = ifNull(jsonPath(contrailApiDetails,
                   "$..ModuleClientState..secondary")[0],"").split(':')[0];
        }catch(e){
           anlNode = "--";
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
        if(secondaryAnlNode != null && secondaryAnlNode != ""
            && secondaryAnlNode != "0.0.0.0"){
           anlNode = anlNode.concat(', ' + secondaryAnlNode);
        }
        return ifNull(anlNode,noDataStr);
    }

    function getLastLogTime(aNodeData) {
        var lmsg;
        lmsg = getLastLogTimestamp(aNodeData,"config");
        if(lmsg != null){
            try{
                return new Date(parseInt(lmsg)/1000).toLocaleString();
            }catch(e){return noDataStr;}
        } else return noDataStr;
    }

    function getStatusesForAllConfigProcesses(processStateList){
        var ret = [];
        if(processStateList != null){
           for(var i=0; i < processStateList.length; i++){
              var currProc = processStateList[i];
              if(currProc.process_name == "contrail-discovery:0"){
                 ret[monitorInfraConstants.UVEModuleIds['DISCOVERY_SERVICE']] =
                     getProcessUpTime(currProc);
              } else if(currProc.process_name == "contrail-discovery"){
                 ret[monitorInfraConstants.UVEModuleIds['DISCOVERY_SERVICE']] =
                     getProcessUpTime(currProc);
              } else if (currProc.process_name == "contrail-api:0"){
                 ret[monitorInfraConstants.UVEModuleIds['APISERVER']] =
                     getProcessUpTime(currProc);
              } else if (currProc.process_name == "contrail-api"){
                 ret[monitorInfraConstants.UVEModuleIds['APISERVER']] =
                     getProcessUpTime(currProc);
              } else if (currProc.process_name == "contrail-config-nodemgr"){
                 ret['contrail-config-nodemgr'] = getProcessUpTime(currProc);
              } else if (currProc.process_name == "contrail-svc-monitor"){
                 ret[monitorInfraConstants.UVEModuleIds['SERVICE_MONITOR']] =
                                             getProcessUpTime(currProc);
              } else if (currProc.process_name == "ifmap"){
                 ret[monitorInfraConstants.UVEModuleIds['IFMAP']] =
                                             getProcessUpTime(currProc);
              } else if (currProc.process_name == "contrail-schema"){
                 ret[monitorInfraConstants.UVEModuleIds['SCHEMA']] =
                                             getProcessUpTime(currProc);
              } else if (currProc.process_name == 'contrail-zookeeper') {
                     ret['contrail-zookeeper'] = getProcessUpTime(currProc);
                 }
           }
        }
        return ret;
    }

    return ConfigNodesDetailPageView;
});