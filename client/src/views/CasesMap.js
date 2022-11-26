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
    latitude: 50,
    longitude: 40,
    zoom: 5,
  });
  // @ts-ignore
  const { getAccessTokenSilently, user } = useAuth0();

  const getCases = async () => {
    try {
      const response = await axios.get(`${apiOrigin}/api/case`);
      setCases(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkerClick = (id, lat, lng) => {
    setCurrentCaseId(id);
    // setViewState({ ...viewState, latitude: lat, longitude: lng });
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    const { lng, lat } = e.lngLat;
    setNewCase({
      latitude: lat,
      longitude: lng,
    });
  };

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
      setCases([...cases.filter((cur)=>cur._id !== id)]);
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
      style={{ width: "70vw", height: "65vh" }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      onDblClick={user?.email && handleAddClick}
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
                  <p className="desc">
                    <b>{c.severity}</b>
                  </p>
                  <label>Created by</label>
                  <span className="username">{c.email}</span>
                  <span className="date">{format(c.createdAt)}</span>
                {user?.email === c.email && (
                  <button className="submitButton" onClick={()=>removeCase(c._id)}>
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
      </>
    </Map>
  );
};
export default CasesMap;
