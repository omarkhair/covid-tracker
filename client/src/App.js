import React from "react";
import { Router, Route, Switch } from "react-router-dom";

import Loading from "./components/Loading";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

// styles
import "./App.css";

import CasesMap from "./views/CasesMap";

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
          <Switch>
            <Route path="/" exact component={CasesMap} />
          </Switch>
      </div>
    </Router>
  );
};

export default App;
