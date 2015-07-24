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

        this.NO_PROJECT_FOUND = 'No Project Found.';
        this.NO_DOMAIN_FOUND = 'No Domain Found.';
        this.SHOULD_BE_VALID = '{0} should have a valid ';

        this.NO_TRAFFIC_STATS_FOUND = 'No Traffic Stats Found.';

        this.NO_DATA_FOUND = 'No Data found.';
        this.NO_NETWORK_FOUND = 'No virtual network present in this project.';
        this.NO_VM_FOUND = 'No virtual machine present in this network.';

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };
    };
    return CTMessages;
});