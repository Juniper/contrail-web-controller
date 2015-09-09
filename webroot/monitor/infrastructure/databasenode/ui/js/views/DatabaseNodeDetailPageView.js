/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
], function (_, ContrailView) {
    var DatabaseNodesDetailPageView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var detailsTemplate = contrail.getTemplate4Id(
                    cowc.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW);
            var viewConfig = this.attributes.viewConfig;
            var leftContainerElement = $('#left-column-container');
            this.$el.html(detailsTemplate);

            self.renderView4Config($('#left-column-container'), null,
                    getDatabaseNodeDetailPageViewConfig(viewConfig));
        }
    });
    var getDatabaseNodeDetailPageViewConfig = function (viewConfig) {
        var hostname = viewConfig['hostname'];
        return {
            elementId: ctwl.DATABASENODE_DETAIL_PAGE_ID,
            title: ctwl.TITLE_DETAILS,
            view: "DetailsView",
            viewConfig: {
                ajaxConfig: {
                    url: contrail.format(
                            monitorInfraConstants.
                            monitorInfraUrls['DATABASE_DETAILS'], hostname),
                    type: 'GET'
                },
                templateConfig: getDetailsViewTemplateConfig(),
                app: cowc.APP_CONTRAIL_CONTROLLER,
                dataParser: function(result) {
                    var databaseNodeData = result;
                    var obj = monitorInfraParsers.
                        parseDatabaseNodesDashboardData([
                                         {name:hostname,value:result}])[0];
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
                        var procStateList = jsonPath(databaseNodeData,
                                "$..NodeStatus.process_info")[0];
                        obj['databaseProcessStatusList'] =
                            getStatusesForAllDbProcesses(procStateList);
                    }catch(e){}

                    obj['name'] = hostname;

                    obj['overAllStatus'] = overallStatus;

                    return obj;
                }
            }
        }
    }

    function getDetailsViewTemplateConfig() {
        return {
            advancedViewOptions: false,
            templateGenerator: 'ColumnSectionTemplateGenerator',
            templateGeneratorConfig: {
                columns: [
                    {
                        class: 'span12',
                        rows: [
                            {
                                title: 'Database Node',
                                templateGenerator: 'BlockListTemplateGenerator',
                                theme: 'widget-box',
                                keyClass: 'label-blue',
                                templateGeneratorConfig: getTemplateGeneratorConfig()
                            }
                        ]
                    }
                ]
            }
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
                    key: 'ip',
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
                             key: 'databaseProcessStatusList.' +
                                 monitorInfraConstants.UVEModuleIds['DATABASE'],
                             label: 'Database',
                             templateGenerator: 'TextGenerator'
                         }
                    ]
                    : []
        );

        templateGeneratorConfig = templateGeneratorConfig.concat(
                [
                    {
                        key: 'databaseUsage',
                        label: 'Database Usage',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'formattedAvailableSpace',
                        label: 'Available Space',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'formattedUsedSpaceWithPercentage',
                        label: 'Used Space',
                        templateGenerator: 'TextGenerator'
                    },
                    {
                        key: 'formattedAnalyticsDbSize',
                        label: 'Analytics DB Size',
                        templateGenerator: 'TextGenerator'
                    }

                ]
        );
        return templateGeneratorConfig;
    }

    function getStatusesForAllDbProcesses(processStateList){
        var ret = [];
        if(processStateList != null){
           for(var i=0; i < processStateList.length; i++){
              var currProc = processStateList[i];
              if(currProc.process_name ==
                  monitorInfraConstants.UVEModuleIds['KAFKA']){
                  ret[monitorInfraConstants.UVEModuleIds['KAFKA']] =
                      getProcessUpTime(currProc);
              } else if(currProc.process_name ==
                  monitorInfraConstants.UVEModuleIds['DATABASE']){
                 ret[monitorInfraConstants.UVEModuleIds['DATABASE']] =
                     getProcessUpTime(currProc);
              }
           }
        }
        return ret;
     }

    return DatabaseNodesDetailPageView;
});