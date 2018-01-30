/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/firewall/common/fwpolicy/ui/js/fwRuleFormatter'
], function(_, ContrailView, FWRuleFormatter) {
    var self, gridElId = '#' + ctwc.APS_FW_RULE_LIST_GRID_ID, gridObj, isGlobal,
      fwRuleFormatter = new FWRuleFormatter();
    var fwRuleListGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var gridGroupingOpt = {
                    groupingField :"policy_name",
                    groupHeadingPrefix : 'Policy: ',
                    rowCountSuffix : []
            };
            var viewConfig = self.attributes.viewConfig,
                pagerOptions = viewConfig['pagerOptions'];
            isGlobal = viewConfig.isGlobal;
            self.renderView4Config(self.$el, self.model, 
                    getFWRuleGridViewConfig(viewConfig),null,null,null,
                    function(){
                        cowu.addGridGrouping ('aps-fw-rule-list-grid', gridGroupingOpt);
                    });
        }
    });


    function getFWRuleGridViewConfig (viewConfig) {
        return {
            elementId:
                cowu.formatElementId(
                [ctwc.APS_FW_RULE_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.APS_FW_RULE_LIST_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig:
                                        getConfiguration(viewConfig)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getConfiguration (viewConfig) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ''
                },
               advanceControls: []
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    actionCell: [],
                    detail: {
                        template:
                            cowu.generateDetailTemplateHTML(
                                    getFWRuleListExpDetailsTemplateConfig(),
                            cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Firewall Rules..'
                    },
                    empty: {
                        text: 'No Firewall Rule Found.'
                    }
                }
            },
            columnHeader: { columns: getfwRuleColumns(viewConfig)}
        };
        return gridElementConfig;
    };
    function getfwRuleColumns(viewConfig){
        var fwRuleColumns = [
            {
                id: 'policy_name',
                field: 'policy_name',
                minWidth: 90,
                name: 'Policy Name',
                hide:true,
                sortable: false
                //formatter: fwRuleFormatter.fwPolicyMemberFormatter
          },
          {
            id: 'action_list.simple_action',
            field: 'action_list.simple_action',
            minWidth: 70,
            name: 'Action',
            sortable: false,
            formatter: fwRuleFormatter.actionFormatter
         }, {
             id: 'service',
             field: 'service',
             minWidth: 250,
             name: 'Services',
             sortable: false,
             formatter: fwRuleFormatter.serviceFormatter.bind(viewConfig)
         },{
             id: 'endpoint_1',
             field: 'endpoint_1',
             minWidth: 150,
             name: 'End Point 1',
             sortable: false,
             formatter: fwRuleFormatter.endPoint1Formatter
         }, {
             id: 'direction',
             field: 'direction',
             minWidth: 40,
             name: 'Dir',
             sortable: false,
             formatter: fwRuleFormatter.dirFormatter
         }, {
             id: 'endpoint_2',
             field: 'endpoint_2',
             minWidth: 200,
             name: 'End Point 2',
             sortable: false,
             formatter: fwRuleFormatter.endPoint2Formatter
         }, {
             id: 'match_tags',
             field: 'match_tags',
             minWidth: 90,
             name: 'Match Tags',
             sortable: false,
             formatter: fwRuleFormatter.matchFormatter
         }];
        return fwRuleColumns;
    }

    function getFWRuleListExpDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [{
                    templateGenerator: 'ColumnSectionTemplateGenerator',
                    templateGeneratorConfig: {
                        columns: [{
                            class: 'col-xs-12',
                            rows: [{
                                keyClass:'col-xs-3',
                                valueClass:'col-xs-9',
                                title: 'Details',
                                templateGenerator: 'BlockListTemplateGenerator',
                                templateGeneratorConfig: [{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "UUID"
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Order",
                                    templateGeneratorConfig: {
                                        formatter: "sequenceFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "action_list.simple_action",
                                    templateGenerator: "TextGenerator",
                                    label: "Action",
                                    templateGeneratorConfig: {
                                        formatter: "actionFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "uuid",
                                    templateGenerator: "TextGenerator",
                                    label: "Services",
                                    templateGeneratorConfig: {
                                        formatter: "serviceExpandFormatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "endpoint_1",
                                    templateGenerator: "TextGenerator",
                                    label: "End Point 1",
                                    templateGeneratorConfig: {
                                        formatter: "endPoint1Formatter"
                                    }
                                },{
                                    keyClass:'col-xs-3',
                                    valueClass:'col-xs-9',
                                    key: "direction",
                                    templateGenerator: "TextGenerator",
                                    label: "Dir"
                                },{
                                    key: "endpoint_2",
                                    templateGenerator: "TextGenerator",
                                    label: "End Point 2",
                                    templateGeneratorConfig: {
                                        formatter: "endPoint2Formatter"
                                    }
                                },{
                                    key: "match_tags",
                                    templateGenerator: "TextGenerator",
                                    label: "Match Tags",
                                    templateGeneratorConfig: {
                                        formatter: "matchFormatter"
                                    }
                                },
                                {
                                    label: 'Associated Security Logging Objects',
                                    key: 'security_logging_object_refs',
                                    templateGenerator:
                                        'TextGenerator',
                                    templateGeneratorConfig: {
                                        formatter:
                                            'SloFormatter'
                                    }
                                }]
                           }]
                      }]
                    }
                }]
            }
        };
    };

    this.actionFormatter = function(v, dc) {
        return fwRuleFormatter.actionFormatter("", "", v, "", dc);
    };

    this.sequenceFormatter = function(v, dc) {
        return fwRuleFormatter.ruleListSequenceFormatter("", "", v, "", dc);
    };

    this.enabledFormatter = function(v, dc) {
        return fwRuleFormatter.enabledFormatter("", "", v, "", dc);
    };

    this.serviceFormatter = function(v, dc) {
        return fwRuleFormatter.serviceFormatter("", "", v, "", dc, isGlobal);
    };
    this.serviceExpandFormatter = function(v, dc) {
        return fwRuleFormatter.serviceExpandFormatter("", "", v, "", dc, isGlobal);
    };

    this.dirFormatter = function(v, dc) {
        return fwRuleFormatter.dirFormatter("", "", v, "", dc);
    };

    this.endPoint1Formatter = function(v, dc) {
        return fwRuleFormatter.endPoint1Formatter("", "", v, "", dc);
    };

    this.endPoint2Formatter = function(v, dc) {
        return fwRuleFormatter.endPoint2Formatter("", "", v, "", dc);
    };

    this.matchFormatter = function(v, dc) {
        return fwRuleFormatter.matchFormatter("", "", v, "", dc);
    };

    this.simpleActionFormatter = function(v, dc) {
        return fwRuleFormatter.simpleActionFormatter("", "", v, "", dc);
    };

    this.SloFormatter = function (v, dc) {
        return ctwu.securityLoggingObjectFormatter(dc, 'details');
    };

    return fwRuleListGridView;
});

