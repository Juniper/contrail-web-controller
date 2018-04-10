/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var addressGroupGlobalListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                elementId;
                if(viewConfig.isWizard === true){
                    elementId = ctwc.FW_WZ_ID_PREFIX;
                }else{
                    elementId = ctwc.STANDALONE_ID_PREFIX;
                }
                var parentFqNameStr = viewConfig.dataType === ctwc.FW_DRAFTED ?
                        "draft-policy-management" : "default-policy-management";
                var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: "/api/tenants/config/get-config-details",
                            type: "POST",
                            data: JSON.stringify(
                                {data: [{type: 'address-groups',
                                    parent_type: "policy-management",
                                    parent_fq_name_str: parentFqNameStr}]})
                        },
                        dataParser: self.parseAddressData,
                    }
                };
                var contrailListModel = new ContrailListModel(listModelConfig);
                this.renderView4Config(this.$el,
                     contrailListModel, getAddressGroupGridViewConfig(viewConfig,elementId));
                $("#aps-back-button").off('click').on('click', function(){
                    $('#modal-landing-container').show();
                    $("#aps-gird-container").empty();
                    $('#aps-landing-container').hide();
                });
        },
        parseAddressData : function(response){
            var dataItems = [],
                addressGroupData = getValueByJsonPath(response, "0;address-groups", []);
                _.each(addressGroupData, function(val){
                    dataItems.push(val['address-group']);
                });
            return dataItems;
        }
    });

    var getAddressGroupGridViewConfig = function (viewConfig,elementId) {
        return {
            elementId: cowu.formatElementId([ctwc.SECURITY_POLICY_ADDRESS_GRP_SECTION_ID.concat(elementId)]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.SECURITY_POLICY_ADDRESS_GRP_ID.concat(elementId),
                                view: "addressGroupGridView",
                                viewPathPrefix: "config/firewall/common/addressgroup/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isGlobal: true,
                                    viewMode: viewConfig.dataType,
                                    elementIdPrefix:elementId,
                                    isWizard: viewConfig.isWizard,
                                    wizardMode:viewConfig.wizardMode
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return addressGroupGlobalListView;
});

