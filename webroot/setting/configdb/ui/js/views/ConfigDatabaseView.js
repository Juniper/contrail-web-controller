/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ConfigDatabaseView = ContrailView.extend({
        el: $(contentContainer),

        renderFQTableNamesList: function (viewConfig) {
            var self = this,
                hashParams = viewConfig['hashParams'],
                key = hashParams['key'],
                table = hashParams['table'];

            if (contrail.checkIfExist(key) && contrail.checkIfExist(table)) {
                this.renderView4Config(self.$el, null, getFQKeyTableNamesListConfig(hashParams));
            } else {
                this.renderView4Config(self.$el, null, getFQTableNamesListConfig(viewConfig));
            }
        },

        renderUUIDTableNamesList: function (viewConfig) {
            var self = this,
                hashParams = viewConfig['hashParams'],
                key = hashParams['key'],
                table = hashParams['table'];

            if (contrail.checkIfExist(key) && contrail.checkIfExist(table)) {
                this.renderView4Config(this.$el, null, getUUIDKeyTableNamesListConfig(hashParams));
            } else {
                this.renderView4Config(this.$el, null, getUUIDTableNamesListConfig(viewConfig));
            }
        },

        renderSharedTableNamesList: function (viewConfig) {
            var self = this,
                hashParams = viewConfig['hashParams'],
                key = hashParams['key'],
                table = hashParams['table'];

            if (contrail.checkIfExist(key) && contrail.checkIfExist(table)) {
                this.renderView4Config(this.$el, null, getSharedKeyTableNamesListConfig(hashParams));
            } else {
                this.renderView4Config(this.$el, null, getSharedTableNamesListConfig(viewConfig));
            }
        }
    });

    function getUUIDTableNamesListConfig (hashParams) {
        var gridConfig = {
            url       : ctwc.URL_OBJECT_UUID_TABLE,
            table     : ctwc.OBJECT_UUID_TABLE,
            gridTitle : ctwl.CDB_TITLE_UUID_TABLE,
            columnName: 'keys',
            actionCell: true,
            columns: [
                {
                    id         : "key",
                    field      : "key",
                    name       : "UUID",
                    cssClass   : 'cell-hyperlink-blue',
                    searchable : true,
                    events     : {
                        onClick: function (e, dc) {
                            var currentHashObj = layoutHandler.getURLHashObj();
                            loadFeature({p: currentHashObj['p'], q: {'key': dc['key'], 'table': dc['table']}});
                        }
                    }
                }
            ]
        };

        return {
            elementId: ctwl.CDB_UUID_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_UUID_TABLE_GRID_ID,
                                title     : ctwl.CDB_TITLE_UUID_KEY_TABLE,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_UUID_TABLE_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getSharedTableNamesListConfig (hashParams) {
        var gridConfig = {
            url       : ctwc.URL_OBJECT_SHARED_TABLE,
            table     : ctwc.OBJECT_SHARED_TABLE,
            gridTitle : ctwl.CDB_TITLE_SHARED_TABLE,
            columnName: 'keys',
            actionCell: true,
            columns: [
                {
                    id         : "key",
                    field      : "key",
                    name       : "Key",
                    cssClass   : 'cell-hyperlink-blue',
                    searchable : true,
                    events     : {
                        onClick: function (e, dc) {
                            var currentHashObj = layoutHandler.getURLHashObj();
                            loadFeature({p: currentHashObj['p'], q: {'key': dc['key'], 'table': dc['table']}});
                        }
                    }
                }
            ]
        };

        return {
            elementId: ctwl.CDB_SHARED_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_SHARED_TABLE_GRID_ID,
                                title     : ctwl.CDB_TITLE_SHARED_KEY_TABLE,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_SHARED_TABLE_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getUUIDKeyTableNamesListConfig (hashParams) {
        var gridConfig = {
            url        : '/api/query/cassandra/values/' + hashParams['table'] + '/' + hashParams['key'],
            table      : hashParams['table'],
            gridTitle  : 'UUID Details: ' + hashParams['key'],
            columnName : 'keyvalues',
            actionCell: true,
            columns: [
                {
                    id        : "keyvalue",
                    field     : "keyvalue",
                    name      : "Details",
                    searchable: true
                }
            ]
        };

        return {
            elementId: ctwl.CDB_UUID_KEY_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_UUID_KEY_TABLE_GRID_ID,
                                title     : ctwl.CDB_TITLE_UUID_KEY_TABLE_NAMES,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_UUID_KEY_TABLE_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getSharedKeyTableNamesListConfig (hashParams) {
        var gridConfig = {
            url        : '/api/query/cassandra/values/' + hashParams['table'] + '/' + hashParams['key'],
            table      : hashParams['table'],
            gridTitle  : 'Key Details: ' + hashParams['key'],
            columnName : 'keyvalues',
            actionCell: true,
            columns: [
                {
                    id        : "keyvalue",
                    field     : "keyvalue",
                    name      : "Details",
                    searchable: true
                }
            ]
        };

        return {
            elementId: ctwl.CDB_SHARED_KEY_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_SHARED_KEY_TABLE_GRID_ID,
                                title     : ctwl.CDB_TITLE_SHARED_KEY_TABLE_NAMES,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_SHARED_KEY_TABLE_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getFQTableNamesListConfig () {
        var gridConfig = {
            url        : "/api/query/cassandra/keys/obj_fq_name_table",
            table      : "obj_fq_name_table",
            gridTitle  : ctwl.CDB_TITLE_FQ_TABLE,
            columnName : 'keys',
            actionCell : true,
            columns : [
                {
                    id        : "key",
                    field     : "key",
                    name      : "Key",
                    cssClass  : 'cell-hyperlink-blue',
                    searchable: true,
                    events    : {
                        onClick: function (e, dc) {
                            var currentHashObj = layoutHandler.getURLHashObj();
                            loadFeature({p: currentHashObj['p'], q: {'key': dc['key'], 'table': dc['table']}});
                        }
                    }
                },
            ]
        };

        return {
            elementId: ctwl.CDB_FQ_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_FQ_TABLE_NAMES_GRID_ID,
                                title     : ctwl.CDB_TITLE_FQ_TABLE_NAMES,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_FQ_TABLE_NAMES_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getFQKeyTableNamesListConfig (hashParams) {
        var gridConfig = {
            url       : '/api/query/cassandra/values/' + hashParams['table'] + '/' + hashParams['key'],
            table     : hashParams['table'],
            gridTitle : 'FQ Name Details: ' + hashParams['key'],
            columnName: 'keyvalues',
            actionCell: true,
            columns : [
                {
                    field     : "keyvalue",
                    name      : "FQ Name",
                    width: 80,
                    minWidth: 50,
                    searchable: true,
                    formatter: function (r, c, v, cd, dc) {
                        var arr = dc.keyvalue.split(":");
                        arr.pop();
                        return arr.join(":");
                    }
                },
                {
                    field      : "keyvalue",
                    name       : "UUID",
                    cssClass   : 'cell-hyperlink-blue',
                    searchable : true,
                    formatter  : function (r, c, v, cd, dc) {
                        return dc.keyvalue.split(":")[dc.keyvalue.split(":").length - 1]
                    },
                    events: {
                        onClick: function (e, dc) {
                            var uuid = dc.keyvalue.split(":")[dc.keyvalue.split(":").length - 1]
                            loadFeature({p: "setting_configdb_uuid", q: {'key': uuid, 'table': "obj_uuid_table"}});
                        }
                    }
                }
            ]
        };

        return {
            elementId: ctwl.CDB_FQ_KEY_TABLE_NAMES_SECTION_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId : ctwl.CDB_FQ_KEY_TABLE_NAMES_GRID_ID,
                                title     : ctwl.CDB_TITLE_FQ_KEY_TABLE_NAMES,
                                view      : "GridView",
                                viewConfig: {
                                    elementConfig: getConfigDBTableNamesGridConfig(gridConfig, ctwl.CDB_FQ_KEY_TABLE_NAMES_GRID_ID)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    function getConfigDBTableNamesGridConfig (gridConfig, gridId) {
        return {
            header: {
                title: {
                    text: gridConfig.gridTitle
                },
                defaultControls: {
                    refreshable: true
                }
            },
            columnHeader: {
                columns: gridConfig.columns
            },
            body: {
                options: {
                    detail: false,
                    checkboxSelectable: false,
                    forceFitColumns: true,
                    actionCell: function (dc) {
                        if (gridConfig.actionCell && globalObj['configDBEditEnabled']) {
                            return getActionCog(gridConfig.columnName, gridId);
                        } else {
                            return [];
                        }
                    }
                },
                dataSource: {
                    remote: {
                        ajaxConfig: {
                            url: gridConfig.url
                        },
                        dataParser: function (response) {
                            globalObj['configDBEditEnabled'] = response.editEnabled;
                            return response[gridConfig.columnName];
                        },
                        serverSidePagination: false
                    }
                },
                statusMessages: {
                    empty: {
                        text: ctwm.NO_RECORDS_IN_DB
                    },
                    error: {
                        type       : 'error',
                        iconClasses: 'icon-warning',
                        text       : ctwm.CASSANDRA_ERROR
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize      : 100,
                        pageSizeSelect: [50, 100, 200, 500]
                    }
                }
            }
        }
    };

    function getActionCog(columnName, gridId){
        return [{
            title: 'Delete',
            iconClass: 'icon-trash',
            onClick: function(rowIndex){
                var selectedRow = $('#' + gridId).data('contrailGrid')._dataView.getItem(rowIndex);
                if(columnName === "keys"){
                    createModalForDelete(selectedRow, "delete-key");
                }else if(columnName === "keyvalues"){
                    createModalForDelete(selectedRow, "delete-key-value");
                }
            }
        }];
    };

    function createModalForDelete (selectedRow, type){
        var textTemplate = '', modalId = "delete-cdb",
            callbackObj = {
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {});
                }
            };

        if( (contrail.checkIfExist(selectedRow.keyvalue)) && (type == ctwc.DELETE_KEY_VALUE_TYPE) ){
            textTemplate = '<div>Are you sure you want to delete <b>' + selectedRow.keyvalue + '</b> ?</div>';
        } else if ((contrail.checkIfExist(selectedRow.key)) && (type == ctwc.DELETE_KEY_TYPE)) {
            textTemplate = '<div>Are you sure you want to delete <b>' + selectedRow.key + '</b> ?</div>';
        }

        cowu.createModal({'modalId': modalId , 'className': 'modal-700', 'title': "Delete ", 'btnName': 'Confirm', 'body': textTemplate, 'onSave': function () {
            var url, ajaxConfig = {};

            if (type == ctwc.DELETE_KEY_TYPE) {
                url = "/api/query/cassandra/key/" + selectedRow.table + "/" + selectedRow.key;
            } else if (type == ctwc.DELETE_KEY_VALUE_TYPE) {
                url = "/api/query/cassandra/value/" + selectedRow.table + "/" + selectedRow.key + "/" + selectedRow.keyvalue;
            }

            ajaxConfig.type = "DELETE";
            ajaxConfig.url = url;

            contrail.ajaxHandler(ajaxConfig, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });

        }, 'onCancel': function () {
            $("#" + modalId).modal('hide');
        }});
    };

    return ConfigDatabaseView;
});