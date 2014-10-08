/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
physicalRoutersConfigObj = new physicalRoutersConfig();
function physicalRoutersConfig() {
    //Variable Definations
    var gridPhysicalRouters;
    
    //Method Definations 
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
                    name : 'Name'                    
                },
                {
                    id : 'ip_address',
                    field : 'ip_address',
                    name : 'IP Address'                    
                },
                {
                    id : 'uuid',
                    field : 'uuid',
                    name : 'UUID'                    
                },
                {
                    id : 'interfaces',
                    field : 'interfaces',
                    name : 'Interfaces'                    
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
        var ddBgpDS = [{ text : 'peer1', value : 'peer1'},
            { text : 'peer2', value : 'peer2'}]
        ddBgp.setData(ddBgpDS); 

        //initializing physical router type multi select
        $('#msVN').contrailMultiselect({
            dataTextField:'text',
            dataValueField:'value',
        }); 

        var msVN =  $('#msVN').data('contrailMultiselect');
        var msVNDS = [{ text : 'vn1', value : 'vn1'},
            { text : 'vn2', value : 'vn2'},
            { text : 'vn3', value : 'vn3'},
            { text : 'vn4', value : 'vn4'}]
        msVN.setData(msVNDS);
        
      //initializing physical router type multi select
        $('#msVRouters').contrailMultiselect({
            dataTextField:'text',
            dataValueField:'value',
        }); 

        var msVRouters =  $('#msVRouters').data('contrailMultiselect');
        var msVRoutersDS = [{ text : 'vn1', value : 'vn1'},
            { text : 'vn2', value : 'vn2'},
            { text : 'vn3', value : 'vn3'},
            { text : 'vn4', value : 'vn4'}]
        msVRouters.setData(msVRoutersDS);
        
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
        if(mode === 'edit') {
            $('#txtPhysicalRouterName').val(gblSelRow.name);
            $('#txtPhysicalRouterName').attr('disabled','disabled');
            $('#txtIPAddress').val(gblSelRow.ip_address);
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
        var ipAddress = $("#txtIPAddress").val();
        var username = $("#txtUsername").val();
        var password = $("#txtPassword").val();
        var bgpRouter = $("#ddBgpRouter").data('contrailDropdown').value();
        var vn = $("#msVN").data('contrailMultiselect').value();
        var vRouters = $("#msVRouters").data('contrailMultiselect').value();
        var postObject = {};
        
        gridPhysicalRouters._dataView.setData([]);
        gridPhysicalRouters.showGridMessage('loading');    

        postObject["physical-router"] = {};
        postObject["physical-router"]["fq_name"] = ["default-global-system-config", name];
        postObject["physical-router"]["parent_type"] = "global-system-config";
        postObject["physical-router"]["name"] = name;
//        postObject["physical-router"]["physical_router_ip_address"] = ipAddress;
        postObject["physical-router"]["username"] = username;
        postObject["physical-router"]["password"] = password;
        postObject["physical-router"]["vn"] = vn;
        postObject["physical-router"]["vRouters"] = vRouters;
        doAjaxCall(url, methodType, JSON.stringify(postObject), 'successHandlerForPhysicalRouters', 'failureHandlerForPhysicalRouters', null, null);
    }
    
    function clearCreateEditWindow() {
        $('#txtPhysicalRouterName').removeAttr('disabled');
        $("#txtPhysicalRouterName").val('');
        $("#txtIPAddress").val('');
        $("#txtUsername").val('');
        $("#txtPassword").val('');
        $("#ddBgpRouter").data('contrailDropdown').value('');
        $("#msVN").data('contrailMultiselect').value(''); 
        $("#msVRouters").data('contrailMultiselect').value('');
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
                var interfaces = ifNull(rowData['physical_interfaces'],0);
                gridDS.push({
                    uuid : rowData.uuid,
                    name : rowData.name,
                    ip_address : rowData.physical_router_ip_address,
                    interfaces : interfaces.length
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
    
    function validate() {
        var name = $('#txtPhysicalRouterName').val().trim();
        if(name  === ""){   
            showInfoWindow("Enter a Physical Router Name","Input required");
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
 