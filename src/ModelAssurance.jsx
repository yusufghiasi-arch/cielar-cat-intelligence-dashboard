import React, { useMemo } from "react";

function pct(v, digits = 1) {
  return `${(Number(v || 0) * 100).toFixed(digits)}%`;
}

function fmt(n) {
  return new Intl.NumberFormat("en-CA").format(
    Math.round(Number(n || 0))
  );
}

function metric(metrics, model, evaluation) {
  return metrics.find(
    (d) =>
      d.model === model &&
      d.evaluation === evaluation
  );
}

function MetricBar({ label, value, tone = "dark" }) {
  const width = Math.max(
    0,
    Math.min(100, Number(value || 0) * 100)
  );

  return (
    <div className="assurance-metric-bar">
      <div className="assurance-metric-label">
        <span>{label}</span>
        <strong>{Number(value || 0).toFixed(3)}</strong>
      </div>

      <div className="bar-track">
        <div
          className={`bar-fill ${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CohortCard({
  title,
  count,
  total,
  description,
  tone,
}) {
  return (
    <div className={`cohort-card ${tone}`}>
      <span>{title}</span>
      <strong>{fmt(count)}</strong>
      <small>
        {pct(count / total)} of 2025 properties
      </small>
      <p>{description}</p>
    </div>
  );
}

function AssuranceStep({
  number,
  title,
  problem,
  response,
}) {
  return (
    <div className="assurance-step">
      <div className="assurance-step-number">
        {number}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{problem}</p>
        <small>{response}</small>
      </div>
    </div>
  );
}

export default function ModelAssurance({
  metrics,
  portfolio,
  summary,
}) {
  const xgb24 = metric(
    metrics,
    "XGBoost",
    "2024 spatial OOF"
  );

  const xgb25 = metric(
    metrics,
    "XGBoost",
    "2025 external"
  );

  const tr24 = metric(
    metrics,
    "Transformer",
    "2024 spatial OOF"
  );

  const tr25 = metric(
    metrics,
    "Transformer",
    "2025 external"
  );

  const properties = useMemo(
    () => (portfolio?.features || []).map((f) => f.properties),
    [portfolio]
  );

  const diagnostics = useMemo(() => {
    const total = properties.length;

    const bothCorrect = properties.filter(
      (d) => Boolean(d.both_correct)
    ).length;

    const xgbOnly = properties.filter(
      (d) => Boolean(d.xgb_only_correct)
    ).length;

    const transformerOnly = properties.filter(
      (d) => Boolean(d.transformer_only_correct)
    ).length;

    const bothWrong = properties.filter(
      (d) => Boolean(d.both_wrong)
    ).length;

    const disagree = properties.filter(
      (d) => !Boolean(d.models_agree)
    ).length;

    return {
      total,
      bothCorrect,
      xgbOnly,
      transformerOnly,
      bothWrong,
      disagree,
    };
  }, [properties]);

  const xgbBADrop =
    Number(xgb24?.balanced_accuracy || 0) -
    Number(xgb25?.balanced_accuracy || 0);

  const trBADrop =
    Number(tr24?.balanced_accuracy || 0) -
    Number(tr25?.balanced_accuracy || 0);

  const xgbAucDrop =
    Number(xgb24?.roc_auc || 0) -
    Number(xgb25?.roc_auc || 0);

  const trAucDrop =
    Number(tr24?.roc_auc || 0) -
    Number(tr25?.roc_auc || 0);

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            MODEL VALIDATION & ERROR ANALYSIS
          </div>

          <h1>Model Assurance</h1>

          <p className="hero-copy">
            Spatial cross-validation, independent-event
            testing, cross-event domain-shift analysis,
            and interactive error diagnostics for the
            hail-risk modelling pipeline.
          </p>

          <div className="data-badge">
            2024 development · 2025 untouched external event
          </div>
        </div>

        <div className="event-chip">
          <span>Validation design</span>
          <strong>Spatial + cross-event</strong>
        </div>
      </section>

      <section className="assurance-kpis">
        <div className="assurance-kpi">
          <span>2024 OOF buildings</span>
          <strong>{fmt(xgb24?.n_samples)}</strong>
          <small>
            Predictions from held-out MRMS cells
          </small>
        </div>

        <div className="assurance-kpi">
          <span>2025 external buildings</span>
          <strong>{fmt(xgb25?.n_samples)}</strong>
          <small>
            No model training on 2025
          </small>
        </div>

        <div className="assurance-kpi">
          <span>2025 MRMS cells</span>
          <strong>
            {summary?.["2025_public_dataset"]
              ?.unique_mrms_cells || "—"}
          </strong>
          <small>
            Independent hazard sequences
          </small>
        </div>

        <div className="assurance-kpi">
          <span>Models compared</span>
          <strong>2</strong>
          <small>
            XGBoost + temporal Transformer
          </small>
        </div>
      </section>

      <section className="assurance-model-grid">
        <div className="panel">
          <div className="eyebrow">
            XGBOOST
          </div>

          <h2>
            Engineered hazard-feature model
          </h2>

          <div className="comparison-block">
            <div className="comparison-heading">
              <strong>2024 spatial OOF</strong>
              <span>
                Within-event, spatially held out
              </span>
            </div>

            <MetricBar
              label="Balanced accuracy"
              value={xgb24?.balanced_accuracy}
            />

            <MetricBar
              label="ROC-AUC"
              value={xgb24?.roc_auc}
            />
          </div>

          <div className="comparison-block external">
            <div className="comparison-heading">
              <strong>2025 external</strong>
              <span>
                Completely unseen hail event
              </span>
            </div>

            <MetricBar
              label="Balanced accuracy"
              value={xgb25?.balanced_accuracy}
              tone="orange"
            />

            <MetricBar
              label="ROC-AUC"
              value={xgb25?.roc_auc}
              tone="orange"
            />
          </div>

          <div className="generalization-box">
            <div>
              <span>BA change</span>
              <strong>
                −{xgbBADrop.toFixed(3)}
              </strong>
            </div>

            <div>
              <span>AUC change</span>
              <strong>
                −{xgbAucDrop.toFixed(3)}
              </strong>
            </div>

            <div>
              <span>External role</span>
              <strong>
                Stronger hard classification
              </strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="eyebrow">
            TEMPORAL TRANSFORMER
          </div>

          <h2>
            Full 75-step hazard-sequence model
          </h2>

          <div className="comparison-block">
            <div className="comparison-heading">
              <strong>2024 spatial OOF</strong>
              <span>
                Unique-sequence soft-target training
              </span>
            </div>

            <MetricBar
              label="Balanced accuracy"
              value={tr24?.balanced_accuracy}
            />

            <MetricBar
              label="ROC-AUC"
              value={tr24?.roc_auc}
            />
          </div>

          <div className="comparison-block external">
            <div className="comparison-heading">
              <strong>2025 external</strong>
              <span>
                Completely unseen hail event
              </span>
            </div>

            <MetricBar
              label="Balanced accuracy"
              value={tr25?.balanced_accuracy}
              tone="blue"
            />

            <MetricBar
              label="ROC-AUC"
              value={tr25?.roc_auc}
              tone="blue"
            />
          </div>

          <div className="generalization-box">
            <div>
              <span>BA change</span>
              <strong>
                −{trBADrop.toFixed(3)}
              </strong>
            </div>

            <div>
              <span>AUC change</span>
              <strong>
                −{trAucDrop.toFixed(3)}
              </strong>
            </div>

            <div>
              <span>External role</span>
              <strong>
                Stronger ranking signal
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel assurance-interpretation">
        <div>
          <div className="eyebrow">
            EXTERNAL-EVENT INTERPRETATION
          </div>

          <h2>
            The models transfer differently
          </h2>
        </div>

        <div className="interpretation-columns">
          <div>
            <strong>XGBoost</strong>
            <p>
              Better at assigning the correct Minor /
              Threshold class on the independent 2025 event.
            </p>
          </div>

          <div>
            <strong>Transformer</strong>
            <p>
              Lower hard-classification performance, but
              higher external ROC-AUC, indicating stronger
              cross-event relative-risk ranking.
            </p>
          </div>

          <div>
            <strong>Operational meaning</strong>
            <p>
              Temporal attention retained useful ranking
              information, but event-to-event probability
              calibration remained unstable.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="eyebrow">
          FIFTYONE ERROR ANALYSIS
        </div>

        <h2>
          Independent 2025 diagnostic cohorts
        </h2>

        <div className="cohort-grid">
          <CohortCard
            title="Both correct"
            count={diagnostics.bothCorrect}
            total={diagnostics.total}
            description="Both models match the public damage-zone class."
            tone="green"
          />

          <CohortCard
            title="XGBoost only correct"
            count={diagnostics.xgbOnly}
            total={diagnostics.total}
            description="Locations where engineered hazard summaries outperform the Transformer."
            tone="orange"
          />

          <CohortCard
            title="Transformer only correct"
            count={diagnostics.transformerOnly}
            total={diagnostics.total}
            description="Locations where temporal representation adds information missed by XGBoost."
            tone="blue"
          />

          <CohortCard
            title="Both wrong"
            count={diagnostics.bothWrong}
            total={diagnostics.total}
            description="Shared failure regions requiring model or data investigation."
            tone="red"
          />
        </div>

        <div className="fiftyone-summary">
          <div>
            <span>2025 model disagreements</span>
            <strong>
              {fmt(diagnostics.disagree)}
            </strong>
          </div>

          <p>
            FiftyOne was used to inspect geolocated
            model disagreements, high-confidence errors,
            missed Threshold zones, and spatial clusters
            of external-event failure.
          </p>
        </div>
      </section>

      <section className="assurance-method-grid">
        <div className="panel">
          <div className="eyebrow">
            VALIDATION CONTROLS
          </div>

          <h2>
            What was corrected during development
          </h2>

          <AssuranceStep
            number="01"
            title="Spatial leakage"
            problem="Random building splits would place buildings sharing the same radar sequence in both train and validation."
            response="Fixed 5-fold validation grouped by exact MRMS cell."
          />

          <AssuranceStep
            number="02"
            title="Coverage shortcut"
            problem="MRMS valid-fraction features encoded event-specific missingness patterns."
            response="Removed six coverage-fraction predictors from the final XGBoost."
          />

          <AssuranceStep
            number="03"
            title="Transformer pseudo-replication"
            problem="Thousands of buildings shared only 94 unique 2024 hazard sequences."
            response="Retrained once per unique MRMS sequence using soft cell-level class proportions."
          />

          <AssuranceStep
            number="04"
            title="Temporal missingness"
            problem="Zero-filling allowed the Transformer to identify missingness patterns indirectly."
            response="Applied temporal interpolation and train-only normalization."
          />

          <AssuranceStep
            number="05"
            title="Calibration leakage"
            problem="Choosing a decision threshold using 2025 labels would invalidate external testing."
            response="Decision threshold selected only from 2024 OOF predictions."
          />
        </div>

        <div className="panel">
          <div className="eyebrow">
            DOMAIN SHIFT
          </div>

          <h2>
            What the external event revealed
          </h2>

          <div className="domain-shift-card">
            <strong>Building age</strong>
            <p>
              Strong within 2024, but highly unstable
              across events. It was treated as a
              potentially confounded vulnerability proxy,
              not causal evidence.
            </p>
          </div>

          <div className="domain-shift-card">
            <strong>MRMS coverage</strong>
            <p>
              Missing-data fractions improved apparent
              within-event performance but harmed
              cross-event transfer.
            </p>
          </div>

          <div className="domain-shift-card">
            <strong>Storm intensity</strong>
            <p>
              The 2025 event was substantially weaker and
              shorter than the 2024 development event,
              creating genuine hazard-domain shift.
            </p>
          </div>

          <div className="domain-shift-card">
            <strong>Label resolution</strong>
            <p>
              Public NHP contours represent area-level
              damage-zone severity, not individual
              property claims or inspections.
            </p>
          </div>

          <div className="production-readiness">
            <span>Production conclusion</span>

            <strong>
              Research demonstrator — not a property-level
              insurance loss model
            </strong>

            <p>
              Production deployment would require
              claim-level outcomes, policy attributes,
              additional catastrophe events, and
              insurer-specific calibration.
            </p>
          </div>
        </div>
      </section>

      <section className="disclaimer">
        <strong>Model assurance principle</strong>

        <span>
          Independent-event performance is intentionally
          shown alongside stronger within-event results.
          The demo does not hide the generalization gap
          or reinterpret public damage-zone labels as
          individual insurance claims.
        </span>
      </section>
    </>
  );
}
