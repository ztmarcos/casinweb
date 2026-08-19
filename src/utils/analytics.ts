import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AnalyticsEvent {
  eventType: 'page_visit' | 'node_click' | 'audio_play';
  clientId: string;
  nodeId?: string;
  nodeTitle?: string;
  timestamp?: any;
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
  colorDepth?: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  touchSupport?: boolean;
  platform?: string;
  connectionType?: string;
  scrollDepth?: number;
  orientation?: string;
  isReturnVisitor?: boolean;
  sessionDuration?: number;
  interactionCount?: number;
  language?: string;
  timezone?: string;
  sessionId?: string;
  pageUrl?: string;
  timeOnPage?: number;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    countryCode?: string;
    lat?: number;
    lon?: number;
  };
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Check if user is a return visitor
const isReturnVisitor = (): boolean => {
  const hasVisited = localStorage.getItem('has_visited_before');
  if (!hasVisited) {
    localStorage.setItem('has_visited_before', 'true');
    return false;
  }
  return true;
};

// Get connection type if available
const getConnectionType = (): string | undefined => {
  const nav = navigator as any;
  if (nav.connection) {
    return nav.connection.effectiveType || nav.connection.type || undefined;
  }
  if (nav.mozConnection) {
    return nav.mozConnection.effectiveType || nav.mozConnection.type || undefined;
  }
  if (nav.webkitConnection) {
    return nav.webkitConnection.effectiveType || nav.webkitConnection.type || undefined;
  }
  return undefined;
};

// Get device memory if available
const getDeviceMemory = (): number | undefined => {
  const nav = navigator as any;
  return nav.deviceMemory || undefined;
};

// Track scroll depth
let maxScrollDepth = 0;
const trackScrollDepth = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollPercentage = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
  maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
  return maxScrollDepth;
};

// Get location from IP using free API
const getLocationFromIP = async (): Promise<{
  country?: string;
  region?: string;
  city?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
} | null> => {
  try {
    // Try ipapi.co first (free tier: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        // If ipapi.co fails, try ip-api.com as fallback
        return await getLocationFromIPFallback();
      }
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        countryCode: data.country_code,
        lat: data.latitude,
        lon: data.longitude,
      };
    } else {
      return await getLocationFromIPFallback();
    }
  } catch (error) {
    console.error('Error fetching location from ipapi.co:', error);
    return await getLocationFromIPFallback();
  }
};

// Fallback to ip-api.com
const getLocationFromIPFallback = async (): Promise<{
  country?: string;
  region?: string;
  city?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
} | null> => {
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,countryCode,lat,lon', {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return {
          country: data.country,
          region: data.regionName,
          city: data.city,
          countryCode: data.countryCode,
          lat: data.lat,
          lon: data.lon,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching location from ip-api.com:', error);
  }
  return null;
};

export const logAnalyticsEvent = async (event: AnalyticsEvent) => {
  try {
    let collectionName = 'analyticsCASIN';
    
    if (event.clientId === 'terapia-psicologica') {
      collectionName = 'analyticsTerapia';
    } else if (event.clientId === 'marcoszt0') {
      collectionName = 'analyticsMarcos';
    } else if (event.clientId === 'mqwfj') {
      collectionName = 'analyticsMQWFJ';
    }
    
    console.log('[Analytics] Logging event:', event.eventType, 'for client:', event.clientId, 'to collection:', collectionName);
    
    // Extract browser info from user agent
    const userAgent = navigator.userAgent;
    const browserInfo = {
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      isTablet: /iPad|Android/.test(userAgent) && !/Mobile/.test(userAgent),
      browser: getBrowserName(userAgent),
      os: getOSName(userAgent),
    };
    
    // Get location (only for page visits to avoid too many API calls)
    let location = event.location;
    if (!location && event.eventType === 'page_visit') {
      // Only fetch location on first page visit, cache it in sessionStorage
      const cachedLocation = sessionStorage.getItem('analytics_location');
      if (cachedLocation) {
        try {
          location = JSON.parse(cachedLocation);
        } catch (e) {
          // If cache is invalid, fetch new location
          const fetchedLocation = await getLocationFromIP();
          if (fetchedLocation) {
            location = fetchedLocation;
            sessionStorage.setItem('analytics_location', JSON.stringify(location));
          }
        }
      } else {
        const fetchedLocation = await getLocationFromIP();
        if (fetchedLocation) {
          location = fetchedLocation;
          sessionStorage.setItem('analytics_location', JSON.stringify(location));
        }
      }
    }
    
    // Get additional device information
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const colorDepth = window.screen.colorDepth || 24;
    const hardwareConcurrency = navigator.hardwareConcurrency || undefined;
    const deviceMemory = getDeviceMemory();
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const platform = navigator.platform || 'unknown';
    const connectionType = getConnectionType();
    const orientation = window.screen.orientation 
      ? `${window.screen.orientation.type || window.screen.orientation.angle || 'unknown'}`
      : window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Track scroll depth for page visits
    let scrollDepth = event.scrollDepth;
    if (!scrollDepth && event.eventType === 'page_visit') {
      scrollDepth = trackScrollDepth();
    }

    // Check return visitor
    const isReturn = event.isReturnVisitor !== undefined 
      ? event.isReturnVisitor 
      : isReturnVisitor();

    const eventData = {
      ...event,
      timestamp: serverTimestamp(),
      userAgent: userAgent,
      referrer: document.referrer || 'direct',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth,
      viewportHeight,
      devicePixelRatio,
      colorDepth,
      hardwareConcurrency,
      deviceMemory,
      touchSupport,
      platform,
      connectionType,
      scrollDepth,
      orientation,
      isReturnVisitor: isReturn,
      language: navigator.language || navigator.languages?.[0] || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      location: location,
      ...browserInfo,
    };

    const collectionRef = collection(db, collectionName);
    await addDoc(collectionRef, eventData);
    console.log('[Analytics] Event saved successfully to', collectionName);
  } catch (error: any) {
    console.error('[Analytics] Error logging analytics event:', error);
    console.error('[Analytics] Event that failed:', event);
  }
};

// Helper functions to extract browser and OS info
const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
};

const getOSName = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
};

export const logPageVisit = (clientId: string) => {
  console.log('[Analytics] logPageVisit called with clientId:', clientId);
  logAnalyticsEvent({
    eventType: 'page_visit',
    clientId,
  });
};

export const logNodeClick = (clientId: string, nodeId: string, nodeTitle: string) => {
  logAnalyticsEvent({
    eventType: 'node_click',
    clientId,
    nodeId,
    nodeTitle,
  });
};

export const logAudioPlay = (clientId: string) => {
  // Count max 1 play per session (for this client + track)
  const nodeId = 'moogpianodeep';
  const dedupeKey = `audio_play_logged_${clientId}_${nodeId}`;  try {
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, '1');
  } catch {
    // If storage is blocked, fall back to counting each play
  }  logAnalyticsEvent({
    eventType: 'audio_play',
    clientId,
    nodeId,
    nodeTitle: 'Audio Play',
  });
};