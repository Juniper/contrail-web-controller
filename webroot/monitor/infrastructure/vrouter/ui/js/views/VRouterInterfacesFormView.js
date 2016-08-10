/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterInterfacesFormModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, VRouterInterfacesFormModel) {

    var VRouterInterfacesFormView = ContrailView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = 'vrouter_interfaces',
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                vRouterInterfacesFormModel = new VRouterInterfacesFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";
            monitorInfraUtils.appendHostNameInWidgetTitleForUnderlayPage(viewConfig);
            self.model = vRouterInterfacesFormModel;
            self.$el.append(routesTmpl({prefix: prefix}));

            self.renderView4Config($(self.$el).find(routesFormId),
                    this.model,
                    self.getViewConfig(options,viewConfig),
                    null,
                    null,
                    null,
                    function () {
                        self.model.showErrorAttr(prefix + '-container',
                                false);
                        Knockback.applyBindings(self.model,
                                document.getElementById(prefix + '-container'));
                        kbValidation.bind(self);
                        self.renderQueryResult(viewConfig);
                        $("#vrouter_interfaces_reset").on('click', function() {
                            self.model.reset();
                            self.renderQueryResult(viewConfig);
                        });
                        $("#vrouter_interfaces_query").on('click', function() {
                            self.renderQueryResult(viewConfig);
                        });
                    }
            );

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(routesFormId),
                        self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function(viewConfig) {
            var self = this,
                prefix = 'vrouter_interfaces',
                hostname = viewConfig['hostname'],
                introspectPort = viewConfig['introspectPort'];
                queryResultId = "#" + prefix + "-results",
                responseViewConfig = {
                    elementId: ctwl.VROUTER_INTERFACES_RESULTS_VIEW,
                    view: "VRouterInterfacesGridView",
                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                };

            var queryParams = self.model.getQueryParams();
            function constructVRouterIntfUrl(viewConfig) {
                var url = monitorInfraConstants.monitorInfraUrls['VROUTER_INTERFACES'];
                var urlParams = $.extend({
                        ip: monitorInfraUtils.getIPOrHostName(viewConfig),
                        introspectPort: introspectPort
                    },queryParams);
                return {
                    url: url,
                    params:urlParams
                }
            }
            var urlObj = constructVRouterIntfUrl(viewConfig);
            var paginationInfo;
            function getPaginationInfo() {
                return paginationInfo;
            }
            var remoteConfig = {
                    url: urlObj['url'] + '?' + $.param(urlObj['params']),
                    type: 'GET'
                };
            var listModelConfig = {
                    remote : {
                        ajaxConfig : remoteConfig,
                        dataParser : function(response) {
                            var retData = monitorInfraParsers.parseVRouterInterfaceData(response);
                            paginationInfo = retData['paginationInfo'];
                            monitorInfraUtils.updateGridTitleWithPagingInfo(
                                $('#' + ctwl.VROUTER_INTERFACES_GRID_ID),paginationInfo);
                            return retData['data'];
                        }
                    },
                    cacheConfig : {
                       // ucid: ctwc.CACHE_CONFIGNODE
                    }
                };
            var model = new ContrailListModel(listModelConfig);
            self.renderView4Config($(self.$el).find(queryResultId),
                    model, responseViewConfig,null,null,null,function() {
                        monitorInfraUtils.bindGridPrevNextListeners({
                            gridSel: $('#' + ctwl.VROUTER_INTERFACES_GRID_ID),
                            parseFn: function(data) {
                                var retData = monitorInfraParsers.parseVRouterInterfaceData(data);
                                paginationInfo = retData['paginationInfo'];
                                monitorInfraUtils.updateGridTitleWithPagingInfo(
                                    $('#' + ctwl.VROUTER_INTERFACES_GRID_ID),paginationInfo);
                                return retData['data'];
                            },
                            model: self.model,
                            resetForm : function() {
                                    self.model.reset();
                                },
                            obj:viewConfig,
                            getUrlFn: function() {
                                return constructVRouterIntfUrl(viewConfig)
                            },
                            paginationInfoFn: getPaginationInfo
                        });

                    });
        },

        getViewConfig: function (options,viewConfig) {
            var self = this;
            var hostname = viewConfig['hostname'];
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'itf_type',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: 'Type',
                                        path: 'type',
                                        class: 'col-xs-3',
                                        dataBindValue: 'type',
                                        elementConfig: {
                                            defaultValue: 'Any',
                                            defaultValueId: 0,
                                            data:[{
                                                id:'any',
                                                text:'Any'
                                            },{
                                                id:'vmi',
                                                text:'vport'
                                            },{
                                                id:'physical',
                                                text:'remote-physical-port'
                                            },{
                                                id:'logical',
                                                text:'logical-port'
                                            }]
                                        }
                                    }
                                },{
                                    elementId: 'itf_name',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label: 'Name',
                                        path: 'name',
                                        dataBindValue: 'name',
                                        class: "col-xs-6",
                                    }
                                }]
                        },{
                            columns:[{
                                    elementId: 'network',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label: 'Network',
                                        path: 'network',
                                        dataBindValue: 'network',
                                        class: "col-xs-3",
                                    }
                                },{
                                    elementId: 'mac',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label: 'Mac',
                                        path: 'mac',
                                        dataBindValue: 'mac',
                                        class: "col-xs-3",
                                    }
                                },{
                                    elementId: 'ip_address',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label: 'IP Address',
                                        path: 'ip_address',
                                        dataBindValue: 'ip_address',
                                        class: "col-xs-3",
                                    }
                                }]
                        },{
                            columns: [
                                {
                                    elementId: 'vrouter_interfaces_query',
                                    view: "FormButtonView",
                                    viewConfig: {
                                        label: "Search",
                                        iconClass: "fa fa-search",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'vrouter_interfaces_reset',
                                    view: "FormButtonView",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0'
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    return VRouterInterfacesFormView;
});
