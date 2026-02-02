/**
 * Azure OpenAI Fine-Tuning Cost Calculator
 * 
 * Implements cost calculations based on:
 * - https://azure.microsoft.com/en-us/pricing/details/azure-openai/
 * - https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/fine-tuning-cost-management
 */

class CostCalculator {
    constructor() {
        this.pricing = window.PRICING;
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
        this.calculate();
    }

    initializeElements() {
        // Model & Configuration
        this.modelSelect = document.getElementById('model');
        this.trainingTierSelect = document.getElementById('trainingTier');
        this.deploymentTypeSelect = document.getElementById('deploymentType');
        this.trainingTypeSelect = document.getElementById('trainingType');

        // Training - SFT
        this.sftSection = document.getElementById('sftSection');
        this.trainingTokensInput = document.getElementById('trainingTokens');
        this.epochsInput = document.getElementById('epochs');

        // Training - RFT
        this.rftSection = document.getElementById('rftSection');
        this.trainingHoursInput = document.getElementById('trainingHours');
        this.useModelGraderCheckbox = document.getElementById('useModelGrader');
        this.graderSection = document.getElementById('graderSection');
        this.graderModelSelect = document.getElementById('graderModel');
        this.graderTokensInput = document.getElementById('graderTokens');

        // Hosting
        this.standardHostingSection = document.getElementById('standardHostingSection');
        this.ptuHostingSection = document.getElementById('ptuHostingSection');
        this.developerHostingSection = document.getElementById('developerHostingSection');
        this.hostingHoursPerDayInput = document.getElementById('hostingHoursPerDay');
        this.hostingDaysPerMonthInput = document.getElementById('hostingDaysPerMonth');
        this.ptuCountInput = document.getElementById('ptuCount');
        this.ptuPricingSelect = document.getElementById('ptuPricing');

        // Inference
        this.inputTokensPerMonthInput = document.getElementById('inputTokensPerMonth');
        this.outputTokensPerMonthInput = document.getElementById('outputTokensPerMonth');
        this.useCachedInputCheckbox = document.getElementById('useCachedInput');

        // Results
        this.trainingCostDisplay = document.getElementById('trainingCost');
        this.hostingCostDisplay = document.getElementById('hostingCost');
        this.inferenceCostDisplay = document.getElementById('inferenceCost');
        this.summaryTrainingDisplay = document.getElementById('summaryTraining');
        this.summaryHostingDisplay = document.getElementById('summaryHosting');
        this.summaryInferenceDisplay = document.getElementById('summaryInference');
        this.summaryFirstMonthDisplay = document.getElementById('summaryFirstMonth');
        this.summaryRecurringDisplay = document.getElementById('summaryRecurring');
    }

    attachEventListeners() {
        // All inputs trigger recalculation
        const allInputs = document.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.addEventListener('change', () => this.handleChange());
            input.addEventListener('input', () => this.handleChange());
        });

        // Special handlers for UI updates
        this.modelSelect.addEventListener('change', () => this.updateUI());
        this.trainingTypeSelect.addEventListener('change', () => this.updateUI());
        this.deploymentTypeSelect.addEventListener('change', () => this.updateUI());
        this.useModelGraderCheckbox.addEventListener('change', () => this.updateUI());
    }

    handleChange() {
        this.calculate();
    }

    updateUI() {
        const modelId = this.modelSelect.value;
        const model = this.pricing.getModel(modelId);
        const deploymentType = this.deploymentTypeSelect.value;
        const trainingType = this.trainingTypeSelect.value;

        // Show/hide training sections based on selected training type
        if (trainingType === 'rft') {
            this.sftSection.style.display = 'none';
            this.rftSection.style.display = 'block';
        } else {
            this.sftSection.style.display = 'block';
            this.rftSection.style.display = 'none';
        }

        // Show/hide grader section
        this.graderSection.style.display = this.useModelGraderCheckbox.checked ? 'block' : 'none';

        // Show/hide hosting sections based on deployment type
        this.standardHostingSection.style.display = 'none';
        this.ptuHostingSection.style.display = 'none';
        this.developerHostingSection.style.display = 'none';

        if (deploymentType === 'ptu') {
            this.ptuHostingSection.style.display = 'block';
            // Update min PTUs
            if (model.ptu) {
                this.ptuCountInput.min = model.ptu.minPTUs;
                if (parseInt(this.ptuCountInput.value) < model.ptu.minPTUs) {
                    this.ptuCountInput.value = model.ptu.minPTUs;
                }
            }
        } else if (deploymentType === 'developer') {
            this.developerHostingSection.style.display = 'block';
        } else {
            this.standardHostingSection.style.display = 'block';
        }

        this.calculate();
    }

    calculate() {
        const trainingCost = this.calculateTrainingCost();
        const hostingCost = this.calculateHostingCost();
        const inferenceCost = this.calculateInferenceCost();

        // Update displays
        this.trainingCostDisplay.textContent = this.formatCurrency(trainingCost);
        this.hostingCostDisplay.textContent = this.formatCurrency(hostingCost);
        this.inferenceCostDisplay.textContent = this.formatCurrency(inferenceCost);

        // Update summary
        this.summaryTrainingDisplay.textContent = this.formatCurrency(trainingCost);
        this.summaryHostingDisplay.textContent = this.formatCurrency(hostingCost);
        this.summaryInferenceDisplay.textContent = this.formatCurrency(inferenceCost);

        const firstMonthTotal = trainingCost + hostingCost + inferenceCost;
        const recurringMonthly = hostingCost + inferenceCost;

        this.summaryFirstMonthDisplay.textContent = this.formatCurrency(firstMonthTotal);
        this.summaryRecurringDisplay.textContent = this.formatCurrency(recurringMonthly);
    }

    /**
     * Calculate training cost
     * 3.1 SFT/DPO: (training_tokens / 1,000,000) × epochs × training_price_per_million_tokens
     * 3.2 RFT: (training_hours × rft_hourly_rate) + (grader_tokens_million × (grader_input_cost + grader_output_cost) / 2)
     */
    calculateTrainingCost() {
        const modelId = this.modelSelect.value;
        const model = this.pricing.getModel(modelId);
        const tier = this.trainingTierSelect.value;
        const trainingType = this.trainingTypeSelect.value;

        if (trainingType === 'rft') {
            // 3.2 Reinforcement Fine-Tuning (RFT)
            // training_cost = (training_hours × rft_hourly_rate) + (grader_tokens_M × (grader_input_cost + grader_output_cost) / 2)
            const hours = parseFloat(this.trainingHoursInput.value) || 0;
            
            // Use RFT-specific pricing if available, otherwise use model's training rate
            const rftModel = this.pricing.getModel('o4-mini-rft');
            const hourlyRate = rftModel ? rftModel.training[tier] : 100;
            
            let cost = hours * hourlyRate;

            // Add grader costs if enabled
            if (this.useModelGraderCheckbox.checked && rftModel && rftModel.graders) {
                const graderModel = this.graderModelSelect.value;
                const graderPricing = rftModel.graders[graderModel];
                const graderTokensM = parseFloat(this.graderTokensInput.value) || 0;
                
                // Formula: grader_tokens_M × (grader_input_cost + grader_output_cost) / 2
                const avgGraderCost = (graderPricing.input + graderPricing.output) / 2;
                cost += graderTokensM * avgGraderCost;
            }

            // Apply RFT cost cap
            return Math.min(cost, this.pricing.rftCostCap);
        } else {
            // 3.1 Supervised Fine-Tuning (SFT) / DPO
            // training_cost = (training_tokens / 1,000,000) × epochs × training_price_per_million_tokens
            const tokensM = parseFloat(this.trainingTokensInput.value) || 0;
            const epochs = parseInt(this.epochsInput.value) || 1;
            const pricePerMillionTokens = model.training[tier];

            // tokensM is already in millions, so: tokensM × epochs × price_per_million
            return tokensM * epochs * pricePerMillionTokens;
        }
    }

    /**
     * Calculate monthly hosting cost
     * Standard/Global: hourly rate × hours
     * PTU: PTUs × PTU rate
     * Developer: $0
     */
    calculateHostingCost() {
        const modelId = this.modelSelect.value;
        const model = this.pricing.getModel(modelId);
        const deploymentType = this.deploymentTypeSelect.value;

        if (deploymentType === 'developer') {
            return 0;
        }

        if (deploymentType === 'ptu') {
            if (!model.ptu) return 0;
            
            const ptuCount = parseInt(this.ptuCountInput.value) || model.ptu.minPTUs;
            const pricingType = this.ptuPricingSelect.value;

            switch (pricingType) {
                case 'hourly':
                    // Monthly cost = PTUs × hourly rate × 24 × 30
                    return ptuCount * model.ptu.hourly * 24 * 30;
                case 'monthly':
                    return ptuCount * model.ptu.monthly;
                case 'yearly':
                    // Show monthly equivalent
                    return (ptuCount * model.ptu.yearly) / 12;
                default:
                    return 0;
            }
        }

        // Standard or Global Standard
        const hostingKey = deploymentType === 'globalStandard' ? 'globalStandard' : 'standard';
        const hourlyRate = model.hosting[hostingKey];
        const hoursPerDay = parseFloat(this.hostingHoursPerDayInput.value) || 24;
        const daysPerMonth = parseInt(this.hostingDaysPerMonthInput.value) || 30;

        return hourlyRate * hoursPerDay * daysPerMonth;
    }

    /**
     * Calculate monthly inference cost
     * (Input tokens × input price) + (Output tokens × output price)
     */
    calculateInferenceCost() {
        const modelId = this.modelSelect.value;
        const model = this.pricing.getModel(modelId);
        const deploymentType = this.deploymentTypeSelect.value;

        // PTU doesn't charge per token
        if (deploymentType === 'ptu') {
            return 0;
        }

        // Map deployment type to inference pricing tier
        let tier = 'regional';
        if (deploymentType === 'globalStandard') tier = 'global';
        if (deploymentType === 'developer') tier = 'developer';

        const pricing = model.inference[tier];
        const inputTokensM = parseFloat(this.inputTokensPerMonthInput.value) || 0;
        const outputTokensM = parseFloat(this.outputTokensPerMonthInput.value) || 0;
        const useCached = this.useCachedInputCheckbox.checked;

        const inputPrice = useCached && pricing.cachedInput ? pricing.cachedInput : pricing.input;
        const inputCost = inputTokensM * inputPrice;
        const outputCost = outputTokensM * pricing.output;

        return inputCost + outputCost;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CostCalculator();
});
