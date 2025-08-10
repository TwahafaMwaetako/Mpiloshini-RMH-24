from typing import Dict, List, Tuple


class RuleEngine:
    def __init__(self, baseline: Dict[str, float] | None) -> None:
        self.baseline = baseline or {}

    def check_imbalance(self, features: Dict[str, float]) -> Tuple[bool, float]:
        base = float(self.baseline.get("fft_peak_1x", 0.0))
        cur = float(features.get("fft_peak_1x", 0.0))
        if base <= 0:
            return False, 0.0
        ratio = cur / base
        triggered = ratio > 1.5
        severity = max(0.0, min(100.0, (ratio - 1.0) * 100.0)) if triggered else 0.0
        return triggered, severity

    def check_misalignment(self, features: Dict[str, float]) -> Tuple[bool, float]:
        # Simple proxy: crest factor elevates significantly vs baseline
        base = float(self.baseline.get("crest_factor", 0.0))
        cur = float(features.get("crest_factor", 0.0))
        if base <= 0:
            return False, 0.0
        ratio = cur / base
        triggered = ratio > 1.4
        severity = max(0.0, min(100.0, (ratio - 1.0) * 100.0)) if triggered else 0.0
        return triggered, severity

    def check_bearing_faults(self, features: Dict[str, float]) -> Tuple[bool, float]:
        # Placeholder heuristic using kurtosis increase
        base = float(self.baseline.get("kurtosis", 3.0))
        cur = float(features.get("kurtosis", 3.0))
        triggered = cur > base * 1.3
        severity = max(0.0, min(100.0, (cur / (base + 1e-6) - 1.0) * 100.0)) if triggered else 0.0
        return triggered, severity

    def calculate_health_score(self, detections: List[Dict[str, float]]) -> int:
        # Start from 100 and subtract weighted severities
        score = 100.0
        for d in detections:
            score -= 0.3 * d.get("severity", 0.0)
        return max(0, min(100, int(round(score))))

    def evaluate(self, features: Dict[str, float]) -> List[Dict[str, float]]:
        findings: List[Dict[str, float]] = []

        trig, sev = self.check_imbalance(features)
        if trig:
            findings.append({"fault_type": "Imbalance", "severity": sev, "confidence": 0.7})

        trig, sev = self.check_misalignment(features)
        if trig:
            findings.append({"fault_type": "Misalignment", "severity": sev, "confidence": 0.6})

        trig, sev = self.check_bearing_faults(features)
        if trig:
            findings.append({"fault_type": "Bearing Fault", "severity": sev, "confidence": 0.55})

        return findings
