# Azure OpenAI Fine-Tuning Cost Calculator

A client-side web application for estimating Azure OpenAI fine-tuning costs including training, hosting, and inference.

## Features

- **Training Cost Calculation**
  - Supervised Fine-Tuning (SFT) / Preference Fine-Tuning (DPO): Based on tokens × epochs
  - Reinforcement Fine-Tuning (RFT): Based on training hours + optional grader costs
  - Supports Regional, Global, and Developer training tiers

- **Hosting Cost Calculation**
  - Standard (Regional) deployment
  - Global Standard deployment
  - Provisioned Throughput Units (PTU) with hourly/monthly/yearly pricing
  - Developer Tier (no hosting fee, 24h limit)

- **Inference Cost Calculation**
  - Input and output token pricing
  - Cached input pricing support
  - Automatic calculation based on deployment type

## Quick Start

1. Open `index.html` in any modern web browser
2. No server or build process required

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a simple HTTP server
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## File Structure

```
azure-openai-cost-calculator/
├── index.html      # Main application page
├── styles.css      # Styling
├── pricing.js      # Pricing data (UPDATE THIS WHEN PRICING CHANGES)
├── calculator.js   # Calculation logic
└── README.md       # This file
```

## Updating Pricing

**⚠️ Important**: Azure pricing changes periodically. Always verify against the official sources:
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/azure-openai/)
- [Fine-Tuning Cost Management](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/fine-tuning-cost-management)

To update pricing, edit `pricing.js`:

```javascript
// Example: Update GPT-4o inference pricing
'gpt-4o': {
    // ...
    inference: {
        regional: { input: 2.50, cachedInput: 1.25, output: 10.00 }, // Update these values
        global: { input: 2.50, cachedInput: 1.25, output: 10.00 },
        // ...
    },
    // ...
}
```

### Adding a New Model

```javascript
'new-model-id': {
    name: 'Display Name',
    supportsFineTuning: true,
    trainingType: 'sft', // 'sft' or 'rft'
    training: {
        regional: X.XX,  // $ per 1M tokens (SFT) or per hour (RFT)
        global: X.XX,
        developer: X.XX
    },
    inference: {
        regional: { input: X.XX, cachedInput: X.XX, output: X.XX },
        global: { input: X.XX, cachedInput: X.XX, output: X.XX },
        developer: { input: X.XX, cachedInput: X.XX, output: X.XX }
    },
    hosting: {
        standard: 1.70,
        globalStandard: 1.70,
        developer: 0
    },
    ptu: {
        minPTUs: 50,
        hourly: X.XX,
        monthly: XXXX,
        yearly: XXXXX
    }
}
```

Then add the model to the dropdown in `index.html`.

## Cost Formulas

### 3.1 Supervised Fine-Tuning (SFT/DPO)
```
training_cost = (training_tokens / 1,000,000) × epochs × training_price_per_million_tokens
```

### 3.2 Reinforcement Fine-Tuning (RFT)
```
training_cost = (training_hours × rft_hourly_rate) + (grader_tokens_million × (grader_input_cost + grader_output_cost) / 2)
```
- RFT jobs are capped at $5,000 per job

### Hosting (Standard/Global Standard)
```
Monthly Hosting = Hourly Rate × Hours per Day × Days per Month
```

### Hosting (PTU)
```
Monthly Hosting = Number of PTUs × PTU Rate (hourly/monthly/yearly)
```

### Inference
```
Monthly Inference = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT - Use freely, but remember to verify pricing against official Azure documentation.

## Disclaimer

This calculator provides **estimates only**. Actual costs may vary based on:
- Currency exchange rates
- Enterprise agreements
- Regional pricing differences
- Promotional discounts

Always refer to the [official Azure OpenAI pricing page](https://azure.microsoft.com/en-us/pricing/details/azure-openai/) for authoritative pricing information.
