# M.A.V.I.S. — Deep System Architecture & Algorithmic Formulation

This document provides a comprehensive technical breakdown of the architecture, mathematical formulations, and engineering decisions implemented in M.A.V.I.S. (Multi-Modal Animal Vitality Intelligence System).

---

## 1. High-Level System Architecture

The architecture decouples representation acquisition, statistical baseline learning, and clinical evaluation into three specialized, synchronized stages:

![M.A.V.I.S. End-to-End Architecture](images/architecture.png)

### Subsystem & Processing Budget Audit

Modeled after standard technical engineering reports, the table below audits the layer descriptions, execution frequencies, and computational budgets across all three tiers:

| Subsystem / Layer Module | Layer Description & Tensor/Payload Contract | Processing Frequency | Algorithmic Complexity | Execution Budget |
|---|---|---|---|---|
| **Optical PPG Acquisition** | MAX30102 Red & IR photodiode registers `[32-sample FIFO]` | 100 Hz (10 ms ticks) | $O(1)$ Peak Detect | Core 1 (APP_CPU) |
| **Motion Gating & True HRV** | Accelerometer gating $\sqrt{\sum a_i^2} > 15 \text{m/s}^2$ + RMSSD 8-beat RR window | 100 Hz (Event-triggered) | $O(N)$ where $N=8$ | Core 1 (APP_CPU) |
| **Inertial Rumination DSP** | MPU6050 Gyro Z zero-crossings ($0.25 \le \|\omega_z\| \le 1.8 \text{rad/s}$) | 100 Hz (Running integral) | $O(1)$ Zero-Crossing | Core 1 (APP_CPU) |
| **Subcutaneous Temp** | DS18B20 1-Wire non-blocking scratchpad read (`setWaitForConversion(false)`) | 0.33 Hz (Every 3 sec) | $O(1)$ Silicon Read | Core 1 (APP_CPU) |
| **Inter-Core Mailbox** | FreeRTOS Queue `[Length = 1, sizeof(TelemetryPacket)]` | Atomic overwrite | $O(1)$ Mailbox | FreeRTOS Kernel |
| **Edge Network Dispatch** | HTTPClient POST payload to `/api/sensor` | 0.33 Hz (Every 3 sec) | Non-blocking lwIP | Core 0 (PRO_CPU) |
| **Schema Ingestion & Joi** | Express Gateway input sanitization against strict Joi schema | Per request (<5 ms) | $O(K)$ field validation | Gateway Node.js |
| **Welford Baseline Engine** | Streaming continuous mean & variance ($\bar{x}_k, M_{2,k}, \sigma_k$) | Ingestion tick | $O(1)$ Constant RAM | Gateway Memory |
| **Spatial Herd Contagion** | Graph edge evaluation across shared pen co-presence matrix | Ingestion tick | $O(E)$ connected herd | Gateway Node.js |
| **Non-Linear Risk Scoring** | Multi-modal synergy engine ($1.35\times$ Febrile Ruminal Cessation) | Ingestion tick | $O(R)$ rules | Gateway Node.js |
| **Local SLM Cascade** | Ollama edge inference (`llama3.2:3b` / `phi3:mini`) + Deterministic Fallback | On-Demand (<3s) | 3B/4B quantized | Localhost GPU/CPU |
| **Client Digital Twin UI** | React 18 + TS Socket.IO consumer (`sensorUpdate`, `alert`) | Real-time push | 60 FPS re-render | Client Browser |

---

## 2. Adaptive Baseline Engine (Welford's Algorithm)

Rather than evaluating all animals against rigid, arbitrary thresholds, M.A.V.I.S. computes personalized circadian baselines using **Welford’s Algorithm** for numerically stable, streaming one-pass mean and variance calculation.

### Mathematical Formulation
Given a continuous stream of observations $x_1, x_2, \dots, x_k$ for a vital sign (e.g., Core Body Temperature):

$$\bar{x}_k = \bar{x}_{k-1} + \frac{x_k - \bar{x}_{k-1}}{k}$$

$$M_{2,k} = M_{2,k-1} + (x_k - \bar{x}_{k-1})(x_k - \bar{x}_k)$$

$$\sigma_k = \sqrt{\frac{M_{2,k}}{k - 1}} \quad (k \ge 2)$$

From this streaming variance, the dynamic Z-Score is derived in $O(1)$ constant memory:

$$Z = \frac{|x_{current} - \bar{x}_{baseline}|}{\max(\sigma_k, \sigma_{min})}$$

* Where $\sigma_{min} = 1.0$ serves as a variance floor preventing division-by-zero during resting homeostasis.
* When $Z \ge 2.5$, an individual vital deviation alert is triggered even if the absolute value falls within population-wide limits.

---

## 3. Multi-Modal Risk Scoring Engine

The clinical evaluation engine combines physiological thresholds with 6-axis behavioral state and environmental context. Rather than simple additive scoring, it models **pathophysiological synergies**:

### Non-Linear Synergy Multipliers
1. **Febrile Ruminal Cessation**:
   When core body temperature indicates a fever ($T \ge 40.0^\circ\text{C}$) while rumination ceases ($\text{rumination} = \text{false}$), the engine flags acute bovine mastitis or ruminal acidosis risk with a **$1.35\times$ synergy multiplier**.
2. **Behavioral Agitation with Tachycardia**:
   When continuous head shaking ($\text{angularRate} > 3.5\text{ rad/s}$) coincides with elevated heart rate ($\text{HR} \ge 140\text{ BPM}$), the engine flags parasitic infestation (ticks/flies) or acute neurological distress.
3. **Depressed Heart Rate Variability ($\text{HRV}$)**:
   When true optical $\text{RMSSD} < 20\text{ ms}$, the engine adds high-priority autonomic stress points, indicating pain, endotoxemia, or shock.

$$\text{Final Risk Score} = \min\left(100, \, \left(\sum \text{Base Risk Points}\right) \times \prod \text{Synergy Multipliers}\right)$$

---

## 4. Spatial Herd Contagion Graph

When an animal in an enclosed pen or pasture develops a contagious respiratory or febrile profile, M.A.V.I.S. assesses exposure likelihood across all co-located subjects.

### Epidemiological Formulation
The transmission probability between index subject $i$ and neighboring subject $j$ sharing zone $Z$ over duration $\Delta t$ is computed as:

$$P_{\text{contagion}}(i, j) = 1 - \exp\left(-\beta \cdot w_{\text{species}} \cdot \Delta t_{\text{shared}}\right)$$

* $\beta$: Transmission coefficient calibrated by ventilation and contact density ($0.85$ for enclosed barn, $0.35$ for open pasture).
* $w_{\text{species}}$: Species susceptibility weight ($1.0$ for cross-cattle transmission, $0.6$ for inter-species contact).

---

## 5. Local-First AI Inference & Deterministic Safety Cascade

For diagnostic summaries and differential assessments, M.A.V.I.S. uses on-premises Small Language Models (SLMs) via Ollama:

1. **Primary Model**: `llama3.2:3b` / `llama3.2:1b` (optimized for edge reasoning).
2. **Secondary Fallback**: `phi3:mini` / `phi3`.
3. **Deterministic Safety Engine**: If the Ollama runtime is offline or unresponsive within a 5-second timeout, the system automatically falls back to an in-memory rule-based evaluation matrix that generates structured clinical actions with zero downtime.
