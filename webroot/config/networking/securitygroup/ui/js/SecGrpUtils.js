/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore'
], function (_) {
    var secGrpUtils = function() {
        var self = this;
        self.getSGDirection = function(rule) {
            var dispStr = "";
            if (null == rule) {
                return dispStr;
            }
            if ((null != rule.dst_addresses) &&
                (null != rule.dst_addresses[0]) &&
                (null != rule.dst_addresses[0].security_group) &&
                ('local' == rule.dst_addresses[0].security_group)) {
                return "Ingress";
            }
            if ((null != rule.src_addresses) &&
                (null != rule.src_addresses[0]) &&
                (null != rule.src_addresses[0].security_group) &&
                (rule.src_addresses[0].security_group == "local")) {
                return "Egress";
            }
            return dispStr;
        };
        self.sgRuleFormat = function(text) {
            return '<span class="rule-format">' + text  + '</span>';
        };

        self.formateSGRule_port = function(port,protocal) {
            var returnPortString = "";
            var sp = port.start_port;
            var ep = port.end_port;
            if(sp === ep) {
                returnPortString = self.sgRuleFormat("["+ sp + "]");
            } else {
                if((Number(sp) == 0 && Number(ep) == 65535) ||
                   (Number(sp) == 0 && Number(ep) == 255) ||
                   (Number(sp) == -1 && Number(ep) == -1)){
                    if(protocal == "icmp"){
                        returnPortString = " type " + self.sgRuleFormat("any") +
                            " code " + self.sgRuleFormat("any");
                    } else {
                        returnPortString = self.sgRuleFormat("any");
                    }
                } else {

                    if(protocal == "icmp"){
                        returnPortString = " type " + self.sgRuleFormat(sp) +
                            " code " + self.sgRuleFormat(ep);
                    } else {
                        returnPortString = self.sgRuleFormat("["+ sp + " - "+ ep +"]");
                    }
                }
            }
            return returnPortString;
        };
        self.formatSGRule_SGText = function(sg, projectObj) {
            var sgArray = sg.split(":");

            if (null != projectObj) {
                selectedProject = self.getProjectFqn(projectObj['fq_name']);
            }
            var projArr = selectedProject.split(':');
            var selectedDomain = projArr[0];
            var selectedProject = projArr[1];
            var returnString = "";
            if ((sgArray[0] == selectedDomain) &&
                (sgArray[1] == selectedProject)) {
                returnString = " security group " +
                    self.sgRuleFormat(sgArray[2]) + " ";
            } else  {
                returnString = " security group " +
                    self.sgRuleFormat(sgArray[2]) + " (" + sgArray[0] + ":" +
                    sgArray[1] + ") ";
            }
            return returnString;
        };
        self.getRemoteAddr = function(rule, uiDirection) {
            var remoteAddr = "";
            var parType = 'subnet';
            if (uiDirection == "Ingress"){
                if ((rule.src_addresses[0].security_group != "local") &&
                    (rule.src_addresses[0].security_group != null)) {
                    remoteAddr = rule.src_addresses[0].security_group;
                    parType = 'security_group';
                }  else if (rule.src_addresses[0].subnet !== null) {
                    remoteAddr = rule.src_addresses[0].subnet.ip_prefix + "/" +
                        rule.src_addresses[0].subnet.ip_prefix_len;
                }
            } else if(uiDirection == "Egress") {
                if ((rule.dst_addresses[0].security_group != "local") &&
                    (rule.dst_addresses[0].security_group != null)) {
                    remoteAddr = rule.dst_addresses[0].security_group;
                    parType = 'security_group';
                }  else if(rule.dst_addresses[0].subnet !== null) {
                    remoteAddr = rule.dst_addresses[0].subnet.ip_prefix + "/" +
                        rule.dst_addresses[0].subnet.ip_prefix_len;
                }
            }
            return {text: remoteAddr, groupName: parType};
        },
        self.buildUIToConfigSGList = function(selectedDomain, selectedProject,
                                              uiRules) {
            var sgConfig = [];
            var uiRulesCnt = uiRules.length;
            for (var i = 0; i < uiRulesCnt; i++) {
                var direction = uiRules[i]['direction'];
                var protocol = uiRules[i]['protocol'];
                var etherType = uiRules[i]['ethertype'];
                var remoteAddr = uiRules[i]['remoteAddr'];
                var remotePorts = uiRules[i]['remotePorts'];
                var remoteAddrArray = remoteAddr.split(cowc.DROPDOWN_VALUE_SEPARATOR);
                var group, groupValue;
                sgConfig[i] = {};
                sgConfig[i]["direction"] = ">";
                sgConfig[i]["protocol"] = protocol.toLowerCase();

                sgConfig[i]["dst_ports"] = [];
                sgConfig[i]["dst_ports"][0] = {};

                if (remotePorts != "") {
                    if ((remotePorts.trim() === "-1") ||
                        (remotePorts.toUpperCase().trim() === "ANY")) {
                        sgConfig[i]["dst_ports"][0]["start_port"] = 0;
                        sgConfig[i]["dst_ports"][0]["end_port"] = 65535;
                    } else {
                        remotePorts = remotePorts.split("-");
                        if ((remotePorts != "") && (remotePorts.length >= 1)) {
                            if (((remotePorts.length == 1) &&
                                 (remotePorts[0].toUpperCase().trim() == "ANY")) ||
                                ((remotePorts.length == 2) &&
                                 (remotePorts[0].toUpperCase().trim() == "ANY") &&
                                 (remotePorts[1].toUpperCase().trim() == "ANY"))) {
                                sgConfig[i]["dst_ports"][0]["start_port"] = 0;
                                sgConfig[i]["dst_ports"][0]["end_port"] = 65535;
                            }  else {
                                sgConfig[i]["dst_ports"][0]["start_port"] =
                                    Number(remotePorts[0]);
                                if(remotePorts.length == 1){
                                    sgConfig[i]["dst_ports"][0]["end_port"] =
                                        Number(remotePorts[0]);
                                } else {
                                    sgConfig[i]["dst_ports"][0]["end_port"] =
                                        Number(remotePorts[1]);
                                }
                            }
                        }
                    }
                } else {
                    sgConfig[i]["dst_ports"][0]["start_port"] = 0;
                    sgConfig[i]["dst_ports"][0]["end_port"] = 65535;
                }
                sgConfig[i]["src_addresses"] = [];
                sgConfig[i]["src_ports"] = [];
                sgConfig[i]["src_ports"][0] = {};
                sgConfig[i]["src_ports"][0]["start_port"] = 0;
                sgConfig[i]["src_ports"][0]["end_port"] = 65535;

                sgConfig[i]["src_addresses"][0] = {};
                sgConfig[i]["src_addresses"][0]["network_policy"] = null;
                sgConfig[i]["src_addresses"][0]["virtual_network"] = null;
                sgConfig[i]["src_addresses"][0]["subnet"] = null;
                sgConfig[i]["src_addresses"][0]["security_group"] = null;

                sgConfig[i]["dst_addresses"] = [];
                sgConfig[i]["dst_addresses"][0] = {};
                sgConfig[i]["dst_addresses"][0]["network_policy"] = null;
                sgConfig[i]["dst_addresses"][0]["virtual_network"] = null;
                sgConfig[i]["dst_addresses"][0]["security_group"] = null;
                sgConfig[i]["dst_addresses"][0]["subnet"] = null;
                sgConfig[i]["ethertype"] = etherType;
                if(remoteAddrArray.length !== 2) {
                    continue;
                } else {
                    groupValue = remoteAddrArray[0];
                    group = remoteAddrArray[1];
                }
                if (direction == "Ingress") {
                    sgConfig[i]["dst_addresses"][0]["security_group"] = "local";
                    if (group == "security_group") {
                        if (groupValue.split(":").length == 3) {
                            sgConfig[i]["src_addresses"][0]["security_group"] =
                                groupValue;
                        } else if (groupValue.split(":").length == 1) {
                            sgConfig[i]["src_addresses"][0]["security_group"] =
                                selectedDomain + ":" + selectedProject + ":" +
                                groupValue;
                        }
                    } else if (group == "subnet") {
                        sgConfig[i]["src_addresses"][0]["subnet"] = {};
                        if ((groupValue == null) || (groupValue == "") ||
                            (groupValue == "Enter a CIDR") ||
                            (groupValue == "0.0.0.0/0")) {
                            if(etherType == "IPv4"){
                                groupValue = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                groupValue = "::/0";
                            }
                        }
                        var subnetAdd = groupValue.split("/")
                        if(subnetAdd[0] == ""){
                            if(etherType == "IPv4"){
                                subnetAdd[0] = "0.0.0.0";
                            } else if(etherType == "IPv6"){
                                subnetAdd[0] = "::";
                            }
                        }
                        sgConfig[i]["src_addresses"][0]["subnet"]["ip_prefix"] =
                            subnetAdd[0];
                        if (subnetAdd.length == 1) {
                            sgConfig[i]["src_addresses"][0]["subnet"]
                                    ["ip_prefix_len"] = 32;
                        } else if (subnetAdd.length == 2) {
                            sgConfig[i]["src_addresses"][0]["subnet"]
                                    ["ip_prefix_len"] = Number(subnetAdd[1]);
                        }
                    }
                } else if(direction == "Egress"){
                    sgConfig[i]["src_addresses"][0]["security_group"] = "local";
                    if (group == "security_group") {
                        if (groupValue.split(":").length == 3) {
                            sgConfig[i]["dst_addresses"][0]["security_group"] =
                                groupValue;
                        } else if (groupValue.split(":").length == 1) {
                            sgConfig[i]["dst_addresses"][0]["security_group"] =
                                selectedDomain + ":" + selectedProject + ":" +
                                groupValue;
                        }
                    } else if (group == "subnet") {
                        sgConfig[i]["dst_addresses"][0]["subnet"] = {};
                        if ((groupValue == null) || (groupValue == "") ||
                            (groupValue == "Enter a CIDR") ||
                            (groupValue == "0.0.0.0/0")) {
                            if(etherType == "IPv4"){
                                groupValue = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                groupValue = "::/0";
                            }
                        }
                        var subnetAdd = groupValue.split("/")
                        if(subnetAdd[0] == ""){
                            if(etherType == "IPv4"){
                                subnetAdd[0] = "0.0.0.0";
                            } else if(etherType == "IPv6"){
                                subnetAdd[0] = "::";
                            }
                        }
                        sgConfig[i]["dst_addresses"][0]["subnet"]["ip_prefix"] =
                            subnetAdd[0];
                        if (subnetAdd.length == 1) {
                            sgConfig[i]["dst_addresses"][0]["subnet"]
                                    ["ip_prefix_len"] = 32;
                        } else if (subnetAdd.length == 2) {
                            sgConfig[i]["dst_addresses"][0]["subnet"]
                                    ["ip_prefix_len"] = Number(subnetAdd[1]);
                        }
                    }
                }
            }
            return sgConfig;
        },
        self.formatSGPolicyRule = function(rule, projectObj) {
            var direction = self.getSGDirection(rule);
            var protocal = self.sgRuleFormat(rule.protocol);
            if(rule.ethertype == undefined){
                rule.ethertype = "IPv4";
            }
            var etherType = self.sgRuleFormat(rule.ethertype);
            var remoteAddr = "";
            var remotePort = "";
            remotePort = self.formateSGRule_port(rule.dst_ports[0],rule.protocol);

            var returnString = "-";
            if (direction == "Ingress") {
                if (rule.src_addresses[0].security_group != "local" &&
                    rule.src_addresses[0].security_group != null){
                    remoteAddr =
                        self.formatSGRule_SGText(rule.src_addresses[0].security_group,
                                                 projectObj);
                }  else if (rule.src_addresses[0].subnet !== null) {
                    remoteAddr = " network " +
                        self.sgRuleFormat(rule.src_addresses[0].subnet.ip_prefix +
                                     "/" +rule.src_addresses[0].subnet.ip_prefix_len);
                }
                direction = "ingress";
            } else if(direction == "Egress") {
                if ((rule.dst_addresses[0].security_group != "local" &&
                     rule.dst_addresses[0].security_group != null)) {
                    remoteAddr =
                        self.formatSGRule_SGText(rule.dst_addresses[0].security_group,
                                                 projectObj);
                }  else if(rule.dst_addresses[0].subnet !== null) {
                    remoteAddr = " network " +
                        self.sgRuleFormat(rule.dst_addresses[0].subnet.ip_prefix +
                                     "/" +rule.dst_addresses[0].subnet.ip_prefix_len);
                }
                direction = "egress";
            }
            direction = self.sgRuleFormat(direction);
            returnString = direction + " " +etherType + " " + remoteAddr +
                " protocol " + protocal +  " ports " + remotePort;
            return returnString;
        },
        self.getSecGrpRulesView = function (sgDataObj) {
            return {
                columns: [{
                    elementId: 'secGrpRules',
                    view: 'SectionView',
                    viewConfig: {
                        class: 'col-xs-12',
                        rows: [{
                            columns: [{
                                elementId: 'rules',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                        label: 'Security Group Rule(s)',
                                        path: 'rules',
                                        validation: 'secGrpRulesValidation',
                                        templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                                        collection: 'rules',
                                        columns: [
                                        {
                                            elementId: 'direction',
                                            name: 'Direction',
                                            view: 'FormDropdownView',
                                            class: "",
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 150,
                                                path: 'direction',
                                                dataBindValue: 'direction()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
                                                    width: 150,
                                                    data: [
                                                        {value: 'Ingress',
                                                          text: 'Ingress'},
                                                        {value: 'Egress',
                                                          text: 'Egress'}
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'ethertype',
                                            name: 'Ether Type',
                                            view: 'FormDropdownView',
                                            class: "",
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 100,
                                                path: 'ethertype',
                                                dataBindValue: 'ethertype()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
                                                    width: 100,
                                                    data: [
                                                        {value: 'IPv4',
                                                            text: 'IPv4'},
                                                        {value: 'IPv6',
                                                            text: 'IPv6'}
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'remoteAddr',
                                            view:
                                                "FormHierarchicalDropdownView",
                                            name: 'Address',
                                            class: "",
                                            viewConfig: {
                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 250,
                                                path: 'remoteAddr',
                                                dataBindValue: 'remoteAddr()',
                                                elementConfig: {
                                                    minimumResultsForSearch : 1,
                                                    width: 250,
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    data: sgDataObj.secGrpList,
                                                    queryMap: [
                                                        {
                                                            name : 'CIDR',
                                                            value : 'subnet',
                                                            iconClass:
                                                                'icon-contrail-network-ipam'
                                                        },
                                                        {
                                                            name :
                                                                'Security Group',
                                                            value : 'security_group',
                                                            iconClass:
                                                                'icon-contrail-security-group'
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'protocol',
                                            name: 'Protocol',
                                            view: 'FormComboboxView',
                                            class: "",
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                width: 100,
                                                path: 'protocol',
                                                dataBindValue: 'protocol()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
                                                    width: 100,
                                                    dataSource: {
                                                        type: 'local',
                                                        data: [
                                                            {text: 'ANY',
                                                                value: 'ANY'},
                                                            {text: 'TCP',
                                                                value: 'TCP'},
                                                            {text: 'UDP',
                                                                value: 'UDP'},
                                                            {text: 'ICMP',
                                                                value: 'ICMP'},
                                                            {text: 'ICMP6',
                                                                value: 'ICMP6'}
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'remotePorts',
                                            name: 'Port Range',
                                            view: 'FormInputView',
                                            class: "",
                                            width:120,
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                width:120,
                                                placeholder: 'ANY',
                                                path: 'remotePorts',
                                                dataBindValue: 'remotePorts()',
                                            }
                                        }
                                    ],
                                    rowActions: [{
                                        onClick: "function() {\
                                            $root.addSecGrpRuleByIndex($data, this);\
                                        }",
                                        iconClass: 'fa fa-plus'
                                    },{
                                        onClick: "function() {\
                                            $root.deleteSecGrpRules($data, this);\
                                        }",
                                        iconClass: 'fa fa-minus'
                                    }],
                                    gridActions: [{
                                        onClick: "function() {\
                                            $root.addSecGrpRule();\
                                        }",
                                        buttonTitle: ""
                                    }]
                                }
                            }]
                        }]
                    }
                }]
            }
        },
        self.getProjectFqn = function(fqn) {
            if (null == fqn) {
                return getCookie('domain') + ':' +
                    getCookie('project');
            }
            return fqn;
        }
        self.secGrpRulesFormatter = function(r, c, v, cd, dc, showAll) {
            var returnString = "";
            if (typeof dc.sgRules === "object") {
                var sgRulesCnt = dc.sgRules.length;
                if ((null != showAll) && (true == showAll)) {
                    for (var i = 0; i < sgRulesCnt; i++) {
                        if (typeof dc.sgRules[i] !== "undefined") {
                            returnString += dc.sgRules[i] + "<br>";
                        }
                    }
                    return returnString;
                }
                for (var i = 0; i < sgRulesCnt, i < 2; i++) {
                    if (typeof dc.sgRules[i] !== "undefined") {
                        returnString += dc.sgRules[i] + "<br>";
                    }
                }
                if (sgRulesCnt > 2) {
                    returnString += '<span class="moredataText">(' +
                        (dc.sgRules.length-2) + ' more)</span> \
                        <span class="moredata" style="display:none;" ></span>';
                }
            }
            return returnString;
        },
        self.addCurrentSG = function (sgDataObj) {
            try {
                var secGrpName = $('#display_name').find('input').val();
                if ((null != secGrpName) && ("" != secGrpName.trim())) {
                    secGrpName = getCookie('domain') + ":" + getCookie('project') +
                        ":" + secGrpName.trim();
                }
            } catch(e) {
                secGrpName = "";
            }
            if ((null != secGrpName) && ("" != secGrpName.trim())) {
                var remoteAddValue = sgDataObj.secGrpList;
                var allSecurietyGroup = remoteAddValue[1].children;
                secGrpName = secGrpName + cowc.DROPDOWN_VALUE_SEPARATOR + 'security_group';
                if ((null != allSecurietyGroup[0]) &&
                    ('Current Security Group' !=
                     allSecurietyGroup[0]['text'])) {
                    allSecurietyGroup.unshift({"id": secGrpName,
                                               "parent": "security_group",
                                               "text": 'Current Security Group',
                                               "value": secGrpName});
                } else {
                    allSecurietyGroup[0]['value'] = secGrpName;
                    allSecurietyGroup[0]['id'] = secGrpName;
                }
                remoteAddValue[1].children = allSecurietyGroup;
                sgDataObj.secGrpList = remoteAddValue;
            }
        },
        self.deleteCurrentSG = function (sgDataObj) {
            var remoteAddValue = sgDataObj.secGrpList;
            if ((null == remoteAddValue) || (null == remoteAddValue[1]) ||
                (null == remoteAddValue[1].children)) {
                return;
            }
            var allSecurietyGroup = remoteAddValue[1].children;
            if (!allSecurietyGroup.length) {
                return;
            }

            if ((null == allSecurietyGroup[0]) ||
                (null == allSecurietyGroup[0].text)) {
                return;
            }
            var ctSGIdx =
                allSecurietyGroup[0].text.indexOf("Current Security Group");
            if (ctSGIdx > -1) {
                allSecurietyGroup.splice(0, 1);
                remoteAddValue[1].children = allSecurietyGroup;
                sgDataObj.secGrpList = remoteAddValue;
            }
        },
        self.formatSGAddrDropDownEntry = function(sgFqn, domain, project) {
            if (null == domain) {
                domain = getCookie('domain');
            }
            if (null == project) {
                project = getCookie('project');
            }
            var fqNameValue = sgFqn.join(':');
            if ((sgFqn[0] == domain) && (sgFqn[1] == project)) {
                return {text: sgFqn[2], value: fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + 'security_group',
                    groupName: "Security Group", id: fqNameValue};
            }
            var fqNameTxt = sgFqn[2] +' (' +

                sgFqn[0] + ':' + sgFqn[1] + ')';
            return {text : fqNameTxt, value : fqNameValue + cowc.DROPDOWN_VALUE_SEPARATOR + 'security_group',
                    groupName: "Security Group", id: fqNameValue};
        }
    };
    return secGrpUtils;
});
