/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var projectSecPolicySettingsListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify({data: [{type: "projects",
                            obj_uuids: [currentProject.value]}]})
                    },
                    dataParser: self.parseSecPolicyOptionsData,
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getSecPolicyOptionsGridViewConfig(currentProject));
        },
        parseSecPolicyOptionsData : function(result){
            var gridDS = [],
                projectDeatils = _.get(result, "0.projects.0.project", {});
            _.each(ctwc.GLOBAL_POLICY_MANAGEMENT_OPTIONS_MAP, function(polMgmtOption){
                gridDS.push({name: polMgmtOption.name, key: polMgmtOption.key,
                    value: projectDeatils[polMgmtOption.key] ? projectDeatils[polMgmtOption.key] : false});
            });
            return gridDS;
        }
    });

    var getSecPolicyOptionsGridViewConfig = function (currentProject) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_POLICY_MGMT_OPTIONS_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_POLICY_MGMT_OPTIONS_ID,
                                view: "securityPolicyOptionsGridView",
                                viewPathPrefix: "config/infra/globalconfig/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: false,
                                    projectId: currentProject.value
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return projectSecPolicySettingsListView;
});

