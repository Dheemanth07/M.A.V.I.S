/**
 * @file Herd Interaction Graph Engine
 * Computes dynamic graph-based contagion risk across multi-herd agricultural and clinical environments:
 * R(i) = sum_j ( R(j) * W(i,j) )
 * 
 * Dynamic Edge Weight Matrix:
 * W(i,j) = W_species(i,j) * W_zone(i,j)
 * 
 * Physical & Clinical Factors:
 * 1. Multi-Herd / Enclosure Isolation (Single Closed Space per Place):
 *    - Same Enclosure / Barn / Herd (e.g. 'Main Herd' === 'Main Herd') -> W_zone = 0.90
 *    - Different Enclosure / Separate Place                           -> W_zone = 0.05
 *    - Dedicated Quarantine / Isolation Ward                          -> W_zone = 0.05
 * 
 * 2. Species Susceptibility Matrix:
 *    - Intraspecies (Cattle-to-Cattle, Dog-to-Dog)                    -> W_species = 1.00
 *    - Cross-Species Ruminant Zoonoses (Cow <-> Sheep/Goat)           -> W_species = 0.35
 *    - Non-transmissible Cross-Species (Canine <-> Bovine)            -> W_species = 0.05
 */

/**
 * Computes the multi-herd enclosure and zone isolation weight.
 * All animals in the same closed space implicitly share high contact transmission.
 * Animals in separate places or dedicated quarantine have near-zero transmission.
 * 
 * @param {Object} animal1
 * @param {Object} animal2
 * @returns {number} Weight [0.05, 0.90]
 */
export function calculateZoneWeight(animal1, animal2) {
    const zone1 = (animal1.zone || animal1.herd || animal1.pen || animal1.location?.zone || 'main herd').toLowerCase().trim();
    const zone2 = (animal2.zone || animal2.herd || animal2.pen || animal2.location?.zone || 'main herd').toLowerCase().trim();

    // Strict barrier isolation if either animal is in quarantine
    if (zone1.includes('quarantine') || zone1.includes('isolation') || 
        zone2.includes('quarantine') || zone2.includes('isolation')) {
        return 0.05;
    }

    // Both animals share the exact same enclosure / closed space / herd
    if (zone1 === zone2) {
        return 0.90;
    }

    // Completely separate places / enclosures
    return 0.05;
}

/**
 * Computes species-specific transmission susceptibility.
 * 
 * @param {string} sp1 - Species of first animal
 * @param {string} sp2 - Species of second animal
 * @returns {number} Weight [0.05, 1.00]
 */
export function calculateSpeciesWeight(sp1 = '', sp2 = '') {
    const s1 = sp1.toLowerCase().trim();
    const s2 = sp2.toLowerCase().trim();

    if (!s1 || !s2) return 0.50;
    if (s1 === s2) return 1.00; // Same species

    // Cross-species ruminant livestock sharing feeders (e.g. Foot-and-mouth, Brucellosis, Q-fever)
    const isRuminant1 = ['cow', 'bovine', 'cattle', 'sheep', 'goat'].some(k => s1.includes(k));
    const isRuminant2 = ['cow', 'bovine', 'cattle', 'sheep', 'goat'].some(k => s2.includes(k));
    if (isRuminant1 && isRuminant2) return 0.35;

    // Non-transmissible cross-species pairs (e.g. Canine <-> Bovine)
    return 0.05;
}

/**
 * Calculates dynamic herd interaction risk for an animal based on multi-herd graph topology.
 * 
 * @param {Object} currentAnimal - The animal profile being evaluated.
 * @param {Array} allAnimals - All animals in the facility/workspace.
 * @returns {{ herdRiskScore: number, warnings: string[] }} Contagion risk score and alerts.
 */
export function calculateHerdGraphRisk(currentAnimal, allAnimals = []) {
    let herdRiskScore = 0;
    const warningsSet = new Set();

    if (!currentAnimal || !Array.isArray(allAnimals) || allAnimals.length <= 1) {
        return { herdRiskScore: 0, warnings: [] };
    }

    const currentId = String(currentAnimal._id || currentAnimal.id);

    // Filter to other animals belonging to the same owner/facility
    const candidateNeighbors = allAnimals.filter(a => {
        const neighborId = String(a._id || a.id);
        if (neighborId === currentId) return false;
        if (currentAnimal.owner && a.owner && String(a.owner) !== String(currentAnimal.owner)) return false;
        return true;
    });

    for (const neighbor of candidateNeighbors) {
        let neighborRisk = 0;
        if (neighbor.healthStatus === 'critical') {
            neighborRisk = 80;
        } else if (neighbor.healthStatus === 'warning') {
            neighborRisk = 40;
        }

        if (neighborRisk > 0) {
            const W_species = calculateSpeciesWeight(currentAnimal.species, neighbor.species);
            if (W_species <= 0.0) continue;

            const W_zone = calculateZoneWeight(currentAnimal, neighbor);

            // Clean composite transmission weight: W_species * W_zone
            const W_ij = Math.round((W_species * W_zone) * 100) / 100;
            const contagionContribution = neighborRisk * W_ij;
            herdRiskScore += contagionContribution;

            const zone1 = currentAnimal.herd || currentAnimal.zone || 'Main Herd';
            const zone2 = neighbor.herd || neighbor.zone || 'Main Herd';

            // Formulate grounded clinical contagion warnings based on real physical cohabitation
            if (W_ij >= 0.30 && neighbor.healthStatus === 'critical') {
                const zoneContext = (zone1 === zone2) ? `sharing ${zone1}` : `in adjacent ${zone2}`;
                warningsSet.add(`CONTAGION RISK: Severe contact exposure from critical ${neighbor.species} (${neighbor.name}) ${zoneContext} (Transmission Index: ${(W_ij * 100).toFixed(0)}%).`);
            } else if (W_ij >= 0.15 && (neighbor.healthStatus === 'critical' || neighbor.healthStatus === 'warning')) {
                warningsSet.add(`EPIDEMIOLOGY ALERT: Elevated exposure from sick ${neighbor.species} (${neighbor.name}) in ${zone2}.`);
            }
        }
    }

    const finalHerdRisk = Math.min(100, Math.round(herdRiskScore));

    return {
        herdRiskScore: finalHerdRisk,
        warnings: Array.from(warningsSet)
    };
}
