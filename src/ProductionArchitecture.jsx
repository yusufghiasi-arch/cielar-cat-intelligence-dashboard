import React from "react";

function ArchitectureNode({
  number,
  eyebrow,
  title,
  items,
  status,
  tone = "dark",
}) {
  return (
    <div className={`architecture-node ${tone}`}>
      <div className="architecture-node-top">
        <span className="architecture-number">{number}</span>

        <span
          className={`architecture-status ${
            status === "Demonstrated" ? "ready" : "future"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="eyebrow">{eyebrow}</div>

      <h3>{title}</h3>

      <div className="architecture-items">
        {items.map((item) => (
          <div key={item} className="architecture-item">
            <span>•</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapabilityCard({
  title,
  text,
  status,
}) {
  return (
    <div className="capability-card">
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <span
        className={
          status === "Demonstrated"
            ? "capability-status demonstrated"
            : "capability-status production"
        }
      >
        {status}
      </span>
    </div>
  );
}

export default function ProductionArchitecture() {
  return (
    <>
      <section className="hero architecture-hero">
        <div>
          <div className="eyebrow">
            INSURER-ORIENTED PRODUCTION DESIGN
          </div>

          <h1>Production Architecture</h1>

          <p className="hero-copy">
            How the Calgary hail demonstrator could evolve into
            an operational catastrophe-intelligence workflow when
            combined with insurer-owned exposure, policy, claims,
            and financial data.
          </p>

          <div className="data-badge">
            Demonstrated public-data pipeline + insurer-owned production extension
          </div>
        </div>

        <div className="event-chip">
          <span>Architecture purpose</span>
          <strong>CAT intelligence workflow</strong>
        </div>
      </section>

      <section className="architecture-summary-grid">
        <div className="architecture-summary-card current">
          <span>Already demonstrated</span>
          <strong>
            Hazard intelligence + spatial ML + external validation
          </strong>
          <p>
            NOAA MRMS ingestion, residential exposure mapping,
            XGBoost, temporal Transformer, spatial cross-validation,
            2025 external testing, and FiftyOne model diagnostics.
          </p>
        </div>

        <div className="architecture-summary-card future">
          <span>Insurer data unlocks</span>
          <strong>
            Claim probability + expected loss + financial impact
          </strong>
          <p>
            Policy terms, insured values, property attributes,
            claim/no-claim outcomes, paid losses, and historical
            catastrophe experience.
          </p>
        </div>
      </section>

      <section className="panel architecture-main">
        <div className="architecture-heading">
          <div>
            <div className="eyebrow">
              END-TO-END DATA FLOW
            </div>

            <h2>
              From external hazard observations to insurer decisions
            </h2>
          </div>

          <div className="architecture-legend">
            <span>
              <i className="legend-dot demonstrated-dot" />
              Demonstrated
            </span>

            <span>
              <i className="legend-dot production-dot" />
              Requires insurer data
            </span>
          </div>
        </div>

        <div className="architecture-flow">
          <ArchitectureNode
            number="01"
            eyebrow="EXTERNAL DATA"
            title="Hazard Intelligence"
            status="Demonstrated"
            tone="blue"
            items={[
              "Radar / MRMS hail observations",
              "Satellite Earth observation",
              "Weather and forecast data",
              "Historical hazard footprints",
              "Topography and environmental context",
            ]}
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="02"
            eyebrow="EXPOSURE DATA"
            title="Property & Policy Inventory"
            status="Requires insurer data"
            tone="purple"
            items={[
              "Policy coordinates",
              "Replacement value",
              "Coverage limits",
              "Deductibles",
              "Roof / construction attributes",
            ]}
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="03"
            eyebrow="MODELLING"
            title="Hazard + Vulnerability"
            status="Partially demonstrated"
            tone="orange"
            items={[
              "Hazard severity features",
              "Temporal hazard signatures",
              "Property vulnerability",
              "Claim probability",
              "Damage severity",
            ]}
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="04"
            eyebrow="FINANCIAL"
            title="Loss & Portfolio Impact"
            status="Requires insurer data"
            tone="red"
            items={[
              "Expected loss",
              "Policy-level impact",
              "Portfolio accumulation",
              "AAL / scenario loss",
              "Reinsurance analytics",
            ]}
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="05"
            eyebrow="DECISION SUPPORT"
            title="Operational Intelligence"
            status="Production extension"
            tone="green"
            items={[
              "Claims triage",
              "Inspection prioritization",
              "Underwriting support",
              "Portfolio monitoring",
              "Post-event response",
            ]}
          />
        </div>
      </section>

      <section className="architecture-two-column">
        <div className="panel">
          <div className="eyebrow">
            WHAT THIS DEMO ALREADY PROVES
          </div>

          <h2>
            Outsourcable geospatial / ML capability
          </h2>

          <div className="capability-list">
            <CapabilityCard
              title="Hazard-data engineering"
              text="Ingest, clean, synchronize, spatially join, and transform radar / EO / weather data into modelling-ready hazard intelligence."
              status="Demonstrated"
            />

            <CapabilityCard
              title="Property-level geospatial integration"
              text="Link residential buildings with hazard observations, building attributes, damage-zone references, and model outputs."
              status="Demonstrated"
            />

            <CapabilityCard
              title="Machine-learning development"
              text="Build and compare tabular XGBoost and temporal Transformer models using spatially valid evaluation."
              status="Demonstrated"
            />

            <CapabilityCard
              title="Independent-event validation"
              text="Test models on an untouched catastrophe event and quantify cross-event domain shift rather than relying only on within-event scores."
              status="Demonstrated"
            />

            <CapabilityCard
              title="Model QA and error analysis"
              text="Use FiftyOne and spatial diagnostics to investigate disagreements, high-confidence errors, and failure clusters."
              status="Demonstrated"
            />

            <CapabilityCard
              title="Decision-support delivery"
              text="Translate modelling outputs into maps, portfolio views, property drill-downs, and operational dashboards."
              status="Demonstrated"
            />
          </div>
        </div>

        <div className="panel">
          <div className="eyebrow">
            INSURER-OWNED DATA REQUIRED
          </div>

          <h2>
            What converts the prototype into production intelligence
          </h2>

          <div className="insurer-data-stack">
            <div className="insurer-data-row">
              <span>01</span>
              <div>
                <strong>Policy & exposure inventory</strong>
                <p>
                  Property coordinates, insured value, coverage limits,
                  deductibles, occupancy, construction, and roof attributes.
                </p>
              </div>
            </div>

            <div className="insurer-data-row">
              <span>02</span>
              <div>
                <strong>Historical claims</strong>
                <p>
                  Claim/no-claim outcomes, paid and incurred losses,
                  damage type, event linkage, and claim timing.
                </p>
              </div>
            </div>

            <div className="insurer-data-row">
              <span>03</span>
              <div>
                <strong>Catastrophe-event history</strong>
                <p>
                  Multiple hail, wildfire, flood, or wind events are
                  needed to learn robust cross-event relationships.
                </p>
              </div>
            </div>

            <div className="insurer-data-row">
              <span>04</span>
              <div>
                <strong>Financial terms</strong>
                <p>
                  Policy limits, deductibles, replacement values,
                  coverage structures, and reinsurance assumptions.
                </p>
              </div>
            </div>
          </div>

          <div className="production-output-box">
            <div className="eyebrow">
              THEN THE MODEL CAN TARGET
            </div>

            <div className="production-output-grid">
              <div>
                <strong>P(Claim)</strong>
                <span>
                  Probability a property generates a catastrophe claim
                </span>
              </div>

              <div>
                <strong>Expected Loss</strong>
                <span>
                  Financial severity conditional on hazard and vulnerability
                </span>
              </div>

              <div>
                <strong>Priority Score</strong>
                <span>
                  Inspection or claims-response prioritization
                </span>
              </div>

              <div>
                <strong>Portfolio Risk</strong>
                <span>
                  Aggregated exposure and event-level loss intelligence
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel delivery-architecture">
        <div>
          <div className="eyebrow">
            DEPLOYMENT LAYER
          </div>

          <h2>
            How the capability could be delivered
          </h2>
        </div>

        <div className="delivery-grid">
          <div className="delivery-card">
            <span>01</span>
            <strong>Automated data pipelines</strong>
            <p>
              Scheduled ingestion of radar, EO, weather,
              policy, and claims data.
            </p>
          </div>

          <div className="delivery-card">
            <span>02</span>
            <strong>Model inference service</strong>
            <p>
              Reproducible feature generation and catastrophe-event
              inference through batch jobs or APIs.
            </p>
          </div>

          <div className="delivery-card">
            <span>03</span>
            <strong>Geospatial decision API</strong>
            <p>
              Property-, grid-, and portfolio-level outputs available
              to downstream insurance applications.
            </p>
          </div>

          <div className="delivery-card">
            <span>04</span>
            <strong>Interactive dashboard</strong>
            <p>
              Event overview, portfolio exposure, property intelligence,
              model assurance, and operational prioritization.
            </p>
          </div>

          <div className="delivery-card">
            <span>05</span>
            <strong>Model monitoring</strong>
            <p>
              Performance, drift, spatial error analysis,
              confidence diagnostics, and retraining triggers.
            </p>
          </div>
        </div>
      </section>

      <section className="panel outsourcing-proposition">
        <div>
          <div className="eyebrow">
            POTENTIAL OUTSOURCING MODEL
          </div>

          <h2>
            External geospatial intelligence capability,
            integrated with insurer-owned systems
          </h2>

          <p>
            The insurer retains control of policy, claims, customer,
            financial, and actuarial data. An external geospatial /
            Earth-intelligence team can build and maintain the hazard,
            EO, geospatial feature-engineering, ML, validation,
            visualization, and decision-support layers.
          </p>
        </div>

        <div className="outsourcing-boundary">
          <div className="boundary-column external">
            <span>External geospatial / ML team</span>

            <strong>
              Hazard + EO + geospatial intelligence
            </strong>

            <ul>
              <li>EO / radar / weather pipelines</li>
              <li>Hazard feature engineering</li>
              <li>Geospatial joins and exposure analytics</li>
              <li>ML / temporal modelling</li>
              <li>Model QA and external validation</li>
              <li>Dashboards / APIs</li>
            </ul>
          </div>

          <div className="boundary-link">
            <span>Secure interface</span>
            <strong>↔</strong>
          </div>

          <div className="boundary-column insurer">
            <span>Insurer</span>

            <strong>
              Proprietary insurance intelligence
            </strong>

            <ul>
              <li>Policy and customer data</li>
              <li>Claims and loss outcomes</li>
              <li>Pricing and underwriting rules</li>
              <li>Actuarial assumptions</li>
              <li>Reinsurance structure</li>
              <li>Production decisions</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="architecture-final-message">
        <div>
          <div className="eyebrow">
            DEMONSTRATED VALUE
          </div>

          <h2>
            The current project is not the production model.
            It demonstrates the capability to build one.
          </h2>

          <p>
            With insurer-owned claims and policy data, this same
            technical pipeline can move from public damage-zone
            classification toward property-level claim probability,
            loss estimation, and catastrophe-response intelligence.
          </p>
        </div>
      </section>

      <section className="disclaimer">
        <strong>Architecture scope</strong>

        <span>
          This architecture is an illustrative production pathway.
          No Aviva proprietary data, claim records, financial models,
          or internal systems were used in this demonstrator.
        </span>
      </section>
    </>
  );
}
