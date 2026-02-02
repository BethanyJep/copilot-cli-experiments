/**
 * Azure OpenAI Pricing Data
 * 
 * IMPORTANT: Update this file when Azure pricing changes.
 * Reference: https://azure.microsoft.com/en-us/pricing/details/azure-openai/
 * Last updated: February 2026
 * 
 * All prices are in USD per 1M tokens unless otherwise noted.
 */

const PRICING = {
    // Model-specific pricing
    models: {
        // GPT-4.1 Series
        'gpt-4.1': {
            name: 'GPT-4.1',
            supportsFineTuning: true,
            trainingType: 'sft', // supervised fine-tuning
            training: {
                regional: 4.00,   // per 1M tokens
                global: 3.00,    // per 1M tokens (estimated 25% discount)
                developer: 2.00  // per 1M tokens (50% discount)
            },
            inference: {
                regional: { input: 2.00, cachedInput: 1.00, output: 8.00 },
                global: { input: 2.00, cachedInput: 1.00, output: 8.00 },
                developer: { input: 2.00, cachedInput: 1.00, output: 8.00 }
            },
            hosting: {
                standard: 1.70,      // per hour
                globalStandard: 1.70, // per hour
                developer: 0         // no hosting fee
            },
            ptu: {
                minPTUs: 50,
                hourly: 2.00,
                monthly: 1200,
                yearly: 10800
            }
        },
        'gpt-4.1-mini': {
            name: 'GPT-4.1-mini',
            supportsFineTuning: true,
            trainingType: 'sft',
            training: {
                regional: 0.80,
                global: 0.60,
                developer: 0.40
            },
            inference: {
                regional: { input: 0.40, cachedInput: 0.20, output: 1.60 },
                global: { input: 0.40, cachedInput: 0.20, output: 1.60 },
                developer: { input: 0.40, cachedInput: 0.20, output: 1.60 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            ptu: {
                minPTUs: 25,
                hourly: 0.70,
                monthly: 420,
                yearly: 3780
            }
        },
        'gpt-4.1-nano': {
            name: 'GPT-4.1-nano',
            supportsFineTuning: true,
            trainingType: 'sft',
            training: {
                regional: 0.20,
                global: 0.15,
                developer: 0.10
            },
            inference: {
                regional: { input: 0.10, cachedInput: 0.05, output: 0.40 },
                global: { input: 0.10, cachedInput: 0.05, output: 0.40 },
                developer: { input: 0.10, cachedInput: 0.05, output: 0.40 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            ptu: {
                minPTUs: 25,
                hourly: 0.35,
                monthly: 210,
                yearly: 1890
            }
        },
        // GPT-4o Series
        'gpt-4o': {
            name: 'GPT-4o-2024-08-06',
            supportsFineTuning: true,
            trainingType: 'sft',
            training: {
                regional: 25.00,
                global: 18.75,
                developer: 12.50
            },
            inference: {
                regional: { input: 2.50, cachedInput: 1.25, output: 10.00 },
                global: { input: 2.50, cachedInput: 1.25, output: 10.00 },
                developer: { input: 2.50, cachedInput: 1.25, output: 10.00 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            ptu: {
                minPTUs: 50,
                hourly: 2.00,
                monthly: 1200,
                yearly: 10800
            }
        },
        'gpt-4o-mini': {
            name: 'GPT-4o-mini',
            supportsFineTuning: true,
            trainingType: 'sft',
            training: {
                regional: 3.00,
                global: 2.25,
                developer: 1.50
            },
            inference: {
                regional: { input: 0.15, cachedInput: 0.075, output: 0.60 },
                global: { input: 0.15, cachedInput: 0.075, output: 0.60 },
                developer: { input: 0.15, cachedInput: 0.075, output: 0.60 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            ptu: {
                minPTUs: 25,
                hourly: 0.30,
                monthly: 180,
                yearly: 1620
            }
        },
        // o4-mini for Reinforcement Fine-Tuning
        'o4-mini-rft': {
            name: 'o4-mini (Reinforcement Fine-Tuning)',
            supportsFineTuning: true,
            trainingType: 'rft', // reinforcement fine-tuning
            training: {
                regional: 100.00, // per hour
                global: 100.00,   // per hour
                developer: 50.00  // per hour (50% discount)
            },
            inference: {
                regional: { input: 1.10, cachedInput: 0.55, output: 4.40 },
                global: { input: 1.10, cachedInput: 0.55, output: 4.40 },
                developer: { input: 1.10, cachedInput: 0.55, output: 4.40 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            graders: {
                'gpt-4o': { input: 2.50, cachedInput: 1.25, output: 10.00 },
                'o3-mini': { input: 1.10, cachedInput: 0.55, output: 4.40 }
            },
            ptu: {
                minPTUs: 25,
                hourly: 0.30,
                monthly: 180,
                yearly: 1620
            }
        },
        // Legacy
        'gpt-35-turbo': {
            name: 'GPT-3.5-Turbo (16K)',
            supportsFineTuning: true,
            trainingType: 'sft',
            training: {
                regional: 8.00,
                global: 8.00,
                developer: 8.00
            },
            inference: {
                regional: { input: 0.50, output: 1.50 },
                global: { input: 0.50, output: 1.50 },
                developer: { input: 0.50, output: 1.50 }
            },
            hosting: {
                standard: 1.70,
                globalStandard: 1.70,
                developer: 0
            },
            ptu: null // Not available for PTU
        }
    },

    // RFT job cost cap
    rftCostCap: 5000,

    // Constants
    hoursPerDay: 24,
    daysPerMonth: 30,

    /**
     * Get pricing for a specific model
     * @param {string} modelId - The model identifier
     * @returns {Object} Model pricing data
     */
    getModel(modelId) {
        return this.models[modelId] || null;
    },

    /**
     * Get all available models
     * @returns {Array} Array of model IDs
     */
    getAllModels() {
        return Object.keys(this.models);
    },

    /**
     * Check if a model supports PTU
     * @param {string} modelId - The model identifier
     * @returns {boolean}
     */
    supportsPTU(modelId) {
        const model = this.getModel(modelId);
        return model && model.ptu !== null;
    }
};

// Freeze the pricing object to prevent accidental modifications
Object.freeze(PRICING);

// Export for use in calculator.js
window.PRICING = PRICING;
