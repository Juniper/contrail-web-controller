/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var LLSGridConfig = function () {
        this.linkLocalServicesColumns = [
            {
                id: 'linklocal_service_name',
                field: 'linklocal_service_name',
                name: 'Service Name',
                cssClass :'cell-hyperlink-blue'
            },
            {
                id: 'linklocal_service_ip',
                field: 'linklocal_service_ip',
                name: 'Service Address',
                formatter: function(row, col, val, d, rowData) {
                    var dispStr = "";
                    if (null != rowData) {
                        if (null != rowData['linklocal_service_ip']) {
                            dispStr = rowData['linklocal_service_ip'];
                        }
                        if (null != rowData['linklocal_service_port']) {
                            dispStr += ":" +
                                rowData['linklocal_service_port'].toString();
                        }
                        return dispStr;
                    }
                    return "";
                }
            },
            {
                id: 'ip_fabric_service_ip',
                field: 'ip_fabric_service_ip',
                name: 'Fabric Address',
                formatter: function(row, col, val, d, rowData) {
                    var dispStr = "";
                    if (null != rowData) {
                        if ((null != rowData['ip_fabric_service_ip']) &&
                            (rowData['ip_fabric_service_ip'] instanceof Array) &&
                            (rowData['ip_fabric_service_ip'].length > 0)) {
                            dispStr = rowData['ip_fabric_service_ip'].join(',');
                        } else {
                            dispStr = rowData['ip_fabric_DNS_service_name'];
                        }
                        if (null != rowData['ip_fabric_service_port']) {
                            dispStr += ":" +
                                rowData['ip_fabric_service_port'].toString();
                        }
                        return dispStr;
                    }
                    return "";
                }
            }
        ];
    }
    return LLSGridConfig;
});

