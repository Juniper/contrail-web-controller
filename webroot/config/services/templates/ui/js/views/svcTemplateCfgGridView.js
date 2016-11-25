/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/templates/ui/js/models/svcTemplateCfgModel',
    'config/services/templates/ui/js/views/svcTemplateCfgEditView',
    'config/services/templates/ui/js/views/svcTemplateCfgFormatters'
    ], function (_, ContrailView,
        SvcTemplateCfgModel, SvcTemplateCfgEditView,
        SvcTemplateCfgFormatters) {
    var formatSvcTemplateCfg = new SvcTemplateCfgFormatters();
    var dataView;

    var svcTemplateCfgEditView = new SvcTemplateCfgEditView();

    var self;
    var svcTemplateCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getSvcTemplateCfgGridViewConfig());
        }
    });


    var getSvcTemplateCfgGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId(
                                    [ctwl.CFG_SVC_TEMPLATE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SVC_TEMPLATE_GRID_ID,
                                title: ctwl.CFG_SVC_TEMPLATE_TITLE,
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
                    text: ctwl.CFG_SVC_TEMPLATE_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkSvcTemplateDelete').addClass(
                                                            'disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkSvcTemplateDelete').removeClass(
                                                            'disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getSvcTemplateCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Service Templates..'
                    },
                    empty: {
                        text: 'No Service Templates Found.'
                    }
                }
            },
            columnHeader: {
                //Change these once the ajax url is changed
                columns: [
                    {
                         field:  'display_name',
                         name:   'Template',
                         formatter: formatSvcTemplateCfg.displayNameFormatter,
                             sortable: {
                             sortBy: 'formattedValue'
                         },
                    },
                    {
                         field:  'service_template_properties.service_mode',
                         name:   'Mode',
                         formatter: formatSvcTemplateCfg.serviceModeFormatter,
                             sortable: {
                             sortBy: 'formattedValue'
                         },
                    },
                    {
                         field:  'service_template_properties.service_type',
                         name:   'Type / Version',
                         formatter: formatSvcTemplateCfg.serviceTypeFormatter,
                             sortable: {
                             sortBy: 'formattedValue'
                         },
                    },
                    {
                         field:  'service_template_properties.interface_type',
                         name:   'Interface (s)',
                         formatter: formatSvcTemplateCfg.interfaceFormatter,
                             sortable: {
                             sortBy: 'formattedValue'
                         },
                    },
                    {
                         field:  'service_template_properties',
                         name:   'Image & Flavor',
                         formatter: formatSvcTemplateCfg.imageFlavorFormatter,
                             sortable: {
                             sortBy: 'formattedValue'
                         },
                    },
                ]
            },
        };
        return gridElementConfig;
    };

    function addModelAttr (model) {
        model.isSvcVirtTypeNonPhysicalDevice = ko.computed((function() {
            if ('physical-device' !=
                this.user_created_service_virtualization_type()) {
                return true;
            }
            return false;
        }), model);
        model.showIfNotTmplV2 = ko.computed((function() {
            if (2 == this.user_created_version()) {
                return false;
            }
            return true;
        }), model);
        model.isSvcVirtTypePhysicalDevice = ko.computed((function() {
            if ('physical-device' ==
                this.user_created_service_virtualization_type()) {
                return true;
            }
            return false;
        }), model);
        model.showImageList = ko.computed((function() {
            var tmplVersion = this.user_created_version();
            if (2 == tmplVersion) {
                return false;
            }
            var virtType = this.user_created_service_virtualization_type();
            return ('physical-device' != virtType);
        }), model);
    }

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_SVC_TEMPLATE_TITLE_MULTI_DELETE,
                "iconClass": "fa fa-trash",
                "linkElementId": "linkSvcTemplateDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_SVC_TEMPLATE_GRID_ID;
                    var checkedRows =
                            $(gridElId).data("contrailGrid").getCheckedRows();

                    svcTemplateCfgEditView.model = new SvcTemplateCfgModel();
                    svcTemplateCfgEditView.renderMultiDeleteSvcTemplateCfg(
                                            {"title":
                                            ctwl.CFG_SVC_TEMPLATE_TITLE_MULTI_DELETE,
                                            checkedRows: checkedRows,
                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_SVC_TEMPLATE_TITLE_CREATE,
                "iconClass": "fa fa-plus",
                "onClick": function () {
                    svcTemplateCfgEditView.model = new SvcTemplateCfgModel();

                    addModelAttr(svcTemplateCfgEditView.model);
                    svcTemplateCfgEditView.renderAddSvcTemplateCfg({
                              "title": ctwl.CREATE,
                              callback: function () {
                    $('#' +
                    ctwl.CFG_SVC_TEMPLATE_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' +
                ctwl.CFG_SVC_TEMPLATE_GRID_ID).data("contrailGrid")._dataView;
            svcTemplateCfgEditView.model = new SvcTemplateCfgModel();
            svcTemplateCfgEditView.renderMultiDeleteSvcTemplateCfg({
                                  "title": ctwl.CFG_SVC_TEMPLATE_TITLE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];


    function getSvcTemplateCfgDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        //Change  once the AJAX call is corrected
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'col-xs-12',
                                    rows: [
                                        {
                                            title:
                                            ctwl.CFG_SVC_TEMPLATE_TITLE_DETAILS,
                                            templateGenerator:
                                                'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'name',
                                                    label: 'Name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'display_name',
                                                    label: 'Display Name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key:
                                                        'service_template_properties.version',
                                                    templateGenerator:
                                                        'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.service_mode',
                                                    label: 'Mode',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serviceModeFormatter'
                                                    }
                                                },
                                                //Following two need custom formatters
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.service_type',
                                                    label: 'Type',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serviceTypeFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.service_scaling',
                                                    label: 'Scaling',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serviceScalingFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    label: 'Availability Zone',
                                                    key: 'service_template_properties.availability_zone_enable',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'serviceZoneFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.interface_type',
                                                    label: 'Interface Type (s)',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'ifTypeDetailsFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.image_name',
                                                    label: 'Image',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.flavor',
                                                    label: 'Flavor',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.service_virtualization_type',
                                                    label: 'Virtualization Type',
                                                    templateGenerator:
                                                        'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter:
                                                            'svcVirtTypeFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key:
                                                        'service_appliance_set',
                                                    label: 'Service Appliance' +
                                                        ' Set',
                                                    templateGenerator:
                                                        'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter:
                                                            'svcApplSetFormatter'
                                                    }
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_template_properties.instance_data',
                                                    label: 'Instance Data',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    keyClass:'col-xs-3',
                                                    key: 'service_instance_back_refs',
                                                    label: 'Service Instances',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'svcInstancesFormatter'
                                                    }
                                                },
                                            ]
                                        },
                                        //permissions
                                        ctwu.getRBACPermissionExpandDetails('col-xs-3')
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.serviceModeFormatter = function (v, dc) {
        return formatSvcTemplateCfg.serviceModeFormatter(null, null,
                                                                null, null, dc);
    }

    this.serviceTypeFormatter = function (v, dc) {
        return formatSvcTemplateCfg.serviceTypeFormatter(null, null,
                                                                null, null, dc);
    }

    this.serviceScalingFormatter = function (v, dc) {
        return formatSvcTemplateCfg.serviceScalingFormatter(null, null,
                                                             null, null, dc);
    }

    this.ifTypeDetailsFormatter = function (v, dc) {
        return formatSvcTemplateCfg.ifTypeDetailsFormatter(null, null,
                                                                null, null, dc);
    }

    this.svcInstancesFormatter = function (v, dc) {
        return formatSvcTemplateCfg.svcInstancesFormatter(null, null,
                                                                 null, null, dc);
    }

    this.svcVirtTypeFormatter = function (v, dc) {
        return formatSvcTemplateCfg.svcVirtTypeFormatter(null, null,
                                                         null, null, dc);
    }

    this.svcApplSetFormatter = function (v, dc) {
        return formatSvcTemplateCfg.svcApplSetFormatter(null, null,
                                                        null, null, dc);
    }

    this.serviceZoneFormatter = function (v, dc) {
        return formatSvcTemplateCfg.serviceZoneFormatter(null, null,
                                                             null, null, dc);
    }

    return svcTemplateCfgGridView;
});
