/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved
 */

 define(['underscore'], function(_){
     var dnsServersFormatter = function() {

         /*
          * @domainNameFormatter
          */
         this.domainNameFormatter = function(r, c, v, cd, dc) {
             var domain = getValueByJsonPath(dc,
                 'virtual_DNS_data;domain_name', "-");
             return domain;
         };

         /*
          * @forwardersFormatter
          */
         this.forwardersFormatter = function(r, c, v, cd, dc) {
             var forwarders = getValueByJsonPath(dc,
                 'virtual_DNS_data;next_virtual_DNS',
                 "-");
             return forwarders;
         };

         /*
          * @dnsDomainIpamsFormatter
          */
         this.dnsDomainIpamsFormatter = function(r, c, v, cd, dc) {
             var nwIpams = getValueByJsonPath(dc,
                 'network_ipam_back_refs', null);
             if (null == nwIpams) {
                 return "-";
             }
             var dispStr = "";
             var cnt = nwIpams.length;
             var domain = getCookie('domain');
             for (var i = 0; i < cnt; i++) {
                 if (domain == nwIpams[i]['to'][0]) {
                     dispStr += nwIpams[i]['to'][1] + ":" + nwIpams[i][
                         'to'
                     ][2];
                     if (i < cnt - 1) {
                         dispStr += ", ";
                     }
                 }
             }
             return dispStr;
         };

         /*
          * @ttlFormatter
          */
         this.ttlFormatter = function(r, c, v, cd, dc) {
             var ttlSeconds = getValueByJsonPath(dc,
                 'virtual_DNS_data;default_ttl_seconds', '-');
             if(ttlSeconds !== '-') {
                 ttlSeconds = ttlSeconds + ' (seconds)';
             }
             return ttlSeconds;
         };

         /*
          * @recordResolutionFormatter
          */
         this.recordResolutionFormatter = function(r, c, v, cd, dc) {
             var retValue = '-';
             switch(v) {
                 case 'random' :
                     retValue = 'Random';
                     break;
                 case 'fixed' :
                     retValue = 'Fixed';
                     break;
                 case 'round-robin' :
                     retValue = 'Round-Robin';
                     break;
             }
             return retValue;
         };

         /*
          * @externalVisibleFormatter
          */
         this.externalVisibleFormatter = function(r, c, v, cd, dc) {

             return v != null ?(v.toString().toLowerCase() === 'true'
                 ? 'Enabled' : 'Disabled') : "-";
         };

         /*
          * @reverseResolutionFormatter
          */
         this.reverseResolutionFormatter = function(r, c, v, cd, dc) {

             return v != null ?(v.toString().toLowerCase() === 'true'
                 ? 'Enabled' : 'Disabled') : "-";
         };
     };
     return dnsServersFormatter;
 });