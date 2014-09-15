/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Analytics Nodes Generators Page
 */
monitorInfraAnalyticsGeneratorsClass = (function() {
    var generatorsGrid;
    this.parseGenInfo = function(response)
    {
        var ret = [];
        if(response != null &&  response.value != null){ 
            response = response.value;
            $.each(response,function(i,d){
                var name = d.name;
                var status = noDataStr;
                var rawJson = d;
                var generatorInfo = getValueByJsonPath(d,"value;ModuleServerState;generator_info");
                var collectorName = getValueByJsonPath(d,"value;ModuleClientState;client_info;collector_name");
                var strtTime = getValueByJsonPath(d,"value;ModuleClientState;client_info;start_time");
                status = getStatusForGenerator(generatorInfo,collectorName,strtTime);
                var msgStats;
                try { 
                    msgStats= d['value']["ModuleServerState"]["msg_stats"][0]["msgtype_stats"];
                }catch(e){}
                var msgsBytes = 0;
                var messages = 0;
                if(msgStats != null){
                    for (var i = 0; i < msgStats.length; i++) { 
                        msgsBytes += parseInt(msgStats[i]["bytes"]);
                        messages += parseInt(msgStats[i]["messages"]); 
                    }
                } 
                msgsBytes = formatBytes(msgsBytes);
                
                ret.push({name:name,
                    status:status,
                    messages:messages,
                    bytes:msgsBytes,
                    raw_json:rawJson});
            });
        }
        return ret;
    }
    this.populateGeneratorsTab = function(obj) {
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'generators',ip:obj['ip'], node: obj['name']},{triggerHashChange:false});
        }    
        var transportCfg = {
            url:contrail.format(monitorInfraUrls['ANALYTICS_GENERATORS'], obj['name'], 50),
        };
        var generatorDS; 
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridGenerators' + '_' + obj.name)) {
            generatorDS = new ContrailDataView();
            getOutputByPagination(generatorDS,{transportCfg:transportCfg,parseFn:self.parseGenInfo});
            $("#gridGenerators" + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'Generators'
                    }
                },
                columnHeader : {
                    columns:[
                         {
                             field:"name",
                             name:"Name",
                             width:110
                             //template:cellTemplate({cellText:'#=  name.split(":")  #', tooltip:true})
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
                             field:"bytes",
                             name:"Bytes",
                             width:140
                         }
                     ],
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        }
                    },
                    dataSource : {
                        dataView : generatorDS
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Generators..',
                        },
                        empty: {
                            text: 'No Generators to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                }
            });
            generatorsGrid = $("#gridGenerators" + '_' + obj.name).data("contrailGrid");
            generatorsGrid.showGridMessage('loading');
        } else {
            //reloadGrid(generatorsGrid);
        }

        function onGeneratorRowSelChange() {
            var selRowDataItem = generatorsGrid.dataItem(generatorsGrid.select());
            if (currView != null) {
                currView.destroy();
            }
            currView = generatorNodeView;
            generatorNodeView.load({name:selRowDataItem['address']});
        }
    }
    return {populateGeneratorsTab:populateGeneratorsTab};
})();

function getStatusForGenerator(data,collectorName,strtTime){
    if(data != null) {
        var maxConnectTimeGenerator = getMaxGeneratorValueInArray(data,"connect_time");
        var maxResetTime = jsonPath(maxConnectTimeGenerator,"$..reset_time")[0];
        var maxConnectTime = jsonPath(maxConnectTimeGenerator,"$..connect_time")[0];
        var statusString = '--';
        var resetTime = new XDate(maxResetTime/1000);
        var connectTime = new XDate(maxConnectTime/1000);
        var startTime;
        var maxGeneratorHostName = jsonPath(maxConnectTimeGenerator,"$..hostname")[0];
        if(strtTime != null){
            startTime = new XDate(strtTime/1000);
        }
        var currTime = new XDate();
        if(maxResetTime > maxConnectTime){//Means disconnected
            statusString = 'Disconnected since ' + diffDates(resetTime,currTime);
        } else {
            if(maxGeneratorHostName != collectorName){
                statusString = "Connection Error since " + diffDates(connectTime,currTime);
            } else {
                statusString = "Up since " + diffDates(startTime,currTime) + " , Connected since " + diffDates(connectTime,currTime);
            }
        }
        return statusString;
    } else {
        return "-";
    }
}