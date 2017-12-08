/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(['underscore','common/test/ui/unit/ct.common.mock.data'], function(_,TestCommonMockdata){
     this.alarmsMockData =
         [
             {
               "alarms": [
                 {
                   "alarm": {
                     "display_name": "test alarms",
                     "uuid": "88e6046d-8c9f-4a1c-9053-508281d08ffd",
                     "name": "test alarms",
                     "alarm_rules": {
                       "or_list": [
                         {
                           "and_list": [
                             {
                               "operation": "==",
                               "operand1": "alarms",
                               "variables": [],
                               "operand2": {
                                 "uve_attribute": "alarms"
                               }
                             }
                           ]
                         }
                       ]
                     },
                     "parent_type": "project",
                     "alarm_severity": 2,
                     "href": "http://nodeg4:8082/alarm/88e6046d-8c9f-4a1c-9053-508281d08ffd",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 9864576902358845000,
                         "uuid_lslong": 10399744485982507000
                       },
                       "created": "2017-11-22T06:25:45.310743",
                       "description": "test alarms",
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-22T06:25:45.310743",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "test alarms"
                     ],
                     "uve_keys": {
                       "uve_key": [
                         "service-chain"
                       ]
                     },
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 },
                 {
                   "alarm": {
                     "display_name": "test",
                     "uuid": "2d4ef991-f7ae-43ea-8bab-ca727f3e72db",
                     "name": "test",
                     "alarm_rules": {
                       "or_list": [
                         {
                           "and_list": [
                             {
                               "operation": "==",
                               "operand1": "data",
                               "variables": [],
                               "operand2": {
                                 "uve_attribute": "data"
                               }
                             }
                           ]
                         }
                       ]
                     },
                     "parent_type": "project",
                     "alarm_severity": 2,
                     "href": "http://nodeg4:8082/alarm/2d4ef991-f7ae-43ea-8bab-ca727f3e72db",
                     "perms2": {
                       "owner": "3ef47950bfff440897a980de1d670c06",
                       "owner_access": 7,
                       "global_access": 0,
                       "share": []
                     },
                     "id_perms": {
                       "enable": true,
                       "uuid": {
                         "uuid_mslong": 3264821185211155500,
                         "uuid_lslong": 10064360385399386000
                       },
                       "created": "2017-11-22T06:23:43.622545",
                       "description": "test record",
                       "creator": null,
                       "user_visible": true,
                       "last_modified": "2017-11-22T06:24:13.159809",
                       "permissions": {
                         "owner": "admin",
                         "owner_access": 7,
                         "other_access": 7,
                         "group": "admin",
                         "group_access": 7
                       }
                     },
                     "fq_name": [
                       "default-domain",
                       "admin",
                       "test"
                     ],
                     "uve_keys": {
                       "uve_key": [
                         "virtual-network"
                       ]
                     },
                     "parent_uuid": "3ef47950-bfff-4408-97a9-80de1d670c06"
                   }
                 }
               ]
             }
           ];
       this.alarmProjectRole = null;
       return {
           alarmDomainsData: TestCommonMockdata.domainData,
           alarmPojectsData: TestCommonMockdata.projectData,
           alarmsMockData: alarmsMockData,
           alarmProjectRole: alarmProjectRole
           
       };
 });
