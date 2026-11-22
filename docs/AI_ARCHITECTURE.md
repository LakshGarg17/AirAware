# AirAware AI Architecture & Safety Governance

## 1. Executive Overview
AirAware integrates Google's Gemini generative AI models (`gemini-2.5-flash`) via the modern `google-genai` Python SDK (`from google import genai`) to deliver context-aware, personalized smog navigation advice. 

The architecture strictly adheres to a **Deterministic Safety First** doctrine:
- The deterministic backend layer exclusively owns AQI calculation, standard breakpoint interpretations, severity color tokens, and critical exposure safeguards.
- The AI never invents numerical air quality measurements or overrides life-safety recommendations.
- Critical deterministic recommendations are unconditionally injected at the top of every response.

```
       User Request + Localized Context
                    │
                    ▼
       ┌────────────────────────┐
       │   Deterministic Core   │ ◄─── Open-Meteo Live Data
       │ (US AQI Breakpoints &  │
       │  Critical Safeguards)  │
       └────────────┬───────────┘
                    │ Context Injection
                    ▼
       ┌────────────────────────┐
       │   Context Builder      │ ─── Truncates coordinates (2 decimals)
       │ (PII & Prompt Defense) │ ─── Strips personal medical free-text
       └────────────┬───────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
   [AI Configured?]   [AI Disabled / Rate-Limited / Error?]
           │                 │
           │ Yes             │ No
           ▼                 │
   ┌───────────────┐         │
   │ Gemini Flash  │         │
   │ (Structured)  │         │
   └───────┬───────┘         │
           │                 │
           ▼                 │
   ┌───────────────┐         │
   │ Safety Filter │         │
   │  & Validator  │         │
   └───────┬───────┘         │
           │                 │
           ├─────────────────┘
           ▼
   ┌────────────────────────┐
   │ Deterministic Merge    │ ─── Critical deterministic items always #1
   │ & Honest Attribution   │ ─── Source: "ai" | "rules"
   └────────────┬───────────┘
                ▼
      JSON Response to Client
```

---

## 2. Gemini Integration Specifications

### 2.1 SDK & Model Configuration
- **Package**: `google-genai==3.6.1`
- **Client Invocation**: Asynchronous non-blocking `client.aio.models.generate_content`
- **Default Model**: `gemini-2.5-flash` (configurable via `GEMINI_MODEL`)
- **JSON Structured Mode**: `response_mime_type="application/json"` with schema adherence
- **Timeout Protection**: Strict `asyncio.wait_for` timeout (`AI_TIMEOUT_SECONDS`, default 20s)
- **Token Bound**: Strict `max_output_tokens` ceiling (default 2048)
- **Temperature**: Low variability (`temperature=0.3`) for fact-grounded recommendations.

### 2.2 Prompt Injection & Data Privacy Defenses
1. **Coordinate Truncation**: Latitudes and longitudes are clamped to at most 2 decimal places (~1.1 km precision) to protect exact user dwellings.
2. **PII & Medical Stripping**: No user names, email addresses, IP addresses, or free-text medical records are forwarded to the model.
3. **Delimiter Isolation**: Untrusted context and user chat prompts are wrapped inside dedicated XML-style isolation tags (`<user_prompt>`, `<air_quality_context>`).
4. **System Instructions Hardening**: The model is instructed to ignore any user directives that attempt to alter its persona, disclose internal instructions, bypass safety rules, or manufacture fake scientific data.

---

## 3. Strict Safety Filter & Banned Claims
Before any AI output is returned to the client, it is processed through `app.ai.validator.SafetyValidator`. If any prohibited misinformation is detected, the AI output is discarded, and the response falls back cleanly to deterministic rules.

### Prohibited Topics & Claims:
- **Ozone Generators**: Banned. Ozone is a severe lung irritant that worsens asthma and chronic respiratory disease.
- **Houseplants as Filter Replacements**: Banned. While plants look nice, scientific studies prove they do not filter ambient particulate matter (PM2.5/PM10) at household scale.
- **DIY Purifier = HEPA Equivalency**: Banned. DIY box fan filters help in emergencies but must never be claimed to match certified H13/True-HEPA filtration or seal integrity.
- **Permanent Window Taping / Sealing**: Banned. Indefinite window sealing causes dangerous CO2 buildup and indoor air poisoning.
- **Medical Prescriptions & Dosing**: Banned. No advice regarding inhaler dosage, steroid usage, or clinical treatment. Users experiencing respiratory distress are directed to medical professionals.
- **Fabricated Quantitative Impact Claims**: Banned. No unverified statistical claims like "this action reduces your mortality risk by 14%".

---

## 4. Honest Attribution & Graceful Fallback
Every response that interacts with AI returns clear metadata:
```json
{
  "source": "ai", // or "rules"
  "ai_available": true,
  "fallback_reason": null // or "disabled", "not_configured", "timeout", "rate_limited", "provider_error", "safety_filtered"
}
```

The frontend uses this to display transparent badges:
- **`AI-generated`** (Green badge): Verified response synthesized by Gemini Flash.
- **`Rule-based guidance`** (Slate badge): Deterministic recommendations generated from standard public health guidelines.

The UI **never** labels rule-based guidance as AI.
