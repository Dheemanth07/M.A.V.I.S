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

/**
 * Calculates the expected species-specific diurnal baseline temperature for the current hour of the day.
 * 
 * @param {string} species - Animal species (e.g. 'cattle', 'canine', 'feline').
 * @param {number} baseLearnedTemp - The 24-hour mean temperature learned by the Digital Twin (e.g. 38.5).
 * @param {Date|number} [timeOrHour=new Date().getHours()] - Current time or hour of day (0-23).
 * @param {Object} [context={}] - Optional environmental context (e.g., thi, motion).
 * @returns {{ expectedBaseline: number, diurnalOffset: number, chronotype: string }}
 */
export function getSpeciesCircadianBaseline(species = 'cattle', baseLearnedTemp = 38.5, timeOrHour = new Date().getHours(), context = {}) {
    const key = (species || 'default').toLowerCase().trim();
    const profile = SPECIES_CHRONO_PROFILES[key] || SPECIES_CHRONO_PROFILES.default;

    let hour = typeof timeOrHour === 'number' ? timeOrHour : (timeOrHour.getHours() + timeOrHour.getMinutes() / 60);

    // Harmonic Cosine Diurnal Wave:
    // When hour == peakHour -> cos(0) = +1 (+amplitude)
    // When hour == troughHour (12 hrs later) -> cos(PI) = -1 (-amplitude)
    const harmonicAngle = ((hour - profile.peakHour) * (Math.PI / 12));
    let diurnalOffset = Math.cos(harmonicAngle) * profile.amplitude;

    // Environmental Heat Load Buffer (THI >= 79 adds nominal physiological thermal retention)
    let envBuffer = 0;
    if (context.thi && context.thi >= 79) {
        envBuffer = 0.20;
    }

    // Physical Activity Exertion Buffer (Motion adds transient metabolic heat)
    let motionBuffer = 0;
    if (context.motion) {
        motionBuffer = 0.25;
    }

    const totalOffset = diurnalOffset + envBuffer + motionBuffer;
    const expectedBaseline = Math.round((baseLearnedTemp + totalOffset) * 100) / 100;

    return {
        expectedBaseline,
        diurnalOffset: Math.round(diurnalOffset * 100) / 100,
        chronotype: profile.chronotype
    };
}
