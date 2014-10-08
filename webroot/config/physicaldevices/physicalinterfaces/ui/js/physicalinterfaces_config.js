/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalInterfacesConfigObj = new physicalInterfacesConfig();
function physicalInterfacesConfig() {
    //Variable Definations
    var gridPhysicalInterfaces;
    var currentUUID;
    //Method Definations 
    this.load = load;
    this.destroy = destroy;	
    
    function load() {
        var configTemplate = Handlebars.compile($("#physicalinterfaces-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }
  
    function init() {
        initComponents();
        initActions();
        fetchPhysicalRouters();
    }
    
    function initComponents() {
        //initializing the virtual routers Grid
        $("#gridPhysicalInterfaces").contrailGrid({
            header : {
                title: {
                    text : 'Physical Interfaces',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnDeletePhysicalInterface" class="disabled-link" title="Delete Physical Interface(s)"><i class="icon-trash"></i></a>',
                    '<a id="btnCreatePhysicalInterface" title="Create Physical Interface"><i class="icon-plus"></i></a>',
                    'Physical Routers: <div id="ddPhysicalRouters"/>',]
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'                    
                },
                {
                    id : 'type',
                    field : 'type',
                    name : 'Type'                    
                },
                {
                    id : 'parent',
                    field : 'parent',
                    name : 'Parent'                    
                },
                {
                    id : 'vlan',
                    field : 'vlan',
                    name : 'VLAN'                    
                },
                {
                    id : 'server',
                    field : 'server',
                    name : 'Server'                    
                }]                
                                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeletePhysicalInterface').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeletePhysicalInterface').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: [
                        {
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                               physicalInterfaceEditWindow(rowIndex);
                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showPhysicalInterfaceDelWindow(rowIndex);
                            }
                        }
                    ],
                    detail : {
                        template : $("#gridPhysicalInterfacesDetailTemplate").html()
                    }    
			    },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Physical Interfaces..'
                    },
                    empty: {
                        text: 'No Physical Interfaces.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Physical Interfaces.'
                    }
                }
            }
        });      
        gridPhysicalInterfaces = $("#gridPhysicalInterfaces").data('contrailGrid');
        
        $('#ddPhysicalRouters').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onPhysicalRouterSelChange
        });
        
        $('#ddType').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        });
        
        var ddType = $('#ddType').data('contrailDropdown');
        ddType.setData([{text : 'Physical Interface', value : 'physical'},{text : 'Logical Interface', value : 'logical'}]);
        ddType.value('physical')
        
        $('#ddParent').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        });        

        $('#ddVN').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        });            
        
        //initializing add record window	  	
        $('#addPhysicalInterfaceWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Add Physical Interface');
        
        //initializing delete record window
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');	        
    }
    
    function onPhysicalRouterSelChange(e) {
         currentUUID = e.added.value;
         fetchData();
    }
    
    function initActions() {
        $('#btnCreatePhysicalInterface').click(function() {
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddPhysicalInterfaceOk').click(function() {
            //if(validate()) {
                $('#addPhysicalInterfaceWindow').modal('hide');
                createUpdatePhysicalInterface(); 
            //}
        });
        $('#btnDeletePhysicalInterface').click(function(){
             $('#confirmMainDelete').modal('show');
        });
        $('#btnCnfDelMainPopupOK').click(function(args){
            var selected_rows = gridPhysicalInterfaces.getCheckedRows();
            $('#confirmMainDelete').modal("hide");
            deletePhysicalInterface(selected_rows);
        });        
    }
    
    window.showPhysicalInterfaceDelWindow = function(index) {
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
                        var selected_row = gridPhysicalInterfaces._dataView.getItem(index);
               	        deletePhysicalInterface([selected_row]);
               	        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    } 

    function deletePhysicalInterface(selected_rows) {
        $('#btnDeletePhysicalInterface').addClass('disabled-link');	
        if(selected_rows && selected_rows.length > 0){
            var deleteAjaxs = [];
            for(var i = 0;i < selected_rows.length;i++){
                var sel_row_data = selected_rows[i];
                deleteAjaxs[i] = $.ajax({
                    url:'/api/tenants/config/physical-interface/' + currentUUID + '/' + sel_row_data['uuid'],
                    type:'DELETE'
                });
            }
            $.when.apply($,deleteAjaxs).then(
                function(response){
                    //all success
                    fetchData();
                },
                function(){
                    //if at least one delete operation fails
                    var r = arguments;
                    showInfoWindow(r[0].responseText,r[2]);		
                    fetchData();
                }
            );
        }
    }    
    
    window.physicalInterfaceEditWindow = function(index) {
        gblSelRow = gridPhysicalInterfaces._dataView.getItem(index);
        populateCreateEditWindow('edit');
    }
    
    function populateCreateEditWindow(m) {
        mode = m;
        clearCreateEditWindow();
        if(mode === 'edit') {
            $('#txtPhysicalInterfaceName').val(gblSelRow.name);
            $('#txtPhysicalInterfaceName').attr('disabled','disabled');
        }
        $('#addPhysicalInterfaceWindow').modal('show');       
    }
        
    function createUpdatePhysicalInterface() {
        var methodType = 'POST';
        var url = '/api/tenants/config/physical-interfaces/' + currentUUID;
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/physical-interface/' + currentUUID + '/' + gblSelRow.uuid
        }
        var type = $("#ddType").data('contrailDropdown').value();
        var name = $("#txtPhysicalInterfaceName").val();
        var parent = $("#ddParent").data('contrailDropdown').value();
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown')
        var postObject = {};
        
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');    

        postObject["physical-interface"] = {};
        postObject["physical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), name];
        postObject["physical-interface"]["parent_type"] = "physical-router";
        postObject["physical-interface"]["name"] = name;
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalInterfaces', 'failureHandlerForPhysicalInterfaces', null, null);
    }
    
    function clearCreateEditWindow() {
        $('#ddType').data('contrailDropdown').value('physical');
        $('#txtPhysicalInterfaceName').removeAttr('disabled');
        $('#txtPhysicalInterfaceName').val('');     
        var ddPhysicalRouters = $('#ddPhysicalRouters').data('contrailDropdown');        
        $('#ddParent').data('contrailDropdown').value(ddPhysicalRouters.text());
    }
    
    function fetchPhysicalRouters() {
        //reading uuid from query string
        var queryParams = window.location.href.split("&");
        if(queryParams != undefined && queryParams.length > 1 && queryParams[1].indexOf('=') != -1) {
            currentUUID = queryParams[1].split('=')[1];  
        }     
        doAjaxCall('/api/tenants/config/physical-router-details','GET', null, 'successHandlerForPhysicalRouters', 'failureHandlerForPhysicalRouters', null, null);
    }
    window.successHandlerForPhysicalRouters =  function(result) {
        var pRoutersDS = [];    
        if(result && result['physical-routers'].length > 0) {
            var physicalRouters = result['physical-routers'];
            for(var i = 0; i < physicalRouters.length;i++) {
                var physicalRouter = physicalRouters[i];
                pRoutersDS.push({text : physicalRouter.fq_name[1], value : physicalRouter.uuid});
            } 
        
        } else {
            pRoutersDS.push({text : 'No Physical Router found', value: 'Message'});
        }
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');            
        pRouterDD.setData(pRoutersDS); 
        if(currentUUID) {
            pRouterDD.value(currentUUID);
        } else {
            pRouterDD.value(pRoutersDS[0].value)
            currentUUID = pRouterDD.value();
        }
        fetchData();         
    }
    window.failureHandlerForPhysicalRouters = function(error) {
        gridPhysicalInterfaces.showGridMessage('errorGettingData');
    }
        
    function fetchData() {
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/physical-interfaces/' + currentUUID,'GET', null, 'successHandlerForPhysicalInterfaces', 'failureHandlerForPhysicalInterfaces', null, null);
    }
    
    window.successHandlerForPhysicalInterfaces =  function(result) {
        if(result && result.length > 0) {
            var gridDS = [];
            var pInterfaces = result;
            for(var i = 0; i < pInterfaces.length;i++) {
                var pInterface = pInterfaces[i]['physical-interface'];
                var lInterfaces = pInterfaces[i]['physical-interface'] ? pInterfaces[i]['physical-interface']['logical_interfaces'] : null;
                var lInterfaceNames = '';
                if(lInterfaces != null && lInterfaces.length > 0) {
                    for(var j = 0; j < lInterfaces.length; j++) {
                        var lInterfaceName = lInterfaces[j].to[3];
                        if(lInterfaceNames === ''){
                            lInterfaceNames = lInterfaceName;
                        } else {
                            lInterfaceNames+= ',' + lInterfaceName;
                        }
                    } 
                }
                gridDS.push({
                    uuid : pInterface.uuid,
                    name : pInterface.name,
                    type : '-',
                    parent : pInterface.parent_type,
                    vlan : '-',
                    server : '-',
                    lInterfaces :lInterfaceNames                       
                });
            }
            var ddParentDS = [];
            var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
            ddParentDS.push({text : pRouterDD.text(), value : pRouterDD.text()});
            for(var i = 0; i < gridDS.length; i++) {
                ddParentDS.push({text : gridDS[i].name, value : gridDS[i].name});
            }
            
            //set parent drop down data here
            var ddParent = $('#ddParent').data('contrailDropdown');
            ddParent.setData(ddParentDS);
            ddParent.value(ddParentDS[0].value);
        
        } else {
            gridPhysicalInterfaces.showGridMessage("empty");
        }
        gridPhysicalInterfaces._dataView.setData(gridDS);
    }
    
    window.failureHandlerForPhysicalInterfaces =  function(error) {
         gridPhysicalInterfaces.showGridMessage("errorGettingData");
    }
    
    function validate() {
        var name = $('#txtPhysicalInterfaceName').val().trim();
        if(name  === ""){	
            showInfoWindow("Enter a Physical Interface Name","Input required");
            return false;
        }
        var ipAddress = $('#txtIPAddress').val().trim();
        if(!validateIPAddress(ipAddress)){
            showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format","Input required");
            return false;
        }
        return true;         
    }
    
    function destroy() {
        var configTemplate = $("#physicalinterfaces-config-template");
        if(isSet(configTemplate)) {
        	configTemplate.remove();
        	configTemplate = $();
        }   
        var configDetailTemplate = $("#gridPhysicalInterfacesDetailTemplate");
        if(isSet(configDetailTemplate)) {
        	configDetailTemplate.remove();
        	configDetailTemplate = $();
        }        
    }
    
 }