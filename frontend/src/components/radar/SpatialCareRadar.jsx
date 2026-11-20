'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, MapPin, Navigation, Search, ShieldCheck } from 'lucide-react';
import { hospitalAPI } from '@/lib/api';
import { useLocationContext } from '@/context/LocationContext';

function mapPosition(hospital, hospitals) {
  const mapped = hospitals.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  if (!mapped.length) return null;
  const latitudes = mapped.map((item) => item.latitude);
  const longitudes = mapped.map((item) => item.longitude);
  const latRange = Math.max(...latitudes) - Math.min(...latitudes) || 0.01;
  const lngRange = Math.max(...longitudes) - Math.min(...longitudes) || 0.01;
  return {
    left: `${12 + ((hospital.longitude - Math.min(...longitudes)) / lngRange) * 76}%`,
    top: `${12 + (1 - (hospital.latitude - Math.min(...latitudes)) / latRange) * 76}%`,
  };
}

export function SpatialCareRadar({ compact = false }) {
  const { coordinates, status, loading: locating, requestLocation } = useLocationContext();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [query, setQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState('50');

  useEffect(() => {
    let active = true;
    const params = { max_distance: Number(maxDistance) };
    if (city) params.city = city;
    if (facilityType) params.facility_type = facilityType;
    if (specialty) params.specialty = specialty;
    if (query) params.search = query;
    if (coordinates) {
      params.lat = coordinates.lat;
      params.lng = coordinates.lng;
    }

    setLoading(true);
    setError('');
    hospitalAPI.search(params)
      .then(({ data }) => {
        if (active) setHospitals(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.detail || 'Hospitals could not be loaded. Check the backend connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [city, coordinates, facilityType, maxDistance, query, specialty]);

  const pins = useMemo(() => hospitals
    .map((hospital) => ({ hospital, position: mapPosition(hospital, hospitals) }))
    .filter((pin) => pin.position), [hospitals]);

  return (
    <div className="space-y-4">
      {!compact && (
        <form className="glass-card grid gap-3 p-4 md:grid-cols-5" onSubmit={(event) => event.preventDefault()}>
          <label className="form-control md:col-span-2">
            <span>Search facilities</span>
            <span className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 opacity-50" />
              <input className="input input-bordered pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or address" />
            </span>
          </label>
          <label className="form-control">
            <span>City</span>
            <select className="select select-bordered" value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="">All cities</option><option>Dhaka</option><option>Chittagong</option><option>Rajshahi</option><option>Sylhet</option><option>Khulna</option>
            </select>
          </label>
          <label className="form-control">
            <span>Facility</span>
            <select className="select select-bordered" value={facilityType} onChange={(event) => setFacilityType(event.target.value)}>
              <option value="">All types</option><option value="government">Government</option><option value="private">Private</option>
            </select>
          </label>
          <label className="form-control">
            <span>Radius · km</span>
            <select className="select select-bordered" value={maxDistance} onChange={(event) => setMaxDistance(event.target.value)}>
              <option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option>
            </select>
          </label>
          <label className="form-control md:col-span-2">
            <span>Specialty</span>
            <input className="input input-bordered" value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="e.g. Emergency" />
          </label>
          <div className="flex items-end md:col-span-3">
            <button type="button" className="btn btn-primary rounded-full" onClick={requestLocation} disabled={locating}>
              <Navigation size={16} /> {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        </form>
      )}

      {status && <p className="text-xs opacity-70">{status}</p>}
      {error && <p role="alert" className="error-message">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="radar-stage" aria-label="Care radar showing facilities with available GPS coordinates">
          <div className="radar-disc">
            <div className="radar-sweep" />
            {pins.map(({ hospital, position }) => (
              <span
                key={hospital.id}
                className="radar-pin"
                style={position}
                title={`${hospital.name}${hospital.distance_km != null ? ` · ${hospital.distance_km} km` : ''}`}
              />
            ))}
          </div>
          {!pins.length && <p className="radar-empty">{loading ? 'Locating verified care…' : 'No facilities with GPS coordinates in this result set.'}</p>}
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><MapPin size={13} /> GPS care map</span>
        </div>

        <div className="glass-card space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display font-bold">Nearby facilities</h3>
            <span className="badge badge-outline">{loading ? 'Loading' : `${hospitals.length} results`}</span>
          </div>
          {hospitals.slice(0, compact ? 3 : 8).map((hospital) => (
            <article key={hospital.id} className="rounded-2xl border border-seafoam/65 bg-white/55 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold">{hospital.name}</h4>
                  <p className="mt-1 text-xs opacity-70">{hospital.address}, {hospital.city}</p>
                </div>
                {hospital.emergency_services && <ShieldCheck className="h-4 w-4 shrink-0 text-slateteal" aria-label="Emergency services" />}
              </div>
              <p className="mt-2 flex items-center gap-2 text-[10px] font-semibold">
                <Building2 size={13} /> {hospital.facility_type}
                {hospital.distance_km != null && <span>· {hospital.distance_km} km</span>}
              </p>
            </article>
          ))}
          {!loading && !error && hospitals.length === 0 && <p className="py-8 text-center text-xs opacity-70">No facilities match these filters.</p>}
        </div>
      </div>
    </div>
  );
}
