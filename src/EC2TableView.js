import React, { useState, useEffect } from "react";
import "./EC2TableView.css"; // We will create this new CSS file

const PAGE_SIZE = 25; // Increased page size for better usability

// A simple 'X' icon for the close button
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function EC2TableView({ open, onClose }) {
  const [data, setData] = useState([]);
  const [regions, setRegions] = useState([]);
  
  // Filter state
  const [region, setRegion] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/aws_pricing.json")
        .then(res => res.json())
        .then(d => {
          const validData = d.filter(instance => Number(instance.PricePerHourUSD) > 0);
          setData(validData);
          setRegions([...new Set(validData.map(x => x.Region))].sort());
          setLoading(false);
        });
      setPage(1); // Reset page on open
    }
  }, [open]);

  // Apply filters and reset page
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setPage(1);
  };

  const filteredData = React.useMemo(() => {
    return data.filter(inst =>
      (!region || inst.Region === region) &&
      (!search || inst.InstanceType.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, region, search]);

  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>All AWS EC2 Instance Pricing</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </header>
        
        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="Search instance type..."
            value={search}
            onChange={handleSearchChange}
          />
          <select className="filter-input" value={region} onChange={handleRegionChange}>
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        
        <div className="table-container">
          {loading ? (
            <div className="loading-message">Loading instance data...</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Instance Type</th>
                    <th>vCPU</th>
                    <th>Memory (GB)</th>
                    <th>Region</th>
                    <th>Price/Hour (USD)</th>
                    <th>Price/vCPU-hr</th>
                    <th>Price/GB-hr</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={`${row.InstanceType}-${row.Region}-${idx}`}>
                      <td className="instance-type">{row.InstanceType}</td>
                      <td>{row.vCPU}</td>
                      <td>{parseFloat(row.MemoryGB).toFixed(2)}</td>
                      <td>{row.Region}</td>
                      <td className="price-cell">${parseFloat(row.PricePerHourUSD).toFixed(5)}</td>
                      <td>
                        {row.vCPU > 0
                          ? `$${(parseFloat(row.PricePerHourUSD) / row.vCPU).toFixed(5)}`
                          : "N/A"}
                      </td>
                      <td>
                        {row.MemoryGB > 0
                          ? `$${(parseFloat(row.PricePerHourUSD) / row.MemoryGB).toFixed(5)}`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && !loading && (
                 <div className="no-results-message">No instances match your search criteria.</div>
              )}
              <div className="pagination-controls">
                <span>Showing {Math.min(filteredData.length, 1 + (page-1) * PAGE_SIZE)}-{Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length}</span>
                <div className="pagination-buttons">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                    <span>Page {page} of {pageCount || 1}</span>
                    <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount || pageCount === 0}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}