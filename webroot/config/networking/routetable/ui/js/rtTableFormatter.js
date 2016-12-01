/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function(_){
    var rtTableFomatter = function() {
        this.formatRoutes = function(r, c, v, cd, dc, details) {
            var dispStr = "";
            if (null != v) {
                if (!v.length) {
                    return "-";
                }
                var len = v.length;
                if ((null == details) || (false == details)) {
                    if (v.length > 2) {
                        len = 2;
                    } else {
                        len = v.length;
                    }
                }
                for (var i = 0; i < len; i++) {
                    if (null != v[i]['prefix']) {
                        dispStr += 'prefix ';
                        dispStr += '<span class="gridLabel">' + v[i]['prefix'] + '</span>';
                    }
                    if (null != v[i]['next_hop_type']) {
                        dispStr += 'next-hop-type ';
                        dispStr += '<span class="gridLabel">' +
                            v[i]['next_hop_type'] + '</span>';
                    }
                    if (null != v[i]['next_hop']) {
                        dispStr += 'next-hop ';
                        dispStr += '<span class="gridLabel">' + v[i]['next_hop'] +
                            '</span>';
                    }
                    var commAttr =
                        getValueByJsonPath(v[i],
                                           'community_attributes;community_attribute',
                                           []);
                    if (commAttr.length > 0) {
                        dispStr += 'community-attributes ';
                        dispStr += '<span class="gridLabel">' +
                            commAttr.join(', ') + '</span>';
                    }
                    dispStr += '<br>';
                }
                if (((null == details) || (false == details)) && (v.length > 2)) {
                    dispStr += '(' + (v.length - 2).toString() + ' more)';
                }
            }
            return dispStr;
        };

    };
    return rtTableFomatter;
});

