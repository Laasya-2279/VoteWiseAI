/**
 * @fileoverview Interactive Google Maps component for the India Phase Map.
 * Renders state-wise voting information with custom markers.
 * @module GoogleMapComponent
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '@googlemaps/react-wrapper';
import { MAP_CONFIG, PHASE_COLORS } from '@/utils/constants';

/**
 * Higher-order component to wrap Google Maps initialization.
 * @param {Object} props - Component props
 * @param {number|null} props.selectedPhase - Currently filtered phase
 * @param {Function} props.onStateClick - Callback when a marker is clicked
 * @param {Array} props.statesData - Geographic and phase data for states
 * @returns {JSX.Element}
 */
export default function GoogleMapComponent({ selectedPhase, onStateClick, statesData }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-[500px] glass-card flex items-center justify-center text-gray-500 border-dashed border-2 border-white/10">
        <div className="text-center">
          <p className="mb-2">Google Maps API Key Missing</p>
          <p className="text-xs">Using Interactive Grid Fallback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl relative" role="application" aria-label="Interactive India Phase Map">
      <Wrapper apiKey={apiKey} libraries={['geometry']}>
        <ActualMap selectedPhase={selectedPhase} onStateClick={onStateClick} statesData={statesData} />
      </Wrapper>
    </div>
  );
}

GoogleMapComponent.propTypes = {
  selectedPhase: PropTypes.number,
  onStateClick: PropTypes.func.isRequired,
  statesData: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    phases: PropTypes.arrayOf(PropTypes.number).isRequired,
    seats: PropTypes.number.isRequired,
  })).isRequired,
};

/**
 * The actual Map implementation using Google Maps JS API.
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
function ActualMap({ selectedPhase, onStateClick, statesData }) {
  const ref = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: MAP_CONFIG.CENTER,
        zoom: MAP_CONFIG.ZOOM,
        mapId: MAP_CONFIG.MAP_ID,
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0A0E1A' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0E1A' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#F3F4F6' }] },
          { featureType: 'administrative.state', elementType: 'geometry.stroke', stylers: [{ color: '#3F51B5' }, { weight: 2 }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D1342' }] },
        ],
      });
      setMap(newMap);
    }
  }, [map]);

  useEffect(() => {
    if (map && statesData) {
      statesData.forEach((state) => {
        // High-quality custom markers for major states
        const coords = {
          'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
          'Maharashtra': { lat: 19.7515, lng: 75.7139 },
          'West Bengal': { lat: 22.9868, lng: 87.8550 },
          'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
          'Gujarat': { lat: 22.2587, lng: 71.1924 },
          'Karnataka': { lat: 15.3173, lng: 75.7139 },
          'Bihar': { lat: 25.0961, lng: 85.3131 },
          'Rajasthan': { lat: 27.0238, lng: 74.2179 },
          'Kerala': { lat: 10.8505, lng: 76.2711 },
          'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
          'Telangana': { lat: 18.1124, lng: 79.0193 },
          'Madhya Pradesh': { lat: 23.4733, lng: 77.9470 },
          'Odisha': { lat: 20.9517, lng: 85.0985 },
          'Punjab': { lat: 31.1471, lng: 75.3412 },
          'Haryana': { lat: 29.0588, lng: 76.0856 },
          'Delhi': { lat: 28.6139, lng: 77.2090 },
        };

        const pos = coords[state.name] || { lat: 20 + Math.random() * 10, lng: 75 + Math.random() * 10 };
        const primaryPhase = state.phases[0];
        const visible = !selectedPhase || state.phases.includes(selectedPhase);

        const marker = new window.google.maps.Marker({
          position: pos,
          map: visible ? map : null,
          title: state.name,
          label: { text: state.seats.toString(), color: 'white', fontWeight: 'bold' },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: PHASE_COLORS[primaryPhase]?.hex || '#FF9933',
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 15,
          },
        });

        marker.addListener('click', () => {
          onStateClick(state);
        });
      });
    }
  }, [map, statesData, selectedPhase, onStateClick]);

  return <div ref={ref} className="w-full h-full" id="google-map-element" />;
}

ActualMap.propTypes = {
  selectedPhase: PropTypes.number,
  onStateClick: PropTypes.func.isRequired,
  statesData: PropTypes.array.isRequired,
};

