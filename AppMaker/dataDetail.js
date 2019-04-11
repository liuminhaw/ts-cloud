// Client side script

/**
 * Redirects user to data detail page.
 * @param {Request} request - Selected record key
 */
function getUrlToProductDetails(requestKey) {  
    return app.datasources.AppSettings.item.AppUrl + '?requestId=' + requestKey + '#productDetails';
}