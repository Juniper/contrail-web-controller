/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var GridDS;
    var AlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                projectFQN = viewConfig['projectFQN'],
                pagerOptions = viewConfig['pagerOptions'];

            var alarmRemoteConfig = {
                url: ctwc.get(ctwc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now()),
                type: 'GET'
            };

            // TODO: Handle multi-tenancy
            //var ucid = projectFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + projectFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST;

            self.renderView4Config(self.$el, self.model, getAlarmGridViewConfig(alarmRemoteConfig, pagerOptions));

            //inialize the severity dropdown
            $('#ddSeverity').contrailDropdown({
                dataTextField: 'text',
                dataValueField: 'value',
                change: onSeverityChanged
            });
            var ddSeverity = $('#ddSeverity').data('contrailDropdown');
            ddSeverity.setData([{text: 'All', value: 'all'}, {text: 'Major', value: '3'}, {text: 'Minor', value: '4'}]);
            ddSeverity.value('all');
            GridDS = $('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid')._dataView.getItems()
        }
    });

    function onSeverityChanged(e) {
        filterGridDataBySeverity(e.added.value);
    }

    function filterGridDataBySeverity(severity) {
        var filterdDS = [];
        if (severity !== 'all') {
            for (var i = 0; i < GridDS.length; i++) {
                if (GridDS[i].severity === parseInt(severity, 10)) {
                    filterdDS.push(GridDS[i]);
                }
            }
        } else {
            filterdDS = GridDS;
        }
        var gridAlarms = $('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid');
        gridAlarms._dataView.setData(filterdDS)
    }

    var getAlarmGridViewConfig = function (alarmRemoteConfig, pagerOptions) {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_ALARM_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ALARMS_GRID_ID,
                                title: ctwl.TITLE_ALARMS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(alarmRemoteConfig, pagerOptions)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function (alarmRemoteConfig, pagerOptions) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_ALARMS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                },
                customControls: ['<a id="btnAcknowledge" class="disabled-link" title="Acknowledge"><i class="  icon-check-sign"></i></a>', 'Severity: <div id="ddSeverity" style="width:65px;"/>']
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function (e) {
                            $('#btnAcknowledge').addClass('disabled-link');
                        },
                        onSomethingChecked: function (e) {
                            $('#btnAcknowledge').removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig,
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getAlarmDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: alarmRemoteConfig,
                        dataParser: ctwp.alarmDataParser
                    }
                }
            },
            columnHeader: {
                columns: ctwgc.alarmsColumns
            },
            footer: {
                pager: contrail.handleIfNull(pagerOptions, {options: {pageSize: 5, pageSizeSelect: [5, 10, 50, 100]}})
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig(gridElId) {
        return [
            ctwgc.getAcknowledgeAction(function (rowIndex) {
                var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            }),
            ctwgc.getAlertHistoryAction(function (rowIndex) {
                var dataItem = $(gridElId).data('contrailGrid')._dataView.getItem(rowIndex);
            })
        ];
    };


    function getAlarmDetailsTemplateConfig() {
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
                                            title: ctwl.TITLE_ALARM_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'severity',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'timestamp',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'type',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'ack',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                // {
                                                // key: 'description',
                                                // templateGenerator: 'TextGenerator'
                                                // }
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

    return AlarmGridView;
});
