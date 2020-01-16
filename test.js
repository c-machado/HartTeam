'use strict';

/**
 * The root URL for the Issue Tracker API.
 * This API talks to the same backend as http://buganizer
 * This is the Buganizer production datastore.
 */
var ISSUE_TRACKER_API_ROOT = 'https://issuetracker.corp.googleapis.com';

/**
 * The root URL for the QA Issue Tracker API.
 * This API talks to the same backend as http://buganizer-qa.
 * Feel free to use this as a sandbox.
 */
var ISSUE_TRACKER_QA_API_ROOT = 'https://test-issuetracker.corp.googleapis.com';

/**
 * Discovery file path.
 */
var DISCOVERY_PATH = '/$discovery/rest';

/**
 * The version of the Issue Tracker API.
 */
var ISSUE_TRACKER_API_VERSION = 'v1';

/**
 * A client ID for a web application from the Google Developers Console.
 */
var CLIENT_ID =
    '693999850130-8nk5le2hgvadjmf7qru59ec4nmp2k6m4.apps.googleusercontent.com';

/**
 * The space-delimited list of scopes to authorize
 */
var SCOPES = 'https://www.googleapis.com/auth/buganizer';

/**
 * A very simple DOM helper function for modern browsers.
 * @param {string} domSelector used to retrieve a DOM element using a
 *    querySelector call.
 * @return {Object} helper object containing the methods:
 *    on, clear, append, hide, show and val, with semantics similar to the
 *    methods with the same name on jQuery.
 */
function elem(domSelector) {
  var domElem = document.querySelector(domSelector);
  return {
    on: function(event, cbk) { domElem.addEventListener(event, cbk); },
    clear: function() {
      while (domElem.lastChild) {
        domElem.removeChild(domElem.lastChild);
      }
    },
    append: function(child) { domElem.appendChild(child); },
    hide: function() { domElem.style.display = 'none'; },
    show: function() { domElem.style.display = ''; },
    val: function() { return domElem.value; }
  };
}

/**
 * Sends an Auth call with immediate mode off, which will show the user
 * a popup requesting him to authorize our application.
 * @see http://go/gapi-auth
 */
function handleAuthClick() {
  gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
}

elem('#authorize-button').on('click', handleAuthClick);

/**
 * Callback for authorization calls which, on success, hides the auth
 * button and shows the content div, else it makes sure the auth button
 * is visible and with the correct callback.
 *
 * @param {?Object} authResult Contains the authentication result info.
 */
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    elem('#authorize-button').hide();
    elem('#content').show();
  } else {
    elem('#authorize-button').show();
    elem('#content').hide();
  }
}

/**
 * Loads the API and makes a call for all the user's issues.
 */
function makeApiCall() {
  // Grab username as a string
  var username = '' + elem('#username-input').val();

  // Load correct version and make call to find assigned issues.
  gapi.client.load(
    ISSUE_TRACKER_QA_API_ROOT + DISCOVERY_PATH,
    ISSUE_TRACKER_API_VERSION,
    function() {
      var request = gapi.client.corp_issuetracker.issues.list({
        'query': 'assignee:' + username + ' status:open'
      });
      request.execute(handleResponse);
    });
}

/**
 * Displays the list of issues.
 *
 * @param {?Object} response The response payload.
 */
function handleResponse(response) {
  // Something went wrong.
  if (!response) {
    alert('A bad request was made.');
    return;
  }

  elem('#issues').clear();

  if (!response['issues']) {
    elem('#issues').append(document.createTextNode('No issues found.'));
  } else {
    response.issues.forEach(function(issue) {
      var issueUrl = 'http://b/' + issue.issueId;
      var anchor = document.createElement('a');
      var item = document.createElement('li');
      anchor.href = issueUrl;
      anchor.target = '_blank';
      anchor.appendChild(document.createTextNode(issueUrl));

      item.appendChild(anchor);
      item.appendChild(document.createTextNode(' ' + issue.issueState.title));
      elem('#issues').append(item);
    });
  }
}

/**
 * Called as soon the gapi script is loaded, since the script tag we used had
 * the name of this function on the onload parameter:
 *  <script src="//apis.google.com/js/client.js?onload=handleClientLoad">
 */
function handleClientLoad() {
  /*
   * Sends an Auth call with immediate mode on, which attempts to refresh
   * the token behind the scenes, without showing any UI to the user.
   */
  gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: true},
    handleAuthResult);
}