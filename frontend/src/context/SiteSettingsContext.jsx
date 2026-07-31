import React, { createContext, useState, useEffect } from 'react';
import { getPublicSiteSettingsApi } from '../services/api';

export const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [values, setValues] = useState([]);
  const [features, setFeatures] = useState([]);
  const [team, setTeam] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSiteSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicSiteSettingsApi();
      if (res && res.success && res.data) {
        setSettings(res.data.settings);
        setValues(res.data.values || []);
        setFeatures(res.data.features || []);
        setTeam(res.data.team || []);
        setPartners(res.data.partners || []);
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
      setError("Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, values, features, team, partners, loading, error, refetch: fetchSiteSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
