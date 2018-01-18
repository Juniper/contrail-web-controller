## 1. Introduction
This blue print describes the design, features, and implementation of Security Insights dashboard feature in Contrail Web UI.

## 2. Problem Statement
To provide a dashboard for graphical and tabular insights about various security objects and events. 

## 3. Proposed Solution
Add the following charts that helps in visualizing/getting insights w.r.t Security:  
1. Top Sources causing ACL Denies  
	Display the top-N workloads (VMIs) whose traffic is denied the most (matched with a rules that have deny as an action) as a bar chart  
__Data Source:__
	1. Fetch the records from eps.client grouped by "VMI UUID,Rule UUID,Action" and select SUM(in_bytes)  
	2. Filter the records to consider only those where action is "Deny"
	3. Group records by VMI UUID and take SUM(in_bytes) and that can be used for plotting this chart
2. Top talkers by virtual network  
    Display the top-N virtual networks based on traffic generated  
__Data Source:__
	1. Fetch the records from eps.client grouped by "local_vn" and select "local_vn","SUM(in_bytes)".
3. Top talkers by tag/application  
	Display the top-N applications based on traffic generated  
__Data Source:__
	1. Fetch the records from eps.client grouped by "application(tag)" and select "application",SUM("in_bytes").
	
4. Top n ACL entries causing deny/allow by # of hits with ACL ID  
    TBD on this as currently, #hits of ACL rule can't be fetched from StatTable's.
    


### 3.3 Alternatives considered
TBD

### 3.3 API schema changes
None

### 3.4 UI changes
New Feature

### 3.5 Notification impact
None

## 4. Implementation

### 4.1 Navigation Link
* Add a new Dashboard link in sidebar to Monitor > Security.

### 4.2 Security Dashboard
The information for these charts will be fetched either from Stat tables (eps.client,eps.server) or from API Server.  
From performance point of view,We shouldn't query SessionSeries table for these charts

### 4.3 Enhancements to Traffic Groups Monitoring

Currently, the traffic stats are visualized in a radial dendogram chart with atmost 2 circles (nested).  
A set of tag types can be choosen for computing group-by on outer circle (shown in UI as "Category"). Similary, tag types can be choosen for computing group-by on inner circle (shown in UI as "Sub-Category").  

Stats are grouped by tags selected in Category and plotted as arcs in outer circle and for each outercircle stats are grouped by tags choosen in "Sub-category" and plotted as inner arcs.  
Arc width is proportinated based on traffic originated/terminated from that group.  
Arcs are connected if there are any sessions initiated from either side.  

clicking on a link,it shows the details of the link on right side pane showing the list of matched rules and sessions initiated/responded for each rule.  

__Display the rule list in the order they are evaluated__  
In addition to displaying matched rules between a pair of endpoints, an option will be provided to look at all the rules that are configured between those endpoints in the order they are evaluated.  
It will be helpful to cross-check if an user is expecting a prior rule to get trigged. 

We can calculate the Rule order only if the application tag is known, so if the traffic between 2 endpoints comprises of multiple applications, a dropdown will be shown with a list of applications and "All Applications" option also will be added.  

Once an application is selected, it will fetch the Rules based on the following order:  

	1. Global default-application-policy-set
	2. Global application-policy-set assigned to selected application 
	3. Project default-application-policy-set
	4. Project application-policy-set assigned to selected application
	
If "All Applications" is selected, it will display all the rules that are associated with any of the application traffic between the selected endpoints. Here, no order is maintained.

### 4.4 Work items

* Changes in Chart components (if any)  
* Required enhancement of test-case framework (if any)
* Unit, Acceptance, System, and Regression test-cases

## 5. Performance and scaling impact
TBD


## 6. Upgrade
**N/A**

## 7. Deprecations
**N/A**

## 8. Dependencies
**N/A**

##9. Testing
Our current UI system testing infrastructure allows mocking a backend server and simulating user actions on UI components and asserting the required result. This section will introduce testing of Security Dahsboard feature.

### 9.1 Unit Testing
Basic unit testing of model and utility functions and make sure validation is properly ensured and other error/null cases are handled.

### 9.2 Acceptance/Integration Testing
TBD
### 9.3 System Testing
TBD

## 10. Limitations
TBD

## 11. Documentation Impact
UI documentation needs to be updated to provide information on usage of Security Insights Dashboard

## 12. References

