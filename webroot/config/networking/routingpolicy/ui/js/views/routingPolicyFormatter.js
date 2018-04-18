/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'lodash'
], function (_) {

    var RoutingPolicyFormatter = function() {
        var self = this;
        //Formating the result from api//
        this.routingPolicyDataParser = function(response) {
            var routingPolicyData = [];
            var routingPolicy = response["routing-policys"];
            if(routingPolicy != null &&
                routingPolicy != undefined){
                var routingPolicyLen = routingPolicy.length;
                for(var j=0; j < routingPolicyLen; j++) {
                    routingPolicyData.push(routingPolicy[j]['routing-policy']);
                }
            }
            return routingPolicyData;
        };
        this.RoutingPoliceyNameFormatter = function(d, c, v, cd, dc) {
            var policyName = "-";
            if(dc["fq_name"] != "" &&
               dc["fq_name"] != undefined &&
               dc["fq_name"] != null){
                var policyName = dc["fq_name"][2];
            }
            return policyName;
        };

        this.RoutingPolicyTermFormatter = function(d, c, v, cd, dc) {
            var routingPolicyData = "";
            var term =
                getValueByJsonPath(dc, "routing_policy_entries;term", []);
            var termCount = term.length;
            var termLen = termCount
            if(termLen > 3) {
                termLen = 3;
            }
            for(var i = 0; i < termLen; i++){
                routingPolicyData += self.termFormatting(term[i]);
            }
            if(termCount > 3) {
                routingPolicyData += "(" + (termCount - 3) + " more)";
            }
            return routingPolicyData;
        };

        this.RoutingPolicyTermExpandFormatter = function(d, c, v, cd, dc) {
            var routingPolicyData = "";
            var term =
                getValueByJsonPath(dc, "routing_policy_entries;term", []);
            var termLen = term.length;
            for(var i = 0; i < termLen; i++){
                routingPolicyData += self.termFormatting(term[i]);
            }
            return routingPolicyData;
        };

        this.termFormatting = function(term) {
            var formattedTerm = "";
            var from = getValueByJsonPath(term, "term_match_condition", "")
            formattedTerm += "from ";
            if (from != "") {
                var community_list = getValueByJsonPath(term, "term_match_condition;community_list", "");
                var community = getValueByJsonPath(term, "term_match_condition;community", "");
                if(community != "") {
                    formattedTerm +=  "community " + self.termFormat(community) + " ";
                }
                if(community_list != "") {
                    formattedTerm +=  "community " + self.termFormat(community_list) + " ";
                }
                var termPrefix = getValueByJsonPath(term,
                                             "term_match_condition;prefix", []);
                if (termPrefix.length > 0) {
                    var prefixLen = termPrefix.length;
                    var prefixStr = "";
                    for (var i = 0; i < prefixLen; i++) {
                        var perPrefix = termPrefix[i],
                            type = getValueByJsonPath(perPrefix, "prefix_type", ""),
                            prefix = getValueByJsonPath(perPrefix, "prefix", "");
                        if (prefixStr != "") {
                            prefixStr += ", ";
                        }
                        if(prefix != "") {
                            prefixStr +=   self.termFormat(prefix) + " ";
                        }
                        if(type != "") {
                            prefixStr += self.termFormat(type);
                        }
                    }
                    if (prefixStr != "") {
                        formattedTerm +=  "prefix [" + prefixStr + "] ";
                    }
                }
                var termProtocol = getValueByJsonPath(term,
                                             "term_match_condition;protocol", []);
                if (termProtocol.length > 0) {
                    termProtocol = _.uniq(termProtocol);
                    formattedTerm += "protocol ";
                    formattedTerm += self.termFormat(termProtocol.join(", "));
                }
                if (formattedTerm == "from ") {
                    formattedTerm += self.termFormat("any ");
                }
            } else {
                formattedTerm += self.termFormat("any ");
            }
            var thenValue = "";
            var then =
                getValueByJsonPath(term, "term_action_list;update;community;add", "");
            var thenCommunity = [];
            if(then != "") {
                thenValue +=  "add ";
                var thenCommunity = getValueByJsonPath(term,
                                    "term_action_list;update;community;add;community",
                                    []);
                if((typeof(thenCommunity) != "string") && thenCommunity.length > 0) {
                    var thenCommunityVal = thenCommunity.join(", ");
                    thenValue += "communities ["
                                  + self.termFormat(thenCommunityVal) + "] ";
                }
            }
            then = getValueByJsonPath(term,
                                "term_action_list;update;community;remove", "");
            if(then != "") {
                thenValue +=  "remove ";
                thenCommunity = getValueByJsonPath(term,
                                "term_action_list;update;community;remove;community",
                                []);
                if((typeof(thenCommunity) != "string") && thenCommunity.length > 0) {
                    var thenCommunityVal = thenCommunity.join(", ");
                    thenValue += "communities ["
                                  + self.termFormat(thenCommunityVal) + "] ";
                }
            }
            then = getValueByJsonPath(term,
                                "term_action_list;update;community;set", "");
            if(then != "") {
                thenValue +=  "set ";
                thenCommunity = getValueByJsonPath(term,
                                "term_action_list;update;community;set;community",
                                []);
                if((typeof(thenCommunity) != "string") && thenCommunity.length > 0) {
                    var thenCommunityVal = thenCommunity.join(", ");
                    thenValue += "communities ["
                                  + self.termFormat(thenCommunityVal) + "] ";
                }
            }

            var localPref = getValueByJsonPath(term,
                                       "term_action_list;update;local_pref", "")
            if(localPref != "") {
                thenValue +=  "local-preference "
                              + self.termFormat(localPref) + " ";
            }
            var med = getValueByJsonPath(term,
                                       "term_action_list;update;med", "")
            if(med != "") {
                thenValue +=  "med "
                              + self.termFormat(med) + " ";
            }
            var asPath = getValueByJsonPath(term,
                    "term_action_list;update;as_path;expand;asn_list", [])
            if(asPath.length > 0) {
                thenValue +=  "as-path " + self.termFormat(asPath.join(", ")) + " ";
            }
            if(thenValue == "") {
                formattedTerm += " then ";
                //formattedTerm += self.termFormat("default");
            } else {
                formattedTerm += " then ";
                formattedTerm += thenValue;
            }
            var action = getValueByJsonPath(term, "term_action_list;action", "")
            if(action != "") {
                formattedTerm +=  " action " + self.termFormat(action) + " ";
            } else {
                formattedTerm +=  " action " + self.termFormat("default");
            }
            formattedTerm += "<br>";
            return formattedTerm;
        };
        this.termFormat = function(text) {
            return '<span class="rule-format">' + text  + '</span>';
        };

/*        this.fromObjToStr = function(fromObj) {
            if(fromObj == null) {
                return "";
            }
            var returnStr = "";
            if(fromObj.community != "") {
                returnStr += "community " + fromObj.community;
            }

            var prefixVal = getValueByJsonPath(fromObj, "prefix", []),
                prefixLen = prefixVal.length;
            if (returnStr != "" && prefixLen > 0) {
                returnStr += "\n"
            }
            for (var i = 0; i < prefixLen; i++) {
                var prefixIP = getValueByJsonPath(prefixVal[i], "prefix", "");
                    prefixType = getValueByJsonPath(prefixVal[i], "prefix_type", "");
                if(prefixIP != "") {
                    returnStr += "prefix " + prefixIP;
                    returnStr += " " + prefixType;
                }
            }
            return returnStr;
        };
*/
        this.thenObjToStr = function(thenObj) {
            if(thenObj == null) {
                return "";
            }
            var returnStr = "";
            var community = getValueByJsonPath(thenObj, "community", "");
            if(community != "") {
                var communityObj = thenObj.community;
                if("add" in communityObj) {
                    returnStr += "add ";
                    returnStr += "community " + communityObj.add.community;
                } 
                if("set" in communityObj) {
                    returnStr += "set ";
                    returnStr += "community " + communityObj.set.community;
                } 
                if("remove" in communityObj) {
                    returnStr += "remove ";
                    returnStr += "community " + communityObj.remove.community;
                }
            }
            if("local_pref" in thenObj &&
               thenObj["local_pref"] != "") {
                if(returnStr != "") returnStr += "\n"
                returnStr += "local-pref " + thenObj["local_pref"];
            }
            var med = getValueByJsonPath(thenObj, "med", "");
            if(med != "") {
                if(returnStr != "") returnStr += "\n"
                returnStr += "med " + med;
            }
            return returnStr;
        };

        // To build the post Object for From in each term
        this.buildPostObjectTermFrom = function(fromObj) {
            var fromObjCount = fromObj.length;
            var returnFromObj = {};
            var prefixArr = [];
            returnFromObj["protocol"] = [];
            returnFromObj["community_list"] = [];
            var communityMatchAll = fromObj[0].model().attributes.community_match_all();
            for (var i = 0; i < fromObjCount; i++) {
                var key = fromObj[i].model().attributes["name"](),
                    val = fromObj[i].model().attributes["value"]();
                if (val != "") {
                    switch (key) {
                        case "community" : {
                            if(val !=""){
                                var valItems = val.split(',');
                                _.each(valItems, function (val, index){
                                    returnFromObj["community_list"].push(valItems[index]);
                                })
                            }
                            break;
                        }
                        case "community_list" : {
                            returnFromObj["community_list"].push(val);
                            break;
                        }
                        case "protocol" : {
                            if(val !=""){
                                var valItems = val.split(',');
                                _.each(valItems, function (val, index){
                                    returnFromObj["protocol"].push(valItems[index]);
                                })
                            }
                            break;
                        }
                        case "prefix": {
                            var prefixType = fromObj[i].model().attributes["additionalValue"]();
                            var prefix = {};
                            prefix.prefix = val;
                            prefix.prefix_type = {};
                            prefix.prefix_type = prefixType;
                            prefixArr.push(prefix);
                            break;
                        }
                    }
                }
            }
            if (prefixArr.length > 0) {
                returnFromObj["prefix"] = [];
                returnFromObj["prefix"] = prefixArr;
            }
            returnFromObj["community_match_all"] = communityMatchAll;
            return returnFromObj;
        };
        // To build the post Object for Then in each term
        this.buildPostObjectTermThen = function(thenObj) {
            var thenObjCount = thenObj.length;
            var returnThenObj = {};
            returnThenObj.update = {};
            var addCommuniety = [];
            var setCommuniety = [];
            var resetCommuniety = [];
            for (var i = 0; i < thenObjCount; i++) {
                var key = thenObj[i].model().attributes["name"](),
                    val = thenObj[i].model().attributes["value"]();
                if (val != "") {
                    switch (key) {
                        case "add community": {
                            addCommuniety.push(val);
                            break;
                        }
                        case "set community": {
                            setCommuniety.push(val);
                            break;
                        }
                        case "remove community": {
                            resetCommuniety.push(val);
                            break;
                        }
                        case "local-preference": {
                            returnThenObj["update"]["local_pref"] = parseInt(val);
                            break;
                        }
                        case "med": {
                            returnThenObj["update"]["med"] = parseInt(val);
                            break;
                        }
                        case "as-path": {
                            returnThenObj["update"]["as_path"] = {};
                            returnThenObj["update"]["as_path"]['expand'] = {};
                            //assuming asn-list is comma separated
                            var asnList = val.split(',');
                            asnList = asnList.map(function(d,i){return d.trim();});
                            returnThenObj["update"]["as_path"]['expand']['asn_list'] = asnList;
                            break;
                        }
                    }
                }
                var action = thenObj[i].model().attributes["action_condition"]();
                if (action != "") {
                    if (action != "default") {
                        returnThenObj["action"] = {};
                        returnThenObj["action"] = action;
                    }
                }

            }
            if (addCommuniety.length > 0 || setCommuniety.length > 0 || resetCommuniety.length > 0) {
                returnThenObj["update"]["community"] = {};
                if (addCommuniety.length > 0) {
                    returnThenObj["update"]["community"]["add"] = {};
                    returnThenObj["update"]["community"]["add"]["community"] = addCommuniety;
                }
                if (setCommuniety.length > 0) {
                    returnThenObj["update"]["community"]["set"] = {};
                    returnThenObj["update"]["community"]["set"]["community"] = setCommuniety;
                }
                if (resetCommuniety.length > 0) {
                    returnThenObj["update"]["community"]["remove"] = {};
                    returnThenObj["update"]["community"]["remove"]["community"] = resetCommuniety;
                }
            }
            return returnThenObj;
        };
        // To build the from/match object for Edit Pop-up
        this.buildTermMatchObject = function(matchObj) {
            if(matchObj == null) {
                return [];
            }
            var returnMatchArr = [],
                protocolArray = [],
            communityList = getValueByJsonPath(matchObj, "community_list", []);
            var community_match_all = getValueByJsonPath(matchObj, "community_match_all", false);
            returnMatchArr.push({name: 'community_list', value: communityList.join(','), community_match_all: community_match_all, additionalValueMultiSelect: ctwc.COMM_MULTISELECT, isDisable:true});
            returnMatchArr["community_match_all"] = community_match_all;
            var protocol = _.get(matchObj, "protocol", []);
            if(protocol.length > 0){
                protocol = protocol.join();
                protocolArray.push(protocol);
                _.each(protocolArray, function (arrVal, index){
                    returnMatchArr.push({name: 'protocol', value: arrVal, additionalValueMultiSelect: ctwc.PROTOCOL_MULTISELECT, isDisable:true});
                })
            }
            var prefixVal = getValueByJsonPath(matchObj, "prefix", []),
            prefixLen = prefixVal.length;
            for (var i = 0; i < prefixLen; i++) {
                var prefixIP = getValueByJsonPath(prefixVal[i], "prefix", "");
                    prefixType = getValueByJsonPath(prefixVal[i], "prefix_type", "");
                if(prefixIP != "") {
                    returnMatchArr.push({
                                         name: 'prefix',
                                         value: prefixIP,
                                         additionalValue:prefixType,
                                         isDisable:true
                                        });
                }
            }
            function checkItemsExist(value,arr){
                var status = 'Not exist';
                _.each(arr, function (val, index){
                    var name = val.name;
                    if(name == value){
                        status = 'Exist';
                        return false;
                    }
                })
                return status;
             }
            var statusComm = checkItemsExist('community_list', returnMatchArr);
            var statusProtocol = checkItemsExist('protocol', returnMatchArr);
            var statusPrefix = checkItemsExist('prefix', returnMatchArr);
            var communityItems = {
                    name: 'community_list',
                    value: '',
                    community_match_all: false,
                    additionalValueMultiSelect: ctwc.COMM_MULTISELECT,
                    isDisable:true
                   };
            var protocolItems = {
                    name: 'protocol',
                    value: '',
                    additionalValueMultiSelect:ctwc.PROTOCOL_MULTISELECT,
                    isDisable:true
                   };
            var prefixItems = {
                    name: 'prefix',
                    value: '',
                    additionalValue:'',
                    isDisable:true
                };
            if(statusComm === 'Exist' && statusProtocol === 'Not exist' &&
                    statusPrefix === 'Not exist'){
                returnMatchArr.push(protocolItems);
                returnMatchArr.push(prefixItems);
            }
            else if(statusComm === 'Exist' && statusProtocol === 'Exist' &&
                    statusPrefix === 'Not exist'){
                returnMatchArr.push(prefixItems);
            }
            else if(statusComm === 'Not exist' && statusProtocol === 'Exist' &&
                    statusPrefix === 'Not exist'){
                returnMatchArr.unshift(communityItems);
                returnMatchArr.push(prefixItems);
            }
            else if(statusComm === 'Not exist' && statusProtocol === 'Not exist'
                && statusPrefix === 'Exist'){
                returnMatchArr.unshift(communityItems);
                returnMatchArr.splice(1, 0, protocolItems);
            }
            else if(statusComm === 'Not exist' && statusProtocol === 'Exist' &&
                    statusPrefix === 'Exist'){
                returnMatchArr.unshift(communityItems);
            }
            else if(statusComm === 'Exist' && statusProtocol === 'Not exist' &&
                    statusPrefix === 'Exist'){
                returnMatchArr.splice(1, 0, protocolItems);
            }
            return returnMatchArr;
        };
        // To build the then/Action object for Edit Pop-up
        this.buildTermActionObject = function(actionObject) {
            if(actionObject == null) {
                return "";
            }
            var returnActionArr = [];
            var community = getValueByJsonPath(actionObject, "update;community", "");
            if (community != "" && !_.isEmpty(community)) {
                var communietyArr = this.getActionCommunietyObj(community);
                if (communietyArr.length > 0) {
                    returnActionArr = communietyArr;
                }
            }
            var localPref = getValueByJsonPath(actionObject, "update;local_pref", "");
            if (localPref != "") {
                returnActionArr.push({name:'local-preference', value: localPref});
            }
            var med = getValueByJsonPath(actionObject, "update;med", "");
            if (med != "") {
                returnActionArr.push({name:'med', value: med});
            }
            var action = getValueByJsonPath(actionObject, "action", "");
            if (action != "") {
                returnActionArr.push({name:'action', action_condition: action});
            }
            var aspathexpand = getValueByJsonPath(actionObject, "update;as_path", "");
            if (aspathexpand != "") {
                returnActionArr.push({name:'as-path', value: this.getAsPathObj(aspathexpand)});
            }
            return returnActionArr;
        };

        this.getAsPathObj = function(asPath) {
            var val = getValueByJsonPath(asPath,"expand;asn_list");
            return val.join(',');
        };
        this.getActionCommunietyObj = function(community) {
            var returnObj = [];
            val = getValueByJsonPath(community, "add;community", "");
            var resultArr = self.getActionCommunietyPerObj(val, "add community");
            returnObj = returnObj.concat(resultArr);
            val = getValueByJsonPath(community, "set;community", "");
            var resultArr = self.getActionCommunietyPerObj(val, "set community");
            returnObj = returnObj.concat(resultArr);
            val = getValueByJsonPath(community, "remove;community", "");
            var resultArr = self.getActionCommunietyPerObj(val, "remove community");
            returnObj = returnObj.concat(resultArr);
            return returnObj;
        };
        this.getActionCommunietyPerObj = function(val, str) {
            var returnArr = [];
            if (val != "") {
                var valLen = val.length;
                for (var i = 0; i < valLen; i++) {
                    var obj = {};
                    obj.value = val[i];
                    obj.name = str;
                    returnArr.push(obj);
                }
            }
            return returnArr;
        };
        this.formatRoutingPolicyTermFromModel
    }
    return RoutingPolicyFormatter;
});
