/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
        'lodash',
        'contrail-view',
        'config/infra/globalconfig/ui/js/models/securityPolicyOptionsModel',
        'config/infra/globalconfig/ui/js/views/securityPolicyOptionsEditView',
        'config/infra/globalconfig/ui/js/globalConfigFormatters' ],
        function(_, ContrailView, SecPolicyOptionsModel,
                SecPolicyOptionsEditView, GlobalConfigFormatters) {
            var secPolicyOptionsEditView = new SecPolicyOptionsEditView(), globalConfigFormatters = new GlobalConfigFormatters(), gridElId = "#"
                    + ctwc.GLOBAL_POLICY_MGMT_OPTIONS_GRID_ID;

            var secPolicyOptionsGridView = ContrailView
                    .extend({
                        el : $(contentContainer),
                        render : function() {
                            var self = this, viewConfig = this.attributes.viewConfig, pagerOptions = viewConfig['pagerOptions'];
                            self
                                    .renderView4Config(
                                            self.$el,
                                            self.model,
                                            getSecPolicyOptionsGridViewConfig(viewConfig));
                        }
                    });

            var getSecPolicyOptionsGridViewConfig = function(viewConfig) {
                return {
                    elementId : cowu
                            .formatElementId([ ctwc.GLOBAL_POLICY_MGMT_OPTIONS_LIST_VIEW_ID ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwc.GLOBAL_POLICY_MGMT_OPTIONS_GRID_ID,
                                view : "GridView",
                                viewConfig : {
                                    elementConfig : getConfiguration(viewConfig)
                                }
                            } ]
                        } ]
                    }
                };
            };

            var getConfiguration = function(viewConfig) {
                var gridElementConfig = {
                    header : {
                        title : {
                            text : ctwl.TITLE_SECURITY_POLICY_OPTIONS
                        },
                        defaultControls : {
                            exportable : false
                        },
                        advanceControls : getHeaderActionConfig(viewConfig),
                    },
                    body : {
                        options : {
                            checkboxSelectable : false,
                            detail : false,
                        },
                        dataSource : {},
                        statusMessages : {
                            loading : {
                                text : 'Loading Security Policy Options..'
                            },
                            empty : {
                                text : 'No Security Policy Options Found.'
                            },
                            errorGettingData : {
                                type : 'error',
                                iconClasses : 'fa fa-warning',
                                text : 'Error in getting Security Policy Options.'
                            }
                        }
                    },
                    columnHeader : {
                        columns : securityPolicyOptionsColumns
                    },
                    footer : false
                };
                return gridElementConfig;
            };

            var securityPolicyOptionsColumns = [ {
                id : 'name',
                field : 'name',
                maxWidth : '365',
                name : 'Option',
                cssClass : 'cell-text-blue',
                sortable : false
            }, {
                id : 'value',
                field : 'value',
                name : 'Value',
                formatter : function(row, col, val, d, rowData) {
                    if (rowData.key == 'enable_security_policy_draft') {
                        return val == true ? 'Enabled' : 'Disabled';
                    }
                    return val;
                },
                sortable : false
            } ];

            function getHeaderActionConfig(viewConfig) {
                var headerActionConfig = [ {
                    "type" : "link",
                    "title" : ctwl.TITLE_EDIT_SECURITY_POLICY_OPTIONS,
                    "iconClass" : 'fa fa-pencil-square-o',
                    "onClick" : function() {
                        var isGlobal = viewConfig.isGlobal;
                        var ajaxConfig = {
                            url : "/api/tenants/config/get-config-details",
                            type : 'POST'
                        };
                        if (isGlobal) {
                            ajaxConfig.data = JSON.stringify({
                                data : [ {
                                    type : 'global-system-configs'
                                } ]
                            });
                        } else {
                            ajaxConfig.data = JSON.stringify({
                                data : [ {
                                    type : 'projects',
                                    obj_uuids : viewConfig.projectId
                                } ]
                            });
                        }
                        contrail
                                .ajaxHandler(
                                        ajaxConfig,
                                        null,
                                        function(result) {
                                            var secPolicyMgmtConfig;
                                            if (isGlobal) {
                                                var globalSecOptions = _.get(
                                                        result,
                                                        '0.global-system-configs',
                                                        []);
                                                secPolicyMgmtConfig = _
                                                        .find(
                                                                globalSecOptions,
                                                                function(
                                                                        policyMgmt) {
                                                                    var fqName = _
                                                                            .get(
                                                                                    policyMgmt,
                                                                                    'global-system-config.fq_name.0',
                                                                                    '');
                                                                    return fqName === ctwc.DEFAULT_GLOBAL_SYSTEM_CONFIG;
                                                                });
                                                secPolicyMgmtConfig = _
                                                        .get(
                                                                secPolicyMgmtConfig,
                                                                'global-system-config',
                                                                {});
                                            } else {
                                                secPolicyMgmtConfig = _.get(
                                                        result,
                                                        "0.projects.0.project",
                                                        {});
                                            }
                                            secPolicyOptionsModel = new SecPolicyOptionsModel(
                                                    secPolicyMgmtConfig);
                                            secPolicyOptionsEditView.model = secPolicyOptionsModel;
                                            secPolicyOptionsEditView
                                                    .renderEditSecPolicyOptions({
                                                        "title" : ctwl.TITLE_EDIT_SECURITY_POLICY_OPTIONS,
                                                        isGlobal : isGlobal,
                                                        callback : function() {
                                                            var dataView = $(
                                                                    gridElId)
                                                                    .data(
                                                                            "contrailGrid")._dataView;
                                                            dataView
                                                                    .refreshData();
                                                        }
                                                    });
                                        }, function(error) {
                                        });
                    }
                } ];
                return headerActionConfig;
            }

            return secPolicyOptionsGridView;
        });
