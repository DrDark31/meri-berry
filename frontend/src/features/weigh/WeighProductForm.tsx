import { useState, type FormEvent } from "react";
import { ApiRequestError } from "../../api/api";
import {
  type WeighInSubmissionResult,
} from "../../types/farm";

type WeighProductFormProps = {
  onRecordWeighIn: (
    workerNumber: string,
    weightKg: number,
  ) => Promise<WeighInSubmissionResult>;
};

function mapWeighInError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 404) {
      return "Worker not found.";
    }
    if (error.status === 400) {
      return "Invalid weight.";
    }
    if (error.status === 500) {
      return "Server error / no rate configured.";
    }
    return error.message;
  }

  return "Unexpected error while saving weigh-in.";
}

export function WeighProductForm({ onRecordWeighIn }: WeighProductFormProps) {
  const [weighForm, setWeighForm] = useState({
    workerNumber: "",
    weightKg: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weighErrors, setWeighErrors] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<WeighInSubmissionResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const workerNumber = weighForm.workerNumber.trim();
    const parsedWeight = Number(weighForm.weightKg);
    const errors: string[] = [];

    if (!workerNumber) {
      errors.push("Worker number is required.");
    }

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      errors.push("Invalid weight.");
    }

    if (errors.length > 0) {
      setWeighErrors(errors);
      setLastResult(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onRecordWeighIn(workerNumber, parsedWeight);
      setLastResult(result);
      setWeighErrors([]);
    } catch (error) {
      setLastResult(null);
      setWeighErrors([mapWeighInError(error)]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setWeighForm({ workerNumber: "", weightKg: "" });
    setWeighErrors([]);
    setLastResult(null);
  };

  return (
    <section className="panel">
      <h2>Weigh Product Form</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>workerNumber</span>
          <input
            type="text"
            value={weighForm.workerNumber}
            onChange={(event) =>
              setWeighForm({
                ...weighForm,
                workerNumber: event.target.value,
              })
            }
            placeholder="e.g. 101"
            required
          />
        </label>

        <label className="field">
          <span>weightKg</span>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={weighForm.weightKg}
            onChange={(event) =>
              setWeighForm({
                ...weighForm,
                weightKg: event.target.value,
              })
            }
            placeholder="e.g. 12.5"
            required
          />
        </label>

        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearForm}
            disabled={isSubmitting}
          >
            Reset / Clear
          </button>
        </div>
      </form>

      {weighErrors.length > 0 && (
        <div className="status status-error">
          {weighErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <p className="validation-hint">
        Validation messages: worker not found, invalid weight, server error / no rate
        configured.
      </p>

      {lastResult && (
        <div className="result-stack">
          <section className="result-card">
            <h3>Weigh-In Result</h3>
            <dl className="result-grid">
              <dt>weighIn.id</dt>
              <dd>{lastResult.weighIn.id}</dd>
              <dt>weighIn.workerNumber</dt>
              <dd>{lastResult.weighIn.workerNumber}</dd>
              <dt>weighIn.weightKg</dt>
              <dd>{lastResult.weighIn.weightKg}</dd>
              <dt>weighIn.earnedCents</dt>
              <dd>{lastResult.weighIn.earnedCents}</dd>
              <dt>weighIn.currencyCode</dt>
              <dd>{lastResult.weighIn.currencyCode}</dd>
              <dt>weighIn.recordedAt</dt>
              <dd>{lastResult.weighIn.recordedAt}</dd>
            </dl>
          </section>

          <section className="result-card">
            <h3>Updated Summary</h3>
            <dl className="result-grid">
              <dt>totalWeightGrams</dt>
              <dd>{lastResult.workerSummary.totalWeightGrams}</dd>
              <dt>totalEarnedCents</dt>
              <dd>{lastResult.workerSummary.totalEarnedCents}</dd>
              <dt>totalPaidCents</dt>
              <dd>{lastResult.workerSummary.totalPaidCents}</dd>
              <dt>outstandingCents</dt>
              <dd>{lastResult.workerSummary.outstandingCents}</dd>
            </dl>
          </section>
        </div>
      )}
    </section>
  );
}
