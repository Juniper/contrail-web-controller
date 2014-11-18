/**
 * This file should contain the functions common to the features of controller package 
 * 
 */

/*
 * This function accepts the ip and checks whether it is IPV4 or IPV6 and returns the label value html content 
 * for the IP
 */
function getLabelValueForIP(ip) {
    var lbl = 'IPv4';
    var value = ip;
    if(ip != null && isIPv6(ip)) {
        lbl = 'IPv6';
        value = new v6.Address(ip).correctForm();
    }
    return wrapLabelValue(lbl,value);
}