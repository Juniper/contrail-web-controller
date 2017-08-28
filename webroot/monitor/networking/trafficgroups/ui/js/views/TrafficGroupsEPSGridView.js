/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var TrafficGroupsGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                elementId = viewConfig.tabid != null ? viewConfig.tabid : viewConfig.elementId,
                contrailListModel = new ContrailListModel({data : viewConfig.data}),
                title = viewConfig['title'];
           self.renderView4Config($("#"+elementId), contrailListModel, self.getSessionsGridViewConfig(title));
        },
        getSessionsGridViewConfig: function (title) {
            return {
                elementId: ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS + '-grid',
                view: "GridView",
                viewConfig: {
                    elementConfig: this.getSessionsConfiguration(title)
                }
            }
        },
        getSessionsConfiguration: function (title) {
            var sessionColumns = [
                        {
                            field: 'app',
                            name: 'Policy',
                            formatter:function(r,c,v,cd,dc) {
                               return policyFormatter(v, dc);
                            }
                        },
                        {
                            field: 'isClient',
                            name: 'Client Session',
                            formatter: function(r,c,v,cd,dc) {
                               if (dc['isClient']) {
                                    return 'True';
                               } else {
                                    return 'False';
                               }
                            }
                        },
                        {
                            field: 'app',
                            name: 'Source Tags',
                            formatter:function(r,c,v,cd,dc) {
                               return sourceTagsFormatter(v, dc);
                            }
                        },
                        {
                            field: 'app',
                            name: 'Remote Tags',
                            formatter:function(r,c,v,cd,dc) {
                               return remoteTagsFormatter(v, dc);
                            }
                        },
                        {
                            field: 'vn',
                            name: 'VN',
                            hide: true,
                            formatter:function(r,c,v,cd,dc) {
                               return vnFormatter(v, dc);
                            }
                        },
                        {
                            field: 'eps.traffic.remote_vn',
                            name: 'Remote VN',
                            hide: true,
                            formatter:function(r,c,v,cd,dc) {
                               return epsDefaultValueFormatter(v, dc);
                            }
                        },
                        {
                            field: 'SUM(eps.traffic.in_bytes)',
                            name: 'In Bytes',
                            maxWidth: 75,
                            formatter:function(r,c,v,cd,dc) {
                               return formatBytes(v);
                            }
                        },
                        {
                            field: 'SUM(eps.traffic.out_bytes)',
                            name: 'Out Bytes',
                            maxWidth: 75,
                            formatter:function(r,c,v,cd,dc) {
                               return formatBytes(v);
                            }
                        },
                        {
                            field: 'SUM(eps.server.hits)',
                            name: 'Hits',
                            hide: true,
                            formatter: function (r,c,v,cd,dc) {
                                if (dc['SUM(eps.traffic.hits)'] == null || dc['SUM(eps.traffic.hits)'] == '') {
                                    return '-'
                                } else {
                                    return dc['SUM(eps.traffic.hits)'];
                                }
                            }
                        },
                        {
                            field: 'SUM(eps.traffic.initiator_session_count)',
                            name: 'Sessions Initiated',
                            hide: true,
                            maxWidth: 130,
                            formatter:function(r,c,v,cd,dc) {
                               return sessionsInFormatter(v, dc);
                            }
                        },
                        {
                            field: 'SUM(eps.traffic.responder_session_count)',
                            name: 'Sessions Responded',
                            hide: true,
                            maxWidth: 130,
                            formatter:function(r,c,v,cd,dc) {
                               return sessionsOutFormatter(v, dc);
                            }
                        }
                    ],
                gridElementConfig = {
                    header: {
                        title: {
                            text: title
                        },
                        defaultControls: {
                            collapseable: false,
                            exportable: true,
                            searchable: true,
                            columnPickable:true,
                            refreshable: false
                        }
                    },
                    columnHeader: {
                        columns: sessionColumns
                    },
                    body: {
                        options : {
                            autoRefresh: false,
                            checkboxSelectable: false,
                            detail: {
                                template: cowu.generateDetailTemplateHTML(this.getSessionDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                            }
                        },
                        dataSource : {data: []},
                        statusMessages: {
                            loading: {
                               text: 'Loading endpoint stats..',
                            },
                            empty: {
                               text: 'No endpoint stats Found.'
                            }
                         }
                    },
                    footer: {
                        pager: {
                            options: {
                                pageSize: 50,
                                pageSizeSelect: [5, 10, 50]
                            }

                        }
                    }
                };
            return gridElementConfig;
        },
        getSessionDetailsTemplateConfig: function() {
            return {
                templateGenerator: 'RowSectionTemplateGenerator',
                templateGeneratorConfig: {
                    rows: [
                        {
                            templateGenerator: 'ColumnSectionTemplateGenerator',
                            templateGeneratorConfig: {
                                columns: [
                                    {
                                        //class: 'trafficEndpointDetails',
                                        rows: [
                                            {
                                                title: 'Details',
                                                templateGenerator: 'BlockListTemplateGenerator',
                                                templateGeneratorConfig: [
                                                    {
                                                        key: 'app',
                                                        label: 'Policy',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'policyFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Rule',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'ruleFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Application',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'appFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'deployment',
                                                        label: 'Deployment',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'deplFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'tier',
                                                        label: 'Tier',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'tierFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Site',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'siteFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'vn',
                                                        label: 'VN',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'epsDefaultValueFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Remote Application',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'remoteAppFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'deployment',
                                                        label: 'Remote Deployment',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'remoteDeplFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'tier',
                                                        label: 'Remote Tier',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'remoteTierFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Remote Site',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'remoteSiteFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'vn',
                                                        label: 'Remote VN',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'remoteVNFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'In Bytes',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'bytesInFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Out Bytes',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'bytesOutFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Sessions Initiated',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'sessionsInFormatter'
                                                        }
                                                    },
                                                    {
                                                        key: 'app',
                                                        label: 'Sessions Responded',
                                                        templateGenerator: 'TextGenerator',
                                                        templateGeneratorConfig: {
                                                            formatter: 'sessionsOutFormatter'
                                                        }
                                                    }
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
        }
    });
    this.epsDefaultValueFormatter = function(v) {
        return (v || v === 0) ? v : '-';
    }
    this.policyFormatter = function(v, dc) {
        return this.epsDefaultValueFormatter(this.getPolicyInfo(dc).name);
    }
    this.ruleFormatter = function(v, dc) {
        return this.epsDefaultValueFormatter(this.getPolicyInfo(dc).uuid);
    }
    this.sourceTagsFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(this.getEndpointTags(dc));
    }
    this.remoteTagsFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(this.getEndpointTags(dc, 'remote'));
    }
    this.appFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['app']);
    }
    this.remoteAppFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['eps.traffic.remote_app_id']);
    }
    this.deplFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['deployment']);
    }
    this.remoteDeplFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['eps.traffic.remote_deployment_id']);
    }
    this.tierFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['tier']);
    }
    this.remoteTierFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['eps.traffic.remote_tier_id']);
    }
    this.siteFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['site']);
    }
    this.remoteSiteFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['eps.traffic.remote_site_id']);
    }
    this.vnFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['vn']);
    }
    this.remoteVNFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(dc['eps.traffic.remote_vn']);
    }
    this.bytesInFormatter = function(v, dc) {
       return formatBytes(dc['SUM(eps.traffic.in_bytes)']);
    }
    this.bytesOutFormatter = function(v, dc) {
       return formatBytes(dc['SUM(eps.traffic.out_bytes)']);
    }
    this.sessionsInFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(
            dc['SUM(eps.traffic.initiator_session_count)']);
    }
    this.sessionsOutFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(
            dc['SUM(eps.traffic.responder_session_count)']);
    }
    this.getPolicyInfo = function(dc) {
        var policyInfo = {};
        if(dc['eps.__key']) {
            if(dc['eps.__key'].indexOf(':') > 0) {
                var policy = dc['eps.__key'].split(':');
                policyInfo = {
                    'name': policy[policy.length-2],
                    'uuid': policy[policy.length-1]
                }
            } else {
                var policy = _.find(cowc.DEFAULT_FIREWALL_RULES,
                    function(rule) {
                        return rule.uuid == dc['eps.__key'];
                });
                if(policy) {
                    policyInfo = {
                        'name': policy.name,
                        'uuid': dc['eps.__key']
                    }
                }
            }
        }
        return policyInfo;
    }
    this.getEndpointTags = function(dc, endpoint) {
         var tags = '';
        _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tag) {
            var tagVal = (endpoint == 'remote') ?
                dc['eps.traffic.remote_' + tag.value + '_id'] : dc[tag.value];
            if(tagVal) {
                tags += (tags ? '<br/>' : '') + tagVal;
            }
        });
        return tags;
    }
    return TrafficGroupsGridView;
});
