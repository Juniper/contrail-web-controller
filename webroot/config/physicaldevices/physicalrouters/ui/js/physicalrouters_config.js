/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalRoutersConfigObj = new physicalRoutersConfig();
function physicalRoutersConfig() {
    //Variable Definitions
    var gridPhysicalRouters;
    var globalVRoutersMap = {};
    
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
        fetchBGPRouters();
        fetchVNs();
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
                    name : 'Management IP'                    
                },
                {
                    id : 'data_ip_address',
                    field : 'data_ip_address',
                    name : 'Tunnel Source IP'                    
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
        $('#ddVirtualRoutersType').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onVrouterTypeChange
        }); 
        
        var vrType =  $('#ddVirtualRoutersType').data('contrailDropdown');
        var vrTypeDS = [{ text : 'None', value : 'none'},
                        { text : 'Embedded', value : 'embedded'},
                        { text : 'TOR Agent', value : 'tor-agent'}
        ];
        vrType.setData(vrTypeDS);
        
        $('#ddTorAgentName').contrailCombobox({
            dataTextField:'text',
            dataValueField:'value',
            minimumResultsForSearch : 1,
            change:onTorAgentChange
        }); 
        
        $('#ddTsnName').contrailCombobox({
            dataTextField:'text',
            dataValueField:'value',
            minimumResultsForSearch : 1,
            change:onTsnChange
        }); 
        
        //initializing delete record window
        //deleteRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});
        //deleteRecordWindowObj.find(".modal-header-title").text('Confirm');
               
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');            
    }
    
    function onVrouterTypeChange(e){
        var inf = e.added.value;
        if(inf === "tor-agent") {
            $('#vRouterTorAgentFields').removeClass('hide').addClass('show');
        } else {
            $('#vRouterTorAgentFields').removeClass('show').addClass('hide');           
        }
    }
    
    function onTorAgentChange(e){
//        var inf = e.added.value;
        var torcb = $('#ddTorAgentName').data('contrailCombobox');
        var inf = torcb.value();
        var allData = torcb.getAllData();
        var isSelectedFromList = false;
        $.each(allData,function(i,d){
            if(d.id == inf){
                isSelectedFromList = true;
            }
        });
        if(inf != null && isSelectedFromList){
            $('#txtTorAgentIp').val(inf);
            $('#txtTorAgentIp').attr("disabled", "disabled");
        } else {
            $('#txtTorAgentIp').val('');
            $('#txtTorAgentIp').removeAttr("disabled");
        }
    }
    
    function onTsnChange(e){
//        var inf = e.added.value;
        var tsncb = $('#ddTsnName').data('contrailCombobox');
        var inf = tsncb.value();
        var allData = tsncb.getAllData();
        var isSelectedFromList = false;
        $.each(allData,function(i,d){
            if(d.id == inf){
                isSelectedFromList = true;
            }
        });
        if(inf != null && inf != '' && isSelectedFromList){
            $('#txtTsnIp').val(inf);
            $('#txtTsnIp').attr("disabled", "disabled");
        } else {
            $('#txtTsnIp').val('');
            $('#txtTsnIp').removeAttr("disabled");
        }
    }
    
    function initActions() {
        $('#btnCreatePhysicalRouter').click(function() {
            $('#addPhysicalRouterWindow').find(".modal-header-title").text('Add Physical Router');
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddPhysicalRouterOk').click(function() {
            if(validate()) {
                $('#addPhysicalRouterWindow').modal('hide');
                createUpdatePhysicalRouter(); 
            }
        });
        $('#btnDeletePhysicalRouter').click(function(){
             if(!$(this).hasClass('disabled-link')) {
                 $('#confirmMainDelete').modal('show');
             }
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
        //TODO this need to be called on load of the window otherwise the data obtained will be stale        
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
            var msVNData = $('#msVN').data('contrailMultiselect').getAllData();
            var valueArr = [];
            for(var i = 0; i < msVNData.length ; i++){
                for(var j = 0; j < gblSelRow.virtual_networks.length ; j++){
                    if(msVNData[i].text == gblSelRow.virtual_networks[j]){
                        valueArr.push(msVNData[i].value);
                    }
                }
            }
            $('#msVN').data('contrailMultiselect').value(valueArr);
            
            if(gblSelRow.virtual_router != '-'){
                var selectedVRouters = gblSelRow.virtual_router.split(',');
                var vrType = 'None';
                $.each(selectedVRouters,function(i,vrname){
                    vrname = vrname.trim();
                    var dtl = getVirtualRouterDetails(vrname);
                    if(dtl.type == 'embedded'){
                        vrType = 'Embedded';
                        $('#vRouterTorAgentFields').removeClass('show').addClass('hide');
                    } else if(dtl.type == 'tor-agent'){
                        vrType = 'TOR Agent';
                        $('#ddTorAgentName').data('contrailCombobox').value(vrname);
                        $('#vRouterTorAgentFields').removeClass('hide').addClass('show');
                        $('#txtTorAgentIp').val(dtl.ip);
                        $('#txtTorAgentIp').attr("disabled", "disabled");
                    } else {
                        vrType = 'TOR Agent';
                        $('#ddTsnName').data('contrailCombobox').value(vrname);
                        $('#vRouterTorAgentFields').removeClass('hide').addClass('show');
                        $('#txtTsnIp').val(dtl.ip);
                        $('#txtTsnIp').attr("disabled", "disabled");
                    }
                });
                $('#ddVirtualRoutersType').data('contrailDropdown').text(vrType);
                if(vrType == 'None')
                    $('#vRouterTorAgentFields').removeClass('show').addClass('hide');
            } else {
                $('#ddVirtualRoutersType').data('contrailDropdown').text('None');
                $('#vRouterTorAgentFields').removeClass('show').addClass('hide');
            }
        } else {
            $('#ddBgpRouter').data('contrailDropdown').value('None');
            $('#ddVirtualRoutersType').data('contrailDropdown').value('none');
        }
        $('#addPhysicalRouterWindow').modal('show');       
    }
    
    function getVirtualRouterDetails(vRouterName) {
        return (globalVRoutersMap[vRouterName.trim()])? globalVRoutersMap[vRouterName.trim()] : '';
    }
        
    function createUpdatePhysicalRouter() {
        var methodType = 'POST';
        var url = '/api/tenants/config/physical-routers';
        var selectedVRouters = [];
        var postObject = {};
        postObject["physical-router"] = {};
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/physical-router/' + gblSelRow.uuid
            if(gblSelRow.virtual_router != '-'){
                selectedVRouters = gblSelRow.virtual_router.split(',');
            }
            postObject["physical-router"]["uuid"] = gblSelRow.uuid;
        }
        var name = $("#txtPhysicalRouterName").val();
        var vendor = $("#txtVendor").val();
        var mgmtIpAddress = $("#txtMgmtIPAddress").val();
        var dataIpAddress = $("#txtDataIPAddress").val();
        var username = $("#txtUsername").val();
        var password = $("#txtPassword").val();
        var bgpRouter = $("#ddBgpRouter").data('contrailDropdown').text();
        var vRoutersType = $("#ddVirtualRoutersType").data('contrailDropdown').text();
        
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');  
        
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
 
        var vns = $("#msVN").data('contrailMultiselect').getSelectedData();
        if(vns.length > 0){
            var vnRefs = [];
            for(var i = 0 ;i < vns.length ; i++){
                vnRefs.push({"to":vns[i].data});
            }
            postObject["physical-router"]["virtual_network_refs"] = vnRefs;
        } else {
            postObject["physical-router"]["virtual_network_refs"] = [];
        }
        
        if(vRoutersType != null && vRoutersType != 'None'){
            var virtualRouterRefs = [];
            if(vRoutersType == 'Embedded'){
                postObject["physical-router"]['virtual_router_type'] = vRoutersType;
                var virtualRouters = [];
                postObject["physical-router"]["virtual-routers"] = [];
                var currVr = getVirtualRouterDetails(name);
                if(currVr != null && currVr.type == 'embedded'){
                    if(currVr.ip != mgmtIpAddress){
                        //If the ip is changed we now need to change the ip address for the virtual router as well.
                        //add a flag to indicate edit of vrouter is required
                        postObject["physical-router"]["isVirtualRouterEdit"] = true;
                        virtualRouters.push({"virtual-router" : {"fq_name":["default-global-system-config", name],
                            "parent_type":"global-system-config",
                            "name": name,
                            "virtual_router_ip_address" : mgmtIpAddress,
                            "virtual_router_type" : ['embedded']}});
                    }
                    //ELSE dont add to the vrouters as it is already existing. just add a ref to this.
                } else {
                    virtualRouters.push({"virtual-router" : {"fq_name":["default-global-system-config", name],
                                        "parent_type":"global-system-config",
                                        "name": name,
                                        "virtual_router_ip_address" : mgmtIpAddress,
                                        "virtual_router_type" : ['embedded']}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",name]});
                
            } else {//ToR Agent case
                var torcb = $('#ddTorAgentName').data('contrailCombobox');
                var tor = torcb.value();
                var allData = torcb.getAllData();
                var isTorSelectedFromList = false;
                var isTorAlreadyFromEdit = false;
                $.each(allData,function(i,d){
                    if(d.id == tor){
                        isTorSelectedFromList = true;
                    }
                });
                $.each(selectedVRouters,function(j,vrouter){
                   if(vrouter.trim() == tor){
                       isTorAlreadyFromEdit = true;
                   } 
                });
                var tsncb = $('#ddTsnName').data('contrailCombobox');
                var tsn = tsncb.value();
                var tsnAllData = tsncb.getAllData();
                var isTsnSelectedFromList = false;
                var isTsnAlreadyFromEdit = false;
                $.each(tsnAllData,function(i,d){
                    if(d.id == tsn){
                        isTsnSelectedFromList = true;
                    }
                });
                $.each(selectedVRouters,function(j,vrouter){
                    if(vrouter.trim() == tsn){
                        isTsnAlreadyFromEdit = true;
                    } 
                 });
                postObject["physical-router"]['virtual_router_type'] = vRoutersType;
                var virtualRouters = [];
                postObject["physical-router"]["virtual-routers"] = [];
                
                var torAgentName = $("#ddTorAgentName").data('contrailCombobox').text();
                var torAgentIp = $("#txtTorAgentIp").val();
                var tsnName = $("#ddTsnName").data('contrailCombobox').text();
                var tsnIp = $("#txtTsnIp").val();
                //TOR Agent
                if(!isTorSelectedFromList && !isTorAlreadyFromEdit){
                    virtualRouters.push({"virtual-router" : {"fq_name":["default-global-system-config", torAgentName],
                                        "parent_type":"global-system-config",
                                        "name": torAgentName,
                                        "virtual_router_ip_address" : torAgentIp,
                                        "virtual_router_type" : ['tor-agent']}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",torAgentName]});
                //TSN
                if(!isTsnSelectedFromList && !isTsnAlreadyFromEdit){
                    virtualRouters.push({"virtual-router" : {"fq_name":["default-global-system-config", tsnName],
                                        "parent_type":"global-system-config",
                                        "name": tsnName,
                                        "virtual_router_ip_address" : tsnIp,
                                        "virtual_router_type" : ['tor-service-node']}});
                }
                virtualRouterRefs.push({"to":["default-global-system-config",tsnName]});
            }
            
            postObject["physical-router"]["virtual-routers"] = virtualRouters;
            postObject["physical-router"]["virtual_router_refs"] = virtualRouterRefs;
        } else {
            postObject["physical-router"]["virtual_router_refs"] = [];
        }
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalRouters', 'failureHandlerForCreateEditRouters', null, null);
    }
    window.failureHandlerForCreateEditRouters =  function(error) {
        //gridPhysicalRouters.showGridMessage("errorCreateEdit");
        fetchData();
   }
    
    function clearCreateEditWindow() {
        $('#txtPhysicalRouterName').removeAttr('disabled');
        $("#txtPhysicalRouterName").val('');
        $("#txtVendor").val('');
        $("#txtMgmtIPAddress").val('');
        $("#txtDataIPAddress").val('');
        $("#txtUsername").val('');
        $("#txtPassword").val('');
        $("#ddBgpRouter").data('contrailDropdown').value('None');
        $("#msVN").data('contrailMultiselect').value(''); 
        $("#ddVirtualRoutersType").data('contrailDropdown').value('none');
        $('#vRouterTorAgentFields').removeClass('show').addClass('hide');
        $("#ddTorAgentName").data('contrailCombobox').text('');
        $("#ddTsnName").data('contrailCombobox').text('');
        $("#txtTorAgentIp").val('');
        $("#txtTsnIp").val('');
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
                var vnsString = [];
                $.each(vns, function(i,d){
                    vnsString.push(d.to[2]);
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
                    virtual_networks : vnsString.length > 0 ? vnsString : '-',       
                    virtual_router : (virtualRouterString == '')? '-' : virtualRouterString
                });
            }
        
        } else {
            gridPhysicalRouters.showGridMessage("empty");
        }
        gridPhysicalRouters._dataView.setData(gridDS);
        fetchVirtualRouters();
    }
    
    window.failureHandlerForPhysicalRouters =  function(error) {
         gridPhysicalRouters.showGridMessage("errorGettingData");
    }
    
    function fetchVirtualRouters() {
        doAjaxCall('/api/tenants/config/virtual-routers','GET', null, 'successHandlerForVirtualRouters', 'failureHandlerForVirtualRouters', null, null);
    }
    
    window.successHandlerForVirtualRouters =  function(result) {
        var torAgentVrouterDS = [];
        var tsnVrouterDS = [];
        globalVRoutersMap = {};
        if(result && result.length > 0) {
            for(var i = 0; i < result.length;i++) {
                var virtualRouter = result[i]['virtual-router'];
                var vRouterType = (virtualRouter['virtual_router_type'])? virtualRouter['virtual_router_type'][0] : '';
                var vRouterIP = (virtualRouter['virtual_router_ip_address'])? virtualRouter['virtual_router_ip_address'] : '';
              //build a map with vrouter name and type to be used in createEditWindow
                globalVRoutersMap[virtualRouter['name']] = {type:vRouterType,ip:vRouterIP};
                
                if(vRouterType == 'tor-agent'){
                    //Tor agent can be assigned to only one prouter so dont include them in the list
                    if(!virtualRouter['physical_router_back_refs'] || virtualRouter['physical_router_back_refs'].length < 1) {
                        torAgentVrouterDS.push({text : virtualRouter.fq_name[1], value : virtualRouter.virtual_router_ip_address}); 
                    }
                } else if(vRouterType == 'tor-service-node'){
                    tsnVrouterDS.push({text : virtualRouter.fq_name[1], value : virtualRouter.virtual_router_ip_address});
                }
            } 
            if(torAgentVrouterDS.length < 1) {
                torAgentVrouterDS.push({text : 'No ToR Agent found', value: 'Message'});
            }
            if(tsnVrouterDS.length < 1) {
                tsnVrouterDS.push({text : 'No TSN Agent found', value: 'Message'});
            }
        } else {
            torAgentVrouterDS.push({text : 'No ToR Agent found', value: 'Message'});
            tsnVrouterDS.push({text : 'No TSN found', value: 'Message'});
        }
        var torAgentDD = $('#ddTorAgentName').data('contrailCombobox');
        var selTor = torAgentDD.text();
        torAgentDD.setData(torAgentVrouterDS);
        torAgentDD.text(selTor);
        var tsnAgentDD = $('#ddTsnName').data('contrailCombobox');      
        var selTsn = tsnAgentDD.text();
        tsnAgentDD.setData(tsnVrouterDS);
        tsnAgentDD.text(selTsn);
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
                var data = fqname;
                var val = vn.uuid;
                vnDS.push({text : fqname[2], value : val, data : data});
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
        if($('#txtMgmtIPAddress').val() != '') {
            var mgmtIpAddress = $('#txtMgmtIPAddress').val().trim();
            if(!validateIPAddress(mgmtIpAddress)){
                showInfoWindow("Enter a valid Management IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
        }
        if($('#txtDataIPAddress').val() != '') {
            var dataIpAddress = $('#txtDataIPAddress').val().trim();
            if(!validateIPAddress(dataIpAddress)){
                showInfoWindow("Enter a valid Dataplane IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
        }
        var ddVirtualRoutersType = $('#ddVirtualRoutersType').data('contrailDropdown');
        var ddTorAgentName = $('#ddTorAgentName').data('contrailCombobox');
        var ddTsnName = $('#ddTsnName').data('contrailCombobox');
        if(ddVirtualRoutersType.value() == "tor-agent") {
            if(ddTorAgentName.text() == ddTsnName.text()){
                showInfoWindow("ToR Agent Name and TSN Name cannot be same");
                return false;
            }
        }
        
        if($('#txtTorAgentIp').val() != '') {
            var dataIpAddress = $('#txtTorAgentIp').val().trim();
            if(!validateIPAddress(dataIpAddress)){
                showInfoWindow("Enter a valid ToR Agent IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
        }
        
        if($('#txtTsnIp').val() != '') {
            var dataIpAddress = $('#txtTsnIp').val().trim();
            if(!validateIPAddress(dataIpAddress)){
                showInfoWindow("Enter a valid TSN IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
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
 