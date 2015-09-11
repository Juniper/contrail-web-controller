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
            var parType = 'CIDR';
            if (uiDirection == "Ingress"){
                if ((rule.src_addresses[0].security_group != "local") &&
                    (rule.src_addresses[0].security_group != null)) {
                    remoteAddr = rule.src_addresses[0].security_group;
                    parType = 'SecurityGroup';
                }  else if (rule.src_addresses[0].subnet !== null) {
                    remoteAddr = rule.src_addresses[0].subnet.ip_prefix + "/" +
                        rule.src_addresses[0].subnet.ip_prefix_len;
                }
            } else if(uiDirection == "Egress") {
                if ((rule.dst_addresses[0].security_group != "local") &&
                    (rule.dst_addresses[0].security_group != null)) {
                    remoteAddr = rule.dst_addresses[0].security_group;
                    parType = 'SecurityGroup';
                }  else if(rule.dst_addresses[0].subnet !== null) {
                    remoteAddr = rule.dst_addresses[0].subnet.ip_prefix + "/" +
                        rule.dst_addresses[0].subnet.ip_prefix_len;
                }
            }
            return {'parent': parType, 'text': remoteAddr, 'value': remoteAddr,
                    'id': remoteAddr};
            return remoteAddr;
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
                var remoteAddrArr = remoteAddr.split(':');
                if (3 == remoteAddrArr.length) {
                    selectedRemoteAddrType = 'SecurityGroup';
                } else {
                    selectedRemoteAddrType = 'CIDR';
                }
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

                if (direction == "Ingress") {
                    sgConfig[i]["dst_addresses"][0]["security_group"] = "local";
                    if (selectedRemoteAddrType == "SecurityGroup") {
                        if (remoteAddr.split(":").length == 3) {
                            sgConfig[i]["src_addresses"][0]["security_group"] =
                                remoteAddr;
                        } else if (remoteAddr.split(":").length == 1) {
                            sgConfig[i]["src_addresses"][0]["security_group"] =
                                selectedDomain + ":" + selectedProject + ":" +
                                remoteAddr;
                        }
                    } else if (selectedRemoteAddrType == "CIDR") {
                        sgConfig[i]["src_addresses"][0]["subnet"] = {};
                        if ((remoteAddr == null) || (remoteAddr == "") ||
                            (remoteAddr == "Enter a CIDR") ||
                            (remoteAddr == "0.0.0.0/0")) {
                            if(etherType == "IPv4"){
                                remoteAddr = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                remoteAddr = "::/0";
                            }
                        }
                        var subnetAdd = remoteAddr.split("/")
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
                    if (selectedRemoteAddrType == "SecurityGroup") {
                        if (remoteAddr.split(":").length == 3) {
                            sgConfig[i]["dst_addresses"][0]["security_group"] =
                                remoteAddr;
                        } else if (remoteAddr.split(":").length == 1) {
                            sgConfig[i]["dst_addresses"][0]["security_group"] =
                                selectedDomain + ":" + selectedProject + ":" +
                                remoteAddr;
                        }
                    } else if (selectedRemoteAddrType == "CIDR") {
                        sgConfig[i]["dst_addresses"][0]["subnet"] = {};
                        if ((remoteAddr == null) || (remoteAddr == "") ||
                            (remoteAddr == "Enter a CIDR") ||
                            (remoteAddr == "0.0.0.0/0")) {
                            if(etherType == "IPv4"){
                                remoteAddr = "0.0.0.0/0";
                            } else if(etherType == "IPv6"){
                                remoteAddr = "::/0";
                            }
                        }
                        var subnetAdd = remoteAddr.split("/")
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
        self.getSecGrpRulesView = function () {
            return {
                columns: [{
                    elementId: 'secGrpRules',
                    view: 'SectionView',
                    viewConfig: {
                        rows: [{
                            columns: [{
                                elementId: 'rules',
                                view: 'FormEditableGridView',
                                viewConfig: {
                                        path: 'rules',
                                        validations: 'secGrpRulesValidation',
                                        collection: 'rules',
                                        columns: [
                                        {
                                            elementId: 'direction',
                                            name: 'Direction',
                                            view: 'FormDropdownView',
                                            class: "",
                                            width: 150,
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 150,
                                                path: 'direction',
                                                dataBindValue: 'direction()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
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
                                            width: 100,
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 100,
                                                path: 'ethertype',
                                                dataBindValue: 'ethertype()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
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
                                            width: 250,
                                            viewConfig: {
                                                templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 250,
                                                path: 'remoteAddr',
                                                dataBindValue: 'remoteAddr()',
                                                elementConfig: {
                                                    minimumResultsForSearch : 1,
                                                    dataTextField: "text",
                                                    dataValueField: "value",
                                                    data: window.sg.secGrpList,
                                                    queryMap: [
                                                        {
                                                            grpName : 'CIDR',
                                                            iconClass:
                                                                'icon-contrail-network-ipam'
                                                        },
                                                        {
                                                            grpName :
                                                                'SecurityGroup',
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
                                            view: 'FormDropdownView',
                                            class: "",
                                            width: 100,
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                width: 100,
                                                path: 'protocol',
                                                dataBindValue: 'protocol()',
                                                elementConfig: {
                                                    dataTextField: 'text',
                                                    dataValueField: 'value',
                                                    data: [
                                                        {text: 'ANY',
                                                            value: 'ANY'},
                                                        {text: 'TCP',
                                                            value: 'TCP'},
                                                        {text: 'UDP',
                                                            value: 'UDP'},
                                                        {text: 'ICMP',
                                                            value: 'ICMP'}
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            elementId: 'remotePorts',
                                            name: 'Port Range',
                                            view: 'FormInputView',
                                            class: "span3",
                                            viewConfig: {
                                                templateId:
                                                    cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                path: 'remotePorts',
                                                dataBindValue: 'remotePorts()',
                                            }
                                        }
                                    ],
                                    rowActions: [{
                                        onClick: "function() {\
                                            $root.deleteSecGrpRules($data, this);\
                                        }",
                                        iconClass: 'icon-minus'
                                    }],
                                    gridActions: [{
                                        onClick: "function() {\
                                            $root.addSecGrpRule();\
                                        }",
                                        buttonTitle: "Add"
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
        }
    };
    return secGrpUtils;
});

