/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 *
 */

define([
    'lodashv4', 'contrail-list-model'
], function (_, ContrailListModel) {
    var trafficGroupsHelpers = function() {
        this.sliceByProjectOnly = true,
        this.chartDefaultSettings = {
            "view_type": "chart-stats",
            "showInnerCircle": true,
            "showLegend": true,
            "untaggedEndpoints": false,
            "sliceByProject": false
        },
        this.parseHierarchyConfig = function (d, setObj, project, showOtherProjectTraffic, level) {
            var self = this,
                hierarchyObj = self.getTagHierarchy(d, setObj, level),
                srcHierarchy = hierarchyObj.srcHierarchy
                dstHierarchy = hierarchyObj.dstHierarchy,
                externalType = '',
                srcDisplayLabel = [],
                dstDisplayLabel = [],
                remoteVN = d['eps.traffic.remote_vn'],
                implicitDenyKey = ifNull(_.find(cowc.DEFAULT_FIREWALL_RULES, function(rule) {
                    return rule.name == 'Implicit Deny';
                }), '').uuid,
                implicitAllowKey = ifNull(_.find(cowc.DEFAULT_FIREWALL_RULES, function(rule) {
                    return rule.name == 'Implicit Allow';
                }), '').uuid;

                notEvaluatedKey = ifNull(_.find(cowc.DEFAULT_FIREWALL_RULES, function(rule) {
                    return rule.name == 'Not Evaluated';
                }), '').uuid;
            if(self.isImplictRule(d, implicitDenyKey)) {
                d.linkCssClass = 'implicitDeny';
            }
            if(self.isImplictRule(d, implicitAllowKey)) {
                d.linkCssClass = 'implicitAllow';
            }
            if(self.isImplictRule(d, notEvaluatedKey)) {
                d.linkCssClass = 'notEvaluated';
            }
            $.each(srcHierarchy, function(idx) {
                srcDisplayLabel.push(self.getDisplayLabels(hierarchyObj.srcLabels, idx));
            });

            if(remoteVN && remoteVN.indexOf(':') > 0) {
                var remoteProject = remoteVN.split(':')[1];
                if(!showOtherProjectTraffic &&
                   project != remoteProject) {
                    externalType = 'externalProject';
                }
            } else {
                externalType = 'external';
            }

            $.each(dstHierarchy, function(idx) {
                dstDisplayLabel.push(self.getDisplayLabels(hierarchyObj.dstLabels, idx));
                if(externalType) {
                    if(externalType == 'external') {
                        dstHierarchy[idx] = 'External_external';
                        dstDisplayLabel[idx].fill('');
                        dstDisplayLabel[idx][dstDisplayLabel[idx].length-1] = 'External';
                    } else {
                        dstHierarchy[idx] += '_' + externalType;
                    }
                }
            });
            var src = {
                names: srcHierarchy,
                displayLabels: srcDisplayLabel,
                id: _.compact(srcHierarchy).join('-'),
                value: d['SUM(eps.traffic.in_bytes)'] + d['SUM(eps.traffic.out_bytes)'],
                inBytes: d['SUM(eps.traffic.in_bytes)'],
                outBytes: d['SUM(eps.traffic.out_bytes)']
            };
            //If remote_vn project doesn't match with current project
            //set type = external
            //append '_external' to names [only for 1st-level app field]
            var dst = {
                names: dstHierarchy,
                displayLabels: dstDisplayLabel,
                id: _.compact(dstHierarchy).join('-'),
                type: externalType,
                value: d['SUM(eps.traffic.out_bytes)'] + d['SUM(eps.traffic.in_bytes)'],
                inBytes: d['SUM(eps.traffic.in_bytes)'],
                outBytes: d['SUM(eps.traffic.out_bytes)']
            };
            return [src, dst];
        },
        this.getTagsFromSession = function(session, level, external, setObj, project) {
            if(session) {
                var sliceByProject =
                        this.getSettingValue('sliceByProject'),
                    operator = 1;
                if(sliceByProject && !this.sliceByProjectOnly) {
                    var vn = session['vn'],
                        remoteVN = session['eps.traffic.remote_vn'];
                } else {
                    var vn = this.sliceVNName(session['vn']),
                        remoteVN = this.sliceVNName(session['eps.traffic.remote_vn']);
                    operator = 7;
                }
                var endpoint1Data = [],
                    endpoint2Data = [],
                    filter = [],
                    categoryObj = this.getCategorizationObj(setObj);
                if(project != 'undefined') {
                    endpoint1Data.push({
                        'name' : 'vn',
                        'value' : vn,
                        'operator' : operator
                    });
                    if(external == 'externalProject' && !sliceByProject) {
                        remoteVN = '^(?!' + vn + ').*';
                        filter.push({
                            'name' : 'vn',
                            'value' : remoteVN,
                            'operator' : 8
                        });
                    } else {
                        endpoint2Data.push({
                            'name' : 'vn',
                            'value' : remoteVN,
                            'operator' : operator
                        });
                    }
                }
                if(level == 1) {
                    categoryObj = [categoryObj[0]];
                }
                _.each(categoryObj, function(tags) {
                    _.each(tags.split('-'), function(tag) {
                        tag = tag.trim();
                        endpoint1Data.push({
                            'name' : (tag == 'app' ? 'application' : tag),
                            'value' : session[tag + '_fqn'],
                            'id' : session[tag + '_id'],
                            'fqname' : session[tag + '_fqn']
                        });
                        endpoint2Data.push({
                            'name' : (tag == 'app' ? 'application' : tag),
                            'value' : session['eps.traffic.remote_' + tag + '_id_id'],
                            'id' : session['eps.traffic.remote_' + tag + '_id_id'],
                            'fqname' : session['eps.traffic.remote_' + tag + '_id_fqn']
                        });
                    });
                });
                return {endpoint1Data, endpoint2Data, external, filter, sliceByProject};

            } else return '';
        },
        this.sliceVNName = function(vn) {
            if(vn && vn.indexOf(':') > 0) {
                    vn = vn.split(':');
                    vn.pop();
                    vn = vn.join(':') + ':';
            }
            return vn;
        },
        this.getTagHierarchy = function(d, setObj, depth) {
            var srcHierarchy = [],
                dstHierarchy = [],
                srcLabels = [],
                dstLabels = [],
                selectedTagTypes = this.getCategorizationObj(setObj),
                level = depth ? depth : selectedTagTypes.length,
                sliceByProject =
                    this.getSettingValue('sliceByProject'),
                self = this;
            _.each(selectedTagTypes, function(tags, idx) {
                if(idx < level) {
                    var tagTypes = tags.split('-');
                    var srcNames = _.compact(_.map(tagTypes, function(tag) {
                        var tagVal = d[tag.trim()];
                        return tagVal ? tagVal : self.getTagLabel(tag, d);
                    }));
                    srcLabels.push(srcNames);
                    srcHierarchy.push(srcNames.join('-'));
                    var dstNames = _.compact(_.map(tagTypes, function(tag) {
                        var tagVal = d['eps.traffic.remote_' + tag.trim() + '_id'];
                        return tagVal ? tagVal : self.getTagLabel(tag,
                                        d, d['eps.traffic.remote_vn']);
                    }));
                    dstLabels.push(dstNames);
                    dstHierarchy.push(dstNames.join('-'));
                }
            });
            if(sliceByProject) {
                var vn = d['vn'] ? self.formatVN(d['vn'], self.sliceByProjectOnly) : ' ',
                    remoteVN = d['eps.traffic.remote_vn'] ?
                        self.formatVN(d['eps.traffic.remote_vn'], self.sliceByProjectOnly) : ' '
                srcHierarchy[0] += vn;
                dstHierarchy[0] += remoteVN;
                srcLabels[0].push(vn);
                dstLabels[0].push(remoteVN);
            }
            return {
                srcHierarchy: srcHierarchy,
                dstHierarchy: dstHierarchy,
                srcLabels: srcLabels,
                dstLabels: dstLabels
            };
        },
        this.getTagLabel = function(tagType, d, vn) {
            var label = '',
                tagObj = _.find(cowc.TRAFFIC_GROUP_TAG_TYPES,
                    function(tag) {
                        return tag.value == tagType;
                });
            if(tagObj) {
                if(tagObj.showIcononEmpty) {
                    label += tagObj.text.toLowerCase();
                }
                if(tagObj.showVNonEmpty && !this.combineEmptyTags) {
                    label += (label ? ' ' : '') +
                        this.formatVN(vn ? vn : d['vn']);
                }
                label += (label ? ' ' : '') +
                        '<Untagged>';
            }
            return label ? label : ' ';
        },
        this.isImplictRule = function(d, key) {
            return (typeof d['eps.__key'] == 'string' &&
                   d['eps.__key'].indexOf(key) > -1) &&
                   (d['SUM(eps.traffic.in_bytes)'] ||
                   d['SUM(eps.traffic.out_bytes)']);
        },
        this.getArcData = function(data, setObj) {
            var arcTitle = data.displayLabels.slice(0),
                arcTitle = this.getFormatedName(arcTitle, setObj),
                childrenArr = data['children'];
            //data is nested on hovering 1st-level arc while showing 2-level arcs
            //For intra-app traffic, there will be 2 children with same linkId
            //Remove 2nd-level duplicate intra links
            if(childrenArr[0].children != null) {
                childrenArr = jsonPath(data,'$.children[*].children[*]');
                childrenArr = _.flatten(childrenArr);
            }
            if(childrenArr[0].linkId != null) {
                childrenArr = _.uniqWith(childrenArr,function(a,b) {
                    return a.linkId == b.linkId;
                });
            }
            var dataChildren = jsonPath(childrenArr,'$.[*].dataChildren');
            if(dataChildren == false)
                dataChildren = jsonPath(data,'$.children[*].children[*].dataChildren');
            dataChildren = _.flatten(dataChildren);
            return {
                dataChildren : dataChildren,
                title : arcTitle
            };
        },
        this.handleUntaggedEndpoints = function (data) {
            var showUntagged = this.getSettingValue('untaggedEndpoints'),
                tgData = data ? data.slice(0) : data;
            if(!showUntagged && tgData) {
                tgData = _.filter(tgData, function(session) {
                    var remoteVN = session['eps.traffic.remote_vn'];
                    var srcTags = false,
                        dstTags = false;
                    _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tag) {
                        if(session[tag.value]) {
                            srcTags = true;
                        }
                        if(session['eps.traffic.remote_' + tag.value + '_id']) {
                            dstTags = true;
                        }
                    });
                    return srcTags && (dstTags || !remoteVN
                            || remoteVN == cowc.UNKNOWN_VALUE);
                });
            }
            return tgData;
        },
        this.getLinkInfo = function(links, setObj) {
            var srcTags = this.getFormatedName(_.result(links, '0.data.currentNode.displayLabels'), setObj),
                dstTags = this.getFormatedName(_.result(links, '1.data.currentNode.displayLabels'), setObj),
                dstIndex = _.findIndex(links, function(link) { return link.data.type == 'dst' });
            if((srcTags == dstTags) || _.includes(links[dstIndex].data.arcType, 'externalProject')
                 || _.includes(links[dstIndex].data.arcType, 'external')) {
                links = links.slice(0,1);
            }
            return {links, srcTags, dstTags};
        },
        this.getDisplayLabels = function(labels, idx) {
            var displayLabels = [];
            if(labels && labels.length > 0) {
                _.each(labels[idx], function(label) {
                    displayLabels.push(label);
                });
            }
            return displayLabels;
        },
        this.formatLabel = function(label) {
            var iconClass = '', icon = '',
                disLabel = label;
            if(disLabel) {
                _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tagObj) {
                    var tag = tagObj.text.toLowerCase();
                    if(disLabel.indexOf(tag) > -1) {
                        iconClass = tag + '-icon';
                        icon = tagObj.icon;
                        disLabel = disLabel.replace(tag, '').replace('=', '');
                    }
                });
            }
            return {
                label : disLabel,
                iconClass : iconClass,
                icon : icon
            }
        },
        this.getFormatedName = function(names, setObj, removeIcons) {
            var self = this,
                displayNames = names.slice(0),
                projectName = '',
                topLevelNames = displayNames[0].slice(0);
            if(topLevelNames.length >
                    self.getCategorizationObj(setObj)[0].split('-').length
               && topLevelNames[topLevelNames.length-1] != 'External') {
                projectName = topLevelNames.pop();
                displayNames[0] = topLevelNames;

            }
            displayNames = _.map(displayNames, function(labels) {
                labels = _.map(labels, function(label) {
                    var disLabel = '';
                    if(label) {
                        var labelObj = self.formatLabel(label);
                        if(removeIcons) {
                            disLabel =  labelObj.label;
                            disLabel = disLabel.replace(/<Untagged>/g, '-').trim();
                        } else {
                            disLabel = '<span class="'+labelObj.iconClass+'">' +
                            labelObj.icon + '</span> ' + labelObj.label;
                            disLabel = disLabel.replace(/<Untagged>/g, '&lt;untagged>');
                        }
                    }
                    return disLabel;
                });
                return (removeIcons) ? _.compact(labels).join('/') :
                                       _.compact(labels).join('-');
            });
            displayNames = _.remove(displayNames, function(name, idx) {
                return !(name && name.indexOf('External') > -1 && idx > 0);
            });
            return ((removeIcons ? _.compact(displayNames).join('/') :
                _.compact(displayNames).join('-')) +
                (projectName ? ' (' + projectName + ')' : '')) ;
        },
        this.isRecordMatched = function(names, record, data, setObj) {
            var self = this,
                isMatched = true,
                selectedTagTypes = self.getCategorizationObj(setObj),
                sliceByProject =
                    self.getSettingValue('sliceByProject');
            for(var i = 0; i < names.length; i++) {
                var tagTypes = selectedTagTypes[i].split('-'),
                    tagName =  _.compact(_.map(tagTypes, function(tag) {
                                    return record[tag] ? record[tag]
                                    : self.getTagLabel(tag, record)
                            })).join('-');
               if(i == 0 && sliceByProject) {
                tagName += self.formatVN(record['vn'], self.sliceByProjectOnly);
               }
               isMatched = isMatched && (tagName == names[i]);
            }
            return isMatched;
        },
        this.getLinkDirection = function(src, dst, setObj) {
            var self = this,
                linkChildren = _.filter(src.data.dataChildren, function (child) {
                    return child.isClient;
                  }),
                currentEnd = _.find(linkChildren, function (child) {
                    return self.isRecordMatched(src.data.currentNode.names, child, src.data, setObj);
                  }),
                otherEnd = _.find(linkChildren, function (child) {
                    return self.isRecordMatched(src.data.otherNode.names, child, src.data, setObj);
                  }),
                arcType =  dst.data ? dst.data.arcType : '';
            if(arcType == 'external' || arcType == 'externalProject') {
                linkChildren =  _.filter(src.data.dataChildren, function (child) {
                    return child.isServer;
                  });
                if(linkChildren.length)
                    otherEnd = true;
            }
            var linkDirection = (currentEnd && !otherEnd) ? 'forward' :
                           ((!currentEnd && otherEnd) ? 'reverse' :
                           ((currentEnd && otherEnd) ? 'bidirectional' : ''));
            return linkDirection;
        },
        this.filterDataByEndpoints = function(tgData, setObj) {
            var self = this,
                tgSettings = self.getTGSettings(setObj),
                data = _.filter(tgData, function(d) {
                var isClientEP = true,
                    isServerEP = true;
                _.each(tgSettings.filterByEndpoints,
                    function(endPoint) {
                    if(endPoint) {
                        isClientEP = isServerEP = true;
                        _.each(endPoint.split(','), function(tag) {
                          var tagObj = tag
                                .split(cowc.DROPDOWN_VALUE_SEPARATOR),
                              tagType = tagObj[1],
                              tagName = tagObj[0];
                          isClientEP = isClientEP &&
                            (d[tagType] == tagName);
                          isServerEP = isServerEP &&
                            (d['eps.traffic.remote_' + tagType + '_id']
                                 == tagName);
                        });
                        if(isClientEP || isServerEP) return false;
                    }
                });
                return (isClientEP || isServerEP);
            });
            return data;
        },
        this.getTGSettings = function(setObj) {
            var filterByEndpoints = [],
                groupByTagType = null,
                subGroupByTagType = null,
                time_range = 3600,
                from_time = null,
                to_time = null;
                if(setObj) {
                    groupByTagType = setObj.group_by_tag_type;
                    if(!groupByTagType)
                        groupByTagType = sessionStorage.TG_CATEGORY;
                    if(groupByTagType) {
                        groupByTagType = _.isArray(groupByTagType) ?
                            _.flatten(groupByTagType) : groupByTagType.split(',');
                    }
                    subGroupByTagType = setObj.sub_group_by_tag_type;
                    if(subGroupByTagType) {
                        subGroupByTagType = _.isArray(subGroupByTagType) ?
                         _.flatten(subGroupByTagType) : subGroupByTagType.split(',');
                    } else {
                        subGroupByTagType = null
                    }
                    _.each(
                        setObj.endpoints,
                        function(obj) {
                           filterByEndpoints.push(obj.endpoint);
                    });
                    time_range = setObj.time_range;
                    from_time = setObj.from_time;
                    to_time = setObj.to_time;
                } else {
                    if(sessionStorage.TG_CATEGORY) {
                        groupByTagType = sessionStorage
                                        .TG_CATEGORY.split(',');
                        if(sessionStorage.TG_SUBCATEGORY) {
                            subGroupByTagType = sessionStorage
                                        .TG_SUBCATEGORY.split(',');
                        }
                    } else {
                        groupByTagType = ['app','deployment'];
                        subGroupByTagType = ['tier'];
                    }
                    if(sessionStorage.TG_TIME_RANGE) {
                        time_range = sessionStorage.TG_TIME_RANGE;
                        from_time = sessionStorage.TG_FROM_TIME;
                        to_time = sessionStorage.TG_TO_TIME;
                    }
                }
            return {
                group_by_tag_type: groupByTagType,
                sub_group_by_tag_type: subGroupByTagType,
                filterByEndpoints: filterByEndpoints,
                time_range: time_range,
                from_time: from_time,
                to_time: to_time
            };
        },
        this.getCategorizationObj = function(setObj, allLevels) {
            var tgSettings = this.getTGSettings(setObj),
                categorization = [tgSettings.group_by_tag_type.join('-')],
                showInnerCircle = this.getSettingValue('showInnerCircle');
            if(tgSettings.sub_group_by_tag_type && (showInnerCircle || allLevels)) {
                categorization.push(tgSettings.sub_group_by_tag_type.join('-'));
            }
            return categorization;
        },
        this.formatVN = function(value, sliceByProjectOnly) {
            var vnName = '';
            if(value && value != cowc.UNKNOWN_VALUE) {
                if(sliceByProjectOnly) {
                    vnName = value.split(':')[1];
                } else {
                    vnName = value
                        .replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)');
                }
            }
            return vnName;
        },
        this.formatConfigRuleData = function (ruleDetailsObj) {
            var ruleUUID = ruleDetailsObj['uuid'];
            var src = _.result(ruleDetailsObj, 'endpoint_1.tags', []);
            srcType = '';
            src = src.join(' && ')
            if (src.length == 0) {
                src = _.result(ruleDetailsObj, 'endpoint_1.address_group', '-');
                srcType = 'address_group';
            }
            if (!src || src == '-') {
                src = _.result(ruleDetailsObj, 'endpoint_1.any', '-');
                if (src == true) {
                    src = 'any';
                }
                srcType = ''
            }
            if (!src || src == '-') {
                src = _.result(ruleDetailsObj, 'endpoint_1.virtual_network', '-');
                srcType = 'virtual_network';
            }
            var dst = _.result(ruleDetailsObj, 'endpoint_2.tags', []),
                dstType = '';
                dst = dst.join(' && ');
            if (!dst || dst.length == 0) {
                dst = _.result(ruleDetailsObj, 'endpoint_2.address_group', '-');
                dstType = 'address_group';
            }
            if (!dst || dst == '-') {
                dst = _.result(ruleDetailsObj, 'endpoint_2.any', '-');
                if (dst == true)
                    dst = 'any';
                dstType = ''
            }
            if (!dst || dst == '-') {
                dst = _.result(ruleDetailsObj, 'endpoint_2.virtual_network', '-');
                dstType = 'virtual_network';
            }
            if(!src || src == '-' || src.length == 0) {
                srcType = '';
                src = '-';
            }
            if(!dst || dst == '-' || dst.length == 0) {
                dstType = '';
                dst = '-';
            }
            var policy_name_arr = _.result(ruleDetailsObj, 'firewall_policy_back_refs.0.to', []),
                service = _.result(ruleDetailsObj, 'service'),
                service_group_refs = _.result(ruleDetailsObj, 'service_group_refs'),
                serviceStr,
                service_dst_port_obj = _.result(ruleDetailsObj, 'service.dst_ports'),
                service_dst_port = '-',
                service_protocol = _.result(ruleDetailsObj, 'service.protocol'),
                policy_name = _.result(policy_name_arr.slice(-1), '0', '-'),
                rule_name = _.result(ruleDetailsObj, 'display_name'),
                rule_fqn =  _.result(ruleDetailsObj, 'firewall_policy_back_refs.0.to', []).join(':') + ':' + ruleUUID,
                direction = cowu.deSanitize(_.result(ruleDetailsObj, 'direction'));
            if (service_dst_port_obj != null && service_dst_port_obj['start_port'] != null &&
                service_dst_port_obj['end_port'] != null) {
                if (service_dst_port_obj['start_port'] == service_dst_port_obj['end_port']) {
                    service_dst_port = service_dst_port_obj['start_port'];
                } else {
                    service_dst_port = contrail.format('{0}-{1}', service_dst_port_obj['start_port'], service_dst_port_obj['end_port']);
                }
                service_dst_port == '-1' ? 'any' : service_dst_port;
                serviceStr = contrail.format('{0}: {1}', service_protocol, service_dst_port);
            }
            if (service_group_refs != null) {
                serviceStr = _.result(service_group_refs, '0.to.1');
            }
            var simple_action = _.result(ruleDetailsObj, 'action_list.simple_action', '-');
            if (simple_action == 'pass') {
                simple_action = 'permit';
            }
            direction = direction == '>' ? 'uni': 'bi';
            if (src == '-') {
                src = 'any';
            }
            if (dst == '-') {
                dst = 'any';
            }
            return {
                policy_name: policy_name,
                rule_name: rule_name,
                implicitRule: '',
                simple_action: simple_action,
                service: serviceStr,
                direction: direction,
                srcType: srcType,
                dstType: dstType,
                src: src,
                dst: dst,
                rule_fqn: rule_fqn
            }
        }
        this.getFormattedValue = function(value) {
            var value = value;
            if(typeof value == 'string' && value.split(':').length == 3)
                value =  value.split(':').pop();
            return value;
        },
        this.getSettingValue = function(option) {
            var curSettings = localStorage
                .getItem('container_' + layoutHandler.getURLHashObj().p
                           + '_settings');
            //tgView.updateTgSettingsView();
            if(curSettings) {
                curSettings = JSON.parse(curSettings);
                var selectedValue = curSettings[option];
            } else {
                var selectedValue = this.chartDefaultSettings[option];
            }
            return selectedValue;
        },
        this.getSelectedTime = function(setObj, option) {
            var tgSettings = this.getTGSettings(setObj),
                fromTime = tgSettings.time_range,
                toTime = 0;
            if(option != "update" && sessionStorage.tg_from_time &&
                                     sessionStorage.tg_to_time) {
                fromTime = parseInt(sessionStorage.tg_from_time) * 1000;
                toTime = parseInt(sessionStorage.tg_to_time) * 1000;
            } else {
                if(fromTime == -1 || fromTime == -2) {
                    if(fromTime == -1) {
                        toTime = new Date(tgSettings.to_time).getTime();
                    }
                    if(fromTime == -2) {
                        toTime = "now";
                    }
                    fromTime = new Date(tgSettings.from_time).getTime();
                } else {
                    fromTime /= 60;
                    fromTime = "now-" + (fromTime + 'm');
                    toTime = "now-" + (toTime + 'm')
                }
            }
            return {
                fromTime : fromTime,
                toTime : toTime
            }
        },
        this.getProjectPrefix = function() {
            var currentProject = '';
            if(contrail.getCookie(cowc.COOKIE_PROJECT) != 'undefined') {
                currentProject =
                        contrail.getCookie(cowc.COOKIE_PROJECT) + ':';
            }
            return contrail.getCookie(cowc.COOKIE_DOMAIN) + ':'+ currentProject;
        },
        this.querySessionSeries = function(reqObj, setObj) {
            var self = this,
                selectedTime = this.getSelectedTime(setObj);
                clientPostData = {
                    "session_type": "client",
                    "start_time": selectedTime.fromTime,
                    "end_time": selectedTime.toTime,
                    "select_fields": reqObj.selectFields,
                    "table": "SessionSeriesTable",
                    "where": [reqObj.whereClause],
                    'filter': reqObj.filter ? [reqObj.filter] : []
                },
                serverPostData = {
                    "session_type": "server",
                    "start_time": selectedTime.fromTime,
                    "end_time": selectedTime.toTime,
                    "select_fields": reqObj.selectFields,
                    "table": "SessionSeriesTable",
                    "where": [reqObj.whereClause],
                    'filter': reqObj.filter ? [reqObj.filter] : []
                },
                clientModelConfig = {
                    remote : {
                        ajaxConfig : {
                            url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                            type:'POST',
                            data:JSON.stringify(clientPostData)
                        },
                        dataParser : function (response) {
                            reqObj.clientData = cowu.getValueByJsonPath(response, 'value', []);
                            reqObj.curSessionData = reqObj.clientData;
                            return reqObj.clientData;
                        }
                    }
                },
                serverModelConfig = {
                    remote : {
                        ajaxConfig : {
                            url:monitorInfraConstants.monitorInfraUrls['ANALYTICS_QUERY'],
                            type:'POST',
                            data:JSON.stringify(serverPostData)
                        },
                        dataParser : function (response) {
                            reqObj.serverData = cowu.getValueByJsonPath(response, 'value', []);
                            reqObj.curSessionData = reqObj.serverData;
                            return reqObj.serverData;
                        }
                    }
                };

            if(reqObj.type == 'both') {
                var clientModel = new ContrailListModel(clientModelConfig),
                    serverModel = new ContrailListModel(serverModelConfig),
                    reqCount = 0;
                clientModel.onAllRequestsComplete.subscribe(function() {
                   reqCount++;
                   bothRequestDone(reqCount);
                });
                serverModel.onAllRequestsComplete.subscribe(function() {
                    reqCount++;
                    bothRequestDone(reqCount);
                });
            } else if(reqObj.sessionType == 'client') {
                var clientModel = new ContrailListModel(clientModelConfig);
                clientModel.onAllRequestsComplete.subscribe(function() {
                  reqObj.callback(reqObj);
                });
            } else {
                var serverModel = new ContrailListModel(serverModelConfig);
                serverModel.onAllRequestsComplete.subscribe(function() {
                   reqObj.callback(reqObj);
                });
            }
            function bothRequestDone(reqCount) {
                if(reqCount == 2) {
                    reqObj.callback(reqObj);
                }
            }
        },
        this.queryUveVmis = function(reqObj) {
            var self = this,
                vmUuids = [],
                postData = {
                    "parentType": "virtual-machine",
                    "cfilt": "UveVMInterfaceAgent:vm_uuid,UveVMInterfaceAgent:vm_name",
                    "kfilt": reqObj.vmNames.join(',')
                },
                modelConfig = {
                    remote : {
                        ajaxConfig : {
                            url: ctwc.URL_VM_INTERFACES,
                            type: 'POST',
                            data: JSON.stringify(postData)
                        },
                        dataParser : function (response) {
                            reqObj.vmiData = cowu.getValueByJsonPath(response, 'value', []);
                            _.each(reqObj.vmiData , function(vmi) {
                                vmUuids.push(_.result(vmi, 'value.UveVMInterfaceAgent.vm_uuid'));
                            });
                        }
                    },
                    vlRemoteConfig: {
                        vlRemoteList: [{
                            getAjaxConfig: function() {
                                return {
                                    url: ctwc.URL_VIRTUAL_MACHINE,
                                    type: 'GET',
                                    data: {
                                        fqNameRegExp: "*?cfilt=UveVirtualMachineAgent:vrouter&kfilt="+vmUuids.join(',')
                                    }
                                }
                            },
                            successCallback: function(response) {
                                reqObj.vmData = cowu.getValueByJsonPath(response, 'value', []);
                            }
                        }]
                    },
                    cacheConfig : {}
                };
            var model = new ContrailListModel(modelConfig);
            model.onAllRequestsComplete.subscribe(function() {
              reqObj.callback(reqObj);
            });
        },
        this.getPolicyInfoByApp = function(reqObj) {
            var self = this,
                policyObj = [],
                ruleUUIDs = [],
                listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'application-policy-sets', detail: true}]})
                    },
                    dataParser: function (data) {
                        var apsDetails = _.result(data, '0.application-policy-sets', []),
                            project = contrail.getCookie(cowc.COOKIE_PROJECT),
                            domain = contrail.getCookie(cowc.COOKIE_DOMAIN);
                        policyObj = self.getAndSortAppAPS(apsDetails, project, domain, reqObj.app, reqObj.appList);
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: [{
                        getAjaxConfig: function() {
                            return {
                                url: ctwc.URL_GET_CONFIG_DETAILS,
                                type: 'POST',
                                data: JSON.stringify(
                                {data: [{type: 'firewall-policys',obj_uuids: policyObj, detail: true}]})
                            }
                        },
                        successCallback: function(response) {
                            var fPolicyList  = _.result(response, '0.firewall-policys', []);
                            ruleUUIDs = self.getAndSortAppRullUUIDs(fPolicyList, policyObj);
                        }
                    }]
                }
            }
            var ruleDetailsModel = new ContrailListModel(listModelConfig);
            ruleDetailsModel.onAllRequestsComplete.subscribe(function() {
               reqObj.ruleUUIDs = _.uniq(ruleUUIDs);
               if(reqObj.callback) reqObj.callback(reqObj);
               if(reqObj.callback2) reqObj.callback2(reqObj);
            });
        },
        this.sortPolicyList = function(baseArray, path, array) {
            baseArray.sort(function(p1, p2){
                  return (array.indexOf(_.result(p1, path, {}).uuid) -
                         array.indexOf(_.result(p2, path, {}).uuid));
            });
            return baseArray;
        },
        this.addFPolicyRefs = function(apsObj, policyObj) {
            _.each(apsObj, function(aps) {
                var curAps = _.result(aps, 'application-policy-set', {}),
                    fPolicyRefs = curAps['firewall_policy_refs'];
                if(fPolicyRefs) {
                    fPolicyRefs.sort(function(a, b) {
                        return a.attr.sequence - b.attr.sequence;
                    });
                    _.each(fPolicyRefs, function(ref) {
                        policyObj.push(ref.uuid);
                    });
                }
            });
            return policyObj;
        },
        this.getContainerViewConfig = function() {
            return {
                rows: [
                    {
                        columns:[{
                            elementId: 'view_type',
                            view: "FormRadioButtonView",
                            default: 'chart-stats',
                            viewConfig: {
                                label: 'View',
                                path: 'view_type',
                                class: 'col-xs-12',
                                default: 'chart-stats',
                                dataBindValue: 'view_type',
                                templateId: cowc.TMPL_OPTNS_WITH_ICONS_RADIO_BUTTON_VIEW,
                                elementConfig: {
                                    dataObj: [
                                        {value: 'grid-stats', icon: 'fa-table'},
                                        {value: 'chart-stats', icon: 'fa-bar-chart-o'}
                                    ]
                                }
                            }
                        }],
                    },
                    {
                        columns: [{
                            elementId: 'showInnerCircle',
                            view: 'FormCheckboxView',
                            viewConfig: {
                                label: 'Inner Circle',
                                path: 'showInnerCircle',
                                dataBindValue: 'showInnerCircle',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                class: 'showicon col-xs-6'
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'showLegend',
                            view: 'FormCheckboxView',
                            viewConfig: {
                                label: 'Legends',
                                path: 'showLegend',
                                dataBindValue: 'showLegend',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                class: 'showicon col-xs-6'
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'untaggedEndpoints',
                            view: 'FormCheckboxView',
                            default: false,
                            viewConfig: {
                                label: 'Untagged Endpoints',
                                path: 'untaggedEndpoints',
                                dataBindValue: 'untaggedEndpoints',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                class: 'showicon col-xs-12'
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: 'sliceByProject',
                            view: 'FormCheckboxView',
                            default: false,
                            viewConfig: {
                                label: 'Project Name',
                                path: 'sliceByProject',
                                dataBindValue: 'sliceByProject',
                                templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                class: 'showicon col-xs-12'
                            }
                        }]
                    }
                ]
            }
        },
        this.getTabsViewConfig = function (elementId, displayTabs) {
            return {
                elementId: cowu.formatElementId([elementId + '-list']),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: elementId + '-tabs',
                            view: 'TabsView',
                            viewConfig: {
                                theme: 'default',
                                active: 0,
                                tabs: this.getTabsContentConfig(displayTabs),
                                type: cowc.TAB_FORM_TYPE
                            }
                        }]
                    }]
                }
            }
        },
        this.getTabsContentConfig = function(displayTabs) {
            var self = this,
                tabConfig = [];
            if($.inArray('vmi-details-tab', displayTabs) >  -1) {
                tabConfig.push({
                    elementId: "vmi-details-tab",
                    title: 'Workloads',
                    view: "TextView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "core-basedir/js/views/",
                    viewConfig: {
                        tabid: "vmi-details-tab",
                        template: 'tg-vmi-details-template',
                        title: 'Workloads'
                    },
                    tabConfig: {
                       activate: function(event, ui) {}
                    }
                });
            }
            /*tabConfig.push({
                elementId: "tg_rules",
                title: 'Rules',
                view: "TextView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "core-basedir/js/views/",
                viewConfig: {
                    tabid: "tg_rules",
                    template: 'tg-policy-tab-template',
                    title: 'Rules'
                },
                tabConfig: {
                   activate: function(event, ui) {}
                }
            });*/
            if($.inArray('matched-rules-tab', displayTabs) >  -1) {
                tabConfig.push({
                    elementId: "matched-rules-tab",
                    title: 'Matched Rules',
                    view: "TextView",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewPathPrefix: "core-basedir/js/views/",
                    viewConfig: {
                        tabid: "matched-rules-tab",
                        template: 'tg-matched-rules-tab-template',
                        title: 'Matched Rules'
                    },
                    tabConfig: {
                       activate: function(event, ui) {}
                    }
                });
            }
            return tabConfig;
        },
        this.getAndSortAppAPS = function(apsDetails, project, domain, app, appList) {
            var policyObj = [];
            var defaultAPS = _.filter(apsDetails, function(aps) {
                var curAps = _.result(aps, 'application-policy-set', {});
                return (curAps.fq_name[0] == 'default-policy-management' &&
                        curAps.fq_name[1] == 'default-application-policy-set');
            });
            policyObj = this.addFPolicyRefs(defaultAPS, policyObj);
            var curAppGlobalAPS = _.filter(apsDetails, function(aps) {
                var curAps = _.result(aps, 'application-policy-set', {}),
                    tagAPS = _.filter(curAps.tag_refs, function(tagRef) {
                        var istagRef;
                        if(tagRef.to) {
                            var tagRefVal = tagRef.to.join(':');
                            istagRef = (app == 'all') ?
                                ($.inArray(tagRefVal, appList) > -1) : (tagRefVal == app)
                        }
                        return ((curAps.fq_name[0] == 'default-policy-management')
                               && istagRef);
                    });
                return tagAPS.length;
            });
            policyObj = this.addFPolicyRefs(curAppGlobalAPS, policyObj);
            var projectAPS = _.filter(apsDetails, function(aps) {
                var curAps = _.result(aps, 'application-policy-set', {});
                return (curAps.fq_name[0] == domain &&
                        (project == 'undefined' || curAps.fq_name[1] == project) &&
                        curAps.fq_name[2] == 'default-application-policy-set');
            });
            policyObj = this.addFPolicyRefs(projectAPS, policyObj);
            var curAppAPS = _.filter(apsDetails, function(aps) {
                var curAps = _.result(aps, 'application-policy-set', {}),
                    tagAPS = _.filter(curAps.tag_refs, function(tagRef) {
                        var istagRef;
                        if(tagRef.to) {
                            var tagRefVal = tagRef.to.join(':');
                            istagRef = (app == 'all') ?
                                ($.inArray(tagRefVal, appList) > -1) : (tagRefVal == app)
                        }
                        return ((curAps.fq_name[0] == domain &&
                               (project == 'undefined' || curAps.fq_name[1] == project))
                               && istagRef);
                    });
                return tagAPS.length;
            });
            policyObj = this.addFPolicyRefs(curAppAPS, policyObj);
            policyObj = _.uniq(policyObj);
            return policyObj;
        },
        this.getAndSortAppRullUUIDs  = function(fPolicyList, policyObj) {
            var ruleUUIDs = [];
            if(fPolicyList.length) {
                fPolicyList = this.sortPolicyList(fPolicyList, 'firewall-policy', policyObj);
                _.each(fPolicyList, function(policyObj) {
                    var obj = _.result(policyObj, 'firewall-policy', {}),
                        ruleRefs = obj.firewall_rule_refs;
                    if(ruleRefs) {
                        ruleRefs.sort(function(a, b) {
                            return a.attr.sequence - b.attr.sequence;
                        });
                        _.each(ruleRefs, function(ref) {
                            ruleUUIDs.push(ref.uuid);
                        });
                    }
                });
            }
            return ruleUUIDs;
        },
        this.getCurrentSessionDetails = function(src, dst, id) {
            var srcSessionInfo = {
                    'columns' : ['Sessions', 'Intiated', 'Responded'],
                    'rows' : [{
                        values: ['In Bytes:', formatBytes(_.result(src, id+'.0.session_initiated_in_bytes')), formatBytes(_.result(src, id+'.0.session_responded_in_bytes'))]
                    },{
                        values: ['Out Bytes:', formatBytes(_.result(src, id+'.0.session_initiated_out_bytes')), formatBytes(_.result(src, id+'.0.session_responded_out_bytes'))]
                    },{
                        values: ['MAX (Active):', _.result(src, id+'.0.session_initiated_max_active', '-'), _.result(src, id+'.0.session_responded_max_active', '-')]
                    },{
                        values: ['MIN (Active):', _.result(src, id+'.0.session_initiated_min_active', '-'), _.result(src, id+'.0.session_responded_min_active', '-')]
                    },{
                        values: ['Deleted:', _.result(src, id+'.0.session_initiated_deleted', '-'), _.result(src, id+'.0.session_responded_deleted', '-')]
                    }]
                },
                dstSessionInfo = {
                    'columns' : ['Sessions', 'Intiated', 'Responded'],
                    'rows' : [{
                        values: ['In Bytes:', formatBytes(_.result(dst, id+'.0.session_initiated_in_bytes')), formatBytes(_.result(dst, id+'.0.session_responded_in_bytes'))]
                    },{
                        values: ['Out Bytes:', formatBytes(_.result(dst, id+'.0.session_initiated_out_bytes')), formatBytes(_.result(dst, id+'.0.session_responded_out_bytes'))]
                    },{
                        values: ['MAX (Active):', _.result(dst, id+'.0.session_initiated_max_active', '-'), _.result(dst, id+'.0.session_responded_max_active', '-')]
                    },{
                        values: ['MIN (Active):', _.result(dst, id+'.0.session_initiated_min_active', '-'), _.result(dst, id+'.0.session_responded_min_active', '-')]
                    },{
                        values: ['Deleted:', _.result(dst, id+'.0.session_initiated_deleted', '-'), _.result(dst, id+'.0.session_responded_deleted', '-')]
                    }]
                };
                return { srcSessionInfo, dstSessionInfo };
        },
        this.parseAndSortPolicyDetailObj = function(ruleObj) {
            ruleObj.ruleDetails = this.sortPolicyList(ruleObj.ruleDetails, 'firewall-rule', ruleObj.ruleUUIDs);
            var ruleMap = {}, self = this,
                tooltipTemplate = contrail.getTemplate4Id(cowc.TOOLTIP_CUSTOM_TEMPLATE);
            var defaultRuleUUIDs = _.keys(cowc.DEFAULT_FIREWALL_RULES);
            if(ruleObj.showImplicitRules) {
                $.each(defaultRuleUUIDs, function (idx, uuid) {
                    if (ruleObj.ruleUUIDs && ruleObj.ruleUUIDs.indexOf(uuid) > -1) {
                        var defaultRuleDetails = cowc.DEFAULT_FIREWALL_RULES[uuid],
                            sessionInfo = self.getCurrentSessionDetails(ruleObj.srcSessionObj, ruleObj.dstSessionObj, uuid);
                        ruleObj.formattedRuleDetails.push({
                            policy_name: _.result(defaultRuleDetails, 'name'),
                            rule_name: uuid,
                            srcId: ruleObj.srcId,
                            dstId: ruleObj.dstId,
                            rule_fqn: uuid,
                            srcTooltipContent: tooltipTemplate(sessionInfo.srcSessionInfo),
                            dstTooltipContent: tooltipTemplate(sessionInfo.dstSessionInfo),
                            implicitRule: 'implicitRuleStyle',
                            showSessionData: ruleObj.showSessionData,
                            src_session_initiated: _.result(ruleObj.srcSessionObj, uuid+'.0.session_initiated', 0),
                            src_session_responded: _.result(ruleObj.srcSessionObj, uuid+'.0.session_responded', 0),
                            src_session_initiated_active: _.result(ruleObj.srcSessionObj, uuid+'.0.session_initiated_active', 0),
                            src_session_responded_active: _.result(ruleObj.srcSessionObj, uuid+'.0.session_responded_active', 0),
                            dst_session_initiated: _.result(ruleObj.dstSessionObj, uuid+'.0.session_initiated', 0),
                            dst_session_responded: _.result(ruleObj.dstSessionObj, uuid+'.0.session_responded', 0),
                            dst_session_initiated_active: _.result(ruleObj.dstSessionObj, uuid+'.0.session_initiated_active', 0),
                            dst_session_responded_active: _.result(ruleObj.dstSessionObj, uuid+'.0.session_responded_active', 0)
                        });
                    }
                });
            }
            $.each(ruleObj.ruleDetails, function (idx, detailsObj) {
                if (detailsObj['firewall-rule'] != null) {
                    var ruleDetailsObj = detailsObj['firewall-rule'],
                        ruleUUID = detailsObj['firewall-rule']['uuid'];
                    ruleMap[detailsObj['firewall-rule']['uuid']] = ruleDetailsObj;
                    var formattedConfigRuleObj = self.formatConfigRuleData(ruleDetailsObj);
                    var sessionInfo = self.getCurrentSessionDetails(ruleObj.srcSessionObj, ruleObj.dstSessionObj, ruleUUID);
                    ruleObj.formattedRuleDetails.push($.extend(true, formattedConfigRuleObj, {
                        showSessionData: ruleObj.showSessionData,
                        srcId: ruleObj.srcId,
                        src_session_initiated: _.result(ruleObj.srcSessionObj, ruleUUID+'.0.session_initiated', 0),
                        src_session_responded: _.result(ruleObj.srcSessionObj, ruleUUID+'.0.session_responded', 0),
                        src_session_initiated_active: _.result(ruleObj.srcSessionObj, ruleUUID+'.0.session_initiated_active', 0),
                        src_session_responded_active: _.result(ruleObj.srcSessionObj, ruleUUID+'.0.session_responded_active', 0),
                        dstId: ruleObj.dstId,
                        srcTooltipContent: tooltipTemplate(sessionInfo.srcSessionInfo),
                        dstTooltipContent: tooltipTemplate(sessionInfo.dstSessionInfo),
                        dst_session_initiated: _.result(ruleObj.dstSessionObj, ruleUUID+'.0.session_initiated', 0),
                        dst_session_responded: _.result(ruleObj.dstSessionObj, ruleUUID+'.0.session_responded', 0),
                        dst_session_initiated_active: _.result(ruleObj.dstSessionObj, ruleUUID+'.0.session_initiated_active', 0),
                        dst_session_responded_active: _.result(ruleObj.dstSessionObj, ruleUUID+'.0.session_responded_active', 0),
                    }));
                }
            });
            return {
                formattedRuleDetails : ruleObj.formattedRuleDetails,
                ruleMap : ruleMap
            }
        }
    }
    return trafficGroupsHelpers;
});
