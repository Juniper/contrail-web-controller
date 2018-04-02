/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['lodashv4'],
        function(_){
    var SecurityDashboardViewConfig = function () {
        var self = this;
        self.viewConfig = {
            'all-tags-traffic': {
                baseModel:'ALL_TAGS_TRAFFIC_MODEL',
                baseView: 'ALL_TAGS_TRAFFIC_VIEW',
                itemAttr: {
                    width: 0.2,
                    height: 1,
                    title: 'Total vs Deny Traffic',
                    showTitle: true
                }
            },
            'top-tags': {
                baseModel:'TOP_TAGS_MODEL',
                baseView: 'TOP_TAGS_VIEW',
                itemAttr: {
                    width: 0.85,
                    height: 1,
                    title: 'Top Applications',
                    showTitle: true
                }
            },
            'top-vns': {
                baseModel:'TOP_VN_MODEL',
                baseView: 'TOP_VN_VIEW',
                itemAttr: {
                    width: 0.34,
                    height: 1,
                    title: 'Top Virtual Neworks',
                    showTitle: true
                }
            },
            'top-acl-with-deny': {
                baseModel:'TOP_ACL_WITH_DENY_MODEL',
                baseView: 'TOP_ACL_WITH_DENY_VIEW',
                itemAttr: {
                    width: 0.34,
                    height: 1,
                    title: 'Top ACLs with Deny',
                    showTitle: true
                }
            },
            'top-vmis-with-deny': {
                baseModel: 'TOP_VMI_WITH_DENY_MODEL',
                baseView: 'TOP_VMI_WITH_DENY_VIEW',
                itemAttr: {
                    width: 0.34,
                    height: 1,
                    title: 'Top VMIs with Deny',
                    showTitle: true
                }
            }
        };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
    };
    return (new SecurityDashboardViewConfig()).viewConfig;
});
