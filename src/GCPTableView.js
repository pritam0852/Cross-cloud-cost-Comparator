import React, { useState, useEffect } from "react";
// Re-use the same CSS file for a consistent look and feel
import "./EC2TableView.css";

const PAGE_SIZE = 25;

// A simple 'X' icon for the close button
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function GCPTableView({ open, onClose }) {
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
      fetch("/gcp_pricing.json")
        .then(res => res.json())
        .then(d => {
          const validData = d.filter(instance => Number(instance["Current Cost"]) > 0);
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
    return data.filter(vm =>
      (!region || vm.Region === region) &&
      (!search || (vm["Machine Type"] && vm["Machine Type"].toLowerCase().includes(search.toLowerCase())))
    );
  }, [data, region, search]);

  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!open) return null;

  // Function to safely calculate derived costs
  const calculateCost = (cost, divisor) => {
    if (divisor > 0 && cost > 0) {
      return `$${(parseFloat(cost) / divisor).toFixed(5)}`;
    }
    return "N/A";
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>All GCP VM Instance Pricing</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </header>

        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="Search machine type..."
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
                    <th>Machine Type</th>
                    <th>vCPU</th>
                    <th>Memory (GB)</th>
                    <th>Region</th>
                    <th>Hourly Cost (Est.)</th>
                    <th>Monthly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={`${row["Machine Type"]}-${row.Region}-${idx}`}>
                      <td className="instance-type">{row["Machine Type"]}</td>
                      <td>{row.CPUs}</td>
                      <td>{parseFloat(row.Memory).toFixed(2)}</td>
                      <td>{row.Region}</td>
                      <td className="price-cell">{calculateCost(row["Current Cost"], 730)}</td>
                      <td>${parseFloat(row["Current Cost"]).toFixed(2)}</td>
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