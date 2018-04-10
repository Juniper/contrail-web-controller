/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var serviceGroupProjectListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"],
                elementId;
                if(viewConfig.isWizard === true){
                    elementId = ctwc.FW_WZ_ID_PREFIX;
                }else{
                    elementId = ctwc.STANDALONE_ID_PREFIX;
                }
                var listModelConfig;
                if(viewConfig.dataType === ctwc.FW_DRAFTED) {
                    listModelConfig = {
                            remote: {
                                ajaxConfig: {
                                    url: "/api/tenants/config/get-config-details",
                                    type: "POST",
                                    data: JSON.stringify(
                                        {data: [{type: 'service-groups',
                                            parent_type: 'policy-management',
                                            parent_fq_name_str:
                                                contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                                currentProject.name + ':' +
                                                ctwc.DRAFT_POLICY_MANAGEMENT }]})
                                },
                                dataParser: self.parseServiceGroupsData,
                            }
                        };
                } else {
                    listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: "/api/tenants/config/get-config-details",
                                type: "POST",
                                data: JSON.stringify(
                                    {data: [{type: 'service-groups',
                                        parent_id: currentProject.value}]})
                            },
                            dataParser: self.parseServiceGroupsData,
                        }
                    };
                }
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getServiceGroupGridViewConfig(viewConfig,elementId));
            $("#aps-back-button").off('click').on('click', function(){
                $('#modal-landing-container').show();
                $("#aps-gird-container").empty();
                $('#aps-landing-container').hide();
            });
        },
        parseServiceGroupsData : function(response){
            var dataItems = [],
                tagData = getValueByJsonPath(response, "0;service-groups", []);
                _.each(tagData, function(val){
                        if("service-group" in val) {
                            dataItems.push(val["service-group"]);
                        }
                });
            return dataItems;
        }
    });

    var getServiceGroupGridViewConfig = function (viewConfig,elementId) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_SERVICE_GRP_SECTION_ID.concat(elementId)]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_SERVICE_GRP_ID.concat(elementId),
                                view: "serviceGroupGridView",
                                viewPathPrefix: "config/firewall/common/servicegroup/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: false,
                                    viewMode: viewConfig.dataType,
                                    elementIdPrefix:elementId,
                                    projectSelectedValueData: viewConfig.projectSelectedValueData,
                                    hashParams:viewConfig.hashParams,
                                    isWizard: viewConfig.isWizard
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return serviceGroupProjectListView;
});

