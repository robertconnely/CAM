"use client";

import { useReducer, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import type {
  Initiative,
  PdlcPhase,
  InitiativeType,
  RevenueModel,
  InvestmentCase,
} from "@/lib/types/database";
import type { DimensionKey } from "@/lib/scoring/capital-scoring";
import {
  DIMENSIONS,
  checkIrrPass,
  checkCmPass,
  calculateWeightedScore,
  determineRecommendation,
  IRR_THRESHOLDS,
  CM_THRESHOLDS,
} from "@/lib/scoring/capital-scoring";

import { WizardProgress } from "./WizardProgress";
import { StepWelcome } from "./steps/StepWelcome";
import { StepDetails } from "./steps/StepDetails";
import { StepIrrGate } from "./steps/StepIrrGate";
import { StepCmGate } from "./steps/StepCmGate";
import { StepGateResult } from "./steps/StepGateResult";
import { StepScoreDimension } from "./steps/StepScoreDimension";
import { StepResults } from "./steps/StepResults";

// =============================================
// State & Reducer
// =============================================

interface WizardState {
  step: number;
  selectedInitiativeId: string | null;
  initiativeType: InitiativeType | null;
  revenueModel: RevenueModel | null;
  investmentAmount: string;
  timelineMonths: string;
  irrValue: string;
  cmValue: string;
  scores: Partial<Record<DimensionKey, number>>;
  notes: Partial<Record<DimensionKey, string>>;
  saving: boolean;
  hydrated: boolean;
}

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SELECT_INITIATIVE"; id: string }
  | { type: "SET_INITIATIVE_TYPE"; value: InitiativeType }
  | { type: "SET_REVENUE_MODEL"; value: RevenueModel }
  | { type: "SET_INVESTMENT"; value: string }
  | { type: "SET_TIMELINE"; value: string }
  | { type: "SET_IRR"; value: string }
  | { type: "SET_CM"; value: string }
  | { type: "SET_SCORE"; dimension: DimensionKey; value: number }
  | { type: "SET_NOTES"; dimension: DimensionKey; value: string }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "RESET" }
  | {
      type: "HYDRATE_FROM_CASE";
      initiativeId: string;
      initiativeType: InitiativeType;
      revenueModel: RevenueModel;
      investmentAmount: string;
      timelineMonths: string;
      irrValue: string;
      cmValue: string;
    };

function initState(preselectedId: string | null): WizardState {
  return {
    step: preselectedId ? 1 : 0,
    selectedInitiativeId: preselectedId,
    initiativeType: null,
    revenueModel: null,
    investmentAmount: "",
    timelineMonths: "",
    irrValue: "",
    cmValue: "",
    scores: {},
    notes: {},
    saving: false,
    hydrated: false,
  };
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SELECT_INITIATIVE":
      return { ...state, selectedInitiativeId: action.id };
    case "SET_INITIATIVE_TYPE":
      return { ...state, initiativeType: action.value };
    case "SET_REVENUE_MODEL":
      return { ...state, revenueModel: action.value };
    case "SET_INVESTMENT":
      return { ...state, investmentAmount: action.value };
    case "SET_TIMELINE":
      return { ...state, timelineMonths: action.value };
    case "SET_IRR":
      return { ...state, irrValue: action.value };
    case "SET_CM":
      return { ...state, cmValue: action.value };
    case "SET_SCORE":
      return { ...state, scores: { ...state.scores, [action.dimension]: action.value } };
    case "SET_NOTES":
      return { ...state, notes: { ...state.notes, [action.dimension]: action.value } };
    case "SET_SAVING":
      return { ...state, saving: action.value };
    case "RESET":
      return initState(null);
    case "HYDRATE_FROM_CASE":
      return {
        ...state,
        step: 2,
        hydrated: true,
        selectedInitiativeId: action.initiativeId,
        initiativeType: action.initiativeType,
        revenueModel: action.revenueModel,
        investmentAmount: action.investmentAmount,
        timelineMonths: action.timelineMonths,
        irrValue: action.irrValue,
        cmValue: action.cmValue,
      };
    default:
      return state;
  }
}

const TOTAL_STEPS = 11;
const DIMENSION_STEP_KEYS: DimensionKey[] = [
  "financial_return",
  "strategic_alignment",
  "competitive_impact",
  "client_demand",
  "execution_feasibility",
];

// =============================================
// Component
// =============================================

interface CapitalWizardProps {
  initiatives: Initiative[];
  phases: PdlcPhase[];
  preselectedInitiativeId?: string | null;
  onComplete?: (recommendation: string) => void;
  camStyle?: boolean;
  investmentCase?: InvestmentCase | null;
}

export function CapitalWizard({
  initiatives,
  phases,
  preselectedInitiativeId,
  onComplete,
  camStyle,
  investmentCase,
}: CapitalWizardProps) {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [state, dispatch] = useReducer(reducer, preselectedInitiativeId ?? null, initState);

  // Track computed values for "reset" feature in pre-populated gate steps
  const computedIrr = useRef<string>("");
  const computedCm = useRef<string>("");

  // Hydrate from investment case (pre-populate classification + gates)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (
      hydratedRef.current ||
      !investmentCase ||
      !preselectedInitiativeId ||
      !investmentCase.initiative_type ||
      !investmentCase.revenue_model
    ) return;

    hydratedRef.current = true;

    const irr = investmentCase.financials?.irr;
    const cm = investmentCase.financials?.contribution_margin;
    const irrStr = irr != null ? (irr * 100).toFixed(1) : "";
    const cmStr = cm != null ? cm.toFixed(1) : "";

    computedIrr.current = irrStr;
    computedCm.current = cmStr;

    dispatch({
      type: "HYDRATE_FROM_CASE",
      initiativeId: preselectedInitiativeId,
      initiativeType: investmentCase.initiative_type,
      revenueModel: investmentCase.revenue_model,
      investmentAmount: investmentCase.investment_amount?.toString() ?? "",
      timelineMonths: investmentCase.timeline_months?.toString() ?? "",
      irrValue: irrStr,
      cmValue: cmStr,
    });
  }, [investmentCase, preselectedInitiativeId]);

  const selectedInitiative = useMemo(
    () => initiatives.find((i) => i.id === state.selectedInitiativeId) ?? null,
    [initiatives, state.selectedInitiativeId]
  );

  // Computed gate results
  const irrResult = useMemo(() => {
    if (!state.initiativeType || state.irrValue === "") return null;
    return checkIrrPass(parseFloat(state.irrValue) || 0, state.initiativeType);
  }, [state.irrValue, state.initiativeType]);

  const cmResult = useMemo(() => {
    if (!state.revenueModel || state.cmValue === "") return null;
    return checkCmPass(parseFloat(state.cmValue) || 0, state.revenueModel);
  }, [state.cmValue, state.revenueModel]);

  const financialGatePass = (irrResult?.pass ?? false) && (cmResult?.pass ?? false);

  const weightedScore = useMemo(
    () => calculateWeightedScore(state.scores),
    [state.scores]
  );

  const finalResult = useMemo(
    () => determineRecommendation(weightedScore, financialGatePass),
    [weightedScore, financialGatePass]
  );

  // Step validation
  const canProceed = useCallback((): boolean => {
    switch (state.step) {
      case 0:
        return state.selectedInitiativeId !== null;
      case 1:
        return state.initiativeType !== null && state.revenueModel !== null;
      case 2:
        return state.irrValue !== "" || IRR_THRESHOLDS[state.initiativeType!]?.min === null;
      case 3:
        return state.cmValue !== "";
      case 4:
        return true; // Gate result is informational
      case 5:
      case 6:
      case 7:
      case 8:
      case 9: {
        const dimKey = DIMENSION_STEP_KEYS[state.step - 5];
        return state.scores[dimKey] != null;
      }
      case 10:
        return true;
      default:
        return false;
    }
  }, [state]);

  const goNext = useCallback(() => {
    if (state.step < TOTAL_STEPS - 1) {
      dispatch({ type: "SET_STEP", step: state.step + 1 });
    }
  }, [state.step]);

  const minStep = state.hydrated ? 2 : 0;

  const goBack = useCallback(() => {
    if (state.step > minStep) {
      dispatch({ type: "SET_STEP", step: state.step - 1 });
    }
  }, [state.step, minStep]);

  // Save to Supabase
  const handleSave = useCallback(async () => {
    if (!selectedInitiative || !state.initiativeType || !state.revenueModel) return;

    dispatch({ type: "SET_SAVING", value: true });

    const irrNum = parseFloat(state.irrValue) || 0;
    const cmNum = parseFloat(state.cmValue) || 0;
    const irrCheck = checkIrrPass(irrNum, state.initiativeType);
    const cmCheck = checkCmPass(cmNum, state.revenueModel);
    const gatePass = irrCheck.pass && cmCheck.pass;
    const wScore = calculateWeightedScore(state.scores as Record<DimensionKey, number>);
    const result = determineRecommendation(wScore, gatePass);

    const payload = {
      initiative_id: selectedInitiative.id,
      initiative_type: state.initiativeType,
      revenue_model: state.revenueModel,
      investment_amount: state.investmentAmount ? parseFloat(state.investmentAmount) : null,
      timeline_months: state.timelineMonths ? parseInt(state.timelineMonths) : null,
      irr_value: irrNum,
      irr_threshold_min: irrCheck.min ?? 0,
      irr_threshold_target: irrCheck.target,
      irr_pass: irrCheck.pass,
      contribution_margin_value: cmNum,
      cm_threshold_min: cmCheck.min,
      cm_pass: cmCheck.pass,
      financial_gate_pass: gatePass,
      score_financial_return: state.scores.financial_return ?? null,
      score_strategic_alignment: state.scores.strategic_alignment ?? null,
      score_competitive_impact: state.scores.competitive_impact ?? null,
      score_client_demand: state.scores.client_demand ?? null,
      score_execution_feasibility: state.scores.execution_feasibility ?? null,
      notes_financial_return: state.notes.financial_return?.trim() || null,
      notes_strategic_alignment: state.notes.strategic_alignment?.trim() || null,
      notes_competitive_impact: state.notes.competitive_impact?.trim() || null,
      notes_client_demand: state.notes.client_demand?.trim() || null,
      notes_execution_feasibility: state.notes.execution_feasibility?.trim() || null,
      weighted_score: wScore,
      band: result.band,
      recommendation: result.recommendation,
    };

    const { error: scoreError } = await supabase
      .from("capital_scores")
      .insert(payload);

    if (scoreError) {
      dispatch({ type: "SET_SAVING", value: false });
      showToast(`Failed to save score: ${scoreError.message}`, "error");
      return;
    }

    // Update parent initiative with latest scores
    const { error: updateError } = await supabase
      .from("initiatives")
      .update({
        irr: irrNum,
        contribution_margin: cmNum,
        strategic_score: Math.round(wScore * 20), // 0-100 scale
      })
      .eq("id", selectedInitiative.id);

    if (updateError) {
      showToast(`Score saved, but failed to update initiative: ${updateError.message}`, "error");
    } else {
      showToast(
        `Capital score saved — ${DIMENSIONS.length} dimensions scored, recommendation: ${result.recommendation.replace("_", " ").toUpperCase()}`,
        "success"
      );
    }

    dispatch({ type: "SET_SAVING", value: false });

    if (onComplete) {
      onComplete(result.recommendation);
    } else {
      router.push("/cam/pipeline");
      router.refresh();
    }
  }, [selectedInitiative, state, supabase, router, showToast, onComplete]);

  // Render current step
  const renderStep = () => {
    switch (state.step) {
      case 0:
        return (
          <StepWelcome
            initiatives={initiatives}
            selectedId={state.selectedInitiativeId}
            onSelect={(id) => dispatch({ type: "SELECT_INITIATIVE", id })}
          />
        );
      case 1:
        return (
          <StepDetails
            initiativeType={state.initiativeType}
            revenueModel={state.revenueModel}
            investmentAmount={state.investmentAmount}
            timelineMonths={state.timelineMonths}
            onSetType={(v) => dispatch({ type: "SET_INITIATIVE_TYPE", value: v })}
            onSetModel={(v) => dispatch({ type: "SET_REVENUE_MODEL", value: v })}
            onSetInvestment={(v) => dispatch({ type: "SET_INVESTMENT", value: v })}
            onSetTimeline={(v) => dispatch({ type: "SET_TIMELINE", value: v })}
          />
        );
      case 2:
        return state.initiativeType ? (
          <StepIrrGate
            irrValue={state.irrValue}
            initiativeType={state.initiativeType}
            onChange={(v) => dispatch({ type: "SET_IRR", value: v })}
            prePopulated={state.hydrated && computedIrr.current !== ""}
            computedValue={computedIrr.current}
          />
        ) : null;
      case 3:
        return state.revenueModel ? (
          <StepCmGate
            cmValue={state.cmValue}
            revenueModel={state.revenueModel}
            onChange={(v) => dispatch({ type: "SET_CM", value: v })}
            prePopulated={state.hydrated && computedCm.current !== ""}
            computedValue={computedCm.current}
          />
        ) : null;
      case 4:
        return state.initiativeType && state.revenueModel ? (
          <StepGateResult
            irrValue={parseFloat(state.irrValue) || 0}
            cmValue={parseFloat(state.cmValue) || 0}
            irrPass={irrResult?.pass ?? false}
            cmPass={cmResult?.pass ?? false}
            initiativeType={state.initiativeType}
            revenueModel={state.revenueModel}
          />
        ) : null;
      case 5:
      case 6:
      case 7:
      case 8:
      case 9: {
        const dimKey = DIMENSION_STEP_KEYS[state.step - 5];
        return (
          <StepScoreDimension
            dimensionKey={dimKey}
            score={state.scores[dimKey] ?? null}
            notes={state.notes[dimKey] ?? ""}
            allScores={state.scores}
            onSetScore={(v) => dispatch({ type: "SET_SCORE", dimension: dimKey, value: v })}
            onSetNotes={(v) => dispatch({ type: "SET_NOTES", dimension: dimKey, value: v })}
          />
        );
      }
      case 10:
        return (
          <StepResults
            weightedScore={weightedScore}
            band={finalResult.band}
            recommendation={finalResult.recommendation}
            scores={state.scores as Record<DimensionKey, number>}
            irrPass={irrResult?.pass ?? false}
            cmPass={cmResult?.pass ?? false}
            irrValue={parseFloat(state.irrValue) || 0}
            cmValue={parseFloat(state.cmValue) || 0}
            saving={state.saving}
            onSave={handleSave}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: camStyle ? "12px" : "10px",
        boxShadow: camStyle
          ? "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)"
          : "0px 4px 28px 9px rgba(130, 140, 225, 0.07)",
        border: camStyle ? "1px solid var(--zelis-ice, #ECE9FF)" : undefined,
        overflow: "hidden",
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      {/* Progress */}
      <WizardProgress currentStep={state.step} totalSteps={TOTAL_STEPS} startStep={state.hydrated ? 2 : 0} />

      {/* Initiative context banner */}
      {selectedInitiative && state.step > 0 && (
        <div
          style={{
            padding: "0.6rem 2rem",
            background: "var(--zelis-ice)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.78rem",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "var(--zelis-blue-purple)",
              fontFamily: "monospace",
              background: "white",
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
              fontSize: "0.7rem",
            }}
          >
            {selectedInitiative.initiative_id}
          </span>
          <span style={{ fontWeight: 700, color: "var(--zelis-dark-gray)" }}>
            {selectedInitiative.name}
          </span>
        </div>
      )}

      {/* Step content */}
      <div style={{ padding: "2rem 2rem 1.5rem" }}>{renderStep()}</div>

      {/* Navigation footer (hidden on results step — it has its own save button) */}
      {state.step < TOTAL_STEPS - 1 && (
        <div
          style={{
            padding: "1.25rem 2rem",
            borderTop: "2px solid var(--zelis-ice)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fafafa",
          }}
        >
          <button
            onClick={state.step <= minStep ? () => router.back() : goBack}
            style={{
              padding: "0.55rem 1.25rem",
              borderRadius: "8px",
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "var(--zelis-medium-gray)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              fontFamily: "inherit",
              color: "var(--zelis-dark-gray)",
            }}
          >
            {state.step <= minStep
              ? state.hydrated ? "Back to Case" : "Cancel"
              : "Back"}
          </button>

          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--zelis-medium-gray)",
              fontWeight: 600,
            }}
          >
            Step {state.step - minStep + 1} of {TOTAL_STEPS - minStep}
          </span>

          <button
            onClick={goNext}
            disabled={!canProceed()}
            style={{
              padding: "0.55rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              background: canProceed()
                ? "linear-gradient(135deg, var(--zelis-purple) 0%, var(--zelis-blue-purple) 100%)"
                : "var(--zelis-medium-gray)",
              color: "white",
              cursor: canProceed() ? "pointer" : "default",
              fontWeight: 700,
              fontSize: "0.85rem",
              fontFamily: "inherit",
              boxShadow: canProceed() ? "0 2px 8px rgba(50, 20, 120, 0.3)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {state.step === TOTAL_STEPS - 2 ? "See Results" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
