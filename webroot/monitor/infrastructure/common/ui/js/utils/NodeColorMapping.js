/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore' ],
       function(_) {
            var NodeColorMapping = function() {
                var nodeColorMap = {};

                this.getNodeColorMap = function (hostNames) {
                    var self = this;
                    if (!$.isArray(hostNames)) {
                        hostNames = [hostNames];
                    }
                    var keys = _.keys(nodeColorMap),
                        colors = cowc.FIVE_NODE_COLOR,
                        keysLen = 0;
                    //if hostname doesn't exists in nodeColorMap
                    //if (keys.toString().indexOf(hostNames.toString()) == -1) {
                        keys = _.unique(keys.concat(hostNames));
                        keys = _.sortBy(keys),
                        keysLen = keys.length;
                        if (keysLen == 1) {
                            colors = cowc.SINGLE_NODE_COLOR;
                        } else if (keysLen > 1 && keysLen <=3) {
                            colors = cowc.THREE_NODE_COLOR;
                        }
                        $.each(keys, function (idx, obj) {
                            nodeColorMap[obj] = colors[idx];
                        });
                    //}
                    return nodeColorMap;
                };
            };
            return NodeColorMapping;
       });