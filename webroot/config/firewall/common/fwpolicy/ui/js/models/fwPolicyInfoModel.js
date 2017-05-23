/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var fwPolicyInfoModel = ContrailModel.extend({
        defaultConfig: {
            'display_name': '',
            'description': '',
            'tag_refs': ''
        }
    });
    return fwPolicyInfoModel;
});
