/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
virtualRoutersConfigObj = new virtualRoutersConfig();
function virtualRoutersConfig() {
    //Variable Definations
    var gridVirtualRouters;
    
    //Method Definations 
    this.load = load;
    this.destroy = destroy;	
    
    function load() {
        var configTemplate = Handlebars.compile($("#virtualrouters-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }
  
    function init() {
        initComponents();
        initActions();
        fetchData();
    }
    
    function initComponents() {
        //initializing the virtual routers Grid
        $("#gridVirtualRouters").contrailGrid({
            header : {
                title: {
                    text : 'Virtual Routers',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnDeleteVirtualRouter" class="disabled-link" title="Delete Virtual Router(s)"><i class="icon-trash"></i></a>',
                    '<a id="btnCreateVirtualRouter" title="Create Virtual Router"><i class="icon-plus"></i></a>']
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name'                    
                },
                {
                    id : 'ip_address',
                    field : 'ip_address',
                    name : 'IP Address'                    
                },
                {
                    id : 'type',
                    field : 'type',
                    name : 'Type',
                    formatter: function(r, c, v, cd, dc) {
                        return formatVirtualRouterType(dc.type);
                     }                    
                }]                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteVirtualRouter').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteVirtualRouter').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: [
                        {
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                virtualRouterEditWindow(rowIndex);
                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showVirtualRouterDelWindow(rowIndex);
                            }
                        }
                    ],
                    detail : {
                        template : $("#gridVirtualRoutersDetailTemplate").html()
                    }    
			    },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Virtual Routers..'
                    },
                    empty: {
                        text: 'No Virtual Routers.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Virtual Routers.'
                    }
                }
            }
        });      
        gridVirtualRouters = $("#gridVirtualRouters").data('contrailGrid');
        
        //initializing add record window	  	
        $('#addVirtualRouterWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addVirtualRouterWindow').find(".modal-header-title").text('Add Virtual Router');

        //initializing virtual router type multi select
        $('#msType').contrailMultiselect({
            dataTextField:'text',
            dataValueField:'value',
        }); 

        var msType =  $('#msType').data('contrailMultiselect');
        var msTypeDS = [{ text : 'Embedded', value : 'embedded'},
            { text : 'TOR Agent', value : 'tor-agent'},
            { text : 'TOR Service Node', value : 'tor-service-node'},
        ];
        msType.setData(msTypeDS);
               
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');	        
    }
    
    function initActions() {
        $('#btnCreateVirtualRouter').click(function() {
            $('#addVirtualRouterWindow').find(".modal-header-title").text('Add Virtual Router');
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddVirtualRouterOk').click(function() {
            if(validate()) {
                $('#addVirtualRouterWindow').modal('hide');
                createUpdateVirtualRouter(); 
            }
        });
        $('#btnDeleteVirtualRouter').click(function(){
             $('#confirmMainDelete').modal('show');
        });
        $('#btnCnfDelMainPopupOK').click(function(args){
            var selected_rows = gridVirtualRouters.getCheckedRows();
            $('#confirmMainDelete').modal("hide");
            deleteVirtualRouter(selected_rows);
        });        
    }
    
    window.showVirtualRouterDelWindow = function(index) {
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
                        var selected_row = gridVirtualRouters._dataView.getItem(index);
               	        deleteVirtualRouter([selected_row]);
               	        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    } 

    function deleteVirtualRouter(selected_rows) {
        $('#btnDeleteVirtualRouter').addClass('disabled-link');	
        if(selected_rows && selected_rows.length > 0){
            var deleteAjaxs = [];
            for(var i = 0;i < selected_rows.length;i++){
                var sel_row_data = selected_rows[i];
                deleteAjaxs[i] = $.ajax({
                    url:'/api/tenants/config/virtual-router/' + sel_row_data['uuid'],
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
    
    window.virtualRouterEditWindow = function(index) {
        $('#addVirtualRouterWindow').find(".modal-header-title").text('Edit Virtual Router');
        gblSelRow = gridVirtualRouters._dataView.getItem(index);
        populateCreateEditWindow('edit');
    }
    
    function populateCreateEditWindow(m) {
        mode = m;
        clearCreateEditWindow();
        if(mode === 'edit') {
            $('#txtVirtualRouterName').val(gblSelRow.name);
            $('#txtVirtualRouterName').attr('disabled','disabled');
            $('#txtIPAddress').val(gblSelRow.ip_address);
            $('#msType').data('contrailMultiselect').value(gblSelRow.actualType);              
        }
        $('#addVirtualRouterWindow').modal('show');       
    }
        
    function createUpdateVirtualRouter() {
        var methodType = 'POST';
        var url = '/api/tenants/config/virtual-routers';
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/virtual-router/' + gblSelRow.uuid
        }
        var name = $("#txtVirtualRouterName").val();
        var ipAddress = $("#txtIPAddress").val();
        var type = $("#msType").data('contrailMultiselect').value();
        var postObject = {};
        
        gridVirtualRouters._dataView.setData([]);
        gridVirtualRouters.showGridMessage('loading');    

        postObject["virtual-router"] = {};
        postObject["virtual-router"]["fq_name"] = ["default-global-system-config", name];
        postObject["virtual-router"]["parent_type"] = "global-system-config";
        postObject["virtual-router"]["name"] = name;
        postObject["virtual-router"]["virtual_router_ip_address"] = ipAddress;
        postObject["virtual-router"]["virtual_router_type"] = type;
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForVirtualRouters', 'failureHandlerForVirtualRouters', null, null);
    }
    
    function clearCreateEditWindow() {
        $('#txtVirtualRouterName').removeAttr('disabled');
        $("#txtVirtualRouterName").val('');
        $("#txtIPAddress").val('');
        var msType = $("#msType").data('contrailMultiselect');  
        msType.value('');        
    }
        
    function fetchData() {
        gridVirtualRouters._dataView.setData([]);
        gridVirtualRouters.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/virtual-routers','GET', null, 'successHandlerForVirtualRouters', 'failureHandlerForVirtualRouters', null, null);     
    }
    
    window.successHandlerForVirtualRouters =  function(result) {
        if(result.length > 0) {
            var gridDS = [];
            for(var i = 0; i < result.length;i++) {
                var rowData = result[i]['virtual-router'];
                var pRouters = [];
                var pRouterBackRefs = rowData['physical_router_back_refs'];
                if(pRouterBackRefs != null && pRouterBackRefs.length > 0) {
                    var pRouterBackRefsLen = pRouterBackRefs.length;                
                    for(var j = 0; j < pRouterBackRefsLen; j++) {
                        pRouters.push(pRouterBackRefs[j].to[1]);
                    }
                }
                gridDS.push({
                    uuid : rowData.uuid,
                    name : rowData.name,
                    ip_address : rowData.virtual_router_ip_address,
                    actualType : rowData.virtual_router_type != null ? rowData.virtual_router_type : '',
                    type : rowData.virtual_router_type != null ? rowData.virtual_router_type : ['embedded'],
                    physical_routers : pRouters.length > 0 ? pRouters : '-'
                });
            }
        
        } else {
            gridVirtualRouters.showGridMessage("empty");
        }
        gridVirtualRouters._dataView.setData(gridDS);
    }
    
    window.failureHandlerForVirtualRouters =  function(error) {
         gridVirtualRouters.showGridMessage("errorGettingData");
    }
    
    function validate() {
        var name = $('#txtVirtualRouterName').val().trim();
        if(name  === ""){	
            showInfoWindow("Enter a Virtual Router Name","Input required");
            return false;
        }
        var ipAddress = $('#txtIPAddress').val().trim();
        if(!validateIPAddress(ipAddress)){
            showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format","Input required");
            return false;
        }
        
        var typeValues = $('#msType').data('contrailMultiselect').value();
        if(typeValues != null && typeValues != '' && typeValues.length > 1) {
            showInfoWindow("Select a single Virtual Router Type","Input required");
            return false;        
        }
        return true;         
    }
    
    function destroy() {
        var configTemplate = $("#virtualrouters-config-template");
        if(isSet(configTemplate)) {
        	configTemplate.remove();
        	configTemplate = $();
        }   
        var configDetailTemplate = $("#gridVirtualRoutersDetailTemplate");
        if(isSet(configDetailTemplate)) {
        	configDetailTemplate.remove();
        	configDetailTemplate = $();
        }        
    }
    
 }
 