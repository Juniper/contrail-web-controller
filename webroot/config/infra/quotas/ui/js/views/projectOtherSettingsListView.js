/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var configObj = {};
    var self;
    var projectOtherSettingsListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;
            currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify({data: [{type: "projects",
                                obj_uuids: [currentProject.value]}]})
                    },
                    dataParser: self.parseProjOtherSettingsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getProjOtherSettingsGridViewConfig(viewConfig));
        },

        parseProjOtherSettingsData : function(result){
            var gridDS = [];
            var projectDeatils = getValueByJsonPath(result,
                "0;projects;0;project", {});
            _.each(ctwc.CONFIG_PROJECT_OTHER_SETTINGS_MAP, function(ProjOption){
                gridDS.push({name: ProjOption.name, key: ProjOption.key,
                    value: projectDeatils[ProjOption.key]});
            });
            return gridDS;
        }
    });

    var getProjOtherSettingsGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_PROJECT_OTHER_SETTINGS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_PROJECT_OTHER_SETTINGS_ID,
                                view: "projectOtherSettingsGridView",
                                viewPathPrefix: "config/infra/quotas/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: $.extend({}, viewConfig, {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    }
                                })
                            }
                        ]
                    }
                ]
            }
        }
    };

    return projectOtherSettingsListView;
});

