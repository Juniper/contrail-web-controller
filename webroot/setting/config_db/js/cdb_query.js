/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cdbTemplate = contrail.getTemplate4Id('cdb-template');

var fqNameTableObj = new fqNameTableObj(),
    uuidTableObj = new uuidTableObj();

var cdbColumns = {
    keys: [{
        field:"key",
        name:"Key",
        cssClass:'cell-hyperlink-blue',
        searchable: true,
        events: {
            onClick: function(e,dc){
                loadKeyValues(dc.table+'~'+dc.key);
            }
        }
    }],
    keyvalues: [{
            field:"keyvalue",
            name:"Key Value",
            searchable: true
    }]
};

function fqNameTableObj() {
    this.load = loadFQNameTable;
    this.destroy = function() {};
};

function uuidTableObj() {
    this.load = loadUUIDTable;
    this.destroy = function() {};
};

function loadFQNameTable() {
    $(contentContainer).html(cdbTemplate);
    var gridConfig = {
    		url: "/api/query/cassandra/keys/obj_fq_name_table", 
    	    table: "obj_fq_name_table",
    		gridTitle: 'FQ Name Table Keys',
    		columnName: 'keys'
    };
    createGrid(gridConfig, true);
};

function loadUUIDTable() {
    $(contentContainer).html(cdbTemplate);
    var gridConfig = {
    		url: "/api/query/cassandra/keys/obj_uuid_table", 
    	    table: "obj_uuid_table",
    		gridTitle: 'UUID Table Keys',
    		columnName: 'keys'
    };
    createGrid(gridConfig, true);
};

function loadKeyValues(elementId) {
    var elements = elementId.split("~");
    var gridConfig = {
    		url: '/api/query/cassandra/values/' + elements[0] + '/' + elements[1], 
    	    table: elements[0],
    		gridTitle: 'Key Values: ' + elements[1],
    		columnName: 'keyvalues'
    };
    createGrid(gridConfig, false);
};

function createGrid(gridConfig, disableBackButton) {
	var editEnabled = true;
	$("#cdb-results").contrailGrid({
        header: {
            title:{
                text: gridConfig.gridTitle,
                cssClass: 'blue',
                icon: 'icon-list',
                iconCssClass: 'blue'
            },
            customControls:disableBackButton ? [] : ['<a data-action="collapse" onclick=reloadTable("' + gridConfig.table + '");><i class="icon-arrow-left"></i> Back</a>']
        },
        columnHeader: {
            columns: cdbColumns[gridConfig.columnName]
        },
        body: {
            options: {
                forceFitColumns: true,
                actionCell: function(dc){
                	if(editEnabled){
                        return getActionCog(gridConfig.columnName);
                    }else {
                        return [];
                    }
                }
            },
            dataSource : {
            	remote: {
                    ajaxConfig: {
                        url: gridConfig.url
                    },
                    dataParser: function(response){
                    	editEnabled = response.editEnabled;
                    	return response[gridConfig.columnName];
                    },
                    serverSidePagination: false
                }
            },
            statusMessages: {
                empty: {
                    text: 'No records found in DB.'
                },
                errorGettingData: {
                    type: 'error',
                    iconClasses: 'icon-warning',
                    text: 'Cassandra client could not fetch data from server. Please check cassandra config parameters.'
                }
            }
        },
        footer: {
            pager: {
                options: {
                    pageSize:100,
                    pageSizeSelect: [100,200,500]
                }
            }
        }
    });
};

function getActionCog(columnName){
    return [{
        title: 'Delete',
            iconClass: 'icon-trash',
        onClick: function(rowIndex){
            var selectedRow = $('#cdb-results').data('contrailGrid')._dataView.getItem(rowIndex);
            if(columnName === "keys"){
            	createConfirmWindow4CDB(selectedRow, "delete-key");
            }else if(columnName === "keyvalues"){
            	createConfirmWindow4CDB(selectedRow, "delete-key-value");
            }
        }
    }];
};

function deleteKey(selectedRow) {
    var url = "/api/query/cassandra/key/" + selectedRow.table + "/" + selectedRow.key;
    doAjaxCall(url, "DELETE", null, "successDeleteKey", "failureDeleteKey", false, null);
};

function deleteValue4Key(selectedRow) {
    var url = "/api/query/cassandra/value/" + selectedRow.table + "/" + selectedRow.key + "/" + selectedRow.keyvalue;
    doAjaxCall(url, "DELETE", null, "successDeleteKeyValue", "failureDeleteKeyValue", false, null);
};

function createConfirmWindow4CDB(selectedRow, type) {
    $.contrailBootstrapModal({
		id: 'delete-confirmation',
		title: 'Remove Confirmation',
		body: '<h6>Are you sure you want to remove data from Config DB?</h6>',
		footer: [{
			title: 'Cancel',
			onclick: 'close'
		},
		{
			id: 'confirm-button',
			title: 'Confirm',
			onclick: function(){
				if (type == "delete-key") {
		            deleteKey(selectedRow);
		        } else if (type == "delete-key-value") {
                    deleteValue4Key(selectedRow);
		        }
				$('#delete-confirmation').modal('hide');
				
			},
			className: 'btn-primary'
		}]
   });
};

function successDeleteKey(results) {
    showInfoWindow("You have successfully deleted the key.", "Delete Success");
    $("#cdb-results").data('contrailGrid').refreshData();
};

function failureDeleteKey(error) {
    showInfoWindow("An error occurred while deleting the key.", "Delete Error");
};

function successDeleteKeyValue(results) {
    showInfoWindow("You have successfully deleted the key-value.", "Delete Success");
    $("#cdb-results").data('contrailGrid').refreshData();
};

function failureDeleteKeyValue(error) {
    showInfoWindow("An error occurred while deleting the key-value.", "Delete Error");
};

function reloadTable(table) {
    if (table == "obj_fq_name_table") {
        loadFQNameTable();
    } else if (table == "obj_uuid_table") {
        loadUUIDTable();
    }
};
