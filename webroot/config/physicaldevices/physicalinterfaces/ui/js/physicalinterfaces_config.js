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
    var vmiDetails = null;
    var flow = null;
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
        fetchVirtualNetworks();
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
        ddLIType.setData([{text : 'L2', value : 'l2'}, {text : 'L3', value : 'l3'}]);
        ddLIType.value('l2');
         
         $('#ddVN').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onVNSelChange,
            minimumResultsForSearch : 1
        });         

        // $('#ddVMI').contrailDropdown({
            // dataTextField:'text',
            // dataValueField:'value',
            // minimumResultsForSearch : 1
        // }); 

        $('#ddVMI').contrailCombobox({
            dataTextField:'text',
            dataValueField:'value',
            change : onVMISelChanges,
            placeholder : 'Enter or Select a Server'
        });         
        
        //initializing add record window	  	
        $('#addPhysicalInterfaceWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Add Interface');
        
        //initializing delete record window
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');
        collapseElement('#vmSection','#infWidget');
        $('#ddParent').data('contrailDropdown').enable(false);
    }
    
    function onPhysicalRouterSelChange(e) {
         currentUUID = e.added.value;
         fetchData();
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
        fetchVirtualNetworkInternals(id);
    }
    
    function onVMISelChanges(e) {
        var ipObj = $('#ddVMI').data('contrailCombobox').getSelectedItem();
        if(typeof ipObj === 'object') {
            $('#txtVMI').val(ipObj.ip);
              $('#txtVMI').attr('disabled','disabled');
        } else {
            $('#txtVMI').val('');
            $('#txtVMI').removeAttr('disabled');
        }
    }
    
    function onLITypeChange(e) {
        var id = e.added.value;
        if(id === 'l2') {
             $('#l3SubnetPanel').removeClass('show').addClass('hide');
             $('#l2TypePanel').removeClass('hide').addClass('show');
             $('#l2ServerPanel').removeClass('hide').addClass('show');
        } else if(id === 'l3') {
            $('#l2TypePanel').removeClass('show').addClass('hide');
            $('#l2ServerPanel').removeClass('show').addClass('hide');
            $('#l3SubnetPanel').removeClass('hide').addClass('show');
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
                var isVMICreate = !$('#txtVMI').is('[disabled]');
                if(isVMICreate) {
                    var postObject;
                    if($('#txtVMI').val() != '') {                    
                        postObject = {"vnUUID": $('#ddVN').data('contrailDropdown').value(), "fixedIPs":[$('#txtVMI').val()], "macAddress":$('#ddVMI').data('contrailCombobox').value()};
                    } else {
                        postObject = {"vnUUID": $('#ddVN').data('contrailDropdown').value(), "macAddress":$('#ddVMI').data('contrailCombobox').value()};
                    }                    
                    doAjaxCall('/api/tenants/config/create-port', 'POST', JSON.stringify(postObject), 'successHandlerForVMICreation', 'failureHandlerForVMICreation', null, null);   
                } else {
                    createUpdatePhysicalInterface(); 
                }
            }
        });
        window.successHandlerForVMICreation = function(result) {
            if(result != null) {
                vmiDetails = result;
                createUpdatePhysicalInterface();   
            }
        }

        window.failureHandlerForVMICreation = function(error) {
        
        }
        
        $('#btnDeletePhysicalInterface').click(function(){
             $('#confirmMainDelete').modal('show');
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
                      verifySetSelectedItem(physicalInfName, $('#ddParent').data('contrailDropdown'));
                  } else {
                     $('#ddParent').data('contrailDropdown').value(dsSrcDest[0].children[1].value); 
                  }
              }
        });
        $('input[type=radio][name=l2Type]').on('change', function(e){
            if(e.target.value === 'l2Server') {
                $('#lblServer').text('Server');
            } else if(e.target.value === 'l2Gateway') {
                $('#lblServer').text('L2 Gateway');
            }
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
                    url:'/api/tenants/config/physical-interface/' + currentUUID + '/' + sel_row_data['type'] + '/' + sel_row_data['uuid'],
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
        $('#addPhysicalInterfaceWindow').find(".modal-header-title").text('Edit Interface');
        populateCreateEditWindow('edit');
    }
    
    function populateCreateEditWindow(m) {
        mode = m;
        clearCreateEditWindow();
        if(mode === 'edit') {
            $('#txtPhysicalInterfaceName').val(gblSelRow.name);
            $('#txtPhysicalInterfaceName').attr('disabled','disabled');
            $('#ddParent').data('contrailDropdown').enable(true);
            $('#ddParent').data('contrailDropdown').text(gblSelRow.parent);
            $('#ddParent').data('contrailDropdown').enable(false);            
            $('#ddType').data('contrailDropdown').text(gblSelRow.type);             
            $('#ddType').data('contrailDropdown').enable(false);
            if(gblSelRow.type === 'Logical') {
                 flow = 'edit';
                 $('#vmSection').removeClass('hide').addClass('show');
                 if(gblSelRow.vlan != "-") {
                     $('#txtVlan').val(gblSelRow.vlan);
                 }    
                 if(gblSelRow.vn != '-') {
                     var ddVN = $('#ddVN').data('contrailDropdown');
                     ddVN.value(getCurrentVirtualNetworkId(gblSelRow.vn));
                     fetchVirtualNetworkInternals(ddVN.value());
                 }
                 if(gblSelRow.li_type != '-') {
                     $('#ddLIType').data('contrailDropdown').text(gblSelRow.li_type);
                 }
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
        var data = $('#ddVMI').data('contrailCombobox').getAllData();
        for(var i = 0; i < data.length; i++) {
            if(data[i].text.indexOf(name) !== -1) {
                return data[i].id;
            }    
        }
        return '';
    }
        
    function createUpdatePhysicalInterface() {
        var methodType = 'POST';
        var infType = $('#ddType').data('contrailDropdown').text();
        var url = '/api/tenants/config/physical-interfaces/' + currentUUID + '/' + infType;
        if(mode === 'edit') {
            methodType = 'PUT';
            url = '/api/tenants/config/physical-interface/' + currentUUID + '/' + gblSelRow.type + '/' + gblSelRow.uuid
        }
        var type = $("#ddType").data('contrailDropdown').value();
        var name = $("#txtPhysicalInterfaceName").val();
        var vlan =  $("#txtVlan").val() === '' ? 0 : parseInt($("#txtVlan").val());
        var pRouterDD = $('#ddPhysicalRouters').data('contrailDropdown');
        var postObject = {};
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');    
        if(infType === 'Physical') {
            postObject["physical-interface"] = {};
            postObject["physical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), name];
            postObject["physical-interface"]["parent_type"] = "physical-router";
            postObject["physical-interface"]["name"] = name;
        } else {
            var liType = $('#ddLIType').data('contrailDropdown').value();
            var parent = $('#ddParent').data('contrailDropdown');
            //var ddVMIValue = $('#ddVMI').data('contrailDropdown').value();
            var ddVMIValue = getCurrentVMIId($('#ddVMI').data('contrailCombobox').text());
            var vmiData = 'none';
            if(vmiDetails != null) {
                vmiData = vmiDetails['virtual-machine-interface']['fq_name'];
            } else {
                vmiData = ddVMIValue === 'none' || ddVMIValue == 'empty' || ddVMIValue == '' ? 'none' : JSON.parse(ddVMIValue);
            }
            if(pRouterDD.value() === parent.value()) {
                postObject["logical-interface"] = {};
                postObject["logical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), name];
                postObject["logical-interface"]["parent_type"] = "physical-router";
                postObject["logical-interface"]["name"] = name;
                postObject["logical-interface"]["logical_interface_vlan_tag"] = vlan;
                if(vmiData != 'none') {
                    postObject["logical-interface"]['virtual_machine_interface_refs'] = [{"to" : [vmiData[0], vmiData[1], vmiData[2]]}];
                } else {
                    postObject["logical-interface"] ['virtual_machine_interface_refs'] = [];
                }
                postObject["logical-interface"]["logical_interface_type"] = liType;
            } else {
                if(!isItemExists(parent.text(), dsSrcDest)) {
                    doubleCreation = true;
                    postObject["physical-interface"] = {};
                    postObject["physical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), parent.text()];
                    postObject["physical-interface"]["parent_type"] = "physical-router";
                    postObject["physical-interface"]["name"] = parent.text();   
                    url = '/api/tenants/config/physical-interfaces/' + currentUUID + '/Physical';                 
                } else {
                    doubleCreation = false;
                    postObject["logical-interface"] = {};
                    postObject["logical-interface"]["fq_name"] = ["default-global-system-config", pRouterDD.text(), parent.text() , name];
                    postObject["logical-interface"]["parent_type"] = "physical-interface";
                    postObject["logical-interface"]["parent_uuid"] = parent.value();
                    postObject["logical-interface"]["name"] = name;  
                    postObject["logical-interface"]["logical_interface_vlan_tag"] = vlan;
                    if(vmiData != 'none') {
                        postObject["logical-interface"]['virtual_machine_interface_refs'] = [{"to" : [vmiData[0], vmiData[1], vmiData[2]]}];
                    } else {
                        postObject["logical-interface"] ['virtual_machine_interface_refs'] = [];
                    }
                    postObject["logical-interface"]["logical_interface_type"] = liType;
                }
            }
        }
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalInterfaces', 'failureHandlerForPhysicalInterfaces', null, null);
    }
    
    function clearCreateEditWindow() {
        $('#ddType').data('contrailDropdown').value('logical');
        $('#txtPhysicalInterfaceName').removeAttr('disabled');
        $('#txtPhysicalInterfaceName').val('');     
        $('#txtVlan').val('');
        var ddPhysicalRouters = $('#ddPhysicalRouters').data('contrailDropdown');        
        $('#ddParent').data('contrailDropdown').value(ddPhysicalRouters.value());
        $('#vmSection').removeClass('hide').addClass('show'); 
        doubleCreation = false;
        $('#ddParent').data('contrailDropdown').enable(true);
        $('#ddType').data('contrailDropdown').enable(true);
        $('#ddVN').data('contrailDropdown').value('none');
        // $('#ddVMI').data('contrailDropdown').value('none');
        $('#ddVMI').data('contrailCombobox').value('none');
        $('#ddLIType').data('contrailDropdown').value('l2');
        vmiDetails = null;
        flow = null;
        $('#txtVMI').val('');
        $('#txtVMI').attr('disabled', 'disabled');
        $('#l2Server').attr('checked','checked');
        $('#lblServer').text('Server');
        $('#l3SubnetPanel').removeClass('show').addClass('hide');
        $('#l2TypePanel').removeClass('hide').addClass('show');
        $('#l2ServerPanel').removeClass('hide').addClass('show'); 
        fetchVirtualNetworkInternals('none');        
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
                 if('network_ipam_refs' in vn) {
                     var ipamRefs = vn['network_ipam_refs'];
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
                 }
                 vnDataSrc.push({ text : textVN, value : vn.uuid});
             }
         } else {
             vnDataSrc.push({text : 'No Virtual Network found', value : 'empty'});
         }
         var ddVN = $('#ddVN').data('contrailDropdown');         
         ddVN.setData(vnDataSrc);
         fetchVirtualNetworkInternals(ddVN.value());
    }
    
    window.failureHandlerForVN = function(error) {
        var r = arguments;
        showInfoWindow(r[0].responseText,r[2])
    }
    
    
    function fetchVirtualNetworkInternals(id) {
        if(id === 'empty' || id === '') {
            //$('#ddVMI').data('contrailDropdown').setData([{text : 'No Server found', value : 'empty'}]); 
            $('#ddVMI').data('contrailCombobox').setData([{text : 'No Server found', value : 'empty'}]);
            $('#ddVMI').data('contrailCombobox').value('empty');
        } else if(id === 'none') {
            var vmiDataSrc = [{text : 'None', value : 'none'}];
            //$('#ddVMI').data('contrailDropdown').setData(vmiDataSrc);
            $('#ddVMI').data('contrailCombobox').setData(vmiDataSrc);
            $('#ddVMI').data('contrailCombobox').value('none');
        }else {
            doAjaxCall('/api/tenants/config/virtual-network-internals/' + id,'GET', null, 'successHandlerForVNInternals', 'failureHandlerForVNInternals', null, null);
        }
    }
    
    window.successHandlerForVNInternals = function(result) {
        if(result != null && result.length > 0) {
            var vmiDataSrc = [{text : 'None', value : 'none'}];
            for(var i = 0; i < result.length; i++) {
                var vmi = result[i];
                var txt = vmi.mac[0]; //+ ' (' + vmi.ip[0] + ')';
                vmiDataSrc.push({text : txt, value : JSON.stringify(vmi.vmi_fq_name), ip : vmi.ip[0]});
            }
            $('#ddVMI').data('contrailCombobox').setData(vmiDataSrc);
            if(flow === 'edit' && gblSelRow.server != '-') {
                // $('#ddVMI').data('contrailDropdown').text(gblSelRow.server);
                var vmiMac = gblSelRow.server.split('(')[0];
                $('#ddVMI').data('contrailCombobox').text(vmiMac);
                $('#txtVMI').val(gblSelRow.vmi_ip);
                $('#txtVMI').attr('disabled', 'disabled');
            } else {
                // $('#ddVMI').data('contrailDropdown').value('none');
                $('#ddVMI').data('contrailCombobox').value('none');
                $('#txtVMI').val('');
                $('#txtVMI').attr('disabled', 'disabled');
            }
        } else {
            // $('#ddVMI').data('contrailDropdown').setData([{text : 'No Server found', value : 'empty'}]);
            $('#ddVMI').data('contrailCombobox').setData([{text : 'No Server found', value : 'empty'}]);
            $('#ddVMI').data('contrailCombobox').value('empty');
            
        }       
    }
    
    window.failureHandlerForVNInternals = function(error){
        var r = arguments;
        showInfoWindow(r[0].responseText,r[2])    
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
        
    function fetchData() {
        gridPhysicalInterfaces._dataView.setData([]);
        gridPhysicalInterfaces.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/physical-interfaces/' + currentUUID,'GET', null, 'successHandlerForPhysicalInterfaces', 'failureHandlerForPhysicalInterfaces', null, null);
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
                gridDS.push({
                    uuid : pInterface.uuid,
                    name : pInterface.name,
                    type : infType,
                    parent : pInterface.fq_name[1],
                    vlan : liDetails.vlanTag != null ? liDetails.vlanTag : '-',
                    server : liDetails.vmiDetails != null ? liDetails.vmiDetails : '-',
                    vn : liDetails.vnRefs != null ? liDetails.vnRefs : '-',
                    li_type : liDetails.liType != null ? liDetails.liType : '-' ,
                    vmi_ip : liDetails.vmiIP != null ? liDetails.vmiIP : '-'
                });
                var lInterfaces = pInterfaces[i]['physical-interface'] ? pInterfaces[i]['physical-interface']['logical_interfaces'] : null;
                var lInterfaceNames = '';
                var infDS = [];
                if(lInterfaces != null && lInterfaces.length > 0) {
                    for(var j = 0; j < lInterfaces.length; j++) {
                        var lInterface = lInterfaces[j]['logical-interface'];
                        var lInterfaceName = lInterface.fq_name[3];
                        if(lInterfaceNames === ''){
                            lInterfaceNames = lInterfaceName;
                        } else {
                            lInterfaceNames += ',' + lInterfaceName;
                        }
                        liDetails = getLogicalInterfaceDetails(lInterface); 
                        infDS.push({
                            uuid : lInterface.uuid,
                            name : lInterface.name,
                            type : "Logical",
                            parent : lInterface.fq_name[2],
                            vlan : liDetails.vlanTag,
                            server : liDetails.vmiDetails,
                            vn : liDetails.vnRefs,
                            li_type : liDetails.liType,
                            vmi_ip : liDetails.vmiIP
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
                {text : 'Physical Interface', id : 'physical_interface', children : pInterfaceDS});
            dsSrcDest = mainDS;
            ddParent.setData(mainDS);    
            ddParent.value(mainDS[0].children[0].value);
            gridPhysicalInterfaces.showGridMessage("empty");
        }
        gridPhysicalInterfaces._dataView.setData(gridDS); 
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
        var vmiIP ;
        if(liType != '-') {
            liType = liType === 'l2' ? 'L2' : 'L3';
        }
        var vmiDetails = inf['vmi_details'] ? inf['vmi_details'].mac[0] +' ('+ inf['vmi_details'].ip[0] + ')' : '-';
        if(vmiDetails != '-') {
            vmiIP = inf['vmi_details'].ip[0];
            vnRefs = inf['vmi_details']['vn_refs'] ? inf['vmi_details']['vn_refs'][0].to : '-';
            if(vnRefs != '-') {
                vnRefs = vnRefs[2] + ' (' + vnRefs[0] + ':' + vnRefs[1] + ')';
            }                            
        }
        return { vlanTag : vlanTag, liType : liType, vmiDetails : vmiDetails, vnRefs : vnRefs, vmiIP : vmiIP};
    }
    
    window.failureHandlerForPhysicalInterfaces =  function(error) {
         //gridPhysicalInterfaces.showGridMessage("errorGettingData");
         fetchData();
    }
    
    function validate() {
        var name = $('#txtPhysicalInterfaceName').val().trim();
        if(name  === ""){	
            showInfoWindow("Enter an Interface Name","Input required");
            return false;
        }
        if($('#txtVlan').val() != '') {
            var vlan = parseInt($('#txtVlan').val().trim());
            if(isNaN(vlan) || vlan < 0 || vlan > 4094) {
                showInfoWindow('Vlan ID should be in  "0 - 4094" range', "Input required");
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
            for(var j = 0; j < data[i].children.length; j++) {
                if(txt === data[i].children[j].text) {
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
 }