define([
    'underscore',
    'query-form-view',
    'knockback',
    'searchflow-model'
], function (_, QueryFormView, Knockback, SearchFlowFormModel) {
    var SearchFlowFormView = QueryFormView.extend({
        render: function() {
            var self = this, viewConfig = self.attributes.viewConfig,
            queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_FORM_RESULT),
            searchFlowFormModel = new SearchFlowFormModel({limit:5000}),
            widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                viewConfig.widgetConfig : null,
            queryFormId = "#" + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-form";

            self.model = searchFlowFormModel;
            self.$el.append(queryPageTmpl({
                prefix: ctwc.UNDERLAY_SEARCHFLOW_TAB_ID }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model,
                self.getViewConfig(), null, null, null,
                    function () {
                        self.model.showErrorAttr(ctwc.UNDERLAY_SEARCHFLOW_TAB_ID, false);
                        Knockback.applyBindings(self.model,
                            document.getElementById(ctwc.UNDERLAY_SEARCHFLOW_TAB_ID));
                        $("#run_query").on('click', function() {
                            $("#" + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-widget").find('.widget-body').hide();
                            self.renderQueryResult();
                        });
            });

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(queryFormId),
                    self.model, widgetConfig, null, null, null);
            }
        },
        renderQueryResult: function() {
            var self = this,
                queryResultId =
                    "#" + ctwc.UNDERLAY_SEARCHFLOW_TAB_ID + "-results",
                responseViewConfig = {
                    view: "SearchFlowResultView",
                    viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {}
                };

            self.renderView4Config($(self.$el).find(queryResultId),
                this.model, responseViewConfig);
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
                                    elementId: 'where', view: "FormTextAreaView",
                                    viewConfig: {
                                        path: 'where', dataBindValue: 'where',
                                        class: "span5", placeHolder: "*",
                                        editPopupConfig: {
                                            renderEditFn: function() {
                                                self.renderWhere();
                                            }
                                        }
                                    }
                                },{
                                    elementId: 'time_range',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range',
                                        dataBindValue: 'time_range',
                                        class: "span2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            data: ctwc.TIMERANGE_DROPDOWN_VALUES
                                        }
                                    }
                                },{
                                    elementId: 'from_time',
                                    view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time',
                                        dataBindValue: 'from_time',
                                        class: "span2",
                                        elementConfig:
                                            getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },{
                                    elementId: 'to_time',
                                    view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time',
                                        dataBindValue: 'to_time',
                                        class: "span2",
                                        elementConfig:
                                            getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },{
                                    elementId: 'limit', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'limit',
                                        dataBindValue: 'limit', class: "span1",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            data:[{
                                                text:'500',
                                                id:500,
                                            },{
                                                text:'1000',
                                                id:1000,
                                            },{
                                                text:'2500',
                                                id:2500,
                                            },{
                                                text:'5000',
                                                id:5000,
                                            }],
                                        }
                                        
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'run_query',
                                    view: "FormButtonView",
                                    label: "Run Query",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
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

    function getFromTimeElementConfig(fromTimeId, toTimeId) {
        return {
            onShow: function(cdt) {
                this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
            },
            onClose: function(cdt) {
                this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
            },
            onSelectDate: function(cdt) {
                this.setOptions(getFromTimeSelectOptions(toTimeId, cdt));
            }
        };
    }

    function getToTimeElementConfig(fromTimeId, toTimeId) {
        return {
            onShow: function(cdt) {
                this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
            },
            onClose: function(cdt) {
                this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
            },
            onSelectDate: function(cdt) {
                this.setOptions(getToTimeSelectOptions(fromTimeId, cdt));
            }
        };
    }

    function getFromTimeShowOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            maxDate: dateString ? dateString : false,
            maxTime: timeString ? timeString : false
        };
    }

    function getFromTimeSelectOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            toDateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A'),
            fromDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            maxDate: toDateString ? toDateString : false,
            maxTime: (fromDateString == toDateString) ? timeString : false
        };
    }

    function getToTimeShowOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            minDate: dateString ? dateString : false,
            minTime: timeString ? timeString : false
        };
    }

    function getToTimeSelectOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            fromDateString = moment(d).format('MMM dd, yyyy'),
            timeString = moment(d).format('hh:mm:ss A'),
            toDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            minDate: fromDateString ? fromDateString : false,
            minTime: (toDateString == fromDateString) ? timeString : false
        };
    }

    return SearchFlowFormView;
});
