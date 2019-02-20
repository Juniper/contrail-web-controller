/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'config/common/ui/js/models/routeTargetModel'
], function (_, RouteTargetModel) {
    var routeTargetUtils = function() {
        var self = this;
        self.getRouteTargets = function(attr) {
            attr['configured_route_target_list'] = {};
            attr['configured_route_target_list']['route_target'] =
                                             self.getRouteTargetList(attr,
                                                      'user_created_configured_route_target_list');
            if (!attr['configured_route_target_list']['route_target'].length) {
                attr['configured_route_target_list'] = {};
            }
        },
        self.readRouteTargetList = function (modelConfig, type) {
            var rtType = (type == 'user_created_configured_route_target_list' ?
                            'configured_route_target_list':"");

            var routeTargetModels = [], routeTargetList = [];
            routeTargetList =
                    self.routeTargetFormatter(null, null,
                                                     rtType, -1, modelConfig);
            if (routeTargetList.length) {
                for(var i = 0; i < routeTargetList.length; i++) {
                    var routeTargetModel = new RouteTargetModel(routeTargetList[i]);
                    routeTargetModels.push(routeTargetModel);
                }
            }
            modelConfig[type] = new Backbone.Collection(routeTargetModels);
        },

        self.addRouteTarget = function(type, thisModel) {
            var routeTarget = thisModel.attributes[type],
                newRouteTarget = new RouteTargetModel({'asn': null,
                                                    'target': null,
                                                      });
            routeTarget.add([newRouteTarget]);
        },
        self.addRouteTargetByIndex = function(type, thisModel, data, kbRouteTarget) {
            var selectedRuleIndex = data.model().collection.indexOf(kbRouteTarget.model());
            var routeTarget = thisModel.attributes[type],
                newRouteTarget = new RouteTargetModel({'asn': null,
                                                    'target': null,
                                                      });
            routeTarget.add([newRouteTarget],{at: selectedRuleIndex+1});
        },
        self.deleteRouteTarget = function(data, kbRouteTarget) {
            var routeTargetCollection = data.model().collection,
                routeTarget = kbRouteTarget.model();

            routeTargetCollection.remove(routeTarget);
        },
        self.getRouteTargetList = function(attr, type) {
            var routeTargetCollection = attr[type].toJSON(),
                routeTargetArray = [];
            for(var i = 0; i < routeTargetCollection.length; i++) {
                var asn = routeTargetCollection[i].asn();
                var target = routeTargetCollection[i].target();
                if (asn && target) {
                    routeTargetArray.push('target:' +
                                    asn.trim() + ':' + target.trim());
                }
            }
            return routeTargetArray;
        },
        self.routeTargetFormatter = function(d, c, v, cd, dc) {
            var rtObj =
                contrail.handleIfNull(
                        dc[v], []);
            var rtArr = [];
            var returnStr = '';
            rtObj = getValueByJsonPath(rtObj, 'route_target', []);
            $.each(rtObj, function (i, obj) {
                returnStr += obj.replace('target:','') + '<br/>';
                var rtSplit = obj.split(':');
                if (rtSplit.length == 3) {
                    rtArr.push({'asn': rtSplit[1],
                                'target': rtSplit[2]});
                }
            });

            return cd == -1 ? rtArr: returnStr;
        };

    }
    return routeTargetUtils;
});
