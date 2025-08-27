import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

// Prevent back navigation
export const preventBackNavigation = () => {
  window.history.pushState(null, null, window.location.href);
  window.onpopstate = function() {
    window.history.go(1);
  };
};

// Enable back navigation
export const enableBackNavigation = () => {
  window.onpopstate = undefined;
};