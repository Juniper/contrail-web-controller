/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/networking/fip/ui/js/models/fipCfgModel',
    'config/networking/fip/ui/js/views/fipCfgEditView',
    'config/networking/fip/ui/js/views/fipCfgFormatters'],
    function (_, ContrailView,
                FipCfgModel, FipCfgEditView, FipCfgFormatters) {
    var formatFipCfg = new FipCfgFormatters();
    var dataView;

    var fipCfgEditView = new FipCfgEditView();

    var fipCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getFipCfgGridViewConfig());
        }
    });


    var getFipCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_FIP_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_FIP_GRID_ID,
                                title: ctwl.CFG_FIP_TITLE,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
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
                    text: ctwl.CFG_FIP_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkFipRelease').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkFipRelease').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getFipCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Floating IPs.',
                    },
                    empty: {
                        text: 'No Floating IPs Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                     {
                         field:  'floating_ip_address',
                         name:   'Floating IP'
                     },
                     {
                         field:  'virtual_machine_interface_refs',
                         name:   'Mapped Fixed IP Address',
                         formatter: formatFipCfg.fixedIPGridFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         }
                     },
                     {
                         field:  'fq_name',
                         name:   'Floating IP Pool',
                         formatter: formatFipCfg.fipPoolFormatter,
                         sortable: {
                             sortBy: 'formattedValue'
                         },
                     }
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_FIP_TITLE_RELEASE,
                "iconClass": "fa fa-trash",
                "linkElementId": 'linkFipRelease',
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_FIP_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    fipCfgEditView.model = new FipCfgModel();
                    fipCfgEditView.renderMultiReleaseFipCfg({"title":
                                                            ctwl.CFG_FIP_TITLE_RELEASE,
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_FIP_TITLE_ALLOCATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    fipCfgEditView.model = new FipCfgModel();
		    
                    fipCfgEditView.renderAllocateFipCfg({
                                              "title": "Allocate",
                                              callback: function () {
                    $('#' + ctwl.CFG_FIP_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Associate Port', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_FIP_GRID_ID).data("contrailGrid")._dataView;
            fipCfgEditView.model = new FipCfgModel(dataView.getItem(rowIndex));
            fipCfgEditView.renderAssociateFipCfg({
                                  "title": ctwl.CFG_FIP_TITLE_ASSOCIATE,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Disassociate Port', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_FIP_GRID_ID).data("contrailGrid")._dataView;
            fipCfgEditView.model = new FipCfgModel(dataView.getItem(rowIndex));
            fipCfgEditView.renderDisAssociateFipCfg({
                                  "title": ctwl.CFG_FIP_TITLE_DISASSOCIATE,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];


    function getFipCfgDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-8',
                                    rows: [
                                        {
                                            title: ctwl.CFG_FIP_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    label: 'Floating IP Address',
                                                    key: 'floating_ip_address',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Specific Fixed IP / Virtual IP',
                                                    key: 'floating_ip_fixed_ip_address',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Mapped Fixed IP Address',
                                                    key: 'virtual_machine_interface_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'fixedIPFormatterExp'
                                                    }
                                                },
                                                {
                                                    label: 'Floating IP Pool',
                                                    key: 'fq_name',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'fipPoolFormatter'
                                                    }
                                                }
                                            ]
                                        },
                                        //permissions
                                        ctwu.getRBACPermissionExpandDetails()
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.fipPoolFormatter = function (v, dc) {
        return formatFipCfg.fipPoolFormatter(null, null,
                                                    null, null, dc);
    }

    this.fixedIPFormatterExp = function (v, dc) {
        return formatFipCfg.fixedIPGridFormatter(null, null,
                                                  null, null,dc,true);
    }

    return fipCfgGridView;
});
