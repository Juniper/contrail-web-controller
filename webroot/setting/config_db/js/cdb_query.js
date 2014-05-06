/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cdbTemplate = Handlebars.compile($('#cdb-template').html());
var table = "",
    gridTitle = 'Config DB';

var fqNameTableObj = new fqNameTableObj(),
    uuidTableObj = new uuidTableObj();

var cdbColumns = {
    key: [{
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
    keyValues: [{
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
    $(contentContainer).html('');
    $(contentContainer).html(cdbTemplate);
    var url = "/api/query/cassandra/keys/obj_fq_name_table";
    currTab = 'setting_configdb_fqname';
    table = "obj_fq_name_table";
    gridTitle = 'FQ Name Table Keys';
    createGrid([], 'key', true);
    doAjaxCall(url, "GET", null, "successListKeys", "failureListKeys", false, null);
};

function loadUUIDTable() {
    $(contentContainer).html('');
    $(contentContainer).html(cdbTemplate);
    var url = "/api/query/cassandra/keys/obj_uuid_table";
    currTab = 'setting_configdb_uuid';
    table = "obj_uuid_table";
    gridTitle = 'UUID Table Keys';
    createGrid([], 'keyValues', true);
    doAjaxCall(url, "GET", null, "successListKeys", "failureListKeys", false, null);
};

function successListKeys(results) {
    createGrid(results.keys, 'key', true, results["editEnabled"]);
    if(results.length == 0) {
        $('#cdb-results').data('contrailGrid').showGridMessage('empty');
    }
};

function failureListKeys(error) {
    createGrid([], 'keyValues', true);
    $('#cdb-results').data('contrailGrid').showGridMessage('errorGettingData');
};

function loadKeyValues(elementId) {
    var elements = elementId.split("~"),
         url = "/api/query/cassandra/values/" + elements[0] + "/" + elements[1];
    gridTitle = 'Key Values: ' + elements[1]
    createGrid([], 'keyValues', true);
    doAjaxCall(url, "GET", null, "successListValues", "failureListValues", false, null);
};

function createGrid(results, columnName, disableBackButton, editEnabled) {
    $("#cdb-results").contrailGrid({
        header: {
            title:{
                text: gridTitle,
                cssClass: 'blue',
                icon: 'icon-list',
                iconCssClass: 'blue'
            },
            customControls:disableBackButton ? [] : ['<a data-action="collapse" onclick="reloadTable();"><i class="icon-arrow-left"></i> Back</a>']
        },
        columnHeader: {
            columns: cdbColumns[columnName]
        },
        body: {
            options: {
                forceFitColumns: true,
                actionCell: function(dc){
                    if(editEnabled){
                        return getActionCog(columnName);
                    }else {
                        return [];
                    }
                }
            },
            dataSource : {
                data : results
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

function successListValues(results) {
    createGrid(results["keyvalues"], 'keyValues', false, results["editEnabled"]);
};

function failureListValues(error) {
    createGrid([], 'keyValues', false);
    $('#cdb-results').data('contrailGrid').showGridMessage('errorGettingData');
};

function getActionCog(columnName){
    return [{
        title: 'Delete',
            iconClass: 'icon-trash',
        onClick: function(rowIndex){
            var selectedRow = $('#cdb-results').data('contrailGrid')._dataView.getItem(rowIndex);
            if(columnName === "key"){
                onDeleteKey(selectedRow);
            }else if(columnName === "keyValues"){
                onDeleteValue4Key(selectedRow);
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

function onDeleteKey(e) {
    createConfirmWindow4CDB(e, "delete-key");
}

function onDeleteValue4Key(e) {
    createConfirmWindow4CDB(e, "delete-key-value");
}

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
			},
			className: 'btn-primary'
		}]
   });
};

function successDeleteKey(results) {
    showInfoWindow("You have successfully deleted the key.", "Delete Success");
    reloadTable();
};

function failureDeleteKey(error) {
    showInfoWindow("An error occurred while deleting the key.", "Delete Error");
};

function successDeleteKeyValue(results) {
    showInfoWindow("You have successfully deleted the key-value.", "Delete Success");
    reloadTable();
};

function failureDeleteKeyValue(error) {
    showInfoWindow("An error occurred while deleting the key-value.", "Delete Error");
};

function reloadTable() {
    if (table == "obj_fq_name_table") {
        loadFQNameTable();
    } else if (table == "obj_uuid_table") {
        loadUUIDTable();
    }
};
