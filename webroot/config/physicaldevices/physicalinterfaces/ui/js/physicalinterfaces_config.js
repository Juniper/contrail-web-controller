/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalInterfacesConfigObj = new physicalInterfacesConfig();
function physicalInterfacesConfig() {
    //Variable Definations
    var gridPhysicalInterfaces;
    var currentUUID;
    var dsSrcDest = [];
    var doubleCreation = false;
    var interfaceDelimiters = [];
    var vmiDetails = [];
    var piUUIDList = [];
    var pInterfaceDS = [];
    var flow = null;
    var dynamicID = 0;
    var gblSelRow = null;
    this.dynamicID = dynamicID;
    var vmiDataSrc = [];
    var selAllRows;
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
        fetchConfigurations();
    }
    
    function initComponents() {
        //initializing the virtual routers Grid
        $("#gridPhysicalInterfaces").contrailGrid({
            header : {
                title: {
                    text : 'Interfaces',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnDeletePhysicalInterface" class="disabled-link" title="Delete Interface(s)"><i class="icon-trash"></i></a>',
                    '<a id="btnCreatePhysicalInterface" title="Create Interface"><i class="icon-plus"></i></a>',
                    'Router: <div id="ddPhysicalRouters"/>',]
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
                    name : 'Servers',
                    formatter:function(r,c,v,cd,dc){
                        var servers = v;
                        var serverString = '';
                        if(servers == '' || servers == '-' || servers.length < 1)
                            return '-';
                        $.each(servers,function(i,d){
                            if(i == 0){
                                serverString = d; 
                            } else {
                                serverString += '</br>' + d;
                            }
                        })
                        return serverString;
                    },
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
                    actionCell: function(dc){
                        var ret = [];
                        if(dc.type != 'Physical' && dc.li_type != 'L3'){
                            ret.push({
                                title: 'Edit',
                                iconClass: 'icon-edit',
                                onClick: function(rowIndex){
                                   physicalInterfaceEditWindow(rowIndex);
                                }
                            });
                        }
                        ret.push({
                                title: 'Delete',
                                iconClass: 'icon-trash',
                                onClick: function(rowIndex){
                                    showPhysicalInterfaceDelWindow(rowIndex);
                                }
                            });
                         return ret},
                    detail : {
                        template : $("#gridPhysicalInterfacesDetailTemplate").html()
                    }    
			    },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Interfaces..'
                    },
                    empty: {
                        text: 'No Interfaces.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Interfaces.'
                    }
                }
            }
        });      
        gridPhysicalInterfaces = $("#gridPhysicalInterfaces").data('contrailGrid');
        gridPhysicalInterfaces.showGridMessage('loading');
        $('#ddPhysicalRouters').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onPhysicalRouterSelChange
        });
        
        $('#ddType').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onTypeSelChange
        });
        
        var ddType = $('#ddType').data('contrailDropdown');
        ddType.setData([{text : 'Physical', value : 'physical'},{text : 'Logical', value : 'logical'}]);
        ddType.value('logical')
        
         $('#ddParent').contrailDropdown({
             dataTextField:'text',
             dataValueField:'value',
             minimumResultsForSearch : 1,
             query : select2Query
         })
         .on('select2-open', function() {
             loadSelect2OpenActions();
         }); 

         $('#ddLIType').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onLITypeChange
        });  
        
        var ddLIType = $('#ddLIType').data('contrailDropdown');
        ddLIType.setData([{text : 'L2 Gateway', value : 'l2Gateway'}, {text : 'L2 Server', value : 'l2Server'}, {text : 'L3', value : 'l3'}]);
        ddLIType.value('l2Server');
         
         $('#ddVN').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onVNSelChange,
            minimumResultsForSearch : 1
        });         

        //initializing add record window	  	
        $('#addPhysicalInterfaceWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Add Interface');
        
        //initializing delete record window
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');
        collapseElement('#vmSection .widget-header','#infWidget');
        $('#ddParent').data('contrailDropdown').enable(false);
    }
    
    function onPhysicalRouterSelChange(e) {
        currentUUID = e.added.value;
        //Push query parameter in URL
        layoutHandler.setURLHashParams({uuid:currentUUID},{triggerHashChange:false});
        fetchPhysicalInterfaces();
    }
    
    function onTypeSelChange(e) {
       var inf = e.added.value;
       if(inf === "logical") {
           // if($('#infWidget').hasClass('collapsed')) {
               // collapseElement('#vmSection', '#infWidget'); 
           // }
           $('#vmSection').removeClass('hide').addClass('show');
           $('#ddParent').data('contrailDropdown').enable(true); 
       } else {
            $('#vmSection').removeClass('show').addClass('hide');
            $('#ddParent').data('contrailDropdown').value(dsSrcDest[0].children[1].value);    
            $('#ddParent').data('contrailDropdown').enable(false);            
       }
    }
    
    function onVNSelChange(e) {
        var id = e.added.value;
        flow = null;
        if(id != 'none') {
            $('#txtSubnet').removeAttr('disabled');
            clearServerDetailsGrid();
            $('#btnAddServer').show();
        } else {
             var liType = $('#ddLIType').data('contrailDropdown').value();
             if(liType === 'l3') {
                 $('#txtSubnet').val('');
                 $('#txtSubnet').attr('disabled', 'disabled');
             } else if(liType === 'l2Server') {
                 clearServerDetailsGrid();
                 $('#txtVMI').val('');
                 $('#txtVMI').attr('disabled', 'disabled');
             } 
             $('#btnAddServer').hide();
        }
        fetchVirtualNetworkInternals(id);
    }
    
    function onVMISelChanges(e) {
        var ipObj = $('#ddVMI').data('contrailCombobox').getSelectedItem();
        if(typeof ipObj === 'object') {
            /*if(ipObj.ip == '') {
                $('#txtVMI').val(ipObj.ip);
                $('#txtVMI').removeAttr('disabled');
            } else {*/
                if(ipObj.ip != null) {
                    $('#txtVMI').val(ipObj.ip);
                } else {
                    $('#txtVMI').val('');
                }
                $('#txtVMI').attr('disabled','disabled');
            //}
        } else {
            $('#txtVMI').val('');
            $('#txtVMI').removeAttr('disabled');
        }
        if($('#txtVMI').is('[disabled]') && $('#txtVMI').val() === "") {
            $('#txtVMI').val(' ');
        }
    }
    
    function onLITypeChange(e) {
        var id = e.added.value;
        if(id === 'l2Server') {
             $('#l3SubnetPanel').removeClass('show').addClass('hide');
             $('#l2TypePanel').removeClass('hide').addClass('show');
             $('#l2ServerPanel').removeClass('hide').addClass('show');
             $('#txtSubnet').val('');
        } else if(id === 'l2Gateway') {
            $('#l2TypePanel').removeClass('show').addClass('hide');
            $('#l2ServerPanel').removeClass('show').addClass('hide');
            $('#l3SubnetPanel').removeClass('show').addClass('hide');
            clearServerDetailsGrid();
        } else if(id === 'l3') {
            $('#l2TypePanel').removeClass('show').addClass('hide');
            $('#l2ServerPanel').removeClass('show').addClass('hide');
            $('#l3SubnetPanel').removeClass('hide').addClass('show');
            clearServerDetailsGrid();
        }
    }
    
    function initActions() {
        $('#btnCreatePhysicalInterface').click(function() {
            $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Add Interface');
            populateCreateEditWindow('create');
        });    
        
        $('#btnAddPhysicalInterfaceOk').click(function() {
            if(validate()) {
                $('#addPhysicalInterfaceWindow').modal('hide');
                //Fetch the server tuples and create vmis appropriately
                var serverTuples = $("#serverTuples")[0].children;
                var selectedServerDetails = [];//Array of selected servers
                var requireVMICreation = false;
                var liType = $('#ddLIType').data('contrailDropdown').value();
                if (serverTuples && serverTuples.length > 0) {
                    for(i = 0 ; i< serverTuples.length ; i++){
                        var divid = serverTuples[i].id;
                        var id = getID(divid);
                        var cbVMIValue = $("#serverTuples_"+id+"_serverMac").data("contrailCombobox").getSelectedItem().id;//TODO should have worked with .value() it is getting set to text
                        var serverIp = $("#serverTuples_"+id+"_serverIp").val();
                        var serverMac = $("#serverTuples_"+id+"_serverMac").data("contrailCombobox").text();
                        var isVMICreate = !$("#serverTuples_"+id+"_serverIp").is('[disabled]');//If ip field is disabled it means the vmi exists and no need to create it.
                        selectedServerDetails.push({"cbVMIValue":cbVMIValue,"serverMac":serverMac,"serverIp":serverIp,"isVMICreate":isVMICreate}); 
                        if(isVMICreate){
                            requireVMICreation = true;
                        }
                    }
                }
                
                var isSubnetCreate = !$('#txtSubnet').is('[disabled]');//If subnet is disabled it means vmi exists
                var postObject;
                if(requireVMICreation && liType != "l2Gateway"){
                    //L2 Server type
                    var createPortsData= [];
                    for(var i=0; i < selectedServerDetails.length; i++){
                        if(selectedServerDetails[i].isVMICreate) {
                            var mac = getMacFromText(selectedServerDetails[i].serverMac);
                            var ip = selectedServerDetails[i].serverIp != '' ? selectedServerDetails[i].serverIp.trim() : '';
                            createPortsData.push({mac : mac, ip : ip});
                        }
                    }
                    createPorts(createPortsData);
                } else if (liType == 'l2Gateway'){
                    //L2 Gateway type
                    createPort({mac : ''});
                } else if(isSubnetCreate && liType === 'l3') {
                    //Subnet creation flow
                    createPort({mac : '', ip : ''});
                } else {
                    //No VMI or subnet creation just go ahead with the Physical/Logical Interface creation
                    createUpdatePhysicalInterface(); 
                }
                if($('#txtSubnet').val().trim() == '' && gblSelRow != null &&  gblSelRow.subnetUUIDArr != '-' && gblSelRow.subnetUUIDArr.length > 0) {
                    deleteSubnets(gblSelRow.subnetUUIDArr);
                }
            }
        });

        function createPort(portDetails) {
            var postObjInput = {};
            var selVN = $('#ddVN').data('contrailDropdown').getSelectedData()[0];
            selVN = JSON.parse(selVN.data);
            postObjInput.subnetId = selVN.subnetId;
            postObjInput.fqName = selVN.fqName;
            if(portDetails.mac != '') {
                postObjInput.mac = portDetails.mac;
            }
            postObjInput.ip = portDetails.ip;
            $.ajax({
                url : '/api/tenants/config/ports',
                type : "POST",
                contentType : 'application/json',
                data : JSON.stringify(prepareVMIPostObject(postObjInput)),
                success : successHandlerForVMICreation,
                error : failureHandlerForVMICreation
            });
        }
        
        function createPorts(portsDetails) {
            var portCreateAjaxs = [];
            for(var i = 0; i < portsDetails.length; i++){
                var postObjInput = {};
                var selVN = $('#ddVN').data('contrailDropdown').getSelectedData()[0];
                selVN = JSON.parse(selVN.data);
                postObjInput.subnetId = selVN.subnetId;
                postObjInput.fqName = selVN.fqName;
                if(portsDetails[i].mac != '') {
                    postObjInput.mac = portsDetails[i].mac;
                }
                postObjInput.ip = portsDetails[i].ip;
                portCreateAjaxs.push($.ajax({
                    url : '/api/tenants/config/ports',
                    type : "POST",
                    contentType : 'application/json',
                    data : JSON.stringify(prepareVMIPostObject(postObjInput))
                }));
            }
            var setVMRefsToVMIAjaxs = [];
            var defer = $.when.apply($, portCreateAjaxs);
            defer.done(function(){
                
                // This is executed only after every ajax request has been completed
                if(portCreateAjaxs.length > 1){
                    $.each(arguments, function(index, result){
                        result = result[0];//0 element contains the response
                        if(result != null && result['virtual-machine-interface']
                                && result['virtual-machine-interface']['fq_name']) {
                            vmiDetails.push(result);
                            var vmiId = result['virtual-machine-interface']['fq_name'][2];
                            setVMRefsToVMIAjaxs.push($.ajax({
                                url : '/api/tenants/config/map-virtual-machine-refs/' + vmiId +'/null',
                                type : "GET"
                            }));
                        } else {
                            fetchPhysicalInterfaces();
                        }
                    });
                } else {
                    var result = arguments[0];
                    if(result != null && result['virtual-machine-interface']
                            && result['virtual-machine-interface']['fq_name']) {
                        vmiDetails.push(result);
                        var vmiId = result['virtual-machine-interface']['fq_name'][2];
                        setVMRefsToVMIAjaxs.push($.ajax({
                            url : '/api/tenants/config/map-virtual-machine-refs/' + vmiId +'/null',
                            type : "GET"
                        }));
                    } else {
                        fetchPhysicalInterfaces();
                    }
                }
                
                $.when.apply($,setVMRefsToVMIAjaxs).then(
                    function(response){
                        //On successful creation of VMs create the Logical Interface
                        createUpdatePhysicalInterface();
                    },
                    function(){
                        //failure
                        var r = arguments;
                        showInfoWindow(r[0].responseText,r[2]);
                        fetchPhysicalInterfaces();
                    }
                );
            }).fail(function(){
                 //failure
                 var r = arguments;
                 showInfoWindow(r[0].responseText,r[2]);
                 fetchPhysicalInterfaces();
                 if(vmiDetails.length > 0) {
                    deleteVirtulMachineInterfaces(prepareDeletePortListForFailedLI(), []);
                 }
            });
            
        }

        window.successHandlerForVMICreation = function(result, status, xhr) {
            if(result != null && result['virtual-machine-interface']
                && result['virtual-machine-interface']['fq_name']) {
                vmiDetails = [result];
                var vmiId = result['virtual-machine-interface']['fq_name'][2];
                setVirtualMachineRefsToVMI(vmiId);
                if ($('#ddLIType').data('contrailDropdown').value() === 'l3' && $('#txtSubnet').val().trim() != '') {
                    setVMIRefsToSubnet(vmiId);
                }
            } else {
                fetchPhysicalInterfaces();
            }
        }
        
        

        window.failureHandlerForVMICreation = function(xhr, status, error) {
            showInfoWindow(error, status);
            fetchPhysicalInterfaces();
        }

        function setVMIRefsToSubnet(vmiId) {
            var subnet =  $('#txtSubnet').val().trim();
            var subnetArry = subnet.split('/');
            var subnetPostObj = {
                "subnet": {
                    "subnet_ip_prefix": {
                        "ip_prefix": subnetArry[0],
                        "ip_prefix_len": parseInt(subnetArry[1])
                    }
                }
            }
            doAjaxCall('/api/tenants/config/set-vmi-refs-to-subnet/' + vmiId, 'POST', JSON.stringify(subnetPostObj),
                'successHandlerForVMIRefToSubnet', 'failureHandlerForVMIRefToSubnet', null, null);
        }

        window.successHandlerForVMIRefToSubnet = function(result) {

        }

        window.failureHandlerForVMIRefToSubnet = function(error) {

        }

        function setVirtualMachineRefsToVMI(vmiId) {
            doAjaxCall('/api/tenants/config/map-virtual-machine-refs/' + vmiId +'/null', 'GET', null,
                'successHandlerForVMRefToVMI', 'failureHandlerForVMRefToVMI', null, null);
        }

        window.successHandlerForVMRefToVMI = function(result) {
            if(result != null) {
                createUpdatePhysicalInterface();
            } else {
                fetchPhysicalInterfaces();
            }
        }

        window.failureHandlerForVMRefToVMI = function(error) {
            fetchPhysicalInterfaces();
        }
        
        $('#btnDeletePhysicalInterface').click(function(){
             if(!$(this).hasClass('disabled-link')) {
                 $('#confirmMainDelete').modal('show');
             }
        });
        $('#btnCnfDelMainPopupOK').click(function(args){
            var selected_rows = gridPhysicalInterfaces.getCheckedRows();
            $('#confirmMainDelete').modal("hide");
            deletePhysicalInterface(selected_rows);
        });  
        $('#txtPhysicalInterfaceName').bind('blur', function(e) {
              if($('#ddType').data('contrailDropdown').value() === "logical") {
                  var infName = $('#txtPhysicalInterfaceName').val().trim();
                  var delimiter;
                  for(var i = 0; i < interfaceDelimiters.length; i++) {
                      if(infName.indexOf(interfaceDelimiters[i]) !== -1) {
                          delimiter = interfaceDelimiters[i];
                          break;
                      }
                  }
                  var infNameArry = infName.split(delimiter);
                  var physicalInfName = '';
                  if(infNameArry.length === 2) {
                      physicalInfName = infNameArry[0];
                      verifySetSelectedItem(setJunosPhysicalInf(physicalInfName), $('#ddParent').data('contrailDropdown'));
                  } else {
                     $('#ddParent').data('contrailDropdown').value(dsSrcDest[0].children[1].value); 
                  }
              }
        });
        $('input[type=radio][name=l2Type]').on('change', function(e){
            if(e.target.value === 'l2Server') {
                $('#l2ServerPanel').removeClass('hide').addClass('show');
            } else if(e.target.value === 'l2Gateway') {
                clearServerDetailsGrid();
                $('#l2ServerPanel').removeClass('show').addClass('hide');
            }
        }); 
        $('#btnAddServer').click(function() {
            appendServerEntry(this, true);
        });
        $('#chk_clear_ports').on('change', function(e) {
            //set clear ports value to cookie
            setCookie("bm_clear_vmi", $('#chk_clear_ports')[0].checked);
        });
    }

    function prepareVMIPostObject(input) {
        var curDomain = input.fqName[0];
        var curProject = input.fqName[1];
        var postObj = {};
        postObj["virtual-machine-interface"] = {};
        postObj["virtual-machine-interface"]["parent_type"] = "project";
        postObj["virtual-machine-interface"]["fq_name"] = [curDomain, curProject];
        postObj["virtual-machine-interface"]["virtual_network_refs"] = [{ "to": input.fqName}];
        if(input.mac != undefined) {
            postObj["virtual-machine-interface"]["virtual_machine_interface_mac_addresses"] = {"mac_address": [input.mac]};
        }
        if(input.ip != undefined) {
            postObj["virtual-machine-interface"]["instance_ip_back_refs"]
                = [{"instance_ip_address" : [{"fixedIp": input.ip,"domain": curDomain,"project": curProject}],"subnet_uuid": input.subnetId}];
        }
        postObj["virtual-machine-interface"]["virtual_machine_interface_device_owner"] = "";
        postObj["virtual-machine-interface"]["security_group_refs"] = [{"to" :[curDomain,curProject,"default"]}];
        return postObj;
    }

    //As Junos can have e-0/0/0.0 pattern for physical interface setting it has parent for logical interface
    function setJunosPhysicalInf(inf) {
        var actInf = inf;
        var junosInf = inf + '.0';
        if(isItemExists(junosInf, dsSrcDest)) { 
            actInf = junosInf;       
        }
        return actInf;
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
    
    function sortByLIThenByPI(selected_rows) {
        var finalList = [];
        for(var i = 0; i < selected_rows.length; i++) {
            if(selected_rows[i].type == 'Logical') {
                finalList.push(selected_rows[i]);
            }
        }
        for(var i = 0; i < selected_rows.length; i++) {
            if(selected_rows[i].type == 'Physical') {
                finalList.push(selected_rows[i]);
            }
        }
        return finalList;
    }
    
    function deletePhysicalInterface(selected_rows) {
        $('#btnDeletePhysicalInterface').addClass('disabled-link');
        selAllRows = sortByLIThenByPI(selected_rows);
        var lastKey = 0;
        deletePhysicalInterfaceChunk(lastKey);
    }
    
    function deletePhysicalInterfaceChunk(lastKey) {
        deleteInterface(selAllRows.slice(lastKey , lastKey + 20), lastKey);
    }    

    function deleteInterface(selected_rows, lastKey) {
        $('#btnDeletePhysicalInterface').addClass('disabled-link');	
        if(selected_rows && selected_rows.length > 0){
            var deleteVMIs = [];
            var deleteVMs = [];
            var delSubnets = [];
            var physicalIntfsDeleteAjaxs = [];
            var logicalIntfsDeleteAjaxs = [];
            for(var i = 0;i < selected_rows.length;i++){
                lastKey++;
                var sel_row_data = selected_rows[i];
                if(sel_row_data['type'] == 'Logical'){
                    logicalIntfsDeleteAjaxs.push($.ajax({
                        url:'/api/tenants/config/physical-interface/' + currentUUID + '/' + sel_row_data['type'] + '/' + sel_row_data['uuid'],
                        type:'DELETE'
                    }));
                } 
                if(sel_row_data.vmi_uuid != null && sel_row_data.vmi_uuid.length > 0) {
                    deleteVMIs = deleteVMIs.concat(sel_row_data.vmi_uuid);
                }
                if(sel_row_data.vm_uuid != null && sel_row_data.vm_uuid.length > 0) {
                    deleteVMs = deleteVMs.concat(sel_row_data.vm_uuid);
                }
                if(sel_row_data.subnetUUIDArr != null && sel_row_data.subnetUUIDArr != '-' && sel_row_data.subnetUUIDArr.length > 0) {
                    delSubnets = sel_row_data.subnetUUIDArr;
                }
            }
            //First delete logical interfaces
            $.when.apply($,logicalIntfsDeleteAjaxs).then(
                function(response){
                    //now delete physical interfaces
                    for(var i = 0;i < selected_rows.length;i++){
                        var sel_row_data = selected_rows[i];
                        if(sel_row_data['type'] == 'Physical'){
                            physicalIntfsDeleteAjaxs.push($.ajax({
                                    url:'/api/tenants/config/physical-interface/' + currentUUID + '/' + sel_row_data['type'] + '/' + sel_row_data['uuid'],
                                    type:'DELETE'
                                }));
                        } 
                    }
                    $.when.apply($,physicalIntfsDeleteAjaxs).then(
                            function(response){
                                //all success
                                if(deleteVMIs.length == 0 && lastKey < selAllRows.length) {
                                    deletePhysicalInterfaceChunk(lastKey);
                                }
                                if(deleteVMIs.length > 0) {
                                    deleteVirtulMachineInterfaces(deleteVMIs, deleteVMs, lastKey);
                                }
                                if(delSubnets.length > 0) {
                                    deleteSubnets(delSubnets);
                                }
                                if(lastKey == selAllRows.length) {
                                    fetchPhysicalInterfaces();
                                }
                            },
                            function(){
                                //if at least one delete operation fails
                                var r = arguments;
                                showInfoWindow(r[0].responseText,r[2]);     
                                fetchPhysicalInterfaces();
                            }
                        );
                },
                function(){
                    //if at least one delete operation fails
                    var r = arguments;
                    showInfoWindow(r[0].responseText,r[2]);		
                    fetchPhysicalInterfaces();
                }
            );
        }
    }

    function deleteVirtulMachineInterfaces(deleteVMIs, deleteVMs, lastKey) {
        var deleteAjaxs = [];
        for(var i = 0; i < deleteVMIs.length; i++) {
            deleteAjaxs[i] =  $.ajax({
                    url:'/api/tenants/config/ports/' + deleteVMIs[i],
                    type:'DELETE'
                })
        }
        $.when.apply($,deleteAjaxs).then(
            function(response){
                //delete all vms
                // if(deleteVMs.length > 0) {
                    // deleteVirtualMachines(deleteVMs);
                // }
                if(lastKey != null && lastKey < selAllRows.length) {
                    deletePhysicalInterfaceChunk(lastKey);
                }
            },
            function(){
            }
        );
    }

    function deleteVirtualMachines(deleteVMs) {
        var deleteAjaxs = [];
        for(var i = 0; i < deleteVMs.length; i++) {
            deleteAjaxs[i] =  $.ajax({
                    url:'/api/tenants/config/li-virtual-machine/' + deleteVMs[i],
                    type:'DELETE'
                })
        }
        $.when.apply($,deleteAjaxs).then(
            function(response){
            },
            function(){
            }
        );
    }

    function deleteSubnets(delSubnets) {
        var deleteAjaxs = [];
        for(var i = 0; i < delSubnets.length; i++) {
            deleteAjaxs[i] =  $.ajax({
                    url:'/api/tenants/config/li-subnet/' + delSubnets[i],
                    type:'DELETE'
                })
        }
        $.when.apply($,deleteAjaxs).then(
            function(response){
            },
            function(){
            }
        );
    }

    
    window.physicalInterfaceEditWindow = function(index) {
        populateCreateEditWindow('edit', index);
    }
    
    function populateCreateEditWindow(m, index) {
        mode = m;
        clearCreateEditWindow();
        prepareAccordionData();
        fetchVirtualNetworks();
        if(mode === 'edit') {
            gblSelRow = gridPhysicalInterfaces._dataView.getItem(index);
            dynamicID = 0;
            $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Edit Interface');
            $('#txtPhysicalInterfaceName').val(gblSelRow.name);
            $('#txtPhysicalInterfaceName').attr('disabled','disabled');
            $('#ddParent').data('contrailDropdown').enable(true);
            $('#ddParent').data('contrailDropdown').text(gblSelRow.parent);
            $('#ddParent').data('contrailDropdown').enable(false);            
            $('#ddType').data('contrailDropdown').text(gblSelRow.type);             
            $('#ddType').data('contrailDropdown').enable(false);
            if(gblSelRow.type === 'Logical') {
                //Disabling the change of LI type on edit.
                $('#ddLIType').data('contrailDropdown').enable(false);
                 flow = 'edit';
                 $('#vmSection').removeClass('hide').addClass('show');
                 if(gblSelRow.vlan != "-") {
                     $('#txtVlan').val(gblSelRow.vlan);
                     $('#txtVlan').attr('disabled', 'disabled');
                 }    
                 if(gblSelRow.vn != '-') {
                     var ddVN = $('#ddVN').data('contrailDropdown');
                     if(gblSelRow.vn != 'none'){
                         $('#btnAddServer').show();
                     }
                     fetchVirtualNetworkInternals(ddVN.value());
                      $('#txtSubnet').removeAttr('disabled');
                 }else {
                      $('#txtSubnet').attr('disabled', 'disabled');
                 }
                 if(gblSelRow.li_type != '-') {
                     if(gblSelRow.li_type == 'L2'){
                         $('#ddLIType').data('contrailDropdown').text('L2 Server');
                     } else {
                         $('#ddLIType').data('contrailDropdown').text('L3');
                     }
                     if($('#ddLIType').data('contrailDropdown').value() === 'l3') {
                         $('#l2ServerPanel').removeClass('show').addClass('hide');
                         $('#l3SubnetPanel').removeClass('hide').addClass('show');
                         $('#l2TypePanel').removeClass('show').addClass('hide');
                         if(gblSelRow.subnetCIDRArr != '-' && gblSelRow.subnetCIDRArr.length) {
                             $('#txtSubnet').val(gblSelRow.subnetCIDRArr[0]);
                         } else {
                             $('#txtSubnet').val('');
                         }
                     } else if($('#ddLIType').data('contrailDropdown').value() === 'l2Server'){
                         $('#l2ServerPanel').removeClass('hide').addClass('show');
                         $('#l3SubnetPanel').removeClass('show').addClass('hide');
                         $('#l2TypePanel').removeClass('hide').addClass('show');
                     } 
                 }
                 $('#panel_clear_ports').removeClass('hide').addClass('show');
                 $('#chk_clear_ports')[0].checked = JSON.parse(getCookie('bm_clear_vmi'));
            } else {
                $('#vmSection').removeClass('show').addClass('hide');
            }           
        }
        $('#addPhysicalInterfaceWindow').modal('show');       
    }
    
    function getCurrentVirtualNetworkId(name) {
        var data = $('#ddVN').data('contrailDropdown').getAllData();
        for(var i = 0; i < data.length; i++) {
            if(data[i].text.indexOf(name) !== -1) {
                return data[i].value;
            }    
        }
        return '';
    }
    
    function getCurrentVMIId(name) {
        if(name != '') {
            name = name.trim();
            var data = $('#ddVMI').data('contrailCombobox').getAllData();
            for(var i = 0; i < data.length; i++) {
                if(data[i].text.indexOf(name) !== -1) {
                    return data[i].id;
                }
            }
        }
        return '';
    }
        
    function handleInterfaceName(name) {
        var actName = name;
        if(name.indexOf(':') != -1){
            actName = name.replace(':','__');
        }
        return actName;
    }

    function createUpdatePhysicalInterface() {
        var methodType = 'POST';
        var infType = $('#ddType').data('contrailDropdown').text();
        var url = '/api/tenants/config/physical-interfaces/' + currentUUID + '/' + infType;
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/physical-interface/' + currentUUID + '/' + gblSelRow.type + '/' + gblSelRow.uuid;
        }
        var type = $("#ddType").data('contrailDropdown').value();
        var name = $("#txtPhysicalInterfaceName").val().trim();
        var actName = handleInterfaceName(name);
        var vlan =  $("#txtVlan").val() === '' ? 0 : parseInt($("#txtVlan").val());
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
        var postObject = {};
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');  
        
        //Only Physical interface case
        if(infType === 'Physical') {
            postObject["physical-interface"] = {};
            postObject["physical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), actName];
            postObject["physical-interface"]["parent_type"] = "physical-router";
            postObject["physical-interface"]["name"] = actName;
            postObject["physical-interface"]["display_name"] = name;
            if(mode === 'edit') {
                postObject["physical-interface"]["uuid"] = gblSelRow.uuid;
            }
        } else {//Logical interface case
            var liType = $('#ddLIType').data('contrailDropdown').value();
            liType = (liType == 'l2Gateway' || liType == 'l2Server')? 'l2' : 'l3';
            var parent = $('#ddParent').data('contrailDropdown');
            
           //Fetch the server tuples
            var serverTuples = $("#serverTuples")[0].children;
            var selectedServerDetails = []
            if (serverTuples && serverTuples.length > 0) {
                for(i = 0 ; i< serverTuples.length ; i++){
                    var divid = serverTuples[i].id;
                    var id = getID(divid);
                    var vmiData = $("#serverTuples_"+id+"_serverMac").data("contrailCombobox").getSelectedItem();
                    var vmiFQName = null;
                    if(typeof vmiData === 'object') {
                        selectedServerDetails.push(JSON.parse(vmiData.data)); 
                    } 
                    var serverIp = $("#serverTuples_"+id+"_serverIp").val();
                }
            }
            //End of fetching the server tuples
            var vmiRefs = [];
            for(var j = 0; j < vmiDetails.length ; j++){
                if(vmiDetails[j] != null) {
                    var vmiData = vmiDetails[j]['virtual-machine-interface']['fq_name'];
                    vmiRefs.push({"to" : [vmiData[0], vmiData[1], vmiData[2]], "uuid": vmiDetails[j]['virtual-machine-interface']['uuid']});
                }
            }
            for(var j = 0; j < selectedServerDetails.length ; j++){
                var vmiFqname = 'none';
                vmiFqname = selectedServerDetails[j]['vmi_fq_name'];
                vmiRefs.push({"to" : [vmiFqname[0], vmiFqname[1], vmiFqname[2]],"uuid": selectedServerDetails[j]['vmi_uuid']});
            }
            //Logical interface directly under pRouter case
            if(pRouterDD.value() === parent.value()) {
                postObject["logical-interface"] = {};
                postObject["logical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), actName];
                postObject["logical-interface"]["parent_type"] = "physical-router";
                postObject["logical-interface"]["name"] = actName;
                postObject["logical-interface"]["display_name"] = name;
                postObject["logical-interface"]["logical_interface_vlan_tag"] = vlan;
                postObject["logical-interface"]['virtual_machine_interface_refs'] = vmiRefs;
                postObject["logical-interface"]["logical_interface_type"] = liType;
                if(mode === 'edit') {
                    postObject["logical-interface"]["uuid"] = gblSelRow.uuid;
                }
            } else {
                var piDispName = parent.text().trim();
                var piName = handleInterfaceName(piDispName);
                //Double creation case where Physical interface is created first
                if(!isItemExists(parent.text(), pInterfaceDS)) {
                    doubleCreation = true;
                    postObject["physical-interface"] = {};
                    postObject["physical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), piName];
                    postObject["physical-interface"]["parent_type"] = "physical-router";
                    postObject["physical-interface"]["name"] = piName;
                    postObject["physical-interface"]["display_name"] = piDispName;
                    if(mode === 'edit') {
                        postObject["physical-interface"]["uuid"] = gblSelRow.uuid;
                    }
                    url = '/api/tenants/config/physical-interfaces/' + currentUUID + '/Physical';                 
                } else {
                    //If the Physical interface already exists create the Logical interface
                    doubleCreation = false;
                    postObject["logical-interface"] = {};
                    postObject["logical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), piName, actName];
                    postObject["logical-interface"]["parent_type"] = "physical-interface";
                    postObject["logical-interface"]["parent_uuid"] = parent.value();
                    postObject["logical-interface"]["name"] = actName;
                    postObject["logical-interface"]["display_name"] = name;
                    postObject["logical-interface"]["logical_interface_vlan_tag"] = vlan;
                    postObject["logical-interface"]['virtual_machine_interface_refs'] = vmiRefs;
                    postObject["logical-interface"]["logical_interface_type"] = liType;
                    if(mode === 'edit') {
                        postObject["logical-interface"]["uuid"] = gblSelRow.uuid;
                    }
                }
            }
        }
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForCreatePhysicalInterfaces', 'failureHandlerForCreatePhysicalInterfaces', null, null);
    }

    function getMacFromVMIDropdown() {
        var mac;
        var vmiSelItem =  $('#ddVMI').data('contrailCombobox').getSelectedItem();
        if(typeof vmiSelItem === 'object') {
            mac = vmiSelItem.text.trim();
        } else {
            mac = vmiSelItem.trim();
        }
        
        return getMacFromText(mac);
    }
    
    /** Assumes the mac to be in the form "aa:bb:cc:dd:ee:ff (1.1.1.1)" */
    function getMacFromText(mac){
        mac = mac.trim();
        if(mac != null) {
            if(mac.indexOf('(') != -1) {
                mac = mac.split(' ')[0];
            }
        }
        return mac;
    }
    
    function getMacsFromVMIDropdownsInGrid() {
        var macs = [];
        var serverTuples = $("#serverTuples")[0].children;
        var selectedServerDetails = []
        if (serverTuples && serverTuples.length > 0) {
            for(i = 0 ; i< serverTuples.length ; i++){
                var divid = serverTuples[i].id;
                var id = getID(divid);
                var mac;
                var vmiSelItem = $("#serverTuples_"+id+"_serverMac").data("contrailCombobox").getSelectedItem();
                if(typeof vmiSelItem === 'object') {
                    mac = vmiSelItem.text.trim();
                } else {
                    mac = vmiSelItem.trim();
                }
                if(mac != null) {
                    if(mac.indexOf('(') != -1) {
                        mac = mac.split(' ')[0];
                    }
                }
                macs.push(mac);
            }
        }
        return macs;
    }
    

    function isMacsRepeated(macs) {
        var isRepeated = false
        var sorted_macs = macs.sort(); 
        var results = [];
        for ( var i = 0; i < sorted_macs.length - 1; i++) {
            if (sorted_macs[i + 1] == sorted_macs[i]) {
                isRepeated = true
            }
        }
        return isRepeated;
    }

    window.successHandlerForCreatePhysicalInterfaces = function(result) {
        if(mode === 'edit' && JSON.parse(getCookie('bm_clear_vmi'))) {
            deleteVirtulMachineInterfaces(prepareDeletePortListForEdit(), []);
        }
        fetchPhysicalInterfaces();
    }

    window.failureHandlerForCreatePhysicalInterfaces = function(error) {
        fetchPhysicalInterfaces();
        if(vmiDetails.length > 0) {
           deleteVirtulMachineInterfaces(prepareDeletePortListForFailedLI(), []);
        }
    }

    function prepareDeletePortListForEdit() {
        var deleteVMIList = [];
        var serverTuples = $("#serverTuples")[0].children;
        var selectedServerDetails = []
        var extIdList = gblSelRow.vmi_uuid;
        var selVMIList = [];
        if (serverTuples && serverTuples.length > 0) {
            for(var i = 0 ; i< serverTuples.length ; i++){
                var divid = serverTuples[i].id;
                var id = getID(divid);
                var selVMI = $("#serverTuples_"+id+"_serverMac").data("contrailCombobox").getSelectedItem();
                var vmiFQName = null;
                if(typeof selVMI === 'object') {
                    var vmiData = JSON.parse(selVMI.data);
                    selVMIList.push(vmiData.vmi_uuid);
                }
            }
        }
        if(selVMIList.length > 0) {
            for(var i = 0; i < extIdList.length; i++) {
                if($.inArray(extIdList[i], selVMIList) == -1) {
                    deleteVMIList.push(extIdList[i]);
                }
            }
        } else {
            deleteVMIList = extIdList;
        }
        return deleteVMIList;
    }
    
    function prepareDeletePortListForFailedLI() {
        var deleteVMIList = [];
            for(var j = 0; j < vmiDetails.length ; j++){
                if(vmiDetails[j] != null && vmiDetails[j]['virtual-machine-interface'] != null
                    && vmiDetails[j]['virtual-machine-interface']['uuid'] != null) {
                    deleteVMIList.push(vmiDetails[j]['virtual-machine-interface']['uuid']);
                }
            }
        return deleteVMIList;
    }

    function clearCreateEditWindow() {
        $('#ddType').data('contrailDropdown').value('logical');
        $('#txtPhysicalInterfaceName').removeAttr('disabled');
        $('#txtPhysicalInterfaceName').val('');     
        $('#txtVlan').val('');
        $('#txtVlan').removeAttr('disabled');
        var ddPhysicalRouters = $('#ddPhysicalRouters').data('contrailDropdown');        
        $('#ddParent').data('contrailDropdown').value(ddPhysicalRouters.value());
        $('#vmSection').removeClass('hide').addClass('show'); 
        doubleCreation = false;
        $('#ddParent').data('contrailDropdown').enable(true);
        $('#ddType').data('contrailDropdown').enable(true);
        $('#ddLIType').data('contrailDropdown').enable(true);
        $('#ddVN').data('contrailDropdown').value('none');
        $('#ddLIType').data('contrailDropdown').value('l2Server');
        vmiDetails = [];
        flow = null;
        $('#txtSubnet').val('');
//        $('#txtVMI').val('');
//        $('#txtVMI').attr('disabled', 'disabled');
        $('#txtSubnet').attr('disabled', 'disabled');
        $('#l2Server').attr('checked','checked');
        $('#lblServer').text('Server');
        $('#l3SubnetPanel').removeClass('show').addClass('hide');
        $('#l2TypePanel').removeClass('hide').addClass('show');
        $('#l2ServerPanel').removeClass('hide').addClass('show'); 
        fetchVirtualNetworkInternals('none');
        gblSelRow = null;
        clearServerDetailsGrid();
        $('#panel_clear_ports').removeClass('show').addClass('hide');
    }
    
    function clearServerDetailsGrid(){
      //Remove all the rows in the grid.
        $("[id$=serverMac]").remove();
        $("[id$=serverIp]").remove();
        $(".rule-item").remove();
        if($('#ddVN').data('contrailDropdown').value() == 'none'){
            $('#btnAddServer').hide();
        } else {
            $('#btnAddServer').show();
        }
        dynamicID = 0;
    }
    
    function fetchPhysicalRouters() {
        //reading uuid from query string
        var queryParams = window.location.href.split("&");
        if(queryParams != undefined && queryParams.length > 1 && queryParams[1].indexOf('=') != -1) {
            currentUUID = queryParams[1].split('=')[1];  
        }     
        doAjaxCall('/api/tenants/config/physical-routers-list','GET', null, 'successHandlerForPhysicalRouters', 'failureHandlerForPhysicalRouters', null, null);
    }
    window.successHandlerForPhysicalRouters =  function(result) {
        var pRoutersDS = [];
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
        if(result != null && result['physical-routers'].length > 0) {
            var physicalRouters = result['physical-routers'];
            for(var i = 0; i < physicalRouters.length;i++) {
                var physicalRouter = physicalRouters[i];
                pRoutersDS.push({text : physicalRouter.fq_name[1], value : physicalRouter.uuid});
            } 
            pRouterDD.setData(pRoutersDS);
            if(currentUUID) {
                pRouterDD.value(currentUUID);
            } else {
                pRouterDD.value(pRoutersDS[0].value)
                currentUUID = pRouterDD.value();
                //Push query parameter in URL
                layoutHandler.setURLHashParams({uuid:currentUUID},{triggerHashChange:false});
            }
            fetchPhysicalInterfaces();            
        } else {
            pRoutersDS.push({text : 'No Physical Router found', value: 'Message'});
            pRouterDD.setData(pRoutersDS);
            gridPhysicalInterfaces.showGridMessage('empty');
        }
    }
    window.failureHandlerForPhysicalRouters = function(error) {
        gridPhysicalInterfaces.showGridMessage('errorGettingData');
    }
    
    function fetchVirtualNetworks() {
        doAjaxCall('/api/admin/config/get-data?type=virtual-network','GET', null, 'successHandlerForVN', 'failureHandlerForVN', null, null);
    }
    
    window.successHandlerForVN = function(result) {
         var vnDataSrc = [{text : 'None', value : 'none'}];
         if(result != null && result['data'] != null && result['data'].length > 0) {
             var vns =  result['data'];
             for(var i = 0; i < vns.length; i++) {
                 var vn = vns[i]['virtual-network'];
                 var fqn = vn.fq_name;
                 var subnetStr = '';
                 var subnetUUID = '';
                 if('network_ipam_refs' in vn && vn['network_ipam_refs'].length > 0) {
                     var ipamRefs = vn['network_ipam_refs'];
                     subnetUUID = ipamRefs[0].subnet.subnet_uuid;
                     for(var j = 0; j < ipamRefs.length; j++) {
                         if('subnet' in ipamRefs[j]) {
                             if(subnetStr === '') {
                                 subnetStr = ipamRefs[j].subnet.ipam_subnet;
                             } else {
                                 subnetStr += ', ' + ipamRefs[j].subnet.ipam_subnet;
                             }
                         }
                     }
                 }
                 var textVN = fqn[2] + " (" + fqn[0] + ":" + fqn[1] + ")";
                 if(subnetStr != '') {
                     textVN += ' (' + subnetStr + ')';
                     var vnData = {fqName : fqn, subnetId : subnetUUID};
                     vnDataSrc.push({ text : textVN, value : vn.uuid, data : JSON.stringify(vnData)});
                 }
             }
         } else {
             vnDataSrc.push({text : 'No Virtual Network found', value : 'empty'});
         }
         var ddVN = $('#ddVN').data('contrailDropdown');         
         ddVN.setData(vnDataSrc);
         if(gblSelRow != null && gblSelRow.vn != '-') {
             ddVN.value(getCurrentVirtualNetworkId(gblSelRow.vn));
         }
         fetchVirtualNetworkInternals(ddVN.value());
    }
    
    window.failureHandlerForVN = function(error) {
        var r = arguments;
        showInfoWindow(r[0].responseText,r[2])
    }
    
    
    function fetchVirtualNetworkInternals(id) {
        if(id === 'empty' || id === '') {
            if($("[id$=serverMac]").length > 0){
                $("[id$=serverMac]").data('contrailCombobox').setData([{text : 'No Server found', value : 'empty'}]);
                $("[id$=serverMac]").data('contrailCombobox').value('');
                $("[id$=serverMac]").data('contrailCombobox').enable(false);
            }
//            $('#txtVMI').val('');
        } else if(id === 'none') {
            vmiDataSrc = [];
            if($("[id$=serverMac]").length > 0){
                $("[id$=serverMac]").data('contrailCombobox').setData(vmiDataSrc);
                $("[id$=serverMac]").data('contrailCombobox').value('');
                $("[id$=serverMac]").data('contrailCombobox').enable(false);
            }
        } else {
            doAjaxCall('/api/tenants/config/virtual-network-internals/' + id,'GET', null, 'successHandlerForVNInternals', 'failureHandlerForVNInternals', null, null, 300000);
        }
    }
    
    window.successHandlerForVNInternals = function(result) {
        vmiDataSrc = [];
        if(result != null && result.length > 0) {
            for(var i = 0; i < result.length; i++) {
                var vmi = result[i];
                var txt = vmi.mac[0]; //+ ' (' + vmi.ip[0] + ')';
                var fixedIp = vmi.ip != null && vmi.ip.length > 0 ? vmi.ip[0] : '';
                var txtVMI = '';
                if(fixedIp != '') {
                    txtVMI = txt + ' (' + fixedIp + ')';
                } else {
                    txtVMI = txt; 
                }
                vmiDataSrc.push({text : txtVMI, value : JSON.stringify(vmi.vmi_fq_name), ip : fixedIp, data:JSON.stringify(vmi)});
            }
            if ($("[id$=serverMac]").length > 0){
                $("[id$=serverMac]").data('contrailCombobox').setData(vmiDataSrc);
            }
            
            if(flow === 'edit' && gblSelRow != null && gblSelRow.server != '-' && gblSelRow.server != '') {
                var vmiMacs = gblSelRow.server;
                for(var i = 0 ; i < vmiMacs.length; i++){
                    //Append the tuples to the Server Details
                    var rule = vmiMacs[i];
                    dynamicID += 1;
                    var ruleEntry = createServerEntry(rule, dynamicID,"serverTuples",window.serverData);
                    $("#serverTuples").append(ruleEntry);
                }
                $('#txtVMI').attr('disabled', 'disabled');
            } else {
                //TODO In case or edit No server selected so need to remove the grid tuples 
//                $('#ddVMI').data('contrailCombobox').value('');
//                $('#txtVMI').val('');
//                $('#txtVMI').attr('disabled', 'disabled');
            }
        } else {
            if ($("[id$=serverMac]").length > 0){
                $("[id$=serverMac]").data('contrailCombobox').setData(vmiDataSrc);
                $("[id$=serverMac]").data('contrailCombobox').value('');
            }
            $('#txtVMI').val('');
        }       
    }
    
    window.failureHandlerForVNInternals = function(error){
        var r = arguments;
        fetchVirtualNetworks();
    }
    
    function fetchConfigurations() {
        doAjaxCall('/api/admin/webconfig/physicaldevices/interface_delimiters' ,'GET', null, 'successHandlerForConfigurations', 'failureHandlerForForConfigurations', null, null);     
    }
    
    window.successHandlerForConfigurations = function(result) {
        if(result != null && result['interface_delimiters'] != null && result['interface_delimiters'].length > 0) {
            interfaceDelimiters = result['interface_delimiters'];
        }    
    }
    
    window.failureHandlerForForConfigurations = function(error) {
    
    }
    /*start pagination changes*/
    //fetches all physical interfaces first
    function fetchPhysicalInterfaces() {
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');
        ajaxParam = currentUUID;
        pInterfaceDS = [];
        piUUIDList = [];
        doAjaxCall('/api/admin/config/get-data?type=physical-interface&count=50&fqnUUID=' + currentUUID +'&parent=physical-router','GET', null,
        'successHandlerForPhysicalInterfacesNew', 'failureHandlerForPhysicalInterfaces', null, ajaxParam);
    }
    
    window.successHandlerForPhysicalInterfacesNew = function(result, cbparam) {
        if(cbparam != ajaxParam) {
            return;
        }
        if(result.more == true || result.more == "true"){
            doAjaxCall('/api/admin/config/get-data?type=physical-interface&count=50&fqnUUID=' + currentUUID + "&lastKey=" + result.lastKey +'&parent=physical-router','GET', null,
                'successHandlerForPhysicalInterfacesNew', 'failureHandlerForPhysicalInterfaces', null, cbparam);            
        }
        preparePIData(result);
    }
     
    function preparePIData(result) {
        gridPhysicalInterfaces.removeGridMessage();
        var gridDS = [];
        if(result!= null && result.data != null && result.data.length > 0) {
            for(var i = 0; i < result.data.length; i++) {
                var pInterface = result.data[i]['physical-interface'];
                var piName = pInterface.display_name != null ? pInterface.display_name : pInterface.name;
                var lInfs = pInterface["logical_interfaces"];
                var lInterfaceNames = '';
                if(lInfs != null) {
                    piUUIDList.push(pInterface.uuid);
                    for(var j = 0; j < lInfs.length;j++) {
                        var lInterfaceName = lInfs[j].to[3]; 
                        if(lInterfaceNames === ''){
                            lInterfaceNames = lInterfaceName;
                        } else {
                            lInterfaceNames += ',' + lInterfaceName;
                        }
                    }
                }
                pInterfaceDS.push({text : piName, value : pInterface.uuid, parent : 'physical_interface'});
                gridDS.push({
                    uuid : pInterface.uuid,
                    name : piName,
                    type : 'Physical',
                    lInterfaces : lInterfaceNames != '' ? lInterfaceNames : '-',
                    parent : pInterface.fq_name[1],
                    vlan : '-',
                    server : '-',
                    servers_display : '-',        
                    vn : '-',
                    li_type : '-' 
                });
            }
        }
        gridPhysicalInterfaces._dataView.addData(gridDS);
        if(result != null && result.more == true || result.more == "true"){
	       gridPhysicalInterfaces.showGridMessage('loading');
	    } else {
            if(doubleCreation) {
                createUpdatePhysicalInterface()
            } else {            
                fetchLogicalInterfaces();
            }
        }    
    }
    //fetches all logical interfaces under selected physical router 
    function fetchLogicalInterfaces() {
        ajaxParam = currentUUID;
        var uuid = currentUUID;
        var parent = 'physical-router';
        doAjaxCall('/api/admin/config/get-data?type=logical-interface&count=50&fqnUUID=' + uuid +'&parent=' + parent,'GET', null,
        'successHandlerForLI', 'failureHandlerForPhysicalInterfaces', null, ajaxParam);        
    }
     
    window.successHandlerForLI = function(result, cbparam) {
        if(cbparam != ajaxParam) {
            return;
        }
        if(result.more == true || result.more == "true"){
            doAjaxCall('/api/admin/config/get-data?type=logical-interface&count=50&fqnUUID=' + currentUUID + "&lastKey=" + result.lastKey +'&parent=physical-router','GET', null,
                'successHandlerForLI', 'failureHandlerForPhysicalInterfaces', null, cbparam);            
        }
        prepareLIWithProutersData(result);    
    }
    
    function prepareLIWithProutersData(result) {
        prepareLIData(result);
        if(result != null && result.more == true || result.more == "true"){
	       gridPhysicalInterfaces.showGridMessage('loading');
	    } else {
            if(piUUIDList.length > 0) {
                // get the logical interfaces under physical interfaces
                for(var i = 0; i < piUUIDList.length; i++) { 
                    fetchLIWithPI(piUUIDList[i]);
                }
            } else {
                var gridData = gridPhysicalInterfaces._dataView.getItems();
                if(gridData == null || (gridData != null && gridData.length == 0)) {
                    gridPhysicalInterfaces.showGridMessage('empty');
                }
            }
        }        
    }
    
    function prepareLIData(result) {
        gridPhysicalInterfaces.removeGridMessage();
        var gridDS = [];        
        if(result!= null && result.data != null && result.data.length > 0) {
            for(var i = 0; i < result.data.length; i++) {
                var lInterface = result.data[i]['logical-interface'];
                var liName = lInterface.display_name != null ? lInterface.display_name : lInterface.name;
                var liDetails = getLogicalInterfaceDetails(lInterface);
                var parentName = lInterface.parent_type == 'physical-router' ? lInterface.fq_name[1] : lInterface.fq_name[2];
                var serverString = '';
                var vmiDetails = liDetails.vmiDetails;
                if(vmiDetails == null || vmiDetails == '-' || vmiDetails.length < 1){
                    serverString = '-'
                } else {
                    $.each(vmiDetails,function(i,d){
                        if(i == 0){
                            serverString = d; 
                        } else {
                            serverString += '</br>' + d;
                        }
                    });
                }
                gridDS.push({
                    uuid : lInterface.uuid,
                    name : liName,
                    type : 'Logical',
                    parent : parentName,
                    vlan : liDetails.vlanTag != null ? liDetails.vlanTag : '-',
                    server : (liDetails.liType == "L3")? '-' : vmiDetails != null ? vmiDetails : '-',
                    servers_display : serverString,        
                    vn : liDetails.vnRefs != null ? liDetails.vnRefs : '-',
                    li_type : liDetails.liType != null ? liDetails.liType : '-' ,
                    vmi_ip : liDetails.vmiIP != null ? liDetails.vmiIP : '-',
                    vmi_uuid : liDetails.vmiUUID,
                    vm_uuid : liDetails.vmUUID,
                    subnetUUIDArr : liDetails.subnetUUIDArr != null ? liDetails.subnetUUIDArr : '-',
                    subnetCIDRArr : liDetails.subnetCIDRArr != null ? liDetails.subnetCIDRArr : '-'
                }); 
            }
        }
        gridPhysicalInterfaces._dataView.addData(gridDS);
    }
    //fetches all logical interfaces under all physical interfaces
    function fetchLIWithPI(piUUID) {
        ajaxParam = currentUUID;
        var uuid = piUUID;
        var parent = 'physical-interface';
        doAjaxCall('/api/admin/config/get-data?type=logical-interface&count=50&fqnUUID=' + uuid +'&parent=' + parent,'GET', null,
        'successHandlerForLIWithPI', 'failureHandlerForPhysicalInterfaces', null, {ajaxParam : ajaxParam, id : uuid});        
    }
     
    window.successHandlerForLIWithPI = function(result, cbparam) {
        if(cbparam.ajaxParam != ajaxParam) {
            return;
        }
        if(result.more == true || result.more == "true"){
            doAjaxCall('/api/admin/config/get-data?type=logical-interface&count=50&fqnUUID=' + cbparam.id + "&lastKey=" + result.lastKey +'&parent=physical-interface','GET', null,
                'successHandlerForLIWithPI', 'failureHandlerForPhysicalInterfaces', null, {ajaxParam : cbparam.ajaxParam, id : cbparam.id});            
        }
        prepareLIDataWithPI(result);
    }
    function prepareLIDataWithPI(result) {
        prepareLIData(result);
        if(result != null && result.more == true || result.more == "true"){
	       gridPhysicalInterfaces.showGridMessage('loading');
	    } else {
           var gridData = gridPhysicalInterfaces._dataView.getItems();
           if(gridData == null || (gridData != null && gridData.length == 0)) {
              gridPhysicalInterfaces.showGridMessage('empty'); 
           }
        }    
    }
    /*end of pagination changes*/
         
    /*function fetchData() {
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/physical-interfaces/' + currentUUID,'GET', null, 'successHandlerForPhysicalInterfaces', 'failureHandlerForPhysicalInterfaces', null, null, 300000);
    }
    
    window.successHandlerForPhysicalInterfaces =  function(result) {
        var gridDS = [];
        var mainDS = [];
        var pRouterDS = [];
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
        var ddParent = $('#ddParent').data('contrailDropdown');
        var pInterfaceDS = [{text : 'Enter or Select a Interface', value : 'dummy', disabled : true}];
        pRouterDS.push({text : 'Select the Router', value : 'dummy', disabled : true},
            {text : pRouterDD.text(), value : pRouterDD.value(), parent : 'physical_router'});
        if(result && result.length > 0) {
            var pInterfaces = result;
            for(var i = 0; i < pInterfaces.length;i++) {
                var pInterface , infType;
                var liDetails = {};
                if(pInterfaces[i]['physical-interface'] != null) { 
                    pInterface = pInterfaces[i]['physical-interface'];
                    infType = "Physical";
                } else {
                    pInterface = pInterfaces[i]['logical-interface'];
                    infType = "Logical";
                    liDetails = getLogicalInterfaceDetails(pInterface);                     
                }
                var piName = pInterface.display_name != null ? pInterface.display_name : pInterface.name;
                var serverString = '';
                var vmiDetails = liDetails.vmiDetails;
                if(vmiDetails == null || vmiDetails == '-' || vmiDetails.length < 1){
                    serverString = '-'
                } else {
                    $.each(vmiDetails,function(i,d){
                        if(i == 0){
                            serverString = d; 
                        } else {
                            serverString += '</br>' + d;
                        }
                    });
                }
                gridDS.push({
                    uuid : pInterface.uuid,
                    name : piName,
                    type : infType,
                    parent : pInterface.fq_name[1],
                    vlan : liDetails.vlanTag != null ? liDetails.vlanTag : '-',
                    server : (liDetails.liType == "L3")? '-' : vmiDetails != null ? vmiDetails : '-',
                    servers_display : serverString,        
                    vn : liDetails.vnRefs != null ? liDetails.vnRefs : '-',
                    li_type : liDetails.liType != null ? liDetails.liType : '-' ,
                    vmi_ip : liDetails.vmiIP != null ? liDetails.vmiIP : '-',
                    vmi_uuid : liDetails.vmiUUID,
                    vm_uuid : liDetails.vmUUID,
                    subnetUUIDArr : liDetails.subnetUUIDArr != null ? liDetails.subnetUUIDArr : '-',
                    subnetCIDRArr : liDetails.subnetCIDRArr != null ? liDetails.subnetCIDRArr : '-'
                });
                var lInterfaces = pInterfaces[i]['physical-interface'] ? pInterfaces[i]['physical-interface']['logical_interfaces'] : null;
                var lInterfaceNames = '';
                var infDS = [];
                if(lInterfaces != null && lInterfaces.length > 0) {
                    for(var j = 0; j < lInterfaces.length; j++) {
                        var lInterface = lInterfaces[j]['logical-interface'];
                        var lInterfaceName = lInterface.display_name ? lInterface.display_name : lInterface.name;
                        if(lInterfaceNames === ''){
                            lInterfaceNames = lInterfaceName;
                        } else {
                            lInterfaceNames += ',' + lInterfaceName;
                        }
                        liDetails = getLogicalInterfaceDetails(lInterface);
                        var serverString = '';
                        var vmiDetails = liDetails.vmiDetails;
                        if(vmiDetails == null || vmiDetails == '-' || vmiDetails.length < 1){
                            serverString = '-'
                        } else {
                            $.each(vmiDetails,function(i,d){
                                if(i == 0){
                                    serverString = d; 
                                } else {
                                    serverString += '</br>' + d;
                                }
                            });
                        }
                        var liName = lInterface.display_name ? lInterface.display_name : lInterface.name;
                        infDS.push({
                            uuid : lInterface.uuid,
                            name : liName,
                            type : "Logical",
                            parent : piName,
                            vlan : liDetails.vlanTag,
                            server : (liDetails.liType == "L3")? '-' : vmiDetails,
                            servers_display : serverString,
                            vn : liDetails.vnRefs,
                            li_type : liDetails.liType,
                            vmi_ip : liDetails.vmiIP,
                            vmi_uuid : liDetails.vmiUUID,
                            vm_uuid : liDetails.vmUUID,
                            subnetUUIDArr : liDetails.subnetUUIDArr != null ? liDetails.subnetUUIDArr : '-',
                            subnetCIDRArr : liDetails.subnetCIDRArr != null ? liDetails.subnetCIDRArr : '-'
                        });                        
                    }
                    var currPhysicalInfRow = getCurrentPhysicalInfRow(gridDS, pInterface.uuid);
                    if(currPhysicalInfRow != '') {
                        currPhysicalInfRow['lInterfaces'] = lInterfaceNames;
                    }                    
                    gridDS = gridDS.concat(infDS);
                }
            }
            
            for(var i = 0; i < gridDS.length; i++) {
                if(gridDS[i].type === 'Physical') {
                    pInterfaceDS.push({text : gridDS[i].name, value : gridDS[i].uuid, parent : 'physical_interface'});
                }
            }
            mainDS.push({text : 'Physical Router', id : 'physical_router', children : pRouterDS},
                {text : 'Physical Interface', id : 'physical_interface', children : pInterfaceDS});
            dsSrcDest = mainDS;
            if(doubleCreation) {
                createUpdatePhysicalInterface();
            } else {    
                //set parent drop down data here
                ddParent.setData(mainDS);
            }
        } else {
            mainDS.push({text : 'Physical Router', id : 'physical_router', children : pRouterDS}, 
                {text : 'Physical Interface', id : 'physical_interface', children : pInterfaceDS
                });
            dsSrcDest = mainDS;
            ddParent.setData(mainDS);    
            ddParent.value(mainDS[0].children[0].value);
            gridPhysicalInterfaces.showGridMessage("empty");
        }
        gridPhysicalInterfaces._dataView.setData(gridDS); 
    }*/
    
    function prepareAccordionData() {
        var mainDS = [];
        var pRouterDS = [];
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
        var ddParent = $('#ddParent').data('contrailDropdown');
        var firstItem = {text : 'Enter or Select a Interface', value : 'dummy', disabled : true};
        if(pInterfaceDS.length == 0 ||(pInterfaceDS.length > 0 && pInterfaceDS[0].value != 'dummy')) {
            pInterfaceDS.unshift(firstItem);
        }
        pRouterDS.push({text : 'Select the Router', value : 'dummy', disabled : true},
            {text : pRouterDD.text(), value : pRouterDD.value(), parent : 'physical_router'});
            mainDS.push({text : 'Physical Router', id : 'physical_router', children : pRouterDS},
                {text : 'Physical Interface', id : 'physical_interface', children : pInterfaceDS});
        dsSrcDest = mainDS;
        //set parent drop down data here
        ddParent.setData(mainDS);
        ddParent.value(mainDS[0].children[1].value);
    }
    
   
    function fetchVMIDetails(id) {
        doAjaxCall('/api/tenants/config/virtual-machine-interface-details/' + id,'GET', null, 'successHandlerForVMIDetails', 'failureHandlerForVMIDetails', null, null);
    }
    
    window.successHandlerForVMIDetails = function(result) {
    
    }
    
    window.failureHandlerForVMIDetails =  function(error) {
    }
    
    function getCurrentPhysicalInfRow(dataSrc,id) {
        for(var i = 0; i < dataSrc.length; i++) {
            if(dataSrc[i].uuid === id) {
                return dataSrc[i];
            }
        }
        return '';         
    }
    
    function getLogicalInterfaceDetails(inf) {
        var vnRefs = '-';
        var vlanTag = inf['logical_interface_vlan_tag'] != null ? inf['logical_interface_vlan_tag'] : '-' ;
        var liType = inf['logical_interface_type'] != null ? inf['logical_interface_type'] : '-' ;
        var vmiIP = '-' ;
        var vmiIPs = [];
        if(liType != '-') {
            liType = liType === 'l2' ? 'L2' : 'L3';
        }
        var vmiDetails = '-';
        var vmiDetailsArray = [];
        var vmiUUID = [], vmUUID = [];
        if(inf['vmi_details'] != null) {
            for(var i =0; i < inf['vmi_details'].length ; i++){
                var vmiDetail = inf['vmi_details'][i];
                if(vmiDetail != null) {
                    var macAddr = vmiDetail.mac[0] != null ? vmiDetail.mac[0].trim() : '';
                    if(vmiDetail.ip[0] != null) {
                        vmiIP = vmiDetail.ip[0].trim();
                        vmiIPs.push(vmiIP);
                        vmiDetails = macAddr +' ('+ vmiIP + ')';
                    } else {
                        vmiDetails = macAddr;
                    }
                    vmiDetailsArray.push(vmiDetails);
                    vmiUUID.push(vmiDetail['vmi_uuid']);
                    vmiDetail['vm_refs'][0] != null ? vmUUID.push(vmiDetail['vm_refs'][0].to[0]) : null;
                }
            }
        }
        
        var subnetCIDRArr = [];
        var subnetUUIDArr = [];
        var subnet = '-';
        if(vmiDetails != '-') {
            vnRefs = vmiDetail['vn_refs'] ? vmiDetail['vn_refs'][0].to : '-';
            if(vnRefs != '-') {
                vnRefs = vnRefs[2] + ' (' + vnRefs[0] + ':' + vnRefs[1] + ')';
            }
            if(vmiDetail['subnet'] != null && vmiDetail['subnet'] != '' && vmiDetail['subnet'].length > 0){
                for(var i = 0 ;i < vmiDetail['subnet'].length ; i++){
                    var subnetCidr = vmiDetail['subnet'][i]['subnetIPPrefix'];
                    subnetCIDRArr.push(subnetCidr['ip_prefix'] + '/' + subnetCidr['ip_prefix_len']);
                    subnetUUIDArr.push(vmiDetail['subnet'][i]['subnetUUID']);
                }
            }
        }
        
        return { vlanTag : vlanTag, liType : liType, vmiDetails : vmiDetailsArray, vnRefs : vnRefs,
            vmiIP : vmiIPs, vmiUUID : vmiUUID, vmUUID : vmUUID, subnetCIDRArr : subnetCIDRArr, subnetUUIDArr:subnetUUIDArr};
    }
    
    window.failureHandlerForPhysicalInterfaces =  function(error) {
         gridPhysicalInterfaces.showGridMessage("errorGettingData");
    }
    
    function validate() {
        var name = $('#txtPhysicalInterfaceName').val().trim();
        if(name  === ""){	
            showInfoWindow("Enter Interface Name","Input required");
            return false;
        }
        var selVN = $('#ddVN').data('contrailDropdown').text();
        var subNetArry = selVN.split(' ');
        var l2Type = $('input[name=l2Type]:checked').val();
        var isIPinRange = true;
        var subNets = [];
        if(subNetArry.length > 2) {
            for(var i = 2; i < subNetArry.length; i++) {
                if(subNetArry[i] != undefined) {
                    subNets.push(subNetArry[i].replace('(', '').replace(')', '').replace(',','').trim());                    
                }
            }
        }
        //Get all the ips in the grid and verify if the fall in the vn ip subnet range.
        var ipFields = $("[id$=serverIp]");
        for(var i = 0; i < ipFields.length ;i++){
            var ip = $(ipFields[i]).val();
            if(!$(ipFields[i]).is('[disabled]') && ip != ''){
                if(!isValidIP(ip)){
                    showInfoWindow('Invald IP ' + ip , "Invalid input in Server Details");
                    return false;
                }
                var isInSubnetRange = false;
                for(var j =0 ; j < subNets.length; j++){
                    if(isIPBoundToRange(subNets[j], ip)){
                        isInSubnetRange = true;
                        break;
                    }
                }
                if(!isInSubnetRange){
                    showInfoWindow(ip + ' is not in the CIDR ' + subNets, "Invalid input in Server Details");
                    return false;
                }
            }
        }
        
        if($('#txtVlan').val() != '') {
            var vlan = parseInt($('#txtVlan').val().trim());
            //vlan should be in the range 0 - 4094 (0 is untagged and 4095 is reserved - total 4096)
            if(isNaN(vlan) || vlan < 0 || vlan > 4094) {
                showInfoWindow('Vlan ID should be in  "0 - 4094" range', "Input required");
                return false;            
            }
        }
        var liType = $('#ddLIType').data('contrailDropdown').value();
        
        if(liType === 'l3') {
            //Check if the subnet given is valid in case of l3
            var subnet =  $('#txtSubnet').val().trim();
            if(selVN == 'None'){
                showInfoWindow("Please select a Virtual Network ", "Input required");
                return false;
            } else if(selVN != 'None' && subnet.split("/").length != 2) {
                showInfoWindow("Enter a valid Subnet in xxx.xxx.xxx.xxx/xx ", "Invalid input in Subnet");
                return false;
            }
        } else if(liType === 'l2Server') {
            //Get all the macs in the grid an verify if they are valid
            var macAddresses = getMacsFromVMIDropdownsInGrid();
            if(isMacsRepeated(macAddresses)){
                showInfoWindow("Please enter different MAC Addresses", "Invalid input in Server Details");
                return false;
            }
            if(selVN != 'None') {
                if(macAddresses.length < 1){
                    showInfoWindow("Enter a valid MAC Address", "Invalid input in Server Details");
                    return false;
                }
                for(var i=0; i < macAddresses.length ;i++){
                    if(isValidMACAddress(macAddresses[i]) == false){
                        showInfoWindow("Enter a valid MAC Address", "Invalid input in Server Details");
                        return false;
                    }
                }
            }
        } else if(liType === 'l2Gateway') {
            if(selVN == 'None'){
                showInfoWindow("Please select a Virtual Network", "Input required");
                return false;
            }
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
        var ddPhysicalRouters = $("#ddPhysicalRouters").data("contrailDropdown");
        if(isSet(ddPhysicalRouters)) {
           ddPhysicalRouters.destroy(); 
           ddPhysicalRouters = $();
        }        
    }
    
    function select2Query(query) {
        //using predefined process method to make work select2 selection
        var t = query.term,filtered = { results: [] }, process;
        process = function(datum, collection) {
            var group, attr;
            datum = datum[0];
            if (datum.children) {
                group = {};
                for (attr in datum) {
                    if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                }
                group.children=[];
                $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                if (group.children.length || query.matcher(t, '', datum)) {
                    collection.push(group);
                }
            } else {
                if (query.matcher(t, '', datum)) {
                    collection.push(datum);
                }
            }
        };  
        if(t != ""){            
            $(dsSrcDest).each2(function(i, datum) { process(datum, filtered.results); })
        }
    
        var data = {results: []};
        var grpName = 'physical_interface';//getSelectedGroupName();    
        if(query.term != undefined && query.term != "") {
            data.results.push({ id : query.term, text : query.term, parent : 'physical_interface'});
            this.data = [];
            $.extend(true, this.data, dsSrcDest);
            for(var i = 0; i < this.data.length;i++) {
                var children = [] ;
                $.extend(true, children, this.data[i].children);;
                for(var j = 0; j < children.length; j++) {
                    if(children[j].text.indexOf(query.term) == -1 && children[j].disabled != true) {
                        var newIndex = getIndexOf(this.data[i].children, children[j].value); 
                        this.data[i].children.splice(newIndex, 1);
                    }
                }
                data.results.push(this.data[i]);
            }
            addNewTermDataSource(grpName, query.term, data.results); 
        } else{
            data.results = dsSrcDest;
        }
        query.callback(data);
        //set focus for a searched item
        setFocusSelectedItem(grpName, query.term, data.results); 
        
        //hide inbuilt select2 search results for custom term 
        $('.select2-results > .select2-results-dept-0.select2-result-selectable').attr('style','display:none');            
        
        var subEleArry = $(".select2-result-sub");
        if(subEleArry && subEleArry.length > 0) {
            $(subEleArry[0]).attr('style','max-height:150px;overflow:auto;');
            $(subEleArry[1]).attr('style','max-height:150px;overflow:auto;');
            $(subEleArry[2]).attr('style','max-height:150px;overflow:auto;'); 
        } 
        retainExpandedGroup();
            
        if($(".select2-result-label") && $(".select2-result-label").length > 0) {
            $('.select2-results>.select2-results-dept-0>.select2-result-label').attr('style','background-color:#E2E2E2;margin-top:2px;');
            $(".select2-result-label").on('click', function() {
                if($(this).parent().hasClass('select2-disabled')) {
                    return;
                }
                $('.select2-result-sub').addClass('hide');
                $(this).parent().find('.select2-result-sub').removeClass('hide');
            });
        }
    } 
    
    function setFocusSelectedItem(grpName, term, data) {
        for(var i = 0; i < data.length ; i++) {
            if(data[i].text === grpName &&  data[i].children.length === 2) {
                $($('div:contains('+ term +')').parent()).addClass('select2-highlighted');
                break;            
            }
        }
    }

    function retainExpandedGroup() {
        var subEleArry = $(".select2-result-sub");
        if(subEleArry && subEleArry.length > 0) {
            subEleArry.addClass('hide');
            var grpName = 'physical_interface';
            var subEle = $(subEleArry[1]);
            switch(grpName) {
                case 'physical_router' :
                    subEle = $(subEleArry[0]);
                    break;   
                case 'physical_interface' :
                    subEle = $(subEleArry[1]);        
                    break;  
            }
            subEle.removeClass('hide');
        }
    }

    function addNewTermDataSource(grpName, term, data) {
        var newItem = {id : term, text : term, parent : grpName};
        for(var i = 0; i < data.length ; i++) {
            if(data[i].text === grpName &&  data[i].children.length === 1) {
                data[i].children.push(newItem);
                break;            
            }
        }   
    }
    
    function getIndexOf(arry, txt) {
        for(var i = 0; i < arry.length; i ++) {
            if(arry[i].value === txt) {
                return i;
            }
        }   
        return 0;
    } 
    
    function isItemExists(txt, data) {
        var isThere = false;
        for(var i = 0; i < data.length; i++) {
            if(data[i].children != null) {
               for(var j = 0; j < data[i].children.length; j++) {
                   if(txt === data[i].children[j].text) {
                       return true;
                   }    
               }
            } else {
               if(txt === data[i].text) {
                   return true;     
               } 
            }
        }
        return isThere;    
    }
    
    function verifySetSelectedItem(selTxt, dropDown) {
        if(!isItemExists(selTxt, dsSrcDest)) {
            addNewItemMainDataSource(selTxt, dsSrcDest);
            dropDown.setData(dsSrcDest);
            dropDown.text(selTxt); 
            removeNewItemMainDataSource(selTxt);
        } else {
            dropDown.text(selTxt);         
        }
    }
 
    function addNewItemMainDataSource(txt, data) {
        var grpName = "physical_interface";
        var grpTxt = "Physical Interface"
        for(var i = 0; i < data.length; i++) {
            if(data[i].text === grpTxt) {
                data[i].children.push({text : txt, value : txt, parent : grpName});
                break;
            } 
        }         
    }

    function removeNewItemMainDataSource(txt) {
        var grpName = "physical_interface";
        var grpTxt = "Physical Interface"
        for(var i = 0; i < dsSrcDest.length; i++) {
            if(dsSrcDest[i].text === grpTxt) {
                var remItemIndex = getIndexOf(dsSrcDest[i].children, txt); 
                dsSrcDest[i].children.splice(remItemIndex, 1);
                break;
            } 
        }  
    }
    
    function loadSelect2OpenActions() {
        $('.select2-results').attr('style','max-height:400px;');
    }
    
    //Handler for change 
    function onServerMacChange(){
        var vmiComboId = $(this.parentElement.parentElement).find('input').attr('id');
        var id = vmiComboId.split('_')[1];
        var ipObj = $("#serverTuples_"+id+"_serverMac").data('contrailCombobox').getSelectedItem();
        if(typeof ipObj === 'object') {
            if(ipObj.ip != null) {
                $("#serverTuples_"+id+"_serverIp").val(ipObj.ip);
            } else {
                $("#serverTuples_"+id+"_serverIp").val('');
            }
            $("#serverTuples_"+id+"_serverIp").attr('disabled','disabled');
        } else {
            $("#serverTuples_"+id+"_serverIp").val('');
            $("#serverTuples_"+id+"_serverIp").removeAttr('disabled');
        }
        if($("#serverTuples_"+id+"_serverIp").is('[disabled]') && $("#serverTuples_"+id+"_serverIp").val() === "") {
            $("#serverTuples_"+id+"_serverIp").val(' ');
        }
    }
    
    //Creates the html elements for new rows
    function createServerEntry(rule, id, element,serverData) {

        var selectDivServerMac = document.createElement("div");
        selectDivServerMac.className = "span5 pull-left";
        var selectServerMac = document.createElement("input");
        selectServerMac.className = "span12";
        selectServerMac.setAttribute("id",element+"_"+id+"_"+"serverMac");
        selectServerMac.setAttribute("onchange","onServerMacChange("+id+")");
        selectDivServerMac.appendChild(selectServerMac);
        
        var inputIP = document.createElement("input");
        inputIP.type = "text";
        inputIP.className = "span12";
        inputIP.setAttribute("placeholder", "Auto Allocate or Enter an IP");
        inputIP.setAttribute("id",element+"_"+id+"_"+"serverIp");
        var divRowFluidServerIp = document.createElement("div");
        divRowFluidServerIp.className = "span5";
        divRowFluidServerIp.appendChild(inputIP);

        var divPlusMinus =  document.createElement("div");
        divPlusMinus.className = 'span2 pull-right';
        var iBtnAddRule = document.createElement("i");
        iBtnAddRule.className = "icon-plus";
        iBtnAddRule.setAttribute("title", "Add server details below");
        $(iBtnAddRule).click(function() {
          appendServerEntry(this, false);
        });

        var divPullLeftMargin5Plus = document.createElement("div");
        divPullLeftMargin5Plus.className = "pull-right margin-5";
        divPullLeftMargin5Plus.appendChild(iBtnAddRule);

        var iBtnDeleteRule = document.createElement("i");
        iBtnDeleteRule.className = "icon-minus";
        iBtnDeleteRule.setAttribute("title", "Delete server");
        $(iBtnDeleteRule).click(function() {
            deleteServerEntry(this);
          });

        var divPullLeftMargin5Minus = document.createElement("div");
        divPullLeftMargin5Minus.className = "pull-right margin-5";
        divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

//        divPlusMinus.appendChild(divPullLeftMargin5Plus);
//        divPlusMinus.appendChild(divPullLeftMargin5Minus);
        
        var divRowFluidMargin10 = document.createElement("div");
        divRowFluidMargin10.className = "row-fluid margin-0-0-5";
        divRowFluidMargin10.appendChild(selectDivServerMac);
        divRowFluidMargin10.appendChild(divRowFluidServerIp);
//        divRowFluidMargin10.appendChild(divPlusMinus);
        divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
        divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

        var rootDiv = document.createElement("div");
        rootDiv.id = element+"_"+id+"_"+"rule";
        rootDiv.className = 'rule-item';
        rootDiv.appendChild(divRowFluidMargin10);

        $(selectServerMac).contrailCombobox({
            dataTextField:"text",
            dataValueField:"value",
            dataSource: vmiDataSrc,
            placeholder: 'Enter or Choose mac',
            change: onServerMacChange
        });
        $(selectServerMac).data("contrailCombobox").setData(vmiDataSrc);
        $(selectServerMac).data("contrailCombobox").text("");
        
        if (null !== rule && typeof rule !== "undefined") {//edit
            var formatedRuleData = formatRule(rule);
            var selectedMac = formatedRuleData.mac;
            if(formatedRuleData.ip != null && formatedRuleData.ip != '-' && formatedRuleData.ip != ''){
                selectedMac = selectedMac + ' (' + formatedRuleData.ip + ')';
            }
            $(selectServerMac).data("contrailCombobox").value(selectedMac);
            if(formatedRuleData.ip != null && formatedRuleData.ip != '-' && formatedRuleData.ip != ''){
                $(inputIP).val(formatedRuleData.ip);
            } else {
                $(inputIP).val(' ');
            }
            $(inputIP).attr('disabled', 'disabled');
        }
        return rootDiv;
    }

    //Function to Append a tuple/row in the Server Details row
    function appendServerEntry(who, defaultRow) {
        dynamicID += 1;
        var ruleEntry = createServerEntry(null, dynamicID, "serverTuples",window.serverData);
        if (defaultRow) {
            $("#serverTuples").prepend($(ruleEntry));
        } else {
            var parentEl = who.parentNode.parentNode.parentNode;
            parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
        }
        scrollUp("#addPhysicalInterfaceWindow",ruleEntry,false);
    }
    
    function deleteServerEntry(who) {
        var templateDiv = who.parentNode.parentNode.parentNode;
        $(templateDiv).remove();
        templateDiv = $();
    }
    //Function to split the mac and the ip given the server details
    //Expecting the rule to be in the format "aa:bb:cc:dd:ee:ff (1.1.1.1)"
    function formatRule(rule){
        var parts = rule.trim().split(' ');
        return {"mac":parts[0], "ip":parts[1] != null ? parts[1].replace(')','').replace('(','') : ''};
    }
 }
