import 'bootstrap';
import './css/theme.css';
import './css/survey.css';
import ReactGa from 'react-ga';
import Login from './views/Login';
import Box from '@material-ui/core/Box';
import UserSubmissions from './views/UserSubmissions';
import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { expireAuthToken } from './helper/AuthHelper';
import api from './api';

import 'nouislider/distribute/nouislider.min.css';
import { CenterFocusStrong } from '@material-ui/icons';

ReactGa.initialize(process.env.REACT_APP_GAID, {
  testMode: process.env.NODE_ENV != 'production',
});

const img = new Image();
const backgroundImage = (img.src = '../img/landing-background.png');

function Hero() {
  return (
    <div>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          width: '99.6vw',
          height: '40vh',
          backgroundSize: 'cover',
        }}
      >
        <div>
          <div class="banner">
            <div style={{ display: 'flex' }}>
              <div class="logo-index">
                <a href="/">
                  <img
                    src="/img/responsible-rai-logo.png"
                    alt="Responsible rai Logo"
                    class="logo"
                  />
                </a>
              </div>
              <div class="logo-index">
                {/* <img
                  src="/img/anthem-logo.png"
                  alt="Anthem logo"
                  class="logo"
                /> */}
              </div>
            </div>
            <div>
              <Login />
            </div>
          </div>
        </div>
        <div
          style={{
            paddingTop: '5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1>RAI Design Assessment</h1>
          <Box mt={2} />
          <div
            style={{
              width: '55%',
              textAlign: 'center',
            }}
          >
            Welcome‌ ‌to‌ ‌the‌ ‌RAIL Certification Beta.‌ ‌This‌ ‌is‌ ‌a‌
            ‌virtual‌ ‌guide‌ ‌to‌ ‌help‌ ‌those‌ designing,‌ ‌developing,‌
            ‌and‌ ‌implementing‌ ‌AI‌ ‌systems‌ ‌do‌ ‌so‌ ‌in‌ ‌a‌ ‌responsible‌
            ‌way.‌ Committed‌ ‌to‌ ‌making‌ ‌responsible‌ ‌AI‌ ‌systems,‌
            ‌we’ve‌ ‌done‌ ‌the‌ ‌hard‌ ‌work‌ ‌of‌ ‌deciphering‌ the‌ ‌best‌
            ‌practices,‌ ‌policies,‌ ‌and‌ ‌principles‌ ‌and‌ ‌put‌ ‌them‌
            ‌into‌ ‌a‌ ‌simple‌ ‌online‌ ‌survey.‌
          </div>
        </div>
      </div>
    </div>
  );
}

let queryParamsFromProps = (props) => {
  let queryString = props.location.search;
  var query = {};
  var pairs = (queryString[0] === '?'
    ? queryString.substr(1)
    : queryString
  ).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
};

function HomePage(props) {
  let { code } = queryParamsFromProps(props);
  useEffect(() => {
    if (code) {
      let appName = 'designassistant-dev';
      if (window.location.origin == 'http://localhost:3000') {
        appName = 'localhost';
      }
      fetch('https://portal.ai-global.org/api/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          client_id: appName,
          code_verifier: localStorage.getItem('codeVerifier'),
        }),
      })
        .then((resp) => resp.json())
        .then(({ accessToken }) => {
          api
            .post('users/auth', {
              accessToken: accessToken,
            })
            .then((response) => {
              const result = response.data;
              if (result.errors) {
                console.warn(result.errors);
              } else {
                expireAuthToken();
                localStorage.setItem('portalAccessToken', accessToken);
                localStorage.setItem('authToken', result['token']);
                window.location = '/';
              }
            })
            .catch((err) => {
              console.warn(err.response.data);
            });
        });
    }
  }, [code]);
  return (
    <div>
      <Hero />
      <UserSubmissions />
      <Box mt={5} />
    </div>
  );
}

export default withRouter(HomePage);
