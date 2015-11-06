/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
 
serviceApplianceSetsConfigObj= new serviceApplianceSetsConfigObj();
function serviceApplianceSetsConfigObj() {
    //Variable Definations
    var gridServiceApplianceSets;
    var currentUUID;
    var selAllRows;
    var ajaxTimeout = 300000;
    var deleteMsg = 'Confirm to delete all Service Appliance Set(s)(%s)';
    var setsDataSrc = []; 
    //Method Definations
    this.load = load;
    this.destroy = destroy; 
    function load() {
        var configTemplate = Handlebars.compile($("#serviceApplianceSets-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }
  
    function init() {
        initComponents();
        initActions();
        fetchAppliances();
    }
    
    function initComponents() {
        //initializing the virtual routers Grid
        var deleteServiceApplianceSetsDropdownTemplate = contrail.getTemplate4Id('delete-serviceApplianceSet-action-template');
        $("#gridServiceApplianceSets").contrailGrid({
            header : {
                title: {
                    text : 'Service Appliance Sets',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: [deleteServiceApplianceSetsDropdownTemplate(),
                    '<a id="btnCreateServiceApplianceSet" title="Create Service Appliance Set"><i class="icon-plus"></i></a>',
                    ]
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'                    
                }]                
                                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#deleteServiceApplianceSets').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#deleteServiceApplianceSets').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: function(dc){
                        var ret = [];
                        
                        ret.push({
                                title: 'Delete',
                                iconClass: 'icon-trash',
                                onClick: function(rowIndex){
                                    showServiceApplianceDelWindow(rowIndex);
                                }
                            });
                         return ret},
                    detail : {
                        template : $("#gridServiceApplianceSetsDetailTemplate").html()
                    }    
                },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Service Appliance Sets..'
                    },
                    empty: {
                        text: 'No Service Appliance Sets.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Service Appliance Sets.'
                    }
                }
            }
        });      

        gridServiceApplianceSets = $("#gridServiceApplianceSets").data('contrailGrid');
        gridServiceApplianceSets.showGridMessage('loading');

        //initializing add record window        
        $('#addServiceApplianceSetWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addServiceApplianceSetWindow').find(".modal-header-title").text('Add Service Appliance Set');
        
        //initializing delete record window
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');   
    }
    
    function initActions() {
        $('#btnCreateServiceApplianceSet').click(function() {
            $('#addServiceApplianceSetWindow').find(".modal-header-title").text('Add Service Appliance Set');
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddServiceApplianceSetOk').click(function() {
            if(validate()) {
                var serviceApplianceSet = {};

                serviceApplianceSet["service-appliance-set"] = {};
                serviceApplianceSet["service-appliance-set"]["name"] = $('#txtServiceApplianceSetName').val().trim();
                serviceApplianceSet["service-appliance-set"]["display_name"] = $('#txtServiceApplianceSetName').val().trim();
                serviceApplianceSet["service-appliance-set"]["parent_type"] = "global-system-config";
                serviceApplianceSet["service-appliance-set"]["fq_name"] = [];
                serviceApplianceSet["service-appliance-set"]["fq_name"] = ["default-global-system-config", $('#txtServiceApplianceSetName').val().trim()];

                doAjaxCall("/api/tenants/config/service-appliance-sets", "POST", JSON.stringify(serviceApplianceSet),
                    "createSetResponse", "createSetResponse");
                $("#addServiceApplianceSetWindow").modal("hide");
                
                
            }
        });

        window.createSetResponse = function(result) {
            clearPopup();
            fetchAppliances();
        }
        function clearPopup() {
            $(txtServiceApplianceSetName).val("");
            $("#addServiceApplianceSetWindow").modal("hide");
        }

        $('#deleteServiceApplianceSets').click(function(){
             if(!$(this).hasClass('disabled-link')) {
                 $('#confirmMainDelete').find("#txtConfirm").text('Confirm Service Appliance Set(s) delete');
                 $('#confirmMainDelete').modal('show');
             }
        });

        $('#btnCnfDelMainPopupOK').click(function(args){
            $('#confirmMainDelete').modal("hide");
            if($('#confirmMainDelete').find("#txtConfirm").text() == deleteMsg) {
                $.allajax.abort();
                
            } else {
                var selected_rows = gridServiceApplianceSets.getCheckedRows();
                deleteServiceApplianceSet(selected_rows);
            }
        });
        window.successHandlerForDeleteAll =  function(result) {
            fetchAppliances();
        }
        window.failureHandlerForDeleteAll =  function(error) {
            fetchAppliances();
        }

    }

    window.showServiceApplianceDelWindow = function(index) {
        $.contrailBootstrapModal (
            {
                id: 'confirmRemove',
                title: 'Remove',
                body: '<h6>Confirm Removing record</h6>',
                footer: [
                {
                    title: 'Cancel',
                    onclick: 'close',
                },
                {
                    id: 'btnRemovePopupOK',
                    title: 'Confirm',
                    onclick: function(){
                        var selected_row = gridServiceApplianceSets._dataView.getItem(index);
                        deleteServiceApplianceSet([selected_row]);
                        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    }
    
    function deleteServiceApplianceSet(selected_rows) {
        $('#btnDeleteServiceApplianceSet').addClass('disabled-link');
        selAllRows = selected_rows;
        if(selected_rows && selected_rows.length > 0) {
            deleteAppliance(selAllRows);
        }
    }

    function deleteAppliance(selAllRows) {
            
        var cbParams = {};
        cbParams.selected_rows = selAllRows;
        cbParams.url = "/api/tenants/config/service-appliance-set/"; 
        cbParams.urlField = "uuid";
        cbParams.fetchDataFunction = "onDeleteAppliance";
        cbParams.errorTitle = "Error";
        cbParams.errorShortMessage = "Error in deleting Service Appliance Set - ";
        cbParams.errorField = "name";
        deleteObject(cbParams);
    }

    window.onDeleteAppliance = function(res) {
        fetchAppliances();
    }

    function populateCreateEditWindow(m, index) {
        clearCreateEditWindow();
        $('#addServiceApplianceSetWindow').modal('show');       
    }
    function clearCreateEditWindow() {
        $('#txtServiceApplianceSetName').val('');     
    }
  
    function fetchAppliances() {
        gridServiceApplianceSets._dataView.setData([]);
        gridServiceApplianceSets.showGridMessage('loading');
        fetchServiceApplianceSets();
    }

    function fetchServiceApplianceSets() {
        doAjaxCall(
        "/api/admin/config/get-data?type=service-appliance-set", "GET",
        null, "successHandlerForServiceApplianceSetsNew", "failureHandlerForServiceApplianceSets",  null, null, ajaxTimeout);
        
    }

    window.successHandlerForServiceApplianceSetsNew = function(result, cbParams) {
        prepareServiceApplianceSetData(result);
        if(result== null || result.data == null || result.data.length == 0) {
            var gridData = gridServiceApplianceSets._dataView.getItems();
            if(gridData == null || (gridData != null && gridData.length == 0)) {
                gridServiceApplianceSets.showGridMessage('empty');
            }
        }
    }
    window.failureHandlerForServiceApplianceSets =  function(error) {
        gridServiceApplianceSets.showGridMessage("errorGettingData");
    }

    function prepareServiceApplianceSetData(result) {
        var gridDS = [];
        if(result!= null && result.data != null && result.data.length > 0) {
                for(var i = 0; i < result.data.length; i++) {
                    var serviceApplianceSet = result.data[i]['service-appliance-set'];
                    var piName = serviceApplianceSet.display_name != null ? serviceApplianceSet.display_name : serviceApplianceSet.name;

                    setServiceApplianceSetDataItem(gridDS, serviceApplianceSet, piName);
                }
            }
    

       
        if(gridDS.length > 0) {
            if(setsDataSrc.length > 0) {
                gridDS = gridDS.concat(setsDataSrc);
            }
            gridServiceApplianceSets._dataView.addData(gridDS);
        } 
    }

    function setServiceApplianceSetDataItem(ds, serviceApplianceSet, piName) {
        var serviceAppliances = serviceApplianceSet['service_appliances'];
        var sas = "-";
        if (serviceAppliances != null && serviceAppliances.length > 0){
            sas = "";
            for (var i=0; i< serviceAppliances.length ; i++){
                var sa = serviceAppliances[i]['to'][serviceAppliances[i]['to'].length - 1];
                if (i != 0){
                    sas += ",";
                }
                sas = sas + sa;
            }
        
        }
        
        var serviceTemplates = serviceApplianceSet['service_template_back_refs'];
        var sts = "-";
        if (serviceTemplates != null && serviceTemplates.length > 0){
            sts = "";
            for (var i=0; i< serviceTemplates.length ; i++){
                var st = serviceTemplates[i]['to'][serviceTemplates[i]['to'].length - 1];
                if (i != 0){
                    sts += ",";
                }
                sts = sts + st;
            }
        
        }
        
        
        ds.push({
            uuid : serviceApplianceSet.uuid,
            name : piName,
            //parent : serviceApplianceSet.fq_name[1], 
            serviceAppliances : sas,
            serviceTemplates : sts,
        });
    }
    
    function validate() {
        var name = $('#txtServiceApplianceSetName').val().trim();
        if(name  === ""){   
            showInfoWindow("Enter Service Appliance set Name","Input required");
            return false;
        }
        return true;
    }
    
    function destroy() {
        var configTemplate = $("#serviceApplianceSets-config-template");
        if(isSet(configTemplate)) {
            configTemplate.remove();
            configTemplate = $();
        }   
        var configDetailTemplate = $("#gridServiceApplianceSetsDetailTemplate");
        if(isSet(configDetailTemplate)) {
            configDetailTemplate.remove();
            configDetailTemplate = $();
        }
        var configDetailTemplate = $("#delete-serviceApplianceSet-action-template");
        if(isSet(configDetailTemplate)) {
            configDetailTemplate.remove();
            configDetailTemplate = $();
        }     
    } 
 }