import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

function fmt(n) {
  return new Intl.NumberFormat("en-CA").format(Math.round(n || 0));
}

function cad(n) {
  const value = Number(n || 0);

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function pct(v) {
  return `${(Number(v || 0) * 100).toFixed(1)}%`;
}

const FILTERS = [
  "All portfolio",
  "Public Threshold zone",
  "XGBoost Threshold",
  "Transformer Threshold",
];

export default function PortfolioImpact({
  portfolio,
  cells,
}) {
  const [filter, setFilter] = useState("All portfolio");

  const properties = useMemo(
    () => (portfolio?.features || []).map((f) => f.properties),
    [portfolio]
  );

  const filtered = useMemo(() => {
    if (filter === "Public Threshold zone") {
      return properties.filter(
        (d) => d.observed_public_zone === "Threshold"
      );
    }

    if (filter === "XGBoost Threshold") {
      return properties.filter(
        (d) => d.xgb_model_class === "Threshold"
      );
    }

    if (filter === "Transformer Threshold") {
      return properties.filter(
        (d) => d.transformer_model_class === "Threshold"
      );
    }

    return properties;
  }, [properties, filter]);

  const totalReplacement = useMemo(
    () =>
      properties.reduce(
        (sum, d) => sum + Number(d.replacement_value_cad || 0),
        0
      ),
    [properties]
  );

  const thresholdReplacement = useMemo(
    () =>
      properties
        .filter((d) => d.observed_public_zone === "Threshold")
        .reduce(
          (sum, d) => sum + Number(d.replacement_value_cad || 0),
          0
        ),
    [properties]
  );

  const xgbThresholdCount = useMemo(
    () =>
      properties.filter(
        (d) => d.xgb_model_class === "Threshold"
      ).length,
    [properties]
  );

  const transformerThresholdCount = useMemo(
    () =>
      properties.filter(
        (d) => d.transformer_model_class === "Threshold"
      ).length,
    [properties]
  );

  const cellLookup = useMemo(() => {
    const lookup = new Map();

    cells.forEach((cell) => {
      lookup.set(String(cell.mrms_cell_id), cell);
    });

    return lookup;
  }, [cells]);

  const aggregated = useMemo(() => {
    const groups = new Map();

    filtered.forEach((d) => {
      const key = String(d.mrms_cell_id);

      if (!groups.has(key)) {
        groups.set(key, {
          mrms_cell_id: key,
          n_policies: 0,
          replacement_value: 0,
          threshold_count: 0,
          xgb_threshold_count: 0,
          transformer_threshold_count: 0,
          latitude: 0,
          longitude: 0,
        });
      }

      const g = groups.get(key);

      g.n_policies += 1;
      g.replacement_value += Number(
        d.replacement_value_cad || 0
      );

      if (d.observed_public_zone === "Threshold") {
        g.threshold_count += 1;
      }

      if (d.xgb_model_class === "Threshold") {
        g.xgb_threshold_count += 1;
      }

      if (d.transformer_model_class === "Threshold") {
        g.transformer_threshold_count += 1;
      }

      g.latitude += Number(d.latitude);
      g.longitude += Number(d.longitude);
    });

    const result = Array.from(groups.values()).map((g) => {
      const source = cellLookup.get(g.mrms_cell_id);

      return {
        ...g,
        latitude: g.latitude / g.n_policies,
        longitude: g.longitude / g.n_policies,
        public_threshold_fraction:
          source?.observed_threshold_fraction ??
          g.threshold_count / g.n_policies,
      };
    });

    return result.sort(
      (a, b) => b.replacement_value - a.replacement_value
    );
  }, [filtered, cellLookup]);

  const maxReplacement = useMemo(
    () =>
      Math.max(
        1,
        ...aggregated.map((d) => d.replacement_value)
      ),
    [aggregated]
  );

  const mapCenter = useMemo(() => {
    if (!cells.length) return [51.09, -114.07];

    return [
      cells.reduce(
        (sum, d) => sum + Number(d.latitude),
        0
      ) / cells.length,
      cells.reduce(
        (sum, d) => sum + Number(d.longitude),
        0
      ) / cells.length,
    ];
  }, [cells]);

  const selectedReplacement = filtered.reduce(
    (sum, d) => sum + Number(d.replacement_value_cad || 0),
    0
  );

  return (
    <>
      <section className="hero portfolio-hero">
        <div>
          <div className="eyebrow">
            SYNTHETIC INSURANCE PORTFOLIO
          </div>

          <h1>Portfolio Impact</h1>

          <p className="hero-copy">
            Demonstration of how insurer-owned exposure data could be
            combined with public hail observations and geospatial model
            outputs to support catastrophe-response and portfolio
            concentration analysis.
          </p>

          <div className="data-badge">
            Synthetic policy attributes · No Aviva or claims data
          </div>
        </div>

        <div className="event-chip">
          <span>Portfolio geography</span>
          <strong>Calgary · 2025</strong>
        </div>
      </section>

      <section className="kpi-grid">
        <Kpi
          label="Synthetic policies"
          value={fmt(properties.length)}
          note="One demonstration policy per modelled building"
        />

        <Kpi
          label="Synthetic replacement value"
          value={cad(totalReplacement)}
          note="Illustrative exposure only"
        />

        <Kpi
          label="Value in public Threshold zones"
          value={cad(thresholdReplacement)}
          note={`${pct(
            thresholdReplacement / totalReplacement
          )} of synthetic portfolio value`}
        />

        <Kpi
          label="XGBoost Threshold-zone flags"
          value={fmt(xgbThresholdCount)}
          note={`Transformer flags ${fmt(
            transformerThresholdCount
          )}`}
        />
      </section>

      <section className="portfolio-toolbar panel">
        <div>
          <div className="eyebrow">
            EXPOSURE SELECTION
          </div>

          <strong>{filter}</strong>

          <span>
            {fmt(filtered.length)} policies ·{" "}
            {cad(selectedReplacement)}
          </span>
        </div>

        <div className="filter-group">
          {FILTERS.map((name) => (
            <button
              key={name}
              className={filter === name ? "active" : ""}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className="portfolio-layout">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                PORTFOLIO CONCENTRATION
              </div>

              <h2>
                Synthetic exposure by MRMS hazard cell
              </h2>
            </div>

            <div className="map-legend">
              <span>Lower public Threshold fraction</span>
              <div className="gradient-bar" />
              <span>Higher</span>
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            preferCanvas={true}
            className="portfolio-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {aggregated.map((cell) => {
              const frac =
                Number(cell.public_threshold_fraction) || 0;

              const fillColor =
                frac >= 0.75
                  ? "#ef4444"
                  : frac >= 0.5
                  ? "#f97316"
                  : frac >= 0.25
                  ? "#f59e0b"
                  : "#22c55e";

              const relative =
                cell.replacement_value / maxReplacement;

              const radius =
                7 + Math.sqrt(relative) * 18;

              return (
                <CircleMarker
                  key={cell.mrms_cell_id}
                  center={[
                    cell.latitude,
                    cell.longitude,
                  ]}
                  radius={radius}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 1.2,
                    fillColor,
                    fillOpacity: 0.78,
                  }}
                >
                  <Popup>
                    <div className="popup">
                      <strong>
                        MRMS cell {cell.mrms_cell_id}
                      </strong>

                      <div>
                        Policies: {fmt(cell.n_policies)}
                      </div>

                      <div>
                        Synthetic exposure:{" "}
                        {cad(cell.replacement_value)}
                      </div>

                      <div>
                        Public Threshold fraction:{" "}
                        {pct(
                          cell.public_threshold_fraction
                        )}
                      </div>

                      <div>
                        XGBoost Threshold flags:{" "}
                        {fmt(cell.xgb_threshold_count)}
                      </div>

                      <div>
                        Transformer Threshold flags:{" "}
                        {fmt(
                          cell.transformer_threshold_count
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <div className="map-note">
            Bubble size represents synthetic replacement-value
            concentration. Colour represents the observed public
            Threshold-zone fraction for the associated MRMS cell.
          </div>
        </div>

        <div className="panel concentration-panel">
          <div className="eyebrow">
            CONCENTRATION WATCHLIST
          </div>

          <h2>Highest synthetic exposure cells</h2>

          <div className="concentration-table">
            <div className="table-row table-head">
              <span>Cell</span>
              <span>Policies</span>
              <span>Exposure</span>
              <span>Threshold</span>
            </div>

            {aggregated.slice(0, 8).map((cell) => (
              <div
                className="table-row"
                key={cell.mrms_cell_id}
              >
                <strong>{cell.mrms_cell_id}</strong>

                <span>
                  {fmt(cell.n_policies)}
                </span>

                <span>
                  {cad(cell.replacement_value)}
                </span>

                <span>
                  {pct(
                    cell.public_threshold_fraction
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="workflow-callout">
            <div className="eyebrow">
              PRODUCTION EXTENSION
            </div>

            <strong>
              What an insurer would add
            </strong>

            <p>
              Policy limits, deductibles, replacement cost,
              claim/no-claim outcomes, paid and incurred losses,
              roof attributes, and historical catastrophe claims.
            </p>
          </div>
        </div>
      </section>

      <section className="disclaimer sticky-disclaimer">
        <strong>Demonstration scope</strong>

        <span>
          Insurance policy attributes and replacement values on
          this page are synthetic and exist only to demonstrate an
          insurer workflow. They are not Aviva data, claim records,
          expected losses, or modelled claim probabilities.
        </span>
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
