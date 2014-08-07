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
        field:"disk_space_available",
        name:"Total Disk Available",
        searchable: false,
        width:100,
        formatter: function(r, c, v, cd, dc) {
            return prettifyBytes({'bytes': dc.disk_space_available * 1024});
        }
    },
    {
        field:"disk_space_used",
        name:"Total Disk Used",
        searchable: false,
        width:100,
        formatter: function(r, c, v, cd, dc) {
            return prettifyBytes({'bytes': dc.disk_space_used  * 1024});
        }
    },
    {
        field:"analytics_db_size",
        name:"Analytics DB Size",
        searchable: false,
        width:100,
        formatter: function(r, c, v, cd, dc) {
            return prettifyBytes({'bytes': dc.analytics_db_size  * 1024});
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