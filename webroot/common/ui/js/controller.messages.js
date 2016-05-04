/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CTMessages = function () {
        this.getInvalidErrorMessage = function(fieldKey) {
            return "Please enter a valid " + ctwl.getInLowerCase(fieldKey) + '.';
        };
        this.getRequiredMessage = function(fieldKey) {
            return ctwl.getFirstCharUpperCase(fieldKey) + ' is required.';
        };
        this.getResolveErrorsMessage = function(fieldKey) {
            return "Please resolve all " + fieldKey + " errors.";
        };

        this.NO_PROJECT_FOUND = 'No project found.';
        this.SHOULD_BE_VALID = '{0} should have valid ';

        this.NO_TRAFFIC_STATS_FOUND = 'No traffic stats found.';

        this.NO_DATA_FOUND = 'No data found.';
        this.NO_NETWORK_FOUND = 'No virtual network present in this project.';
        this.NO_VM_FOUND = 'No virtual machine present in this network.';
        this.HEALTH_CHECK_STATUS_INACTIVE = 'Health check status is inactive for 1 or more interfaces.';
        this.INSTANCE_DATA_NOT_AVAILABLE = 'Instance data is available in config but not available in analytics.';
        this.NO_PHYSICALDEVICES = 'No physical device found.';

        this.CASSANDRA_ERROR = 'Error: Cassandra client could not fetch data from server. Please check cassandra config parameters.';
        this.NO_RECORDS_IN_DB = 'No record found in DB.';

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };
    };
    return CTMessages;
});