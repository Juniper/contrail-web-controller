/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/vRouterEncryptionModel',
    'config/infra/globalconfig/ui/js/views/vRouterEncryptionEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, VRouterEncryptionModel, VRouterEncryptionEditView, GlobalConfigFormatters) {
    var vrouterEncryptionEditView = new VRouterEncryptionEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#" + ctwc.GLOBAL_VROUTER_ENCRYPTION_GRID_ID;
        vrouter=[];

    var vrouterEncryptionGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            vrouterEncryptionEditView.encryptDataObj = viewConfig.encryptDataObj;
            vrouter =viewConfig.encryptDataObj;
            self.renderView4Config(self.$el, self.model,
                                   getVRouterEncryptionGridViewConfig(pagerOptions));
        }
    });

    var getVRouterEncryptionGridViewConfig = function (pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwc.GLOBAL_VROUTER_ENCRYPTION_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.GLOBAL_VROUTER_ENCRYPTION_GRID_ID,
                                title: ctwl.TITLE_VROUTER_ENCRYPTION,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    var getConfiguration = function (pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ""
                },
                defaultControls: {
                    exportable: false
                },
                advanceControls: getHeaderActionConfig(),
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
                        text: 'Loading vRouter Encryption Options..'
                    },
                    empty: {
                        text: 'No vRouter Encryption Options Found.'
                    }
                }
            },
            columnHeader: {
                columns: vrouterEncryptionsColumns
            },
            footer: false
        };
        return gridElementConfig;
    };

    var vrouterEncryptionsColumns = [
        {
            id: 'name',
            field: 'name',
            maxWidth: '365',
            name: 'vRouter Encryption Options',
            cssClass: 'cell-text-blue',
            sortable: false
        },
        {
            id: 'value',
            field: 'value',
            name: 'Value',
            formatter: globalConfigFormatters.valueFormatter,
            sortable: false
        }
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.TITLE_EDIT_TUNNEL_ENCRYPTION,
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url : "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data : JSON.stringify({data:
                            [{type: 'global-vrouter-configs'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                        var vrouterEncryptionData = getValueByJsonPath(result,
                            "0;global-vrouter-configs;0;global-vrouter-config", {});
                        console.log(vrouter);
                        vrouterEncryptionData.vrouter =vrouter.vRouterList;
                        vrouterEncryptionModel = new VRouterEncryptionModel(vrouterEncryptionData);
                        vrouterEncryptionEditView.model = vrouterEncryptionModel;
                        vrouterEncryptionEditView.renderEditVRouterEncryption({
                                      "title": ctwl.TITLE_EDIT_TUNNEL_ENCRYPTION,
                                      callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    }, function(error){
                    });
                }
            }
        ];
        return headerActionConfig;
    }

   return vrouterEncryptionGridView;
});

