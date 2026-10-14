/**
 * @file Species Chronobiology & Circadian Diurnal Baseline Engine.
 * Sourced from peer-reviewed veterinary literature:
 * - Cattle/Bovine: Lefcourt et al. (1999) Journal of Dairy Science 82(6): 1132-1137
 * - Canines/Dogs: Refinetti & Piccione (2003) Chronobiology International 20(3): 551-561
 * - Felines/Cats: Piccione et al. (2004) Journal of Thermal Biology 29(4): 215-221
 * - Horses/Equine: Piccione et al. (2002) Biological Rhythm Research 33(1): 113-120
 */

export const SPECIES_CHRONO_PROFILES = {
    cattle:  { peakHour: 16.0, amplitude: 0.40, chronotype: 'Diurnal' },
    cow:     { peakHour: 16.0, amplitude: 0.40, chronotype: 'Diurnal' },
    bovine:  { peakHour: 16.0, amplitude: 0.40, chronotype: 'Diurnal' },
    dog:     { peakHour: 18.0, amplitude: 0.50, chronotype: 'Diurnal / Bimodal' },
    canine:  { peakHour: 18.0, amplitude: 0.50, chronotype: 'Diurnal / Bimodal' },
    cat:     { peakHour: 21.0, amplitude: 0.60, chronotype: 'Crepuscular / Nocturnal' },
    feline:  { peakHour: 21.0, amplitude: 0.60, chronotype: 'Crepuscular / Nocturnal' },
    sheep:   { peakHour: 15.5, amplitude: 0.35, chronotype: 'Diurnal' },
    goat:    { peakHour: 15.5, amplitude: 0.35, chronotype: 'Diurnal' },
    horse:   { peakHour: 16.0, amplitude: 0.30, chronotype: 'Diurnal' },
    equine:  { peakHour: 16.0, amplitude: 0.30, chronotype: 'Diurnal' },
    default: { peakHour: 16.0, amplitude: 0.35, chronotype: 'Diurnal' }
};

const PI_OVER_12 = Math.PI / 12;

export class CircadianService {
    #profiles;

    constructor(profiles = SPECIES_CHRONO_PROFILES) {
        this.#profiles = profiles;
    }

    /**
     * Calculates the expected species-specific diurnal baseline temperature.
     * 
     * @param {string} [species='cattle'] - Animal species
     * @param {number} [baseLearnedTemp=38.5] - 24-hour mean temperature
     * @param {Date|number} [timeOrHour=new Date().getHours()] - Hour or Date object
     * @param {Object} [context={}] - Environmental context (thi, motion)
     * @returns {{ expectedBaseline: number, diurnalOffset: number, chronotype: string }}
     */
    getSpeciesBaseline(species = 'cattle', baseLearnedTemp = 38.5, timeOrHour = new Date().getHours(), context = {}) {
        const key = (species || 'default').toLowerCase().trim();
        const profile = this.#profiles[key] || this.#profiles.default;

        const hour = typeof timeOrHour === 'number'
            ? timeOrHour
            : (timeOrHour.getHours() + timeOrHour.getMinutes() / 60);

        // Harmonic Cosine Diurnal Wave
        const harmonicAngle = (hour - profile.peakHour) * PI_OVER_12;
        const diurnalOffset = Math.cos(harmonicAngle) * profile.amplitude;

        // Environmental Heat Load Buffer (THI >= 79)
        const envBuffer = (context.thi && context.thi >= 79) ? 0.20 : 0;

        // Physical Activity Exertion Buffer
        const motionBuffer = context.motion ? 0.25 : 0;

        const totalOffset = diurnalOffset + envBuffer + motionBuffer;
        const expectedBaseline = Math.round((baseLearnedTemp + totalOffset) * 100) / 100;

        return {
            expectedBaseline,
            diurnalOffset: Math.round(diurnalOffset * 100) / 100,
            chronotype: profile.chronotype
        };
    }
}

export const circadianService = new CircadianService();
export const getSpeciesCircadianBaseline = (species, baseLearnedTemp, timeOrHour, context) =>
    circadianService.getSpeciesBaseline(species, baseLearnedTemp, timeOrHour, context);
export default CircadianService;
