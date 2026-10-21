/**
 * @file Enclosure & Pen Contagion Exposure Service
 * Evaluates cross-infection exposure risk based on co-located enclosure zones
 * and species transmission factors between animals in the same facility:
 * Exposure Risk = sum_j ( Neighbor Risk * W_species * W_zone )
 */

const RUMINANT_KEYWORDS = ['cow', 'bovine', 'cattle', 'sheep', 'goat'];

export class HerdGraphService {
    #ruminantKeywords;

    constructor(ruminantKeywords = RUMINANT_KEYWORDS) {
        this.#ruminantKeywords = ruminantKeywords;
    }

    #isRuminant(speciesStr) {
        return this.#ruminantKeywords.some(k => speciesStr.includes(k));
    }

    /**
     * Computes the multi-herd enclosure and zone isolation weight.
     * @param {Object} animal1
     * @param {Object} animal2
     * @returns {number} Weight [0.05, 0.90]
     */
    calculateZoneWeight(animal1, animal2) {
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
     * @param {string} sp1 - Species of first animal
     * @param {string} sp2 - Species of second animal
     * @returns {number} Weight [0.05, 1.00]
     */
    calculateSpeciesWeight(sp1 = '', sp2 = '') {
        const s1 = sp1.toLowerCase().trim();
        const s2 = sp2.toLowerCase().trim();

        if (!s1 || !s2) return 0.50;
        if (s1 === s2) return 1.00; // Same species

        if (this.#isRuminant(s1) && this.#isRuminant(s2)) return 0.35;

        return 0.05;
    }

    /**
     * Calculates dynamic herd interaction risk for an animal based on multi-herd graph topology.
     * @param {Object} currentAnimal - The animal profile being evaluated.
     * @param {Array} allAnimals - All animals in the facility/workspace.
     * @returns {{ herdRiskScore: number, warnings: string[] }} Contagion risk score and alerts.
     */
    calculateRisk(currentAnimal, allAnimals = []) {
        let herdRiskScore = 0;
        const warningsSet = new Set();

        if (!currentAnimal || !Array.isArray(allAnimals) || allAnimals.length <= 1) {
            return { herdRiskScore: 0, warnings: [] };
        }

        const currentId = String(currentAnimal._id || currentAnimal.id);
        const currentOwnerStr = currentAnimal.owner ? String(currentAnimal.owner) : null;

        for (const neighbor of allAnimals) {
            const neighborId = String(neighbor._id || neighbor.id);
            if (neighborId === currentId) continue;
            if (currentOwnerStr && neighbor.owner && String(neighbor.owner) !== currentOwnerStr) continue;

            let neighborRisk = 0;
            if (neighbor.healthStatus === 'critical') {
                neighborRisk = 80;
            } else if (neighbor.healthStatus === 'warning') {
                neighborRisk = 40;
            }

            if (neighborRisk > 0) {
                const W_species = this.calculateSpeciesWeight(currentAnimal.species, neighbor.species);
                if (W_species <= 0.0) continue;

                const W_zone = this.calculateZoneWeight(currentAnimal, neighbor);
                const W_ij = Math.round((W_species * W_zone) * 100) / 100;
                const contagionContribution = neighborRisk * W_ij;
                herdRiskScore += contagionContribution;

                const zone1 = currentAnimal.herd || currentAnimal.zone || 'Main Herd';
                const zone2 = neighbor.herd || neighbor.zone || 'Main Herd';

                if (W_ij >= 0.30 && neighbor.healthStatus === 'critical') {
                    const zoneContext = (zone1 === zone2) ? `sharing ${zone1}` : `in adjacent ${zone2}`;
                    warningsSet.add(`CONTAGION RISK: High exposure from sick ${neighbor.species} (${neighbor.name}) ${zoneContext} (${(W_ij * 100).toFixed(0)}% cross-infection likelihood). Quarantine or separation advised.`);
                } else if (W_ij >= 0.15 && (neighbor.healthStatus === 'critical' || neighbor.healthStatus === 'warning')) {
                    warningsSet.add(`EPIDEMIOLOGY ALERT: Elevated exposure risk from sick ${neighbor.species} (${neighbor.name}) in ${zone2}.`);
                }
            }
        }

        const finalHerdRisk = Math.min(100, Math.round(herdRiskScore));

        return {
            herdRiskScore: finalHerdRisk,
            warnings: Array.from(warningsSet)
        };
    }
}

export const herdGraphService = new HerdGraphService();
export const calculateZoneWeight = (a1, a2) => herdGraphService.calculateZoneWeight(a1, a2);
export const calculateSpeciesWeight = (s1, s2) => herdGraphService.calculateSpeciesWeight(s1, s2);
export const calculateHerdGraphRisk = (a, all) => herdGraphService.calculateRisk(a, all);
export default HerdGraphService;
