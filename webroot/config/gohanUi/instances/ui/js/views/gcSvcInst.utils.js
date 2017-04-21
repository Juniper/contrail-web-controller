/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var svcInstUtils = function() {
        var self = this;
        this.getVNNameFormatter = function (vnFqn, domain, project) {
            if (null == domain) {
                domain = getCookie('domain');
            }
            if (null == project) {
                project = getCookie('project');
            }
            if ((null == vnFqn) || (null == vnFqn[0]) ||
                (null == vnFqn[1])) {
                return null;
            }
            if ((domain == vnFqn[0]) && (project == vnFqn[1])) {
                return vnFqn[2];
            }
            return vnFqn[2] + " (" + vnFqn[0] + ":" + vnFqn[1] + ")";
        },

        this.svcTemplateFormatter = function(svcTmpl) {
            var svcIntfTypes = [];
            var dispStr =
                getValueByJsonPath(svcTmpl,
                                   'service-template;display_name', '-');
            dispStr += " - ";
            var svcTempProp =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties',
                                   {});
            var svcTempVersion = getValueByJsonPath(svcTempProp, 'version', 1);
            var intfType =
                getValueByJsonPath(svcTempProp, 'interface_type', []);
            var intfCnt = intfType.length;
            for (var j = 0; j < intfCnt; j++) {
                svcIntfTypes.push(intfType[j]['service_interface_type']);
            }

            dispStr += "[" +
                getValueByJsonPath(svcTempProp, 'service_mode', '-') + " (" +
                svcIntfTypes.join(', ') + ")]";
            return dispStr + ' - v' + svcTempVersion;
        },

        this.getSvcTmplDetailsBySvcTmplStr = function(svcTmplStr, svcInstTmplts) {
            /* This function must be called after grid is initialized */
            if (null == svcTmplStr) {
                return null;
            }
            var svcTmplFqn = getCookie('domain') + ":" +
                svcTmplStr.split(' - [')[0];
            return svcInstTmplts ? svcInstTmplts[svcTmplFqn] : null;
        },

        this.getStaticRtsInterfaceTypesByStr = function(svcTmplStr, isRaw, svcInstTmplts) {
            var svcTmpl = this.getSvcTmplDetailsBySvcTmplStr(svcTmplStr, svcInstTmplts);
            return this.getStaticRtsInterfaceTypesBySvcTmpl(svcTmpl, isRaw);
        },

        this.getStaticRtsInterfaceTypesBySvcTmpl = function(svcTmpl, isRaw) {
            var intfTypes = getValueByJsonPath(svcTmpl,
                                               'service_template_properties;interface_type',
                                               []);
            var len = intfTypes.length;
            var staticRtIntfList = [];
            var rawIntfList = [];
            for (var i = 0; i < len; i++) {
                var staticRtEnabled = getValueByJsonPath(intfTypes[i],
                                                         'static_route_enable',
                                                         false);
                var svcIntfType = getValueByJsonPath(intfTypes[i],
                                                     'service_interface_type',
                                                     null);
                if (null == svcIntfType) {
                    console.log('Weired! We got null interface type in ' +
                                'template ' + svcTmplStr);
                    continue;
                }
                if (true == staticRtEnabled) {
                    rawIntfList.push(svcIntfType);
                    staticRtIntfList.push({id: svcIntfType, text: svcIntfType});
                }
            }
            if (true == isRaw) {
                return rawIntfList;
            }
            return staticRtIntfList;
        },

        this.getSvcTmplIntfTypes = function(svcTmpl) {
            var svcIntfTypes = [];
            var svcTempProp =
                getValueByJsonPath(svcTmpl,
                                   'service-template;service_template_properties',
                                   {});
            var intfType =
                getValueByJsonPath(svcTempProp, 'interface_type', []);
            var intfCnt = intfType.length;
            for (var j = 0; j < intfCnt; j++) {
                svcIntfTypes.push(intfType[j]['service_interface_type']);
            }
            return svcIntfTypes;
        }

    };
    return new svcInstUtils();
});

