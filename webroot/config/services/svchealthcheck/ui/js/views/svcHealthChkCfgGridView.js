/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/services/svchealthcheck/ui/js/models/svcHealthChkModel',
    'config/services/svchealthcheck/ui/js/views/svcHealthChkCfgEditView'],
    function (_, ContrailView,
        SvcHealthChkModel, SvcHealthChkCfgEditView) {
    var dataView;
    var svcHealthChkEditView = new SvcHealthChkCfgEditView();

    var svcHealthChkCfgGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;

            this.renderView4Config(self.$el, self.model,
                                   getSvcHealthChkGridViewConfig());
        }
    });


    var getSvcHealthChkGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.CFG_SVC_HEALTH_CHK_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CFG_SVC_HEALTH_CHK_GRID_ID,
                                title: ctwl.CFG_SVC_HEALTH_CHK_TITLE,
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
                    text: ctwl.CFG_SVC_HEALTH_CHK_TITLE
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    /* Required, modify to use for enabling disabling edit button */
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#linkSvcHealthChkDelete').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#linkSvcHealthChkDelete').removeClass('disabled-link');
                        }
                    },
                    actionCell:rowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(
                                       getSvcHealthChkCfgDetailsTemplateConfig(),
                                       cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {data: []},
                statusMessages: {
                    loading: {
                        text: 'Loading Health Checks..'
                    },
                    empty: {
                        text: 'No Health Checks Found.'
                    }
                }
            },
            columnHeader: {
                //Change these once the ajax url is changed
                columns: [
                     {
                         field:  'display_name',
                         name:   'Health Check',
                         formatter: showName,
                         sortable: { sortBy: 'formattedValue'},
                     },
                     {
                         field:  'service_health_check_properties.url_path',
                         name:   'Monitor Target',
                         formatter: getTarget,
                         sortable: { sortBy: 'formattedValue'},
                     },
                     {
                         field:  'service_health_check_properties',
                         name:   'Delay (secs)',
                         formatter: getDelay,
                         sortable: { sortBy: 'formattedValue'},
                     },
                     {
                         field:  'service_health_check_properties.timeout',
                         name:   'Timeout (secs)',
                         formatter: getTimeout,
                         sortable: { sortBy: 'formattedValue'},
                     },
                     {
                         field:  'service_health_check_properties.max_retries',
                         name:   'Retries',
                         formatter: getRetries,
                         sortable: { sortBy: 'formattedValue'},
                     },
                ]
            },
        };
        return gridElementConfig;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": ctwl.CFG_SVC_HEALTH_CHK_TITLE_DELETE,
                "iconClass": "icon-trash",
                "linkElementId": "linkSvcHealthChkDelete",
                "onClick": function () {
                    var gridElId = '#' + ctwl.CFG_SVC_HEALTH_CHK_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();

                    svcHealthChkEditView.model = new SvcHealthChkModel();
                    svcHealthChkEditView.renderMultiDeleteSvcHealthChkCfg({"title":
                                                            ctwl.CFG_SVC_HEALTH_CHK_TITLE_MULTI_DELETE,
                                                            checkedRows: checkedRows,
                                                            callback: function () {
                        $(gridElId).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            },
            {
                "type": "link",
                "title": ctwl.CFG_SVC_HEALTH_CHK_TITLE_CREATE,
                "iconClass": "icon-plus",
                "onClick": function () {
                    svcHealthChkEditView.model = new SvcHealthChkModel();

                    svcHealthChkEditView.renderAddSvcHealthChkCfg({
                                              "title": ctwl.CFG_SVC_HEALTH_CHK_TITLE_CREATE,
                                              callback: function () {
                    $('#' + ctwl.CFG_SVC_HEALTH_CHK_GRID_ID).data("contrailGrid")._dataView.refreshData();
                    }});
                }
            }

        ];
        return headerActionConfig;
    }

    var rowActionConfig = [
        ctwgc.getEditConfig('Edit', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_SVC_HEALTH_CHK_GRID_ID).data("contrailGrid")._dataView;
            svcHealthChkEditView.model = new SvcHealthChkModel(dataView.getItem(rowIndex));
            svcHealthChkEditView.renderEditSvcHealthChkCfg({
                                  "title": ctwl.CFG_SVC_HEALTH_CHK_TITLE_EDIT,
                                  callback: function () {
                                      dataView.refreshData();
            }});
        }),
        ctwgc.getDeleteConfig('Delete', function(rowIndex) {
            dataView = $('#' + ctwl.CFG_SVC_HEALTH_CHK_GRID_ID).data("contrailGrid")._dataView;
            svcHealthChkEditView.model = new SvcHealthChkModel();
            svcHealthChkEditView.renderMultiDeleteSvcHealthChkCfg({
                                  "title": ctwl.CFG_SVC_HEALTH_CHK_TITLE_DELETE,
                                  checkedRows: [dataView.getItem(rowIndex)],
                                  callback: function () {
                                      dataView.refreshData();
            }});
        })
    ];


    function getSvcHealthChkCfgDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'span6',
                                    rows: [
                                        {
                                            title: ctwl.CFG_SVC_HEALTH_CHK_TITLE_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                               {
                                                    label: 'Name',
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Display Name',
                                                    key: 'display_name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'uuid',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Protocol',
                                                    key: 'service_health_check_properties.monitor_type',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Monitor Target',
                                                    key: 'service_health_check_properties.url_path',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    label: 'Delay (secs)',
                                                    key: 'service_health_check_properties.delay',
                                                    templateGenerator: 'TextGenerator',
                                                },
                                                {
                                                    label: 'Timeout (secs)',
                                                    key: 'service_health_check_properties.timeout',
                                                    templateGenerator: 'TextGenerator',
                                                },
                                                {
                                                    label: 'Retries',
                                                    key: 'service_health_check_properties.max_retries',
                                                    templateGenerator: 'TextGenerator',
                                                },
                                                {
                                                    label: 'Associated Service Instance(s)',
                                                    key: 'service_instance_refs',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'svcInstancesFormatter'
                                                    }
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.showName = function (r, c, v, cd, dc) {
        return ctwu.getDisplayNameOrName(dc);
    }

    this.getTarget = function (r, c, v, cd, dc) {
        var protocol = getValueByJsonPath(dc,
                'service_health_check_properties;monitor_type', 'HTTP');
        var target =  getValueByJsonPath(dc,
                'service_health_check_properties;url_path', '-');

        if (target.indexOf('://') == -1 && target != '-') {
            target = protocol.toLowerCase() + '://' + target;
        }
        
        return target; 
    }

    this.getTimeout = function (r, c, v, cd, dc) {
        return getValueByJsonPath(dc,
                'service_health_check_properties;timeout', '-');
    }

    this.getDelay = function (r, c, v, cd, dc) {
        return getValueByJsonPath(dc,
                'service_health_check_properties;delay', '-');
    }

    this.getRetries = function (r, c, v, cd, dc) {
        return getValueByJsonPath(dc,
                'service_health_check_properties;max_retries', 'None');
    }

    this.svcInstancesFormatter = function (v, dc) {
        var instList = getValueByJsonPath(dc,
                'service_instance_refs', []),
            instRefs = '';

        $.each(instList, function (i, svcInst) {
            instRefs += svcInst['to'][2] +
                ' (' + svcInst['to'][1] + ') <br>';
        });

        return instRefs == '' ? '-' : instRefs; 
    }

    return svcHealthChkCfgGridView;
});
