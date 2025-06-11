import React, { useEffect, useState } from "react";
import "./BothTableView.css"; // We will create this new CSS file next

// A simple 'X' icon for the close button
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


export default function BothTableView({ open, onClose }) {
  const [awsData, setAwsData] = useState([]);
  const [gcpData, setGcpData] = useState([]);
  const [regionMap, setRegionMap] = useState([]);

  // Controlled filter values
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [vcpu, setVcpu] = useState("");
  const [ram, setRam] = useState("");

  // Applied filters (for triggering the actual filtering)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedVcpu, setAppliedVcpu] = useState("");
  const [appliedRam, setAppliedRam] = useState("");

  useEffect(() => {
    // Only fetch data if the modal is opened for the first time
    if (open && awsData.length === 0) {
      fetch("/aws_pricing.json").then(r => r.json()).then(setAwsData);
      fetch("/gcp_pricing.json").then(r => r.json()).then(setGcpData);
      fetch("/region_mapping.json").then(r => r.json()).then(setRegionMap);
    }
  }, [open, awsData.length]);

  const regionOptions = Array.from(
    new Set(regionMap.map(r => r["Normalized Geographic Name"]))
  ).sort();

  function getRegionCodes(normalizedRegion) {
    const rows = regionMap.filter(r => r["Normalized Geographic Name"] === normalizedRegion);
    return {
      aws: rows.map(r => r["AWS Region Name"]),
      gcp: rows.map(r => r["GCP Region Code"])
    };
  }

  function applyFilters() {
    setAppliedSearch(search);
    setAppliedRegion(region);
    setAppliedVcpu(vcpu);
    setAppliedRam(ram);
  }

  // Memoize filtered results for performance
  const combinedRows = React.useMemo(() => {
    let awsFiltered = awsData;
    let gcpFiltered = gcpData;

    if (appliedRegion) {
      const { aws: awsRegions, gcp: gcpRegions } = getRegionCodes(appliedRegion);
      awsFiltered = awsFiltered.filter(row => awsRegions.includes(row.Region));
      gcpFiltered = gcpFiltered.filter(row => gcpRegions.includes(row.Region));
    }
    if (appliedVcpu) {
      awsFiltered = awsFiltered.filter(row => Number(row.vCPU) === Number(appliedVcpu));
      gcpFiltered = gcpFiltered.filter(row => Number(row.CPUs) === Number(appliedVcpu));
    }
    if (appliedRam) {
      awsFiltered = awsFiltered.filter(row => Number(row.MemoryGB) === Number(appliedRam));
      gcpFiltered = gcpFiltered.filter(row => Number(row.Memory) === Number(appliedRam));
    }
    
    if (appliedSearch) {
      const lowercasedSearch = appliedSearch.toLowerCase();
      awsFiltered = awsFiltered.filter(row =>
        row.InstanceType?.toLowerCase().includes(lowercasedSearch)
      );
      gcpFiltered = gcpFiltered.filter(row =>
        row["Machine Type"]?.toLowerCase().includes(lowercasedSearch)
      );
    }
    awsFiltered = awsFiltered.filter(row => Number(row.PricePerHourUSD) > 0);
    gcpFiltered = gcpFiltered.filter(row => Number(row["Current Cost"]) > 0);

    return [
      ...awsFiltered.map(row => ({
        source: "AWS",
        type: row.InstanceType,
        vcpu: row.vCPU,
        ram: row.MemoryGB,
        region: row.Region,
        price: Number(row.PricePerHourUSD)
      })),
      ...gcpFiltered.map(row => ({
        source: "GCP",
        type: row["Machine Type"],
        vcpu: row.CPUs,
        ram: row.Memory,
        region: row.Region,
        price: Number(row["Current Cost"]) / 730 // Using 730 for consistency
      }))
    ].sort((a, b) => a.price - b.price);
  }, [awsData, gcpData, appliedRegion, appliedVcpu, appliedRam, appliedSearch, regionMap]);


  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Combined AWS & GCP Pricing</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </header>

        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="Search instance type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-input" value={region} onChange={e => setRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            className="filter-input small"
            type="number"
            min="1"
            placeholder="Min vCPU"
            value={vcpu}
            onChange={e => setVcpu(e.target.value)}
          />
          <input
            className="filter-input small"
            type="number"
            min="1"
            placeholder="Min RAM"
            value={ram}
            onChange={e => setRam(e.target.value)}
          />
          <button className="apply-filters-button" onClick={applyFilters}>
            Apply
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Instance/Machine Type</th>
                <th>vCPU</th>
                <th>Memory (GB)</th>
                <th>Region</th>
                <th>Price (USD/hr)</th>
              </tr>
            </thead>
            <tbody>
              {combinedRows.length > 0 ? (
                combinedRows.map((row, i) => (
                  <tr key={`${row.source}-${row.type}-${i}`}>
                    <td>
                      <span className={`source-badge ${row.source === "AWS" ? 'source-aws' : 'source-gcp'}`}>
                        {row.source}
                      </span>
                    </td>
                    <td>{row.type}</td>
                    <td>{row.vcpu}</td>
                    <td>{row.ram}</td>
                    <td>{row.region}</td>
                    <td>${row.price.toFixed(5)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results-message">
                    No results found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}