/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalRoutersConfigObj = new physicalRoutersConfig();
function physicalRoutersConfig() {
    //Variable Definitions
    var gridPhysicalRouters;
    
    //Method Definitions 
    this.load = load;
    this.destroy = destroy; 
    
    function load() {
        var configTemplate = Handlebars.compile($("#physicalrouters-config-template").html());
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
        //initializing the physical routers Grid
        $("#gridPhysicalRouters").contrailGrid({
            header : {
                title: {
                    text : 'Physical Routers',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnDeletePhysicalRouter" class="disabled-link" title="Delete Physical Router(s)"><i class="icon-trash"></i></a>',
                    '<a id="btnCreatePhysicalRouter" title="Create Physical Router"><i class="icon-plus"></i></a>']
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Name' ,
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            layoutHandler.setURLHashParams({uuid : dc.uuid} ,{p : 'config_pd_interfaces' ,merge : false ,triggerHashChange : true});
                        }
                    }  
                },
                {
                    id : 'mgmt_ip_address',
                    field : 'mgmt_ip_address',
                    name : 'Management IP Address'                    
                },
                {
                    id : 'interfaces',
                    field : 'interfaces',
                    name : 'Interfaces',
                    cssClass :'cell-hyperlink-blue',
                    events : {
                        onClick : function(e, dc) {
                            layoutHandler.setURLHashParams({uuid : dc.uuid} ,{p : 'config_pd_interfaces' ,merge : false ,triggerHashChange : true});
                        }
                    }                     
                }]                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeletePhysicalRouter').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeletePhysicalRouter').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: [
                        {
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                physicalRouterEditWindow(rowIndex);
                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showPhysicalRouterDelWindow(rowIndex);
                            }
                        }
                    ],
                    detail : {
                        template : $("#gridPhysicalRoutersDetailTemplate").html()
                    }    
                },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Physical Routers..'
                    },
                    empty: {
                        text: 'No Physical Routers.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Physical Routers.'
                    }
                }
            }
        });      
        gridPhysicalRouters = $("#gridPhysicalRouters").data('contrailGrid');
        
        //initializing add record window        
        $('#addPhysicalRouterWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addPhysicalRouterWindow').find(".modal-header-title").text('Add Physical Router');
        
        //Initializing the bgp router dropdown
        $('#ddBgpRouter').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        }); 
        var ddBgp =  $('#ddBgpRouter').data('contrailDropdown');

        //initializing physical router type multi select
        $('#msVN').contrailMultiselect({
            dataTextField:'text',
            dataValueField:'value',
        }); 
        
      //initializing physical router type multi select
        $('#ddVirtualRouters').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        }); 
        //initializing delete record window
        //deleteRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});
        //deleteRecordWindowObj.find(".modal-header-title").text('Confirm');
               
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');            
    }
    
    function initActions() {
        $('#btnCreatePhysicalRouter').click(function() {
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddPhysicalRouterOk').click(function() {
            if(validate()) {
                $('#addPhysicalRouterWindow').modal('hide');
                createUpdatePhysicalRouter(); 
            }
        });
        $('#btnDeletePhysicalRouter').click(function(){
             $('#confirmMainDelete').modal('show');
        });
        $('#btnCnfDelMainPopupOK').click(function(args){
            var selected_rows = gridPhysicalRouters.getCheckedRows();
            $('#confirmMainDelete').modal("hide");
            deletePhysicalRouter(selected_rows);
        });        
    }
    
    window.showPhysicalRouterDelWindow = function(index) {
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
                        var selected_row = gridPhysicalRouters._dataView.getItem(index);
                        deletePhysicalRouter([selected_row]);
                        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    } 

    function deletePhysicalRouter(selected_rows) {
        $('#btnDeletePhysicalRouter').addClass('disabled-link'); 
        if(selected_rows && selected_rows.length > 0){
            var deleteAjaxs = [];
            for(var i = 0;i < selected_rows.length;i++){
                var sel_row_data = selected_rows[i];
                deleteAjaxs[i] = $.ajax({
                    url:'/api/tenants/config/physical-router/' + sel_row_data['uuid'],
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
    
    window.physicalRouterEditWindow = function(index) {
        gblSelRow = gridPhysicalRouters._dataView.getItem(index);
        populateCreateEditWindow('edit');
    }
    
    function populateCreateEditWindow(m) {
        mode = m;
        clearCreateEditWindow();
        
        fetchBGPRouters();
        fetchVNs();
        fetchVirtualRouters();
        if(mode === 'edit') {
            $('#addPhysicalRouterWindow').find(".modal-header-title").text('Edit Physical Router');
            $('#txtPhysicalRouterName').val(gblSelRow.name);
            if(gblSelRow.vendor != '-')
                $('#txtVendor').val(gblSelRow.vendor);
            $('#txtPhysicalRouterName').attr('disabled','disabled');
            if(gblSelRow.mgmt_ip_address != '-')
                $('#txtMgmtIPAddress').val(gblSelRow.mgmt_ip_address);
            if(gblSelRow.data_ip_address != '-')
                $('#txtDataIPAddress').val(gblSelRow.data_ip_address);
            if(gblSelRow.username != '-')
                $('#txtUsername').val(gblSelRow.username);
            if(gblSelRow.password != '-')
                $('#txtPassword').val(gblSelRow.password);
            if(gblSelRow.bgp_routers != '-')
                $('#ddBgpRouter').data('contrailDropdown').text(gblSelRow.bgp_routers);
            $('#msVN').val((gblSelRow.virtual_networks == '-') ? '' : gblSelRow.virtual_networks);
            if(gblSelRow.virtual_router != '-')
                $('#ddVirtualRouters').data('contrailDropdown').text(gblSelRow.virtual_router);
        } else {
            $('#ddBgpRouter').data('contrailDropdown').value('None');
            $('#ddVirtualRouters').data('contrailDropdown').value('None');
        }
        $('#addPhysicalRouterWindow').modal('show');       
    }
        
    function createUpdatePhysicalRouter() {
        var methodType = 'POST';
        var url = '/api/tenants/config/physical-routers';
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/physical-router/' + gblSelRow.uuid
        }
        var name = $("#txtPhysicalRouterName").val();
        var vendor = $("#txtVendor").val();
        var mgmtIpAddress = $("#txtMgmtIPAddress").val();
        var dataIpAddress = $("#txtDataIPAddress").val();
        var username = $("#txtUsername").val();
        var password = $("#txtPassword").val();
        var bgpRouter = $("#ddBgpRouter").data('contrailDropdown').text();
        var vns = $("#msVN").data('contrailMultiselect').value();
        var vRouters = $("#ddVirtualRouters").data('contrailDropdown').text();
        var postObject = {};
        var vn = [];
        for(var i= 0;i < vns.length; i++){
            var v = vns[i];
            var parts = v.split('|');
            vn.push(parts);
        }
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');    

        postObject["physical-router"] = {};
        postObject["physical-router"]["fq_name"] = ["default-global-system-config", name];
        postObject["physical-router"]["parent_type"] = "global-system-config";
        postObject["physical-router"]["name"] = name;
        postObject["physical-router"]['physical_router_vendor_name'] = vendor;
        postObject["physical-router"]["physical_router_management_ip"] = mgmtIpAddress;
        postObject["physical-router"]["physical_router_dataplane_ip"] = dataIpAddress;
        postObject["physical-router"]['physical_router_user_credentials'] = {};
        postObject["physical-router"]['physical_router_user_credentials']["username"] = username;
        postObject["physical-router"]['physical_router_user_credentials']["password"] = password;
        if(bgpRouter != 'None'){
            var bgpRouterRefs = [{"to":["default-domain", "default-project" , "ip-fabric", "__default__", bgpRouter]}];
            postObject["physical-router"]["bgp_router_refs"] = bgpRouterRefs;
        } else {
            postObject["physical-router"]["bgp_router_refs"] = [];
        }
        if(vn.length > 0){
            var vnRefs = [];
            for(var i = 0 ;i < vn.length ; i++){
                vnRefs.push({"to":vn[i]});
            }
            postObject["physical-router"]["virtual_network_refs"] = vnRefs;
        } else {
            postObject["physical-router"]["virtual_network_refs"] = [];
        }
        if(vRouters != 'None'){
            var virtualRouterRefs = [{"to":["default-global-system-config",vRouters]}];
            postObject["physical-router"]["virtual_router_refs"] = virtualRouterRefs;
        } else {
            postObject["physical-router"]["virtual_router_refs"] = [];
        }
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalRouters', 'failureHandlerForCreateEditRouters', null, null);
    }
    window.failureHandlerForCreateEditRouters =  function(error) {
        gridPhysicalRouters.showGridMessage("errorCreateEdit");
   }
    
    function clearCreateEditWindow() {
        $('#txtPhysicalRouterName').removeAttr('disabled');
        $("#txtPhysicalRouterName").val('');
        $("#txtVendor").val('');
        $("#txtMgmtIPAddress").val('');
        $("#txtDataIPAddress").val('');
        $("#txtUsername").val('');
        $("#txtPassword").val('');
        $("#ddBgpRouter").data('contrailDropdown').value('');
        $("#msVN").data('contrailMultiselect').value(''); 
        $("#ddVirtualRouters").data('contrailDropdown').value('');
    }
        
    function fetchData() {
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/physical-routers','GET', null, 'successHandlerForPhysicalRouters', 'failureHandlerForPhysicalRouters', null, null);     
    }
    
    window.successHandlerForPhysicalRouters =  function(result) {
        if(result.length > 0) {
            var gridDS = [];
            for(var i = 0; i < result.length;i++) {
                var rowData = result[i]['physical-router'];
                var pinterfaces = ifNull(rowData['physical_interfaces'],[]);
                var linterfaces = ifNull(rowData['logical_interfaces'],[]);
                var linpinterfaces = [];
                $.each(pinterfaces,function(i,pInterface){
                    var lInterfaces = ifNull(pInterface['logical_interfaces'],[]);
                    linpinterfaces = linpinterfaces.concat(lInterfaces);
                });
                var interfaces = pinterfaces.concat(linterfaces,linpinterfaces);
                var virtualRouters = ifNull(rowData['virtual_router_refs'],[]);
                var virtualRouterString = '';
                $.each(virtualRouters, function(i,d){
                    if(i != 0)
                        virtualRouterString =  virtualRouterString + ', ' + d.to[1]
                    else 
                        virtualRouterString = d.to[1];
                });
                var bgpRouters = ifNull(rowData['bgp_router_refs'],[]);
                var bgpRoutersString = '';
                $.each(bgpRouters, function(i,d){
                    if(i != 0)
                        bgpRoutersString =  bgpRoutersString + ', ' + d.to[4]
                    else 
                        bgpRoutersString = d.to[4];
                });
                var vns = ifNull(rowData['virtual_network_refs'],[]);
                var vnsString = '';
                $.each(vns, function(i,d){
                    if(i != 0)
                        vnsString =  vnsString + ', ' + d.to[2]
                    else 
                        vnsString = d.to[2];
                });
                
                var credentials = rowData['physical_router_user_credentials'];
                var username = '-',password = '-';
                if(credentials != null){
                    username = credentials['username'];
                    password = credentials['password'];
                }
                gridDS.push({
                    uuid : rowData.uuid,
                    name : rowData.name,
                    vendor : rowData['physical_router_vendor_name'] ? rowData['physical_router_vendor_name'] : '-',
                    mgmt_ip_address : rowData['physical_router_management_ip'] ? rowData['physical_router_management_ip'] : '-',
                    data_ip_address : rowData['physical_router_dataplane_ip'] ? rowData['physical_router_dataplane_ip'] : '-',
                    username : (username == '')? '-' : username,
                    password : password,
                    interfaces : interfaces.length,
                    bgp_routers : (bgpRoutersString == '')? '-' : bgpRoutersString,
                    virtual_networks : (vnsString == '')? '-' : vnsString,        
                    virtual_router : (virtualRouterString == '')? '-' : virtualRouterString
                });
            }
        
        } else {
            gridPhysicalRouters.showGridMessage("empty");
        }
        gridPhysicalRouters._dataView.setData(gridDS);
    }
    
    window.failureHandlerForPhysicalRouters =  function(error) {
         gridPhysicalRouters.showGridMessage("errorGettingData");
    }
    
    function fetchVirtualRouters() {
        doAjaxCall('/api/tenants/config/virtual-routers-list','GET', null, 'successHandlerForVirtualRouters', 'failureHandlerForVirtualRouters', null, null);
    }
    
    window.successHandlerForVirtualRouters =  function(result) {
        var vRoutersDS = [{text : "None", value : "None"}];    
        if(result && result['virtual-routers'].length > 0) {
            var virtualRouters = result['virtual-routers'];
            for(var i = 0; i < virtualRouters.length;i++) {
                var virtualRouter = virtualRouters[i];
                vRoutersDS.push({text : virtualRouter.fq_name[1], value : virtualRouter.uuid});
            } 
        
        } else {
            vRoutersDS.push({text : 'No Virtual Router found', value: 'Message'});
        }
        var vRouterDD = $('#ddVirtualRouters').data('contrailDropdown');            
        vRouterDD.setData(vRoutersDS);
        vRouterDD.value('');         
    }
    
    window.failureHandlerForVirtualRouters = function(error) {
        gridPhysicalRouters.showGridMessage('errorGettingData');
    }
    
    function fetchBGPRouters() {
        doAjaxCall('api/admin/nodes/bgp','GET', null, 'successHandlerForBGPRouters', 'failureHandlerForBGPRouters', null, null);
    }
    
    window.successHandlerForBGPRouters =  function(result) {
        var bgpDS = [{text : "None", value : "None"}];    
        if(result && result.length > 0) {
            for(var i = 0; i < result.length;i++) {
                var bgpRouter = result[i];
                bgpDS.push({text : bgpRouter.name, value : bgpRouter.uuid});
            } 
        
        } else {
            bgpDS.push({text : 'No BGP Router found', value: 'Message'});
        }
        var bgpDD = $('#ddBgpRouter').data('contrailDropdown');            
        bgpDD.setData(bgpDS);  
    }
    
    window.failureHandlerForBGPRouters = function(error) {
        gridPhysicalRouters.showGridMessage('errorGettingData');
    }
    
    function fetchVNs() {
        doAjaxCall('api/tenants/config/virtual-networks','GET', null, 'successHandlerForVNs', 'failureHandlerForVNs', null, null);
    }
    
    window.successHandlerForVNs =  function(result) {
        var vnDS = [];    
        
        if(result && result['virtual-networks'].length > 0) {
            var vns = result['virtual-networks'];
            for(var i = 0; i < vns.length;i++) {
                var vn = vns[i];
                var fqname = vn.fq_name;
                var val = fqname[0] + '|' + fqname[1] + '|' +fqname[2];
                vnDS.push({text : fqname[2], value : val});
            } 
        
        } else {
            vnDS.push({text : 'No VN found', value: 'Message'});
        }
        var msVN = $('#msVN').data('contrailMultiselect');            
        msVN.setData(vnDS);  
    }
    
    window.failureHandlerForVNs = function(error) {
        gridPhysicalRouters.showGridMessage('errorGettingData');
    }
    
    function validate() {
        var name = $('#txtPhysicalRouterName').val().trim();
        if(name  === ""){   
            showInfoWindow("Enter a Physical Router Name","Input required");
            return false;
        }
        var mgmtIpAddress = $('#txtMgmtIPAddress').val().trim();
        if(!validateIPAddress(mgmtIpAddress)){
            showInfoWindow("Enter a valid Management IP address in xxx.xxx.xxx.xxx format","Input required");
            return false;
        }
        var dataIpAddress = $('#txtDataIPAddress').val().trim();
        if(!validateIPAddress(dataIpAddress)){
            showInfoWindow("Enter a valid Dataplane IP address in xxx.xxx.xxx.xxx format","Input required");
            return false;
        }
        return true;         
    }
    
    function destroy() {
        var configTemplate = $("#physicalrouters-config-template");
        if(isSet(configTemplate)) {
            configTemplate.remove();
            configTemplate = $();
        }   
        var configDetailTemplate = $("#gridPhysicalRoutersDetailTemplate");
        if(isSet(configDetailTemplate)) {
            configDetailTemplate.remove();
            configDetailTemplate = $();
        }        
    }
    
 }
 