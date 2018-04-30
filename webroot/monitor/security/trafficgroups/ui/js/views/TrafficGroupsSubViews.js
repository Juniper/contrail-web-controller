/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodashv4', 'contrail-view',
    'monitor/security/trafficgroups/ui/js/views/TGDrillDownView',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsHelpers',
    'monitor/security/trafficgroups/ui/js/views/TrafficGroupsFormatters'
], function(_, ContrailView, DrillDownView, TgHelpersView, TgFormatters) {
    var tgHelpers = new TgHelpersView(),
        tgFormatters = new TgFormatters(),
        TGSubViews = function() {
            var self = this;
            this.linkDrillDownView = Backbone.View.extend({
                render: function(linkObj) {
                    var linkData = linkObj.linkData,
                        srcNodeData = _.filter(linkData, function (val, idx){
                            return _.result(val, 'data.type') == 'src';
                        }),
                        dstNodeData = _.filter(linkData, function (val, idx){
                            return _.result(val, 'data.type') == 'dst';
                        }),
                        externalProject = dstNodeData[0].data.arcType,
                        linkData = _.result(srcNodeData, '0.data', ''),
                        srcId = tgHelpers.getFormatedName(
                            _.result(srcNodeData, '0.data.currentNode.displayLabels'), linkObj.tgSetObj, true),
                        dstId = tgHelpers.getFormatedName(
                            _.result(dstNodeData, '0.data.currentNode.displayLabels'), linkObj.tgSetObj, true),
                        curSession = _.find(linkData.dataChildren, function(session) {
                            return tgHelpers.isRecordMatched(
                            _.result(linkData, 'currentNode.names'), session, linkData, linkObj.tgSetObj);
                        }),
                        tagData = tgHelpers.getTagsFromSession(curSession, '', externalProject, linkObj.tgSetObj);
                        tagData.srcId = srcId;
                        tagData.dstId = dstId;
                    tagData.breadcrumb = [[tagData.srcId, tagData.dstId], [['All Services']]];
                    tagData.selectedEndpoint = 'endpoint1';
                    var ddObj = self.prepareDrillDownObj(tagData, linkObj),
                        drillDownView = new DrillDownView({
                            el : $('#traffic-groups-radial-chart'),
                            parentRender : linkObj.renderFn,
                            ddData : ddObj
                        });
                    self.ddData = ddObj;
                    drillDownView.drillDown();
                }
            }),
            this.arcDrillDownView = Backbone.View.extend({
                render: function(arcObj) {
                    var d = arcObj.arcData;
                    if(d) {
                        var arcData = tgHelpers.getArcData(d.data, arcObj.tgSetObj),
                            childData = _.filter(arcData.dataChildren, function(children) {
                                return tgHelpers.isRecordMatched(d.data.namePath,
                                         children, d.data, arcObj.tgSetObj);
                            }),
                            project = contrail.getCookie(cowc.COOKIE_PROJECT),
                            catObj = tgHelpers.getCategorizationObj(arcObj.tgSetObj),
                            selectedTags = catObj[0].split('-');
                            if(d.depth == 2 && catObj[1]) {
                                selectedTags = selectedTags.concat(catObj[1].split('-'));
                            }
                        childData = _.groupBy(childData, function(rec) {
                            var arcTags = [], remoteVN = rec['eps.traffic.remote_vn'];
                           _.each(selectedTags, function(tag) {
                                arcTags.push(rec['eps.traffic.remote_'+tag+'_id']);
                            });
                           if(project != 'undefined') {
                                remoteVN = tgHelpers.sliceVNName(remoteVN);
                                arcTags.push(remoteVN);
                            }
                            return arcTags.join('-');
                        });
                        var srcId = tgHelpers.getFormatedName(
                                _.result(d, 'data.displayLabels'), arcObj.tgSetObj, true),
                            remoteEndpoints = [];
                        _.each(childData, function(endpoint) {
                            var session = endpoint[0],
                                otherEndpoint = tgHelpers.parseHierarchyConfig(session, arcObj.tgSetObj,
                                        project, arcObj.showOtherProjectTraffic, d.depth),
                                dstId = tgHelpers.getFormatedName(
                                _.result(otherEndpoint[1], 'displayLabels'), arcObj.tgSetObj, true);
                            remoteEndpoints.push({
                                id : dstId,
                                session : session,
                                externalProject : otherEndpoint[1].type
                            });
                        });
                        if(remoteEndpoints.length) {
                            var curDst = remoteEndpoints[0];
                            var tagData = tgHelpers.getTagsFromSession(curDst.session, d.depth,
                                            curDst.externalProject, arcObj.tgSetObj, project);
                            tagData.srcId = srcId;
                            tagData.dstId = curDst.id;
                            tagData.remoteEndpoints = remoteEndpoints;
                        tagData.selectedEndpoint = curDst.id;
                        tagData.breadcrumb = [[tagData.srcId, tagData.remoteEndpoints], [['All Services']]];
                            var ddObj = self.prepareDrillDownObj(tagData, arcObj),
                                drillDownView = new DrillDownView({
                                    el : $('#traffic-groups-radial-chart'),
                                    parentRender : arcObj.renderFn,
                                    ddData : ddObj
                                });
                            self.ddData = ddObj;
                            drillDownView.drillDown();
                        }
                    }
                }
            }),
            this.prepareDrillDownObj = function(tagData, options) {
                 var ddObj = {
                    commonFields: ['SUM(forward_logged_bytes)', 'SUM(reverse_logged_bytes)',
                                    'SUM(forward_sampled_bytes)', 'SUM(reverse_sampled_bytes)'],
                    common_display_fields: [{
                        key: 'SUM(forward_logged_bytes)',
                        label: "Bytes (In/Out)",
                        formatFn: function(r,c,v,cd,dc) {
                            var inBytes = typeof dc['SUM(forward_sampled_bytes)'] != 'undefined'
                                ? dc['SUM(forward_sampled_bytes)'] : dc['SUM(forward_logged_bytes)'],
                                outBytes = typeof dc['SUM(reverse_sampled_bytes)'] != 'undefined'
                                ? dc['SUM(reverse_sampled_bytes)'] : dc['SUM(reverse_logged_bytes)'];
                           return (formatBytes(inBytes) + ' / ' + formatBytes(outBytes));
                        }
                    }],
                    commom_detailFields: [{
                        key: 'SUM(forward_sampled_bytes)',
                        label: 'Sampled Bytes In/Out',
                        formatFn: 'sampledBytesFormatter'
                    }, {
                        key: 'Logged Bytes In/Out',
                        label: 'Session Type',
                        formatFn: 'loggedBytesFormatter'
                    }],
                    endpointNames: [tagData.srcId, tagData.dstId],
                    tags: [tagData.endpoint1Data, tagData.endpoint2Data],
                    filter: tagData.filter,
                    breadcrumb: tagData.breadcrumb,
                    commonWhere: self.getCommomWhereClause,
                    sliceByProject: tagData.sliceByProject,
                    external : tagData.external,
                    sessionType: 'all',
                    selectedEndpoint: tagData.selectedEndpoint,
                    onRemoteEndpointChanged: self.onRemoteEndpointChanged,
                    remoteEndpoints: tagData.remoteEndpoints,
                    data: [],
                    showEndpointSelection: true,
                    type: 'both',
                    tgSetObj: options.tgSetObj,
                    updateReqObj: self.updateReqObj,
                    parseData: self.parseFn,
                    where: [[]],
                    level: 1,
                    option: options.option,
                    onBreadcrumbClick: self.onBreadcrumbClick,
                    getData: function(obj) {
                        return tgHelpers.querySessionSeries(obj, options.tgSetObj);
                    },
                    levels: [{
                        select_fields: ["protocol", "server_port", "session_type"],
                        display_fields: [{
                            key: 'protocol',
                            label: "Session Type - Protocol (Server Port)",
                            formatFn: function(r,c,v,cd,dc) {
                                return tgFormatters.sessionTypeProtocolFormatter(v, dc);
                            },
                            drillDown: true,
                            drilldownFn: function(d) {
                                return self.getWhereClause({protocol:d['protocol'],server_port:d['server_port']});
                            },
                            updateData: self.updateSessionType,
                            breadcrumb: [{
                                label: '',
                                value: function(d) {return cowf.format.protocol(d['protocol']);}
                            }, {
                                label: '',
                                value: function(d) {return ' : ' + (d['server_port']);}
                            }]
                        }],
                        detailFields: [{
                            key: 'protocol',
                            label: 'protocol (Server Port)',
                            formatFn: 'protocolPortFormatter'
                        }, {
                            key: 'session_type',
                            label: 'Session Type',
                            formatFn: 'sessionTypeFormatter'
                        }]
                    }, {
                        select_fields: ["local_ip", "vn"],
                        display_fields: [{
                            key: 'local_ip',
                            label: "Local IP",
                            drillDown: true,
                            drilldownFn: function(d) {
                                return self.getWhereClause({local_ip:d['local_ip'],vn:d['vn']});
                            },
                            breadcrumb: [{
                                label: '',
                                value: function(d) {return d['local_ip'];}
                            }, {
                                label: '',
                                value: function(d) {return ' ('+formatVNWithoutProject(d['vn']) + ')';}
                            }]
                        }, {
                            key: 'vn',
                            label: "VN",
                            formatFn: function(r,c,v,cd,dc) {
                                return tgFormatters.vnFormatter(v, dc);
                            }
                        }],
                        detailFields: [{
                            key: 'local_ip',
                            label: 'Local IP'
                        }, {
                            key: 'vn',
                            label: 'VN',
                            formatFn: 'vnFormatter'
                        }]
                    }, {
                        select_fields: ['remote_ip', 'remote_vn', 'client_port', 'forward_action'],
                        display_fields: [{
                            key: 'remote_ip',
                            label: "Remote IP",
                            maxWidth: 75
                        }, {
                            key: 'remote_vn',
                            label: "Remote VN",
                            formatFn: function(r,c,v,cd,dc) {
                                return tgFormatters.remoteVNSSFormatter(v, dc);
                            }
                        }, {
                            key: 'client_port',
                            label: "Client Port",
                            maxWidth: 75
                        }, {
                            key: 'forward_action',
                            label: "Action",
                            maxWidth: 150
                        }],
                        detailFields: [{
                            key: 'remote_ip',
                            label: 'Remote IP'
                        }, {
                            key: 'remote_vn',
                            label: 'Remote VN',
                            formatFn: 'remoteVNSSFormatter'
                        }, {
                            key: 'client_port',
                            label: 'Client Port'
                        }, {
                            key: 'forward_action',
                            label: 'Action'
                        }]
                    }]
                }
                if(options.option == 'policy') {
                    ddObj.levels.unshift({
                        select_fields: ["protocol", "server_port", "session_type"],
                        display_fields: [{
                            key: 'protocol',
                            label: "Session Type - Protocol (Server Port)",
                            formatFn: function(r,c,v,cd,dc) {
                                return tgFormatters.sessionTypeProtocolFormatter(v, dc);
                            },
                            drillDown: true,
                            drilldownFn: function(d) {
                                return self.getWhereClause({protocol:d['protocol'],server_port:d['server_port']});
                            },
                            breadcrumb: [{
                                label: '',
                                value: function(d) { return options.policyObj.name;}
                            }, {
                                label: 'Rule',
                                value: function(d) {return options.policyObj.uuid;}
                            }]
                        }],
                        detailFields: [{
                            key: 'protocol',
                            label: 'protocol (Server Port)',
                            formatFn: 'protocolPortFormatter'
                        }, {
                            key: 'session_type',
                            label: 'Session Type',
                            formatFn: 'sessionTypeFormatter'
                        }]
                    });
                    ddObj.level = 2;
                    ddObj.where[1] = [{
                        "suffix": null, "value2": null, "name": "security_policy_rule", "value": options.policyObj.fqn, "op": 1
                    }];
                    ddObj.breadcrumb[2] = [options.policyObj.name + ' (<span title=' + options.policyObj.uuid +
                            ' class="tgEllipsis">' + options.policyObj.uuid + '</span>)'];
                    ddObj.groupBy = 'policy';
                }
                return ddObj;
            },
            this.onRemoteEndpointChanged = function(data, newVal) {
                var curDst = _.filter(data.remoteEndpoints, function(obj) {
                        var external = (obj.externalProject == 'externalProject') ?
                            ' (External Project)' : '';
                        return (newVal == obj.id+external)
                    })[0];
                var project = contrail.getCookie(cowc.COOKIE_PROJECT),
                    tagData = tgHelpers.getTagsFromSession(curDst.session, '',
                        curDst.externalProject, data.tgSetObj, project)
                self.ddData.endpointNames[1] = curDst.id;
                self.ddData.tags[1] = tagData.endpoint2Data;
                self.ddData.filter = tagData.filter;
                self.ddData.external = tagData.external;
                return data;
            },
            this.parseFn = function(resObj) {
                 var view = resObj.view;
                if(self.isFilterApplied(view.ddData)) {
                    var columns = _.without(resObj.selectFields,
                        'remote_vn','SUM(forward_logged_bytes)', 'SUM(reverse_logged_bytes)',
                        'SUM(forward_sampled_bytes)', 'SUM(reverse_sampled_bytes)', 'session_type')
                    if(resObj.type == 'both') {
                        resObj.clientData = self.grouByColumns(columns, resObj.clientData);
                        resObj.serverData = self.grouByColumns(columns, resObj.serverData);
                    } else {
                        resObj.curSessionData =
                            self.grouByColumns(columns, resObj.curSessionData);
                    }
                }
                if(view.ddData.type == 'both') {
                    view.ddData.endpointStats =
                            [resObj.clientData, resObj.serverData];
                    resObj.curSessionData = resObj.clientData.concat(resObj.serverData);
                     _.each(resObj.curSessionData, function(d, i) {
                        d['cgrid'] = d['cgrid'] + '_' + i;
                    });
                }
                view.curSessionData = resObj.curSessionData;
            },
            this.grouByColumns = function(columns, data) {
                data = _.groupBy(data, function(d) {
                    var groupBy = [];
                    _.each(columns, function(key) {
                        groupBy.push(d[key]);
                    });
                    return groupBy.join('-');
                });
                data = _.map(data, function(objs, keys) {
                    objs[0]['SUM(forward_logged_bytes)'] = _.sumBy(objs, 'SUM(forward_logged_bytes)');
                    objs[0]['SUM(reverse_logged_bytes)'] = _.sumBy(objs, 'SUM(reverse_logged_bytes)');
                    objs[0]['SUM(forward_sampled_bytes)'] = _.sumBy(objs, 'SUM(forward_sampled_bytes)');
                    objs[0]['SUM(reverse_sampled_bytes)'] = _.sumBy(objs, 'SUM(reverse_sampled_bytes)');
                    return objs[0];
                });
                return data;
            },
            this.updateReqObj = function(data, reqObj) {
                if(self.isFilterApplied(data))
                    reqObj.selectFields.push('remote_vn');
                if(data.level == 1 || (data.option == 'policy' && data.level == 2)) {
                        data.type = 'both';
                        reqObj.type = 'both';
                } else {
                    data.type = '';
                    reqObj.type = '';
                    data.showEndpointSelection = false;
                }
                return reqObj;
            },
            this.getWhereClause = function(obj) {
                var whereObj = [];
                _.each(obj, function(val, key) {
                    whereObj.push({
                        "suffix": null, "value2": null, "name": key, "value": val, "op": 1
                    });
                });
                return whereObj;
            },
            this.getCommomWhereClause = function(data, level) {
                var where = [], filter = [],
                whereTags = data.tags.slice(0);
                if(data.selectedEndpoint == 'endpoint2' && !data.remoteEndpoints) {
                    whereTags = whereTags.reverse();
                }
                _.each(whereTags[0], function(tag) {
                    if (!tag.value) {
                        tag.value =  cowc.UNKNOWN_VALUE;
                    }
                    var vnLevel = (data.option == 'policy') ? 4 : 3;
                    if (tag.name != 'vn' || level < vnLevel) {
                        if (tag.name == 'vn') {
                            where.push({
                                "suffix": null, "value2": null, "name": tag.name,
                                "value": tag.value, "op": tag.operator ? tag.operator : 1
                            });
                        } else {
                            if (!tag.fqname) {
                                tag.fqname =  cowc.UNKNOWN_VALUE;
                            }
                            where.push({
                                "suffix": null, "value2": null, "name": tag.name,
                                "value": tag.fqname, "op": tag.operator ? tag.operator : 1
                            });
                        }
                    }
                });
               _.each(whereTags[1], function(tag) {
                    if (!tag.value) {
                        tag.value =  cowc.UNKNOWN_VALUE;
                    }
                    if (tag.name == 'vn') {
                        where.push({
                            "suffix": null, "value2": null, "name": "remote_" + tag.name,
                            "value": tag.value, "op": tag.operator ? tag.operator : 1
                        });
                    } else {
                        if (!tag.id) {
                            tag.id =  cowc.UNKNOWN_VALUE;
                        }
                        where.push({
                            "suffix": null, "value2": null, "name": "remote_" + tag.name,
                            "value": tag.id, "op": tag.operator ? tag.operator : 1
                        });
                    }
                });
               _.each(data.filter, function(tag) {
                    if (!tag.value) {
                        tag.value =  cowc.UNKNOWN_VALUE;
                    }
                    filter.push({
                        "suffix": null, "value2": null, "name": "remote_" + tag.name,
                        "value": tag.value, "op": tag.operator ? tag.operator : 1
                    });
                });
               return {
                   where : where,
                   filter : filter
               }
            },
            this.onBreadcrumbClick = function(data) {
                if(data.level == 1 && data.option == 'policy') {
                    data.levels.shift()
                    data.option = '';
                }
                if(data.level == 0) {
                    data.level++;
                    if(data.option == 'policy') data.level++;
                }
                return data;
            },
            this.updateSessionType = function(data, d) {
                data.sessionType = d['session_type'] == 1 ? 'client' : 'server';
                return data;
            },
            this.isFilterApplied = function(data) {
                var level = (data.option == 'policy') ? data.level-1 : data.level;
                if(data.external == 'externalProject' && !data.sliceByProject
                    && level !=3) {
                    return true;
                } else return false;
            },
            this.grouByColumns = function(columns, data) {
                var data = _.groupBy(data, function(d) {
                    var groupBy = [];
                    _.each(columns, function(key) {
                        groupBy.push(d[key]);
                    });
                    return groupBy.join('-');
                });
                data = _.map(data, function(objs, keys) {
                    objs[0]['SUM(forward_logged_bytes)'] = _.sumBy(objs, 'SUM(forward_logged_bytes)');
                    objs[0]['SUM(reverse_logged_bytes)'] = _.sumBy(objs, 'SUM(reverse_logged_bytes)');
                    objs[0]['SUM(forward_sampled_bytes)'] = _.sumBy(objs, 'SUM(forward_sampled_bytes)');
                    objs[0]['SUM(reverse_sampled_bytes)'] = _.sumBy(objs, 'SUM(reverse_sampled_bytes)');
                    return objs[0];
                });
                return data;
            },
            this.protocolPortFormatter = function(v, dc) {
               return cowf.format.protocol(dc['protocol']) + " (" + dc['server_port'] + ")";
            }
    };
    return new TGSubViews();
});
