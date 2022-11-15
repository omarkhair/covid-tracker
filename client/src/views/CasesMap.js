import React, { useEffect } from "react";
import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { Room } from "@material-ui/icons";
import "mapbox-gl/dist/mapbox-gl.css";

const CasesMap = () => {
  const [myLat, setMyLat] = useState(30);
  const [myLong, setMyLong] = useState(30);
  const [zoomAmount, setZoomAmount] = useState(5);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLat(pos.coords.latitude);
      setMyLong(pos.coords.longitude);
    });
  }, []);

  console.log(myLat);
  console.log(myLong);
  return (
    <Map
      initialViewState={{
        longitude: myLong,
        latitude: myLat,
        zoom: zoomAmount,
      }}
      onZoom={(viewState) => {
        setZoomAmount(viewState.viewState.zoom);
      }}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      style={{ width: "70vw", height: "65vh" }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Marker longitude={30} latitude={30} anchor="bottom">
        <Room
          style={{
            fontSize: 7 * zoomAmount,
            color: "slateblue",
            cursor: "pointer",
          }}
        />
      </Marker>
      <Popup
        latitude={30}
        longitude={30}
        closeButton={true}
        closeOnClick={false}      
        anchor="left"
      >
        <div className="card">
          <label>Place</label>
          <h4 className="place">my title</h4>
          <label>Review</label>
          <p className="desc">my desc</p>
          <label>Information</label>
          <span className="username">
            Created by <b>Omar</b>
          </span>
          <span className="date">1 hour ago</span>
        </div>  
      </Popup>
    </Map>
  );
};
export default CasesMap;
