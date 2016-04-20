/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var hostname;
    var AnalyticsNodeQEQueriesGridView = ContrailView.extend({
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
                                    monitorInfraUrls['ANALYTICS_DETAILS'],
                                    hostname),
                            type: "GET",
                        },
                        dataParser: parseQEQueries
                    },
                    cacheConfig: {
//                        ucid: "analyticsnode_qequeries_list"
                    }
            }
            var contrailListModel = new ContrailListModel(remoteAjaxConfig);

            self.renderView4Config(this.$el, contrailListModel,
                    getAnalyticsNodeQEQueriesViewConfig(viewConfig));
        }
    });

    var getAnalyticsNodeQEQueriesViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.ANALYTICSNODE_GENERATORS_GRID_SECTION_ID,
            view : "SectionView",
            viewConfig : {
                rows : [ {
                    columns : [ {
                        elementId : ctwl.ANALYTICSNODE_QEQUERIES_GRID_ID,
                        title : ctwl.ANALYTICSNODE_QEQUERIES_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getAnalyticsNodeQEQueriesGridConfig()
                        }
                    } ]
                } ]
            }
        }
    }


    function getAnalyticsNodeQEQueriesGridConfig() {

        var columns = [
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
       ];
        var gridElementConfig = {
            header : {
                title : {
                    text : ctwl.ANALYTICSNODE_QEQUERIES_TITLE
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
                        text: 'Loading QE Queries..',
                    },
                    empty: {
                        text: 'No Queries Found.'
                    }
                }
            }
        };
        return gridElementConfig;

    }

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

    return AnalyticsNodeQEQueriesGridView;
});