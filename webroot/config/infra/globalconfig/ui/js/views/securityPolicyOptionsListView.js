/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'lodash', 'contrail-view', 'contrail-list-model', ],
        function(_, ContrailView, ContrailListModel) {
            var securityPolicyOptionsListView = ContrailView
                    .extend({
                        el : $(contentContainer),
                        render : function() {
                            var self = this, viewConfig = this.attributes.viewConfig;
                            var listModelConfig = {
                                remote : {
                                    ajaxConfig : {
                                        url : ctwc.URL_GET_CONFIG_DETAILS,
                                        type : "POST",
                                        data : JSON.stringify({
                                            data : [ {
                                                type : 'global-system-configs'
                                            } ]
                                        })
                                    },
                                    dataParser : self.parseSecPolicyOptionsData,
                                }
                            };
                            var contrailListModel = new ContrailListModel(
                                    listModelConfig);
                            this.renderView4Config(this.$el, contrailListModel,
                                    getSecPolicyOptionsGridViewConfig());
                        },
                        parseSecPolicyOptionsData : function(result) {
                            var gridDS = [], result = _.get(result,
                                    '0.global-system-configs', []), secPolicyMgmtConfig = _
                                    .find(
                                            result,
                                            function(policyMgmt) {
                                                return _
                                                        .get(
                                                                policyMgmt,
                                                                'global-system-config.fq_name.0',
                                                                '') === ctwc.DEFAULT_GLOBAL_SYSTEM_CONFIG;
                                            }), globalPolicyMgmt = _.get(
                                    secPolicyMgmtConfig, 'global-system-config',
                                    {});
                            _
                                    .each(
                                            ctwc.GLOBAL_POLICY_MANAGEMENT_OPTIONS_MAP,
                                            function(polMgmtOption) {
                                                gridDS
                                                        .push({
                                                            name : polMgmtOption.name,
                                                            key : polMgmtOption.key,
                                                            value : globalPolicyMgmt[polMgmtOption.key] ? globalPolicyMgmt[polMgmtOption.key]
                                                                    : false
                                                        });
                                            });
                            return gridDS;
                        }
                    });

            var getSecPolicyOptionsGridViewConfig = function() {
                return {
                    elementId : cowu
                            .formatElementId([ ctwc.GLOBAL_POLICY_MGMT_OPTIONS_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : {
                        rows : [ {
                            columns : [ {
                                elementId : ctwc.GLOBAL_POLICY_MGMT_OPTIONS_ID,
                                view : "securityPolicyOptionsGridView",
                                viewPathPrefix : "config/infra/globalconfig/ui/js/views/",
                                app : cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig : {
                                    pagerOptions : {
                                        options : {
                                            pageSize : 10,
                                            pageSizeSelect : [ 10, 50, 100 ]
                                        }
                                    },
                                    isGlobal : true
                                }
                            } ]
                        } ]
                    }
                }
            };

            return securityPolicyOptionsListView;
        });
