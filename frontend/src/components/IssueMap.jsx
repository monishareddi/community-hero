// IssueMap.jsx
// ---------------------------------------------------------------------------
// Shows an OpenStreetMap map using Leaflet (via react-leaflet).
//  - Every existing issue is a marker.
//  - Clicking the map picks a location for a NEW issue (a special marker shows
//    where you clicked, and the value is sent up to the parent component).
//
// No API key is needed: the map tiles come from OpenStreetMap for free.
// ---------------------------------------------------------------------------

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

// --- Fix for missing marker icons ------------------------------------------
// Leaflet's default marker images don't load correctly with build tools like
// Vite. These three imports + mergeOptions point Leaflet at the right images.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// A separate green icon to clearly mark the location you are picking.
const pickedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Small helper component: listens for clicks on the map and reports them up.
function ClickToPick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null; // it renders nothing; it only listens for clicks
}

export default function IssueMap({ issues, picked, onPick }) {
  // Default view: centered on India. Users can scroll/zoom anywhere.
  const defaultCenter = [20.5937, 78.9629];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      {/* The actual map images (tiles) from OpenStreetMap. */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Listen for clicks to pick a new-issue location. */}
      <ClickToPick onPick={onPick} />

      {/* A marker for every existing issue. */}
      {issues.map((issue) => (
        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
          <Popup>
            <strong>{issue.title}</strong>
            <br />
            {issue.category} · {issue.severity}
            <br />
            Status: {issue.status}
            <br />
            Upvotes: {issue.upvotes}
          </Popup>
        </Marker>
      ))}

      {/* The green marker showing the location you just picked (if any). */}
      {picked && (
        <Marker position={[picked.lat, picked.lng]} icon={pickedIcon}>
          <Popup>New issue location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
