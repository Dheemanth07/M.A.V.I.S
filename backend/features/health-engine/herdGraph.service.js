/**
 * @file Herd Interaction Graph Engine (Section 6 & 7 Compliance)
 * Computes graph-based contagion risk: R(i) = sum_j (R(j) * W(i,j))
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
    const warnings = [];

    if (!currentAnimal || !Array.isArray(allAnimals) || allAnimals.length <= 1) {
        return { herdRiskScore: 0, warnings };
    }

    const neighbors = allAnimals.filter(a => 
        String(a._id) !== String(currentAnimal._id) && 
        a.species?.toLowerCase() === currentAnimal.species?.toLowerCase()
    );

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
                warnings.push(`CONTAGION RISK: High contact exposure from critical ${neighbor.species} (${neighbor.name}).`);
            }
        }
    }

    // Clamp herd risk score between 0 and 100
    const finalHerdRisk = Math.min(100, Math.round(herdRiskScore));

    return {
        herdRiskScore: finalHerdRisk,
        warnings
    };
}
