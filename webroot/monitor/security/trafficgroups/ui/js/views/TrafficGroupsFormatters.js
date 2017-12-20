/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

 define(["lodashv4"], function(_) {
     var TGFormatters = function() {
          this.epsDefaultValueFormatter = function(v) {
              return (v || v === 0) ? v : '-';
          };
          this.policyFormatter = function(v, dc) {
              return this.getPolicyInfo(dc['eps.__key']).name;
          };
          this.ruleFormatter = function(v, dc) {
              return this.getPolicyInfo(dc['eps.__key']).uuid;
          };
          this.sourceTagsFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(this.getEndpointTags(dc));
          };
          this.remoteTagsFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(this.getEndpointTags(dc, 'remote'));
          };
          this.appFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['app']);
          };
          this.remoteAppFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['eps.traffic.remote_app_id']);
          };
          this.deplFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['deployment']);
          };
          this.remoteDeplFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['eps.traffic.remote_deployment_id']);
          };
          this.tierFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['tier']);
          };
          this.remoteTierFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['eps.traffic.remote_tier_id']);
          };
          this.siteFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['site']);
          };
          this.remoteSiteFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(dc['eps.traffic.remote_site_id']);
          };
          this.bytesInFormatter = function(v, dc) {
             return formatBytes(dc['SUM(eps.traffic.in_bytes)']);
          };
          this.bytesOutFormatter = function(v, dc) {
             return formatBytes(dc['SUM(eps.traffic.out_bytes)']);
          };
          this.sampledBytesFormatter = function(v, dc) {
             return (formatBytes(dc['SUM(forward_sampled_bytes)']) + ' / ' +
                     formatBytes(dc['SUM(reverse_sampled_bytes)']));
          };
          this.loggedBytesFormatter = function(v, dc) {
             return (formatBytes(dc['SUM(forward_logged_bytes)']) + ' / ' +
                     formatBytes(dc['SUM(reverse_logged_bytes)']));
          };
          this.sessionTypeFormatter = function(v, dc) {
              return v == 1 ? 'Client' : 'Server';
          };
          this.vnFormatter = function(v, dc) {
             return formatVN(dc['vn']);
          };
          this.remoteVNFormatter = function(v, dc) {
             return formatVN(dc['eps.traffic.remote_vn']);
          };
          this.remoteVNSSFormatter = function(v, dc) {
             return formatVN(dc['remote_vn']);
          };
          this.protocolPortFormatter = function(v, dc) {
             return cowf.format.protocol(dc['protocol']) + " (" + dc['server_port'] + ")";
          };
          this.sessionTypeProtocolFormatter = function(v, dc) {
              var type = dc['session_type'] == 1 ? 'Client' : 'Server';
             return type + ' - ' +
                  cowf.format.protocol(dc['protocol']) + " (" + dc['server_port'] + ")";
          };
          this.policyRuleFormatter = function(v, dc) {
             var ruleObj = getPolicyInfo(dc['security_policy_rule']);
             return ruleObj.name + ' (' + ruleObj.uuid + ')';
          };
          this.sessionsInFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(
                  dc['SUM(eps.traffic.initiator_session_count)']);
          };
          this.sessionsOutFormatter = function(v, dc) {
             return this.epsDefaultValueFormatter(
                  dc['SUM(eps.traffic.responder_session_count)']);
          };
          this.getPolicyInfo = function(key) {
              var policyInfo = {
                      'name': '-',
                      'uuid': key
                  };
              if(key) {
                  if(key.indexOf(':') > 0) {
                      var policy = key.split(':');
                      policyInfo = {
                          'name': policy[policy.length-2],
                          'uuid': policy[policy.length-1]
                      }
                  } else {
                      var policy = _.find(cowc.DEFAULT_FIREWALL_RULES,
                          function(rule) {
                              return rule.uuid == key;
                      });
                      if(policy) {
                          policyInfo.name = policy.name;
                      }
                  }
              }
              return policyInfo;
          };
          this.formatVN = function(vnName, hideProject) {
              return (vnName && vnName != cowc.UNKNOWN_VALUE) ? vnName
                      .replace(/([^:]*):([^:]*):([^:]*)/,'$3 ($2)') : '-';
          };
          this.formatVNWithoutProject = function(vnName) {
              return (vnName && vnName != cowc.UNKNOWN_VALUE) ? vnName
                      .replace(/([^:]*):([^:]*):([^:]*)/,'$3') : '-';
          };
          this.getEndpointTags = function(dc, endpoint) {
               var tags = '';
              _.each(cowc.TRAFFIC_GROUP_TAG_TYPES, function(tag) {
                  var tagVal = (endpoint == 'remote') ?
                      dc['eps.traffic.remote_' + tag.value + '_id'] : dc[tag.value];
                  if(tagVal) {
                      tags += (tags ? '<br/>' : '') + tagVal;
                  }
              });
              return tags;
          };
     };
     return TGFormatters;
 });