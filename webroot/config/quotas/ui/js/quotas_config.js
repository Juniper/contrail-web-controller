/*
 *  Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
 
 quotasConfigObj = new quotasConfig();
 
 function quotasConfig() {
    //Variable definitions
    //Viewmodels
    var quotaList = [{key : "virtual_network", name : "Virtual Networks"},
        {key : "subnet", name :"Subnets"},
        {key : "virtual_machine_interface", name :"Ports"},        
        {key : "floating_ip", name : "Floating IPs"},
        {key : "floating_ip_pool", name :"Floating IP Pools"},
        //{key : "access_control_list", name : "Policies"},
        {key : "network_policy", name : "Policies"},
        {key : "logical_router", name : "Routers"},                
        {key : "network_ipam", name :"Network IPAMs"},      
        {key : "service_instance", name :"Service Instances"},
        {key : "security_group", name :"Security Groups"},
        {key : "security_group_rule", name :"Security Group Rules"},
        {key : "loadbalancer_pool", name :"Loadbalancer Pools"},
        {key : "loadbalancer_member", name :"Loadbalancer Members"},
        {key : "loadbalancer_healthmonitor", name :"Loadbalancer Health monitor"},
        {key : "virtual_ip", name :"Virtual IPs"}
    ];    
    //Grids    
    var gridQuotas, updateData;
    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForQuota = fetchDataForQuota;
    this.handleDomains = handleDomains;
    this.handleProjects = handleProjects;   
    this.bindDatatoGrid = bindDatatoGrid;
    this.initQuotaEditView = initQuotaEditView;
    this.validate = validate;
    this.destroy = destroy;

    function load() {
        var configTemplate = Handlebars.compile($("#quota-config-template").html());
        $(contentContainer).empty();
        $(contentContainer).html(configTemplate);
        init();    
    }
    
    function init() {
        initComponents();
        initActions();
        fetchData();
    }
    
    function fetchData() {
        fetchDomains("populateDomains", "failureHandlerForQuotaView");
    }
    
    function initComponents() {
       $("#gridQuotas").contrailGrid({
            header : {
                title : {
                    text : 'Project Quotas',
                    // cssClass : 'blue',
                    // icon : 'icon-list',
                    // iconCssClass : 'blue'                
                },
                customControls: ['<a id="btnEditQuota"  title="Edit Quotas"><i class="icon-edit"></i></a>',
                    'Project: <div id="ddProjectSwitcher"/>',
                    'Domain: <div id="ddDomainSwitcher" />']
            },
            columnHeader : {
                columns : [
                {
                    id : 'name',
                    field : 'name',
                    name : 'Resource',
                },
                {
                    id : 'value',
                    field : 'value',
                    name : 'Quota Limit',
                    formatter:function(r,c,v,cd,dc){
                        var data = dc['value'];
                        if(data === -1) {
                            return "Unlimited";
                        } else {
                            return (data != null && data != undefined)? data : 'Not Set';
                        }
                    }
                },
                {
                    id : 'used',
                    field : 'used',
                    name : 'Used',
                    formatter:function(r,c,v,cd,dc){
                        var data = dc['used'];
                        return (data != null && data!= undefined) ? data : '-';
                    }                    
                }]
            },
            body : {
                options : {
                    forceFitColumns : true,
                    editable: false,
                    autoEdit: false
                },
                dataSource : {
                    data : []
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Project Quotas..'
                    },
                    empty: {
                        text: 'No Project Quotas.'
                    }, 
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error in getting Project Quotas.' 
                    }
               }                          
            }
        });
        gridQuotas = $("#gridQuotas").data('contrailGrid');   
        gridQuotas.showGridMessage('loading');
        $("#ddDomainSwitcher").contrailDropdown({
            dataTextField:"text",
            dataValueField:"value",
            change:handleDomains
        });
        $("#ddProjectSwitcher").contrailDropdown({
            dataTextField:"text",
            dataValueField:"value",
        });
        $('#windowEditQuota').modal({backdrop:'static', keyboard: false, show:false});
        $('#windowEditQuota').find('.modal-header-title').text('Edit Project Quotas');
        initQuotaEditView();    
    }   
    
   
    function initQuotaEditView() {
        for(var quotaCnt = 0; quotaCnt < quotaList.length; quotaCnt++) { 
            var eleStr = '<div class="control-group">';  
            eleStr+= '<label class="control-label" class="span3">' + quotaList[quotaCnt].name + '</label>'; 
            eleStr+= '<div class="controls"><div class="row-fluid"><input type="text" id="' + quotaList[quotaCnt].key + '"  class="span8" /></div></div></div>'
            $("#quotaBody").append(eleStr); 
            $('#' + quotaList[quotaCnt].key).contrailCombobox({
                dataTextField : 'text',
                dataValueField : 'value',
                placeholder : 'Not Set'
            });            
        }
    }
    
    function initActions() {
        $('#btnEditQuotaSave').click(function(){
            if(validate()) {
                $('#windowEditQuota').modal('hide');  
                prepareUpdateData(updateData);
            }
        });
        $('#btnEditQuota').click(function(){
            if(!$(this).hasClass('disabled-link')) {
                $('#windowEditQuota').modal('show');  
                $('#windowEditQuota').find('.modal-body').scrollTop(0);
                populateQuotaEditPopup();
            }
        });
    }
    
    window.populateDomains = function(result) {
        if (result && result.domains && result.domains.length > 0) {
            var domains = [];
            for (i = 0; i < result.domains.length; i++) {
                var domain = result.domains[i];
                tmpDomain = {text:domain.fq_name[0], value:domain.uuid};
                domains.push(tmpDomain);
            }
            $("#ddDomainSwitcher").data("contrailDropdown").setData(domains);
            var sel_domain = getSelectedDomainProjectObjNew("ddDomainSwitcher", "contrailDropdown", 'domain');
            $("#ddDomainSwitcher").data("contrailDropdown").value(sel_domain);
            fetchProjects("populateProjects", "failureHandlerForGridVN");
        } else {
            $("#gridQuotas").data("contrailGrid")._dataView.setData([]);
            $('#btnEditQuota').addClass('disabled-link');
            setDomainProjectEmptyMsg('ddDomainSwitcher', 'domain');        
            setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
            gridQuotas.showGridMessage("empty");
            emptyCookie('domain');
            emptyCookie('project');        
        }
    }
    function handleDomains(e) {
        //Get projects for the selected domain.
        var dName = e.added.text;
        setCookie("domain", dName);    
        fetchProjects("populateProjects", "failureHandlerForQuotaView");
    }
    
    window.populateProjects = function(result) {
        if (result && result.projects && result.projects.length > 0) {
            //var projects = jsonPath(result, "$.projects[*].fq_name[1]");
            var projects = [];
            for (i = 0; i < result.projects.length; i++) {
                var project = result.projects[i];
                tempProjectDetail = {text:project.fq_name[1], value:project.uuid};
                projects.push(tempProjectDetail);
            }
            
            $("#ddProjectSwitcher").contrailDropdown({
                dataTextField:"text",
                dataValueField:"value",
                change:handleProjects
            });
            $('#btnEditQuota').removeClass('disabled-link');        
            $("#ddProjectSwitcher").data("contrailDropdown").enable(true);        
            $("#ddProjectSwitcher").data("contrailDropdown").setData(projects);
            var sel_project = getSelectedDomainProjectObjNew("ddProjectSwitcher", "contrailDropdown", 'project');
            $("#ddProjectSwitcher").data("contrailDropdown").value(sel_project);
            fetchDataForQuota();
        } else {
            $("#gridQuotas").data("contrailGrid")._dataView.setData([]);
            $('#btnEditQuota').addClass('disabled-link');
            setDomainProjectEmptyMsg('ddProjectSwitcher', 'project');
            gridQuotas.showGridMessage("empty");
            emptyCookie('domain');
            emptyCookie('project');        
        }
    }
    
    function handleProjects(e) {
        var pname = e.added.text;
        setCookie("project", pname);
        fetchDataForQuota();
    }
    
    window.failureHandlerForQuotaView = function(err) {
        gridQuotas.showGridMessage('errorGettingData');   
    }
    
    function fetchDataForQuota() {
        var selectedDomain = $("#ddDomainSwitcher").data("contrailDropdown").text();
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").getSelectedData()[0];
        if(!isValidDomainAndProject(selectedDomain, selectedProject.text)) {
            gridQuotas.showGridMessage('errorGettingData');
            return;
        }
        $("#gridQuotas").data("contrailGrid")._dataView.setData([]);
        gridQuotas.showGridMessage('loading');
        doAjaxCall("/api/tenants/config/project-quotas/" + selectedProject.value,
            "GET", null, "successHandlerForQuotasGrid", "failureHandlerForQuotasGrid", null, null);
    }
    
    window.successHandlerForQuotasGrid = function(result) {
        validateQuotaData(result);
    }
    
    function validateQuotaData(result) {
        if(result && result["project"]) {
            updateData = result    
            fetchQuotaUsedInfo()
        } else {
            gridQuotas.showGridMessage('errorGettingData');           
        }    
    }
    
    function fetchQuotaUsedInfo() {
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").getSelectedData()[0];  
        doAjaxCall("/api/tenants/config/quota-used/" + selectedProject.text,
            "GET", null, "successHandlerForQuotaUsed", "failureHandlerForQuotaUsed", null, null);    
    }
    
    window.successHandlerForQuotaUsed = function(usedInfo) {
        if(usedInfo) {
           bindDatatoGrid(usedInfo);      
        } else {
           showInfoWindow("Error in getting Quota used information.", "Error");    
           gridQuotas.showGridMessage('errorGettingData');
        }
    }
    
    window.failureHandlerForQuotaUsed = function(err) {
        gridQuotas.showGridMessage('errorGettingData');    
    }
    
    function populateQuotaEditPopup() {
        var data = updateData["project"]["quota"];
        for(var quotaCnt = 0;quotaCnt < quotaList.length;quotaCnt++) {
            var quotaKey = quotaList[quotaCnt].key;
            var comboDS = [{ text : 'Unlimited', value : -1 }];
            var selectedValue;
            if(quotaKey == "network_policy") {
                if(data["access_control_list"] !== null) {
                    selectedValue = data["access_control_list"];
                } else {
                    selectedValue = '';
                }
             } else {
                if(data[quotaKey] !== null) {
                    selectedValue = data[quotaKey];
                } else {
                    selectedValue = '';
                }             
             }
            var comboInstance =  $('#' + quotaKey).data('contrailCombobox');
            comboInstance.setData(comboDS);
            comboInstance.value(selectedValue);
        }        
    }
    
    function bindDatatoGrid(usedInfo) {
        var data = updateData["project"]["quota"];
        if(data != null && data != undefined) {
            var dsQuota = [];
            for(var quotaCnt = 0;quotaCnt < quotaList.length;quotaCnt++) {
                var quotaName = quotaList[quotaCnt].name; 
                var quotaKey = quotaList[quotaCnt].key;
                if(quotaKey == "network_policy") {
                    dsQuota.push({id :quotaCnt, name : quotaName, value : data["access_control_list"], used : usedInfo[quotaKey]});
                } else {
                    dsQuota.push({id :quotaCnt, name : quotaName, value : data[quotaKey], used : usedInfo[quotaKey]});
                }
            }       
            $("#gridQuotas").data("contrailGrid")._dataView.setData(dsQuota);    
         } else {
             gridQuotas.showGridMessage('empty');
         }
    }
    
    window.failureHandlerForQuotasGrid = function(err) {
        gridQuotas.showGridMessage('errorGettingData');
    }
    
    function validate() {
        var validateInt = '';        
        for(var quotaCnt = 0;quotaCnt < quotaList.length;quotaCnt++) {
            var quotaName = quotaList[quotaCnt].name;
            var quotaKey = quotaList[quotaCnt].key; 
            var comboInstanceValue = $('#' + quotaKey).data('contrailCombobox').value();
            if(comboInstanceValue != null && comboInstanceValue != "" && comboInstanceValue != undefined) {            
                var quotaValue = parseInt(comboInstanceValue);
                if(quotaValue < -1 || isNaN(quotaValue)) {
                   if(validateInt === '') {
                       validateInt = quotaName; 
                   } else {
                       validateInt+= ', ' + quotaName;   
                   }
                }
            }
        }    
        if(validateInt != '') {
            showInfoWindow("Enter valid  quota for " + validateInt, "Invalid input");
            return false;
        }
        return true;
    }
    
    function prepareUpdateData(data) {
        $("#gridQuotas").data("contrailGrid")._dataView.setData([]);
        gridQuotas.showGridMessage('loading');
        var selectedProject = $("#ddProjectSwitcher").data("contrailDropdown").getSelectedData()[0];
        var updateQuota = data["project"]["quota"];
        for(var quotaCnt = 0;quotaCnt < quotaList.length;quotaCnt++) {
            var quotaKey = quotaList[quotaCnt].key;
            var comboInstanceValue = $('#' + quotaKey).data('contrailCombobox').value();
            //Remove the below condition once separate policy is created in schema.
            if(quotaKey == "network_policy"){
                quotaKey = "access_control_list";
                //updateQuota["access_control_list"] = parseInt(comboInstanceValue);
            }
            updateQuota[quotaKey] = parseInt(comboInstanceValue);
        }
        doAjaxCall("/api/tenants/config/update-quotas/" + selectedProject.value,
            "PUT", JSON.stringify(data), "successHandlerForQuotasUpdate", "failureHandlerForQuotasUpdate", null, null);
        
    }
    
    window.successHandlerForQuotasUpdate = function(result) {
        validateQuotaData(result);
    }
    
    window.failureHandlerForQuotasUpdate = function(err) {
        gridQuotas.showGridMessage('errorGettingData'); 
    }
    
    function destroy() {
        var ddDomain = $("#ddDomainSwitcher").data("contrailDropdown");
        if(isSet(ddDomain)) {
            ddDomain.destroy();
            ddDomain = $();
        }
    
        var ddProject = $("#ddProjectSwitcher").data("contrailDropdown");
        if(isSet(ddProject)) {
            ddProject.destroy();
            ddProject = $();
        }
        
        var windowEditQuota = $("#windowEditQuota");
        if(isSet(windowEditQuota)) {
           windowEditQuota.remove();
           windowEditQuota = $();
        }
        
        var gridQuotas = $("#gridVNDetailTemplate");
        if(isSet(gridQuotas)) {
            gridQuotas.remove();
            gridQuotas = $();
        }
        
        var quotaConfigTemplate = $("#quota-config-template");
        if(isSet(quotaConfigTemplate)) {        
            quotaConfigTemplate.remove();
            quotaConfigTemplate = $();
        }    
        $("#quotaBody").empty()
    }
}

