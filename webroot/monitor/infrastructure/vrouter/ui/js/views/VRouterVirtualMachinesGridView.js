/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var VRouterVirtualMachinesGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                hostname = viewConfig['hostname'];

                var instanceRemoteConfig = {
                    url: ctwc.get(
                        monitorInfraConstants.monitorInfraUrls.VROUTER_INSTANCES_IN_CHUNKS,
                        hostname, 50, $.now()),
                    type: 'POST',
                    data: JSON.stringify({
                        data: [{
                                "type": ctwc.TYPE_VIRTUAL_MACHINE,
                                "cfilt": ctwc.FILTERS_COLUMN_VM.join(',')
                        }]
                    })
                };
                self.renderView4Config(self.$el,
                     null,
                     getInstanceGridViewConfig(instanceRemoteConfig, viewConfig));
        }
    });

    var getInstanceGridViewConfig = function (instanceRemoteConfig, viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_INSTANCE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.VROUTER_INSTANCE_GRID_ID,
                                title: ctwl.TITLE_INSTANCES,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getProjectInstancesConfig(instanceRemoteConfig, viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getProjectInstancesConfig = function (instanceRemoteConfig, viewConfig) {
        var instancevlRemoteConfig = ctwgc.getVMDetailsLazyRemoteConfig(ctwc.TYPE_VIRTUAL_MACHINE);
        var hostname = viewConfig['hostname'];
        var gridTitle = viewConfig['isUnderlayPage'] == true ?
            contrail.format('{0} ({1})',ctwl.TITLE_INSTANCES_SUMMARY, hostname) :
            ctwl.TITLE_INSTANCES_SUMMARY;
        var gridElementConfig = {
            header: {
                title: {
                    text: gridTitle
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                }
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    detail : ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                    remote: {
                        ajaxConfig: instanceRemoteConfig,
                        dataParser: ctwp.instanceDataParser
                    },
                    vlRemoteConfig: {
                        vlRemoteList: instancevlRemoteConfig
                    },
                    cacheConfig : {
                        ucid: hostname
                    }
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Instances..',
                    },
                    empty: {
                        text: 'No Instances Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                  {
                      field: 'uuid',
                      name: 'UUID',
                      minWidth: 100
                  },
                  {
                      field: 'vmName',
                      name: 'Instance Name',
                      formatter: function (r, c, v, cd, dc) {
                          if(!contrail.checkIfExist(dc['vmName'])) {
                              return '-';
                          } else if(!contrail.checkIfExist(dc['vnFQN']) || ctwu.isServiceVN(dc['vnFQN'])){
                              return cowf.formatElementName({name: 'instance', value: dc['vmName'], cssClass: 'cell-no-link'});
                          } else {
                              return cowf.formatElementName({name: 'instance', value: dc['vmName'], cssClass: 'cell-hyperlink-blue'});
                          }
                      },
                      minWidth: 150,
                      searchable: true,
                      events: {
                          onClick: function (e, dataItem) {
                              if (viewConfig['isUnderlayPage'] == true) {
                                  return;
                              }
                              ctwu.onClickNetworkMonitorGrid(e, dataItem);
                          }
                      },
                      exportConfig: {
                          allow: true,
                          stdFormatter: false
                      }
                  },
                  {
                      field: 'vn',
                      name: 'Networks',
                      formatter: function (r, c, v, cd, dc) {
                          return cowf.formatElementName({name: 'vn', value: dc['vn'], cssClass: 'cell-hyperlink-blue'});
                      },
                      minWidth: 150,
                      searchable: true,
                      events: {
                          onClick: function (e, dc) {
                              $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
                          }
                      },
                  },
                  {
                      field: 'intfCnt',
                      name: 'Interfaces',
                      minWidth: 80
                  },
                  {
                      field: 'ip',
                      name: 'IP Address',
                      formatter: function (r, c, v, cd, dc) {
                          return ctwu.formatIPArray(dc['ip']);
                      },
                      minWidth: 150,
                      exportConfig: {
                          allow: true,
                          stdFormatter: false
                      }
                  },
                  {
                      field: '',
                      name: 'Aggr. Traffic In/Out (Last 1 Hr)',
                      formatter: function (r, c, v, cd, dc) {
                          return cowu.addUnits2Bytes(dc['inBytes60'], true) + ' / ' + cowu.addUnits2Bytes(dc['outBytes60'], true);
                      },
                      minWidth: 200
                  },
                  {
                      field: '',
                      name: '',
                      minWidth: 30,
                      maxWidth: 30,
                      formatter: function (r, c, v, cd, dc) {
                          if(contrail.checkIfExist(dc.raw_json) && !contrail.checkIfKeyExistInObject(false, dc.raw_json.value, 'UveVirtualMachineAgent')) {
                              return '<i class="fa fa-exclamation-triangle red" title="Instance data is available in config but not available in analytics."></i>';
                          } else {
                              return '';
                          }
                      }
                  }
               ]
            }
        };
        return gridElementConfig;
    };

    return VRouterVirtualMachinesGridView;
});
