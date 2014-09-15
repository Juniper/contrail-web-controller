/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Analytics Nodes QE Queries Page
 */
monitorInfraAnalyticsQEQueriesClass = (function() {
    this.parseQEQueries = function(response){

        var retArr = [];
        retArr =  getValueByJsonPath(response,"QueryStats;queries_being_processed",[]);
        var pendingQueries = getValueByJsonPath(response,"QueryStats.pending_queries",[]);
        //Set the progress to pending for pending queries.
        pendingQueries = $.each(pendingQueries,function(idx,obj) {
            obj['progress'] = "Pending in queue";
            return obj;
        });
        //Merge the 2 lists for display
        retArr = retArr.concat(pendingQueries);
        var ret = [];
        $.each(retArr,function(idx,obj) {
          var rawJson = obj;
          var enqtime = jsonPath(obj,'$..enqueue_time');
          var progress = '-';
          if(enqtime != null && enqtime) {
              enqtime = new XDate(enqtime/1000).toString('M/d/yy h:mm:ss');
          } else { 
              enqtime = '-';
          }
          if(obj['progress'] != "Pending in queue") {
              progress = obj['progress'] + ' %';
          }
          ret.push({
             time:enqtime,
             query:obj['query'],
             progress:progress,
             raw_json:rawJson
          });
        });
        return ret;
    }
    
    this.populateQEQueriesTab = function (obj) {
        if(obj.detailView === undefined) { 
            layoutHandler.setURLHashParams({tab:'qequeries', node: obj['name']},{triggerHashChange:false});
        }    
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridQEQueries' + '_' + obj.name)) {
            $("#gridQEQueries" + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'QE Queries'
                    }
                },
                columnHeader : {
                    columns:[
                        {
                            field:"time",
                            id:"time",
                            name:"Enqueue Time",
                            width:200,
                            sortable:true
                        },
                        {
                            field:"query",
                            id:"query",
                            name:"Query",
                            width:500,
                            sortable:true
                        },
                        {
                            field:"progress",
                            id:"progress",
                            name:"Progress",
                            width:200,
                            sortable:true
                        }
                    ],
                },
                body : {
                    options : {
                        //checkboxSelectable: true,
                        //forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        }
                    },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: contrail.format(monitorInfraUrls['ANALYTICS_DETAILS'], obj['name']),
                                //timeout: timeout,
                                type: 'GET'
                            },
                            dataParser: self.parseQEQueries
                        }
                    },
                    statusMessages: {
                        loading: {
                            text: 'Loading Queries..',
                        },
                        empty: {
                            text: 'No Queries to display'
                        }, 
                        errorGettingData: {
                            type: 'error',
                            iconClasses: 'icon-warning',
                            text: 'Error in getting Data.'
                        }
                    }
                }
            });
            qequeriesGrid = $("#gridQEQueries" + '_' + obj.name).data("contrailGrid");
            qequeriesGrid.showGridMessage('loading');
        } else {
            reloadGrid(qequeriesGrid);
        }
        function onGeneratorRowSelChange() {
            var selRowDataItem = qequeriesGrid.dataItem(qequeriesGrid.select());
            if (currView != null) {
                currView.destroy();
            }
            currView = generatorNodeView;
            generatorNodeView.load({name:selRowDataItem['address']});
        }
    }
    return {populateQEQueriesTab:populateQEQueriesTab,
        parseQEQueries:parseQEQueries};
})();