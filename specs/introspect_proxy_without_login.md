Access Introspect from Contrail UI without login
===
# 1.      Introduction

Usually user may not have reachability to node HTTP introspect. Contrail UI provides way to access introspect (Settings -> Introspect) for different node types using forward proxy in 'openstack' orchestration mode.

An example of existing proxy request API is:
```
/proxy?proxyURL=http://10.10.10.10:8083
```
http introspect url is specified in proxyURL parameter of this API. Along with this request, the requester (ex: Web Client) provides cookies: connect.sid and _csrf, these two cookies are used to validate if the request is authenticated as well as authorized or not. These two cookies a client or requester gets once login is successful as part of response header of /authenticate WebServer API.

# 2.      Problem Statement

Contrail UI should provide APIs to access introspect without login, so without using user name and password, basically without using connect.sid and _csrf cookie.

# 3.      Proposed Solution

Orchestration mode is openstack.

User will be able to access introspect using keystone token.

In normal scenario in openstack orchestration mode, when user logs in using user_name and password, user gets validated using openstack keystone and we get scoped token using unscoped token (as we got by using user_name and password) and last project in the project list as we got response of /projects API from keystone. Next set of all requests from WebServer to backend servers are validated using this keystone token if aaa_mode, in backend servers, is set as cloud-admin or rbac.

The response header of /authenticate WebServer API call in login page contains below:

```
Set-Cookie: _csrf=s8usZRG9mp9X+AHZI+LMRgoX; expires=Fri, 18 Aug 2017 21:21:18 GMT; secure
Set-Cookie: connect.sid=s%3AD9JXXgpwfPBViGNN3m5ftuLM.olXqt3a4i21YVUkC9Qn0l3wmsoJ0zipWj2aWvsLGcH8; Path=/; Expires=Fri, 18 Aug 2017 21:21:18 GMT; HttpOnly; Secure
```
Client/Requester uses these two cookies in request header for next set of requests to this WebServer. WebServer validates if the request is authenticated and authorized or not using these two cookies.

So we saw that from WebClient to WebServer, request is authenticated/authorized using _csrf and connect.sid cookie. And from WebServer to backend servers, the request gets validated using keystone token.

So here with this approach, We are trying to remove one layer of validating the request from requester to webServer using cookies. In stead requests will get validated in WebServer using keystone token.

So along with the request, user has to provide keystone token in X-Auth-Token header.

The format of request API to Contrail Web Server is:

```
https://<web_server_ip>:8143/forward-proxy?<all_introspect_arguments>&proxyURL=http://<introspect_ip>:<introspect_port> -H "X-Auth-Token: <scoped_token>"
```
Here is an example of request:
```
curl "https://10.10.10.10:8143/forward-proxy?name=default-domain:demo:mgmt&uuid=&vxlan_id=&ipam_name=&proxyURL=http://20.20.220.20:8085/Snh_VnListReq" --insecure -H "X-Auth-Token: 0123456789"
```

There will be a config for list of allowed introspect names to be specified in config file.
```
config.proxy.allowed_introspect_list_access_by_token
```
Default is empty list, user has to explicitly add the introspect names (Snh_XXXX). Ex:
```
config.proxy.allowed_introspect_list_access_by_token = ['Snh_VnListReq', 'Snh_ItfReq']
```

# 3.1    Alternatives considered
None

# 3.2    API schema changes
None

# 3.3      User workflow impact
None

## 3.4      UI Changes
None


# 4 Implementation

## 4.1      Work items
A new proxy request API will be added in Contrail WebServer.
```
/forward-proxy
````
If the request URL contains forward-proxy and X-Auth-Token header is not null, then authentication will be bypassed, we will assume these requests to be authenticated.
Now authorization will be validated by the validity of token as specified in X-Auth-Token header.

In Contrail UI, we store admin_user, admin_password and admin_tenant_name in /etc/contrail/contrail-webui-userauth.js
Using all these, we will get admin-token which will be used to validate the token as provided by user.

The keystone API to validate this token is:
```
/tokens/0123456789 -H "X-Auth-Token: <admin_token>"
```
If token is valid, then the response will include the details of the token and we pass the request to application handler.

# 5 Performance and Scaling Impact
None

## 5.1     API and control plane Performance Impact
None

## 5.2     Forwarding Plane Performance
None

# 6 Upgrade
None

# 7       Deprecations
None

# 8       Dependencies
None

# 9       Testing
## 9.1    Dev Tests
Login the Contrail UI and have a valid session and now issue
/forward-proxy request without using X-Auth-Token or with X-Auth-header with invaliid token, both cases, the request should not be honored.
Now use a valid token, the user should get the response for that introspect request.

Now Logout the Contrail UI, remove all cookies and do the same testing as above, the response should be same as specified above.


# 10      Documentation Impact
None

# 11      References
None

