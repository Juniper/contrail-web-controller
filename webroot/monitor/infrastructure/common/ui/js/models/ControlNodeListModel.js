define([
    'contrail-list-model'
], function (ContrailListModel) {
    var ControlNodeListModel = function () {
        var vlRemoteConfig = [
          {
              getAjaxConfig: function() {
                  return monitorInfraUtils
                      .getGeneratorsAjaxConfigForInfraNodes('controlNodeDS');
              },
              successCallback: function(response,contrailListModel) {
                  monitorInfraUtils
                      .parseAndMergeGeneratorWithPrimaryDataForInfraNodes(
                              response,contrailListModel);
              }
          }
                              //Need to add cpu stats
        ];
        var listModelConfig = {
                remote : {
                    ajaxConfig : {
                        url : ctwl.CONTROLNODE_SUMMARY_URL
                    },
                    dataParser : monitorInfraParsers.parseControlNodesDashboardData
                },
                vlRemoteConfig :{
                    vlRemoteList : vlRemoteConfig
                },
                cacheConfig : {
                    ucid: ctwc.CACHE_CONTROLNODE
                }
            };
        return new ContrailListModel(listModelConfig);
    };
    return ControlNodeListModel;
    }
);
