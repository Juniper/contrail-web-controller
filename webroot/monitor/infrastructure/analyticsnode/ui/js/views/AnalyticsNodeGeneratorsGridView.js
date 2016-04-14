/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var noDataStr = monitorInfraConstants.noDataStr;
    var hostname;
    var AnalyticsNodeGeneratorsGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            hostname = viewConfig['hostname'];
            var remoteAjaxConfig = {
                    remote: {//TODO need to verify if the pagination
                                //is actually working
                        ajaxConfig: {
                            url: contrail.format(monitorInfraConstants.
                                    monitorInfraUrls['ANALYTICS_GENERATORS'],
                                    hostname, 50),
                            type: "GET",
                        },
                        dataParser: parseGenInfo
                    },
                    cacheConfig: {
//                        ucid: "analyticsnode_generators_list"
                    }
            }
            var contrailListModel = new ContrailListModel(remoteAjaxConfig);

            self.renderView4Config(this.$el, contrailListModel,
                    getAnalyticsNodeGeneratorsViewConfig(viewConfig));
        }
    });

    var getAnalyticsNodeGeneratorsViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.ANALYTICSNODE_GENERATORS_GRID_SECTION_ID,
            view : "SectionView",
            viewConfig : {
                rows : [ {
                    columns : [ {
                        elementId : ctwl.ANALYTICSNODE_GENERATORS_GRID_ID,
                        title : ctwl.ANALYTICSNODE_GENERATORS_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getAnalyticsNodeGeneratorsGridConfig()
                        }
                    } ]
                } ]
            }
        }
    }


    function getAnalyticsNodeGeneratorsGridConfig() {

        var columns = [
        {
            field:"name",
            name:"Name",
            width:110
        },
        {
            field:"status",
            name:"Status",
            width:210
        },
        {
            field:'messages',
            headerAttributes:{style:'min-width:160px;'},
            width:160,
            name:"Messages"
        },
        {
            field:"formattedMsgBytes",
            name:"Bytes",
            width:140,
            sortField:"bytes"
        }];
        var gridElementConfig = {
            header : {
                title : {
                    text : ctwl.ANALYTICSNODE_GENERATORS_TITLE
                }
            },
            columnHeader : {
                columns : columns
            },
            body : {
                options : {
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON(),
                    checkboxSelectable : false
                },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Generators..',
                    },
                    empty: {
                        text: 'No Generators Found.'
                    }
                }
            }
        };
        return gridElementConfig;

    }

    this.parseGenInfo = function(response)
    {
        var ret = [];
        response = response['data'];
        if(response != null &&  response.value != null){
            response = response.value;
            $.each(response,function(i,d){
                var name = d.name;
                var status = noDataStr;
                var rawJson = d;
                var generatorInfo = getValueByJsonPath(d,
                        "value;ModuleServerState;generator_info");
                var collectorName = getValueByJsonPath(d,
                        "value;ModuleClientState;client_info;collector_name");
                var strtTime = getValueByJsonPath(d,
                        "value;ModuleClientState;client_info;start_time");
                status = getStatusForGenerator(generatorInfo,
                                collectorName,
                                strtTime);
                var msgStats;
                try {
                    msgStats=
                        d['value']["ModuleServerState"]["msg_stats"][0]["msgtype_stats"];
                }catch(e){}
                var msgsBytes = 0;
                var messages = 0;
                if(msgStats != null){
                    for (var i = 0; i < msgStats.length; i++) {
                        msgsBytes += parseInt(msgStats[i]["bytes"]);
                        messages += parseInt(msgStats[i]["messages"]);
                    }
                }
                var formattedMsgBytes = formatBytes(msgsBytes);

                ret.push({name:name,
                    status:status,
                    messages:messages,
                    bytes:msgsBytes,
                    formattedMsgBytes:formattedMsgBytes,
                    raw_json:rawJson});
            });
        }
        return ret;
    }

    function getStatusForGenerator(data,collectorName,strtTime){
        if(data != null) {
            var maxConnectTimeGenerator =
                monitorInfraUtils.getMaxGeneratorValueInArray(data,"connect_time");
            var maxResetTime =
                jsonPath(maxConnectTimeGenerator,"$..reset_time")[0];
            var maxConnectTime =
                jsonPath(maxConnectTimeGenerator,"$..connect_time")[0];
            var statusString = '--';
            var resetTime = new XDate(maxResetTime/1000);
            var connectTime = new XDate(maxConnectTime/1000);
            var startTime;
            var maxGeneratorHostName =
                jsonPath(maxConnectTimeGenerator,"$..hostname")[0];
            if(strtTime != null){
                startTime = new XDate(strtTime/1000);
            }
            var currTime = new XDate();
            if(maxResetTime > maxConnectTime){//Means disconnected
                statusString = 'Disconnected since ' +
                                diffDates(resetTime,currTime);
            } else {
                if(maxGeneratorHostName != collectorName){
                    statusString = "Connection Error since " +
                                    diffDates(connectTime,currTime);
                } else {
                    statusString = "Up since " +
                                diffDates(startTime,currTime) +
                                " , Connected since " +
                                diffDates(connectTime,currTime);
                }
            }
            return statusString;
        } else {
            return "-";
        }
    }

    return AnalyticsNodeGeneratorsGridView;
});