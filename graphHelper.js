require('isomorphic-fetch');
const azure = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client');
const authProviders =
  require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

let _settings = undefined;
let _deviceCodeCredential = undefined;
let _userClient = undefined;

function initializeGraphForUserAuth(settings, deviceCodePrompt) {
  // Ensure settings isn't null
  if (!settings) {
    throw new Error('Settings cannot be undefined');
  }

  _settings = settings;

  _deviceCodeCredential = new azure.DeviceCodeCredential({
    clientId: settings.clientId,
    tenantId: settings.tenantId,
    userPromptCallback: deviceCodePrompt
  });

  const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
    _deviceCodeCredential, {
      scopes: settings.graphUserScopes
    });

  _userClient = graph.Client.initWithMiddleware({
    authProvider: authProvider
  });
}
module.exports.initializeGraphForUserAuth = initializeGraphForUserAuth;

async function getUserTokenAsync() {
    // Ensure credential isn't undefined
    if (!_deviceCodeCredential) {
      throw new Error('Graph has not been initialized for user auth');
    }
  
    // Ensure scopes isn't undefined
    if (!_settings?.graphUserScopes) {
      throw new Error('Setting "scopes" cannot be undefined');
    }
  
    // Request token with given scopes
    const response = await _deviceCodeCredential.getToken(_settings?.graphUserScopes);
    return response.token;
  }
  module.exports.getUserTokenAsync = getUserTokenAsync;

  async function getUserAsync() {
    // Ensure client isn't undefined
    if (!_userClient) {
      throw new Error('Graph has not been initialized for user auth');
    }
  
    return _userClient.api('/me')
      // Only request specific properties
      .select(['displayName', 'mail', 'userPrincipalName'])
      .get();
  }
  module.exports.getUserAsync = getUserAsync;

  async function getInboxAsync() {
    // Ensure client isn't undefined
    if (!_userClient) {
      throw new Error('Graph has not been initialized for user auth');
    }
  
    return _userClient.api('/me/mailFolders/inbox/messages')
      .select(['from', 'isRead', 'receivedDateTime', 'subject'])
      .top(25)
      .orderby('receivedDateTime DESC')
      .get();
  }
  module.exports.getInboxAsync = getInboxAsync;

  async function sendMailAsync(subject, body, recipient) {
    // Ensure client isn't undefined
    if (!_userClient) {
      throw new Error('Graph has not been initialized for user auth');
    }
  
    // Create a new message
    const message = {
      subject: subject,
      body: {
        content: body,
        contentType: 'text'
      },
      toRecipients: [
        {
          emailAddress: {
            address: recipient
          }
        }
      ]
    };
  
    // Send the message
    return _userClient.api('me/sendMail')
      .post({
        message: message
      });
  }
  module.exports.sendMailAsync = sendMailAsync;

  // This function serves as a playground for testing Graph snippets
// or other code


///////////////////////////// Zuerst 4 ausführen, um Kalender anzulegen und dann 5, um Kalender abzurufen
  async function makeGraphCallAsync() {
    // INSERT YOUR CODE HERE
    if (!_userClient) {
        throw new Error('Graph has not been initialized for user auth');
      }
    
      const calendar = {
        name: 'Volunteer1'
      };
      
      return _userClient.api('/me/calendars')
          .post(calendar);
  }
  module.exports.makeGraphCallAsync = makeGraphCallAsync;


  async function makeGraphCallAsync2() {
    // INSERT YOUR CODE HERE
    if (!_userClient) {
        throw new Error('Graph has not been initialized for user auth');
      }

    return _userClient.api('/me/calendars')
        .select(['name','id'])
        .top(10)
	    .get();
  }
  module.exports.makeGraphCallAsync2 = makeGraphCallAsync2;

  