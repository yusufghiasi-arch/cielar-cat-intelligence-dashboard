import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

function fmt(n) {
  return new Intl.NumberFormat("en-CA").format(
    Math.round(Number(n || 0))
  );
}

function cad(n) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function score(v) {
  return Number(v || 0).toFixed(3);
}

function value(v, digits = 1) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) {
    return "—";
  }
  return Number(v).toFixed(digits);
}

function StatusBadge({ children, tone = "neutral" }) {
  return (
    <span className={`status-badge ${tone}`}>
      {children}
    </span>
  );
}

function HazardMetric({ label, value, unit }) {
  return (
    <div className="hazard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {unit && <small>{unit}</small>}
    </div>
  );
}

export default function PropertyIntelligence({ portfolio }) {
  const properties = useMemo(
    () => (portfolio?.features || []).map((f) => f.properties),
    [portfolio]
  );

  const defaultIndex = useMemo(() => {
    if (!properties.length) return 0;

    let best = 0;
    let bestValue = -Infinity;

    properties.forEach((d, i) => {
      const disagreement = Number(d.probability_disagreement || 0);

      if (disagreement > bestValue) {
        bestValue = disagreement;
        best = i;
      }
    });

    return best;
  }, [properties]);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [searchText, setSearchText] = useState("");

  const selected =
    properties[
      Math.min(selectedIndex, Math.max(0, properties.length - 1))
    ];

  const searchResults = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return [];

    return properties
      .map((d, index) => ({ ...d, __index: index }))
      .filter(
        (d) =>
          String(d.building_id || "")
            .toLowerCase()
            .includes(q) ||
          String(d.policy_id || "")
            .toLowerCase()
            .includes(q)
      )
      .slice(0, 8);
  }, [properties, searchText]);

  if (!selected) {
    return <div className="panel">No property data available.</div>;
  }

  const modelsAgree = Boolean(selected.models_agree);

  const xgbCorrect = Boolean(selected.xgb_correct);
  const transformerCorrect = Boolean(selected.transformer_correct);

  const observedTone =
    selected.observed_public_zone === "Threshold"
      ? "danger"
      : "success";

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            PROPERTY-LEVEL DECISION SUPPORT
          </div>

          <h1>Property Intelligence</h1>

          <p className="hero-copy">
            Drill into an individual residential building to connect
            public hail exposure, building attributes, model outputs,
            and synthetic insurance context.
          </p>

          <div className="data-badge">
            Public hazard/building data · Synthetic policy attributes
          </div>
        </div>

        <div className="event-chip">
          <span>Selected synthetic policy</span>
          <strong>{selected.policy_id}</strong>
        </div>
      </section>

      <section className="property-search panel">
        <div>
          <div className="eyebrow">
            PROPERTY LOOKUP
          </div>

          <strong>
            Search demonstration portfolio
          </strong>

          <span>
            Building ID or synthetic policy ID
          </span>
        </div>

        <div className="property-search-box">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search building or policy ID…"
          />

          {searchResults.length > 0 && (
            <div className="property-search-results">
              {searchResults.map((d) => (
                <button
                  key={d.building_id}
                  onClick={() => {
                    setSelectedIndex(d.__index);
                    setSearchText("");
                  }}
                >
                  <strong>{d.policy_id}</strong>
                  <span>
                    Building {d.building_id} ·{" "}
                    {d.observed_public_zone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="property-nav-buttons">
          <button
            onClick={() =>
              setSelectedIndex((i) =>
                i <= 0 ? properties.length - 1 : i - 1
              )
            }
          >
            ← Previous
          </button>

          <button
            onClick={() =>
              setSelectedIndex((i) =>
                i >= properties.length - 1 ? 0 : i + 1
              )
            }
          >
            Next →
          </button>
        </div>
      </section>

      <section className="property-main-grid">
        <div className="panel property-map-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">
                PROPERTY LOCATION
              </div>

              <h2>
                Building {selected.building_id}
              </h2>
            </div>

            <StatusBadge tone={observedTone}>
              Public zone: {selected.observed_public_zone}
            </StatusBadge>
          </div>

          <MapContainer
            key={selected.building_id}
            center={[
              Number(selected.latitude),
              Number(selected.longitude),
            ]}
            zoom={16}
            scrollWheelZoom={true}
            className="property-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <CircleMarker
              center={[
                Number(selected.latitude),
                Number(selected.longitude),
              ]}
              radius={11}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor:
                  selected.observed_public_zone === "Threshold"
                    ? "#ef4444"
                    : "#22c55e",
                fillOpacity: 0.92,
              }}
            >
              <Popup>
                <strong>{selected.policy_id}</strong>
                <div>Building {selected.building_id}</div>
                <div>
                  Public zone: {selected.observed_public_zone}
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>

          <div className="property-map-footer">
            <div>
              <span>Longitude</span>
              <strong>{value(selected.longitude, 5)}</strong>
            </div>

            <div>
              <span>Latitude</span>
              <strong>{value(selected.latitude, 5)}</strong>
            </div>

            <div>
              <span>MRMS cell</span>
              <strong>{selected.mrms_cell_id}</strong>
            </div>
          </div>
        </div>

        <div className="property-side-column">
          <div className="panel">
            <div className="eyebrow">
              SYNTHETIC POLICY CONTEXT
            </div>

            <h2>Exposure profile</h2>

            <div className="detail-grid">
              <Detail
                label="Synthetic replacement value"
                value={cad(selected.replacement_value_cad)}
              />

              <Detail
                label="Coverage limit"
                value={cad(selected.coverage_limit_cad)}
              />

              <Detail
                label="Deductible"
                value={cad(selected.deductible_cad)}
              />

              <Detail
                label="Occupancy"
                value={selected.occupancy}
              />

              <Detail
                label="Construction"
                value={selected.construction_type}
              />

              <Detail
                label="Roof material"
                value={selected.roof_material}
              />
            </div>

            <div className="synthetic-warning">
              Synthetic demonstration fields — not insurer records.
            </div>
          </div>

          <div className="panel">
            <div className="eyebrow">
              BUILDING ATTRIBUTES
            </div>

            <h2>Physical exposure</h2>

            <div className="detail-grid">
              <Detail
                label="Building age"
                value={
                  selected.building_age !== null
                    ? `${fmt(selected.building_age)} years`
                    : "—"
                }
              />

              <Detail
                label="Roof area"
                value={`${value(
                  selected.roof_area_m2_calc,
                  0
                )} m²`}
              />

              <Detail
                label="Land size"
                value={`${value(
                  selected.land_size_sm,
                  0
                )} m²`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="property-secondary-grid">
        <div className="panel">
          <div className="eyebrow">
            RADAR-DERIVED HAZARD
          </div>

          <h2>2025 hail exposure summary</h2>

          <div className="hazard-metric-grid">
            <HazardMetric
              label="MESH max"
              value={value(selected.mesh_max)}
              unit="mm"
            />

            <HazardMetric
              label="POSH max"
              value={value(selected.posh_max)}
              unit="%"
            />

            <HazardMetric
              label="SHI max"
              value={value(selected.shi_max)}
              unit="index"
            />

            <HazardMetric
              label="VIL max"
              value={value(selected.vil_max)}
              unit="kg/m²"
            />

            <HazardMetric
              label="Composite reflectivity"
              value={value(selected.cref_max)}
              unit="dBZ"
            />

            <HazardMetric
              label="Precipitation rate max"
              value={value(selected.precip_rate_max)}
              unit="mm/h"
            />

            <HazardMetric
              label="MESH ≥ 10 mm"
              value={fmt(selected.mesh_minutes_ge_10)}
              unit="minutes"
            />

            <HazardMetric
              label="MESH ≥ 20 mm"
              value={fmt(selected.mesh_minutes_ge_20)}
              unit="minutes"
            />

            <HazardMetric
              label="Approx. event precipitation"
              value={value(
                selected.precip_approx_event_total_mm
              )}
              unit="mm"
            />
          </div>
        </div>

        <div className="panel">
          <div className="eyebrow">
            MODEL COMPARISON
          </div>

          <h2>Independent-event inference</h2>

          <div className="property-model-row">
            <div>
              <strong>XGBoost</strong>
              <span>Engineered hazard features</span>
            </div>

            <div>
              <span>Threshold score</span>
              <strong>{score(selected.xgb_model_score)}</strong>
            </div>

            <StatusBadge
              tone={
                selected.xgb_model_class === "Threshold"
                  ? "danger"
                  : "success"
              }
            >
              {selected.xgb_model_class}
            </StatusBadge>

            <StatusBadge
              tone={xgbCorrect ? "success" : "warning"}
            >
              {xgbCorrect ? "Matches public zone" : "Mismatch"}
            </StatusBadge>
          </div>

          <div className="property-model-row">
            <div>
              <strong>Transformer</strong>
              <span>75-step temporal sequence</span>
            </div>

            <div>
              <span>Threshold score</span>
              <strong>
                {score(selected.transformer_model_score)}
              </strong>
            </div>

            <StatusBadge
              tone={
                selected.transformer_model_class === "Threshold"
                  ? "danger"
                  : "success"
              }
            >
              {selected.transformer_model_class}
            </StatusBadge>

            <StatusBadge
              tone={transformerCorrect ? "success" : "warning"}
            >
              {transformerCorrect
                ? "Matches public zone"
                : "Mismatch"}
            </StatusBadge>
          </div>

          <div className="model-diagnostic-box">
            <div>
              <span>Models agree</span>
              <strong>{modelsAgree ? "Yes" : "No"}</strong>
            </div>

            <div>
              <span>Probability disagreement</span>
              <strong>
                {score(selected.probability_disagreement)}
              </strong>
            </div>

            <div>
              <span>Observed reference</span>
              <strong>
                {selected.observed_public_zone}
              </strong>
            </div>
          </div>

          <p className="interpretation">
            Scores represent probability of the public NHP
            Threshold damage-zone class. They are not probabilities
            of an insurance claim or property-level physical damage.
          </p>
        </div>
      </section>

      <section className="decision-flow panel">
        <div>
          <div className="eyebrow">
            INSURER WORKFLOW
          </div>

          <h2>
            From property exposure to operational decision support
          </h2>
        </div>

        <div className="flow-items">
          <FlowStep
            number="01"
            title="Property"
            text="Location, construction, roof and insured exposure"
          />

          <div className="flow-arrow">→</div>

          <FlowStep
            number="02"
            title="Hazard"
            text="Radar, weather and Earth-observation measurements"
          />

          <div className="flow-arrow">→</div>

          <FlowStep
            number="03"
            title="Model"
            text="Damage-risk ranking and spatial prioritization"
          />

          <div className="flow-arrow">→</div>

          <FlowStep
            number="04"
            title="Insurer data"
            text="Claims and policy terms calibrate true financial impact"
          />
        </div>
      </section>

      <section className="disclaimer">
        <strong>Demonstration scope</strong>

        <span>
          The selected building is a real public-data modelling unit,
          but insurance attributes are synthetic. The observed class
          refers to a public damage zone at the building location,
          not an individual building inspection or insurance claim.
        </span>
      </section>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FlowStep({ number, title, text }) {
  return (
    <div className="flow-step">
      <span>{number}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </div>
  );
}
