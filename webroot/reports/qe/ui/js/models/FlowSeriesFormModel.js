/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "query-form-model",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-constants"
], function (_, QueryFormModel, qeModelConfig, coreConstants) {
    var FlowSeriesFormModel = QueryFormModel.extend({

        defaultSelectFields: ["flow_class_id", "direction_ing"],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig({
                table_name: coreConstants.FLOW_SERIES_TABLE,
                table_type: coreConstants.QE_FLOW_TABLE_TYPE,
                query_prefix: coreConstants.FS_QUERY_PREFIX,
                select: coreConstants.DEFAULT_FS_SELECT_FIELDS,
            });

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        }
    });

    return FlowSeriesFormModel;
});
