/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved
 */

 define(['underscore'], function(_){
     return {
         /*
          * @nameFormatter
          */
         nameFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;name',
                 '-');
         },

         /*
          * @recNameFormatter
          */
        recNameFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;rec_name',
                 '-');
         },

         /*
          * @recTypeFormatter
          */
         recTypeFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;rec_type',
                 '-');
         },

         /*
          * @recDataFormatter
          */
        recDataFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;rec_data',
                 '-');
         },

         /*
          * @ttlFormatter
          */
         ttlFormatter : function(r, c, v, cd, dc) {
             var ttlSeconds = getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;rec_ttl',
                 '-');
             if(ttlSeconds !== '-') {
                 ttlSeconds = ttlSeconds + ' (seconds)';
             }
             return ttlSeconds;
         },

         /*
          * @sourceFormatter
          */
         sourceFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;source',
                 '-');
         },

         /*
          * @installedFormatter
          */
         installedFormatter : function(r, c, v, cd, dc) {
             return getValueByJsonPath(dc,
                 'VirtualDnsRecordsResponse;records;list;VirtualDnsRecordTraceData;installed',
                 '-');
         }
     };
 });