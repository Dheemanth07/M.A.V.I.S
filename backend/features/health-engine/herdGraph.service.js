/**
 * @file Herd Interaction Graph Engine (Section 6 & 7 Compliance)
 * Computes graph-based contagion risk: R(i) = sum_j (R(j) * W(i,j))
 * 
 * =========================================================================
 * FUTURE SCOPE / PHASE-2 DYNAMIC GRAPH INTELLIGENCE (COMMENTED FOR REFERENCE)
 * =========================================================================
 * In advanced geospatial deployments, W(i,j) can be computed dynamically:
 * W(i,j) = W_species * W_zone * W_distance
 * 
 * - Same Enclosure/Pen (zone1 === zone2) -> W_zone = 0.90
 * - Proximity Distance < 5m (Direct Contact) -> W_dist = 1.00
 * - Proximity Distance 5-15m (Barn Aerosol)  -> W_dist = 0.60
 * - Proximity Distance > 50m (Pasture)       -> W_dist = 0.05
 * =========================================================================
 */

/*
function calculateDistanceWeight(loc1, loc2) {
    if (!loc1 || !loc2 || loc1.lat === undefined || loc2.lat === undefined) return 0.5;
    const dLat = (loc1.lat - loc2.lat) * 111000;
    const dLng = (loc1.lng - loc2.lng) * 111000;
    const distanceMeters = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distanceMeters < 5) return 1.0;
    if (distanceMeters <= 15) return 0.6;
    if (distanceMeters <= 50) return 0.2;
    return 0.05;
}

function calculateZoneWeight(animal1, animal2) {
    const zone1 = animal1.zone || animal1.pen || animal1.location?.zone;
    const zone2 = animal2.zone || animal2.pen || animal2.location?.zone;
    if (!zone1 || !zone2) return 0.5;
    return zone1.toLowerCase() === zone2.toLowerCase() ? 0.9 : 0.1;
}
*/

/**
 * Calculates herd interaction risk for an animal based on neighboring risk scores.
 * 
 * @param {Object} currentAnimal - The animal profile being evaluated.
 * @param {Array} allAnimals - All animals in the herd/workspace.
 * @returns {{ herdRiskScore: number, warnings: string[] }} Contagion risk score and alerts.
 */
export function calculateHerdGraphRisk(currentAnimal, allAnimals = []) {
    let herdRiskScore = 0;
    const warningsSet = new Set();

    if (!currentAnimal || !Array.isArray(allAnimals) || allAnimals.length <= 1) {
        return { herdRiskScore: 0, warnings: [] };
    }

    const neighbors = allAnimals.filter(a => {
        if (String(a._id) === String(currentAnimal._id)) return false;
        if (currentAnimal.owner && a.owner && String(a.owner) !== String(currentAnimal.owner)) return false;
        return a.species?.toLowerCase() === currentAnimal.species?.toLowerCase();
    });

    for (const neighbor of neighbors) {
        let neighborRisk = 0;
        if (neighbor.healthStatus === 'critical') {
            neighborRisk = 80;
        } else if (neighbor.healthStatus === 'warning') {
            neighborRisk = 40;
        }

        if (neighborRisk > 0) {
            // Interaction weight W(i,j) based on species proximity
            const W_ij = 0.25; 
            const contagionContribution = neighborRisk * W_ij;
            herdRiskScore += contagionContribution;

            if (neighbor.healthStatus === 'critical') {
                warningsSet.add(`CONTAGION RISK: High contact exposure from critical ${neighbor.species} (${neighbor.name}).`);
            }
        }
    }

    // Clamp herd risk score between 0 and 100
    const finalHerdRisk = Math.min(100, Math.round(herdRiskScore));

    return {
        herdRiskScore: finalHerdRisk,
        warnings: Array.from(warningsSet)
    };
}


