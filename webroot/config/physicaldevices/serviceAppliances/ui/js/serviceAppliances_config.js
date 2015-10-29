/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
serviceAppliancesConfigObj= new serviceAppliancesConfigObj();
function serviceAppliancesConfigObj() {
    //Variable Definations
    var gridServiceAppliances;
    var currentUUID;
    var selAllRows;
    var ajaxTimeout = 300000;
    var deleteMsg = 'Confirm to delete all Service Appliance(s)(%s)';
    var setsDataSrc = []; 
	var physicalInterfaces = [];
	var physicalRouters = [];
	var serviceApplianceSets = [];
	var physicalInterfaceListByRouter = [];
	var gridDS = [];
    //Method Definations
    this.load = load;
    this.destroy = destroy;	
    function load() {
        var configTemplate = Handlebars.compile($("#serviceAppliances-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }
  
    function init() {
	   
        initComponents();
        initActions();
		fetchPhysicalInterfaces();
		fetchServiceApplianceSets();
        fetchAppliances();
    }
    
    function initComponents() {
        //initializing the virtual routers Grid
        var deleteServiceAppliancesDropdownTemplate = contrail.getTemplate4Id('delete-serviceAppliance-action-template');
        $("#gridServiceAppliances").contrailGrid({
            header : {
                title: {
                    text : 'Service Appliances',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: [deleteServiceAppliancesDropdownTemplate(),
                    '<a id="btnCreateServiceAppliance" title="Create Service Appliance"><i class="icon-plus"></i></a>',
                    ]
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'                    
                },
				{
                    id : 'interfaces',
                    field : 'interfaces',
                    name : 'Physical Interface',
					formatter: function(r, c, v, cd, physical_refs) {
						var interfaces = "-";
						if (physical_refs.refs != null && physical_refs.refs.length > 0){
							interfaces = "";
							for (var i=0; i< physical_refs.refs.length ; i++){
								var pi = physical_refs.refs[i]['to'][2];
								if (i != 0 && i < 2){
									interfaces += "<br>";
								}
								if(i<2){
									interfaces = interfaces + pi;
								}
							}
							if(physical_refs.refs.length > 2){
								interfaces += '<br><span class="moredataText">(' + 
										   (physical_refs.refs.length-2) + 
										   ' more)</span><span class="moredata" style="display:none;"></span>';
							
							}
						
						}
						return interfaces;
						
					}					
                },
				{
                    id : 'set',
                    field : 'set',
                    name : 'Service Appliance Set'                    
                }
				
				
				
				
				]                
                                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#deleteServiceAppliances').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#deleteServiceAppliances').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: function(dc){
                        var ret = [];
						ret.push({
							title: 'Edit',
							iconClass: 'icon-edit',
							onClick: function(rowIndex){
							   serviceApplianceEditWindow(rowIndex);
							}
						});
                        
                        ret.push({
                                title: 'Delete',
                                iconClass: 'icon-trash',
                                onClick: function(rowIndex){
                                    showServiceApplianceDelWindow(rowIndex);
                                }
                            });
                         return ret},
                    detail : {
                        template : $("#gridServiceAppliancesDetailTemplate").html()
                    }    
			    },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Service Appliances..'
                    },
                    empty: {
                        text: 'No Service Appliances.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Service Appliances.'
                    }
                }
            }
        });      

        gridServiceAppliances = $("#gridServiceAppliances").data('contrailGrid');
        gridServiceAppliances.showGridMessage('loading');

		ddServiceApplianceSet = $("#ddServiceApplianceSet").contrailDropdown({
        });
		ddPhysicalRouter = $("#ddPhysicalRouter").contrailDropdown({
        });
		
        //initializing add record window	  	
        $('#addServiceApplianceWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addServiceApplianceWindow').find(".modal-header-title").text('Add Service Appliance');
        
        //initializing delete record window
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');  
    }

    function initActions() {
        $('#btnCreateServiceAppliance').click(function() {
            $('#addServiceApplianceWindow').find(".modal-header-title").text('Add Service Appliance');
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddServiceApplianceOk').click(function() {
            if(validate()) {
			
			    var selectedPI = $("#multifamily").data('contrailMultiselect').value();
				var sa = {};
				methodType = 'POST'
				url = '/api/tenants/config/service-appliances';
				if(method === 'edit') {
					methodType = 'PUT';
					url = '/api/tenants/config/service-appliance/' + selected_row.uuid;
				}

				sa["service-appliance"] = {};
				sa["service-appliance"]["name"] = $('#txtServiceApplianceName').val().trim();
				sa["service-appliance"]["display_name"] = $('#txtServiceApplianceName').val().trim();
				sa["service-appliance"]["parent_type"] = "service-appliance-set";

				var selectedSet = $("#ddServiceApplianceSet").data('contrailDropdown').value();
				sa["service-appliance"]["fq_name"] = [];
				sa["service-appliance"]["fq_name"] = ["default-global-system-config",selectedSet, $('#txtServiceApplianceName').val().trim()];
				
				sa["service-appliance"]["physical_interface_refs"] = [];
				for(var i = 0; i < selectedPI.length; i++) {
					var pi = physicalInterfaceListByRouter[selectedPI[i]];
					sa["service-appliance"]["physical_interface_refs"][i] = {};
					sa["service-appliance"]["physical_interface_refs"][i]["to"] = [];
					sa["service-appliance"]["physical_interface_refs"][i]["to"] = pi.fq_name;
					
					// TODO
					// need to figure out why it is forcing another attr 
					sa["service-appliance"]["physical_interface_refs"][i]["attr"] = {};
					sa["service-appliance"]["physical_interface_refs"][i]["attr"]["fq_name"] = [
                        "default-global-system-config",
                        "pr_script_pnf_test_0",
                        "pi_1_pnf_test_script_0"
                    ];
				}				
				
				doAjaxCall(url, methodType, JSON.stringify(sa),
					"createSAResponse", "createSAResponse");
				$("#addServiceApplianceWindow").modal("hide");
                
            }
        });

		window.createSAResponse =  function(result) {
            fetchAppliances();
			clearCreateEditWindow();
        }
        
        $('#deleteServiceAppliances').click(function(){
             if(!$(this).hasClass('disabled-link')) {
                 $('#confirmMainDelete').find("#txtConfirm").text('Confirm Service Appliance(s) delete');
                 $('#confirmMainDelete').modal('show');
             }
        });
        $('#btnDeleteAllServiceAppliance').click(function(){
            var pRouterName = pRouter != null ? pRouter.text() : '';
            deleteMsg = deleteMsg.replace('%s', pRouterName)
            $('#confirmMainDelete').find("#txtConfirm").text(deleteMsg);
            $('#confirmMainDelete').modal('show');
        });
        $('#btnCnfDelMainPopupOK').click(function(args){
            $('#confirmMainDelete').modal("hide");
            if($('#confirmMainDelete').find("#txtConfirm").text() == deleteMsg) {
                $.allajax.abort();
                //doAjaxCall('/api/tenants/config/delete-all-interfaces?prUUID=' + currentUUID, 'DELETE', null,
                    //'successHandlerForDeleteAll', 'failureHandlerForDeleteAll', null, null, ajaxTimeout);
            } else {
                var selected_rows = gridServiceAppliances.getCheckedRows();
                deleteServiceAppliances(selected_rows);
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
                        var selected_row = gridServiceAppliances._dataView.getItem(index);
               	        deleteServiceAppliances([selected_row]);
               	        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    }
    
    function deleteServiceAppliances(selected_rows) {
        $('#btnDeleteServiceAppliance').addClass('disabled-link');
		if(selected_rows && selected_rows.length > 0) {
			deleteAppliance(selected_rows);
		}
    }

    function deleteAppliance(selAllRows) {
        //doAjaxCall('/api/tenants/config/interfaces/delete', 'POST', JSON.stringify(selAllRows), 'onDeleteApplianceSuccess', 
        //    'onDeleteInterfaceFailure', null, null, ajaxTimeout);
		var cbParams = {};
		cbParams.selected_rows = selAllRows;
		cbParams.url = "/api/tenants/config/service-appliance/"; 
		cbParams.urlField = "uuid";
		cbParams.fetchDataFunction = "onDeleteApplianceSuccess";
		cbParams.errorTitle = "Error";
		cbParams.errorShortMessage = "Error in deleting Service Appliance - ";
		cbParams.errorField = "name";
		deleteObject(cbParams);
    }

    window.onDeleteApplianceSuccess = function(res) {
        fetchAppliances();       
    }

    window.serviceApplianceEditWindow = function(index) {
        populateCreateEditWindow('edit', index);
    }
    
    function populateCreateEditWindow(m, index) {
		method = m;
		if(m == 'edit'){
			selected_row = gridServiceAppliances._dataView.getItem(index);
			
			$("#txtServiceApplianceName").val(selected_row.name);
			$('#multifamily').data('contrailMultiselect').value(selected_row.set);
			var setName = selected_row.set;	
			var selectedInterfaces = selected_row.interfaces.split(",");
			var interfaceValues = [];
			for(var i=0 ; i< selectedInterfaces.length; i++){
				for (var y=0; y< physicalInterfaces.length ; y++){
					if (selectedInterfaces[i] == physicalInterfaces[y].text){
						interfaceValues.push(physicalInterfaces[y].value);
					}
				
				}
			}
			$("#ddServiceApplianceSet").data("contrailDropdown").value(setName);
			$('#multifamily').data('contrailMultiselect').value(interfaceValues);
			$("#txtServiceApplianceName").attr("disabled","disabled");			
			$("#ddServiceApplianceSet").attr("disabled","disabled");
		}else{
			$("#txtServiceApplianceName").removeAttr('disabled');
			$("#ddServiceApplianceSet").removeAttr('disabled');
			clearCreateEditWindow();
		}
        $('#addServiceApplianceWindow').modal('show');       
    }
	function clearCreateEditWindow() {
        $('#txtServiceApplianceName').val(''); 
        $('#multifamily').data('contrailMultiselect').value([]);
	    $("#ddServiceApplianceSet").data('contrailDropdown').value([]);		
		$("#ddPhysicalRouter").data('contrailDropdown').value([]);	
		physicalInterfaceListByRouter = [];
    }
    
    function fetchAppliances() {
        gridServiceAppliances._dataView.setData([]);
        gridServiceAppliances.showGridMessage('loading');
        fetchServiceAppliances();
    }
	
	function fetchPhysicalInterfaces() {
		doAjaxCall(
        "/api/admin/config/get-data?type=physical-interface", "GET",
        null, "successHandlerForPhysicalInterfacesNew", "failureHandlerForPhysicalInterfaces",  null, null, ajaxTimeout);		
    }

	window.successHandlerForPhysicalInterfacesNew = function(result, cbParams) {
        if(result!= null && result.data != null && result.data.length > 0) {
				for(var i = 0; i < result.data.length; i++) {
					var pi = result.data[i]['physical-interface'];
					var name = pi.display_name != null ? pi.display_name : pi.name;
					var pr = pi.fq_name[1]
					physicalRouters
					
					for(var y=0; y < physicalRouters.length; y++){
						if(physicalRouters[y] == pr){
							break;
						}
						if( y == physicalRouters.length-1){
							physicalRouters.push(pr);
						}
					}
					if(physicalRouters.length == 0){
						physicalRouters.push(pr);
					}

					physicalInterfaces.push({
						text : name,
						fq_name : pi.fq_name,
						value: i,
						router: pr
					});
				}
				$('#multifamily').contrailMultiselect({
					dataTextField:"text",
					dataValueField:"value"        
				});
				ddPhysicalRouter = $("#ddPhysicalRouter").contrailDropdown({
					data: physicalRouters,
					change:setPhysicalInterfacesByPhysicalRouter
					
					});
				
		}
	}
	
	function setPhysicalInterfacesByPhysicalRouter(){
		var router = $("#ddPhysicalRouter").data('contrailDropdown').value();
		var c = 0;
		physicalInterfaceListByRouter = [];
		for(var i = 0; i < physicalInterfaces.length; i++) {
			if(physicalInterfaces[i].router == router){
				physicalInterfaces[i].value = c;
				c++;
				physicalInterfaceListByRouter.push(physicalInterfaces[i]);
			}
		}
		
		$('#multifamily').contrailMultiselect({
			dataTextField:"text",
			dataValueField:"value"        
		});
		var msFamily = $('#multifamily').data('contrailMultiselect');
		msFamily.setData(physicalInterfaceListByRouter);
	
	}
	window.failureHandlerForPhysicalInterfaces =  function(error) {
		gridServiceAppliances.showGridMessage("errorGettingData");
    }	

    function fetchServiceAppliances() {
        setsDataSrc = [];

		doAjaxCall(
        "/api/admin/config/get-data?type=service-appliance", "GET",
        null, "successHandlerForServiceAppliancesNew", "failureHandlerForServiceAppliances",  null, null, ajaxTimeout);
		
    }
    
    window.successHandlerForServiceAppliancesNew = function(result, cbParams) {
        prepareServiceApplianceData(result);
		if(result== null || result.data == null || result.data.length == 0) {
            var gridData = gridServiceAppliances._dataView.getItems();
            if(gridData == null || (gridData != null && gridData.length == 0)) {
                gridServiceAppliances.showGridMessage('empty');
            }
        }
    }
     
    function prepareServiceApplianceData(result) {
        gridDS = [];
        if(result!= null && result.data != null && result.data.length > 0) {
				for(var i = 0; i < result.data.length; i++) {
					var serviceAppliance = result.data[i]['service-appliance'];
					var piName = serviceAppliance.display_name != null ? serviceAppliance.display_name : serviceAppliance.name;
					var lInfs = serviceAppliance["logical_interfaces"];

					setServiceApplianceDataItem(gridDS, serviceAppliance, piName);
				}
        }
		
		if(gridDS.length > 0) {
			if(setsDataSrc.length > 0) {
				gridDS = gridDS.concat(setsDataSrc);
			}
			gridServiceAppliances._dataView.addData(gridDS);
		} 
    }

    function setServiceApplianceDataItem(ds, serviceAppliance, piName) {
	    var physical_refs = serviceAppliance['physical_interface_refs'];
		var interfaces = "-";
		if (physical_refs != null && physical_refs.length > 0){
			interfaces = "";
		    for (var i=0; i< physical_refs.length ; i++){
				var pi = physical_refs[i]['to'][2];
				if (i != 0){
				    interfaces += ",";
				}
				interfaces = interfaces + pi;
			}
		
		}
	
        ds.push({
            uuid : serviceAppliance.uuid,
            name : piName,
            set : serviceAppliance.fq_name[serviceAppliance.fq_name.length - 2], 
			refs : serviceAppliance['physical_interface_refs'],
			interfaces : interfaces,
        });
    }
 
    window.failureHandlerForServiceAppliances =  function(error) {
         gridServiceAppliances.showGridMessage("errorGettingData");
    }
    
    function validate() {
        var name = $('#txtServiceApplianceName').val().trim();
        if(name  === ""){	
            showInfoWindow("Enter Service Appliance Name","Input required");
            return false;
        }
		var selectedPI = $("#multifamily").data('contrailMultiselect').value();
        if (selectedPI.length == 0){
			showInfoWindow("Select Physical Interface","Input required");
            return false;
		}
		
		var selectedSet = $("#ddServiceApplianceSet").data('contrailDropdown').value();
        if (selectedSet.length == 0){
			showInfoWindow("Select Service Appliance Set","Input required");
            return false;
		}
        return true;
    }
	
	function fetchServiceApplianceSets() {
		doAjaxCall(
        "/api/admin/config/get-data?type=service-appliance-set", "GET",
        null, "successHandlerForServiceApplianceSetsNew", "failureHandlerForServiceApplianceSets",  null, null, ajaxTimeout);		
    }
	
	window.successHandlerForServiceApplianceSetsNew = function(result, cbParams) {
        prepareServiceApplianceSetData(result);
        
    }
	window.failureHandlerForServiceApplianceSets =  function(error) {
		gridServiceAppliances.showGridMessage("errorGettingData");
    }
	
	function prepareServiceApplianceSetData(result) { 
        if(result!= null && result.data != null && result.data.length > 0) {
				for(var i = 0; i < result.data.length; i++) {
					var serviceApplianceSet = result.data[i]['service-appliance-set'];
					var name = serviceApplianceSet.display_name != null ? serviceApplianceSet.display_name : serviceApplianceSet.name;
					

					serviceApplianceSets.push({
						text : name,
						fq_name : serviceApplianceSet.fq_name,
						uuid : serviceApplianceSet.uuid,
						value: serviceApplianceSet.fq_name[serviceApplianceSet.fq_name.length-1]
					
					
					});
				}
        }
		
		ddServiceApplianceSet = $("#ddServiceApplianceSet").contrailDropdown({
    	data: serviceApplianceSets,
        dataTextField:"text",
        dataValueField:"value"
		});
	
    } 
    
    function destroy() {
        var configTemplate = $("#serviceAppliances-config-template");
        if(isSet(configTemplate)) {
        	configTemplate.remove();
        	configTemplate = $();
        }   
        var configDetailTemplate = $("#gridServiceAppliancesDetailTemplate");
        if(isSet(configDetailTemplate)) {
        	configDetailTemplate.remove();
        	configDetailTemplate = $();
        }
        var configDetailTemplate = $("#delete-serviceAppliance-action-template");
        if(isSet(configDetailTemplate)) {
            configDetailTemplate.remove();
            configDetailTemplate = $();
        }
     
    }
 }