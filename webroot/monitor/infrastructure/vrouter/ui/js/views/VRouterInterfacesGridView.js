/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var VRouterInterfacesGridView = ContrailView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(self.attributes));
        },

        getViewConfig: function (attributes) {
            var viewConfig = attributes.viewConfig,
                hostname = viewConfig['hostname'],
                pagerOptions = viewConfig['pagerOptions'];
            var columns = [
                       {
                           field:"dispName",
                           name:"Name",
                           minWidth:125,
                           formatter:function(r,c,v,cd,dc) {
                               return v;
                           },
                           searchFn:function(d){
                               return d['dispName'];
                           }
                       },
                       {
                           field:"label",
                           name:"Label",
                           minWidth:50
                       },
                       {
                           field:"active",
                           name:"Status",
                           minWidth:50,
                           //template:cellTemplate({cellText:'#= (active == "Active")? "Up": "Down"#', tooltip:false}),
                           formatter: function(r,c,v,cd,dc) {
                              if(dc['active'] == 'Active')
                                 return 'Up';
                              else
                                 return 'Down'
                           },
                           searchFn:function(d){
                               var status = 'Down';
                               if(d['active'] == 'Active')
                                   status = 'Up';
                               return status;
                           }
                       },
                       {
                           field:"type",
                           name:"Type",
                           minWidth:130
                       },
                       {
                           field:"disp_vn_name",
                           name:"Network",
                           cssClass: 'cell-hyperlink-blue',
                           events: {
                               onClick: function(e,dc){
                                    $("#"+ctwl.VROUTER_DETAILS_TABS_ID).tabs({active:ctwl.VROUTER_NETWORKS_TAB_IDX});
                               }
                            },
                           minWidth:120
                       },
                       {
                           field:"ip_addr",
                           name:"IP Address",
                           minWidth:100,
                           formatter:function(r,c,v,cd,dc) {
                               var ipColumnContent = '',breakStmt = false;
                               if(dc['ip_addr'] != '0.0.0.0') {
                                   ipColumnContent = getLabelValueForIP(dc['ip_addr']);
                                   breakStmt = true;
                               }
                               if(dc['raw_json']['ip6_active'] == 'Active') {
                                   if(breakStmt)
                                       ipColumnContent += "<br/>"+getLabelValueForIP(dc['raw_json']['ip6_addr']);
                                   else
                                       ipColumnContent += getLabelValueForIP(dc['raw_json']['ip6_addr']);
                               }
                               return ipColumnContent;
                           }
                       },
                       {
                           field:"disp_fip_list",
                           name:"Floating IP",
                           minWidth:100
                       },
                       {
                           field:"disp_vm_name",
                           name:"Instance",
                           cssClass: 'cell-hyperlink-blue',
                           //template:cellTemplate({cellText:'#= disp_vm_name #', name:'instance', tooltip:true}),
                           formatter:function(r,c,v,cd,dc) {
                              return cellTemplateLinks({cellText:'disp_vm_name',name:'name',rowData:dc});
                           },
                           events: {
                              onClick: function(e,dc) {
                                if(dc['vm_name'] != null && dc['vm_name'].trim() != '' && viewConfig['isUnderlayPage'] != true) {
                                  setInstanceURLHashParams(null, dc['vn_name'], dc['vm_uuid'], true);
                                  //layoutHandler.setURLHashParams({vmName:dc['vm_name'],fqName:dc['vm_uuid'],srcVN:dc['vn_name']},{p:'mon_networking_instances',merge:false,triggerHashChange:true});
                                }
                              }
                           },
                           minWidth:200
                       }
                   ];

            return {
                elementId: ctwl.VROUTER_INTERFACES_GRID_ID,
                title: 'Routes',
                view: "GridView",
                viewConfig: {
                    elementConfig: getGridConfig( columns)
                }
            }
        }
    });

    function getGridConfig( columns) {
        var gridElementConfig = {
            header: {
                title: {
                    text: 'Interfaces'
                },
                customControls : monitorInfraUtils.getGridPaginationControls(),
                defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
            footer:false,
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    sortable: false,
                    detail: ctwu.getDetailTemplateConfigToDisplayRawJSON()
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Interfaces..',
                    },
                    empty: {
                        text: 'No Interfaces to display'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Data.'
                    }
                }
            },
            columnHeader: {
                columns: columns
            }
        };
        return gridElementConfig;
    };


    return VRouterInterfacesGridView;
});
