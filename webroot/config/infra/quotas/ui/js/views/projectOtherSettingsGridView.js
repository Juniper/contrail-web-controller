/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/quotas/ui/js/models/projectOtherSettingsModel',
    'config/infra/quotas/ui/js/views/projectOtherSettingsEditView'
], function (_, ContrailView, ProjectOtherSettingsModel, ProjectOtherSettingsEditView) {
    var projectOtherSettingsEditView = new ProjectOtherSettingsEditView(),
        gridElId = "#" + ctwc.CONFIG_PROJECT_OTHER_SETTINGS_GRID_ID;

    var projectOtherSettingsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                                   getProjectOtherSettingsGridViewConfig(viewConfig));
        }
    });

    var getProjectOtherSettingsGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_PROJECT_OTHER_SETTINGS_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_PROJECT_OTHER_SETTINGS_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    var getConfiguration = function (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_PROJECT_OTHER_SETTINGS
                },
                defaultControls: {
                    exportable: false
                },
                advanceControls: getHeaderActionConfig(viewConfig),
            },
            body: {
                options: {
                    checkboxSelectable : false,
                    detail: false,
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading ' + ctwl.TITLE_PROJECT_OTHER_SETTINGS + '..'
                    },
                    empty: {
                        text: 'No ' + ctwl.TITLE_PROJECT_OTHER_SETTINGS + ' Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting' + ctwl.TITLE_PROJECT_OTHER_SETTINGS + '.'
                    }
                }
            },
            columnHeader: {
                columns: projectOtherSettingsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var projectOtherSettingsColumns = [
        {
            id: 'name',
            field: 'name',
            maxWidth: '365',
            name: 'Option',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: function(row, col, val, d, rowData) {
                if(val === true) {
                    return ctwl.TITLE_VXLAN_ROUTING_ENABLED;
                } else {
                    return ctwl.TITLE_VXLAN_ROUTING_DISABLED;
                }
            },
            sortable: false
        }
    ];

    function getHeaderActionConfig(viewConfig) {
        var currentProject = viewConfig["projectSelectedValueData"];
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_PROJECT_OTHER_SETTINGS,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : ctwc.URL_GET_CONFIG_DETAILS,
                        type : 'POST',
                        data : JSON.stringify({data: [{type: "projects",
                            obj_uuids: [currentProject.value]}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                        var projectDeatils = getValueByJsonPath(result,
                                "0;projects;0;project", {});
                        projectOtherSettingsModel = new ProjectOtherSettingsModel(projectDeatils);
                        projectOtherSettingsEditView.model = projectOtherSettingsModel;
                        projectOtherSettingsEditView.renderEditProjectOtherSettings({
                                      "title": ctwl.TITLE_EDIT_PROJECT_OTHER_SETTINGS,
                                      projUUID: currentProject.value,
                                      callback: function() {
                            var dataView =
                                $("#" + ctwc.CONFIG_PROJECT_OTHER_SETTINGS_GRID_ID).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }, function(error){
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return projectOtherSettingsGridView;
});

