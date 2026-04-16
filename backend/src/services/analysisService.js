const normalize = (value) => (value || "").toLowerCase();

const includesAny = (text, keywords) => keywords.some((word) => text.includes(word));

const analyzeCaseData = (caseDoc) => {
  const abuseType = normalize(caseDoc.abuseType);
  const frequency = normalize(caseDoc.frequency);
  const threatLevel = normalize(caseDoc.threatLevel);
  const incident = normalize(caseDoc.incidentDescription);
  const statement = normalize(caseDoc.statement);
  const combinedText = `${incident} ${statement}`;

  let riskScore = 20;
  const abusePatterns = [];

  if (includesAny(abuseType, ["physical", "sexual"])) {
    riskScore += 25;
    abusePatterns.push("Physical/Sexual Harm");
  }

  if (includesAny(abuseType, ["financial", "economic"])) {
    riskScore += 12;
    abusePatterns.push("Financial Control");
  }

  if (includesAny(abuseType, ["psychological", "verbal", "emotional"])) {
    riskScore += 10;
    abusePatterns.push("Emotional Abuse");
  }

  if (includesAny(frequency, ["daily"])) {
    riskScore += 20;
  } else if (includesAny(frequency, ["weekly"])) {
    riskScore += 14;
  } else if (includesAny(frequency, ["monthly"])) {
    riskScore += 7;
  }

  if (includesAny(threatLevel, ["immediate", "high"])) {
    riskScore += 25;
    abusePatterns.push("Immediate Threat");
  } else if (includesAny(threatLevel, ["moderate"])) {
    riskScore += 12;
  }

  if (includesAny(combinedText, ["kill", "weapon", "knife", "gun", "hurt", "harm"])) {
    riskScore += 18;
    abusePatterns.push("Violence Indicators");
  }

  if (includesAny(combinedText, ["control", "isolate", "phone", "money", "locked", "follow"])) {
    riskScore += 10;
    abusePatterns.push("Coercive Control");
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let severity = "low";
  if (riskScore >= 70) {
    severity = "high";
  } else if (riskScore >= 40) {
    severity = "medium";
  }

  const uniquePatterns = [...new Set(abusePatterns)];

  const generatedBrief = [
    `Victim ${caseDoc.victimName}, age ${caseDoc.age}, reported ${caseDoc.abuseType}.`,
    `Incident frequency is recorded as ${caseDoc.frequency} with threat level ${caseDoc.threatLevel}.`,
    `Risk assessment indicates ${severity.toUpperCase()} severity with a score of ${riskScore}/100.`,
    uniquePatterns.length
      ? `Detected patterns: ${uniquePatterns.join(", ")}.`
      : "No specific abuse pattern keywords were detected from text inputs.",
    "Recommendation: prioritize safety planning and legal follow-up based on risk level."
  ].join(" ");

  return {
    severity,
    riskScore,
    abusePatterns: uniquePatterns,
    generatedBrief
  };
};

module.exports = {
  analyzeCaseData
};