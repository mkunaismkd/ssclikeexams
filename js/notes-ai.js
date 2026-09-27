/* Notes and roadmap for the AI / ML & GenAI career track. Same light-markdown format as notes.js. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  EP.NOTES = EP.NOTES || {};

  EP.NOTES.mlfund = {
    'Roadmap: ML fundamentals': `## What to learn, in order
- **Python for data**: NumPy, pandas, matplotlib; Jupyter; clean, reproducible notebooks.
- **Maths you actually use**: linear algebra (vectors, dot products, matrices), probability & statistics (distributions, Bayes, hypothesis tests), calculus for gradients.
- **Supervised learning**: linear/logistic regression, trees, random forests, gradient boosting (XGBoost/LightGBM).
- **Unsupervised**: k-means, PCA, anomaly detection.
- **Evaluation & validation**: metrics, cross-validation, leakage, class imbalance.
- **Tooling**: scikit-learn Pipelines, feature engineering, hyperparameter search.
## Practice
- Kaggle-style tabular problems end to end: EDA → baseline → features → model → error analysis → write-up.`,
    'Evaluation Metrics': `## Classification
- \`Precision = TP / (TP + FP)\` — of predicted positives, how many are right.
- \`Recall = TP / (TP + FN)\` — of actual positives, how many you caught.
- \`F1 = 2PR / (P + R)\` — harmonic mean; use with imbalance.
- \`Accuracy = (TP + TN) / total\` — misleading on imbalanced data.
- **ROC-AUC**: ranking quality across thresholds; **PR-AUC** is better when positives are rare.
- Choose the threshold from the business cost of FP vs FN.
## Regression
- \`MSE = mean((y − ŷ)²)\`, \`RMSE = √MSE\` (same units as y), \`MAE = mean(|y − ŷ|)\` (robust to outliers), R².`,
    'Bias–Variance': `## Diagnose from learning curves
- **High bias (underfit)**: train and validation both poor → bigger model, better features, less regularisation.
- **High variance (overfit)**: train good, validation poor → more data, regularisation (L1/L2, dropout), simpler model, early stopping, augmentation.
- L1 → sparse weights (feature selection); L2 → small weights.`,
    'Validation': `## Rules
- Split first; fit scalers/encoders on **train only** (use Pipelines).
- k-fold CV for small data; **stratified** for imbalanced classes; **time-based** splits for time series; **group** splits when samples share an entity (same user/patient).
- Keep a final untouched test set.`,
    'Algorithms': `## Cheat sheet
- **Linear/logistic regression**: fast, interpretable baselines; need scaling for regularisation.
- **Decision tree**: splits by impurity (Gini \`1 − Σp²\` or entropy); overfits alone.
- **Random forest**: bagging + random features → lower variance.
- **Gradient boosting**: sequential trees on residuals; usually best on tabular data.
- **k-NN / SVM / k-means**: distance-based → scale features.
- **Naive Bayes**: strong text baseline.`,
  };

  EP.NOTES.dl = {
    'Roadmap: deep learning': `## Path
- **PyTorch basics**: tensors, autograd, \`nn.Module\`, training loop, DataLoader, GPU.
- **MLPs → CNNs → sequence models → Transformers**.
- **Training craft**: initialisation, normalisation, optimisers (AdamW), LR schedules, mixed precision, checkpoints.
- **Transfer learning**: fine-tune pretrained vision/text models (Hugging Face).
- Read: "Attention Is All You Need"; fast.ai / d2l.ai / Karpathy's "Neural Networks: Zero to Hero".`,
    'Neural Network Parameters': `## Counting
- Dense layer: \`in × out + out\` (weights + biases).
- Conv2D: \`(K × K × C_in + 1) × C_out\` — independent of image size.
- Conv output size: \`(W − K + 2P) / S + 1\`.
- Parameters × bytes per parameter ≈ memory for weights (fp32 = 4 B, fp16/bf16 = 2 B, int8 = 1 B, 4-bit = 0.5 B). Training needs several times more (gradients, optimiser states, activations).`,
    'Training Deep Nets': `## Checklist
- Overfit a tiny batch first to prove the pipeline works.
- Loss exploding → lower LR, gradient clipping, check data/labels.
- Vanishing gradients → ReLU/GELU, residual connections, normalisation.
- Regularise: weight decay, dropout, augmentation, early stopping.
- Track train/val curves in TensorBoard or W&B.`,
    'Transformers & Attention': `## Core ideas
- \`Attention(Q, K, V) = softmax(QKᵀ / √d_k) V\`.
- Multi-head attention runs several attention "views" in parallel.
- Positional information: sinusoidal, learned, or **RoPE**.
- Encoder-only (BERT) for understanding; decoder-only (GPT, Llama) for generation; encoder–decoder (T5) for seq2seq.
- Cost grows with **n²** in sequence length → FlashAttention, sliding windows, KV cache for decoding.`,
  };

  EP.NOTES.genai = {
    'Roadmap: GenAI engineer': `## Skills employers ask for
- **LLM APIs**: chat completions, streaming, structured outputs/JSON, tool calling, token and cost control.
- **Prompting**: clear instructions, examples (few-shot), delimiters for untrusted content, output schemas.
- **RAG**: loaders → chunking → embeddings → vector DB → retrieval (hybrid + rerank) → grounded answers with citations.
- **Agents**: tool use, planning loops, memory, guardrails, human-in-the-loop.
- **Fine-tuning**: when to use it, LoRA/QLoRA, dataset prep, evaluation.
- **Evaluation & LLMOps**: golden sets, LLM-as-judge, tracing, latency/cost dashboards, prompt versioning.
- **Open models**: Hugging Face, quantisation, local inference (llama.cpp/Ollama/vLLM).
## Tip
- This app itself is a GenAI project: a Groq-backed tutor, JSON question generation with validation, and a PDF-text extractor. Read its \`lib/ai.js\` as a worked example.`,
    'LLM Basics': `## Key terms
- **Tokens**: sub-word units; pricing, limits and latency are all per token.
- **Context window**: prompt + output tokens must fit.
- **Temperature / top-p**: randomness of sampling; 0 ≈ greedy.
- **Pretraining → instruction tuning → preference tuning (RLHF/DPO)**.
- **Hallucination**: fluent but unfounded output → ground with RAG, ask for citations, validate.`,
    'RAG & Chunking': `## Pipeline
1. Ingest & clean documents; keep metadata (source, page, date).
2. Chunk (e.g., 300–800 tokens with 10–20% overlap; respect headings/paragraphs).
3. Embed chunks; store in a vector DB (pgvector, Qdrant, Weaviate, Pinecone, FAISS).
4. Retrieve top-k with **hybrid search** (BM25 + vectors), then **rerank**.
5. Prompt: "Answer only from the context; cite sources; say if unknown."
6. Evaluate retrieval (recall@k) and answers (faithfulness, relevance).
## Chunk count
- \`chunks = ⌈(T − C) / (C − O)⌉ + 1\` for a T-token doc, chunk C, overlap O.`,
    'Prompt Engineering': `## Patterns
- Role + task + constraints + output format + examples.
- Put untrusted text inside clear delimiters and tell the model to treat it as data.
- Ask for JSON that matches a schema; validate and retry.
- Break complex tasks into steps (prompt chaining) or let the model use tools.
- Keep a versioned prompt library and regression tests.`,
    'Fine-tuning': `## Decide
- **Prompting / RAG first** — cheaper, faster to iterate, keeps knowledge fresh.
- **Fine-tune** for consistent style/format, domain-specific behaviour, or smaller/cheaper models matching a big one.
- **LoRA/QLoRA**: train small adapters; QLoRA puts the base model in 4-bit.
- Quality of data > quantity; hold out an eval set.`,
    'Agents & Tools': `## Building blocks
- Tool/function calling with JSON schemas; your code executes the tool.
- Loop: reason → act → observe → repeat, with a step limit.
- Memory: conversation state, summaries, or retrieval.
- Safety: least-privilege tools, confirmation for destructive actions, logging, evals.
- Protocols like MCP standardise how agents discover and call tools.`,
  };

  EP.NOTES.mlops = {
    'Roadmap: MLOps': `## Path
- Git, Python packaging, testing; **Docker**; a cloud (AWS/GCP/Azure) basics.
- Serve models with **FastAPI**; CI/CD with GitHub Actions.
- Experiment tracking & registry (**MLflow**/W&B); data versioning (DVC).
- Orchestration (Airflow/Prefect), feature stores, Kubernetes basics.
- Monitoring: data drift, model performance, latency, cost; alerting.
- LLMOps: tracing, eval pipelines, prompt/version management, guardrails.`,
    'Deployment': `## Patterns
- **Batch** (scheduled predictions) vs **online** (API, low latency) vs **streaming**.
- Rollouts: shadow → canary → A/B test → full.
- Keep training and serving features identical (feature store / shared code).
- Package with Docker; add health checks, input validation, timeouts, autoscaling.`,
    'Monitoring': `## What to watch
- **Data drift** (input distributions), **concept drift** (input→label relationship), prediction distribution.
- Model metrics when labels arrive; proxy metrics before that.
- Latency, errors, throughput, cost (tokens for LLMs).
- Fairness across groups; privacy (redact PII in logs).`,
  };

  // Portfolio projects for the roadmap checklist (stored as done['project|<name>']).
  EP.CAREER_PROJECTS = [
    ['Tabular ML end-to-end', 'Pick a public dataset (e.g., churn or loan default). EDA → baseline → XGBoost → SHAP explanations → a short write-up on GitHub.'],
    ['Model as an API', 'Serve your best model with FastAPI in Docker, add input validation and tests, deploy to a free cloud tier.'],
    ['Image classifier with transfer learning', 'Fine-tune a pretrained CNN/ViT on a small custom dataset; report per-class metrics and a confusion matrix.'],
    ['RAG chatbot over your documents', 'Chunk + embed PDFs, store in pgvector/Qdrant, hybrid search + rerank, cite sources, and build a small eval set.'],
    ['LLM structured extraction', 'Extract fields from invoices/resumes into JSON with schema validation and retries; measure accuracy on 50 labelled samples.'],
    ['Tool-using agent', 'An agent that answers questions using 2–3 tools (search, calculator, SQL) with step limits, logging and guardrails.'],
    ['Fine-tune a small open model', 'LoRA/QLoRA fine-tune a small open model on a narrow task; compare with prompting and RAG baselines.'],
    ['MLOps pipeline', 'Track experiments in MLflow, version data with DVC, CI with GitHub Actions, and a drift-monitoring dashboard.'],
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = EP.NOTES;
})(typeof window !== 'undefined' ? window : globalThis);
