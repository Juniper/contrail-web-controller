/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "query-form-model",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-constants"
], function (_, QueryFormModel, qeModelConfig, coreConstants) {
    var SessionSeriesFormModel = QueryFormModel.extend({

        defaultSelectFields: ["session_class_id", "session_type"],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig({
                table_name: coreConstants.SESSION_SERIES_TABLE,
                table_type: coreConstants.QE_SESSION_TABLE_TYPE,
                query_prefix: coreConstants.SS_QUERY_PREFIX,
                select: coreConstants.DEFAULT_SS_SELECT_FIELDS,
            });

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        }
    });

    return SessionSeriesFormModel;
});
