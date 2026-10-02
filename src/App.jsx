import React, { useEffect, useMemo, useState } from "react";
import PortfolioImpact from "./PortfolioImpact.jsx";
import PropertyIntelligence from "./PropertyIntelligence.jsx";
import ModelAssurance from "./ModelAssurance.jsx";
import ProductionArchitecture from "./ProductionArchitecture.jsx";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

const PAGES = [
  "Event Overview",
  "Portfolio Impact",
  "Property Intelligence",
  "Model Assurance",
  "Production Architecture",
];

function fmt(n) {
  return new Intl.NumberFormat("en-CA").format(n);
}

function pct(v, digits = 1) {
  return `${(v * 100).toFixed(digits)}%`;
}

function EventOverview({ summary, metrics, cells }) {
  const xgb2025 = metrics.find(
    (d) => d.model === "XGBoost" && d.evaluation === "2025 external"
  );

  const transformer2025 = metrics.find(
    (d) => d.model === "Transformer" && d.evaluation === "2025 external"
  );

  const counts = summary["2025_public_dataset"]["observed_public_zone_counts"];

  const mapCenter = useMemo(() => {
    if (!cells.length) return [51.09, -114.07];

    const lat =
      cells.reduce((s, d) => s + Number(d.latitude), 0) / cells.length;

    const lon =
      cells.reduce((s, d) => s + Number(d.longitude), 0) / cells.length;

    return [lat, lon];
  }, [cells]);

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">PUBLIC-DATA INSURANCE DEMONSTRATOR</div>
          <h1>Calgary Hail Property Intelligence</h1>
          <p className="hero-copy">
            Geospatial catastrophe intelligence combining residential exposure,
            NOAA MRMS hail observations, public damage-zone labels, machine
            learning, and independent-event validation.
          </p>
        </div>

        <div className="event-chip">
          <span>External validation event</span>
          <strong>Calgary · 2025</strong>
        </div>
      </section>

      <section className="kpi-grid">
        <Kpi
          label="External-event buildings"
          value={fmt(summary["2025_public_dataset"]["modelled_buildings"])}
          note="Residential modelling units"
        />

        <Kpi
          label="MRMS hazard cells"
          value={fmt(summary["2025_public_dataset"]["unique_mrms_cells"])}
          note="Independent radar sequences"
        />

        <Kpi
          label="Buildings in public Threshold zones"
          value={fmt(counts.Threshold)}
          note={`${pct(
            counts.Threshold /
              summary["2025_public_dataset"]["modelled_buildings"]
          )} of modelled buildings`}
        />

        <Kpi
          label="Buildings in public Minor zones"
          value={fmt(counts.Minor)}
          note={`${pct(
            counts.Minor /
              summary["2025_public_dataset"]["modelled_buildings"]
          )} of modelled buildings`}
        />
      </section>

      <section className="content-grid">
        <div className="panel map-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">EVENT FOOTPRINT</div>
              <h2>2025 damage-zone & hail exposure context</h2>
            </div>

            <div className="map-legend">
              <span>Lower Threshold fraction</span>
              <div className="gradient-bar" />
              <span>Higher</span>
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            preferCanvas={true}
            className="event-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {cells.map((cell) => {
              const frac = Number(cell.observed_threshold_fraction || 0);

              const fillColor =
                frac >= 0.75
                  ? "#ef4444"
                  : frac >= 0.5
                  ? "#f97316"
                  : frac >= 0.25
                  ? "#f59e0b"
                  : "#22c55e";

              const radius = Math.max(
                6,
                Math.min(20, Math.sqrt(Number(cell.n_buildings)) / 1.8)
              );

              return (
                <CircleMarker
                  key={cell.mrms_cell_id}
                  center={[
                    Number(cell.latitude),
                    Number(cell.longitude),
                  ]}
                  radius={radius}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 1,
                    fillColor,
                    fillOpacity: 0.78,
                  }}
                >
                  <Popup>
                    <div className="popup">
                      <strong>MRMS cell {cell.mrms_cell_id}</strong>
                      <div>{fmt(cell.n_buildings)} buildings</div>
                      <div>
                        Observed Threshold:{" "}
                        {pct(Number(cell.observed_threshold_fraction))}
                      </div>
                      <div>
                        XGBoost score:{" "}
                        {Number(cell.xgb_mean_score).toFixed(3)}
                      </div>
                      <div>
                        Transformer score:{" "}
                        {Number(cell.transformer_mean_score).toFixed(3)}
                      </div>
                      <div>
                        MESH max:{" "}
                        {Number(cell.mesh_max).toFixed(1)} mm
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="map-note">
            Circle size represents the number of modelled residential buildings
            associated with each MRMS cell. Colour represents the fraction of
            buildings located within the public Threshold damage zone.
          </div>
        </div>

        <div className="right-column">
          <div className="panel">
            <div className="eyebrow">MODEL ASSURANCE</div>
            <h2>Independent 2025 event</h2>

            <div className="model-card">
              <div>
                <strong>XGBoost</strong>
                <span>Engineered hazard features</span>
              </div>
              <Metric
                label="Balanced accuracy"
                value={xgb2025?.balanced_accuracy}
              />
              <Metric label="ROC-AUC" value={xgb2025?.roc_auc} />
            </div>

            <div className="model-card">
              <div>
                <strong>Transformer</strong>
                <span>75-step temporal hazard sequence</span>
              </div>
              <Metric
                label="Balanced accuracy"
                value={transformer2025?.balanced_accuracy}
              />
              <Metric label="ROC-AUC" value={transformer2025?.roc_auc} />
            </div>

            <p className="interpretation">
              XGBoost provides stronger external hard classification, while
              the Transformer retains stronger cross-event ranking performance.
            </p>
          </div>

          <div className="panel">
            <div className="eyebrow">HAZARD INPUT</div>
            <h2>NOAA MRMS sequence</h2>

            <div className="hazard-grid">
              {summary.hazard_data.channels.map((channel) => (
                <div className="hazard-pill" key={channel}>
                  {channel}
                </div>
              ))}
            </div>

            <div className="sequence-callout">
              <strong>{summary.hazard_data.sequence_length}</strong>
              <span>time steps per MRMS sequence</span>
            </div>
          </div>
        </div>
      </section>

      <section className="disclaimer">
        <strong>Demonstration scope</strong>
        <span>{summary.disclaimer}</span>
      </section>
    </>
  );
}

function Kpi({ label, value, note }) {
  return (
    <div className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value !== undefined ? value.toFixed(3) : "—"}</strong>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <section className="placeholder panel">
      <div className="eyebrow">NEXT MODULE</div>
      <h1>{title}</h1>
      <p>
        This module will be connected to the frozen hail-model outputs and
        clearly labelled synthetic insurance portfolio.
      </p>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState("Event Overview");
  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [cells, setCells] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/event_summary.json").then((r) => r.json()),
      fetch("/data/model_metrics.json").then((r) => r.json()),
      fetch("/data/mrms_cells_2025.json").then((r) => r.json()),
      fetch("/data/portfolio_2025.geojson").then((r) => r.json()),
    ])
      .then(([summaryData, metricsData, cellData, portfolioData]) => {
        setSummary(summaryData);
        setMetrics(metricsData);
        setCells(cellData);
        setPortfolio(portfolioData);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CI</div>
          <div>
            <strong>Cielar CAT Intelligence</strong>
            <span>Calgary Hail Demonstrator</span>
          </div>
        </div>

        <nav>
          {PAGES.map((name, index) => (
            <button
              key={name}
              className={page === name ? "active" : ""}
              onClick={() => setPage(name)}
            >
              <span>0{index + 1}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>Data classification</span>
          <strong>Public + synthetic demo</strong>
          <small>No insurer or claim data</small>
        </div>
      </aside>

      <main>
        {error && <div className="error">{error}</div>}

        {!summary && !error && (
          <div className="loading">Loading catastrophe intelligence…</div>
        )}

        {summary && page === "Event Overview" && (
          <EventOverview
            summary={summary}
            metrics={metrics}
            cells={cells}
          />
        )}

        {summary &&
          page === "Portfolio Impact" &&
          portfolio && (
            <PortfolioImpact
              portfolio={portfolio}
              cells={cells}
            />
          )}

        {summary &&
          page === "Property Intelligence" &&
          portfolio && (
            <PropertyIntelligence
              portfolio={portfolio}
            />
          )}

        {summary &&
          page === "Model Assurance" &&
          portfolio && (
            <ModelAssurance
              metrics={metrics}
              portfolio={portfolio}
              summary={summary}
            />
          )}

        {summary &&
          page === "Production Architecture" && (
            <ProductionArchitecture />
          )}

        {summary &&
          page !== "Event Overview" &&
          page !== "Portfolio Impact" &&
          page !== "Property Intelligence" &&
          page !== "Model Assurance" &&
          page !== "Production Architecture" && (
            <Placeholder title={page} />
          )}
      </main>
    </div>
  );
}
