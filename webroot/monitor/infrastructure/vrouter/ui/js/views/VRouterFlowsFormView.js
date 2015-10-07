/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockback',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/vrouter/ui/js/models/VRouterFlowsFormModel'
    //Remove all query references once it is moved to core
], function (_, Knockback, ContrailView, ContrailListModel, VRouterFlowsFormModel) {

    var VRouterFlowsFormView = ContrailView.extend({
        render: function (options) {
            var self = this, viewConfig = self.attributes.viewConfig,
                hostname = viewConfig['hostname'],
                prefix = ctwl.VROUTER_FLOWS_PREFIX;
                routesTmpl = contrail.getTemplate4Id(
                            ctwc.TMPL_FORM_RESULT),
                vRouterFlowsFormModel = new VRouterFlowsFormModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ?
                        viewConfig.widgetConfig : null,
                routesFormId = "#" + prefix + "-form";

            self.model = vRouterFlowsFormModel;
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
                        $("#vrouter_flows_query").on('click', function() {
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
                prefix = ctwl.VROUTER_FLOWS_PREFIX;
                hostname = viewConfig['hostname'],
                introspectPort = ifNull(viewConfig['introspectPort'],8085);
                queryResultId = "#" + prefix + "-results",
                responseViewConfig = {
                    elementId: ctwl.VROUTER_FLOWS_RESULTS_VIEW,
                    view: "VRouterFlowsGridView",
                    viewPathPrefix: ctwl.VROUTER_VIEWPATH_PREFIX,
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: viewConfig
                };

            var queryParams = self.model.getQueryParams();
            function constructvRouterVNUrl(viewConfig) {
                var url = monitorInfraConstants.monitorInfraUrls['VROUTER_FLOWS'];
                var urlParams = $.extend({
                        ip: hostname,
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
                            var retData = monitorInfraParsers.parseVRouterFlowsData(response);
                            paginationInfo = retData['paginationInfo'];
                            monitorInfraUtils.updateGridTitleWithPagingInfo(
                                $('#' + ctwl.VROUTER_FLOWS_GRID_ID),paginationInfo);
                            return retData['data'];
                        }
                    },
                    cacheConfig : {
                       // ucid: ctwc.CACHE_CONFIGNODE
                    }
                };
            var model = new ContrailListModel(listModelConfig);
            model.onDataUpdate.subscribe(function() {

            });
            self.renderView4Config($(self.$el).find(queryResultId),
                    model, responseViewConfig,null,null,null,function() {
                        monitorInfraUtils.bindGridPrevNextListeners({
                            gridSel: $('#' + ctwl.VROUTER_FLOWS_GRID_ID),
                            model: self.model,
                            resetForm : function() {
                                    self.model.reset();
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
                                    elementId: 'acl_uuid',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: 'ACL UUID',
                                        path: 'acl_uuid',
                                        dataBindValue: 'acl_uuid',
                                        class: "span6",
                                        elementConfig: {
                                            defaultValueId: 0,
                                            dataSource: {
                                                type: 'remote',
                                                url: monitorInfraConstants.monitorInfraUrls['VROUTER_ACL'] 
                                                    + '?' + $.param({
                                                        ip: hostname,
                                                        introspectPort: viewConfig['introspectPort']
                                                    }),
                                                parse:function(response){
                                                    var retArr = [{text:'All',value:'All'}];
                                                    response = jsonPath(response,'$..AclSandeshData')[0];
                                                    var uuidArr = [];
                                                    if(response != null){
                                                        if(!(response instanceof Array)){
                                                            response = [response];
                                                        }
                                                        for (var i = 0; i < response.length; i++) {
                                                            uuidArr.push(response[i].uuid);
                                                        }
                                                    }
                                                    $.each(uuidArr, function (key, value) {
                                                        retArr.push({text:value, value:value});
                                                    });
                                                    return retArr;
                                                }
                                            },
                                            dataValueField:'value',
                                            dataTextField:'text',
                                        }
                                    }
                                }],
                        },
                        {
                            columns: [
                                {
                                    elementId: 'vrouter_flows_query',
                                    view: "FormButtonView",
                                    viewConfig: {
                                        label: "Display Routes",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'vrouter_flows_reset',
                                    view: "FormButtonView",
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

    return VRouterFlowsFormView;
});
