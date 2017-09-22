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
                title = viewConfig['title'],
                type = viewConfig['configTye'];
           self.renderView4Config($("#"+elementId), contrailListModel, self.getSessionsGridViewConfig(type,title));
        },
        getSessionsGridViewConfig: function (type, title) {
            return {
                elementId: ctwl.TRAFFIC_GROUPS_ENDPOINT_STATS + '-grid',
                view: "GridView",
                viewConfig: {
                    elementConfig: (type == 'sessions') ? this.getcurrentSessionConfig(title) :
                                    this.getSessionsConfiguration(title)
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
        },
        getcurrentSessionConfig: function (title) {
            var self = this,
                data = this.rootView.sessionData,
                currentLevel = data.level,
                sessionColumns = [];
            if(currentLevel == 1) {
                if(data.groupBy == 'policy') {
                    sessionColumns.push({
                        field: 'security_policy_rule',
                        name: 'Policy (Rule)',
                        cssClass: 'cell-hyperlink-blue',
                        formatter: function(r,c,v,cd,dc) {
                            return policyRuleFormatter(v, dc);
                        },
                        events : {
                            onClick : function(e, d) {
                                data.level++;
                                var value = $(e.target).html();
                                data.where.push([{
                                    "suffix": null, "value2": null, "name": "security_policy_rule", "value": value, "op": 1
                                }]);
                                data.breadcrumb.push(['Policy: ' + value]);
                                self.rootView.sessionDrilldown(data);
                             }
                         }
                    });
                } else {
                    sessionColumns.push({
                        field: 'protocol',
                        name: 'Protocol (Server Port)',
                        cssClass: 'cell-hyperlink-blue',
                        formatter: function(r,c,v,cd,dc) {
                            return protocolPortFormatter(v, dc);
                        },
                        events : {
                            onClick : function(e, d) {
                                data.level++;
                                var value = $(e.target).html().split('('),
                                    protocol = value[0].trim(),
                                    port = value[1].replace(')', '').trim();
                                data.where.push([{
                                    "suffix": null, "value2": null, "name": "protocol", "value": protocol, "op": 1
                                }, {
                                    "suffix": null, "value2": null, "name": "server_port", "value": port, "op": 1
                                }]);
                                data.breadcrumb.push(['Protocol: ' + protocol, 'Port: ' + port]);
                                self.rootView.sessionDrilldown(data);
                             }
                         }
                    });
                }
            }
            if(currentLevel == 2) {
                var label = (data.sessionType == 'client') ? 'Client IP' : 'Server IP';
                sessionColumns.push({
                    field: 'local_ip',
                    name: label,
                    cssClass: 'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, d) {
                            data.level++;
                            var vnValue = $(e.target).parent().find('.vn_field').html().split('('),
                                currentVN = vnValue[0].trim(),
                                project = vnValue[1].replace(')', '').trim(),
                                vnName = contrail.getCookie(cowc.COOKIE_DOMAIN) + ":" + project + ":" + currentVN,
                                name = (data.sessionType == 'client') ? 'Client IP' : 'Server IP';
                            data.where.push([{
                                "suffix": null, "value2": null, "name": 'local_ip', "value": $(e.target).html(), "op": 1
                            }, {
                                "suffix": null, "value2": null, "name": 'vn', "value": vnName, "op": 1
                            }]);
                            data.breadcrumb.push([name + ': ' + $(e.target).html()]);
                            self.rootView.sessionDrilldown(data);
                         }
                     }

                }, {
                    field: 'vn',
                    name: 'VN',
                    formatter: function(r,c,v,cd,dc) {
                        return vnFormatter(v, dc);
                    },
                    cssClass: 'vn_field'
                });
            }
            if(currentLevel == 3) {
                var label = (data.sessionType == 'server') ? 'Client IP' : 'Server IP';
                sessionColumns.push({
                    field: 'remote_ip',
                    name: label
                }, {
                    field: 'vn',
                    name: 'VN',
                    formatter: function(r,c,v,cd,dc) {
                        return vnFormatter(v, dc);
                    }
                }, {
                    field: 'remote_vn',
                    name: 'Remote VN',
                    formatter: function(r,c,v,cd,dc) {
                        return remoteVNFormatter(v, dc);
                    }
                }, {
                    field: 'client_port',
                    name: 'Client Port'
                }, {
                    field: 'forward_action',
                    name: 'Forward Action'
                }, {
                    field: 'reverse_action',
                    name: 'Reverse Action'
                });
            }

            sessionColumns.push({
                field: 'SUM(forward_sampled_bytes)',
                name: 'In Bytes',
                formatter:function(r,c,v,cd,dc) {
                   return formatBytes(v);
                }
            }, {
                field: 'SUM(reverse_sampled_bytes)',
                name: 'Out Bytes',
                formatter:function(r,c,v,cd,dc) {
                   return formatBytes(v);
                }
            });
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
                            template: cowu.generateDetailTemplateHTML(this.getCurrentSessionDetailsTemplateConfig(data), cowc.APP_CONTRAIL_CONTROLLER)
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
        getCurrentSessionDetailsTemplateConfig: function(data) {
            var currentLevel = data.level,
                templateConfig = [];
            if(currentLevel == 1) {
                if(data.groupBy == 'policy') {
                    templateConfig.push({
                        key: 'security_policy_rule',
                        label: 'Policy (Rule)',
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'policyRuleFormatter'
                        }
                    });
                } else {
                    templateConfig.push({
                        key: 'protocol',
                        label: 'protocol (Server Port)',
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'protocolPortFormatter'
                        }
                    });
                }
            }
            if(currentLevel == 2) {
                var label = (data.sessionType == 'client') ? 'Client IP' : 'Server IP';
                templateConfig.push({
                    key: 'local_ip',
                    label: label,
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'vn',
                    label: 'VN',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'vnFormatter'
                    }
                });
            }
            if(currentLevel == 3) {
                var label = (data.sessionType == 'server') ? 'Client IP' : 'Server IP';
                templateConfig.push({
                    key: 'remote_ip',
                    label: label,
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'vn',
                    label: 'VN',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'vnFormatter'
                    }
                }, {
                    key: 'remote_vn',
                    label: 'Remote VN',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'remoteVNFormatter'
                    }
                }, {
                    key: 'client_port',
                    label: 'Client Port',
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'forward_action',
                    label: 'Forward Action',
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'reverse_action',
                    label: 'Reverse Action',
                    templateGenerator: 'TextGenerator'
                });
            }
            templateConfig.push({
                key: 'SUM(forward_sampled_bytes)',
                label: 'In Bytes',
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig: {
                    formatter: 'bytesForwardFormatter'
                }
            }, {
                key: 'SUM(reverse_sampled_bytes)',
                label: 'Ou Bytes',
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig: {
                    formatter: 'bytesReverseFormatter'
                }
            });
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
                                                templateGeneratorConfig: templateConfig
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
    this.bytesReverseFormatter = function(v, dc) {
       return formatBytes(dc['SUM(reverse_sampled_bytes)']);
    }
    this.bytesForwardFormatter = function(v, dc) {
       return formatBytes(dc['SUM(forward_sampled_bytes)']);
    }
    this.vnFormatter = function(v, dc) {
       return formatVN(dc['vn']);
    }
    this.remoteVNFormatter = function(v, dc) {
       return formatVN(dc['remote_vn']);
    }
    this.protocolPortFormatter = function(v, dc) {
       return dc['protocol'] + " (" + dc['server_port'] + ")";
    }
    this.policyRuleFormatter = function(v, dc) {
       return dc['security_policy_rule'];
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
    this.formatVN = function(vnName) {
        return vnName ? vnName
                .replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)') : '';
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
