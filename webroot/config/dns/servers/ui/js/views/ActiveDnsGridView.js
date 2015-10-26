/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/dns/servers/ui/js/models/ActiveDnsModel',
    'config/dns/servers/ui/js/views/ActiveDnsEditView'
], function (_, ContrailView, ActiveDnsDatabaseModel, ActiveDnsEditView) {
    var ActiveDnsEditView = new ActiveDnsEditView(),
    gridElId = "#ActiveDnsGrid";

    var ActiveDnsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            this.renderView4Config(self.$el, self.model,
                                   getActiveDnsGridViewConfig(pagerOptions));
        }
    });

    var getActiveDnsGridViewConfig = function (pagerOptions) {
        return {
            elementId: "ActiveDnsListView",
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'ActiveDnsGrid',
                                title: 'Active DNS Database',
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: "Active DNS Database"
                },
				customControls : [
                        '<a class="widget-toolbar-icon"><i class="icon-forward"></i></a>',
                        '<a class="widget-toolbar-icon"><i class="icon-backward"></i></a>',
                    ],
		    defaultControls: {
                    collapseable: true,
                    exportable: true,
                    refreshable: false,
                    searchable: true
                }
            },
			
            body: {
                options: {
                   
                    detail: {
                        //template:
                          //  cowu.generateDetailTemplateHTML(getDNSDetailsTemplateConfig(),
                            //                                cowc.APP_CONTRAIL_CONTROLLER)
                    },
                   checkboxSelectable: false,
                },
                dataSource: {
                }
            },
            columnHeader: {
                columns: ActiveDnsColumns
            },
			footer: false
        };
        return gridElementConfig;
    };
		 ActiveDnsColumns = [
                {
                        id: 'name',
                        field: 'name',
                        name: 'Name'
                },
				{
                        id: 'rec_name',
                        field: 'rec_name',
                        name: 'DNS Record Name'
                },
				{
                        id: 'rec_type',
                        field: 'rec_type',
                        name: 'DNS Record Type'
                },
				{
                        id: 'rec_data',
                        field: 'rec_data',
                        name: 'DNS Record Data'
                },
				{
                        id: 'source',
                        field: 'source',
                        name: 'Source'
                },
				{
                        id: 'installed',
                        field: 'installed',
                        name: 'Installed'
                }
        ];
		
	
   return ActiveDnsGridView;
});

