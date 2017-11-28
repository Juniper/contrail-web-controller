/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore'], function(_){
     this.domainData = {
         "domains": [
           {
               "fq_name": [
               "default-domain"
             ],
             "uuid": "ea73b56d-742a-4841-941b-e988281738a1",
             "display_name": "default-domain"
           }
         ]
     };
     this.projectData = {
             "projects": [
                 {
                     "uuid": "a56e6d1c-cb66-4cd4-8b2e-4d0f2be72382",
                     "display_name": "admin",
                     "fq_name": [
                       "default-domain",
                       "admin"
                     ]
                   }
               ]
           };
       return {
           domainData: domainData,
           projectData: projectData
       };
 });
