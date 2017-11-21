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
                            name: 'Session Type',
                            formatter: function(r,c,v,cd,dc) {
                               if (dc['isClient']) {
                                    return 'Client';
                               } else {
                                    return 'Server';
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
                               return remoteVNFormatter(v, dc);
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
                               text: ctwl.TRAFFIC_GROUPS_NO_DATA
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
                                                            formatter: 'vnFormatter'
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
            if(currentLevel == 1 || (currentLevel == 2 && data.groupBy == 'policy')) {
                //if(data.groupBy != 'policy' || currentLevel == 2) {
                    sessionColumns.push({
                        field: 'protocol',
                        name: 'Session Type - Protocol (Server Port)',
                        cssClass: 'cell-hyperlink-blue',
                        formatter: function(r,c,v,cd,dc) {
                            return sessionTypeProtocolFormatter(v, dc);
                        },
                        events : {
                            onClick : function(e, d) {
                                data.level++;
                                var protocol = cowf.format.protocol(d['protocol']);
                                data.sessionType = d['session_type'] == 1 ? 'client' : 'server';
                                data.where.push([{
                                    "suffix": null, "value2": null, "name": "protocol", "value": d['protocol'], "op": 1
                                }, {
                                    "suffix": null, "value2": null, "name": "server_port", "value": d['server_port'], "op": 1
                                }]);
                                data.breadcrumb.push(['Session Type: ' + (data.sessionType == 'client' ? 'Client' : 'Server'),
                                                      'Protocol: ' + protocol, 'Port: ' + d['server_port']]);
                                self.rootView.sessionDrilldown();
                             }
                         }
                    });
                /*} else {
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
                                var ruleObj = getPolicyInfo(d['security_policy_rule']);
                                data.where.push([{
                                    "suffix": null, "value2": null, "name": "security_policy_rule", "value": d['security_policy_rule'], "op": 1
                                }]);
                                data.breadcrumb.push(['Policy: ' + ruleObj.name, 'Rule: ' + ruleObj.uuid]);
                                self.rootView.sessionDrilldown();
                             }
                         }
                    });
                }*/
            }
            if(data.groupBy == 'policy')
                currentLevel--;
            if(currentLevel == 2) {
                sessionColumns.push({
                    field: 'local_ip',
                    name: 'Local IP',
                    cssClass: 'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, d) {
                            data.level++;
                            data.where.push([{
                                "suffix": null, "value2": null, "name": 'local_ip', "value": d['local_ip'], "op": 1
                            }, {
                                "suffix": null, "value2": null, "name": 'vn', "value": d['vn'], "op": 1
                            }]);
                            data.breadcrumb.push(['Local IP: ' + d['local_ip'], 'VN: ' + formatVN(d['vn'])]);
                            self.rootView.sessionDrilldown();
                         }
                     }

                }, {
                    field: 'vn',
                    name: 'VN',
                    formatter: function(r,c,v,cd,dc) {
                        return vnFormatter(v, dc);
                    }
                });
            }
            if(currentLevel == 3) {
                sessionColumns.push({
                    field: 'remote_ip',
                    name: 'Remote IP',
                    maxWidth: 75
                }, {
                    field: 'remote_vn',
                    name: 'Remote VN',
                    formatter: function(r,c,v,cd,dc) {
                        return remoteVNSSFormatter(v, dc);
                    }
                }, {
                    field: 'client_port',
                    name: 'Client Port',
                    maxWidth: 75
                }, {
                    field: 'forward_action',
                    name: 'Action',
                    maxWidth: 150
                });
            }

            sessionColumns.push({
                field: 'SUM(forward_logged_bytes)',
                name: 'Bytes (In/Out)',
                formatter:function(r,c,v,cd,dc) {
                    var inBytes = typeof dc['SUM(forward_sampled_bytes)'] != 'undefined'
                        ? dc['SUM(forward_sampled_bytes)'] : dc['SUM(forward_logged_bytes)'],
                        outBytes = typeof dc['SUM(reverse_sampled_bytes)'] != 'undefined'
                        ? dc['SUM(reverse_sampled_bytes)'] : dc['SUM(reverse_logged_bytes)'];
                   return (formatBytes(inBytes) + ' / ' + formatBytes(outBytes));
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
                            template: cowu.generateDetailTemplateHTML(this.getCurrentSessionDetailsTemplateConfig(data), cowc.APP_CONTRAIL_CONTROLLER),
                            noCache: true
                        }
                    },
                    dataSource : {data: []},
                    statusMessages: {
                        loading: {
                           text: 'Loading endpoint stats..',
                        },
                        empty: {
                           text: ctwl.TRAFFIC_GROUPS_NO_DATA
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
            if(currentLevel == 1 || (currentLevel == 2 && data.groupBy == 'policy')) {
                //if(data.groupBy != 'policy' || currentLevel == 2) {
                    templateConfig.push({
                        key: 'protocol',
                        label: 'protocol (Server Port)',
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'protocolPortFormatter'
                        }
                    }, {
                        key: 'session_type',
                        label: 'Session Type',
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'sessionTypeFormatter'
                        }
                    });
               /* } else {
                    templateConfig.push({
                        key: 'security_policy_rule',
                        label: 'Policy (Rule)',
                        templateGenerator: 'TextGenerator',
                        templateGeneratorConfig: {
                            formatter: 'policyRuleFormatter'
                        }
                    });
                }*/
            }
            if(data.groupBy == 'policy')
                currentLevel--;
            if(currentLevel == 2) {
                templateConfig.push({
                    key: 'local_ip',
                    label: 'Local IP',
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
                templateConfig.push({
                    key: 'remote_ip',
                    label: 'Remote IP',
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'remote_vn',
                    label: 'Remote VN',
                    templateGenerator: 'TextGenerator',
                    templateGeneratorConfig: {
                        formatter: 'remoteVNSSFormatter'
                    }
                }, {
                    key: 'client_port',
                    label: 'Client Port',
                    templateGenerator: 'TextGenerator'
                }, {
                    key: 'forward_action',
                    label: 'Action',
                    templateGenerator: 'TextGenerator'
                });
            }
            templateConfig.push({
                key: 'SUM(forward_sampled_bytes)',
                label: 'Sampled Bytes In/Out',
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig: {
                    formatter: 'sampledBytesFormatter'
                }
            }, {
                key: 'SUM(forward_logged_bytes)',
                label: 'Looged Bytes In/Out',
                templateGenerator: 'TextGenerator',
                templateGeneratorConfig: {
                    formatter: 'loogedBytesFormatter'
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
        return this.getPolicyInfo(dc['eps.__key']).name;
    }
    this.ruleFormatter = function(v, dc) {
        return this.getPolicyInfo(dc['eps.__key']).uuid;
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
    this.bytesInFormatter = function(v, dc) {
       return formatBytes(dc['SUM(eps.traffic.in_bytes)']);
    }
    this.bytesOutFormatter = function(v, dc) {
       return formatBytes(dc['SUM(eps.traffic.out_bytes)']);
    }
    this.sampledBytesFormatter = function(v, dc) {
       return (formatBytes(dc['SUM(forward_sampled_bytes)']) + ' / ' +
               formatBytes(dc['SUM(reverse_sampled_bytes)']));
    }
    this.loogedBytesFormatter = function(v, dc) {
       return (formatBytes(dc['SUM(forward_logged_bytes)']) + ' / ' +
               formatBytes(dc['SUM(reverse_logged_bytes)']));
    }
    this.sessionTypeFormatter = function(v, dc) {
        return v == 1 ? 'Client' : 'Server';
    },
    this.vnFormatter = function(v, dc) {
       return formatVN(dc['vn']);
    }
    this.remoteVNFormatter = function(v, dc) {
       return formatVN(dc['eps.traffic.remote_vn']);
    }
    this.remoteVNSSFormatter = function(v, dc) {
       return formatVN(dc['remote_vn']);
    }
    this.protocolPortFormatter = function(v, dc) {
       return cowf.format.protocol(dc['protocol']) + " (" + dc['server_port'] + ")";
    }
    this.sessionTypeProtocolFormatter = function(v, dc) {
        var type = dc['session_type'] == 1 ? 'Client' : 'Server';
       return type + ' - ' +
            cowf.format.protocol(dc['protocol']) + " (" + dc['server_port'] + ")";
    }
    this.policyRuleFormatter = function(v, dc) {
       var ruleObj = getPolicyInfo(dc['security_policy_rule']);
       return ruleObj.name + ' (' + ruleObj.uuid + ')';
    }
    this.sessionsInFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(
            dc['SUM(eps.traffic.initiator_session_count)']);
    }
    this.sessionsOutFormatter = function(v, dc) {
       return this.epsDefaultValueFormatter(
            dc['SUM(eps.traffic.responder_session_count)']);
    }
    this.getPolicyInfo = function(key) {
        var policyInfo = {
                'name': '-',
                'uuid': key
            };
        if(key) {
            if(key.indexOf(':') > 0) {
                var policy = key.split(':');
                policyInfo = {
                    'name': policy[policy.length-2],
                    'uuid': policy[policy.length-1]
                }
            } else {
                var policy = _.find(cowc.DEFAULT_FIREWALL_RULES,
                    function(rule) {
                        return rule.uuid == key;
                });
                if(policy) {
                    policyInfo.name = policy.name;
                }
            }
        }
        return policyInfo;
    }
    this.formatVN = function(vnName) {
        return (vnName && vnName != cowc.UNKNOWN_VALUE) ? vnName
                .replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)') : '-';
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
