import React, { useEffect } from "react";
import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { Room } from "@material-ui/icons";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth0 } from "@auth0/auth0-react";
import { getConfig } from "../config";
import axios from "axios";
import { format } from "timeago.js";

const CasesMap = () => {
  const [cases, setCases] = useState([]);
  const [currentCaseId, setCurrentCaseId] = useState(null);
  const [newCase, setNewCase] = useState(null);
  const [temperature, setTemperature] = useState(37);
  const [severity, setSeverity] = useState("Moderate");

  const { apiOrigin } = getConfig();
  const [viewState, setViewState] = useState({
    latitude: 40,
    longitude: 30,
    zoom: 1,
  });
  // @ts-ignore
  const {
    getAccessTokenSilently,
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const getCases = async () => {
    try {
      const response = await axios.get(`${apiOrigin}/api/case`);
      setCases(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkerClick = (id, lat, lng) => {
    setCurrentCaseId(id === currentCaseId ? null : id);
    // setViewState({ ...viewState, latitude: lat, longitude: lng });
  };

  const addMarker = (lng, lat) => {
    setNewCase({
      latitude: lat,
      longitude: lng,
    });
    setCurrentCaseId(null);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    const { lng, lat } = e.lngLat;
    addMarker(lng, lat);
  };

  
  const pinMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const {longitude, latitude} = pos.coords;
      setViewState({
        latitude,
        longitude,
        zoom: 8,
      });
      addMarker(longitude, latitude);
    });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    const caseData = {
      temperature: temperature,
      severity: severity,
      latitude: newCase?.latitude,
      longitude: newCase?.longitude,
    };

    try {
      const token = await getAccessTokenSilently();
      const res = await axios.post(`${apiOrigin}/api/case`, caseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCases([...cases, res.data]);
      setNewCase(null);
      setCurrentCaseId(res.data._id);
    } catch (err) {
      console.log(err);
    }
  };

  const removeCase = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(`${apiOrigin}/api/case/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCases([...cases.filter((cur) => cur._id !== id)]);
      setCurrentCaseId(null);
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setViewState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        zoom: 5,
      });
    });
    getCases();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
        initialViewState={viewState}
        onZoom={(e) => {
          setViewState(e.viewState);
        }}
        onMove={(e) => {
          setViewState(e.viewState);
        }}
        viewState={viewState}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onDblClick={isAuthenticated && handleAddClick}
      >
        <>
          {cases.map((c) => (
            <>
              <Marker
                // @ts-ignore
                longitude={c.longitude}
                // @ts-ignore
                latitude={c.latitude}
                anchor="bottom"
                // @ts-ignore
              >
                <Room
                  style={{
                    fontSize: 7 * viewState.zoom,
                    color: user?.email === c.email ? "tomato" : "slateblue",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleMarkerClick(c._id, c.latitude, c.longitude)
                  }
                />
              </Marker>
              {c._id === currentCaseId && (
                <Popup
                  key={c._id}
                  latitude={c.latitude}
                  longitude={c.longitude}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setCurrentCaseId(null)}
                  anchor="left"
                >
                  <div className="card">
                    <label>Temperature</label>
                    <h4 className="place">{c.temperature}</h4>
                    <label>Severity</label>
                    <p className="desc">{c.severity}</p>
                    <label>Created by</label>
                    <span className="username">{c.email}</span>
                    <span className="date">{format(c.createdAt)}</span>
                    {isAuthenticated && user?.email === c.email && (
                      <button
                        className="submitButton"
                        onClick={() => removeCase(c._id)}
                        autoFocus={false}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </>
          ))}
          {newCase && (
            <>
              <Marker
                latitude={newCase.latitude}
                longitude={newCase.longitude}
                anchor="bottom"
              >
                <Room
                  style={{
                    fontSize: 7 * viewState.zoom,
                    color: "tomato",
                    cursor: "pointer",
                  }}
                />
              </Marker>
              <Popup
                latitude={newCase.latitude}
                longitude={newCase.longitude}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setNewCase(null)}
                anchor="left"
              >
                <div>
                  <form onSubmit={handleSubmit}>
                    <label>Temperature °C</label>
                    <input
                      type="number"
                      min="30"
                      max="50"
                      autoFocus
                      onChange={(e) => setTemperature(e.target.value)}
                      value={temperature}
                    ></input>
                    <label>Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                    <button type="submit" className="submitButton">
                      Add Pin
                    </button>
                  </form>
                </div>
              </Popup>
            </>
          )}
          {isAuthenticated ? (
            <>
              <div className="buttons">
                <button className="button locateme" onClick={pinMyLocation}>
                  Locate me
                </button>
                <button className="button logout" onClick={logout}>
                  Log out
                </button>
              </div>
              <div className="info message">
                <p>
                  <strong>Double click</strong> on map to add a new covid case
                </p>
              </div>
            </>
          ) : (
            <>
              <button className="button login" onClick={loginWithRedirect}>
                Log in
              </button>
              <div className="info message">
                <p>
                  <strong>Login</strong> to add new covid cases
                </p>
              </div>
            </>
          )}
        </>
      </Map>
    </div>
  );
};
export default CasesMap;
