/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

PacketCaptureObj = new PacketCapture();
var packetCaptureRuleIndex = 0;
function PacketCapture() {
    //Variable definitions
    var ddDomain, ddProject, ddIPOptions; //Dropdowns
    var gridAnalyzer; //Grids
    var btnCreateAnalyzer, btnDeleteAnalyzer, btnCreateAnalyzerCancel, btnCreateAnalyzerOK, btnAddRule, btnDeleteRule, btnCnfDelAnalyzerPopupOK, btnCnfDelAnalyzerPopupCancel; //Buttons
    var txtPolicyName, txtAnalyzerName; //Textboxes
    var msAssociatedNetworks; //Multiselects
    var dlVirtualNetwork; //Droplist
    var windowCreateAnalyzer, confirmDelete; //Windows
    var isAnalyzerImageAvailable = false;
    var isAnalyzerImageCheckDone = false;

    //Method definitions
    this.load = load;
    this.init = init;
    this.initComponents = initComponents;
    this.initActions = initActions;
    this.fetchData = fetchData;
    this.fetchDataForGridAnalyzer = fetchDataForGridAnalyzer;
    this.populateDomains = populateDomains;
    this.handleDomains = handleDomains;
    this.populateProjects = populateProjects;
    this.handleProjects = handleProjects;
    this.gridAnalyzerRowChange = gridAnalyzerRowChange;
    this.showAnalyzerEditWindow = showAnalyzerEditWindow;
    this.closeCreateAnalyzerWindow = closeCreateAnalyzerWindow;
    this.successHandlerForGridAnalyzer = successHandlerForGridAnalyzer;
    this.failureHandlerForGridAnalyzer = failureHandlerForGridAnalyzer;
    this.createAnalyzerSuccessCB = createAnalyzerSuccessCB;
    this.createAnalyzerFailureCB = createAnalyzerFailureCB;
    this.createPolicySuccessCB = createPolicySuccessCB;
    this.createPolicyFailureCB = createPolicyFailureCB;
    this.validate = validate;
    this.destroy = destroy;
};

function load() {
    var configTemplate = Handlebars.compile($("#analyzer-config-template").html());
    $(contentContainer).empty();
    $(contentContainer).html(configTemplate);
    currTab = 'config_net_policies';
    init();
};

function init() {
    this.initComponents();
    this.initActions();
    this.fetchData();
    initWidgetBoxes();
};

function fetchData() {
    fetchDomains("populateDomains");
};

function initComponents() {
    
    $("#gridAnalyzer").contrailGrid({
    	header : {
			title : {
				text : 'Analyzers'
			},
			customControls: ['<a id="btnDeleteAnalyzer" class="disabled-link" title="Remove Analyzer(s)"><i class="icon-trash"></i></a>',
	                            '<a id="btnCreateAnalyzer" title="Create Analyzer"><i class="icon-plus"></i></a>',
	                            'Project:<div id="ddProjectSwitcher" />',
	                            'Domain: <div id="ddDomainSwitcher" />']
		},
		columnHeader : {
			columns : [
			{
				id: 'AnalyzerName',
				field: 'AnalyzerName',
				name: 'Analyzer Name',
				width: 200,
				sortable: true
			},
			{
				id: "VirtualNetwork",
				field: "VirtualNetwork",
				name: "Virtual Network",
				width: 150
			},
			{
				id:"AssociatedNetwork",
				field:"AssociatedNetwork",
				name:"Associated Networks",
				width: 150,
				formatter: function(r, c, v, cd, dc) {
					var returnString = '';
					if(typeof dc.AssociatedNetworks === "object") {
						for(var i=0;i < dc.AssociatedNetworks.length,i<2;i++) {
							if(typeof dc.AssociatedNetworks[i] !== "undefined") {
								returnString += dc.AssociatedNetworks[i] + '<br>';
							}
						}
						if(dc.AssociatedNetworks.length > 2) {
							returnString += '<span class="moredataText">(' + (dc.AssociatedNetworks.length - 2) + ' more)</span> \
							<span class="moredata" style="display:none;" ></span>';
						}
					}
					return returnString;
				},
				exportConfig: {
					allow: true,
					advFormatter: function(dc) {
						return dc.AssociatedNetworks.join(',');
					}
				}
			},
			{
				id:"PolicyRules",
				field:"PolicyRules",
				name:"Analyzer Rules",
				width: 500,
				formatter: function(r, c, v, cd, dc) {
					var returnString = '';
					if(typeof dc.PolicyRules === "object") {
						for(var i=0;i < dc.PolicyRules.length,i<2;i++) {
							if(typeof dc.PolicyRules[i] !== "undefined") {
								returnString += dc.PolicyRules[i] + '<br>';
							}
						}
				  
						if(dc.PolicyRules.length > 2) {
							returnString += '<span class="moredataText">(' + (dc.PolicyRules.length-2) + ' more  )</span> \
							<span class="moredata" style="display:none;" ></span>';
						}
					}
					
					return returnString;
				},
				exportConfig: {
					allow: true,
					advFormatter: function(dc) {
						return dc.PolicyRules.join(',');
					}
				}
			},
			{
				id:"vmStatus",
				field:"vmStatus",
				width: 100,
				name:"Status",
				formatter: function(r, c, v, cd, dc) {
					var vmStatus = dc.vmStatus;
					return '<span class="status-badge-rounded status-' + vmStatus.toLowerCase().split(' ').join('-') + '"></span>' + vmStatus;
				},
				exportConfig: {
					allow: true,
					stdFormatter: false
				}
			}
			]
		},
		body : {
			options : {
				autoHeight : true,
				checkboxSelectable: {
					onNothingChecked: function(e){
						$('#btnDeleteAnalyzer').addClass('disabled-link');
					},
					onSomethingChecked: function(e){
						$('#btnDeleteAnalyzer').removeClass('disabled-link');
					}
				},
				forceFitColumns: true,
				actionCell: [
					{
						title: 'Edit',
						iconClass: 'icon-edit',
						onClick: function(rowIndex){
							showAnalyzerEditWindow('edit',rowIndex);
						}
					},
					{
						title: 'View Analyzer',
						iconClass: 'icon-list-alt',
						onClick: function(rowIndex){
							launchAnalyzer(rowIndex);
						}
					},
					{
						title: 'Delete',
						iconClass: 'icon-trash',
						onClick: function(rowIndex){
							showRemoveWindow(rowIndex);
						}
					}
				],
				detail: {
					template: $('#analyzerDetailTemplate').html()
				}
			},
			dataSource : {
				data : []
			},
			statusMessages: {
				loading: {
					text: 'Loading Analyzers...',
				},
				empty: {
					text: 'No Analyzers Found.'
				}, 
				errorGettingData: {
					type: 'error',
					iconClasses: 'icon-warning',
					text: 'Error in getting Data.'
				}
			}
		},
		footer : {
			pager : {
				type : 'client',
				options : {
					pageSize : 50,
					pageSizeSelect : [5, 10, 50, 100]
				}
			}
		}
	});
    
    gridAnalyzer = $('#gridAnalyzer').data('contrailGrid');

    btnCreateAnalyzer = $("#btnCreateAnalyzer");
    btnCreateAnalyzer = $("#btnCreateAnalyzer");
    btnDeleteAnalyzer = $("#btnDeleteAnalyzer");
    btnAddRule = $("#btnAddRule");
    btnDeleteRule = $("#btnDeleteRule");
    btnCreateAnalyzerCancel = $("#btnCreateAnalyzerCancel");
    btnCreateAnalyzerOK = $("#btnCreateAnalyzerOK");
    btnCnfDelAnalyzerPopupOK = $('#btnCnfDelAnalyzerPopupOK');
    btnCnfDelAnalyzerPopupCancel = $('#btnCnfDelAnalyzerPopupCancel');
    
    txtPolicyName = $("#txtPolicyName");
    txtAnalyzerName = $("#txtAnalyzerName");

    $("#ddDomainSwitcher").contrailDropdown({
        change: handleDomains,
        dataTextField:"text",
        dataValueField:"value"
    });
    ddDomain = $("#ddDomainSwitcher").data('contrailDropdown');

    $("#ddProjectSwitcher").contrailDropdown({
        change:handleProjects,
        dataTextField:"text",
        dataValueField:"value"
    });
    ddProject = $("#ddProjectSwitcher").data('contrailDropdown');

    msAssociatedNetworks = $("#msAssociatedNetworks").contrailMultiselect({placeholder:"Select Networks..."});
    $("#dlVirtualNetwork").contrailDropdown({placeholder: "Select Network..."});
    // Use dropdownCssClass : 'select2-large-width' when initialzing ContrailDropDown to specify width of dropdown for Contrail Dropdown
    // Adding a custom CSS class is also possible. Just add a custom class to the contrail.custom.css file
    dlVirtualNetwork = $("#dlVirtualNetwork").data('contrailDropdown');

    gridAnalyzer.showGridMessage('loading');
    
    $('body').append($("#windowCreateAnalyzer"));
    windowCreateAnalyzer = $("#windowCreateAnalyzer");
    windowCreateAnalyzer.on("hide", closeCreateAnalyzerWindow);
    windowCreateAnalyzer.modal({backdrop:'static', keyboard: false, show:false});
    
    $('body').append($("#confirmDelete"));
    confirmDelete = $("#confirmDelete");
    confirmDelete.modal({backdrop:'static', keyboard: false, show:false});
};

function showRemoveWindow(rowIndex) {
    $.contrailBootstrapModal({
       id: 'confirmRemove',
       title: 'Remove',
       body: '<h6>Confirm Removing record</h6>',
       footer: [{
           title: 'Cancel',
           onclick: 'close',
       },
       {
           id: 'btnRemovePopupOK',
           title: 'Confirm',
           onclick: function(){
               var selected_rows = gridAnalyzer._dataView.getItem(rowIndex);
               deleteAnalyzers([selected_rows]);
               $('#confirmRemove').modal('hide');
           },
           className: 'btn-primary'
       }
       ]
   });
 }

function deleteAnalyzers(selectedRows){
	var deleteAjaxs = [];
    if (selectedRows && selectedRows.length > 0) {
        for (var i = 0; i < selectedRows.length; i++) {
        	deleteAjaxs[i] = $.ajax({
                url:"/api/tenants/config/service-instance/" + selectedRows[i]["AnalyzerUUID"] + "?policyId=" + selectedRows[i]["PolicyUUID"],
                type:"DELETE"
            });
        }
    	
    	var selectedRowIds = [];
    	$.each(selectedRows, function(key,val) {
    		selectedRowIds.push(val.id);
    	});
    	
    	gridAnalyzer._dataView.deleteDataByIds(selectedRowIds);
        
    	$.when.apply($, deleteAjaxs).then(
            function () {
                //all success
                var results = arguments;
                fetchDataForGridAnalyzer();
            },
            function () {
                //If atleast one api fails
                var results = arguments;
                fetchDataForGridAnalyzer();
            }
      	);
    }
    $("#vnc-console-widget").find('.icon-remove').click();
}

function initActions() {
    btnCreateAnalyzer.click(function (e) {
        e.preventDefault();
        if(PacketCaptureObj.isAnalyzerImageCheckDone) {
            if(PacketCaptureObj.isAnalyzerImageAvailable) {
                showAnalyzerEditWindow("add");
            } else {
                showInfoWindow("Analyzer image is not found. Please ensure that a valid image of name analyzer is present.", "Warning");
            }
        } else {
            showInfoWindow("Waiting to get the analyzer image. Please try again after few seconds.", "Message");
        }
        return false;
    });

    btnDeleteAnalyzer.click(function (a) {
    	if(!$(this).hasClass('disabled-link')){
            confirmDelete.find('.modal-header-title').text("Confirm");
            confirmDelete.modal('show');
    	}
    });
    
    btnCnfDelAnalyzerPopupOK.click(function (a) {
        var selected_rows = gridAnalyzer.getCheckedRows();
        deleteAnalyzers(selected_rows);
        confirmDelete.modal('hide');
    });

    btnCnfDelAnalyzerPopupCancel.click(function(a){
    	confirmDelete.modal('hide');
    });
    
    btnCreateAnalyzerCancel.click(function (a) {
        windowCreateAnalyzer.hide();
    });

    btnCreateAnalyzerOK.click(function () {
        if (validate()) {
            var analyzerPolicy, analyzer;
            if (txtAnalyzerName[0].disabled == true) {
                mode = "edit";
                analyzerPolicy = getAnalyzerPolicy();
                var policyUUID = jsonPath(configObj, "$.network-policys[?(@.fq_name[2]=='" + txtPolicyName.val() + "')]")[0].uuid;
                doAjaxCall("/api/tenants/config/policy/" + policyUUID, "PUT", JSON.stringify(analyzerPolicy), "createPolicySuccessCB", "createPolicyFailureCB");
            } else {
                mode = "add";
                analyzer = getAnalyzer();
                doAjaxCall("/api/tenants/config/service-instances", "POST", JSON.stringify(analyzer), "createAnalyzerSuccessCB", "createAnalyzerFailureCB");
            }
        }
    });
};

function appendRuleEntry(who, defaultRow) {
    var ruleEntry = createRuleEntry();
    if (defaultRow) {
        $("#ruleTuples").prepend(ruleEntry);
    } else {
        var parentEl = who.parentNode.parentNode.parentNode;
        parentEl.parentNode.insertBefore(ruleEntry, parentEl.nextSibling);
    }
};

function createRuleEntry(rule) {
	packetCaptureRuleIndex++;
    var selectProtocol = document.createElement("div");
    $(selectProtocol).attr('id','selectProtocol-' + packetCaptureRuleIndex);
    selectProtocol.className = "span2 pull-left";
    var selectProtocolData = ['Any', 'TCP', 'UDP', 'ICMP'];

    var selectSrcNetwork = document.createElement("div");
    selectSrcNetwork.className = "span2 pull-left selectSrcNetwork";
    $(selectSrcNetwork).attr('id','selectSrcNetwork-' + packetCaptureRuleIndex);
    var selectSrcNetworkData = ["any","local"];
    
    var inputTxtSrcPorts = document.createElement("input");
    inputTxtSrcPorts.type = "text";
    inputTxtSrcPorts.className = "span12";
    inputTxtSrcPorts.setAttribute("placeholder", "Source ports");
    var divRowFluidSrcPorts = document.createElement("div");
    divRowFluidSrcPorts.className = "span2";
    divRowFluidSrcPorts.appendChild(inputTxtSrcPorts);

    var selectDirection = document.createElement("div");
    selectDirection.className = "span1 pull-left selectDirection";
    $(selectDirection).attr('id','selectDirection-' + packetCaptureRuleIndex);
    var selectDirectionData = ['<>', '>'];

    var selectDestNetwork = document.createElement("div");
    selectDestNetwork.className = "span2 pull-left selectDestNetwork";
    $(selectDestNetwork).attr('id','selectDestNetwork-' + packetCaptureRuleIndex);
    selectDestNetworkData = ["any","local"];
    
    var inputTxtDestPorts = document.createElement("input");
    inputTxtDestPorts.type = "text";
    inputTxtDestPorts.className = "span12";
    inputTxtDestPorts.setAttribute("placeholder", "Destination ports");
    var divRowFluidDestPorts = document.createElement("div");
    divRowFluidDestPorts.className = "span2";
    divRowFluidDestPorts.appendChild(inputTxtDestPorts);
    var iBtnAddRule = document.createElement("i");
    iBtnAddRule.className = "icon-plus";
    iBtnAddRule.setAttribute("onclick", "appendRuleEntry(this);");
    iBtnAddRule.setAttribute("title", "Add rule below");

    var divPullLeftMargin5Plus = document.createElement("div");
    divPullLeftMargin5Plus.className = "pull-right margin-5";
    divPullLeftMargin5Plus.appendChild(iBtnAddRule);

    var iBtnDeleteRule = document.createElement("i");
    iBtnDeleteRule.className = "icon-minus";
    iBtnDeleteRule.setAttribute("onclick", "deleteRuleEntry(this);");
    iBtnDeleteRule.setAttribute("title", "Delete rule");

    var divPullLeftMargin5Minus = document.createElement("div");
    divPullLeftMargin5Minus.className = "pull-right margin-5";
    divPullLeftMargin5Minus.appendChild(iBtnDeleteRule);

    var divRowFluidMargin10 = document.createElement("div");
    divRowFluidMargin10.className = "row-fluid margin-0-0-5";
    divRowFluidMargin10.appendChild(selectProtocol);
    divRowFluidMargin10.appendChild(selectSrcNetwork);
    divRowFluidMargin10.appendChild(divRowFluidSrcPorts);
    divRowFluidMargin10.appendChild(selectDirection);
    divRowFluidMargin10.appendChild(selectDestNetwork);
    divRowFluidMargin10.appendChild(divRowFluidDestPorts);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Plus);
    divRowFluidMargin10.appendChild(divPullLeftMargin5Minus);

    var rootDiv = document.createElement("div");
    rootDiv.className = 'rule-item';
    $(rootDiv).data('ruleIndex', packetCaptureRuleIndex);
    rootDiv.appendChild(divRowFluidMargin10);

    var vns = msAssociatedNetworks.data("contrailMultiselect").getAllData();
    for (var i = 0; i < vns.length; i++) {
        var vn = vns[i];
        selectSrcNetworkData.push(vn.id);
        selectDestNetworkData.push(vn.id);
    }
    $(selectProtocol).contrailDropdown({
    	placeholder: 'Select Protocol', 
    	data: selectProtocolData
    });
    
    $(selectSrcNetwork).contrailDropdown({
    	placeholder: 'Source network (any)',
    	data: selectSrcNetworkData
    });

    $(selectDirection).contrailDropdown({
    	placeholder: 'Direction (<>)',
    	data: selectDirectionData
    });
    
    $(selectDestNetwork).contrailDropdown({
    	placeholder: 'Destination network (any)',
    	data: selectDestNetworkData
    });

    var sts = jsonPath(configObj, "$.service_templates[*].service-template");
    var nonAnalyzerInsts = [];
    var serviceInsts = [];
    if (null !== sts && sts.length > 0) {
        for (var i = 0; i < sts.length; i++) {
            if (sts[i].service_template_properties.service_type !== "analyzer") {
                if (typeof sts[i].service_instance_back_refs !== "undefined" && sts[i].service_instance_back_refs.length > 0) {
                    for (var j = 0; j < sts[i].service_instance_back_refs.length; j++) {
                        nonAnalyzerInsts[nonAnalyzerInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                        serviceInsts[serviceInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                    }
                }
            } else {
                if (typeof sts[i].service_instance_back_refs !== "undefined" && typeof sts[i].service_instance_back_refs[j] !== "undefined"
                    && typeof sts[i].service_instance_back_refs[j].to !== "undefined" && typeof sts[i].service_instance_back_refs[j].to[2] !== "undefined") {
                    serviceInsts[serviceInsts.length] = sts[i].service_instance_back_refs[j].to[2];
                }
            }
        }
    }

    if (null !== rule && typeof rule !== "undefined") {

        var protocol = rule["protocol"];
        if (null !== protocol && typeof protocol !== "undefined") {
            protocol = protocol.toUpperCase();
            $(selectProtocol).data("contrailDropdown").value(protocol);
        }
        var direction = rule["direction"];
        if (null !== direction && typeof direction !== "undefined") {
            direction = direction.toUpperCase();
            $(selectDirection).data("contrailDropdown").value(direction);
        }

        if (null !== rule["src_addresses"] && typeof rule["src_addresses"] !== "undefined" &&
            rule["src_addresses"].length > 0) {
            var srcNetwork = [];
            for (var i = 0; i < rule["src_addresses"].length; i++) {
                if (null !== rule["src_addresses"][i]["virtual_network"] &&
                    typeof rule["src_addresses"][i]["virtual_network"] !== "undefined") {
                    srcNetwork[i] = getVNName(rule["src_addresses"][i]["virtual_network"]);
                }
            }
            var srcNw = srcNetwork.join();
            $(selectSrcNetwork).data("contrailDropdown").value(srcNw);
        }
        if (null !== rule["dst_addresses"] && typeof rule["dst_addresses"] !== "undefined" &&
            rule["dst_addresses"].length > 0) {
            var destNetwork = [];
            for (var i = 0; i < rule["dst_addresses"].length; i++) {
                if (null !== rule["dst_addresses"][i]["virtual_network"] &&
                    typeof rule["dst_addresses"][i]["virtual_network"] !== "undefined") {
                    destNetwork[i] = getVNName(rule["dst_addresses"][i]["virtual_network"]);
                }
            }
            var destNw = destNetwork.join();
            $(selectDestNetwork).data("contrailDropdown").value(destNw);
        }

        if (null !== rule["src_ports"] && typeof rule["src_ports"] !== "undefined" &&
            rule["src_ports"].length > 0) {
            var portDesc = [];
            if (rule["src_ports"].length === 1 && rule["src_ports"][0]["start_port"] === -1) {
                $(inputTxtSrcPorts).val("Any");
            } else {
                for (var i = 0; i < rule["src_ports"].length; i++) {
                    if (rule["src_ports"][i]["end_port"] !== -1)
                        portDesc[i] = rule["src_ports"][i]["start_port"] + " - " + rule["src_ports"][i]["end_port"];
                    else
                        portDesc[i] = rule["src_ports"][i]["start_port"];
                }
                $(inputTxtSrcPorts).val(portDesc.join(","));
            }
        }

        if (null !== rule["dst_ports"] && typeof rule["dst_ports"] !== "undefined" &&
            rule["dst_ports"].length > 0) {
            var portDesc = [];
            if (rule["dst_ports"].length === 1 && rule["dst_ports"][0]["start_port"] === -1) {
                $(inputTxtDestPorts).val("Any");
            } else {
                for (var i = 0; i < rule["dst_ports"].length; i++) {
                    if (rule["dst_ports"][i]["end_port"] !== -1)
                        portDesc[i] = rule["dst_ports"][i]["start_port"] + " - " + rule["dst_ports"][i]["end_port"];
                    else
                        portDesc[i] = rule["dst_ports"][i]["start_port"];
                }
                $(inputTxtDestPorts).val(portDesc.join(","));
            }
        }
    }
    return rootDiv;
};

function deleteRuleEntry(who) {
    var templateDiv = who.parentNode.parentNode.parentNode;
    $(templateDiv).remove();
    templateDiv = $();
};

function populateDomains(result) {
    var domainsJSON, domainsDS = [];
    if (result && result.domains && result.domains.length > 0) {
        domainsJSON = result.domains;
        for (var i = 0; i < domainsJSON.length; i++) {
            domainsDS.push({text:domainsJSON[i]['fq_name'][0], value:domainsJSON[i]['uuid']});
        }
        ddDomain.setData(domainsDS);
        ddDomain.value(domainsDS[0].value);
    }
    fetchProjects("populateProjects");
};

function handleDomains() {
   fetchDataForGridAnalyzer();
};

function populateProjects(result) {
    var projectJSON, projectDS = [];
    if (result && result.projects && result.projects.length > 0) {
        projectJSON = result.projects;
        for (var i = 0; i < projectJSON.length; i++) {
            projectDS.push({"text":projectJSON[i]['fq_name'][1], "value":projectJSON[i]['uuid']});
        }
        ddProject.setData(projectDS);
        var selProjectObj = getNewSelectedProjectObj();
        $("#ddProjectSwitcher").data("contrailDropdown").value(selProjectObj);
    }
    check4AnalyzerImage();
    fetchDataForGridAnalyzer();
};
function getNewSelectedProjectObj() {
    var cookiedProject = getCookie("project"),
        firstProjectName = $("#ddProjectSwitcher").data('contrailDropdown').getAllData()[0].text;
    if (cookiedProject === false) {
        setCookie("project", firstProjectName);
        return firstProjectName;
    } else {
        for (var i = 0; i < $("#ddProjectSwitcher").data('contrailDropdown').getAllData().length; i++) {
            var pname = $("#ddProjectSwitcher").data('contrailDropdown').getAllData()[i].text;
            if (pname === cookiedProject) {
                return $("#ddProjectSwitcher").data('contrailDropdown').getAllData()[i].value;
            }
        }
    }
    setCookie("project", firstProjectName);
    return firstProjectName;
}
function handleProjects(e) {
    var pname = $(e.target).data('contrailDropdown').text();
    setCookie("project", pname);
    fetchDataForGridAnalyzer();
};

function fetchDataForGridAnalyzer() {
    var selectedProjectUUID = $(ddProjectSwitcher).data('contrailDropdown').value();
    var url = "/api/tenants/config/service-instances/" + selectedProjectUUID + "?template=analyzer-template";
    gridAnalyzer.showGridMessage('loading');
    doAjaxCall(url, "GET", null, "successHandlerForGridAnalyzer", "failureHandlerForGridAnalyzer", null, null);
};

function successHandlerForGridAnalyzer(result) {
    var uuids = jsonPath(result, "$..policyuuid");
    var getAjaxs = [];
    for (var i = 0; i < uuids.length; i++) {
        getAjaxs[i] = $.ajax({
            url:"/api/tenants/config/policy/" + uuids[i],
            type:"GET"
        });
    }
    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            var analyzerPolicy = arguments;
            successHandlerForGridAnalyzerRow(analyzerPolicy, result.service_instances);
        },
        function () {
            //If atleast one api fails
            var results = arguments;
            failureHandlerForGridAnalyzerRow(results);
        });
};

function failureHandlerForGridAnalyzer(result) {
	gridAnalyzer.showGridMessage('errorGettingData');
};

function successHandlerForGridAnalyzerRow(analyzerPolicy, analyzers) {
    var analyzerData = [];
    var policies = jsonPath(analyzerPolicy, "$..network-policy");
    configObj["network-policys"] = [];
    var reload = false;
    var virtualNetwork = "Automatic";
    for (var i = 0; i < policies.length; i++) {
        configObj["network-policys"][i] = policies[i];
        var policy = policies[i], vmUUId;
        var policyName = jsonPath(policy, "$.fq_name[2]");

        if (typeof policyName === "object" && policyName.length === 1)
            policyName = policyName[0];
        else
            policyName = "-";

        var uuid = jsonPath(policy, "$.uuid");
        if (typeof uuid === "object" && uuid.length === 1)
            uuid = uuid[0];

        var networks = jsonPath(policy, "$.virtual_network_back_refs[*].to[2]");
        if (networks === false) {
            networks = ["-"];
        }

        if (policy["network_policy_entries"] && policy["network_policy_entries"]["policy_rule"] &&
            policy["network_policy_entries"]["policy_rule"].length > 0) {
            var ruleDescriptions = [];
            var policyEntries = policy["network_policy_entries"]["policy_rule"];
            for (var j = 0; j < policyEntries.length; j++) {
                var rule = policyEntries[j];
                ruleDescriptions[j] = formatPolicyRule(rule);
            }
        } else {
            ruleDescriptions = ["-"];
        }
        var vmBackRefs = analyzers[i]['ConfigData']['service-instance']['virtual_machine_back_refs'];
        if(vmBackRefs == null || vmBackRefs.length == 0) {
            vmUUId = null;
            reload = true;
        } else {
            vmUUId = vmBackRefs[0]["uuid"];
        }
        if(analyzers[i]['ConfigData']['service-instance']['service_instance_properties']['left_virtual_network'] != "") {
            virtualNetwork = getVNName(analyzers[i]['ConfigData']['service-instance']['service_instance_properties']['left_virtual_network']);
        } else {
            virtualNetwork = "Automatic";
        }

        analyzerData.push({
            "Id":i, "NetworkPolicy":policyName, "PolicyRules":ruleDescriptions, "PolicyUUID":uuid, "AnalyzerName":analyzers[i]['ConfigData']['service-instance']['fq_name'][2],
            "VirtualNetwork": virtualNetwork, "AnalyzerUUID":analyzers[i]['ConfigData']['service-instance']['uuid'],
            "AssociatedNetworks":networks, "VMUUID": vmUUId, vmStatus: analyzers[i].vmStatus
        });
    }
    if(analyzerData.length == 0){
    	gridAnalyzer.showGridMessage('empty');
    }
    else{
    	gridAnalyzer._dataView.setData(analyzerData);
    }
    
    if(reload) {
        setTimeout("fetchDataForGridAnalyzer()", 30000);
    }
};

function failureHandlerForGridAnalyzerRow(result, cbParam) {
	gridAnalyzer.showGridMessage('errorGettingData');
};

function initgridAnalyzerDetail(e) {
};

function gridAnalyzerRowChange(arg) {
};

function closeCreateAnalyzerWindow() {
    clearValuesFromDomElements();
};

function clearValuesFromDomElements() {
    mode = "";
    txtPolicyName.val("");
    txtAnalyzerName.val("");
    txtAnalyzerName[0].disabled = false;
    msAssociatedNetworks.data("contrailMultiselect").value("");
    dlVirtualNetwork.value("Automatic");
    dlVirtualNetwork.enable(true);
    clearRuleEntries();
};

function clearRuleEntries() {
    var tuples = $("#ruleTuples")[0].children;
    if (tuples && tuples.length > 0) {
        var tupleLength = tuples.length;
        for (var i = 0; i < tupleLength; i++) {
            $(tuples[0]).remove();
        }
    }
};

function launchAnalyzer(rowIndex) {
	var selectedProject = $("#ddProjectSwitcher").data('contrailDropdown').text();
	var selectedRow = gridAnalyzer._dataView.getItem(rowIndex);
    var vmUUID = selectedRow['VMUUID'];
    var analyzerName = selectedRow['AnalyzerName'];
    if(vmUUID == null) {
        showInfoWindow("Analyzer is not ready. Please try after few minutes.", "Launch Analyzer");
    } else {
        var url = "/api/tenants/config/service-instance-vm?project_id=" + selectedProject + "&vm_id=" + vmUUID;
        doAjaxCall(url, "GET", null, "launchAnayzerInstanceCB", "failureLaunchVNCcb", false, {"sameWindow": true, "title": "VNC Console: " + analyzerName});
    }
};

function launchAnayzerInstanceCB(result, cbParams){
    var href = jsonPath(result, "$.console.url")[0];
    document.getElementById("consoleText").innerHTML = "";
    document.getElementById("consoleText").innerHTML = "If console is not responding to keyboard input: click the grey status bar below.&nbsp;&nbsp;<a href='"+href+"' style='text-decoration: underline' target=_blank>Click here to show only console</a>";
    launchVNCcb(result, cbParams);
    $("body").animate({scrollTop:$("body")[0].scrollHeight-$("#vnc-console-widget").height()-60}, 1500);

}

function showAnalyzerEditWindow(mode,rowIndex) {
    var selectedDomain = $("#ddDomainSwitcher").data('contrailDropdown').text();
    var selectedProject = $("#ddProjectSwitcher").data('contrailDropdown').text();
    var getAjaxs = [];
    getAjaxs[0] = $.ajax({
        url:"/api/tenants/config/virtual-networks?tenant_id=" + selectedDomain + ":" + selectedProject,
        type:"GET"
    });

    var selectedDomainUUID = $(ddDomainSwitcher).val();
    getAjaxs[1] = $.ajax({
        url:"/api/tenants/config/service-instance-templates/" + selectedDomainUUID,
        type:"GET"
    });

    $.when.apply($, getAjaxs).then(
        function () {
            //all success
            clearValuesFromDomElements();
            var results = arguments;
            var vns = jsonPath(results[0][0], "$.virtual-networks[*].fq_name[2]");
            var vnsWithAutomatic = ["Automatic"].concat(vns);
            var virtualNetworks = jsonPath(results[0][0], "$.virtual-networks[*]");
            configObj["virtual-networks"] = [];
            if (null !== virtualNetworks && typeof virtualNetworks === "object" && virtualNetworks.length > 0) {
                for (var i = 0; i < virtualNetworks.length; i++) {
                    configObj["virtual-networks"][i] = {};
                    configObj["virtual-networks"][i] = virtualNetworks[i];
                }
            }

            msAssociatedNetworks.data("contrailMultiselect").setData(vns);
            dlVirtualNetwork.setData(vnsWithAutomatic);

            var sts = jsonPath(results[1][0], "$.service_templates[*].service-template");
            configObj["service_templates"] = [];
            if (null !== sts && sts.length > 0) {
                for (var i = 0; i < sts.length; i++) {
                    configObj["service_templates"][i] = {};
                    configObj["service_templates"][i]["service-template"] = sts[i];
                }
            }

            if (mode === "add") {
                windowCreateAnalyzer.find('.modal-header-title').text('Create Analyzer');
            } else if (mode === "edit") {
                var selectedRow = gridAnalyzer._dataView.getItem(rowIndex);
                windowCreateAnalyzer.find('.modal-header-title').text('Edit Analyzer: ' + selectedRow.AnalyzerName);
                txtPolicyName.val(selectedRow.NetworkPolicy);
                txtAnalyzerName.val(selectedRow.AnalyzerName);
                txtAnalyzerName[0].disabled = true;

                dlVirtualNetwork.value(selectedRow.VirtualNetwork);
                dlVirtualNetwork.enable(false);

                var rowId = selectedRow["Id"];
                var selectedAnalyzer = configObj["network-policys"][rowId];

                var networks = jsonPath(selectedAnalyzer, "$.virtual_network_back_refs[*].to[2]");
                if (networks && networks.length > 0) {
                    msAssociatedNetworks.data("contrailMultiselect").value(networks);
                } else {
                    msAssociatedNetworks.data("contrailMultiselect").value("");
                }
                if (selectedAnalyzer["network_policy_entries"] && selectedAnalyzer["network_policy_entries"]["policy_rule"] &&
                    selectedAnalyzer["network_policy_entries"]["policy_rule"].length > 0) {
                    var policyEntries = selectedAnalyzer["network_policy_entries"]["policy_rule"];
                    for (var j = 0; j < policyEntries.length; j++) {
                        var rule = policyEntries[j];
                        var ruleEntry = createRuleEntry(rule);
                        $(ruleTuples).append(ruleEntry);
                    }
                }
            }
            windowCreateAnalyzer.modal("show");
        },
        function () {
            //If atleast one api fails
            var results = arguments;

        });
};

function createAnalyzerSuccessCB() {
    var analyzerPolicyName = getDefaultAnalyzerPolicyName(txtAnalyzerName.val());
    var analyzerPolicy = getAnalyzerPolicy(analyzerPolicyName);
    doAjaxCall("/api/tenants/config/policys", "POST", JSON.stringify(analyzerPolicy), "createPolicySuccessCB", "createPolicyFailureCB");
};

function createAnalyzerFailureCB(error) {
    windowCreateAnalyzer.modal("hide");
    showInfoWindow("Error in Analyzer creation: " + error.responseText, "Error");
};

function createPolicySuccessCB() {
    windowCreateAnalyzer.modal("hide");
    fetchDataForGridAnalyzer();
};

function createPolicyFailureCB() {
    windowCreateAnalyzer.modal("hide");
    fetchDataForGridAnalyzer();
};

function validate() {
    if (validateAnalyzer() && validatePolicy()) {
        return true;
    } else {
        return false;
    }
};

function validatePolicy() {
    return true;
};

function validateAnalyzer() {
    if ($(txtAnalyzerName).val().trim() == "") {
        showInfoWindow("Enter a valid instance name.", "Input Required.");
        return false;
    }
    return true;
};

function destroy() {
    windowCreateAnalyzer = $("#windowCreateAnalyzer");
    windowCreateAnalyzer.remove();
    windowCreateAnalyzer = $();
    
    confirmDelete = $("#confirmDelete");
    confirmDelete.remove();
    confirmDelete = $();
};

function getAnalyzerPolicy(analyzerPolicyName) {
    var selectedDomain = $("#ddDomainSwitcher").data('contrailDropdown').text();
    var selectedProject = $("#ddProjectSwitcher").data('contrailDropdown').text();

    var analyzerPolicy = {};
    analyzerPolicy["ui_analyzer_flag"] = true;
    analyzerPolicy["network-policy"] = {};
    analyzerPolicy["network-policy"]["parent_type"] = "project";

    analyzerPolicy["network-policy"]["fq_name"] = [];
    analyzerPolicy["network-policy"]["fq_name"][0] = selectedDomain;
    analyzerPolicy["network-policy"]["fq_name"][1] = selectedProject;
    analyzerPolicy["network-policy"]["fq_name"][2] = analyzerPolicyName ? analyzerPolicyName : txtPolicyName.val();

    var networks = msAssociatedNetworks.data("contrailMultiselect").value();

    if (networks && networks.length > 0) {
        analyzerPolicy["network-policy"]["virtual_network_back_refs"] = [];
        for (var i = 0; i < networks.length; i++) {
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i] = {};
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"] = {};
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"]["timer"] = {"start_time":""};
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["attr"]["sequence"] = null;
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["uuid"] = jsonPath(configObj, "$..virtual-networks[?(@.fq_name[2]=='" + networks[i] + "')]")[0]["uuid"];
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"] = [];
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][0] = selectedDomain;
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][1] = selectedProject;
            analyzerPolicy["network-policy"]["virtual_network_back_refs"][i]["to"][2] = networks[i];
        }
    }

    var ruleTuples = $("#ruleTuples")[0].children;
    if (ruleTuples && ruleTuples.length > 0) {
        analyzerPolicy["network-policy"]["network_policy_entries"] = {};
        analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"] = [];
        for (var i = 0; i < ruleTuples.length; i++) {
            analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"][i] = {};
            var rule = analyzerPolicy["network-policy"]["network_policy_entries"]["policy_rule"][i];

            var ruleTuple = $($(ruleTuples[i]).find("div")[0]).children();
            var action = null;
            var protocol = $('#selectProtocol-' + $(ruleTuples[i]).data('ruleIndex')).data("contrailDropdown").text();
            protocol = getProtocol(protocol);
            var srcVN = $('#selectSrcNetwork-' + $(ruleTuples[i]).data('ruleIndex')).data("contrailDropdown").text();
            srcVN = checkValidSourceNetwork(srcVN);
            srcVN = getFQNofVN(selectedDomain, selectedProject, srcVN);

            var srcPorts = $($(ruleTuple[2]).find("input")).val();

            var direction = $('#selectDirection-' + $(ruleTuples[i]).data('ruleIndex')).data("contrailDropdown").text();
            if (direction !== "<>" && direction !== ">") {
                direction = "<>";
            }

            var destVN = $('#selectDestNetwork-' + $(ruleTuples[i]).data('ruleIndex')).data("contrailDropdown").text();
            destVN = checkValidDestinationNetwork(destVN);
            destVN = getFQNofVN(selectedDomain, selectedProject, destVN);

            var destPorts = $($(ruleTuple[5]).find("input")).val();

            var applyServices = null;
            var mirrorTo = selectedDomain + ":" + selectedProject + ":" + txtAnalyzerName.val();

            rule["application"] = [];
            rule["rule_sequence"] = {};
            rule["rule_sequence"]["major"] = -1;
            rule["rule_sequence"]["minor"] = -1;

            rule["ui_rule_id"] = {};
            if (i == 0) {
                rule["ui_rule_id"]["first"] = null;
            } else if (i == ruleTuples.length - 1) {
                rule["ui_rule_id"]["last"] = null;
            } else {
                rule["ui_rule_id"]["after"] = i - 1 + ".0";
            }
            rule["direction"] = direction;
            rule["protocol"] = protocol.toLowerCase();

            rule["action_list"] = {};
            rule["action_list"]["simple_action"] = action;
            rule["action_list"]["gateway_name"] = null;

            if (applyServices && applyServices.length > 0) {
                rule["action_list"]["apply_service"] = getApplyServices(applyServices);
            } else {
                rule["action_list"]["apply_service"] = null;
            }

            if (mirrorTo && "" !== mirrorTo.trim()) {
                rule["action_list"]["mirror_to"] = {};
                rule["action_list"]["mirror_to"]["analyzer_name"] = mirrorTo;
            } else {
                rule["action_list"]["mirror_to"] = null;
            }
            populateAddressesInRule("src", rule, srcVN);
            populateAddressesInRule("dst", rule, destVN);
            populatePortsInRule("src", rule, srcPorts);
            populatePortsInRule("dst", rule, destPorts);
        }
    }
    return analyzerPolicy;
};

function getAnalyzer() {
    var analyzerInstance = {};
    analyzerInstance["ui_analyzer_flag"] = true;
    var selectedDomaindd = $("#ddDomainSwitcher").data("contrailDropdown");
    var selectedDomain = selectedDomaindd.text();
    var selectedProjectdd = $("#ddProjectSwitcher").data("contrailDropdown");
    var selectedProject = selectedProjectdd.text();
    var leftVN = $('#dlVirtualNetwork').data('contrailDropdown').value();


    leftVN = getFormatVNName(leftVN);
    leftVN = leftVN != "" ? getFQNofVN(selectedDomain, selectedProject, leftVN) : leftVN;

    analyzerInstance["service-instance"] = {};
    analyzerInstance["service-instance"]["parent_type"] = "project";
    analyzerInstance["service-instance"]["fq_name"] = [];
    analyzerInstance["service-instance"]["fq_name"] = [selectedDomain, selectedProject, $(txtAnalyzerName).val()];

    analyzerInstance["service-instance"]["service_template_refs"] = [];
    analyzerInstance["service-instance"]["service_template_refs"][0] = {};
    analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [];
    analyzerInstance["service-instance"]["service_template_refs"][0]["to"] = [selectedDomain, "analyzer-template"];

    analyzerInstance["service-instance"]["service_instance_properties"] = {};

    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"] = {};
    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"]["max_instances"] = 1;
    analyzerInstance["service-instance"]["service_instance_properties"]["scale_out"]["auto_scale"] = false;

    analyzerInstance["service-instance"]["service_instance_properties"]["right_virtual_network"] = "";
    analyzerInstance["service-instance"]["service_instance_properties"]["management_virtual_network"] = "";
    analyzerInstance["service-instance"]["service_instance_properties"]["left_virtual_network"] = leftVN;
    return analyzerInstance;
};

function getVNName(vnFullName) {
    var vnArray;
    if(vnFullName == "any" || vnFullName == "local") {
        return vnFullName;
    } else {
        vnArray = vnFullName.split(":");
        if (vnArray.length == 3) {
            return vnArray[2];
        } else {
            return null;
        }
    }
};

function check4AnalyzerImage() {
    var selectedDomain = $("#ddDomainSwitcher").data('contrailDropdown').text();
    var url = '/api/tenants/config/service-template-images/' + selectedDomain;
    doAjaxCall(url, "GET", null, "successHandler4AnalyzerImage", "failureHandler4AnalyzerImage");
};

function successHandler4AnalyzerImage(result) {
    var images = result.images;
    PacketCaptureObj.isAnalyzerImageCheckDone = true;
    if(images != null) {
        for(var i = 0; i < images.length; i++) {
            if(images[i].name == 'analyzer') {
                PacketCaptureObj.isAnalyzerImageAvailable = true;
                break;
            }
        }
    }
};

function failureHandler4AnalyzerImage(error) {
    showInfoWindow("Error in getting analyzer image.", "Error");
    PacketCaptureObj.isAnalyzerImageAvailable = false;
    PacketCaptureObj.isAnalyzerImageCheckDone = true;
};
