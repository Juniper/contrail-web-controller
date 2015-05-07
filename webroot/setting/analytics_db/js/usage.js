/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var dbUsageObj = new DBUsageObj(),
    adbTemplate = contrail.getTemplate4Id('adb-template'),
    dbPurgeTemplate = contrail.getTemplate4Id('purge-action-template');

var adbColumns = [{
        field:"name",
        name:"Node",
        searchable: true,
        width:100
    },
    {
        field:"database_usage",
        name:"Total Disk Available",
        searchable: false,
        sortable: {
            soryBy: 'formattedValue'
        },
        width:100,
        formatter: function(r, c, v, cd, dc) {
            var diskAvailable = dc['database_usage'][0]['disk_space_available_1k'];
            return prettifyBytes({'bytes': diskAvailable * 1024});
        }
    },
    {
        field:"database_usage",
        name:"Total Disk Used",
        searchable: false,
        sortable: {
            soryBy: 'formattedValue'
        },
        width:100,
        formatter: function(r, c, v, cd, dc) {
            var diskUsed = dc['database_usage'][0]['disk_space_used_1k'];
            return prettifyBytes({'bytes': diskUsed  * 1024});
        }
    },
    {
        field:"database_usage",
        name:"Analytics DB Size",
        searchable: false,
        sortable: {
            soryBy: 'formattedValue'
        },
        width:100,
        formatter: function(r, c, v, cd, dc) {
            var analyticsDBSize = dc['database_usage'][0]['analytics_db_size_1k'];
            return prettifyBytes({'bytes': analyticsDBSize  * 1024});
        }
    }
];

function DBUsageObj() {
    this.load = function(){
        $(contentContainer).html(adbTemplate);

        $("#adb-results").contrailGrid({
            header: {
                title:{
                    text: "Analytics DB Usage"
                },
                customControls: [dbPurgeTemplate()],
                defaultControls: {
                    refreshable: true
                }
            },
            columnHeader: {
                columns: adbColumns
            },
            body: {
                options: {
                    forceFitColumns: true,
                    autoRefresh: 60
                },
                dataSource : {
                    remote: {
                        ajaxConfig: {
                            url: "/api/query/analytics/db/usage"
                        },
                        serverSidePagination: false
                    }
                },
                statusMessages: {
                    empty: {
                        text: 'No records found.'
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize:50
                    }
                }
            }
        });
    };

    this.destroy = function() {};
};

function purgeAnalyticsDB(purgePercentage) {
    var ajaxConfig = {
        type: "GET",
        url: "/api/analytics/db/purge?purge_input=" + purgePercentage
    };

    contrail.ajaxHandler(ajaxConfig, null, function(response) {
        if(response != null && response['status'] == 'started') {
            showInfoWindow("Analytics DB purge has been started.", "Success");
        } else {
            showInfoWindow(response, "Purge Response");
        }
    }, function(response){
        var errorMsg = contrail.parseErrorMsgFromXHR(response);
        showInfoWindow(errorMsg, "Error");
    });
}