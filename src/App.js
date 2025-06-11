import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from "recharts";

import "./App.css";
import BothTableView from './BothTableView';
import GCPTableView from './GCPTableView';
import EC2TableView from './EC2TableView';

const VcpuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg>;
const RamIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 3A1.5 1.5 0 002 4.5v2.879a1.5 1.5 0 00.44 1.06l1.12 1.121a.5.5 0 00.708 0L5.39 8.44A1.5 1.5 0 005.5 7.38V4.5A1.5 1.5 0 004 3h-.5zm12 0A1.5 1.5 0 0014 4.5v2.879a1.5 1.5 0 00.44 1.06l1.12 1.121a.5.5 0 00.708 0l1.12-1.12a1.5 1.5 0 00.44-1.06V4.5A1.5 1.5 0 0016.5 3h-.5zm-6 0A1.5 1.5 0 008 4.5v2.879a1.5 1.5 0 00.44 1.06l1.12 1.121a.5.5 0 00.708 0l1.12-1.12A1.5 1.5 0 0011.5 7.38V4.5A1.5 1.5 0 0010 3h-.5zM3 12a1 1 0 00-1 1v2.5A1.5 1.5 0 003.5 17h13A1.5 1.5 0 0018 15.5V13a1 1 0 10-2 0v1.5a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5V13a1 1 0 00-1-1z" /></svg>;
const AwsLogo = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.44 16.52l-2.1-4.12-1.87 4.12h3.97zm7.56-1.57c0 1.95-1.03 3.3-3.1 3.3-1.6 0-2.6-.96-2.9-1.92h-.08l-.16.14.7 1.78h-2.1L10.5 12h2.23l.3 1.18.06.33.1.4.08.35.08.3-.02-.02c.3.8 1.04 1.34 1.92 1.34.86 0 1.4-.4 1.4-1.17 0-.55-.26-1.05-1.2-1.4l-.8-.28c-1.3-.47-1.8-1.08-1.8-1.9 0-1.12.92-1.9 2.4-1.9 1.3 0 2.2.68 2.5 1.6h.07l.15-.13-.7-1.48h2.1l1.83 5.95zM4.44 18h2.08L7.9 12H5.82l-1.4 6zm1.3-8.86c-1.66 0-2.88-1.2-2.88-2.87S4.08 3.4 5.73 3.4c1.68 0 2.88 1.2 2.88 2.87 0 1.66-1.2 2.87-2.87 2.87z" /></svg>;
const GcpLogo = () => <svg viewBox="0 0 166 142" fill="currentColor"><path d="M165.4 63.8c0-4.6-3.8-8.4-8.4-8.4h-2.1V40.2c0-4.6-3.8-8.4-8.4-8.4h-24.2c-4.6 0-8.4 3.8-8.4 8.4v15.2h-32.9c-4.6 0-8.4 3.8-8.4 8.4v24.1c0 4.6 3.8 8.4 8.4 8.4h32.9v15.2c0 4.6 3.8 8.4 8.4 8.4h24.1c4.6 0 8.4-3.8 8.4-8.4v-15.2h2.1c4.6 0 8.4-3.8 8.4-8.4l.1-24.1z" /><path d="M64.6 22.9C50.2 9.3 29.8 0 8.4 0 3.8 0 0 3.8 0 8.4v24.2C0 37.2 3.8 41 8.4 41c15.8 0 30.1 6.3 40.5 16.7l15.7 15.7V40.2c0-4.6-3.8-8.4-8.4-8.4l-24.2.1z" fill="#FBBC04" /><path d="M49.3 98.2L33.6 82.5C23.2 72.1 8.9 65.8 0 65.8v-2.1c0-4.6-3.8-8.4-8.4-8.4H-8.4c-4.6 0-8.4 3.8-8.4 8.4v24.2c0 4.6 3.8 8.4 8.4 8.4l2.1-.1v15.2c0 4.6 3.8 8.4 8.4 8.4h24.2c4.6 0 8.4-3.8 8.4-8.4l-.1-24.2z" transform="translate(16.8 28.5)" fill="#EA4335" /><path d="M31.8 15.7L16.1 0C5.7 10.4 0 24.7 0 38.7c0 4.6 3.8 8.4 8.4 8.4h24.2c4.6 0 8.4-3.8 8.4-8.4V15.7z" transform="translate(73.1 49.3)" fill="#34A853" /></svg>;

const generateOptions = (count, multiplier) =>
  [...Array(count)].map((_, i) => ({
    value: (i + 1) * multiplier,
    label: `${(i + 1) * multiplier}`
  }));

function App() {
  const [aws, setAws] = useState([]);
  const [gcp, setGcp] = useState([]);
  const [regions, setRegions] = useState([]);
  const [vcpu, setVcpu] = useState(2);
  const [ram, setRam] = useState(4);
  const [region, setRegion] = useState("North America");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cheapest, setCheapest] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showGCPTable, setShowGCPTable] = useState(false);
  const [showBothTable, setShowBothTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [awsData, gcpData, regionData] = await Promise.all([
        fetch("/aws_pricing.json").then((r) => r.json()),
        fetch("/gcp_pricing.json").then((r) => r.json()),
        fetch("/region_mapping.json").then((r) => r.json()),
      ]);
      setAws(awsData);
      setGcp(gcpData);
      setRegions(regionData);
    };
    fetchData();
  }, []);

  const normRegionList = useMemo(() => [...new Set(regions.map((r) => r["Normalized Geographic Name"]))].sort(), [regions]);
  const vcpuOptions = useMemo(() => generateOptions(64, 2), []);
  const ramOptions = useMemo(() => generateOptions(64, 4), []);

  const findExactMatch = () => {
    setLoading(true);
    setResult(null);
    setCheapest(null);

    setTimeout(() => {
      const regionRows = regions.filter((r) => r["Normalized Geographic Name"] === region);
      const awsRegions = regionRows.map((r) => r["AWS Region Name"]);
      const gcpRegions = regionRows.map((r) => r["GCP Region Code"]);

      // Find ALL matching AWS instances and sort by price
      const awsMatches = aws.filter((x) =>
        awsRegions.includes(x.Region) &&
        Number(x.vCPU) === vcpu && 
        Number(x.MemoryGB) === ram && 
        Number(x.PricePerHourUSD) > 0
      ).sort((a, b) => Number(a.PricePerHourUSD) - Number(b.PricePerHourUSD));

      // Find ALL matching GCP instances and sort by price
      const gcpMatches = gcp.filter((x) =>
        gcpRegions.includes(x.Region) &&
        Number(x.CPUs) === vcpu && 
        Number(x.Memory) === ram && 
        Number(x["Current Cost"]) > 0
      ).sort((a, b) => Number(a["Current Cost"]) - Number(b["Current Cost"]));

      // Get the cheapest from each (first in sorted array)
      const awsBest = awsMatches[0];
      const gcpBest = gcpMatches[0];

      const awsPrice = awsBest ? Number(awsBest.PricePerHourUSD) : Infinity;
      const gcpPrice = gcpBest ? Number(gcpBest["Current Cost"]) / 730 : Infinity;

      if (awsPrice !== Infinity || gcpPrice !== Infinity) {
        if (awsPrice < gcpPrice) setCheapest('aws');
        else if (gcpPrice < awsPrice) setCheapest('gcp');
      }

      setResult({
        aws: awsBest ? { 
          type: awsBest.InstanceType, 
          region: awsBest.Region, 
          vCPU: awsBest.vCPU, 
          mem: awsBest.MemoryGB, 
          price: awsBest.PricePerHourUSD 
        } : null,
        gcp: gcpBest ? { 
          type: gcpBest["Machine Type"], 
          region: gcpBest.Region, 
          vCPU: gcpBest.CPUs, 
          mem: gcpBest.Memory, 
          price: gcpBest["Current Cost"] 
        } : null,
      });
      setLoading(false);
    }, 800);
  };

  const pretty = (val, digits = 5) => Number(val).toFixed(digits);

  const chartData = useMemo(() => result ? [
    { name: "AWS", Price: Number(result.aws?.price) || 0 },
    { name: "GCP", Price: result.gcp ? Number(result.gcp.price) / 730 : 0 },
  ].filter(d => d.Price > 0) : [], [result]);

  const chartColors = {
    AWS: { start: '#FF9900', end: '#FFC300' },
    GCP: { start: '#4285F4', end: '#60A5FA' },
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/Cloudkeeper_New.png" alt="CloudKeeper Logo" className="logo" />
        <nav className="header-nav">
          <button className="nav-button" onClick={() => setShowTable(true)}>All AWS EC2</button>
          <button className="nav-button" onClick={() => setShowGCPTable(true)}>All GCP VMs</button>
          <button className="nav-button" onClick={() => setShowBothTable(true)}>Combined Pricing</button>
        </nav>
      </header>

      <main className="main-content" role="main">
        <section className="comparator-section" aria-labelledby="form-heading">
          <div className="form-card">
            <h1 id="form-heading" className="form-title">Cloud Instance Comparator</h1>
            <p className="form-subtitle">Instantly find the most cost-effective cloud instances on AWS and GCP tailored to your exact specifications.</p>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="vcpu-select">vCPUs</label>
                <select id="vcpu-select" value={vcpu} onChange={(e) => setVcpu(Number(e.target.value))}>
                  {vcpuOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="ram-select">RAM (GB)</label>
                <select id="ram-select" value={ram} onChange={(e) => setRam(Number(e.target.value))}>
                  {ramOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="region-select">Geographic Region</label>
                <select id="region-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                  {normRegionList.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button onClick={findExactMatch} className="compare-button" disabled={loading}>
              {loading ? 'Searching...' : 'Compare Prices'}
            </button>
          </div>
        </section>

        {(loading || result) && (
          <section className="results-section" aria-live="polite">
            {loading && <div className="loader" aria-label="Loading results"></div>}
            {result && (
              <div className="results-content">
                <div className="results-grid">
                  {/* --- AWS Result Card --- */}
                  <article className={`result-card aws-card ${cheapest === 'aws' ? 'best-value' : ''}`} aria-label="Best AWS match">
                    <h2 className="result-provider aws"><AwsLogo/><span>Amazon Web Services</span></h2>
                    {result.aws ? (
                      <>
                        <p className="result-spec">{result.aws.type}</p>
                        <div className="result-details">
                          <span className="detail-item"><VcpuIcon /> {result.aws.vCPU} vCPU</span>
                          <span className="detail-item"><RamIcon /> {result.aws.mem} GB RAM</span>
                        </div>
                        <div className="result-region">{result.aws.region}</div>
                        <p className="result-price">
                          ${pretty(result.aws.price)}
                          <span> / hour</span>
                        </p>
                      </>
                    ) : ( <p className="no-result">No exact match found.</p> )}
                  </article>

                  {/* --- GCP Result Card --- */}
                  <article className={`result-card gcp-card ${cheapest === 'gcp' ? 'best-value' : ''}`} aria-label="Best GCP match">
                    <h2 className="result-provider gcp"><GcpLogo/><span>Google Cloud Platform</span></h2>
                    {result.gcp ? (
                      <>
                        <p className="result-spec">{result.gcp.type}</p>
                        <div className="result-details">
                          <span className="detail-item"><VcpuIcon />{result.gcp.vCPU} vCPU</span>
                          <span className="detail-item"><RamIcon />{result.gcp.mem} GB RAM</span>
                        </div>
                        <div className="result-region">{result.gcp.region}</div>
                        <p className="result-price">
                          ${pretty(result.gcp.price / 730)}
                          <span> / hour</span>
                          <span className="monthly-price">(~${Number(result.gcp.price).toFixed(2)} / month)</span>
                        </p>
                      </>
                    ) : ( <p className="no-result">No exact match found.</p> )}
                  </article>
                </div>

                {chartData.length > 0 && (
                  <div className="chart-wrapper" aria-label="Price comparison chart">
                    <h3 className="chart-title">Hourly Price Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          {Object.entries(chartColors).map(([key, value]) => (
                            <linearGradient id={`color${key}`} key={key} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={value.start} stopOpacity={0.9}/>
                              <stop offset="95%" stopColor={value.end} stopOpacity={0.9}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="var(--color-text-secondary)" />
                        <YAxis hide={true} />
                        <Tooltip
                          cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                          contentStyle={{ background: "#374151", border: "1px solid var(--color-surface-2)", borderRadius: "var(--border-radius-lg)" }}
                          labelStyle={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}
                          formatter={(value) => [`$${pretty(value)} / hour`, null]}
                        />
                        <Bar dataKey="Price" radius={[8, 8, 0, 0]} maxBarSize={80}>
                          <LabelList dataKey="Price" position="top" formatter={(v) => `$${pretty(v)}`} fill="var(--color-text-primary)" fontWeight="600" fontSize="14" />
                          {chartData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={`url(#color${entry.name})`} /> ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <EC2TableView open={showTable} onClose={() => setShowTable(false)} />
      <GCPTableView open={showGCPTable} onClose={() => setShowGCPTable(false)} />
      <BothTableView open={showBothTable} onClose={() => setShowBothTable(false)} awsData={aws} gcpData={gcp} regionMap={regions} />
    </div>
  );
}

export default App;