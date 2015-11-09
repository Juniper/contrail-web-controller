/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
dnsRecordsConfigObj = new dnsRecordsConfig();

function dnsRecordsConfig() {
    //Variable Definations

    //Grids
    var gridDNSRecords, gridAssoicatedIPAMs;

    //Datasources
    var dsGridDNSRecords, dsGridAssociatedIPAMs;

    //buttons
    var btnAddRecord, btnDeleteRecord, txtRecordName, cmbRecordType, lblRecordTypeName, cmbRecordData, cmbRecordClass, txtRecordTTL, btnAddDNSRecordOk, btnAddDNSRecordCancel, btnDeleteDNSRecordOk, btnDeleteDNSRecordCancel;
    var availabelIPAMsLst, associatedIPAMsLst, chkAssoicatedIPAMs, btnMoveRight, btnMoveLeft, btnAssociatedOk, btnAssociatedCancel,editAssociatedWindowObj, btnEditAssociatedIPAMs
    var addRecordWindowObj;
    var deleteRecordWindowObj;
    var recordTypes = [];
    var parentUUID, currentUUID;
    var availabelLstView, assosicatedLstView, dsAvailableLstView = [], dsAssociatedLstView = [];
    var defaultTTL = 86400;
    var mode = "create";
    var disGlobal = "";
    var idCount = 0;
    var dsAjaxcount = 0;
    var ajaxParam;
    var selRecordDataItem;
    var deleteMainRecordWindowObj,btnDeleteMainDNSRecordOk,btnDeleteMainDNSRecordCancel;
    //Method Definations

    this.load = load;
    this.destroy = destroy;		
    this.isSpclChar = isSpclChar;

    function load() {
        var configTemplate = Handlebars.compile($("#DNSRecords-config-template").html());
        $(contentContainer).html('');
        $(contentContainer).html(configTemplate);
        init();
    }
	
    function init() {
        initComponents();
        initActions();
        fetchData();
    }
    
    function fetchData() {
        fetchDomains("populateDomainsForRecordsPage", "failureHandlerForDNSServer");
    }
    
    window.populateDomainsForRecordsPage = function(result) {
        if (result && result.domains && result.domains.length > 0) {
            var domains = [];
            for (i = 0; i < result.domains.length; i++) {
                var domain = result.domains[i];
                tmpDomain = {text : domain.fq_name[0], value : domain.uuid};
                domains.push(tmpDomain);
            }    
            $("#ddDomain").data("contrailDropdown").setData(domains);
            var sel_domain = getSelectedDomainProjectObjNew("ddDomain", "contrailDropdown", 'domain');              
            $("#ddDomain").data("contrailDropdown").value(sel_domain);
            //reading uuid from query string
            var queryParams = window.location.href.split("&");
            if(queryParams != undefined && queryParams.length > 1 && queryParams[1].indexOf('=') != -1) {
                currentUUID = queryParams[1].split('=')[1];  
            }                
            fetchDNSServerDataForRecordsPage();
        } else {
            $("#dnsRecordsGrid").data("contrailGrid")._dataView.setData([]);
            btnAddRecord.addClass('disabled-link');
            setDomainProjectEmptyMsg('ddDomain', 'domain');        
            gridDNSRecords.showGridMessage("empty");   
            emptyCookie('domain');            
        }	
    }

    function fetchDNSServerDataForRecordsPage() {
        var selectedDomain = $("#ddDomain").data("contrailDropdown").getSelectedData()[0];
        if(!isValidDomain(selectedDomain.text)){
            gridDNSRecords.showGridMessage("empty");
            return;
        }
        doAjaxCall(
            "/api/tenants/config/virtual-DNSs/" + selectedDomain.value, "GET",
            null, "successHandlerForDNSServer", "failureHandlerForDNSServer", null, null);
    }	

    window.successHandlerForDNSServer = function(result) {
        var dnsServers = jsonPath(result,"$..virtual-DNS");
        var ds = [];  
        if(dnsServers !=  undefined && dnsServers.length>0){
            btnAddRecord.removeClass('disabled-link')
            for(var i = 0;i < dnsServers.length;i++){
                var s = dnsServers[i];
                ds.push({text : s.name,value : s.uuid});		
            }
            var ddDNSServer = $("#ddDNSServers").data("contrailDropdown");
            ddDNSServer.setData(ds);
            ddDNSServer.text(ds[0].text);
            ddDNSServer.value(ds[0].value);
            ddDNSServer.enable(true);   
            if(currentUUID) {
                $("#ddDNSServers").data("contrailDropdown").value(currentUUID);
            }
            else{
                currentUUID = $("#ddDNSServers").data("contrailDropdown").value();
                //Push query parameter in URL
                layoutHandler.setURLHashParams({uuid:currentUUID},{triggerHashChange:false});
            }            
            fetchDNSRecordsData();
        }
        else{
            $("#dnsRecordsGrid").data("contrailGrid")._dataView.setData([]);        
            ds.push({text:'No DNS Server found',value:"Message"});
            var ddDNSServer = $("#ddDNSServers").data("contrailDropdown"); 
            ddDNSServer.setData(ds);
            ddDNSServer.text(ds[0].text);
            ddDNSServer.enable(false);
            btnAddRecord.addClass('disabled-link')
            gridDNSRecords.showGridMessage("empty");
        }
    }
    
    window.failureHandlerForDNSServer = function(error) {
        gridDNSRecords.showGridMessage("errorGettingData");
    }
	
    function initComponents() {
        //initializing the DNS Record Grid
        gridDNSRecords = $("#dnsRecordsGrid").contrailGrid({
            header : {
                title: {
                    text : 'DNS Records',
                    //cssClass : 'blue',
                    //icon : 'icon-list',
                    //iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnDeleteDNSRecord" class="disabled-link" title="Delete DNS Server(s)"><i class="icon-trash"></i></a>',
                    '<a id="btnCreateDNSRecord" title="Create DNS Server"><i class="icon-plus"></i></a>',
                    'DNS Server: <div id="ddDNSServers"/>',
                    'Domain: <div id="ddDomain" />']
            }, 
            columnHeader : {
                columns : [
                {
                    id : 'record_name',
                    field : 'record_name',
                    name : 'DNS Record Name'                    
                },
                {
                    id : 'record_type',
                    field : 'record_type',
                    name : 'DNS Record Type'                    
                },
                {
                    id : 'record_data',
                    field : 'record_data',
                    name : 'DNS Record Data'                    
                }]                
            },
            body : {
                options : {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteDNSRecord').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteDNSRecord').removeClass('disabled-link');
                        }
                    },                
                    forceFitColumns: true,
                    actionCell: [
                        {
                            title: 'Edit',
                            iconClass: 'icon-edit',
                            onClick: function(rowIndex){
                                dnsRecordEditWindow(rowIndex);
                            }
                        },
                        {
                            title: 'Delete',
                            iconClass: 'icon-trash',
                            onClick: function(rowIndex){
                                showRecDelWindow(rowIndex);
                            }
                        }
                    ],
                    detail : {
                        template : $("#gridDNSRecordDetailTemplate").html()
                    }    
			    },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading DNS Records..'
                    },
                    empty: {
                        text: 'No DNS Records.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting DNS Records.'
                    }
                }            
            }          
        });
        gridDNSRecords = $("#dnsRecordsGrid").data("contrailGrid");
        gridDNSRecords.showGridMessage('loading');
        
        btnAddRecord = $("#btnCreateDNSRecord");
        btnDeleteRecord = $("#btnDeleteDNSRecord");	
        txtRecordName = $("#txtRecordName");
        cmbRecordType = $("#cmbRecordType");
        lblRecordTypeName = $("#lblRecordTypeName");
        cmbRecordData = $("#cmbRecordData");
        cmbRecordClass = $("#cmbRecordClass");
        txtRecordTTL = $("#txtRecordTTL");
        btnAddDNSRecordOk = $("#btnAddDNSRecordOk");
        btnAddDNSRecordCancel = $("#btnAddDNSRecordCancel");
        addRecordWindowObj = $("#addRecordWindow");
        deleteRecordWindowObj = $("#confirmDelete");
        deleteMainRecordWindowObj = $("#confirmMainDelete");
        btnDeleteDNSRecordOk = $("#btnCnfDelPopupOK");
        btnDeleteDNSRecordCancel = $("#btnCnfDelPopupCancel");	
        btnDeleteMainDNSRecordOk = $("#btnCnfDelMainPopupOK");
        btnDeleteMainDNSRecordCancel = $("#btnCnfDelMainPopupCanceL");
        dsAjaxcount = 0;
        //populate record types array	
        recordTypes.push({value:'1',recordTypeName:'IP Address',recNamelbl:"Host Name",name:'A',text:'A (IP Address Record)',recNamePH:"Host Name to be resolved",recDataPH:"Enter an IP Address"});
        recordTypes.push({value:'2',recordTypeName:'Canonical Name',recNamelbl:"Host Name",name:'CNAME',text:'CNAME (Alias Record)',recNamePH:"Host Name",recDataPH:"Enter Canonical Name"});
        recordTypes.push({value:'3',recordTypeName:'Host Name',recNamelbl:'IP Address',name:'PTR',text:'PTR (Reverse DNS Record)',recNamePH:"Enter an IP Address",recDataPH:"Host Name"});		
        recordTypes.push({value:'4',recordTypeName:'DNS Server',recNamelbl:'Sub Domain',name:'NS',text:'NS (Delegation Record)',recNamePH:"Enter a Sub Domain",recDataPH:"Enter Host Name or IP or Select a DNS Server"});
        recordTypes.push({value:'5',recordTypeName:'Host Name',recNamelbl:'Domain',name:'MX',text:'MX (Mail Exchanger Record)',recNamePH:"Enter a Domain",recDataPH:"Enter Host Name"});
              
        cmbRecordType.contrailDropdown({
            dataTextField:'text',
            dataValueField:'value',
            change:onRecTypeSelChanged
        }); 
        var rType = cmbRecordType.data('contrailDropdown');
        rType.setData(recordTypes);
        rType.value(recordTypes[0].value);
        cmbRecordData.contrailCombobox({
            dataTextField : 'text',
            dataValueField : 'value'	
        });
        var selType = cmbRecordType.data("contrailDropdown").getSelectedData()[0];
        setRecordName(selType.recNamelbl);	
        setRecordNameHelpText(selType.recNamePH);	
        setRecordDataHelpText(selType.recDataPH);
        //populate record class array
        var recordClass=[];
        recordClass.push({name : 'IN',value : 1,text : 'IN (Internet)'});	

        cmbRecordClass.contrailDropdown({
            dataTextField : 'text',
            dataValueField : 'value',
        });
        cmbRecordClass.data('contrailDropdown').setData(recordClass);       
        txtRecordTTL.attr('placeholder', 'TTL(86400 secs)');
	       
        //initializing add record window	  	
        addRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});     
        addRecordWindowObj.find(".modal-header-title").text('Add DNS Record');
	         
        //initializing delete record window
        deleteRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});
        deleteRecordWindowObj.find(".modal-header-title").text('Confirm');
               
        deleteMainRecordWindowObj.modal({backdrop:'static',keyboard:false,show:false});
        deleteMainRecordWindowObj.find(".modal-header-title").text('Confirm');	
	
        //initialize domain drop down
        $("#ddDomain").contrailDropdown({
            dataTextField : 'text',
            dataValueField : 'value',
            change:handleDomains	     	
        });

        //innitialize DNS servers drop down
        $("#ddDNSServers").contrailDropdown({
            dataTextField : 'text',
            dataValueField : 'value',
            change:onServerSelChanged
        });
		
    }

    function setRecordNameHelpText(t) {
        txtRecordName.attr('placeholder', t);
    }
	
    function setRecordName(t) {
        $("#lblRecordName").text(t);
    }
    
    function setRecordDataHelpText(t){
        $('#cmbRecordData').parent().find('div').find('input').attr('placeholder', t);
        $("#txtRecordData").attr('placeholder', t);
    }
    
    window.showRecDelWindow = function(index) {
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
                        var selected_row = gridDNSRecords._dataView.getItem(index);
               	        deleteDNSRecord([selected_row]);
               	        $('#confirmRemove').modal('hide');
                    },
                    className: 'btn-primary'
                }]
            });
    }

    window.dnsRecordEditWindow = function(index) {
        gblSelRow = gridDNSRecords._dataView.getItem(index);
        createAddRecordWindow('edit');
    }	
	
    function handleDomains(e) {
        var dName = e.added.text;
        setCookie("domain", dName);    
        currentUUID = undefined;        
        fetchDNSServerDataForRecordsPage();
    }
    
    function onServerSelChanged(e) {
        currentUUID = $("#ddDNSServers").data("contrailDropdown").value();
        //Push query parameter in URL
        layoutHandler.setURLHashParams({uuid:currentUUID},{triggerHashChange:false});
        fetchDNSRecordsData();
    }

    function onRecTypeSelChanged(e) {
        makeRecordDataCall();	
    }
    
    function makeRecordDataCall(rowData) {
        selRecordDataItem = rowData != null ? rowData.record_data : null;
        var selectedItem = cmbRecordType.data('contrailDropdown').getSelectedData()[0];
        lblRecordTypeName.text(selectedItem.recordTypeName);
        setRecordName(selectedItem.recNamelbl);
        setRecordNameHelpText(selectedItem.recNamePH);
        //show mx preference only for mx record
        if(selectedItem.value === '5'){
            $('#mxPreference').show();
            if(rowData != null) {
                $('#txtMXPreference').val(rowData.record_mx_preference);
            }
        } else {
            $('#txtMXPreference').val('');
            $('#mxPreference').hide();
        }
        if(selectedItem.value === '4'){
            $("#txtRecordData").parent().hide();
            $("#cmbRecordData").parent().show();
            //getting dns server info to populate combo
           //doAjaxCall('/api/tenants/config/virtual-DNSs/' + parentUUID,'GET', null, 'successHandlerForRecordData', 'failureHandlerForRecordData', null, null);
           doAjaxCall('/api/tenants/config/virtual-DNSs','GET', null, 'successHandlerForRecordData', 'failureHandlerForRecordData', null, null);
        }
        else{
            $("#txtRecordData").parent().show(); 
            var c = $("#cmbRecordData").data("contrailCombobox");
            c.setData([]);
            $("#cmbRecordData").parent().hide(); 
            var c = $("#txtRecordData");
            if(rowData == undefined)
                c.val('');
            else
                c.val(rowData.record_data);
            setRecordDataHelpText(selectedItem.recDataPH);        
        }
    }

    window.successHandlerForRecordData = function(result) {
        var actRes = jsonPath(result,'$..virtual-DNS');
        populateRecordDataCombo(actRes);
    }
	
    window.failureHandlerForRecordData = function(error) {
    }
	
    function populateRecordDataCombo(res) {
        if(res.length > 0){
            var selDomain = $("#ddDomain").data("contrailDropdown").getSelectedData()[0]; 
            if(!isValidDomain(selDomain.text))
                return;

            var cmbRecData = $("#cmbRecordData").data("contrailCombobox");
            if(selDomain !== undefined){
                selDomain=selDomain.text;	
            }
            else
                selDomain = '';
            var selDNSServer = $("#ddDNSServers").data("contrailDropdown").text();
            var dnsNames = []; 	
            for(var resCount = 0;resCount < res.length;resCount++){
                //if(selDNSServer !== res[resCount].name)
                    dnsNames.push({text : res[resCount]["fq_name"].join(":"), value : resCount});
            }
            cmbRecData.setData(dnsNames);
		    var selectedItem = cmbRecordType.data('contrailDropdown').getSelectedData()[0];
            setRecordDataHelpText(selectedItem.recDataPH);
            if(selRecordDataItem != undefined)
                cmbRecData.text(selRecordDataItem); 
        }	
    }

    function initActions() {
        //Show MX Preference only for record_type MX
        Handlebars.registerHelper('showMXPreference', function(recType){
             return recType === 'MX (Mail Exchanger Record)' ? 'show' : 'hide';
        });
        btnAddRecord.click(function(e){
            if(!$(this).hasClass('disabled-link')) { 
                e.preventDefault();
                createAddRecordWindow("create");
            }
        });
		
        btnAddDNSRecordOk.click(function(e){
            e.preventDefault();	
            saveRecordDetails();	
        });
		
        btnDeleteRecord.click(function(args){	
            if(!$(this).hasClass('disabled-link')) { 
                deleteMainRecordWindowObj.modal("show");
            }    
        });
        
        btnDeleteMainDNSRecordOk.click(function(args){
            var selected_rows = gridDNSRecords.getCheckedRows();
            deleteMainRecordWindowObj.modal("hide");
            deleteDNSRecord(selected_rows);
        });


        //handle key down validations
        /*txtRecordName.bind('keydown',function(e){
            handleSpecialCharectersWithDot(e);
        });
		
        $("#cmbRecordData").bind('keydown',function(e){
            handleSpecialCharectersWithDot(e);
        })*/
    }
	
    function deleteDNSRecord(selected_rows) {
        btnDeleteRecord.addClass('disabled-link');	
        if(selected_rows && selected_rows.length > 0){
            var deleteAjaxs = [];
            for(var i = 0;i < selected_rows.length;i++){
                var sel_row_data = selected_rows[i];
                deleteAjaxs[i] = $.ajax({
                    url:'/api/tenants/config/virtual-DNS/' + currentUUID + '/virtual-DNS-record/' + sel_row_data['uuid'],
                    type:'DELETE'
                });
            }
            $.when.apply($,deleteAjaxs).then(
                function(response){
                    //all success
                    fetchDNSRecordsData();
                },
                function(){
                    //if at least one delete operation fails
                    var r = arguments;
                    showInfoWindow(r[0].responseText,r[2]);		
                    fetchDNSRecordsData();
                }
            );
        }
    }

    function handleSpecialCharecters(e) {
        var k = e.keyCode;
        if((!(k>=48 && k<=57) && !(k>=65 && k<=90)&& !(k>=96 && k<=105) && !(e.shiftKey && (k>=65 && k<=90)) && !(k==38 || k==40 ||k ==37 ||k==39||k==9 ||k==8||k==35||k==36||k==45||k==46||k==189||k==144))|| (e.shiftKey && (k>=48 && k<=57)) ||(e.shiftKey && k ==189)) {
            e.preventDefault();
        }
    }	
    
    function handleSpecialCharectersWithDot(e) {
        var k = e.keyCode;
        if((!(k>=48 && k<=57) && !(k>=65 && k<=90)&& !(k>=96 && k<=105) && !(e.shiftKey && (k>=65 && k<=90)) && !(k==38 || k==40 ||k ==37 ||k==39||k==9 ||k==8||k==35||k==36||k==45||k==46||k==189|| k==144||k==190||k==110))|| (e.shiftKey && (k>=48 && k<=57)) ||(e.shiftKey && k ==189)||(e.shiftKey && k==190)) {
            e.preventDefault();
        } 
    }
    
    function validate() {
        var rn = txtRecordName.val().trim();
        if(rn  === ""){	
            var txt = $("#lblRecordName").text();
            showInfoWindow("Enter a "+txt,"Input required");
            return false;
        }
        if($("#lblRecordName").text() === "IP Address"){
            if(!validateIPAddress(rn)){
                showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format","Input required");
                return false;
            }
        }
        if(getRecordDataItem() === ""){
            var txt = $("#lblRecordTypeName").text();
            var art;
            if(txt === "IP Address")
                art = "an ";
            else
                art = "a ";
            showInfoWindow("Enter " + art + txt,"Input required");
            return false;
        }
        var c;
        var rd = cmbRecordType.data('contrailDropdown').value();
        if(rd === "4") {
            c = $("#cmbRecordData").data("contrailCombobox").text();
        }    
        else {
            c = $("#txtRecordData").val(); 
        }    
        if(rd === "1"){
            if(! validateIPAddress(c)){
                showInfoWindow("Enter a valid IP address in xxx.xxx.xxx.xxx format", "Input required");
                return false;
            }	
        }
        var v = $("#txtRecordTTL").val().trim();
        if(v !== ""){
            if(allowNumeric(v)){	
                if(!validateTTLRange(parseInt(v))){
                    showInfoWindow('Time To Live value should be in  "0 - 2147483647" range', "Input required");
                    return false;
                }	
            }
            else {
                showInfoWindow("Time To Live value should be  a number", "Input required");
                return false;
            }
        }
        if(rd === "5") {
            var mxPref = $('#txtMXPreference').val();
            if(mxPref == null || mxPref.trim() == ""){
                showInfoWindow("Enter the MX Preference", "Input required");
                return false;
            } else {
                var prefValue = parseInt(mxPref);
                if(isNaN(prefValue) || prefValue < 0 || prefValue > 65535) {
                    showInfoWindow('MX Preference value should be a number in "0 - 65535" range',
                        "Invalid input in MX Preference");
                    return false;
                }
            }
        }
        return isSpclChar(c);	
    }
	
    function isSpclChar(txt) {
        if(txt === null || txt === undefined) {
            return false;
        }
        var iChars = "!@#$%^&*()+=_[]|';,/{}|\"<>?~`";
        for(var i = 0;i < txt.length;i++) {
            if(iChars.indexOf(txt[i]) != -1) {
    			showInfoWindow("Record data field has special characters. \nThese are not allowed.\n");
     			return false;
   		    }
        }
        return true;
    }

    function getRecordDataItem() {
        var t = cmbRecordType.data('contrailDropdown').getSelectedData()[0];
        var recordData; 
        if(t.value === "4"){ 
            recordData = $("#cmbRecordData").data("contrailCombobox").text();
        } 
        else{
            recordData = $("#txtRecordData").val(); 
        }
        return recordData;
    }		
	
    function resetAddRecordWindow() {
        $("#txtRecordData").parent().show();
        $("#cmbRecordData").parent().hide(); 
        txtRecordName.val('');
        var d = $("#cmbRecordType").data('contrailDropdown');
        d.enable(true);
        rTypeData = d.getAllData();
        d.value(rTypeData[0].value);
        var selType = d.getSelectedData()[0];
        setRecordName(selType.recNamelbl);
        setRecordNameHelpText(selType.recNamePH);
        setRecordDataHelpText(selType.recDataPH);
        lblRecordTypeName.text(selType.recordTypeName);
        var c = $("#cmbRecordData").data('contrailCombobox');	
        c.setData([]);
        c.text('');
        $("#txtRecordData").val('');
        var e = $("#cmbRecordClass").data('contrailDropdown');
        rClassData = e.getAllData();
        e.value(rClassData[0].value);
        e.enable(true);
        txtRecordTTL.val('');
        defaultTTL = 86400;
        $('#txtMXPreference').val('');
        $('#mxPreference').hide();
    }
		
    function saveRecordDetails() {
        if(!validate())return false;
            hideAddRecordWindow();
        //get user entries
        var recordName = txtRecordName.val();
        var recordTypeItem = cmbRecordType.data('contrailDropdown').getSelectedData()[0];
        var recordType = recordTypeItem.name;
        var recordData = getRecordDataItem();
        var recordClass = cmbRecordClass.data('contrailDropdown').getSelectedData()[0].name;
        if(txtRecordTTL.val() != undefined && txtRecordTTL.val() !='')
            defaultTTL = txtRecordTTL.val();
        var recordTTL = parseInt(defaultTTL,10);
        //prepare post object
        var selDomain = $("#ddDomain").data("contrailDropdown").text();	
        var defaultDomainName = $("#ddDNSServers").data("contrailDropdown").text();        
        var postData = {};
        postData["parent_type"] = "domain";
        postData["fq_name"]	= [selDomain, String(defaultDomainName)];
        postData["virtual_DNS_records"] = [{"to" : [selDomain,String(defaultDomainName)],
            "virtual_DNS_record_data":{
                 "record_name" : recordName,"record_type" : recordType, "record_data" : recordData, "record_class" : recordClass, "record_ttl_seconds" : recordTTL}}];
        if(recordTypeItem.value === "5") {
            postData["virtual_DNS_records"][0]["virtual_DNS_record_data"]["record_mx_preference"] =
                parseInt($('#txtMXPreference').val());
        }
        var dnsRecordCfg = {};
        dnsRecordCfg["virtual-DNS"] = postData;
        var url,type;
        if(mode === "create"){
            url = "/api/tenants/config/virtual-DNS/"+currentUUID+"/virtual-DNS-records";
            type = "POST";
        }
        else if(mode === "edit"){
            url = '/api/tenants/config/virtual-DNS/'+currentUUID+'/virtual-DNS-record/'+gblSelRow['uuid'];
            type = "PUT";
        }
        doAjaxCall(url, type, JSON.stringify(dnsRecordCfg), "successHandlerForDNSRecordSave", 
            "failureHandlerForDNSRecordSave" , null, null);
    }

    window.successHandlerForDNSRecordSave = function(res) {
        fetchDNSRecordsData();		
    }

    window.failureHandlerForDNSRecordSave = function(error) {
        fetchDNSRecordsData();   
    }
	
    function createAddRecordWindow(m) {
        mode = m;
        resetAddRecordWindow();
        if(mode === "edit"){
            addRecordWindowObj.find(".modal-header-title").text('Edit DNS Record');
            populateAddRecordWindow();
        }
        else{
            addRecordWindowObj.find(".modal-header-title").text('Add DNS Record');
        }
        addRecordWindowObj.modal('show');
        txtRecordName.focus();
    }
    function populateAddRecordWindow() {
        var selRow = gblSelRow;
        var d = $("#cmbRecordType").data('contrailDropdown');	
        txtRecordName.val(selRow.record_name);
        var selRecType = selRow.record_type;
        d.text(selRecType); 
        d.enable(false);
        //var selRecData = selRow.record_data;
        makeRecordDataCall(selRow);
        var c = $("#cmbRecordClass").data("contrailDropdown"); 
        var RecClassData = c.getAllData();
        for(var i = 0; i < RecClassData.length; i++) {
            if(RecClassData[i].name === selRow.record_class) {
                 c.text(RecClassData[i].text); 
                 break;                 
            }
        };
        c.enable(false);
        txtRecordTTL.val(selRow.record_ttl_seconds);
    }
	
    function hideAddRecordWindow() {
        addRecordWindowObj.modal('hide');
    }
	
    function fetchDNSRecordsData() { 	
        gridDNSRecords._dataView.setData([]);
        gridDNSRecords.showGridMessage("loading");
        idCount = 0;
        dsAjaxcount++;
        ajaxParam = currentUUID + "_" + dsAjaxcount;
        doAjaxCall("/api/admin/config/get-data?type=virtual-DNS-record&count=4&fqnUUID=" + currentUUID, "GET", null, "successHandlerForDNSRecords", "failureHandlerForDNSRecords", null, ajaxParam);	
    }
	
    window.successHandlerForDNSRecords = function(result,cbParam) {
        //trim virtual-DNSi
        if(ajaxParam != cbParam){
            return;
        }
        $(".headerRowCheckbox").attr("checked",false);  	
        if(result.more == true || result.more == "true"){
            doAjaxCall("/api/admin/config/get-data?type=virtual-DNS-record&count=4&fqnUUID="+ 
                currentUUID +"&lastKey="+result.lastKey, 
                "GET", null, "successHandlerForDNSRecords", "failureHandlerForDNSRecords", null, cbParam); 
        }
	
        //prepare datasource for the DNSRecords grid
        prepareDataSourceForDNSRecordsGrid(result);
    }
       
    function getActualRecType(t) {
        var n = '';
        for(var i = 0;i < recordTypes.length;i++){
            if(recordTypes[i].name === t){
                n = recordTypes[i].text;
                break;
            }
        }
        return n;
    }	

    function prepareDataSourceForDNSRecordsGrid(result) {
        var selectedDomain = $("#ddDomain").data("contrailDropdown").getSelectedData()[0];  
        parentUUID = selectedDomain.value;    
        if(result && result.data && result.data['virtual-DNS'] && result.data['virtual-DNS'].virtual_DNS_records.length > 0) {
            gridDNSRecords.removeGridMessage();
            var actRes = jsonPath(result,"$..virtual-DNS");
            var response = actRes[0];
            var dnsRecords = response.virtual_DNS_records;
            if(dnsRecords != undefined && dnsRecords.length >0){
                var dataSource = [];
                for(var recordCount = 0;recordCount < dnsRecords.length;recordCount++){
                    var dnsRecordsData = dnsRecords[recordCount].virtual_DNS_record_data;
                    dataSource.push({
                        "Id" : idCount++,
                         "uuid" : dnsRecords[recordCount].uuid,
                         "record_name" : dnsRecordsData["record_name"],
                         "record_type" : getActualRecType(dnsRecordsData["record_type"]),
                         "record_data" : dnsRecordsData["record_data"],
                         "record_ttl_seconds" : dnsRecordsData["record_ttl_seconds"],
                         "record_class" : dnsRecordsData["record_class"],
                         "record_mx_preference" : dnsRecordsData["record_mx_preference"] ? dnsRecordsData["record_mx_preference"]: '-'
                   });
                }
                gridDNSRecords._dataView.addData(dataSource);
            }
            if(result.more == true || result.more == "true"){
                gridDNSRecords.showGridMessage("loading");
            }
        }else {
            gridDNSRecords.showGridMessage("empty");
        }
    }

    window.failureHandlerForDNSRecords = function(error) {
        gridDNSRecords.showGridMessage("errorGettingData");
    }
	
    function destroy() {
        var ddDomain = $("#ddDomain").data("contrailDropdown");
        if(isSet(ddDomain)) {
            ddDomain.destroy();
            ddDomain = $();
        }

        btnAddRecord = $("#addRecordBtn");
        if(isSet(btnAddRecord)) {
            btnAddRecord.remove();
            btnAddRecord = $();
        }

        btnDeleteRecord = $("#deleteBtn");
        if(isSet(btnDeleteRecord)) {
            btnDeleteRecord.remove();
            btnDeleteRecord = $();
        }

        btnAddDNSRecordOk = $("#btnAddDNSRecordOk");
        if(isSet(btnAddDNSRecordOk)) {
            btnAddDNSRecordOk.remove();
            btnAddDNSRecordOk = $();
        }

        btnAddDNSRecordCancel = $("#btnAddDNSRecordCancel");
        if(isSet(btnAddDNSRecordCancel)) {
            btnAddDNSRecordCancel.remove();
            btnAddDNSRecordCancel = $();
        }

        btnDeleteDNSRecordOk = $("#btnCnfDelPopupOK");
        if(isSet(btnDeleteDNSRecordOk)) {
            btnDeleteDNSRecordOk.remove();
            btnDeleteDNSRecordOk = $();
        }
        
        btnDeleteDNSRecordCancel = $("#btnCnfDelPopupCancel");
        if(isSet(btnDeleteDNSRecordCancel)) {
            btnDeleteDNSRecordCancel.remove();
            btnDeleteDNSRecordCancel = $();
        }
        
        btnDeleteMainDNSRecordOk = $("#btnCnfDelMainPopupOK");
        if(isSet(btnDeleteMainDNSRecordOk)) {
            btnDeleteMainDNSRecordOk.remove();
            btnDeleteMainDNSRecordOk = $();
        }
        
        btnDeleteMainDNSRecordCancel = $("#btnCnfDelMainPopupCanceL");
        if(isSet(btnDeleteMainDNSRecordCancel)) {
            btnDeleteMainDNSRecordCancel.remove();
            btnDeleteMainDNSRecordCancel = $();
        }

        txtRecordName = $("#txtRecordName");
        if(isSet(txtRecordName)) {
            txtRecordName.remove();
            txtRecordName = $();
        }

        txtRecordTTL = $("#txtRecordTTL");
        if(isSet(txtRecordTTL)) {
            txtRecordTTL.remove();
            txtRecordTTL = $();
        }

        lblRecordTypeName = $("#lblRecordTypeName");
        if(isSet(lblRecordTypeName)) {
            lblRecordTypeName.remove();
            lblRecordTypeName = $();
        }

        var ddDNSServers = $("#ddDNSServers").data("contrailDropdown");
        if(isSet(ddDNSServers)) {
            ddDNSServers.destroy();
            ddDNSServers = $();
        }

        if(isSet(dsGridDNSRecords)) {
            dsGridDNSRecords = $();    
        }

        cmbRecordType = $("#cmbRecordType").data("contrailDropdown");
        if(isSet(cmbRecordType)) {
            cmbRecordType.destroy();
            cmbRecordType = $();
        }
        
        cmbRecordData = $("#cmbRecordData").data("contrailCombobox");
        if(isSet(cmbRecordData)) {
            cmbRecordData.destroy();
            cmbRecordData = $();
        }

        cmbRecordClass = $("#cmbRecordClass").data("contrailDropdown");
        if(isSet(cmbRecordClass)) {
            cmbRecordClass.destroy();
            cmbRecordClass = $();
        }

        addRecordWindowObj = $("#addRecordWindow");
        if(isSet(addRecordWindowObj)) {
            addRecordWindowObj.remove();
            addRecordWindowObj = $();
        }

        deleteMainRecordWindowObj = $("#confirmMainDelete");
        if(isSet(deleteMainRecordWindowObj)) {
            deleteMainRecordWindowObj.remove();
            deleteMainRecordWindowObj = $();
        }

        deleteRecordWindowObj = $("#confirmDelete");
        if(isSet(deleteRecordWindowObj)) {
            deleteRecordWindowObj.remove();
            deleteRecordWindowObj = $();
        }
        
        var configTemplate = $("#DNSRecords-config-template");
        if(isSet(configTemplate)) {
        	configTemplate.remove();
        	configTemplate = $();
        }
	}
}
