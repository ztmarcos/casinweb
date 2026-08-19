import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { ClientConfig } from '../config/clients';
import './AdminDashboard.css';

interface AdminDashboardProps {
  config: ClientConfig;
}

interface AnalyticsData {
  totalVisits: number;
  totalClicks: number;
  visitsToday: number;
  visitsByDay: { date: string; count: number }[];
  topNodes: { nodeTitle: string; clicks: number }[];
  recentActivity: { 
    type: string; 
    nodeTitle?: string; 
    timestamp: Date;
    browser?: string;
    os?: string;
    isMobile?: boolean;
    referrer?: string;
    sessionId?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
      countryCode?: string;
    };
  }[];
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browserStats: { browser: string; count: number }[];
  referrerStats: { referrer: string; count: number }[];
  locationStats: { country: string; count: number }[];
  uniqueSessions: number;
  returnVisitors: number;
  avgScrollDepth: number;
  avgSessionDuration: number;
  avgInteractions: number;
  connectionStats: { type: string; count: number }[];
  deviceMemoryStats: { memory: string; count: number }[];
  comments: {
    comment: string;
    timestamp: Date;
    userAgent?: string;
    language?: string;
  }[];
}

const AdminDashboard = ({ config }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [data, setData] = useState<AnalyticsData>({
    totalVisits: 0,
    totalClicks: 0,
    visitsToday: 0,
    visitsByDay: [],
    topNodes: [],
    recentActivity: [],
    deviceStats: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    browserStats: [],
    referrerStats: [],
    locationStats: [],
    uniqueSessions: 0,
    returnVisitors: 0,
    avgScrollDepth: 0,
    avgSessionDuration: 0,
    avgInteractions: 0,
    connectionStats: [],
    deviceMemoryStats: [],
    comments: [],
  });
  const [monthlyData, setMonthlyData] = useState<AnalyticsData>({
    totalVisits: 0,
    totalClicks: 0,
    visitsToday: 0,
    visitsByDay: [],
    topNodes: [],
    recentActivity: [],
    deviceStats: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    browserStats: [],
    referrerStats: [],
    locationStats: [],
    uniqueSessions: 0,
    returnVisitors: 0,
    avgScrollDepth: 0,
    avgSessionDuration: 0,
    avgInteractions: 0,
    connectionStats: [],
    deviceMemoryStats: [],
    comments: [],
  });
  const [yearlyData, setYearlyData] = useState<AnalyticsData>({
    totalVisits: 0,
    totalClicks: 0,
    visitsToday: 0,
    visitsByDay: [],
    topNodes: [],
    recentActivity: [],
    deviceStats: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    browserStats: [],
    referrerStats: [],
    locationStats: [],
    uniqueSessions: 0,
    returnVisitors: 0,
    avgScrollDepth: 0,
    avgSessionDuration: 0,
    avgInteractions: 0,
    connectionStats: [],
    deviceMemoryStats: [],
    comments: [],
  });
  const [audioPlays, setAudioPlays] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [config.id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let collectionName = 'analyticsCASIN';
      
      if (config.id === 'terapia-psicologica') {
        collectionName = 'analyticsTerapia';
      } else if (config.id === 'marcoszt0') {
        collectionName = 'analyticsMarcos';
      } else if (config.id === 'mqwfj') {
        collectionName = 'analyticsMQWFJ';
      }
      
      console.log('[AdminDashboard] Fetching analytics for:', config.id, 'from collection:', collectionName);
      console.log('[AdminDashboard] Using Firestore instance from project:', db.app.options.projectId);
      const analyticsRef = collection(db, collectionName);
      
      // Get all events - use simple query first to avoid index issues
      console.log('[AdminDashboard] Creating query without orderBy...');
      const simpleQuery = query(analyticsRef, limit(1000));
      console.log('[AdminDashboard] Executing query...');
      const snapshot = await getDocs(simpleQuery);
      console.log('[AdminDashboard] Query completed. Found', snapshot.docs.length, 'events');
      
      console.log('[AdminDashboard] Processing', snapshot.docs.length, 'documents...');
      const events = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          eventType: data.eventType || 'unknown',
          nodeId: data.nodeId,
          nodeTitle: data.nodeTitle,
          timestamp: data.timestamp?.toDate() || new Date(),
          browser: data.browser || 'Unknown',
          os: data.os || 'Unknown',
          isMobile: data.isMobile || false,
          isTablet: data.isTablet || false,
          referrer: data.referrer || 'direct',
          sessionId: data.sessionId || 'unknown',
          screenWidth: data.screenWidth,
          screenHeight: data.screenHeight,
          viewportWidth: data.viewportWidth,
          viewportHeight: data.viewportHeight,
          devicePixelRatio: data.devicePixelRatio,
          colorDepth: data.colorDepth,
          hardwareConcurrency: data.hardwareConcurrency,
          deviceMemory: data.deviceMemory,
          touchSupport: data.touchSupport,
          platform: data.platform,
          connectionType: data.connectionType,
          scrollDepth: data.scrollDepth,
          orientation: data.orientation,
          isReturnVisitor: data.isReturnVisitor,
          sessionDuration: data.sessionDuration,
          interactionCount: data.interactionCount,
          language: data.language,
          timezone: data.timezone,
          location: data.location || null,
        };
      });
      console.log('[AdminDashboard] Processed', events.length, 'events');
      
      // Sort events by timestamp descending (in memory, since we can't use orderBy if collection is empty)
      events.sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
        return timeB - timeA; // Descending order
      });
      console.log('[AdminDashboard] Events sorted by timestamp');

      // Calculate total visits and clicks
      const visits = events.filter(e => e.eventType === 'page_visit');
      const clicks = events.filter(e => e.eventType === 'node_click');
      const audioPlaysEvents = events.filter(e => e.eventType === 'audio_play');

      // Calculate visits today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visitsToday = visits.filter(e => e.timestamp >= today).length;

      // Calculate visits by day (last 7 days)
      const visitsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = visits.filter(e => 
          e.timestamp >= date && e.timestamp < nextDay
        ).length;
        
        visitsByDay.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          count,
        });
      }

      // Calculate top clicked nodes
      const nodeCounts: Record<string, number> = {};
      clicks.forEach(e => {
        const title = e.nodeTitle || 'Sin título';
        nodeCounts[title] = (nodeCounts[title] || 0) + 1;
      });
      
      const topNodes = Object.entries(nodeCounts)
        .map(([nodeTitle, clicks]) => ({ nodeTitle, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      // Recent activity (last 10 events)
      const recentActivity = events.slice(0, 10).map(e => ({
        type: e.eventType === 'page_visit' ? 'Visita' : e.eventType === 'audio_play' ? 'Audio' : 'Click',
        nodeTitle: e.nodeTitle,
        timestamp: e.timestamp,
        browser: e.browser,
        os: e.os,
        isMobile: e.isMobile || e.isTablet,
        referrer: e.referrer,
        sessionId: e.sessionId,
        location: e.location,
      }));

      // Location statistics
      const locationCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.location && e.location.country) {
          const country = e.location.country;
          locationCounts[country] = (locationCounts[country] || 0) + 1;
        }
      });
      const locationStats = Object.entries(locationCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 countries

      // Device statistics
      const deviceStats = {
        mobile: events.filter(e => e.isMobile && !e.isTablet).length,
        desktop: events.filter(e => !e.isMobile && !e.isTablet).length,
        tablet: events.filter(e => e.isTablet).length,
      };

      // Browser statistics
      const browserCounts: Record<string, number> = {};
      events.forEach(e => {
        const browser = e.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      });
      const browserStats = Object.entries(browserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Referrer statistics
      const referrerCounts: Record<string, number> = {};
      events.forEach(e => {
        const ref = e.referrer === 'direct' ? 'Directo' : 
                   e.referrer.includes('google') ? 'Google' :
                   e.referrer.includes('facebook') ? 'Facebook' :
                   e.referrer.includes('instagram') ? 'Instagram' :
                   e.referrer.includes('twitter') || e.referrer.includes('x.com') ? 'Twitter/X' :
                   e.referrer.includes('tiktok') ? 'TikTok' :
                   e.referrer.includes('youtube') ? 'YouTube' :
                   'Otro';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const referrerStats = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count);

      // Unique sessions
      const uniqueSessions = new Set(events.map(e => e.sessionId)).size;

      // Return visitors
      const returnVisitors = events.filter(e => e.isReturnVisitor === true).length;

      // Average scroll depth
      const scrollDepths = events
        .filter(e => e.scrollDepth !== undefined && e.scrollDepth !== null)
        .map(e => e.scrollDepth as number);
      const avgScrollDepth = scrollDepths.length > 0
        ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
        : 0;

      // Average session duration
      const sessionDurations = events
        .filter(e => e.sessionDuration !== undefined && e.sessionDuration !== null)
        .map(e => e.sessionDuration as number);
      const avgSessionDuration = sessionDurations.length > 0
        ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
        : 0;

      // Average interactions
      const interactions = events
        .filter(e => e.interactionCount !== undefined && e.interactionCount !== null)
        .map(e => e.interactionCount as number);
      const avgInteractions = interactions.length > 0
        ? Math.round(interactions.reduce((a, b) => a + b, 0) / interactions.length)
        : 0;

      // Connection type statistics
      const connectionCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.connectionType) {
          const type = e.connectionType;
          connectionCounts[type] = (connectionCounts[type] || 0) + 1;
        }
      });
      const connectionStats = Object.entries(connectionCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Device memory statistics
      const memoryCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.deviceMemory) {
          const memory = `${e.deviceMemory}GB`;
          memoryCounts[memory] = (memoryCounts[memory] || 0) + 1;
        }
      });
      const deviceMemoryStats = Object.entries(memoryCounts)
        .map(([memory, count]) => ({ memory, count }))
        .sort((a, b) => b.count - a.count);

      // Fetch comments (for marcoszt0 and mqwfj)
      let comments: any[] = [];
      if (config.id === 'marcoszt0' || config.id === 'mqwfj') {
        try {
          const commentsCollection = config.id === 'mqwfj' ? 'commentsMQWFJ' : 'commentsMarcos';
          const commentsRef = collection(db, commentsCollection);
          const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'), limit(50));
          const commentsSnapshot = await getDocs(commentsQuery);
          comments = commentsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              comment: data.comment || '',
              timestamp: data.timestamp?.toDate() || new Date(),
              userAgent: data.userAgent,
              language: data.language,
            };
          });
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      }

      // Calculate monthly data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyVisits = visits.filter(e => e.timestamp >= thirtyDaysAgo);
      const monthlyClicks = clicks.filter(e => e.timestamp >= thirtyDaysAgo);
      const monthlyVisitsByDay: { date: string; count: number }[] = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = monthlyVisits.filter(e => 
          e.timestamp >= date && e.timestamp < nextDay
        ).length;
        
        monthlyVisitsByDay.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          count,
        });
      }

      // Calculate yearly data (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const yearlyVisits = visits.filter(e => e.timestamp >= twelveMonthsAgo);
      const yearlyClicks = clicks.filter(e => e.timestamp >= twelveMonthsAgo);
      const yearlyVisitsByDay: { date: string; count: number }[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const count = yearlyVisits.filter(e => 
          e.timestamp >= date && e.timestamp < nextMonth
        ).length;
        
        yearlyVisitsByDay.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          count,
        });
      }

      // Monthly stats
      const monthlyDeviceStats = {
        mobile: monthlyVisits.filter(e => e.isMobile && !e.isTablet).length,
        desktop: monthlyVisits.filter(e => !e.isMobile && !e.isTablet).length,
        tablet: monthlyVisits.filter(e => e.isTablet).length,
      };

      const monthlyBrowserCounts: Record<string, number> = {};
      monthlyVisits.forEach(e => {
        const browser = e.browser || 'Unknown';
        monthlyBrowserCounts[browser] = (monthlyBrowserCounts[browser] || 0) + 1;
      });
      const monthlyBrowserStats = Object.entries(monthlyBrowserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Yearly stats
      const yearlyDeviceStats = {
        mobile: yearlyVisits.filter(e => e.isMobile && !e.isTablet).length,
        desktop: yearlyVisits.filter(e => !e.isMobile && !e.isTablet).length,
        tablet: yearlyVisits.filter(e => e.isTablet).length,
      };

      const yearlyBrowserCounts: Record<string, number> = {};
      yearlyVisits.forEach(e => {
        const browser = e.browser || 'Unknown';
        yearlyBrowserCounts[browser] = (yearlyBrowserCounts[browser] || 0) + 1;
      });
      const yearlyBrowserStats = Object.entries(yearlyBrowserCounts)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate audio plays
      const audioPlaysToday = audioPlaysEvents.filter(e => e.timestamp >= today).length;
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const audioPlaysThisMonth = audioPlaysEvents.filter(e => e.timestamp >= thisMonthStart).length;
      const thisYearStart = new Date();
      thisYearStart.setMonth(0, 1);
      thisYearStart.setHours(0, 0, 0, 0);
      const audioPlaysThisYear = audioPlaysEvents.filter(e => e.timestamp >= thisYearStart).length;

      setData({
        totalVisits: visits.length,
        totalClicks: clicks.length,
        visitsToday,
        visitsByDay,
        topNodes,
        recentActivity,
        deviceStats,
        browserStats,
        referrerStats,
        locationStats,
        uniqueSessions,
        returnVisitors,
        avgScrollDepth,
        avgSessionDuration,
        avgInteractions,
        connectionStats,
        deviceMemoryStats,
        comments,
      });

      const monthlyEvents = events.filter(e => {
        const eventDate = e.timestamp;
        return eventDate >= thirtyDaysAgo;
      });

      const monthlyReturnVisitors = monthlyEvents.filter(e => e.isReturnVisitor === true).length;
      const monthlyScrollDepths = monthlyEvents
        .filter(e => e.scrollDepth !== undefined && e.scrollDepth !== null)
        .map(e => e.scrollDepth as number);
      const monthlyAvgScrollDepth = monthlyScrollDepths.length > 0
        ? Math.round(monthlyScrollDepths.reduce((a, b) => a + b, 0) / monthlyScrollDepths.length)
        : 0;
      const monthlySessionDurations = monthlyEvents
        .filter(e => e.sessionDuration !== undefined && e.sessionDuration !== null)
        .map(e => e.sessionDuration as number);
      const monthlyAvgSessionDuration = monthlySessionDurations.length > 0
        ? Math.round(monthlySessionDurations.reduce((a, b) => a + b, 0) / monthlySessionDurations.length)
        : 0;
      const monthlyInteractions = monthlyEvents
        .filter(e => e.interactionCount !== undefined && e.interactionCount !== null)
        .map(e => e.interactionCount as number);
      const monthlyAvgInteractions = monthlyInteractions.length > 0
        ? Math.round(monthlyInteractions.reduce((a, b) => a + b, 0) / monthlyInteractions.length)
        : 0;

      setMonthlyData({
        totalVisits: monthlyVisits.length,
        totalClicks: monthlyClicks.length,
        visitsToday: monthlyVisits.filter(e => e.timestamp >= today).length,
        visitsByDay: monthlyVisitsByDay,
        topNodes: topNodes,
        recentActivity: recentActivity.slice(0, 10),
        deviceStats: monthlyDeviceStats,
        browserStats: monthlyBrowserStats,
        referrerStats: referrerStats,
        locationStats: locationStats,
        uniqueSessions: new Set(monthlyVisits.map(e => e.sessionId)).size,
        returnVisitors: monthlyReturnVisitors,
        avgScrollDepth: monthlyAvgScrollDepth,
        avgSessionDuration: monthlyAvgSessionDuration,
        avgInteractions: monthlyAvgInteractions,
        connectionStats: connectionStats,
        deviceMemoryStats: deviceMemoryStats,
        comments: comments,
      });

      const yearlyEvents = events.filter(e => {
        const eventDate = e.timestamp;
        return eventDate >= twelveMonthsAgo;
      });

      const yearlyReturnVisitors = yearlyEvents.filter(e => e.isReturnVisitor === true).length;
      const yearlyScrollDepths = yearlyEvents
        .filter(e => e.scrollDepth !== undefined && e.scrollDepth !== null)
        .map(e => e.scrollDepth as number);
      const yearlyAvgScrollDepth = yearlyScrollDepths.length > 0
        ? Math.round(yearlyScrollDepths.reduce((a, b) => a + b, 0) / yearlyScrollDepths.length)
        : 0;
      const yearlySessionDurations = yearlyEvents
        .filter(e => e.sessionDuration !== undefined && e.sessionDuration !== null)
        .map(e => e.sessionDuration as number);
      const yearlyAvgSessionDuration = yearlySessionDurations.length > 0
        ? Math.round(yearlySessionDurations.reduce((a, b) => a + b, 0) / yearlySessionDurations.length)
        : 0;
      const yearlyInteractions = yearlyEvents
        .filter(e => e.interactionCount !== undefined && e.interactionCount !== null)
        .map(e => e.interactionCount as number);
      const yearlyAvgInteractions = yearlyInteractions.length > 0
        ? Math.round(yearlyInteractions.reduce((a, b) => a + b, 0) / yearlyInteractions.length)
        : 0;

      setYearlyData({
        totalVisits: yearlyVisits.length,
        totalClicks: yearlyClicks.length,
        visitsToday: yearlyVisits.filter(e => e.timestamp >= today).length,
        visitsByDay: yearlyVisitsByDay,
        topNodes: topNodes,
        recentActivity: recentActivity.slice(0, 10),
        deviceStats: yearlyDeviceStats,
        browserStats: yearlyBrowserStats,
        referrerStats: referrerStats,
        locationStats: locationStats,
        uniqueSessions: new Set(yearlyVisits.map(e => e.sessionId)).size,
        returnVisitors: yearlyReturnVisitors,
        avgScrollDepth: yearlyAvgScrollDepth,
        avgSessionDuration: yearlyAvgSessionDuration,
        avgInteractions: yearlyAvgInteractions,
        connectionStats: connectionStats,
        deviceMemoryStats: deviceMemoryStats,
        comments: comments,
      });

      setAudioPlays({
        daily: audioPlaysToday,
        monthly: audioPlaysThisMonth,
        yearly: audioPlaysThisYear,
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      // If it's a permissions error, show a helpful message
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.error('⚠️ Firestore permissions issue. Please check:');
        console.error('1. Firestore rules allow read access to analyticsMQWFJ collection');
        console.error('2. The collection analyticsMQWFJ exists in Firestore');
        console.error('3. Your Firebase project allows requests from mqwfj.web.app');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  const currentData = activeTab === 'daily' ? data : activeTab === 'monthly' ? monthlyData : yearlyData;
  const currentAudioPlays = activeTab === 'daily' ? audioPlays.daily : activeTab === 'monthly' ? audioPlays.monthly : audioPlays.yearly;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel de Administración</h1>
          <p className="dashboard-subtitle">{config.name}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Diario
        </button>
        <button
          className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Mensual
        </button>
        <button
          className={`tab-button ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
        >
          Anual
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Visitas Totales</div>
          <div className="stat-value">{currentData.totalVisits}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clicks en Links</div>
          <div className="stat-value">{currentData.totalClicks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Visitas Hoy</div>
          <div className="stat-value">{currentData.visitsToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sesiones Únicas</div>
          <div className="stat-value">{currentData.uniqueSessions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Visitantes Recurrentes</div>
          <div className="stat-value">{currentData.returnVisitors}</div>
        </div>
        {config.id === 'mqwfj' && (
          <div className="stat-card">
            <div className="stat-label">Reproducciones de Audio</div>
            <div className="stat-value">{currentAudioPlays}</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-label">Profundidad de Scroll Promedio</div>
          <div className="stat-value">{currentData.avgScrollDepth}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Duración Promedio de Sesión</div>
          <div className="stat-value">{Math.floor(currentData.avgSessionDuration / 60)}m {currentData.avgSessionDuration % 60}s</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Interacciones Promedio</div>
          <div className="stat-value">{currentData.avgInteractions}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">
            {activeTab === 'daily' && 'Visitas por Día (Últimos 7 días)'}
            {activeTab === 'monthly' && 'Visitas por Día (Últimos 30 días)'}
            {activeTab === 'yearly' && 'Visitas por Mes (Últimos 12 meses)'}
          </h2>
          <div className="bar-chart">
            {currentData.visitsByDay.map((day, i) => (
              <div key={i} className="bar-item">
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${Math.max(10, (day.count / Math.max(...currentData.visitsByDay.map(d => d.count), 1)) * 100)}%` 
                    }}
                  >
                    <span className="bar-value">{day.count}</span>
                  </div>
                </div>
                <div className="bar-label">{day.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Nodos Más Visitados</h2>
          <div className="top-nodes-list">
            {data.topNodes.length > 0 ? (
              data.topNodes.map((node, i) => (
                <div key={i} className="top-node-item">
                  <span className="node-rank">{i + 1}</span>
                  <span className="node-title">{node.nodeTitle}</span>
                  <span className="node-count">{node.clicks} clicks</span>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de clicks aún</p>
            )}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Dispositivos</h2>
          <div className="device-stats">
            <div className="device-item">
              <span className="device-label">📱 Móvil</span>
              <span className="device-value">{currentData.deviceStats.mobile}</span>
            </div>
            <div className="device-item">
              <span className="device-label">💻 Desktop</span>
              <span className="device-value">{currentData.deviceStats.desktop}</span>
            </div>
            <div className="device-item">
              <span className="device-label">📱 Tablet</span>
              <span className="device-value">{currentData.deviceStats.tablet}</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Navegadores</h2>
          <div className="browser-stats">
            {currentData.browserStats.length > 0 ? (
              currentData.browserStats.map((browser, i) => (
                <div key={i} className="browser-item">
                  <span className="browser-name">{browser.browser}</span>
                  <span className="browser-count">{browser.count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos</p>
            )}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Ubicaciones (Países)</h2>
          <div className="location-stats">
            {currentData.locationStats.length > 0 ? (
              currentData.locationStats.map((loc, i) => (
                <div key={i} className="location-item">
                  <span className="location-name">🌍 {loc.country}</span>
                  <span className="location-count">{loc.count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de ubicación aún</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Origen de Tráfico</h2>
          <div className="referrer-stats">
            {currentData.referrerStats.length > 0 ? (
              currentData.referrerStats.map((ref, i) => (
                <div key={i} className="referrer-item">
                  <span className="referrer-name">{ref.referrer}</span>
                  <span className="referrer-count">{ref.count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos</p>
            )}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Links Más Visitados</h2>
          <div className="top-nodes-list">
            {currentData.topNodes.length > 0 ? (
              currentData.topNodes.map((node, i) => (
                <div key={i} className="top-node-item">
                  <span className="node-rank">{i + 1}</span>
                  <span className="node-title">{node.nodeTitle}</span>
                  <span className="node-count">{node.clicks} clicks</span>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de clicks aún</p>
            )}
          </div>
        </div>

        {currentData.connectionStats.length > 0 && (
          <div className="chart-card">
            <h2 className="chart-title">Tipo de Conexión</h2>
            <div className="connection-stats">
              {currentData.connectionStats.map((conn, i) => (
                <div key={i} className="connection-item">
                  <span className="connection-name">📶 {conn.type}</span>
                  <span className="connection-count">{conn.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentData.deviceMemoryStats.length > 0 && (
          <div className="chart-card">
            <h2 className="chart-title">Memoria del Dispositivo</h2>
            <div className="memory-stats">
              {currentData.deviceMemoryStats.map((mem, i) => (
                <div key={i} className="memory-item">
                  <span className="memory-name">💾 {mem.memory}</span>
                  <span className="memory-count">{mem.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="activity-card">
        <h2 className="chart-title">Actividad Reciente (con detalles)</h2>
        <div className="activity-list">
          {currentData.recentActivity.length > 0 ? (
            currentData.recentActivity.map((activity, i) => (
              <div key={i} className="activity-item-detailed">
                <div className="activity-main">
                  <span className="activity-type">{activity.type}</span>
                  {activity.nodeTitle && (
                    <span className="activity-node">→ {activity.nodeTitle}</span>
                  )}
                  <span className="activity-time">
                    {activity.timestamp.toLocaleString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="activity-details">
                  <span className="activity-browser">{activity.browser}</span>
                  <span className="activity-os">{activity.os}</span>
                  {activity.isMobile && <span className="activity-mobile">📱 Móvil</span>}
                  {activity.location && (
                    <span className="activity-location">
                      🌍 {activity.location.city ? `${activity.location.city}, ` : ''}
                      {activity.location.region ? `${activity.location.region}, ` : ''}
                      {activity.location.country || 'Unknown'}
                    </span>
                  )}
                  {activity.referrer && activity.referrer !== 'direct' && (
                    <span className="activity-referrer">Desde: {activity.referrer}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No hay actividad registrada aún</p>
          )}
        </div>
      </div>

      {(config.id === 'marcoszt0' || config.id === 'mqwfj') && (
        <div className="activity-card">
          <h2 className="chart-title">Comentarios ({currentData.comments.length})</h2>
          <div className="comments-list">
            {currentData.comments.length > 0 ? (
              currentData.comments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-text">{comment.comment}</div>
                  <div className="comment-meta">
                    <span className="comment-time">
                      {comment.timestamp.toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {comment.language && (
                      <span className="comment-language">🌐 {comment.language}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No hay comentarios aún</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

