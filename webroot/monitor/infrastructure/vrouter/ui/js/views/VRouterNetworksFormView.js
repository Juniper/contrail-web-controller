/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterNetworksFormModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, VRouterNetworksFormModel) {

    var VRouterNetworksFormView = ContrailView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = ctwl.VROUTER_NETWORKS_PREFIX;
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                vRouterNetworksFormModel = new VRouterNetworksFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";
            monitorInfraUtils.appendHostNameInWidgetTitleForUnderlayPage(viewConfig);
            self.model = vRouterNetworksFormModel;
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
                        $("#vrouter_networks_reset").on('click', function() {
                            self.model.reset();
                            self.renderQueryResult(viewConfig);
                        });
                        $("#vrouter_networks_query").on('click', function() {
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
                prefix = ctwl.VROUTER_NETWORKS_PREFIX;
                hostname = viewConfig['hostname'],
                introspectPort = viewConfig['introspectPort'];
                queryResultId = "#" + prefix + "-results",
                responseViewConfig = {
                    elementId: ctwl.VROUTER_NETWORKS_RESULTS_VIEW,
                    view: "VRouterNetworksGridView",
                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                };

            var queryParams = self.model.getQueryParams();
            function constructvRouterVNUrl(viewConfig) {
                var url = monitorInfraConstants.monitorInfraUrls['VROUTER_NETWORKS'];
                var urlParams = $.extend({
                        ip: monitorInfraUtils.getIPOrHostName(viewConfig),
                        introspectPort: introspectPort
                    },queryParams);
                return {
                    url: url,
                    params:urlParams
                }
            }
            var urlObj  = constructvRouterVNUrl(viewConfig);
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
                        dataParser :  function(response) {
                            var retData = monitorInfraParsers.parseVRouterVNData(response);
                            paginationInfo = retData['paginationInfo'];
                            monitorInfraUtils.updateGridTitleWithPagingInfo(
                                $('#' + ctwl.VROUTER_NETWORKS_GRID_ID),paginationInfo);
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
                            gridSel: $('#' + ctwl.VROUTER_NETWORKS_GRID_ID),
                            model: self.model,
                            resetFn: function() {
                                    self.model.reset();
                                },
                            parseFn: function(data) {
                                var retData = monitorInfraParsers.parseVRouterVNData(data);
                                paginationInfo = retData['paginationInfo'];
                                monitorInfraUtils.updateGridTitleWithPagingInfo(
                                    $('#' + ctwl.VROUTER_NETWORKS_GRID_ID),paginationInfo);
                                return retData['data'];
                            },
                            obj:viewConfig,
                            getUrlFn: function() {
                                return constructvRouterVNUrl(viewConfig)
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
                                    elementId: 'vn_name',
                                    view: "FormInputView",
                                    viewConfig: {
                                        label: 'Name',
                                        path: 'vn_name',
                                        dataBindValue: 'vn_name',
                                        class: "col-xs-6",
                                    }
                                }],
                        },
                        {
                            columns: [
                                {
                                    elementId: 'vrouter_networks_query',
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
                                    elementId: 'vrouter_networks_reset',
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

    return VRouterNetworksFormView;
});
