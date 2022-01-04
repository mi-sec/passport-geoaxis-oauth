/**
 * generatePolicy
 * @param {*} principalId - principal identity
 * @param {String} effect - allow/deny effect
 * @param {String|[]} resource - resource to grant access
 * @param {Object} context - addition output with custom properties
 * @returns {{}} - IAM Policy
 */
function generatePolicy( principalId, effect, resource, context = {} ) {
    const authResponse = {};

    authResponse.principalId = principalId;
    authResponse.context     = context;

    if ( effect && resource ) {
        const policyDocument          = {};
        policyDocument.Version        = '2012-10-17';
        policyDocument.Statement      = [];

        const statementOne            = {};
        statementOne.Action           = 'execute-api:Invoke';
        statementOne.Effect           = effect;
        statementOne.Resource         = resource;
        policyDocument.Statement[ 0 ] = statementOne;
        authResponse.policyDocument   = policyDocument;
    }

    return authResponse;
}

module.exports = generatePolicy;
