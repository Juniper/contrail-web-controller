/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore"], function(_){
     var routeAggregateFormatter = function(){

         /*
          * nextHopFormatter
          */
          this.nextHopFormatter = function(r, c, v, cd, dc) {
              return getValueByJsonPath(dc,
                  "aggregate_route_nexthop", "-");
          };

         /*
          * routesFormatter
          */
          this.routesFormatter = function(r, c, v, cd, dc) {
              var formattedRoutes = "";
              var routes =  getValueByJsonPath(dc,
                  "aggregate_route_entries;route", []);
              var i, routesCnt = routes.length;
              if(routesCnt) {
                  for(i = 0; i < routesCnt; i++) {
                      if(i > 1 && cd) {
                          break;
                      }
                      if(i === 0) {
                          formattedRoutes = routes[i];
                      } else {
                          formattedRoutes += "<br>" + routes[i];
                      }
                  }
                  if (routesCnt > 2 && cd) {
                      formattedRoutes += '<br><span class="moredataText">(' +
                         (routesCnt - 2) + ' more)</span><span class="moredata"' +
                         ' style="display:none;"></span>';
                  }
              } else {
                  formattedRoutes = "-";
              }
              return formattedRoutes;
          };

         /*
          * serviceInstancesFormatter
          */
          this.serviceInstancesFormatter = function(r, c, v, cd, dc) {
              var formattedServiceInstance = "";
              var servInstName;
              var serviceInstances =  getValueByJsonPath(dc,
                  "service_instance_refs", []);
              if(serviceInstances.length) {
                  _.each(serviceInstances, function(si, i){
                      servInstName = getValueByJsonPath(si, "to;2", "") +
                          " (" + getValueByJsonPath(si, "to;0", "") +
                          ":" + getValueByJsonPath(si, "to;1", "") + ")";
                      if(i === 0) {
                          formattedServiceInstance = servInstName;
                      } else {
                          formattedServiceInstance += "<br>" + servInstName;
                      }
                  });
              } else {
                  formattedServiceInstance = "-";
              }
              return formattedServiceInstance;
          };
     };
     return routeAggregateFormatter
 });

