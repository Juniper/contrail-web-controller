/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalRoutersConfigObj = new physicalRoutersConfig();
function physicalRoutersConfig() {
    //Variable Definitions
    var gridPhysicalRouters;
    var globalVRoutersMap = {};
    var SNMP_AUTH = 'auth';
    var SNMP_AUTHPRIV = 'authpriv';
    
    var OVSDB_SUFFIX = '_OVSDB';
    var NETCONF_SUFFIX = '_Netconf';
    var VCPE_SUFFIX = '_VCPE';
    var PROUTER_SUFFIX = '_PRouter';
    
    var OVSDB_TYPE = 'OVSDB Managed ToR';
    var NETCONF_TYPE = 'Netconf Managed Physical Router';
    var VCPE_TYPE = 'CPE Router';
    var PROUTER_TYPE = 'Physical Router';
    var SNMP_TYPE = 'SNMP Managed';
   
    var currAddEditType = '';
    var mode = '';
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
        var addPhysicalRouterDropdownTemplate = contrail.getTemplate4Id('add-prouter-action-template');
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
                                 addPhysicalRouterDropdownTemplate()]
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
                /*{
                    id : 'pRouterType',
                    field : 'pRouterType',
                    name : 'Type',
                    formatter:function(r,c,v,cd,dc){
                        var pRouterTypes = v;
                        var typeString = '';
                        if(pRouterTypes == '' || pRouterTypes == '-' || pRouterTypes.length < 1)
                            return '-';
                        $.each(pRouterTypes,function(i,d){
                            if(i == 0){
                                typeString = d; 
                            } else {
                                typeString += '</br>' + d;
                            }
                        })
                        return typeString;
                    },
                    minWidth : 110
                },*/
                {
                    id : 'mgmt_ip_address',
                    field : 'mgmt_ip_address',
                    name : 'Management IP',
                    sorter : comparatorIP
                },
                {
                    id : 'data_ip_address',
                    field : 'data_ip_address',
                    name : 'VTEP Address',
                    sorter : comparatorIP
                },                
                {
                    id : 'interfaces',
                    field : 'totalInterfacesCount',
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
                    actionCell: 
                        /* function(dc){
                        var ret = [];
                        if(dc.pRouterType.indexOf(OVSDB_TYPE) >= 0){
                            ret.push({
                                title: 'Edit OVSDB Managed ToR',
                                iconClass: 'icon-edit',
                                onClick: function(rowIndex){
                                    currAddEditType = OVSDB_SUFFIX;
                                    physicalRouterEditWindow({index:rowIndex,type:'OVSDB',divId:'addOVSDBManagedTORWindow'});
                                }
                            });
                        } else if(dc.pRouterType.indexOf(NETCONF_TYPE) >= 0){
                            ret.push({
                                title: 'Edit Netconf Managed Physical Router',
                                iconClass: 'icon-edit',
                                onClick: function(rowIndex){
                                    currAddEditType = NETCONF_SUFFIX;
                                    physicalRouterEditWindow({index:rowIndex,type:'Netconf',divId:'addNetconfManagedWindow'});
                                }
                            });
                        } else if(dc.pRouterType.indexOf(VCPE_TYPE) >= 0){
                            ret.push({
                                title: 'Edit VCPE',
                                iconClass: 'icon-edit',
                                onClick: function(rowIndex){
                                    currAddEditType = VCPE_SUFFIX;
                                    physicalRouterEditWindow({index:rowIndex,type:'VCPE',divId:'addVCPEWindow'});
                                }
                            });
                        }
                        ret.push({
                            title: 'Edit Physical Router',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                currAddEditType = PROUTER_SUFFIX;
                                physicalRouterEditWindow({index:rowIndex,type:'PRouter',divId:'addPhysicalRouterWindow'});
                            }
                        });
                        ret.push({
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showPhysicalRouterDelWindow({index:rowIndex});
                            }
                        });
                         return ret}, */
                        
                        [
                        {
                            title: 'Edit OVSDB Managed ToR',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                currAddEditType = OVSDB_SUFFIX;
                                physicalRouterEditWindow({index:rowIndex,type:'OVSDB',divId:'addOVSDBManagedTORWindow'});
                            }
                        },
                        {
                            title: 'Edit Netconf Managed Physical Router',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                currAddEditType = NETCONF_SUFFIX;
                                physicalRouterEditWindow({index:rowIndex,type:'Netconf',divId:'addNetconfManagedWindow'});
                            }
                        },
                        {
                            title: 'Edit VCPE',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                currAddEditType = VCPE_SUFFIX;
                                physicalRouterEditWindow({index:rowIndex,type:'VCPE',divId:'addVCPEWindow'});
                            }
                        },
                        {
                            title: 'Edit Physical Router',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                currAddEditType = PROUTER_SUFFIX;
                                physicalRouterEditWindow({index:rowIndex,type:'PRouter',divId:'addPhysicalRouterWindow'});
                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showPhysicalRouterDelWindow({index:rowIndex});
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
        
        //initializing add record windows        
        $('#addOVSDBManagedTORWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addOVSDBManagedTORWindow').find(".modal-header-title").text('Add OVSDB Managed ToR');
        
        $('#addNetconfManagedWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addNetconfManagedWindow').find(".modal-header-title").text('Add Netconf Managed Physical Router');
        
        $('#addVCPEWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addVCPEWindow').find(".modal-header-title").text('Add VCPE');
        
        $('#addPhysicalRouterWindow').modal({backdrop:'static',keyboard:false,show:false});
        $('#addPhysicalRouterWindow').find(".modal-header-title").text('Add Physical Router');
        
        
        //Initializing the bgp router dropdown[id^=jander]
        $('[id^=ddBgpRouter]').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
        }); 
        var ddBgp =  $('[id^=ddBgpRouter]').data('contrailDropdown');

        //initializing physical router type multi select
        var vnFields = $('[id^=msVN]');
        for(var i=0 ; i < vnFields.length; i++){
            var vn = vnFields[i];
            $(vn).contrailMultiselect({
                dataTextField:'text',
                dataValueField:'value'
            }); 
        }
        
      //initializing physical router type multi select
        $('[id^=ddVirtualRoutersType]').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onVrouterTypeChange
        }); 
        
        var vrType =  $('[id^=ddVirtualRoutersType]').data('contrailDropdown');
        var vrTypeDS = [{ text : 'None', value : 'none'},
                        { text : 'Embedded', value : 'embedded'},
                        { text : 'TOR Agent', value : 'tor-agent'}
        ];
        vrType.setData(vrTypeDS);
        
        var torFields = $('[id^=ddTorAgentName]');
        for(var i=0 ; i < torFields.length; i++){
            var tor = torFields[i];
            $(tor).contrailCombobox({
                dataTextField:'text',
                dataValueField:'value',
                minimumResultsForSearch : 1,
                change:onTorAgentChange,
                placeholder: "Select or Enter Name"
            }); 
        }
        
        var tsnFields = $('[id^=ddTsnName]');
        for(var i=0 ; i < tsnFields.length; i++){
            var tsn = tsnFields[i];
            $(tsn).contrailCombobox({
                dataTextField:'text',
                dataValueField:'value',
                minimumResultsForSearch : 1,
                change:onTsnChange,
                placeholder: "Select or Enter Name"
            }); 
        }
        
        //initializing delete record window
        //deleteRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});
        //deleteRecordWindowObj.find(".modal-header-title").text('Confirm');
               
        $('#confirmMainDelete').modal({backdrop:'static',keyboard:false,show:false});
        $('#confirmMainDelete').find(".modal-header-title").text('Confirm');  
        
        $('[id^=ddSnmpSecurityLevel]').contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onSnmpSecurityLevelChange
        });
        var snmpLevelDS = [{ text : 'None', value : 'none'},
                        { text : 'Auth', value : SNMP_AUTH},
                        { text : 'AuthPriv', value : SNMP_AUTHPRIV}
                        ];
        var ddSnmpSecurityLevel = $('[id^=ddSnmpSecurityLevel]').data('contrailDropdown');
        ddSnmpSecurityLevel.setData(snmpLevelDS);
    }
    
    function onSNMPVersionChange(e){
        if($('#snmpVersion2' + currAddEditType).is(':checked') == true){
            $('#snmpv2div' + currAddEditType).removeClass('hide').addClass('show');
            $('#snmpv3div' + currAddEditType).removeClass('show').addClass('hide');
        } else {
            $('#snmpv3div' + currAddEditType).removeClass('hide').addClass('show');
            $('#snmpv2div' + currAddEditType).removeClass('show').addClass('hide');
        }
    }
    
    function onSNMPSettingsCheckboxChange(e){
        if($('#chkSnmpSettings' + currAddEditType)[0].checked == true){
            $('#snmpSettings' + currAddEditType).removeClass('hide').addClass('show');
        } else {
            $('#snmpSettings' + currAddEditType).removeClass('show').addClass('hide');
        }
    }
    
    function onSnmpSecurityLevelChange(e){
        var level = e.added.value;
        if(level === "auth") {//Show only auth 
            $('#snmpAuthDiv' + currAddEditType).removeClass('hide').addClass('show');
            $('#snmpPrivDiv' + currAddEditType).removeClass('show').addClass('hide');  
        } else if(level == "authpriv"){//Show both
            $('#snmpAuthDiv' + currAddEditType).removeClass('hide').addClass('show');   
            $('#snmpPrivDiv' + currAddEditType).removeClass('hide').addClass('show');   
        } else {//None hide both
            $('#snmpAuthDiv' + currAddEditType).removeClass('show').addClass('hide');
            $('#snmpPrivDiv' + currAddEditType).removeClass('show').addClass('hide');
        }
    }
    
    function onVrouterTypeChange(e){
        var inf = e.added.value;
        if(inf === "tor-agent") {
            $('#vRouterTorAgentFields' + currAddEditType).removeClass('hide').addClass('show');
        } else {
            $('#vRouterTorAgentFields' + currAddEditType).removeClass('show').addClass('hide');           
        }
    }
    
    function onTorAgentChange(e){
        if(currAddEditType != PROUTER_SUFFIX){
            return;
        }
        var torcb = $('#ddTorAgentName' + currAddEditType).data('contrailCombobox');
        var inf = torcb.value();
        var allData = torcb.getAllData();
        var isSelectedFromList = false;
        $.each(allData,function(i,d){
            if(d.id == inf){
                isSelectedFromList = true;
            }
        });
        if(inf != null && isSelectedFromList){
            $('#txtTorAgentIp' + currAddEditType).val(inf);
            $('#txtTorAgentIp' + currAddEditType).attr("disabled", "disabled");
        } else {
            $('#txtTorAgentIp' + currAddEditType).val('');
            $('#txtTorAgentIp' + currAddEditType).removeAttr("disabled");
        }
    }
    
    function onTsnChange(e){
        if(currAddEditType != PROUTER_SUFFIX){
            return;
        }
        var tsncb = $('#ddTsnName' + currAddEditType).data('contrailCombobox');
        var inf = tsncb.value();
        var allData = tsncb.getAllData();
        var isSelectedFromList = false;
        $.each(allData,function(i,d){
            if(d.id == inf){
                isSelectedFromList = true;
            }
        });
        if(inf != null && inf != '' && isSelectedFromList){
            $('#txtTsnIp' + currAddEditType).val(inf);
            $('#txtTsnIp' + currAddEditType).attr("disabled", "disabled");
        } else {
            $('#txtTsnIp' + currAddEditType).val('');
            $('#txtTsnIp' + currAddEditType).removeAttr("disabled");
        }
    }
    
    function initActions() {
        //Bind click even the add li's
        $('#addOVSDBManagedTORLi').click(function() {
            currAddEditType = OVSDB_SUFFIX;
            $('#addOVSDBManagedTORWindow').find(".modal-header-title").text('Add OVSDB Managed ToR');
            populateCreateEditWindow({mode:'create',type:'OVSDB',divId:'addOVSDBManagedTORWindow'});
            //Bind the click event for ok
            $('#btnAddOk' + currAddEditType).click(function() {
                if(validate(currAddEditType)) {
                    $('#addOVSDBManagedTORWindow').modal('hide');
                    createUpdatePhysicalRouter(); 
                }
            });
        }); 
        $('#addNetconfManagedPhysicalGatewayLi').click(function() {
            currAddEditType = NETCONF_SUFFIX;
            $('#addNetconfManagedWindow').find(".modal-header-title").text('Add Netconf Managed Physical Router');
            populateCreateEditWindow({mode:'create',type:'Netconf',divId:'addNetconfManagedWindow'});
            //Bind the click event for ok
            $('#btnAddOk' + currAddEditType).click(function() {
                if(validate(currAddEditType)) {
                    $('#addNetconfManagedWindow').modal('hide');
                    createUpdatePhysicalRouter(); 
                }
            });
        });
        $('#addVCPELi').click(function() {
            currAddEditType = VCPE_SUFFIX;
            $('#addVCPEWindow').find(".modal-header-title").text('Add VCPE');
            populateCreateEditWindow({mode:'create',type:'VCPE',divId:'addVCPEWindow'});
            //Bind the click event for ok
            $('#btnAddOk' + currAddEditType).click(function() {
                if(validate(currAddEditType)) {
                    $('#addVCPEWindow').modal('hide');
                    createUpdatePhysicalRouter(); 
                }
            });
        });
        $('#addPhysicalRouterLi').click(function() {
            currAddEditType = PROUTER_SUFFIX;
            $('#addPhysicalRouterWindow').find(".modal-header-title").text('Add Physical Router');
            populateCreateEditWindow({mode:'create',type:'PRouter',divId:'addPhysicalRouterWindow'});
            //Bind the click event for ok
            $('#btnAddOk' + currAddEditType).click(function() {
                if(validate(currAddEditType)) {
                    $('#addPhysicalRouterWindow').modal('hide');
                    createUpdatePhysicalRouter(); 
                }
            });
        });
        
        //Bind click events for Delete popup which is common for any type
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
    
    window.showPhysicalRouterDelWindow = function(e) {
        $.contrailBootstrapModal (
            {
                id: 'confirmRemove',
                title: 'Remove',
                body: '<h6>Confirm Removing Physical Router</h6>',
                footer: [
                {
                    title: 'Cancel',
                    onclick: 'close',
                },
                {
                    id: 'btnRemovePopupOK',
                    title: 'Confirm',
                    onclick: function(){
                        var selected_row = gridPhysicalRouters._dataView.getItem(e['index']);
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
    
    window.physicalRouterEditWindow = function(options) {
        var index = options['index'];
        gblSelRow = gridPhysicalRouters._dataView.getItem(index);
        
        populateCreateEditWindow({mode:'edit',type:options['type'],divId:options['divId']});
        $('#btnAddOk' + currAddEditType).click(function() {
            if(validate(currAddEditType)) {
                $('#' + options['divId']).modal('hide');
                createUpdatePhysicalRouter(); 
            }
        });
    }
    
    function populateCreateEditWindow(options) {
        mode = options.mode;
        var type = options.type;
        clearCreateEditWindow();
        //TODO this need to be called on load of the window otherwise the data obtained will be stale        
        fetchVirtualRouters();
        
        //On changing the snmp version
        $('input[name="snmpVersion' + currAddEditType + '"]').change(onSNMPVersionChange);
        //On SNMP settings checkbox change
//        $('#chkSnmpSettings' + currAddEditType).change(onSNMPSettingsCheckboxChange);
        $('input[name="chkSnmpSettings' + currAddEditType + '"]').change(onSNMPSettingsCheckboxChange);
        if(mode === 'edit') {
            //Set the heading correctly
            if(currAddEditType == OVSDB_SUFFIX)
                $('#' + options['divId']).find(".modal-header-title").text('Edit ' + OVSDB_TYPE);
            else if(currAddEditType == NETCONF_SUFFIX)
                $('#' + options['divId']).find(".modal-header-title").text('Edit ' + NETCONF_TYPE);
            else if(currAddEditType == VCPE_SUFFIX)
                $('#' + options['divId']).find(".modal-header-title").text('Edit ' + VCPE_TYPE);
            else 
                $('#' + options['divId']).find(".modal-header-title").text('Edit ' + PROUTER_TYPE);
            
            $('#txtPhysicalRouterName' + currAddEditType).val(gblSelRow.name);
            if(gblSelRow.vendor != '-' && $('#txtVendor' + currAddEditType).length > 0)
                $('#txtVendor' + currAddEditType).val(gblSelRow.vendor);
            if(gblSelRow.model != '-' && $('#txtModel' + currAddEditType).length > 0) {
                $('#txtModel' + currAddEditType).val(gblSelRow.model);
            }
            if(gblSelRow.auto_config != '-' && $('#chkAutoConfig' + currAddEditType).length > 0) {
                $('#chkAutoConfig' + currAddEditType)[0].checked = gblSelRow.auto_config == 'Enabled' ? true : false;
            }
            $('#txtPhysicalRouterName' + currAddEditType).attr('disabled','disabled');
            if(gblSelRow.mgmt_ip_address != '-' && $('#txtMgmtIPAddress' + currAddEditType).length > 0)
                $('#txtMgmtIPAddress' + currAddEditType).val(gblSelRow.mgmt_ip_address);
            if(gblSelRow.data_ip_address != '-' && $('#txtDataIPAddress' + currAddEditType).length > 0)
                $('#txtDataIPAddress' + currAddEditType).val(gblSelRow.data_ip_address);
            if(gblSelRow.username != '-' && $('#txtUsername' + currAddEditType).length > 0)
                $('#txtUsername' + currAddEditType).val(gblSelRow.username);
            if(gblSelRow.password != '-' && $('#txtPassword' + currAddEditType).length > 0)
                $('#txtPassword' + currAddEditType).val(gblSelRow.password);
            if(gblSelRow.bgp_routers != '-' && $('#ddBgpRouter' + currAddEditType).data('contrailDropdown') != null)
                $('#ddBgpRouter' + currAddEditType).data('contrailDropdown').text(gblSelRow.bgp_routers);
            if($('#msVN' + currAddEditType).length > 0){
                var msVNData = $('#msVN' + currAddEditType).data('contrailMultiselect').getAllData();
                var valueArr = [];
                for(var i = 0; i < msVNData.length ; i++){
                    for(var j = 0; j < gblSelRow.virtual_networks.length ; j++){
                        if(msVNData[i].text == gblSelRow.virtual_networks[j]){
                            valueArr.push(msVNData[i].value);
                        }
                    }
                }
                $('#msVN' + currAddEditType).data('contrailMultiselect').value(valueArr);
            }
            if(gblSelRow.virtual_router != '-'){
                var selectedVRouters = gblSelRow.virtualRouters;
                var vrType = 'None';
                $.each(selectedVRouters,function(i,vrouter){
                    var vrname = vrouter['name'];
                    var vrouterType = vrouter['virtual_router_type'];
                    var vrIp = vrouter['virtual_router_ip_address']; 
                    if(vrouterType == 'embedded'){
                        vrType = 'Embedded';
                        if($('#vRouterTorAgentFields' + currAddEditType).length > 0){
                            $('#vRouterTorAgentFields' + currAddEditType).removeClass('show').addClass('hide');
                        }
                    } else if(vrouterType == 'tor-agent'){
                        vrType = 'TOR Agent';
                        if($('#ddTorAgentName' + currAddEditType).data('contrailCombobox') != null)
                            $('#ddTorAgentName' + currAddEditType).data('contrailCombobox').value(vrname);
                        if($('#vRouterTorAgentFields' + currAddEditType).length > 0)
                            $('#vRouterTorAgentFields' + currAddEditType).removeClass('hide').addClass('show');
                        if($('#txtTorAgentIp' + currAddEditType).length > 0)
                            $('#txtTorAgentIp' + currAddEditType).val(vrIp);
                        if($('#txtTorAgentIp' + currAddEditType).length > 0)
                            $('#txtTorAgentIp' + currAddEditType).attr("disabled", "disabled");
                    } else if(vrouterType == 'tor-service-node'){
                        vrType = 'TOR Agent';
                        if($('#ddTsnName' + currAddEditType).data('contrailCombobox') != null)
                            $('#ddTsnName' + currAddEditType).data('contrailCombobox').value(vrname);
                        if($('#vRouterTorAgentFields' + currAddEditType).length > 0)
                            $('#vRouterTorAgentFields' + currAddEditType).removeClass('hide').addClass('show');
                        if($('#txtTsnIp' + currAddEditType).length > 0)
                            $('#txtTsnIp' + currAddEditType).val(vrIp);
                        if($('#txtTsnIp' + currAddEditType).length > 0)
                            $('#txtTsnIp' + currAddEditType).attr("disabled", "disabled");
                    }
                });
                if($('#ddVirtualRoutersType' + currAddEditType).length > 0)
                    $('#ddVirtualRoutersType' + currAddEditType).data('contrailDropdown').text(vrType);
                if(vrType == 'None' && $('#vRouterTorAgentFields' + currAddEditType).length > 0)
                    $('#vRouterTorAgentFields' + currAddEditType).removeClass('show').addClass('hide');
            } else {
                if($('#ddVirtualRoutersType' + currAddEditType).length > 0)
                    $('#ddVirtualRoutersType' + currAddEditType).data('contrailDropdown').text('None');
                if($('#vRouterTorAgentFields' + currAddEditType).length > 0)
                    $('#vRouterTorAgentFields' + currAddEditType).removeClass('show').addClass('hide');
            }
            if(gblSelRow.isSNMPManaged){
                if(currAddEditType != PROUTER_SUFFIX && currAddEditType != VCPE_SUFFIX){
                    $('#chkSnmpSettings' + currAddEditType)[0].checked = true;
                    $('#snmpSettings' + currAddEditType).removeClass('hide').addClass('show');
                }
            } else {
                if(currAddEditType != PROUTER_SUFFIX && currAddEditType != VCPE_SUFFIX){
                    $('#chkSnmpSettings' + currAddEditType)[0].checked = false;
                    $('#snmpSettings' + currAddEditType).removeClass('show').addClass('hide');
                }
            }
            if(gblSelRow.snmpVersion == '-' || gblSelRow.snmpVersion == '2'){
                $('#snmpVersion2' + currAddEditType).prop('checked', true);
                onSNMPVersionChange();//to enable the corresponding fields for v2 or v3
                if(gblSelRow.snmpV2Community != '-' && $("#txtCommunity" + currAddEditType).length > 0){
                    $("#txtCommunity" + currAddEditType).val(gblSelRow.snmpV2Community);
                }
            } else {
                if($('#snmpVersion3' + currAddEditType).length > 0){
                    $('#snmpVersion3' + currAddEditType).prop('checked', true);
                    onSNMPVersionChange();//to enable the corresponding fields for v2 or v3
                }
                if(gblSelRow.snmpV3SecurityEngineId != '-' && $("#txtSecurityEngineId" + currAddEditType).length > 0){
                    $("#txtSecurityEngineId" + currAddEditType).val(gblSelRow.snmpV3SecurityEngineId);
                }
                if(gblSelRow.snmpV3SecurityName != '-' && $("#txtSecurityName" + currAddEditType).length > 0){
                    $("#txtSecurityName" + currAddEditType).val(gblSelRow.snmpV3SecurityName);
                }
                if(gblSelRow.snmpV3SecurityLevel != '-' && $("#ddSnmpSecurityLevel" + currAddEditType).length > 0){
                    $("#ddSnmpSecurityLevel" + currAddEditType).data('contrailDropdown').value(gblSelRow.snmpV3SecurityLevel);
                }
                if(gblSelRow.snmpv3AuthProtocol != '-' && $("#txtSnmpAuthProtocol" + currAddEditType).length > 0){
                    $("#txtSnmpAuthProtocol" + currAddEditType).val(gblSelRow.snmpv3AuthProtocol);
                }
                if(gblSelRow.snmpv3PrivProtocol != '-' && $("#txtSnmpPrivProtocol" + currAddEditType).length > 0){
                    $("#txtSnmpPrivProtocol" + currAddEditType).val(gblSelRow.snmpv3PrivProtocol);
                }
                if(gblSelRow.snmpv3Context != '-' && $("#txtContext" + currAddEditType).length > 0){
                    $("#txtContext" + currAddEditType).val(gblSelRow.snmpv3Context);
                }
                if(gblSelRow.snmpv3ContextEngineId != '-' && $("#txtContextEngineId" + currAddEditType).length > 0){
                    $("#txtContextEngineId" + currAddEditType).val(gblSelRow.snmpv3ContextEngineId);
                }
                if(gblSelRow.snmpv3EngineId != '-' && $("#txtV3EngineId" + currAddEditType).length > 0){
                    $("#txtV3EngineId" + currAddEditType).val(gblSelRow.snmpv3EngineId);
                }
                if(gblSelRow.snmpv3EngineBoots != '-' && $("#txtV3EngineBoots" + currAddEditType).length > 0){
                    $("#txtV3EngineBoots" + currAddEditType).val(gblSelRow.snmpv3EngineBoots);
                }
                if(gblSelRow.snmpv3EngineTime != '-' && $("#txtV3EngineTime" + currAddEditType).length > 0){
                    $("#txtV3EngineTime" + currAddEditType).val(gblSelRow.snmpv3EngineTime);
                }
            }
            
            if(gblSelRow.snmpLocalPort != '-' && $("#txtLocalPort" + currAddEditType).length > 0){
                $("#txtLocalPort" + currAddEditType).val(gblSelRow.snmpLocalPort);
            }
            if(gblSelRow.snmpRetries != '-' && $("#txtRetries" + currAddEditType).length > 0){
                $("#txtRetries" + currAddEditType).val(gblSelRow.snmpRetries);
            }
            if(gblSelRow.snmpTimeout != '-' && $("#txtTimeout" + currAddEditType).length > 0){
                $("#txtTimeout" + currAddEditType).val(gblSelRow.snmpTimeout);
            }
            
        } else {
            $('[id^=ddBgpRouter]').data('contrailDropdown').value('None');
            if(currAddEditType == PROUTER_SUFFIX) {
                $('#ddVirtualRoutersType' + currAddEditType).data('contrailDropdown').value('none');
            } else if(currAddEditType == OVSDB_SUFFIX || currAddEditType == NETCONF_SUFFIX){
                $('#vRouterTorAgentFields' + currAddEditType).removeClass('hide').addClass('show');
            }
            $('[id^=ddSnmpSecurityLevel]').data('contrailDropdown').value('none');
        }
        $('#' + options.divId).modal('show');       
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
            if(gblSelRow.virtualRouters != '-'){
                selectedVRouters = gblSelRow.virtualRouters;
            }
            postObject["physical-router"]["uuid"] = gblSelRow.uuid;
        }
        var name,vendor,mgmtIpAddress,dataIpAddress,username,password,bgpRouter,vRoutersType,model,autoConfig,vns;
        
        name = $("#txtPhysicalRouterName" + currAddEditType).val();
        if(currAddEditType != VCPE_SUFFIX) {
            vendor = $("#txtVendor" + currAddEditType).val();
            model = $("#txtModel" + currAddEditType).val().trim();
        }
        mgmtIpAddress = $("#txtMgmtIPAddress" + currAddEditType).val();
        if(currAddEditType != NETCONF_SUFFIX){
            dataIpAddress = $("#txtDataIPAddress" + currAddEditType).val();
        }
        if(currAddEditType == NETCONF_SUFFIX || currAddEditType == PROUTER_SUFFIX){
            username = $("#txtUsername" + currAddEditType).val();
            password = $("#txtPassword" + currAddEditType).val();
        }
        if(currAddEditType == PROUTER_SUFFIX) {
            bgpRouter = $("#ddBgpRouter" + currAddEditType).data('contrailDropdown').text();
            autoConfig = $('#chkAutoConfig' + currAddEditType)[0].checked;
            vns = $("#msVN" + currAddEditType).data('contrailMultiselect').getSelectedData(); 
            vRoutersType = $("#ddVirtualRoutersType" + currAddEditType).data('contrailDropdown').text();
        }
        if(currAddEditType == NETCONF_SUFFIX){
            autoConfig = true;
        }
        
        //Show loading icon in the grid
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');  
        
        postObject["physical-router"]["fq_name"] = ["default-global-system-config", name];
        postObject["physical-router"]["parent_type"] = "global-system-config";
        postObject["physical-router"]["name"] = name;
        postObject["physical-router"]['physical_router_vendor_name'] = vendor;
        postObject["physical-router"]["physical_router_product_name"] = model;
        postObject["physical-router"]["physical_router_management_ip"] = mgmtIpAddress;
        postObject["physical-router"]["physical_router_dataplane_ip"] = dataIpAddress;
        postObject["physical-router"]['physical_router_user_credentials'] = {};
        postObject["physical-router"]['physical_router_user_credentials']["username"] = username;
        postObject["physical-router"]['physical_router_user_credentials']["password"] = password;
        if(bgpRouter != null && bgpRouter != 'None'){
            var bgpRouterRefs = [{"to":["default-domain", "default-project" , "ip-fabric", "__default__", bgpRouter]}];
            postObject["physical-router"]["bgp_router_refs"] = bgpRouterRefs;
        } else {
            postObject["physical-router"]["bgp_router_refs"] = [];
        }
        postObject["physical-router"]["physical_router_vnc_managed"] = autoConfig;
        
        if(vns != null && vns.length > 0){
            var vnRefs = [];
            for(var i = 0 ;i < vns.length ; i++){
                vnRefs.push({"to":vns[i].data});
            }
            postObject["physical-router"]["virtual_network_refs"] = vnRefs;
        } else {
            postObject["physical-router"]["virtual_network_refs"] = [];
        }
        
        var virtualRouterRefs = [];
        //Decide the creation vrouter based on the currAddEditType
        if(currAddEditType == OVSDB_SUFFIX) {
            //Given the tor and tsn name create them without ips
            populateTORAgentVirtualRouterObjectToPostObj(postObject,selectedVRouters,'TOR Agent');
        } else if (currAddEditType == NETCONF_SUFFIX) {
            //Create tor and tsn using the ips
//            populateTORAgentVirtualRouterObjectToPostObj(postObject,selectedVRouters,'TOR Agent');
        } else if (currAddEditType == VCPE_SUFFIX) {
            //Create Embedded type vrouter implicitely
            populateEmbeddedVirtualRouterObjectToPostObj(postObject,mgmtIpAddress,name);
        } else {
            // This PROUTER type add. Create based on the info inputted.
            if(vRoutersType != null && vRoutersType != 'None'){
                var virtualRouterRefs = [];
                if(vRoutersType == 'Embedded'){
                    populateEmbeddedVirtualRouterObjectToPostObj(postObject,mgmtIpAddress,name);
                } else {//ToR Agent case
                    populateTORAgentVirtualRouterObjectToPostObj(postObject,selectedVRouters,vRoutersType);
                }
            } else {
                postObject["physical-router"]["virtual_router_refs"] = [];
            }
        }
        
        //Check if SNMP managed
        var isSNMPManaged = false;
        if($('#chkSnmpSettings' + currAddEditType).length > 0) {
            isSNMPManaged = $('#chkSnmpSettings' + currAddEditType)[0].checked;
        }
        //SNMP Credentials
        if(currAddEditType == PROUTER_SUFFIX || isSNMPManaged) {
            var snmpVersion = ($('#snmpVersion2' + currAddEditType).is(':checked') == true)? 2 : 3;
            var snmpLocalPort = ($("#txtLocalPort" + currAddEditType).val() != '')? parseInt($("#txtLocalPort" + currAddEditType).val()) : '';
            var snmpRetries = ($("#txtRetries" + currAddEditType).val() != '')? parseInt($("#txtRetries" + currAddEditType).val()) : '';
            var snmpTimeOut = ($("#txtTimeout" + currAddEditType).val() != '')? parseInt($("#txtTimeout" + currAddEditType).val()) : '';
            postObject["physical-router"]['physical_router_snmp_credentials'] = {};
            postObject["physical-router"]['physical_router_snmp_credentials']['version'] = snmpVersion;
            if(snmpLocalPort != '')
                postObject["physical-router"]['physical_router_snmp_credentials']['local_port'] = snmpLocalPort;
            if(snmpRetries != '')
                postObject["physical-router"]['physical_router_snmp_credentials']['retries'] = snmpRetries;
            if(snmpTimeOut != '')    
                postObject["physical-router"]['physical_router_snmp_credentials']['timeout'] = snmpTimeOut;
            
            if(snmpVersion == 2){//version is 2
                postObject["physical-router"]['physical_router_snmp_credentials']['v2_community'] = $("#txtCommunity" + currAddEditType).val();
            } else { //version is 3
                var securityLevel = $("#ddSnmpSecurityLevel" + currAddEditType).data('contrailDropdown').value();
                if($("#txtSecurityName" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_security_name'] = $("#txtSecurityName" + currAddEditType).val();
                postObject["physical-router"]['physical_router_snmp_credentials']['v3_security_level'] = securityLevel;
                if($("#txtSecurityEngineId" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_security_engine_id'] = $("#txtSecurityEngineId" + currAddEditType).val();
                if (securityLevel == SNMP_AUTH) {
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_authentication_protocol'] = $("#txtSnmpAuthProtocol" + currAddEditType).val();
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_authentication_password'] = $("#txtSnmpAuthPassword" + currAddEditType).val();
                } 
                if (securityLevel == SNMP_AUTHPRIV) {
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_privacy_protocol'] = $("#txtSnmpPrivProtocol" + currAddEditType).val();
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_privacy_password'] = $("#txtSnmpPrivPassword" + currAddEditType).val();
                }
                if($("#txtContext" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_context'] = $("#txtContext" + currAddEditType).val();
                if($("#txtContextEngineId" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_context_engine_id'] = $("#txtContextEngineId" + currAddEditType).val();
                if($("#txtV3EngineId" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_engine_id'] = $("#txtV3EngineId" + currAddEditType).val();
                if($("#txtV3EngineBoots" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_engine_boots'] = parseInt($("#txtV3EngineBoots" + currAddEditType).val());
                if($("#txtV3EngineTime" + currAddEditType).val() != '')
                    postObject["physical-router"]['physical_router_snmp_credentials']['v3_engine_time'] = parseInt($("#txtV3EngineTime" + currAddEditType).val());
            }
        }
        if(methodType == "PUT"){
            doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalRouterAddEdit', 'failureHandlerForCreateEditRouters', null, null);
        } else {
            doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalRouters', 'failureHandlerForCreateEditRouters', null, null);
        }
    }
    
    window.successHandlerForPhysicalRouterAddEdit =  function(result) {
        fetchData();
    }
    
    //Populates the post obj with the required fields for creating the embedded type vrouter
    function populateEmbeddedVirtualRouterObjectToPostObj(postObject,mgmtIpAddress,name){
        postObject["physical-router"]['virtual_router_type'] = "Embedded";
        var virtualRouters = [];
        var virtualRouterRefs = [];
        postObject["physical-router"]["virtual-routers"] = [];
        var currVr = getVirtualRouterDetails(name);
        if(currVr != null && (currVr.type == 'embedded' || currVr.type == 'hypervisor')){
            if(currVr.ip != mgmtIpAddress || currVr.type == 'hypervisor'){
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
        postObject["physical-router"]["virtual-routers"] = virtualRouters;
        postObject["physical-router"]["virtual_router_refs"] = virtualRouterRefs;
    }
    
    function populateTORAgentVirtualRouterObjectToPostObj(postObject,selectedVRouters,vRoutersType) {
        var virtualRouters = [];
        var virtualRouterRefs = [];
        var torcb = $('#ddTorAgentName' + currAddEditType).data('contrailCombobox');
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
           if(vrouter['name'].trim() == tor){
               isTorAlreadyFromEdit = true;
           } 
        });
        var tsncb = $('#ddTsnName' + currAddEditType).data('contrailCombobox');
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
            if(vrouter['name'].trim() == tsn){
                isTsnAlreadyFromEdit = true;
            } 
         });
        postObject["physical-router"]['virtual_router_type'] = vRoutersType;
        
        postObject["physical-router"]["virtual-routers"] = [];
        
        var torAgentName = $("#ddTorAgentName" + currAddEditType).data('contrailCombobox').text();
        var tsnName = $("#ddTsnName" + currAddEditType).data('contrailCombobox').text();
        var tsnIp,torAgentIp;
        if(currAddEditType != OVSDB_SUFFIX) {
            torAgentIp = $("#txtTorAgentIp" + currAddEditType).val();
            tsnIp = $("#txtTsnIp" + currAddEditType).val();
        }
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
        postObject["physical-router"]["virtual-routers"] = virtualRouters;
        postObject["physical-router"]["virtual_router_refs"] = virtualRouterRefs;
    }
    
    window.failureHandlerForCreateEditRouters =  function(error) {
        //gridPhysicalRouters.showGridMessage("errorCreateEdit");
        fetchData();
   }
    
    function clearCreateEditWindow() {
        $('[id^=txtPhysicalRouterName]').removeAttr('disabled');
        $('[id^=txtPhysicalRouterName]').val('');
        $('[id^=txtVendor]').val('');
        $('[id^=txtMgmtIPAddress]').val('');
        $('[id^=txtDataIPAddress]').val('');
        $('[id^=txtUsername]').val('');
        $('[id^=txtPassword]').val('');
        $('[id^=ddBgpRouter]').data('contrailDropdown').value('None');
        $('[id^=msVN]').data('contrailMultiselect').value(''); 
        $('[id^=ddVirtualRoutersType]').data('contrailDropdown').value('none');
        $('[id^=vRouterTorAgentFields]').removeClass('show').addClass('hide');
        $('[id^=ddTorAgentName]').data('contrailCombobox').text('');
        $('[id^=ddTsnName]').data('contrailCombobox').text('');
        $('[id^=txtTorAgentIp]').val('');
        $('[id^=txtTsnIp]').val('');
        $('[id^=txtModel]').val('');
        $.each($('[id^=chkAutoConfig]'),function(i,d){
            d.checked = false;
        });
//        if(currAddEditType == NETCONF_SUFFIX){
//            $('#chkAutoConfig' + currAddEditType)[0].checked = true;
//        }
        $.each($('[id^=chkSnmpSettings]'),function(i,d){
            d.checked = false;
        });
        $('[id^=snmpSettings]').removeClass('show').addClass('hide');
        $('[id^=txtLocalPort]').val('');
        $('[id^=txtRetries]').val('');
        $('[id^=txtTimeout]').val('');
        $('[id^=txtCommunity]').val('public');
        $('[id^=txtSecurityName]').val('');
        $('[id^=ddSnmpSecurityLevel]').data('contrailDropdown').value('none');
        $('[id^=snmpAuthDiv]').removeClass('show').addClass('hide');
        $('[id^=snmpPrivDiv]').removeClass('show').addClass('hide');
        $('[id^=txtSnmpAuthProtocol]').val('');
        $('[id^=txtSnmpAuthPassword]').val('');
        $('[id^=txtSnmpPrivProtocol]').val('');
        $('[id^=txtSnmpPrivPassword]').val('');
        $('[id^=txtSecurityEngineId]').val('');
        $('[id^=txtContext]').val('');
        $('[id^=txtContextEngineId]').val('');
        $('[id^=txtV3EngineId]').val('');
        $('[id^=txtV3EngineBoots]').val('');
        $('[id^=txtV3EngineTime]').val('');
        //Need to unbind the click events on the save button or else they will be triggered multiple times.
        $('[id^=btnAddOk]').unbind('click');
    }
        
    function fetchData() {
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');
        doAjaxCall('/api/tenants/config/physical-routers-with-intf-count','GET', null, 'successHandlerForPhysicalRouters', 'failureHandlerForPhysicalRouters', null, null, 300000);
    }
    
    window.successHandlerForPhysicalRouters =  function(result) {
        var gridDS = [];
        if(result.length > 0) {
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
                var totalInterfacesCount = interfaces.length;
                var virtualRouterRefs = ifNull(rowData['virtual_router_refs'],[]);
                var virtualRouterString = '';
                
                var virtualRouters = ifNull(rowData['virtual-routers'],[]);
                var pRouterEditType = PROUTER_SUFFIX;
                var pRouterType = [PROUTER_TYPE];
                var logicalIntfCount = ifNull(rowData['logicalIntfCount'],0);
                totalInterfacesCount += logicalIntfCount;
                //Deduce the type for the prouter
                //If the prouter has a reference to virtual router which is a TSN then it is - OVSDB
                //If the prouter has a reference to virtual router which is a Embedded then it is - VCPE
                //If the prouter has autoconfig enabled then it is - NETCONF
                //Else it is PROUTER
                if(virtualRouters.length > 0){
                    $.each(virtualRouters, function(i,vrouter){
                        var vrString = vrouter['name'];
                        
                        if(vrouter['virtual_router_type'].indexOf('tor-service-node') >= 0){
                            vrString += ' (ToR Service Node)';
                            pRouterEditType = OVSDB_SUFFIX;
                            pRouterType = [OVSDB_TYPE];
                        }
                        if(vrouter['virtual_router_type'].indexOf('tor-agent') >= 0){
                            vrString += ' (ToR Agent)';
                        }
                        if(vrouter['virtual_router_type'].indexOf('embedded') >= 0){
                            vrString += ' (Embedded)';
                            pRouterEditType = VCPE_SUFFIX;
                            pRouterType = [VCPE_TYPE];
                        }
                        
                        if(i != 0)
                            virtualRouterString =  virtualRouterString + ', ' + vrString
                        else 
                            virtualRouterString = vrString;
                    });
                }
                
                var autoConfig = rowData['physical_router_vnc_managed'] != null ? (rowData['physical_router_vnc_managed'] ? 'Enabled' : 'Disabled') : '-';
                if(autoConfig == 'Enabled') {
                    pRouterEditType = NETCONF_SUFFIX;
                    pRouterType = [NETCONF_TYPE];
                }
                    
                //If SNMP enabled add SNMP enabled string to the type
                var snmpSettings = rowData['physical_router_snmp_credentials'];
                if(snmpSettings != null) {
                     pRouterType.push(SNMP_TYPE); 
                }
                
                var bgpRouters = ifNull(rowData['bgp_router_refs'],[]);
                var bgpRoutersString = '';
                $.each(bgpRouters, function(i,d){
                    if(i != 0)
                        bgpRoutersString =  bgpRoutersString + ', ' + d.to[4]
                    else 
                        bgpRoutersString = d.to[4];
                });
                var vnRefs = ifNull(rowData['virtual_network_refs'],[]);
                var vnsString = [];
                $.each(vnRefs, function(i,d){
                    vnsString.push(d.to[2] + ' (' + d.to[0] + ':' + d.to[1] + ')');
                });
                
                var credentials = rowData['physical_router_user_credentials'];
                var username = '-',password = '-';
                if(credentials != null){
                    username = credentials['username'];
                    password = credentials['password'];
                }
                var snmpCredentials = rowData['physical_router_snmp_credentials'];
                var isSNMPManaged = false;
                var snmpVersion = '-';
                var snmpLocalPort = '-';
                var snmpRetries = '-';
                var snmpTimeout = '-';
                var snmpV2Community = '-';
                var snmpV3SecurityEngineId = '-';
                var snmpV3SecurityName = '-';
                var snmpV3SecurityLevel = '-';
                var snmpV3SecurityEngineId = '-';
                var snmpv3AuthProtocol = '-';
                var snmpv3AuthPasswd = '-';
                var snmpv3PrivProtocol = '-';
                var snmpv3PrivPasswd = '-';
                var snmpv3Context = '-';
                var snmpv3ContextEngineId = '-';
                var snmpv3EngineId = '-';
                var snmpv3EngineBoots = '-';
                var snmpv3EngineTime = '-';
                
                if(snmpCredentials != null) {
                    isSNMPManaged = true;
                    snmpVersion = snmpCredentials['version'];
                    snmpLocalPort = snmpCredentials['local_port'] ? snmpCredentials['local_port'] : '-';
                    snmpRetries = snmpCredentials['retries'] ? snmpCredentials['retries'] : '-';
                    snmpTimeout = snmpCredentials['timeout'] ? snmpCredentials['timeout'] : '-';
                    if(snmpVersion == 2){
                        snmpV2Community = snmpCredentials['v2_community'] ? snmpCredentials['v2_community'] : '-';
                    } else if (snmpVersion == 3) {
                        snmpV3SecurityEngineId = snmpCredentials['v3_security_engine_id'] ? snmpCredentials['v3_security_engine_id'] : '-';
                        snmpV3SecurityName = snmpCredentials['v3_security_name'] ? snmpCredentials['v3_security_name'] : '-';
                        snmpV3SecurityLevel = snmpCredentials['v3_security_level']  ? snmpCredentials['v3_security_level'] : '-';
                        snmpV3SecurityEngineId = snmpCredentials['v3_security_engine_id'] ? snmpCredentials['v3_security_engine_id'] : '-';
                        if (snmpV3SecurityLevel == SNMP_AUTH) {
                            snmpv3AuthProtocol = snmpCredentials['v3_authentication_protocol'] ? snmpCredentials['v3_authentication_protocol'] : '-';
                            snmpv3AuthPasswd = snmpCredentials['v3_authentication_password'] ? snmpCredentials['v3_authentication_password'] : '-'
                        }
                        if (snmpV3SecurityLevel == SNMP_AUTHPRIV) {
                            snmpv3PrivProtocol = snmpCredentials['v3_privacy_protocol'] ? snmpCredentials['v3_privacy_protocol'] : '-';
                            snmpv3PrivPasswd = snmpCredentials['v3_privacy_password'] ? snmpCredentials['v3_privacy_password'] :'-';
                        }
                        snmpv3Context = snmpCredentials['v3_context'] ? snmpCredentials['v3_context'] :'-';
                        snmpv3ContextEngineId = snmpCredentials['v3_context_engine_id'] ? snmpCredentials['v3_context_engine_id'] : '-';
                        snmpv3EngineId = snmpCredentials['v3_engine_id'] ? snmpCredentials['v3_engine_id'] : '-';
                        snmpv3EngineBoots = snmpCredentials['v3_engine_boots'] ? snmpCredentials['v3_engine_boots'] : '-';
                        snmpv3EngineTime = snmpCredentials['v3_engine_time'] ? snmpCredentials['v3_engine_time'] : '-';
                    }
                }
                
                gridDS.push({
                    uuid : rowData.uuid,
                    name : rowData.name,
                    vendor : rowData['physical_router_vendor_name'] ? rowData['physical_router_vendor_name'] : '-',
                    mgmt_ip_address : rowData['physical_router_management_ip'] ? rowData['physical_router_management_ip'] : '-',
                    data_ip_address : rowData['physical_router_dataplane_ip'] ? rowData['physical_router_dataplane_ip'] : '-',
                    username : (username == '')? '-' : username,
                    password : password,
                    totalInterfacesCount : totalInterfacesCount,
                    bgp_routers : (bgpRoutersString == '')? '-' : bgpRoutersString,
                    virtual_networks : vnsString.length > 0 ? vnsString : '-',       
                    displayVirtualRouters : (virtualRouterString == '')? '-' : virtualRouterString,
                    virtualRouters : virtualRouters,
                    pRouterEditType : pRouterEditType,
                    pRouterType : pRouterType,
                    model : rowData['physical_router_product_name'] != null ? rowData['physical_router_product_name'] : '-',
                    auto_config : autoConfig,
                    isSNMPManaged:isSNMPManaged,
                    snmpVersion : snmpVersion,
                    snmpLocalPort : snmpLocalPort,
                    snmpRetries : snmpRetries,
                    snmpTimeout : snmpTimeout,
                    snmpV2Community : snmpV2Community,
                    snmpV3SecurityEngineId : snmpV3SecurityEngineId,
                    snmpV3SecurityName : snmpV3SecurityName,
                    snmpV3SecurityLevel : snmpV3SecurityLevel,
                    snmpv3AuthProtocol : snmpv3AuthProtocol,
                    snmpv3AuthPasswd : snmpv3AuthPasswd,
                    snmpv3PrivProtocol : snmpv3PrivProtocol,
                    snmpv3PrivPasswd : snmpv3PrivPasswd,
                    snmpv3Context : snmpv3Context,
                    snmpv3ContextEngineId : snmpv3ContextEngineId,
                    snmpv3EngineId : snmpv3EngineId,
                    snmpv3EngineBoots : snmpv3EngineBoots,
                    snmpv3EngineTime : snmpv3EngineTime
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
        doAjaxCall('/api/tenants/config/virtual-routers-detail','GET', null, 'successHandlerForVirtualRouters', 'failureHandlerForVirtualRouters', null, null);
    }
    
    window.successHandlerForVirtualRouters =  function(result) {
        var torAgentVrouterDS = [];
        var tsnVrouterDS = [];
        globalVRoutersMap = {};
        if(result && result['virtual-routers'] && result['virtual-routers'].length > 0) {
            result = result['virtual-routers'];
            for(var i = 0; i < result.length;i++) {
                var virtualRouter = result[i]['virtual-router'];
                var vRouterType = (virtualRouter['virtual_router_type'])? virtualRouter['virtual_router_type'][0] : '';
                vRouterType = (vRouterType != null && vRouterType != '')? vRouterType : 'hypervisor';
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
//                torAgentVrouterDS.push({text : 'No ToR Agent found', value: 'Message'});
            }
            if(tsnVrouterDS.length < 1) {
//                tsnVrouterDS.push({text : 'No TSN Agent found', value: 'Message'});
            }
        } else {
//            torAgentVrouterDS.push({text : 'No ToR Agent found', value: 'Message'});
//            tsnVrouterDS.push({text : 'No TSN found', value: 'Message'});
        }
        var selTor,selTsn;
        var torAgentDD = $('#ddTorAgentName' + currAddEditType).data('contrailCombobox');
        if(torAgentDD != null) {
            selTor = torAgentDD.text();
            torAgentDD.setData(torAgentVrouterDS);
        }
        var tsnAgentDD = $('#ddTsnName' + currAddEditType).data('contrailCombobox');     
        if(tsnAgentDD != null){
            selTsn = tsnAgentDD.text();
            tsnAgentDD.setData(tsnVrouterDS);
        }
        if(mode == 'edit') {  
            if(torAgentDD != null)
                torAgentDD.text(selTor);
            if(tsnAgentDD != null)
                tsnAgentDD.text(selTsn);
        }
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
                if(bgpRouter['vendor'] != null && bgpRouter['vendor'].toLowerCase() != 'contrail'){
                    bgpDS.push({text : bgpRouter.name, value : bgpRouter.uuid});
                }
            } 
        
        } else {
            bgpDS.push({text : 'No BGP Router found', value: 'Message'});
        }
        var bgpDD = $('[id^=ddBgpRouter]').data('contrailDropdown');            
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
                vnDS.push({text : fqname[2] + ' (' + fqname[0] + ':' + fqname[1] + ')', value : val, data : data});
            } 
        
        } else {
            vnDS.push({text : 'No VN found', value: 'Message'});
        }
        var msVNs = $('[id^=msVN]');
        for(var i=0; i < msVNs.length; i++){
            var msvn = msVNs[i];
            $(msvn).data('contrailMultiselect').setData(vnDS);
        };
    }
    
    window.failureHandlerForVNs = function(error) {
        gridPhysicalRouters.showGridMessage('errorGettingData');
    }
    
    function validate(pRouterType) {
        var name = $('#txtPhysicalRouterName' + pRouterType).val().trim();
        if(name  === ""){   
            showInfoWindow("Enter a Physical Router Name","Input required");
            return false;
        }
        if($('#txtMgmtIPAddress' + pRouterType).val() != '') {
            var mgmtIpAddress = $('#txtMgmtIPAddress' + pRouterType).val().trim();
            if(!validateIPAddress(mgmtIpAddress)){
                showInfoWindow("Enter a valid Management IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
        }
        if(pRouterType != NETCONF_SUFFIX){
            if($('#txtDataIPAddress' + pRouterType).val() != '') {
                var dataIpAddress = $('#txtDataIPAddress' + pRouterType).val().trim();
                if(!validateIPAddress(dataIpAddress)){
                    showInfoWindow("Enter a valid Dataplane IP address in xxx.xxx.xxx.xxx format","Input required");
                    return false;
                }
            }
        }
        var ddVirtualRoutersType = $('#ddVirtualRoutersType' + pRouterType).data('contrailDropdown');
        var ddTorAgentName = $('#ddTorAgentName' + pRouterType).data('contrailCombobox');
        var ddTsnName = $('#ddTsnName' + pRouterType).data('contrailCombobox');
        var vRouterType = "tor-agent";
        if(pRouterType == PROUTER_SUFFIX){
            vRouterType = ddVirtualRoutersType.value(); 
        } else {
            vRouterType = 'none';
        }
        if(vRouterType == "tor-agent") {
            if(ddTorAgentName.text() == ''){
                showInfoWindow("ToR Agent Name cannot be empty","Input required Virtual Router");
                return false;
            }
            if(ddTsnName.text() == ''){
                showInfoWindow("TSN Name cannot be empty","Input required Virtual Router");
                return false;
            }
            if(ddTorAgentName.text() != '' && ddTsnName.text() != ''){
                if(ddTorAgentName.text() == ddTsnName.text()){
                    showInfoWindow("ToR Agent Name and TSN Name cannot be same","Input error Virtual Router");
                    return false;
                }
            }
            if($('#txtTorAgentIp' + pRouterType).val() != '') {
                var dataIpAddress = $('#txtTorAgentIp' + pRouterType).val().trim();
                if(!validateIPAddress(dataIpAddress)){
                    showInfoWindow("Enter a valid ToR Agent IP address in xxx.xxx.xxx.xxx format","Input error Virtual Router");
                    return false;
                }
            } else {
                showInfoWindow("Enter a valid ToR Agent IP address in xxx.xxx.xxx.xxx format","Input required Virtual Router");
                return false;
            }
            if($('#txtTsnIp' + pRouterType).val() != '') {
                var dataIpAddress = $('#txtTsnIp' + pRouterType).val().trim();
                if(!validateIPAddress(dataIpAddress)){
                    showInfoWindow("Enter a valid TSN IP address in xxx.xxx.xxx.xxx format","Input error Virtual Router");
                    return false;
                }
            } else {
                showInfoWindow("Enter a valid TSN IP address in xxx.xxx.xxx.xxx format","Input required Virtual Router");
                return false;
            }
        } else if(vRouterType == "embedded"){
            var currVr = getVirtualRouterDetails(name);
            if(currVr !=null && currVr !='' && currVr.type != 'embedded' && currVr.type != 'hypervisor'){
                showInfoWindow("Virtual Router " + name + " (" + currVr.type + ") already exists.","Input required Virtual Router");
                return false;
            }
        }

        //SNMP Validation
        if (pRouterType == PROUTER_SUFFIX) {
            if($('#snmpVersion2' + pRouterType).is(':checked') == true){
                if($('#txtCommunity' + pRouterType).val() == ''){
                    showInfoWindow("Please enter community","Input error SNMP Credentials");
                    return false;
                }
            }
            if($('#txtRetries' + pRouterType).val() != '' && !$.isNumeric($('#txtRetries' + pRouterType).val())) {
                showInfoWindow("Retries should be a number","Input error SNMP Credentials");
                return false;
            }
            if($('#txtTimeout' + pRouterType).val() != '' && !$.isNumeric($('#txtTimeout' + pRouterType).val())) {
                showInfoWindow("Timeout should be a number","Input error SNMP Credentials");
                return false;
            }
            if($('#txtV3EngineBoots' + pRouterType).val() != '' && !$.isNumeric($('#txtV3EngineBoots' + pRouterType).val())) {
                showInfoWindow("Engine Boots should be a number","Input error SNMP Credentials");
                return false;
            }
            if($('#txtV3EngineTime' + pRouterType).val() != '' && !$.isNumeric($('#txtV3EngineTime' + pRouterType).val())) {
                showInfoWindow("Engine Time should be a number","Input error SNMP Credentials");
                return false;
            }
        }
        //SNMP Validations Ends
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
 
