/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'reports/qe/ui/js/models/FlowSeriesFormModel'
], function (_, QueryFormView, Knockback, FlowSeriesFormModel) {

    var FlowSeriesFormView = QueryFormView.extend({
        render: function (options) {
            var self = this,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                viewConfig = self.attributes.viewConfig,
                formData = contrail.checkIfExist(viewConfig.formData) ? viewConfig.formData : {},
                queryResultType = contrail.checkIfExist(viewConfig.queryResultType) ? viewConfig.queryResultType : 'new',
                formQueryIdSuffix = (!$.isEmptyObject(formData)) ? '-' + formData.queryId : '',
                flowSeriesQueryModel = new FlowSeriesFormModel(formData),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX + formQueryIdSuffix,
                flowSeriesId = cowl.QE_FLOW_SERIES_ID + formQueryIdSuffix;

            self.model = flowSeriesQueryModel;
            self.$el.append(queryPageTmpl({queryPrefix: cowc.FS_QUERY_PREFIX, formQueryIdSuffix: formQueryIdSuffix }));

            self.renderView4Config($(queryFormId), this.model, self.getViewConfig(), null, null, null, function () {
                self.model.showErrorAttr(flowSeriesId, false);
                Knockback.applyBindings(self.model, document.getElementById(flowSeriesId));
                kbValidation.bind(self);
                $("#run_query").on('click', function() {
                    if (self.model.model().isValid(true, 'runQueryValidation')) {
                        self.renderQueryResult('new', formData);
                    }
                });

                if (queryResultType !== 'new') {
                    self.renderQueryResult(queryResultType, formData);
                }
            });

            if (widgetConfig !== null) {
                self.renderView4Config($(queryFormId), self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function(queryResultType, formData) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                formQueryIdSuffix = (formData !== null && !$.isEmptyObject(formData)) ? '-' + formData.queryId : '',
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_FORM_SUFFIX + formQueryIdSuffix,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.FS_QUERY_PREFIX + cowc.QE_RESULTS_SUFFIX + formQueryIdSuffix,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                responseViewConfig = {
                    view: "FlowSeriesResultView",
                    viewPathPrefix: "reports/qe/ui/js/views/",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        formData: formData,
                        queryResultType: queryResultType
                    }
                };

            if (widgetConfig !== null && queryResultType == 'new') {
                $(queryFormId).parents('.widget-box').data('widget-action').collapse();
            }

            self.renderView4Config($(queryResultId), this.model, responseViewConfig);
        },

        getViewConfig: function () {
            var self = this;

            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range', dataBindValue: 'time_range', class: "span3",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span3",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span3",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'select', view: "FormTextAreaView",
                                    viewConfig: {path: 'select', dataBindValue: 'select', class: "span9", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderSelect({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                },
                                {
                                    elementId: 'time-granularity-section',
                                    view: "FormCompositeView",
                                    viewConfig: {
                                        class: "span3",
                                        style: 'display: none;',
                                        path: 'time_granularity',
                                        label: 'Time Granularity',
                                        visible: 'select_data_object().checked_fields.indexOf("T=") != -1 ',
                                        childView: [
                                            {
                                                elementId: 'time_granularity', view: "FormNumericTextboxView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity',
                                                    dataBindValue: 'time_granularity',
                                                    class: "span4",
                                                    elementConfig: {min: 1}
                                                }
                                            },
                                            {
                                                elementId: 'time_granularity_unit', view: "FormDropdownView",
                                                viewConfig: {
                                                    label: false,
                                                    path: 'time_granularity_unit',
                                                    dataBindValue: 'time_granularity_unit',
                                                    dataBindOptionList: 'getTimeGranularityUnits()',
                                                    class: "span4",
                                                    elementConfig: {}
                                                }
                                            }
                                        ]

                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'where', view: "FormTextAreaView",
                                    viewConfig: {path: 'where', dataBindValue: 'where', class: "span9", placeHolder: "*", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderWhere({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                },
                                {
                                    elementId: 'direction', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'direction', dataBindValue: 'direction', class: "span3",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.DIRECTION_DROPDOWN_VALUES}
                                    }
                                }
                            ]
                        },
                        /*
                        {
                            columns: [
                                {
                                    elementId: 'filters', view: "FormTextAreaView",
                                    viewConfig: {path: 'filters', dataBindValue: 'filters', class: "span9", editPopupConfig: {
                                        renderEditFn: function() {
                                            self.renderFilters({className: cowc.QE_MODAL_CLASS_700});
                                        }
                                    }}
                                }
                            ]
                        },
                        */
                        {
                            columns: [
                                {
                                    elementId: 'run_query', view: "FormButtonView", label: "Run Query",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    return FlowSeriesFormView;
});