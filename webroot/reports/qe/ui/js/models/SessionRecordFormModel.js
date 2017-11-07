/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "query-form-model",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-constants"
], function (_, QueryFormModel, qeModelConfig, coreConstants) {
    var SessionRecordFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig({
                table_name: coreConstants.SESSION_RECORD_TABLE,
                table_type: coreConstants.QE_SESSION_TABLE_TYPE,
                query_prefix: coreConstants.SR_QUERY_PREFIX,
                select: coreConstants.DEFAULT_SR_SELECT_FIELDS,
            });

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        }
    });

    return SessionRecordFormModel;
});
